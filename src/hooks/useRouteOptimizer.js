import { useState, useCallback } from 'react';
import { useApiCall } from './useApiCall';
import { getCached, setCached } from './useCache';

/**
 * Route Optimizer Hook
 * Provides route calculation, caching, and comparison functionality
 */
export function useRouteOptimizer() {
  const [cachedRoutes, setCachedRoutes] = useState({});
  const [comparison, setComparison] = useState(null);

  /**
   * Fetch route from API
   */
  const fetchRoute = useCallback(async (params, signal) => {
    const {
      origin,
      destination,
      preference = 'shortest',
      avoidSystems = [],
      cargoValue,
      calculateRisk = true,
    } = params;

    // Build cache key
    const cacheKey = `route_${origin}_${destination}_${preference}_${avoidSystems.join(',')}_${cargoValue || 0}`;

    // Check cache first
    const cached = await getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      origin: origin.toString(),
      destination: destination.toString(),
      preference: preference,
      calculateRisk: calculateRisk.toString(),
    });

    if (avoidSystems.length > 0) {
      queryParams.set('avoidSystems', avoidSystems.join(','));
    }

    if (cargoValue) {
      queryParams.set('cargoValue', cargoValue.toString());
    }

    // Fetch from API
    const response = await fetch(`/api/route-optimizer?${queryParams.toString()}`, {
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    await setCached(cacheKey, data);

    return data;
  }, [getCached, setCached]);

  const { data, loading, error, execute, reset } = useApiCall(fetchRoute);

  /**
   * Calculate route with specific parameters
   */
  const calculateRoute = useCallback(
    async (params) => {
      const result = await execute(params);

      // Store in local cache for comparison
      if (result) {
        const key = `${params.origin}_${params.destination}_${params.preference || 'shortest'}`;
        setCachedRoutes((prev) => ({
          ...prev,
          [key]: result,
        }));
      }

      return result;
    },
    [execute]
  );

  /**
   * Compare multiple route preferences
   */
  const compareRoutes = useCallback(
    async (origin, destination, cargoValue = null, avoidSystems = [], signal = null) => {
      const preferences = ['shortest', 'secure', 'insecure'];

      // Fetch all three route types in parallel
      const results = await Promise.allSettled(
        preferences.map((preference) =>
          fetchRoute({
            origin,
            destination,
            preference,
            cargoValue,
            avoidSystems,
          }, signal)
        )
      );

      // Process results
      const comparisonData = {
        origin: { system_id: origin, name: null },
        destination: { system_id: destination, name: null },
        routes: {},
        recommendation: null,
      };

      preferences.forEach((preference, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          comparisonData.routes[preference] = result.value;

          // Update origin/destination names from first successful result
          if (!comparisonData.origin.name && result.value.origin) {
            comparisonData.origin = result.value.origin;
          }
          if (!comparisonData.destination.name && result.value.destination) {
            comparisonData.destination = result.value.destination;
          }
        } else {
          comparisonData.routes[preference] = {
            error: result.reason?.message || 'Failed to fetch route',
          };
        }
      });

      // Determine recommendation
      const validRoutes = Object.entries(comparisonData.routes).filter(
        ([, route]) => !route.error
      );

      if (validRoutes.length > 0) {
        // Sort by risk score, then by jumps
        const sortedRoutes = validRoutes.sort(([, a], [, b]) => {
          const riskDiff =
            (a.statistics?.average_risk || 100) - (b.statistics?.average_risk || 100);
          if (Math.abs(riskDiff) > 5) return riskDiff;
          return (a.statistics?.total_jumps || 999) - (b.statistics?.total_jumps || 999);
        });

        comparisonData.recommendation = {
          preference: sortedRoutes[0][0],
          reason: generateRecommendationReason(sortedRoutes),
        };
      }

      setComparison(comparisonData);
      return comparisonData;
    },
    [fetchRoute]
  );

  /**
   * Calculate ISK per jump for a route
   */
  const calculateIskPerJump = useCallback((route, tradeProfit) => {
    if (!route || !route.statistics || !tradeProfit) return 0;

    const jumps = route.statistics.total_jumps;
    if (jumps === 0) return tradeProfit;

    return Math.round(tradeProfit / jumps);
  }, []);

  /**
   * Calculate profit after fuel costs
   */
  const calculateNetProfit = useCallback((route, tradeProfit, fuelCostPerJump = 0) => {
    if (!route || !route.statistics || !tradeProfit) return 0;

    const jumps = route.statistics.total_jumps;
    const fuelCost = jumps * fuelCostPerJump;

    return tradeProfit - fuelCost;
  }, []);

  /**
   * Get suggested alternative routes
   */
  const getSuggestedAlternatives = useCallback(
    (currentRoute) => {
      if (!currentRoute) return [];

      const suggestions = [];

      // If current route has high risk, suggest secure
      if (
        currentRoute.statistics?.risk_rating === 'high' ||
        currentRoute.statistics?.risk_rating === 'extreme'
      ) {
        suggestions.push({
          preference: 'secure',
          reason: 'Safer route through high-sec only',
        });
      }

      // If current route has low-sec/null-sec, suggest secure
      if (
        currentRoute.statistics?.low_sec_systems > 0 ||
        currentRoute.statistics?.null_sec_systems > 0
      ) {
        suggestions.push({
          preference: 'secure',
          reason: 'Avoids low-sec and null-sec systems',
        });
      }

      // If current route is secure but long, suggest shortest
      if (
        currentRoute.preference === 'secure' &&
        currentRoute.statistics?.total_jumps > 15
      ) {
        suggestions.push({
          preference: 'shortest',
          reason: 'Shorter route (may include low-sec)',
        });
      }

      return suggestions;
    },
    []
  );

  /**
   * Clear cached routes
   */
  const clearCache = useCallback(() => {
    setCachedRoutes({});
    setComparison(null);
    reset();
  }, [reset]);

  return {
    // API state
    route: data,
    loading,
    error,

    // Actions
    calculateRoute,
    compareRoutes,
    clearCache,

    // Utility functions
    calculateIskPerJump,
    calculateNetProfit,
    getSuggestedAlternatives,

    // Comparison data
    comparison,
    cachedRoutes,
  };
}

/**
 * Generate recommendation reason based on route comparison
 */
function generateRecommendationReason(sortedRoutes) {
  const [bestPref, bestRoute] = sortedRoutes[0];
  const stats = bestRoute.statistics;

  if (!stats) return 'Best overall route';

  const reasons = [];

  // Risk-based reasons
  if (stats.risk_rating === 'minimal' || stats.risk_rating === 'low') {
    reasons.push('lowest risk');
  }

  // Jump-based reasons
  if (sortedRoutes.length > 1) {
    const [, secondRoute] = sortedRoutes[1];
    const jumpDiff = (secondRoute.statistics?.total_jumps || 0) - stats.total_jumps;
    if (jumpDiff > 5) {
      reasons.push(`${jumpDiff} fewer jumps`);
    }
  }

  // Security-based reasons
  if (stats.low_sec_systems === 0 && stats.null_sec_systems === 0) {
    reasons.push('high-sec only');
  }

  if (reasons.length === 0) {
    return 'Best balance of safety and efficiency';
  }

  return reasons.join(', ');
}

/**
 * Hook for managing route history
 */
export function useRouteHistory(maxHistory = 10) {
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback(
    (route) => {
      if (!route) return;

      setHistory((prev) => {
        // Check if route already exists
        const exists = prev.some(
          (r) =>
            r.origin.system_id === route.origin.system_id &&
            r.destination.system_id === route.destination.system_id &&
            r.preference === route.preference
        );

        if (exists) return prev;

        // Add to beginning, limit to maxHistory
        return [route, ...prev].slice(0, maxHistory);
      });
    },
    [maxHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}

/**
 * Hook for calculating route trade efficiency
 */
export function useRouteTradeEfficiency() {
  /**
   * Calculate efficiency metrics for a trade route
   */
  const calculateEfficiency = useCallback((route, trade) => {
    if (!route || !trade) return null;

    const jumps = route.statistics?.total_jumps || 0;
    const profit = trade.profit || trade['Net Profit'] || 0;
    const volume = trade.volume || trade['Volume'] || 0;
    const timeMinutes = parseTimeToMinutes(route.statistics?.estimated_time);

    return {
      iskPerJump: jumps > 0 ? Math.round(profit / jumps) : profit,
      iskPerMinute: timeMinutes > 0 ? Math.round(profit / timeMinutes) : 0,
      iskPerM3: volume > 0 ? Math.round(profit / volume) : 0,
      jumps,
      estimatedTime: route.statistics?.estimated_time,
      riskRating: route.statistics?.risk_rating || 'unknown',
    };
  }, []);

  /**
   * Compare multiple trade routes
   */
  const compareTrades = useCallback(
    (routesWithTrades) => {
      const efficiencies = routesWithTrades.map(({ route, trade, name }) => ({
        name: name || `${trade.Item || 'Trade'} Route`,
        route,
        trade,
        efficiency: calculateEfficiency(route, trade),
      }));

      // Sort by ISK per minute (best efficiency)
      efficiencies.sort((a, b) => {
        if (!a.efficiency || !b.efficiency) return 0;
        return b.efficiency.iskPerMinute - a.efficiency.iskPerMinute;
      });

      return efficiencies;
    },
    [calculateEfficiency]
  );

  return {
    calculateEfficiency,
    compareTrades,
  };
}

/**
 * Parse time string to minutes
 */
function parseTimeToMinutes(timeString) {
  if (!timeString) return 0;

  const minutes = timeString.match(/(\d+)m/);
  const seconds = timeString.match(/(\d+)s/);

  let total = 0;
  if (minutes) total += parseInt(minutes[1], 10);
  if (seconds) total += parseInt(seconds[1], 10) / 60;

  return total;
}
