import { useMemo } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * TradingStats Component
 * Displays summary statistics for trading results
 */
export function TradingStats({ data }) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const profits = data.map(t => t['Net Profit'] || 0);
    const volumes = data.map(t => t['Volume'] || 0);
    const margins = data.map(t => (t['Gross Margin'] || 0) / 100);

    const sum = arr => arr.reduce((a, b) => a + b, 0);
    const avg = arr => arr.length > 0 ? sum(arr) / arr.length : 0;
    const median = arr => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    return {
      totalOpportunities: data.length,
      totalProfit: sum(profits),
      avgProfit: avg(profits),
      medianProfit: median(profits),
      maxProfit: Math.max(...profits),
      avgMargin: avg(margins),
      totalVolume: sum(volumes),
      highMarginCount: margins.filter(m => m >= 0.15).length,
    };
  }, [data]);

  if (!stats) return null;

  const statCards = [
    {
      label: 'Opportunities',
      value: formatNumber(stats.totalOpportunities, 0),
      subValue: `${stats.highMarginCount} high margin (>15%)`,
      icon: '📊',
      color: 'text-cyan-400',
    },
    {
      label: 'Total Potential',
      value: formatISK(stats.totalProfit, false),
      subValue: `Max: ${formatISK(stats.maxProfit, false)}`,
      icon: '💰',
      color: 'text-green-400',
    },
    {
      label: 'Avg Profit',
      value: formatISK(stats.avgProfit, false),
      subValue: `Median: ${formatISK(stats.medianProfit, false)}`,
      icon: '📈',
      color: 'text-yellow-400',
    },
    {
      label: 'Avg Margin',
      value: formatPercent(stats.avgMargin, 1),
      subValue: `Vol: ${formatNumber(stats.totalVolume, 0)} units`,
      icon: '📉',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-space-dark/30 border border-accent-cyan/10 rounded-lg p-4 hover:border-accent-cyan/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-text-secondary text-xs uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-lg opacity-60">{stat.icon}</span>
            </div>
            <div className={`text-xl font-bold font-mono ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-text-secondary/70">
              {stat.subValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TradingStats;
