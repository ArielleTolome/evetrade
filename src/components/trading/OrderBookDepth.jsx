import { useMemo, useState } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';
import GlassmorphicCard from '../common/GlassmorphicCard';

/**
 * Calculate cumulative volume for order book depth
 */
function calculateCumulativeVolume(orders) {
  if (!orders || orders.length === 0) return [];

  const sorted = [...orders].sort((a, b) => a.price - b.price);
  let cumulative = 0;

  return sorted.map(order => {
    cumulative += order.volume || order.volume_remain || 0;
    return {
      ...order,
      cumulativeVolume: cumulative,
    };
  });
}

/**
 * Detect price walls (large orders that act as support/resistance)
 */
function detectPriceWalls(orders, threshold = 0.2) {
  if (!orders || orders.length === 0) return [];

  const volumes = orders.map(o => o.volume || o.volume_remain || 0);
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const wallThreshold = avgVolume * (1 + threshold);

  return orders
    .map((order, index) => ({
      ...order,
      index,
      isWall: (order.volume || order.volume_remain || 0) > wallThreshold,
    }))
    .filter(order => order.isWall);
}

/**
 * Calculate market liquidity score
 */
function calculateLiquidityScore(buyOrders, sellOrders, spread) {
  if (!buyOrders || !sellOrders || buyOrders.length === 0 || sellOrders.length === 0) {
    return { score: 0, label: 'No Data', color: 'text-gray-400' };
  }

  const totalBuyVolume = buyOrders.reduce((sum, o) => sum + (o.volume || o.volume_remain || 0), 0);
  const totalSellVolume = sellOrders.reduce((sum, o) => sum + (o.volume || o.volume_remain || 0), 0);
  const avgVolume = (totalBuyVolume + totalSellVolume) / 2;

  // Score factors: total volume, order count, spread tightness
  const volumeScore = Math.min(avgVolume / 10000, 40); // Max 40 points
  const orderScore = Math.min((buyOrders.length + sellOrders.length) / 2, 30); // Max 30 points
  const spreadScore = Math.max(0, 30 - (spread * 100)); // Max 30 points (lower spread = better)

  const totalScore = volumeScore + orderScore + spreadScore;

  if (totalScore >= 70) {
    return { score: totalScore, label: 'Deep', color: 'text-green-400' };
  } else if (totalScore >= 40) {
    return { score: totalScore, label: 'Normal', color: 'text-accent-cyan' };
  } else {
    return { score: totalScore, label: 'Thin', color: 'text-red-400' };
  }
}

/**
 * OrderBookDepth Component
 * Visualizes market depth with buy/sell orders and key metrics
 *
 * @param {Array} buyOrders - Array of buy orders [{price, volume}, ...]
 * @param {Array} sellOrders - Array of sell orders [{price, volume}, ...]
 * @param {string} itemName - Name of the item being traded
 * @param {boolean} compact - Compact mode for embedding in tables
 * @param {string} className - Additional CSS classes
 */
export function OrderBookDepth({
  buyOrders = [],
  sellOrders = [],
  itemName = 'Item',
  compact = false,
  className = '',
}) {
  const [hoveredOrder, setHoveredOrder] = useState(null);
  const [hoveredSide, setHoveredSide] = useState(null); // 'buy' or 'sell'

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!buyOrders || !sellOrders || buyOrders.length === 0 || sellOrders.length === 0) {
      return {
        bestBuy: 0,
        bestSell: 0,
        spread: 0,
        spreadPercent: 0,
        totalBuyVolume: 0,
        totalSellVolume: 0,
        liquidity: { score: 0, label: 'No Data', color: 'text-gray-400' },
      };
    }

    // Sort orders
    const sortedBuys = [...buyOrders].sort((a, b) => b.price - a.price);
    const sortedSells = [...sellOrders].sort((a, b) => a.price - b.price);

    const bestBuy = sortedBuys[0]?.price || 0;
    const bestSell = sortedSells[0]?.price || 0;
    const spread = bestSell - bestBuy;
    const spreadPercent = bestBuy > 0 ? spread / bestBuy : 0;

    const totalBuyVolume = buyOrders.reduce((sum, o) => sum + (o.volume || o.volume_remain || 0), 0);
    const totalSellVolume = sellOrders.reduce((sum, o) => sum + (o.volume || o.volume_remain || 0), 0);

    const liquidity = calculateLiquidityScore(buyOrders, sellOrders, spreadPercent);

    return {
      bestBuy,
      bestSell,
      spread,
      spreadPercent,
      totalBuyVolume,
      totalSellVolume,
      liquidity,
    };
  }, [buyOrders, sellOrders]);

  // Calculate cumulative volumes
  const buyDepth = useMemo(() => calculateCumulativeVolume(buyOrders), [buyOrders]);
  const sellDepth = useMemo(() => calculateCumulativeVolume(sellOrders), [sellOrders]);

  // Detect price walls
  const buyWalls = useMemo(() => detectPriceWalls(buyOrders), [buyOrders]);
  const sellWalls = useMemo(() => detectPriceWalls(sellOrders), [sellOrders]);

  // Get max cumulative volume for scaling
  const maxVolume = useMemo(() => {
    const maxBuy = buyDepth.length > 0 ? buyDepth[buyDepth.length - 1].cumulativeVolume : 0;
    const maxSell = sellDepth.length > 0 ? sellDepth[sellDepth.length - 1].cumulativeVolume : 0;
    return Math.max(maxBuy, maxSell, 1);
  }, [buyDepth, sellDepth]);

  // Display configurations
  const displayCount = compact ? 5 : 10;
  const barHeight = compact ? 'h-4' : 'h-6';

  // Get top orders to display
  const displayBuys = useMemo(() => {
    return [...buyOrders]
      .sort((a, b) => b.price - a.price)
      .slice(0, displayCount);
  }, [buyOrders, displayCount]);

  const displaySells = useMemo(() => {
    return [...sellOrders]
      .sort((a, b) => a.price - b.price)
      .slice(0, displayCount);
  }, [sellOrders, displayCount]);

  if (buyOrders.length === 0 && sellOrders.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="text-center py-8 text-text-secondary">
          No order book data available
        </div>
      </GlassmorphicCard>
    );
  }

  if (compact) {
    return (
      <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-lg overflow-hidden ${className}`}>
        {/* Compact Header */}
        <div className="px-3 py-2 border-b border-accent-cyan/10 flex items-center justify-between">
          <span className="text-xs text-text-primary font-medium">Market Depth</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">Spread:</span>
            <span className={metrics.spreadPercent < 0.02 ? 'text-green-400' : 'text-accent-pink'}>
              {formatPercent(metrics.spreadPercent)}
            </span>
          </div>
        </div>

        {/* Compact Order Bars */}
        <div className="p-2 space-y-1">
          {displaySells.reverse().map((order, idx) => {
            const volume = order.volume || order.volume_remain || 0;
            const cumVolume = sellDepth.find(d => d.price === order.price)?.cumulativeVolume || 0;
            const widthPercent = (cumVolume / maxVolume) * 100;

            return (
              <div key={`sell-${idx}`} className="flex items-center gap-2 text-xs">
                <div className="w-20 text-right font-mono text-accent-pink">
                  {formatISK(order.price, false)}
                </div>
                <div className="flex-1 relative h-4">
                  <div
                    className="absolute right-0 h-full bg-accent-pink/30 border-r-2 border-accent-pink/60 rounded-l transition-all"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="w-16 text-right font-mono text-text-secondary">
                  {formatNumber(volume, 0)}
                </div>
              </div>
            );
          })}

          {/* Spread Indicator */}
          <div className="py-1 border-y border-accent-cyan/20">
            <div className="text-center text-xs text-accent-cyan font-mono">
              ← {formatISK(metrics.spread, false)} spread →
            </div>
          </div>

          {displayBuys.map((order, idx) => {
            const volume = order.volume || order.volume_remain || 0;
            const cumVolume = buyDepth.find(d => d.price === order.price)?.cumulativeVolume || 0;
            const widthPercent = (cumVolume / maxVolume) * 100;

            return (
              <div key={`buy-${idx}`} className="flex items-center gap-2 text-xs">
                <div className="w-20 text-right font-mono text-accent-green">
                  {formatISK(order.price, false)}
                </div>
                <div className="flex-1 relative h-4">
                  <div
                    className="absolute left-0 h-full bg-accent-green/30 border-l-2 border-accent-green/60 rounded-r transition-all"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="w-16 text-right font-mono text-text-secondary">
                  {formatNumber(volume, 0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-accent-cyan">{itemName}</h3>
            <p className="text-sm text-text-secondary">Order Book Depth</p>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${metrics.liquidity.color}`}>
              {metrics.liquidity.label}
            </div>
            <div className="text-xs text-text-secondary">Market Liquidity</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-space-dark/30 rounded-lg border border-accent-cyan/10">
          <div className="text-center">
            <div className="text-xs text-text-secondary mb-1">Spread</div>
            <div className="text-lg font-bold font-mono text-accent-cyan">
              {formatISK(metrics.spread, false)}
            </div>
            <div className={`text-xs font-mono ${metrics.spreadPercent < 0.02 ? 'text-green-400' : 'text-accent-pink'}`}>
              {formatPercent(metrics.spreadPercent)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-text-secondary mb-1">Best Buy</div>
            <div className="text-lg font-bold font-mono text-accent-green">
              {formatISK(metrics.bestBuy, false)}
            </div>
            <div className="text-xs text-text-secondary">
              {formatNumber(metrics.totalBuyVolume, 0)} vol
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-text-secondary mb-1">Best Sell</div>
            <div className="text-lg font-bold font-mono text-accent-pink">
              {formatISK(metrics.bestSell, false)}
            </div>
            <div className="text-xs text-text-secondary">
              {formatNumber(metrics.totalSellVolume, 0)} vol
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-text-secondary mb-1">Price Walls</div>
            <div className="text-lg font-bold text-text-primary">
              {buyWalls.length + sellWalls.length}
            </div>
            <div className="text-xs">
              <span className="text-accent-green">{buyWalls.length}B</span>
              {' / '}
              <span className="text-accent-pink">{sellWalls.length}S</span>
            </div>
          </div>
        </div>

        {/* Order Book Visualization */}
        <div className="space-y-2">
          {/* Sell Orders (top to bottom: highest to lowest) */}
          <div className="space-y-1">
            <div className="text-xs text-accent-pink font-semibold mb-2 flex items-center gap-2">
              <span>SELL ORDERS</span>
              <span className="text-text-secondary font-normal">
                (Total: {formatNumber(metrics.totalSellVolume, 0)})
              </span>
            </div>

            {displaySells.reverse().map((order, idx) => {
              const volume = order.volume || order.volume_remain || 0;
              const cumVolume = sellDepth.find(d => d.price === order.price)?.cumulativeVolume || 0;
              const widthPercent = (cumVolume / maxVolume) * 100;
              const isWall = sellWalls.some(w => w.price === order.price);
              const isHovered = hoveredOrder === order.price && hoveredSide === 'sell';

              return (
                <div
                  key={`sell-${idx}`}
                  className={`flex items-center gap-3 transition-all ${isHovered ? 'bg-accent-pink/10' : ''}`}
                  onMouseEnter={() => {
                    setHoveredOrder(order.price);
                    setHoveredSide('sell');
                  }}
                  onMouseLeave={() => {
                    setHoveredOrder(null);
                    setHoveredSide(null);
                  }}
                >
                  <div className="w-28 text-right">
                    <div className={`text-sm font-mono font-semibold ${isWall ? 'text-accent-pink' : 'text-accent-pink/80'}`}>
                      {formatISK(order.price, false)}
                      {isWall && <span className="ml-1 text-xs">🛡️</span>}
                    </div>
                  </div>

                  <div className={`flex-1 relative ${barHeight}`}>
                    <div
                      className={`absolute right-0 h-full rounded-l transition-all duration-300 ${
                        isWall
                          ? 'bg-accent-pink/50 border-r-2 border-accent-pink'
                          : 'bg-accent-pink/30 border-r border-accent-pink/60'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                    {isHovered && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-white font-semibold">
                        {formatNumber(cumVolume, 0)}
                      </div>
                    )}
                  </div>

                  <div className="w-24 text-right">
                    <div className="text-sm font-mono text-text-secondary">
                      {formatNumber(volume, 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spread Indicator */}
          <div className="py-3 my-2 border-y-2 border-accent-cyan/30 bg-accent-cyan/5 rounded">
            <div className="text-center">
              <div className="text-xs text-text-secondary mb-1">Market Spread</div>
              <div className="text-lg font-bold font-mono text-accent-cyan">
                ← {formatISK(metrics.spread, false)} →
              </div>
              <div className="text-xs text-accent-cyan">
                {formatPercent(metrics.spreadPercent)} difference
              </div>
            </div>
          </div>

          {/* Buy Orders (top to bottom: highest to lowest) */}
          <div className="space-y-1">
            <div className="text-xs text-accent-green font-semibold mb-2 flex items-center gap-2">
              <span>BUY ORDERS</span>
              <span className="text-text-secondary font-normal">
                (Total: {formatNumber(metrics.totalBuyVolume, 0)})
              </span>
            </div>

            {displayBuys.map((order, idx) => {
              const volume = order.volume || order.volume_remain || 0;
              const cumVolume = buyDepth.find(d => d.price === order.price)?.cumulativeVolume || 0;
              const widthPercent = (cumVolume / maxVolume) * 100;
              const isWall = buyWalls.some(w => w.price === order.price);
              const isHovered = hoveredOrder === order.price && hoveredSide === 'buy';

              return (
                <div
                  key={`buy-${idx}`}
                  className={`flex items-center gap-3 transition-all ${isHovered ? 'bg-accent-green/10' : ''}`}
                  onMouseEnter={() => {
                    setHoveredOrder(order.price);
                    setHoveredSide('buy');
                  }}
                  onMouseLeave={() => {
                    setHoveredOrder(null);
                    setHoveredSide(null);
                  }}
                >
                  <div className="w-28 text-right">
                    <div className={`text-sm font-mono font-semibold ${isWall ? 'text-accent-green' : 'text-accent-green/80'}`}>
                      {formatISK(order.price, false)}
                      {isWall && <span className="ml-1 text-xs">🛡️</span>}
                    </div>
                  </div>

                  <div className={`flex-1 relative ${barHeight}`}>
                    <div
                      className={`absolute left-0 h-full rounded-r transition-all duration-300 ${
                        isWall
                          ? 'bg-accent-green/50 border-l-2 border-accent-green'
                          : 'bg-accent-green/30 border-l border-accent-green/60'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                    {isHovered && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-white font-semibold">
                        {formatNumber(cumVolume, 0)}
                      </div>
                    )}
                  </div>

                  <div className="w-24 text-right">
                    <div className="text-sm font-mono text-text-secondary">
                      {formatNumber(volume, 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-text-secondary pt-4 border-t border-accent-cyan/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent-green/30 border-l border-accent-green rounded" />
            <span>Buy orders (support)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent-pink/30 border-r border-accent-pink rounded" />
            <span>Sell orders (resistance)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <span>Price wall (large order)</span>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default OrderBookDepth;
