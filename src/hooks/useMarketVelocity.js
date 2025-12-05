import { useState, useCallback, useMemo, useEffect } from 'react';
import { getMarketHistory, getMarketOrders, analyzeMarketOrders } from '../api/esi';
import * as Sentry from '@sentry/react';

/**
 * Custom hook for analyzing market velocity to identify high-turnover opportunities
 *
 * @description
 * Analyzes market history and current orders to calculate:
 * - Average daily volume (7-day and 30-day)
 * - Volume trend (increasing, decreasing, stable)
 * - Days to sell estimate (current supply vs daily turnover)
 * - Velocity score (daily volume / total available supply)
 * - Competition level (number of competing orders)
 * - Current market spread
 *
 * This helps traders identify "quick flip" opportunities where items
 * sell rapidly, reducing the time ISK is tied up in inventory.
 *
 * @param {number} regionId - Region ID to analyze
 * @param {Object} options - Configuration options
 * @param {Array<number>} options.typeIds - Array of item type IDs to analyze
 * @param {number} options.minVolume - Minimum daily volume threshold
 * @param {number} options.minVelocityScore - Minimum velocity score (0-100)
 * @param {number} options.minSpread - Minimum profit spread percentage
 * @param {string} options.competitionFilter - 'all', 'low', 'medium', 'high', 'extreme'
 *
 * @returns {Object} Market velocity analysis data
 * @property {Array} velocities - Array of velocity data for each item
 * @property {boolean} loading - Loading state
 * @property {Object} error - Error state with message
 * @property {Function} refresh - Function to refresh the data
 * @property {Date} lastUpdated - Timestamp of last data fetch
 *
 * @example
 * const { velocities, loading, error, refresh } = useMarketVelocity(10000002, {
 *   typeIds: [34, 35, 36],
 *   minVolume: 1000,
 *   minVelocityScore: 50,
 *   minSpread: 5,
 *   competitionFilter: 'low'
 * });
 */
export function useMarketVelocity(regionId, options = {}) {
  const {
    typeIds = [],
    minVolume = 0,
    minVelocityScore = 0,
    minSpread = 0,
    competitionFilter = 'all',
  } = options;

  const [velocityData, setVelocityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Calculate average daily volume from market history
   * @param {Array} history - Market history data
   * @param {number} days - Number of days to average (7, 14, or 30)
   * @returns {number} Average daily volume
   */
  const calculateAverageDailyVolume = useCallback((history, days = 7) => {
    if (!history || history.length === 0) return 0;

    const recentHistory = history.slice(-days);
    const totalVolume = recentHistory.reduce((sum, day) => sum + (day.volume || 0), 0);

    return totalVolume / recentHistory.length;
  }, []);

  /**
   * Determine volume trend by comparing recent vs earlier periods
   * @param {Array} history - Market history data
   * @returns {Object} { trend: string, changePercent: number }
   */
  const analyzeVolumeTrend = useCallback((history) => {
    if (!history || history.length < 14) {
      return { trend: 'stable', changePercent: 0 };
    }

    // Compare last 7 days to previous 7 days
    const recent7d = history.slice(-7);
    const previous7d = history.slice(-14, -7);

    if (previous7d.length === 0) {
      return { trend: 'stable', changePercent: 0 };
    }

    const recentAvg = recent7d.reduce((sum, day) => sum + day.volume, 0) / recent7d.length;
    const previousAvg = previous7d.reduce((sum, day) => sum + day.volume, 0) / previous7d.length;

    const changePercent = previousAvg > 0
      ? ((recentAvg - previousAvg) / previousAvg) * 100
      : 0;

    let trend = 'stable';
    if (changePercent > 20) trend = 'increasing';
    else if (changePercent < -20) trend = 'decreasing';

    return {
      trend,
      changePercent: Math.round(changePercent * 10) / 10,
    };
  }, []);

  /**
   * Calculate days to sell based on current supply and daily turnover
   * @param {number} totalSupply - Total available sell order volume
   * @param {number} dailyVolume - Average daily trading volume
   * @returns {number} Estimated days to sell (capped at 999)
   */
  const calculateDaysToSell = useCallback((totalSupply, dailyVolume) => {
    if (dailyVolume === 0 || totalSupply === 0) return 999;

    const days = totalSupply / dailyVolume;
    return Math.min(Math.round(days * 10) / 10, 999);
  }, []);

  /**
   * Calculate velocity score (0-100)
   * Higher score = faster turnover = better quick-flip opportunity
   * @param {number} dailyVolume - Average daily volume
   * @param {number} totalOrders - Total number of orders
   * @param {number} daysToSell - Estimated days to sell
   * @returns {number} Velocity score (0-100)
   */
  const calculateVelocityScore = useCallback((dailyVolume, totalOrders, daysToSell) => {
    if (dailyVolume === 0 || totalOrders === 0) return 0;

    // Base score: volume per order (normalized)
    const volumePerOrder = dailyVolume / totalOrders;
    const volumeScore = Math.min(volumePerOrder / 100, 1) * 40; // 0-40 points

    // Turnover score: inverse of days to sell (normalized)
    const turnoverScore = Math.max(0, (1 - daysToSell / 30)) * 40; // 0-40 points

    // Volume consistency bonus: reward higher absolute volume
    const volumeBonus = Math.min(dailyVolume / 10000, 1) * 20; // 0-20 points

    const totalScore = volumeScore + turnoverScore + volumeBonus;
    return Math.round(Math.min(totalScore, 100));
  }, []);

  /**
   * Map competition level to filter value
   * @param {string} level - Competition level string
   * @returns {boolean} Whether it matches filter
   */
  const matchesCompetitionFilter = useCallback((level) => {
    if (competitionFilter === 'all') return true;
    return level === competitionFilter;
  }, [competitionFilter]);

  /**
   * Fetch and analyze market velocity for a single item
   * @param {number} typeId - Item type ID
   * @returns {Promise<Object>} Velocity analysis for the item
   */
  const analyzeItemVelocity = useCallback(async (typeId) => {
    try {
      // Fetch market history and current orders in parallel
      const [history, orders] = await Promise.all([
        getMarketHistory(regionId, typeId),
        getMarketOrders(regionId, typeId, 'all'),
      ]);

      // Calculate volume metrics
      const dailyVolume7d = calculateAverageDailyVolume(history, 7);
      const dailyVolume30d = calculateAverageDailyVolume(history, 30);
      const volumeTrend = analyzeVolumeTrend(history);

      // Analyze current market orders
      const orderAnalysis = analyzeMarketOrders(orders);
      const {
        sellOrders,
        totalSellVolume,
        spread,
        competitionLevel,
        bestBuyPrice,
        bestSellPrice,
      } = orderAnalysis;

      // Calculate velocity metrics
      const daysToSell = calculateDaysToSell(totalSellVolume, dailyVolume7d);
      const velocityScore = calculateVelocityScore(
        dailyVolume7d,
        sellOrders,
        daysToSell
      );

      return {
        typeId,
        dailyVolume7d: Math.round(dailyVolume7d),
        dailyVolume30d: Math.round(dailyVolume30d),
        volumeTrend: volumeTrend.trend,
        volumeTrendPercent: volumeTrend.changePercent,
        currentSpread: Math.round(spread * 100) / 100,
        daysToSell,
        velocityScore,
        competitionLevel,
        sellOrders,
        totalSellVolume,
        bestBuyPrice: Math.round(bestBuyPrice * 100) / 100,
        bestSellPrice: Math.round(bestSellPrice * 100) / 100,
        lastUpdated: new Date(),
      };
    } catch (_err) {
      console.error(`Failed to analyze velocity for type ${typeId}:`, err);

      Sentry.withScope((scope) => {
        scope.setTag('errorType', 'useMarketVelocity');
        scope.setExtra('typeId', typeId);
        scope.setExtra('regionId', regionId);
        Sentry.captureException(err);
      });

      return {
        typeId,
        error: err.message || 'Failed to fetch data',
      };
    }
  }, [
    regionId,
    calculateAverageDailyVolume,
    analyzeVolumeTrend,
    calculateDaysToSell,
    calculateVelocityScore,
  ]);

  /**
   * Fetch and analyze velocity for all items
   */
  const fetchVelocityData = useCallback(async () => {
    if (!regionId || !typeIds || typeIds.length === 0) {
      setVelocityData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Analyze all items in parallel (with rate limiting consideration)
      // ESI allows ~150 requests/second, so batching is not strictly necessary
      // for reasonable item counts (< 50 items)
      const results = await Promise.all(
        typeIds.map(typeId => analyzeItemVelocity(typeId))
      );

      // Filter out errors and apply user filters
      const validResults = results.filter(result => !result.error);

      setVelocityData(validResults);
      setLastUpdated(new Date());
    } catch (_err) {
      console.error('Failed to fetch velocity data:', err);

      Sentry.withScope((scope) => {
        scope.setTag('errorType', 'useMarketVelocity');
        scope.setExtra('regionId', regionId);
        scope.setExtra('typeIds', typeIds);
        Sentry.captureException(err);
      });

      setError({
        message: err.message || 'Failed to fetch market velocity data',
        original: err,
      });
    } finally {
      setLoading(false);
    }
  }, [regionId, typeIds, analyzeItemVelocity]);

  /**
   * Filter and sort velocity data based on user preferences
   */
  const filteredVelocities = useMemo(() => {
    if (!velocityData || velocityData.length === 0) return [];

    return velocityData
      .filter(item => {
        // Apply filters
        if (item.dailyVolume7d < minVolume) return false;
        if (item.velocityScore < minVelocityScore) return false;
        if (item.currentSpread < minSpread) return false;
        if (!matchesCompetitionFilter(item.competitionLevel)) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort by velocity score (highest first)
        return b.velocityScore - a.velocityScore;
      });
  }, [
    velocityData,
    minVolume,
    minVelocityScore,
    minSpread,
    matchesCompetitionFilter,
  ]);

  // Note: Auto-fetch removed to prevent infinite loops from unstable dependencies.
  // Data is fetched only when user clicks the "Analyze" button via refresh().

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    return fetchVelocityData();
  }, [fetchVelocityData]);

  /**
   * Get velocity statistics across all items
   */
  const statistics = useMemo(() => {
    if (!filteredVelocities || filteredVelocities.length === 0) {
      return {
        totalItems: 0,
        averageVelocityScore: 0,
        averageDailyVolume: 0,
        averageDaysToSell: 0,
        averageSpread: 0,
        highVelocityCount: 0,
      };
    }

    const totalItems = filteredVelocities.length;
    const sumVelocity = filteredVelocities.reduce((sum, item) => sum + item.velocityScore, 0);
    const sumVolume = filteredVelocities.reduce((sum, item) => sum + item.dailyVolume7d, 0);
    const sumDays = filteredVelocities.reduce((sum, item) => sum + item.daysToSell, 0);
    const sumSpread = filteredVelocities.reduce((sum, item) => sum + item.currentSpread, 0);
    const highVelocityCount = filteredVelocities.filter(item => item.velocityScore >= 70).length;

    return {
      totalItems,
      averageVelocityScore: Math.round(sumVelocity / totalItems),
      averageDailyVolume: Math.round(sumVolume / totalItems),
      averageDaysToSell: Math.round((sumDays / totalItems) * 10) / 10,
      averageSpread: Math.round((sumSpread / totalItems) * 100) / 100,
      highVelocityCount,
    };
  }, [filteredVelocities]);

  /**
   * Get top velocity opportunities (top 10 by velocity score)
   */
  const topOpportunities = useMemo(() => {
    return filteredVelocities.slice(0, 10);
  }, [filteredVelocities]);

  return {
    velocities: filteredVelocities,
    loading,
    error,
    lastUpdated,
    refresh,
    statistics,
    topOpportunities,
    // Export utility functions for external use
    calculateAverageDailyVolume,
    analyzeVolumeTrend,
    calculateDaysToSell,
    calculateVelocityScore,
  };
}

export default useMarketVelocity;
