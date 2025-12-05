import { useMemo, useState } from 'react';
import { formatISK, formatRelativeTime, formatNumber } from '../../utils/formatters';
import GlassmorphicCard from './GlassmorphicCard';

/**
 * Generate mock price history with timestamps
 * Used as fallback when no external data is provided
 */
function generateDetailedPriceHistory(currentPrice, days = 30, volatility = 0.08) {
  const history = [];
  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  let price = currentPrice * (1 - volatility);

  for (let i = days - 1; i >= 0; i--) {
    const timestamp = now - (i * millisecondsPerDay);
    // Add some daily volatility
    const dailyChange = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price * 0.85, Math.min(price * 1.15, price + dailyChange));

    history.push({
      timestamp,
      price: price,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }

  // Ensure last price matches current price
  history[history.length - 1].price = currentPrice;

  return history;
}

/**
 * Convert ESI market history data to chart format
 * ESI returns: [{date, average, highest, lowest, order_count, volume}, ...]
 */
function convertESIHistoryToChartData(esiHistory) {
  if (!esiHistory || esiHistory.length === 0) return [];

  return esiHistory.map(day => ({
    timestamp: new Date(day.date).getTime(),
    price: day.average,
    high: day.highest,
    low: day.lowest,
    volume: day.volume,
    orderCount: day.order_count,
  }));
}

/**
 * Calculate SVG path and area from price points
 */
function calculateChartPath(data, width, height, padding = 40) {
  const fallbackPrice = data?.[0]?.price ?? 0;

  if (!data || data.length < 2) {
    return {
      linePath: '',
      areaPath: '',
      points: [],
      min: fallbackPrice,
      max: fallbackPrice,
    };
  }

  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data.map((item, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (item.price - min) / range) * (height - padding * 2);
    return { x, y, ...item };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return { linePath, areaPath, points, min, max };
}

/**
 * Format Y-axis labels
 */
function formatYAxisLabel(value) {
  return formatISK(value, false);
}

/**
 * PriceHistoryChart Component
 * Displays a detailed price history chart with hover interactions
 *
 * @param {number} price - Current price value (used for mock data if no historyData provided)
 * @param {Array} historyData - Optional ESI market history data [{date, average, highest, lowest, order_count, volume}, ...]
 * @param {number} width - Width of the chart in pixels
 * @param {number} height - Height of the chart in pixels
 * @param {number} days - Number of days of history to show
 * @param {string} title - Chart title
 * @param {string} className - Additional CSS classes
 * @param {boolean} loading - Show loading state
 */
export function PriceHistoryChart({
  price,
  historyData,
  width = 600,
  height = 300,
  days = 30,
  title = 'Price History',
  className = '',
  loading = false,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Stable timestamp for calculations (initialized once on mount)
  const [mountTimestamp] = useState(() => Date.now());

  // Use ESI data if provided, otherwise generate mock data
  const data = useMemo(() => {
    if (historyData && historyData.length > 0) {
      const converted = convertESIHistoryToChartData(historyData);
      // Filter to only show last N days
      const cutoffDate = mountTimestamp - (days * 24 * 60 * 60 * 1000);
      return converted.filter(d => d.timestamp >= cutoffDate);
    }
    return generateDetailedPriceHistory(price, days);
  }, [historyData, price, days, mountTimestamp]);

  const { linePath, areaPath, points, min, max } = useMemo(
    () => calculateChartPath(data, width, height),
    [data, width, height]
  );

  // Handle empty data case
  if (loading) {
    return (
      <GlassmorphicCard className={className}>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="ml-3 text-text-secondary">Loading price history...</span>
        </div>
      </GlassmorphicCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="text-center py-8 text-text-secondary">
          No price history available
        </div>
      </GlassmorphicCard>
    );
  }

  // Calculate current price from data or use provided price
  const currentPrice = data[data.length - 1]?.price || price;
  const trend = currentPrice >= data[0].price ? 'up' : 'down';
  const trendPercent = ((currentPrice - data[0].price) / data[0].price) * 100;

  const strokeColor = trend === 'up' ? '#4ade80' : '#f87171';
  const gradientId = `price-history-gradient-${price}`;

  const handleMouseMove = (e) => {
    if (!points || points.length === 0) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest point
    const closest = points.reduce((prev, curr) => {
      return Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev;
    });

    setHoveredPoint(closest);
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Y-axis labels
  const yAxisLabels = [
    { value: max, label: formatYAxisLabel(max) },
    { value: (max + min) / 2, label: formatYAxisLabel((max + min) / 2) },
    { value: min, label: formatYAxisLabel(min) },
  ];

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-accent-cyan">{title}</h3>
            <p className="text-sm text-gray-400">Last {days} days</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatISK(currentPrice, false)}
            </div>
            <div className={`text-sm font-mono ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendPercent >= 0 ? '+' : ''}
              {trendPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative">
          <svg
            width={width}
            height={height}
            className="overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = 40 + ratio * (height - 80);
              return (
                <line
                  key={ratio}
                  x1={40}
                  y1={y}
                  x2={width - 40}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Y-axis labels */}
            {yAxisLabels.map((item, i) => {
              const y = 40 + (i / (yAxisLabels.length - 1)) * (height - 80);
              return (
                <text
                  key={i}
                  x={35}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-400"
                  style={{ fontSize: '10px' }}
                >
                  {item.label}
                </text>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover indicator */}
            {hoveredPoint && (
              <>
                {/* Vertical line */}
                <line
                  x1={hoveredPoint.x}
                  y1={40}
                  x2={hoveredPoint.x}
                  y2={height - 40}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Point */}
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="4"
                  fill={strokeColor}
                  stroke="white"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-space-black border border-accent-cyan/30 rounded px-3 py-2 text-sm whitespace-nowrap z-50 pointer-events-none"
              style={{
                left: `${mousePosition.x + 10}px`,
                top: `${mousePosition.y - 10}px`,
                transform: mousePosition.x > width / 2 ? 'translateX(-100%) translateX(-20px)' : 'none',
              }}
            >
              <div className="text-accent-cyan font-semibold">
                {formatISK(hoveredPoint.price, false)}
              </div>
              {hoveredPoint.high && hoveredPoint.low && (
                <div className="text-gray-400 text-xs">
                  <span className="text-green-400">H: {formatISK(hoveredPoint.high, false)}</span>
                  {' / '}
                  <span className="text-red-400">L: {formatISK(hoveredPoint.low, false)}</span>
                </div>
              )}
              <div className="text-gray-400 text-xs">
                {formatRelativeTime(hoveredPoint.timestamp)}
              </div>
              <div className="text-gray-400 text-xs">
                Volume: {formatNumber(hoveredPoint.volume, 0)}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-accent-cyan/20">
          <div>
            <div className="text-xs text-gray-400">High</div>
            <div className="text-sm font-mono text-green-400">{formatYAxisLabel(max)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Average</div>
            <div className="text-sm font-mono text-white">
              {formatYAxisLabel(data.reduce((sum, d) => sum + d.price, 0) / data.length)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Low</div>
            <div className="text-sm font-mono text-red-400">{formatYAxisLabel(min)}</div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default PriceHistoryChart;
