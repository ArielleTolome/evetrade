# Inventory Management Components

A comprehensive suite of React components for managing EVE Online trading inventory. These components help traders track stock levels, optimize restocking, identify dead stock, and monitor portfolio value.

## Components

### 1. StockAlertPanel

Manages stock level thresholds and sends browser notifications when inventory drops below configured levels.

**Features:**
- Set custom stock thresholds per item
- Browser notifications for low stock (requires permission)
- Visual warnings for items below threshold
- Configurable alerts with localStorage persistence
- Throttled notifications (max once per hour per item)

**Props:**
```jsx
<StockAlertPanel
  inventory={[
    { itemId: 34, itemName: 'Tritanium', quantity: 15000 },
    // ... more items
  ]}
  className="mt-6"
/>
```

**Data Format:**
```javascript
inventory = [
  {
    itemId: number | string,    // Unique item type ID
    itemName: string,            // Display name
    quantity: number,            // Current stock quantity
  }
]
```

**Hook Usage:**
```javascript
import { useStockAlerts } from '../../hooks/useStockAlerts';

const {
  alerts,                        // Array of configured alerts
  setThreshold,                  // (itemId, itemName, threshold) => void
  removeThreshold,               // (itemId) => void
  checkStockLevels,              // (inventory) => lowStockItems[]
  requestNotificationPermission, // () => Promise<boolean>
  notificationPermission,        // 'granted' | 'denied' | 'default'
} = useStockAlerts();
```

**LocalStorage Keys:**
- `evetrade_stock_alerts` - Alert configurations

---

### 2. RestockSuggestions

Analyzes sales velocity and recommends restock quantities based on target days of inventory.

**Features:**
- Sales velocity calculation (items/day)
- Days of stock remaining
- Recommended restock quantities
- Priority scoring (urgency + profit)
- ISK needed calculations
- CSV export

**Props:**
```jsx
<RestockSuggestions
  inventory={inventory}
  salesHistory={[
    { itemId: 34, quantity: 5000, date: new Date(), timestamp: Date.now() },
    // ... more sales
  ]}
  className="mt-6"
/>
```

**Data Format:**
```javascript
inventory = [
  {
    itemId: number | string,
    itemName: string,
    quantity: number,
    price: number,              // Current sell price
    buyPrice: number,           // Cost to restock
    profitPerUnit: number,      // Profit margin per unit
  }
]

salesHistory = [
  {
    itemId: number | string,
    quantity: number,           // Units sold
    date: Date | string,        // Sale date (ISO string or Date)
    timestamp: number,          // Alternative: Unix timestamp
  }
]
```

**Calculations:**
- **Velocity:** `totalSold / daysCovered`
- **Days Remaining:** `currentStock / velocity`
- **Recommended Restock:** `(velocity × targetDays) - currentStock`
- **Priority Score:** `(urgencyScore × 0.6) + (profitScore × 0.4) × 100`

---

### 3. DeadStockIdentifier

Identifies items that haven't sold recently and suggests actions to free up capital.

**Features:**
- Configurable dead stock threshold (default 7 days)
- ISK tied up calculation
- Opportunity cost analysis
- Suggested actions (Reprice, Move, Liquidate)
- Sortable by ISK value, days stale, or quantity
- CSV export

**Props:**
```jsx
<DeadStockIdentifier
  inventory={inventory}
  salesHistory={salesHistory}
  currentPrices={{
    34: 5.5,      // itemId: price
    35: 12.0,
  }}
  className="mt-6"
/>
```

**Data Format:**
```javascript
currentPrices = {
  [itemId: string | number]: number  // Current market price
}
```

**Action Logic:**
- **No sales history** → Liquidate
- **No sales for 2× threshold** → Move to Different Market
- **No sales for 1.5× threshold** → Reprice Aggressively
- **No sales for 1× threshold** → Reprice

**Opportunity Cost:**
- Assumes 5% daily return as baseline trading opportunity
- `opportunityCost = iskTiedUp × 0.05 × min(daysSinceLastSale, 30)`

---

### 4. InventoryValuation

Calculates total inventory value and tracks changes over time with category breakdown and visualization.

**Features:**
- Total portfolio value calculation
- Category breakdown with pie chart
- Value change tracking over time
- Automatic snapshot saving (localStorage)
- Expandable category details
- CSV export with full report

**Props:**
```jsx
<InventoryValuation
  inventory={inventory}
  currentPrices={currentPrices}
  itemCategories={{
    34: 'Minerals',
    35: 'Minerals',
    11399: 'Ore',
  }}
  className="mt-6"
/>
```

**Data Format:**
```javascript
itemCategories = {
  [itemId: string | number]: string  // Category name
}
```

**LocalStorage Keys:**
- `evetrade_valuation_history` - Historical value snapshots (max 100)

**Snapshot Conditions:**
- Value change > 1% OR
- Time since last snapshot > 1 hour

**Chart:**
- SVG-based donut chart
- Color-coded categories
- Hover effects
- Responsive legend

---

## Installation

All components are self-contained within `/src/components/inventory/` and have minimal dependencies:

**Required:**
- React 19+
- Existing EVETrade utilities (`formatters.js`)
- Existing components (`GlassmorphicCard`, `LoadingSpinner`)

**Import:**
```javascript
// Individual imports
import { StockAlertPanel } from './components/inventory/StockAlertPanel';
import { RestockSuggestions } from './components/inventory/RestockSuggestions';
import { DeadStockIdentifier } from './components/inventory/DeadStockIdentifier';
import { InventoryValuation } from './components/inventory/InventoryValuation';

// Or use the index
import {
  StockAlertPanel,
  RestockSuggestions,
  DeadStockIdentifier,
  InventoryValuation,
} from './components/inventory';

// Hook
import { useStockAlerts } from './hooks/useStockAlerts';
```

---

## Usage Example

See `/src/components/inventory/InventoryManagementDemo.jsx` for a complete working example with sample data.

```jsx
import { useState } from 'react';
import {
  StockAlertPanel,
  RestockSuggestions,
  DeadStockIdentifier,
  InventoryValuation,
} from './components/inventory';

function InventoryPage() {
  const [inventory, setInventory] = useState([/* ... */]);
  const [salesHistory, setSalesHistory] = useState([/* ... */]);
  const [currentPrices, setCurrentPrices] = useState({/* ... */});
  const [itemCategories, setItemCategories] = useState({/* ... */});

  return (
    <div className="space-y-6">
      <InventoryValuation
        inventory={inventory}
        currentPrices={currentPrices}
        itemCategories={itemCategories}
      />

      <StockAlertPanel inventory={inventory} />

      <RestockSuggestions
        inventory={inventory}
        salesHistory={salesHistory}
      />

      <DeadStockIdentifier
        inventory={inventory}
        salesHistory={salesHistory}
        currentPrices={currentPrices}
      />
    </div>
  );
}
```

---

## Data Integration

### Getting Inventory Data

From EVE Online ESI API:
```javascript
// Character Assets
GET /characters/{character_id}/assets/

// Market Orders (active sell orders)
GET /characters/{character_id}/orders/
```

### Getting Sales History

From transaction journal:
```javascript
// Wallet Transactions
GET /characters/{character_id}/wallet/transactions/
```

### Getting Current Prices

From market data:
```javascript
// Market Prices
GET /markets/{region_id}/orders/
```

### Sample Data Transformation

```javascript
// Transform ESI assets to inventory format
const inventory = assets
  .filter(asset => asset.location_type === 'station')
  .map(asset => ({
    itemId: asset.type_id,
    itemName: typeNames[asset.type_id], // From SDE
    quantity: asset.quantity,
    price: marketPrices[asset.type_id]?.sell || 0,
    buyPrice: marketPrices[asset.type_id]?.buy || 0,
    profitPerUnit: (marketPrices[asset.type_id]?.sell || 0) -
                   (marketPrices[asset.type_id]?.buy || 0),
  }));

// Transform ESI transactions to sales history
const salesHistory = transactions
  .filter(tx => tx.is_buy === false) // Sells only
  .map(tx => ({
    itemId: tx.type_id,
    quantity: tx.quantity,
    date: tx.date,
    timestamp: new Date(tx.date).getTime(),
  }));
```

---

## Styling

All components use Tailwind CSS with the EVETrade theme:

**Theme Colors:**
- `accent-cyan` (#00d4ff) - Primary actions, highlights
- `accent-gold` (#ffd700) - Warnings, important values
- `accent-purple` (#8b5cf6) - Secondary highlights
- `space-black` (#0a0a0f) - Background
- `space-dark` (#1a1a2e) - Surface
- `space-mid` (#16213e) - Containers
- `text-primary` (#e2e8f0) - Primary text
- `text-secondary` (#94a3b8) - Secondary text

**Customization:**
Pass custom className props to override or extend styles:
```jsx
<StockAlertPanel
  inventory={inventory}
  className="mt-8 shadow-2xl"
/>
```

---

## Browser Compatibility

**Stock Alerts Notifications:**
- Requires `Notification` API support
- Chrome 22+, Firefox 22+, Safari 7+, Edge 14+
- Gracefully degrades if not supported

**LocalStorage:**
- Required for persistence
- All modern browsers supported
- ~5MB storage limit per origin

---

## Performance Considerations

**Large Inventories:**
- Components use `useMemo` for expensive calculations
- Recommend pagination or virtualization for 1000+ items
- CSV exports handle any size

**Sales History:**
- Keep last 90 days for best performance
- Archive older data if needed
- Consider server-side calculation for massive datasets

**LocalStorage:**
- Valuation history limited to 100 snapshots
- Automatically prunes old data
- Consider IndexedDB for larger datasets

---

## Testing

Components accept prop data, making them easy to test:

```javascript
import { render, screen } from '@testing-library/react';
import { StockAlertPanel } from './StockAlertPanel';

test('shows empty state with no inventory', () => {
  render(<StockAlertPanel inventory={[]} />);
  expect(screen.getByText(/no inventory data/i)).toBeInTheDocument();
});

test('displays inventory items', () => {
  const inventory = [
    { itemId: 34, itemName: 'Tritanium', quantity: 15000 },
  ];
  render(<StockAlertPanel inventory={inventory} />);
  expect(screen.getByText('Tritanium')).toBeInTheDocument();
});
```

---

## Future Enhancements

Potential additions:
- [ ] Integration with ESI API for live data
- [ ] Email/Discord webhook notifications
- [ ] Historical price tracking
- [ ] ROI analysis per item
- [ ] Batch restock order generation
- [ ] Multi-character inventory aggregation
- [ ] Advanced charting with recharts/visx
- [ ] Export to Google Sheets
- [ ] Predictive analytics (seasonal trends)
- [ ] Restock optimization algorithms

---

## License

Part of the EVETrade project. See main repository for license details.

---

## Support

For issues or questions:
1. Check the demo component for usage examples
2. Review prop types and data formats above
3. Open an issue on the main EVETrade repository
