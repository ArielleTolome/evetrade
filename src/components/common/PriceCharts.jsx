import { useState, useEffect, useMemo } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * Simple SVG Line Chart for price history
 * Lightweight alternative to chart libraries
 */
function MiniLineChart({ data, width = 200, height = 60, color = '#00d4ff', className = '' }) {
  if (!data || data.length < 2) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-xs text-text-secondary">No data</span>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  // Create area fill path
  const areaPath = `M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className={className}>
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End point dot */}
      {data.length > 0 && (
        <circle
          cx={width - padding}
          cy={padding + chartHeight - ((values[values.length - 1] - minVal) / range) * chartHeight}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
}

/**
 * Price History Card - Shows historical price trends
 * Similar to EVE Tycoon's "Buy Price History" panel
 */
export function PriceHistoryCard({
  itemName,
  typeId,
  regionId,
  historyData = [],
  currentBuyPrice,
  currentSellPrice,
  onCopyPrice,
  className = ''
}) {
  const [timeRange, setTimeRange] = useState('7d');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    const now = new Date();
    const ranges = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const days = ranges[timeRange] || 7;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return historyData.filter(d => new Date(d.date) >= cutoff);
  }, [historyData, timeRange]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { avg: 0, min: 0, max: 0, change: 0, changePercent: 0 };
    }

    const prices = filteredData.map(d => d.average || d.value || 0);
    const volumes = filteredData.map(d => d.volume || 0);

    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const totalVolume = volumes.reduce((sum, v) => sum + v, 0);

    const firstPrice = prices[0] || 0;
    const lastPrice = prices[prices.length - 1] || 0;
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;

    return { avg, min, max, change, changePercent, totalVolume };
  }, [filteredData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredData.map(d => ({
      value: d.average || d.value || 0,
      date: d.date,
    }));
  }, [filteredData]);

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-accent-cyan/10">
        <div>
          <h3 className="text-sm font-medium text-text-primary truncate max-w-[200px]">
            {itemName || `Type ${typeId}`}
          </h3>
          <span className="text-xs text-text-secondary">Price History</span>
        </div>
        <div className="flex gap-1">
          {['1d', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRange === range
                  ? 'bg-accent-cyan/20 text-accent-cyan'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-3">
        <MiniLineChart
          data={chartData}
          width={280}
          height={80}
          color={stats.change >= 0 ? '#00ff88' : '#ff4444'}
          className="w-full"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-space-dark/30">
        <div className="text-center p-2 rounded bg-space-dark/50">
          <div className="text-[10px] text-text-secondary uppercase">Avg Price</div>
          <div className="text-sm font-mono text-text-primary">{formatISK(stats.avg, true)}</div>
        </div>
        <div className="text-center p-2 rounded bg-space-dark/50">
          <div className="text-[10px] text-text-secondary uppercase">Change</div>
          <div className={`text-sm font-mono ${stats.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.change >= 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-2 rounded bg-space-dark/50">
          <div className="text-[10px] text-text-secondary uppercase">Min</div>
          <div className="text-sm font-mono text-red-400">{formatISK(stats.min, true)}</div>
        </div>
        <div className="text-center p-2 rounded bg-space-dark/50">
          <div className="text-[10px] text-text-secondary uppercase">Max</div>
          <div className="text-sm font-mono text-green-400">{formatISK(stats.max, true)}</div>
        </div>
      </div>

      {/* Current Prices with Copy */}
      {(currentBuyPrice || currentSellPrice) && (
        <div className="flex gap-2 p-3 border-t border-accent-cyan/10">
          {currentBuyPrice && (
            <CopyPriceButton
              label="Buy At"
              price={currentBuyPrice}
              color="red"
              onCopy={onCopyPrice}
            />
          )}
          {currentSellPrice && (
            <CopyPriceButton
              label="Sell At"
              price={currentSellPrice}
              color="green"
              onCopy={onCopyPrice}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Copy Price Button - Individual price with copy functionality
 */
function CopyPriceButton({ label, price, color, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(price.toFixed(2));
      setCopied(true);
      onCopy?.(`${label} price copied: ${formatISK(price, false)}`);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const colorClasses = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
    green: 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20',
    cyan: 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20',
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex-1 flex items-center justify-between p-2 rounded-lg border transition-all ${
        copied ? 'bg-green-500/20 border-green-500/50 text-green-400' : colorClasses[color]
      }`}
    >
      <div className="text-left">
        <div className="text-[10px] text-text-secondary">{label}</div>
        <div className="text-sm font-mono">{formatISK(price, false)}</div>
      </div>
      {copied ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

/**
 * Bought Items Summary - Like EVE Tycoon's bought items table
 */
export function BoughtItemsSummary({
  items = [],
  onCopyPrice,
  className = ''
}) {
  if (!items || items.length === 0) {
    return (
      <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl p-4 text-center ${className}`}>
        <span className="text-sm text-text-secondary">No bought items data</span>
      </div>
    );
  }

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-accent-cyan/10">
        <h3 className="text-sm font-medium text-accent-cyan">Bought Items Summary</h3>
        <span className="text-xs text-text-secondary">Track your purchases and remaining inventory</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-space-dark/50">
            <tr className="text-text-secondary">
              <th className="text-left p-2">Item</th>
              <th className="text-right p-2">Avg Buy</th>
              <th className="text-right p-2">Market Sell</th>
              <th className="text-right p-2">Bought</th>
              <th className="text-right p-2">Sold</th>
              <th className="text-right p-2">Remaining</th>
              <th className="text-right p-2">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-cyan/5">
            {items.map((item, idx) => {
              const profitPerUnit = (item.marketSell || 0) - (item.avgBuyPrice || 0);
              const isProfitable = profitPerUnit > 0;

              return (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-2 text-text-primary">{item.name}</td>
                  <td className="p-2 text-right font-mono text-red-400">
                    {formatISK(item.avgBuyPrice, true)}
                  </td>
                  <td className="p-2 text-right">
                    <span className={`font-mono ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                      {formatISK(item.marketSell, true)}
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono text-text-secondary">
                    {formatNumber(item.totalBought, 0)}
                  </td>
                  <td className="p-2 text-right font-mono text-text-secondary">
                    {formatNumber(item.totalSold, 0)}
                  </td>
                  <td className="p-2 text-right font-mono text-text-primary">
                    {formatNumber(item.remaining, 0)}
                  </td>
                  <td className="p-2 text-right font-mono text-accent-gold">
                    {formatISK(item.remaining * (item.marketSell || item.avgBuyPrice), true)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Compact Price Chart for inline display
 */
export function InlinePriceChart({
  historyData = [],
  width = 80,
  height = 24,
  showTrend = true,
}) {
  if (!historyData || historyData.length < 2) {
    return <span className="text-xs text-text-secondary">-</span>;
  }

  const values = historyData.map(d => d.average || d.value || 0);
  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const change = lastVal - firstVal;
  const isPositive = change >= 0;

  return (
    <div className="flex items-center gap-2">
      <MiniLineChart
        data={historyData.map(d => ({ value: d.average || d.value || 0 }))}
        width={width}
        height={height}
        color={isPositive ? '#00ff88' : '#ff4444'}
      />
      {showTrend && (
        <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '▲' : '▼'}
        </span>
      )}
    </div>
  );
}

export default {
  PriceHistoryCard,
  BoughtItemsSummary,
  InlinePriceChart,
  MiniLineChart,
};
