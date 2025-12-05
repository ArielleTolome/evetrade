import { useMemo, useState } from 'react';
import { formatISK } from '../../utils/formatters';

/**
 * Generate mock price history based on current price
 * In production, this would come from an API
 */
function generatePriceHistory(currentPrice, points = 7, volatility = 0.05) {
  const history = [];
  let price = currentPrice * (1 - volatility * 2 + Math.random() * volatility * 2);

  for (let i = 0; i < points - 1; i++) {
    history.push(price);
    // Random walk with slight upward bias toward current price
    const change = (Math.random() - 0.45) * volatility * price;
    price = Math.max(price * 0.9, Math.min(price * 1.1, price + change));
  }
  history.push(currentPrice);

  return history;
}

/**
 * Calculate SVG path from price points
 */
function calculatePath(prices, width, height, padding = 2) {
  if (!prices || prices.length < 2) return '';

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices.map((price, i) => {
    const x = padding + (i / (prices.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (price - min) / range) * (height - padding * 2);
    return { x, y };
  });

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

/**
 * PriceSparkline Component
 * Displays a mini sparkline chart showing price trend over time
 *
 * @param {number} price - Current price value
 * @param {number} width - Width of the sparkline in pixels
 * @param {number} height - Height of the sparkline in pixels
 * @param {number} points - Number of data points to generate
 * @param {boolean} showTooltip - Whether to show tooltip on hover
 * @param {string} className - Additional CSS classes
 */
export function PriceSparkline({
  price,
  width = 80,
  height = 24,
  points = 7,
  showTooltip = true,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);

  const { history: _history, path, trend, trendPercent } = useMemo(() => {
    const history = generatePriceHistory(price, points);
    const path = calculatePath(history, width, height);
    const firstPrice = history[0];
    const lastPrice = history[history.length - 1];
    const trend = lastPrice >= firstPrice ? 'up' : 'down';
    const trendPercent = ((lastPrice - firstPrice) / firstPrice) * 100;

    return { history, path, trend, trendPercent };
  }, [price, width, height, points]);

  const strokeColor = trend === 'up' ? '#4ade80' : '#f87171';
  const gradientId = `sparkline-gradient-${price}`;

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path
          d={`${path} L ${width - 2} ${height - 2} L 2 ${height - 2} Z`}
          fill={`url(#${gradientId})`}
        />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Trend indicator */}
      <span className={`ml-1.5 text-xs font-mono ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {trend === 'up' ? '↑' : '↓'}
        {Math.abs(trendPercent).toFixed(1)}%
      </span>

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-space-black border border-accent-cyan/30 rounded text-xs whitespace-nowrap z-50">
          <div>Current: {formatISK(price, false)}</div>
          <div className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
            7d: {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceSparkline;
