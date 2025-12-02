import { useState, useEffect, useMemo } from 'react';
import { getMarketOrders, analyzeMarketOrders } from '../../api/esi';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * Order Book Preview Component
 * Shows real-time competition data from ESI market orders
 */

/**
 * Compact competition indicator for table cells
 */
export function CompetitionBadge({ competition, className = '' }) {
  const config = {
    low: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Low' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Med' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'High' },
    extreme: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Extreme' },
  };

  const { bg, text, label } = config[competition] || config.medium;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${bg} ${text} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/**
 * Live order book preview with competition analysis
 */
export function OrderBookPreview({
  regionId,
  typeId,
  stationId = null,
  className = '',
  onDataLoad = null,
}) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionId || !typeId) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMarketOrders(regionId, typeId);
        setOrders(data);
        if (onDataLoad) {
          const analysis = analyzeMarketOrders(data, stationId);
          onDataLoad(analysis);
        }
      } catch (err) {
        console.error('Failed to fetch market orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [regionId, typeId, stationId, onDataLoad]);

  const analysis = useMemo(() => {
    if (!orders) return null;
    return analyzeMarketOrders(orders, stationId);
  }, [orders, stationId]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-white/10 rounded w-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-xs text-red-400 ${className}`}>
        Failed to load orders
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Competition Summary */}
      <div className="flex items-center gap-2">
        <CompetitionBadge competition={analysis.competitionLevel} />
        <span className="text-xs text-text-secondary">
          {analysis.sellersAtBestPrice} seller{analysis.sellersAtBestPrice !== 1 ? 's' : ''} at best price
        </span>
      </div>

      {/* Order Counts */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-text-secondary">Buy Orders:</span>
          <span className="text-green-400 font-medium">{analysis.buyOrders}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Sell Orders:</span>
          <span className="text-red-400 font-medium">{analysis.sellOrders}</span>
        </div>
      </div>

      {/* Best Prices */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-text-secondary">Best Buy</div>
          <div className="text-green-400 font-mono">{formatISK(analysis.bestBuyPrice, false)}</div>
        </div>
        <div>
          <div className="text-text-secondary">Best Sell</div>
          <div className="text-red-400 font-mono">{formatISK(analysis.bestSellPrice, false)}</div>
        </div>
      </div>

      {/* Spread */}
      <div className="text-xs">
        <span className="text-text-secondary">Spread: </span>
        <span className={`font-medium ${analysis.spread > 5 ? 'text-green-400' : analysis.spread > 2 ? 'text-yellow-400' : 'text-red-400'}`}>
          {analysis.spread.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Inline competition indicator (for table rows)
 */
export function OrderCompetitionInline({
  regionId,
  typeId,
  stationId = null,
  className = '',
}) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!regionId || !typeId) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getMarketOrders(regionId, typeId);
        setAnalysis(analyzeMarketOrders(data, stationId));
      } catch (err) {
        console.error('Failed to fetch market orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [regionId, typeId, stationId]);

  if (loading) {
    return <span className="text-xs text-text-secondary animate-pulse">...</span>;
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CompetitionBadge competition={analysis.competitionLevel} />
      <span className="text-xs text-text-secondary">
        {analysis.sellersAtBestPrice}/{analysis.buyersAtBestPrice}
      </span>
    </div>
  );
}

/**
 * Full order book card for expanded views
 */
export function OrderBookCard({
  regionId,
  typeId,
  stationId = null,
  itemName = 'Item',
  className = '',
}) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionId || !typeId) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMarketOrders(regionId, typeId);
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch market orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [regionId, typeId]);

  const analysis = useMemo(() => {
    if (!orders) return null;
    return analyzeMarketOrders(orders, stationId);
  }, [orders, stationId]);

  // Get top 5 buy and sell orders
  const topOrders = useMemo(() => {
    if (!orders) return { buy: [], sell: [] };

    let filtered = stationId
      ? orders.filter(o => o.location_id === stationId)
      : orders;

    const buyOrders = filtered
      .filter(o => o.is_buy_order)
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    const sellOrders = filtered
      .filter(o => !o.is_buy_order)
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);

    return { buy: buyOrders, sell: sellOrders };
  }, [orders, stationId]);

  if (loading) {
    return (
      <div className={`bg-space-dark/50 border border-accent-cyan/20 rounded-lg p-4 animate-pulse ${className}`}>
        <div className="h-6 bg-white/10 rounded w-32 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 ${className}`}>
        <div className="text-red-400 text-sm">Failed to load order book</div>
        <div className="text-red-400/70 text-xs mt-1">{error}</div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className={`bg-space-dark/50 border border-accent-cyan/20 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-text-primary">Order Book</h4>
        <CompetitionBadge competition={analysis.competitionLevel} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="p-2 bg-space-dark/50 rounded">
          <div className="text-lg font-bold text-green-400">{analysis.buyOrders}</div>
          <div className="text-xs text-text-secondary">Buy Orders</div>
        </div>
        <div className="p-2 bg-space-dark/50 rounded">
          <div className="text-lg font-bold text-accent-cyan">{analysis.spread.toFixed(1)}%</div>
          <div className="text-xs text-text-secondary">Spread</div>
        </div>
        <div className="p-2 bg-space-dark/50 rounded">
          <div className="text-lg font-bold text-red-400">{analysis.sellOrders}</div>
          <div className="text-xs text-text-secondary">Sell Orders</div>
        </div>
      </div>

      {/* Order Book Table */}
      <div className="grid grid-cols-2 gap-4">
        {/* Buy Orders */}
        <div>
          <div className="text-xs text-text-secondary mb-2 flex justify-between">
            <span>Buy Orders</span>
            <span>{analysis.buyersAtBestPrice} at best</span>
          </div>
          <div className="space-y-1">
            {topOrders.buy.map((order, idx) => (
              <div
                key={order.order_id}
                className={`flex justify-between text-xs p-1.5 rounded ${idx === 0 ? 'bg-green-500/20' : 'bg-space-dark/30'}`}
              >
                <span className="text-green-400 font-mono">{formatISK(order.price, false)}</span>
                <span className="text-text-secondary">{formatNumber(order.volume_remain, 0)}</span>
              </div>
            ))}
            {topOrders.buy.length === 0 && (
              <div className="text-xs text-text-secondary text-center py-2">No buy orders</div>
            )}
          </div>
        </div>

        {/* Sell Orders */}
        <div>
          <div className="text-xs text-text-secondary mb-2 flex justify-between">
            <span>Sell Orders</span>
            <span>{analysis.sellersAtBestPrice} at best</span>
          </div>
          <div className="space-y-1">
            {topOrders.sell.map((order, idx) => (
              <div
                key={order.order_id}
                className={`flex justify-between text-xs p-1.5 rounded ${idx === 0 ? 'bg-red-500/20' : 'bg-space-dark/30'}`}
              >
                <span className="text-red-400 font-mono">{formatISK(order.price, false)}</span>
                <span className="text-text-secondary">{formatNumber(order.volume_remain, 0)}</span>
              </div>
            ))}
            {topOrders.sell.length === 0 && (
              <div className="text-xs text-text-secondary text-center py-2">No sell orders</div>
            )}
          </div>
        </div>
      </div>

      {/* Price Walls Warning */}
      {(analysis.buyWalls.length > 0 || analysis.sellWalls.length > 0) && (
        <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <div className="text-xs text-yellow-400 font-medium mb-1">Price Walls Detected</div>
          <div className="text-xs text-text-secondary">
            {analysis.buyWalls.length > 0 && (
              <div>Buy wall at {formatISK(analysis.buyWalls[0].price, false)} ({analysis.buyWalls[0].percentage.toFixed(0)}% of volume)</div>
            )}
            {analysis.sellWalls.length > 0 && (
              <div>Sell wall at {formatISK(analysis.sellWalls[0].price, false)} ({analysis.sellWalls[0].percentage.toFixed(0)}% of volume)</div>
            )}
          </div>
        </div>
      )}

      {/* Total Volume */}
      <div className="mt-4 pt-3 border-t border-accent-cyan/10 grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-text-secondary">Total Buy Volume:</span>
          <span className="text-green-400">{formatNumber(analysis.totalBuyVolume, 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Total Sell Volume:</span>
          <span className="text-red-400">{formatNumber(analysis.totalSellVolume, 0)}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderBookPreview;
