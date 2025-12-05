import { useState } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';
import { useProfitMetrics } from '../../hooks/useProfitMetrics';

/**
 * ProfitPerHour Component
 *
 * @description
 * Displays profit efficiency metrics for a trade, including profit per hour,
 * ROI percentage, star rating, capital efficiency, and time to recover investment.
 * Supports both inline (compact) and expanded (detailed) display modes.
 *
 * @param {Object} props - Component props
 * @param {Object} props.trade - Trade object with pricing and volume data
 * @param {boolean} [props.inline=true] - Display mode: true for compact, false for expanded
 * @param {Object} [props.options] - Options passed to useProfitMetrics calculateMetrics
 * @param {number} [props.options.hoursPerDay=24] - Hours in a trading day
 * @param {number} [props.options.assumedTurnover=0.5] - Market capture rate (0-1)
 *
 * @example
 * // Inline mode (for table cells)
 * <ProfitPerHour trade={tradeData} inline={true} />
 *
 * @example
 * // Expanded mode (for detail views)
 * <ProfitPerHour trade={tradeData} inline={false} />
 *
 * @example
 * // With custom options
 * <ProfitPerHour
 *   trade={tradeData}
 *   options={{ assumedTurnover: 0.3 }}
 * />
 */
export function ProfitPerHour({ trade, inline = true, options = {} }) {
  const { calculateMetrics } = useProfitMetrics();
  const [showDetails, setShowDetails] = useState(false);

  const metrics = calculateMetrics(trade, options);

  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className={i < metrics.rating ? 'text-yellow-400' : 'text-gray-600'}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Get color class based on ROI percentage
  const getRoiColor = (roi) => {
    if (roi >= 10) return 'text-green-400';
    if (roi >= 5) return 'text-yellow-400';
    if (roi >= 2) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get color class based on capital efficiency
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 100) return 'text-green-400';
    if (efficiency >= 50) return 'text-yellow-400';
    if (efficiency >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  // Format time to recover for display
  const formatTimeToRecover = (hours) => {
    if (hours === Infinity || hours > 10000) return 'Never';
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.round(hours / 24);
    return `${days}d`;
  };

  // Inline mode: compact display for table cells
  if (inline) {
    return (
      <div
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowDetails(!showDetails)}
        title="Click for details"
      >
        <div className="flex items-center gap-2">
          <div className="text-sm font-mono text-cyan-400">
            {formatISK(metrics.profitPerHour, false)}/h
          </div>
          <div className="text-xs">
            {renderStars()}
          </div>
        </div>
        {showDetails && (
          <div className="mt-2 p-2 bg-space-dark/50 border border-accent-cyan/20 rounded text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-secondary">ROI:</span>
              <span className={`font-mono ${getRoiColor(metrics.roi)}`}>
                {formatPercent(metrics.roi / 100, 1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Recovery:</span>
              <span className="font-mono text-text-primary">
                {formatTimeToRecover(metrics.timeToRecover)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded mode: detailed display for detail views
  return (
    <div className="bg-space-dark/30 border border-accent-cyan/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Profit Efficiency
        </h3>
        <div className="text-xl">
          {renderStars()}
        </div>
      </div>

      <div className="space-y-4">
        {/* Profit per Hour */}
        <div className="bg-space-darker/50 rounded p-3">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Estimated Profit/Hour
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {formatISK(metrics.profitPerHour)}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Based on {metrics.estimatedSalesPerHour.toFixed(1)} sales/hour
          </div>
        </div>

        {/* ROI and Capital Efficiency */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-space-darker/50 rounded p-3">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              ROI
            </div>
            <div className={`text-xl font-bold font-mono ${getRoiColor(metrics.roi)}`}>
              {formatPercent(metrics.roi / 100, 1)}
            </div>
          </div>

          <div className="bg-space-darker/50 rounded p-3">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Efficiency
            </div>
            <div className={`text-xl font-bold font-mono ${getEfficiencyColor(metrics.capitalEfficiency)}`}>
              {metrics.capitalEfficiency.toFixed(1)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              ISK/h per M invested
            </div>
          </div>
        </div>

        {/* Capital and Recovery Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-space-darker/50 rounded p-3">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Capital Required
            </div>
            <div className="text-lg font-mono text-text-primary">
              {formatISK(metrics.capitalRequired)}
            </div>
          </div>

          <div className="bg-space-darker/50 rounded p-3">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Recovery Time
            </div>
            <div className="text-lg font-mono text-text-primary">
              {formatTimeToRecover(metrics.timeToRecover)}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-xs text-text-secondary/70 border-t border-accent-cyan/10 pt-3">
          Assumes {(options.assumedTurnover || 0.5) * 100}% market capture rate.
          Actual results may vary based on competition and market conditions.
        </div>
      </div>
    </div>
  );
}

export default ProfitPerHour;
