import { useState, useEffect, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { ItemAutocomplete } from '../forms/ItemAutocomplete';
import { FormInput } from '../forms/FormInput';
import { useProfit } from '../../hooks/useProfit';
import { formatISK, formatPercent, formatNumber } from '../../utils/formatters';

/**
 * ComprehensiveProfitCalculator Component
 * Full-featured profit calculator with all EVE Online taxes and fees
 */
export function ComprehensiveProfitCalculator() {
  // Load saved settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('evetrade_profit_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading profit settings:', error);
    }
    return {
      salesTaxRate: 0.05,
      brokerFeeRate: 0.03,
      accountingLevel: 5,
      brokerRelationsLevel: 5,
      factionStanding: 0,
      corporationStanding: 0,
      isPlayerStructure: false,
    };
  };

  const [settings, setSettings] = useState(loadSettings);
  const [itemName, setItemName] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const { calculate, formatForCopy, history, saveToHistory, removeFromHistory, clearHistory, getBreakEven } = useProfit();

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('evetrade_profit_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving profit settings:', error);
    }
  }, [settings]);

  // Calculate results in real-time
  const results = useMemo(() => {
    const params = {
      buyPrice: parseFloat(buyPrice) || 0,
      sellPrice: parseFloat(sellPrice) || 0,
      quantity: parseInt(quantity) || 1,
      ...settings,
    };

    const calc = calculate(params);
    const breakEven = getBreakEven(params);

    return {
      ...calc,
      breakEven,
    };
  }, [buyPrice, sellPrice, quantity, settings, calculate, getBreakEven]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemSelect = (item) => {
    setItemName(item.name);
  };

  const handleCopyResults = async () => {
    const text = formatForCopy(itemName || 'Unknown Item', {
      buyPrice: parseFloat(buyPrice) || 0,
      sellPrice: parseFloat(sellPrice) || 0,
      quantity: parseInt(quantity) || 1,
    }, results);

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId('current');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSaveToHistory = () => {
    if (!buyPrice || !sellPrice) return;

    saveToHistory({
      itemName: itemName || 'Unknown Item',
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      quantity: parseInt(quantity),
      settings: { ...settings },
      results: { ...results },
    });
  };

  const handleLoadFromHistory = (item) => {
    setItemName(item.itemName);
    setBuyPrice(item.buyPrice.toString());
    setSellPrice(item.sellPrice.toString());
    setQuantity(item.quantity.toString());
    setSettings(item.settings);
    setShowHistory(false);
  };

  const handleCopyFromHistory = async (item) => {
    const text = formatForCopy(item.itemName, {
      buyPrice: item.buyPrice,
      sellPrice: item.sellPrice,
      quantity: item.quantity,
    }, item.results);

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const isValid = buyPrice && sellPrice && quantity;

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-accent-cyan/20">
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
                <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Comprehensive Profit Calculator
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Calculate net profit with all EVE Online taxes and fees
              </p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History {history.length > 0 && `(${history.length})`}
            </button>
          </div>

          {/* Main Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Item & Prices */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-accent-cyan flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Trade Details
              </h3>

              <ItemAutocomplete
                label="Item Name"
                value={itemName}
                onChange={handleItemSelect}
                placeholder="Search for an item..."
              />

              <FormInput
                label="Buy Price (per unit)"
                type="number"
                value={buyPrice}
                onChange={setBuyPrice}
                placeholder="1000000"
                min="0"
                step="0.01"
                suffix="ISK"
              />

              <FormInput
                label="Sell Price (per unit)"
                type="number"
                value={sellPrice}
                onChange={setSellPrice}
                placeholder="1200000"
                min="0"
                step="0.01"
                suffix="ISK"
              />

              <FormInput
                label="Quantity"
                type="number"
                value={quantity}
                onChange={setQuantity}
                placeholder="100"
                min="1"
                step="1"
              />
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-accent-cyan flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Tax & Fee Settings
              </h3>

              {/* Station Type Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-space-dark/30 border border-accent-cyan/20">
                <div>
                  <label className="text-sm text-text-primary font-medium">Station Type</label>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Player structures have lower fees
                  </p>
                </div>
                <button
                  onClick={() => updateSetting('isPlayerStructure', !settings.isPlayerStructure)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.isPlayerStructure ? 'bg-accent-cyan' : 'bg-space-dark'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.isPlayerStructure ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Skills */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-text-secondary">Accounting</label>
                    <span className="text-sm font-mono text-accent-cyan">{settings.accountingLevel}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={settings.accountingLevel}
                    onChange={(e) => updateSetting('accountingLevel', parseInt(e.target.value))}
                    className="w-full h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-text-secondary">Broker Relations</label>
                    <span className="text-sm font-mono text-accent-cyan">{settings.brokerRelationsLevel}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={settings.brokerRelationsLevel}
                    onChange={(e) => updateSetting('brokerRelationsLevel', parseInt(e.target.value))}
                    className="w-full h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                  />
                </div>
              </div>

              {/* Standings (Collapsed by default) */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced: NPC Standings
                </summary>
                <div className="mt-3 space-y-3 pl-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-text-secondary">Faction Standing</label>
                      <span className="text-xs font-mono text-accent-cyan">{settings.factionStanding.toFixed(1)}</span>
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-text-secondary">Corporation Standing</label>
                      <span className="text-xs font-mono text-accent-cyan">{settings.corporationStanding.toFixed(1)}</span>
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
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Results Section */}
          {isValid && (
            <>
              <div className="pt-6 border-t border-accent-cyan/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Calculation Results</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveToHistory}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple text-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save
                    </button>
                    <button
                      onClick={handleCopyResults}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        copiedId === 'current'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan'
                      }`}
                    >
                      {copiedId === 'current' ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Results Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
                    <div className="text-xs text-text-secondary mb-1">Gross Profit</div>
                    <div className={`text-xl font-bold font-mono ${results.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatISK(results.grossProfit)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30">
                    <div className="text-xs text-text-secondary mb-1">Total Fees</div>
                    <div className="text-xl font-bold font-mono text-red-400">
                      {formatISK(results.totalFees)}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg bg-gradient-to-br border ${
                    results.netProfit >= 0
                      ? 'from-accent-cyan/10 to-accent-cyan/5 border-accent-cyan/30'
                      : 'from-red-500/10 to-red-500/5 border-red-500/30'
                  }`}>
                    <div className="text-xs text-text-secondary mb-1">Net Profit</div>
                    <div className={`text-xl font-bold font-mono ${results.netProfit >= 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
                      {formatISK(results.netProfit)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-accent-purple/10 to-accent-purple/5 border border-accent-purple/30">
                    <div className="text-xs text-text-secondary mb-1">ROI</div>
                    <div className={`text-xl font-bold font-mono ${results.roi >= 0 ? 'text-accent-purple' : 'text-red-400'}`}>
                      {formatPercent(results.roi / 100, 2)}
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-space-dark/30 border border-red-400/20">
                    <div className="text-xs text-text-secondary mb-1">Buy Broker Fee</div>
                    <div className="text-base font-mono text-red-400">
                      {formatISK(results.buyBrokerFee)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {formatPercent(results.effectiveBrokerFeeRate, 2)}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-space-dark/30 border border-red-400/20">
                    <div className="text-xs text-text-secondary mb-1">Sell Broker Fee</div>
                    <div className="text-base font-mono text-red-400">
                      {formatISK(results.sellBrokerFee)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {formatPercent(results.effectiveBrokerFeeRate, 2)}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-space-dark/30 border border-red-400/20">
                    <div className="text-xs text-text-secondary mb-1">Sales Tax</div>
                    <div className="text-base font-mono text-red-400">
                      {formatISK(results.salesTax)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {formatPercent(results.effectiveSalesTaxRate, 2)}
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-space-dark/30 border border-accent-gold/20">
                    <div className="text-xs text-text-secondary mb-1">Profit Per Unit</div>
                    <div className={`text-lg font-mono font-bold ${results.profitPerUnit >= 0 ? 'text-accent-gold' : 'text-red-400'}`}>
                      {formatISK(results.profitPerUnit)}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-space-dark/30 border border-accent-gold/20">
                    <div className="text-xs text-text-secondary mb-1">Break-Even Price</div>
                    <div className="text-lg font-mono font-bold text-accent-gold">
                      {formatISK(results.breakEven, false)} ISK/unit
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
            <svg className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-text-secondary">
              <p className="mb-2">
                <strong className="text-text-primary">How it works:</strong>
              </p>
              <ul className="space-y-1 text-xs">
                <li>Broker fees charged on both buy and sell orders</li>
                <li>Sales tax only charged when selling</li>
                <li>Player structures typically have 50% lower fees than NPC stations</li>
                <li>ROI calculated as: Net Profit / (Buy Cost + Buy Broker Fee)</li>
                <li>Break-even price is the minimum sell price to not lose money</li>
              </ul>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* History Panel */}
      {showHistory && (
        <GlassmorphicCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-accent-cyan/20">
              <h3 className="text-lg font-semibold text-text-primary">Calculation History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No saved calculations yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/20 hover:border-accent-cyan/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-text-primary">{item.itemName}</h4>
                        <p className="text-xs text-text-secondary">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadFromHistory(item)}
                          className="p-2 rounded-lg bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan transition-colors"
                          title="Load calculation"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCopyFromHistory(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            copiedId === item.id
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple'
                          }`}
                          title="Copy results"
                        >
                          {copiedId === item.id ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => removeFromHistory(item.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-text-secondary">Buy:</span>{' '}
                        <span className="text-text-primary font-mono">{formatISK(item.buyPrice, false)}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Sell:</span>{' '}
                        <span className="text-text-primary font-mono">{formatISK(item.sellPrice, false)}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Qty:</span>{' '}
                        <span className="text-text-primary font-mono">{formatNumber(item.quantity, 0)}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-accent-cyan/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Net Profit:</span>
                        <span className={`font-mono font-bold ${item.results.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatISK(item.results.netProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
}

export default ComprehensiveProfitCalculator;
