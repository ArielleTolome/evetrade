import { useState } from 'react';
import { BulkCopyPanel, BulkCopyList } from './BulkCopyPanel';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * Example usage of BulkCopyPanel components
 */
export function BulkCopyPanelExample() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [copyLog, setCopyLog] = useState([]);

  // Sample trading data
  const tradeOpportunities = [
    {
      id: 1,
      name: 'Tritanium',
      buyPrice: 5.50,
      sellPrice: 6.00,
      quantity: 1000000,
      profit: 500000,
      margin: 9.09,
    },
    {
      id: 2,
      name: 'Pyerite',
      buyPrice: 12.00,
      sellPrice: 13.50,
      quantity: 500000,
      profit: 750000,
      margin: 12.5,
    },
    {
      id: 3,
      name: 'Mexallon',
      buyPrice: 95.00,
      sellPrice: 105.00,
      quantity: 100000,
      profit: 1000000,
      margin: 10.53,
    },
    {
      id: 4,
      name: 'Isogen',
      buyPrice: 150.00,
      sellPrice: 165.00,
      quantity: 75000,
      profit: 1125000,
      margin: 10.0,
    },
    {
      id: 5,
      name: 'Nocxium',
      buyPrice: 850.00,
      sellPrice: 925.00,
      quantity: 25000,
      profit: 1875000,
      margin: 8.82,
    },
  ];

  const handleCopy = (items, format) => {
    setCopyLog(prev => [
      `Copied ${items.length} items in ${format} format`,
      ...prev.slice(0, 9)
    ]);
  };

  const getItemDetails = (item) => {
    return `${item.name}: Buy ${formatISK(item.buyPrice)}, Sell ${formatISK(item.sellPrice)}, Profit: ${formatISK(item.profit)}`;
  };

  return (
    <div className="p-8 space-y-8 bg-space-black min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">BulkCopyPanel Examples</h1>

        {/* Basic Usage */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Basic Bulk Copy</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <BulkCopyPanel
              items={tradeOpportunities}
              getItemName={(item) => item.name}
              getItemDetails={getItemDetails}
              onCopy={handleCopy}
              onSelectionChange={setSelectedIds}
            />
          </div>
        </section>

        {/* With Item List */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">With Selectable List</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20 space-y-4">
            <BulkCopyList
              items={tradeOpportunities}
              selectedIds={new Set(selectedIds)}
              onToggleItem={(id) => {
                setSelectedIds(prev => {
                  if (prev.includes(id)) {
                    return prev.filter(i => i !== id);
                  }
                  return [...prev, id];
                });
              }}
              renderItem={(item) => (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-text-primary">{item.name}</div>
                    <div className="text-xs text-text-secondary">
                      Buy: {formatISK(item.buyPrice)} → Sell: {formatISK(item.sellPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">
                      +{formatISK(item.profit)}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {item.margin.toFixed(2)}% margin
                    </div>
                  </div>
                </div>
              )}
            />

            <BulkCopyPanel
              items={tradeOpportunities}
              getItemName={(item) => item.name}
              getItemDetails={getItemDetails}
              preSelectedItems={selectedIds}
              onCopy={handleCopy}
              onSelectionChange={setSelectedIds}
              compact
            />
          </div>
        </section>

        {/* Simple Item Names */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Simple Item Names</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <BulkCopyPanel
              items={['Tritanium', 'Pyerite', 'Mexallon', 'Isogen', 'Nocxium']}
              getItemName={(item) => item}
              onCopy={(items, format) => {
                setCopyLog(prev => [
                  `Copied ${items.length} item names in ${format} format`,
                  ...prev.slice(0, 9)
                ]);
              }}
              compact
            />
          </div>
        </section>

        {/* Station Names */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Station Names</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <BulkCopyPanel
              items={[
                { id: 'jita', name: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant', region: 'The Forge' },
                { id: 'amarr', name: 'Amarr VIII (Oris) - Emperor Family Academy', region: 'Domain' },
                { id: 'dodixie', name: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant', region: 'Sinq Laison' },
                { id: 'rens', name: 'Rens VI - Moon 8 - Brutor Tribe Treasury', region: 'Heimatar' },
                { id: 'hek', name: 'Hek VIII - Moon 12 - Boundless Creation Factory', region: 'Metropolis' },
              ]}
              getItemName={(item) => item.name}
              getItemDetails={(item) => `${item.name} (${item.region})`}
              onCopy={handleCopy}
            />
          </div>
        </section>

        {/* Trading Opportunities with Detailed Info */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Trade Opportunities Table</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-cyan/20">
                    <th className="text-left py-2 px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === tradeOpportunities.length}
                        onChange={() => {
                          if (selectedIds.length === tradeOpportunities.length) {
                            setSelectedIds([]);
                          } else {
                            setSelectedIds(tradeOpportunities.map(t => t.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-accent-cyan/30 bg-space-light/10 text-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/50 cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-2 px-3 text-text-secondary">Item</th>
                    <th className="text-right py-2 px-3 text-text-secondary">Buy Price</th>
                    <th className="text-right py-2 px-3 text-text-secondary">Sell Price</th>
                    <th className="text-right py-2 px-3 text-text-secondary">Quantity</th>
                    <th className="text-right py-2 px-3 text-text-secondary">Profit</th>
                    <th className="text-right py-2 px-3 text-text-secondary">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeOpportunities.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-accent-cyan/10 ${
                        selectedIds.includes(item.id) ? 'bg-accent-cyan/5' : ''
                      }`}
                    >
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => {
                            setSelectedIds(prev => {
                              if (prev.includes(item.id)) {
                                return prev.filter(i => i !== item.id);
                              }
                              return [...prev, item.id];
                            });
                          }}
                          className="w-4 h-4 rounded border-accent-cyan/30 bg-space-light/10 text-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/50 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-medium text-text-primary">{item.name}</td>
                      <td className="py-3 px-3 text-right text-text-primary">{formatISK(item.buyPrice)}</td>
                      <td className="py-3 px-3 text-right text-text-primary">{formatISK(item.sellPrice)}</td>
                      <td className="py-3 px-3 text-right text-text-primary">{formatNumber(item.quantity, 0)}</td>
                      <td className="py-3 px-3 text-right text-green-400 font-semibold">
                        {formatISK(item.profit)}
                      </td>
                      <td className="py-3 px-3 text-right text-accent-cyan">
                        {item.margin.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <BulkCopyPanel
              items={tradeOpportunities}
              getItemName={(item) => item.name}
              getItemDetails={getItemDetails}
              preSelectedItems={selectedIds}
              onCopy={handleCopy}
              onSelectionChange={setSelectedIds}
              compact
            />
          </div>
        </section>

        {/* Copy Log */}
        {copyLog.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-accent-cyan">Copy History</h2>
            <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
              <div className="space-y-2">
                {copyLog.map((log, index) => (
                  <div key={index} className="text-sm text-text-secondary font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default BulkCopyPanelExample;
