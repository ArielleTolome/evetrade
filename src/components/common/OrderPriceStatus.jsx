import { useState } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * Price Status Badge - Shows if an order is competitive
 * Inspired by EVE Tycoon's "Price Status" column
 *
 * States:
 * - Best: Your order is the best price
 * - Competitive: Within 1% of best price
 * - Undercut: Someone has a better price
 * - No Data: Market price unknown
 */
export function PriceStatusBadge({ orderPrice, marketPrice, isBuyOrder, className = '' }) {
  if (!marketPrice || marketPrice === 0) {
    return (
      <span className={`px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 ${className}`}>
        No price data
      </span>
    );
  }

  const priceDiff = orderPrice - marketPrice;
  const priceDiffPercent = ((priceDiff / marketPrice) * 100);

  // For buy orders: higher price = better (you're offering more)
  // For sell orders: lower price = better (you're offering less)
  let _status, statusClass, statusText;

  if (isBuyOrder) {
    // Buy order logic
    if (priceDiff >= 0) {
      _status = 'best';
      statusClass = 'bg-green-500/20 text-green-400 border-green-500/30';
      statusText = priceDiff === 0 ? 'Best' : 'Best';
    } else if (priceDiffPercent >= -1) {
      _status = 'competitive';
      statusClass = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      statusText = 'Close';
    } else {
      _status = 'undercut';
      statusClass = 'bg-red-500/20 text-red-400 border-red-500/30';
      statusText = 'Undercut';
    }
  } else {
    // Sell order logic
    if (priceDiff <= 0) {
      _status = 'best';
      statusClass = 'bg-green-500/20 text-green-400 border-green-500/30';
      statusText = priceDiff === 0 ? 'Best' : 'Best';
    } else if (priceDiffPercent <= 1) {
      _status = 'competitive';
      statusClass = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      statusText = 'Close';
    } else {
      _status = 'undercut';
      statusClass = 'bg-red-500/20 text-red-400 border-red-500/30';
      statusText = 'Undercut';
    }
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${statusClass} ${className}`}>
      {statusText}
    </span>
  );
}

/**
 * Price Difference Display - Shows the ISK difference from market
 */
export function PriceDifference({ orderPrice, marketPrice, isBuyOrder, className = '' }) {
  if (!marketPrice || marketPrice === 0) {
    return <span className={`text-xs text-text-secondary ${className}`}>-</span>;
  }

  const diff = orderPrice - marketPrice;
  const diffPercent = (diff / marketPrice) * 100;

  // Determine if the difference is favorable
  // Buy orders: positive diff is good (offering more)
  // Sell orders: negative diff is good (offering less)
  const isFavorable = isBuyOrder ? diff >= 0 : diff <= 0;

  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`text-xs font-mono ${isFavorable ? 'text-green-400' : 'text-red-400'}`}>
        {diff >= 0 ? '+' : ''}{formatISK(diff, false)}
      </span>
      <span className={`text-[10px] ${isFavorable ? 'text-green-400/70' : 'text-red-400/70'}`}>
        ({diffPercent >= 0 ? '+' : ''}{diffPercent.toFixed(2)}%)
      </span>
    </div>
  );
}

/**
 * Recommended Price - Shows what price to set for undercutting/overbidding
 */
export function RecommendedPrice({ marketPrice, isBuyOrder, offset = 0.01, onCopy, className = '' }) {
  const [copied, setCopied] = useState(false);

  if (!marketPrice) return null;

  // For buy orders: overbid by adding offset
  // For sell orders: undercut by subtracting offset
  const recommendedPrice = isBuyOrder
    ? marketPrice + offset
    : marketPrice - offset;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recommendedPrice.toFixed(2));
      setCopied(true);
      onCopy?.(`Price copied: ${formatISK(recommendedPrice, false)}`);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
        copied
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/20'
      } ${className}`}
      title={`Copy ${isBuyOrder ? 'overbid' : 'undercut'} price`}
    >
      <span className="font-mono">{formatISK(recommendedPrice, false)}</span>
      {copied ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Enhanced Order Row - Full order management row with all features
 */
export function EnhancedOrderRow({
  order,
  itemName,
  marketPrice,
  onCopy,
  onRefresh: _onRefresh,
}) {
  const [copied, setCopied] = useState(null);

  const volumeFilled = order.volume_total - order.volume_remain;
  const fillPercent = (volumeFilled / order.volume_total) * 100;
  const expiresDate = new Date(order.issued);
  expiresDate.setDate(expiresDate.getDate() + order.duration);
  const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));

  const copyPrice = async (price, label) => {
    try {
      await navigator.clipboard.writeText(price.toFixed(2));
      setCopied(label);
      onCopy?.(`${label} copied: ${formatISK(price, false)}`);
      setTimeout(() => setCopied(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <tr className="border-b border-accent-cyan/10 hover:bg-white/5 transition-colors">
      {/* Item Name */}
      <td className="py-3 px-3">
        <div className="flex flex-col">
          <span className="text-text-primary font-medium">{itemName || `Type ${order.type_id}`}</span>
          <span className={`text-xs ${order.is_buy_order ? 'text-red-400' : 'text-green-400'}`}>
            {order.is_buy_order ? 'BUY ORDER' : 'SELL ORDER'}
          </span>
        </div>
      </td>

      {/* Your Price */}
      <td className="py-3 px-3 text-right">
        <button
          onClick={() => copyPrice(order.price, 'Current')}
          className={`font-mono text-sm transition-colors ${
            copied === 'Current' ? 'text-green-400' : 'text-text-primary hover:text-accent-cyan'
          }`}
          title="Click to copy"
        >
          {formatISK(order.price, false)}
        </button>
      </td>

      {/* Price Status */}
      <td className="py-3 px-3 text-center">
        <PriceStatusBadge
          orderPrice={order.price}
          marketPrice={marketPrice}
          isBuyOrder={order.is_buy_order}
        />
      </td>

      {/* Price Difference */}
      <td className="py-3 px-3 text-right">
        <PriceDifference
          orderPrice={order.price}
          marketPrice={marketPrice}
          isBuyOrder={order.is_buy_order}
        />
      </td>

      {/* Recommended Price */}
      <td className="py-3 px-3">
        <RecommendedPrice
          marketPrice={marketPrice}
          isBuyOrder={order.is_buy_order}
          onCopy={onCopy}
        />
      </td>

      {/* Volume */}
      <td className="py-3 px-3 text-right">
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-text-primary font-mono">
            {formatNumber(order.volume_remain, 0)} / {formatNumber(order.volume_total, 0)}
          </span>
          <div className="w-16 h-1.5 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-cyan rounded-full transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      </td>

      {/* Expires */}
      <td className={`py-3 px-3 text-right text-sm ${
        daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'
      }`}>
        {daysLeft}d
      </td>
    </tr>
  );
}

/**
 * Orders Summary Stats - Like EVE Tycoon header stats
 */
export function OrdersSummaryStats({ orders, className = '' }) {
  const buyOrders = orders.filter(o => o.is_buy_order);
  const sellOrders = orders.filter(o => !o.is_buy_order);

  const buyEscrow = buyOrders.reduce((sum, o) => sum + (o.escrow || 0), 0);
  const sellValue = sellOrders.reduce((sum, o) => sum + o.price * o.volume_remain, 0);
  const totalISK = buyEscrow + sellValue;

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-space-dark/50 rounded-lg border border-white/5">
        <span className="text-text-secondary">Active Orders:</span>
        <span className="font-mono text-text-primary font-medium">{orders.length}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-space-dark/50 rounded-lg border border-white/5">
        <span className="text-text-secondary">Total ISK:</span>
        <span className="font-mono text-accent-gold font-medium">{formatISK(totalISK, true)}</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
        <span className="text-red-400">Buy Escrow:</span>
        <span className="font-mono text-text-primary">{formatISK(buyEscrow, true)}</span>
        <span className="text-xs text-text-secondary">({buyOrders.length})</span>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
        <span className="text-green-400">Sell Value:</span>
        <span className="font-mono text-text-primary">{formatISK(sellValue, true)}</span>
        <span className="text-xs text-text-secondary">({sellOrders.length})</span>
      </div>
    </div>
  );
}

export default {
  PriceStatusBadge,
  PriceDifference,
  RecommendedPrice,
  EnhancedOrderRow,
  OrdersSummaryStats,
};
