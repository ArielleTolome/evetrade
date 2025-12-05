import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import * as Sentry from '@sentry/react';

/**
 * Hook for fetching and managing PI optimizer data
 * Calls the /api/pi-optimizer endpoint to analyze PI material opportunities
 *
 * @param {object} options - Hook configuration
 * @param {number} options.cacheTimeout - Cache duration in milliseconds (default: 5 minutes)
 * @returns {object} State and methods for PI optimization
 */
export function usePIOptimizer(options = {}) {
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
    const { regionId, tier, minProfit, minROI, minVolume, characterId } = params;
    return `${regionId || '10000002'}-${tier || 'all'}-${minProfit || 0}-${minROI || 0}-${minVolume || 0}-${characterId || 'none'}`;
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
   * Fetch PI optimization data from API
   * @param {object} params - Query parameters
   * @param {number} params.regionId - Market region ID (default: 10000002 - The Forge)
   * @param {string} params.tier - PI tier filter (all, P0, P1, P2, P3, P4)
   * @param {number} params.minProfit - Minimum profit per unit
   * @param {number} params.minROI - Minimum ROI percentage
   * @param {number} params.minVolume - Minimum daily volume
   * @param {number} params.characterId - Optional character ID for personalized analysis
   * @param {string} params.accessToken - Optional ESI access token (required for characterId)
   * @param {boolean} params.forceRefresh - Bypass cache and fetch fresh data
   * @returns {Promise} PI optimization data
   */
  const fetchPIOpportunities = useCallback(
    async (params) => {
      const {
        regionId = 10000002,
        tier = 'all',
        minProfit = 0,
        minROI = 0,
        minVolume = 0,
        characterId,
        accessToken,
        forceRefresh = false,
      } = params;

      // Validate tier parameter
      const validTiers = ['all', 'P0', 'P1', 'P2', 'P3', 'P4'];
      const selectedTier = validTiers.includes(tier) ? tier : 'all';

      // Check cache first
      const cacheKey = getCacheKey({
        regionId,
        tier: selectedTier,
        minProfit,
        minROI,
        minVolume,
        characterId,
      });

      if (!forceRefresh) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && isCacheValid(cached)) {
          console.log('Using cached PI data');
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
          regionId: regionId.toString(),
          tier: selectedTier,
        });

        if (minProfit > 0) {
          queryParams.append('minProfit', minProfit.toString());
        }

        if (minROI > 0) {
          queryParams.append('minROI', minROI.toString());
        }

        if (minVolume > 0) {
          queryParams.append('minVolume', minVolume.toString());
        }

        if (characterId) {
          queryParams.append('characterId', characterId.toString());
        }

        // Make API request
        const requestOptions = {
          signal: abortController.signal,
        };

        // Add authorization header if access token provided
        if (accessToken) {
          requestOptions.headers = {
            Authorization: `Bearer ${accessToken}`,
          };
        }

        const response = await apiClient.get(
          `/pi-optimizer?${queryParams.toString()}`,
          requestOptions
        );

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
      } catch (_err) {
        // Don't set error state for intentional aborts
        if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          console.log('PI optimizer request cancelled');
          return null;
        }

        // Report API errors to Sentry
        Sentry.withScope((scope) => {
          scope.setTag('errorType', 'usePIOptimizer');
          scope.setExtra('regionId', regionId);
          scope.setExtra('tier', selectedTier);
          Sentry.captureException(err);
        });

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to fetch PI optimization data';

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
   * Filter PI opportunities by various criteria
   */
  const filterOpportunities = useCallback((opportunities, filters = {}) => {
    if (!opportunities || opportunities.length === 0) return [];

    let filtered = [...opportunities];

    // Filter by tier
    if (filters.tier && filters.tier !== 'all') {
      filtered = filtered.filter(opp => opp['Tier'] === filters.tier);
    }

    // Filter by minimum profit
    if (filters.minProfit) {
      filtered = filtered.filter(opp => opp['Profit per Unit'] >= filters.minProfit);
    }

    // Filter by minimum ROI
    if (filters.minROI) {
      filtered = filtered.filter(opp => opp['ROI'] >= filters.minROI);
    }

    // Filter by liquidity
    if (filters.liquidity) {
      filtered = filtered.filter(opp => opp['Liquidity'] === filters.liquidity);
    }

    // Filter by item name (search)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(opp =>
        opp['Item'].toLowerCase().includes(searchLower)
      );
    }

    // Filter by minimum volume
    if (filters.minVolume) {
      filtered = filtered.filter(opp => opp['Daily Sell Volume'] >= filters.minVolume);
    }

    return filtered;
  }, []);

  /**
   * Sort opportunities by a specific field
   */
  const sortOpportunities = useCallback((opportunities, sortBy = 'ROI', ascending = false) => {
    if (!opportunities || opportunities.length === 0) return [];

    const sorted = [...opportunities];

    sorted.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;

      if (ascending) {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });

    return sorted;
  }, []);

  /**
   * Get opportunities grouped by tier
   */
  const getOpportunitiesByTier = useCallback((opportunities) => {
    if (!opportunities || opportunities.length === 0) {
      return { P0: [], P1: [], P2: [], P3: [], P4: [] };
    }

    const grouped = {
      P0: [],
      P1: [],
      P2: [],
      P3: [],
      P4: [],
    };

    for (const opp of opportunities) {
      const tier = opp['Tier'];
      if (grouped[tier]) {
        grouped[tier].push(opp);
      }
    }

    return grouped;
  }, []);

  /**
   * Calculate summary statistics
   */
  const calculateSummary = useCallback((opportunities) => {
    if (!opportunities || opportunities.length === 0) {
      return {
        totalOpportunities: 0,
        avgROI: 0,
        avgProfit: 0,
        highestROI: null,
        highestProfit: null,
        tierCounts: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 },
      };
    }

    const tierCounts = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
    let totalROI = 0;
    let totalProfit = 0;
    let highestROI = opportunities[0];
    let highestProfit = opportunities[0];

    for (const opp of opportunities) {
      tierCounts[opp['Tier']] = (tierCounts[opp['Tier']] || 0) + 1;
      totalROI += opp['ROI'] || 0;
      totalProfit += opp['Profit per Unit'] || 0;

      if (opp['ROI'] > (highestROI['ROI'] || 0)) {
        highestROI = opp;
      }

      if (opp['Profit per Unit'] > (highestProfit['Profit per Unit'] || 0)) {
        highestProfit = opp;
      }
    }

    return {
      totalOpportunities: opportunities.length,
      avgROI: opportunities.length > 0 ? totalROI / opportunities.length : 0,
      avgProfit: opportunities.length > 0 ? totalProfit / opportunities.length : 0,
      highestROI,
      highestProfit,
      tierCounts,
    };
  }, []);

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

  return {
    data,
    loading,
    error,
    lastUpdated,
    fetchPIOpportunities,
    filterOpportunities,
    sortOpportunities,
    getOpportunitiesByTier,
    calculateSummary,
    reset,
    cancel,
    clearCache,
  };
}

export default usePIOptimizer;
