import { useState } from 'react';
import { StockAlertPanel } from './StockAlertPanel';
import { RestockSuggestions } from './RestockSuggestions';
import { DeadStockIdentifier } from './DeadStockIdentifier';
import { InventoryValuation } from './InventoryValuation';

/**
 * Inventory Management Demo
 * Demonstrates all inventory management features with sample data
 */
export function InventoryManagementDemo() {
  // Sample inventory data
  const [inventory] = useState([
    {
      itemId: 34,
      itemName: 'Tritanium',
      quantity: 15000,
      price: 5.5,
      buyPrice: 5.2,
      profitPerUnit: 0.3,
      category: 'Minerals',
    },
    {
      itemId: 35,
      itemName: 'Pyerite',
      quantity: 8000,
      price: 12.0,
      buyPrice: 11.5,
      profitPerUnit: 0.5,
      category: 'Minerals',
    },
    {
      itemId: 36,
      itemName: 'Mexallon',
      quantity: 2500,
      price: 45.0,
      buyPrice: 43.0,
      profitPerUnit: 2.0,
      category: 'Minerals',
    },
    {
      itemId: 11399,
      itemName: 'Compressed Veldspar',
      quantity: 50,
      price: 2500.0,
      buyPrice: 2400.0,
      profitPerUnit: 100.0,
      category: 'Ore',
    },
    {
      itemId: 19540,
      itemName: 'PLEX',
      quantity: 3,
      price: 3500000.0,
      buyPrice: 3400000.0,
      profitPerUnit: 100000.0,
      category: 'Special',
    },
    {
      itemId: 44992,
      itemName: 'Small Shield Booster II',
      quantity: 25,
      price: 125000.0,
      buyPrice: 120000.0,
      profitPerUnit: 5000.0,
      category: 'Modules',
    },
    {
      itemId: 1234,
      itemName: 'Obsolete Item',
      quantity: 100,
      price: 1000.0,
      buyPrice: 950.0,
      profitPerUnit: 50.0,
      category: 'Misc',
    },
  ]);

  // Sample sales history (last 30 days)
  /* eslint-disable react-hooks/purity -- Date.now() used for demo data initialization */
  const [salesHistory] = useState([
    // Tritanium - selling steadily
    { itemId: 34, quantity: 5000, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { itemId: 34, quantity: 4500, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { itemId: 34, quantity: 5500, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { itemId: 34, quantity: 4800, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },

    // Pyerite - selling well
    { itemId: 35, quantity: 3000, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { itemId: 35, quantity: 2800, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { itemId: 35, quantity: 3200, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },

    // Mexallon - selling slowly
    { itemId: 36, quantity: 500, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { itemId: 36, quantity: 600, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },

    // PLEX - high value, slow turnover
    { itemId: 19540, quantity: 1, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },

    // Small Shield Booster II - moderate sales
    { itemId: 44992, quantity: 10, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { itemId: 44992, quantity: 8, date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },

    // Obsolete Item - no recent sales (last sale was 15 days ago)
    { itemId: 1234, quantity: 20, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  ]);
  /* eslint-enable react-hooks/purity */

  // Current market prices (same as inventory for demo)
  const [currentPrices] = useState({
    34: 5.5,
    35: 12.0,
    36: 45.0,
    11399: 2500.0,
    19540: 3500000.0,
    44992: 125000.0,
    1234: 1000.0,
  });

  // Item categories
  const [itemCategories] = useState({
    34: 'Minerals',
    35: 'Minerals',
    36: 'Minerals',
    11399: 'Ore',
    19540: 'Special',
    44992: 'Modules',
    1234: 'Misc',
  });

  const [activeTab, setActiveTab] = useState('valuation');

  return (
    <div className="min-h-screen bg-space-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Inventory Management
          </h1>
          <p className="text-text-secondary">
            Comprehensive tools to manage your trading inventory
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'valuation', label: 'Valuation', icon: '💰' },
            { id: 'alerts', label: 'Stock Alerts', icon: '🔔' },
            { id: 'restock', label: 'Restock', icon: '📦' },
            { id: 'deadstock', label: 'Dead Stock', icon: '⚠️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-cyan text-space-black'
                  : 'bg-space-dark/50 text-text-secondary border border-accent-cyan/20 hover:border-accent-cyan/40'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'valuation' && (
            <div className="animate-fade-in">
              <InventoryValuation
                inventory={inventory}
                currentPrices={currentPrices}
                itemCategories={itemCategories}
              />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="animate-fade-in">
              <StockAlertPanel inventory={inventory} />

              <div className="mt-6 p-4 bg-space-dark/30 border border-accent-cyan/20 rounded-lg">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  How to use Stock Alerts:
                </h3>
                <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                  <li>Click "Add Alert" to set a threshold for any inventory item</li>
                  <li>Enable browser notifications to get alerts even when away</li>
                  <li>You'll be notified when stock drops below your threshold</li>
                  <li>Alerts are throttled to max once per hour per item</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'restock' && (
            <div className="animate-fade-in">
              <RestockSuggestions
                inventory={inventory}
                salesHistory={salesHistory}
              />

              <div className="mt-6 p-4 bg-space-dark/30 border border-accent-cyan/20 rounded-lg">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Understanding Restock Suggestions:
                </h3>
                <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                  <li>Sales velocity is calculated from your actual sales history</li>
                  <li>Set target days to determine how much inventory to keep on hand</li>
                  <li>Priority score combines urgency (running out soon) and profit potential</li>
                  <li>ISK needed shows the capital required to restock to target levels</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'deadstock' && (
            <div className="animate-fade-in">
              <DeadStockIdentifier
                inventory={inventory}
                salesHistory={salesHistory}
                currentPrices={currentPrices}
              />

              <div className="mt-6 p-4 bg-space-dark/30 border border-accent-cyan/20 rounded-lg">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Dead Stock Actions:
                </h3>
                <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                  <li><strong>Reprice:</strong> Lower your sell price to become more competitive</li>
                  <li><strong>Reprice Aggressively:</strong> Significantly reduce price to move stale inventory</li>
                  <li><strong>Move to Different Market:</strong> Try selling in a different trade hub or region</li>
                  <li><strong>Liquidate:</strong> Sell at cost or slight loss to free up ISK for better opportunities</li>
                  <li>Opportunity cost shows potential profit lost by having ISK tied up in dead stock</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Demo Data Notice */}
        <div className="mt-8 p-4 bg-accent-purple/10 border border-accent-purple/30 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-accent-purple mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-semibold text-accent-purple mb-1">
                Demo Mode
              </div>
              <div className="text-sm text-text-secondary">
                This page uses sample data to demonstrate the inventory management features.
                In production, these components would integrate with your actual inventory and sales data
                from the EVE Online API or your trading records.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryManagementDemo;
