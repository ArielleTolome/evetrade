import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCached, setCached, getCacheStats } from './useCache';

const OFFLINE_STORAGE_KEY = 'evetrade_offline_settings';

/**
 * Offline Mode Hook
 * Provides offline capability detection, aggressive caching, and fallback data management
 */
export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState(() => {
    try {
      return parseInt(localStorage.getItem('evetrade_last_online'), 10) || Date.now();
    } catch {
      return Date.now();
    }
  });
  const [cacheStats, setCacheStats] = useState({
    localStorageItems: 0,
    localStorageSize: 0,
    indexedDBItems: 0,
  });

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        enabled: true,
        aggressiveCaching: false,
        cacheMarketData: true,
        cacheStaticData: true,
        showOfflineWarning: true,
        maxCacheAge: 30 * 60 * 1000, // 30 minutes default
      };
    } catch {
      return {
        enabled: true,
        aggressiveCaching: false,
        cacheMarketData: true,
        cacheStaticData: true,
        showOfflineWarning: true,
        maxCacheAge: 30 * 60 * 1000,
      };
    }
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save offline settings:', e);
    }
  }, [settings]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      const now = Date.now();
      setLastOnlineTime(now);
      try {
        localStorage.setItem('evetrade_last_online', now.toString());
      } catch {
        // Ignore storage errors
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update last online time periodically when online
    let interval;
    if (navigator.onLine) {
      interval = setInterval(() => {
        const now = Date.now();
        setLastOnlineTime(now);
        try {
          localStorage.setItem('evetrade_last_online', now.toString());
        } catch {
          // Ignore storage errors
        }
      }, 60000); // Every minute
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (interval) clearInterval(interval);
    };
  }, []);

  // Load cache stats periodically
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getCacheStats();
        setCacheStats(stats);
      } catch (e) {
        console.warn('Failed to load cache stats:', e);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get cached data with offline fallback
  const getOfflineData = useCallback(async (key, fetchFn, options = {}) => {
    const { forceRefresh = false, maxAge = settings.maxCacheAge } = options;

    // If we're online and not forcing cache
    if (isOnline && !forceRefresh) {
      try {
        // Try to fetch fresh data
        const freshData = await fetchFn();

        // Cache the fresh data
        if (settings.enabled) {
          await setCached(key, {
            data: freshData,
            fetchedAt: Date.now(),
          });
        }

        return { data: freshData, fromCache: false, stale: false };
      } catch (error) {
        console.warn('Fetch failed, trying cache:', error);
        // Fall through to cache
      }
    }

    // Try to get from cache
    try {
      const cached = await getCached(key);
      if (cached && cached.data) {
        const age = Date.now() - cached.fetchedAt;
        const stale = age > maxAge;

        return {
          data: cached.data,
          fromCache: true,
          stale,
          age,
          fetchedAt: cached.fetchedAt,
        };
      }
    } catch (e) {
      console.warn('Cache read failed:', e);
    }

    // If online, try one more time to fetch
    if (isOnline) {
      try {
        const freshData = await fetchFn();
        if (settings.enabled) {
          await setCached(key, {
            data: freshData,
            fetchedAt: Date.now(),
          });
        }
        return { data: freshData, fromCache: false, stale: false };
      } catch (error) {
        throw error;
      }
    }

    // No data available
    throw new Error('No cached data available and offline');
  }, [isOnline, settings.enabled, settings.maxCacheAge]);

  // Pre-cache data for offline use
  const precacheData = useCallback(async (key, data) => {
    if (!settings.enabled) return false;

    try {
      await setCached(key, {
        data,
        fetchedAt: Date.now(),
      });
      return true;
    } catch (e) {
      console.warn('Failed to precache data:', e);
      return false;
    }
  }, [settings.enabled]);

  // Calculate offline duration
  const offlineDuration = useMemo(() => {
    if (isOnline) return 0;
    return Date.now() - lastOnlineTime;
  }, [isOnline, lastOnlineTime]);

  // Format offline duration for display
  const offlineDurationText = useMemo(() => {
    if (isOnline) return null;

    const minutes = Math.floor(offlineDuration / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }, [isOnline, offlineDuration]);

  // Cache health indicator (0-100)
  const cacheHealth = useMemo(() => {
    const itemScore = Math.min(50, cacheStats.indexedDBItems + cacheStats.localStorageItems);
    const sizeScore = Math.min(50, cacheStats.localStorageSize / 10000);
    return Math.round(itemScore + sizeScore);
  }, [cacheStats]);

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineTime,
    offlineDuration,
    offlineDurationText,
    cacheStats,
    cacheHealth,
    settings,
    updateSettings,
    getOfflineData,
    precacheData,
  };
}

export default useOfflineMode;
