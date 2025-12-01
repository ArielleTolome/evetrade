import { useState, useEffect, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getWalletTransactions, getTypeNames } from '../../api/esi';
import { formatISK, formatNumber } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Wallet Transactions Component
 * Displays recent market transactions from EVE Online
 */
export function WalletTransactions({ onImport }) {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [transactions, setTransactions] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, buy, sell

  // Load transactions when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadTransactions();
    }
  }, [isAuthenticated, character?.id]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const txns = await getWalletTransactions(character.id, accessToken);
      setTransactions(txns || []);

      // Get unique type IDs and fetch names
      const typeIds = [...new Set(txns.map((t) => t.type_id))];
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

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) =>
      filter === 'buy' ? t.is_buy : !t.is_buy
    );
  }, [transactions, filter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const buys = transactions.filter((t) => t.is_buy);
    const sells = transactions.filter((t) => !t.is_buy);

    const totalBought = buys.reduce((sum, t) => sum + t.quantity * t.unit_price, 0);
    const totalSold = sells.reduce((sum, t) => sum + t.quantity * t.unit_price, 0);

    return {
      totalTransactions: transactions.length,
      totalBought,
      totalSold,
      netFlow: totalSold - totalBought,
    };
  }, [transactions]);

  // Import transactions to portfolio
  const handleImport = () => {
    if (onImport && filteredTransactions.length > 0) {
      const importData = filteredTransactions.map((t) => ({
        date: t.date,
        item: typeNames[t.type_id] || `Type ${t.type_id}`,
        itemId: t.type_id,
        quantity: t.quantity,
        unitPrice: t.unit_price,
        totalPrice: t.quantity * t.unit_price,
        isBuy: t.is_buy,
        locationId: t.location_id,
        transactionId: t.transaction_id,
      }));
      onImport(importData);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <GlassmorphicCard className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-text-primary">Wallet Transactions</h3>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
          >
            <option value="all">All Transactions</option>
            <option value="buy">Buy Orders</option>
            <option value="sell">Sell Orders</option>
          </select>

          {/* Refresh */}
          <button
            onClick={loadTransactions}
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-accent-cyan">{stats.totalTransactions}</div>
          <div className="text-xs text-text-secondary">Transactions</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-red-400">{formatISK(stats.totalBought, false)}</div>
          <div className="text-xs text-text-secondary">Total Bought</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-green-400">{formatISK(stats.totalSold, false)}</div>
          <div className="text-xs text-text-secondary">Total Sold</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className={`text-lg font-bold ${stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.netFlow >= 0 ? '+' : ''}{formatISK(stats.netFlow, false)}
          </div>
          <div className="text-xs text-text-secondary">Net Flow</div>
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
          <span className="ml-2 text-text-secondary text-sm">Loading transactions...</span>
        </div>
      )}

      {/* Transactions Table */}
      {!loading && filteredTransactions.length > 0 && (
        <>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-space-dark">
                <tr className="text-text-secondary border-b border-accent-cyan/20">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Item</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-right py-2 px-3">Qty</th>
                  <th className="text-right py-2 px-3">Unit Price</th>
                  <th className="text-right py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 100).map((txn) => (
                  <tr
                    key={txn.transaction_id}
                    className="border-b border-accent-cyan/10 hover:bg-white/5"
                  >
                    <td className="py-2 px-3 text-text-secondary">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-text-primary">
                      {typeNames[txn.type_id] || `Type ${txn.type_id}`}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        txn.is_buy
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {txn.is_buy ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-text-primary">
                      {formatNumber(txn.quantity, 0)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-text-secondary">
                      {formatISK(txn.unit_price, false)}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono ${
                      txn.is_buy ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {txn.is_buy ? '-' : '+'}{formatISK(txn.quantity * txn.unit_price, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length > 100 && (
            <p className="mt-2 text-xs text-text-secondary text-center">
              Showing 100 of {filteredTransactions.length} transactions
            </p>
          )}

          {/* Import Button */}
          {onImport && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import to Portfolio
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          No transactions found
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default WalletTransactions;
