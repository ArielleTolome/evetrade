import { useState, useMemo, useCallback, useEffect } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { FormInput, FormSelect, StationAutocomplete } from '../forms';
import { useResources } from '../../hooks/useResources';
import { getStationData } from '../../utils/stations';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * Jump Freighter specifications
 */
const JUMP_FREIGHTERS = {
  ark: {
    name: 'Ark',
    fuelType: 'Helium Isotopes',
    fuelPerLY: 8100,
    maxJumpRange: 10, // light years with max skills
    cargoCapacity: 360000,
  },
  rhea: {
    name: 'Rhea',
    fuelType: 'Nitrogen Isotopes',
    fuelPerLY: 8100,
    maxJumpRange: 10,
    cargoCapacity: 327500,
  },
  nomad: {
    name: 'Nomad',
    fuelType: 'Oxygen Isotopes',
    fuelPerLY: 8100,
    maxJumpRange: 10,
    cargoCapacity: 360000,
  },
  anshar: {
    name: 'Anshar',
    fuelType: 'Hydrogen Isotopes',
    fuelPerLY: 8100,
    maxJumpRange: 10,
    cargoCapacity: 360000,
  },
};

/**
 * Isotope types and their current market prices (placeholder - should be fetched from API)
 */
const ISOTOPE_PRICES = {
  'Helium Isotopes': 850,
  'Nitrogen Isotopes': 800,
  'Oxygen Isotopes': 825,
  'Hydrogen Isotopes': 775,
};

/**
 * Jump Drive Calibration skill levels
 */
const JDC_SKILL_LEVELS = [
  { value: 0, label: 'Jump Drive Calibration 0 (5.0 LY)', range: 5.0 },
  { value: 1, label: 'Jump Drive Calibration 1 (5.5 LY)', range: 5.5 },
  { value: 2, label: 'Jump Drive Calibration 2 (6.0 LY)', range: 6.0 },
  { value: 3, label: 'Jump Drive Calibration 3 (6.5 LY)', range: 6.5 },
  { value: 4, label: 'Jump Drive Calibration 4 (7.0 LY)', range: 7.0 },
  { value: 5, label: 'Jump Drive Calibration 5 (7.5 LY)', range: 7.5 },
];

/**
 * Jump Drive Conservation skill levels
 */
const CONSERVATION_LEVELS = [
  { value: 0, label: 'Jump Drive Conservation 0 (0% reduction)', reduction: 0 },
  { value: 1, label: 'Jump Drive Conservation 1 (5% reduction)', reduction: 0.05 },
  { value: 2, label: 'Jump Drive Conservation 2 (10% reduction)', reduction: 0.10 },
  { value: 3, label: 'Jump Drive Conservation 3 (15% reduction)', reduction: 0.15 },
  { value: 4, label: 'Jump Drive Conservation 4 (20% reduction)', reduction: 0.20 },
  { value: 5, label: 'Jump Drive Conservation 5 (25% reduction)', reduction: 0.25 },
];

/**
 * Calculate distance between systems (simplified)
 */
function calculateDistance(from, to) {
  // In a real implementation, this would calculate actual light-year distance
  // For now, use a simplified random distance
  if (!from || !to) return 0;
  if (from.system === to.system) return 0;
  return Math.random() * 15 + 2; // 2-17 LY
}

/**
 * Fuel Cost Calculator Component
 * Calculates isotope costs for jump freighter routes
 */
export function FuelCostCalculator({ className = '' }) {
  const { universeList } = useResources();

  const [shipType, setShipType] = useState('ark');
  const [jdcLevel, setJdcLevel] = useState(5);
  const [conservationLevel, setConservationLevel] = useState(5);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [customIsotopePrice, setCustomIsotopePrice] = useState('');
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [cargoValue, setCargoValue] = useState(0);
  const [jumps, setJumps] = useState([]);

  // Get ship specs
  const ship = JUMP_FREIGHTERS[shipType];

  // Get jump range
  const jumpRange = useMemo(() => {
    const skill = JDC_SKILL_LEVELS.find(s => s.value === jdcLevel);
    return skill ? skill.range : 5.0;
  }, [jdcLevel]);

  // Get fuel reduction
  const fuelReduction = useMemo(() => {
    const skill = CONSERVATION_LEVELS.find(s => s.value === conservationLevel);
    return skill ? skill.reduction : 0;
  }, [conservationLevel]);

  // Get isotope price
  const isotopePrice = useMemo(() => {
    if (useCustomPrice && customIsotopePrice) {
      return parseFloat(customIsotopePrice);
    }
    return ISOTOPE_PRICES[ship.fuelType] || 800;
  }, [useCustomPrice, customIsotopePrice, ship.fuelType]);

  // Calculate route when stations change
  useEffect(() => {
    if (!fromStation || !toStation) {
      setJumps([]);
      return;
    }

    const fromData = getStationData(fromStation, universeList);
    const toData = getStationData(toStation, universeList);

    if (!fromData || !toData) {
      setJumps([]);
      return;
    }

    // Calculate distance
    const distance = calculateDistance(fromData, toData);

    // Calculate number of jumps needed
    const numJumps = Math.ceil(distance / jumpRange);

    // Generate jump waypoints (simplified)
    const jumpList = [];
    for (let i = 0; i < numJumps; i++) {
      const jumpDistance = Math.min(jumpRange, distance - (i * jumpRange));
      jumpList.push({
        id: i + 1,
        from: i === 0 ? fromStation : `Waypoint ${i}`,
        to: i === numJumps - 1 ? toStation : `Waypoint ${i + 1}`,
        distance: jumpDistance,
        fuelRequired: Math.floor(ship.fuelPerLY * jumpDistance * (1 - fuelReduction)),
        fuelCost: Math.floor(ship.fuelPerLY * jumpDistance * (1 - fuelReduction)) * isotopePrice,
      });
    }

    setJumps(jumpList);
  }, [fromStation, toStation, jumpRange, ship.fuelPerLY, fuelReduction, isotopePrice, universeList]);

  // Calculate totals
  const totals = useMemo(() => {
    if (jumps.length === 0) return null;

    const totalDistance = jumps.reduce((sum, j) => sum + j.distance, 0);
    const totalFuel = jumps.reduce((sum, j) => sum + j.fuelRequired, 0);
    const totalCost = jumps.reduce((sum, j) => sum + j.fuelCost, 0);
    const netProfit = cargoValue - totalCost;
    const profitMargin = cargoValue > 0 ? (netProfit / cargoValue) * 100 : 0;

    return {
      totalDistance,
      totalFuel,
      totalCost,
      netProfit,
      profitMargin,
      jumps: jumps.length,
    };
  }, [jumps, cargoValue]);

  // Copy jump plan to clipboard
  const copyJumpPlan = useCallback(() => {
    const text = jumps.map(j =>
      `Jump ${j.id}: ${j.from} → ${j.to} (${j.distance.toFixed(2)} LY, ${formatNumber(j.fuelRequired, 0)} ${ship.fuelType}, ${formatISK(j.fuelCost, false)})`
    ).join('\n');

    navigator.clipboard.writeText(text);
  }, [jumps, ship.fuelType]);

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display text-text-primary">Fuel Cost Calculator</h2>
          <p className="text-sm text-text-secondary mt-1">
            Calculate isotope costs and plan jump freighter routes
          </p>
        </div>

        {/* Ship Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text-secondary">Jump Freighter</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(JUMP_FREIGHTERS).map(([key, jf]) => (
              <button
                key={key}
                onClick={() => setShipType(key)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  shipType === key
                    ? 'bg-accent-cyan/20 border-accent-cyan'
                    : 'bg-space-dark/30 border-accent-cyan/10 hover:border-accent-cyan/30'
                }`}
              >
                <div className={`font-medium ${shipType === key ? 'text-accent-cyan' : 'text-text-primary'}`}>
                  {jf.name}
                </div>
                <div className="text-xs text-text-secondary mt-1">{jf.fuelType}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormSelect
            label="Jump Drive Calibration"
            value={jdcLevel}
            onChange={(v) => setJdcLevel(parseInt(v))}
            options={JDC_SKILL_LEVELS.map(s => ({ value: s.value, label: s.label }))}
          />
          <FormSelect
            label="Jump Drive Conservation"
            value={conservationLevel}
            onChange={(v) => setConservationLevel(parseInt(v))}
            options={CONSERVATION_LEVELS.map(s => ({ value: s.value, label: s.label }))}
          />
        </div>

        {/* Isotope Price */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="custom-price"
              checked={useCustomPrice}
              onChange={(e) => setUseCustomPrice(e.target.checked)}
              className="w-4 h-4 rounded border-accent-cyan/20 bg-space-dark/50 text-accent-cyan focus:ring-accent-cyan"
            />
            <label htmlFor="custom-price" className="text-sm text-text-secondary cursor-pointer">
              Use Custom {ship.fuelType} Price
            </label>
          </div>
          {useCustomPrice && (
            <FormInput
              label={`${ship.fuelType} Price (per unit)`}
              type="number"
              value={customIsotopePrice}
              onChange={setCustomIsotopePrice}
              suffix="ISK"
              placeholder={ISOTOPE_PRICES[ship.fuelType].toString()}
            />
          )}
          {!useCustomPrice && (
            <div className="text-sm text-text-secondary">
              Using market price: <span className="text-accent-cyan font-medium">{formatISK(isotopePrice, false)}</span> per {ship.fuelType}
            </div>
          )}
        </div>

        {/* Route */}
        <div className="grid md:grid-cols-2 gap-4">
          <StationAutocomplete
            label="From Station"
            value={fromStation}
            onChange={setFromStation}
            placeholder="Origin station..."
            showTradeHubs={true}
          />
          <StationAutocomplete
            label="To Station"
            value={toStation}
            onChange={setToStation}
            placeholder="Destination station..."
            showTradeHubs={true}
          />
        </div>

        {/* Cargo Value */}
        <FormInput
          label="Cargo Value (Optional)"
          type="number"
          value={cargoValue}
          onChange={setCargoValue}
          suffix="ISK"
          helper="Enter cargo value to calculate net profit after fuel costs"
        />

        {/* Results */}
        {totals && (
          <>
            {/* Summary Stats */}
            <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
              <h3 className="text-sm font-medium text-text-primary mb-3">Route Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-cyan">{totals.jumps}</div>
                  <div className="text-xs text-text-secondary">Jumps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{totals.totalDistance.toFixed(1)} LY</div>
                  <div className="text-xs text-text-secondary">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-gold">{formatNumber(totals.totalFuel, 0)}</div>
                  <div className="text-xs text-text-secondary">Isotopes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{formatISK(totals.totalCost, false)}</div>
                  <div className="text-xs text-text-secondary">Fuel Cost</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatISK(totals.netProfit, false)}
                  </div>
                  <div className="text-xs text-text-secondary">Net Profit</div>
                </div>
              </div>

              {cargoValue > 0 && (
                <div className="mt-4 pt-4 border-t border-accent-cyan/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Profit Margin:</span>
                    <span className={`text-lg font-bold ${totals.profitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {totals.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full h-2 bg-space-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        totals.profitMargin >= 50 ? 'bg-green-500' :
                        totals.profitMargin >= 20 ? 'bg-yellow-500' :
                        totals.profitMargin >= 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(Math.max(totals.profitMargin, 0), 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Jump Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display text-text-primary">Jump Plan</h3>
                <button
                  onClick={copyJumpPlan}
                  className="px-3 py-1.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors"
                >
                  Copy Plan
                </button>
              </div>
              <div className="space-y-2">
                {jumps.map((jump, _index) => (
                  <div
                    key={jump.id}
                    className="p-3 bg-space-dark/30 border border-accent-cyan/10 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 bg-accent-cyan/20 text-accent-cyan text-xs font-bold rounded-full">
                          {jump.id}
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {jump.from} → {jump.to}
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {jump.distance.toFixed(2)} LY
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        Fuel: <span className="text-accent-gold font-medium">{formatNumber(jump.fuelRequired, 0)}</span> {ship.fuelType}
                      </span>
                      <span className="text-text-secondary">
                        Cost: <span className="text-red-400 font-medium">{formatISK(jump.fuelCost, false)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fuel Efficiency Tips */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fuel Efficiency Tips
              </h4>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• Train Jump Drive Conservation V for 25% fuel reduction</li>
                <li>• Use jump bridges or titan bridges to reduce fuel costs</li>
                <li>• Plan routes to minimize the number of jumps</li>
                <li>• Consider cargo value vs fuel cost for profitability</li>
                {totals.profitMargin < 20 && totals.profitMargin > 0 && (
                  <li className="text-yellow-400">⚠ Low profit margin - consider increasing cargo value</li>
                )}
                {totals.profitMargin < 0 && (
                  <li className="text-red-400">⚠ Fuel costs exceed cargo value - route not profitable</li>
                )}
              </ul>
            </div>
          </>
        )}

        {/* No Route Message */}
        {!totals && (
          <div className="text-center py-12 text-text-secondary">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-lg">Select origin and destination stations to calculate fuel costs</p>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

export default FuelCostCalculator;
