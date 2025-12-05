import { useState, useCallback, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatISK, formatNumber } from '../../utils/formatters';

// Default EVE Online trading fees
const DEFAULT_BROKER_FEE = 0.03; // 3% (can be reduced with skills/standings)
const DEFAULT_SALES_TAX = 0.025; // 2.5% (can be reduced with skills)

/**
 * Bulk Order Calculator Component
 * Calculate profits for multiple trade orders with detailed breakdown
 */
export function BulkOrderCalculator({
  onCalculate,
  defaultBrokerFee = DEFAULT_BROKER_FEE,
  defaultSalesTax = DEFAULT_SALES_TAX,
}) {
  const [items, setItems] = useState([{
    // eslint-disable-next-line react-hooks/purity -- unique id for initial state
    id: Date.now(),
    itemName: '',
    quantity: 1,
    buyPrice: 0,
    sellPrice: 0,
  }]);
  const [brokerFee, setBrokerFee] = useState(defaultBrokerFee * 100);
  const [salesTax, setSalesTax] = useState(defaultSalesTax * 100);
  const [showBreakeven, setShowBreakeven] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Add new item
  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, {
      id: Date.now(),
      itemName: '',
      quantity: 1,
      buyPrice: 0,
      sellPrice: 0,
    }]);
  }, []);

  // Remove item
  const handleRemoveItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Update item field
  const handleUpdateItem = useCallback((id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  // Toggle item expansion
  const toggleItemExpansion = useCallback((id) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Calculate item metrics
  const calculateItem = useCallback((item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const buyPrice = parseFloat(item.buyPrice) || 0;
    const sellPrice = parseFloat(item.sellPrice) || 0;

    // Costs
    const buyOrderTotal = buyPrice * quantity;
    const buyBrokerFee = buyOrderTotal * (brokerFee / 100);
    const totalInvestment = buyOrderTotal + buyBrokerFee;

    // Revenue
    const sellOrderTotal = sellPrice * quantity;
    const sellBrokerFee = sellOrderTotal * (brokerFee / 100);
    const sellTax = sellOrderTotal * (salesTax / 100);
    const totalRevenue = sellOrderTotal - sellBrokerFee - sellTax;

    // Profit calculations
    const grossProfit = sellOrderTotal - buyOrderTotal;
    const netProfit = totalRevenue - totalInvestment;
    const profitPerUnit = netProfit / quantity;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    const grossMargin = buyOrderTotal > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Break-even calculations
    const feeRate = (brokerFee + salesTax) / 100;
    const minSellPrice = buyPrice / (1 - feeRate);
    const breakEvenQuantity = netProfit < 0 && profitPerUnit < 0
      ? Math.ceil(Math.abs(totalInvestment - totalRevenue) / Math.abs(profitPerUnit))
      : 0;

    return {
      quantity,
      buyPrice,
      sellPrice,
      buyOrderTotal,
      buyBrokerFee,
      totalInvestment,
      sellOrderTotal,
      sellBrokerFee,
      sellTax,
      totalRevenue,
      grossProfit,
      netProfit,
      profitPerUnit,
      roi,
      grossMargin,
      netMargin,
      minSellPrice,
      breakEvenQuantity,
    };
  }, [brokerFee, salesTax]);

  // Calculate all items
  const calculations = useMemo(() => {
    return items.map(item => ({
      ...item,
      calc: calculateItem(item),
    }));
  }, [items, calculateItem]);

  // Total summary
  const summary = useMemo(() => {
    return calculations.reduce((acc, item) => ({
      totalInvestment: acc.totalInvestment + item.calc.totalInvestment,
      totalRevenue: acc.totalRevenue + item.calc.totalRevenue,
      grossProfit: acc.grossProfit + item.calc.grossProfit,
      netProfit: acc.netProfit + item.calc.netProfit,
      totalBuyFees: acc.totalBuyFees + item.calc.buyBrokerFee,
      totalSellFees: acc.totalSellFees + item.calc.sellBrokerFee + item.calc.sellTax,
    }), {
      totalInvestment: 0,
      totalRevenue: 0,
      grossProfit: 0,
      netProfit: 0,
      totalBuyFees: 0,
      totalSellFees: 0,
    });
  }, [calculations]);

  // Export calculations
  const handleExport = useCallback(() => {
    const data = calculations.map(item => ({
      'Item': item.itemName || 'Unnamed',
      'Quantity': item.calc.quantity,
      'Buy Price': item.calc.buyPrice,
      'Sell Price': item.calc.sellPrice,
      'Investment': item.calc.totalInvestment,
      'Revenue': item.calc.totalRevenue,
      'Gross Profit': item.calc.grossProfit,
      'Net Profit': item.calc.netProfit,
      'ROI %': item.calc.roi.toFixed(2),
      'Profit/Unit': item.calc.profitPerUnit,
    }));

    if (data.length === 0) return;
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-order-calculator-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onCalculate?.(calculations);
  }, [calculations, onCalculate]);

  return (
    <GlassmorphicCard padding="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display text-accent-cyan">Bulk Order Calculator</h3>
        <button
          onClick={handleExport}
          disabled={calculations.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>

      {/* Fee Settings */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-space-black/50 rounded-lg border border-accent-cyan/10">
        <div>
          <label className="text-xs text-text-secondary mb-2 block">Broker Fee %</label>
          <input
            type="number"
            value={brokerFee}
            onChange={(e) => setBrokerFee(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
            step="0.1"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-2 block">Sales Tax %</label>
          <input
            type="number"
            value={salesTax}
            onChange={(e) => setSalesTax(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
            step="0.1"
            min="0"
            max="100"
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {calculations.map((item, _index) => {
          const isExpanded = expandedItems.has(item.id);
          const isProfitable = item.calc.netProfit > 0;

          return (
            <div
              key={item.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                isProfitable
                  ? 'border-green-500/30 bg-green-500/5'
                  : item.calc.netProfit < 0
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-accent-cyan/20 bg-space-black/30'
              }`}
            >
              {/* Item Header */}
              <div className="p-4">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => handleUpdateItem(item.id, 'itemName', e.target.value)}
                      placeholder="Item name"
                      className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none text-sm"
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.buyPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'buyPrice', e.target.value)}
                      placeholder="Buy price"
                      className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.sellPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'sellPrice', e.target.value)}
                      placeholder="Sell price"
                      className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1 flex gap-1">
                    <button
                      onClick={() => toggleItemExpansion(item.id)}
                      className="p-2 text-text-secondary hover:text-accent-cyan transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand details'}
                    >
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="text-center">
                    <div className="text-xs text-text-secondary">Net Profit</div>
                    <div className={`text-sm font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                      {formatISK(item.calc.netProfit, false)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-text-secondary">ROI</div>
                    <div className={`text-sm font-bold ${item.calc.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.calc.roi.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-text-secondary">Profit/Unit</div>
                    <div className="text-sm font-bold text-accent-cyan">
                      {formatISK(item.calc.profitPerUnit, false)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-text-secondary">Margin</div>
                    <div className="text-sm font-bold text-accent-gold">
                      {item.calc.grossMargin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-accent-cyan/10">
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    {/* Investment Breakdown */}
                    <div>
                      <h5 className="text-xs font-medium text-accent-cyan mb-3">Investment</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Buy Order</span>
                          <span className="text-text-primary">{formatISK(item.calc.buyOrderTotal, false)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Broker Fee</span>
                          <span className="text-red-400">{formatISK(item.calc.buyBrokerFee, false)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-accent-cyan/10 pt-2">
                          <span className="text-text-primary">Total</span>
                          <span className="text-accent-cyan">{formatISK(item.calc.totalInvestment, false)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div>
                      <h5 className="text-xs font-medium text-accent-cyan mb-3">Revenue</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Sell Order</span>
                          <span className="text-text-primary">{formatISK(item.calc.sellOrderTotal, false)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Broker Fee</span>
                          <span className="text-red-400">-{formatISK(item.calc.sellBrokerFee, false)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Sales Tax</span>
                          <span className="text-red-400">-{formatISK(item.calc.sellTax, false)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-accent-cyan/10 pt-2">
                          <span className="text-text-primary">Total</span>
                          <span className="text-accent-cyan">{formatISK(item.calc.totalRevenue, false)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Break-even Info */}
                  {showBreakeven && (
                    <div className="mt-4 p-3 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
                      <div className="text-xs text-text-secondary mb-2">Break-even Analysis</div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-text-secondary">Min Sell Price: </span>
                          <span className="text-accent-gold font-bold">{formatISK(item.calc.minSellPrice, false)}</span>
                        </div>
                        {item.calc.breakEvenQuantity > 0 && (
                          <div>
                            <span className="text-text-secondary">Break-even Qty: </span>
                            <span className="text-accent-gold font-bold">{formatNumber(item.calc.breakEvenQuantity, 0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Item Button */}
      <button
        onClick={handleAddItem}
        className="w-full py-3 bg-accent-cyan/10 text-accent-cyan rounded-lg hover:bg-accent-cyan/20 transition-colors font-medium flex items-center justify-center gap-2 mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Item
      </button>

      {/* Summary */}
      <div className="p-6 bg-gradient-to-br from-accent-cyan/10 to-accent-gold/10 border border-accent-cyan/30 rounded-xl">
        <h4 className="text-sm font-medium text-accent-cyan mb-4">Total Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-text-secondary mb-1">Total Investment</div>
            <div className="text-lg font-bold text-red-400">{formatISK(summary.totalInvestment, false)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Total Revenue</div>
            <div className="text-lg font-bold text-green-400">{formatISK(summary.totalRevenue, false)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Gross Profit</div>
            <div className="text-lg font-bold text-accent-cyan">{formatISK(summary.grossProfit, false)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Total Fees</div>
            <div className="text-lg font-bold text-red-400">{formatISK(summary.totalBuyFees + summary.totalSellFees, false)}</div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Net Profit</div>
            <div className={`text-lg font-bold ${summary.netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(summary.netProfit, false)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">ROI</div>
            <div className={`text-lg font-bold ${
              summary.totalInvestment > 0 && ((summary.netProfit / summary.totalInvestment) * 100) > 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {summary.totalInvestment > 0 ? ((summary.netProfit / summary.totalInvestment) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="mt-4 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showBreakeven}
            onChange={(e) => setShowBreakeven(e.target.checked)}
            className="rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan/50"
          />
          Show break-even analysis
        </label>
      </div>
    </GlassmorphicCard>
  );
}

export default BulkOrderCalculator;
