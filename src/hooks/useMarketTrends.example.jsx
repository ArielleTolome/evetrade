/**
 * Example usage of useMarketTrends hook
 *
 * This file demonstrates how to use the useMarketTrends hook
 * to analyze market trends and display predictions.
 */

import React from 'react';
import { useMarketTrends } from './useMarketTrends';

/**
 * Example component showing market trend analysis
 */
function MarketTrendAnalysis({ typeId, regionId, itemName }) {
  const {
    trend,
    trendStrength,
    priceChange7d,
    priceChange30d,
    volumeTrend,
    predictedPrice,
    confidence,
    supportLevel,
    resistanceLevel,
    loading,
    error,
    marketHistory,
  } = useMarketTrends(typeId, regionId);

  if (loading) {
    return <div>Loading market analysis...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!marketHistory || marketHistory.length < 2) {
    return <div>Insufficient market data for analysis</div>;
  }

  // Get current price from latest history entry
  const currentPrice = marketHistory[marketHistory.length - 1]?.average;

  // Determine trend color and icon
  const trendColor = trend === 'bullish' ? 'text-green-500' : trend === 'bearish' ? 'text-red-500' : 'text-gray-500';
  const trendIcon = trend === 'bullish' ? '↑' : trend === 'bearish' ? '↓' : '→';

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-white">{itemName} - Market Analysis</h3>
        <p className="text-sm text-gray-400">Region: {regionId}</p>
      </div>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Market Trend</div>
          <div className={`text-2xl font-bold ${trendColor} flex items-center gap-2`}>
            <span>{trendIcon}</span>
            <span className="capitalize">{trend}</span>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Strength: {trendStrength}%
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-white">
            {currentPrice?.toLocaleString()} ISK
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Confidence: {confidence}%
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Predicted Price</div>
          <div className="text-2xl font-bold text-blue-400">
            {predictedPrice ? `${predictedPrice.toLocaleString()} ISK` : 'N/A'}
          </div>
          <div className="text-sm text-gray-400 mt-1">Next Day</div>
        </div>
      </div>

      {/* Price Changes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">7-Day Change</div>
          <div className={`text-xl font-bold ${priceChange7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChange7d >= 0 ? '+' : ''}{priceChange7d.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">30-Day Change</div>
          <div className={`text-xl font-bold ${priceChange30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {priceChange30d >= 0 ? '+' : ''}{priceChange30d.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Support and Resistance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Support Level</div>
          <div className="text-lg font-bold text-blue-400">
            {supportLevel ? `${supportLevel.toLocaleString()} ISK` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Buy zone</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Current Price</div>
          <div className="text-lg font-bold text-white">
            {currentPrice?.toLocaleString()} ISK
          </div>
          <div className="text-xs text-gray-500 mt-1">Market price</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Resistance Level</div>
          <div className="text-lg font-bold text-red-400">
            {resistanceLevel ? `${resistanceLevel.toLocaleString()} ISK` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Sell zone</div>
        </div>
      </div>

      {/* Volume Trend */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-1">Trading Volume</div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white capitalize">{volumeTrend}</span>
          {volumeTrend === 'increasing' && <span className="text-green-500">📈</span>}
          {volumeTrend === 'decreasing' && <span className="text-red-500">📉</span>}
          {volumeTrend === 'stable' && <span className="text-gray-400">➡️</span>}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Based on last 14 days of trading activity
        </div>
      </div>

      {/* Trading Recommendations */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-2">Trading Insights</div>
        <ul className="space-y-2 text-sm">
          {trend === 'bullish' && trendStrength > 50 && (
            <li className="text-green-400">
              ✓ Strong upward trend - Consider buying for short-term profits
            </li>
          )}
          {trend === 'bearish' && trendStrength > 50 && (
            <li className="text-red-400">
              ✗ Strong downward trend - Consider selling or avoiding this item
            </li>
          )}
          {volumeTrend === 'increasing' && (
            <li className="text-blue-400">
              ℹ Increasing volume indicates growing market interest
            </li>
          )}
          {volumeTrend === 'decreasing' && (
            <li className="text-yellow-400">
              ⚠ Decreasing volume may indicate reduced liquidity
            </li>
          )}
          {confidence < 50 && (
            <li className="text-orange-400">
              ⚠ Low confidence - Limited historical data or volatile market
            </li>
          )}
          {currentPrice && supportLevel && currentPrice <= supportLevel * 1.05 && (
            <li className="text-green-400">
              ✓ Price near support level - Good buying opportunity
            </li>
          )}
          {currentPrice && resistanceLevel && currentPrice >= resistanceLevel * 0.95 && (
            <li className="text-red-400">
              ✗ Price near resistance - Consider taking profits
            </li>
          )}
        </ul>
      </div>

      {/* Data Source */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-700">
        Based on {marketHistory.length} days of market history
      </div>
    </div>
  );
}

/**
 * Simple example with just the basics
 */
function SimpleMarketTrend({ typeId, regionId }) {
  const { trend, predictedPrice, loading, error } = useMarketTrends(typeId, regionId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Trend: {trend}</p>
      <p>Predicted Price: {predictedPrice?.toLocaleString()} ISK</p>
    </div>
  );
}

/**
 * Example using the analysis functions directly
 */
function AdvancedMarketAnalysis({ typeId, regionId }) {
  const {
    marketHistory,
    calculateMovingAverage,
    calculateTrend,
    loading,
  } = useMarketTrends(typeId, regionId);

  if (loading || !marketHistory || marketHistory.length === 0) {
    return <div>Loading...</div>;
  }

  // Calculate custom moving averages
  const prices = marketHistory.map(day => day.average);
  const ma7 = calculateMovingAverage(prices, 7);
  const ma30 = calculateMovingAverage(prices, 30);

  // Get detailed trend information
  const trendData = calculateTrend(prices);

  return (
    <div className="space-y-4">
      <div>
        <h4>Custom Analysis</h4>
        <p>7-day MA: {ma7[ma7.length - 1]?.toFixed(2)} ISK</p>
        <p>30-day MA: {ma30[ma30.length - 1]?.toFixed(2)} ISK</p>
        <p>Trend Slope: {trendData.slope.toFixed(4)}</p>
        <p>R-squared: {(trendData.r2 * 100).toFixed(2)}%</p>
      </div>
    </div>
  );
}

export { MarketTrendAnalysis, SimpleMarketTrend, AdvancedMarketAnalysis };
