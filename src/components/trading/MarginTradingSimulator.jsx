import { useState, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatISK, formatPercent } from '../../utils/formatters';
import { preciseRound } from '../../utils/profitCalculations';

/**
 * MarginTradingSimulator Component
 * @description Simulates margin trading execution with competition and undercut modeling
 * Helps traders understand potential outcomes of station trading strategies
 *
 * @component
 * @example
 * <MarginTradingSimulator
 *   buyPrice={1000000}
 *   sellPrice={1100000}
 *   dailyVolume={50}
 *   competition={{ buyers: 5, sellers: 8 }}
 * />
 */
export function MarginTradingSimulator({
  buyPrice: initialBuyPrice = 1000000,
  sellPrice: initialSellPrice = 1100000,
  dailyVolume: initialVolume = 50,
  competition: initialCompetition = { buyers: 5, sellers: 5 },
  className = '',
}) {
  // State for simulation inputs
  const [buyPrice, setBuyPrice] = useState(initialBuyPrice);
  const [sellPrice, setSellPrice] = useState(initialSellPrice);
  const [dailyVolume, setDailyVolume] = useState(initialVolume);
  const [orderQuantity, setOrderQuantity] = useState(10);
  const [undercutInterval, setUndercutInterval] = useState(30); // minutes
  const [competitorCount, setCompetitorCount] = useState(
    initialCompetition.buyers + initialCompetition.sellers
  );
  const [isRunning, setIsRunning] = useState(false);

  // Load tax settings from localStorage
  const taxRates = useMemo(() => {
    try {
      const saved = localStorage.getItem('evetrade_tax_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        const { brokerRelations = 5, accounting = 5, factionStanding = 0, corporationStanding = 0 } = settings;
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
    return { brokerFee: 0.015, salesTax: 0.025 };
  }, []);

  // Run simulation
  const simulation = useMemo(() => {
    const { brokerFee, salesTax } = taxRates;

    // Initial margin
    const initialMargin = preciseRound(((sellPrice - buyPrice) / buyPrice) * 100, 2);

    // Calculate how fast margins erode with competition
    // Each undercut cycle typically reduces margin by 0.01-0.1% of the price
    const undercutAmount = buyPrice * 0.001; // 0.1% undercut each cycle
    const cyclesPerDay = (24 * 60) / undercutInterval;
    const activeCompetitors = Math.max(1, Math.floor(competitorCount * 0.3)); // ~30% are active

    // Simulate 7 days of trading
    const days = 7;
    const results = [];
    let currentBuyPrice = buyPrice;
    let currentSellPrice = sellPrice;
    let totalProfit = 0;
    let totalVolume = 0;
    let totalBrokerFees = 0;
    let totalSalesTax = 0;
    let orderUpdates = 0;

    for (let day = 1; day <= days; day++) {
      // Market share based on competition
      // With more competitors, you get a smaller share of volume
      const marketShare = 1 / (activeCompetitors + 1);
      const dayVolume = Math.floor(dailyVolume * marketShare);
      const actualVolume = Math.min(dayVolume, orderQuantity);

      // Current spread
      const currentSpread = currentSellPrice - currentBuyPrice;
      const currentMargin = preciseRound((currentSpread / currentBuyPrice) * 100, 2);

      // Calculate profit for the day
      const buyBrokerFee = currentBuyPrice * actualVolume * brokerFee;
      const sellBrokerFee = currentSellPrice * actualVolume * brokerFee;
      const daySalesTax = currentSellPrice * actualVolume * salesTax;
      const dayProfit = (currentSpread * actualVolume) - buyBrokerFee - sellBrokerFee - daySalesTax;

      // Track order updates needed to stay competitive
      const dayUpdates = Math.floor(cyclesPerDay * 0.5); // Assume you update ~50% of cycles
      const updateCost = dayUpdates * (currentBuyPrice + currentSellPrice) * brokerFee * 0.01; // ~1% of broker fee per update

      totalProfit += dayProfit - updateCost;
      totalVolume += actualVolume;
      totalBrokerFees += buyBrokerFee + sellBrokerFee;
      totalSalesTax += daySalesTax;
      orderUpdates += dayUpdates;

      results.push({
        day,
        buyPrice: preciseRound(currentBuyPrice, 2),
        sellPrice: preciseRound(currentSellPrice, 2),
        margin: currentMargin,
        volume: actualVolume,
        profit: preciseRound(dayProfit - updateCost, 2),
        cumulativeProfit: preciseRound(totalProfit, 2),
        updates: dayUpdates,
      });

      // Simulate margin erosion for next day
      // Spread tightens as competitors undercut
      const erosion = undercutAmount * activeCompetitors * 0.3;
      currentBuyPrice = Math.min(currentBuyPrice + erosion, currentSellPrice - (buyPrice * 0.01));
      currentSellPrice = Math.max(currentSellPrice - erosion, currentBuyPrice + (buyPrice * 0.01));
    }

    // Calculate summary metrics
    const finalMargin = preciseRound(((currentSellPrice - currentBuyPrice) / currentBuyPrice) * 100, 2);
    const marginErosion = initialMargin - finalMargin;
    const averageProfit = totalProfit / days;
    const roi = totalProfit > 0 ? preciseRound((totalProfit / (buyPrice * orderQuantity)) * 100, 2) : 0;

    // Probability of success based on margin and competition
    let successProbability = 90;
    if (initialMargin < 5) successProbability -= 20;
    if (initialMargin < 3) successProbability -= 30;
    if (competitorCount > 10) successProbability -= 15;
    if (competitorCount > 20) successProbability -= 25;
    if (dailyVolume < 10) successProbability -= 20;
    successProbability = Math.max(10, Math.min(95, successProbability));

    return {
      days: results,
      summary: {
        initialMargin,
        finalMargin,
        marginErosion: preciseRound(marginErosion, 2),
        totalProfit: preciseRound(totalProfit, 2),
        averageProfit: preciseRound(averageProfit, 2),
        totalVolume,
        roi,
        totalBrokerFees: preciseRound(totalBrokerFees, 2),
        totalSalesTax: preciseRound(totalSalesTax, 2),
        orderUpdates,
        successProbability,
        breakEvenDays: totalProfit > 0 ? 1 : null,
      },
      taxRates,
    };
  }, [buyPrice, sellPrice, dailyVolume, orderQuantity, undercutInterval, competitorCount, taxRates]);

  // Get color based on value
  const getMarginColor = (margin) => {
    if (margin >= 10) return 'text-green-400';
    if (margin >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'text-green-400';
    if (prob >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-cyan/20">
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
              <svg className="w-7 h-7 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Margin Trading Simulator
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Simulate your station trading strategy over time
            </p>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buy Price */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Buy Order Price
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              placeholder="1000000"
            />
          </div>

          {/* Sell Price */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Sell Order Price
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              placeholder="1100000"
            />
          </div>

          {/* Daily Volume */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Daily Market Volume
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={dailyVolume}
              onChange={(e) => setDailyVolume(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              placeholder="50"
            />
          </div>

          {/* Order Quantity */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Your Order Quantity
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              placeholder="10"
            />
          </div>

          {/* Undercut Interval */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Undercut Cycle (minutes)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={undercutInterval}
              onChange={(e) => setUndercutInterval(parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              placeholder="30"
            />
          </div>

          {/* Competitor Count */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Total Competitors
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={competitorCount}
              onChange={(e) => setCompetitorCount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono text-sm"
              placeholder="10"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Initial Margin */}
          <div className="p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/20">
            <div className="text-xs text-text-secondary mb-1">Initial Margin</div>
            <div className={`text-xl font-mono font-bold ${getMarginColor(simulation.summary.initialMargin)}`}>
              {formatPercent(simulation.summary.initialMargin / 100, 1)}
            </div>
          </div>

          {/* Final Margin */}
          <div className="p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/20">
            <div className="text-xs text-text-secondary mb-1">Final Margin (Day 7)</div>
            <div className={`text-xl font-mono font-bold ${getMarginColor(simulation.summary.finalMargin)}`}>
              {formatPercent(simulation.summary.finalMargin / 100, 1)}
            </div>
          </div>

          {/* Total Profit */}
          <div className="p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/20">
            <div className="text-xs text-text-secondary mb-1">7-Day Net Profit</div>
            <div className={`text-xl font-mono font-bold ${simulation.summary.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {simulation.summary.totalProfit >= 0 ? '+' : ''}{formatISK(simulation.summary.totalProfit)}
            </div>
          </div>

          {/* Success Probability */}
          <div className="p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/20">
            <div className="text-xs text-text-secondary mb-1">Success Probability</div>
            <div className={`text-xl font-mono font-bold ${getProbabilityColor(simulation.summary.successProbability)}`}>
              {simulation.summary.successProbability}%
            </div>
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-cyan/20">
                <th className="text-left py-2 px-3 text-text-secondary font-medium">Day</th>
                <th className="text-right py-2 px-3 text-text-secondary font-medium">Buy Price</th>
                <th className="text-right py-2 px-3 text-text-secondary font-medium">Sell Price</th>
                <th className="text-right py-2 px-3 text-text-secondary font-medium">Margin</th>
                <th className="text-right py-2 px-3 text-text-secondary font-medium">Volume</th>
                <th className="text-right py-2 px-3 text-text-secondary font-medium">Profit</th>
                <th className="text-right py-2 px-3 text-text-secondary font-medium">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {simulation.days.map((day) => (
                <tr key={day.day} className="border-b border-accent-cyan/10 hover:bg-accent-cyan/5">
                  <td className="py-2 px-3 font-medium text-text-primary">Day {day.day}</td>
                  <td className="py-2 px-3 text-right font-mono text-accent-cyan">{formatISK(day.buyPrice)}</td>
                  <td className="py-2 px-3 text-right font-mono text-accent-gold">{formatISK(day.sellPrice)}</td>
                  <td className={`py-2 px-3 text-right font-mono ${getMarginColor(day.margin)}`}>
                    {formatPercent(day.margin / 100, 1)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-text-secondary">{day.volume}</td>
                  <td className={`py-2 px-3 text-right font-mono ${day.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {day.profit >= 0 ? '+' : ''}{formatISK(day.profit)}
                  </td>
                  <td className={`py-2 px-3 text-right font-mono ${day.cumulativeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {day.cumulativeProfit >= 0 ? '+' : ''}{formatISK(day.cumulativeProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/20">
          <div>
            <div className="text-xs text-text-secondary mb-1">Total Broker Fees</div>
            <div className="text-lg font-mono text-red-400">-{formatISK(simulation.summary.totalBrokerFees)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Total Sales Tax</div>
            <div className="text-lg font-mono text-red-400">-{formatISK(simulation.summary.totalSalesTax)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Order Updates</div>
            <div className="text-lg font-mono text-text-primary">{simulation.summary.orderUpdates}x</div>
          </div>
        </div>

        {/* Analysis */}
        <div className="p-4 rounded-lg bg-accent-purple/10 border border-accent-purple/20">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Simulation Analysis
          </h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              <span className="text-text-primary font-medium">Margin Erosion:</span> Your spread is expected to shrink by{' '}
              <span className={getMarginColor(10 - simulation.summary.marginErosion)}>
                {formatPercent(simulation.summary.marginErosion / 100, 1)}
              </span>{' '}
              over 7 days due to competition.
            </p>
            <p>
              <span className="text-text-primary font-medium">Market Share:</span> With {competitorCount} competitors, you can expect{' '}
              <span className="text-accent-cyan">{formatPercent(1 / (Math.max(1, Math.floor(competitorCount * 0.3)) + 1), 1)}</span>{' '}
              of daily volume.
            </p>
            <p>
              <span className="text-text-primary font-medium">ROI:</span> Expected return on investment is{' '}
              <span className={simulation.summary.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatPercent(simulation.summary.roi / 100, 1)}
              </span>{' '}
              over 7 days.
            </p>
            {simulation.summary.initialMargin < 5 && (
              <p className="text-yellow-400">
                ⚠ Low margin warning: Margins below 5% are risky and may not cover order update costs.
              </p>
            )}
            {competitorCount > 15 && (
              <p className="text-yellow-400">
                ⚠ High competition: Consider items with fewer competitors for better results.
              </p>
            )}
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default MarginTradingSimulator;
