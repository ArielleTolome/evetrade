# Copy Components Integration Guide

Step-by-step guide to integrate copy-paste components into existing EVETrade pages.

## Table of Contents
1. [Station Trading Page](#station-trading-page)
2. [Region Hauling Page](#region-hauling-page)
3. [Trading Table Component](#trading-table-component)
4. [Watchlist Panel](#watchlist-panel)
5. [Price Alert Panel](#price-alert-panel)

---

## Station Trading Page

Add one-click copy to trading opportunities on the Station Trading page.

### 1. Import Components
```javascript
// In /src/pages/StationTradingPage.jsx
import { OneClickCopy, OneClickCopyInline } from '../components/common/OneClickCopy';
import { BulkCopyPanel } from '../components/common/BulkCopyPanel';
import { TradeClipboard } from '../components/common/TradeClipboard';
```

### 2. Add State for Selection
```javascript
function StationTradingPage() {
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);
  // ... existing state
}
```

### 3. Add to Trading Table Header
```javascript
// Add copy button to station name
<OneClickCopyInline value={selectedStation} label="Station Name">
  <h2 className="text-xl font-semibold">{selectedStation}</h2>
</OneClickCopyInline>
```

### 4. Add to Table Rows
```javascript
// In your table rendering code
<tr key={opportunity.typeId}>
  <td>
    <input
      type="checkbox"
      checked={selectedOpportunities.includes(opportunity.typeId)}
      onChange={() => toggleSelection(opportunity.typeId)}
    />
  </td>
  <td>
    <OneClickCopyInline value={opportunity.typeName}>
      {opportunity.typeName}
    </OneClickCopyInline>
  </td>
  <td>{formatISK(opportunity.buyPrice)}</td>
  <td>{formatISK(opportunity.sellPrice)}</td>
  <td>
    <OneClickCopy
      value={opportunity.profit.toString()}
      showLabel={false}
      size="sm"
    />
  </td>
</tr>
```

### 5. Add Bulk Copy Panel Below Table
```javascript
{selectedOpportunities.length > 0 && (
  <div className="mt-4">
    <BulkCopyPanel
      items={opportunities.filter(o => selectedOpportunities.includes(o.typeId))}
      getItemName={(item) => item.typeName}
      getItemDetails={(item) =>
        `${item.typeName}: Buy ${formatISK(item.buyPrice)}, Sell ${formatISK(item.sellPrice)}, Profit: ${formatISK(item.profit)}`
      }
      preSelectedItems={selectedOpportunities}
      onSelectionChange={setSelectedOpportunities}
      compact
    />
  </div>
)}
```

### 6. Add Clipboard Sidebar (Optional)
```javascript
<div className="flex gap-6">
  <div className="flex-1">
    {/* Your existing trading content */}
  </div>

  <aside className="w-80">
    <TradeClipboard compact />
  </aside>
</div>
```

---

## Region Hauling Page

Add copy functionality for hauling routes.

### 1. Import Components
```javascript
// In /src/pages/RegionHaulingPage.jsx
import { OneClickCopy } from '../components/common/OneClickCopy';
import { BulkCopyPanel } from '../components/common/BulkCopyPanel';
```

### 2. Add Copy to Route Display
```javascript
// Copy the entire route
<div className="flex items-center gap-2">
  <span className="text-text-primary">{fromRegion} → {toRegion}</span>
  <OneClickCopy
    value={`${fromRegion} to ${toRegion}`}
    label="Route"
    size="sm"
  />
</div>
```

### 3. Add Bulk Copy for Items
```javascript
<BulkCopyPanel
  items={haulingOpportunities}
  getItemName={(item) => item.name}
  getItemDetails={(item) =>
    `${item.name}: ${formatISK(item.profit)} profit, ${formatNumber(item.volume)} m³`
  }
/>
```

### 4. Add Shopping List Format
```javascript
// In your results section
<div className="mt-4">
  <h3 className="text-sm font-semibold mb-2">Quick Actions</h3>
  <div className="flex gap-2">
    <OneClickCopy
      value={haulingOpportunities.map(item =>
        `${formatNumber(item.quantity, 0)}x ${item.name}`
      )}
      label="Shopping List"
      format="ingame"
    />
    <OneClickCopy
      value={haulingOpportunities}
      label="Export CSV"
      format="csv"
    />
  </div>
</div>
```

---

## Trading Table Component

Enhance the existing TradingTable component.

### 1. Import Components
```javascript
// In /src/components/tables/TradingTable.jsx
import { OneClickCopy, OneClickCopyInline } from '../common/OneClickCopy';
import { BulkCopyPanel } from '../common/BulkCopyPanel';
```

### 2. Add Checkbox Column
```javascript
// Add to column definitions
const columns = [
  {
    name: (
      <input
        type="checkbox"
        checked={selectedAll}
        onChange={onSelectAll}
      />
    ),
    selector: row => (
      <input
        type="checkbox"
        checked={selectedRows.includes(row.id)}
        onChange={() => onToggleRow(row.id)}
      />
    ),
    width: '50px',
  },
  // ... existing columns
  {
    name: 'Copy',
    cell: row => (
      <OneClickCopy
        value={row.typeName || row.name}
        showLabel={false}
        size="sm"
      />
    ),
    width: '60px',
  },
];
```

### 3. Add Bulk Copy Footer
```javascript
// After DataTable component
{selectedRows.length > 0 && (
  <div className="mt-4 p-4 bg-space-dark rounded-lg border border-accent-cyan/20">
    <BulkCopyPanel
      items={data.filter(row => selectedRows.includes(row.id))}
      getItemName={(row) => row.typeName || row.name}
      preSelectedItems={selectedRows}
      onSelectionChange={setSelectedRows}
      compact
    />
  </div>
)}
```

---

## Watchlist Panel

Add copy functionality to the Watchlist panel.

### 1. Update Watchlist Panel
```javascript
// In /src/components/common/WatchlistPanel.jsx
import { OneClickCopy } from './OneClickCopy';
import { BulkCopyPanel } from './BulkCopyPanel';
```

### 2. Add Copy to Each Watchlist Item
```javascript
// In the watchlist item rendering
<div className="flex items-center justify-between">
  <span className="text-text-primary">{item.name}</span>
  <OneClickCopy
    value={item.name}
    showLabel={false}
    size="sm"
  />
</div>
```

### 3. Add Bulk Copy for All Items
```javascript
// At the bottom of watchlist panel
{watchlist.length > 0 && (
  <div className="mt-4">
    <OneClickCopy
      value={watchlist.map(item => item.name)}
      label="Copy All Items"
      format="ingame"
      size="sm"
    />
  </div>
)}
```

---

## Price Alert Panel

Add copy to price alerts.

### 1. Update Price Alert Panel
```javascript
// In /src/components/common/PriceAlertPanel.jsx
import { OneClickCopyInline } from './OneClickCopy';
```

### 2. Add Copy to Alert Items
```javascript
// In alert rendering
<div className="flex items-center justify-between">
  <div>
    <OneClickCopyInline value={alert.itemName}>
      <span className="font-medium">{alert.itemName}</span>
    </OneClickCopyInline>
    <div className="text-xs text-text-secondary">
      Target: {formatISK(alert.targetPrice)}
    </div>
  </div>
</div>
```

---

## Common Patterns

### Pattern 1: Copy Entire Table Data
```javascript
<OneClickCopy
  value={tableData}
  label="Export All"
  format="csv"
/>
```

### Pattern 2: Copy Selected Rows
```javascript
<OneClickCopy
  value={tableData.filter(row => selected.includes(row.id))}
  label={`Copy ${selected.length} Items`}
  format="json"
/>
```

### Pattern 3: Copy Shopping List
```javascript
<OneClickCopy
  value={items.map(item => `${item.quantity}x ${item.name}`)}
  label="Shopping List"
  format="ingame"
/>
```

### Pattern 4: Copy Summary
```javascript
<OneClickCopy
  value={`Total Profit: ${formatISK(totalProfit)}, Items: ${itemCount}, ROI: ${roi}%`}
  label="Copy Summary"
/>
```

### Pattern 5: Inline Copyable Text
```javascript
<OneClickCopyInline value={fullStationName}>
  {shortStationName}
</OneClickCopyInline>
```

---

## Best Practices

### 1. Always Provide Labels
```javascript
// Good
<OneClickCopy value="123" label="Item ID" />

// Bad
<OneClickCopy value="123" />
```

### 2. Use Appropriate Formats
```javascript
// For EVE Online item lists
format="ingame"

// For spreadsheet data
format="csv"

// For API data
format="json"

// For simple text
format="text"
```

### 3. Handle Empty States
```javascript
{items.length > 0 ? (
  <BulkCopyPanel items={items} />
) : (
  <p className="text-text-secondary">No items to copy</p>
)}
```

### 4. Provide Visual Feedback
All components already include visual feedback - don't disable it.

### 5. Use Size Variants Appropriately
```javascript
// In table cells
<OneClickCopy size="sm" showLabel={false} />

// In headers or standalone
<OneClickCopy size="md" />

// In hero sections
<OneClickCopy size="lg" />
```

---

## Testing Integration

### 1. Manual Testing Checklist
- [ ] Copy button appears on hover
- [ ] Checkmark shows after copy
- [ ] Data is correctly copied to clipboard
- [ ] Format is correct (text/JSON/CSV)
- [ ] History appears in TradeClipboard
- [ ] Pinned items persist
- [ ] Keyboard shortcuts work (Ctrl+A, Ctrl+C)

### 2. Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 3. Mobile Testing
- [ ] Touch works for copy buttons
- [ ] Checkboxes are large enough
- [ ] No layout issues

---

## Troubleshooting

### Copy Not Working
1. Check browser supports Clipboard API
2. Ensure HTTPS (required for Clipboard API)
3. Check console for errors

### History Not Persisting
1. Check localStorage is enabled
2. Check browser storage quota
3. Clear and try again

### Format Issues
1. Verify format parameter is correct
2. Check data structure matches format
3. Test with simple data first

---

## Performance Tips

1. Use `compact` mode for better performance in large lists
2. Limit history to 10-20 items max
3. Use `showLabel={false}` in table cells
4. Debounce bulk operations if selecting many items

---

## Next Steps

After integration:
1. Gather user feedback
2. Monitor clipboard usage
3. Optimize frequently used formats
4. Add custom formats as needed
5. Consider adding export to file

---

## Support

For questions or issues:
- Check `/COPY_PASTE_COMPONENTS.md` for full documentation
- Review example files in `/src/components/common/*.example.jsx`
- Check browser console for errors
- Test with simple data first
