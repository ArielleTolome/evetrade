import { CACHE_CONFIG } from '../utils/constants';

const { dbName, storeName, duration } = CACHE_CONFIG;

/**
 * Open IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get cached data from localStorage or IndexedDB
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null if not found/expired
 */
export async function getCached(key) {
  try {
    // Try localStorage first (faster, for smaller items)
    const localData = localStorage.getItem(key);
    const localTimestamp = localStorage.getItem(`${key}_timestamp`);

    if (localData && localTimestamp) {
      const timestamp = parseInt(localTimestamp, 10);
      if (Date.now() - timestamp < duration) {
        try {
          return JSON.parse(localData);
        } catch {
          // Invalid JSON, clear it
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        }
      }
    }

    // Fall back to IndexedDB (for larger items)
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    return new Promise((resolve) => {
      const request = store.get(key);

      request.onerror = () => {
        console.warn('IndexedDB read error:', request.error);
        resolve(null);
      };

      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < duration) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Set cached data in localStorage or IndexedDB
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export async function setCached(key, data) {
  const timestamp = Date.now();

  try {
    // Try localStorage first (for items < 2MB)
    const serialized = JSON.stringify(data);

    if (serialized.length < 2 * 1024 * 1024) {
      try {
        localStorage.setItem(key, serialized);
        localStorage.setItem(`${key}_timestamp`, timestamp.toString());
        return;
      } catch (e) {
        // localStorage full or quota exceeded, fall through to IndexedDB
        console.warn('localStorage full, using IndexedDB');
      }
    }

    // Use IndexedDB for larger items
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    await new Promise((resolve, reject) => {
      const request = store.put({ key, data, timestamp });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

/**
 * Clear specific cache key
 * @param {string} key - Cache key to clear
 */
export async function clearCached(key) {
  try {
    // Clear from localStorage
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);

    // Clear from IndexedDB
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
}

/**
 * Clear all cached data
 */
export async function clearAllCache() {
  try {
    // Clear localStorage items with our keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('List') || key.includes('Info') || key.includes('Durations'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear IndexedDB
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
  } catch (error) {
    console.warn('Cache clear all error:', error);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} Cache stats
 */
export async function getCacheStats() {
  const stats = {
    localStorageItems: 0,
    localStorageSize: 0,
    indexedDBItems: 0,
  };

  try {
    // Count localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        stats.localStorageItems++;
        stats.localStorageSize += (localStorage.getItem(key) || '').length;
      }
    }

    // Count IndexedDB items
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    await new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => {
        stats.indexedDBItems = request.result;
        resolve();
      };
      request.onerror = () => resolve();
    });
  } catch (error) {
    console.warn('Cache stats error:', error);
  }

  return stats;
}
