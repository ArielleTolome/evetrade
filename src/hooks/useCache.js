import { CACHE_CONFIG } from '../utils/constants';

const { dbName, storeName, duration } = CACHE_CONFIG;

// Cache key prefix for consistent identification
const CACHE_KEY_PREFIX = 'evetrade_cache_';
const CACHE_REGISTRY_KEY = 'evetrade_cache_registry';

/**
 * Get the full cache key with prefix
 * @param {string} key - Original cache key
 * @returns {string} Prefixed cache key
 */
function getCacheKey(key) {
  return `${CACHE_KEY_PREFIX}${key}`;
}

/**
 * Get the timestamp key for a cache entry
 * @param {string} key - Original cache key
 * @returns {string} Timestamp key
 */
function getTimestampKey(key) {
  return `${CACHE_KEY_PREFIX}${key}_timestamp`;
}

/**
 * Get the cache registry (list of all cached keys)
 * @returns {Set<string>} Set of cached keys
 */
function getCacheRegistry() {
  try {
    const registry = localStorage.getItem(CACHE_REGISTRY_KEY);
    return registry ? new Set(JSON.parse(registry)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Update the cache registry
 * @param {Set<string>} registry - Updated registry
 */
function updateCacheRegistry(registry) {
  try {
    localStorage.setItem(CACHE_REGISTRY_KEY, JSON.stringify([...registry]));
  } catch (error) {
    console.warn('Failed to update cache registry:', error);
  }
}

/**
 * Add a key to the cache registry
 * @param {string} key - Cache key to register
 */
function registerCacheKey(key) {
  const registry = getCacheRegistry();
  registry.add(key);
  updateCacheRegistry(registry);
}

/**
 * Remove a key from the cache registry
 * @param {string} key - Cache key to unregister
 */
function unregisterCacheKey(key) {
  const registry = getCacheRegistry();
  registry.delete(key);
  updateCacheRegistry(registry);
}

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
  const cacheKey = getCacheKey(key);
  const timestampKey = getTimestampKey(key);

  try {
    // Try localStorage first (faster, for smaller items)
    const localData = localStorage.getItem(cacheKey);
    const localTimestamp = localStorage.getItem(timestampKey);

    if (localData && localTimestamp) {
      const timestamp = parseInt(localTimestamp, 10);
      if (Date.now() - timestamp < duration) {
        try {
          return JSON.parse(localData);
        } catch {
          // Invalid JSON, clear it
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(timestampKey);
          unregisterCacheKey(key);
        }
      } else {
        // Expired, clean up
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(timestampKey);
        unregisterCacheKey(key);
      }
    }

    // Fall back to IndexedDB (for larger items)
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    return new Promise((resolve) => {
      const request = store.get(cacheKey);

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
  const cacheKey = getCacheKey(key);
  const timestampKey = getTimestampKey(key);
  const timestamp = Date.now();

  try {
    // Try localStorage first (for items < 2MB)
    const serialized = JSON.stringify(data);

    if (serialized.length < 2 * 1024 * 1024) {
      try {
        localStorage.setItem(cacheKey, serialized);
        localStorage.setItem(timestampKey, timestamp.toString());
        registerCacheKey(key);
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
      const request = store.put({ key: cacheKey, data, timestamp });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    registerCacheKey(key);
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

/**
 * Clear specific cache key
 * @param {string} key - Cache key to clear
 */
export async function clearCached(key) {
  const cacheKey = getCacheKey(key);
  const timestampKey = getTimestampKey(key);

  try {
    // Clear from localStorage
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);

    // Clear from IndexedDB
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(cacheKey);

    // Remove from registry
    unregisterCacheKey(key);
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
}

/**
 * Clear all cached data
 */
export async function clearAllCache() {
  try {
    // Get all registered cache keys
    const registry = getCacheRegistry();

    // Clear each registered key from localStorage
    registry.forEach((key) => {
      const cacheKey = getCacheKey(key);
      const timestampKey = getTimestampKey(key);
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
    });

    // Also clear any orphaned keys with our prefix (fallback cleanup)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX) && key !== CACHE_REGISTRY_KEY) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear the registry itself
    localStorage.removeItem(CACHE_REGISTRY_KEY);

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
    // Count localStorage items with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
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
