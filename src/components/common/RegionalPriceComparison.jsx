/**
 * RegionalPriceComparison Component
 *
 * A React component that displays price differences across major EVE Online trade hubs,
 * highlighting arbitrage opportunities for hauling traders.
 *
 * Features:
 * - Compares prices across 5 major trade hubs (Jita, Amarr, Dodixie, Rens, Hek)
 * - Visual price bars showing relative prices
 * - Arbitrage opportunity calculation with profit estimates
 * - Jump count estimates for hauling routes
 * - ISK per jump efficiency metrics
 * - Compact mode for inline display in tables
 * - Full mode with expandable details
 *
 * Usage:
 * ```jsx
 * // Full view
 * <RegionalPriceComparison
 *   buyPrice={1250000}
 *   sellPrice={1500000}
 *   volume={500}
 *   currentStation="Jita IV - Moon 4"
 *   compact={false}
 * />
 *
 * // Compact view (for tables)
 * <RegionalPriceComparison
 *   buyPrice={5000000}
 *   volume={1000}
 *   currentStation="Amarr VIII"
 *   compact={true}
 * />
 * ```
 *
 * @see RegionalPriceComparison.example.jsx for more usage examples
 */

import { useMemo, useState } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';

const TRADE_HUBS = [
  { id: 60003760, name: 'Jita', region: 'The Forge', shortName: 'Jita' },
  { id: 60008494, name: 'Amarr', region: 'Domain', shortName: 'Amarr' },
  { id: 60011866, name: 'Dodixie', region: 'Sinq Laison', shortName: 'Dodi' },
  { id: 60004588, name: 'Rens', region: 'Heimatar', shortName: 'Rens' },
  { id: 60005686, name: 'Hek', region: 'Metropolis', shortName: 'Hek' },
];

/**
 * Generate simulated regional prices based on a base price
 * In production, this would fetch from ESI API or backend
 * @param {number} basePrice - The base price to calculate from
 * @param {string} currentStation - Current station name to mark
 * @returns {Array} Array of hub price objects
 */
function generateRegionalPrices(basePrice, currentStation) {
  return TRADE_HUBS.map(hub => {
    // Jita is usually cheapest, others vary
    let priceMultiplier = 1;
    if (hub.shortName === 'Jita') priceMultiplier = 0.95 + Math.random() * 0.05;
    else if (hub.shortName === 'Amarr') priceMultiplier = 0.98 + Math.random() * 0.08;
    else priceMultiplier = 1.0 + Math.random() * 0.15;

    const price = basePrice * priceMultiplier;
    const isCurrent = hub.name.toLowerCase().includes(currentStation?.toLowerCase() || '');

    return {
      ...hub,
      price,
      isCurrent,
    };
  });
}

/**
 * Calculate arbitrage opportunities by comparing prices
 * @param {Array} prices - Array of regional prices
 * @param {number} currentPrice - Current location price
 * @param {number} volume - Trading volume for profit calculation
 * @returns {Array} Sorted array of arbitrage opportunities
 */
function calculateArbitrage(prices, currentPrice, volume) {
  const opportunities = [];

  prices.forEach(hub => {
    if (hub.price < currentPrice) {
      const profitPerUnit = currentPrice - hub.price;
      const totalProfit = profitPerUnit * Math.min(volume, 1000); // Cap at 1000 units

      opportunities.push({
        from: hub,
        profitPerUnit,
        totalProfit,
        profitPercent: (profitPerUnit / hub.price) * 100,
      });
    }
  });

  return opportunities.sort((a, b) => b.totalProfit - a.totalProfit);
}

/**
 * Calculate estimated jumps between trade hubs
 * Simplified routing - in production would use actual route data
 * @param {string} fromHub - Source hub name
 * @param {string} toHub - Destination hub name
 * @returns {number} Estimated jump count
 */
function calculateJumps(fromHub, toHub) {
  // Simplified jump estimates based on typical routes
  const jumpMatrix = {
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

  const key1 = `${fromHub}-${toHub}`;
  const key2 = `${toHub}-${fromHub}`;

  return jumpMatrix[key1] || jumpMatrix[key2] || 20; // Default 20 jumps
}

/**
 * RegionalPriceComparison Component
 * Shows price differences across major EVE trade hubs with arbitrage opportunities
 *
 * @param {number} buyPrice - Current buy price at station
 * @param {number} sellPrice - Current sell price at station
 * @param {number} volume - Trading volume
 * @param {string} currentStation - Current station name
 * @param {boolean} compact - Whether to show compact view
 */
export function RegionalPriceComparison({
  buyPrice,
  sellPrice: _sellPrice,
  volume = 100,
  currentStation = '',
  compact = false,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const { prices, arbitrage, cheapestHub, mostExpensiveHub } = useMemo(() => {
    const prices = generateRegionalPrices(buyPrice, currentStation);
    const arbitrage = calculateArbitrage(prices, buyPrice, volume);
    const sortedPrices = [...prices].sort((a, b) => a.price - b.price);

    return {
      prices,
      arbitrage,
      cheapestHub: sortedPrices[0],
      mostExpensiveHub: sortedPrices[sortedPrices.length - 1],
    };
  }, [buyPrice, currentStation, volume]);

  // Compact view - show inline summary
  if (compact) {
    const bestArbitrage = arbitrage[0];
    if (!bestArbitrage) {
      return (
        <span className="text-xs text-text-secondary">No arbitrage</span>
      );
    }

    return (
      <span
        className="text-xs text-green-400 cursor-pointer hover:text-green-300 transition-colors"
        onClick={() => setShowDetails(true)}
        title={`Buy in ${bestArbitrage.from.shortName} for ${formatPercent(bestArbitrage.profitPercent / 100, 1)} profit`}
      >
        +{formatISK(bestArbitrage.profitPerUnit, false)} from {bestArbitrage.from.shortName}
      </span>
    );
  }

  // Full view
  return (
    <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-accent-cyan">Regional Prices</h4>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-text-secondary hover:text-accent-cyan transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Quick summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
          <div className="text-xs text-text-secondary">Cheapest</div>
          <div className="text-green-400 font-medium">{cheapestHub.shortName}</div>
          <div className="text-xs font-mono text-text-primary">{formatISK(cheapestHub.price, false)}</div>
        </div>
        <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/20">
          <div className="text-xs text-text-secondary">Most Expensive</div>
          <div className="text-red-400 font-medium">{mostExpensiveHub.shortName}</div>
          <div className="text-xs font-mono text-text-primary">{formatISK(mostExpensiveHub.price, false)}</div>
        </div>
      </div>

      {/* Price comparison bars */}
      <div className="space-y-2">
        {prices.map(hub => {
          const pricePercent = (hub.price / mostExpensiveHub.price) * 100;
          const isLowest = hub.id === cheapestHub.id;
          const priceDiff = hub.price - cheapestHub.price;

          return (
            <div key={hub.id} className="flex items-center gap-2">
              <span className={`w-12 text-xs ${hub.isCurrent ? 'text-accent-cyan font-medium' : 'text-text-secondary'}`}>
                {hub.shortName}
              </span>
              <div className="flex-1 h-4 bg-space-dark rounded overflow-hidden relative group">
                <div
                  className={`h-full rounded transition-all ${isLowest ? 'bg-green-400' : 'bg-accent-cyan/50'}`}
                  style={{ width: `${pricePercent}%` }}
                />
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  {hub.name} ({hub.region})
                  <br />
                  {isLowest ? 'Lowest price' : `+${formatISK(priceDiff, false)} vs lowest`}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-space-black"></div>
                </div>
              </div>
              <span className={`w-20 text-xs font-mono text-right ${isLowest ? 'text-green-400' : 'text-text-primary'}`}>
                {formatISK(hub.price, false)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Arbitrage opportunities */}
      {arbitrage.length > 0 && showDetails && (
        <div className="mt-4 pt-3 border-t border-accent-cyan/10">
          <h5 className="text-xs text-accent-gold mb-2 font-medium">Arbitrage Opportunities</h5>
          <div className="space-y-2">
            {arbitrage.slice(0, 3).map((opp, idx) => {
              const jumps = calculateJumps(opp.from.shortName, currentStation || 'Jita');
              const iskPerJump = opp.totalProfit / jumps;

              return (
                <div key={idx} className="bg-accent-gold/10 rounded px-3 py-2 border border-accent-gold/20">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary">
                      Buy in <span className="text-accent-gold font-medium">{opp.from.shortName}</span>
                    </span>
                    <span className="text-green-400 font-mono font-medium">
                      +{formatISK(opp.totalProfit, false)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary/70">
                    <span>
                      {jumps} jumps • {formatISK(iskPerJump, false)}/jump
                    </span>
                    <span className="text-green-400">
                      {formatPercent(opp.profitPercent / 100, 1)} margin
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hauling route helper */}
          {arbitrage.length > 0 && (
            <div className="mt-3 p-2 bg-space-mid/30 rounded text-xs text-text-secondary">
              <div className="flex items-start gap-2">
                <span className="text-accent-cyan">💡</span>
                <div>
                  <span className="font-medium text-text-primary">Tip:</span> Check route safety and cargo capacity before hauling.
                  High-value cargo may require escort through low-sec systems.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No arbitrage message */}
      {arbitrage.length === 0 && showDetails && (
        <div className="mt-4 pt-3 border-t border-accent-cyan/10">
          <div className="text-center text-xs text-text-secondary p-3 bg-space-mid/20 rounded">
            Current location has the best price. No profitable arbitrage opportunities found.
          </div>
        </div>
      )}
    </div>
  );
}

export default RegionalPriceComparison;
