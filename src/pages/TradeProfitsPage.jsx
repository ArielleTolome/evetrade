import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { useEveAuth } from '../hooks/useEveAuth';
import {
  getWalletTransactions,
  getTypeNames,
  calculateTradingTaxes,
  getCharacterSkills,
} from '../api/esi';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Trade Profits Page
 * Shows detailed trade profit history with buy/sell matching
 */
export function TradeProfitsPage() {
  const { isAuthenticated, character, getAccessToken, login } = useEveAuth();
  const [transactions, setTransactions] = useState([]);

  const [typeNames, setTypeNames] = useState({});
  const [tradingTaxes, setTradingTaxes] = useState({ salesTax: 0.08, brokerFee: 0.03 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minProfit, setMinProfit] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(40);

  // Load transactions when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadData();
    }
  }, [isAuthenticated, character?.id, loadData]);

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !character?.id) return;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Load transactions and journal in parallel
      const [txns, skills] = await Promise.all([
        getWalletTransactions(character.id, accessToken),
        getCharacterSkills(character.id, accessToken).catch(() => null),
      ]);

      setTransactions(txns || []);

      // Calculate trading taxes based on skills
      if (skills) {
        const taxes = calculateTradingTaxes(skills, null);
        setTradingTaxes(taxes);
      }

      // Get type names
      const typeIds = [...new Set((txns || []).map(t => t.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach(n => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, character?.id, getAccessToken]);

  // Calculate trade profits by matching buy and sell transactions
  const tradeProfits = useMemo(() => {
    // Group transactions by type_id
    const byType = {};
    transactions.forEach(t => {
      if (!byType[t.type_id]) {
        byType[t.type_id] = { buys: [], sells: [] };
      }
      if (t.is_buy) {
        byType[t.type_id].buys.push({
          ...t,
          remaining: t.quantity,
        });
      } else {
        byType[t.type_id].sells.push(t);
      }
    });

    // Sort buys by date (FIFO)
    Object.values(byType).forEach(group => {
      group.buys.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Match sells with buys using FIFO
    const profits = [];

    Object.entries(byType).forEach(([typeId, group]) => {
      group.sells.forEach(sell => {
        let remainingToMatch = sell.quantity;
        let totalBuyCost = 0;
        let matchedQuantity = 0;

        // Match with available buys
        for (const buy of group.buys) {
          if (remainingToMatch <= 0) break;
          if (buy.remaining <= 0) continue;

          const matchQty = Math.min(buy.remaining, remainingToMatch);
          totalBuyCost += matchQty * buy.unit_price;
          matchedQuantity += matchQty;
          buy.remaining -= matchQty;
          remainingToMatch -= matchQty;
        }

        // Calculate average buy price
        const avgBuyPrice = matchedQuantity > 0 ? totalBuyCost / matchedQuantity : 0;

        // Calculate fees
        const totalSell = sell.quantity * sell.unit_price;
        const totalBuy = sell.quantity * avgBuyPrice;
        const brokerBuy = totalBuy * tradingTaxes.brokerFee;
        const brokerSell = totalSell * tradingTaxes.brokerFee;
        const salesTaxAmount = totalSell * tradingTaxes.salesTax;

        // Calculate profit
        const grossProfit = totalSell - totalBuy;
        const netProfit = grossProfit - brokerBuy - brokerSell - salesTaxAmount;

        profits.push({
          date: sell.date,
          typeId: parseInt(typeId),
          item: typeNames[typeId] || `Type ${typeId}`,
          unitBuy: avgBuyPrice,
          unitSell: sell.unit_price,
          units: sell.quantity,
          totalBuy,
          totalSell,
          minProfit: netProfit,
          brokerBuy,
          brokerSell,
          salesTax: salesTaxAmount,
          hasMatch: matchedQuantity > 0,
        });
      });
    });

    // Sort by date descending
    return profits.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, typeNames, tradingTaxes]);

  // Apply filters
  const filteredProfits = useMemo(() => {
    let filtered = tradeProfits;

    // Filter by item name
    if (itemFilter) {
      const search = itemFilter.toLowerCase();
      filtered = filtered.filter(p => p.item.toLowerCase().includes(search));
    }

    // Filter by minimum profit
    if (minProfit) {
      const min = parseFloat(minProfit);
      filtered = filtered.filter(p => p.minProfit >= min);
    }

    return filtered;
  }, [tradeProfits, itemFilter, minProfit]);

  // Pagination
  const totalPages = Math.ceil(filteredProfits.length / entriesPerPage);
  const paginatedProfits = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredProfits.slice(start, start + entriesPerPage);
  }, [filteredProfits, currentPage, entriesPerPage]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalProfit = filteredProfits.reduce((sum, p) => sum + p.minProfit, 0);
    const totalBroker = filteredProfits.reduce((sum, p) => sum + p.brokerBuy + p.brokerSell, 0);
    const totalTax = filteredProfits.reduce((sum, p) => sum + p.salesTax, 0);
    const totalVolume = filteredProfits.reduce((sum, p) => sum + p.units, 0);

    return {
      totalProfit,
      totalBroker,
      totalTax,
      totalVolume,
      tradeCount: filteredProfits.length,
    };
  }, [filteredProfits]);

  if (!isAuthenticated) {
    return (
      <PageLayout
        title="Trade Profits"
        subtitle="Detailed trade profit analysis"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-text-primary mb-2">Login Required</h3>
            <p className="text-text-secondary mb-6">
              Connect your EVE Online account to view your trade profits.
            </p>
            <Button onClick={login} variant="primary" className="px-8 py-3">
              Login with EVE Online
            </Button>
          </GlassmorphicCard>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Trade Profits"
      subtitle="Detailed trade profit analysis with buy/sell matching"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter items..."
              value={itemFilter}
              onChange={(e) => {
                setItemFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm w-48"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Minimum profit</span>
              <input
                type="number"
                placeholder="0"
                value={minProfit}
                onChange={(e) => {
                  setMinProfit(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm w-32"
              />
              <span className="text-sm text-text-secondary">ISK</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">Entries:</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm"
            >
              <option value="20">20</option>
              <option value="40">40</option>
              <option value="100">100</option>
            </select>

            <span className="text-sm text-text-secondary">
              Page: {currentPage} of {totalPages || 1}
            </span>

            <div className="flex gap-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                variant="ghost"
                size="sm"
              >
                Prev
              </Button>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                variant="ghost"
                size="sm"
              >
                Next
              </Button>
            </div>

            <Button
              onClick={loadData}
              disabled={loading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <GlassmorphicCard padding="p-4">
            <div className="text-xs text-text-secondary mb-1">Total Profit</div>
            <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(stats.totalProfit, false)}
            </div>
          </GlassmorphicCard>
          <GlassmorphicCard padding="p-4">
            <div className="text-xs text-text-secondary mb-1">Trades</div>
            <div className="text-lg font-bold text-text-primary">
              {formatNumber(stats.tradeCount, 0)}
            </div>
          </GlassmorphicCard>
          <GlassmorphicCard padding="p-4">
            <div className="text-xs text-text-secondary mb-1">Volume Traded</div>
            <div className="text-lg font-bold text-accent-cyan">
              {formatNumber(stats.totalVolume, 0)}
            </div>
          </GlassmorphicCard>
          <GlassmorphicCard padding="p-4">
            <div className="text-xs text-text-secondary mb-1">Total Broker Fees</div>
            <div className="text-lg font-bold text-red-400">
              -{formatISK(stats.totalBroker, false)}
            </div>
          </GlassmorphicCard>
          <GlassmorphicCard padding="p-4">
            <div className="text-xs text-text-secondary mb-1">Total Sales Tax</div>
            <div className="text-lg font-bold text-red-400">
              -{formatISK(stats.totalTax, false)}
            </div>
          </GlassmorphicCard>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Trades Table */}
        <GlassmorphicCard>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            </div>
          ) : paginatedProfits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary border-b border-accent-cyan/20">
                    <th className="text-left py-3 px-3">Date</th>
                    <th className="text-left py-3 px-3">Item</th>
                    <th className="text-right py-3 px-3">Unit Buy</th>
                    <th className="text-right py-3 px-3">Unit Sell</th>
                    <th className="text-right py-3 px-3">Units</th>
                    <th className="text-right py-3 px-3">Total Buy</th>
                    <th className="text-right py-3 px-3">Total Sell</th>
                    <th className="text-right py-3 px-3">Minimum Profit</th>
                    <th className="text-right py-3 px-3">Broker Buy</th>
                    <th className="text-right py-3 px-3">Broker Sell</th>
                    <th className="text-right py-3 px-3">Sales Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProfits.map((profit, idx) => {
                    const profitPercent = profit.totalBuy > 0
                      ? (profit.minProfit / profit.totalBuy) * 100
                      : 0;

                    return (
                      <tr key={idx} className="border-b border-accent-cyan/10 hover:bg-white/5">
                        <td className="py-2 px-3 text-text-secondary text-xs">
                          {new Date(profit.date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-accent-cyan">{profit.item}</span>
                          {!profit.hasMatch && (
                            <span className="ml-2 text-xs text-yellow-400" title="No matching buy found">
                              *
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-primary">
                          {profit.unitBuy > 0 ? formatISK(profit.unitBuy, false) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-primary">
                          {formatISK(profit.unitSell, false)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-secondary">
                          {formatNumber(profit.units, 0)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-primary">
                          {formatISK(profit.totalBuy, false)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-primary">
                          {formatISK(profit.totalSell, false)}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono ${profit.minProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <div>{formatISK(profit.minProfit, false)}</div>
                          <div className="text-xs opacity-70">
                            {formatPercent(profitPercent / 100, 1)}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-secondary text-xs">
                          {formatPercent(tradingTaxes.brokerFee, 2)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-secondary text-xs">
                          {formatPercent(tradingTaxes.brokerFee, 2)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-text-secondary text-xs">
                          {formatPercent(tradingTaxes.salesTax, 2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              {transactions.length === 0
                ? 'No transactions found. Make sure you have market activity.'
                : 'No trades match the current filters.'}
            </div>
          )}

          {/* Pagination Footer */}
          {filteredProfits.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-accent-cyan/20">
              <span className="text-sm text-text-secondary">
                Showing {((currentPage - 1) * entriesPerPage) + 1} - {Math.min(currentPage * entriesPerPage, filteredProfits.length)} of {filteredProfits.length} trades
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
                  variant="ghost"
                  size="sm"
                >
                  First
                </Button>
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  variant="ghost"
                  size="sm"
                >
                  Prev
                </Button>
                <span className="px-3 py-1 text-sm text-text-primary">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  variant="ghost"
                  size="sm"
                >
                  Next
                </Button>
                <Button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  variant="ghost"
                  size="sm"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </GlassmorphicCard>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
          <h3 className="text-sm font-medium text-accent-cyan mb-2">About Trade Profits</h3>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>* Items marked with an asterisk (*) have no matching buy transaction - profit is estimated from sell only</li>
            <li>* Buy/Sell matching uses FIFO (First In, First Out) method</li>
            <li>* Broker fees are estimated based on your Broker Relations skill ({formatPercent(tradingTaxes.brokerFee, 2)})</li>
            <li>* Sales tax is estimated based on your Accounting skill ({formatPercent(tradingTaxes.salesTax, 2)})</li>
            <li>* Minimum Profit = Total Sell - Total Buy - Broker Fees - Sales Tax</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}

export default TradeProfitsPage;
