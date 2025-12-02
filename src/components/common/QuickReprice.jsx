import { useState } from 'react';
import { Button } from './Button';
import { formatISK } from '../../utils/formatters';

/**
 * QuickReprice Component
 * Shows quick re-pricing options for undercut orders
 */
export function QuickReprice({
  order,
  bestPrice,
  isSellOrder,
  onReprice,
  compact = false
}) {
  const [calculating, setCalculating] = useState(false);

  const isUndercut = isSellOrder
    ? order.price > bestPrice
    : order.price < bestPrice;

  if (!isUndercut) {
    return null;
  }

  const priceDiff = Math.abs(order.price - bestPrice);
  const newPrice = isSellOrder ? bestPrice - 0.01 : bestPrice + 0.01;
  const newExpectedValue = newPrice * order.volume_remain;
  const oldExpectedValue = order.price * order.volume_remain;
  const valueDiff = isSellOrder
    ? oldExpectedValue - newExpectedValue
    : newExpectedValue - oldExpectedValue;

  const handleReprice = async () => {
    setCalculating(true);
    try {
      await onReprice(order.order_id, newPrice);
    } catch (error) {
      console.error('Failed to calculate reprice:', error);
    } finally {
      setCalculating(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleReprice}
        disabled={calculating}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all min-h-[44px] disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium">Reprice</span>
      </button>
    );
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-400 font-semibold">Order Undercut</span>
          </div>
          <p className="text-text-secondary text-sm mb-1">
            Your order is {formatISK(priceDiff, false)} {isSellOrder ? 'above' : 'below'} the best price
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-space-dark/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary mb-1">Current Price</p>
          <p className="text-lg font-mono text-text-primary">{formatISK(order.price, false)}</p>
        </div>
        <div className="bg-space-dark/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary mb-1">Suggested Price</p>
          <p className="text-lg font-mono text-accent-cyan">{formatISK(newPrice, false)}</p>
        </div>
        <div className="bg-space-dark/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary mb-1">Expected Value Impact</p>
          <p className={`text-lg font-mono ${valueDiff > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {valueDiff > 0 ? '-' : '+'}{formatISK(Math.abs(valueDiff), false)}
          </p>
        </div>
        <div className="bg-space-dark/50 rounded-lg p-3">
          <p className="text-xs text-text-secondary mb-1">Volume Remaining</p>
          <p className="text-lg font-mono text-text-primary">{order.volume_remain.toLocaleString()}</p>
        </div>
      </div>

      <Button
        onClick={handleReprice}
        variant="primary"
        size="lg"
        disabled={calculating}
        className="w-full"
      >
        {calculating ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Calculating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Copy New Price to Clipboard
          </>
        )}
      </Button>
      <p className="text-xs text-text-secondary text-center mt-2">
        Note: You'll need to manually cancel and replace your order in-game
      </p>
    </div>
  );
}

/**
 * BatchReprice Component
 * Allows re-pricing multiple items at once
 */
export function BatchReprice({ undercutOrders, onBatchReprice }) {
  const [selected, setSelected] = useState(new Set());
  const [processing, setProcessing] = useState(false);

  const toggleSelection = (orderId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelected(newSelected);
  };

  const toggleAll = () => {
    if (selected.size === undercutOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(undercutOrders.map(o => o.order_id)));
    }
  };

  const handleBatchReprice = async () => {
    setProcessing(true);
    try {
      await onBatchReprice(Array.from(selected));
    } catch (error) {
      console.error('Failed to batch reprice:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (undercutOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-display text-yellow-400">
            {undercutOrders.length} Undercut Orders
          </h3>
        </div>
        <button
          onClick={toggleAll}
          className="text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
        >
          {selected.size === undercutOrders.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
        {undercutOrders.map((order) => (
          <label
            key={order.order_id}
            className="flex items-center gap-3 p-3 rounded-lg bg-space-dark/50 hover:bg-space-dark/70 transition-all cursor-pointer min-h-[60px]"
          >
            <input
              type="checkbox"
              checked={selected.has(order.order_id)}
              onChange={() => toggleSelection(order.order_id)}
              className="w-5 h-5 rounded border-accent-cyan/30 bg-space-dark/50 text-accent-cyan focus:ring-accent-cyan"
            />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium truncate">{order.typeName}</p>
              <p className="text-xs text-text-secondary">
                Current: {formatISK(order.price, false)} → Suggested: {formatISK(order.suggestedPrice, false)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-400 font-mono">
                -{formatISK(order.priceDiff, false)}
              </p>
            </div>
          </label>
        ))}
      </div>

      {selected.size > 0 && (
        <Button
          onClick={handleBatchReprice}
          variant="primary"
          size="lg"
          disabled={processing}
          className="w-full"
        >
          {processing ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Copy {selected.size} Prices to Clipboard
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default QuickReprice;
