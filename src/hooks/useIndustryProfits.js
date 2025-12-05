import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import * as Sentry from '@sentry/react';

/**
 * Hook for fetching and managing industry profits data
 * Calls the /api/industry endpoint to analyze character blueprints
 *
 * @param {object} options - Hook configuration
 * @param {number} options.cacheTimeout - Cache duration in milliseconds (default: 5 minutes)
 * @returns {object} State and methods for industry profits
 */
export function useIndustryProfits(options = {}) {
  const { cacheTimeout = 300000 } = options; // 5 minutes default

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  // Cleanup: abort any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Generate cache key from parameters
   */
  const getCacheKey = useCallback((params) => {
    const { characterId, regionId, minProfit, minROI, activity, meLevel } = params;
    return `${characterId}-${regionId || '10000002'}-${minProfit || 0}-${minROI || 0}-${activity || 'all'}-${meLevel || 'all'}`;
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((cacheEntry) => {
    if (!cacheEntry) return false;
    const age = Date.now() - cacheEntry.timestamp;
    return age < cacheTimeout;
  }, [cacheTimeout]);

  /**
   * Fetch industry profits from API
   * @param {object} params - Query parameters
   * @param {number} params.characterId - EVE character ID (required)
   * @param {string} params.accessToken - ESI access token (required)
   * @param {number} params.regionId - Market region ID (default: 10000002)
   * @param {number} params.minProfit - Minimum profit filter
   * @param {number} params.minROI - Minimum ROI percentage filter
   * @param {string} params.activity - Industry activity type filter
   * @param {number} params.meLevel - Material efficiency level filter (0-10)
   * @param {boolean} params.forceRefresh - Bypass cache and fetch fresh data
   * @returns {Promise} Industry profits data
   */
  const fetchIndustryProfits = useCallback(
    async (params) => {
      const {
        characterId,
        accessToken,
        regionId = 10000002,
        minProfit = 0,
        minROI = 0,
        activity,
        meLevel,
        forceRefresh = false,
      } = params;

      // Validate required parameters
      if (!characterId) {
        throw new Error('characterId is required');
      }

      if (!accessToken) {
        throw new Error('accessToken is required');
      }

      // Check cache first
      const cacheKey = getCacheKey({
        characterId,
        regionId,
        minProfit,
        minROI,
        activity,
        meLevel,
      });

      if (!forceRefresh) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && isCacheValid(cached)) {
          console.log('Using cached industry data');
          setData(cached.data);
          setLastUpdated(new Date(cached.timestamp));
          return cached.data;
        }
      }

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const queryParams = new URLSearchParams({
          character_id: characterId.toString(),
          region_id: regionId.toString(),
        });

        if (minProfit > 0) {
          queryParams.append('min_profit', minProfit.toString());
        }

        if (minROI > 0) {
          queryParams.append('min_roi', minROI.toString());
        }

        if (activity) {
          queryParams.append('activity', activity);
        }

        if (meLevel !== null && meLevel !== undefined) {
          queryParams.append('me_level', meLevel.toString());
        }

        // Make API request
        const response = await apiClient.get(`/industry?${queryParams.toString()}`, {
          signal: abortController.signal,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          const resultData = response.data;

          // Cache the result
          cacheRef.current.set(cacheKey, {
            data: resultData,
            timestamp: Date.now(),
          });

          setData(resultData);
          setLastUpdated(new Date());
          setLoading(false);

          return resultData;
        }

        return null;
      } catch (err) {
        // Don't set error state for intentional aborts
        if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          console.log('Industry request cancelled');
          return null;
        }

        // Report API errors to Sentry
        Sentry.withScope((scope) => {
          scope.setTag('errorType', 'useIndustryProfits');
          scope.setExtra('characterId', characterId);
          scope.setExtra('regionId', regionId);
          Sentry.captureException(err);
        });

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch industry data';

        if (!abortController.signal.aborted) {
          setError({ message: errorMessage, original: err });
          setLoading(false);
        }

        throw new Error(errorMessage);
      }
    },
    [getCacheKey, isCacheValid]
  );

  /**
   * Reset state and clear cache
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLastUpdated(null);
    cacheRef.current.clear();
  }, []);

  /**
   * Cancel any pending requests
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  /**
   * Clear cache for specific parameters or all cache
   */
  const clearCache = useCallback((params = null) => {
    if (params) {
      const cacheKey = getCacheKey(params);
      cacheRef.current.delete(cacheKey);
    } else {
      cacheRef.current.clear();
    }
  }, [getCacheKey]);

  /**
   * Filter blueprints by various criteria
   */
  const filterBlueprints = useCallback((blueprints, filters = {}) => {
    if (!blueprints || blueprints.length === 0) return [];

    let filtered = [...blueprints];

    // Filter by ME level
    if (filters.meLevel !== null && filters.meLevel !== undefined) {
      filtered = filtered.filter(bp => bp['Material Efficiency'] === filters.meLevel);
    }

    // Filter by minimum market price
    if (filters.minPrice) {
      filtered = filtered.filter(bp => bp['Market Price'] >= filters.minPrice);
    }

    // Filter by blueprint name (search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(bp =>
        bp['Blueprint Name'].toLowerCase().includes(searchLower)
      );
    }

    // Filter by runs (originals only or copies only)
    if (filters.runsType === 'original') {
      filtered = filtered.filter(bp => bp['Runs'] === -1);
    } else if (filters.runsType === 'copy') {
      filtered = filtered.filter(bp => bp['Runs'] !== -1);
    }

    return filtered;
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    fetchIndustryProfits,
    filterBlueprints,
    reset,
    cancel,
    clearCache,
  };
}

export default useIndustryProfits;
