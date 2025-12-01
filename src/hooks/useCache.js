import { CACHE_CONFIG } from '../utils/constants';

const { dbName, storeName, duration } = CACHE_CONFIG;

/**
 * Check if IndexedDB is available and working
 * @returns {boolean}
 */
function isIndexedDBAvailable() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Check if localStorage is available and working
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Open IndexedDB database with proper error handling
 * @returns {Promise<IDBDatabase>}
 */
async function openDB() {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB is not available');
  }

  return new Promise((resolve, reject) => {
    let request;

    try {
      request = indexedDB.open(dbName, 1);
    } catch (error) {
      console.error('Failed to open IndexedDB:', error);
      reject(error);
      return;
    }

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('IndexedDB open timeout'));
    }, 5000);

    request.onerror = () => {
      clearTimeout(timeout);
      const error = request.error || new Error('Unknown IndexedDB error');
      console.error('IndexedDB open error:', error);
      reject(error);
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      try {
        const db = request.result;

        // Add error handler to database connection
        db.onerror = (event) => {
          console.error('IndexedDB database error:', event.target.error);
        };

        resolve(db);
      } catch (error) {
        console.error('Error handling IndexedDB success:', error);
        reject(error);
      }
    };

    request.onupgradeneeded = (event) => {
      try {
        const db = event.target.result;

        // Add error handler during upgrade
        event.target.transaction.onerror = (txEvent) => {
          console.error('IndexedDB upgrade transaction error:', txEvent.target.error);
        };

        event.target.transaction.onabort = () => {
          console.error('IndexedDB upgrade transaction aborted');
        };

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'key' });
        }
      } catch (error) {
        console.error('Error during IndexedDB upgrade:', error);
        reject(error);
      }
    };

    request.onblocked = () => {
      console.warn('IndexedDB open blocked by another connection');
    };
  });
}

/**
 * Safely close IndexedDB connection
 * @param {IDBDatabase} db - Database connection to close
 */
function closeDB(db) {
  try {
    if (db && typeof db.close === 'function') {
      db.close();
    }
  } catch (error) {
    console.warn('Error closing IndexedDB connection:', error);
  }
}

/**
 * Execute IndexedDB transaction with proper error handling
 * @param {string} mode - Transaction mode ('readonly' or 'readwrite')
 * @param {Function} callback - Callback to execute with store
 * @returns {Promise<any>}
 */
async function executeTransaction(mode, callback) {
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB is not available');
  }

  let db = null;

  try {
    db = await openDB();
    const tx = db.transaction(storeName, mode);

    // Add transaction error handlers
    tx.onerror = (event) => {
      console.error('Transaction error:', event.target.error);
    };

    tx.onabort = (event) => {
      console.error('Transaction aborted:', event.target.error);
    };

    const store = tx.objectStore(storeName);
    const result = await callback(store, tx);

    // Wait for transaction to complete
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });

    return result;
  } catch (error) {
    console.error('Transaction execution error:', error);
    throw error;
  } finally {
    closeDB(db);
  }
}

/**
 * Get cached data from localStorage or IndexedDB
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null if not found/expired
 */
export async function getCached(key) {
  try {
    // Try localStorage first (faster, for smaller items)
    if (isLocalStorageAvailable()) {
      const localData = localStorage.getItem(key);
      const localTimestamp = localStorage.getItem(`${key}_timestamp`);

      if (localData && localTimestamp) {
        const timestamp = parseInt(localTimestamp, 10);
        if (Date.now() - timestamp < duration) {
          try {
            return JSON.parse(localData);
          } catch (error) {
            console.warn('Invalid JSON in localStorage for key:', key, error);
            // Invalid JSON, clear it
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_timestamp`);
          }
        } else {
          // Expired, clean up
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        }
      }
    }

    // Fall back to IndexedDB (for larger items)
    if (!isIndexedDBAvailable()) {
      return null;
    }

    return await executeTransaction('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onerror = () => {
          console.warn('IndexedDB read error for key:', key, request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          try {
            const result = request.result;
            if (result && Date.now() - result.timestamp < duration) {
              resolve(result.data);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.warn('Error processing IndexedDB result:', error);
            reject(error);
          }
        };
      });
    });
  } catch (error) {
    console.warn('Cache read error for key:', key, error);
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

    if (serialized.length < 2 * 1024 * 1024 && isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, serialized);
        localStorage.setItem(`${key}_timestamp`, timestamp.toString());
        return;
      } catch (e) {
        // localStorage full or quota exceeded, fall through to IndexedDB
        console.warn('localStorage full, using IndexedDB:', e);
      }
    }

    // Use IndexedDB for larger items or if localStorage failed
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, cache not saved for key:', key);
      return;
    }

    await executeTransaction('readwrite', (store) => {
      return new Promise((resolve, reject) => {
        const request = store.put({ key, data, timestamp });

        request.onerror = () => {
          console.warn('IndexedDB write error for key:', key, request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    });
  } catch (error) {
    console.warn('Cache write error for key:', key, error);
  }
}

/**
 * Clear specific cache key
 * @param {string} key - Cache key to clear
 */
export async function clearCached(key) {
  try {
    // Clear from localStorage
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    }

    // Clear from IndexedDB
    if (isIndexedDBAvailable()) {
      await executeTransaction('readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.delete(key);

          request.onerror = () => {
            console.warn('IndexedDB delete error for key:', key, request.error);
            reject(request.error);
          };

          request.onsuccess = () => {
            resolve();
          };
        });
      });
    }
  } catch (error) {
    console.warn('Cache clear error for key:', key, error);
  }
}

/**
 * Clear all cached data
 */
export async function clearAllCache() {
  try {
    // Clear localStorage items with our keys
    if (isLocalStorageAvailable()) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('List') || key.includes('Info') || key.includes('Durations'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Error removing localStorage key:', key, error);
        }
      });
    }

    // Clear IndexedDB
    if (isIndexedDBAvailable()) {
      await executeTransaction('readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.clear();

          request.onerror = () => {
            console.warn('IndexedDB clear error:', request.error);
            reject(request.error);
          };

          request.onsuccess = () => {
            resolve();
          };
        });
      });
    }
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
    if (isLocalStorageAvailable()) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          stats.localStorageItems++;
          const value = localStorage.getItem(key);
          stats.localStorageSize += value ? value.length : 0;
        }
      }
    }

    // Count IndexedDB items
    if (isIndexedDBAvailable()) {
      await executeTransaction('readonly', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.count();

          request.onerror = () => {
            console.warn('IndexedDB count error:', request.error);
            reject(request.error);
          };

          request.onsuccess = () => {
            stats.indexedDBItems = request.result;
            resolve();
          };
        });
      });
    }
  } catch (error) {
    console.warn('Cache stats error:', error);
  }

  return stats;
}
