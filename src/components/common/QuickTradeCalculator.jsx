import { useState, useMemo } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';
import { formatISK, formatPercent, formatNumber } from '../../utils/formatters';

/**
 * QuickTradeCalculator Component
 * An expandable/collapsible calculator panel for station trading
 * Shows detailed profit breakdown with adjustable quantity
 */
export function QuickTradeCalculator({
  buyPrice,
  sellPrice,
  initialQuantity = 1,
  brokerFee = 0.03,
  salesTax = 0.0375,
  itemName = 'Item',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(initialQuantity);

  // Calculate all trade costs and profits
  const calculations = useMemo(() => {
    const qty = Math.max(1, quantity || 1);

    // Buy costs
    const totalBuyCost = buyPrice * qty;
    const buyBrokerFee = totalBuyCost * brokerFee;
    const totalBuyWithFees = totalBuyCost + buyBrokerFee;

    // Sell revenue
    const totalSellRevenue = sellPrice * qty;
    const sellSalesTax = totalSellRevenue * salesTax;
    const sellBrokerFee = totalSellRevenue * brokerFee;
    const totalSellFees = sellSalesTax + sellBrokerFee;
    const totalSellAfterFees = totalSellRevenue - totalSellFees;

    // Net profit
    const netProfit = totalSellAfterFees - totalBuyWithFees;
    const profitPerUnit = netProfit / qty;

    // ROI
    const roi = totalBuyWithFees > 0 ? (netProfit / totalBuyWithFees) : 0;

    return {
      qty,
      totalBuyCost,
      buyBrokerFee,
      totalBuyWithFees,
      totalSellRevenue,
      sellSalesTax,
      sellBrokerFee,
      totalSellFees,
      totalSellAfterFees,
      netProfit,
      profitPerUnit,
      roi,
    };
  }, [buyPrice, sellPrice, quantity, brokerFee, salesTax]);

  return (
    <div className="mt-2">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Quick Profit Calculator
      </button>

      {/* Expandable Calculator Panel */}
      {isExpanded && (
        <div className="mt-3 animate-fadeIn">
          <GlassmorphicCard padding="p-4" className="border border-accent-cyan/30">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-accent-cyan/20">
                <h4 className="font-display text-text-primary font-semibold">
                  Trade Calculator
                </h4>
                <span className="text-xs text-text-secondary bg-space-dark/50 px-2 py-1 rounded">
                  {itemName}
                </span>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Quantity to Trade
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
                />
                <div className="mt-1 text-xs text-text-secondary">
                  Adjust quantity to see profit at different volumes
                </div>
              </div>

              {/* Calculations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buy Side */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Buy Costs
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Base Cost:</span>
                      <span className="font-mono text-text-primary">
                        {formatISK(calculations.totalBuyCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Broker Fee ({formatPercent(brokerFee, 2)}):
                      </span>
                      <span className="font-mono text-red-400">
                        {formatISK(calculations.buyBrokerFee)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-accent-cyan/10">
                      <span className="text-text-primary font-medium">Total Cost:</span>
                      <span className="font-mono text-red-400 font-bold">
                        {formatISK(calculations.totalBuyWithFees)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sell Side */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sell Revenue
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Gross Revenue:</span>
                      <span className="font-mono text-text-primary">
                        {formatISK(calculations.totalSellRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Sales Tax ({formatPercent(salesTax, 2)}):
                      </span>
                      <span className="font-mono text-red-400">
                        -{formatISK(calculations.sellSalesTax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Broker Fee ({formatPercent(brokerFee, 2)}):
                      </span>
                      <span className="font-mono text-red-400">
                        -{formatISK(calculations.sellBrokerFee)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-accent-cyan/10">
                      <span className="text-text-primary font-medium">Net Revenue:</span>
                      <span className="font-mono text-green-400 font-bold">
                        {formatISK(calculations.totalSellAfterFees)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Summary */}
              <div className="pt-3 border-t border-accent-cyan/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-space-dark/50">
                    <div className={`text-lg font-bold ${calculations.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatISK(calculations.netProfit)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">Net Profit</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-space-dark/50">
                    <div className="text-lg font-bold text-accent-cyan">
                      {formatISK(calculations.profitPerUnit)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">Profit per Unit</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-space-dark/50">
                    <div className={`text-lg font-bold ${calculations.roi >= 0 ? 'text-accent-gold' : 'text-red-400'}`}>
                      {formatPercent(calculations.roi, 2)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">ROI</div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-3 border-t border-accent-cyan/10">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Fees:</span>
                    <span className="font-mono text-red-400">
                      {formatISK(calculations.buyBrokerFee + calculations.totalSellFees)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Capital Required:</span>
                    <span className="font-mono text-text-primary">
                      {formatISK(calculations.totalBuyWithFees)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Lowest Sell (buy at):</span>
                    <span className="font-mono text-red-400">
                      {formatISK(buyPrice)} ea
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Highest Buy (sell to):</span>
                    <span className="font-mono text-green-400">
                      {formatISK(sellPrice)} ea
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                <svg className="w-4 h-4 text-accent-cyan mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-text-secondary">
                  <strong>Station Trading:</strong> Place a buy order just above the highest buy order, wait for it to fill, then place a sell order just below the lowest sell order.
                  Margin = (Lowest Sell - Highest Buy) / Lowest Sell.
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      )}
    </div>
  );
}

export default QuickTradeCalculator;
