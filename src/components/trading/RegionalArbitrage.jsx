/**
 * RegionalArbitrage Component
 *
 * Displays profitable arbitrage opportunities across major EVE Online trade hubs.
 * Fetches real market data from ESI API and identifies the best buy/sell routes
 * between different regions.
 *
 * Features:
 * - Compares prices across 5 major trade hubs (Jita, Amarr, Dodixie, Rens, Hek)
 * - Shows best buy price (lowest sell order) for each hub
 * - Shows best sell price (highest buy order) for each hub
 * - Displays daily volume for market depth analysis
 * - Calculates profit opportunity and ROI percentage
 * - Highlights the best arbitrage route
 * - Loading and error states with fallback UI
 *
 * Usage:
 * ```jsx
 * <RegionalArbitrage
 *   itemId={34}
 *   itemName="Tritanium"
 *   onSelect={(route) => console.log('Selected route:', route)}
 * />
 * ```
 */

import { useState, useEffect, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';
import { TRADE_HUBS } from '../../utils/constants';
import { getMarketOrders } from '../../api/esi';

/**
 * Calculate jump distances between trade hubs
 * Approximate distances based on EVE's geography
 */
const JUMP_DISTANCES = {
  'Jita-Amarr': 24,
  'Jita-Dodixie': 26,
  'Jita-Rens': 22,
  'Jita-Hek': 20,
  'Amarr-Dodixie': 28,
  'Amarr-Rens': 30,
  'Amarr-Hek': 25,
  'Dodixie-Rens': 18,
  'Dodixie-Hek': 15,
  'Rens-Hek': 8,
};

/**
 * Get jump count between two hubs
 */
function getJumpDistance(fromHub, toHub) {
  if (fromHub === toHub) return 0;
  const key1 = `${fromHub}-${toHub}`;
  const key2 = `${toHub}-${fromHub}`;
  return JUMP_DISTANCES[key1] || JUMP_DISTANCES[key2] || 20;
}

/**
 * Fetch and analyze market data for a region
 */
async function fetchHubMarketData(hub, itemId) {
  try {
    const orders = await getMarketOrders(hub.regionId, itemId, 'all');

    // Filter to only orders at the specific hub station
    const stationOrders = orders.filter(order => order.location_id === hub.stationId);

    // Separate buy and sell orders
    const buyOrders = stationOrders.filter(o => o.is_buy_order);
    const sellOrders = stationOrders.filter(o => !o.is_buy_order);

    // Get best prices
    const bestBuyPrice = buyOrders.length > 0
      ? Math.max(...buyOrders.map(o => o.price))
      : 0;
    const bestSellPrice = sellOrders.length > 0
      ? Math.min(...sellOrders.map(o => o.price))
      : 0;

    // Calculate daily volume (sum of all order volumes as proxy)
    const dailyVolume = stationOrders.reduce((sum, o) => sum + o.volume_remain, 0);

    return {
      ...hub,
      bestBuyPrice,
      bestSellPrice,
      dailyVolume,
      hasData: stationOrders.length > 0,
    };
  } catch (error) {
    console.error(`Failed to fetch market data for ${hub.shortName}:`, error);
    return {
      ...hub,
      bestBuyPrice: 0,
      bestSellPrice: 0,
      dailyVolume: 0,
      hasData: false,
      error: error.message,
    };
  }
}

/**
 * Calculate all arbitrage opportunities
 */
function calculateArbitrageOpportunities(hubsData) {
  const opportunities = [];

  // Compare each pair of hubs
  hubsData.forEach((buyHub) => {
    if (!buyHub.hasData || buyHub.bestSellPrice === 0) return;

    hubsData.forEach((sellHub) => {
      if (!sellHub.hasData || sellHub.bestBuyPrice === 0) return;
      if (buyHub.shortName === sellHub.shortName) return;

      // Calculate profit: buy from buyHub, sell to sellHub
      const profitPerUnit = sellHub.bestBuyPrice - buyHub.bestSellPrice;

      if (profitPerUnit > 0) {
        const roi = (profitPerUnit / buyHub.bestSellPrice) * 100;
        const jumps = getJumpDistance(buyHub.shortName, sellHub.shortName);

        opportunities.push({
          buyHub: buyHub.shortName,
          buyRegion: buyHub.regionName,
          buyPrice: buyHub.bestSellPrice,
          sellHub: sellHub.shortName,
          sellRegion: sellHub.regionName,
          sellPrice: sellHub.bestBuyPrice,
          profitPerUnit,
          roi,
          jumps,
        });
      }
    });
  });

  // Sort by profit per unit (descending)
  return opportunities.sort((a, b) => b.profitPerUnit - a.profitPerUnit);
}

/**
 * RegionalArbitrage Component
 */
export function RegionalArbitrage({ itemId, itemName = 'Item', onSelect }) {
  const [hubsData, setHubsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch market data for all hubs
  useEffect(() => {
    if (!itemId) return;

    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch data for all trade hubs in parallel
        const promises = TRADE_HUBS.map(hub => fetchHubMarketData(hub, itemId));
        const results = await Promise.all(promises);

        if (mounted) {
          setHubsData(results);
        }
      } catch (err) {
        console.error('Failed to fetch regional arbitrage data:', err);
        if (mounted) {
          setError(err.message || 'Failed to load market data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [itemId]);

  // Calculate arbitrage opportunities
  const opportunities = useMemo(() => {
    if (hubsData.length === 0) return [];
    return calculateArbitrageOpportunities(hubsData);
  }, [hubsData]);

  // Get best opportunity
  const bestOpportunity = opportunities.length > 0 ? opportunities[0] : null;

  // Loading state
  if (loading) {
    return (
      <GlassmorphicCard className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-sm text-text-secondary">
            Analyzing arbitrage opportunities for {itemName}...
          </p>
        </div>
      </GlassmorphicCard>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassmorphicCard className="border-red-500/30">
        <div className="text-center py-8">
          <div className="text-red-400 text-sm mb-2">Failed to load arbitrage data</div>
          <div className="text-xs text-text-secondary">{error}</div>
        </div>
      </GlassmorphicCard>
    );
  }

  // No data state
  if (hubsData.length === 0) {
    return (
      <GlassmorphicCard>
        <div className="text-center py-8 text-sm text-text-secondary">
          No market data available
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className="space-y-6">
      {/* Header */}
      <div className="border-b border-accent-cyan/20 pb-4">
        <h3 className="text-lg font-semibold text-accent-cyan mb-1">
          Regional Arbitrage Opportunities
        </h3>
        <p className="text-xs text-text-secondary">
          {itemName} - Compare prices across major trade hubs
        </p>
      </div>

      {/* Best Route Highlight */}
      {bestOpportunity && (
        <div className="bg-gradient-to-br from-green-500/20 to-accent-cyan/20 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⭐</span>
            <h4 className="text-sm font-medium text-green-400">Best Arbitrage Route</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-xs text-text-secondary mb-1">Buy From</div>
              <div className="text-sm font-medium text-accent-cyan">
                {bestOpportunity.buyHub}
              </div>
              <div className="text-xs text-text-secondary">{bestOpportunity.buyRegion}</div>
              <div className="text-sm font-mono text-text-primary mt-1">
                {formatISK(bestOpportunity.buyPrice, false)}
              </div>
            </div>

            <div>
              <div className="text-xs text-text-secondary mb-1">Sell To</div>
              <div className="text-sm font-medium text-accent-gold">
                {bestOpportunity.sellHub}
              </div>
              <div className="text-xs text-text-secondary">{bestOpportunity.sellRegion}</div>
              <div className="text-sm font-mono text-text-primary mt-1">
                {formatISK(bestOpportunity.sellPrice, false)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-green-500/20">
            <div className="text-center">
              <div className="text-xs text-text-secondary mb-1">Profit/Unit</div>
              <div className="text-sm font-medium text-green-400">
                {formatISK(bestOpportunity.profitPerUnit, false)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-secondary mb-1">ROI</div>
              <div className="text-sm font-medium text-accent-gold">
                {formatPercent(bestOpportunity.roi / 100, 1)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-text-secondary mb-1">Distance</div>
              <div className="text-sm font-medium text-text-primary">
                {bestOpportunity.jumps} jumps
              </div>
            </div>
          </div>

          {onSelect && (
            <button
              onClick={() => onSelect(bestOpportunity)}
              className="w-full mt-4 px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30
                       border border-accent-cyan/30 hover:border-accent-cyan/50
                       rounded-lg text-sm font-medium text-accent-cyan
                       transition-all duration-200"
            >
              Select This Route
            </button>
          )}
        </div>
      )}

      {/* Hub Comparison Table */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Hub Price Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-cyan/20">
                <th className="text-left py-2 px-2 text-xs font-medium text-text-secondary">
                  Trade Hub
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary">
                  Best Buy Price
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary">
                  Best Sell Price
                </th>
                <th className="text-right py-2 px-2 text-xs font-medium text-text-secondary">
                  Daily Volume
                </th>
              </tr>
            </thead>
            <tbody>
              {hubsData.map((hub) => {
                const isBestBuy = hubsData.every(h =>
                  !h.hasData || h.bestSellPrice === 0 || hub.bestSellPrice <= h.bestSellPrice
                ) && hub.hasData && hub.bestSellPrice > 0;

                const isBestSell = hubsData.every(h =>
                  !h.hasData || h.bestBuyPrice === 0 || hub.bestBuyPrice >= h.bestBuyPrice
                ) && hub.hasData && hub.bestBuyPrice > 0;

                return (
                  <tr
                    key={hub.shortName}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2 px-2">
                      <div className="font-medium text-text-primary">{hub.shortName}</div>
                      <div className="text-xs text-text-secondary">{hub.regionName}</div>
                    </td>
                    <td className="text-right py-2 px-2 font-mono">
                      {hub.hasData && hub.bestSellPrice > 0 ? (
                        <span className={isBestBuy ? 'text-green-400 font-semibold' : 'text-text-primary'}>
                          {formatISK(hub.bestSellPrice, false)}
                          {isBestBuy && <span className="text-xs ml-1">★</span>}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs">No data</span>
                      )}
                    </td>
                    <td className="text-right py-2 px-2 font-mono">
                      {hub.hasData && hub.bestBuyPrice > 0 ? (
                        <span className={isBestSell ? 'text-accent-gold font-semibold' : 'text-text-primary'}>
                          {formatISK(hub.bestBuyPrice, false)}
                          {isBestSell && <span className="text-xs ml-1">★</span>}
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs">No data</span>
                      )}
                    </td>
                    <td className="text-right py-2 px-2 font-mono">
                      {hub.hasData && hub.dailyVolume > 0 ? (
                        <span className="text-text-primary">{formatNumber(hub.dailyVolume, 0)}</span>
                      ) : (
                        <span className="text-text-secondary text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Opportunities */}
      {opportunities.length > 1 && (
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-3">
            All Arbitrage Routes ({opportunities.length})
          </h4>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {opportunities.slice(1).map((opp, idx) => (
              <div
                key={idx}
                className="bg-space-dark/30 rounded-lg p-3 border border-white/5 hover:border-accent-cyan/30 transition-all cursor-pointer group"
                onClick={() => onSelect && onSelect(opp)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-accent-cyan font-medium">{opp.buyHub}</span>
                    <span className="text-text-secondary">→</span>
                    <span className="text-accent-gold font-medium">{opp.sellHub}</span>
                    <span className="text-text-secondary">({opp.jumps} jumps)</span>
                  </div>
                  <div className="text-xs text-green-400 font-medium">
                    {formatPercent(opp.roi / 100, 1)} ROI
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-text-secondary">
                    Buy: <span className="text-text-primary font-mono">{formatISK(opp.buyPrice, false)}</span>
                  </div>
                  <div className="text-text-secondary">
                    Sell: <span className="text-text-primary font-mono">{formatISK(opp.sellPrice, false)}</span>
                  </div>
                  <div className="text-text-secondary">
                    Profit: <span className="text-green-400 font-mono">{formatISK(opp.profitPerUnit, false)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No opportunities message */}
      {opportunities.length === 0 && (
        <div className="text-center py-6 bg-space-dark/30 rounded-lg border border-white/5">
          <div className="text-sm text-text-secondary">
            No profitable arbitrage opportunities found
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Prices are currently equalized across all hubs
          </div>
        </div>
      )}

      {/* Trading Tips */}
      <div className="bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-accent-cyan text-sm">💡</span>
          <div className="text-xs text-text-secondary">
            <span className="font-medium text-text-primary">Trading Tips:</span> Consider cargo capacity,
            hauling costs, and route safety. High-value cargo through low-sec requires escorts.
            Always verify current market prices before committing to large trades.
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default RegionalArbitrage;
