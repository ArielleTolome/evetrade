import { useState, useEffect, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getWalletJournal } from '../../api/esi';
import { formatISK } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Wallet Journal Component
 * Displays wallet journal entries from EVE Online
 * Shows all ISK flows including bounties, market transactions, contracts, etc.
 */
export function WalletJournal() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, income, expense, or specific ref_type

  // Load journal when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadJournal();
    }
  }, [isAuthenticated, character?.id]);

  const loadJournal = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const entries = await getWalletJournal(character.id, accessToken);
      setJournalEntries(entries || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique ref_types for filter dropdown
  const refTypes = useMemo(() => {
    const types = [...new Set(journalEntries.map((e) => e.ref_type))];
    return types.sort();
  }, [journalEntries]);

  // Filter journal entries
  const filteredEntries = useMemo(() => {
    if (filter === 'all') return journalEntries;
    if (filter === 'income') {
      return journalEntries.filter((e) => e.amount > 0);
    }
    if (filter === 'expense') {
      return journalEntries.filter((e) => e.amount < 0);
    }
    return journalEntries.filter((e) => e.ref_type === filter);
  }, [journalEntries, filter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const income = journalEntries.filter((e) => e.amount > 0);
    const expenses = journalEntries.filter((e) => e.amount < 0);

    const totalIncome = income.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);

    return {
      totalEntries: journalEntries.length,
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
    };
  }, [journalEntries]);

  // Format ref_type for display
  const formatRefType = (refType) => {
    return refType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get color for ref_type badge
  const getRefTypeColor = (refType) => {
    const colorMap = {
      bounty_prizes: 'bg-green-500/20 text-green-400',
      market_escrow: 'bg-blue-500/20 text-blue-400',
      market_escrow_release: 'bg-blue-500/20 text-blue-400',
      player_trading: 'bg-purple-500/20 text-purple-400',
      contract_reward: 'bg-yellow-500/20 text-yellow-400',
      contract_price: 'bg-yellow-500/20 text-yellow-400',
      mission_reward: 'bg-green-500/20 text-green-400',
      insurance: 'bg-orange-500/20 text-orange-400',
      skill_purchase: 'bg-red-500/20 text-red-400',
      industry_job_tax: 'bg-red-500/20 text-red-400',
    };

    return colorMap[refType] || 'bg-accent-cyan/20 text-accent-cyan';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <GlassmorphicCard className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-text-primary">Wallet Journal</h3>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
          >
            <option value="all">All Entries</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
            <optgroup label="By Type">
              {refTypes.map((type) => (
                <option key={type} value={type}>
                  {formatRefType(type)}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Refresh */}
          <button
            onClick={loadJournal}
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
          <div className="text-lg font-bold text-accent-cyan">{stats.totalEntries}</div>
          <div className="text-xs text-text-secondary">Total Entries</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-green-400">{formatISK(stats.totalIncome, false)}</div>
          <div className="text-xs text-text-secondary">Total Income</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-space-dark/50">
          <div className="text-lg font-bold text-red-400">{formatISK(stats.totalExpenses, false)}</div>
          <div className="text-xs text-text-secondary">Total Expenses</div>
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
          <span className="ml-2 text-text-secondary text-sm">Loading journal entries...</span>
        </div>
      )}

      {/* Journal Table */}
      {!loading && filteredEntries.length > 0 && (
        <>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-space-dark">
                <tr className="text-text-secondary border-b border-accent-cyan/20">
                  <th className="text-left py-2 px-3">Date</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-right py-2 px-3">Amount</th>
                  <th className="text-right py-2 px-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.slice(0, 100).map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-accent-cyan/10 hover:bg-white/5"
                  >
                    <td className="py-2 px-3 text-text-secondary">
                      {new Date(entry.date).toLocaleDateString()}
                      <div className="text-xs text-text-secondary/70">
                        {new Date(entry.date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${getRefTypeColor(entry.ref_type)}`}>
                        {formatRefType(entry.ref_type)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-text-primary max-w-xs truncate">
                      {entry.description || '-'}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono font-bold ${
                      entry.amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entry.amount >= 0 ? '+' : ''}{formatISK(entry.amount, false)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-text-secondary">
                      {entry.balance ? formatISK(entry.balance, false) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEntries.length > 100 && (
            <p className="mt-2 text-xs text-text-secondary text-center">
              Showing 100 of {filteredEntries.length} entries
            </p>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredEntries.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          No journal entries found
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default WalletJournal;
