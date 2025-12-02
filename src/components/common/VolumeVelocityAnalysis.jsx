import { useMemo, useState } from 'react';
import { formatNumber, formatISK } from '../../utils/formatters';

/**
 * VolumeVelocityAnalysis - Analyzes how quickly items sell compared to your order quantity
 * Helps estimate how long it will take to sell your inventory
 */
export function VolumeVelocityAnalysis({
  orders = [],
  marketData = [],
  typeNames = {},
  historicalVolume = {},
  className = '',
}) {
  const [sortBy, setSortBy] = useState('turnover'); // turnover, quantity, value

  // Analyze orders with volume velocity
  const analysis = useMemo(() => {
    if (!orders.length) return { items: [], stats: null };

    const analyzed = orders
      .filter(o => !o.is_buy_order) // Only analyze sell orders
      .map(order => {
        const marketItem = marketData.find(m =>
          (m['Item ID'] || m.itemId) === order.type_id
        );

        // Daily volume from market data or historical
        const dailyVolume = marketItem?.['Volume'] ||
          historicalVolume[order.type_id]?.avgDaily ||
          0;

        // Calculate days to sell at current volume
        const daysToSell = dailyVolume > 0
          ? order.volume_remain / dailyVolume
          : Infinity;

        // Calculate velocity rating
        let velocityRating = 'slow';
        let velocityScore = 0;
        if (daysToSell <= 1) {
          velocityRating = 'instant';
          velocityScore = 100;
        } else if (daysToSell <= 3) {
          velocityRating = 'fast';
          velocityScore = 75;
        } else if (daysToSell <= 7) {
          velocityRating = 'moderate';
          velocityScore = 50;
        } else if (daysToSell <= 30) {
          velocityRating = 'slow';
          velocityScore = 25;
        } else {
          velocityRating = 'stagnant';
          velocityScore = 10;
        }

        // Calculate turnover ratio (volume vs your quantity)
        const turnoverRatio = dailyVolume > 0
          ? dailyVolume / order.volume_remain
          : 0;

        const orderValue = order.price * order.volume_remain;

        return {
          ...order,
          itemName: typeNames[order.type_id] || `Type ${order.type_id}`,
          dailyVolume,
          daysToSell,
          velocityRating,
          velocityScore,
          turnoverRatio,
          orderValue,
        };
      })
      .filter(o => o.dailyVolume > 0); // Only show items with volume data

    // Sort
    const sorted = analyzed.sort((a, b) => {
      if (sortBy === 'turnover') return b.turnoverRatio - a.turnoverRatio;
      if (sortBy === 'quantity') return b.volume_remain - a.volume_remain;
      if (sortBy === 'value') return b.orderValue - a.orderValue;
      return a.daysToSell - b.daysToSell;
    });

    // Calculate summary stats
    const totalValue = sorted.reduce((sum, o) => sum + o.orderValue, 0);
    const avgDaysToSell = sorted.length > 0
      ? sorted.reduce((sum, o) => sum + o.daysToSell, 0) / sorted.length
      : 0;
    const fastMovers = sorted.filter(o => o.daysToSell <= 3).length;
    const slowMovers = sorted.filter(o => o.daysToSell > 7).length;

    return {
      items: sorted,
      stats: {
        totalOrders: sorted.length,
        totalValue,
        avgDaysToSell,
        fastMovers,
        slowMovers,
      },
    };
  }, [orders, marketData, typeNames, historicalVolume, sortBy]);

  if (!analysis.stats || analysis.items.length === 0) return null;

  const { items, stats } = analysis;

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-accent-cyan/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-purple/20 rounded-lg">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-text-primary font-medium">Volume Velocity Analysis</h3>
              <p className="text-xs text-text-secondary">
                Estimated time to sell your inventory
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-lg font-bold text-text-primary">{stats.totalOrders}</div>
            <div className="text-xs text-text-secondary">Items</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-center">
            <div className="text-lg font-bold text-green-400">{stats.fastMovers}</div>
            <div className="text-xs text-text-secondary">Fast (&lt;3d)</div>
          </div>
          <div className="p-3 bg-red-500/10 rounded-lg text-center">
            <div className="text-lg font-bold text-red-400">{stats.slowMovers}</div>
            <div className="text-xs text-text-secondary">Slow (&gt;7d)</div>
          </div>
          <div className="p-3 bg-accent-cyan/10 rounded-lg text-center">
            <div className="text-lg font-bold text-accent-cyan">{stats.avgDaysToSell.toFixed(1)}d</div>
            <div className="text-xs text-text-secondary">Avg. Time</div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-4 py-2 flex items-center gap-2 text-xs border-b border-accent-cyan/10">
        <span className="text-text-secondary">Sort:</span>
        {['turnover', 'quantity', 'value', 'time'].map(option => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-2 py-1 rounded ${
              sortBy === option
                ? 'bg-accent-cyan/20 text-accent-cyan'
                : 'bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
        {items.map(item => (
          <VelocityItemRow key={item.order_id} item={item} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual velocity item row
 */
function VelocityItemRow({ item }) {
  const velocityConfig = {
    instant: { color: 'text-accent-cyan', bg: 'bg-accent-cyan/20', icon: '⚡' },
    fast: { color: 'text-green-400', bg: 'bg-green-500/20', icon: '🚀' },
    moderate: { color: 'text-accent-gold', bg: 'bg-accent-gold/20', icon: '📊' },
    slow: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '🐢' },
    stagnant: { color: 'text-red-400', bg: 'bg-red-500/20', icon: '🧊' },
  };

  const config = velocityConfig[item.velocityRating];

  return (
    <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`w-7 h-7 flex items-center justify-center rounded ${config.bg} text-sm`}>
            {config.icon}
          </span>
          <div className="min-w-0">
            <div className="text-sm text-text-primary truncate">{item.itemName}</div>
            <div className="text-xs text-text-secondary">
              {formatNumber(item.volume_remain, 0)} units @ {formatISK(item.price, true)}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-sm font-medium ${config.color}`}>
            {item.daysToSell === Infinity ? '∞' : `${item.daysToSell.toFixed(1)}d`}
          </div>
          <div className="text-xs text-text-secondary">
            {formatNumber(item.dailyVolume, 0)}/day
          </div>
        </div>
      </div>

      {/* Velocity Bar */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-space-dark rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${config.bg.replace('/20', '')}`}
            style={{ width: `${item.velocityScore}%` }}
          />
        </div>
        <span className={`text-[10px] ${config.color}`}>
          {item.velocityRating}
        </span>
      </div>
    </div>
  );
}

export default VolumeVelocityAnalysis;
