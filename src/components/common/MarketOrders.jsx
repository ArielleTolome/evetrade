import { useState, useEffect, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getCharacterOrders, getTypeNames } from '../../api/esi';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Market Orders Component
 * Displays active buy/sell orders from EVE Online
 */
export function MarketOrders() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [orders, setOrders] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, buy, sell

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadOrders();
    }
  }, [isAuthenticated, character?.id]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const orderData = await getCharacterOrders(character.id, accessToken);
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

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) =>
      filter === 'buy' ? o.is_buy_order : !o.is_buy_order
    );
  }, [orders, filter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const buyOrders = orders.filter((o) => o.is_buy_order);
    const sellOrders = orders.filter((o) => !o.is_buy_order);

    const buyEscrow = buyOrders.reduce((sum, o) => sum + o.escrow, 0);
    const sellValue = sellOrders.reduce((sum, o) => sum + o.price * o.volume_remain, 0);

    return {
      totalOrders: orders.length,
      buyOrders: buyOrders.length,
      sellOrders: sellOrders.length,
      buyEscrow,
      sellValue,
      totalValue: buyEscrow + sellValue,
    };
  }, [orders]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <GlassmorphicCard className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-text-primary">Active Market Orders</h3>
        <div className="flex items-center gap-3">
          {/* Filter */}
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
            onClick={loadOrders}
            disabled={loading}
            className="p-2 text-text-secondary hover:text-accent-cyan transition-colors"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-red-400">{formatISK(stats.buyEscrow, false)}</div>
          <div className="text-xs text-text-secondary">Buy Escrow ({stats.buyOrders})</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-green-400">{formatISK(stats.sellValue, false)}</div>
          <div className="text-xs text-text-secondary">Sell Value ({stats.sellOrders})</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-accent-gold">{formatISK(stats.totalValue, false)}</div>
          <div className="text-xs text-text-secondary">Total Locked</div>
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
          <span className="ml-2 text-text-secondary text-sm">Loading orders...</span>
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
                <th className="text-right py-2 px-3">Filled</th>
                <th className="text-right py-2 px-3">Expires</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const volumeFilled = order.volume_total - order.volume_remain;
                const fillPercent = (volumeFilled / order.volume_total) * 100;
                const expiresDate = new Date(order.issued);
                expiresDate.setDate(expiresDate.getDate() + order.duration);
                const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));

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
                      {formatNumber(order.volume_remain, 0)} / {formatNumber(order.volume_total, 0)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-space-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-cyan rounded-full"
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary">{formatPercent(fillPercent / 100, 0)}</span>
                      </div>
                    </td>
                    <td className={`py-2 px-3 text-right text-sm ${
                      daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'
                    }`}>
                      {daysLeft}d
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
          No active orders found
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default MarketOrders;
