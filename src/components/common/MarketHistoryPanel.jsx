import { useState, useMemo } from 'react';
import { formatISK, formatNumber, formatRelativeTime } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(data, period) {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.average, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

/**
 * Calculate Donchian Channel (highest high, lowest low over period)
 */
function calculateDonchian(data, period) {
  const upper = [];
  const lower = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const window = data.slice(i - period + 1, i + 1);
      upper.push(Math.max(...window.map(d => d.highest)));
      lower.push(Math.min(...window.map(d => d.lowest)));
    }
  }
  return { upper, lower };
}

/**
 * Market History Chart with Moving Averages and Volume
 */
export function MarketHistoryChart({
  historyData,
  width = 700,
  height = 350,
  title = 'Price History',
  className = '',
  loading = false,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showIndicators, setShowIndicators] = useState({
    median: true,
    minMax: true,
    sma5: true,
    sma20: true,
    donchian: false,
    volume: true,
  });

  // Process data
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return null;

    // Sort by date ascending
    const sorted = [...historyData].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate indicators
    const sma5 = calculateSMA(sorted, 5);
    const sma20 = calculateSMA(sorted, 20);
    const donchian = calculateDonchian(sorted, 20);

    // Find min/max for scaling
    const allPrices = sorted.flatMap(d => [d.highest, d.lowest]);
    const priceMin = Math.min(...allPrices);
    const priceMax = Math.max(...allPrices);
    const priceRange = priceMax - priceMin || 1;

    const volumes = sorted.map(d => d.volume);
    const volumeMax = Math.max(...volumes);

    return {
      data: sorted,
      sma5,
      sma20,
      donchian,
      priceMin,
      priceMax,
      priceRange,
      volumeMax,
    };
  }, [historyData]);

  if (loading) {
    return (
      <GlassmorphicCard className={className}>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="ml-3 text-text-secondary">Loading market history...</span>
        </div>
      </GlassmorphicCard>
    );
  }

  if (!chartData || chartData.data.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="text-center py-8 text-text-secondary">
          No market history available
        </div>
      </GlassmorphicCard>
    );
  }

  const { data, sma5, sma20, donchian, priceMin, priceMax, priceRange, volumeMax } = chartData;
  const padding = { top: 20, right: 60, bottom: 80, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom - 60; // Reserve space for volume
  const volumeHeight = 50;

  // Convert data point to SVG coordinates
  const toX = (index) => padding.left + (index / (data.length - 1)) * chartWidth;
  const toY = (price) => padding.top + (1 - (price - priceMin) / priceRange) * chartHeight;
  const toVolumeY = (volume) => height - padding.bottom + volumeHeight - (volume / volumeMax) * volumeHeight;

  // Generate path for line data
  const generateLinePath = (values) => {
    return values
      .map((val, i) => val !== null ? `${i === 0 || values[i-1] === null ? 'M' : 'L'} ${toX(i)} ${toY(val)}` : '')
      .filter(Boolean)
      .join(' ');
  };

  // Current values
  const currentData = data[data.length - 1];
  const prevData = data[data.length - 2];
  const priceChange = currentData.average - prevData?.average || 0;
  const priceChangePercent = prevData ? ((priceChange / prevData.average) * 100) : 0;

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-accent-cyan">{title}</h3>
            <p className="text-sm text-gray-400">{data.length} days of history</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatISK(currentData.average, false)}
            </div>
            <div className={`text-sm font-mono ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '↑' : '↓'} {formatISK(Math.abs(priceChange), false)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Indicator Toggle */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { key: 'median', label: 'Median Price', color: 'bg-orange-400' },
            { key: 'minMax', label: 'Min/Max', color: 'bg-gray-400' },
            { key: 'sma5', label: 'MA (5d)', color: 'bg-cyan-400' },
            { key: 'sma20', label: 'MA (20d)', color: 'bg-yellow-400' },
            { key: 'donchian', label: 'Donchian', color: 'bg-purple-400' },
            { key: 'volume', label: 'Volume', color: 'bg-blue-400' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setShowIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded border transition-all
                ${showIndicators[key]
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 bg-transparent opacity-50'
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="relative overflow-x-auto">
          <svg
            width={width}
            height={height}
            className="overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + ratio * chartHeight;
              const price = priceMax - ratio * priceRange;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-gray-500 text-[10px]"
                  >
                    {formatISK(price, false)}
                  </text>
                </g>
              );
            })}

            {/* Donchian Channel */}
            {showIndicators.donchian && (
              <path
                d={`
                  ${donchian.upper.map((val, i) => val !== null ? `${i === 0 || donchian.upper[i-1] === null ? 'M' : 'L'} ${toX(i)} ${toY(val)}` : '').filter(Boolean).join(' ')}
                  ${donchian.lower.slice().reverse().map((val, i) => val !== null ? `L ${toX(data.length - 1 - i)} ${toY(val)}` : '').filter(Boolean).join(' ')}
                  Z
                `}
                fill="rgba(168, 85, 247, 0.1)"
                stroke="none"
              />
            )}

            {/* Min/Max range as area */}
            {showIndicators.minMax && (
              <path
                d={`
                  ${data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.highest)}`).join(' ')}
                  ${data.slice().reverse().map((d, i) => `L ${toX(data.length - 1 - i)} ${toY(d.lowest)}`).join(' ')}
                  Z
                `}
                fill="rgba(156, 163, 175, 0.1)"
                stroke="none"
              />
            )}

            {/* Volume bars */}
            {showIndicators.volume && data.map((d, i) => {
              const barWidth = Math.max(1, chartWidth / data.length - 1);
              return (
                <rect
                  key={`vol-${i}`}
                  x={toX(i) - barWidth / 2}
                  y={toVolumeY(d.volume)}
                  width={barWidth}
                  height={height - padding.bottom + volumeHeight - toVolumeY(d.volume)}
                  fill="url(#volumeGradient)"
                />
              );
            })}

            {/* 20-day MA */}
            {showIndicators.sma20 && (
              <path
                d={generateLinePath(sma20)}
                fill="none"
                stroke="#facc15"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}

            {/* 5-day MA */}
            {showIndicators.sma5 && (
              <path
                d={generateLinePath(sma5)}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
              />
            )}

            {/* Median Price Line */}
            {showIndicators.median && (
              <path
                d={data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.average)}`).join(' ')}
                fill="none"
                stroke="#fb923c"
                strokeWidth="2"
              />
            )}

            {/* Hover interaction areas */}
            {data.map((d, i) => (
              <rect
                key={i}
                x={toX(i) - chartWidth / data.length / 2}
                y={padding.top}
                width={chartWidth / data.length}
                height={chartHeight + volumeHeight + 10}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            ))}

            {/* Hover line and point */}
            {hoveredIndex !== null && (
              <>
                <line
                  x1={toX(hoveredIndex)}
                  y1={padding.top}
                  x2={toX(hoveredIndex)}
                  y2={height - padding.bottom + volumeHeight}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={toX(hoveredIndex)}
                  cy={toY(data[hoveredIndex].average)}
                  r="5"
                  fill="#fb923c"
                  stroke="white"
                  strokeWidth="2"
                />
              </>
            )}

            {/* X-axis date labels */}
            {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i, arr) => {
              const actualIndex = data.indexOf(d);
              const date = new Date(d.date);
              return (
                <text
                  key={i}
                  x={toX(actualIndex)}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-gray-500 text-[10px]"
                >
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="absolute bg-space-black border border-accent-cyan/30 rounded-lg px-3 py-2 text-sm z-50 pointer-events-none shadow-lg"
              style={{
                left: `${Math.min(toX(hoveredIndex) + 10, width - 200)}px`,
                top: `${Math.max(toY(data[hoveredIndex].average) - 80, 10)}px`,
              }}
            >
              <div className="text-gray-400 text-xs mb-1">
                {new Date(data[hoveredIndex].date).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                })}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-gray-400">Average:</span>
                <span className="text-orange-400 font-mono">{formatISK(data[hoveredIndex].average, false)}</span>
                <span className="text-gray-400">High:</span>
                <span className="text-green-400 font-mono">{formatISK(data[hoveredIndex].highest, false)}</span>
                <span className="text-gray-400">Low:</span>
                <span className="text-red-400 font-mono">{formatISK(data[hoveredIndex].lowest, false)}</span>
                <span className="text-gray-400">Volume:</span>
                <span className="text-blue-400 font-mono">{formatNumber(data[hoveredIndex].volume, 0)}</span>
                <span className="text-gray-400">Orders:</span>
                <span className="text-gray-300 font-mono">{formatNumber(data[hoveredIndex].order_count, 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-accent-cyan/20">
          <div>
            <div className="text-xs text-gray-400">Period High</div>
            <div className="text-sm font-mono text-green-400">{formatISK(priceMax, false)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Period Low</div>
            <div className="text-sm font-mono text-red-400">{formatISK(priceMin, false)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Avg Volume</div>
            <div className="text-sm font-mono text-blue-400">
              {formatNumber(data.reduce((sum, d) => sum + d.volume, 0) / data.length, 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Volatility</div>
            <div className="text-sm font-mono text-purple-400">
              {((priceMax - priceMin) / ((priceMax + priceMin) / 2) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Market History Table - Shows raw daily data like EVE's in-game view
 */
export function MarketHistoryTable({
  historyData,
  className = '',
  loading = false,
  maxRows = 20,
}) {
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const sortedData = useMemo(() => {
    if (!historyData) return [];

    return [...historyData].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'orders':
          aVal = a.order_count;
          bVal = b.order_count;
          break;
        case 'quantity':
          aVal = a.volume;
          bVal = b.volume;
          break;
        case 'low':
          aVal = a.lowest;
          bVal = b.lowest;
          break;
        case 'high':
          aVal = a.highest;
          bVal = b.highest;
          break;
        case 'avg':
          aVal = a.average;
          bVal = b.average;
          break;
        default:
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
      }

      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }).slice(0, maxRows);
  }, [historyData, sortField, sortDir, maxRows]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  if (loading) {
    return (
      <GlassmorphicCard className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="ml-3 text-text-secondary">Loading history...</span>
        </div>
      </GlassmorphicCard>
    );
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="text-center py-6 text-text-secondary">
          No history data available
        </div>
      </GlassmorphicCard>
    );
  }

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'orders', label: 'Orders' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'low', label: 'Low' },
    { key: 'high', label: 'High' },
    { key: 'avg', label: 'Avg' },
  ];

  return (
    <GlassmorphicCard className={className}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-accent-cyan/20">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent-cyan transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key && (
                      <span className="text-accent-cyan">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={row.date}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx === 0 ? 'bg-accent-cyan/5' : ''}`}
              >
                <td className="px-3 py-2 text-text-primary whitespace-nowrap">
                  {new Date(row.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  })}
                </td>
                <td className="px-3 py-2 text-text-secondary font-mono text-right">
                  {formatNumber(row.order_count, 0)}
                </td>
                <td className="px-3 py-2 text-accent-cyan font-mono text-right">
                  {formatNumber(row.volume, 0)}
                </td>
                <td className="px-3 py-2 text-red-400 font-mono text-right">
                  {formatISK(row.lowest, false)}
                </td>
                <td className="px-3 py-2 text-green-400 font-mono text-right">
                  {formatISK(row.highest, false)}
                </td>
                <td className="px-3 py-2 text-text-primary font-mono text-right">
                  {formatISK(row.average, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyData && historyData.length > maxRows && (
        <div className="text-center py-2 text-text-secondary text-xs border-t border-white/5">
          Showing {maxRows} of {historyData.length} days
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default MarketHistoryChart;
