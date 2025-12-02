import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { Button } from '../common/Button';
import { formatISK } from '../../utils/formatters';
import { useMemo } from 'react';

export function QuickTradeCalculator({
  quickCalc,
  setQuickCalc,
  copyCalcResult,
  copiedItem,
  delay = '0ms'
}) {
  const calcResults = useMemo(() => {
    const buy = parseFloat(quickCalc.buyPrice) || 0;
    const sell = parseFloat(quickCalc.sellPrice) || 0;
    const qty = parseFloat(quickCalc.quantity) || 1;
    const broker = parseFloat(quickCalc.brokerFee) / 100 || 0;
    const tax = parseFloat(quickCalc.salesTax) / 100 || 0;

    const buyTotal = buy * qty;
    const sellTotal = sell * qty;
    const brokerFees = buyTotal * broker + sellTotal * broker;
    const salesTaxes = sellTotal * tax;
    const grossProfit = sellTotal - buyTotal;
    const netProfit = grossProfit - brokerFees - salesTaxes;
    const roi = buyTotal > 0 ? (netProfit / buyTotal) * 100 : 0;

    return {
      buyTotal,
      sellTotal,
      brokerFees,
      salesTaxes,
      grossProfit,
      netProfit,
      roi,
    };
  }, [quickCalc]);

  return (
    <GlassmorphicCard className="h-full animate-fade-in-up" style={{ animationDelay: delay }}>
      <h2 className="text-xl font-display text-accent-cyan mb-6 flex items-center gap-2">
        <span className="text-xl">🧮</span> Profit Calculator
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">Item Name (Optional)</label>
          <input
            type="text"
            placeholder="e.g. PLEX"
            value={quickCalc.itemName}
            onChange={(e) => setQuickCalc({ ...quickCalc, itemName: e.target.value })}
            className="w-full px-3 py-2 bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Buy Price</label>
            <input
              type="number"
              placeholder="0"
              value={quickCalc.buyPrice}
              onChange={(e) => setQuickCalc({ ...quickCalc, buyPrice: e.target.value })}
              className="w-full px-3 py-2 bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Sell Price</label>
            <input
              type="number"
              placeholder="0"
              value={quickCalc.sellPrice}
              onChange={(e) => setQuickCalc({ ...quickCalc, sellPrice: e.target.value })}
              className="w-full px-3 py-2 bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary mb-1 block">Quantity</label>
          <input
            type="number"
            placeholder="1"
            value={quickCalc.quantity}
            onChange={(e) => setQuickCalc({ ...quickCalc, quantity: e.target.value })}
            className="w-full px-3 py-2 bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pb-2">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Broker Fee %</label>
            <input
              type="number"
              step="0.1"
              value={quickCalc.brokerFee}
              onChange={(e) => setQuickCalc({ ...quickCalc, brokerFee: e.target.value })}
              className="w-full px-3 py-2 bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Sales Tax %</label>
            <input
              type="number"
              step="0.1"
              value={quickCalc.salesTax}
              onChange={(e) => setQuickCalc({ ...quickCalc, salesTax: e.target.value })}
              className="w-full px-3 py-2 bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-space-black/30 rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Gross Profit</span>
            <span className={`font-mono ${calcResults.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(calcResults.grossProfit)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Fees & Taxes</span>
            <span className="font-mono text-text-primary">{formatISK(calcResults.brokerFees + calcResults.salesTaxes)}</span>
          </div>
          <div className="h-px bg-white/10 my-1"></div>
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold text-text-primary">Net Profit</span>
            <div className="text-right">
               <div className={`font-bold font-mono text-lg ${calcResults.netProfit >= 0 ? 'text-accent-gold' : 'text-red-400'} glow-text`}>
                {formatISK(calcResults.netProfit)}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-white/5 rounded-lg p-2">
             <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">ROI</span>
             <span className={`font-bold font-mono ${calcResults.roi >= 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
                {calcResults.roi.toFixed(2)}%
             </span>
          </div>
        </div>

        <Button
          onClick={copyCalcResult}
          variant="secondary"
          className="w-full py-2.5 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 font-medium border-transparent transition-all"
        >
          {copiedItem === 'Calculator Result' ? '✓ Copied Result' : 'Copy Result'}
        </Button>
      </div>
    </GlassmorphicCard>
  );
}
