import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { useEveAuth } from '../hooks/useEveAuth';
import {
  getWalletBalance,
  getWalletTransactions,
  getWalletJournal,
  getTypeNames
} from '../api/esi';
import { formatISK, formatNumber, formatRelativeTime } from '../utils/formatters';

/**
 * Stat Card Component
 */
function StatCard({ label, value, color = 'text-text-primary', subLabel }) {
  return (
    <div className="p-3 bg-space-dark/50 rounded-lg">
      <div className="text-xs text-text-secondary mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {subLabel && <div className="text-xs text-text-secondary mt-0.5">{subLabel}</div>}
    </div>
  );
}

/**
 * Daily/Hourly Profit Bar Chart Component
 */
function ProfitBarChart({ data, title, timeLabel }) {
  if (!data || data.length === 0) {
    return (
      <GlassmorphicCard className="flex-1">
        <h3 className="text-lg font-display text-text-primary mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-text-secondary">
          No data available
        </div>
      </GlassmorphicCard>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const hasNegative = data.some(d => d.value < 0);

  return (
    <GlassmorphicCard className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display text-text-primary">{title}</h3>
        <span className="text-xs text-text-secondary">Time: {timeLabel}</span>
      </div>

      <div className="h-48 flex items-end gap-1 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-text-secondary">
          <span>{formatISK(maxValue, false)}</span>
          {hasNegative && <span>0</span>}
          {hasNegative && <span>-{formatISK(maxValue, false)}</span>}
          {!hasNegative && <span>0</span>}
        </div>

        {/* Bars */}
        <div className="flex-1 ml-14 h-full flex items-center gap-0.5">
          {data.map((d, i) => {
            const heightPercent = (Math.abs(d.value) / maxValue) * 100;
            const isPositive = d.value >= 0;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-center h-full relative group"
              >
                <div
                  className={`w-full transition-all rounded-sm ${isPositive
                      ? 'bg-pink-500 hover:bg-pink-400'
                      : 'bg-red-500 hover:bg-red-400'
                    }`}
                  style={{
                    height: `${Math.max(heightPercent / 2, 2)}%`,
                    marginTop: isPositive ? 'auto' : '0',
                    marginBottom: isPositive ? '0' : 'auto',
                  }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap">
                  <div className="bg-space-dark border border-accent-cyan/30 rounded px-2 py-1 text-xs">
                    <div className="text-text-secondary">{d.label}</div>
                    <div className={isPositive ? 'text-green-400' : 'text-red-400'}>
                      {formatISK(d.value, false)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-pink-500" />
          <span>Trade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>Manufacturing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-500" />
          <span>Contracts</span>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Trade Profits List Component
 */
function TradeProfitsList({ profits }) {
  if (!profits || profits.length === 0) {
    return (
      <div className="text-center py-4 text-text-secondary text-sm">
        No trade profits data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-secondary border-b border-accent-cyan/20">
            <th className="text-left py-2 px-3">Item</th>
            <th className="text-right py-2 px-3">Quantity Sold</th>
            <th className="text-right py-2 px-3">Profit</th>
          </tr>
        </thead>
        <tbody>
          {profits.slice(0, 10).map((profit, idx) => (
            <tr key={idx} className="border-b border-accent-cyan/10 hover:bg-white/5">
              <td className="py-2 px-3 text-accent-cyan">{profit.item}</td>
              <td className="py-2 px-3 text-right font-mono text-text-primary">
                {formatNumber(profit.quantity, 0)}
              </td>
              <td className={`py-2 px-3 text-right font-mono ${profit.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatISK(profit.profit, false)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Overview Page
 * Dashboard showing trading statistics, profit charts, and wallet balance
 */
export function OverviewPage() {
  const { isAuthenticated, character, getAccessToken, login } = useEveAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('30'); // days
  const [lastRefresh, setLastRefresh] = useState(null);

  // Load all data when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadAllData();
    }
  }, [isAuthenticated, character?.id, loadAllData]);

  const loadAllData = useCallback(async () => {
    if (!isAuthenticated || !character?.id) return;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Load wallet balance
      const balance = await getWalletBalance(character.id, accessToken);
      setWalletBalance(balance);

      // Load transactions
      const txns = await getWalletTransactions(character.id, accessToken);
      setTransactions(txns || []);

      // Load journal entries (multiple pages for comprehensive data)
      const journal1 = await getWalletJournal(character.id, accessToken, 1);
      setJournalEntries(journal1 || []);

      // Get type names for transactions
      const typeIds = [...new Set((txns || []).map(t => t.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach(n => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, character?.id, getAccessToken]);

  // Calculate statistics from data
  const stats = useMemo(() => {
    const days = parseInt(dateFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Filter transactions by date
    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoffDate);
    const filteredJournal = journalEntries.filter(j => new Date(j.date) >= cutoffDate);

    // Calculate trade income and purchases
    const sellTxns = filteredTxns.filter(t => !t.is_buy);
    const buyTxns = filteredTxns.filter(t => t.is_buy);

    const tradeIncome = sellTxns.reduce((sum, t) => sum + t.quantity * t.unit_price, 0);
    const tradePurchases = buyTxns.reduce((sum, t) => sum + t.quantity * t.unit_price, 0);

    // Calculate fees from journal
    const brokerFees = filteredJournal
      .filter(j => j.ref_type === 'brokers_fee')
      .reduce((sum, j) => sum + Math.abs(j.amount), 0);

    const salesTax = filteredJournal
      .filter(j => j.ref_type === 'transaction_tax')
      .reduce((sum, j) => sum + Math.abs(j.amount), 0);

    // Calculate net profit
    const netProfit = tradeIncome - tradePurchases - brokerFees - salesTax;

    // Count transactions
    const buyTransactions = buyTxns.length;
    const sellTransactions = sellTxns.length;

    return {
      netProfit,
      tradeIncome,
      tradePurchases,
      brokerFees,
      salesTax,
      buyTransactions,
      sellTransactions,
      rollingProfit: netProfit, // Same as net for now
    };
  }, [transactions, journalEntries, dateFilter]);

  // Calculate daily profits for chart
  const dailyProfits = useMemo(() => {
    const days = parseInt(dateFilter);
    const profitsByDay = {};

    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      profitsByDay[key] = { sells: 0, buys: 0 };
    }

    // Aggregate transactions by day
    transactions.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      if (profitsByDay[dateKey]) {
        const amount = t.quantity * t.unit_price;
        if (t.is_buy) {
          profitsByDay[dateKey].buys += amount;
        } else {
          profitsByDay[dateKey].sells += amount;
        }
      }
    });

    // Aggregate broker fees by day
    journalEntries.forEach(j => {
      if (j.ref_type === 'brokers_fee' || j.ref_type === 'transaction_tax') {
        const dateKey = new Date(j.date).toISOString().split('T')[0];
        if (profitsByDay[dateKey]) {
          profitsByDay[dateKey].buys += Math.abs(j.amount);
        }
      }
    });

    // Convert to array and calculate profit
    return Object.entries(profitsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: data.sells - data.buys,
      }));
  }, [transactions, journalEntries, dateFilter]);

  // Calculate hourly profits (last 24 hours)
  const hourlyProfits = useMemo(() => {
    const profitsByHour = {};
    const now = new Date();

    // Initialize hours
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i, 0, 0, 0);
      const key = hour.toISOString().split(':')[0];
      profitsByHour[key] = { sells: 0, buys: 0 };
    }

    // Aggregate transactions by hour
    transactions.forEach(t => {
      const txnDate = new Date(t.date);
      if (now - txnDate <= 24 * 60 * 60 * 1000) {
        const hourKey = txnDate.toISOString().split(':')[0];
        if (profitsByHour[hourKey]) {
          const amount = t.quantity * t.unit_price;
          if (t.is_buy) {
            profitsByHour[hourKey].buys += amount;
          } else {
            profitsByHour[hourKey].sells += amount;
          }
        }
      }
    });

    // Convert to array
    return Object.entries(profitsByHour)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateHour, data]) => ({
        label: new Date(dateHour + ':00:00Z').toLocaleTimeString('en-US', { hour: 'numeric' }),
        value: data.sells - data.buys,
      }));
  }, [transactions]);

  // Calculate trade profits by item
  const tradeProfits = useMemo(() => {
    const profitsByType = {};

    // Group transactions by type
    transactions.forEach(t => {
      if (!profitsByType[t.type_id]) {
        profitsByType[t.type_id] = { buys: [], sells: [] };
      }
      if (t.is_buy) {
        profitsByType[t.type_id].buys.push(t);
      } else {
        profitsByType[t.type_id].sells.push(t);
      }
    });

    // Calculate profit for each type
    const profits = [];
    Object.entries(profitsByType).forEach(([typeId, data]) => {
      if (data.sells.length > 0) {
        const avgBuyPrice = data.buys.length > 0
          ? data.buys.reduce((sum, t) => sum + t.unit_price, 0) / data.buys.length
          : 0;

        const totalSold = data.sells.reduce((sum, t) => sum + t.quantity, 0);
        const totalSellValue = data.sells.reduce((sum, t) => sum + t.quantity * t.unit_price, 0);
        const estimatedCost = totalSold * avgBuyPrice;
        const profit = totalSellValue - estimatedCost;

        profits.push({
          typeId: parseInt(typeId),
          item: typeNames[typeId] || `Type ${typeId}`,
          quantity: totalSold,
          profit,
        });
      }
    });

    // Sort by profit descending
    return profits.sort((a, b) => b.profit - a.profit);
  }, [transactions, typeNames]);

  if (!isAuthenticated) {
    return (
      <PageLayout
        title="Overview"
        subtitle="Your trading performance dashboard"
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
              Connect your EVE Online account to view your trading overview.
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
      title="Overview"
      subtitle="Your trading performance dashboard"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">Item filter</span>
            <input
              type="text"
              placeholder="Filter items..."
              className="px-3 py-1.5 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            {['all', '30', '7', '1'].map((period) => (
              <Button
                key={period}
                onClick={() => setDateFilter(period === 'all' ? '365' : period)}
                variant={dateFilter === (period === 'all' ? '365' : period) ? 'primary' : 'ghost'}
                size="sm"
                className="text-sm"
              >
                {period === 'all' ? 'All Time' : period === '1' ? 'Last Day' : `Last ${period} Days`}
              </Button>
            ))}
            <Button
              onClick={loadAllData}
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

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3 mb-6">
          <StatCard
            label={`${dateFilter}d Net Profit`}
            value={formatISK(stats.netProfit, false)}
            color={stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatCard
            label="Trade"
            value={formatISK(stats.tradeIncome - stats.tradePurchases, false)}
            color={stats.tradeIncome - stats.tradePurchases >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatCard
            label="Manufacturing"
            value="0"
            color="text-text-secondary"
          />
          <StatCard
            label="Contracts"
            value="0"
            color="text-text-secondary"
          />
          <StatCard
            label={`${dateFilter}d Rolling Profit`}
            value={formatISK(stats.rollingProfit, false)}
            color={stats.rollingProfit >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatCard
            label="Trade Income"
            value={formatISK(stats.tradeIncome, false)}
            color="text-green-400"
          />
          <StatCard
            label="Trade Purchases"
            value={formatISK(-stats.tradePurchases, false)}
            color="text-red-400"
          />
          <StatCard
            label="Sales Tax"
            value={formatISK(-stats.salesTax, false)}
            color="text-red-400"
          />
          <StatCard
            label="Broker Fees"
            value={formatISK(-stats.brokerFees, false)}
            color="text-red-400"
          />
        </div>

        {/* Transaction counts */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            label="Buy Transactions"
            value={formatNumber(stats.buyTransactions, 0)}
            color="text-text-primary"
          />
          <StatCard
            label="Sell Transactions"
            value={formatNumber(stats.sellTransactions, 0)}
            color="text-text-primary"
          />
        </div>

        {/* Profit Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <ProfitBarChart
            data={dailyProfits}
            title="Daily Profits"
            timeLabel={`Last ${dateFilter} days`}
          />
          <ProfitBarChart
            data={hourlyProfits}
            title="Hourly Profits"
            timeLabel="Last 24 hours"
          />
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Trade Profits */}
          <GlassmorphicCard className="md:col-span-1">
            <h3 className="text-lg font-display text-text-primary mb-4">Trade Profits</h3>
            <TradeProfitsList profits={tradeProfits} />
          </GlassmorphicCard>

          {/* Manufacturing Profits */}
          <GlassmorphicCard className="md:col-span-1">
            <h3 className="text-lg font-display text-text-primary mb-4">Manufacturing Profits</h3>
            <div className="text-center py-8 text-text-secondary text-sm">
              There were no manufacturing profits for this character during the selected time period.
            </div>
          </GlassmorphicCard>

          {/* Wallets */}
          <GlassmorphicCard className="md:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display text-text-primary">Wallets</h3>
              <Button
                onClick={loadAllData}
                disabled={loading}
                variant="ghost"
                size="sm"
              >
                Refresh
              </Button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary border-b border-accent-cyan/20">
                  <th className="text-left py-2">Name</th>
                  <th className="text-right py-2">Wallet Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-accent-cyan/10">
                  <td className="py-2 text-text-primary">{character?.name || 'Character'}</td>
                  <td className="py-2 text-right font-mono text-text-primary">
                    {formatISK(walletBalance, false)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-accent-cyan/20">
              <div className="text-sm text-text-secondary">Combined Wallet</div>
              <div className="text-2xl font-bold text-accent-gold">
                {formatISK(walletBalance, false)}
              </div>
            </div>

            {lastRefresh && (
              <div className="mt-2 text-xs text-text-secondary">
                Last updated: {formatRelativeTime(lastRefresh)}
              </div>
            )}
          </GlassmorphicCard>
        </div>
      </div>
    </PageLayout>
  );
}

export default OverviewPage;
