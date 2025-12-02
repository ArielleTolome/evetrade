/**
 * RegionalArbitrage Component - Usage Examples
 *
 * This file demonstrates how to integrate the RegionalArbitrage component
 * into your EVETrade application pages.
 */

import { useState } from 'react';
import { RegionalArbitrage } from './RegionalArbitrage';

/**
 * Example 1: Basic Usage
 * Simple integration showing arbitrage opportunities for a specific item
 */
export function BasicArbitrageExample() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Tritanium Regional Arbitrage
      </h2>

      <RegionalArbitrage
        itemId={34} // Tritanium
        itemName="Tritanium"
        onSelect={(route) => {
          setSelectedRoute(route);
          console.log('Selected arbitrage route:', route);
        }}
      />

      {selectedRoute && (
        <div className="mt-6 p-4 bg-accent-cyan/10 rounded-lg border border-accent-cyan/30">
          <h3 className="text-sm font-medium text-accent-cyan mb-2">Selected Route</h3>
          <p className="text-sm text-text-primary">
            Buy {selectedRoute.buyHub} → Sell {selectedRoute.sellHub}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Integration with Item Search
 * Shows how to use with an item selector for dynamic item analysis
 */
export function DynamicArbitrageExample() {
  const [selectedItem, setSelectedItem] = useState({ id: 34, name: 'Tritanium' });

  // Common items for quick selection
  const commonItems = [
    { id: 34, name: 'Tritanium' },
    { id: 35, name: 'Pyerite' },
    { id: 36, name: 'Mexallon' },
    { id: 37, name: 'Isogen' },
    { id: 44, name: 'Enriched Uranium' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">
          Market Arbitrage Analysis
        </h2>

        {/* Item Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Select Item:</label>
          <select
            value={selectedItem.id}
            onChange={(e) => {
              const item = commonItems.find(i => i.id === parseInt(e.target.value));
              setSelectedItem(item);
            }}
            className="px-3 py-2 bg-space-dark border border-accent-cyan/30 rounded-lg
                     text-text-primary text-sm focus:outline-none focus:border-accent-cyan"
          >
            {commonItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <RegionalArbitrage
        itemId={selectedItem.id}
        itemName={selectedItem.name}
        onSelect={(route) => {
          console.log('Selected route:', route);
          // Could trigger route planning, add to watchlist, etc.
        }}
      />
    </div>
  );
}

/**
 * Example 3: Integration with Trading Dashboard
 * Shows how to embed in a larger trading page with multiple components
 */
export function TradingDashboardExample() {
  const [activeItemId, setActiveItemId] = useState(34);
  const [activeItemName, setActiveItemName] = useState('Tritanium');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Item Selection and Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-space-dark/60 rounded-lg p-4 border border-accent-cyan/20">
            <h3 className="text-sm font-medium text-accent-cyan mb-3">
              Current Item
            </h3>
            <div className="text-lg font-semibold text-text-primary">
              {activeItemName}
            </div>
            <div className="text-xs text-text-secondary">
              Type ID: {activeItemId}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-space-dark/60 rounded-lg p-4 border border-accent-cyan/20">
            <h3 className="text-sm font-medium text-accent-cyan mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Market Cap:</span>
                <span className="text-text-primary">1.5B ISK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Daily Volume:</span>
                <span className="text-text-primary">450K units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Arbitrage Analysis */}
        <div className="lg:col-span-2">
          <RegionalArbitrage
            itemId={activeItemId}
            itemName={activeItemName}
            onSelect={(route) => {
              console.log('Arbitrage route selected:', route);
              // Could integrate with route planning, hauling calculator, etc.
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Modal/Popup Integration
 * Shows how to use as a popup/modal for quick arbitrage checks
 */
export function ArbitrageModalExample() {
  const [showModal, setShowModal] = useState(false);
  const [itemToAnalyze, setItemToAnalyze] = useState({ id: 34, name: 'Tritanium' });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-accent-cyan/20 hover:bg-accent-cyan/30
                 border border-accent-cyan/30 rounded-lg text-accent-cyan
                 font-medium transition-all"
      >
        Check Arbitrage Opportunities
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                Arbitrage Analysis
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <RegionalArbitrage
              itemId={itemToAnalyze.id}
              itemName={itemToAnalyze.name}
              onSelect={(route) => {
                console.log('Selected route:', route);
                setShowModal(false);
                // Navigate to trade planning page, etc.
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Watchlist Integration
 * Monitor multiple items for arbitrage opportunities
 */
export function WatchlistArbitrageExample() {
  const [watchlist] = useState([
    { id: 34, name: 'Tritanium' },
    { id: 35, name: 'Pyerite' },
    { id: 36, name: 'Mexallon' },
  ]);

  const [expandedItem, setExpandedItem] = useState(null);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Watchlist Arbitrage Monitor
      </h2>

      {watchlist.map(item => (
        <div key={item.id} className="border border-accent-cyan/20 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
            className="w-full px-4 py-3 bg-space-dark/60 hover:bg-space-dark/80
                     flex items-center justify-between transition-colors"
          >
            <span className="text-text-primary font-medium">{item.name}</span>
            <span className="text-text-secondary">
              {expandedItem === item.id ? '▼' : '▶'}
            </span>
          </button>

          {expandedItem === item.id && (
            <div className="p-4">
              <RegionalArbitrage
                itemId={item.id}
                itemName={item.name}
                onSelect={(route) => {
                  console.log(`Selected route for ${item.name}:`, route);
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default BasicArbitrageExample;
