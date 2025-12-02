import { useMemo, useState } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * OrderExpiryTracker - Tracks orders that are expiring soon
 * Uses ESI order data to identify orders nearing expiration
 */
export function OrderExpiryTracker({
  orders = [],
  typeNames = {},
  warningDays = 3,
  criticalDays = 1,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Analyze orders for expiry status
  const expiryAnalysis = useMemo(() => {
    if (!orders.length) return { expiring: [], stats: null };

    const now = new Date();

    const analyzed = orders.map(order => {
      const issuedDate = new Date(order.issued);
      const expiryDate = new Date(issuedDate);
      expiryDate.setDate(expiryDate.getDate() + order.duration);

      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      const hoursUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60));

      let status = 'safe';
      if (daysUntilExpiry <= criticalDays) status = 'critical';
      else if (daysUntilExpiry <= warningDays) status = 'warning';

      const orderValue = order.is_buy_order
        ? order.escrow || 0
        : order.price * order.volume_remain;

      return {
        ...order,
        itemName: typeNames[order.type_id] || `Type ${order.type_id}`,
        expiryDate,
        daysUntilExpiry,
        hoursUntilExpiry,
        status,
        orderValue,
      };
    });

    // Filter to only show expiring orders
    const expiring = analyzed
      .filter(o => o.status !== 'safe')
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    // Calculate stats
    const critical = expiring.filter(o => o.status === 'critical');
    const warning = expiring.filter(o => o.status === 'warning');
    const totalValue = expiring.reduce((sum, o) => sum + o.orderValue, 0);

    return {
      expiring,
      stats: {
        criticalCount: critical.length,
        warningCount: warning.length,
        totalExpiring: expiring.length,
        totalValue,
      },
    };
  }, [orders, typeNames, warningDays, criticalDays]);

  if (!expiryAnalysis.stats || expiryAnalysis.expiring.length === 0) return null;

  const { expiring, stats } = expiryAnalysis;

  return (
    <div className={`bg-space-dark/60 border border-orange-500/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-text-primary font-medium">Orders Expiring Soon</h3>
            <p className="text-xs text-text-secondary">
              {stats.totalExpiring} order{stats.totalExpiring !== 1 ? 's' : ''} expiring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats.criticalCount > 0 && (
            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full animate-pulse">
              {stats.criticalCount} today
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
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-red-500/10 rounded-lg text-center">
              <div className="text-xl font-bold text-red-400">{stats.criticalCount}</div>
              <div className="text-xs text-text-secondary">&lt; {criticalDays} day</div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg text-center">
              <div className="text-xl font-bold text-orange-400">{stats.warningCount}</div>
              <div className="text-xs text-text-secondary">&lt; {warningDays} days</div>
            </div>
            <div className="p-3 bg-accent-cyan/10 rounded-lg text-center">
              <div className="text-xl font-bold text-accent-cyan">{formatISK(stats.totalValue, true)}</div>
              <div className="text-xs text-text-secondary">Value at risk</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {expiring.map(order => (
              <ExpiryOrderRow key={order.order_id} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual expiring order row
 */
function ExpiryOrderRow({ order }) {
  const statusConfig = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'EXPIRES TODAY',
    },
    warning: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      label: `${order.daysUntilExpiry}d left`,
    },
  };

  const config = statusConfig[order.status];

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`px-1.5 py-0.5 text-[10px] rounded ${
            order.is_buy_order
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {order.is_buy_order ? 'BUY' : 'SELL'}
          </span>
          <span className="text-sm text-text-primary truncate">{order.itemName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            {formatNumber(order.volume_remain, 0)} @ {formatISK(order.price, true)}
          </span>
          <span className={`px-2 py-0.5 text-[10px] rounded ${config.bg} ${config.text} ${
            order.status === 'critical' ? 'animate-pulse' : ''
          }`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Progress bar showing time remaining */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-space-dark rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              order.status === 'critical' ? 'bg-red-500' : 'bg-orange-500'
            }`}
            style={{
              width: `${Math.max(0, Math.min(100, (order.daysUntilExpiry / order.duration) * 100))}%`,
            }}
          />
        </div>
        <span className="text-[10px] text-text-secondary whitespace-nowrap">
          {order.hoursUntilExpiry}h
        </span>
      </div>
    </div>
  );
}

export default OrderExpiryTracker;
