# Inventory Management - Component Map

Visual guide to understand the structure and relationships of inventory components.

## Directory Structure

```
src/
├── hooks/
│   └── useStockAlerts.jsx                  (172 lines)
│       ├── State management for stock alerts
│       ├── Browser notification handling
│       └── localStorage persistence
│
└── components/
    └── inventory/
        ├── index.js                         (12 lines)
        │   └── Barrel export file
        │
        ├── StockAlertPanel.jsx              (293 lines)
        │   ├── Uses: useStockAlerts hook
        │   ├── Displays: Alert configuration UI
        │   └── Features: Notifications, thresholds
        │
        ├── RestockSuggestions.jsx           (380 lines)
        │   ├── Analyzes: Sales velocity
        │   ├── Calculates: Restock quantities
        │   └── Features: Priority scoring, CSV export
        │
        ├── DeadStockIdentifier.jsx          (441 lines)
        │   ├── Identifies: Unsold items
        │   ├── Calculates: Opportunity cost
        │   └── Features: Action suggestions, CSV export
        │
        ├── InventoryValuation.jsx           (504 lines)
        │   ├── Calculates: Portfolio value
        │   ├── Visualizes: Pie chart
        │   └── Features: Historical tracking, CSV export
        │
        ├── InventoryManagementDemo.jsx      (264 lines)
        │   ├── Uses: All 4 components
        │   ├── Provides: Sample data
        │   └── Purpose: Demo & integration example
        │
        ├── StockAlertPanel.test.jsx         (221 lines)
        │   └── Unit tests for StockAlertPanel
        │
        ├── README.md                         (450 lines)
        │   └── Comprehensive API documentation
        │
        ├── INTEGRATION.md                    (465 lines)
        │   └── Integration guide & examples
        │
        └── COMPONENT_MAP.md                  (this file)
            └── Visual structure guide
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                   InventoryManagementDemo                │
│                    (Demo Container)                      │
└────────┬────────────┬────────────┬────────────┬─────────┘
         │            │            │            │
         ▼            ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
    │ Stock  │  │Restock │  │  Dead  │  │Inventory│
    │ Alert  │  │Suggest │  │ Stock  │  │Valuation│
    │ Panel  │  │ -ions  │  │ Ident. │  │         │
    └────┬───┘  └────────┘  └────────┘  └────────┘
         │
         ▼
    ┌─────────────┐
    │useStockAlerts│
    │   (Hook)     │
    └─────────────┘
```

## Data Flow

```
┌──────────────┐
│ User Data    │
│ Sources      │
└──────┬───────┘
       │
       ├─── Inventory Data ────────┐
       │    (items, quantities)     │
       │                            │
       ├─── Sales History ──────────┤
       │    (transactions)          │
       │                            │
       └─── Market Prices ──────────┤
            (current values)        │
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────┐
│                    Component Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Stock   │  │ Restock  │  │   Dead   │  │Inventory │  │
│  │  Alerts  │  │Suggestions│  │  Stock   │  │Valuation │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────┐
│                  Persistence Layer                         │
│                                                            │
│  localStorage:                                             │
│  • evetrade_stock_alerts                                   │
│  • evetrade_valuation_history                             │
│                                                            │
│  Browser APIs:                                             │
│  • Notification API (alerts)                               │
└───────────────────────────────────────────────────────────┘
```

## Feature Dependencies

### Stock Alert Panel
```
StockAlertPanel.jsx
├── Depends on:
│   ├── useStockAlerts (hook)
│   ├── GlassmorphicCard (common)
│   ├── LoadingSpinner (common)
│   └── formatNumber (utils)
│
├── Uses Browser APIs:
│   ├── Notification API
│   └── localStorage
│
└── Outputs:
    ├── Visual alerts
    └── Browser notifications
```

### Restock Suggestions
```
RestockSuggestions.jsx
├── Depends on:
│   ├── GlassmorphicCard (common)
│   ├── formatNumber (utils)
│   └── formatISK (utils)
│
├── Calculations:
│   ├── Sales velocity
│   ├── Days remaining
│   ├── Priority score
│   └── ISK requirements
│
└── Outputs:
    ├── Restock recommendations
    └── CSV export
```

### Dead Stock Identifier
```
DeadStockIdentifier.jsx
├── Depends on:
│   ├── GlassmorphicCard (common)
│   ├── formatNumber (utils)
│   ├── formatISK (utils)
│   └── formatRelativeTime (utils)
│
├── Calculations:
│   ├── Days since last sale
│   ├── ISK tied up
│   ├── Opportunity cost
│   └── Action suggestions
│
└── Outputs:
    ├── Dead stock list
    └── CSV export
```

### Inventory Valuation
```
InventoryValuation.jsx
├── Depends on:
│   ├── GlassmorphicCard (common)
│   ├── formatNumber (utils)
│   ├── formatISK (utils)
│   └── formatPercent (utils)
│
├── Uses localStorage:
│   └── evetrade_valuation_history
│
├── Calculations:
│   ├── Total portfolio value
│   ├── Category breakdown
│   ├── Value changes
│   └── Avg value per item
│
├── Visualization:
│   └── SVG pie chart (built-in)
│
└── Outputs:
    ├── Valuation dashboard
    ├── Historical snapshots
    └── CSV export
```

## Shared Dependencies

All components share these common dependencies:

```
Common Dependencies:
├── React 19+ (hooks, state)
├── Tailwind CSS (styling)
├── GlassmorphicCard (UI container)
├── Formatter utilities
│   ├── formatNumber()
│   ├── formatISK()
│   ├── formatPercent()
│   └── formatRelativeTime()
└── EVETrade theme colors
    ├── accent-cyan
    ├── accent-gold
    ├── accent-purple
    ├── space-black
    ├── space-dark
    └── text-primary/secondary
```

## Import Paths

### Using Individual Components
```javascript
import { StockAlertPanel } from './components/inventory/StockAlertPanel';
import { RestockSuggestions } from './components/inventory/RestockSuggestions';
import { DeadStockIdentifier } from './components/inventory/DeadStockIdentifier';
import { InventoryValuation } from './components/inventory/InventoryValuation';
import { useStockAlerts } from './hooks/useStockAlerts';
```

### Using Barrel Export
```javascript
import {
  StockAlertPanel,
  RestockSuggestions,
  DeadStockIdentifier,
  InventoryValuation,
} from './components/inventory';

import { useStockAlerts } from './hooks/useStockAlerts';
```

## State Management

### Component-Level State
Each component manages its own internal state:
- UI controls (sort order, filters, tabs)
- Form inputs
- Loading states
- Error states

### Hook State (useStockAlerts)
Centralized state for stock alerts:
- Alert configurations
- Last alerted timestamps
- Notification permissions

### Persistent State (localStorage)
Data that survives page refreshes:
- `evetrade_stock_alerts` - Alert thresholds and settings
- `evetrade_valuation_history` - Historical value snapshots

### Prop Data (User-Provided)
Data passed from parent components:
- `inventory` - Current inventory items
- `salesHistory` - Transaction records
- `currentPrices` - Market price data
- `itemCategories` - Category mappings

## Component Sizes

```
Lines of Code:
┌──────────────────────────┬───────┐
│ Component                │ Lines │
├──────────────────────────┼───────┤
│ InventoryValuation       │  504  │ ⬛⬛⬛⬛⬛⬛
│ DeadStockIdentifier      │  441  │ ⬛⬛⬛⬛⬛
│ RestockSuggestions       │  380  │ ⬛⬛⬛⬛
│ StockAlertPanel          │  293  │ ⬛⬛⬛
│ InventoryManagementDemo  │  264  │ ⬛⬛⬛
│ StockAlertPanel.test     │  221  │ ⬛⬛
│ useStockAlerts           │  172  │ ⬛⬛
│ index.js                 │   12  │ ⬛
└──────────────────────────┴───────┘
Total: 2,287 lines of code
```

## Documentation Sizes

```
Documentation:
┌──────────────────────────┬───────┐
│ File                     │ Lines │
├──────────────────────────┼───────┤
│ INTEGRATION.md           │  465  │ ⬛⬛⬛⬛⬛⬛
│ README.md                │  450  │ ⬛⬛⬛⬛⬛
│ COMPONENT_MAP.md         │   ?   │ (this file)
└──────────────────────────┴───────┘
```

## Testing Coverage

```
Tests:
├── StockAlertPanel.test.jsx (221 lines)
│   ├── Empty states
│   ├── Data rendering
│   ├── User interactions
│   ├── LocalStorage persistence
│   ├── Edge cases
│   └── Error handling
│
└── Future tests to add:
    ├── RestockSuggestions.test.jsx
    ├── DeadStockIdentifier.test.jsx
    ├── InventoryValuation.test.jsx
    └── useStockAlerts.test.jsx
```

## File Organization Best Practices

✅ **Good:**
- All inventory features in `/inventory/` directory
- Shared hook in `/hooks/`
- Comprehensive documentation
- Working demo with sample data
- Unit tests included

✅ **Follows EVETrade Patterns:**
- Uses GlassmorphicCard for containers
- Consistent Tailwind styling
- Formatter utilities
- Loading/error states
- Export functionality

## Quick Reference

| Feature | File | Lines | Key Props |
|---------|------|-------|-----------|
| Stock Alerts | StockAlertPanel.jsx | 293 | inventory |
| Restock | RestockSuggestions.jsx | 380 | inventory, salesHistory |
| Dead Stock | DeadStockIdentifier.jsx | 441 | inventory, salesHistory, currentPrices |
| Valuation | InventoryValuation.jsx | 504 | inventory, currentPrices, itemCategories |

## Next Steps

1. ✅ Components created
2. ✅ Documentation written
3. ✅ Demo page built
4. ✅ Tests started
5. ⏳ Integration into main app
6. ⏳ Additional tests
7. ⏳ ESI API integration
8. ⏳ Production deployment

---

**Total Investment:**
- 2,287 lines of component code
- 915+ lines of documentation
- 221 lines of tests
- **3,423+ lines total**
