import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { useEveAuth } from '../hooks/useEveAuth';
import {
  getCharacterOrders,
  getTypeNames,
  getMarketOrders,
  getStationInfo,
  getStructureInfo,
  getRegionFromSystem
} from '../api/esi';
import { formatISK, formatNumber, formatRelativeTime } from '../utils/formatters';

/**
 * Price Status Badge Component
 */
function PriceStatusBadge({ status, priceDiff }) {
  const configs = {
    best_price: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Best price' },
    undercut: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Undercut' },
    unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Unknown' },
  };

  const config = configs[status] || configs.unknown;

  return (
    <div className="flex flex-col items-start">
      <span className={`px-2 py-0.5 rounded text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
      {priceDiff !== 0 && status === 'undercut' && (
        <span className="text-xs text-red-400 mt-0.5">
          {formatISK(priceDiff, false)}
        </span>
      )}
    </div>
  );
}

/**
 * Market Orders Page
 * Displays active buy/sell orders with price status comparison
 */
export function MarketOrdersPage() {
  const { isAuthenticated, character, getAccessToken, login } = useEveAuth();
  const [orders, setOrders] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [locationNames, setLocationNames] = useState({});
  const [priceStatus, setPriceStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadLocationNames = useCallback(async (locationIds, accessToken) => {
    const names = {};

    for (const locationId of locationIds) {
      try {
        if (locationId > 1000000000000) {
          // Player structure
          const info = await getStructureInfo(locationId, accessToken);
          names[locationId] = info?.name || `Structure ${locationId}`;
        } else {
          // NPC station
          const info = await getStationInfo(locationId);
          names[locationId] = info?.name || `Station ${locationId}`;
        }
      } catch {
        names[locationId] = `Location ${locationId}`;
      }
    }

    setLocationNames(names);
  }, []);

  const loadPriceStatus = useCallback(async (orderData) => {
    if (!orderData || orderData.length === 0) return;

    setPriceLoading(true);
    const status = {};

    // Group orders by type_id and location
    const orderGroups = {};
    for (const order of orderData) {
      const key = `${order.type_id}-${order.location_id}`;
      if (!orderGroups[key]) {
        orderGroups[key] = {
          typeId: order.type_id,
          locationId: order.location_id,
          orders: [],
        };
      }
      orderGroups[key].orders.push(order);
    }

    // For each group, fetch market orders and compare
    for (const [, group] of Object.entries(orderGroups)) {
      try {
        // Get region from location
        let regionId = 10000002; // Default to The Forge (Jita)

        if (group.locationId < 1000000000000) {
          const stationInfo = await getStationInfo(group.locationId);
          if (stationInfo?.system_id) {
            const regionInfo = await getRegionFromSystem(stationInfo.system_id);
            if (regionInfo?.regionId) {
              regionId = regionInfo.regionId;
            }
          }
        }

        // Fetch market orders for this type in the region
        const marketOrders = await getMarketOrders(regionId, group.typeId, 'all');

        // Filter to same location
        const localOrders = marketOrders.filter(o => o.location_id === group.locationId);

        // Find best buy and sell prices
        const buyOrders = localOrders.filter(o => o.is_buy_order).sort((a, b) => b.price - a.price);
        const sellOrders = localOrders.filter(o => !o.is_buy_order).sort((a, b) => a.price - b.price);

        const bestBuyPrice = buyOrders[0]?.price || 0;
        const bestSellPrice = sellOrders[0]?.price || Infinity;

        // Compare each order
        for (const order of group.orders) {
          if (order.is_buy_order) {
            // For buy orders, best price is highest
            if (order.price >= bestBuyPrice) {
              status[order.order_id] = { status: 'best_price', priceDiff: 0 };
            } else {
              status[order.order_id] = { status: 'undercut', priceDiff: bestBuyPrice - order.price };
            }
          } else {
            // For sell orders, best price is lowest
            if (order.price <= bestSellPrice) {
              status[order.order_id] = { status: 'best_price', priceDiff: 0 };
            } else {
              status[order.order_id] = { status: 'undercut', priceDiff: order.price - bestSellPrice };
            }
          }
        }
      } catch (err) {
        console.error(`Failed to load price status for group ${group.typeId}-${group.locationId}:`, err);
        // Mark as unknown if we can't fetch market data
        for (const order of group.orders) {
          status[order.order_id] = { status: 'unknown', priceDiff: 0 };
        }
      }
    }

    setPriceStatus(status);
    setPriceLoading(false);
  }, []);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !character?.id) return;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const orderData = await getCharacterOrders(character.id, accessToken);
      setOrders(orderData || []);
      setLastRefresh(new Date());

      // Get unique type IDs and fetch names
      const typeIds = [...new Set(orderData.map((o) => o.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach((n) => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }

      // Load location names
      const locationIds = [...new Set(orderData.map((o) => o.location_id))];
      await loadLocationNames(locationIds, accessToken);

      // Load price status for each order
      await loadPriceStatus(orderData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, character?.id, getAccessToken, loadLocationNames, loadPriceStatus]);

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadOrders();
    }
  }, [isAuthenticated, character?.id, loadOrders]);

  // Auto-refresh every 5 minutes if enabled
  useEffect(() => {
    if (autoRefresh && isAuthenticated) {
      const interval = setInterval(loadOrders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isAuthenticated, loadOrders]);

  // Separate buy and sell orders
  const { sellOrders, buyOrders } = useMemo(() => {
    const sell = orders.filter(o => !o.is_buy_order);
    const buy = orders.filter(o => o.is_buy_order);
    return { sellOrders: sell, buyOrders: buy };
  }, [orders]);

  // Calculate stats
  const stats = useMemo(() => {
    const sellTotal = sellOrders.reduce((sum, o) => sum + o.price * o.volume_remain, 0);
    const buyEscrow = buyOrders.reduce((sum, o) => sum + (o.escrow || 0), 0);
    const buyTotal = buyOrders.reduce((sum, o) => sum + o.price * o.volume_remain, 0);

    // Calculate remaining to cover (total buy value - escrow)
    const remainingToCover = Math.max(0, buyTotal - buyEscrow);

    return {
      sellCount: sellOrders.length,
      sellTotal,
      buyCount: buyOrders.length,
      buyTotal,
      buyEscrow,
      remainingToCover,
    };
  }, [sellOrders, buyOrders]);

  if (!isAuthenticated) {
    return (
      <PageLayout
        title="Market Orders"
        subtitle="View your active market orders with price status"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-text-primary mb-2">Login Required</h3>
            <p className="text-text-secondary mb-6">
              Connect your EVE Online account to view your market orders.
            </p>
            <Button onClick={login} variant="primary" className="px-8 py-3">
              Login with EVE Online
            </Button>
          </GlassmorphicCard>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Market Orders"
      subtitle="View your active market orders with real-time price status"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary min-h-[44px]"
            >
              <option value="all">All Orders ({orders.length})</option>
              <option value="sell">Sell Orders ({sellOrders.length})</option>
              <option value="buy">Buy Orders ({buyOrders.length})</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-5 h-5 sm:w-4 sm:h-4 rounded border-accent-cyan/30 bg-space-dark/50 text-accent-cyan focus:ring-accent-cyan"
              />
              Auto-refresh (5m)
            </label>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {lastRefresh && (
              <span className="text-xs text-text-secondary">
                Updated: {formatRelativeTime(lastRefresh)}
              </span>
            )}
            <Button
              onClick={loadOrders}
              disabled={loading}
              variant="secondary"
              className="flex items-center gap-2 min-h-[44px] px-4"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Sell Orders Section */}
        <GlassmorphicCard className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-display text-green-400">Selling</h2>
              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary">
                <span>
                  Orders: <span className="text-text-primary font-bold">{stats.sellCount}</span>
                </span>
                <span>
                  Total: <span className="text-green-400 font-bold">{formatISK(stats.sellTotal, false)}</span>
                </span>
              </div>
            </div>
            {priceLoading && (
              <span className="text-xs text-accent-cyan flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Checking prices...
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            </div>
          ) : sellOrders.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {sellOrders.map((order) => {
                  const status = priceStatus[order.order_id] || { status: 'unknown', priceDiff: 0 };
                  const expiresDate = new Date(order.issued);
                  expiresDate.setDate(expiresDate.getDate() + order.duration);
                  const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={order.order_id} className="p-4 bg-white/5 rounded-xl border border-accent-cyan/10">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary font-medium truncate">
                            {typeNames[order.type_id] || `Type ${order.type_id}`}
                          </h3>
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {locationNames[order.location_id] || `Location ${order.location_id}`}
                          </p>
                        </div>
                        <PriceStatusBadge status={status.status} priceDiff={status.priceDiff} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-text-secondary text-xs">Price</span>
                          <p className="font-mono text-text-primary">{formatISK(order.price, false)}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Total Value</span>
                          <p className="font-mono text-green-400">{formatISK(order.price * order.volume_remain, false)}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Volume</span>
                          <p className="font-mono text-text-secondary">{formatNumber(order.volume_remain, 0)}/{formatNumber(order.volume_total, 0)}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Expires</span>
                          <p className={`font-mono ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'}`}>
                            {daysLeft}d {Math.floor((expiresDate - new Date()) / (1000 * 60 * 60) % 24)}h
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-secondary border-b border-accent-cyan/20">
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-right py-2 px-3">Price</th>
                      <th className="text-left py-2 px-3">Price Status</th>
                      <th className="text-right py-2 px-3">Volume</th>
                      <th className="text-right py-2 px-3">Total</th>
                      <th className="text-right py-2 px-3">Expires</th>
                      <th className="text-left py-2 px-3">Station</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellOrders.map((order) => {
                      const status = priceStatus[order.order_id] || { status: 'unknown', priceDiff: 0 };
                      const expiresDate = new Date(order.issued);
                      expiresDate.setDate(expiresDate.getDate() + order.duration);
                      const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={order.order_id} className="border-b border-accent-cyan/10 hover:bg-white/5">
                          <td className="py-2 px-3 text-text-primary">
                            {typeNames[order.type_id] || `Type ${order.type_id}`}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-primary">
                            {formatISK(order.price, false)}
                          </td>
                          <td className="py-2 px-3">
                            <PriceStatusBadge status={status.status} priceDiff={status.priceDiff} />
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-secondary">
                            {formatNumber(order.volume_remain, 0)}/{formatNumber(order.volume_total, 0)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-green-400">
                            {formatISK(order.price * order.volume_remain, false)}
                          </td>
                          <td className={`py-2 px-3 text-right ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'}`}>
                            {daysLeft}d {Math.floor((expiresDate - new Date()) / (1000 * 60 * 60) % 24)}h
                          </td>
                          <td className="py-2 px-3 text-text-secondary text-xs truncate max-w-[200px]" title={locationNames[order.location_id]}>
                            {locationNames[order.location_id] || `Location ${order.location_id}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No active sell orders
            </div>
          )}
        </GlassmorphicCard>

        {/* Buy Orders Section */}
        <GlassmorphicCard>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-display text-red-400">Buying</h2>
              <span className="text-xs sm:text-sm text-text-secondary">
                Orders: <span className="text-text-primary font-bold">{stats.buyCount}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary">
              <span>
                Total: <span className="text-red-400 font-bold">{formatISK(stats.buyTotal, false)}</span>
              </span>
              <span>
                Escrow: <span className="text-accent-cyan font-bold">{formatISK(stats.buyEscrow, false)}</span>
              </span>
              <span className="col-span-2 sm:col-span-1">
                To cover: <span className={stats.remainingToCover > 0 ? 'text-yellow-400' : 'text-green-400'}>{formatISK(stats.remainingToCover, false)}</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            </div>
          ) : buyOrders.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {buyOrders.map((order) => {
                  const status = priceStatus[order.order_id] || { status: 'unknown', priceDiff: 0 };
                  const expiresDate = new Date(order.issued);
                  expiresDate.setDate(expiresDate.getDate() + order.duration);
                  const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={order.order_id} className="p-4 bg-white/5 rounded-xl border border-accent-cyan/10">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary font-medium truncate">
                            {typeNames[order.type_id] || `Type ${order.type_id}`}
                          </h3>
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {locationNames[order.location_id] || `Location ${order.location_id}`}
                          </p>
                        </div>
                        <PriceStatusBadge status={status.status} priceDiff={status.priceDiff} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-text-secondary text-xs">Price</span>
                          <p className="font-mono text-text-primary">{formatISK(order.price, false)}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Total Value</span>
                          <p className="font-mono text-red-400">{formatISK(order.price * order.volume_remain, false)}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Volume</span>
                          <p className="font-mono text-text-secondary">{formatNumber(order.volume_remain, 0)}/{formatNumber(order.volume_total, 0)}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Escrow</span>
                          <p className="font-mono text-accent-cyan">{formatISK(order.escrow || 0, false)}</p>
                        </div>
                        <div className="col-span-2 flex justify-between items-center pt-2 border-t border-accent-cyan/10">
                          <span className="text-text-secondary text-xs">Expires</span>
                          <span className={`font-mono text-sm ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'}`}>
                            {daysLeft}d {Math.floor((expiresDate - new Date()) / (1000 * 60 * 60) % 24)}h
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-secondary border-b border-accent-cyan/20">
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-right py-2 px-3">Price</th>
                      <th className="text-left py-2 px-3">Price Status</th>
                      <th className="text-right py-2 px-3">Volume</th>
                      <th className="text-right py-2 px-3">Total</th>
                      <th className="text-right py-2 px-3">Escrow</th>
                      <th className="text-right py-2 px-3">Expires</th>
                      <th className="text-left py-2 px-3">Station</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyOrders.map((order) => {
                      const status = priceStatus[order.order_id] || { status: 'unknown', priceDiff: 0 };
                      const expiresDate = new Date(order.issued);
                      expiresDate.setDate(expiresDate.getDate() + order.duration);
                      const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={order.order_id} className="border-b border-accent-cyan/10 hover:bg-white/5">
                          <td className="py-2 px-3 text-text-primary">
                            {typeNames[order.type_id] || `Type ${order.type_id}`}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-primary">
                            {formatISK(order.price, false)}
                          </td>
                          <td className="py-2 px-3">
                            <PriceStatusBadge status={status.status} priceDiff={status.priceDiff} />
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-secondary">
                            {formatNumber(order.volume_remain, 0)}/{formatNumber(order.volume_total, 0)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-red-400">
                            {formatISK(order.price * order.volume_remain, false)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-accent-cyan">
                            {formatISK(order.escrow || 0, false)}
                          </td>
                          <td className={`py-2 px-3 text-right ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-secondary'}`}>
                            {daysLeft}d {Math.floor((expiresDate - new Date()) / (1000 * 60 * 60) % 24)}h
                          </td>
                          <td className="py-2 px-3 text-text-secondary text-xs truncate max-w-[200px]" title={locationNames[order.location_id]}>
                            {locationNames[order.location_id] || `Location ${order.location_id}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No active buy orders
            </div>
          )}
        </GlassmorphicCard>
      </div>
    </PageLayout>
  );
}

export default MarketOrdersPage;
