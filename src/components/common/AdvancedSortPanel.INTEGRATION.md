# AdvancedSortPanel Integration Guide

This guide shows how to integrate the AdvancedSortPanel into existing EVETrade pages.

## Quick Start Integration

### Step 1: Import the Component

```jsx
import { AdvancedSortPanel, applySorts } from '../components/common/AdvancedSortPanel';
```

### Step 2: Add State Management

```jsx
function StationTradingPage() {
  // Add sort state
  const [sorts, setSorts] = useState([]);

  // ... rest of your component
}
```

### Step 3: Apply Sorts to Data

```jsx
function StationTradingPage() {
  const [sorts, setSorts] = useState([]);

  // Apply sorts to your data before passing to table
  const sortedData = useMemo(() => {
    if (!data || !sorts.length) return data;
    return applySorts(data, sorts, columns);
  }, [data, sorts]);

  // ... rest of your component
}
```

### Step 4: Add Panel to UI

```jsx
return (
  <PageLayout>
    {/* Your existing form */}
    <form onSubmit={handleSubmit}>
      {/* ... form fields ... */}
    </form>

    {/* Add AdvancedSortPanel above results */}
    {data && (
      <>
        <AdvancedSortPanel
          currentSort={sorts}
          onChange={setSorts}
          className="mb-4"
        />

        <TradingTable
          data={sortedData}
          columns={columns}
          // ... other props
        />
      </>
    )}
  </PageLayout>
);
```

## Complete Example: StationTradingPage

Here's a complete integration example for `StationTradingPage.jsx`:

```jsx
import { useState, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { TradingTable } from '../components/tables';
import { AdvancedSortPanel, applySorts } from '../components/common/AdvancedSortPanel';
import { useApiCall } from '../hooks/useApiCall';
import { fetchStationTrading } from '../api/trading';

export function StationTradingPage() {
  // Existing state
  const { data, loading, error, execute } = useApiCall(fetchStationTrading);

  // Add sort state
  const [sorts, setSorts] = useState([
    { column: 'Score', direction: 'desc' } // Default sort
  ]);

  // Define columns (you may already have this)
  const columns = useMemo(() => [
    { key: 'Item', label: 'Item', type: 'string' },
    { key: 'Buy Price', label: 'Buy Price', type: 'num', render: formatISK },
    { key: 'Sell Price', label: 'Sell Price', type: 'num', render: formatISK },
    { key: 'Volume', label: 'Volume', type: 'num', render: formatNumber },
    { key: 'Net Profit', label: 'Net Profit', type: 'num', render: formatISK },
    { key: 'Gross Margin', label: 'Margin', type: 'num', render: formatPercent },
    { key: 'Score', label: 'Score', type: 'num' },
  ], []);

  // Apply sorts
  const sortedData = useMemo(() => {
    if (!data) return null;
    return applySorts(data, sorts, columns);
  }, [data, sorts, columns]);

  // Handle form submission
  const handleSubmit = useCallback(async (formData) => {
    await execute(formData);
    // Optionally reset sorts on new query
    // setSorts([{ column: 'Score', direction: 'desc' }]);
  }, [execute]);

  return (
    <PageLayout title="Station Trading">
      {/* Your existing form */}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>

      {/* Results section */}
      {loading && <LoadingSpinner />}

      {error && <ErrorMessage error={error} />}

      {sortedData && (
        <div className="space-y-4">
          {/* Stats and info cards */}
          <TradingStats data={sortedData} />

          {/* Advanced Sort Panel */}
          <AdvancedSortPanel
            currentSort={sorts}
            onChange={setSorts}
            className="mb-4"
          />

          {/* Trading Table */}
          <TradingTable
            data={sortedData}
            columns={columns}
            showQualityIndicators={true}
            onRowClick={handleRowClick}
          />
        </div>
      )}
    </PageLayout>
  );
}
```

## Integration with Different Trading Pages

### StationHaulingPage

```jsx
export function StationHaulingPage() {
  const [sorts, setSorts] = useState([
    { column: 'Net Profit', direction: 'desc' },
    { column: 'Volume', direction: 'desc' }
  ]);

  // ... rest is same as StationTradingPage
}
```

### RegionHaulingPage

```jsx
export function RegionHaulingPage() {
  const [sorts, setSorts] = useState([
    { column: 'ROI', direction: 'desc' }
  ]);

  // Add ROI to columns if not present
  const columns = useMemo(() => [
    // ... existing columns
    { key: 'ROI', label: 'ROI %', type: 'num', render: (val) => `${val.toFixed(1)}%` },
  ], []);

  const sortedData = useMemo(() => {
    if (!data) return null;
    return applySorts(data, sorts, columns);
  }, [data, sorts, columns]);

  // ... rest of component
}
```

## Advanced Features

### Persistent Sort Settings

Save user's sort preferences:

```jsx
function StationTradingPage() {
  const [sorts, setSorts] = useState(() => {
    const saved = localStorage.getItem('stationTradingSorts');
    return saved ? JSON.parse(saved) : [{ column: 'Score', direction: 'desc' }];
  });

  const handleSortChange = useCallback((newSorts) => {
    setSorts(newSorts);
    localStorage.setItem('stationTradingSorts', JSON.stringify(newSorts));
  }, []);

  return (
    <AdvancedSortPanel
      currentSort={sorts}
      onChange={handleSortChange}
    />
  );
}
```

### Reset Sort on New Query

```jsx
const handleSubmit = useCallback(async (formData) => {
  await execute(formData);

  // Reset to default sort
  setSorts([{ column: 'Score', direction: 'desc' }]);
}, [execute]);
```

### Custom Presets Per Page

You can create page-specific presets:

```jsx
// In StationTradingPage.jsx
const STATION_PRESETS = [
  {
    id: 'safeStation',
    name: 'Safe Station Trades',
    icon: '🏪',
    sorts: [
      { column: 'Volume', direction: 'desc' },
      { column: 'Gross Margin', direction: 'asc' }
    ],
    description: 'High volume with thin margins for station trading'
  },
  // ... more custom presets
];

// Pass as prop (requires component modification)
<AdvancedSortPanel
  customPresets={STATION_PRESETS}
  currentSort={sorts}
  onChange={setSorts}
/>
```

### Conditional Panel Display

Only show panel when there's data:

```jsx
{data && data.length > 0 && (
  <AdvancedSortPanel
    currentSort={sorts}
    onChange={setSorts}
  />
)}
```

### Default Expanded State

```jsx
// Modify component to accept defaultExpanded prop
<AdvancedSortPanel
  currentSort={sorts}
  onChange={setSorts}
  defaultExpanded={true}
/>
```

## Migration Checklist

When adding AdvancedSortPanel to an existing page:

- [ ] Import `AdvancedSortPanel` and `applySorts`
- [ ] Add `sorts` state with `useState`
- [ ] Define `columns` array with correct types
- [ ] Wrap data with `applySorts` in `useMemo`
- [ ] Add `<AdvancedSortPanel>` to UI above table
- [ ] Remove or disable existing single-column sort if present
- [ ] Test all presets work correctly
- [ ] Test custom multi-column sorting
- [ ] Test with empty/null data
- [ ] Test persistence (if implemented)

## Troubleshooting

### Issue: Sorts not applying

**Solution**: Ensure column keys in `sorts` match column `key` values exactly:

```jsx
// Column definition
{ key: 'Net Profit', label: 'Profit', type: 'num' }

// Sort must use exact key
{ column: 'Net Profit', direction: 'desc' }
```

### Issue: ROI column not found

**Solution**: Add ROI to your columns:

```jsx
const columns = useMemo(() => [
  // ... existing columns
  {
    key: 'ROI',
    label: 'ROI',
    type: 'num',
    render: (val) => `${val?.toFixed(1)}%`
  },
], []);
```

### Issue: Panel doesn't expand

**Solution**: Check for CSS conflicts or z-index issues. The panel should be in the normal document flow.

### Issue: Performance with large datasets

**Solution**: Ensure `applySorts` is wrapped in `useMemo`:

```jsx
const sortedData = useMemo(() => {
  return applySorts(data, sorts, columns);
}, [data, sorts, columns]);
```

## Best Practices

1. **Always use `useMemo`** for `applySorts` to avoid re-sorting on every render
2. **Define columns once** using `useMemo` to prevent re-creating the array
3. **Provide default sort** so users see sorted data immediately
4. **Save preferences** to localStorage for better UX
5. **Clear or reset sorts** when submitting new queries (optional)
6. **Add loading state** to disable panel while fetching data

## Examples in Codebase

After integration, you can find examples in:

- `/src/components/common/AdvancedSortPanel.example.jsx` - Standalone example
- `/src/pages/StationTradingPage.jsx` - Real page integration (after you add it)
- `/src/pages/RegionHaulingPage.jsx` - Real page integration (after you add it)

## Support

For questions or issues:
1. Check `AdvancedSortPanel.README.md` for detailed API documentation
2. Review `AdvancedSortPanel.example.jsx` for working example
3. Check component source code for inline comments
