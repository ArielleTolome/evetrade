import { useState } from 'react';
import QuickStats from './QuickStats';

/**
 * Example usage of QuickStats component
 */
export default function QuickStatsExample() {
  const [filterType, setFilterType] = useState(null);

  // Sample trade data
  const sampleTrades = [
    {
      'Item': 'Tritanium',
      'Item ID': 34,
      'Net Profit': 1500000,
      'Gross Margin': 15.5,
      'Volume': 250,
    },
    {
      'Item': 'Pyerite',
      'Item ID': 35,
      'Net Profit': 2500000,
      'Gross Margin': 22.3,
      'Volume': 150,
    },
    {
      'Item': 'Mexallon',
      'Item ID': 36,
      'Net Profit': 500000,
      'Gross Margin': 8.2,
      'Volume': 80,
    },
    {
      'Item': 'Isogen',
      'Item ID': 37,
      'Net Profit': 3200000,
      'Gross Margin': 18.7,
      'Volume': 120,
    },
    {
      'Item': 'Nocxium',
      'Item ID': 38,
      'Net Profit': 450000,
      'Gross Margin': 5.1,
      'Volume': 60,
    },
    {
      'Item': 'Scam Item',
      'Item ID': 39,
      'Net Profit': 10000000,
      'Gross Margin': 95.0,
      'Volume': 1, // Scam warning!
    },
    {
      'Item': 'Zydrine',
      'Item ID': 40,
      'Net Profit': 1800000,
      'Gross Margin': 12.5,
      'Volume': 110,
    },
    {
      'Item': 'Megacyte',
      'Item ID': 41,
      'Net Profit': 2100000,
      'Gross Margin': 16.8,
      'Volume': 95,
    },
  ];

  const handleFilterClick = (type) => {
    setFilterType(type);
    console.log('Filter clicked:', type);
    // In a real implementation, this would filter the trading table
  };

  return (
    <div className="min-h-screen bg-space-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-accent-cyan mb-8">
          QuickStats Component Examples
        </h1>

        {/* Full Mode Example */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Full Mode (Default)
          </h2>
          <p className="text-text-secondary mb-4">
            Displays all available statistics with interactive cards. Click on
            cards with descriptions to filter trades.
          </p>
          <QuickStats trades={sampleTrades} onFilterClick={handleFilterClick} />
          {filterType && (
            <div className="mt-4 p-4 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg">
              <p className="text-text-primary">
                Filter applied: <span className="text-accent-cyan font-bold">{filterType}</span>
              </p>
            </div>
          )}
        </div>

        {/* Compact Mode Example */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Compact Mode
          </h2>
          <p className="text-text-secondary mb-4">
            Shows only essential statistics in a condensed format, perfect for
            mobile or sidebar displays.
          </p>
          <QuickStats trades={sampleTrades} compact />
        </div>

        {/* Empty State Example */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Empty State
          </h2>
          <p className="text-text-secondary mb-4">
            What the component looks like when there are no trades available.
          </p>
          <QuickStats trades={[]} />
        </div>

        {/* Limited Data Example */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Limited Data (No Scams)
          </h2>
          <p className="text-text-secondary mb-4">
            When no scam warnings are detected, the scam stat card is hidden
            automatically.
          </p>
          <QuickStats
            trades={sampleTrades.filter(t => t['Volume'] !== 1)}
            onFilterClick={handleFilterClick}
          />
        </div>

        {/* Usage Documentation */}
        <div className="mt-12 p-6 bg-space-dark/50 border border-accent-cyan/20 rounded-lg">
          <h2 className="text-xl font-semibold text-accent-cyan mb-4">
            Usage Guide
          </h2>
          <div className="space-y-4 text-text-secondary">
            <div>
              <h3 className="text-text-primary font-semibold mb-2">Props:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <code className="text-accent-cyan">trades</code> (array, required):
                  Array of trade objects with fields like 'Net Profit', 'Gross
                  Margin', 'Volume', and 'Item'
                </li>
                <li>
                  <code className="text-accent-cyan">onFilterClick</code> (function,
                  optional): Callback when a filterable stat card is clicked. Receives
                  filter type as parameter
                </li>
                <li>
                  <code className="text-accent-cyan">compact</code> (boolean, optional):
                  Enable compact mode for mobile/sidebar displays
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-text-primary font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Animated number transitions for smooth value updates</li>
                <li>Real-time calculation of key trading metrics</li>
                <li>Interactive filtering by clicking stat cards</li>
                <li>Automatic scam warning detection (Volume = 1)</li>
                <li>Responsive grid layout</li>
                <li>Color-coded stats for quick visual identification</li>
              </ul>
            </div>
            <div>
              <h3 className="text-text-primary font-semibold mb-2">
                Integration Example:
              </h3>
              <pre className="bg-space-black p-4 rounded-lg overflow-x-auto text-sm">
                <code className="text-green-400">
{`import QuickStats from './components/common/QuickStats';

function TradingPage() {
  const [trades, setTrades] = useState([]);

  const handleFilterClick = (filterType) => {
    // Apply filter to trading table
    switch (filterType) {
      case 'bestProfit':
        // Sort by Net Profit descending
        break;
      case 'highVolume':
        // Filter trades with Volume >= 100
        break;
      case 'lowRisk':
        // Filter safe trades
        break;
      case 'scams':
        // Show scam warnings (Volume = 1)
        break;
    }
  };

  return (
    <div>
      <QuickStats
        trades={trades}
        onFilterClick={handleFilterClick}
      />
      {/* TradingTable component */}
    </div>
  );
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
