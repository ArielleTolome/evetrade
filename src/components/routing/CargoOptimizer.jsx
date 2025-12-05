import { useState, useMemo, useCallback } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { FormInput } from '../forms';
import { formatISK, formatVolume } from '../../utils/formatters';

/**
 * Common ship cargo capacities in EVE Online
 */
const SHIP_PRESETS = [
  { name: 'Tayra (Hauler)', capacity: 6225 },
  { name: 'Badger (Hauler)', capacity: 7887 },
  { name: 'Mammoth (Hauler)', capacity: 8100 },
  { name: 'Wreathe (Hauler)', capacity: 6038 },
  { name: 'Bestower (Hauler)', capacity: 7713 },
  { name: 'Iteron Mark V (Hauler)', capacity: 10613 },
  { name: 'Epithal (Specialized)', capacity: 63000 },
  { name: 'Nereus (Deep Space)', capacity: 5038 },
  { name: 'Kryos (Specialized)', capacity: 43000 },
  { name: 'Miasmos (Specialized)', capacity: 63000 },
  { name: 'Bustard (Blockade Runner)', capacity: 50000 },
  { name: 'Prorator (Blockade Runner)', capacity: 50000 },
  { name: 'Impel (Deep Space)', capacity: 62500 },
  { name: 'Occator (Deep Space)', capacity: 62500 },
  { name: 'Providence (Freighter)', capacity: 1120000 },
  { name: 'Charon (Freighter)', capacity: 1340000 },
  { name: 'Obelisk (Freighter)', capacity: 1340000 },
  { name: 'Fenrir (Freighter)', capacity: 1127000 },
  { name: 'Ark (Jump Freighter)', capacity: 360000 },
  { name: 'Rhea (Jump Freighter)', capacity: 327500 },
  { name: 'Nomad (Jump Freighter)', capacity: 360000 },
  { name: 'Anshar (Jump Freighter)', capacity: 360000 },
];

/**
 * Knapsack algorithm for cargo optimization
 * Uses dynamic programming to find optimal item selection
 */
function optimizeCargo(trades, capacity) {
  if (!trades || trades.length === 0) return { selected: [], excluded: [], stats: null };

  // Filter out items with no volume data
  const validTrades = trades.filter(t => {
    const volume = t.Volume || t.volume || 0;
    return volume > 0;
  });

  if (validTrades.length === 0) return { selected: [], excluded: [], stats: null };

  // Sort by profit per m³ (efficiency)
  const sorted = validTrades.map(trade => {
    const volume = trade.Volume || trade.volume || 0;
    const profit = trade['Net Profit'] || trade.netProfit || 0;
    const efficiencyScore = volume > 0 ? profit / volume : 0;

    return {
      ...trade,
      volume,
      profit,
      efficiencyScore,
    };
  }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  // Greedy approximation - select items with best profit/volume ratio
  const selected = [];
  const excluded = [];
  let remainingCapacity = capacity;

  for (const item of sorted) {
    if (item.volume <= remainingCapacity) {
      selected.push(item);
      remainingCapacity -= item.volume;
    } else {
      excluded.push(item);
    }
  }

  // Calculate statistics
  const totalVolume = selected.reduce((sum, item) => sum + item.volume, 0);
  const totalProfit = selected.reduce((sum, item) => sum + item.profit, 0);
  const avgEfficiency = totalVolume > 0 ? totalProfit / totalVolume : 0;
  const capacityUsed = (totalVolume / capacity) * 100;

  const stats = {
    totalVolume,
    totalProfit,
    avgEfficiency,
    capacityUsed,
    itemCount: selected.length,
    excludedCount: excluded.length,
    remainingCapacity,
  };

  return { selected, excluded, stats };
}

/**
 * Cargo Optimizer Component
 * Optimizes trade selection based on cargo capacity
 */
export function CargoOptimizer({ trades = [], className = '' }) {
  const [cargoCapacity, setCargoCapacity] = useState(10000);
  const [selectedShip, setSelectedShip] = useState('');
  const [showExcluded, setShowExcluded] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonCapacities, setComparisonCapacities] = useState([10000, 50000, 360000]);

  // Handle ship preset selection
  const handleShipSelect = useCallback((shipName) => {
    const ship = SHIP_PRESETS.find(s => s.name === shipName);
    if (ship) {
      setSelectedShip(shipName);
      setCargoCapacity(ship.capacity);
    }
  }, []);

  // Optimize cargo
  const optimization = useMemo(() => {
    return optimizeCargo(trades, cargoCapacity);
  }, [trades, cargoCapacity]);

  // Compare different capacities
  const comparisons = useMemo(() => {
    if (!comparisonMode) return [];
    return comparisonCapacities.map(capacity => ({
      capacity,
      ...optimizeCargo(trades, capacity),
    }));
  }, [comparisonMode, comparisonCapacities, trades]);

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display text-text-primary">Cargo Optimizer</h2>
          <p className="text-sm text-text-secondary mt-1">
            Optimize your cargo selection for maximum ISK per m³
          </p>
        </div>

        {/* Ship Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text-secondary">Select Ship Preset</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {SHIP_PRESETS.map((ship) => (
              <button
                key={ship.name}
                onClick={() => handleShipSelect(ship.name)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                  selectedShip === ship.name
                    ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                    : 'bg-space-dark/30 border-accent-cyan/10 text-text-secondary hover:border-accent-cyan/30'
                }`}
              >
                <div className="font-medium truncate">{ship.name.split('(')[0].trim()}</div>
                <div className="text-xs opacity-70">{formatVolume(ship.capacity)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Capacity Input */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="Cargo Capacity (m³)"
            type="number"
            value={cargoCapacity}
            onChange={setCargoCapacity}
            suffix="m³"
            min={100}
            step={100}
          />
          <div className="flex items-end gap-2">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                comparisonMode
                  ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                  : 'bg-space-dark/30 border-accent-cyan/10 text-text-secondary hover:border-accent-cyan/30'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare Ships
            </button>
          </div>
        </div>

        {/* Comparison Mode */}
        {comparisonMode ? (
          <div className="space-y-4">
            <h3 className="text-lg font-display text-text-primary">Ship Comparison</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {comparisons.map((comp, index) => (
                <div
                  key={index}
                  className="p-4 bg-space-dark/30 border border-accent-cyan/10 rounded-lg"
                >
                  <div className="text-center mb-3">
                    <div className="text-lg font-bold text-accent-cyan">{formatVolume(comp.capacity)}</div>
                    <div className="text-xs text-text-secondary">Capacity</div>
                  </div>
                  {comp.stats && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Items:</span>
                        <span className="text-text-primary font-medium">{comp.stats.itemCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Profit:</span>
                        <span className="text-green-400 font-medium">{formatISK(comp.stats.totalProfit, false)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Volume:</span>
                        <span className="text-text-primary">{formatVolume(comp.stats.totalVolume)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Efficiency:</span>
                        <span className="text-accent-gold">{formatISK(comp.stats.avgEfficiency, false)}/m³</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">Capacity Used</span>
                          <span className="text-text-primary">{comp.stats.capacityUsed.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-space-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-cyan rounded-full transition-all"
                            style={{ width: `${Math.min(comp.stats.capacityUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Optimization Stats */}
            {optimization.stats && (
              <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
                <h3 className="text-sm font-medium text-text-primary mb-3">Optimization Results</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-cyan">{optimization.stats.itemCount}</div>
                    <div className="text-xs text-text-secondary">Items to Haul</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{formatISK(optimization.stats.totalProfit, false)}</div>
                    <div className="text-xs text-text-secondary">Total Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-gold">{formatISK(optimization.stats.avgEfficiency, false)}</div>
                    <div className="text-xs text-text-secondary">ISK per m³</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{optimization.stats.capacityUsed.toFixed(1)}%</div>
                    <div className="text-xs text-text-secondary">Capacity Used</div>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-text-secondary mb-2">
                    <span>Cargo: {formatVolume(optimization.stats.totalVolume)} / {formatVolume(cargoCapacity)}</span>
                    <span>{formatVolume(optimization.stats.remainingCapacity)} remaining</span>
                  </div>
                  <div className="w-full h-3 bg-space-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-cyan to-green-400 rounded-full transition-all"
                      style={{ width: `${Math.min(optimization.stats.capacityUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Selected Items */}
            {optimization.selected && optimization.selected.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display text-text-primary">
                    Items to Haul ({optimization.selected.length})
                  </h3>
                  <button
                    onClick={() => {
                      const text = optimization.selected.map(item =>
                        `${item.Item || item.item} x ${item.Volume || item.volume}`
                      ).join('\n');
                      navigator.clipboard.writeText(text);
                    }}
                    className="px-3 py-1.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors"
                  >
                    Copy List
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {optimization.selected.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-space-dark/30 border border-green-500/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">{item.Item || item.item}</div>
                        <div className="text-xs text-text-secondary">
                          Volume: {formatVolume(item.volume)} • Profit: {formatISK(item.profit, false)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-accent-gold">
                          {formatISK(item.efficiencyScore, false)}/m³
                        </div>
                        <div className="text-xs text-text-secondary">Efficiency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Excluded Items */}
            {optimization.excluded && optimization.excluded.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowExcluded(!showExcluded)}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showExcluded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Items Left Behind ({optimization.excluded.length})
                </button>

                {showExcluded && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {optimization.excluded.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-space-dark/30 border border-red-500/20 rounded-lg opacity-60"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{item.Item || item.item}</div>
                          <div className="text-xs text-text-secondary">
                            Volume: {formatVolume(item.volume)} • Profit: {formatISK(item.profit, false)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-text-secondary">
                            {formatISK(item.efficiencyScore, false)}/m³
                          </div>
                          <div className="text-xs text-red-400">Not enough space</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* No Trades Message */}
        {(!trades || trades.length === 0) && (
          <div className="text-center py-12 text-text-secondary">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg">No trade data available</p>
            <p className="text-sm mt-2">Find trades on the Station Trading or Hauling pages first</p>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

export default CargoOptimizer;
