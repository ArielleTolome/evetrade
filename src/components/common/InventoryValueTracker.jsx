import { useMemo, useState } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * InventoryValueTracker - Tracks total value of sell orders as inventory
 * Provides breakdown by category, status, and trends
 */
export function InventoryValueTracker({
  orders = [],
  typeNames = {},
  invTypes = {},
  walletBalance = null,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // overview, breakdown

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    if (!orders.length) return null;

    const sellOrders = orders.filter(o => !o.is_buy_order);
    const buyOrders = orders.filter(o => o.is_buy_order);

    // Calculate total values
    const sellOrderValue = sellOrders.reduce((sum, o) => sum + (o.price * o.volume_remain), 0);
    const buyOrderEscrow = buyOrders.reduce((sum, o) => sum + (o.escrow || 0), 0);
    const totalLockedValue = sellOrderValue + buyOrderEscrow;

    // Group by category
    const categoryBreakdown = {};
    sellOrders.forEach(order => {
      const itemData = invTypes[order.type_id];
      const categoryName = itemData?.groupName || 'Unknown';

      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = {
          name: categoryName,
          value: 0,
          count: 0,
          items: [],
        };
      }

      const orderValue = order.price * order.volume_remain;
      categoryBreakdown[categoryName].value += orderValue;
      categoryBreakdown[categoryName].count += 1;
      categoryBreakdown[categoryName].items.push({
        ...order,
        itemName: typeNames[order.type_id] || `Type ${order.type_id}`,
        orderValue,
      });
    });

    // Sort categories by value
    const sortedCategories = Object.values(categoryBreakdown)
      .sort((a, b) => b.value - a.value);

    // Top items by value
    const topItems = sellOrders
      .map(o => ({
        ...o,
        itemName: typeNames[o.type_id] || `Type ${o.type_id}`,
        orderValue: o.price * o.volume_remain,
      }))
      .sort((a, b) => b.orderValue - a.orderValue)
      .slice(0, 10);

    // Calculate portfolio allocation
    const totalAssets = (walletBalance || 0) + totalLockedValue;
    const inventoryPercent = totalAssets > 0 ? (sellOrderValue / totalAssets) * 100 : 0;
    const escrowPercent = totalAssets > 0 ? (buyOrderEscrow / totalAssets) * 100 : 0;
    const liquidPercent = totalAssets > 0 ? ((walletBalance || 0) / totalAssets) * 100 : 0;

    return {
      sellOrderCount: sellOrders.length,
      buyOrderCount: buyOrders.length,
      sellOrderValue,
      buyOrderEscrow,
      totalLockedValue,
      totalAssets,
      inventoryPercent,
      escrowPercent,
      liquidPercent,
      categories: sortedCategories,
      topItems,
    };
  }, [orders, typeNames, invTypes, walletBalance]);

  if (!inventoryStats) return null;

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-text-primary font-medium">Inventory Value</h3>
            <p className="text-xs text-text-secondary">
              {formatISK(inventoryStats.sellOrderValue, true)} in {inventoryStats.sellOrderCount} orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-accent-gold">
            {formatISK(inventoryStats.totalLockedValue, true)}
          </span>
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
          {/* Portfolio Allocation */}
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="text-sm font-medium text-text-primary mb-3">Portfolio Allocation</h4>
            <div className="space-y-2">
              {/* Visual bar */}
              <div className="h-6 rounded-full overflow-hidden flex bg-space-dark">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${inventoryStats.liquidPercent}%` }}
                  title={`Liquid: ${formatPercent(inventoryStats.liquidPercent / 100, 1)}`}
                />
                <div
                  className="h-full bg-accent-gold transition-all"
                  style={{ width: `${inventoryStats.inventoryPercent}%` }}
                  title={`Inventory: ${formatPercent(inventoryStats.inventoryPercent / 100, 1)}`}
                />
                <div
                  className="h-full bg-accent-cyan transition-all"
                  style={{ width: `${inventoryStats.escrowPercent}%` }}
                  title={`Escrow: ${formatPercent(inventoryStats.escrowPercent / 100, 1)}`}
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-text-secondary">Liquid</span>
                  <span className="text-text-primary font-medium">
                    {formatISK(walletBalance || 0, true)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-accent-gold" />
                  <span className="text-text-secondary">Inventory</span>
                  <span className="text-text-primary font-medium">
                    {formatISK(inventoryStats.sellOrderValue, true)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-accent-cyan" />
                  <span className="text-text-secondary">Escrow</span>
                  <span className="text-text-primary font-medium">
                    {formatISK(inventoryStats.buyOrderEscrow, true)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'overview'
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              Top Items
            </button>
            <button
              onClick={() => setViewMode('breakdown')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'breakdown'
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              By Category
            </button>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'overview' ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inventoryStats.topItems.map((item, idx) => (
                <div
                  key={item.order_id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-text-secondary w-5">#{idx + 1}</span>
                    <span className="text-sm text-text-primary truncate">{item.itemName}</span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-accent-gold font-medium">
                      {formatISK(item.orderValue, true)}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatNumber(item.volume_remain, 0)} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {inventoryStats.categories.map((cat, _idx) => (
                <div
                  key={cat.name}
                  className="p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-text-primary">{cat.name}</div>
                      <div className="text-xs text-text-secondary">{cat.count} items</div>
                    </div>
                    <div className="text-right">
                      <div className="text-accent-gold font-medium">
                        {formatISK(cat.value, true)}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {formatPercent(cat.value / inventoryStats.sellOrderValue, 1)}
                      </div>
                    </div>
                  </div>
                  {/* Category value bar */}
                  <div className="mt-2 h-1.5 bg-space-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-gold/70 rounded-full"
                      style={{
                        width: `${(cat.value / inventoryStats.sellOrderValue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Assets Summary */}
          <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Total Assets</span>
              <span className="text-lg font-bold text-accent-gold">
                {formatISK(inventoryStats.totalAssets, true)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryValueTracker;
