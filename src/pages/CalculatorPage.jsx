import { useState } from 'react';
import { Button } from '../components/common/Button';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { SkillCalculator } from '../components/common/SkillCalculator';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Profit Calculator Component
 */
function ProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState(1000000);
  const [sellPrice, setSellPrice] = useState(1200000);
  const [quantity, setQuantity] = useState(100);
  const [salesTax, setSalesTax] = useState(3.6);
  const [brokerFee, setBrokerFee] = useState(1.5);

  const grossRevenue = sellPrice * quantity;
  const totalCost = buyPrice * quantity;
  const taxAmount = grossRevenue * (salesTax / 100);
  const brokerAmount = (grossRevenue + totalCost) * (brokerFee / 100);
  const netProfit = grossRevenue - totalCost - taxAmount - brokerAmount;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
  const profitPerUnit = quantity > 0 ? netProfit / quantity : 0;

  return (
    <GlassmorphicCard>
      <h3 className="font-display text-xl text-text-primary mb-6">Profit Calculator</h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Buy Price (per unit)</label>
            <input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Sell Price (per unit)</label>
            <input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Sales Tax (%)</label>
            <input
              type="number"
              step="0.1"
              value={salesTax}
              onChange={(e) => setSalesTax(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Broker Fee (%)</label>
            <input
              type="number"
              step="0.1"
              value={brokerFee}
              onChange={(e) => setBrokerFee(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="border-t border-accent-cyan/20 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(netProfit, false)}
            </div>
            <div className="text-sm text-text-secondary">Net Profit</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className={`text-2xl font-bold ${roi >= 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
              {formatPercent(roi / 100, 1)}
            </div>
            <div className="text-sm text-text-secondary">ROI</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className={`text-2xl font-bold ${margin >= 0 ? 'text-accent-gold' : 'text-red-400'}`}>
              {formatPercent(margin / 100, 1)}
            </div>
            <div className="text-sm text-text-secondary">Margin</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-purple">
              {formatISK(profitPerUnit, false)}
            </div>
            <div className="text-sm text-text-secondary">Profit/Unit</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Gross Revenue:</span>
            <span className="font-mono">{formatISK(grossRevenue, false)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Total Cost:</span>
            <span className="font-mono text-red-400">-{formatISK(totalCost, false)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Sales Tax ({salesTax}%):</span>
            <span className="font-mono text-red-400">-{formatISK(taxAmount, false)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Broker Fees ({brokerFee}% x2):</span>
            <span className="font-mono text-red-400">-{formatISK(brokerAmount, false)}</span>
          </div>
          <div className="flex justify-between text-text-primary font-medium border-t border-accent-cyan/20 pt-2">
            <span>Net Profit:</span>
            <span className={`font-mono ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? '+' : ''}{formatISK(netProfit, false)}
            </span>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Cargo Calculator Component
 */
function CargoCalculator() {
  const [cargoCapacity, setCargoCapacity] = useState(30000);
  const [itemVolume, setItemVolume] = useState(0.01);
  const [itemPrice, setItemPrice] = useState(1000000);
  const [profitPerUnit, setProfitPerUnit] = useState(50000);

  const maxUnits = itemVolume > 0 ? Math.floor(cargoCapacity / itemVolume) : 0;
  const totalValue = maxUnits * itemPrice;
  const totalProfit = maxUnits * profitPerUnit;
  const iskPerM3 = cargoCapacity > 0 ? totalProfit / cargoCapacity : 0;

  return (
    <GlassmorphicCard>
      <h3 className="font-display text-xl text-text-primary mb-6">Cargo Calculator</h3>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Cargo Capacity (m³)</label>
            <input
              type="number"
              value={cargoCapacity}
              onChange={(e) => setCargoCapacity(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Item Volume (m³)</label>
            <input
              type="number"
              step="0.01"
              value={itemVolume}
              onChange={(e) => setItemVolume(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Item Price (ISK)</label>
            <input
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Profit per Unit (ISK)</label>
            <input
              type="number"
              value={profitPerUnit}
              onChange={(e) => setProfitPerUnit(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="border-t border-accent-cyan/20 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-cyan">
              {formatNumber(maxUnits, 0)}
            </div>
            <div className="text-sm text-text-secondary">Max Units</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-gold">
              {formatISK(totalValue, false)}
            </div>
            <div className="text-sm text-text-secondary">Total Value</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-green-400">
              {formatISK(totalProfit, false)}
            </div>
            <div className="text-sm text-text-secondary">Total Profit</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-purple">
              {formatISK(iskPerM3, false)}
            </div>
            <div className="text-sm text-text-secondary">ISK/m³</div>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Calculator Page Component
 */
export function CalculatorPage() {
  const [activeTab, setActiveTab] = useState('skills');

  const tabs = [
    { id: 'skills', label: 'Skills & Taxes', icon: '📊' },
    { id: 'profit', label: 'Profit Calculator', icon: '💰' },
    { id: 'cargo', label: 'Cargo Calculator', icon: '📦' },
  ];

  return (
    <PageLayout
      title="Calculators"
      subtitle="Tools to optimize your trading efficiency"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'secondary' : 'ghost'}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 border-transparent'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'skills' && <SkillCalculator />}
        {activeTab === 'profit' && <ProfitCalculator />}
        {activeTab === 'cargo' && <CargoCalculator />}
      </div>
    </PageLayout>
  );
}

export default CalculatorPage;
