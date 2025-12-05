import { useState, useCallback, useRef, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { apiClient } from '../api/client';

/**
 * LP Optimizer Hook
 * Fetches and calculates best ISK/LP conversions from loyalty point stores
 *
 * @param {Object} options - Configuration options
 * @param {string} options.accessToken - ESI access token for authenticated calls (optional)
 * @returns {Object} Hook state and methods
 */
export function useLPOptimizer(options = {}) {
  const { accessToken } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortControllerRef = useRef(null);

  // Cleanup: abort any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Fetch LP conversions for a corporation
   * @param {Object} params - Request parameters
   * @param {number} params.corporationId - Corporation ID (required)
   * @param {number} params.characterId - Character ID (optional, for LP balance)
   * @param {number} params.regionId - Region ID for market prices (default: Jita)
   * @param {number} params.minIskPerLp - Minimum ISK/LP threshold
   * @param {string} params.category - Item category filter
   * @returns {Promise<Object>} LP conversion data
   */
  const fetchConversions = useCallback(
    async (params) => {
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
        const { corporationId, characterId, regionId, minIskPerLp, category } = params;

        if (!corporationId) {
          throw new Error('Corporation ID is required');
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
          corporationId: corporationId.toString(),
        });

        if (characterId) {
          queryParams.append('characterId', characterId.toString());
        }

        if (regionId) {
          queryParams.append('regionId', regionId.toString());
        }

        if (minIskPerLp !== undefined && minIskPerLp !== null) {
          queryParams.append('minIskPerLp', minIskPerLp.toString());
        }

        if (category) {
          queryParams.append('category', category);
        }

        // Make API request
        const headers = {};
        if (accessToken && characterId) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await apiClient.get(`/lp-optimizer?${queryParams.toString()}`, {
          signal: abortController.signal,
          headers,
        });

        const result = response.data;

        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setData(result);
          setLastUpdated(new Date());
        }

        return result;
      } catch (err) {
        // Don't set error state for intentional aborts
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          console.log('LP optimizer request cancelled');
          return null;
        }

        // Report API errors to Sentry
        Sentry.withScope((scope) => {
          scope.setTag('errorType', 'useLPOptimizer');
          scope.setExtra('params', params);
          Sentry.captureException(err);
        });

        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch LP conversions';
        if (!abortController.signal.aborted) {
          setError({ message: errorMessage, original: err });
        }
        throw err;
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [accessToken]
  );

  /**
   * Filter conversions by criteria
   * @param {Object} filters - Filter criteria
   * @param {number} filters.minIskPerLp - Minimum ISK/LP
   * @param {number} filters.maxIskPerLp - Maximum ISK/LP
   * @param {number} filters.minROI - Minimum ROI percentage
   * @param {number} filters.minProfit - Minimum net profit
   * @param {string} filters.itemName - Item name search (case-insensitive)
   * @returns {Array} Filtered conversions
   */
  const filterConversions = useCallback(
    (filters = {}) => {
      if (!data?.conversions) return [];

      const { minIskPerLp, maxIskPerLp, minROI, minProfit, itemName } = filters;

      return data.conversions.filter((conversion) => {
        const { isk_per_lp, roi, net_profit } = conversion.analysis;

        // Min ISK/LP filter
        if (minIskPerLp !== undefined && minIskPerLp !== null && isk_per_lp < minIskPerLp) {
          return false;
        }

        // Max ISK/LP filter
        if (maxIskPerLp !== undefined && maxIskPerLp !== null && isk_per_lp > maxIskPerLp) {
          return false;
        }

        // Min ROI filter
        if (minROI !== undefined && minROI !== null && roi < minROI) {
          return false;
        }

        // Min profit filter
        if (minProfit !== undefined && minProfit !== null && net_profit < minProfit) {
          return false;
        }

        // Item name search
        if (itemName && !conversion.item_name.toLowerCase().includes(itemName.toLowerCase())) {
          return false;
        }

        return true;
      });
    },
    [data]
  );

  /**
   * Get top N conversions by ISK/LP
   * @param {number} limit - Number of results to return
   * @returns {Array} Top conversions
   */
  const getTopConversions = useCallback(
    (limit = 10) => {
      if (!data?.conversions) return [];
      return data.conversions.slice(0, limit);
    },
    [data]
  );

  /**
   * Get conversions that can be afforded with current LP balance
   * @param {number} lpBalance - LP balance (optional, uses data.lp_balance if not provided)
   * @returns {Array} Affordable conversions
   */
  const getAffordableConversions = useCallback(
    (lpBalance = null) => {
      if (!data?.conversions) return [];

      const balance = lpBalance ?? data.lp_balance;
      if (!balance) return data.conversions; // If no balance info, return all

      return data.conversions.filter((conversion) => conversion.lp_cost <= balance);
    },
    [data]
  );

  /**
   * Calculate total profit potential from conversions
   * @param {Array} conversions - Conversions to calculate (optional, uses all if not provided)
   * @param {number} lpAvailable - Available LP (optional)
   * @returns {Object} Profit statistics
   */
  const calculateProfitPotential = useCallback(
    (conversions = null, lpAvailable = null) => {
      const items = conversions || data?.conversions || [];
      const lpBalance = lpAvailable ?? data?.lp_balance;

      if (items.length === 0) {
        return {
          totalItems: 0,
          totalProfit: 0,
          averageIskPerLp: 0,
          bestConversion: null,
          worstConversion: null,
          affordableItems: 0,
        };
      }

      const profits = items.map((c) => c.analysis.net_profit);
      const totalProfit = profits.reduce((sum, p) => sum + p, 0);
      const iskPerLps = items.map((c) => c.analysis.isk_per_lp);
      const avgIskPerLp = iskPerLps.reduce((sum, v) => sum + v, 0) / iskPerLps.length;

      const affordableItems = lpBalance
        ? items.filter((c) => c.lp_cost <= lpBalance).length
        : items.length;

      return {
        totalItems: items.length,
        totalProfit: Math.round(totalProfit),
        averageIskPerLp: Math.round(avgIskPerLp * 100) / 100,
        bestConversion: items[0] || null,
        worstConversion: items[items.length - 1] || null,
        affordableItems,
      };
    },
    [data]
  );

  /**
   * Get conversion details including market depth warning
   * @param {number} offerId - Offer ID
   * @returns {Object|null} Conversion with additional details
   */
  const getConversionDetails = useCallback(
    (offerId) => {
      if (!data?.conversions) return null;

      const conversion = data.conversions.find((c) => c.offer_id === offerId);
      if (!conversion) return null;

      // Add warnings based on the data
      const warnings = [];

      // Check if ROI is negative
      if (conversion.analysis.roi < 0) {
        warnings.push('Negative ROI - this conversion loses ISK');
      }

      // Check if ISK/LP is very low
      if (conversion.analysis.isk_per_lp < 500) {
        warnings.push('Low ISK/LP ratio - consider other options');
      }

      // Check if there are many required items (complex to acquire)
      if (conversion.required_items.length > 5) {
        warnings.push(`Requires ${conversion.required_items.length} different items to purchase`);
      }

      return {
        ...conversion,
        warnings,
      };
    },
    [data]
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLastUpdated(null);
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

  return {
    // State
    data,
    loading,
    error,
    lastUpdated,

    // Core methods
    fetchConversions,
    reset,
    cancel,

    // Filtering and analysis
    filterConversions,
    getTopConversions,
    getAffordableConversions,
    calculateProfitPotential,
    getConversionDetails,
  };
}

export default useLPOptimizer;
