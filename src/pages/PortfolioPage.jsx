import { useState, useCallback, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { usePortfolio } from '../hooks/usePortfolio';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Stat Card Component
 */
function StatCard({ label, value, subValue, color = 'text-accent-cyan', icon }) {
  return (
    <GlassmorphicCard padding="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-sm text-text-secondary">{label}</div>
          {subValue && (
            <div className="text-xs text-text-secondary/70 mt-1">{subValue}</div>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg ${color.replace('text-', 'bg-')}/20 flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Profit Chart Component (Simple Bar Chart)
 */
function ProfitChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-text-secondary">
        No data available
      </div>
    );
  }

  const maxProfit = Math.max(...data.map((d) => Math.abs(d.profit)));
  const minProfit = Math.min(...data.map((d) => d.profit));

  return (
    <div className="h-48 flex items-end gap-1">
      {data.slice(-30).map((d, i) => {
        const height = maxProfit > 0 ? (Math.abs(d.profit) / maxProfit) * 100 : 0;
        const isPositive = d.profit >= 0;

        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center justify-end group relative"
          >
            <div
              className={`w-full rounded-t transition-all ${
                isPositive ? 'bg-green-500' : 'bg-red-500'
              } hover:opacity-80`}
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-space-dark border border-accent-cyan/20 rounded px-2 py-1 text-xs whitespace-nowrap">
                <div className="text-text-primary">{d.date}</div>
                <div className={isPositive ? 'text-green-400' : 'text-red-400'}>
                  {formatISK(d.profit, false)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Trade History Row Component
 */
function TradeRow({ trade, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const profit = trade.profit || 0;
  const isPositive = profit >= 0;

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium text-text-primary">{trade.itemName || 'Unknown Item'}</div>
        <div className="text-xs text-text-secondary">{trade.route || 'Unknown Route'}</div>
      </td>
      <td className="py-3 px-4 text-right font-mono">
        {formatNumber(trade.quantity || 0, 0)}
      </td>
      <td className="py-3 px-4 text-right font-mono">
        {formatISK(trade.buyPrice || 0, false)}
      </td>
      <td className="py-3 px-4 text-right font-mono">
        {formatISK(trade.sellPrice || 0, false)}
      </td>
      <td className={`py-3 px-4 text-right font-mono font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{formatISK(profit, false)}
      </td>
      <td className="py-3 px-4 text-right text-text-secondary text-sm">
        {new Date(trade.completedAt).toLocaleDateString()}
      </td>
      <td className="py-3 px-4 text-right">
        {showConfirm ? (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => {
                onDelete(trade.id);
                setShowConfirm(false);
              }}
              className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
            >
              Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-2 py-1 text-xs bg-white/10 text-text-secondary rounded hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-2 py-1 text-xs text-text-secondary hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}

/**
 * Add Trade Modal Component
 */
function AddTradeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    itemName: '',
    route: '',
    quantity: '',
    buyPrice: '',
    sellPrice: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = parseFloat(form.quantity) || 0;
    const buyPrice = parseFloat(form.buyPrice) || 0;
    const sellPrice = parseFloat(form.sellPrice) || 0;
    const profit = (sellPrice - buyPrice) * quantity;

    onAdd({
      ...form,
      quantity,
      buyPrice,
      sellPrice,
      profit,
      volume: quantity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassmorphicCard className="w-full max-w-md">
        <h3 className="font-display text-xl text-text-primary mb-6">Add Trade</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Item Name</label>
            <input
              type="text"
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
              placeholder="Tritanium, PLEX, etc."
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Route</label>
            <input
              type="text"
              value={form.route}
              onChange={(e) => setForm({ ...form, route: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
              placeholder="Jita -> Amarr"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Buy Price</label>
              <input
                type="number"
                value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
                placeholder="1000"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Sell Price</label>
              <input
                type="number"
                value={form.sellPrice}
                onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
                placeholder="1200"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 btn-primary py-2">
              Add Trade
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Portfolio Page Component
 */
export function PortfolioPage() {
  const { tradeHistory, addTrade, deleteTrade, getStatistics, clearAllData, isLoaded } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const stats = useMemo(() => getStatistics(), [getStatistics]);

  if (!isLoaded) {
    return (
      <PageLayout title="Portfolio" subtitle="Loading...">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="animate-pulse h-64" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Portfolio"
      subtitle="Track your trading performance and history"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Profit"
            value={formatISK(stats.totalProfit, false)}
            color={stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Total Trades"
            value={formatNumber(stats.totalTrades, 0)}
            subValue={`${formatNumber(stats.totalVolume, 0)} items traded`}
            color="text-accent-cyan"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            label="Win Rate"
            value={formatPercent(stats.winRate / 100, 1)}
            subValue={`${stats.totalTrades - Math.round(stats.winRate * stats.totalTrades / 100)} losing trades`}
            color={stats.winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
          <StatCard
            label="Avg Profit/Trade"
            value={formatISK(stats.averageProfit, false)}
            color={stats.averageProfit >= 0 ? 'text-accent-gold' : 'text-red-400'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            }
          />
        </div>

        {/* Profit Chart */}
        <GlassmorphicCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-text-primary">Profit Over Time</h3>
            <span className="text-sm text-text-secondary">Last 30 days</span>
          </div>
          <ProfitChart data={stats.profitByDay} />
        </GlassmorphicCard>

        {/* Best/Worst Trades */}
        {(stats.bestTrade || stats.worstTrade) && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {stats.bestTrade && (
              <GlassmorphicCard>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">Best Trade</span>
                </div>
                <div className="text-lg font-medium text-text-primary">{stats.bestTrade.itemName}</div>
                <div className="text-2xl font-bold text-green-400">
                  +{formatISK(stats.bestTrade.profit, false)}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {stats.bestTrade.route} - {new Date(stats.bestTrade.completedAt).toLocaleDateString()}
                </div>
              </GlassmorphicCard>
            )}
            {stats.worstTrade && stats.worstTrade.profit < 0 && (
              <GlassmorphicCard>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400">Worst Trade</span>
                </div>
                <div className="text-lg font-medium text-text-primary">{stats.worstTrade.itemName}</div>
                <div className="text-2xl font-bold text-red-400">
                  {formatISK(stats.worstTrade.profit, false)}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  {stats.worstTrade.route} - {new Date(stats.worstTrade.completedAt).toLocaleDateString()}
                </div>
              </GlassmorphicCard>
            )}
          </div>
        )}

        {/* Trade History */}
        <GlassmorphicCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-text-primary">Trade History</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary px-4 py-2 text-sm"
              >
                Add Trade
              </button>
              {tradeHistory.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-4 py-2 text-sm bg-white/10 text-text-secondary rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {tradeHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-text-primary mb-2">No Trades Recorded</h4>
              <p className="text-text-secondary mb-4">Start tracking your trades to see performance metrics.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary px-6 py-2"
              >
                Add Your First Trade
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-cyan/20">
                    <th className="py-3 px-4 text-left text-accent-cyan font-medium">Item / Route</th>
                    <th className="py-3 px-4 text-right text-accent-cyan font-medium">Qty</th>
                    <th className="py-3 px-4 text-right text-accent-cyan font-medium">Buy</th>
                    <th className="py-3 px-4 text-right text-accent-cyan font-medium">Sell</th>
                    <th className="py-3 px-4 text-right text-accent-cyan font-medium">Profit</th>
                    <th className="py-3 px-4 text-right text-accent-cyan font-medium">Date</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.slice(0, 50).map((trade) => (
                    <TradeRow key={trade.id} trade={trade} onDelete={deleteTrade} />
                  ))}
                </tbody>
              </table>
              {tradeHistory.length > 50 && (
                <div className="text-center py-4 text-text-secondary text-sm">
                  Showing 50 of {tradeHistory.length} trades
                </div>
              )}
            </div>
          )}
        </GlassmorphicCard>

        {/* Clear Confirmation */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassmorphicCard className="w-full max-w-sm text-center">
              <h3 className="font-display text-xl text-text-primary mb-4">Clear All Data?</h3>
              <p className="text-text-secondary mb-6">
                This will delete all your saved routes, trade history, and watchlist items. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    clearAllData();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Delete Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 btn-secondary py-2"
                >
                  Cancel
                </button>
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {/* Add Trade Modal */}
        {showAddModal && (
          <AddTradeModal
            onAdd={addTrade}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </PageLayout>
  );
}

export default PortfolioPage;
