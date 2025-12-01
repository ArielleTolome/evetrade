import { useState, useEffect, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getWalletTransactions, getTypeNames } from '../../api/esi';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Match buy and sell transactions to calculate realized P&L
 */
function matchTransactions(transactions) {
  // Group transactions by type_id
  const grouped = {};

  transactions.forEach((txn) => {
    if (!grouped[txn.type_id]) {
      grouped[txn.type_id] = { buys: [], sells: [] };
    }
    if (txn.is_buy) {
      grouped[txn.type_id].buys.push(txn);
    } else {
      grouped[txn.type_id].sells.push(txn);
    }
  });

  // Calculate P&L for each item
  const results = [];

  Object.entries(grouped).forEach(([typeId, { buys, sells }]) => {
    if (buys.length === 0 || sells.length === 0) return;

    // Sort by date (oldest first) for FIFO matching
    buys.sort((a, b) => new Date(a.date) - new Date(b.date));
    sells.sort((a, b) => new Date(a.date) - new Date(b.date));

    let totalQuantityMatched = 0;
    let totalBuyCost = 0;
    let totalSellRevenue = 0;
    let totalTradeCount = 0;

    // Track remaining quantities
    const buyQueue = [...buys].map(b => ({ ...b, remaining: b.quantity }));
    const sellQueue = [...sells].map(s => ({ ...s, remaining: s.quantity }));

    let buyIdx = 0;
    let sellIdx = 0;

    // FIFO matching algorithm
    while (buyIdx < buyQueue.length && sellIdx < sellQueue.length) {
      const buy = buyQueue[buyIdx];
      const sell = sellQueue[sellIdx];

      const matchQty = Math.min(buy.remaining, sell.remaining);

      totalQuantityMatched += matchQty;
      totalBuyCost += matchQty * buy.unit_price;
      totalSellRevenue += matchQty * sell.unit_price;
      totalTradeCount++;

      buy.remaining -= matchQty;
      sell.remaining -= matchQty;

      if (buy.remaining === 0) buyIdx++;
      if (sell.remaining === 0) sellIdx++;
    }

    if (totalQuantityMatched > 0) {
      const avgBuyPrice = totalBuyCost / totalQuantityMatched;
      const avgSellPrice = totalSellRevenue / totalQuantityMatched;
      const profit = totalSellRevenue - totalBuyCost;
      const roi = totalBuyCost > 0 ? profit / totalBuyCost : 0;

      results.push({
        typeId: parseInt(typeId),
        quantityMatched: totalQuantityMatched,
        avgBuyPrice,
        avgSellPrice,
        totalBuyCost,
        totalSellRevenue,
        profit,
        roi,
        tradeCount: totalTradeCount,
      });
    }
  });

  return results;
}

/**
 * Profit & Loss Calculator Component
 * Automatically calculates realized P&L from wallet transactions
 */
export function ProfitLossCalculator() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [transactions, setTransactions] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(30); // days
  const [sortBy, setSortBy] = useState('profit'); // profit, roi, volume
  const [sortOrder, setSortOrder] = useState('desc');

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

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (dateRange === 0) return transactions;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRange);

    return transactions.filter((t) => new Date(t.date) >= cutoffDate);
  }, [transactions, dateRange]);

  // Match transactions and calculate P&L
  const plResults = useMemo(() => {
    const results = matchTransactions(filteredTransactions);

    // Sort results
    results.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'profit':
          valA = a.profit;
          valB = b.profit;
          break;
        case 'roi':
          valA = a.roi;
          valB = b.roi;
          break;
        case 'volume':
          valA = a.totalSellRevenue;
          valB = b.totalSellRevenue;
          break;
        case 'quantity':
          valA = a.quantityMatched;
          valB = b.quantityMatched;
          break;
        default:
          valA = a.profit;
          valB = b.profit;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return results;
  }, [filteredTransactions, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalProfit = plResults.reduce((sum, r) => sum + r.profit, 0);
    const totalVolume = plResults.reduce((sum, r) => sum + r.totalSellRevenue, 0);
    const totalInvestment = plResults.reduce((sum, r) => sum + r.totalBuyCost, 0);
    const avgROI = totalInvestment > 0 ? totalProfit / totalInvestment : 0;

    // Find best and worst performers
    const sortedByProfit = [...plResults].sort((a, b) => b.profit - a.profit);
    const bestPerformers = sortedByProfit.slice(0, 3);
    const worstPerformers = sortedByProfit.slice(-3).reverse();

    return {
      totalProfit,
      totalVolume,
      totalInvestment,
      avgROI,
      itemsTraded: plResults.length,
      bestPerformers,
      worstPerformers,
    };
  }, [plResults]);

  // Toggle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Sort indicator component
  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return null;
    return (
      <span className="ml-1">
        {sortOrder === 'desc' ? '↓' : '↑'}
      </span>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <GlassmorphicCard className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl text-text-primary">
          Profit & Loss Calculator
        </h3>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={0}>All Time</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="p-2 text-text-secondary hover:text-accent-cyan transition-colors"
            title="Refresh data"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && plResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-space-dark/50">
            <div className={`text-lg font-bold ${summaryStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summaryStats.totalProfit >= 0 ? '+' : ''}{formatISK(summaryStats.totalProfit, false)}
            </div>
            <div className="text-xs text-text-secondary">Total Profit</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-space-dark/50">
            <div className="text-lg font-bold text-accent-cyan">
              {formatPercent(summaryStats.avgROI)}
            </div>
            <div className="text-xs text-text-secondary">Avg ROI</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-space-dark/50">
            <div className="text-lg font-bold text-text-primary">
              {formatISK(summaryStats.totalVolume, false)}
            </div>
            <div className="text-xs text-text-secondary">Total Volume</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-space-dark/50">
            <div className="text-lg font-bold text-text-primary">
              {formatISK(summaryStats.totalInvestment, false)}
            </div>
            <div className="text-xs text-text-secondary">Investment</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-space-dark/50">
            <div className="text-lg font-bold text-accent-cyan">
              {summaryStats.itemsTraded}
            </div>
            <div className="text-xs text-text-secondary">Items Traded</div>
          </div>
        </div>
      )}

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

      {/* P&L Table */}
      {!loading && plResults.length > 0 && (
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-space-dark">
              <tr className="text-text-secondary border-b border-accent-cyan/20">
                <th className="text-left py-2 px-3">Item Name</th>
                <th
                  className="text-right py-2 px-3 cursor-pointer hover:text-accent-cyan"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity<SortIndicator column="quantity" />
                </th>
                <th className="text-right py-2 px-3">Avg Buy</th>
                <th className="text-right py-2 px-3">Avg Sell</th>
                <th
                  className="text-right py-2 px-3 cursor-pointer hover:text-accent-cyan"
                  onClick={() => handleSort('profit')}
                >
                  Profit<SortIndicator column="profit" />
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer hover:text-accent-cyan"
                  onClick={() => handleSort('roi')}
                >
                  ROI<SortIndicator column="roi" />
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer hover:text-accent-cyan"
                  onClick={() => handleSort('volume')}
                >
                  Volume<SortIndicator column="volume" />
                </th>
              </tr>
            </thead>
            <tbody>
              {plResults.map((item) => (
                <tr
                  key={item.typeId}
                  className="border-b border-accent-cyan/10 hover:bg-white/5"
                >
                  <td className="py-2 px-3 text-text-primary">
                    {typeNames[item.typeId] || `Type ${item.typeId}`}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-text-secondary">
                    {formatNumber(item.quantityMatched, 0)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-text-secondary">
                    {formatISK(item.avgBuyPrice, false)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-text-secondary">
                    {formatISK(item.avgSellPrice, false)}
                  </td>
                  <td className={`py-2 px-3 text-right font-mono font-bold ${
                    item.profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.profit >= 0 ? '+' : ''}{formatISK(item.profit, false)}
                  </td>
                  <td className={`py-2 px-3 text-right font-mono ${
                    item.roi >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercent(item.roi)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-text-secondary">
                    {formatISK(item.totalSellRevenue, false)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Best/Worst Performers */}
      {!loading && plResults.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Performers */}
          {summaryStats.bestPerformers.length > 0 && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Best Performers
              </h4>
              <div className="space-y-1">
                {summaryStats.bestPerformers.map((item) => (
                  <div key={item.typeId} className="flex justify-between text-xs">
                    <span className="text-text-secondary truncate mr-2">
                      {typeNames[item.typeId] || `Type ${item.typeId}`}
                    </span>
                    <span className="text-green-400 font-mono">
                      +{formatISK(item.profit, false)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worst Performers */}
          {summaryStats.worstPerformers.length > 0 && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                Worst Performers
              </h4>
              <div className="space-y-1">
                {summaryStats.worstPerformers.map((item) => (
                  <div key={item.typeId} className="flex justify-between text-xs">
                    <span className="text-text-secondary truncate mr-2">
                      {typeNames[item.typeId] || `Type ${item.typeId}`}
                    </span>
                    <span className="text-red-400 font-mono">
                      {formatISK(item.profit, false)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && plResults.length === 0 && transactions.length > 0 && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-3 text-text-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-text-secondary">No matched transactions found</p>
          <p className="text-xs text-text-secondary mt-1">
            P&L is calculated by matching buy and sell orders for the same items
          </p>
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>No wallet transactions found</p>
          <p className="text-xs mt-1">Start trading to see your P&L</p>
        </div>
      )}

      {/* Info Note */}
      {!loading && plResults.length > 0 && (
        <div className="mt-4 p-3 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg">
          <p className="text-xs text-text-secondary">
            <span className="font-semibold text-accent-cyan">Note:</span> P&L is calculated using FIFO (First-In-First-Out) matching.
            Broker fees and sales tax are not included in these calculations.
            Actual profit may vary based on your Accounting and Broker Relations skills.
          </p>
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default ProfitLossCalculator;
