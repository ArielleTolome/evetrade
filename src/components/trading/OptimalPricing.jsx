import { useState, useMemo, useCallback } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * OptimalPricing Component
 * @description Analyzes current market orders and suggests optimal buy/sell prices
 * Helps traders decide between margin optimization vs. speed of execution
 *
 * @component
 * @example
 * <OptimalPricing />
 */
export function OptimalPricing() {
  // Market data inputs
  const [marketData, setMarketData] = useState({
    highestBuyOrder: 1000000,
    lowestSellOrder: 1100000,
    buyOrderVolume: 5000,
    sellOrderVolume: 3000,
    dailyVolume: 10000,
    secondHighestBuy: 995000,
    secondLowestSell: 1105000,
  });

  const [strategy, setStrategy] = useState('balanced'); // aggressive, balanced, patient

  // Calculate optimal prices and metrics
  const analysis = useMemo(() => {
    const {
      highestBuyOrder,
      lowestSellOrder,
      buyOrderVolume,
      sellOrderVolume,
      dailyVolume,
      secondHighestBuy,
      secondLowestSell,
    } = marketData;

    if (highestBuyOrder <= 0 || lowestSellOrder <= 0) {
      return null;
    }

    // Market spread analysis
    const spread = lowestSellOrder - highestBuyOrder;
    const spreadPercent = (spread / highestBuyOrder);
    const midPoint = (highestBuyOrder + lowestSellOrder) / 2;

    // Volume analysis
    const volumeRatio = buyOrderVolume / (sellOrderVolume || 1);
    const dailyTurnover = dailyVolume > 0 ? buyOrderVolume / dailyVolume : 0;

    // Competitive pressure
    const buyCompetition = secondHighestBuy > 0 ? (highestBuyOrder - secondHighestBuy) / highestBuyOrder : 0.001;
    const sellCompetition = secondLowestSell > 0 ? (secondLowestSell - lowestSellOrder) / lowestSellOrder : 0.001;

    // Strategy-based pricing
    let suggestedBuyPrice, suggestedSellPrice, expectedFillTime;

    if (strategy === 'aggressive') {
      // Undercut aggressively for fast execution
      suggestedBuyPrice = highestBuyOrder + 0.01;
      suggestedSellPrice = lowestSellOrder - 0.01;
      expectedFillTime = dailyTurnover > 0 ? (buyOrderVolume / dailyVolume) * 24 : 1;
    } else if (strategy === 'patient') {
      // Set prices for better margin, slower execution
      suggestedBuyPrice = secondHighestBuy > 0 ? secondHighestBuy + 0.01 : highestBuyOrder - (spread * 0.1);
      suggestedSellPrice = secondLowestSell > 0 ? secondLowestSell - 0.01 : lowestSellOrder + (spread * 0.1);
      expectedFillTime = dailyTurnover > 0 ? (buyOrderVolume / dailyVolume) * 48 : 12;
    } else {
      // Balanced: slight undercut with good margin
      const _buyOffset = spread * 0.05;
      const _sellOffset = spread * 0.05;
      suggestedBuyPrice = highestBuyOrder + 0.01;
      suggestedSellPrice = lowestSellOrder - 0.01;
      expectedFillTime = dailyTurnover > 0 ? (buyOrderVolume / dailyVolume) * 12 : 4;
    }

    // Ensure prices make sense
    suggestedBuyPrice = Math.min(suggestedBuyPrice, lowestSellOrder - 0.02);
    suggestedSellPrice = Math.max(suggestedSellPrice, highestBuyOrder + 0.02);

    // Profit calculation at suggested prices
    const grossProfit = suggestedSellPrice - suggestedBuyPrice;
    const profitMargin = grossProfit / suggestedBuyPrice;

    // Market health indicators
    const isHealthy = spreadPercent > 0.03 && dailyVolume > 100;
    const competitionLevel = buyCompetition > 0.01 || sellCompetition > 0.01 ? 'High' : 'Low';

    return {
      spread,
      spreadPercent,
      midPoint,
      volumeRatio,
      dailyTurnover,
      buyCompetition,
      sellCompetition,
      suggestedBuyPrice,
      suggestedSellPrice,
      expectedFillTime,
      grossProfit,
      profitMargin,
      isHealthy,
      competitionLevel,
    };
  }, [marketData, strategy]);

  // Update market data field
  const updateField = useCallback((field, value) => {
    setMarketData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  }, []);

  if (!analysis) {
    return (
      <GlassmorphicCard className="max-w-4xl">
        <div className="text-center text-text-secondary py-8">
          Enter valid market data to see optimal pricing suggestions
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className="max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-cyan/20">
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
              <svg className="w-7 h-7 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Optimal Pricing Analysis
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Get AI-powered pricing suggestions based on current market conditions
            </p>
          </div>
        </div>

        {/* Strategy Selection */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">Trading Strategy</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setStrategy('aggressive')}
              className={`p-4 rounded-lg border-2 transition-all ${
                strategy === 'aggressive'
                  ? 'border-red-400 bg-red-400/10'
                  : 'border-accent-cyan/20 bg-space-dark/30 hover:border-accent-cyan/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold text-text-primary">Aggressive</span>
              </div>
              <p className="text-xs text-text-secondary">
                Fast execution, minimal margin. Compete at top of book.
              </p>
            </button>

            <button
              onClick={() => setStrategy('balanced')}
              className={`p-4 rounded-lg border-2 transition-all ${
                strategy === 'balanced'
                  ? 'border-accent-cyan bg-accent-cyan/10'
                  : 'border-accent-cyan/20 bg-space-dark/30 hover:border-accent-cyan/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span className="font-semibold text-text-primary">Balanced</span>
              </div>
              <p className="text-xs text-text-secondary">
                Good margin with reasonable execution time.
              </p>
            </button>

            <button
              onClick={() => setStrategy('patient')}
              className={`p-4 rounded-lg border-2 transition-all ${
                strategy === 'patient'
                  ? 'border-accent-gold bg-accent-gold/10'
                  : 'border-accent-cyan/20 bg-space-dark/30 hover:border-accent-cyan/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-text-primary">Patient</span>
              </div>
              <p className="text-xs text-text-secondary">
                Maximum margin, slower execution. Wait for better prices.
              </p>
            </button>
          </div>
        </div>

        {/* Market Data Inputs */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Current Market Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Highest Buy Order</label>
              <input
                type="number"
                step="0.01"
                value={marketData.highestBuyOrder}
                onChange={(e) => updateField('highestBuyOrder', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Lowest Sell Order</label>
              <input
                type="number"
                step="0.01"
                value={marketData.lowestSellOrder}
                onChange={(e) => updateField('lowestSellOrder', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Daily Volume (units)</label>
              <input
                type="number"
                step="1"
                value={marketData.dailyVolume}
                onChange={(e) => updateField('dailyVolume', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Buy Order Volume</label>
              <input
                type="number"
                step="1"
                value={marketData.buyOrderVolume}
                onChange={(e) => updateField('buyOrderVolume', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Sell Order Volume</label>
              <input
                type="number"
                step="1"
                value={marketData.sellOrderVolume}
                onChange={(e) => updateField('sellOrderVolume', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">2nd Highest Buy (optional)</label>
              <input
                type="number"
                step="0.01"
                value={marketData.secondHighestBuy}
                onChange={(e) => updateField('secondHighestBuy', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-accent-cyan/20">
          <div className="p-3 rounded-lg bg-space-dark/30">
            <div className="text-xs text-text-secondary mb-1">Market Spread</div>
            <div className="text-lg font-bold font-mono text-accent-cyan">
              {formatISK(analysis.spread)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {formatPercent(analysis.spreadPercent, 2)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-space-dark/30">
            <div className="text-xs text-text-secondary mb-1">Volume Ratio</div>
            <div className="text-lg font-bold font-mono text-text-primary">
              {analysis.volumeRatio.toFixed(2)}x
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {analysis.volumeRatio > 1 ? 'Buy pressure' : 'Sell pressure'}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-space-dark/30">
            <div className="text-xs text-text-secondary mb-1">Competition</div>
            <div className={`text-lg font-bold ${analysis.competitionLevel === 'High' ? 'text-red-400' : 'text-green-400'}`}>
              {analysis.competitionLevel}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Order book depth
            </div>
          </div>
          <div className="p-3 rounded-lg bg-space-dark/30">
            <div className="text-xs text-text-secondary mb-1">Market Health</div>
            <div className={`text-lg font-bold ${analysis.isHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {analysis.isHealthy ? 'Healthy' : 'Risky'}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {analysis.isHealthy ? 'Good liquidity' : 'Low volume'}
            </div>
          </div>
        </div>

        {/* Pricing Recommendations */}
        <div className="pt-4 border-t border-accent-cyan/20">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recommended Prices ({strategy.charAt(0).toUpperCase() + strategy.slice(1)} Strategy)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Price Recommendation */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-green-400/10 to-green-400/5 border-2 border-green-400/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h4 className="font-semibold text-text-primary">Suggested Buy Price</h4>
                </div>
              </div>
              <div className="text-3xl font-bold font-mono text-green-400 mb-3">
                {formatISK(analysis.suggestedBuyPrice)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Current Top Buy:</span>
                  <span className="font-mono text-text-primary">{formatISK(marketData.highestBuyOrder)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Your Advantage:</span>
                  <span className="font-mono text-green-400">
                    +{formatISK(analysis.suggestedBuyPrice - marketData.highestBuyOrder)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-400/20">
                  <span className="text-text-secondary">Position:</span>
                  <span className="font-mono text-accent-gold">Top of Book</span>
                </div>
              </div>
            </div>

            {/* Sell Price Recommendation */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-accent-gold/10 to-accent-gold/5 border-2 border-accent-gold/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-text-primary">Suggested Sell Price</h4>
                </div>
              </div>
              <div className="text-3xl font-bold font-mono text-accent-gold mb-3">
                {formatISK(analysis.suggestedSellPrice)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Current Lowest Sell:</span>
                  <span className="font-mono text-text-primary">{formatISK(marketData.lowestSellOrder)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Your Advantage:</span>
                  <span className="font-mono text-green-400">
                    -{formatISK(marketData.lowestSellOrder - analysis.suggestedSellPrice)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-accent-gold/20">
                  <span className="text-text-secondary">Position:</span>
                  <span className="font-mono text-accent-gold">Top of Book</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Projection */}
          <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/30">
            <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Profit Projection
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-space-dark/30">
                <div className="text-xs text-text-secondary mb-1">Gross Profit per Unit</div>
                <div className="text-2xl font-bold font-mono text-accent-gold">
                  {formatISK(analysis.grossProfit)}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-space-dark/30">
                <div className="text-xs text-text-secondary mb-1">Profit Margin</div>
                <div className="text-2xl font-bold font-mono text-accent-cyan">
                  {formatPercent(analysis.profitMargin, 2)}
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-space-dark/30">
                <div className="text-xs text-text-secondary mb-1">Expected Fill Time</div>
                <div className="text-2xl font-bold font-mono text-accent-purple">
                  {analysis.expectedFillTime < 1
                    ? `${(analysis.expectedFillTime * 60).toFixed(0)}m`
                    : `${analysis.expectedFillTime.toFixed(1)}h`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Insights */}
        <div className="pt-4 border-t border-accent-cyan/20">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Trading Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.spreadPercent > 0.05 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="text-xs text-text-secondary">
                  <strong className="text-green-400">Wide spread:</strong> Good opportunity for profit. Consider patient strategy.
                </div>
              </div>
            )}
            {analysis.volumeRatio > 1.5 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                <svg className="w-4 h-4 text-accent-cyan mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div className="text-xs text-text-secondary">
                  <strong className="text-accent-cyan">Strong buy pressure:</strong> Prices may rise. Consider selling soon.
                </div>
              </div>
            )}
            {analysis.volumeRatio < 0.7 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-400/10 border border-red-400/20">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <div className="text-xs text-text-secondary">
                  <strong className="text-red-400">Strong sell pressure:</strong> Prices may fall. Be cautious.
                </div>
              </div>
            )}
            {analysis.competitionLevel === 'High' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-gold/10 border border-accent-gold/20">
                <svg className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-xs text-text-secondary">
                  <strong className="text-accent-gold">High competition:</strong> Expect frequent order updates. Use 0.01 ISK tactics.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
          <svg className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-text-secondary">
            <p className="mb-2">
              <strong className="text-text-primary">Pro Tips:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>The 0.01 ISK game is real in high-competition markets. Update orders frequently.</li>
              <li>Consider transaction costs in your final pricing (use Tax Calculator)</li>
              <li>Monitor market depth - thin order books can change rapidly</li>
              <li>Set price alerts to know when to update your orders</li>
            </ul>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default OptimalPricing;
