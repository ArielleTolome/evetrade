import { useState, useEffect } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';
import { Button } from './Button';
import { formatISK, formatPercent } from '../../utils/formatters';
import { getMarketOrders, analyzeMarketOrders } from '../../api/esi';

/**
 * SmartPriceCalculator Component
 * Calculates optimal buy/sell prices with broker fees, sales tax, and target margin
 */
export function SmartPriceCalculator({
  typeId,
  typeName,
  regionId = 10000002, // Default to The Forge (Jita)
  stationId,
  onClose
}) {
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [settings, setSettings] = useState({
    brokerFee: 0.03, // 3%
    salesTax: 0.036, // 3.6% (Accounting V)
    targetMargin: 0.10, // 10%
  });
  const [calculation, setCalculation] = useState(null);
  const [mode, setMode] = useState('sell'); // 'sell' or 'buy'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeId && regionId) {
      loadMarketData();
    }
  }, [typeId, regionId, stationId]);

  useEffect(() => {
    if (marketData) {
      calculateOptimalPrice();
    }
  }, [marketData, settings, mode]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const orders = await getMarketOrders(regionId, typeId, 'all');
      const analysis = analyzeMarketOrders(orders, stationId);
      setMarketData(analysis);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOptimalPrice = () => {
    if (!marketData) return;

    if (mode === 'sell') {
      // For selling: undercut lowest sell by 0.01 ISK
      const currentBestSell = marketData.bestSellPrice;
      const suggestedPrice = Math.max(0.01, currentBestSell - 0.01);

      // Calculate expected profit per unit if buying at best buy price
      const bestBuy = marketData.bestBuyPrice;
      const buyWithFees = bestBuy * (1 + settings.brokerFee);
      const sellWithFees = suggestedPrice * (1 - settings.salesTax - settings.brokerFee);
      const profitPerUnit = sellWithFees - buyWithFees;
      const marginPercent = buyWithFees > 0 ? (profitPerUnit / buyWithFees) : 0;

      // Estimate time to sell based on competition
      let timeToSell = 'Unknown';
      if (marketData.competitionLevel === 'low') timeToSell = '< 1 hour';
      else if (marketData.competitionLevel === 'medium') timeToSell = '1-4 hours';
      else if (marketData.competitionLevel === 'high') timeToSell = '4-12 hours';
      else timeToSell = '> 12 hours';

      setCalculation({
        suggestedPrice,
        currentBestPrice: currentBestSell,
        profitPerUnit,
        marginPercent,
        timeToSell,
        fees: {
          broker: suggestedPrice * settings.brokerFee,
          sales: suggestedPrice * settings.salesTax,
          total: suggestedPrice * (settings.brokerFee + settings.salesTax),
        },
        netReceived: sellWithFees,
        competition: marketData.sellersAtBestPrice,
        volume: marketData.totalSellVolume,
      });
    } else {
      // For buying: outbid highest buy by 0.01 ISK
      const currentBestBuy = marketData.bestBuyPrice;
      const suggestedPrice = currentBestBuy + 0.01;

      // Calculate expected profit per unit if selling at best sell price
      const bestSell = marketData.bestSellPrice;
      const buyWithFees = suggestedPrice * (1 + settings.brokerFee);
      const sellWithFees = bestSell * (1 - settings.salesTax - settings.brokerFee);
      const profitPerUnit = sellWithFees - buyWithFees;
      const marginPercent = buyWithFees > 0 ? (profitPerUnit / buyWithFees) : 0;

      // Estimate time to buy based on competition
      let timeToBuy = 'Unknown';
      if (marketData.competitionLevel === 'low') timeToBuy = '< 1 hour';
      else if (marketData.competitionLevel === 'medium') timeToBuy = '1-4 hours';
      else if (marketData.competitionLevel === 'high') timeToBuy = '4-12 hours';
      else timeToBuy = '> 12 hours';

      setCalculation({
        suggestedPrice,
        currentBestPrice: currentBestBuy,
        profitPerUnit,
        marginPercent,
        timeToBuy,
        fees: {
          broker: suggestedPrice * settings.brokerFee,
          total: suggestedPrice * settings.brokerFee,
        },
        totalCost: buyWithFees,
        competition: marketData.buyersAtBestPrice,
        volume: marketData.totalBuyVolume,
      });
    }
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    loadMarketData();
  };

  if (loading && !marketData) {
    return (
      <GlassmorphicCard className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <p className="text-text-secondary">Loading market data...</p>
        </div>
      </GlassmorphicCard>
    );
  }

  if (!marketData) {
    return (
      <GlassmorphicCard className="text-center py-8">
        <p className="text-text-secondary">Select an item to calculate optimal prices</p>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className="relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display text-text-primary">Smart Price Calculator</h3>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={loading}
            className="min-h-[36px]"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
        {typeName && (
          <p className="text-text-secondary text-sm">Item: <span className="text-accent-cyan">{typeName}</span></p>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all min-h-[48px] ${
            mode === 'sell'
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-white/5 text-text-secondary hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Sell Order
          </div>
        </button>
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all min-h-[48px] ${
            mode === 'buy'
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-white/5 text-text-secondary hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
            </svg>
            Buy Order
          </div>
        </button>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs text-text-secondary mb-2">Broker Fee %</label>
          <input
            type="number"
            value={settings.brokerFee * 100}
            onChange={(e) => setSettings({ ...settings, brokerFee: parseFloat(e.target.value) / 100 })}
            step="0.1"
            className="w-full px-4 py-3 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary min-h-[48px] text-lg"
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-2">Sales Tax %</label>
          <input
            type="number"
            value={settings.salesTax * 100}
            onChange={(e) => setSettings({ ...settings, salesTax: parseFloat(e.target.value) / 100 })}
            step="0.1"
            className="w-full px-4 py-3 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary min-h-[48px] text-lg"
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-2">Target Margin %</label>
          <input
            type="number"
            value={settings.targetMargin * 100}
            onChange={(e) => setSettings({ ...settings, targetMargin: parseFloat(e.target.value) / 100 })}
            step="1"
            className="w-full px-4 py-3 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary min-h-[48px] text-lg"
          />
        </div>
      </div>

      {calculation && (
        <>
          {/* Suggested Price - Large and prominent */}
          <div className="bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/30 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">Suggested Price</p>
              <p className="text-4xl sm:text-5xl font-bold text-accent-cyan mb-4 font-mono">
                {formatISK(calculation.suggestedPrice, false)}
              </p>
              <Button
                onClick={() => copyToClipboard(calculation.suggestedPrice)}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Price
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Profit Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-space-dark/30 rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">Current Best {mode === 'sell' ? 'Sell' : 'Buy'}</p>
              <p className="text-xl font-mono text-text-primary">{formatISK(calculation.currentBestPrice, false)}</p>
            </div>
            <div className="bg-space-dark/30 rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">Profit Per Unit</p>
              <p className={`text-xl font-mono ${calculation.profitPerUnit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatISK(calculation.profitPerUnit, false)}
              </p>
            </div>
            <div className="bg-space-dark/30 rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">Margin</p>
              <p className={`text-xl font-mono ${calculation.marginPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercent(calculation.marginPercent)}
              </p>
            </div>
            <div className="bg-space-dark/30 rounded-lg p-4">
              <p className="text-xs text-text-secondary mb-1">Est. Time</p>
              <p className="text-xl text-text-primary">{mode === 'sell' ? calculation.timeToSell : calculation.timeToBuy}</p>
            </div>
          </div>

          {/* Market Info */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-semibold text-text-secondary mb-3">Market Info</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-text-secondary">Competition</p>
                <p className="text-text-primary font-semibold">{calculation.competition} orders</p>
              </div>
              <div>
                <p className="text-text-secondary">Volume</p>
                <p className="text-text-primary font-semibold">{calculation.volume.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-text-secondary">Fees</p>
                <p className="text-text-primary font-semibold">{formatISK(calculation.fees.total, false)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </GlassmorphicCard>
  );
}

export default SmartPriceCalculator;
