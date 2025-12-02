import { useState, useEffect, useCallback, useMemo } from 'react';
import { getMarketHistory } from '../api/esi';
import * as Sentry from '@sentry/react';

/**
 * Custom hook for analyzing market history data to identify trends and predict price movements
 *
 * @description
 * Analyzes market history to calculate:
 * - Trend direction (bullish, bearish, neutral)
 * - Trend strength (0-100)
 * - Price changes over 7 and 30 days
 * - Volume trends
 * - Predicted future prices
 * - Support and resistance levels
 *
 * @param {number} typeId - Item type ID
 * @param {number} regionId - Region ID
 * @returns {Object} Market trend analysis data
 *
 * @example
 * const { trend, trendStrength, predictedPrice, loading } = useMarketTrends(34, 10000002);
 */
export function useMarketTrends(typeId, regionId) {
  const [marketHistory, setMarketHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch market history data
  useEffect(() => {
    let isMounted = true;

    const fetchMarketHistory = async () => {
      if (!typeId || !regionId) {
        setMarketHistory([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const history = await getMarketHistory(regionId, typeId);

        if (isMounted) {
          // Sort by date (oldest first) and ensure we have valid data
          const validHistory = (history || [])
            .filter(day => day.average != null && day.date != null)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

          setMarketHistory(validHistory);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch market history:', err);

          Sentry.withScope((scope) => {
            scope.setTag('errorType', 'useMarketTrends');
            scope.setExtra('typeId', typeId);
            scope.setExtra('regionId', regionId);
            Sentry.captureException(err);
          });

          setError({ message: err.message || 'Failed to fetch market history', original: err });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMarketHistory();

    return () => {
      isMounted = false;
    };
  }, [typeId, regionId]);

  /**
   * Calculate simple moving average for a given period
   * @param {Array} data - Array of price values
   * @param {number} period - Number of periods for the moving average
   * @returns {Array} Array of moving average values
   */
  const calculateMovingAverage = useCallback((data, period) => {
    if (!data || data.length < period) {
      return [];
    }

    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push(sum / period);
    }

    return result;
  }, []);

  /**
   * Calculate trend using linear regression
   * Returns slope and intercept for trend line
   * @param {Array} prices - Array of price values
   * @returns {Object} { slope, intercept, r2 }
   */
  const calculateTrend = useCallback((prices) => {
    if (!prices || prices.length < 2) {
      return { slope: 0, intercept: 0, r2: 0 };
    }

    const n = prices.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    // Calculate means
    const meanX = indices.reduce((sum, x) => sum + x, 0) / n;
    const meanY = prices.reduce((sum, y) => sum + y, 0) / n;

    // Calculate slope and intercept
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (indices[i] - meanX) * (prices[i] - meanY);
      denominator += Math.pow(indices[i] - meanX, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;

    // Calculate R-squared (coefficient of determination)
    let ssRes = 0; // Sum of squared residuals
    let ssTot = 0; // Total sum of squares

    for (let i = 0; i < n; i++) {
      const predicted = slope * indices[i] + intercept;
      ssRes += Math.pow(prices[i] - predicted, 2);
      ssTot += Math.pow(prices[i] - meanY, 2);
    }

    const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    return { slope, intercept, r2: Math.max(0, r2) };
  }, []);

  /**
   * Calculate support and resistance levels using pivot points and local extrema
   * @param {Array} prices - Array of price values
   * @returns {Object} { supportLevel, resistanceLevel }
   */
  const calculateSupportResistance = useCallback((prices) => {
    if (!prices || prices.length < 3) {
      return { supportLevel: null, resistanceLevel: null };
    }

    // Find local minima (support) and maxima (resistance)
    const localMinima = [];
    const localMaxima = [];

    for (let i = 1; i < prices.length - 1; i++) {
      // Local minimum
      if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        localMinima.push(prices[i]);
      }
      // Local maximum
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        localMaxima.push(prices[i]);
      }
    }

    // Calculate support as average of recent local minima
    const supportLevel = localMinima.length > 0
      ? localMinima.slice(-3).reduce((sum, val) => sum + val, 0) / Math.min(localMinima.length, 3)
      : Math.min(...prices);

    // Calculate resistance as average of recent local maxima
    const resistanceLevel = localMaxima.length > 0
      ? localMaxima.slice(-3).reduce((sum, val) => sum + val, 0) / Math.min(localMaxima.length, 3)
      : Math.max(...prices);

    return {
      supportLevel,
      resistanceLevel,
    };
  }, []);

  /**
   * Predict future price based on historical trend
   * @param {Array} history - Market history data
   * @param {number} days - Number of days to predict ahead
   * @returns {number} Predicted price
   */
  const predictPrice = useCallback((history, days = 1) => {
    if (!history || history.length < 2) {
      return null;
    }

    const prices = history.map(day => day.average);
    const { slope, intercept } = calculateTrend(prices);

    // Predict price for N days ahead
    const predictedPrice = slope * (prices.length + days - 1) + intercept;

    // Ensure predicted price is reasonable (not negative, not more than 200% change)
    const currentPrice = prices[prices.length - 1];
    const maxChange = currentPrice * 2;
    const minPrice = currentPrice * 0.01; // Not less than 1% of current

    return Math.max(minPrice, Math.min(maxChange, predictedPrice));
  }, [calculateTrend]);

  /**
   * Calculate percentage change between two prices
   * @param {number} oldPrice - Starting price
   * @param {number} newPrice - Ending price
   * @returns {number} Percentage change
   */
  const calculatePriceChange = useCallback((oldPrice, newPrice) => {
    if (!oldPrice || oldPrice === 0) return 0;
    return ((newPrice - oldPrice) / oldPrice) * 100;
  }, []);

  /**
   * Determine volume trend (increasing, decreasing, stable)
   * @param {Array} volumes - Array of volume values
   * @returns {string} 'increasing' | 'decreasing' | 'stable'
   */
  const determineVolumeTrend = useCallback((volumes) => {
    if (!volumes || volumes.length < 7) {
      return 'stable';
    }

    const recent = volumes.slice(-7);
    const earlier = volumes.slice(-14, -7);

    if (earlier.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

    const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;

    if (changePercent > 15) return 'increasing';
    if (changePercent < -15) return 'decreasing';
    return 'stable';
  }, []);

  // Calculate all metrics using memoization
  const analysis = useMemo(() => {
    if (!marketHistory || marketHistory.length < 2) {
      return {
        trend: 'neutral',
        trendStrength: 0,
        priceChange7d: 0,
        priceChange30d: 0,
        volumeTrend: 'stable',
        predictedPrice: null,
        confidence: 0,
        supportLevel: null,
        resistanceLevel: null,
      };
    }

    const prices = marketHistory.map(day => day.average);
    const volumes = marketHistory.map(day => day.volume);
    const currentPrice = prices[prices.length - 1];

    // Calculate trend using linear regression
    const { slope, r2 } = calculateTrend(prices);

    // Determine trend direction
    const slopePercent = (slope / currentPrice) * 100;
    let trend = 'neutral';
    if (slopePercent > 0.5) trend = 'bullish';
    else if (slopePercent < -0.5) trend = 'bearish';

    // Calculate trend strength (0-100) based on slope magnitude and R-squared
    const trendStrength = Math.min(100, Math.abs(slopePercent) * 10 * r2);

    // Calculate price changes
    const price7dAgo = marketHistory.length >= 7
      ? marketHistory[marketHistory.length - 7].average
      : marketHistory[0].average;

    const price30dAgo = marketHistory.length >= 30
      ? marketHistory[marketHistory.length - 30].average
      : marketHistory[0].average;

    const priceChange7d = calculatePriceChange(price7dAgo, currentPrice);
    const priceChange30d = calculatePriceChange(price30dAgo, currentPrice);

    // Determine volume trend
    const volumeTrend = determineVolumeTrend(volumes);

    // Predict future price
    const predictedPrice = predictPrice(marketHistory, 1);

    // Calculate confidence based on:
    // - Data availability (more days = higher confidence)
    // - R-squared value (better fit = higher confidence)
    // - Volume consistency (stable volume = higher confidence)
    const dataConfidence = Math.min(100, (marketHistory.length / 90) * 100);
    const fitConfidence = r2 * 100;
    const volumeConfidence = volumeTrend === 'stable' ? 80 : 60;
    const confidence = Math.round((dataConfidence * 0.3 + fitConfidence * 0.5 + volumeConfidence * 0.2));

    // Calculate support and resistance
    const { supportLevel, resistanceLevel } = calculateSupportResistance(prices);

    return {
      trend,
      trendStrength: Math.round(trendStrength),
      priceChange7d: Math.round(priceChange7d * 100) / 100,
      priceChange30d: Math.round(priceChange30d * 100) / 100,
      volumeTrend,
      predictedPrice: predictedPrice ? Math.round(predictedPrice * 100) / 100 : null,
      confidence: Math.max(0, Math.min(100, confidence)),
      supportLevel: supportLevel ? Math.round(supportLevel * 100) / 100 : null,
      resistanceLevel: resistanceLevel ? Math.round(resistanceLevel * 100) / 100 : null,
    };
  }, [
    marketHistory,
    calculateTrend,
    calculatePriceChange,
    determineVolumeTrend,
    predictPrice,
    calculateSupportResistance,
  ]);

  // Export analysis functions for external use
  const exportedFunctions = useMemo(() => ({
    calculateMovingAverage,
    calculateTrend,
    calculateSupportResistance,
    predictPrice,
  }), [calculateMovingAverage, calculateTrend, calculateSupportResistance, predictPrice]);

  return {
    ...analysis,
    loading,
    error,
    marketHistory,
    ...exportedFunctions,
  };
}

export default useMarketTrends;
