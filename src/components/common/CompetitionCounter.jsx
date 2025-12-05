import { useMemo, useState } from 'react';
// formatISK, formatNumber available from '../../utils/formatters' if needed

/**
 * CompetitionCounter - Counts and analyzes competition on your traded items
 * Shows how many competitors are trading the same items
 */
export function CompetitionCounter({
  orders = [],
  marketOrders = {},
  typeNames = {},
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // summary, details

  // Analyze competition for each item
  const competitionAnalysis = useMemo(() => {
    if (!orders.length) return { items: [], stats: null };

    const analyzed = orders.map(order => {
      const itemId = order.type_id;
      const itemOrders = marketOrders[itemId] || { buy: [], sell: [] };

      // Count competitors (orders from other players)
      const buyCompetitors = itemOrders.buy?.filter(o => o.order_id !== order.order_id).length || 0;
      const sellCompetitors = itemOrders.sell?.filter(o => o.order_id !== order.order_id).length || 0;

      const totalCompetitors = order.is_buy_order ? buyCompetitors : sellCompetitors;

      // Calculate your position in the market
      const relevantOrders = order.is_buy_order ? itemOrders.buy : itemOrders.sell;
      const yourPosition = relevantOrders?.findIndex(o => o.order_id === order.order_id) + 1 || 0;

      // Competition level
      let competitionLevel = 'low';
      if (totalCompetitors >= 20) competitionLevel = 'extreme';
      else if (totalCompetitors >= 10) competitionLevel = 'high';
      else if (totalCompetitors >= 5) competitionLevel = 'medium';

      // Calculate total market volume for this item
      const totalMarketVolume = relevantOrders?.reduce((sum, o) => sum + o.volume_remain, 0) || 0;
      const yourShare = totalMarketVolume > 0 ? (order.volume_remain / totalMarketVolume) * 100 : 0;

      return {
        ...order,
        itemName: typeNames[itemId] || `Type ${itemId}`,
        buyCompetitors,
        sellCompetitors,
        totalCompetitors,
        competitionLevel,
        yourPosition,
        totalMarketVolume,
        yourShare,
      };
    });

    // Sort by competition level
    const sorted = analyzed.sort((a, b) => b.totalCompetitors - a.totalCompetitors);

    // Calculate summary stats
    const avgCompetitors = sorted.length > 0
      ? sorted.reduce((sum, o) => sum + o.totalCompetitors, 0) / sorted.length
      : 0;
    const highCompetition = sorted.filter(o => o.competitionLevel === 'high' || o.competitionLevel === 'extreme').length;
    const lowCompetition = sorted.filter(o => o.competitionLevel === 'low').length;

    return {
      items: sorted,
      stats: {
        totalItems: sorted.length,
        avgCompetitors: Math.round(avgCompetitors),
        highCompetition,
        lowCompetition,
      },
    };
  }, [orders, marketOrders, typeNames]);

  if (!competitionAnalysis.stats) return null;

  const { items, stats } = competitionAnalysis;

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-pink/20 rounded-lg">
            <svg className="w-5 h-5 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-text-primary font-medium">Competition Analysis</h3>
            <p className="text-xs text-text-secondary">
              Avg. {stats.avgCompetitors} competitors per item
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats.highCompetition > 0 && (
            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
              {stats.highCompetition} crowded
            </span>
          )}
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-lg font-bold text-text-primary">{stats.totalItems}</div>
              <div className="text-xs text-text-secondary">Items Trading</div>
            </div>
            <div className="p-3 bg-accent-cyan/10 rounded-lg text-center">
              <div className="text-lg font-bold text-accent-cyan">{stats.avgCompetitors}</div>
              <div className="text-xs text-text-secondary">Avg. Competition</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <div className="text-lg font-bold text-green-400">{stats.lowCompetition}</div>
              <div className="text-xs text-text-secondary">Low Competition</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-center">
              <div className="text-lg font-bold text-red-400">{stats.highCompetition}</div>
              <div className="text-xs text-text-secondary">High Competition</div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'summary'
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'details'
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Details
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map(item => (
              <CompetitionItemRow key={item.order_id} item={item} viewMode={viewMode} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual competition item row
 */
function CompetitionItemRow({ item, viewMode }) {
  const levelConfig = {
    low: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Low' },
    medium: { color: 'text-accent-gold', bg: 'bg-accent-gold/20', label: 'Medium' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'High' },
    extreme: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Extreme' },
  };

  const config = levelConfig[item.competitionLevel];

  return (
    <div className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`px-1.5 py-0.5 text-[10px] rounded ${
            item.is_buy_order
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {item.is_buy_order ? 'BUY' : 'SELL'}
          </span>
          <span className="text-sm text-text-primary truncate">{item.itemName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs rounded ${config.bg} ${config.color}`}>
            {item.totalCompetitors} rivals
          </span>
        </div>
      </div>

      {viewMode === 'details' && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-space-dark/50 rounded text-center">
            <div className="text-text-primary font-medium">#{item.yourPosition || '?'}</div>
            <div className="text-text-secondary text-[10px]">Position</div>
          </div>
          <div className="p-2 bg-space-dark/50 rounded text-center">
            <div className="text-text-primary font-medium">{item.yourShare.toFixed(1)}%</div>
            <div className="text-text-secondary text-[10px]">Market Share</div>
          </div>
          <div className="p-2 bg-space-dark/50 rounded text-center">
            <div className={`font-medium ${config.color}`}>{config.label}</div>
            <div className="text-text-secondary text-[10px]">Competition</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompetitionCounter;
