import { useMemo, useState, useEffect, useRef } from 'react';
import { formatISK, formatPercent, formatNumber } from '../../utils/formatters';

/**
 * Animated number component
 */
function AnimatedNumber({ value, format = 'number', duration = 500 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    previousValue.current = value;
  }, [value, duration]);

  const formatted = useMemo(() => {
    switch (format) {
      case 'isk': return formatISK(displayValue, false);
      case 'percent': return formatPercent(displayValue / 100, 1);
      case 'number': return formatNumber(Math.round(displayValue), 0);
      default: return Math.round(displayValue);
    }
  }, [displayValue, format]);

  return <span>{formatted}</span>;
}

/**
 * Individual stat card
 */
function StatCard({
  label,
  value,
  format = 'number',
  icon,
  color = 'cyan',
  trend = null, // 'up' | 'down' | null
  onClick,
  description,
}) {
  const colorClasses = {
    cyan: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30',
    gold: 'text-accent-gold bg-accent-gold/10 border-accent-gold/30',
    green: 'text-green-400 bg-green-400/10 border-green-400/30',
    red: 'text-red-400 bg-red-400/10 border-red-400/30',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border ${colorClasses[color]} ${onClick ? 'cursor-pointer hover:bg-opacity-20' : ''} transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold font-mono">
        <AnimatedNumber value={value} format={format} />
      </div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
      {description && (
        <div className="text-xs text-text-secondary/70 mt-1">{description}</div>
      )}
    </div>
  );
}

/**
 * Quick Stats Widget
 */
export function QuickStats({ trades = [], onFilterClick, compact = false }) {
  const stats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        bestProfit: 0,
        avgMargin: 0,
        totalPotentialProfit: 0,
        highVolumeTrades: 0,
        lowRiskTrades: 0,
        scamWarnings: 0,
        bestTrade: null,
      };
    }

    let totalMargin = 0;
    let totalProfit = 0;
    let highVolume = 0;
    let lowRisk = 0;
    let scams = 0;
    let bestProfit = 0;
    let bestTrade = null;

    trades.forEach(trade => {
      const margin = trade['Gross Margin'] || 0;
      const volume = trade['Volume'] || 0;
      const profit = trade['Net Profit'] || 0;

      totalMargin += margin;
      totalProfit += profit;

      if (profit > bestProfit) {
        bestProfit = profit;
        bestTrade = trade;
      }

      if (volume >= 100) highVolume++;
      if (volume >= 50 && margin >= 10 && margin <= 30) lowRisk++;
      if (volume === 1) scams++;
    });

    return {
      totalTrades: trades.length,
      bestProfit,
      avgMargin: trades.length > 0 ? totalMargin / trades.length : 0,
      totalPotentialProfit: totalProfit,
      highVolumeTrades: highVolume,
      lowRiskTrades: lowRisk,
      scamWarnings: scams,
      bestTrade,
    };
  }, [trades]);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-cyan/10 rounded-lg">
          <span className="text-accent-cyan font-bold">{stats.totalTrades}</span>
          <span className="text-xs text-text-secondary">Trades</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-400/10 rounded-lg">
          <span className="text-green-400 font-bold font-mono">{formatISK(stats.bestProfit, false)}</span>
          <span className="text-xs text-text-secondary">Best</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-gold/10 rounded-lg">
          <span className="text-accent-gold font-bold">{formatPercent(stats.avgMargin / 100, 1)}</span>
          <span className="text-xs text-text-secondary">Avg Margin</span>
        </div>
        {stats.scamWarnings > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-400/10 rounded-lg">
            <span className="text-red-400 font-bold">{stats.scamWarnings}</span>
            <span className="text-xs text-text-secondary">⚠️ Scam Warnings</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      <StatCard
        label="Total Trades"
        value={stats.totalTrades}
        icon="📊"
        color="cyan"
      />
      <StatCard
        label="Best Profit"
        value={stats.bestProfit}
        format="isk"
        icon="💰"
        color="green"
        onClick={() => onFilterClick?.('bestProfit')}
        description={stats.bestTrade?.['Item']?.substring(0, 15)}
      />
      <StatCard
        label="Avg Margin"
        value={stats.avgMargin}
        format="percent"
        icon="📈"
        color="gold"
      />
      <StatCard
        label="Total Potential"
        value={stats.totalPotentialProfit}
        format="isk"
        icon="💎"
        color="purple"
      />
      <StatCard
        label="High Volume"
        value={stats.highVolumeTrades}
        icon="🔥"
        color="cyan"
        onClick={() => onFilterClick?.('highVolume')}
        description="Volume ≥100"
      />
      <StatCard
        label="Low Risk"
        value={stats.lowRiskTrades}
        icon="🛡️"
        color="green"
        onClick={() => onFilterClick?.('lowRisk')}
        description="Safe trades"
      />
      {stats.scamWarnings > 0 && (
        <StatCard
          label="Scam Warnings"
          value={stats.scamWarnings}
          icon="⚠️"
          color="red"
          onClick={() => onFilterClick?.('scams')}
          description="Volume = 1"
        />
      )}
    </div>
  );
}

export { AnimatedNumber, StatCard };
export default QuickStats;
