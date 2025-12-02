# RegionalArbitrage Component Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGIONAL ARBITRAGE OPPORTUNITIES              │
│                    Tritanium - Compare prices across major       │
│                    trade hubs                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ⭐ BEST ARBITRAGE ROUTE                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  BUY FROM              │  SELL TO                          │  │
│  │  Jita                  │  Amarr                            │  │
│  │  The Forge             │  Domain                           │  │
│  │  5.50 ISK             │  6.25 ISK                         │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  Profit/Unit: 0.75 ISK │ ROI: 13.6% │ Distance: 24 jumps │  │
│  │  [ Select This Route ]                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  HUB PRICE COMPARISON                                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Trade Hub      │ Best Buy Price │ Best Sell │ Daily Vol. │  │
│  ├────────────────┼────────────────┼───────────┼────────────┤  │
│  │ Jita           │ 5.50 ISK ★    │ 6.10 ISK  │ 125,000    │  │
│  │ The Forge      │                │           │            │  │
│  ├────────────────┼────────────────┼───────────┼────────────┤  │
│  │ Amarr          │ 5.75 ISK      │ 6.25 ISK ★│ 85,000     │  │
│  │ Domain         │                │           │            │  │
│  ├────────────────┼────────────────┼───────────┼────────────┤  │
│  │ Dodixie        │ 5.60 ISK      │ 6.15 ISK  │ 45,000     │  │
│  │ Sinq Laison    │                │           │            │  │
│  ├────────────────┼────────────────┼───────────┼────────────┤  │
│  │ Rens           │ 5.65 ISK      │ 6.20 ISK  │ 30,000     │  │
│  │ Heimatar       │                │           │            │  │
│  ├────────────────┼────────────────┼───────────┼────────────┤  │
│  │ Hek            │ 5.70 ISK      │ 6.18 ISK  │ 22,000     │  │
│  │ Metropolis     │                │           │            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ALL ARBITRAGE ROUTES (4)                                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Jita → Rens (22 jumps)                    13.1% ROI      │  │
│  │ Buy: 5.50  Sell: 6.20  Profit: 0.70 ISK                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Jita → Hek (20 jumps)                     12.4% ROI      │  │
│  │ Buy: 5.50  Sell: 6.18  Profit: 0.68 ISK                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Jita → Dodixie (26 jumps)                 11.8% ROI      │  │
│  │ Buy: 5.50  Sell: 6.15  Profit: 0.65 ISK                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  💡 Trading Tips: Consider cargo capacity, hauling costs,       │
│  and route safety. High-value cargo through low-sec requires    │
│  escorts. Always verify current market prices before committing │
│  to large trades.                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
RegionalArbitrage
├── GlassmorphicCard (container)
│   ├── Header Section
│   │   ├── Title (h3)
│   │   └── Item description (p)
│   │
│   ├── Best Route Highlight (conditional)
│   │   ├── Route header with star
│   │   ├── Buy/Sell comparison grid
│   │   │   ├── Buy hub details
│   │   │   └── Sell hub details
│   │   ├── Profit metrics grid
│   │   │   ├── Profit per unit
│   │   │   ├── ROI percentage
│   │   │   └── Jump distance
│   │   └── Select button (conditional)
│   │
│   ├── Hub Comparison Table
│   │   ├── Table header
│   │   └── Table body (5 hub rows)
│   │       ├── Hub name + region
│   │       ├── Best buy price (with star for best)
│   │       ├── Best sell price (with star for best)
│   │       └── Daily volume
│   │
│   ├── All Routes List (conditional)
│   │   ├── Section header
│   │   └── Route cards (scrollable)
│   │       └── Each route card
│   │           ├── Hub to hub with jumps
│   │           ├── ROI badge
│   │           └── Price details
│   │
│   └── Trading Tips Section
│       └── Info box with advice
│
├── Loading State (conditional)
│   └── LoadingSpinner + message
│
├── Error State (conditional)
│   └── Error message card
│
└── No Data State (conditional)
    └── Empty state message
```

## State Flow

```
User provides itemId prop
        ↓
Component mounts / itemId changes
        ↓
useEffect triggers
        ↓
Fetch market data for all 5 hubs
        ↓
Parse orders (buy/sell separation)
        ↓
Calculate best prices per hub
        ↓
useMemo calculates arbitrage opportunities
        ↓
Sort by profit (descending)
        ↓
Render UI with data
        ↓
User clicks route / select button
        ↓
onSelect callback fires (if provided)
```

## Data Transformation Flow

```
ESI API Response
└── Array of market orders
    ├── Filter by station ID
    ├── Separate buy/sell orders
    └── Calculate best prices
        └── hubsData array

hubsData + calculateArbitrageOpportunities
└── For each hub pair:
    ├── Calculate profit per unit
    ├── Calculate ROI
    ├── Get jump distance
    └── Create opportunity object
        └── opportunities array

opportunities (sorted by profit)
├── bestOpportunity = opportunities[0]
├── Render best route highlight
├── Render comparison table
└── Render additional routes list
```

## Color Scheme

```
┌─────────────────────────────────────────────┐
│ Component Type      │ Color                 │
├─────────────────────┼───────────────────────┤
│ Headers             │ accent-cyan           │
│ Best Buy Price      │ green-400             │
│ Best Sell Price     │ accent-gold           │
│ Profit Values       │ green-400             │
│ Primary Text        │ text-primary          │
│ Secondary Text      │ text-secondary        │
│ Borders             │ accent-cyan/20-30     │
│ Backgrounds         │ space-dark/30-60      │
│ Highlights          │ green-500/20          │
│ Interactive Hover   │ accent-cyan/30        │
└─────────────────────────────────────────────┘
```

## Responsive Behavior

- **Desktop**: Full width layout with 2-3 column grids
- **Tablet**: Stacked columns, scrollable table
- **Mobile**: Single column, condensed table view

## Key Features Visualization

### Star Indicators (★)
- Marks the best buy price (lowest sell order)
- Marks the best sell price (highest buy order)
- Helps users quickly identify optimal hubs

### Profit Highlighting
- Green backgrounds for best route
- Green text for profit values
- Gold accents for ROI metrics

### Interactive Elements
- Clickable route cards (when onSelect provided)
- Hover effects on interactive elements
- Select button for best route

### Information Density
- Compact table for quick scanning
- Expandable details for all routes
- Tooltips and labels for clarity

## Integration Points

The component integrates with:
1. **ESI API** - Market data fetching
2. **Formatters** - Number/currency formatting
3. **Constants** - Trade hub definitions
4. **Theme System** - Consistent styling
5. **Parent Components** - Route selection callbacks
