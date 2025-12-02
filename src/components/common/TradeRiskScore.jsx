import { useMemo, useState } from 'react';
import { formatISK, formatPercent, formatCompact } from '../../utils/formatters';

/**
 * Risk level definitions with color schemes and thresholds
 */
const RISK_LEVELS = {
  low: {
    label: 'Low Risk',
    shortLabel: 'Low',
    color: 'text-accent-green',
    bg: 'bg-accent-green',
    borderColor: 'border-accent-green',
    shadowColor: 'shadow-accent-green/30',
    glowColor: 'shadow-accent-green/50',
    range: [0, 25],
    icon: '✓',
    description: 'Safe trade with minimal risk factors',
  },
  medium: {
    label: 'Medium Risk',
    shortLabel: 'Medium',
    color: 'text-accent-gold',
    bg: 'bg-accent-gold',
    borderColor: 'border-accent-gold',
    shadowColor: 'shadow-accent-gold/30',
    glowColor: 'shadow-accent-gold/50',
    range: [26, 50],
    icon: '⚠',
    description: 'Moderate risk, proceed with caution',
  },
  high: {
    label: 'High Risk',
    shortLabel: 'High',
    color: 'text-accent-gold',
    bg: 'bg-accent-gold',
    borderColor: 'border-accent-gold',
    shadowColor: 'shadow-accent-gold/50',
    glowColor: 'shadow-accent-gold/70',
    range: [51, 75],
    icon: '⚠',
    description: 'Significant risk, careful consideration needed',
  },
  extreme: {
    label: 'Extreme Risk',
    shortLabel: 'Extreme',
    color: 'text-accent-pink',
    bg: 'bg-accent-pink',
    borderColor: 'border-accent-pink',
    shadowColor: 'shadow-accent-pink/30',
    glowColor: 'shadow-accent-pink/50',
    range: [76, 100],
    icon: '⛔',
    description: 'Very high risk, likely a scam or unrealistic',
  },
};

/**
 * Calculate individual risk factors for a trade
 * @param {Object} trade - Trade data object
 * @returns {Array} Array of risk factor objects with scores and weights
 * @example
 * const factors = calculateRiskFactors(tradeData);
 * // Returns array of { name, score, weight, reason, value, icon }
 */
export function calculateRiskFactors(trade) {
  const factors = [];

  // Extract trade data with safe defaults
  const volume = trade['Volume'] || 0;
  const margin = trade['Gross Margin'] || 0;
  const buyPrice = trade['Buy Price'] || 0;
  const sellPrice = trade['Sell Price'] || 0;
  const netProfit = trade['Net Profit'] || 0;

  // 1. Volume Risk (35% weight) - Low volume = scam potential
  let volumeRisk = 0;
  let volumeReason = '';
  if (volume === 0) {
    volumeRisk = 100;
    volumeReason = 'No volume available - cannot execute trade';
  } else if (volume === 1) {
    volumeRisk = 100;
    volumeReason = 'Volume of 1 - extremely high scam risk';
  } else if (volume <= 5) {
    volumeRisk = 70;
    volumeReason = 'Very low volume - high scam risk';
  } else if (volume <= 20) {
    volumeRisk = 40;
    volumeReason = 'Low volume - moderate liquidity concerns';
  } else if (volume <= 50) {
    volumeRisk = 20;
    volumeReason = 'Acceptable volume - minor liquidity risk';
  } else {
    volumeRisk = 0;
    volumeReason = 'Good volume - low liquidity risk';
  }
  factors.push({
    name: 'Volume Risk',
    score: volumeRisk,
    weight: 0.35,
    reason: volumeReason,
    value: `${volume} units`,
    icon: '📦',
  });

  // 2. Margin Risk (25% weight) - Too high = suspicious, too low = competitive
  let marginRisk = 0;
  let marginReason = '';
  if (margin > 50) {
    marginRisk = 80;
    marginReason = 'Extremely high margin - likely a scam or stale data';
  } else if (margin > 40) {
    marginRisk = 50;
    marginReason = 'Very high margin - suspicious, verify carefully';
  } else if (margin < 3) {
    marginRisk = 60;
    marginReason = 'Very thin margin - highly competitive market';
  } else if (margin < 5) {
    marginRisk = 30;
    marginReason = 'Thin margin - competitive market';
  } else if (margin >= 15 && margin <= 30) {
    marginRisk = 0;
    marginReason = 'Healthy margin - good opportunity';
  } else {
    marginRisk = 10;
    marginReason = 'Acceptable margin range';
  }
  factors.push({
    name: 'Margin Risk',
    score: marginRisk,
    weight: 0.25,
    reason: marginReason,
    value: `${margin.toFixed(1)}%`,
    icon: '📊',
  });

  // 3. Capital Risk (20% weight) - Higher investment = higher exposure
  const capital = buyPrice * Math.min(volume, 100);
  let capitalRisk = 0;
  let capitalReason = '';
  if (capital > 10_000_000_000) {
    capitalRisk = 90;
    capitalReason = 'Massive capital required - extreme exposure';
  } else if (capital > 1_000_000_000) {
    capitalRisk = 70;
    capitalReason = 'High capital required - significant exposure';
  } else if (capital > 100_000_000) {
    capitalRisk = 40;
    capitalReason = 'Moderate capital required - manageable risk';
  } else if (capital > 10_000_000) {
    capitalRisk = 15;
    capitalReason = 'Low capital required - minimal exposure';
  } else {
    capitalRisk = 0;
    capitalReason = 'Very low capital required - safe exposure';
  }
  factors.push({
    name: 'Capital Risk',
    score: capitalRisk,
    weight: 0.2,
    reason: capitalReason,
    value: formatISK(capital, false),
    icon: '💰',
  });

  // 4. Spread Risk (20% weight) - Large spread = volatility/instability
  const spread = sellPrice - buyPrice;
  const spreadPercent = buyPrice > 0 ? (spread / buyPrice) * 100 : 0;
  let spreadRisk = 0;
  let spreadReason = '';
  if (spreadPercent > 200) {
    spreadRisk = 95;
    spreadReason = 'Extreme spread - severe price instability';
  } else if (spreadPercent > 100) {
    spreadRisk = 80;
    spreadReason = 'Very large spread - high volatility';
  } else if (spreadPercent > 50) {
    spreadRisk = 50;
    spreadReason = 'Large spread - notable volatility';
  } else if (spreadPercent > 25) {
    spreadRisk = 25;
    spreadReason = 'Moderate spread - some volatility';
  } else {
    spreadRisk = 0;
    spreadReason = 'Tight spread - stable pricing';
  }
  factors.push({
    name: 'Spread Risk',
    score: spreadRisk,
    weight: 0.2,
    reason: spreadReason,
    value: `${spreadPercent.toFixed(1)}%`,
    icon: '📈',
  });

  return factors;
}

/**
 * Calculate overall risk score and determine risk level
 * @param {Array} factors - Risk factors from calculateRiskFactors
 * @returns {Object} Score, level, and risk level info
 * @example
 * const { totalScore, level, info } = calculateOverallRisk(factors);
 */
export function calculateOverallRisk(factors) {
  // Weighted average of all risk factors
  const totalScore = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight), 0)
  );

  // Determine risk level based on score
  let level = 'low';
  if (totalScore >= 76) level = 'extreme';
  else if (totalScore >= 51) level = 'high';
  else if (totalScore >= 26) level = 'medium';

  return {
    totalScore,
    level,
    info: RISK_LEVELS[level],
  };
}

/**
 * Circular risk gauge component
 */
function RiskGauge({ score, level, size = 120 }) {
  const riskInfo = RISK_LEVELS[level];
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-space-dark/50"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={`${riskInfo.color} transition-all duration-1000 ease-out ${riskInfo.glowColor} shadow-lg`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-3xl font-bold font-mono ${riskInfo.color}`}>
          {score}
        </div>
        <div className="text-xs text-text-secondary uppercase tracking-wider">
          Risk
        </div>
      </div>
    </div>
  );
}

/**
 * Risk factor bar component
 */
function RiskFactorBar({ factor, showDetails }) {
  const barWidth = `${factor.score}%`;
  let barColor = 'bg-accent-green';
  if (factor.score >= 76) barColor = 'bg-accent-pink';
  else if (factor.score >= 51) barColor = 'bg-accent-gold';
  else if (factor.score >= 26) barColor = 'bg-accent-gold';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg opacity-70">{factor.icon}</span>
          <span className="text-text-secondary font-medium">{factor.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-mono text-xs">{factor.value}</span>
          <span className="text-text-secondary font-mono text-xs">
            {factor.score}/100
          </span>
        </div>
      </div>
      <div className="relative h-2 bg-space-dark/50 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-700 ease-out shadow-lg`}
          style={{ width: barWidth }}
        />
      </div>
      {showDetails && (
        <p className="text-xs text-text-secondary/80 italic pl-8">
          {factor.reason}
        </p>
      )}
    </div>
  );
}

/**
 * Compact badge view for table cells
 */
function CompactRiskBadge({ score, level }) {
  const riskInfo = RISK_LEVELS[level];

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm opacity-70">{riskInfo.icon}</span>
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${riskInfo.bg}/20 ${riskInfo.color} border ${riskInfo.borderColor}/30`}>
        {score}
      </span>
    </div>
  );
}

/**
 * TradeRiskScore Component
 * Comprehensive risk assessment display for trading opportunities
 *
 * @param {Object} props
 * @param {Object} props.trade - Trade data object
 * @param {boolean} props.compact - Show compact badge view (for tables)
 * @param {boolean} props.showBreakdown - Show individual risk factors
 * @param {boolean} props.showGauge - Show circular gauge visualization
 * @param {boolean} props.expandable - Allow toggling details
 */
export function TradeRiskScore({
  trade,
  compact = false,
  showBreakdown = true,
  showGauge = true,
  expandable = false,
}) {
  const [isExpanded, setIsExpanded] = useState(!expandable);

  const { factors, totalScore, level, info } = useMemo(() => {
    const factors = calculateRiskFactors(trade);
    const { totalScore, level, info } = calculateOverallRisk(factors);

    return { factors, totalScore, level, info };
  }, [trade]);

  // Compact mode for table cells
  if (compact) {
    return (
      <div className="inline-block" title={`${info.label}: ${info.description}`}>
        <CompactRiskBadge score={totalScore} level={level} />
      </div>
    );
  }

  // Full display mode
  return (
    <div className="bg-space-dark/30 rounded-lg border border-accent-cyan/10 overflow-hidden">
      {/* Header */}
      <div
        className={`p-4 ${expandable ? 'cursor-pointer hover:bg-space-dark/20 transition-colors' : ''}`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-70">{info.icon}</span>
            <div>
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                Trade Risk Assessment
              </h3>
              <p className="text-xs text-text-secondary/70 mt-0.5">
                {info.description}
              </p>
            </div>
          </div>

          {/* Risk Level Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg ${info.bg}/20 border ${info.borderColor}/30 ${info.shadowColor} shadow-lg`}>
              <div className={`text-sm font-bold ${info.color} uppercase tracking-wider`}>
                {info.shortLabel}
              </div>
            </div>

            {expandable && (
              <svg
                className={`w-5 h-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-accent-cyan/10">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Gauge */}
              {showGauge && (
                <div className="flex flex-col items-center justify-center">
                  <RiskGauge score={totalScore} level={level} size={140} />
                  <div className="mt-3 text-center">
                    <div className={`text-lg font-bold ${info.color}`}>
                      {info.label}
                    </div>
                    <div className="text-xs text-text-secondary/70 mt-1">
                      Score: {totalScore}/100
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Factors Breakdown */}
              {showBreakdown && (
                <div className={`space-y-4 ${showGauge ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  <h4 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-3">
                    Risk Factor Breakdown
                  </h4>
                  {factors.map((factor, index) => (
                    <RiskFactorBar
                      key={index}
                      factor={factor}
                      showDetails={isExpanded}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Risk Guidelines */}
            <div className="mt-6 pt-4 border-t border-accent-cyan/10">
              <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                Risk Guidelines
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {Object.entries(RISK_LEVELS).map(([key, levelInfo]) => (
                  <div
                    key={key}
                    className={`px-2 py-1.5 rounded ${levelInfo.bg}/10 border ${levelInfo.borderColor}/20 ${level === key ? `${levelInfo.borderColor}/50 border-2` : ''}`}
                  >
                    <div className={`font-medium ${levelInfo.color}`}>
                      {levelInfo.icon} {levelInfo.shortLabel}
                    </div>
                    <div className="text-text-secondary/60 text-[10px] mt-0.5">
                      {levelInfo.range[0]}-{levelInfo.range[1]} points
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Convenience export for compact mode
 */
export function TradeRiskBadge({ trade }) {
  return <TradeRiskScore trade={trade} compact={true} />;
}

export default TradeRiskScore;
