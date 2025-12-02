# Inventory Management Features - Implementation Summary

This document provides an overview of the 4 new inventory management features added to EVETrade.

## Features Implemented

### 1. Stock Level Alerts
**Files:**
- `/src/hooks/useStockAlerts.jsx` - React hook for managing alerts
- `/src/components/inventory/StockAlertPanel.jsx` - UI component

**Capabilities:**
- Set minimum stock thresholds per item
- Browser notifications when stock is low
- Visual warnings in the UI
- localStorage persistence
- Throttled notifications (max once per hour per item)

**Usage:**
```jsx
import { StockAlertPanel } from './components/inventory';

<StockAlertPanel
  inventory={[
    { itemId: 34, itemName: 'Tritanium', quantity: 15000 }
  ]}
/>
```

### 2. Restock Suggestions
**File:** `/src/components/inventory/RestockSuggestions.jsx`

**Capabilities:**
- Sales velocity calculation (items sold per day)
- Days of stock remaining
- Recommended restock quantities based on target days
- Priority scoring (urgency + profit potential)
- ISK needed calculations
- CSV export

**Usage:**
```jsx
import { RestockSuggestions } from './components/inventory';

<RestockSuggestions
  inventory={inventory}
  salesHistory={[
    { itemId: 34, quantity: 5000, date: new Date() }
  ]}
/>
```

### 3. Dead Stock Identifier
**File:** `/src/components/inventory/DeadStockIdentifier.jsx`

**Capabilities:**
- Identifies items unsold for X days (configurable, default 7)
- Shows days since last sale
- Calculates ISK tied up in dead stock
- Opportunity cost calculation
- Suggests actions: Reprice, Move, or Liquidate
- Sortable by various metrics
- CSV export

**Usage:**
```jsx
import { DeadStockIdentifier } from './components/inventory';

<DeadStockIdentifier
  inventory={inventory}
  salesHistory={salesHistory}
  currentPrices={{ 34: 5.5, 35: 12.0 }}
/>
```

### 4. Inventory Valuation
**File:** `/src/components/inventory/InventoryValuation.jsx`

**Capabilities:**
- Total portfolio value calculation
- Value breakdown by item category
- Interactive pie chart visualization
- Value change tracking over time
- Historical snapshots (auto-saved to localStorage)
- Expandable category details
- CSV export with full report

**Usage:**
```jsx
import { InventoryValuation } from './components/inventory';

<InventoryValuation
  inventory={inventory}
  currentPrices={currentPrices}
  itemCategories={{ 34: 'Minerals', 35: 'Minerals' }}
/>
```

## Files Created

### Core Components
1. `/src/hooks/useStockAlerts.jsx` - Stock alerts hook
2. `/src/components/inventory/StockAlertPanel.jsx` - Stock alerts UI
3. `/src/components/inventory/RestockSuggestions.jsx` - Restock analyzer
4. `/src/components/inventory/DeadStockIdentifier.jsx` - Dead stock finder
5. `/src/components/inventory/InventoryValuation.jsx` - Portfolio valuation
6. `/src/components/inventory/index.js` - Export barrel file

### Documentation & Examples
7. `/src/components/inventory/README.md` - Comprehensive API docs
8. `/src/components/inventory/INTEGRATION.md` - Integration guide
9. `/src/components/inventory/InventoryManagementDemo.jsx` - Working demo with sample data

### Testing
10. `/src/components/inventory/StockAlertPanel.test.jsx` - Unit tests

## Quick Start

### View the Demo

The easiest way to see all features:

1. Import the demo component in your router:
```jsx
import { InventoryManagementDemo } from './components/inventory/InventoryManagementDemo';
```

2. Add a route:
```jsx
<Route path="/inventory-demo" element={<InventoryManagementDemo />} />
```

3. Visit `/inventory-demo` in your browser

### Production Integration

See `/src/components/inventory/INTEGRATION.md` for detailed integration steps including:
- Creating a real inventory page
- Data management strategies
- LocalStorage, API, or ESI integration
- UI integration patterns
- Advanced features

## Technical Details

### Dependencies
- React 19+
- Tailwind CSS (already in project)
- Existing EVETrade utilities (formatters, components)

### Browser APIs Used
- **Notification API** - For stock alerts (gracefully degrades if not supported)
- **LocalStorage** - For persistence (alerts, valuation history)

### Data Persistence
- `evetrade_stock_alerts` - Alert configurations
- `evetrade_valuation_history` - Historical value snapshots (max 100)

### Performance
- All components use React.useMemo for expensive calculations
- Recommended for inventories up to 1000 items
- Consider pagination for larger datasets
- CSV exports handle any size

## Key Features

### Stock Alerts
- ✅ Configurable thresholds per item
- ✅ Browser notifications
- ✅ Visual warnings
- ✅ LocalStorage persistence
- ✅ Notification throttling

### Restock Suggestions
- ✅ Velocity-based calculations
- ✅ Configurable target days
- ✅ Priority scoring
- ✅ ISK needed estimates
- ✅ Multiple sort options
- ✅ CSV export

### Dead Stock Identifier
- ✅ Configurable staleness threshold
- ✅ ISK tied up tracking
- ✅ Opportunity cost calculation
- ✅ Action suggestions
- ✅ Multiple sort options
- ✅ CSV export

### Inventory Valuation
- ✅ Real-time value calculation
- ✅ Category breakdown
- ✅ Interactive pie chart
- ✅ Value change tracking
- ✅ Historical snapshots
- ✅ Expandable details
- ✅ CSV export

## Styling

All components use the EVETrade theme:
- Space-themed dark colors
- Cyan, gold, and purple accents
- Glassmorphic card design
- Responsive layouts
- Smooth animations

Custom styling is supported via className prop.

## Testing

Unit tests included for StockAlertPanel. Tests cover:
- Empty states
- Data rendering
- User interactions
- LocalStorage persistence
- Edge cases
- Error handling

Run tests:
```bash
npm test
```

## Next Steps

1. **Try the Demo** - Visit `/inventory-demo` to see features in action
2. **Review Documentation** - Read `/src/components/inventory/README.md`
3. **Integration** - Follow `/src/components/inventory/INTEGRATION.md`
4. **Customize** - Adapt styling and data sources to your needs
5. **Extend** - Add ESI integration, webhooks, or advanced analytics

## Data Format Reference

### Inventory
```javascript
[
  {
    itemId: number | string,    // EVE type ID
    itemName: string,            // Display name
    quantity: number,            // Current stock
    price: number,               // Sell price
    buyPrice: number,            // Cost to buy
    profitPerUnit: number,       // Margin per item
    category: string,            // Category name
  }
]
```

### Sales History
```javascript
[
  {
    itemId: number | string,
    quantity: number,
    date: Date | string,         // ISO string
    timestamp: number,           // Unix timestamp
  }
]
```

### Current Prices
```javascript
{
  [itemId]: number  // Price per unit
}
```

### Item Categories
```javascript
{
  [itemId]: string  // Category name
}
```

## Support & Contributions

For questions, issues, or feature requests:
- Check the README and INTEGRATION docs
- Review the demo component source code
- Open an issue on the main EVETrade repository

## License

Part of the EVETrade project. See main repository for license.

---

**Built with:** React 19, Tailwind CSS, and love for New Eden traders o7
