import { useState } from 'react';
import { OneClickCopy, OneClickCopyInline } from './OneClickCopy';
import { BulkCopyPanel, BulkCopyList } from './BulkCopyPanel';
import { TradeClipboard } from './TradeClipboard';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * Full Integration Example
 * Shows how all copy components work together in a trading interface
 */
export function CopyComponentsIntegrationExample() {
  const [selectedTrades, setSelectedTrades] = useState([]);
  const [_activeTab, _setActiveTab] = useState('profitable');

  // Sample trade opportunities
  const tradeOpportunities = [
    {
      id: 1,
      name: 'Tritanium',
      station: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      region: 'The Forge',
      buyPrice: 5.50,
      sellPrice: 6.00,
      quantity: 1000000,
      volume: 0.01,
      profit: 500000,
      margin: 0.0909,
      roi: 9.09,
      competition: 'High',
    },
    {
      id: 2,
      name: 'Pyerite',
      station: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      region: 'The Forge',
      buyPrice: 12.00,
      sellPrice: 13.50,
      quantity: 500000,
      volume: 0.01,
      profit: 750000,
      margin: 0.125,
      roi: 12.5,
      competition: 'Medium',
    },
    {
      id: 3,
      name: 'Mexallon',
      station: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      region: 'The Forge',
      buyPrice: 95.00,
      sellPrice: 105.00,
      quantity: 100000,
      volume: 0.01,
      profit: 1000000,
      margin: 0.1053,
      roi: 10.53,
      competition: 'Low',
    },
    {
      id: 4,
      name: 'Isogen',
      station: 'Amarr VIII (Oris) - Emperor Family Academy',
      region: 'Domain',
      buyPrice: 150.00,
      sellPrice: 165.00,
      quantity: 75000,
      volume: 0.01,
      profit: 1125000,
      margin: 0.10,
      roi: 10.0,
      competition: 'Medium',
    },
    {
      id: 5,
      name: 'Nocxium',
      station: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
      region: 'Sinq Laison',
      buyPrice: 850.00,
      sellPrice: 925.00,
      quantity: 25000,
      volume: 0.01,
      profit: 1875000,
      margin: 0.0882,
      roi: 8.82,
      competition: 'High',
    },
  ];

  const toggleTrade = (id) => {
    setSelectedTrades(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const toggleAll = () => {
    if (selectedTrades.length === tradeOpportunities.length) {
      setSelectedTrades([]);
    } else {
      setSelectedTrades(tradeOpportunities.map(t => t.id));
    }
  };

  const getTradeDetails = (trade) => {
    return `${trade.name} @ ${trade.station}: Buy ${formatISK(trade.buyPrice)}, Sell ${formatISK(trade.sellPrice)}, Profit ${formatISK(trade.profit)} (${formatPercent(trade.margin)} margin)`;
  };

  return (
    <div className="min-h-screen bg-space-black">
      {/* Header */}
      <header className="bg-space-dark border-b border-accent-cyan/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">EVETrade</h1>
            <p className="text-sm text-text-secondary">Copy Components Integration Demo</p>
          </div>
          <div className="flex items-center gap-4">
            <OneClickCopyInline value="Jita IV - Moon 4 - Caldari Navy Assembly Plant" label="Station">
              <span className="text-accent-cyan">Jita IV - Moon 4</span>
            </OneClickCopyInline>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Trading Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards with Copy */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-space-dark rounded-lg border border-accent-cyan/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-text-secondary">Total Opportunities</div>
                  <OneClickCopy
                    value={tradeOpportunities.length.toString()}
                    showLabel={false}
                    size="sm"
                  />
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {tradeOpportunities.length}
                </div>
              </div>

              <div className="p-4 bg-space-dark rounded-lg border border-accent-cyan/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-text-secondary">Avg ROI</div>
                  <OneClickCopy
                    value="10.09%"
                    showLabel={false}
                    size="sm"
                  />
                </div>
                <div className="text-2xl font-bold text-green-400">10.09%</div>
              </div>

              <div className="p-4 bg-space-dark rounded-lg border border-accent-cyan/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-text-secondary">Total Profit</div>
                  <OneClickCopy
                    value="5,250,000 ISK"
                    showLabel={false}
                    size="sm"
                  />
                </div>
                <div className="text-2xl font-bold text-accent-cyan">5.25M ISK</div>
              </div>
            </div>

            {/* Trading Table */}
            <div className="bg-space-dark rounded-lg border border-accent-cyan/20 overflow-hidden">
              <div className="p-4 border-b border-accent-cyan/20 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  Trade Opportunities
                  {selectedTrades.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-accent-cyan/10 text-accent-cyan rounded-full text-xs">
                      {selectedTrades.length} selected
                    </span>
                  )}
                </h2>

                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-space-light/10 hover:bg-space-light/20 text-text-secondary hover:text-accent-cyan rounded-lg text-sm transition-colors">
                    Filter
                  </button>
                  <button className="px-3 py-1.5 bg-space-light/10 hover:bg-space-light/20 text-text-secondary hover:text-accent-cyan rounded-lg text-sm transition-colors">
                    Sort
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-space-light/5">
                    <tr className="border-b border-accent-cyan/10">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTrades.length === tradeOpportunities.length}
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-accent-cyan/30 bg-space-light/10 text-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/50 cursor-pointer"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Item</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Station</th>
                      <th className="text-right py-3 px-4 text-text-secondary font-medium">Buy</th>
                      <th className="text-right py-3 px-4 text-text-secondary font-medium">Sell</th>
                      <th className="text-right py-3 px-4 text-text-secondary font-medium">Profit</th>
                      <th className="text-right py-3 px-4 text-text-secondary font-medium">Margin</th>
                      <th className="text-center py-3 px-4 text-text-secondary font-medium">Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeOpportunities.map((trade) => (
                      <tr
                        key={trade.id}
                        className={`border-b border-accent-cyan/10 hover:bg-space-light/5 transition-colors ${
                          selectedTrades.includes(trade.id) ? 'bg-accent-cyan/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTrades.includes(trade.id)}
                            onChange={() => toggleTrade(trade.id)}
                            className="w-4 h-4 rounded border-accent-cyan/30 bg-space-light/10 text-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/50 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-text-primary">{trade.name}</div>
                          <div className="text-xs text-text-secondary">
                            {formatNumber(trade.quantity, 0)} units
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <OneClickCopyInline value={trade.station} label="Station">
                            <div className="text-text-primary truncate max-w-[200px]">
                              {trade.station.split(' - ')[0]}
                            </div>
                          </OneClickCopyInline>
                          <div className="text-xs text-text-secondary">{trade.region}</div>
                        </td>
                        <td className="py-3 px-4 text-right text-text-primary">
                          {formatISK(trade.buyPrice)}
                        </td>
                        <td className="py-3 px-4 text-right text-text-primary">
                          {formatISK(trade.sellPrice)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="text-green-400 font-semibold">
                            +{formatISK(trade.profit)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-accent-cyan font-medium">
                          {formatPercent(trade.margin)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <OneClickCopy
                              value={trade.name}
                              showLabel={false}
                              size="sm"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bulk Copy Panel */}
              {selectedTrades.length > 0 && (
                <div className="p-4 border-t border-accent-cyan/20">
                  <BulkCopyPanel
                    items={tradeOpportunities.filter(t => selectedTrades.includes(t.id))}
                    getItemName={(trade) => trade.name}
                    getItemDetails={getTradeDetails}
                    preSelectedItems={selectedTrades}
                    onSelectionChange={setSelectedTrades}
                    compact
                  />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-space-dark rounded-lg border border-accent-cyan/20 p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Copy Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <OneClickCopy
                  value={tradeOpportunities.map(t => t.name)}
                  label="All Item Names"
                  format="ingame"
                />
                <OneClickCopy
                  value={tradeOpportunities}
                  label="All Data (JSON)"
                  format="json"
                />
                <OneClickCopy
                  value={tradeOpportunities}
                  label="Export to CSV"
                  format="csv"
                />
                <OneClickCopy
                  value={tradeOpportunities.map(t =>
                    `${formatNumber(t.quantity, 0)}x ${t.name}`
                  )}
                  label="Shopping List"
                  format="text"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Clipboard History */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Clipboard History */}
              <div className="bg-space-dark rounded-lg border border-accent-cyan/20">
                <TradeClipboard compact />
              </div>

              {/* Quick Info */}
              <div className="bg-space-dark rounded-lg border border-accent-cyan/20 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-text-primary">Quick Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Best Margin</span>
                    <span className="text-green-400 font-semibold">12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Best Profit</span>
                    <span className="text-accent-cyan font-semibold">1.88M ISK</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Top Item</span>
                    <span className="text-text-primary">Nocxium</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-space-dark rounded-lg border border-accent-cyan/20 p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Tips</h3>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Hover over any text to see copy option</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Select rows and use bulk copy for multiple items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Pin frequently used items in clipboard history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Use Ctrl+A and Ctrl+C for keyboard shortcuts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CopyComponentsIntegrationExample;
