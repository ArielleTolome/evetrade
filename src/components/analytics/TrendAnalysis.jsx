import { useMemo } from 'react';
import { formatCompact } from '../../utils/formatters';

/**
 * Calculate trend direction and confidence
 * @param {number} changePercent - Price change percentage
 * @returns {object} Trend info
 */
function getTrendInfo(changePercent) {
  const absChange = Math.abs(changePercent);

  let direction = 'stable';
  let confidence = 0;
  let color = 'text-yellow-400';
  let arrow = '→';

  if (changePercent > 0) {
    direction = 'up';
    color = 'text-green-400';
    arrow = '↗';
    confidence = Math.min(100, absChange * 5); // Scale to 0-100
  } else if (changePercent < 0) {
    direction = 'down';
    color = 'text-red-400';
    arrow = '↘';
    confidence = Math.min(100, absChange * 5);
  } else {
    confidence = 50;
  }

  return { direction, confidence, color, arrow };
}

/**
 * Calculate buy/sell pressure indicator
 * @param {number} buyVolume - Buy order volume
 * @param {number} sellVolume - Sell order volume
 * @returns {object} Pressure info
 */
function getPressureInfo(buyVolume, sellVolume) {
  const total = buyVolume + sellVolume;
  if (total === 0) {
    return {
      ratio: 50,
      label: 'Balanced',
      color: 'text-yellow-400',
      dominant: 'neutral'
    };
  }

  const buyRatio = (buyVolume / total) * 100;

  let label = 'Balanced';
  let color = 'text-yellow-400';
  let dominant = 'neutral';

  if (buyRatio > 60) {
    label = 'Strong Buy';
    color = 'text-green-400';
    dominant = 'buy';
  } else if (buyRatio > 55) {
    label = 'Buy Pressure';
    color = 'text-green-300';
    dominant = 'buy';
  } else if (buyRatio < 40) {
    label = 'Strong Sell';
    color = 'text-red-400';
    dominant = 'sell';
  } else if (buyRatio < 45) {
    label = 'Sell Pressure';
    color = 'text-red-300';
    dominant = 'sell';
  }

  return { ratio: buyRatio, label, color, dominant };
}

/**
 * TrendAnalysis - Detailed trend analysis panel
 *
 * @param {object} priceHistory - Historical price data
 * @param {object} volumeData - Volume analysis data
 * @param {number} currentPrice - Current price
 * @param {number} buyVolume - Total buy order volume
 * @param {number} sellVolume - Total sell order volume
 * @param {string} predictedDirection - Predicted trend direction
 * @param {number} confidence - Confidence level (0-100)
 * @param {boolean} compact - Compact mode
 */
export function TrendAnalysis({
  priceHistory = [],
  volumeData = null,
  currentPrice = 0,
  buyVolume = 0,
  sellVolume = 0,
  predictedDirection = 'neutral',
  confidence = 0,
  compact = false
}) {
  // Calculate 7-day trend
  const trend7d = useMemo(() => {
    if (!priceHistory || priceHistory.length < 7) {
      return { changePercent: 0, ...getTrendInfo(0) };
    }

    const recent = priceHistory.slice(-7);
    const oldPrice = recent[0]?.average || currentPrice;
    const changePercent = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0;

    return { changePercent, ...getTrendInfo(changePercent) };
  }, [priceHistory, currentPrice]);

  // Calculate 30-day trend
  const trend30d = useMemo(() => {
    if (!priceHistory || priceHistory.length < 30) {
      return { changePercent: 0, ...getTrendInfo(0) };
    }

    const recent = priceHistory.slice(-30);
    const oldPrice = recent[0]?.average || currentPrice;
    const changePercent = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0;

    return { changePercent, ...getTrendInfo(changePercent) };
  }, [priceHistory, currentPrice]);

  // Calculate volume analysis
  const volumeAnalysis = useMemo(() => {
    if (!volumeData || !volumeData.recentAvg || !volumeData.historicalAvg) {
      return { change: 0, label: 'Unknown', color: 'text-gray-400' };
    }

    const change = volumeData.historicalAvg > 0
      ? ((volumeData.recentAvg - volumeData.historicalAvg) / volumeData.historicalAvg) * 100
      : 0;

    let label = 'Stable';
    let color = 'text-yellow-400';

    if (change > 25) {
      label = 'Surging';
      color = 'text-cyan-400';
    } else if (change > 10) {
      label = 'Increasing';
      color = 'text-green-400';
    } else if (change < -25) {
      label = 'Declining';
      color = 'text-red-400';
    } else if (change < -10) {
      label = 'Decreasing';
      color = 'text-orange-400';
    }

    return { change, label, color };
  }, [volumeData]);

  // Calculate pressure
  const pressure = useMemo(() => {
    return getPressureInfo(buyVolume, sellVolume);
  }, [buyVolume, sellVolume]);

  // Determine predicted direction style
  const predictionStyle = useMemo(() => {
    if (predictedDirection === 'bullish' || predictedDirection === 'up') {
      return { color: 'text-green-400', arrow: '▲', label: 'Bullish' };
    } else if (predictedDirection === 'bearish' || predictedDirection === 'down') {
      return { color: 'text-red-400', arrow: '▼', label: 'Bearish' };
    }
    return { color: 'text-yellow-400', arrow: '—', label: 'Neutral' };
  }, [predictedDirection]);

  // Compact mode
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className={trend7d.color}>{trend7d.arrow}</span>
          <span className={trend7d.color}>{trend7d.changePercent.toFixed(1)}%</span>
        </div>
        <div className={`px-2 py-0.5 rounded ${predictionStyle.color} bg-current bg-opacity-20`}>
          <span className={predictionStyle.color}>{predictionStyle.label}</span>
        </div>
      </div>
    );
  }

  // Full display mode
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Trend Analysis
      </h3>

      {/* Price Trends */}
      <div className="space-y-3 mb-4">
        {/* 7-Day Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${trend7d.color}`}>{trend7d.arrow}</span>
            <span className="text-xs text-gray-400">7-Day Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono font-bold ${trend7d.color}`}>
              {trend7d.changePercent > 0 ? '+' : ''}{trend7d.changePercent.toFixed(2)}%
            </span>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${trend7d.direction === 'up' ? 'bg-green-500' : trend7d.direction === 'down' ? 'bg-red-500' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min(trend7d.confidence, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 30-Day Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${trend30d.color}`}>{trend30d.arrow}</span>
            <span className="text-xs text-gray-400">30-Day Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono font-bold ${trend30d.color}`}>
              {trend30d.changePercent > 0 ? '+' : ''}{trend30d.changePercent.toFixed(2)}%
            </span>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${trend30d.direction === 'up' ? 'bg-green-500' : trend30d.direction === 'down' ? 'bg-red-500' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min(trend30d.confidence, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-3">
        {/* Volume Analysis */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Volume Trend</span>
          <span className={`text-sm font-medium ${volumeAnalysis.color}`}>
            {volumeAnalysis.label}
            {volumeAnalysis.change !== 0 && (
              <span className="ml-1 text-xs">
                ({volumeAnalysis.change > 0 ? '+' : ''}{volumeAnalysis.change.toFixed(0)}%)
              </span>
            )}
          </span>
        </div>

        {/* Buy/Sell Pressure */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Order Pressure</span>
            <span className={`text-sm font-medium ${pressure.color}`}>
              {pressure.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${pressure.ratio}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-mono w-12 text-right">
              {pressure.ratio.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>Sell: {formatCompact(sellVolume)}</span>
            <span>Buy: {formatCompact(buyVolume)}</span>
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${predictionStyle.color}`}>{predictionStyle.arrow}</span>
            <div>
              <div className="text-xs text-gray-400">Predicted Direction</div>
              <div className={`text-sm font-bold ${predictionStyle.color}`}>
                {predictionStyle.label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Confidence</div>
            <div className="text-lg font-mono font-bold text-accent-cyan">
              {confidence}%
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              confidence > 70 ? 'bg-green-500' :
              confidence > 40 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * TrendIndicatorCompact - Minimal trend indicator for tables
 */
export function TrendIndicatorCompact({ changePercent }) {
  const info = useMemo(() => getTrendInfo(changePercent), [changePercent]);

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-sm ${info.color}`}>{info.arrow}</span>
      <span className={`text-xs font-mono ${info.color}`}>
        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
      </span>
    </div>
  );
}

export default TrendAnalysis;
