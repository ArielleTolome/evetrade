import { useState, useMemo } from 'react';
import { AdvancedSortPanel } from './AdvancedSortPanel';
import { applySorts } from './AdvancedSortPanel.utils.js';
import { TradingTable } from '../tables/TradingTable';

/**
 * Example: AdvancedSortPanel Integration with TradingTable
 *
 * This example demonstrates how to integrate the AdvancedSortPanel
 * with the TradingTable component for multi-column sorting.
 */
export function AdvancedSortPanelExample() {
  // Sample trading data
  const sampleData = [
    {
      'Item': 'Tritanium',
      'Item ID': 34,
      'Buy Price': 5.50,
      'Sell Price': 6.20,
      'Volume': 15000000,
      'Profit per Unit': 0.70,
      'Net Profit': 10500000,
      'Gross Margin': 12.7,
      'Score': 85,
      'ROI': 12.7,
    },
    {
      'Item': 'PLEX',
      'Item ID': 44992,
      'Buy Price': 3200000,
      'Sell Price': 3500000,
      'Volume': 500,
      'Profit per Unit': 300000,
      'Net Profit': 150000000,
      'Gross Margin': 9.4,
      'Score': 92,
      'ROI': 9.4,
    },
    {
      'Item': 'Veldspar',
      'Item ID': 1230,
      'Buy Price': 12.00,
      'Sell Price': 15.00,
      'Volume': 8000000,
      'Profit per Unit': 3.00,
      'Net Profit': 24000000,
      'Gross Margin': 25.0,
      'Score': 78,
      'ROI': 25.0,
    },
    {
      'Item': 'Expanded Cargohold II',
      'Item ID': 1999,
      'Buy Price': 850000,
      'Sell Price': 1200000,
      'Volume': 150,
      'Profit per Unit': 350000,
      'Net Profit': 52500000,
      'Gross Margin': 41.2,
      'Score': 88,
      'ROI': 41.2,
    },
  ];

  // Table columns
  const columns = [
    { key: 'Item', label: 'Item', type: 'string' },
    {
      key: 'Buy Price',
      label: 'Buy Price',
      type: 'num',
      render: (val) => `${val.toLocaleString()} ISK`,
    },
    {
      key: 'Sell Price',
      label: 'Sell Price',
      type: 'num',
      render: (val) => `${val.toLocaleString()} ISK`,
    },
    {
      key: 'Volume',
      label: 'Volume',
      type: 'num',
      render: (val) => val.toLocaleString(),
    },
    {
      key: 'Profit per Unit',
      label: 'Profit/Unit',
      type: 'num',
      render: (val) => `${val.toLocaleString()} ISK`,
    },
    {
      key: 'Net Profit',
      label: 'Net Profit',
      type: 'num',
      render: (val) => `${val.toLocaleString()} ISK`,
    },
    {
      key: 'Gross Margin',
      label: 'Margin',
      type: 'num',
      render: (val) => `${val.toFixed(1)}%`,
    },
    {
      key: 'ROI',
      label: 'ROI',
      type: 'num',
      render: (val) => `${val.toFixed(1)}%`,
    },
    {
      key: 'Score',
      label: 'Score',
      type: 'num',
    },
  ];

  // Sort state
  const [sorts, setSorts] = useState([]);

  // Apply multi-column sorting
  const sortedData = useMemo(() => {
    return applySorts(sampleData, sorts, columns);
  }, [sampleData, sorts]);

  // Handle sort change
  const handleSortChange = (newSorts) => {
    console.log('Sort changed:', newSorts);
    setSorts(newSorts);
  };

  return (
    <div className="p-8 space-y-6 bg-space-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-display text-text-primary mb-2">
          Advanced Sort Panel Example
        </h1>
        <p className="text-text-secondary mb-6">
          Demonstrates multi-column sorting with presets and custom configurations
        </p>

        {/* Advanced Sort Panel */}
        <AdvancedSortPanel
          currentSort={sorts}
          onChange={handleSortChange}
          className="mb-6"
        />

        {/* Current sort display */}
        <div className="mb-4 p-4 bg-space-dark/40 rounded-lg border border-accent-cyan/20">
          <div className="text-sm text-text-secondary mb-2">Current Sort Configuration:</div>
          {sorts.length > 0 ? (
            <div className="text-sm text-text-primary">
              {sorts.map((sort, idx) => (
                <div key={idx} className="font-mono">
                  {idx + 1}. {sort.column} ({sort.direction === 'desc' ? 'Descending ↓' : 'Ascending ↑'})
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-text-secondary italic">
              No sorting applied - data shown in original order
            </div>
          )}
        </div>

        {/* Trading Table */}
        <TradingTable
          data={sortedData}
          columns={columns}
          pageLength={10}
          showQualityIndicators={true}
        />

        {/* Usage Instructions */}
        <div className="mt-8 p-6 bg-space-dark/40 rounded-lg border border-accent-cyan/20">
          <h2 className="text-xl font-display text-text-primary mb-4">
            Usage Instructions
          </h2>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <h3 className="text-text-primary font-medium mb-2">Quick Presets</h3>
              <p>Click any preset button to instantly apply a predefined sorting strategy:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Best Overall:</strong> Sorts by overall score</li>
                <li><strong>Highest Profit:</strong> Shows trades with maximum ISK profit</li>
                <li><strong>Best ROI:</strong> Prioritizes return on investment</li>
                <li><strong>Safest Trades:</strong> High volume items with reasonable margins</li>
                <li><strong>Quick Flips:</strong> Fast-moving items with good profit</li>
                <li><strong>Hidden Gems:</strong> High margin opportunities</li>
              </ul>
            </div>

            <div>
              <h3 className="text-text-primary font-medium mb-2">Custom Multi-Column Sorting</h3>
              <p>Build your own sorting strategy:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Click "+ Add Sort Column" buttons to add columns to sort by</li>
                <li>Use the up/down arrows to change sort priority</li>
                <li>Toggle between ASC/DESC to change sort direction</li>
                <li>Remove individual sorts with the × button</li>
                <li>Clear all sorts with "Clear All Sorts"</li>
              </ul>
            </div>

            <div>
              <h3 className="text-text-primary font-medium mb-2">Sort Priority</h3>
              <p>
                When multiple columns are selected, the table sorts by the first column,
                then breaks ties using the second column, and so on. The priority number
                (1, 2, 3...) indicates the sort order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSortPanelExample;
