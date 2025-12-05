import { useMemo, useState } from 'react';
import { formatPercent, formatNumber } from '../../utils/formatters';

/**
 * Calculate market health metrics from trades data
 */
function calculateMarketHealth(trades) {
  if (!trades || trades.length === 0) {
    return {
      healthScore: 0,
      avgMargin: 0,
      totalVolume: 0,
      scamPercentage: 0,
      competitionLevel: 'unknown',
      tradingOpportunities: 0,
      volumeDistribution: { dead: 0, slow: 0, active: 0, busy: 0, hot: 0 },
    };
  }

  let totalMargin = 0;
  let totalVolume = 0;
  let scamTrades = 0;
  let lowMarginTrades = 0;
  let highQualityTrades = 0;
  const volumeDistribution = { dead: 0, slow: 0, active: 0, busy: 0, hot: 0 };

  trades.forEach(trade => {
    const margin = trade['Gross Margin'] || 0;
    const volume = trade['Volume'] || 0;

    totalMargin += margin;
    totalVolume += volume;

    // Scam detection (volume = 1)
    if (volume === 1) scamTrades++;

    // Competition (low margin)
    if (margin < 5) lowMarginTrades++;

    // High quality (good margin + volume)
    if (margin >= 10 && volume >= 50) highQualityTrades++;

    // Volume distribution
    if (volume < 5) volumeDistribution.dead++;
    else if (volume < 20) volumeDistribution.slow++;
    else if (volume < 100) volumeDistribution.active++;
    else if (volume < 500) volumeDistribution.busy++;
    else volumeDistribution.hot++;
  });

  const avgMargin = trades.length > 0 ? totalMargin / trades.length : 0;
  const scamPercentage = (scamTrades / trades.length) * 100;
  const competitionLevel = lowMarginTrades / trades.length > 0.5 ? 'high' :
                           lowMarginTrades / trades.length > 0.25 ? 'medium' : 'low';

  // Calculate health score
  let healthScore = 50;

  // Margin contribution (+/- 20)
  if (avgMargin >= 15) healthScore += 20;
  else if (avgMargin >= 10) healthScore += 10;
  else if (avgMargin < 5) healthScore -= 10;

  // Scam rate (-20 if high)
  if (scamPercentage > 30) healthScore -= 20;
  else if (scamPercentage > 15) healthScore -= 10;
  else if (scamPercentage < 5) healthScore += 10;

  // High quality trades (+20)
  const qualityRatio = highQualityTrades / trades.length;
  if (qualityRatio > 0.3) healthScore += 20;
  else if (qualityRatio > 0.15) healthScore += 10;

  // Volume health (+10)
  if (totalVolume > trades.length * 100) healthScore += 10;

  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    healthScore,
    avgMargin,
    totalVolume,
    avgVolume: trades.length > 0 ? totalVolume / trades.length : 0,
    scamPercentage,
    scamCount: scamTrades,
    competitionLevel,
    tradingOpportunities: highQualityTrades,
    volumeDistribution,
    totalTrades: trades.length,
    lowMarginTrades,
  };
}

/**
 * Get health level info based on score
 */
function getHealthLevel(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-400', icon: '💪' };
  if (score >= 60) return { label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-400', icon: '👍' };
  if (score >= 40) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-400', icon: '⚠️' };
  if (score >= 20) return { label: 'Poor', color: 'text-orange-400', bg: 'bg-orange-400', icon: '😟' };
  return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400', icon: '🚨' };
}

export function MarketHealthDashboard({ trades = [], compact = false }) {
  const [, setIsExpanded] = useState(!compact);

  const health = useMemo(() => calculateMarketHealth(trades), [trades]);
  const healthLevel = getHealthLevel(health.healthScore);

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 bg-space-dark/40 rounded-lg cursor-pointer hover:bg-space-dark/60 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <span>{healthLevel.icon}</span>
        <span className={`font-bold ${healthLevel.color}`}>{health.healthScore}</span>
        <span className="text-xs text-text-secondary">Market Health</span>
      </div>
    );
  }

  return (
    <div className="bg-space-dark/40 backdrop-blur-sm border border-accent-cyan/20 rounded-xl p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-accent-cyan">Market Health</h3>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${healthLevel.color}`}>{health.healthScore}</span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${healthLevel.bg}/20 ${healthLevel.color}`}>
            {healthLevel.icon} {healthLevel.label}
          </span>
        </div>
      </div>

      {/* Health bar */}
      <div className="h-3 bg-space-dark rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${healthLevel.bg} transition-all duration-500`}
          style={{ width: `${health.healthScore}%` }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-space-dark/50 rounded-lg">
          <div className="text-lg font-bold text-text-primary">{formatPercent(health.avgMargin / 100, 1)}</div>
          <div className="text-xs text-text-secondary">Avg Margin</div>
        </div>

        <div className="text-center p-3 bg-space-dark/50 rounded-lg">
          <div className={`text-lg font-bold ${health.scamPercentage > 15 ? 'text-red-400' : 'text-text-primary'}`}>
            {formatPercent(health.scamPercentage / 100, 1)}
          </div>
          <div className="text-xs text-text-secondary">Scam Risk</div>
        </div>

        <div className="text-center p-3 bg-space-dark/50 rounded-lg">
          <div className="text-lg font-bold text-green-400">{health.tradingOpportunities}</div>
          <div className="text-xs text-text-secondary">Quality Trades</div>
        </div>

        <div className="text-center p-3 bg-space-dark/50 rounded-lg">
          <div className="text-lg font-bold text-text-primary">{formatNumber(health.avgVolume, 0)}</div>
          <div className="text-xs text-text-secondary">Avg Volume</div>
        </div>
      </div>

      {/* Volume distribution */}
      <div className="mt-4 pt-4 border-t border-accent-cyan/10">
        <div className="text-xs text-text-secondary mb-2">Volume Distribution</div>
        <div className="flex gap-1 h-6">
          {Object.entries(health.volumeDistribution).map(([key, value]) => {
            const percent = health.totalTrades > 0 ? (value / health.totalTrades) * 100 : 0;
            const colors = {
              dead: 'bg-red-500',
              slow: 'bg-orange-400',
              active: 'bg-yellow-400',
              busy: 'bg-green-400',
              hot: 'bg-cyan-400',
            };
            return (
              <div
                key={key}
                className={`${colors[key]} rounded transition-all`}
                style={{ width: `${percent}%` }}
                title={`${key}: ${value} trades (${percent.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>Dead</span>
          <span>Hot</span>
        </div>
      </div>

      {/* Warning if unhealthy */}
      {health.healthScore < 40 && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span>⚠️</span>
            <span>Market conditions are poor. {health.scamPercentage > 15 ? 'High scam activity detected. ' : ''}{health.avgMargin < 8 ? 'Margins are very competitive.' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export { calculateMarketHealth, getHealthLevel };
export default MarketHealthDashboard;
