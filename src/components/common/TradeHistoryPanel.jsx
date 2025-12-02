import { useState, useMemo } from 'react';
import { useTradeHistory } from '../../hooks/useTradeHistory';
import { useEveAuth } from '../../hooks/useEveAuth';
import { formatISK, formatPercent, formatNumber, formatRelativeTime } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Trade History Panel Component
 * Displays comprehensive trade history analysis with profit tracking
 */
export function TradeHistoryPanel() {
  const { isAuthenticated, login, character } = useEveAuth();
  const { tradeAnalysis, stats, loading, error, refresh, groupByPeriod } = useTradeHistory();
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('profit');
  const [chartPeriod, setChartPeriod] = useState('day');

  // Filter trades by date
  const filteredTrades = useMemo(() => {
    if (dateFilter === 'all') return tradeAnalysis;

    const now = Date.now();
    const cutoff = {
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
    }[dateFilter];

    return tradeAnalysis.filter((t) => new Date(t.lastTradeDate).getTime() > cutoff);
  }, [tradeAnalysis, dateFilter]);

  // Sort trades
  const sortedTrades = useMemo(() => {
    const sorted = [...filteredTrades];

    switch (sortBy) {
      case 'profit':
        return sorted.sort((a, b) => b.totalProfit - a.totalProfit);
      case 'margin':
        return sorted.sort((a, b) => b.profitMargin - a.profitMargin);
      case 'volume':
        return sorted.sort((a, b) => b.totalSold - a.totalSold);
      case 'name':
        return sorted.sort((a, b) => a.typeName.localeCompare(b.typeName));
      default:
        return sorted;
    }
  }, [filteredTrades, sortBy]);

  // Get profit timeline for chart
  const profitTimeline = useMemo(() => {
    return groupByPeriod(chartPeriod);
  }, [groupByPeriod, chartPeriod]);

  // Calculate max profit for chart scaling
  const maxProfit = useMemo(() => {
    if (profitTimeline.length === 0) return 100;
    return Math.max(...profitTimeline.map((p) => Math.abs(p.profit)));
  }, [profitTimeline]);

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <GlassmorphicCard className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-accent-cyan/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-xl font-display text-text-primary mb-2">
            Track Your Trading Performance
          </h3>
          <p className="text-text-secondary mb-6">
            Login with your EVE Online character to view your trading history,
            profit/loss analysis, and performance statistics.
          </p>
          <button
            onClick={login}
            className="px-6 py-3 bg-accent-cyan text-space-dark rounded-lg font-semibold hover:bg-accent-cyan/90 transition-colors"
          >
            Login with EVE Online
          </button>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display text-text-primary mb-1">
              Trade History
            </h2>
            <p className="text-text-secondary text-sm">
              {character?.name && `Tracking trades for ${character.name}`}
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </GlassmorphicCard>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassmorphicCard padding="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-secondary text-sm mb-1">Total Profit</div>
                <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{formatISK(stats.totalProfit, false)}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stats.totalProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              ROI: {formatPercent(stats.roi)}
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard padding="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-secondary text-sm mb-1">Win Rate</div>
                <div className="text-2xl font-bold text-accent-cyan">
                  {formatPercent(stats.winRate, 0)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-accent-cyan/20">
                <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              {stats.profitableTrades} wins / {stats.losingTrades} losses
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard padding="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-secondary text-sm mb-1">Avg Profit</div>
                <div className="text-2xl font-bold text-text-primary">
                  {formatISK(stats.avgProfit, false)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/20">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              {stats.uniqueItems} unique items
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard padding="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-secondary text-sm mb-1">Total Trades</div>
                <div className="text-2xl font-bold text-text-primary">
                  {formatNumber(stats.totalTransactions, 0)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              {stats.completedTrades} completed
            </div>
          </GlassmorphicCard>
        </div>
      )}

      {/* Profit Over Time Chart */}
      {profitTimeline.length > 0 && (
        <GlassmorphicCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display text-text-primary">Profit Timeline</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartPeriod('day')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartPeriod === 'day'
                    ? 'bg-accent-cyan/20 text-accent-cyan'
                    : 'bg-space-dark/50 text-text-secondary hover:text-text-primary'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setChartPeriod('week')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartPeriod === 'week'
                    ? 'bg-accent-cyan/20 text-accent-cyan'
                    : 'bg-space-dark/50 text-text-secondary hover:text-text-primary'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartPeriod('month')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartPeriod === 'month'
                    ? 'bg-accent-cyan/20 text-accent-cyan'
                    : 'bg-space-dark/50 text-text-secondary hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {profitTimeline.slice(-30).map((period, idx) => {
              const barHeight = Math.abs(period.profit) / maxProfit * 100;
              const isProfit = period.profit >= 0;

              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-text-secondary font-mono flex-shrink-0">
                    {period.date}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-8 bg-space-dark/50 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full transition-all ${
                          isProfit
                            ? 'bg-gradient-to-r from-green-500/50 to-green-400/50'
                            : 'bg-gradient-to-r from-red-500/50 to-red-400/50'
                        }`}
                        style={{ width: `${barHeight}%` }}
                      />
                    </div>
                    <div className={`w-32 text-sm font-mono text-right ${
                      isProfit ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}{formatISK(period.profit, false)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {profitTimeline.length > 30 && (
            <p className="mt-4 text-xs text-text-secondary text-center">
              Showing last 30 periods
            </p>
          )}
        </GlassmorphicCard>
      )}

      {/* Trades List */}
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display text-text-primary">Trade Details</h3>
          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary"
            >
              <option value="profit">Sort by Profit</option>
              <option value="margin">Sort by Margin</option>
              <option value="volume">Sort by Volume</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            <span className="ml-3 text-text-secondary">Loading trade history...</span>
          </div>
        )}

        {!loading && sortedTrades.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-accent-cyan/20">
                <tr className="text-text-secondary">
                  <th className="text-left py-3 px-3">Item</th>
                  <th className="text-right py-3 px-3">Profit/Loss</th>
                  <th className="text-right py-3 px-3">Margin</th>
                  <th className="text-right py-3 px-3">Volume</th>
                  <th className="text-right py-3 px-3">Avg Buy</th>
                  <th className="text-right py-3 px-3">Avg Sell</th>
                  <th className="text-right py-3 px-3">Last Trade</th>
                </tr>
              </thead>
              <tbody>
                {sortedTrades.slice(0, 50).map((trade) => (
                  <tr
                    key={trade.typeId}
                    className="border-b border-accent-cyan/10 hover:bg-white/5"
                  >
                    <td className="py-3 px-3 text-text-primary">
                      {trade.typeName}
                      {trade.remainingQty > 0 && (
                        <span className="ml-2 text-xs text-yellow-400">
                          ({formatNumber(trade.remainingQty, 0)} unsold)
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold ${
                      trade.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.totalProfit >= 0 ? '+' : ''}{formatISK(trade.totalProfit, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-text-primary">
                      {formatPercent(trade.profitMargin)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-text-secondary">
                      {formatNumber(trade.totalSold, 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-text-secondary">
                      {formatISK(trade.avgBuyPrice, false)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-text-secondary">
                      {formatISK(trade.avgSellPrice, false)}
                    </td>
                    <td className="py-3 px-3 text-right text-text-secondary text-xs">
                      {formatRelativeTime(trade.lastTradeDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && sortedTrades.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-text-secondary/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-text-secondary">No trades found in this period</p>
          </div>
        )}

        {sortedTrades.length > 50 && (
          <p className="mt-4 text-xs text-text-secondary text-center">
            Showing 50 of {sortedTrades.length} trades
          </p>
        )}
      </GlassmorphicCard>

      {/* Best/Worst Trades */}
      {stats?.bestTrade && stats?.worstTrade && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassmorphicCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-display text-text-primary">Best Trade</h4>
            </div>
            <div className="ml-11">
              <div className="text-text-primary font-medium">{stats.bestTrade.typeName}</div>
              <div className="text-2xl font-bold text-green-400 mt-1">
                +{formatISK(stats.bestTrade.totalProfit, false)}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {formatPercent(stats.bestTrade.profitMargin)} margin
              </div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <h4 className="font-display text-text-primary">Worst Trade</h4>
            </div>
            <div className="ml-11">
              <div className="text-text-primary font-medium">{stats.worstTrade.typeName}</div>
              <div className="text-2xl font-bold text-red-400 mt-1">
                {formatISK(stats.worstTrade.totalProfit, false)}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {formatPercent(stats.worstTrade.profitMargin)} margin
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      )}
    </div>
  );
}

export default TradeHistoryPanel;
