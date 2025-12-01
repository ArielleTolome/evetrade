import { useState, useEffect, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getCharacterOrderHistory, getTypeNames } from '../../api/esi';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Order History & Analytics Component
 * Displays completed/expired market orders with profit analysis
 */
export function OrderHistory() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [orders, setOrders] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, buy, sell
  const [dateRange, setDateRange] = useState('30'); // days

  // Load order history when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadOrderHistory();
    }
  }, [isAuthenticated, character?.id]);

  const loadOrderHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // ESI returns paginated results, fetch first page for now
      const orderData = await getCharacterOrderHistory(character.id, accessToken);
      setOrders(orderData || []);

      // Get unique type IDs and fetch names
      const typeIds = [...new Set(orderData.map((o) => o.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach((n) => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by type and date range
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by buy/sell
    if (filter === 'buy') {
      filtered = filtered.filter((o) => o.is_buy_order);
    } else if (filter === 'sell') {
      filtered = filtered.filter((o) => !o.is_buy_order);
    }

    // Filter by date range
    const daysAgo = parseInt(dateRange);
    if (daysAgo > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filtered = filtered.filter((o) => {
        const issueDate = new Date(o.issued);
        return issueDate >= cutoffDate;
      });
    }

    // Sort by issued date (most recent first)
    return filtered.sort((a, b) => new Date(b.issued) - new Date(a.issued));
  }, [orders, filter, dateRange]);

  // Group orders by type_id to calculate profit
  const ordersByType = useMemo(() => {
    const grouped = {};
    filteredOrders.forEach((order) => {
      if (!grouped[order.type_id]) {
        grouped[order.type_id] = { buys: [], sells: [] };
      }
      if (order.is_buy_order) {
        grouped[order.type_id].buys.push(order);
      } else {
        grouped[order.type_id].sells.push(order);
      }
    });
    return grouped;
  }, [filteredOrders]);

  // Calculate profit for matching buy/sell orders
  const calculateProfit = (order) => {
    const typeOrders = ordersByType[order.type_id];
    if (!typeOrders) return null;

    // Simple profit calculation: compare with opposite orders
    if (order.is_buy_order) {
      // Find sell orders for this type
      const sellOrders = typeOrders.sells;
      if (sellOrders.length > 0) {
        const avgSellPrice = sellOrders.reduce((sum, o) => sum + o.price, 0) / sellOrders.length;
        const profitPerItem = avgSellPrice - order.price;
        const profitPercent = (profitPerItem / order.price) * 100;
        return { profitPerItem, profitPercent };
      }
    } else {
      // Find buy orders for this type
      const buyOrders = typeOrders.buys;
      if (buyOrders.length > 0) {
        const avgBuyPrice = buyOrders.reduce((sum, o) => sum + o.price, 0) / buyOrders.length;
        const profitPerItem = order.price - avgBuyPrice;
        const profitPercent = (profitPerItem / avgBuyPrice) * 100;
        return { profitPerItem, profitPercent };
      }
    }
    return null;
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    const buyOrders = filteredOrders.filter((o) => o.is_buy_order);
    const sellOrders = filteredOrders.filter((o) => !o.is_buy_order);

    const totalBuyVolume = buyOrders.reduce((sum, o) => sum + o.volume_total, 0);
    const totalSellVolume = sellOrders.reduce((sum, o) => sum + o.volume_total, 0);

    const totalBuyValue = buyOrders.reduce((sum, o) => sum + o.price * o.volume_total, 0);
    const totalSellValue = sellOrders.reduce((sum, o) => sum + o.price * o.volume_total, 0);

    // Calculate total profit from sell orders
    const totalProfit = sellOrders.reduce((sum, o) => {
      const profit = calculateProfit(o);
      if (profit) {
        return sum + profit.profitPerItem * o.volume_total;
      }
      return sum;
    }, 0);

    return {
      totalOrders: filteredOrders.length,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      totalBuyVolume,
      totalSellVolume,
      totalVolume: totalBuyVolume + totalSellVolume,
      totalBuyValue,
      totalSellValue,
      totalValue: totalBuyValue + totalSellValue,
      totalProfit,
    };
  }, [filteredOrders, ordersByType]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <GlassmorphicCard className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-text-primary">Order History & Analytics</h3>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="0">All Time</option>
          </select>

          {/* Type Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
          >
            <option value="all">All Orders ({stats.totalOrders})</option>
            <option value="buy">Buy Orders ({stats.buyOrders})</option>
            <option value="sell">Sell Orders ({stats.sellOrders})</option>
          </select>

          {/* Refresh */}
          <button
            onClick={loadOrderHistory}
            disabled={loading}
            className="p-2 text-text-secondary hover:text-accent-cyan transition-colors"
            title="Refresh order history"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-text-primary">{formatNumber(stats.totalOrders, 0)}</div>
          <div className="text-xs text-text-secondary">Completed Orders</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-accent-cyan">{formatNumber(stats.totalVolume, 0)}</div>
          <div className="text-xs text-text-secondary">Total Volume</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-accent-gold">{formatISK(stats.totalValue, false)}</div>
          <div className="text-xs text-text-secondary">Total Value</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatISK(stats.totalProfit, false)}
          </div>
          <div className="text-xs text-text-secondary">Estimated Profit</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="ml-2 text-text-secondary text-sm">Loading order history...</span>
        </div>
      )}

      {/* Orders Table */}
      {!loading && filteredOrders.length > 0 && (
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-space-dark">
              <tr className="text-text-secondary border-b border-accent-cyan/20">
                <th className="text-left py-2 px-3">Item</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-right py-2 px-3">Price</th>
                <th className="text-right py-2 px-3">Volume</th>
                <th className="text-right py-2 px-3">Total Value</th>
                <th className="text-right py-2 px-3">Profit/Item</th>
                <th className="text-right py-2 px-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const profit = calculateProfit(order);
                const totalValue = order.price * order.volume_total;
                const issueDate = new Date(order.issued);
                const formattedDate = issueDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: issueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                });

                return (
                  <tr
                    key={order.order_id}
                    className="border-b border-accent-cyan/10 hover:bg-white/5"
                  >
                    <td className="py-2 px-3 text-text-primary">
                      {typeNames[order.type_id] || `Type ${order.type_id}`}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        order.is_buy_order
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {order.is_buy_order ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-text-primary">
                      {formatISK(order.price, false)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-text-secondary">
                      {formatNumber(order.volume_total, 0)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-text-primary">
                      {formatISK(totalValue, false)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {profit ? (
                        <div className="flex flex-col items-end">
                          <span className={profit.profitPerItem >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatISK(profit.profitPerItem, false)}
                          </span>
                          <span className={`text-xs ${profit.profitPercent >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            ({profit.profitPercent >= 0 ? '+' : ''}{formatPercent(profit.profitPercent / 100, 1)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-secondary text-xs">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-text-secondary text-xs">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          {orders.length === 0 ? (
            'No order history found'
          ) : (
            'No orders match the selected filters'
          )}
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default OrderHistory;
