import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '../hooks/useResources';
import { useApiCall } from '../hooks/useApiCall';
import { fetchOrders } from '../api/trading';
import { formatISK, formatNumber } from '../utils/formatters';
import { useEveAuth } from '../hooks/useEveAuth';
import { getCharacterOrders, getCharacterAssets } from '../api/esi';

/**
 * Orders Page Component
 * Displays market depth for a specific item between stations
 */
export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const { universeList, loadInvTypes } = useResources();
  const { data, loading, error, execute } = useApiCall(fetchOrders);
  const { isAuthenticated, character, getAccessToken } = useEveAuth();

  const [itemName, setItemName] = useState('Loading...');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [userAssets, setUserAssets] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Parse query parameters
  const itemId = searchParams.get('itemId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Load item name
  useEffect(() => {
    async function loadItemName() {
      if (!itemId) return;

      try {
        const invTypes = await loadInvTypes();
        if (invTypes && invTypes[itemId]) {
          // invTypes entries can be objects with typeName or just strings
          const typeData = invTypes[itemId];
          const name = (typeof typeData === 'object' && typeData?.typeName) ? typeData.typeName : typeData;
          setItemName(name || `Item #${itemId}`);
        } else {
          setItemName(`Item #${itemId}`);
        }
      } catch (err) {
        setItemName(`Item #${itemId}`);
      }
    }

    loadItemName();
  }, [itemId, loadInvTypes]);

  // Create memoized lookup map from station ID to station name
  const stationIdToNameMap = useMemo(() => {
    if (!universeList) return new Map();

    const map = new Map();
    for (const [name, data] of Object.entries(universeList)) {
      if (data.station) {
        map.set(String(data.station), name);
      }
    }
    return map;
  }, [universeList]);

  // Parse station names from location strings
  useEffect(() => {
    if (!stationIdToNameMap.size || !from || !to) return;

    // Parse from location
    const fromParts = from.replace(/^(buy|sell)-/, '').split(':');
    if (fromParts.length >= 2) {
      const stationId = fromParts[1];
      const stationName = stationIdToNameMap.get(stationId);
      if (stationName) {
        setFromStation(stationName);
      }
    }

    // Parse to location
    const toParts = to.replace(/^(buy|sell)-/, '').split(':');
    if (toParts.length >= 2) {
      const stationId = toParts[1];
      const stationName = stationIdToNameMap.get(stationId);
      if (stationName) {
        setToStation(stationName);
      }
    }
  }, [stationIdToNameMap, from, to]);

  // Fetch orders when parameters are available
  useEffect(() => {
    if (itemId && from && to) {
      execute({ itemId, from, to });
    }
  }, [itemId, from, to, execute]);

  // Fetch user's orders and assets if authenticated
  useEffect(() => {
    async function fetchUserData() {
      if (!isAuthenticated || !character?.id || !itemId) return;

      setLoadingUserData(true);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        // Fetch user's orders
        const orders = await getCharacterOrders(character.id, accessToken);
        const itemOrders = orders.filter(order => order.type_id === parseInt(itemId));
        setUserOrders(itemOrders);

        // Fetch user's assets for this item
        let allAssets = [];
        let page = 1;
        let hasMorePages = true;

        while (hasMorePages) {
          const assets = await getCharacterAssets(character.id, accessToken, page);
          if (assets && assets.length > 0) {
            allAssets = [...allAssets, ...assets];
            page++;
          } else {
            hasMorePages = false;
          }
        }

        const itemAssets = allAssets.filter(asset => asset.type_id === parseInt(itemId));
        setUserAssets(itemAssets);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoadingUserData(false);
      }
    }

    fetchUserData();
  }, [isAuthenticated, character?.id, itemId, getAccessToken]);

  // Calculate user's position in this item
  const userPosition = useMemo(() => {
    if (!userOrders.length && !userAssets.length) return null;

    const totalUnits = userAssets.reduce((sum, asset) => sum + (asset.quantity || 0), 0);
    const activeOrders = userOrders.filter(order => !order.is_closed);
    const sellOrders = activeOrders.filter(order => !order.is_buy_order);
    const buyOrders = activeOrders.filter(order => order.is_buy_order);

    const totalSellValue = sellOrders.reduce((sum, order) =>
      sum + (order.price * order.volume_remain), 0
    );
    const totalBuyValue = buyOrders.reduce((sum, order) =>
      sum + (order.price * order.volume_remain), 0
    );

    return {
      totalUnits,
      activeOrderCount: activeOrders.length,
      sellOrderCount: sellOrders.length,
      buyOrderCount: buyOrders.length,
      totalSellValue,
      totalBuyValue,
    };
  }, [userOrders, userAssets]);

  // Helper to check if an order belongs to the user
  const isUserOrder = (orderPrice, isBuyOrder) => {
    return userOrders.some(userOrder =>
      Math.abs(userOrder.price - orderPrice) < 0.01 &&
      userOrder.is_buy_order === isBuyOrder &&
      !userOrder.is_closed
    );
  };

  // Check if same station
  const isSameStation = from === to;

  return (
    <PageLayout
      title="Market Depth"
      subtitle={itemName}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Station Info */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-accent-cyan">Origin:</span>
            <span className="text-text-primary">{fromStation || 'Loading...'}</span>
          </div>
          {!isSameStation && (
            <>
              <span className="text-accent-cyan">→</span>
              <div className="flex items-center gap-2">
                <span className="text-accent-gold">Destination:</span>
                <span className="text-text-primary">{toStation || 'Loading...'}</span>
              </div>
            </>
          )}
        </div>

        {/* User Position Summary */}
        {isAuthenticated && userPosition && (
          <GlassmorphicCard className="mb-8">
            <h2 className="font-display text-xl text-accent-gold mb-4">Your Position</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-accent-cyan/10 rounded-lg border border-accent-cyan/20">
                <div className="text-text-secondary mb-1">Assets Owned</div>
                <div className="text-2xl font-bold text-accent-cyan">
                  {formatNumber(userPosition.totalUnits, 0)} units
                </div>
              </div>
              <div className="p-3 bg-accent-gold/10 rounded-lg border border-accent-gold/20">
                <div className="text-text-secondary mb-1">Active Orders</div>
                <div className="text-2xl font-bold text-accent-gold">
                  {userPosition.activeOrderCount}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {userPosition.buyOrderCount} buy, {userPosition.sellOrderCount} sell
                </div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-text-secondary mb-1">Total Value</div>
                <div className="text-lg font-bold text-green-400">
                  {formatISK(userPosition.totalSellValue + userPosition.totalBuyValue)}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Sell: {formatISK(userPosition.totalSellValue)} | Buy: {formatISK(userPosition.totalBuyValue)}
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <strong>Error:</strong> {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-2 gap-8">
            <GlassmorphicCard>
              <h2 className="font-display text-xl text-green-400 mb-4">Buy Orders</h2>
              <SkeletonTable rows={5} columns={2} />
            </GlassmorphicCard>
            <GlassmorphicCard>
              <h2 className="font-display text-xl text-red-400 mb-4">Sell Orders</h2>
              <SkeletonTable rows={5} columns={2} />
            </GlassmorphicCard>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className={`grid ${isSameStation ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-8`}>
            {/* Buy Orders (what you can sell to) */}
            <GlassmorphicCard>
              <h2 className="font-display text-xl text-green-400 mb-4">
                Buy Orders
                <span className="text-sm text-text-secondary ml-2 font-normal">
                  (You can sell to these)
                </span>
              </h2>

              {data.from && data.from.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-accent-cyan/20">
                        <th className="py-2 text-left text-accent-cyan font-medium">Price</th>
                        <th className="py-2 text-right text-accent-cyan font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.from
                        .sort((a, b) => b.price - a.price)
                        .slice(0, 20)
                        .map((order, i) => {
                          const isOwned = isAuthenticated && isUserOrder(order.price, true);
                          return (
                            <tr
                              key={i}
                              className={`border-b border-accent-cyan/10 ${isOwned ? 'bg-accent-gold/20' : ''}`}
                            >
                              <td className="py-2 font-mono text-green-400">
                                <div className="flex items-center gap-2">
                                  {formatISK(order.price, false)}
                                  {isOwned && (
                                    <span className="px-2 py-0.5 text-xs bg-accent-gold/30 border border-accent-gold/50 rounded text-accent-gold font-semibold">
                                      Your Order
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 text-right font-mono text-text-secondary">
                                {formatNumber(order.quantity, 0)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-secondary/50">No buy orders available</p>
              )}
            </GlassmorphicCard>

            {/* Sell Orders (what you can buy) */}
            <GlassmorphicCard>
              <h2 className="font-display text-xl text-red-400 mb-4">
                Sell Orders
                <span className="text-sm text-text-secondary ml-2 font-normal">
                  (You can buy from these)
                </span>
              </h2>

              {data.to && data.to.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-accent-cyan/20">
                        <th className="py-2 text-left text-accent-cyan font-medium">Price</th>
                        <th className="py-2 text-right text-accent-cyan font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.to
                        .sort((a, b) => a.price - b.price)
                        .slice(0, 20)
                        .map((order, i) => {
                          const isOwned = isAuthenticated && isUserOrder(order.price, false);
                          return (
                            <tr
                              key={i}
                              className={`border-b border-accent-cyan/10 ${isOwned ? 'bg-accent-gold/20' : ''}`}
                            >
                              <td className="py-2 font-mono text-red-400">
                                <div className="flex items-center gap-2">
                                  {formatISK(order.price, false)}
                                  {isOwned && (
                                    <span className="px-2 py-0.5 text-xs bg-accent-gold/30 border border-accent-gold/50 rounded text-accent-gold font-semibold">
                                      Your Order
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 text-right font-mono text-text-secondary">
                                {formatNumber(order.quantity, 0)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-text-secondary/50">No sell orders available</p>
              )}
            </GlassmorphicCard>
          </div>
        )}

        {/* No params */}
        {!itemId && (
          <GlassmorphicCard className="text-center py-12">
            <p className="text-text-secondary text-lg">
              No item selected. Please access this page from a trade result.
            </p>
          </GlassmorphicCard>
        )}
      </div>
    </PageLayout>
  );
}

export default OrdersPage;
