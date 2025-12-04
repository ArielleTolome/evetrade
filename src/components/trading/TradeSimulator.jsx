import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { Button } from '../common/Button';
import { FormInput, FormSelect } from '../forms';
import { SimulationCard } from './SimulationCard';
import { ProfitChart } from './ProfitChart';
import { useSavedSimulations } from '../../hooks/useSavedSimulations';

const INITIAL_SCENARIO = {
  id: '',
  buyPrice: 1000000,
  sellPrice: 1200000,
  quantity: 100,
  salesTax: 2.5,
  brokerFee: 3.0,
  volatility: 5.0,
};

/**
 * Main component for trade simulation and what-if analysis.
 */
export function TradeSimulator({ prefillData = null }) {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState({
    ...INITIAL_SCENARIO,
    ...(prefillData || {}),
    id: uuidv4(),
  });
  const { savedSimulations, saveSimulation, deleteSimulation: deleteSavedSimulation } = useSavedSimulations();
  const [simulationName, setSimulationName] = useState('');

  useEffect(() => {
    if (prefillData) {
      setCurrentScenario(prev => ({
        ...prev,
        ...prefillData,
      }));
    }
  }, [prefillData]);

  // Memoized calculation of scenario metrics
  const calculatedScenarios = useMemo(() => {
    return scenarios.map(scenario => {
      const { buyPrice, sellPrice, quantity, salesTax, brokerFee, volatility } = scenario;
      const totalBuyCost = buyPrice * quantity;
      const totalSellRevenue = sellPrice * quantity;

      const brokerFeeCost = totalBuyCost * (brokerFee / 100) + totalSellRevenue * (brokerFee / 100);
      const salesTaxCost = totalSellRevenue * (salesTax / 100);
      const totalFees = brokerFeeCost + salesTaxCost;

      const profit = totalSellRevenue - totalBuyCost - totalFees;
      const roi = totalBuyCost > 0 ? profit / totalBuyCost : 0;
      const margin = buyPrice > 0 ? (sellPrice - buyPrice) / buyPrice : 0;
      const breakEven = buyPrice + totalFees / quantity;

      const volatilityAmount = sellPrice * (volatility / 100);
      const bestCasePrice = sellPrice + volatilityAmount;
      const worstCasePrice = sellPrice - volatilityAmount;

      const bestCase = (bestCasePrice - buyPrice) * quantity - totalFees;
      const worstCase = (worstCasePrice - buyPrice) * quantity - totalFees;

      return {
        ...scenario,
        profit,
        roi,
        margin,
        breakEven,
        bestCase,
        worstCase,
        expectedProfit: profit,
      };
    });
  }, [scenarios]);

  // Find the most profitable scenario
  const mostProfitableId = useMemo(() => {
    if (calculatedScenarios.length === 0) return null;
    return calculatedScenarios.reduce((max, s) => (s.profit > max.profit ? s : max)).id;
  }, [calculatedScenarios]);

  const handleInputChange = (field, value) => {
    setCurrentScenario(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const addScenario = () => {
    if (currentScenario.buyPrice > 0 && currentScenario.sellPrice > 0 && currentScenario.quantity > 0) {
      setScenarios(prev => [...prev, { ...currentScenario, id: uuidv4() }]);
    }
  };

  const deleteScenario = id => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  };

  const copyScenario = id => {
    const scenarioToCopy = scenarios.find(s => s.id === id);
    if (scenarioToCopy) {
      setScenarios(prev => [...prev, { ...scenarioToCopy, id: uuidv4() }]);
    }
  };

  const clearAllScenarios = () => {
    setScenarios([]);
  };

  const handleSaveSimulation = () => {
    if (simulationName && scenarios.length > 0) {
      saveSimulation(simulationName, scenarios);
      setSimulationName('');
    }
  };

  const handleLoadSimulation = (name) => {
    if (name && savedSimulations[name]) {
      setScenarios(savedSimulations[name]);
    }
  };

  return (
    <GlassmorphicCard className="p-6 bg-space-dark/60 backdrop-blur-lg border border-white/10 rounded-xl">
      <h2 className="text-2xl font-display text-text-primary mb-6">Trade Simulator</h2>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <FormInput
          label="Buy Price"
          type="number"
          value={currentScenario.buyPrice}
          onChange={value => handleInputChange('buyPrice', value)}
          suffix="ISK"
        />
        <FormInput
          label="Sell Price"
          type="number"
          value={currentScenario.sellPrice}
          onChange={value => handleInputChange('sellPrice', value)}
          suffix="ISK"
        />
        <FormInput
          label="Quantity"
          type="number"
          value={currentScenario.quantity}
          onChange={value => handleInputChange('quantity', value)}
        />
        <FormInput
          label="Broker Fee"
          type="number"
          value={currentScenario.brokerFee}
          onChange={value => handleInputChange('brokerFee', value)}
          suffix="%"
          step={0.1}
        />
        <FormInput
          label="Sales Tax"
          type="number"
          value={currentScenario.salesTax}
          onChange={value => handleInputChange('salesTax', value)}
          suffix="%"
          step={0.1}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Price Volatility (+/- {currentScenario.volatility.toFixed(1)}%)
        </label>
        <input
          type="range"
          min="0"
          max="50"
          step="0.5"
          value={currentScenario.volatility}
          onChange={e => handleInputChange('volatility', e.target.value)}
          className="w-full h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={addScenario} variant="primary">Add Scenario</Button>
        <Button onClick={clearAllScenarios} variant="secondary" disabled={scenarios.length === 0}>
          Clear All
        </Button>
      </div>

      {/* Save/Load Section */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-xl font-display text-text-primary mb-4">Saved Simulations</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <FormInput
            label="Simulation Name"
            value={simulationName}
            onChange={setSimulationName}
            placeholder="e.g., Jita Plex Flipping"
            className="flex-grow"
          />
          <Button
            onClick={handleSaveSimulation}
            disabled={scenarios.length === 0 || !simulationName}
          >
            Save Current
          </Button>
          <FormSelect
            label="Load Simulation"
            onChange={handleLoadSimulation}
            options={[
              { value: '', label: 'Select a simulation' },
              ...Object.keys(savedSimulations).map(name => ({ value: name, label: name }))
            ]}
            className="min-w-[200px]"
          />
        </div>
      </div>

      {/* Scenarios Display */}
      {calculatedScenarios.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {calculatedScenarios.map(scenario => (
            <SimulationCard
              key={scenario.id}
              scenario={scenario}
              onCopy={() => copyScenario(scenario.id)}
              onDelete={() => deleteScenario(scenario.id)}
              isBest={scenario.id === mostProfitableId}
            />
          ))}
        </div>
      )}

      {/* Profit Chart */}
      {calculatedScenarios.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-display text-text-primary mb-4">Profit Analysis</h3>
          <ProfitChart scenarios={calculatedScenarios} />
        </div>
      )}
    </GlassmorphicCard>
  );
}
