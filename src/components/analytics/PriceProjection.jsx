import { useMemo } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * Calculate price projection using linear regression and momentum
 * @param {Array} priceHistory - Historical price data
 * @param {number} currentPrice - Current price
 * @param {number} daysAhead - Days to project
 * @returns {object} Projection data
 */
function calculateProjection(priceHistory, currentPrice, daysAhead) {
  if (!priceHistory || priceHistory.length < 7) {
    return {
      price: currentPrice,
      confidence: 0,
      change: 0,
      changePercent: 0
    };
  }

  // Use last 30 days for projection
  const recentData = priceHistory.slice(-30);
  const prices = recentData.map(h => h.average || h.price || 0);

  // Simple linear regression
  const n = prices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = prices;

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Project price
  const projectedPrice = slope * (n + daysAhead) + intercept;

  // Calculate confidence based on R-squared
  const meanY = sumY / n;
  const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  const ssPredicted = y.map((val, i) => slope * i + intercept);
  const ssResidual = y.reduce((sum, val, i) => sum + Math.pow(val - ssPredicted[i], 2), 0);
  const rSquared = 1 - (ssResidual / ssTotal);

  // Adjust confidence based on volatility
  const volatility = Math.sqrt(ssResidual / n) / meanY;
  const baseConfidence = Math.max(0, Math.min(100, rSquared * 100));
  const confidence = Math.max(0, baseConfidence * (1 - volatility));

  const change = projectedPrice - currentPrice;
  const changePercent = currentPrice > 0 ? (change / currentPrice) * 100 : 0;

  return {
    price: Math.max(0, projectedPrice),
    confidence: Math.round(confidence),
    change,
    changePercent
  };
}

/**
 * Calculate confidence band
 * @param {number} basePrice - Base projection price
 * @param {number} confidence - Confidence level
 * @param {number} volatility - Historical volatility
 * @returns {object} Upper and lower bounds
 */
function calculateConfidenceBand(basePrice, confidence, volatility = 0.1) {
  const factor = 1 - (confidence / 100);
  const range = basePrice * volatility * factor;

  return {
    upper: basePrice + range,
    lower: Math.max(0, basePrice - range)
  };
}

/**
 * PriceProjection - Price projection component with visualization
 *
 * @param {number} currentPrice - Current market price
 * @param {Array} priceHistory - Historical price data
 * @param {boolean} compact - Compact mode
 */
export function PriceProjection({ currentPrice = 0, priceHistory = [], compact = false }) {
  // Calculate projections
  const projection1w = useMemo(
    () => calculateProjection(priceHistory, currentPrice, 7),
    [priceHistory, currentPrice]
  );

  const projection1m = useMemo(
    () => calculateProjection(priceHistory, currentPrice, 30),
    [priceHistory, currentPrice]
  );

  const projection3m = useMemo(
    () => calculateProjection(priceHistory, currentPrice, 90),
    [priceHistory, currentPrice]
  );

  // Calculate volatility for confidence bands
  const volatility = useMemo(() => {
    if (!priceHistory || priceHistory.length < 2) return 0.1;

    const prices = priceHistory.slice(-30).map(h => h.average || h.price || 0);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? stdDev / mean : 0.1;
  }, [priceHistory]);

  const bands1w = useMemo(
    () => calculateConfidenceBand(projection1w.price, projection1w.confidence, volatility),
    [projection1w, volatility]
  );

  const bands1m = useMemo(
    () => calculateConfidenceBand(projection1m.price, projection1m.confidence, volatility),
    [projection1m, volatility]
  );

  const bands3m = useMemo(
    () => calculateConfidenceBand(projection3m.price, projection3m.confidence, volatility),
    [projection3m, volatility]
  );

  // Compact mode
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <div>
          <span className="text-gray-400">1w: </span>
          <span className={projection1w.changePercent > 0 ? 'text-green-400' : projection1w.changePercent < 0 ? 'text-red-400' : 'text-yellow-400'}>
            {projection1w.changePercent > 0 ? '+' : ''}{projection1w.changePercent.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-gray-400">1m: </span>
          <span className={projection1m.changePercent > 0 ? 'text-green-400' : projection1m.changePercent < 0 ? 'text-red-400' : 'text-yellow-400'}>
            {projection1m.changePercent > 0 ? '+' : ''}{projection1m.changePercent.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }

  // Full display mode
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Price Projections
      </h3>

      {/* Current Price */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-gray-400">Current Price</span>
          <span className="text-lg font-mono font-bold text-accent-cyan">
            {formatISK(currentPrice)}
          </span>
        </div>
      </div>

      {/* Projections */}
      <div className="space-y-4">
        {/* 1 Week */}
        <ProjectionRow
          label="1 Week"
          price={projection1w.price}
          change={projection1w.change}
          changePercent={projection1w.changePercent}
          confidence={projection1w.confidence}
          upperBand={bands1w.upper}
          lowerBand={bands1w.lower}
          currentPrice={currentPrice}
        />

        {/* 1 Month */}
        <ProjectionRow
          label="1 Month"
          price={projection1m.price}
          change={projection1m.change}
          changePercent={projection1m.changePercent}
          confidence={projection1m.confidence}
          upperBand={bands1m.upper}
          lowerBand={bands1m.lower}
          currentPrice={currentPrice}
        />

        {/* 3 Months */}
        <ProjectionRow
          label="3 Months"
          price={projection3m.price}
          change={projection3m.change}
          changePercent={projection3m.changePercent}
          confidence={projection3m.confidence}
          upperBand={bands3m.upper}
          lowerBand={bands3m.lower}
          currentPrice={currentPrice}
        />
      </div>

      {/* Chart Visualization */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <PriceProjectionChart
          currentPrice={currentPrice}
          projections={[
            { days: 7, price: projection1w.price, upper: bands1w.upper, lower: bands1w.lower },
            { days: 30, price: projection1m.price, upper: bands1m.upper, lower: bands1m.lower },
            { days: 90, price: projection3m.price, upper: bands3m.upper, lower: bands3m.lower }
          ]}
        />
      </div>

      {/* Disclaimer */}
      <div className="mt-3 text-[10px] text-gray-500 italic">
        Projections based on historical trends. Not financial advice.
      </div>
    </div>
  );
}

/**
 * ProjectionRow - Single projection row with confidence band
 */
function ProjectionRow({ label, price, change, changePercent, confidence, upperBand, lowerBand, currentPrice }) {
  const color = changePercent > 0 ? 'text-green-400' : changePercent < 0 ? 'text-red-400' : 'text-yellow-400';
  const arrow = changePercent > 0 ? '▲' : changePercent < 0 ? '▼' : '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-16">{label}</span>
          <span className={`text-sm ${color}`}>{arrow}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono font-bold text-white">
            {formatISK(price)}
          </div>
          <div className={`text-xs font-medium ${color}`}>
            {change > 0 ? '+' : ''}{formatISK(change, false)} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Confidence band visualization */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="relative h-6 bg-gray-700/50 rounded overflow-hidden">
            {/* Confidence band */}
            <div
              className="absolute h-full bg-accent-cyan/20"
              style={{
                left: `${Math.max(0, Math.min(100, (lowerBand / currentPrice - 0.5) * 100 + 50))}%`,
                width: `${Math.min(100, Math.abs((upperBand - lowerBand) / currentPrice * 100))}%`
              }}
            />
            {/* Projected price line */}
            <div
              className={`absolute top-0 w-0.5 h-full ${color.replace('text-', 'bg-')}`}
              style={{
                left: `${Math.max(0, Math.min(100, (price / currentPrice - 0.5) * 100 + 50))}%`
              }}
            />
            {/* Current price marker */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white" />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>{formatISK(lowerBand, false)}</span>
            <span>{formatISK(upperBand, false)}</span>
          </div>
        </div>
        <div className="w-12 text-right">
          <div className={`text-xs font-medium ${
            confidence > 70 ? 'text-green-400' :
            confidence > 40 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {confidence}%
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PriceProjectionChart - Simple SVG line chart for projections
 */
function PriceProjectionChart({ currentPrice, projections }) {
  const maxPrice = Math.max(currentPrice, ...projections.map(p => p.upper));
  const minPrice = Math.min(currentPrice, ...projections.map(p => p.lower));
  const range = maxPrice - minPrice || 1;

  // Scale function
  const scaleY = (price) => {
    return 100 - ((price - minPrice) / range) * 100;
  };

  const scaleX = (days) => {
    return (days / 90) * 100; // 90 days is full width
  };

  // Build projection line
  const projectionLine = [
    `0,${scaleY(currentPrice)}`,
    ...projections.map(p => `${scaleX(p.days)},${scaleY(p.price)}`)
  ].join(' ');

  // Build confidence band polygon
  const upperBand = projections.map(p => `${scaleX(p.days)},${scaleY(p.upper)}`);
  const lowerBand = projections.map(p => `${scaleX(p.days)},${scaleY(p.lower)}`).reverse();
  const bandPolygon = [
    `0,${scaleY(currentPrice)}`,
    ...upperBand,
    ...lowerBand
  ].join(' ');

  return (
    <div className="w-full h-32 relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#374151" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#374151" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#374151" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Confidence band */}
        <polygon
          points={bandPolygon}
          fill="#06b6d4"
          fillOpacity="0.1"
        />

        {/* Projection line */}
        <polyline
          points={projectionLine}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1"
        />

        {/* Current price line */}
        <line
          x1="0"
          y1={scaleY(currentPrice)}
          x2="100"
          y2={scaleY(currentPrice)}
          stroke="#ffffff"
          strokeWidth="1"
          strokeDasharray="4,2"
          opacity="0.5"
        />

        {/* Projection points */}
        {projections.map((p, i) => (
          <circle
            key={i}
            cx={scaleX(p.days)}
            cy={scaleY(p.price)}
            r="1.5"
            fill="#06b6d4"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>Now</span>
        <span>1w</span>
        <span>1m</span>
        <span>3m</span>
      </div>
    </div>
  );
}

export default PriceProjection;
