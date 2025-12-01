import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '../hooks/index';
import { useApiCall } from '../hooks/useApiCall';
import { fetchOrders } from '../api/trading';
import { formatISK, formatNumber } from '../utils/formatters';

/**
 * Orders Page Component
 * Displays market depth for a specific item between stations
 */
export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const { universeList, loadInvTypes } = useResources();
  const { data, loading, error, execute } = useApiCall(fetchOrders);

  const [itemName, setItemName] = useState('Loading...');

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
          const name = typeof typeData === 'object' ? typeData.typeName : typeData;
          setItemName(name || `Item #${itemId}`);
        } else {
          setItemName(`Item #${itemId}`);
        }
      } catch {
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

  // Derive station names from props/state directly instead of syncing to state in effect
  const fromStation = useMemo(() => {
     if (!stationIdToNameMap.size || !from) return '';
     const fromParts = from.replace(/^(buy|sell)-/, '').split(':');
     if (fromParts.length >= 2) {
       const stationId = fromParts[1];
       return stationIdToNameMap.get(stationId) || '';
     }
     return '';
  }, [stationIdToNameMap, from]);

  const toStation = useMemo(() => {
      if (!stationIdToNameMap.size || !to) return '';
      const toParts = to.replace(/^(buy|sell)-/, '').split(':');
      if (toParts.length >= 2) {
        const stationId = toParts[1];
        return stationIdToNameMap.get(stationId) || '';
      }
      return '';
  }, [stationIdToNameMap, to]);

  // Fetch orders when parameters are available
  useEffect(() => {
    if (itemId && from && to) {
      execute({ itemId, from, to });
    }
  }, [itemId, from, to, execute]);

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
                        .map((order, i) => (
                          <tr key={i} className="border-b border-accent-cyan/10">
                            <td className="py-2 font-mono text-green-400">
                              {formatISK(order.price, false)}
                            </td>
                            <td className="py-2 text-right font-mono text-text-secondary">
                              {formatNumber(order.quantity, 0)}
                            </td>
                          </tr>
                        ))}
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
                        .map((order, i) => (
                          <tr key={i} className="border-b border-accent-cyan/10">
                            <td className="py-2 font-mono text-red-400">
                              {formatISK(order.price, false)}
                            </td>
                            <td className="py-2 text-right font-mono text-text-secondary">
                              {formatNumber(order.quantity, 0)}
                            </td>
                          </tr>
                        ))}
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
