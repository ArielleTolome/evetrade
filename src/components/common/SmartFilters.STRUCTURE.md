# SmartFilters Component Structure

## Visual Component Tree

```
SmartFilters
├── Header Section (Always Visible)
│   ├── Expand/Collapse Icon (chevron)
│   ├── Title "Smart Filters"
│   ├── Active Filter Badge (conditional)
│   └── Reset All Button
│
├── Quick Toggles Section (Always Visible)
│   ├── Hide Scams Button
│   ├── Hide Low Volume Button
│   ├── High Quality Only Button
│   └── Verified Only Button
│
└── Expanded Section (Collapsible)
    ├── Preset Filters Section
    │   ├── Safe Trades Button (green)
    │   ├── High Profit Button (gold)
    │   ├── Quick Flips Button (blue)
    │   └── Hidden Gems Button (purple)
    │
    ├── Volume Range Section
    │   ├── Min Volume Slider
    │   └── Max Volume Slider
    │
    ├── Margin Range Section
    │   ├── Min Margin Slider (0-100%)
    │   └── Max Margin Slider (0-100%)
    │
    ├── Profit Range Section
    │   ├── Min Profit Slider (ISK)
    │   └── Max Profit Slider (ISK)
    │
    ├── Risk Levels Section
    │   ├── Low Risk Checkbox (green)
    │   ├── Medium Risk Checkbox (yellow)
    │   ├── High Risk Checkbox (orange)
    │   └── Extreme Risk Checkbox (red)
    │
    └── Active Filters Summary (conditional)
        ├── Summary Header with "Clear All" link
        └── Filter Tags (badges showing active filters)
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  SmartFilters                       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Internal State (filters)                    │  │
│  │  - hideScams: boolean                        │  │
│  │  - hideLowVolume: boolean                    │  │
│  │  - highQualityOnly: boolean                  │  │
│  │  - verifiedOnly: boolean                     │  │
│  │  - minVolume: number                         │  │
│  │  - maxVolume: number | null                  │  │
│  │  - minMargin: number                         │  │
│  │  - maxMargin: number                         │  │
│  │  - minProfit: number                         │  │
│  │  - maxProfit: number | null                  │  │
│  │  - riskLevels: string[]                      │  │
│  └──────────────────────────────────────────────┘  │
│                       │                             │
│                       ▼                             │
│              User Interaction                       │
│       (click, slider, checkbox, preset)             │
│                       │                             │
│                       ▼                             │
│             updateFilter() or                       │
│          toggleFilter() or                          │
│         applyPreset() or                            │
│        resetFilters()                               │
│                       │                             │
│                       ▼                             │
│              setFilters(newFilters)                 │
│                       │                             │
│                       ▼                             │
│               onChange(newFilters)                  │
└───────────────────────│─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Parent Component                       │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  const [filters, setFilters] = useState({}) │  │
│  └──────────────────────────────────────────────┘  │
│                       │                             │
│                       ▼                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Apply filters to trading data               │  │
│  │  const filtered = data.filter(row => {...})  │  │
│  └──────────────────────────────────────────────┘  │
│                       │                             │
│                       ▼                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Display filtered data                       │  │
│  │  <TradingTable data={filtered} />            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action → Component Handler → State Update → onChange Callback → Parent Updates → UI Re-renders
```

### Example Flow: Toggling "Hide Scams"

```
1. User clicks "Hide Scams" button
   ↓
2. toggleFilter('hideScams') called
   ↓
3. updateFilter('hideScams', !filters.hideScams)
   ↓
4. setFilters({ ...prev, hideScams: true })
   ↓
5. onChange({ ...filters, hideScams: true })
   ↓
6. Parent component receives new filters
   ↓
7. Parent applies filters to data
   ↓
8. Filtered data passed to TradingTable
   ↓
9. UI shows filtered results
```

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      Your Trading Page                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                    SmartFilters                         │   │
│  │  [onChange] ──────────► setFilters                      │   │
│  │  [data] ◄──────────── tradingData (for max values)     │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ filters object                   │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Filter Logic (useMemo)                     │   │
│  │   tradingData.filter(row => {                          │   │
│  │     if (filters.hideScams && row.Volume === 1)         │   │
│  │       return false;                                     │   │
│  │     // ... more filter logic                            │   │
│  │     return true;                                        │   │
│  │   })                                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ filteredData                     │
│                              ▼                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                   TradingTable                          │   │
│  │   Displays: filteredData                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Dependencies

```
SmartFilters.jsx
├── React
│   ├── useState
│   ├── useCallback
│   └── useMemo
└── (No other dependencies)

SmartFilters.test.jsx
├── vitest
├── @testing-library/react
└── SmartFilters.jsx

SmartFilters.example.jsx
├── React (useState, useMemo)
├── SmartFilters.jsx
└── TradingTable (example)
```

## CSS Class Hierarchy

```
.bg-space-dark/40 (main container)
└── .backdrop-blur-sm
    └── .border.border-accent-cyan/20
        └── .rounded-xl
            ├── Header Section
            │   ├── .text-accent-cyan (title)
            │   └── .bg-accent-cyan/20 (badge)
            │
            ├── Quick Toggles Grid
            │   └── .grid.grid-cols-2.md:grid-cols-4
            │       └── button (active/inactive states)
            │
            └── Expanded Section
                ├── .animate-fade-in
                ├── Preset Buttons Grid
                ├── Range Sliders
                │   └── .accent-accent-cyan
                └── Risk Level Checkboxes
                    └── .text-{color}-400
```

## Performance Characteristics

```
Component Renders:
├── Initial render
├── When filters change (via user interaction)
└── When data prop changes (for recalculating max values)

Optimizations:
├── useMemo for activeFilterCount (recalc only when filters change)
├── useMemo for dataStats (recalc only when data changes)
├── useCallback for all handlers (prevent recreation on render)
└── Controlled inputs (efficient state updates)

Memory Usage:
├── Filter state: ~200 bytes
├── Handler functions: ~1KB
└── Memoized calculations: minimal
```

## Expansion States

### Collapsed (Default)
```
┌──────────────────────────────────────────────┐
│ ▶ Smart Filters          [Reset All]         │
├──────────────────────────────────────────────┤
│ [Hide Scams] [Hide Low Vol] [High Quality]   │
│ [Verified Only]                               │
└──────────────────────────────────────────────┘
```

### Expanded
```
┌──────────────────────────────────────────────┐
│ ▼ Smart Filters [3 active]  [Reset All]      │
├──────────────────────────────────────────────┤
│ [✓ Hide Scams] [Hide Low Vol] [High Quality] │
│ [Verified Only]                               │
├──────────────────────────────────────────────┤
│ Preset Filters:                               │
│ [Safe] [High Profit] [Quick] [Hidden]        │
│                                                │
│ Volume Range: 0 - 1000                        │
│ ──────────●────────────── (slider)            │
│                                                │
│ Margin Range: 0% - 100%                       │
│ ──────────●────────────── (slider)            │
│                                                │
│ Profit Range: 0 - 100M                        │
│ ──────────●────────────── (slider)            │
│                                                │
│ Risk Levels:                                  │
│ [✓ Low] [✓ Med] [✓ High] [ ] Extreme         │
│                                                │
│ Active Filters Summary:                       │
│ [No Scams] [Vol > 0] [Margin > 0%]           │
└──────────────────────────────────────────────┘
```

## Integration Points

The SmartFilters component integrates with:

1. **Trading Pages**
   - StationTradingPage.jsx
   - StationHaulingPage.jsx
   - RegionHaulingPage.jsx

2. **Data Tables**
   - TradingTable.jsx (receives filtered data)

3. **State Management**
   - Local component state (no global state needed)
   - Optional localStorage persistence

4. **Analytics** (future)
   - Filter usage tracking
   - Popular preset tracking
   - Filter impact metrics
