# Integration Guide

Quick guide for integrating inventory management components into your EVETrade app.

## Quick Start

### 1. View the Demo

The easiest way to see all features in action:

```bash
# Import and use the demo component in your router
import { InventoryManagementDemo } from './components/inventory/InventoryManagementDemo';

// In your routes:
<Route path="/inventory" element={<InventoryManagementDemo />} />
```

### 2. Add to Navigation

Update `/src/components/common/Navbar.jsx`:

```jsx
<Link
  to="/inventory"
  className="text-text-secondary hover:text-accent-cyan transition-colors"
>
  Inventory
</Link>
```

### 3. Create a Real Inventory Page

Create `/src/pages/InventoryPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import {
  StockAlertPanel,
  RestockSuggestions,
  DeadStockIdentifier,
  InventoryValuation,
} from '../components/inventory';

export function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load real data from your API or localStorage
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      // Example: Load from localStorage
      const savedInventory = localStorage.getItem('evetrade_user_inventory');
      const savedSales = localStorage.getItem('evetrade_sales_history');

      if (savedInventory) setInventory(JSON.parse(savedInventory));
      if (savedSales) setSalesHistory(JSON.parse(savedSales));

      // Or fetch from API:
      // const response = await fetch('/api/inventory');
      // const data = await response.json();
      // setInventory(data.inventory);
      // setSalesHistory(data.salesHistory);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLayout><div>Loading...</div></PageLayout>;
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Inventory Management
          </h1>
          <p className="text-text-secondary">
            Track your inventory, get restock suggestions, and optimize your trading
          </p>
        </div>

        <InventoryValuation
          inventory={inventory}
          currentPrices={getCurrentPrices(inventory)}
          itemCategories={getItemCategories(inventory)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockAlertPanel inventory={inventory} />

          <RestockSuggestions
            inventory={inventory}
            salesHistory={salesHistory}
          />
        </div>

        <DeadStockIdentifier
          inventory={inventory}
          salesHistory={salesHistory}
          currentPrices={getCurrentPrices(inventory)}
        />
      </div>
    </PageLayout>
  );
}

// Helper functions
function getCurrentPrices(inventory) {
  return inventory.reduce((acc, item) => {
    acc[item.itemId] = item.price || 0;
    return acc;
  }, {});
}

function getItemCategories(inventory) {
  return inventory.reduce((acc, item) => {
    acc[item.itemId] = item.category || 'Uncategorized';
    return acc;
  }, {});
}
```

### 4. Add Route

In `/src/App.jsx` or your router config:

```jsx
import { InventoryPage } from './pages/InventoryPage';

// In your routes:
<Route path="/inventory" element={<InventoryPage />} />
```

## Data Management

### Storing Inventory Data

You have several options:

#### Option A: LocalStorage (Simple)

```javascript
// Save inventory
const saveInventory = (inventory) => {
  localStorage.setItem('evetrade_user_inventory', JSON.stringify(inventory));
};

// Load inventory
const loadInventory = () => {
  const saved = localStorage.getItem('evetrade_user_inventory');
  return saved ? JSON.parse(saved) : [];
};
```

#### Option B: API Integration

```javascript
// Fetch from backend
const fetchInventory = async (characterId) => {
  const response = await fetch(`/api/characters/${characterId}/inventory`);
  return await response.json();
};
```

#### Option C: EVE ESI API (Advanced)

```javascript
import { apiClient } from '../api/client';

const fetchCharacterAssets = async (characterId, accessToken) => {
  const response = await fetch(
    `https://esi.evetech.net/latest/characters/${characterId}/assets/`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    }
  );

  const assets = await response.json();

  // Transform ESI format to component format
  return assets.map(asset => ({
    itemId: asset.type_id,
    itemName: getTypeName(asset.type_id), // From SDE
    quantity: asset.quantity,
    location: asset.location_id,
  }));
};
```

### Recording Sales

Track sales automatically:

```javascript
// When user makes a sale
const recordSale = (itemId, quantity) => {
  const sale = {
    itemId,
    quantity,
    date: new Date().toISOString(),
    timestamp: Date.now(),
  };

  const salesHistory = JSON.parse(
    localStorage.getItem('evetrade_sales_history') || '[]'
  );

  salesHistory.push(sale);

  // Keep only last 90 days
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const filtered = salesHistory.filter(s => s.timestamp > ninetyDaysAgo);

  localStorage.setItem('evetrade_sales_history', JSON.stringify(filtered));
};
```

## UI Integration Tips

### As Dashboard Widgets

Add to your trading dashboard:

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {/* Stock Alerts - Compact View */}
  <div className="lg:col-span-1">
    <StockAlertPanel
      inventory={inventory.slice(0, 5)}
      className="h-full"
    />
  </div>

  {/* Quick Stats */}
  <div className="lg:col-span-2">
    <InventoryValuation
      inventory={inventory}
      currentPrices={currentPrices}
      itemCategories={itemCategories}
    />
  </div>
</div>
```

### As Modal/Sidebar

```jsx
import { useState } from 'react';
import { StockAlertPanel } from './components/inventory';

function TradingPage() {
  const [showInventory, setShowInventory] = useState(false);

  return (
    <>
      <button onClick={() => setShowInventory(true)}>
        View Inventory
      </button>

      {showInventory && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-space-dark p-6 overflow-auto">
            <button onClick={() => setShowInventory(false)}>Close</button>
            <StockAlertPanel inventory={inventory} />
          </div>
        </div>
      )}
    </>
  );
}
```

### Inline in Trading Tables

Add alerts to your trading results:

```jsx
import { useStockAlerts } from './hooks/useStockAlerts';

function TradingTable({ items }) {
  const { getAlert } = useStockAlerts();

  return (
    <table>
      {items.map(item => {
        const alert = getAlert(item.itemId);
        const isLow = alert && item.quantity <= alert.threshold;

        return (
          <tr key={item.itemId} className={isLow ? 'bg-accent-gold/10' : ''}>
            <td>{item.itemName}</td>
            <td>{item.quantity}</td>
            {isLow && <td className="text-accent-gold">LOW STOCK</td>}
          </tr>
        );
      })}
    </table>
  );
}
```

## Advanced Features

### Auto-sync with Trading Results

Update inventory when trades are made:

```jsx
import { useState, useEffect } from 'react';

function StationTradingPage() {
  const [inventory, setInventory] = useState([]);

  const handleTradeResult = (results) => {
    // Update inventory based on trade recommendations
    const updatedInventory = results.map(trade => ({
      itemId: trade.type_id,
      itemName: trade.type_name,
      quantity: 0, // User will input actual quantity
      price: trade.sell,
      buyPrice: trade.buy,
      profitPerUnit: trade.sell - trade.buy,
      category: trade.market_group_name,
    }));

    setInventory(prev => mergeInventory(prev, updatedInventory));
    localStorage.setItem('evetrade_user_inventory', JSON.stringify(inventory));
  };

  return (
    <TradingForm onResults={handleTradeResult} />
  );
}
```

### Multi-Character Support

Track inventory for multiple characters:

```jsx
const [selectedCharacter, setSelectedCharacter] = useState('main');
const [inventories, setInventories] = useState({
  main: [],
  alt1: [],
  alt2: [],
});

<InventoryValuation
  inventory={inventories[selectedCharacter]}
  currentPrices={currentPrices}
  itemCategories={itemCategories}
/>
```

### Export Integration

Add inventory data to your existing export features:

```jsx
import { formatISK } from '../utils/formatters';

const exportFullReport = () => {
  const inventoryValue = calculateTotalValue(inventory);

  const report = {
    timestamp: new Date().toISOString(),
    inventory: {
      items: inventory.length,
      totalValue: inventoryValue,
      items: inventory,
    },
    sales: {
      last30Days: salesHistory.filter(/* ... */),
      revenue: calculateRevenue(salesHistory),
    },
  };

  downloadJSON(report, 'trading-report.json');
};
```

## Styling Customization

### Custom Color Schemes

Override the default colors:

```jsx
<StockAlertPanel
  inventory={inventory}
  className="[&_.text-accent-cyan]:text-blue-500 [&_.bg-accent-cyan]:bg-blue-500"
/>
```

### Dark/Light Mode

Components use Tailwind's dark mode classes. Ensure your theme provider is configured:

```jsx
// In your ThemeContext or root component
<div className={isDark ? 'dark' : ''}>
  <InventoryValuation {...props} />
</div>
```

## Troubleshooting

### Browser Notifications Not Working

```javascript
// Check permission status
console.log(Notification.permission);

// Request manually
const permission = await Notification.requestPermission();
if (permission !== 'granted') {
  alert('Please enable notifications in browser settings');
}
```

### LocalStorage Quota Exceeded

```javascript
// Clear old data
const clearOldData = () => {
  // Keep only essential data
  const inventory = localStorage.getItem('evetrade_user_inventory');
  localStorage.clear();
  localStorage.setItem('evetrade_user_inventory', inventory);
};
```

### Performance with Large Datasets

```javascript
// Paginate large inventories
const [page, setPage] = useState(0);
const pageSize = 50;
const paginatedInventory = inventory.slice(page * pageSize, (page + 1) * pageSize);

<InventoryValuation inventory={paginatedInventory} />
```

## Next Steps

1. View the demo: `/inventory-demo`
2. Check the README for detailed API docs
3. Customize styling to match your theme
4. Integrate with your data sources
5. Add to your navigation

Happy trading! o7
