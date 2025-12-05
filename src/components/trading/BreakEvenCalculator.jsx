import { useState, useMemo, useEffect } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * BreakEvenCalculator Component
 * @description Calculates minimum sell price needed to break even or achieve target profit
 * Shows profit margins at various price points for quick reference
 *
 * @component
 * @example
 * <BreakEvenCalculator />
 */
export function BreakEvenCalculator() {
  // Load tax settings from localStorage (same as TaxCalculator)
  const loadTaxSettings = () => {
    try {
      const saved = localStorage.getItem('evetrade_tax_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        const { brokerRelations = 5, accounting = 5, factionStanding = 0, corporationStanding = 0 } = settings;

        // Calculate effective rates using same formulas as TaxCalculator
        const baseBrokerFee = 0.03;
        const baseSalesTax = 0.05;
        const skillReduction = brokerRelations * 0.003;
        const standingsReduction = (Math.max(0, factionStanding) * 0.003) + (Math.max(0, corporationStanding) * 0.002);
        const effectiveBrokerFee = Math.max(0.01, baseBrokerFee - skillReduction - standingsReduction);
        const effectiveSalesTax = baseSalesTax * Math.pow(0.90, accounting);

        return { brokerFee: effectiveBrokerFee, salesTax: effectiveSalesTax };
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
    }
    // Default: max skills (Broker Relations 5, Accounting 5, no standings)
    return { brokerFee: 0.015, salesTax: 0.025 };
  };

  const [taxRates, setTaxRates] = useState(loadTaxSettings);
  const [buyPrice, setBuyPrice] = useState(1000000); // 1M ISK default
  const [targetProfitPercent, setTargetProfitPercent] = useState(10); // 10% default

  // Reload tax settings when component mounts or localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setTaxRates(loadTaxSettings());
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check on interval in case same tab updated it
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate break-even and target prices
  const calculations = useMemo(() => {
    const { brokerFee, salesTax } = taxRates;

    if (buyPrice <= 0) {
      return {
        buyWithFees: 0,
        breakEvenSellPrice: 0,
        targetSellPrice: 0,
        breakEvenProfit: 0,
        targetProfit: 0,
        scenarios: [],
      };
    }

    // Total cost including buy broker fee
    const buyBrokerFee = buyPrice * brokerFee;
    const buyWithFees = buyPrice + buyBrokerFee;

    // Break-even calculation
    // We need: sellPrice - (sellPrice * salesTax) - (sellPrice * brokerFee) = buyWithFees
    // sellPrice * (1 - salesTax - brokerFee) = buyWithFees
    // sellPrice = buyWithFees / (1 - salesTax - brokerFee)
    const breakEvenSellPrice = buyWithFees / (1 - salesTax - brokerFee);

    // Target profit calculation
    const targetProfit = buyWithFees * (targetProfitPercent / 100);
    const targetRevenue = buyWithFees + targetProfit;
    const targetSellPrice = targetRevenue / (1 - salesTax - brokerFee);

    // Generate profit scenarios at different margins
    const scenarios = [5, 10, 15, 20, 25, 30].map(margin => {
      const profit = buyWithFees * (margin / 100);
      const revenue = buyWithFees + profit;
      const sellPrice = revenue / (1 - salesTax - brokerFee);
      const sellFees = (sellPrice * salesTax) + (sellPrice * brokerFee);

      return {
        margin,
        sellPrice,
        profit,
        sellFees,
        roi: margin,
      };
    });

    return {
      buyWithFees,
      breakEvenSellPrice,
      targetSellPrice,
      breakEvenProfit: 0,
      targetProfit,
      scenarios,
      brokerFee,
      salesTax,
    };
  }, [buyPrice, targetProfitPercent, taxRates]);

  return (
    <GlassmorphicCard className="max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-cyan/20">
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
              <svg className="w-7 h-7 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Break-Even Calculator
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Find the minimum sell price to break even or achieve your profit target
            </p>
          </div>
        </div>

        {/* Current Tax Rates Display */}
        <div className="p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-text-primary">Using your saved tax settings</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-text-secondary">Broker Fee:</span>
              <span className="ml-2 font-mono text-accent-cyan">{formatPercent(calculations.brokerFee, 2)}</span>
            </div>
            <div>
              <span className="text-text-secondary">Sales Tax:</span>
              <span className="ml-2 font-mono text-accent-gold">{formatPercent(calculations.salesTax, 2)}</span>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buy Price */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Buy Price (per unit)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan font-mono text-lg"
              placeholder="1000000"
            />
            <div className="mt-2 text-xs text-text-secondary">
              Total cost with fees: <span className="font-mono text-accent-cyan">{formatISK(calculations.buyWithFees)}</span>
            </div>
          </div>

          {/* Target Profit Percent */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Target Profit Margin (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={targetProfitPercent}
                onChange={(e) => setTargetProfitPercent(parseInt(e.target.value))}
                className="flex-1 h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={targetProfitPercent}
                onChange={(e) => setTargetProfitPercent(parseInt(e.target.value) || 10)}
                className="w-20 px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-center"
              />
              <span className="text-text-secondary">%</span>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              Target profit: <span className="font-mono text-accent-gold">{formatISK(calculations.targetProfit)}</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-accent-cyan/20">
          {/* Break-Even Price */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-red-400/10 to-red-400/5 border-2 border-red-400/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-sm font-semibold text-text-primary">Break-Even Sell Price</h3>
            </div>
            <div className="text-3xl font-bold font-mono text-red-400 mb-2">
              {formatISK(calculations.breakEvenSellPrice)}
            </div>
            <div className="text-xs text-text-secondary">
              Minimum price to recover all costs (0% profit)
            </div>
          </div>

          {/* Target Price */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-green-400/10 to-green-400/5 border-2 border-green-400/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-text-primary">Target Sell Price</h3>
            </div>
            <div className="text-3xl font-bold font-mono text-green-400 mb-2">
              {formatISK(calculations.targetSellPrice)}
            </div>
            <div className="text-xs text-text-secondary">
              Price needed for {targetProfitPercent}% profit margin
            </div>
          </div>
        </div>

        {/* Quick Reference Table */}
        <div className="pt-4 border-t border-accent-cyan/20">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Quick Reference: Common Profit Margins
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent-cyan/20">
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Margin</th>
                  <th className="text-right py-3 px-4 text-text-secondary font-medium">Sell Price</th>
                  <th className="text-right py-3 px-4 text-text-secondary font-medium">Net Profit</th>
                  <th className="text-right py-3 px-4 text-text-secondary font-medium">Fees Paid</th>
                  <th className="text-right py-3 px-4 text-text-secondary font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {calculations.scenarios.map((scenario, index) => (
                  <tr
                    key={scenario.margin}
                    className={`border-b border-accent-cyan/10 hover:bg-accent-cyan/5 transition-colors ${
                      scenario.margin === targetProfitPercent ? 'bg-accent-gold/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{scenario.margin}%</span>
                        {scenario.margin === targetProfitPercent && (
                          <span className="text-xs px-2 py-0.5 rounded bg-accent-gold/20 text-accent-gold">
                            Target
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-text-primary font-semibold">
                      {formatISK(scenario.sellPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-green-400">
                      +{formatISK(scenario.profit)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-400">
                      {formatISK(scenario.sellFees)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-accent-cyan">
                      {formatPercent(scenario.roi / 100, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Breakdown */}
        <div className="pt-4 border-t border-accent-cyan/20">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-2">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              How is this calculated?
            </summary>
            <div className="mt-4 p-4 rounded-lg bg-space-dark/30 text-sm text-text-secondary space-y-3">
              <div>
                <strong className="text-text-primary">Step 1: Calculate total buy cost</strong>
                <div className="font-mono text-xs mt-1 p-2 bg-space-dark/50 rounded">
                  Buy Cost = Buy Price + (Buy Price × Broker Fee)<br />
                  Buy Cost = {formatISK(buyPrice)} + {formatISK(buyPrice * calculations.brokerFee)}<br />
                  Buy Cost = {formatISK(calculations.buyWithFees)}
                </div>
              </div>
              <div>
                <strong className="text-text-primary">Step 2: Calculate required sell price</strong>
                <div className="font-mono text-xs mt-1 p-2 bg-space-dark/50 rounded">
                  We need: Sell Price × (1 - Sales Tax - Broker Fee) = Buy Cost + Target Profit<br />
                  Sell Price = (Buy Cost + Target Profit) / (1 - {formatPercent(calculations.salesTax, 2)} - {formatPercent(calculations.brokerFee, 2)})<br />
                  Sell Price = ({formatISK(calculations.buyWithFees)} + {formatISK(calculations.targetProfit)}) / {(1 - calculations.salesTax - calculations.brokerFee).toFixed(4)}<br />
                  Sell Price = {formatISK(calculations.targetSellPrice)}
                </div>
              </div>
              <div>
                <strong className="text-text-primary">Step 3: Verify the math</strong>
                <div className="font-mono text-xs mt-1 p-2 bg-space-dark/50 rounded">
                  Revenue after fees = {formatISK(calculations.targetSellPrice)} × {(1 - calculations.salesTax - calculations.brokerFee).toFixed(4)}<br />
                  Revenue after fees = {formatISK(calculations.targetSellPrice * (1 - calculations.salesTax - calculations.brokerFee))}<br />
                  Profit = {formatISK(calculations.targetSellPrice * (1 - calculations.salesTax - calculations.brokerFee))} - {formatISK(calculations.buyWithFees)}<br />
                  Profit = {formatISK(calculations.targetProfit)}
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
          <svg className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-text-secondary">
            <p className="mb-2">
              <strong className="text-text-primary">Trading Tips:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use the Tax Calculator to set your skills and standings for accurate results</li>
              <li>Higher margins = higher profit but slower sales</li>
              <li>5-15% margins are typical for high-volume station trading</li>
              <li>20%+ margins work for low-competition or specialized items</li>
              <li>Always account for market volatility when setting prices</li>
            </ul>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default BreakEvenCalculator;
