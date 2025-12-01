# AdvancedSortPanel - Quick Start Guide

Get started with the AdvancedSortPanel component in 3 minutes.

## Files Created

```
/src/components/common/
├── AdvancedSortPanel.jsx              # Main component (17KB)
├── AdvancedSortPanel.example.jsx      # Working example (6.6KB)
├── AdvancedSortPanel.test.jsx         # Tests (12KB)
├── AdvancedSortPanel.README.md        # Full documentation (9.7KB)
├── AdvancedSortPanel.INTEGRATION.md   # Integration guide (8.7KB)
└── AdvancedSortPanel.QUICKSTART.md    # This file
```

## 30-Second Setup

### 1. Import

```jsx
import { AdvancedSortPanel, applySorts } from '../components/common/AdvancedSortPanel';
```

### 2. Add State

```jsx
const [sorts, setSorts] = useState([]);
```

### 3. Sort Data

```jsx
const sortedData = useMemo(() =>
  applySorts(data, sorts, columns),
  [data, sorts]
);
```

### 4. Add UI

```jsx
<AdvancedSortPanel currentSort={sorts} onChange={setSorts} />
<TradingTable data={sortedData} columns={columns} />
```

Done! 🎉

## Complete Minimal Example

```jsx
import { useState, useMemo } from 'react';
import { AdvancedSortPanel, applySorts } from './AdvancedSortPanel';
import { TradingTable } from '../tables/TradingTable';

function MyPage() {
  const [data] = useState(yourTradingData);
  const [sorts, setSorts] = useState([]);

  const columns = [
    { key: 'Item', label: 'Item', type: 'string' },
    { key: 'Net Profit', label: 'Profit', type: 'number' },
    { key: 'Volume', label: 'Volume', type: 'number' },
  ];

  const sortedData = useMemo(() =>
    applySorts(data, sorts, columns),
    [data, sorts]
  );

  return (
    <>
      <AdvancedSortPanel currentSort={sorts} onChange={setSorts} />
      <TradingTable data={sortedData} columns={columns} />
    </>
  );
}
```

## What You Get

### 6 Smart Presets

| Preset | Icon | Strategy | Use Case |
|--------|------|----------|----------|
| Best Overall | ⭐ | Score DESC | Balanced trading |
| Highest Profit | 💰 | Net Profit DESC | Maximum ISK |
| Best ROI | 📈 | ROI DESC | Best returns |
| Safest Trades | 🛡️ | Volume DESC, Margin ASC | Low risk |
| Quick Flips | ⚡ | Volume DESC, Profit/Unit DESC | Fast trades |
| Hidden Gems | 💎 | Margin DESC, Net Profit DESC | High margins |

### Features

- ✅ Multi-column sorting (A, then B, then C)
- ✅ Up/down arrows to change priority
- ✅ ASC/DESC toggle
- ✅ Add/remove columns dynamically
- ✅ Visual indicators
- ✅ Collapsible UI
- ✅ Preset strategies
- ✅ Mobile responsive

## Common Use Cases

### Default Sort on Load

```jsx
const [sorts, setSorts] = useState([
  { column: 'Score', direction: 'desc' }
]);
```

### Multi-Column Strategy

```jsx
const [sorts, setSorts] = useState([
  { column: 'Volume', direction: 'desc' },
  { column: 'Net Profit', direction: 'desc' },
  { column: 'Gross Margin', direction: 'asc' }
]);
```

### Persistent Settings

```jsx
const [sorts, setSorts] = useState(() => {
  const saved = localStorage.getItem('tradingSorts');
  return saved ? JSON.parse(saved) : [];
});

const handleChange = (newSorts) => {
  setSorts(newSorts);
  localStorage.setItem('tradingSorts', JSON.stringify(newSorts));
};

<AdvancedSortPanel currentSort={sorts} onChange={handleChange} />
```

### Reset on New Query

```jsx
const handleSubmit = async (form) => {
  await fetchData(form);
  setSorts([{ column: 'Score', direction: 'desc' }]); // Reset
};
```

## Available Sort Columns

- Item (string)
- Buy Price (number)
- Sell Price (number)
- Volume (number)
- Profit per Unit (number)
- Net Profit (number)
- Gross Margin (number)
- Score (number)
- ROI (number)

## Testing

Run the example:

```bash
# In your app, import and render
import { AdvancedSortPanelExample } from './AdvancedSortPanel.example';

// Then use <AdvancedSortPanelExample /> in your routes
```

Run tests:

```bash
npm test AdvancedSortPanel.test.jsx
```

## Next Steps

1. **Read the README** → `AdvancedSortPanel.README.md` for full API docs
2. **Check the example** → `AdvancedSortPanel.example.jsx` for complete code
3. **Integration guide** → `AdvancedSortPanel.INTEGRATION.md` for adding to pages
4. **Run tests** → `AdvancedSortPanel.test.jsx` to verify functionality

## Props Reference

### AdvancedSortPanel

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `currentSort` | Array | `[]` | No |
| `onChange` | Function | - | No |
| `className` | string | `''` | No |

### applySorts Function

```javascript
applySorts(data, sorts, columns)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | Array | Data to sort |
| `sorts` | Array | Sort configs `[{column, direction}]` |
| `columns` | Array | Column definitions `[{key, type}]` |

**Returns**: Sorted array (new array, doesn't mutate)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sorts not applying | Check column keys match exactly |
| ROI not found | Add `{ key: 'ROI', type: 'num' }` to columns |
| Performance slow | Wrap `applySorts` in `useMemo` |
| Panel won't expand | Check for CSS conflicts |

## Support

- 📖 **Full Docs**: `AdvancedSortPanel.README.md`
- 🔧 **Integration**: `AdvancedSortPanel.INTEGRATION.md`
- 💻 **Example**: `AdvancedSortPanel.example.jsx`
- 🧪 **Tests**: `AdvancedSortPanel.test.jsx`

## Example Output

When you use the component, users will see:

**Collapsed:**
```
▼ Advanced Sorting [2 active] ⭐ Best Overall
```

**Expanded:**
```
▲ Advanced Sorting [2 active] ⭐ Best Overall

Quick Presets
[⭐ Best Overall] [💰 Highest Profit] [📈 Best ROI] ...

Current Sort Order
1. ↑↓ Net Profit  [↓ DESC]  [×]
2. ↑↓ Volume      [↓ DESC]  [×]

Add Sort Column
[+ Item Name] [+ Buy Price] [+ Margin] ...

[Clear All Sorts]  Sorting by 2 columns
```

## That's It!

You now have a powerful multi-column sorting system with presets. 🚀

For more details, see the README and integration guide.
