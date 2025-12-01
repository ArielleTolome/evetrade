# SmartFilters Component

A comprehensive filtering component for EVETrade that provides advanced filtering options for trading data, with a focus on hiding scams and low-quality trades.

## Features

### Quick Filter Toggles
Always visible for instant access:
- **Hide Scams** - Filters out volume=1 trades (common scam indicator)
- **Hide Low Volume** - Filters trades with volume < 10
- **High Quality Only** - Shows only trades with good margins (>10%) AND volume (>50)
- **Verified Only** - Shows trades with volume > 100 (established market presence)

### Advanced Filters (Expandable Section)

#### Preset Filters
One-click configurations for common trading strategies:
- **Safe Trades** - Conservative trading (volume > 50, margin 10-30%, no scams)
- **High Profit** - Maximum ISK gains (net profit > 10M ISK)
- **Quick Flips** - Fast turnover (high volume, moderate margins 5-20%)
- **Hidden Gems** - Overlooked opportunities (high margin 20%+, moderate volume 20-200)

#### Range Sliders
Fine-tune your filters:
- **Volume Range** - Min/max volume filter with dynamic limits based on data
- **Margin Range** - Filter by profit margin percentage (0-100%)
- **Profit Range** - Filter by net profit in ISK (with smart formatting)

#### Risk Level Filter
Filter by risk category:
- **Low** - High volume, stable margins (safest trades)
- **Medium** - Moderate volume and margins
- **High** - Lower volume or thin margins
- **Extreme** - Very low volume or very thin margins

### UI Features
- **Collapsible/Expandable** - Click header to show/hide advanced filters
- **Active Filter Badge** - Shows count of active filters
- **Filter Summary** - Visual display of all active filters
- **Reset All Button** - Clear all filters with one click
- **Glass Morphism Theme** - Matches existing EVETrade UI
- **Responsive Design** - Works on desktop, tablet, and mobile

## Installation

The component is already installed at:
```
/Users/arieltolome/Documents/Github/evetrade/src/components/common/SmartFilters.jsx
```

## Usage

### Basic Usage

```jsx
import { SmartFilters } from './components/common/SmartFilters';

function TradingPage() {
  const [filters, setFilters] = useState({});
  const [tradingData, setTradingData] = useState([]);

  return (
    <div>
      <SmartFilters
        onChange={setFilters}
        data={tradingData}
      />
    </div>
  );
}
```

### With Initial Filters

```jsx
<SmartFilters
  onChange={setFilters}
  initialFilters={{
    hideScams: true,
    minVolume: 50,
    minMargin: 10,
  }}
  data={tradingData}
/>
```

### With Trading Data Filtering

```jsx
import { useState, useMemo } from 'react';
import { SmartFilters } from './components/common/SmartFilters';
import { TradingTable } from './components/tables/TradingTable';

function TradingPage() {
  const [tradingData, setTradingData] = useState([]);
  const [filters, setFilters] = useState({});

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!tradingData || tradingData.length === 0) return [];

    return tradingData.filter(row => {
      const volume = row['Volume'] || 0;
      const margin = row['Gross Margin'] || 0;
      const profit = row['Net Profit'] || 0;

      // Hide scams (volume = 1)
      if (filters.hideScams && volume === 1) return false;

      // Hide low volume (< 10)
      if (filters.hideLowVolume && volume < 10) return false;

      // High quality only
      if (filters.highQualityOnly && (margin < 10 || volume < 50)) {
        return false;
      }

      // Verified only (volume > 100)
      if (filters.verifiedOnly && volume <= 100) return false;

      // Volume range
      if (filters.minVolume && volume < filters.minVolume) return false;
      if (filters.maxVolume !== null && volume > filters.maxVolume) {
        return false;
      }

      // Margin range
      if (filters.minMargin && margin < filters.minMargin) return false;
      if (filters.maxMargin !== null && margin > filters.maxMargin) {
        return false;
      }

      // Profit range
      if (filters.minProfit && profit < filters.minProfit) return false;
      if (filters.maxProfit !== null && profit > filters.maxProfit) {
        return false;
      }

      return true;
    });
  }, [tradingData, filters]);

  return (
    <div>
      <SmartFilters
        onChange={setFilters}
        data={tradingData}
      />
      <TradingTable data={filteredData} />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | `Function` | - | Callback function called when filters change. Receives the complete filter object. |
| `initialFilters` | `Object` | `{}` | Initial filter state. Useful for persisting filters or setting defaults. |
| `data` | `Array` | `[]` | Trading data array used to calculate maximum values for sliders. |

## Filter Object Structure

The `onChange` callback receives a filter object with this structure:

```javascript
{
  // Quick toggles
  hideScams: false,           // Boolean
  hideLowVolume: false,       // Boolean
  highQualityOnly: false,     // Boolean
  verifiedOnly: false,        // Boolean

  // Volume range
  minVolume: 0,              // Number
  maxVolume: null,           // Number | null

  // Margin range (percentage)
  minMargin: 0,              // Number (0-100)
  maxMargin: 100,            // Number (0-100)

  // Profit range (ISK)
  minProfit: 0,              // Number
  maxProfit: null,           // Number | null

  // Risk levels
  riskLevels: ['low', 'medium', 'high', 'extreme'],  // Array<string>
}
```

## Preset Configurations

The component includes 4 built-in presets:

### Safe Trades
```javascript
{
  minVolume: 50,
  maxMargin: 30,
  minMargin: 10,
  hideScams: true,
  riskLevels: ['low', 'medium'],
}
```

### High Profit
```javascript
{
  minProfit: 10000000, // 10M ISK
  riskLevels: ['low', 'medium', 'high', 'extreme'],
}
```

### Quick Flips
```javascript
{
  minVolume: 100,
  minMargin: 5,
  maxMargin: 20,
  hideScams: true,
  riskLevels: ['low', 'medium'],
}
```

### Hidden Gems
```javascript
{
  minMargin: 20,
  minVolume: 20,
  maxVolume: 200,
  riskLevels: ['low', 'medium', 'high'],
}
```

## Styling

The component uses Tailwind CSS classes and matches the EVETrade glass morphism theme:

- **Background**: `bg-space-dark/40` with `backdrop-blur-sm`
- **Borders**: `border-accent-cyan/20`
- **Text**: `text-accent-cyan` for headings, `text-text-primary` for content
- **Buttons**: Match existing button styles with hover effects
- **Animations**: `animate-fade-in` for expand/collapse

## Accessibility

- All interactive elements are keyboard accessible
- Buttons have focus states with ring indicators
- Checkboxes are properly labeled
- Tooltips provide additional context for risk levels
- ARIA labels could be added for screen readers (future enhancement)

## Browser Support

Works on all modern browsers that support:
- CSS Grid
- CSS Flexbox
- ES6+ JavaScript
- React 19

## Performance

- Uses `useMemo` to prevent unnecessary calculations
- Uses `useCallback` for optimized event handlers
- Efficiently updates only when filter values change
- No unnecessary re-renders

## Future Enhancements

Potential improvements:
1. Add keyboard shortcuts (e.g., Ctrl+F to toggle filters)
2. Save/load custom preset configurations
3. Export/import filter configurations
4. Add more risk calculation options
5. Add visual indicators for filter impact (e.g., "X trades filtered")
6. Add filter history (undo/redo)
7. Add filter templates from successful traders

## Related Components

- `TradingTable` - Displays filtered trading data
- `FormInput` - Used for numeric inputs (if extended)
- `Toast` - Could show filter save confirmations

## Troubleshooting

### Filters not applying
Make sure you're using the filter object returned by `onChange` to actually filter your data (see usage examples above).

### Slider values seem wrong
The component calculates max values from the `data` prop. Make sure you're passing the complete dataset, not the filtered data.

### Styling looks different
Ensure you have the Tailwind configuration from `/Users/arieltolome/Documents/Github/evetrade/tailwind.config.js` with the custom color definitions.

## License

Part of the EVETrade project. See main project license.
