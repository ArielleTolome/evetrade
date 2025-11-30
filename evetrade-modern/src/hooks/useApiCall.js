import { useState, useCallback } from 'react';

/**
 * Generic API call hook
 * @param {Function} apiFunction - The API function to call
 * @returns {object} State and execute function
 */
export function useApiCall(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (params) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(params);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err.message || 'An error occurred';
        setError({ message: errorMessage, original: err });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for station trading
 */
export function useStationTrading() {
  const { fetchStationTrading } = require('../api/trading');
  return useApiCall(fetchStationTrading);
}

/**
 * Hook for station hauling
 */
export function useStationHauling() {
  const { fetchStationHauling } = require('../api/trading');
  return useApiCall(fetchStationHauling);
}

/**
 * Hook for region hauling
 */
export function useRegionHauling() {
  const { fetchRegionHauling } = require('../api/trading');
  return useApiCall(fetchRegionHauling);
}

/**
 * Hook for orders
 */
export function useOrders() {
  const { fetchOrders } = require('../api/trading');
  return useApiCall(fetchOrders);
}
