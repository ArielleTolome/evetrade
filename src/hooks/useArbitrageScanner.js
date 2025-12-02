import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchWithRetry } from '../api/client';

/**
 * Custom hook for cross-region arbitrage scanning
 * Provides real-time scanning capability with filtering and sorting
 *
 * @returns {object} Scanner state and control functions
 */
export function useArbitrageScanner() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    sortBy: 'Total Profit',
    sortOrder: 'desc',
    minRiskScore: 0,
    maxInvestment: null,
  });
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Abort any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Scan for arbitrage opportunities
   * @param {object} params - Scan parameters
   * @param {string[]} params.regions - Array of region IDs to scan
   * @param {number} params.minProfit - Minimum profit per unit
   * @param {number} params.minROI - Minimum ROI percentage
   * @param {number} params.maxVolume - Maximum m³ per item
   * @param {number} params.minDepth - Minimum order depth
   * @param {number} params.maxBudget - Maximum budget for buying
   * @param {number} params.tax - Sales tax rate (decimal)
   */
  const scan = useCallback(async (params) => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const {
        regions = ['10000002', '10000043', '10000032', '10000030'], // Jita, Amarr, Dodixie, Rens
        minProfit = 1000,
        minROI = 5,
        maxVolume = 60000,
        minDepth = 3,
        maxBudget = 1000000000,
        tax = 0.08,
      } = params;

      // Build query parameters
      const queryParams = new URLSearchParams({
        regions: Array.isArray(regions) ? regions.join(',') : regions,
        minProfit: minProfit.toString(),
        minROI: minROI.toString(),
        maxVolume: maxVolume.toString(),
        minDepth: minDepth.toString(),
        maxBudget: maxBudget.toString(),
        tax: tax.toString(),
      });

      // Fetch arbitrage opportunities
      const result = await fetchWithRetry(
        `/arbitrage?${queryParams.toString()}`,
        { signal: abortController.signal }
      );

      // Only update state if request wasn't aborted and component is still mounted
      if (!abortController.signal.aborted && isMountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
        return result;
      }
    } catch (err) {
      // Don't set error state for intentional aborts
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        console.log('Arbitrage scan cancelled');
        return null;
      }

      const errorMessage = err.message || 'Failed to scan for arbitrage opportunities';
      if (!abortController.signal.aborted && isMountedRef.current) {
        setError({ message: errorMessage, original: err });
      }
      throw err;
    } finally {
      // Only update loading state if request wasn't aborted and component is still mounted
      if (!abortController.signal.aborted && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Apply filters and sorting to the data
   */
  const getFilteredData = useCallback(() => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = [...data];

    // Apply risk score filter
    if (filterOptions.minRiskScore > 0) {
      filtered = filtered.filter(item => item['Risk Score'] >= filterOptions.minRiskScore);
    }

    // Apply investment filter
    if (filterOptions.maxInvestment) {
      filtered = filtered.filter(item => item['Investment'] <= filterOptions.maxInvestment);
    }

    // Apply sorting
    const sortBy = filterOptions.sortBy;
    const sortOrder = filterOptions.sortOrder;

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      return 0;
    });

    return filtered;
  }, [data, filterOptions]);

  /**
   * Update filter options
   */
  const updateFilters = useCallback((newFilters) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFilterOptions({
      sortBy: 'Total Profit',
      sortOrder: 'desc',
      minRiskScore: 0,
      maxInvestment: null,
    });
  }, []);

  /**
   * Cancel the current scan
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /**
   * Reset scanner state
   */
  const reset = useCallback(() => {
    cancel();
    if (isMountedRef.current) {
      setData(null);
      setError(null);
      setLastUpdated(null);
      resetFilters();
    }
  }, [cancel, resetFilters]);

  /**
   * Get statistics about the current results
   */
  const getStats = useCallback(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        totalOpportunities: 0,
        totalProfit: 0,
        averageROI: 0,
        averageRiskScore: 0,
        totalInvestment: 0,
      };
    }

    const filtered = getFilteredData();

    return {
      totalOpportunities: filtered.length,
      totalProfit: filtered.reduce((sum, item) => sum + item['Total Profit'], 0),
      averageROI: filtered.reduce((sum, item) => sum + item['ROI'], 0) / filtered.length,
      averageRiskScore: filtered.reduce((sum, item) => sum + item['Risk Score'], 0) / filtered.length,
      totalInvestment: filtered.reduce((sum, item) => sum + item['Investment'], 0),
    };
  }, [data, getFilteredData]);

  /**
   * Get unique regions from results
   */
  const getRegions = useCallback(() => {
    if (!data || !Array.isArray(data)) return [];

    const regions = new Set();
    data.forEach(item => {
      regions.add(item['Buy Region']);
      regions.add(item['Sell Region']);
    });

    return Array.from(regions).sort();
  }, [data]);

  /**
   * Filter by specific item
   */
  const filterByItem = useCallback((itemName) => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter(item =>
      item['Item'].toLowerCase().includes(itemName.toLowerCase())
    );
  }, [data]);

  /**
   * Filter by region pair
   */
  const filterByRegionPair = useCallback((buyRegion, sellRegion) => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter(item => {
      if (buyRegion && item['Buy Region'] !== buyRegion) return false;
      if (sellRegion && item['Sell Region'] !== sellRegion) return false;
      return true;
    });
  }, [data]);

  return {
    // State
    data: getFilteredData(),
    rawData: data,
    loading,
    error,
    lastUpdated,
    filterOptions,

    // Actions
    scan,
    cancel,
    reset,
    updateFilters,
    resetFilters,

    // Utilities
    getStats,
    getRegions,
    filterByItem,
    filterByRegionPair,
  };
}
