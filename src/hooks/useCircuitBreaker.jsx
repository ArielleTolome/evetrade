import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  registry,
  getESICircuit,
  ESI_CIRCUITS,
  CircuitBreakerError,
} from '../utils/circuitBreaker';

/**
 * React hook for using circuit breakers with ESI API calls
 *
 * Provides automatic circuit breaker protection for API calls with
 * React-friendly state management and retry handling.
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   const {
 *     execute,
 *     isOpen,
 *     status,
 *     retryAfter,
 *   } = useCircuitBreaker('esi:market:orders');
 *
 *   const fetchData = async () => {
 *     try {
 *       const result = await execute(() => fetchMarketOrders(regionId));
 *       setData(result);
 *     } catch (error) {
 *       if (error.isCircuitBreakerError) {
 *         setError(`Service unavailable. Retry in ${retryAfter}s`);
 *       }
 *     }
 *   };
 * }
 * ```
 */
export function useCircuitBreaker(circuitName, options = {}) {
  const [state, setState] = useState('CLOSED');
  const [retryAfter, setRetryAfter] = useState(0);
  const [stats, setStats] = useState(null);

  // Get or create the circuit
  const circuit = useMemo(() => {
    return registry.getCircuit(circuitName, options);
  }, [circuitName, options]);

  // Update state when circuit changes
  useEffect(() => {
    const updateState = () => {
      const status = circuit.getStatus();
      setState(status.state);
      setStats(status.stats);

      if (status.nextRetryTime) {
        const remaining = Math.max(0, status.nextRetryTime - Date.now());
        setRetryAfter(Math.ceil(remaining / 1000));
      } else {
        setRetryAfter(0);
      }
    };

    // Initial update
    updateState();

    // Listen for state changes
    const listener = () => updateState();
    circuit.addListener(listener);

    // Periodic update for retry countdown
    const interval = setInterval(updateState, 1000);

    return () => {
      circuit.removeListener(listener);
      clearInterval(interval);
    };
  }, [circuit]);

  /**
   * Execute a function with circuit breaker protection
   */
  const execute = useCallback(async (fn) => {
    return circuit.execute(fn);
  }, [circuit]);

  /**
   * Manually reset the circuit
   */
  const reset = useCallback(() => {
    circuit.reset();
  }, [circuit]);

  return {
    // State
    state,
    isOpen: state === 'OPEN',
    isHalfOpen: state === 'HALF_OPEN',
    isClosed: state === 'CLOSED',
    retryAfter, // Seconds until retry allowed

    // Stats
    stats,
    status: circuit.getStatus(),

    // Actions
    execute,
    reset,

    // Circuit instance (for advanced usage)
    circuit,
  };
}

/**
 * Hook for monitoring all circuit breakers
 */
export function useCircuitBreakerMonitor() {
  const [statuses, setStatuses] = useState([]);
  const [hasOpenCircuits, setHasOpenCircuits] = useState(false);

  useEffect(() => {
    const updateStatuses = () => {
      setStatuses(registry.getAllStatus());
      setHasOpenCircuits(registry.hasOpenCircuits());
    };

    // Initial update
    updateStatuses();

    // Listen for global changes
    const listener = () => updateStatuses();
    registry.addGlobalListener(listener);

    // Periodic update
    const interval = setInterval(updateStatuses, 1000);

    return () => {
      registry.removeGlobalListener(listener);
      clearInterval(interval);
    };
  }, []);

  /**
   * Reset all circuits
   */
  const resetAll = useCallback(() => {
    registry.resetAll();
  }, []);

  /**
   * Get only open circuits
   */
  const openCircuits = useMemo(() => {
    return statuses.filter(s => s.state === 'OPEN');
  }, [statuses]);

  return {
    statuses,
    openCircuits,
    hasOpenCircuits,
    resetAll,
  };
}

/**
 * Higher-order hook for automatic circuit breaker wrapping of API calls
 */
export function useProtectedApiCall(circuitName, apiFunction, options = {}) {
  const { execute, isOpen, retryAfter, status } = useCircuitBreaker(circuitName, options);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCircuitError, setIsCircuitError] = useState(false);

  const call = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    setIsCircuitError(false);

    try {
      const result = await execute(() => apiFunction(...args));
      setData(result);
      return result;
    } catch (err) {
      if (err instanceof CircuitBreakerError || err.isCircuitBreakerError) {
        setIsCircuitError(true);
        setError({
          message: `Service temporarily unavailable. Retry in ${retryAfter}s.`,
          isCircuitBreaker: true,
          retryAfter,
        });
      } else {
        setError({
          message: err.message || 'Request failed',
          isCircuitBreaker: false,
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [execute, apiFunction, retryAfter]);

  return {
    call,
    data,
    loading,
    error,
    isOpen,
    isCircuitError,
    retryAfter,
    status,
  };
}

/**
 * Pre-configured hooks for common ESI endpoints
 */
export function useMarketOrdersCircuit(options = {}) {
  return useCircuitBreaker(ESI_CIRCUITS.MARKET_ORDERS, options);
}

export function useMarketHistoryCircuit(options = {}) {
  return useCircuitBreaker(ESI_CIRCUITS.MARKET_HISTORY, options);
}

export function useUniverseNamesCircuit(options = {}) {
  return useCircuitBreaker(ESI_CIRCUITS.UNIVERSE_NAMES, options);
}

export function useCharacterDataCircuit(options = {}) {
  return useCircuitBreaker(ESI_CIRCUITS.CHARACTER_DATA, options);
}

export function useContractsCircuit(options = {}) {
  return useCircuitBreaker(ESI_CIRCUITS.CONTRACTS, options);
}

// Export constants for external use
export { ESI_CIRCUITS };

export default useCircuitBreaker;
