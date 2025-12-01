import { useMemo } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * Calculate a recommendation score for a trade
 * Higher scores indicate better trading opportunities
 *
 * Score factors:
 * - Net Profit (normalized): Base profitability
 * - Volume (log normalized): Ensures liquidity
 * - Gross Margin (normalized): Risk/reward ratio
 */
function calculateScore(trade, stats) {
  const { maxProfit, maxVolume, maxMargin } = stats;

  // Normalize each factor to 0-1 range
  const profitScore = maxProfit > 0 ? (trade['Net Profit'] / maxProfit) : 0;
  const volumeScore = maxVolume > 0 ? Math.log10(trade['Volume'] + 1) / Math.log10(maxVolume + 1) : 0;
  const marginScore = maxMargin > 0 ? (trade['Gross Margin'] / maxMargin) : 0;

  // Weighted combination: profit matters most, then volume, then margin
  // Weights: Profit 50%, Volume 30%, Margin 20%
  const score = (profitScore * 0.5) + (volumeScore * 0.3) + (marginScore * 0.2);

  return score;
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
 * TopRecommendations Component
 * Displays the top 10 recommended trades based on a composite score
 */
export function TopRecommendations({ data, onItemClick, maxItems = 10 }) {
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
  const recommendations = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map(trade => ({
        ...trade,
        score: calculateScore(trade, stats),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems);
  }, [data, stats, maxItems]);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-accent-cyan font-display">
          Top {Math.min(maxItems, recommendations.length)} Recommendations
        </h2>
        <span className="text-xs text-text-secondary bg-space-dark/50 px-2 py-1 rounded">
          Based on profit, volume & margin
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {recommendations.map((trade, index) => {
          const tier = getTier(index + 1);
          const margin = trade['Gross Margin'] / 100;

          return (
            <div
              key={trade['Item ID'] || index}
              onClick={() => onItemClick?.(trade)}
              className={`
                relative overflow-hidden rounded-lg border cursor-pointer
                transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
                ${tier.bg} ${tier.border}
              `}
            >
              {/* Rank Badge */}
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${tier.bg} ${tier.color}`}>
                {index + 1}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Item Name */}
                <h3 className="font-medium text-text-primary text-sm mb-2 pr-8 line-clamp-2">
                  {trade['Item']}
                </h3>

                {/* Tier Label */}
                <span className={`inline-block text-xs font-semibold ${tier.color} mb-3`}>
                  {tier.label}
                </span>

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
                    <span className="font-mono text-text-primary">
                      {formatNumber(trade['Volume'], 0)}
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

                {/* Score Bar */}
                <div className="mt-3 pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-text-secondary">Score</span>
                    <span className={`font-mono ${tier.color}`}>
                      {(trade.score * 100).toFixed(0)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-space-dark/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        index < 3 ? 'bg-yellow-400' : index < 6 ? 'bg-green-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${trade.score * 100}%` }}
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
