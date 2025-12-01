# AdvancedSortPanel Component

A sophisticated multi-column sorting interface for trading data with preset strategies and custom configurations.

## Features

- **Multi-Column Sorting**: Sort by multiple columns with priority ordering (sort by A, then by B, then by C)
- **Quick Presets**: 6 predefined sorting strategies for common trading approaches
- **Drag Priority**: Move sort columns up/down to change priority
- **Direction Toggle**: Switch between ascending and descending sort
- **Visual Indicators**: Clear UI showing active sorts and their direction
- **Expandable UI**: Collapsible panel to save screen space
- **Custom Configurations**: Build your own multi-column sorting strategy

## Installation

The component is located at:
```
/Users/arieltolome/Documents/Github/evetrade/src/components/common/AdvancedSortPanel.jsx
```

Import it in your component:
```jsx
import { AdvancedSortPanel, applySorts } from '../components/common/AdvancedSortPanel';
```

## Basic Usage

### Simple Integration

```jsx
import { useState, useMemo } from 'react';
import { AdvancedSortPanel, applySorts } from './AdvancedSortPanel';

function MyComponent() {
  const [sorts, setSorts] = useState([]);
  const [data, setData] = useState([...yourData]);

  // Apply sorts to data
  const sortedData = useMemo(() => {
    return applySorts(data, sorts, columns);
  }, [data, sorts]);

  return (
    <>
      <AdvancedSortPanel
        currentSort={sorts}
        onChange={setSorts}
      />
      <YourTable data={sortedData} />
    </>
  );
}
```

### Integration with TradingTable

```jsx
import { useState, useMemo } from 'react';
import { AdvancedSortPanel, applySorts } from './AdvancedSortPanel';
import { TradingTable } from '../tables/TradingTable';

function TradingPage() {
  const [sorts, setSorts] = useState([]);

  const sortedData = useMemo(() => {
    return applySorts(tradingData, sorts, columns);
  }, [tradingData, sorts]);

  return (
    <div className="space-y-4">
      <AdvancedSortPanel
        currentSort={sorts}
        onChange={setSorts}
        className="mb-4"
      />
      <TradingTable data={sortedData} columns={columns} />
    </div>
  );
}
```

## Props

### AdvancedSortPanel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentSort` | `Array` | `[]` | Current sort configuration array |
| `onChange` | `Function` | `undefined` | Callback when sort changes |
| `className` | `string` | `''` | Additional CSS classes |

### Sort Configuration Format

Each sort in the `currentSort` array should have:
```javascript
{
  column: 'Column Name',  // Must match a column key
  direction: 'desc'       // 'asc' or 'desc'
}
```

Example:
```javascript
[
  { column: 'Net Profit', direction: 'desc' },
  { column: 'Volume', direction: 'desc' },
  { column: 'Gross Margin', direction: 'asc' }
]
```

## Sort Presets

The component includes 6 predefined presets:

### 1. Best Overall (⭐)
- **Strategy**: `Score (desc)`
- **Description**: Balanced score considering all factors
- **Best For**: General trading, newcomers

### 2. Highest Profit (💰)
- **Strategy**: `Net Profit (desc)`
- **Description**: Maximum ISK per trade
- **Best For**: Traders with large capital looking for big profits

### 3. Best ROI (📈)
- **Strategy**: `ROI (desc)`
- **Description**: Highest return on investment
- **Best For**: Traders with limited capital

### 4. Safest Trades (🛡️)
- **Strategy**: `Volume (desc), Margin (asc)`
- **Description**: High volume with reasonable margins
- **Best For**: Risk-averse traders, stable income

### 5. Quick Flips (⚡)
- **Strategy**: `Volume (desc), Profit per Unit (desc)`
- **Description**: Fast-moving items with good profit
- **Best For**: Active traders, quick turnover

### 6. Hidden Gems (💎)
- **Strategy**: `Margin (desc), Net Profit (desc)`
- **Description**: High margin opportunities
- **Best For**: Experienced traders, niche markets

## Available Columns

The following columns can be sorted:

| Column Key | Label | Type | Description |
|------------|-------|------|-------------|
| `Item` | Item Name | string | Item/product name |
| `Buy Price` | Buy Price | number | Purchase price |
| `Sell Price` | Sell Price | number | Sell price |
| `Volume` | Volume | number | Trading volume |
| `Profit per Unit` | Profit/Unit | number | Profit per single item |
| `Net Profit` | Net Profit | number | Total net profit |
| `Gross Margin` | Margin | number | Gross margin percentage |
| `Score` | Score | number | Overall quality score |
| `ROI` | ROI | number | Return on investment |

## API Reference

### applySorts(data, sorts, columns)

Utility function to apply multi-column sorting to data.

**Parameters:**
- `data` (Array): Data array to sort
- `sorts` (Array): Sort configuration array
- `columns` (Array): Column definitions with type information

**Returns:**
- (Array): Sorted data (new array, does not mutate original)

**Example:**
```javascript
const sortedData = applySorts(
  tradingData,
  [
    { column: 'Volume', direction: 'desc' },
    { column: 'Net Profit', direction: 'desc' }
  ],
  columns
);
```

## Advanced Usage

### Custom Presets

You can modify `SORT_PRESETS` to add your own presets:

```javascript
const CUSTOM_PRESETS = [
  {
    id: 'myPreset',
    name: 'My Custom Strategy',
    icon: '🎯',
    sorts: [
      { column: 'Volume', direction: 'desc' },
      { column: 'ROI', direction: 'desc' }
    ],
    description: 'My custom trading strategy'
  }
];
```

### Adding New Sortable Columns

Modify `SORTABLE_COLUMNS` to add more columns:

```javascript
const SORTABLE_COLUMNS = [
  // ... existing columns
  { key: 'Velocity', label: 'Velocity', type: 'number' },
  { key: 'Competition', label: 'Competition', type: 'number' },
];
```

### Controlled Component Pattern

```jsx
function ControlledExample() {
  const [sorts, setSorts] = useState([
    { column: 'Net Profit', direction: 'desc' }
  ]);

  const handleSortChange = (newSorts) => {
    console.log('Sorts changed:', newSorts);
    // Validate or transform sorts if needed
    setSorts(newSorts);
  };

  return (
    <AdvancedSortPanel
      currentSort={sorts}
      onChange={handleSortChange}
    />
  );
}
```

### Persistent Sort Configuration

Save sort configuration to localStorage:

```jsx
function PersistentSortExample() {
  const [sorts, setSorts] = useState(() => {
    const saved = localStorage.getItem('tradingSorts');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSortChange = (newSorts) => {
    setSorts(newSorts);
    localStorage.setItem('tradingSorts', JSON.stringify(newSorts));
  };

  return (
    <AdvancedSortPanel
      currentSort={sorts}
      onChange={handleSortChange}
    />
  );
}
```

## Styling

The component uses Tailwind CSS classes and follows the EVETrade design system:

- **Background**: `bg-space-dark/40` with `backdrop-blur-sm`
- **Borders**: `border-accent-cyan/20`
- **Text**: `text-text-primary`, `text-text-secondary`
- **Accents**: `text-accent-cyan`, `text-accent-gold`

### Custom Styling

Add custom classes via the `className` prop:

```jsx
<AdvancedSortPanel
  className="my-4 shadow-xl"
  currentSort={sorts}
  onChange={setSorts}
/>
```

## Accessibility

The component includes:
- Keyboard navigation support
- ARIA labels on buttons
- Clear visual indicators for sort direction
- Disabled state handling for boundary conditions

## Performance Considerations

- Uses `useMemo` internally for computed values
- `applySorts` creates a new array (does not mutate)
- Efficient sorting algorithm (multi-pass comparison)
- Minimal re-renders with `useCallback` hooks

## Testing

Example test cases:

```jsx
import { applySorts } from './AdvancedSortPanel';

describe('applySorts', () => {
  const data = [
    { name: 'A', profit: 100, volume: 500 },
    { name: 'B', profit: 200, volume: 300 },
    { name: 'C', profit: 100, volume: 800 },
  ];

  const columns = [
    { key: 'profit', type: 'number' },
    { key: 'volume', type: 'number' },
  ];

  it('sorts by single column descending', () => {
    const result = applySorts(data, [{ column: 'profit', direction: 'desc' }], columns);
    expect(result[0].name).toBe('B');
  });

  it('sorts by multiple columns', () => {
    const result = applySorts(
      data,
      [
        { column: 'profit', direction: 'desc' },
        { column: 'volume', direction: 'desc' }
      ],
      columns
    );
    // B (200, 300), C (100, 800), A (100, 500)
    expect(result[0].name).toBe('B');
    expect(result[1].name).toBe('C');
    expect(result[2].name).toBe('A');
  });
});
```

## Examples

See `AdvancedSortPanel.example.jsx` for a complete working example with TradingTable integration.

## Troubleshooting

### Sorts not applying
- Check that column names in `sorts` match column `key` values exactly
- Ensure `onChange` callback is properly connected
- Verify `applySorts` is called with correct parameters

### Column not available to add
- Column may already be in the sort list
- Check if column exists in `SORTABLE_COLUMNS`

### Performance issues with large datasets
- Consider virtualizing the table
- Implement pagination
- Use `useMemo` for `applySorts` call

## Migration Guide

### From TradingTable's built-in sort

Before:
```jsx
<TradingTable
  data={data}
  defaultSort={{ column: 'Net Profit', direction: 'desc' }}
/>
```

After:
```jsx
const [sorts, setSorts] = useState([
  { column: 'Net Profit', direction: 'desc' }
]);

const sortedData = useMemo(() =>
  applySorts(data, sorts, columns),
  [data, sorts]
);

<>
  <AdvancedSortPanel currentSort={sorts} onChange={setSorts} />
  <TradingTable data={sortedData} />
</>
```

## Support

For issues or questions:
1. Check the example file: `AdvancedSortPanel.example.jsx`
2. Review this README
3. Check the component source code for inline documentation

## License

Part of the EVETrade project. See main project license.
