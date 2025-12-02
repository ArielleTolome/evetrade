import { useMemo, useState, useCallback } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * OrderUpdatePriorityQueue - Prioritizes which orders to update first
 * Based on profit potential, competition, and urgency
 */
export function OrderUpdatePriorityQueue({
  orders = [],
  marketData = [],
  typeNames = {},
  onCopyPrice,
  onOrderComplete,
  className = '',
}) {
  const [completedOrders, setCompletedOrders] = useState(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  // Calculate priority for each order
  const prioritizedOrders = useMemo(() => {
    if (!orders.length) return [];

    const analyzed = orders.map(order => {
      const marketItem = marketData.find(m =>
        (m['Item ID'] || m.itemId) === order.type_id
      );

      const itemName = typeNames[order.type_id] || `Type ${order.type_id}`;

      // Calculate various factors
      const orderValue = order.is_buy_order
        ? order.escrow || 0
        : order.price * order.volume_remain;

      // Check if undercut
      let isUndercut = false;
      let priceDiff = 0;
      let recommendedPrice = order.price;

      if (marketItem) {
        if (order.is_buy_order) {
          const marketPrice = marketItem['Sell Price']; // Highest buy
          if (marketPrice && order.price < marketPrice) {
            isUndercut = true;
            priceDiff = marketPrice - order.price;
            recommendedPrice = marketPrice + 0.01;
          }
        } else {
          const marketPrice = marketItem['Buy Price']; // Lowest sell
          if (marketPrice && order.price > marketPrice) {
            isUndercut = true;
            priceDiff = order.price - marketPrice;
            recommendedPrice = marketPrice - 0.01;
          }
        }
      }

      // Calculate time since last update
      const lastUpdated = new Date(order.issued);
      const hoursSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60);

      // Potential profit if order fills
      const profitPotential = marketItem
        ? (marketItem['Net Profit'] || 0) * (order.volume_remain / (marketItem['Volume'] || 1))
        : 0;

      // Calculate priority score (higher = update first)
      let priority = 0;

      // Factor 1: Undercut status (50 points max)
      if (isUndercut) {
        priority += 50;
        // Extra points for larger price differences
        if (priceDiff > orderValue * 0.05) priority += 20;
      }

      // Factor 2: Order value (25 points max)
      if (orderValue > 100000000) priority += 25;
      else if (orderValue > 10000000) priority += 20;
      else if (orderValue > 1000000) priority += 15;
      else priority += 10;

      // Factor 3: Time since update (15 points max)
      if (hoursSinceUpdate > 24) priority += 15;
      else if (hoursSinceUpdate > 12) priority += 12;
      else if (hoursSinceUpdate > 6) priority += 8;
      else if (hoursSinceUpdate > 3) priority += 4;

      // Factor 4: Profit potential (10 points max)
      if (profitPotential > 10000000) priority += 10;
      else if (profitPotential > 1000000) priority += 7;
      else priority += 3;

      // Determine priority level
      let priorityLevel = 'low';
      if (priority >= 80) priorityLevel = 'critical';
      else if (priority >= 60) priorityLevel = 'high';
      else if (priority >= 40) priorityLevel = 'medium';

      return {
        ...order,
        itemName,
        orderValue,
        isUndercut,
        priceDiff,
        recommendedPrice,
        hoursSinceUpdate,
        profitPotential,
        priority,
        priorityLevel,
        isCompleted: completedOrders.has(order.order_id),
      };
    });

    // Sort by priority (highest first), then by completed status
    return analyzed.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return b.priority - a.priority;
    });
  }, [orders, marketData, typeNames, completedOrders]);

  // Active (not completed) orders
  const activeOrders = prioritizedOrders.filter(o => !o.isCompleted);
  const completedOrdersList = prioritizedOrders.filter(o => o.isCompleted);

  // Mark order as updated
  const handleMarkComplete = useCallback((orderId) => {
    setCompletedOrders(prev => new Set([...prev, orderId]));
    onOrderComplete?.(orderId);
  }, [onOrderComplete]);

  // Clear completed
  const handleClearCompleted = useCallback(() => {
    setCompletedOrders(new Set());
  }, []);

  // Get next order to update
  const nextOrder = activeOrders[0];

  if (!orders.length) return null;

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-accent-cyan/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-cyan/20 rounded-lg">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-text-primary font-medium">Update Priority Queue</h3>
              <p className="text-xs text-text-secondary">
                {activeOrders.length} orders to update
              </p>
            </div>
          </div>

          {completedOrdersList.length > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-xs text-text-secondary hover:text-accent-cyan"
            >
              Clear {completedOrdersList.length} done
            </button>
          )}
        </div>
      </div>

      {/* Next Up Highlight */}
      {nextOrder && (
        <div className="m-4 p-4 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-accent-cyan uppercase font-medium">Update Next</span>
            <span className={`px-2 py-0.5 text-xs rounded ${
              nextOrder.priorityLevel === 'critical'
                ? 'bg-red-500/20 text-red-400'
                : nextOrder.priorityLevel === 'high'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {nextOrder.priorityLevel.toUpperCase()}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 text-[10px] rounded ${
                  nextOrder.is_buy_order
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {nextOrder.is_buy_order ? 'BUY' : 'SELL'}
                </span>
                <span className="text-text-primary font-medium truncate">{nextOrder.itemName}</span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-secondary">Current:</span>
                  <span className="ml-1 text-text-primary font-mono">{formatISK(nextOrder.price, false)}</span>
                </div>
                {nextOrder.isUndercut && (
                  <div>
                    <span className="text-text-secondary">Update to:</span>
                    <span className="ml-1 text-accent-cyan font-mono">{formatISK(nextOrder.recommendedPrice, false)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onCopyPrice?.(nextOrder.recommendedPrice, nextOrder.itemName)}
                className="px-3 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-xs"
              >
                Copy Price
              </button>
              <button
                onClick={() => handleMarkComplete(nextOrder.order_id)}
                className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
        {activeOrders.slice(1).map((order, idx) => (
          <QueueItem
            key={order.order_id}
            order={order}
            position={idx + 2}
            onCopyPrice={onCopyPrice}
            onMarkComplete={() => handleMarkComplete(order.order_id)}
          />
        ))}

        {/* Completed Section */}
        {completedOrdersList.length > 0 && (
          <>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-text-secondary hover:text-text-primary"
            >
              <span>{showCompleted ? 'Hide' : 'Show'} {completedOrdersList.length} completed</span>
              <svg
                className={`w-3 h-3 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCompleted && completedOrdersList.map(order => (
              <div
                key={order.order_id}
                className="p-2 rounded-lg bg-green-500/5 border border-green-500/10 opacity-60"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-text-secondary line-through">{order.itemName}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Empty State */}
      {activeOrders.length === 0 && (
        <div className="p-8 text-center text-text-secondary">
          <svg className="w-8 h-8 mx-auto mb-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>All orders updated!</p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual queue item
 */
function QueueItem({ order, position, onCopyPrice, onMarkComplete }) {
  const priorityColors = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-accent-cyan/50',
  };

  return (
    <div className={`p-2 rounded-lg bg-white/5 border-l-2 ${priorityColors[order.priorityLevel]} flex items-center justify-between gap-2`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-xs text-text-secondary w-5">#{position}</span>
        <span className={`px-1 py-0.5 text-[9px] rounded ${
          order.is_buy_order
            ? 'bg-red-500/20 text-red-400'
            : 'bg-green-500/20 text-green-400'
        }`}>
          {order.is_buy_order ? 'B' : 'S'}
        </span>
        <span className="text-sm text-text-primary truncate">{order.itemName}</span>
        {order.isUndercut && (
          <span className="px-1 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded">
            UNDERCUT
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onCopyPrice?.(order.recommendedPrice, order.itemName)}
          className="p-1.5 text-text-secondary hover:text-accent-cyan transition-colors"
          title="Copy price"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={onMarkComplete}
          className="p-1.5 text-text-secondary hover:text-green-400 transition-colors"
          title="Mark done"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default OrderUpdatePriorityQueue;
