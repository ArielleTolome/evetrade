import { useMemo } from 'react';

/**
 * Calculate liquidity score based on volume and order depth
 * @param {number} volume - Daily volume
 * @param {number} orderDepth - Total order depth (buy + sell)
 * @returns {number} Score (0-100)
 */
function calculateLiquidityScore(volume, orderDepth) {
  // Normalize volume (consider 100+ daily volume as excellent)
  const volumeScore = Math.min(100, (volume / 100) * 50);

  // Normalize order depth (consider 10M+ ISK as excellent)
  const depthScore = Math.min(100, (orderDepth / 10_000_000) * 50);

  return Math.round(volumeScore + depthScore);
}

/**
 * Calculate stability score based on volatility and spread
 * @param {number} volatility - Price volatility percentage
 * @param {number} spreadPercent - Spread as percentage of price
 * @returns {number} Score (0-100)
 */
function calculateStabilityScore(volatility, spreadPercent) {
  // Lower volatility is better (invert the score)
  // Consider 20% volatility as the threshold for 0 score
  const volatilityScore = Math.max(0, 100 - (volatility / 20) * 100);

  // Lower spread is better
  // Consider 5% spread as the threshold for 0 score
  const spreadScore = Math.max(0, 100 - (spreadPercent / 5) * 100);

  return Math.round((volatilityScore + spreadScore) / 2);
}

/**
 * Calculate opportunity score based on margin and volume
 * @param {number} marginPercent - Profit margin percentage
 * @param {number} volume - Daily volume
 * @param {number} trend - Market trend momentum
 * @returns {number} Score (0-100)
 */
function calculateOpportunityScore(marginPercent, volume, trend) {
  // Higher margin is better
  // Consider 10% margin as excellent
  const marginScore = Math.min(100, (marginPercent / 10) * 50);

  // Higher volume is better (for liquidity of opportunity)
  const volumeScore = Math.min(100, (volume / 100) * 25);

  // Positive trend is better
  // Normalize trend from -100/100 to 0/25
  const trendScore = ((trend + 100) / 200) * 25;

  return Math.round(marginScore + volumeScore + trendScore);
}

/**
 * Get health status info based on score
 * @param {number} score - Health score (0-100)
 * @returns {object} Status info
 */
function getHealthStatus(score) {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'text-green-400',
      bg: 'bg-green-500',
      bgLight: 'bg-green-500/20',
      border: 'border-green-500/50'
    };
  } else if (score >= 60) {
    return {
      label: 'Good',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500',
      bgLight: 'bg-cyan-500/20',
      border: 'border-cyan-500/50'
    };
  } else if (score >= 40) {
    return {
      label: 'Fair',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500',
      bgLight: 'bg-yellow-500/20',
      border: 'border-yellow-500/50'
    };
  } else if (score >= 20) {
    return {
      label: 'Poor',
      color: 'text-orange-400',
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-500/20',
      border: 'border-orange-500/50'
    };
  } else {
    return {
      label: 'Very Poor',
      color: 'text-red-400',
      bg: 'bg-red-500',
      bgLight: 'bg-red-500/20',
      border: 'border-red-500/50'
    };
  }
}

/**
 * MarketHealth - Market health score component
 *
 * @param {number} volume - Daily volume
 * @param {number} orderDepth - Total order depth
 * @param {number} volatility - Price volatility percentage
 * @param {number} spread - Price spread (buy - sell)
 * @param {number} midPrice - Mid price for calculations
 * @param {number} marginPercent - Profit margin percentage
 * @param {number} trend - Market trend momentum (-100 to 100)
 * @param {boolean} compact - Compact mode
 */
export function MarketHealth({
  volume = 0,
  orderDepth = 0,
  volatility = 0,
  spread = 0,
  midPrice = 0,
  marginPercent = 0,
  trend = 0,
  compact = false
}) {
  // Calculate spread percentage
  const spreadPercent = useMemo(() => {
    return midPrice > 0 ? (spread / midPrice) * 100 : 0;
  }, [spread, midPrice]);

  // Calculate individual scores
  const liquidityScore = useMemo(() => {
    return calculateLiquidityScore(volume, orderDepth);
  }, [volume, orderDepth]);

  const stabilityScore = useMemo(() => {
    return calculateStabilityScore(volatility, spreadPercent);
  }, [volatility, spreadPercent]);

  const opportunityScore = useMemo(() => {
    return calculateOpportunityScore(marginPercent, volume, trend);
  }, [marginPercent, volume, trend]);

  // Calculate overall health score (weighted average)
  const overallScore = useMemo(() => {
    // Liquidity: 35%, Stability: 30%, Opportunity: 35%
    return Math.round(
      liquidityScore * 0.35 +
      stabilityScore * 0.30 +
      opportunityScore * 0.35
    );
  }, [liquidityScore, stabilityScore, opportunityScore]);

  const status = useMemo(() => getHealthStatus(overallScore), [overallScore]);

  // Compact mode
  if (compact) {
    return (
      <div className="flex items-center gap-2" title={`Market Health: ${status.label}`}>
        <div className={`w-2 h-2 rounded-full ${status.bg}`} />
        <span className={`text-xs font-medium ${status.color}`}>{overallScore}</span>
      </div>
    );
  }

  // Full display mode
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Market Health
      </h3>

      {/* Overall Score */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className="text-xs text-gray-400">Overall Score</span>
          <div className="text-right">
            <div className={`text-3xl font-bold font-mono ${status.color}`}>
              {overallScore}
            </div>
            <div className={`text-xs font-medium ${status.color}`}>
              {status.label}
            </div>
          </div>
        </div>

        {/* Overall gauge */}
        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${status.bg} transition-all duration-500`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Component Scores */}
      <div className="space-y-3 pt-4 border-t border-gray-700">
        {/* Liquidity */}
        <ScoreRow
          label="Liquidity"
          score={liquidityScore}
          icon="💧"
          tooltip="Based on trading volume and order depth"
        />

        {/* Stability */}
        <ScoreRow
          label="Stability"
          score={stabilityScore}
          icon="⚖️"
          tooltip="Based on price volatility and spread"
        />

        {/* Opportunity */}
        <ScoreRow
          label="Opportunity"
          score={opportunityScore}
          icon="💎"
          tooltip="Based on profit margin, volume, and trend"
        />
      </div>

      {/* Visual Radar/Spider Chart */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <HealthRadar
          liquidity={liquidityScore}
          stability={stabilityScore}
          opportunity={opportunityScore}
        />
      </div>
    </div>
  );
}

/**
 * ScoreRow - Individual score component
 */
function ScoreRow({ label, score, icon, tooltip }) {
  const status = useMemo(() => getHealthStatus(score), [score]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-gray-400" title={tooltip}>
            {label}
          </span>
        </div>
        <span className={`text-sm font-mono font-bold ${status.color}`}>
          {score}
        </span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${status.bg} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

/**
 * HealthRadar - Simple triangular radar chart for health metrics
 */
function HealthRadar({ liquidity, stability, opportunity }) {
  const centerX = 50;
  const centerY = 50;
  const radius = 35;

  // Calculate points for the triangle (3 vertices)
  const angles = [
    -Math.PI / 2,           // Top (Liquidity)
    Math.PI / 6,            // Bottom Right (Opportunity)
    (5 * Math.PI) / 6       // Bottom Left (Stability)
  ];

  // Max values triangle (background)
  const maxPoints = angles.map(angle => ({
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  }));

  // Actual values triangle
  const valuePoints = [
    {
      x: centerX + (radius * liquidity / 100) * Math.cos(angles[0]),
      y: centerY + (radius * liquidity / 100) * Math.sin(angles[0])
    },
    {
      x: centerX + (radius * opportunity / 100) * Math.cos(angles[1]),
      y: centerY + (radius * opportunity / 100) * Math.sin(angles[1])
    },
    {
      x: centerX + (radius * stability / 100) * Math.cos(angles[2]),
      y: centerY + (radius * stability / 100) * Math.sin(angles[2])
    }
  ];

  const maxPolygon = maxPoints.map(p => `${p.x},${p.y}`).join(' ');
  const valuePolygon = valuePoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full aspect-square max-w-[200px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circles */}
        <circle cx={centerX} cy={centerY} r={radius * 0.33} fill="none" stroke="#374151" strokeWidth="0.5" />
        <circle cx={centerX} cy={centerY} r={radius * 0.66} fill="none" stroke="#374151" strokeWidth="0.5" />
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#374151" strokeWidth="0.5" />

        {/* Axis lines */}
        {maxPoints.map((point, i) => (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={point.x}
            y2={point.y}
            stroke="#374151"
            strokeWidth="0.5"
          />
        ))}

        {/* Max triangle (background) */}
        <polygon
          points={maxPolygon}
          fill="#374151"
          fillOpacity="0.1"
          stroke="#4b5563"
          strokeWidth="0.5"
        />

        {/* Value triangle (actual scores) */}
        <polygon
          points={valuePolygon}
          fill="#06b6d4"
          fillOpacity="0.3"
          stroke="#06b6d4"
          strokeWidth="1"
        />

        {/* Value points */}
        {valuePoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="1.5"
            fill="#06b6d4"
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[10px] text-cyan-400">
        💧
      </div>
      <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 text-[10px] text-cyan-400">
        💎
      </div>
      <div className="absolute bottom-0 left-0 -translate-x-1 translate-y-1 text-[10px] text-cyan-400">
        ⚖️
      </div>
    </div>
  );
}

/**
 * HealthBadge - Compact health badge
 */
export function HealthBadge({ score }) {
  const status = useMemo(() => getHealthStatus(score), [score]);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${status.bgLight} ${status.border} border`}
      title={`Market Health: ${status.label} (${score}/100)`}
    >
      <div className={`w-2 h-2 rounded-full ${status.bg}`} />
      <span className={`text-xs font-medium ${status.color}`}>{score}</span>
    </div>
  );
}

/**
 * HealthMeter - Circular gauge for health score
 */
export function HealthMeter({ score, size = 80 }) {
  const status = useMemo(() => getHealthStatus(score), [score]);

  const circumference = 2 * Math.PI * 30; // radius = 30
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="#374151"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={status.color}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-xl font-bold ${status.color}`}>{score}</div>
        <div className="text-[8px] text-gray-400">HEALTH</div>
      </div>
    </div>
  );
}

export default MarketHealth;
