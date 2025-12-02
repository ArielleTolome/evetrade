import { useState, useMemo } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * Profit Summary Card - Shows key profit metrics like EVE Tycoon
 */
export function ProfitSummaryCard({
  trades = [],
  period = '30d',
  walletBalance = null,
  className = ''
}) {
  // Calculate profit metrics from trades
  const metrics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalProfit: 0,
        tradeCount: 0,
        avgProfit: 0,
        bestTrade: null,
        totalVolume: 0,
        avgMargin: 0,
      };
    }

    const profits = trades.map(t => t['Net Profit'] || 0);
    const totalProfit = profits.reduce((sum, p) => sum + p, 0);
    const margins = trades.map(t => (t['Gross Margin'] || 0) / 100);
    const avgMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;
    const totalVolume = trades.reduce((sum, t) => sum + (t['Volume'] || 0), 0);

    // Find best trade by profit
    const bestTrade = trades.reduce((best, t) =>
      (t['Net Profit'] || 0) > (best?.['Net Profit'] || 0) ? t : best
    , null);

    return {
      totalProfit,
      tradeCount: trades.length,
      avgProfit: trades.length > 0 ? totalProfit / trades.length : 0,
      bestTrade,
      totalVolume,
      avgMargin,
    };
  }, [trades]);

  const periodLabels = {
    '1d': 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    'all': 'All Time',
  };

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display text-accent-cyan">
          Profit Summary
        </h3>
        <span className="text-xs text-text-secondary bg-space-dark/50 px-2 py-1 rounded">
          {periodLabels[period] || period}
        </span>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricBox
          label="Total Profit"
          value={formatISK(metrics.totalProfit, true)}
          color="text-green-400"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricBox
          label="Opportunities"
          value={formatNumber(metrics.tradeCount, 0)}
          color="text-accent-cyan"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <MetricBox
          label="Avg Profit"
          value={formatISK(metrics.avgProfit, true)}
          color="text-accent-gold"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <MetricBox
          label="Avg Margin"
          value={formatPercent(metrics.avgMargin, 1)}
          color="text-accent-purple"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
      </div>

      {/* Wallet & Best Trade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {walletBalance !== null && (
          <div className="flex items-center gap-3 p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
            <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <div className="text-xs text-text-secondary">Wallet Balance</div>
              <div className="text-sm font-mono text-accent-gold font-medium">
                {formatISK(walletBalance, true)}
              </div>
            </div>
          </div>
        )}

        {metrics.bestTrade && (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-text-secondary">Best Opportunity</div>
              <div className="text-sm text-green-400 font-medium truncate">
                {metrics.bestTrade.Item}
              </div>
              <div className="text-xs text-text-secondary">
                {formatISK(metrics.bestTrade['Net Profit'], true)} profit
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Metric Box - Individual stat display
 */
function MetricBox({ label, value, color, icon }) {
  return (
    <div className="p-3 bg-space-dark/50 rounded-lg border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className={`text-lg font-mono font-medium ${color}`}>
        {value}
      </div>
    </div>
  );
}

/**
 * Rolling Profit Stats - Like EVE Tycoon's 30d rolling stats
 */
export function RollingProfitStats({
  tradeIncome = 0,
  tradePurchases = 0,
  salesTax = 0,
  brokerFees = 0,
  buyTransactions = 0,
  sellTransactions = 0,
  className = ''
}) {
  const netProfit = tradeIncome - tradePurchases - salesTax - brokerFees;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 ${className}`}>
      <StatPill label="Trade Income" value={formatISK(tradeIncome, true)} color="text-green-400" />
      <StatPill label="Trade Purchases" value={formatISK(tradePurchases, true)} color="text-red-400" />
      <StatPill label="Sales Tax" value={formatISK(salesTax, true)} color="text-orange-400" />
      <StatPill label="Broker Fees" value={formatISK(brokerFees, true)} color="text-orange-400" />
      <StatPill label="Buy Transactions" value={formatNumber(buyTransactions, 0)} color="text-text-primary" />
      <StatPill label="Sell Transactions" value={formatNumber(sellTransactions, 0)} color="text-text-primary" />
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col p-2 bg-space-dark/50 rounded-lg border border-white/5">
      <span className="text-[10px] text-text-secondary truncate">{label}</span>
      <span className={`text-sm font-mono font-medium ${color}`}>{value}</span>
    </div>
  );
}

/**
 * Simple Profit Chart - Visual bar representation
 */
export function SimpleProfitChart({ data = [], maxBars = 7, className = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-4 bg-space-dark/50 rounded-lg border border-white/5 text-center ${className}`}>
        <span className="text-sm text-text-secondary">No profit data available</span>
      </div>
    );
  }

  const maxProfit = Math.max(...data.map(d => Math.abs(d.profit)));
  const displayData = data.slice(-maxBars);

  return (
    <div className={`p-4 bg-space-dark/50 rounded-lg border border-white/5 ${className}`}>
      <div className="flex items-end justify-between h-32 gap-1">
        {displayData.map((item, idx) => {
          const height = maxProfit > 0 ? (Math.abs(item.profit) / maxProfit) * 100 : 0;
          const isPositive = item.profit >= 0;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${item.label}: ${formatISK(item.profit, true)}`}
            >
              <div className="w-full flex flex-col justify-end h-24">
                <div
                  className={`w-full rounded-t transition-all ${
                    isPositive ? 'bg-green-500/60' : 'bg-red-500/60'
                  }`}
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-[9px] text-text-secondary truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Trade Activity Feed - Recent trade activity
 */
export function TradeActivityFeed({ trades = [], maxItems = 5, className = '' }) {
  const recentTrades = trades.slice(0, maxItems);

  if (recentTrades.length === 0) {
    return (
      <div className={`p-4 bg-space-dark/50 rounded-lg border border-white/5 text-center ${className}`}>
        <span className="text-sm text-text-secondary">No recent activity</span>
      </div>
    );
  }

  return (
    <div className={`bg-space-dark/50 rounded-lg border border-white/5 overflow-hidden ${className}`}>
      <div className="px-4 py-2 border-b border-white/5">
        <span className="text-xs font-medium text-accent-cyan">Recent Activity</span>
      </div>
      <div className="divide-y divide-white/5">
        {recentTrades.map((trade, idx) => (
          <div key={idx} className="px-4 py-2 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-primary truncate">{trade.Item}</div>
              <div className="text-xs text-text-secondary">
                {formatISK(trade['Buy Price'], false)} → {formatISK(trade['Sell Price'], false)}
              </div>
            </div>
            <div className="text-right ml-3">
              <div className="text-sm text-green-400 font-mono">
                +{formatISK(trade['Net Profit'], true)}
              </div>
              <div className="text-xs text-text-secondary">
                {formatPercent((trade['Gross Margin'] || 0) / 100, 1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  ProfitSummaryCard,
  RollingProfitStats,
  SimpleProfitChart,
  TradeActivityFeed,
};
