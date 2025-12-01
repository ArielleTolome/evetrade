# SmartFilters Quick Start Guide

## 5-Minute Integration

### 1. Import the Component
```jsx
import { SmartFilters } from './components/common/SmartFilters';
```

### 2. Add State
```jsx
const [filters, setFilters] = useState({});
```

### 3. Add Component to Your Page
```jsx
<SmartFilters
  onChange={setFilters}
  data={tradingData}
/>
```

### 4. Apply Filters to Your Data
```jsx
const filteredData = useMemo(() => {
  if (!tradingData) return [];

  return tradingData.filter(row => {
    const volume = row['Volume'] || 0;
    const margin = row['Gross Margin'] || 0;
    const profit = row['Net Profit'] || 0;

    // Quick toggles
    if (filters.hideScams && volume === 1) return false;
    if (filters.hideLowVolume && volume < 10) return false;
    if (filters.highQualityOnly && (margin < 10 || volume < 50)) return false;
    if (filters.verifiedOnly && volume <= 100) return false;

    // Range filters
    if (filters.minVolume && volume < filters.minVolume) return false;
    if (filters.maxVolume && volume > filters.maxVolume) return false;
    if (filters.minMargin && margin < filters.minMargin) return false;
    if (filters.maxMargin && margin > filters.maxMargin) return false;
    if (filters.minProfit && profit < filters.minProfit) return false;
    if (filters.maxProfit && profit > filters.maxProfit) return false;

    return true;
  });
}, [tradingData, filters]);
```

### 5. Use Filtered Data
```jsx
<TradingTable data={filteredData} />
```

## Complete Example

```jsx
import { useState, useMemo } from 'react';
import { SmartFilters } from './components/common/SmartFilters';
import { TradingTable } from './components/tables/TradingTable';

function StationTradingPage() {
  const [tradingData, setTradingData] = useState([]);
  const [filters, setFilters] = useState({});

  // Apply filters
  const filteredData = useMemo(() => {
    if (!tradingData) return [];

    return tradingData.filter(row => {
      const volume = row['Volume'] || 0;
      const margin = row['Gross Margin'] || 0;
      const profit = row['Net Profit'] || 0;

      if (filters.hideScams && volume === 1) return false;
      if (filters.hideLowVolume && volume < 10) return false;
      if (filters.highQualityOnly && (margin < 10 || volume < 50)) return false;
      if (filters.verifiedOnly && volume <= 100) return false;
      if (filters.minVolume && volume < filters.minVolume) return false;
      if (filters.maxVolume && volume > filters.maxVolume) return false;
      if (filters.minMargin && margin < filters.minMargin) return false;
      if (filters.maxMargin && margin > filters.maxMargin) return false;
      if (filters.minProfit && profit < filters.minProfit) return false;
      if (filters.maxProfit && profit > filters.maxProfit) return false;

      return true;
    });
  }, [tradingData, filters]);

  return (
    <div>
      <h1>Station Trading</h1>

      {/* Smart Filters */}
      <SmartFilters
        onChange={setFilters}
        data={tradingData}
      />

      {/* Results Table */}
      <TradingTable
        data={filteredData}
        columns={columns}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onChange` | Function | Yes | Called when filters change |
| `data` | Array | No | Trading data for calculating max values |
| `initialFilters` | Object | No | Initial filter state |

## Filter Object Structure

```javascript
{
  hideScams: boolean,
  hideLowVolume: boolean,
  highQualityOnly: boolean,
  verifiedOnly: boolean,
  minVolume: number,
  maxVolume: number | null,
  minMargin: number,
  maxMargin: number,
  minProfit: number,
  maxProfit: number | null,
  riskLevels: string[],
}
```

## Preset Filters

Apply with one click in the UI:
- **Safe Trades**: `minVolume: 50, margin: 10-30%, hideScams: true`
- **High Profit**: `minProfit: 10M ISK`
- **Quick Flips**: `minVolume: 100, margin: 5-20%`
- **Hidden Gems**: `margin: 20%+, volume: 20-200`

## Tips

1. **Performance**: Use `useMemo` for filtered data to avoid re-filtering on every render
2. **Persistence**: Save filters to `localStorage` for user convenience
3. **Defaults**: Set `initialFilters` to your app's recommended starting filters
4. **Feedback**: Show "X results found" to help users understand filter impact

## Need More Help?

- **Full Documentation**: `SmartFilters.README.md`
- **Working Examples**: `SmartFilters.example.jsx`
- **Tests**: `SmartFilters.test.jsx`
