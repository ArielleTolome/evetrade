import { useState, useEffect, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatPercent, formatISK, formatNumber } from '../../utils/formatters';

/**
 * TaxCalculator Component
 * @description Calculates broker fees and sales tax based on skills and standings
 * Helps traders understand their effective tax rates and net profit after all fees
 *
 * @component
 * @example
 * <TaxCalculator />
 */
export function TaxCalculator() {
  // Load saved settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('evetrade_tax_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
    }
    return {
      brokerRelations: 5,
      accounting: 5,
      factionStanding: 0,
      corporationStanding: 0,
    };
  };

  const [settings, setSettings] = useState(loadSettings);
  const [tradeAmount, setTradeAmount] = useState(100000000); // 100M ISK default

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('evetrade_tax_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving tax settings:', error);
    }
  }, [settings]);

  // Calculate effective rates
  const calculations = useMemo(() => {
    const { brokerRelations, accounting, factionStanding, corporationStanding } = settings;

    // Base rates
    const baseBrokerFee = 0.03; // 3%
    const baseSalesTax = 0.05; // 5%

    // Broker Relations skill reduces broker fee by 0.3% per level (from 3% to 1.5% at level 5)
    const skillReduction = brokerRelations * 0.003;

    // Standings reduce broker fee (max 0.3% reduction for 10.0 standings)
    // Formula: reduction = (faction_standing * 0.03) + (corp_standing * 0.02)
    const standingsReduction = (Math.max(0, factionStanding) * 0.003) + (Math.max(0, corporationStanding) * 0.002);

    // Effective broker fee (minimum 1.0%)
    const effectiveBrokerFee = Math.max(0.01, baseBrokerFee - skillReduction - standingsReduction);

    // Accounting skill reduces sales tax by 10% per level (from 5% to 2.5% at level 5)
    const effectiveSalesTax = baseSalesTax * Math.pow(0.90, accounting);

    // Total transaction cost (broker fee on buy, broker fee + sales tax on sell)
    const totalTaxRate = effectiveBrokerFee + effectiveBrokerFee + effectiveSalesTax;

    // Calculate fees on example trade
    const buyBrokerFee = tradeAmount * effectiveBrokerFee;
    const sellBrokerFee = tradeAmount * effectiveBrokerFee;
    const sellSalesTax = tradeAmount * effectiveSalesTax;
    const totalFees = buyBrokerFee + sellBrokerFee + sellSalesTax;
    const netAfterFees = tradeAmount - totalFees;

    return {
      baseBrokerFee,
      baseSalesTax,
      effectiveBrokerFee,
      effectiveSalesTax,
      totalTaxRate,
      buyBrokerFee,
      sellBrokerFee,
      sellSalesTax,
      totalFees,
      netAfterFees,
      skillSavings: (baseBrokerFee * 2 + baseSalesTax - totalTaxRate) * tradeAmount,
    };
  }, [settings, tradeAmount]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <GlassmorphicCard className="max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-cyan/20">
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
              <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Tax Calculator
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Calculate effective broker fees and sales tax based on your skills and standings
            </p>
          </div>
        </div>

        {/* Skills and Standings Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-accent-cyan flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Skills
            </h3>

            {/* Broker Relations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-text-secondary">Broker Relations</label>
                <span className="text-sm font-mono text-accent-cyan">{settings.brokerRelations}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={settings.brokerRelations}
                onChange={(e) => updateSetting('brokerRelations', parseInt(e.target.value))}
                className="w-full h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                Reduces broker fees by 0.3% per level
              </div>
            </div>

            {/* Accounting */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-text-secondary">Accounting</label>
                <span className="text-sm font-mono text-accent-cyan">{settings.accounting}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={settings.accounting}
                onChange={(e) => updateSetting('accounting', parseInt(e.target.value))}
                className="w-full h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                Reduces sales tax by 10% per level
              </div>
            </div>
          </div>

          {/* Standings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-accent-cyan flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Standings
            </h3>

            {/* Faction Standing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-text-secondary">Faction Standing</label>
                <span className="text-sm font-mono text-accent-cyan">{settings.factionStanding.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={settings.factionStanding}
                onChange={(e) => updateSetting('factionStanding', parseFloat(e.target.value))}
                className="w-full h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>-10</span>
                <span>0</span>
                <span>+10</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                Each 1.0 standing reduces fees by 0.3%
              </div>
            </div>

            {/* Corporation Standing */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-text-secondary">Corporation Standing</label>
                <span className="text-sm font-mono text-accent-cyan">{settings.corporationStanding.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={settings.corporationStanding}
                onChange={(e) => updateSetting('corporationStanding', parseFloat(e.target.value))}
                className="w-full h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>-10</span>
                <span>0</span>
                <span>+10</span>
              </div>
              <div className="mt-2 text-xs text-text-secondary">
                Each 1.0 standing reduces fees by 0.2%
              </div>
            </div>
          </div>
        </div>

        {/* Effective Rates Display */}
        <div className="pt-6 border-t border-accent-cyan/20">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Your Effective Tax Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Broker Fee */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent-cyan/10 to-accent-cyan/5 border border-accent-cyan/30">
              <div className="text-xs text-text-secondary mb-1">Broker Fee (each side)</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-accent-cyan">
                  {formatPercent(calculations.effectiveBrokerFee, 2)}
                </div>
                <div className="text-xs text-text-secondary line-through">
                  {formatPercent(calculations.baseBrokerFee, 2)}
                </div>
              </div>
              <div className="text-xs text-green-400 mt-1">
                -{formatPercent(calculations.baseBrokerFee - calculations.effectiveBrokerFee, 2)} saved
              </div>
            </div>

            {/* Sales Tax */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 border border-accent-gold/30">
              <div className="text-xs text-text-secondary mb-1">Sales Tax</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-accent-gold">
                  {formatPercent(calculations.effectiveSalesTax, 2)}
                </div>
                <div className="text-xs text-text-secondary line-through">
                  {formatPercent(calculations.baseSalesTax, 2)}
                </div>
              </div>
              <div className="text-xs text-green-400 mt-1">
                -{formatPercent(calculations.baseSalesTax - calculations.effectiveSalesTax, 2)} saved
              </div>
            </div>

            {/* Total Transaction Cost */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent-purple/10 to-accent-purple/5 border border-accent-purple/30">
              <div className="text-xs text-text-secondary mb-1">Total Transaction Cost</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-accent-purple">
                  {formatPercent(calculations.totalTaxRate, 2)}
                </div>
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Buy + Sell combined
              </div>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="pt-6 border-t border-accent-cyan/20">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Fee Breakdown Example</h3>

          {/* Trade Amount Input */}
          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-2">Trade Amount</label>
            <input
              type="number"
              min="0"
              step="1000000"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan font-mono"
              placeholder="100000000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-space-dark/30 border border-red-400/30">
              <div className="text-xs text-text-secondary mb-1">Buy Broker Fee</div>
              <div className="text-lg font-mono font-bold text-red-400">
                {formatISK(calculations.buyBrokerFee)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-dark/30 border border-red-400/30">
              <div className="text-xs text-text-secondary mb-1">Sell Broker Fee</div>
              <div className="text-lg font-mono font-bold text-red-400">
                {formatISK(calculations.sellBrokerFee)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-dark/30 border border-red-400/30">
              <div className="text-xs text-text-secondary mb-1">Sales Tax</div>
              <div className="text-lg font-mono font-bold text-red-400">
                {formatISK(calculations.sellSalesTax)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-dark/30 border border-accent-cyan/30">
              <div className="text-xs text-text-secondary mb-1">Total Fees</div>
              <div className="text-lg font-mono font-bold text-accent-cyan">
                {formatISK(calculations.totalFees)}
              </div>
            </div>
          </div>

          {/* Savings Display */}
          {calculations.skillSavings > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-green-400/10 border border-green-400/30">
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold">
                  You save {formatISK(calculations.skillSavings)} on this trade with your skills and standings!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
          <svg className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-text-secondary">
            <p className="mb-2">
              <strong className="text-text-primary">How fees work:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Broker fees are charged when placing buy AND sell orders (both sides)</li>
              <li>Sales tax is only charged when items are sold</li>
              <li>Minimum broker fee is 1.0% (achievable with perfect skills and standings)</li>
              <li>Your settings are saved automatically in your browser</li>
            </ul>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default TaxCalculator;
