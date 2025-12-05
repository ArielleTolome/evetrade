/**
 * PriceVolatilityIndex Component
 *
 * Calculates and displays price volatility based on historical market data.
 * Uses standard deviation and price range analysis to determine how much
 * prices fluctuate over time, helping traders assess risk and opportunity.
 *
 * Features:
 * - Standard deviation calculation of prices over time
 * - Volatility rating (Low/Medium/High/Extreme)
 * - Visual indicator with detailed tooltip
 * - Price range analysis (min/max/average)
 * - Fetches market history from ESI API
 * - Compact mode for inline display
 * - Loading and error states
 *
 * Usage:
 * ```jsx
 * // Full view with auto-fetch
 * <PriceVolatilityIndex
 *   typeId={34}
 *   regionId={10000002}
 *   compact={false}
 * />
 *
 * // Compact view with manual data
 * <PriceVolatilityIndex
 *   priceHistory={[...]}
 *   compact={true}
 * />
 * ```
 */

import { useState, useEffect, useMemo } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';
import { getMarketHistory } from '../../api/esi';
import { getCached, setCached } from '../../hooks/useCache';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Calculate volatility metrics from price history
 * @param {Array} priceHistory - Array of price data points {date, average, highest, lowest, volume}
 * @returns {object} Volatility metrics
 */
function calculateVolatility(priceHistory) {
  if (!priceHistory || priceHistory.length === 0) {
    return {
      volatility: 0,
      stdDev: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceRange: 0,
      coefficient: 0,
      isValid: false,
    };
  }

  const prices = priceHistory.map(d => d.average).filter(p => p > 0);
  if (prices.length === 0) {
    return { volatility: 0, isValid: false };
  }

  // Calculate mean
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  // Calculate standard deviation
  const squaredDiffs = prices.map(p => Math.pow(p - avgPrice, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  // Calculate coefficient of variation (CV) - normalized volatility
  const coefficient = avgPrice > 0 ? (stdDev / avgPrice) * 100 : 0;

  // Calculate price range
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = ((maxPrice - minPrice) / avgPrice) * 100;

  return {
    volatility: coefficient,
    stdDev,
    avgPrice,
    minPrice,
    maxPrice,
    priceRange,
    coefficient,
    isValid: true,
    dataPoints: prices.length,
  };
}

/**
 * Get volatility rating and styling
 * @param {number} volatility - Coefficient of variation as percentage
 * @returns {object} Rating info
 */
function getVolatilityRating(volatility) {
  if (volatility <= 5) {
    return {
      label: 'Low',
      description: 'Stable prices, low risk, predictable market',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      icon: '📊',
      risk: 'Low Risk',
    };
  } else if (volatility <= 15) {
    return {
      label: 'Medium',
      description: 'Moderate price swings, balanced risk/reward',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      icon: '📈',
      risk: 'Medium Risk',
    };
  } else if (volatility <= 30) {
    return {
      label: 'High',
      description: 'Significant price fluctuations, high risk/reward',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      icon: '⚠️',
      risk: 'High Risk',
    };
  } else {
    return {
      label: 'Extreme',
      description: 'Highly unstable prices, extreme risk, speculative',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      icon: '🔥',
      risk: 'Extreme Risk',
    };
  }
}

/**
 * PriceVolatilityIndex Component
 * Shows price volatility analysis with visual indicators
 *
 * @param {number} typeId - EVE item type ID (for auto-fetch)
 * @param {number} regionId - EVE region ID (for auto-fetch)
 * @param {Array} priceHistory - Manual price history data (optional)
 * @param {boolean} compact - Whether to show compact view
 * @param {string} className - Additional CSS classes
 */
export function PriceVolatilityIndex({
  typeId,
  regionId,
  priceHistory: manualHistory = null,
  compact = false,
  className = '',
}) {
  const [priceHistory, setPriceHistory] = useState(manualHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch market history if typeId and regionId provided
  useEffect(() => {
    if (manualHistory) {
      setPriceHistory(manualHistory);
      return;
    }

    if (!typeId || !regionId) {
      return;
    }

    let mounted = true;

    async function fetchHistory() {
      setLoading(true);
      setError(null);

      try {
        const cacheKey = `market_history_${regionId}_${typeId}`;
        let data = await getCached(cacheKey);

        if (!data) {
          data = await getMarketHistory(regionId, typeId);
          await setCached(cacheKey, data);
        }

        if (mounted) {
          // Use last 30 days of data
          const recentData = data.slice(-30);
          setPriceHistory(recentData);
        }
      } catch (err) {
        console.error('Failed to fetch market history:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [typeId, regionId, manualHistory]);

  const metrics = useMemo(() => {
    return calculateVolatility(priceHistory);
  }, [priceHistory]);

  const rating = useMemo(() => {
    return getVolatilityRating(metrics.volatility);
  }, [metrics.volatility]);

  // Loading state
  if (loading) {
    return compact ? (
      <span className="text-xs text-text-secondary">
        <LoadingSpinner size="sm" className="inline-block" />
      </span>
    ) : (
      <div className={`bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10 ${className}`}>
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-text-secondary">Loading volatility data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return compact ? (
      <span className="text-xs text-red-400" title={error}>Error</span>
    ) : (
      <div className={`bg-space-dark/30 rounded-lg p-4 border border-red-500/30 ${className}`}>
        <div className="text-center text-sm text-red-400">
          Failed to load volatility data
          <div className="text-xs text-text-secondary mt-1">{error}</div>
        </div>
      </div>
    );
  }

  // Invalid data
  if (!metrics.isValid) {
    return compact ? (
      <span className="text-xs text-text-secondary">N/A</span>
    ) : (
      <div className={`bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10 ${className}`}>
        <div className="text-center text-sm text-text-secondary">
          Insufficient price data
        </div>
      </div>
    );
  }

  // Compact view - show inline indicator
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 group relative cursor-help ${className}`}
        title={`${rating.label} Volatility: ${formatPercent(metrics.volatility / 100, 1)}`}
      >
        <span className="text-xs">{rating.icon}</span>
        <span className={`text-xs font-medium ${rating.color}`}>
          {rating.label}
        </span>

        {/* Tooltip on hover */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
          <div className="font-medium mb-1">{rating.label} Volatility</div>
          <div className="text-text-secondary">{formatPercent(metrics.volatility / 100, 1)} coefficient</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-space-black" />
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className={`bg-space-dark/30 rounded-lg p-4 border ${rating.borderColor} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{rating.icon}</span>
          <h4 className="text-sm font-medium text-accent-cyan">Price Volatility</h4>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${rating.bgColor} ${rating.color}`}>
          {rating.label}
        </span>
      </div>

      {/* Main volatility metric */}
      <div className={`mb-4 p-4 rounded ${rating.bgColor} ${rating.borderColor} border`}>
        <div className="text-center">
          <div className="text-xs text-text-secondary mb-1">Coefficient of Variation</div>
          <div className={`text-2xl font-bold ${rating.color}`}>
            {formatPercent(metrics.volatility / 100, 1)}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            ({metrics.dataPoints} days of data)
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-space-mid/30 rounded">
          <div className="text-xs text-text-secondary mb-1">Avg Price</div>
          <div className="text-xs font-mono text-text-primary">
            {formatISK(metrics.avgPrice, false)}
          </div>
        </div>
        <div className="text-center p-2 bg-space-mid/30 rounded">
          <div className="text-xs text-text-secondary mb-1">Std Dev</div>
          <div className="text-xs font-mono text-text-primary">
            {formatISK(metrics.stdDev, false)}
          </div>
        </div>
        <div className="text-center p-2 bg-space-mid/30 rounded">
          <div className="text-xs text-text-secondary mb-1">Range</div>
          <div className="text-xs font-mono text-text-primary">
            {formatPercent(metrics.priceRange / 100, 1)}
          </div>
        </div>
      </div>

      {/* Price range visualization */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
          <span>Min: {formatISK(metrics.minPrice, false)}</span>
          <span>Max: {formatISK(metrics.maxPrice, false)}</span>
        </div>
        <div className="relative h-3 bg-space-dark rounded overflow-hidden">
          <div
            className={`absolute left-0 top-0 bottom-0 ${rating.bgColor}`}
            style={{ width: '100%' }}
          />
          {/* Average price marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-accent-cyan"
            style={{
              left: `${((metrics.avgPrice - metrics.minPrice) / (metrics.maxPrice - metrics.minPrice)) * 100}%`
            }}
            title={`Avg: ${formatISK(metrics.avgPrice, false)}`}
          />
        </div>
      </div>

      {/* Risk indicator */}
      <div className={`p-2 rounded mb-3 ${rating.bgColor} ${rating.borderColor} border`}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Risk Level:</span>
          <span className={`font-medium ${rating.color}`}>{rating.risk}</span>
        </div>
      </div>

      {/* Description */}
      <div className="pt-3 border-t border-accent-cyan/10">
        <div className="flex items-start gap-2 text-xs text-text-secondary">
          <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{rating.description}</span>
        </div>
      </div>
    </div>
  );
}

export default PriceVolatilityIndex;
