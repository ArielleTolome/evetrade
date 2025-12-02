/**
 * ManipulationDetector Component
 *
 * Detects suspicious market manipulation patterns that may indicate
 * artificial price manipulation, pump-and-dump schemes, or market cornering.
 * Helps traders identify potentially risky trading situations.
 *
 * Features:
 * - Detects sudden price spikes/drops (>30% in 24h)
 * - Identifies unusual volume spikes (>5x average)
 * - Flags potential price walls (large orders at specific prices)
 * - Shows warning icons with detailed explanations
 * - Risk level indicator (None/Low/Medium/High/Critical)
 * - Historical pattern analysis
 * - Compact mode for inline display
 *
 * Detection Patterns:
 * - Price Spike: >30% increase in 24h with low volume
 * - Price Crash: >30% decrease in 24h
 * - Volume Manipulation: Volume >5x the 7-day average
 * - Price Wall: Single order >20% of daily volume
 * - Pump & Dump: Price spike followed by rapid decline
 *
 * Usage:
 * ```jsx
 * // Full view
 * <ManipulationDetector
 *   currentPrice={1500000}
 *   previousPrice={1000000}
 *   volume={50000}
 *   averageVolume={10000}
 *   largeOrders={[...]}
 *   priceHistory={[...]}
 *   compact={false}
 * />
 *
 * // Compact view (for tables)
 * <ManipulationDetector
 *   currentPrice={5100000}
 *   previousPrice={5000000}
 *   volume={1000}
 *   averageVolume={1200}
 *   compact={true}
 * />
 * ```
 */

import { useMemo } from 'react';
import { formatISK, formatPercent, formatNumber, formatCompact } from '../../utils/formatters';

/**
 * Detect manipulation patterns
 * @param {object} params - Detection parameters
 * @returns {Array} Array of detected issues
 */
function detectManipulation({
  currentPrice,
  previousPrice,
  volume,
  averageVolume,
  largeOrders = [],
  priceHistory = [],
}) {
  const issues = [];

  // Calculate price change
  const priceChange = previousPrice > 0
    ? ((currentPrice - previousPrice) / previousPrice) * 100
    : 0;

  // 1. Sudden Price Spike
  if (priceChange > 30) {
    issues.push({
      type: 'price_spike',
      severity: 'high',
      title: 'Sudden Price Spike',
      description: `Price increased ${formatPercent(Math.abs(priceChange) / 100, 1)} in 24 hours. May indicate pump-and-dump scheme.`,
      icon: '📈',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      value: priceChange,
    });
  }

  // 2. Sudden Price Crash
  if (priceChange < -30) {
    issues.push({
      type: 'price_crash',
      severity: 'high',
      title: 'Sudden Price Crash',
      description: `Price dropped ${formatPercent(Math.abs(priceChange) / 100, 1)} in 24 hours. May indicate market dumping or manipulation.`,
      icon: '📉',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      value: priceChange,
    });
  }

  // 3. Unusual Volume Spike
  if (averageVolume > 0 && volume > averageVolume * 5) {
    const volumeMultiple = volume / averageVolume;
    issues.push({
      type: 'volume_spike',
      severity: volumeMultiple > 10 ? 'high' : 'medium',
      title: 'Unusual Volume Spike',
      description: `Volume is ${formatNumber(volumeMultiple, 1)}x the 7-day average. Unusual trading activity detected.`,
      icon: '📊',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      value: volumeMultiple,
    });
  }

  // 4. Price Wall Detection (large orders)
  if (largeOrders.length > 0 && volume > 0) {
    largeOrders.forEach(order => {
      const orderPercent = (order.volume / volume) * 100;
      if (orderPercent > 20) {
        issues.push({
          type: 'price_wall',
          severity: 'medium',
          title: 'Potential Price Wall',
          description: `Large ${order.is_buy_order ? 'buy' : 'sell'} order (${formatCompact(order.volume)} units, ${formatPercent(orderPercent / 100, 0)} of volume) at ${formatISK(order.price, false)}. May be controlling price.`,
          icon: '🧱',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          value: orderPercent,
        });
      }
    });
  }

  // 5. Pump & Dump Pattern (spike followed by decline)
  if (priceHistory.length >= 3) {
    const recent = priceHistory.slice(-3);
    const [old, peak, current] = recent;

    if (old && peak && current) {
      const risePercent = ((peak.average - old.average) / old.average) * 100;
      const fallPercent = ((current.average - peak.average) / peak.average) * 100;

      if (risePercent > 25 && fallPercent < -20) {
        issues.push({
          type: 'pump_dump',
          severity: 'critical',
          title: 'Pump & Dump Pattern',
          description: `Price spiked ${formatPercent(risePercent / 100, 0)} then crashed ${formatPercent(Math.abs(fallPercent) / 100, 0)}. Classic manipulation pattern.`,
          icon: '🚨',
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/40',
          value: risePercent + Math.abs(fallPercent),
        });
      }
    }
  }

  // 6. Artificial Stability (suspiciously constant price)
  if (priceHistory.length >= 7) {
    const recentPrices = priceHistory.slice(-7).map(h => h.average);
    const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    const maxDeviation = Math.max(...recentPrices.map(p => Math.abs(p - avgPrice)));
    const deviationPercent = (maxDeviation / avgPrice) * 100;

    if (deviationPercent < 0.5) {
      issues.push({
        type: 'artificial_stability',
        severity: 'low',
        title: 'Suspicious Stability',
        description: `Price has been unusually stable (< ${formatPercent(deviationPercent / 100, 2)} variation). May indicate price fixing.`,
        icon: '⚖️',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        value: deviationPercent,
      });
    }
  }

  return issues;
}

/**
 * Calculate overall risk level
 * @param {Array} issues - Array of detected issues
 * @returns {object} Risk level info
 */
function calculateRiskLevel(issues) {
  if (issues.length === 0) {
    return {
      level: 'none',
      label: 'No Issues',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      icon: '✅',
      description: 'No manipulation patterns detected',
    };
  }

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;

  if (criticalCount > 0) {
    return {
      level: 'critical',
      label: 'Critical Risk',
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      icon: '🚨',
      description: 'Severe manipulation detected - avoid trading',
    };
  } else if (highCount >= 2 || highCount + mediumCount >= 3) {
    return {
      level: 'high',
      label: 'High Risk',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      icon: '⚠️',
      description: 'Multiple manipulation indicators - exercise caution',
    };
  } else if (highCount === 1 || mediumCount >= 2) {
    return {
      level: 'medium',
      label: 'Medium Risk',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      icon: '⚡',
      description: 'Some manipulation indicators present',
    };
  } else {
    return {
      level: 'low',
      label: 'Low Risk',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      icon: 'ℹ️',
      description: 'Minor irregularities detected',
    };
  }
}

/**
 * ManipulationDetector Component
 * Detects and displays market manipulation patterns
 *
 * @param {number} currentPrice - Current market price
 * @param {number} previousPrice - Price 24h ago
 * @param {number} volume - Current 24h volume
 * @param {number} averageVolume - 7-day average volume
 * @param {Array} largeOrders - Array of large orders (optional)
 * @param {Array} priceHistory - Historical price data (optional)
 * @param {boolean} compact - Whether to show compact view
 * @param {string} className - Additional CSS classes
 */
export function ManipulationDetector({
  currentPrice,
  previousPrice,
  volume,
  averageVolume,
  largeOrders = [],
  priceHistory = [],
  compact = false,
  className = '',
}) {
  const issues = useMemo(() => {
    return detectManipulation({
      currentPrice,
      previousPrice,
      volume,
      averageVolume,
      largeOrders,
      priceHistory,
    });
  }, [currentPrice, previousPrice, volume, averageVolume, largeOrders, priceHistory]);

  const riskLevel = useMemo(() => {
    return calculateRiskLevel(issues);
  }, [issues]);

  // Compact view - show inline indicator
  if (compact) {
    if (issues.length === 0) {
      return (
        <span className="text-xs text-green-400" title="No issues detected">
          ✓
        </span>
      );
    }

    return (
      <div className="inline-flex items-center gap-1 group relative cursor-help">
        <span className="text-xs">{riskLevel.icon}</span>
        <span className={`text-xs font-medium ${riskLevel.color}`}>
          {issues.length}
        </span>

        {/* Tooltip on hover */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg min-w-[200px]">
          <div className={`font-medium mb-1 ${riskLevel.color}`}>{riskLevel.label}</div>
          <div className="text-text-secondary mb-1">{issues.length} pattern{issues.length !== 1 ? 's' : ''} detected</div>
          {issues.slice(0, 2).map((issue, idx) => (
            <div key={idx} className="text-text-secondary text-xs mt-1">
              {issue.icon} {issue.title}
            </div>
          ))}
          {issues.length > 2 && (
            <div className="text-text-secondary/70 text-xs mt-1">
              +{issues.length - 2} more...
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-space-black" />
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className={`bg-space-dark/30 rounded-lg p-4 border ${riskLevel.borderColor} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{riskLevel.icon}</span>
          <h4 className="text-sm font-medium text-accent-cyan">Manipulation Detector</h4>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${riskLevel.bgColor} ${riskLevel.color}`}>
          {riskLevel.label}
        </span>
      </div>

      {/* Risk summary */}
      <div className={`mb-4 p-3 rounded ${riskLevel.bgColor} ${riskLevel.borderColor} border`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">Risk Assessment</span>
          <span className={`text-xs font-medium ${riskLevel.color}`}>
            {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} Detected
          </span>
        </div>
        <div className="text-xs text-text-secondary">
          {riskLevel.description}
        </div>
      </div>

      {/* Issues list */}
      {issues.length > 0 ? (
        <div className="space-y-2">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border ${issue.bgColor} ${issue.borderColor}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base flex-shrink-0">{issue.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium mb-1 ${issue.color}`}>
                    {issue.title}
                  </div>
                  <div className="text-xs text-text-secondary leading-relaxed">
                    {issue.description}
                  </div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded ${issue.bgColor} ${issue.color} font-medium uppercase`}>
                  {issue.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 bg-green-500/10 rounded border border-green-500/20">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm text-green-400 font-medium mb-1">
            No Manipulation Detected
          </div>
          <div className="text-xs text-text-secondary">
            Market appears to be trading normally without suspicious patterns.
          </div>
        </div>
      )}

      {/* Warning footer */}
      {issues.length > 0 && (
        <div className="mt-4 pt-3 border-t border-accent-cyan/10">
          <div className="flex items-start gap-2 text-xs text-text-secondary">
            <svg className="w-4 h-4 text-accent-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              <span className="font-medium text-accent-gold">Trading Warning:</span> These patterns suggest potential market manipulation.
              Exercise extreme caution, verify data from multiple sources, and consider avoiding this market until patterns normalize.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManipulationDetector;
