/**
 * MarketSpreadAnalyzer Component
 *
 * Displays bid/ask spread analysis for market trading decisions.
 * The spread represents the difference between the highest buy order (bid)
 * and the lowest sell order (ask), indicating market liquidity and trading opportunities.
 *
 * Features:
 * - Bid/ask spread as percentage
 * - Color-coded spreads (tight spreads = green, wide spreads = red)
 * - Historical spread comparison if data available
 * - Compact mode for inline display in tables
 * - Full mode with detailed breakdown
 * - Visual spread indicator
 *
 * Usage:
 * ```jsx
 * // Full view
 * <MarketSpreadAnalyzer
 *   bidPrice={1250000}
 *   askPrice={1500000}
 *   historicalSpread={0.15}
 *   compact={false}
 * />
 *
 * // Compact view (for tables)
 * <MarketSpreadAnalyzer
 *   bidPrice={5000000}
 *   askPrice={5100000}
 *   compact={true}
 * />
 * ```
 */

import { useMemo } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * Calculate spread metrics
 * @param {number} bidPrice - Highest buy order price
 * @param {number} askPrice - Lowest sell order price
 * @returns {object} Spread metrics
 */
function calculateSpread(bidPrice, askPrice) {
  if (!bidPrice || !askPrice || bidPrice <= 0 || askPrice <= 0) {
    return {
      spreadAmount: 0,
      spreadPercent: 0,
      midPrice: 0,
      isValid: false,
    };
  }

  const spreadAmount = askPrice - bidPrice;
  const midPrice = (bidPrice + askPrice) / 2;
  const spreadPercent = (spreadAmount / midPrice) * 100;

  return {
    spreadAmount,
    spreadPercent,
    midPrice,
    isValid: true,
  };
}

/**
 * Get spread quality rating and color
 * @param {number} spreadPercent - Spread as percentage
 * @returns {object} Rating info
 */
function getSpreadRating(spreadPercent) {
  if (spreadPercent <= 1) {
    return {
      label: 'Excellent',
      description: 'Very tight spread, high liquidity',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      barColor: 'bg-green-400',
    };
  } else if (spreadPercent <= 3) {
    return {
      label: 'Good',
      description: 'Decent spread, good for trading',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      barColor: 'bg-cyan-400',
    };
  } else if (spreadPercent <= 7) {
    return {
      label: 'Fair',
      description: 'Moderate spread, acceptable',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      barColor: 'bg-yellow-400',
    };
  } else if (spreadPercent <= 15) {
    return {
      label: 'Wide',
      description: 'Large spread, less liquid',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      barColor: 'bg-orange-400',
    };
  } else {
    return {
      label: 'Very Wide',
      description: 'Extreme spread, low liquidity',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      barColor: 'bg-red-400',
    };
  }
}

/**
 * MarketSpreadAnalyzer Component
 * Shows bid/ask spread analysis with visual indicators
 *
 * @param {number} bidPrice - Highest buy order price
 * @param {number} askPrice - Lowest sell order price
 * @param {number} historicalSpread - Historical average spread (optional)
 * @param {boolean} compact - Whether to show compact view
 * @param {string} className - Additional CSS classes
 */
export function MarketSpreadAnalyzer({
  bidPrice,
  askPrice,
  historicalSpread = null,
  compact = false,
  className = '',
}) {
  const spreadMetrics = useMemo(() => {
    return calculateSpread(bidPrice, askPrice);
  }, [bidPrice, askPrice]);

  const rating = useMemo(() => {
    return getSpreadRating(spreadMetrics.spreadPercent);
  }, [spreadMetrics.spreadPercent]);

  // Handle invalid data
  if (!spreadMetrics.isValid) {
    return compact ? (
      <span className="text-xs text-text-secondary">N/A</span>
    ) : (
      <div className={`bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10 ${className}`}>
        <div className="text-center text-sm text-text-secondary">
          Invalid spread data
        </div>
      </div>
    );
  }

  // Calculate comparison with historical spread
  const spreadComparison = historicalSpread
    ? spreadMetrics.spreadPercent - historicalSpread
    : null;

  // Compact view - show inline summary
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <span className={`text-xs font-medium ${rating.color}`}>
          {formatPercent(spreadMetrics.spreadPercent / 100, 1)}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${rating.barColor}`}
          title={rating.description}
        />
      </div>
    );
  }

  // Full view
  return (
    <div className={`bg-space-dark/30 rounded-lg p-4 border ${rating.borderColor} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-accent-cyan">Market Spread</h4>
        <span className={`text-xs font-medium px-2 py-1 rounded ${rating.bgColor} ${rating.color}`}>
          {rating.label}
        </span>
      </div>

      {/* Spread visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>Bid: {formatISK(bidPrice, false)}</span>
          <span className={`font-medium ${rating.color}`}>
            {formatPercent(spreadMetrics.spreadPercent / 100, 2)}
          </span>
          <span>Ask: {formatISK(askPrice, false)}</span>
        </div>

        {/* Visual bar showing spread */}
        <div className="relative h-8 bg-space-dark rounded overflow-hidden">
          {/* Bid side (left 50%) */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500/20 border-r border-blue-500/40" />
          {/* Ask side (right 50%) */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-red-500/20 border-l border-red-500/40" />

          {/* Spread indicator in the middle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-space-black rounded border border-accent-cyan/30">
            <div className="text-xs font-mono text-accent-cyan whitespace-nowrap">
              {formatISK(spreadMetrics.spreadAmount, false)}
            </div>
          </div>

          {/* Labels */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-blue-400">
            Buy
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-400">
            Sell
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-space-mid/30 rounded">
          <div className="text-xs text-text-secondary mb-1">Mid Price</div>
          <div className="text-sm font-mono text-text-primary">
            {formatISK(spreadMetrics.midPrice, false)}
          </div>
        </div>
        <div className="text-center p-2 bg-space-mid/30 rounded">
          <div className="text-xs text-text-secondary mb-1">Spread</div>
          <div className={`text-sm font-mono font-medium ${rating.color}`}>
            {formatISK(spreadMetrics.spreadAmount, false)}
          </div>
        </div>
      </div>

      {/* Historical comparison */}
      {spreadComparison !== null && (
        <div className={`p-2 rounded text-xs ${spreadComparison > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
          <div className="flex items-center gap-2">
            {spreadComparison > 0 ? (
              <>
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span className="text-red-400">
                  Spread wider than average by {formatPercent(Math.abs(spreadComparison) / 100, 1)}
                </span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-green-400">
                  Spread tighter than average by {formatPercent(Math.abs(spreadComparison) / 100, 1)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mt-3 pt-3 border-t border-accent-cyan/10">
        <div className="flex items-start gap-2 text-xs text-text-secondary">
          <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{rating.description}. Tighter spreads indicate more active trading and better liquidity.</span>
        </div>
      </div>
    </div>
  );
}

export default MarketSpreadAnalyzer;
