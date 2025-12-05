import React from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';
import { Button } from '../common/Button';
import { GlassmorphicCard } from '../common/GlassmorphicCard';

/**
 * A component to display a single trade simulation scenario.
 * It shows calculated metrics and provides copy/delete actions.
 */
export function SimulationCard({ scenario, onCopy, onDelete, isBest, className = '' }) {
  const {
    buyPrice,
    sellPrice,
    quantity,
    profit,
    roi,
    margin,
    breakEven,
    bestCase,
    worstCase,
    expectedProfit,
  } = scenario;

  const Metric = ({ label, value, tooltip, valueClassName = 'text-text-primary' }) => (
    <div className="flex justify-between items-baseline" title={tooltip}>
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`font-mono text-base ${valueClassName}`}>{value}</span>
    </div>
  );

  return (
    <GlassmorphicCard
      className={`relative flex flex-col p-4 space-y-4 transition-all duration-300 ${
        isBest
          ? 'border-accent-gold/50 ring-2 ring-accent-gold/30'
          : 'border-accent-cyan/20'
      } ${className}`}
    >
      {isBest && (
        <div className="absolute -top-3 right-4 px-3 py-1 text-xs font-bold text-space-dark bg-accent-gold rounded-full shadow-lg">
          Most Profitable
        </div>
      )}

      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <h3 className="font-display text-lg text-text-primary">Scenario</h3>
        <div className="flex gap-2">
          <Button
            onClick={onCopy}
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs"
            title="Copy scenario"
          >
            Copy
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
            title="Delete scenario"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Metric
          label="Total Profit"
          value={formatISK(profit)}
          valueClassName={profit > 0 ? 'text-green-400' : 'text-red-400'}
          tooltip="Net profit after all fees and taxes."
        />
        <Metric
          label="ROI"
          value={formatPercent(roi)}
          tooltip="Return on Investment. (Profit / Total Buy Cost) * 100"
        />
        <Metric
          label="Margin"
          value={formatPercent(margin)}
          tooltip="Profit margin per unit. ((Sell Price - Buy Price) / Buy Price) * 100"
        />
        <Metric
          label="Break-even Price"
          value={formatISK(breakEven, false)}
          tooltip="The sell price required to cover all costs and fees, resulting in zero profit."
        />
      </div>

      <div className="pt-4 border-t border-white/10">
        <h4 className="text-sm font-semibold text-text-primary mb-2">Profit Scenarios</h4>
        <div className="space-y-2">
          <Metric
            label="Best Case"
            value={formatISK(bestCase)}
            valueClassName="text-green-300"
            tooltip="Projected profit with favorable price volatility."
          />
          <Metric
            label="Expected"
            value={formatISK(expectedProfit)}
            valueClassName="text-cyan-300"
            tooltip="Projected profit with no price volatility."
          />
          <Metric
            label="Worst Case"
            value={formatISK(worstCase)}
            valueClassName="text-orange-400"
            tooltip="Projected profit with unfavorable price volatility."
          />
        </div>
      </div>
    </GlassmorphicCard>
  );
}
