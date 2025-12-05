import { useMemo, useState } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * OrderUpdateReminder - Tracks orders that haven't been updated recently
 * Uses ESI order data to identify stale orders that may need price updates
 */
export function OrderUpdateReminder({
  orders = [],
  typeNames = {},
  marketData = [],
  staleThresholdHours = 4,
  onUpdateOrder,
  onCopyPrice,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sortBy, setSortBy] = useState('staleness'); // staleness, profit, volume

  // Analyze orders for staleness and undercut status
  const analyzedOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const now = new Date();

    return orders.map(order => {
      const issuedDate = new Date(order.issued);
      const hoursSinceIssued = (now - issuedDate) / (1000 * 60 * 60);

      // Find corresponding market data for this item
      const marketItem = marketData.find(m =>
        (m['Item ID'] || m.itemId) === order.type_id
      );

      // For buy orders, compare to highest buy; for sell orders, compare to lowest sell
      let isUndercut = false;
      let competitorPrice = null;
      let priceDiff = 0;
      let recommendedPrice = null;

      if (marketItem) {
        if (order.is_buy_order) {
          // Buy order - compare to highest buy order (Sell Price in our data)
          competitorPrice = marketItem['Sell Price'];
          if (competitorPrice && order.price < competitorPrice) {
            isUndercut = true;
            priceDiff = competitorPrice - order.price;
            recommendedPrice = competitorPrice + 0.01; // Outbid by 0.01 ISK
          }
        } else {
          // Sell order - compare to lowest sell order (Buy Price in our data)
          competitorPrice = marketItem['Buy Price'];
          if (competitorPrice && order.price > competitorPrice) {
            isUndercut = true;
            priceDiff = order.price - competitorPrice;
            recommendedPrice = competitorPrice - 0.01; // Undercut by 0.01 ISK
          }
        }
      }

      // Calculate potential profit if updated
      const potentialProfit = marketItem?.['Net Profit'] || 0;

      return {
        ...order,
        itemName: typeNames[order.type_id] || `Type ${order.type_id}`,
        hoursSinceIssued,
        isStale: hoursSinceIssued >= staleThresholdHours,
        isUndercut,
        competitorPrice,
        priceDiff,
        recommendedPrice,
        potentialProfit,
        urgency: calculateUrgency(hoursSinceIssued, isUndercut, potentialProfit),
      };
    });
  }, [orders, typeNames, marketData, staleThresholdHours]);

  // Filter and sort orders needing attention
  const ordersNeedingAttention = useMemo(() => {
    const filtered = analyzedOrders.filter(o => o.isStale || o.isUndercut);

    return filtered.sort((a, b) => {
      if (sortBy === 'staleness') {
        return b.hoursSinceIssued - a.hoursSinceIssued;
      } else if (sortBy === 'profit') {
        return b.potentialProfit - a.potentialProfit;
      } else if (sortBy === 'volume') {
        return b.volume_remain - a.volume_remain;
      } else {
        return b.urgency - a.urgency;
      }
    });
  }, [analyzedOrders, sortBy]);

  // Summary stats
  const stats = useMemo(() => {
    const staleOrders = analyzedOrders.filter(o => o.isStale);
    const undercutOrders = analyzedOrders.filter(o => o.isUndercut);
    const totalAtRisk = undercutOrders.reduce((sum, o) => sum + (o.price * o.volume_remain), 0);

    return {
      totalOrders: orders.length,
      staleCount: staleOrders.length,
      undercutCount: undercutOrders.length,
      totalAtRisk,
      avgStaleness: staleOrders.length > 0
        ? staleOrders.reduce((sum, o) => sum + o.hoursSinceIssued, 0) / staleOrders.length
        : 0,
    };
  }, [analyzedOrders, orders.length]);

  if (orders.length === 0) return null;

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-gold/20 rounded-lg">
            <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-text-primary font-medium">Order Update Reminder</h3>
            <p className="text-xs text-text-secondary">
              {stats.staleCount} stale, {stats.undercutCount} undercut
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats.undercutCount > 0 && (
            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
              {stats.undercutCount} need attention
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
              <div className="text-lg font-bold text-text-primary">{stats.totalOrders}</div>
              <div className="text-xs text-text-secondary">Total Orders</div>
            </div>
            <div className="p-3 bg-accent-gold/10 rounded-lg text-center">
              <div className="text-lg font-bold text-accent-gold">{stats.staleCount}</div>
              <div className="text-xs text-text-secondary">Stale ({staleThresholdHours}h+)</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg text-center">
              <div className="text-lg font-bold text-red-400">{stats.undercutCount}</div>
              <div className="text-xs text-text-secondary">Undercut</div>
            </div>
            <div className="p-3 bg-accent-cyan/10 rounded-lg text-center">
              <div className="text-lg font-bold text-accent-cyan">{formatISK(stats.totalAtRisk, true)}</div>
              <div className="text-xs text-text-secondary">At Risk</div>
            </div>
          </div>

          {/* Sort Options */}
          {ordersNeedingAttention.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-secondary">Sort by:</span>
              {['urgency', 'staleness', 'profit', 'volume'].map(option => (
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
          )}

          {/* Orders List */}
          {ordersNeedingAttention.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ordersNeedingAttention.map(order => (
                <OrderRow
                  key={order.order_id}
                  order={order}
                  onUpdateOrder={onUpdateOrder}
                  onCopyPrice={onCopyPrice}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-text-secondary">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>All orders are up to date!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual order row component
 */
function OrderRow({ order, onUpdateOrder: _onUpdateOrder, onCopyPrice }) {
  const urgencyColors = {
    critical: 'border-red-500/30 bg-red-500/5',
    high: 'border-accent-gold/30 bg-accent-gold/5',
    medium: 'border-accent-cyan/30 bg-accent-cyan/5',
    low: 'border-white/10 bg-white/5',
  };

  const urgencyLevel = order.urgency >= 80 ? 'critical' : order.urgency >= 60 ? 'high' : order.urgency >= 40 ? 'medium' : 'low';

  return (
    <div className={`p-3 rounded-lg border ${urgencyColors[urgencyLevel]} transition-colors`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 text-[10px] rounded ${
              order.is_buy_order
                ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {order.is_buy_order ? 'BUY' : 'SELL'}
            </span>
            <span className="text-sm text-text-primary font-medium truncate">{order.itemName}</span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
            <span>{formatNumber(order.volume_remain, 0)} units</span>
            <span>@ {formatISK(order.price, false)}</span>
            {order.isStale && (
              <span className="text-accent-gold">
                {Math.floor(order.hoursSinceIssued)}h old
              </span>
            )}
            {order.isUndercut && (
              <span className="text-red-400">
                -{formatISK(order.priceDiff, true)} behind
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {order.recommendedPrice && (
            <button
              onClick={() => onCopyPrice?.(order.recommendedPrice, order.itemName)}
              className="p-2 rounded-lg bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 transition-colors"
              title={`Copy recommended: ${formatISK(order.recommendedPrice, false)}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Recommended Price */}
      {order.recommendedPrice && (
        <div className="mt-2 flex items-center justify-between p-2 bg-space-dark/50 rounded text-xs">
          <span className="text-text-secondary">Recommended:</span>
          <button
            onClick={() => onCopyPrice?.(order.recommendedPrice, order.itemName)}
            className="font-mono text-accent-cyan hover:underline"
          >
            {formatISK(order.recommendedPrice, false)}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Calculate urgency score (0-100) for an order
 */
function calculateUrgency(hoursSinceIssued, isUndercut, potentialProfit) {
  let score = 0;

  // Staleness factor (up to 40 points)
  if (hoursSinceIssued >= 24) score += 40;
  else if (hoursSinceIssued >= 12) score += 30;
  else if (hoursSinceIssued >= 6) score += 20;
  else if (hoursSinceIssued >= 4) score += 10;

  // Undercut factor (up to 40 points)
  if (isUndercut) score += 40;

  // Profit potential factor (up to 20 points)
  if (potentialProfit > 10000000) score += 20;
  else if (potentialProfit > 5000000) score += 15;
  else if (potentialProfit > 1000000) score += 10;
  else if (potentialProfit > 100000) score += 5;

  return Math.min(score, 100);
}

export default OrderUpdateReminder;
