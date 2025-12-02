import { useMemo } from 'react';

/**
 * Get momentum visual properties based on trend
 * @param {string} trend - 'bullish', 'bearish', or 'neutral'
 * @returns {object} Visual properties
 */
function getMomentumStyle(trend) {
  const styles = {
    bullish: {
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      label: 'Bullish',
      arrow: '▲',
      glow: 'shadow-green-500/20'
    },
    bearish: {
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      label: 'Bearish',
      arrow: '▼',
      glow: 'shadow-red-500/20'
    },
    neutral: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      label: 'Neutral',
      arrow: '—',
      glow: 'shadow-yellow-500/20'
    }
  };

  return styles[trend] || styles.neutral;
}

/**
 * Get volume momentum indicator
 * @param {number} volumeMomentum - Volume momentum percentage
 * @returns {object} Visual properties
 */
function getVolumeMomentumStyle(volumeMomentum) {
  if (volumeMomentum > 25) {
    return { color: 'text-cyan-400', label: 'Surging', icon: '⚡' };
  } else if (volumeMomentum > 0) {
    return { color: 'text-green-400', label: 'Rising', icon: '↗' };
  } else if (volumeMomentum > -25) {
    return { color: 'text-yellow-400', label: 'Stable', icon: '→' };
  } else {
    return { color: 'text-red-400', label: 'Falling', icon: '↘' };
  }
}

/**
 * Get spread trend indicator
 * @param {number} spreadPercent - Spread as percentage of mid price
 * @returns {object} Visual properties
 */
function getSpreadStyle(spreadPercent) {
  if (spreadPercent < 1) {
    return { color: 'text-green-400', label: 'Tight', quality: 'Excellent' };
  } else if (spreadPercent < 3) {
    return { color: 'text-cyan-400', label: 'Normal', quality: 'Good' };
  } else if (spreadPercent < 5) {
    return { color: 'text-yellow-400', label: 'Wide', quality: 'Fair' };
  } else {
    return { color: 'text-red-400', label: 'Very Wide', quality: 'Poor' };
  }
}

/**
 * MarketMomentum - Compact visual momentum indicator
 *
 * @param {string} trend - Market trend: 'bullish', 'bearish', or 'neutral'
 * @param {number} momentum - Momentum value (-100 to 100)
 * @param {number} volumeMomentum - Volume momentum percentage
 * @param {number} spread - Price spread (buy - sell)
 * @param {number} midPrice - Mid price for spread calculation
 * @param {boolean} compact - Compact mode (default: false)
 * @param {boolean} showLabels - Show text labels (default: true)
 */
export function MarketMomentum({
  trend = 'neutral',
  momentum = 0,
  volumeMomentum = 0,
  spread = 0,
  midPrice = 0,
  compact = false,
  showLabels = true
}) {
  const style = useMemo(() => getMomentumStyle(trend), [trend]);
  const volumeStyle = useMemo(() => getVolumeMomentumStyle(volumeMomentum), [volumeMomentum]);

  const spreadPercent = useMemo(() => {
    return midPrice > 0 ? (spread / midPrice) * 100 : 0;
  }, [spread, midPrice]);

  const spreadStyle = useMemo(() => getSpreadStyle(spreadPercent), [spreadPercent]);

  // Compact mode - minimal display for table cells
  if (compact) {
    return (
      <div
        className="flex items-center gap-2"
        title={`${style.label} momentum (${momentum.toFixed(0)})`}
      >
        <span className={`text-sm font-bold ${style.color}`}>
          {style.arrow}
        </span>
        {showLabels && (
          <span className={`text-xs ${style.color}`}>
            {style.label}
          </span>
        )}
      </div>
    );
  }

  // Full display mode
  return (
    <div className={`rounded-lg border ${style.border} ${style.bg} p-4 shadow-lg ${style.glow}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${style.color}`}>{style.arrow}</span>
          <div>
            <div className={`text-lg font-bold ${style.color}`}>{style.label}</div>
            <div className="text-xs text-gray-400">Market Condition</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-mono font-bold ${style.color}`}>
            {momentum > 0 ? '+' : ''}{momentum.toFixed(0)}
          </div>
          <div className="text-xs text-gray-400">Momentum</div>
        </div>
      </div>

      {/* Momentum Bar */}
      <div className="mb-3">
        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              trend === 'bullish' ? 'bg-green-500' :
              trend === 'bearish' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}
            style={{
              width: `${Math.abs(momentum)}%`,
              marginLeft: momentum < 0 ? `${100 - Math.abs(momentum)}%` : '0'
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Volume Momentum */}
        <div className="flex items-center gap-2">
          <span className={volumeStyle.color}>{volumeStyle.icon}</span>
          <div className="flex-1">
            <div className="text-gray-400">Volume</div>
            <div className={`font-medium ${volumeStyle.color}`}>
              {volumeStyle.label}
            </div>
          </div>
        </div>

        {/* Spread */}
        <div className="flex items-center gap-2">
          <span className={spreadStyle.color}>◆</span>
          <div className="flex-1">
            <div className="text-gray-400">Spread</div>
            <div className={`font-medium ${spreadStyle.color}`}>
              {spreadStyle.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MomentumIndicatorInline - Inline momentum indicator for tables
 *
 * @param {string} trend - Market trend
 * @param {number} momentum - Momentum value
 * @param {boolean} showValue - Show momentum value (default: true)
 */
export function MomentumIndicatorInline({ trend = 'neutral', momentum = 0, showValue = true }) {
  const style = useMemo(() => getMomentumStyle(trend), [trend]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`px-2 py-1 rounded ${style.bg} ${style.border} border flex items-center gap-1.5`}
        title={`${style.label} momentum`}
      >
        <span className={`text-sm font-bold ${style.color}`}>{style.arrow}</span>
        <span className={`text-xs font-medium ${style.color}`}>{style.label}</span>
        {showValue && (
          <span className={`text-xs font-mono ${style.color}`}>
            {momentum > 0 ? '+' : ''}{momentum.toFixed(0)}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * MomentumBadge - Minimal badge for compact spaces
 *
 * @param {string} trend - Market trend
 */
export function MomentumBadge({ trend = 'neutral' }) {
  const style = useMemo(() => getMomentumStyle(trend), [trend]);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.color}`}
      title={`${style.label} market`}
    >
      <span>{style.arrow}</span>
      <span>{style.label}</span>
    </span>
  );
}

export default MarketMomentum;
