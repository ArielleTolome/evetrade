import { useState } from 'react';
import { QuickProfitBadge } from './QuickProfitBadge';
import { ComprehensiveProfitCalculator } from './ComprehensiveProfitCalculator';
import { GlassmorphicCard } from '../common/GlassmorphicCard';

/**
 * Example usage of QuickProfitBadge in a trading table
 */
export function QuickProfitBadgeExample() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Example trade data
  const trades = [
    {
      id: 1,
      itemName: 'Tritanium',
      buyPrice: 5.50,
      sellPrice: 6.00,
      quantity: 100000,
    },
    {
      id: 2,
      itemName: 'PLEX',
      buyPrice: 3500000,
      sellPrice: 3600000,
      quantity: 10,
    },
    {
      id: 3,
      itemName: 'Isogen',
      buyPrice: 95.00,
      sellPrice: 100.00,
      quantity: 50000,
    },
    {
      id: 4,
      itemName: 'Skill Injector',
      buyPrice: 650000000,
      sellPrice: 680000000,
      quantity: 5,
    },
  ];

  const handleOpenCalculator = (trade) => {
    setSelectedItem(trade);
    setShowCalculator(true);
  };

  if (showCalculator) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowCalculator(false)}
          className="flex items-center gap-2 text-accent-cyan hover:text-accent-cyan/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Table
        </button>
        <ComprehensiveProfitCalculator />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-text-primary">QuickProfitBadge Example</h2>
      <p className="text-text-secondary">
        Hover over the profit badges to see breakdowns. Click to open the full calculator.
      </p>

      <GlassmorphicCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent-cyan/20">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Item</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">Buy Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">Sell Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">Quantity</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-text-secondary">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-accent-cyan/10 hover:bg-accent-cyan/5 transition-colors">
                  <td className="py-3 px-4 text-text-primary font-medium">{trade.itemName}</td>
                  <td className="py-3 px-4 text-right font-mono text-text-primary">
                    {trade.buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} ISK
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-text-primary">
                    {trade.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} ISK
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-text-secondary">
                    {trade.quantity.toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end">
                      <QuickProfitBadge
                        buyPrice={trade.buyPrice}
                        sellPrice={trade.sellPrice}
                        quantity={trade.quantity}
                        accountingLevel={5}
                        brokerRelationsLevel={5}
                        isPlayerStructure={false}
                        onCalculatorOpen={() => handleOpenCalculator(trade)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>

      <div className="p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
        <p className="text-sm text-text-secondary">
          <strong className="text-text-primary">Note:</strong> All calculations assume Accounting V and Broker Relations V.
          Adjust skills in the full calculator for accurate results.
        </p>
      </div>
    </div>
  );
}

export default QuickProfitBadgeExample;
