import { useMemo, useState } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * Get volume multiplier based on volume tier
 * Heavily penalizes low volume trades
 */
function getVolumeMultiplier(volume) {
  if (volume === 1) return 0.1; // 90% penalty
  if (volume <= 5) return 0.3; // 70% penalty
  if (volume <= 20) return 0.6; // 40% penalty
  if (volume <= 50) return 0.8; // 20% penalty
  return 1.0; // No penalty
}

/**
 * Get volume tier information
 */
function getVolumeTier(volume) {
  if (volume === 1) return { label: 'Very Low', color: 'text-red-400', icon: '⚠️' };
  if (volume <= 5) return { label: 'Low', color: 'text-orange-400', icon: '⚡' };
  if (volume <= 20) return { label: 'Medium', color: 'text-yellow-400', icon: '📊' };
  if (volume <= 50) return { label: 'Good', color: 'text-green-400', icon: '✓' };
  return { label: 'Excellent', color: 'text-cyan-400', icon: '⭐' };
}

/**
 * Calculate safety score (1-5) based on volume, margin, and price stability
 */
function calculateSafetyScore(trade) {
  let score = 5;

  const volume = trade['Volume'] || 0;
  const margin = trade['Gross Margin'] || 0;

  // Volume analysis (most important)
  if (volume === 1) score -= 3; // Very dangerous
  else if (volume <= 5) score -= 2;
  else if (volume <= 20) score -= 1;

  // Margin reasonableness (too high = suspicious, too low = risky)
  if (margin > 80) score -= 1.5; // Suspiciously high margin
  else if (margin > 60) score -= 0.5;
  else if (margin < 5) score -= 1; // Too thin margin

  // Price reasonableness check
  const buyPrice = trade['Buy Price'] || 0;
  const sellPrice = trade['Sell Price'] || 0;
  if (buyPrice > 0 && sellPrice > 0) {
    const priceRatio = sellPrice / buyPrice;
    if (priceRatio > 3) score -= 1; // Extreme price difference
  }

  return Math.max(1, Math.min(5, score));
}

/**
 * Check if trade has scam indicators
 */
function isScamAlert(trade) {
  const volume = trade['Volume'] || 0;
  const margin = trade['Gross Margin'] || 0;

  return volume === 1 || (volume <= 3 && margin > 70);
}

/**
 * Calculate a recommendation score for a trade
 * Higher scores indicate better trading opportunities
 *
 * New scoring formula:
 * baseScore = (profitScore * 0.3) + (volumeScore * 0.4) + (marginScore * 0.2) + (safetyScore * 0.1)
 * finalScore = baseScore * volumeMultiplier
 */
function calculateScore(trade, stats) {
  const { maxProfit, maxVolume, maxMargin } = stats;
  const volume = trade['Volume'] || 0;

  // Normalize each factor to 0-1 range
  const profitScore = maxProfit > 0 ? (trade['Net Profit'] / maxProfit) : 0;
  const volumeScore = maxVolume > 0 ? Math.log10(volume + 1) / Math.log10(maxVolume + 1) : 0;
  const marginScore = maxMargin > 0 ? (trade['Gross Margin'] / maxMargin) : 0;
  const safetyScore = calculateSafetyScore(trade) / 5; // Normalize to 0-1

  // Weighted combination: Volume is now most important (40%), then Profit (30%), Margin (20%), Safety (10%)
  const baseScore = (profitScore * 0.3) + (volumeScore * 0.4) + (marginScore * 0.2) + (safetyScore * 0.1);

  // Apply volume multiplier penalty
  const volumeMultiplier = getVolumeMultiplier(volume);
  const finalScore = baseScore * volumeMultiplier;

  return {
    finalScore,
    baseScore,
    profitScore,
    volumeScore,
    marginScore,
    safetyScore: calculateSafetyScore(trade),
    volumeMultiplier
  };
}

/**
 * Get the tier label and color for a recommendation
 */
function getTier(rank) {
  if (rank <= 3) return { label: 'Top Pick', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50' };
  if (rank <= 6) return { label: 'Great', color: 'text-green-400', bg: 'bg-green-400/15', border: 'border-green-400/40' };
  return { label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' };
}

/**
 * Get sort function based on sort mode
 */
function getSortFunction(sortBy) {
  switch (sortBy) {
    case 'safety':
      return (a, b) => b.scoreData.safetyScore - a.scoreData.safetyScore;
    case 'profit':
      return (a, b) => b['Net Profit'] - a['Net Profit'];
    case 'volume':
      return (a, b) => b['Volume'] - a['Volume'];
    case 'score':
    default:
      return (a, b) => b.scoreData.finalScore - a.scoreData.finalScore;
  }
}

/**
 * TopRecommendations Component
 * Displays the top 10 recommended trades based on a composite score
 */
export function TopRecommendations({ data, onItemClick, maxItems = 10 }) {
  const [sortBy, setSortBy] = useState('score');
  const [showTooltip, setShowTooltip] = useState(null);

  // Calculate stats for normalization
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { maxProfit: 0, maxVolume: 0, maxMargin: 0 };

    // Extract values with defaults, handling empty arrays safely
    const profits = data.map(t => t['Net Profit'] || 0);
    const volumes = data.map(t => t['Volume'] || 0);
    const margins = data.map(t => t['Gross Margin'] || 0);

    return {
      maxProfit: profits.length > 0 ? Math.max(...profits) : 0,
      maxVolume: volumes.length > 0 ? Math.max(...volumes) : 0,
      maxMargin: margins.length > 0 ? Math.max(...margins) : 0,
    };
  }, [data]);

  // Calculate scores and get top items
  // Filter out volume=1 trades as they're almost certainly scams
  const recommendations = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .filter(trade => (trade['Volume'] || 0) > 1) // Exclude volume=1 scam trades
      .map(trade => ({
        ...trade,
        scoreData: calculateScore(trade, stats),
      }))
      .sort(getSortFunction(sortBy))
      .slice(0, maxItems);
  }, [data, stats, maxItems, sortBy]);

  // Calculate scam warning metrics
  const scamMetrics = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return { count: 0, percentage: 0 };

    const scamCount = recommendations.filter(trade => isScamAlert(trade)).length;
    return {
      count: scamCount,
      percentage: (scamCount / recommendations.length) * 100
    };
  }, [recommendations]);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Scam Warning Banner */}
      {scamMetrics.count > 0 && scamMetrics.percentage >= 30 && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-semibold mb-1">High Risk Alert</h3>
              <p className="text-sm text-text-secondary">
                {scamMetrics.count} of {recommendations.length} recommendations ({scamMetrics.percentage.toFixed(0)}%)
                have potential scam indicators (very low volume or suspicious margins).
                Exercise extreme caution and verify trades carefully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Sorting */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-accent-cyan font-display">
            Top {Math.min(maxItems, recommendations.length)} Recommendations
          </h2>
          <span className="text-xs text-text-secondary bg-space-dark/50 px-2 py-1 rounded">
            Volume-weighted scoring
          </span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Sort by:</span>
          <div className="flex gap-1 bg-space-dark/50 rounded p-1">
            {[
              { value: 'score', label: 'Score' },
              { value: 'safety', label: 'Safety' },
              { value: 'profit', label: 'Profit' },
              { value: 'volume', label: 'Volume' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`
                  px-2 py-1 text-xs rounded transition-colors
                  ${sortBy === option.value
                    ? 'bg-accent-cyan text-space-dark font-semibold'
                    : 'text-text-secondary hover:text-text-primary'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {recommendations.map((trade, index) => {
          const tier = getTier(index + 1);
          const margin = trade['Gross Margin'] / 100;
          const volume = trade['Volume'] || 0;
          const volumeTier = getVolumeTier(volume);
          const isScam = isScamAlert(trade);
          const scoreData = trade.scoreData;
          const safetyScore = scoreData.safetyScore;

          return (
            <div
              key={trade['Item ID'] || index}
              className={`
                relative overflow-hidden rounded-lg border cursor-pointer
                transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
                ${tier.bg} ${tier.border}
                ${isScam ? 'ring-2 ring-red-500/50' : ''}
              `}
            >
              {/* Scam Alert Badge */}
              {isScam && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded z-10 animate-pulse">
                  SCAM ALERT
                </div>
              )}

              {/* Rank Badge */}
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${tier.bg} ${tier.color}`}>
                {index + 1}
              </div>

              {/* Content */}
              <div className="p-4" onClick={() => onItemClick?.(trade)}>
                {/* Item Name */}
                <h3 className={`font-medium text-text-primary text-sm mb-2 ${isScam ? 'mt-6' : ''} pr-8 line-clamp-2`}>
                  {trade['Item']}
                </h3>

                {/* Tier and Volume Badges */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className={`inline-block text-xs font-semibold ${tier.color}`}>
                    {tier.label}
                  </span>
                  <span className={`inline-block text-xs font-semibold ${volumeTier.color}`}>
                    {volumeTier.icon} {volumeTier.label} Vol
                  </span>
                </div>

                {/* Safety Score Stars */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Safety:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={star <= safetyScore ? 'text-yellow-400' : 'text-gray-600'}>
                        {star <= safetyScore ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Net Profit</span>
                    <span className="font-mono text-green-400 font-medium">
                      {formatISK(trade['Net Profit'], false)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Volume</span>
                    <span className={`font-mono ${volumeTier.color} font-medium`}>
                      {formatNumber(volume, 0)}
                      {scoreData.volumeMultiplier < 1 && (
                        <span className="ml-1 text-red-400">
                          (-{((1 - scoreData.volumeMultiplier) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Margin</span>
                    <span className={`font-mono ${margin >= 0.2 ? 'text-yellow-400' : margin >= 0.1 ? 'text-green-400' : 'text-text-primary'}`}>
                      {formatPercent(margin, 1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Profit/Unit</span>
                    <span className="font-mono text-cyan-400">
                      {formatISK(trade['Profit per Unit'], false)}
                    </span>
                  </div>
                </div>

                {/* Score Bar with Tooltip */}
                <div className="mt-3 pt-2 border-t border-white/10 relative">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-text-secondary">Score</span>
                      <button
                        onMouseEnter={() => setShowTooltip(trade['Item ID'] || index)}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="text-text-secondary hover:text-accent-cyan"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTooltip(showTooltip === (trade['Item ID'] || index) ? null : (trade['Item ID'] || index));
                        }}
                      >
                        ℹ️
                      </button>
                    </div>
                    <span className={`font-mono ${tier.color}`}>
                      {(scoreData.finalScore * 100).toFixed(0)}
                    </span>
                  </div>

                  {/* Score Tooltip */}
                  {showTooltip === (trade['Item ID'] || index) && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-space-dark border border-accent-cyan/30 rounded p-2 text-xs z-20 shadow-lg">
                      <div className="font-semibold text-accent-cyan mb-1">Score Breakdown:</div>
                      <div className="space-y-0.5 text-text-secondary">
                        <div>Profit: {(scoreData.profitScore * 30).toFixed(1)}% (weight: 30%)</div>
                        <div>Volume: {(scoreData.volumeScore * 40).toFixed(1)}% (weight: 40%)</div>
                        <div>Margin: {(scoreData.marginScore * 20).toFixed(1)}% (weight: 20%)</div>
                        <div>Safety: {(scoreData.safetyScore * 2).toFixed(1)}% (weight: 10%)</div>
                        <div className="pt-1 border-t border-white/10">
                          Base Score: {(scoreData.baseScore * 100).toFixed(0)}
                        </div>
                        <div className={scoreData.volumeMultiplier < 1 ? 'text-red-400' : ''}>
                          Volume Penalty: {(scoreData.volumeMultiplier * 100).toFixed(0)}%
                        </div>
                        <div className="font-semibold text-accent-cyan">
                          Final: {(scoreData.finalScore * 100).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-1.5 bg-space-dark/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index < 3 ? 'bg-yellow-400' : index < 6 ? 'bg-green-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${scoreData.finalScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopRecommendations;
