import { useMemo, useState } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * ISKPerHourEstimator - Estimates ISK per hour based on trading activity
 * Uses wallet transactions and order history to calculate actual profitability
 */
export function ISKPerHourEstimator({
  transactions = [],
  activeSession = null,
  historicalData = {},
  className = '',
}) {
  const [timeframe, setTimeframe] = useState('session'); // session, day, week, month

  // Calculate ISK/hour metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const sessionStart = activeSession?.startTime ? new Date(activeSession.startTime) : now;
    const sessionHours = Math.max(0.1, (now - sessionStart) / (1000 * 60 * 60));

    // Filter transactions by timeframe
    const getTimeframeStart = () => {
      switch (timeframe) {
        case 'session':
          return sessionStart;
        case 'day':
          return new Date(now - 24 * 60 * 60 * 1000);
        case 'week':
          return new Date(now - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return new Date(now - 30 * 24 * 60 * 60 * 1000);
        default:
          return sessionStart;
      }
    };

    const timeframeStart = getTimeframeStart();
    const hours = Math.max(0.1, (now - timeframeStart) / (1000 * 60 * 60));

    // Calculate profit from transactions
    const relevantTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= timeframeStart;
    });

    // Group by type (market_escrow, market_transaction, broker_fee, etc.)
    const buyTotal = relevantTransactions
      .filter(t => t.is_buy === true)
      .reduce((sum, t) => sum + Math.abs(t.unit_price * t.quantity), 0);

    const sellTotal = relevantTransactions
      .filter(t => t.is_buy === false)
      .reduce((sum, t) => sum + Math.abs(t.unit_price * t.quantity), 0);

    const grossProfit = sellTotal - buyTotal;
    const brokerFees = relevantTransactions
      .filter(t => t.ref_type === 'brokers_fee')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const salesTax = relevantTransactions
      .filter(t => t.ref_type === 'transaction_tax')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netProfit = grossProfit - brokerFees - salesTax;
    const iskPerHour = netProfit / hours;

    // Calculate transaction count
    const txCount = relevantTransactions.filter(t =>
      t.ref_type === 'market_transaction'
    ).length;

    // Project daily/weekly/monthly earnings
    const projectedDaily = iskPerHour * 24;
    const projectedWeekly = iskPerHour * 24 * 7;
    const projectedMonthly = iskPerHour * 24 * 30;

    return {
      timeframeHours: hours,
      grossProfit,
      netProfit,
      brokerFees,
      salesTax,
      iskPerHour,
      transactionCount: txCount,
      projectedDaily,
      projectedWeekly,
      projectedMonthly,
      efficiency: grossProfit > 0 ? (netProfit / grossProfit) * 100 : 0,
    };
  }, [transactions, activeSession, timeframe]);

  // Historical comparison
  const comparison = useMemo(() => {
    if (!historicalData || !historicalData.avgIskPerHour) return null;

    const diff = metrics.iskPerHour - historicalData.avgIskPerHour;
    const percentDiff = historicalData.avgIskPerHour > 0
      ? (diff / historicalData.avgIskPerHour) * 100
      : 0;

    return {
      historical: historicalData.avgIskPerHour,
      difference: diff,
      percentDiff,
      isAboveAverage: diff > 0,
    };
  }, [metrics.iskPerHour, historicalData]);

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header with main ISK/hour */}
      <div className="p-4 border-b border-accent-cyan/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-text-primary font-medium">ISK/Hour Estimator</h3>
              <p className="text-xs text-text-secondary">
                Based on {metrics.transactionCount} transactions
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${metrics.iskPerHour >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(metrics.iskPerHour, true)}/hr
            </div>
            {comparison && (
              <div className={`text-xs ${comparison.isAboveAverage ? 'text-green-400' : 'text-red-400'}`}>
                {comparison.isAboveAverage ? '▲' : '▼'} {Math.abs(comparison.percentDiff).toFixed(0)}% vs avg
              </div>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="mt-4 flex items-center gap-2">
          {['session', 'day', 'week', 'month'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                timeframe === tf
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
              }`}
            >
              {tf === 'session' ? 'Session' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-4">
        {/* Profit Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-lg font-bold text-green-400">
              {formatISK(metrics.grossProfit, true)}
            </div>
            <div className="text-xs text-text-secondary">Gross Profit</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-lg font-bold text-red-400">
              -{formatISK(metrics.brokerFees + metrics.salesTax, true)}
            </div>
            <div className="text-xs text-text-secondary">Fees & Tax</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className={`text-lg font-bold ${metrics.netProfit >= 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
              {formatISK(metrics.netProfit, true)}
            </div>
            <div className="text-xs text-text-secondary">Net Profit</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg text-center">
            <div className="text-lg font-bold text-accent-gold">
              {metrics.efficiency.toFixed(1)}%
            </div>
            <div className="text-xs text-text-secondary">Efficiency</div>
          </div>
        </div>

        {/* Projections */}
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h4 className="text-sm font-medium text-green-400 mb-3">Projected Earnings</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-text-primary">
                {formatISK(metrics.projectedDaily, true)}
              </div>
              <div className="text-xs text-text-secondary">Daily</div>
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">
                {formatISK(metrics.projectedWeekly, true)}
              </div>
              <div className="text-xs text-text-secondary">Weekly</div>
            </div>
            <div>
              <div className="text-lg font-bold text-text-primary">
                {formatISK(metrics.projectedMonthly, true)}
              </div>
              <div className="text-xs text-text-secondary">Monthly</div>
            </div>
          </div>
        </div>

        {/* Efficiency Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Profit Efficiency</span>
            <span className="text-text-primary">{metrics.efficiency.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-accent-cyan rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics.efficiency)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-secondary">
            <span>Fees: {formatISK(metrics.brokerFees, true)}</span>
            <span>Tax: {formatISK(metrics.salesTax, true)}</span>
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg text-xs text-text-secondary">
          <strong className="text-accent-cyan">Tip:</strong> Train Accounting and Broker Relations
          skills to reduce fees and improve your ISK/hour rate.
        </div>
      </div>
    </div>
  );
}

export default ISKPerHourEstimator;
