import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { ItemAutocomplete } from '../components/forms/ItemAutocomplete';
import { fetchOrders } from '../api/trading';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';
import { TRADE_HUBS } from '../utils/constants';

/**
 * Price Comparison Page Component
 * Compare item prices across major EVE Online trade hubs
 */
export function PriceComparisonPage() {
  const navigate = useNavigate();

  // Form state
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedHubs, setSelectedHubs] = useState(
    TRADE_HUBS.reduce((acc, hub) => ({ ...acc, [hub.stationId]: true }), {})
  );

  // Data state
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle hub selection
  const toggleHub = (stationId) => {
    setSelectedHubs((prev) => ({
      ...prev,
      [stationId]: !prev[stationId],
    }));
  };

  // Select/deselect all hubs
  const toggleAllHubs = (selected) => {
    setSelectedHubs(
      TRADE_HUBS.reduce((acc, hub) => ({ ...acc, [hub.stationId]: selected }), {})
    );
  };

  // Fetch prices from all selected hubs
  const fetchPrices = useCallback(async () => {
    if (!selectedItem) {
      setError('Please select an item to compare');
      return;
    }

    const activeHubs = TRADE_HUBS.filter((hub) => selectedHubs[hub.stationId]);
    if (activeHubs.length === 0) {
      setError('Please select at least one trade hub');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch orders from all hubs in parallel
      const results = await Promise.all(
        activeHubs.map(async (hub) => {
          try {
            const locationStr = `${hub.regionId}:${hub.stationId}`;
            const data = await fetchOrders({
              itemId: selectedItem.typeId,
              from: locationStr,
              to: locationStr,
            });

            // Calculate best buy/sell prices and totals
            const buyOrders = data.from || [];
            const sellOrders = data.to || [];

            const highestBuy = buyOrders.length > 0
              ? Math.max(...buyOrders.map((o) => o.price))
              : null;
            const lowestSell = sellOrders.length > 0
              ? Math.min(...sellOrders.map((o) => o.price))
              : null;

            const buyVolume = buyOrders.reduce((sum, o) => sum + o.quantity, 0);
            const sellVolume = sellOrders.reduce((sum, o) => sum + o.quantity, 0);

            // Calculate spread (margin)
            const spread = highestBuy && lowestSell
              ? ((lowestSell - highestBuy) / lowestSell) * 100
              : null;

            return {
              hub,
              highestBuy,
              lowestSell,
              buyVolume,
              sellVolume,
              spread,
              buyOrders: buyOrders.length,
              sellOrders: sellOrders.length,
              error: null,
            };
          } catch (err) {
            return {
              hub,
              highestBuy: null,
              lowestSell: null,
              buyVolume: 0,
              sellVolume: 0,
              spread: null,
              buyOrders: 0,
              sellOrders: 0,
              error: err.message || 'Failed to fetch',
            };
          }
        })
      );

      setPriceData(results);
    } catch (err) {
      setError(err.message || 'Failed to fetch price data');
    } finally {
      setLoading(false);
    }
  }, [selectedItem, selectedHubs]);

  // Calculate recommendations
  const recommendations = useMemo(() => {
    if (!priceData || priceData.length === 0) return null;

    const validData = priceData.filter((d) => !d.error);
    if (validData.length === 0) return null;

    // Best place to buy (lowest sell price)
    const withSellPrices = validData.filter((d) => d.lowestSell !== null);
    const bestToBuy = withSellPrices.length > 0
      ? withSellPrices.reduce((best, curr) =>
        curr.lowestSell < best.lowestSell ? curr : best
      )
      : null;

    // Best place to sell (highest buy price)
    const withBuyPrices = validData.filter((d) => d.highestBuy !== null);
    const bestToSell = withBuyPrices.length > 0
      ? withBuyPrices.reduce((best, curr) =>
        curr.highestBuy > best.highestBuy ? curr : best
      )
      : null;

    // Best margin (highest spread)
    const withSpreads = validData.filter((d) => d.spread !== null && d.spread > 0);
    const bestMargin = withSpreads.length > 0
      ? withSpreads.reduce((best, curr) =>
        curr.spread > best.spread ? curr : best
      )
      : null;

    // Arbitrage opportunity (buy in one hub, sell in another)
    let arbitrage = null;
    if (bestToBuy && bestToSell && bestToBuy.hub.stationId !== bestToSell.hub.stationId) {
      const profit = bestToSell.highestBuy - bestToBuy.lowestSell;
      const profitPercent = (profit / bestToBuy.lowestSell) * 100;
      if (profit > 0) {
        arbitrage = {
          buyHub: bestToBuy.hub,
          sellHub: bestToSell.hub,
          buyPrice: bestToBuy.lowestSell,
          sellPrice: bestToSell.highestBuy,
          profit,
          profitPercent,
        };
      }
    }

    return {
      bestToBuy,
      bestToSell,
      bestMargin,
      arbitrage,
    };
  }, [priceData]);

  // Navigate to orders page for detailed view
  const viewOrderDetails = (hub) => {
    if (!selectedItem) return;
    const locationStr = `${hub.regionId}:${hub.stationId}`;
    navigate(`/orders?itemId=${selectedItem.typeId}&from=${locationStr}&to=${locationStr}`);
  };

  // Check how many hubs are selected
  const selectedCount = Object.values(selectedHubs).filter(Boolean).length;

  return (
    <PageLayout
      title="Price Comparison"
      subtitle="Compare item prices across major trade hubs"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Form */}
        <GlassmorphicCard className="mb-8">
          <div className="space-y-6">
            {/* Item Search */}
            <div>
              <ItemAutocomplete
                label="Item to Compare"
                value={selectedItem?.name || ''}
                onChange={(item) => {
                  setSelectedItem(item);
                  setPriceData(null);
                }}
                placeholder="Search for an item (e.g., PLEX, Tritanium, Ishtar)"
                required
              />
            </div>

            {/* Hub Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-secondary">
                  Trade Hubs
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => toggleAllHubs(true)}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-accent-cyan hover:text-accent-cyan/80 p-0 h-auto min-h-0"
                  >
                    Select All
                  </Button>
                  <span className="text-text-secondary/50">|</span>
                  <Button
                    type="button"
                    onClick={() => toggleAllHubs(false)}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-accent-cyan hover:text-accent-cyan/80 p-0 h-auto min-h-0"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {TRADE_HUBS.map((hub) => (
                  <label
                    key={hub.stationId}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg cursor-pointer
                      border transition-all duration-200
                      ${selectedHubs[hub.stationId]
                        ? 'border-accent-cyan/50 bg-accent-cyan/10'
                        : 'border-accent-cyan/20 hover:border-accent-cyan/30'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedHubs[hub.stationId]}
                      onChange={() => toggleHub(hub.stationId)}
                      className="w-4 h-4 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">
                        {hub.shortName}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {hub.regionName}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={fetchPrices}
              disabled={loading || !selectedItem || selectedCount === 0}
              variant="primary"
              className="w-full px-6 py-3"
            >
              {loading ? 'Fetching Prices...' : 'Compare Prices'}
            </Button>
          </div>
        </GlassmorphicCard>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={5} columns={6} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {priceData && !loading && (
          <>
            {/* Recommendations */}
            {recommendations && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Best to Buy */}
                <GlassmorphicCard className="p-4">
                  <div className="text-sm text-text-secondary mb-1">Best Place to Buy</div>
                  {recommendations.bestToBuy ? (
                    <>
                      <div className="text-lg font-bold text-green-400">
                        {recommendations.bestToBuy.hub.shortName}
                      </div>
                      <div className="text-sm text-text-primary">
                        {formatISK(recommendations.bestToBuy.lowestSell)}
                      </div>
                    </>
                  ) : (
                    <div className="text-text-secondary/50">No sell orders</div>
                  )}
                </GlassmorphicCard>

                {/* Best to Sell */}
                <GlassmorphicCard className="p-4">
                  <div className="text-sm text-text-secondary mb-1">Best Place to Sell</div>
                  {recommendations.bestToSell ? (
                    <>
                      <div className="text-lg font-bold text-red-400">
                        {recommendations.bestToSell.hub.shortName}
                      </div>
                      <div className="text-sm text-text-primary">
                        {formatISK(recommendations.bestToSell.highestBuy)}
                      </div>
                    </>
                  ) : (
                    <div className="text-text-secondary/50">No buy orders</div>
                  )}
                </GlassmorphicCard>

                {/* Best Margin */}
                <GlassmorphicCard className="p-4">
                  <div className="text-sm text-text-secondary mb-1">Best Margin Trade</div>
                  {recommendations.bestMargin ? (
                    <>
                      <div className="text-lg font-bold text-accent-gold">
                        {recommendations.bestMargin.hub.shortName}
                      </div>
                      <div className="text-sm text-text-primary">
                        {formatPercent(recommendations.bestMargin.spread)} spread
                      </div>
                    </>
                  ) : (
                    <div className="text-text-secondary/50">No margin available</div>
                  )}
                </GlassmorphicCard>

                {/* Arbitrage */}
                <GlassmorphicCard className="p-4">
                  <div className="text-sm text-text-secondary mb-1">Arbitrage Opportunity</div>
                  {recommendations.arbitrage ? (
                    <>
                      <div className="text-lg font-bold text-accent-cyan">
                        {formatPercent(recommendations.arbitrage.profitPercent)} profit
                      </div>
                      <div className="text-xs text-text-secondary">
                        Buy in {recommendations.arbitrage.buyHub.shortName} ({formatISK(recommendations.arbitrage.buyPrice)})
                      </div>
                      <div className="text-xs text-text-secondary">
                        Sell in {recommendations.arbitrage.sellHub.shortName} ({formatISK(recommendations.arbitrage.sellPrice)})
                      </div>
                    </>
                  ) : (
                    <div className="text-text-secondary/50">No arbitrage found</div>
                  )}
                </GlassmorphicCard>
              </div>
            )}

            {/* Price Table */}
            <GlassmorphicCard>
              <h2 className="font-display text-xl text-accent-cyan mb-4">
                {selectedItem?.name} - Price Comparison
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-accent-cyan/20">
                      <th className="py-3 text-left text-accent-cyan font-medium">Trade Hub</th>
                      <th className="py-3 text-right text-accent-cyan font-medium">Buy Price</th>
                      <th className="py-3 text-right text-accent-cyan font-medium">Buy Volume</th>
                      <th className="py-3 text-right text-accent-cyan font-medium">Sell Price</th>
                      <th className="py-3 text-right text-accent-cyan font-medium">Sell Volume</th>
                      <th className="py-3 text-right text-accent-cyan font-medium">Spread</th>
                      <th className="py-3 text-center text-accent-cyan font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceData.map((row) => (
                      <tr
                        key={row.hub.stationId}
                        className="border-b border-accent-cyan/10 hover:bg-accent-cyan/5 transition-colors"
                      >
                        <td className="py-3">
                          <div className="font-medium text-text-primary">{row.hub.shortName}</div>
                          <div className="text-xs text-text-secondary">{row.hub.regionName}</div>
                        </td>
                        <td className="py-3 text-right font-mono">
                          {row.error ? (
                            <span className="text-red-400">Error</span>
                          ) : row.highestBuy ? (
                            <span className={
                              recommendations?.bestToSell?.hub.stationId === row.hub.stationId
                                ? 'text-green-400 font-bold'
                                : 'text-green-400'
                            }>
                              {formatISK(row.highestBuy, false)}
                            </span>
                          ) : (
                            <span className="text-text-secondary/50">-</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono text-text-secondary">
                          {row.buyVolume > 0 ? formatNumber(row.buyVolume, 0) : '-'}
                        </td>
                        <td className="py-3 text-right font-mono">
                          {row.error ? (
                            <span className="text-red-400">Error</span>
                          ) : row.lowestSell ? (
                            <span className={
                              recommendations?.bestToBuy?.hub.stationId === row.hub.stationId
                                ? 'text-red-400 font-bold'
                                : 'text-red-400'
                            }>
                              {formatISK(row.lowestSell, false)}
                            </span>
                          ) : (
                            <span className="text-text-secondary/50">-</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-mono text-text-secondary">
                          {row.sellVolume > 0 ? formatNumber(row.sellVolume, 0) : '-'}
                        </td>
                        <td className="py-3 text-right font-mono">
                          {row.spread !== null ? (
                            <span className={
                              row.spread > 0
                                ? recommendations?.bestMargin?.hub.stationId === row.hub.stationId
                                  ? 'text-accent-gold font-bold'
                                  : 'text-accent-gold'
                                : 'text-text-secondary'
                            }>
                              {formatPercent(row.spread)}
                            </span>
                          ) : (
                            <span className="text-text-secondary/50">-</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <Button
                            onClick={() => viewOrderDetails(row.hub)}
                            variant="secondary"
                            size="sm"
                            className="px-3 py-1 text-xs bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 border-transparent"
                          >
                            View Orders
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-accent-cyan/10 text-xs text-text-secondary">
                <span className="font-bold text-green-400">Buy Price</span> = Highest buy order (you can sell to) |{' '}
                <span className="font-bold text-red-400">Sell Price</span> = Lowest sell order (you can buy from) |{' '}
                <span className="font-bold text-accent-gold">Spread</span> = Margin % between buy and sell
              </div>
            </GlassmorphicCard>
          </>
        )}

        {/* No data yet */}
        {!priceData && !loading && !error && (
          <GlassmorphicCard className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-display text-text-primary mb-2">
              Compare Prices Across Trade Hubs
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Search for an item above to see its buy and sell prices across all major EVE Online trade hubs.
              Find the best deals and arbitrage opportunities.
            </p>
          </GlassmorphicCard>
        )}
      </div>
    </PageLayout>
  );
}

export default PriceComparisonPage;
