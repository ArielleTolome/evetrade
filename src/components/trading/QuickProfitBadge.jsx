import { useState, useMemo } from 'react';
import { useProfit } from '../../hooks/useProfit';
import { formatISK, formatPercent } from '../../utils/formatters';

/**
 * QuickProfitBadge Component
 * Inline profit badge for table rows showing net profit after all fees
 * Displays tooltip with breakdown on hover
 */
export function QuickProfitBadge({
  buyPrice,
  sellPrice,
  quantity = 1,
  accountingLevel = 5,
  brokerRelationsLevel = 5,
  isPlayerStructure = false,
  factionStanding = 0,
  corporationStanding = 0,
  onCalculatorOpen,
  className = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { calculate } = useProfit();

  const results = useMemo(() => {
    return calculate({
      buyPrice,
      sellPrice,
      quantity,
      accountingLevel,
      brokerRelationsLevel,
      isPlayerStructure,
      factionStanding,
      corporationStanding,
    });
  }, [buyPrice, sellPrice, quantity, accountingLevel, brokerRelationsLevel, isPlayerStructure, factionStanding, corporationStanding, calculate]);

  const isProfitable = results.netProfit >= 0;
  const hasSignificantProfit = Math.abs(results.netProfit) > 1000;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={onCalculatorOpen}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold
          transition-all duration-200 hover:scale-105
          ${isProfitable
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
          }
        `}
      >
        {isProfitable ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        )}
        <span className="font-mono">
          {hasSignificantProfit ? formatISK(results.netProfit) : '< 1K ISK'}
        </span>
        <span className="text-xs opacity-75">
          ({formatPercent(results.roi / 100, 1)})
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-lg bg-space-dark border border-accent-cyan/30 shadow-xl shadow-black/50 pointer-events-none">
          <div className="space-y-2 text-xs">
            <div className="font-semibold text-text-primary border-b border-accent-cyan/20 pb-2">
              Profit Breakdown
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">Gross Profit:</span>
              <span className={`font-mono ${results.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatISK(results.grossProfit)}
              </span>
            </div>

            <div className="space-y-1 pl-2 border-l-2 border-red-400/30">
              <div className="flex justify-between">
                <span className="text-text-secondary">Buy Broker Fee:</span>
                <span className="font-mono text-red-400">
                  -{formatISK(results.buyBrokerFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Sell Broker Fee:</span>
                <span className="font-mono text-red-400">
                  -{formatISK(results.sellBrokerFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Sales Tax:</span>
                <span className="font-mono text-red-400">
                  -{formatISK(results.salesTax)}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-semibold pt-2 border-t border-accent-cyan/20">
              <span className="text-text-primary">Net Profit:</span>
              <span className={`font-mono ${results.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatISK(results.netProfit)}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">ROI:</span>
              <span className={`font-mono ${results.roi >= 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
                {formatPercent(results.roi / 100, 2)}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Per Unit:</span>
              <span className={`font-mono ${results.profitPerUnit >= 0 ? 'text-accent-gold' : 'text-red-400'}`}>
                {formatISK(results.profitPerUnit)}
              </span>
            </div>

            <div className="pt-2 text-center text-text-secondary border-t border-accent-cyan/20">
              Click to open full calculator
            </div>
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-accent-cyan/30" />
        </div>
      )}
    </div>
  );
}

export default QuickProfitBadge;
