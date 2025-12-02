import { useMemo, useState } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * PriceUndercutAlert - Detects and alerts when your orders are undercut
 * Compares your active orders against current market prices
 */
export function PriceUndercutAlert({
  orders = [],
  marketData = [],
  typeNames = {},
  onCopyPrice,
  onDismiss,
  className = '',
}) {
  const [dismissed, setDismissed] = useState(new Set());

  // Analyze orders for undercut status
  const undercutOrders = useMemo(() => {
    if (!orders.length || !marketData.length) return [];

    return orders
      .map(order => {
        const marketItem = marketData.find(m =>
          (m['Item ID'] || m.itemId) === order.type_id
        );

        if (!marketItem) return null;

        // For buy orders: check if there's a higher buy order
        // For sell orders: check if there's a lower sell order
        const isBuy = order.is_buy_order;
        const marketPrice = isBuy ? marketItem['Sell Price'] : marketItem['Buy Price'];

        if (!marketPrice) return null;

        // Check if undercut
        let isUndercut = false;
        let priceDiff = 0;
        let percentDiff = 0;

        if (isBuy && order.price < marketPrice) {
          isUndercut = true;
          priceDiff = marketPrice - order.price;
          percentDiff = (priceDiff / order.price) * 100;
        } else if (!isBuy && order.price > marketPrice) {
          isUndercut = true;
          priceDiff = order.price - marketPrice;
          percentDiff = (priceDiff / order.price) * 100;
        }

        if (!isUndercut) return null;

        // Calculate recommended price (beat by 0.01 ISK)
        const recommendedPrice = isBuy
          ? marketPrice + 0.01
          : marketPrice - 0.01;

        // Calculate potential loss if not updated
        const potentialLoss = priceDiff * order.volume_remain;

        return {
          ...order,
          itemName: typeNames[order.type_id] || `Type ${order.type_id}`,
          marketPrice,
          priceDiff,
          percentDiff,
          recommendedPrice,
          potentialLoss,
          severity: percentDiff > 5 ? 'critical' : percentDiff > 2 ? 'high' : 'medium',
        };
      })
      .filter(o => o !== null && !dismissed.has(o.order_id))
      .sort((a, b) => b.potentialLoss - a.potentialLoss);
  }, [orders, marketData, typeNames, dismissed]);

  // Total potential loss
  const totalPotentialLoss = useMemo(() =>
    undercutOrders.reduce((sum, o) => sum + o.potentialLoss, 0),
    [undercutOrders]
  );

  const handleDismiss = (orderId) => {
    setDismissed(prev => new Set([...prev, orderId]));
    onDismiss?.(orderId);
  };

  const handleDismissAll = () => {
    const allIds = undercutOrders.map(o => o.order_id);
    setDismissed(prev => new Set([...prev, ...allIds]));
    onDismiss?.('all');
  };

  if (undercutOrders.length === 0) return null;

  return (
    <div className={`bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-400 font-medium">Price Undercut Alert</h3>
            <p className="text-xs text-text-secondary">
              {undercutOrders.length} order{undercutOrders.length !== 1 ? 's' : ''} need attention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-red-400 font-medium">
            -{formatISK(totalPotentialLoss, true)} at risk
          </span>
          <button
            onClick={handleDismissAll}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            Dismiss All
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
        {undercutOrders.map(order => (
          <UndercutOrderCard
            key={order.order_id}
            order={order}
            onCopyPrice={onCopyPrice}
            onDismiss={() => handleDismiss(order.order_id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual undercut order card
 */
function UndercutOrderCard({ order, onCopyPrice, onDismiss }) {
  const severityColors = {
    critical: 'border-red-500/50 bg-red-500/10',
    high: 'border-orange-500/50 bg-orange-500/10',
    medium: 'border-yellow-500/50 bg-yellow-500/10',
  };

  return (
    <div className={`p-3 rounded-lg border ${severityColors[order.severity]} transition-all`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 text-[10px] rounded ${
              order.is_buy_order
                ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {order.is_buy_order ? 'BUY' : 'SELL'}
            </span>
            <span className="text-sm text-text-primary font-medium truncate">
              {order.itemName}
            </span>
            {order.severity === 'critical' && (
              <span className="px-1.5 py-0.5 text-[10px] bg-red-500/30 text-red-300 rounded animate-pulse">
                URGENT
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-text-secondary">Your Price:</span>
              <span className="ml-1 text-text-primary font-mono">{formatISK(order.price, false)}</span>
            </div>
            <div>
              <span className="text-text-secondary">Market:</span>
              <span className="ml-1 text-red-400 font-mono">{formatISK(order.marketPrice, false)}</span>
            </div>
            <div>
              <span className="text-text-secondary">Difference:</span>
              <span className="ml-1 text-red-400">
                {formatISK(order.priceDiff, true)} ({formatPercent(order.percentDiff / 100, 1)})
              </span>
            </div>
            <div>
              <span className="text-text-secondary">Potential Loss:</span>
              <span className="ml-1 text-red-400">{formatISK(order.potentialLoss, true)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-text-secondary hover:text-text-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Recommended Price Action */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onCopyPrice?.(order.recommendedPrice, order.itemName)}
          className="flex-1 flex items-center justify-center gap-2 p-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy: {formatISK(order.recommendedPrice, false)}
        </button>
      </div>
    </div>
  );
}

export default PriceUndercutAlert;
