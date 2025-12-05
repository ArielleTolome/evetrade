import { useMemo } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * At-A-Glance Trading Dashboard
 * Shows key trading metrics and top opportunities at a single glance
 */
export function TradingDashboard({
  data = [],
  onItemClick,
  walletBalance = null,
  className = ''
}) {
  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalTrades: 0,
        avgMargin: 0,
        totalPotentialProfit: 0,
        highQualityCount: 0,
        topOpportunities: [],
        profitByCategory: {},
        bestROI: null,
        quickFlips: [],
        bigTickets: [],
      };
    }

    // Calculate averages and totals
    const totalMargin = data.reduce((sum, t) => sum + (t['Gross Margin'] || 0), 0);
    const totalProfit = data.reduce((sum, t) => sum + (t['Net Profit'] || 0), 0);

    // High quality: >10% margin, >1M profit, >100 volume
    const highQuality = data.filter(t =>
      (t['Gross Margin'] || 0) > 10 &&
      (t['Net Profit'] || 0) > 1000000 &&
      (t['Volume'] || 0) > 100
    );

    // Sort by different criteria
    const byProfit = [...data].sort((a, b) => (b['Net Profit'] || 0) - (a['Net Profit'] || 0));
    const _byMargin = [...data].sort((a, b) => (b['Gross Margin'] || 0) - (a['Gross Margin'] || 0));
    const _byVolume = [...data].sort((a, b) => (b['Volume'] || 0) - (a['Volume'] || 0));

    // Quick flips: high volume, decent margin
    const quickFlips = data
      .filter(t => (t['Volume'] || 0) > 500 && (t['Gross Margin'] || 0) > 5)
      .sort((a, b) => (b['Volume'] || 0) - (a['Volume'] || 0))
      .slice(0, 3);

    // Big tickets: highest profit potential
    const bigTickets = byProfit.slice(0, 3);

    // Calculate ROI (profit relative to buy price)
    const withROI = data.map(t => ({
      ...t,
      roi: t['Buy Price'] > 0 ? (t['Profit per Unit'] || 0) / t['Buy Price'] * 100 : 0
    }));
    const bestROI = withROI.sort((a, b) => b.roi - a.roi)[0];

    return {
      totalTrades: data.length,
      avgMargin: data.length > 0 ? totalMargin / data.length : 0,
      totalPotentialProfit: totalProfit,
      highQualityCount: highQuality.length,
      topOpportunities: byProfit.slice(0, 5),
      bestROI,
      quickFlips,
      bigTickets,
    };
  }, [data]);

  // Calculate what percentage of wallet the total profit represents
  const profitPercentOfWallet = useMemo(() => {
    if (!walletBalance || walletBalance === 0) return null;
    return (metrics.totalPotentialProfit / walletBalance) * 100;
  }, [walletBalance, metrics.totalPotentialProfit]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Trades */}
        <div className="bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 border border-accent-cyan/30 rounded-xl p-4">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-accent-cyan">{metrics.totalTrades}</div>
          <div className="text-xs text-text-secondary mt-1">
            <span className="text-green-400">{metrics.highQualityCount}</span> high quality
          </div>
        </div>

        {/* Average Margin */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Avg Margin</div>
          <div className="text-2xl font-bold text-green-400">{formatPercent(metrics.avgMargin / 100, 1)}</div>
          <div className="text-xs text-text-secondary mt-1">across all trades</div>
        </div>

        {/* Total Potential Profit */}
        <div className="bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 border border-accent-gold/30 rounded-xl p-4">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Total Potential</div>
          <div className="text-2xl font-bold text-accent-gold">{formatISK(metrics.totalPotentialProfit, true)}</div>
          {profitPercentOfWallet && (
            <div className="text-xs text-text-secondary mt-1">
              <span className="text-accent-gold">{formatPercent(profitPercentOfWallet / 100, 0)}</span> of wallet
            </div>
          )}
        </div>

        {/* Best ROI */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-4">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Best ROI</div>
          {metrics.bestROI ? (
            <>
              <div className="text-2xl font-bold text-purple-400">{formatPercent(metrics.bestROI.roi / 100, 1)}</div>
              <div className="text-xs text-text-secondary mt-1 truncate" title={metrics.bestROI.Item}>
                {metrics.bestROI.Item}
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold text-text-secondary">-</div>
          )}
        </div>
      </div>

      {/* Opportunity Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Flips - High volume, fast turnover */}
        <div className="bg-space-dark/50 border border-accent-cyan/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Quick Flips</h3>
              <p className="text-xs text-text-secondary">High volume, fast turnover</p>
            </div>
          </div>

          <div className="space-y-2">
            {metrics.quickFlips.length > 0 ? metrics.quickFlips.map((trade, idx) => (
              <button
                key={trade['Item ID'] || idx}
                onClick={() => onItemClick?.(trade)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{trade.Item}</div>
                  <div className="text-xs text-text-secondary">
                    Vol: {formatNumber(trade.Volume || 0, 0)} | Margin: {formatPercent((trade['Gross Margin'] || 0) / 100, 1)}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-medium text-green-400">{formatISK(trade['Net Profit'] || 0, true)}</div>
                </div>
              </button>
            )) : (
              <div className="text-center py-4 text-text-secondary text-sm">No quick flip opportunities</div>
            )}
          </div>
        </div>

        {/* Big Tickets - Highest profit potential */}
        <div className="bg-space-dark/50 border border-accent-cyan/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Big Tickets</h3>
              <p className="text-xs text-text-secondary">Highest profit potential</p>
            </div>
          </div>

          <div className="space-y-2">
            {metrics.bigTickets.length > 0 ? metrics.bigTickets.map((trade, idx) => (
              <button
                key={trade['Item ID'] || idx}
                onClick={() => onItemClick?.(trade)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{trade.Item}</div>
                  <div className="text-xs text-text-secondary">
                    Buy: {formatISK(trade['Buy Price'] || 0, true)} | Margin: {formatPercent((trade['Gross Margin'] || 0) / 100, 1)}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold text-accent-gold">{formatISK(trade['Net Profit'] || 0, true)}</div>
                </div>
              </button>
            )) : (
              <div className="text-center py-4 text-text-secondary text-sm">No big ticket opportunities</div>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Recommendations with Visual Score */}
      <div className="bg-space-dark/50 border border-accent-cyan/20 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Top Recommendations</h3>
              <p className="text-xs text-text-secondary">Best overall opportunities</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {metrics.topOpportunities.map((trade, idx) => {
            // Calculate opportunity score (0-100)
            const marginScore = Math.min((trade['Gross Margin'] || 0) / 30 * 100, 100);
            const volumeScore = Math.min((trade['Volume'] || 0) / 1000 * 100, 100);
            const profitScore = Math.min((trade['Net Profit'] || 0) / 10000000 * 100, 100);
            const overallScore = (marginScore * 0.3 + volumeScore * 0.3 + profitScore * 0.4);

            return (
              <button
                key={trade['Item ID'] || idx}
                onClick={() => onItemClick?.(trade)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left group"
              >
                {/* Rank Badge */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${idx === 0 ? 'bg-accent-gold/30 text-accent-gold' :
                    idx === 1 ? 'bg-gray-400/30 text-gray-300' :
                    idx === 2 ? 'bg-amber-600/30 text-amber-500' :
                    'bg-white/10 text-text-secondary'}
                `}>
                  {idx + 1}
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-cyan transition-colors">
                    {trade.Item}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-secondary">
                      <span className="text-green-400">{formatPercent((trade['Gross Margin'] || 0) / 100, 1)}</span> margin
                    </span>
                    <span className="text-xs text-text-secondary">
                      <span className="text-blue-400">{formatNumber(trade['Volume'] || 0, 0)}</span> vol
                    </span>
                  </div>
                </div>

                {/* Score Indicator */}
                <div className="flex flex-col items-end gap-1">
                  <div className="text-lg font-bold text-accent-gold">{formatISK(trade['Net Profit'] || 0, true)}</div>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-space-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          overallScore >= 70 ? 'bg-green-400' :
                          overallScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${overallScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-secondary w-8">{Math.round(overallScore)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TradingDashboard;
