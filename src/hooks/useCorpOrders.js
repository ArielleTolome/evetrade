import { useState, useCallback, useEffect } from 'react';
import { useEveAuth } from './useEveAuth';

/**
 * Hook for fetching and analyzing corporation market orders
 *
 * Features:
 * - Fetches corporation market orders from ESI
 * - Aggregates orders by item/location
 * - Detects undercut orders
 * - Tracks order health and expiration
 * - Calculates total ISK exposure
 * - Identifies orders needing attention
 *
 * @param {number} corporationId - Corporation ID to fetch orders for
 * @param {object} options - Configuration options
 * @param {string} options.groupBy - How to group orders: 'item', 'location', or 'both' (default: 'item')
 * @param {boolean} options.includeHistory - Include historical orders for profit tracking (default: false)
 * @param {boolean} options.autoRefresh - Auto-refresh orders every N seconds (default: false)
 * @param {number} options.refreshInterval - Refresh interval in seconds (default: 300 = 5 minutes)
 *
 * @returns {object} Hook state and methods
 */
export function useCorpOrders(corporationId, options = {}) {
  const {
    groupBy = 'item',
    includeHistory = false,
    autoRefresh = false,
    refreshInterval = 300, // 5 minutes default
  } = options;

  const { getAccessToken, isAuthenticated } = useEveAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetch corporation orders from the API
   */
  const fetchOrders = useCallback(async () => {
    if (!corporationId) {
      setError({ message: 'Corporation ID is required' });
      return;
    }

    if (!isAuthenticated) {
      setError({ message: 'Authentication required. Please log in with EVE SSO.' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get access token
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // Build query parameters
      const params = new URLSearchParams({
        corporationId: corporationId.toString(),
        groupBy,
        includeHistory: includeHistory.toString(),
      });

      // Call the serverless function
      const response = await fetch(`/api/corp-orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          throw new Error(
            errorData.message ||
            'Missing required scope: esi-markets.read_corporation_orders.v1. ' +
            'Please re-authenticate with the correct permissions.'
          );
        }

        if (response.status === 404) {
          throw new Error(
            errorData.message ||
            'Corporation not found or you do not have access to view its orders.'
          );
        }

        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (_err) {
      console.error('Failed to fetch corporation orders:', err);
      setError({
        message: err.message || 'Failed to fetch corporation orders',
        original: err,
      });
    } finally {
      setLoading(false);
    }
  }, [corporationId, groupBy, includeHistory, getAccessToken, isAuthenticated]);

  /**
   * Auto-refresh effect
   */
  useEffect(() => {
    if (autoRefresh && corporationId && isAuthenticated) {
      // Initial fetch
      fetchOrders();

      // Set up interval
      const intervalId = setInterval(() => {
        fetchOrders();
      }, refreshInterval * 1000);

      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, refreshInterval, corporationId, isAuthenticated, fetchOrders]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLastUpdated(null);
  }, []);

  /**
   * Get orders needing immediate attention
   */
  const getOrdersNeedingAttention = useCallback(() => {
    if (!data?.orders) return [];

    return data.orders
      .filter(item => item['Orders Needing Attention'] > 0)
      .map(item => ({
        typeId: item['Type ID'],
        itemName: item['Item'],
        locationId: item['Location ID'],
        locationName: item['Location'],
        count: item['Orders Needing Attention'],
        details: item['Attention Details'],
        orderDetails: item['Order Details'],
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  /**
   * Get undercut orders (specific subset of orders needing attention)
   */
  const getUndercutOrders = useCallback(() => {
    if (!data?.orders) return [];

    const undercutOrders = [];

    for (const item of data.orders) {
      const undercuts = item['Attention Details']?.filter(
        detail => detail.reason === 'undercut'
      ) || [];

      if (undercuts.length > 0) {
        undercutOrders.push({
          typeId: item['Type ID'],
          itemName: item['Item'],
          locationId: item['Location ID'],
          locationName: item['Location'],
          count: undercuts.length,
          orders: item['Order Details'].filter(order =>
            undercuts.some(u => u.orderId === order.orderId)
          ),
        });
      }
    }

    return undercutOrders.sort((a, b) => b.count - a.count);
  }, [data]);

  /**
   * Get expiring orders (expiring within 7 days)
   */
  const getExpiringOrders = useCallback(() => {
    if (!data?.orders) return [];

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const expiringOrders = [];

    for (const item of data.orders) {
      for (const order of item['Order Details'] || []) {
        const issued = new Date(order.issued).getTime();
        const duration = order.duration * 24 * 60 * 60 * 1000; // Convert days to ms
        const expires = issued + duration;
        const timeRemaining = expires - now;

        if (timeRemaining > 0 && timeRemaining < sevenDaysMs) {
          expiringOrders.push({
            orderId: order.orderId,
            typeId: item['Type ID'],
            itemName: item['Item'],
            locationId: item['Location ID'],
            locationName: item['Location'],
            price: order.price,
            volumeRemain: order.volumeRemain,
            isBuyOrder: order.isBuyOrder,
            daysRemaining: Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)),
            health: order.health,
          });
        }
      }
    }

    return expiringOrders.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [data]);

  /**
   * Get total ISK exposure across all orders
   */
  const getTotalExposure = useCallback(() => {
    return data?.summary?.totalExposure || 0;
  }, [data]);

  /**
   * Get breakdown by order type
   */
  const getOrderTypeBreakdown = useCallback(() => {
    if (!data?.summary) return null;

    return {
      total: data.summary.totalOrders,
      buy: data.summary.totalBuyOrders,
      sell: data.summary.totalSellOrders,
      buyPercentage: data.summary.totalOrders > 0
        ? (data.summary.totalBuyOrders / data.summary.totalOrders) * 100
        : 0,
      sellPercentage: data.summary.totalOrders > 0
        ? (data.summary.totalSellOrders / data.summary.totalOrders) * 100
        : 0,
    };
  }, [data]);

  /**
   * Get top items by exposure
   */
  const getTopItemsByExposure = useCallback((limit = 10) => {
    if (!data?.orders) return [];

    return data.orders
      .slice(0, limit)
      .map(item => ({
        typeId: item['Type ID'],
        itemName: item['Item'],
        exposure: item['Total Exposure (ISK)'],
        buyValue: item['Buy Value (ISK)'],
        sellValue: item['Sell Value (ISK)'],
        buyOrders: item['Buy Orders'],
        sellOrders: item['Sell Orders'],
      }));
  }, [data]);

  /**
   * Get health statistics
   */
  const getHealthStats = useCallback(() => {
    if (!data?.orders) return null;

    let totalOrders = 0;
    let healthyOrders = 0; // health >= 70
    let warningOrders = 0; // health 40-69
    let criticalOrders = 0; // health < 40

    for (const item of data.orders) {
      for (const order of item['Order Details'] || []) {
        totalOrders++;
        if (order.health >= 70) {
          healthyOrders++;
        } else if (order.health >= 40) {
          warningOrders++;
        } else {
          criticalOrders++;
        }
      }
    }

    return {
      total: totalOrders,
      healthy: healthyOrders,
      warning: warningOrders,
      critical: criticalOrders,
      healthyPercentage: totalOrders > 0 ? (healthyOrders / totalOrders) * 100 : 0,
      warningPercentage: totalOrders > 0 ? (warningOrders / totalOrders) * 100 : 0,
      criticalPercentage: totalOrders > 0 ? (criticalOrders / totalOrders) * 100 : 0,
    };
  }, [data]);

  /**
   * Filter orders by health threshold
   */
  const filterByHealth = useCallback((minHealth = 0, maxHealth = 100) => {
    if (!data?.orders) return [];

    const filtered = [];

    for (const item of data.orders) {
      const matchingOrders = item['Order Details']?.filter(
        order => order.health >= minHealth && order.health <= maxHealth
      ) || [];

      if (matchingOrders.length > 0) {
        filtered.push({
          ...item,
          'Order Details': matchingOrders,
          'Filtered Count': matchingOrders.length,
        });
      }
    }

    return filtered;
  }, [data]);

  return {
    // State
    data,
    loading,
    error,
    lastUpdated,

    // Summary data
    summary: data?.summary || null,
    orders: data?.orders || [],

    // Actions
    fetchOrders,
    refresh: fetchOrders,
    reset,

    // Analysis methods
    getOrdersNeedingAttention,
    getUndercutOrders,
    getExpiringOrders,
    getTotalExposure,
    getOrderTypeBreakdown,
    getTopItemsByExposure,
    getHealthStats,
    filterByHealth,

    // Utilities
    clearError: () => setError(null),
  };
}

export default useCorpOrders;
