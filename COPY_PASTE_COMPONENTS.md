# Copy-Paste Productivity Components

Enhanced clipboard management components for EVETrade traders to streamline data copying workflows.

## Components Overview

### 1. useClipboard Hook (`/src/hooks/useClipboard.jsx`)

A custom React hook that provides clipboard operations with persistent history tracking.

**Features:**
- Copy text with automatic format conversion (text, JSON, CSV, in-game)
- Track last 10 clipboard operations
- Pin frequently used items
- Persist history to localStorage
- Re-copy from history

**Usage:**
```javascript
import { useClipboard } from '../hooks/useClipboard';

function MyComponent() {
  const { copy, copied, history, clearHistory, pinItem, recopy } = useClipboard();

  const handleCopy = async () => {
    const result = await copy('Tritanium', 'text', { label: 'Item Name' });
    if (result.success) {
      console.log('Copied!');
    }
  };

  return (
    <button onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
```

**API:**
```javascript
{
  copy: (data, format, options) => Promise<{success, text, error}>
  copied: boolean                 // Recently copied indicator
  history: Array<ClipboardItem>  // Array of clipboard history
  clearHistory: () => void       // Clear unpinned items
  removeFromHistory: (id) => void
  pinItem: (id) => void          // Toggle pin status
  recopy: (id) => Promise        // Re-copy from history
}
```

**Format Options:**
- `text` - Plain text (default)
- `json` - JSON.stringify with formatting
- `csv` - Convert arrays/objects to CSV
- `ingame` - EVE Online format (newline-separated item names)

---

### 2. OneClickCopy Component (`/src/components/common/OneClickCopy.jsx`)

A reusable button component for one-click copying with visual feedback.

**Features:**
- Hover state with visual feedback
- Animated checkmark on success
- Toast notification via useClipboard
- Multiple size variants (sm, md, lg)
- Icon-only mode
- Custom format support

**Props:**
```javascript
{
  value: string | object | array,  // Value to copy
  format: 'text' | 'json' | 'csv' | 'ingame',
  label: string,                   // Button label
  className: string,               // Additional CSS classes
  showLabel: boolean,              // Show/hide label (default: true)
  size: 'sm' | 'md' | 'lg',       // Size variant (default: 'md')
  onCopy: (value, format) => void  // Callback after copy
}
```

**Usage:**
```javascript
import { OneClickCopy } from './components/common/OneClickCopy';

// Basic text copy
<OneClickCopy
  value="Tritanium"
  label="Item Name"
/>

// JSON data copy
<OneClickCopy
  value={{ item: 'Tritanium', price: 5.50 }}
  label="Trade Data"
  format="json"
/>

// Icon only, small size
<OneClickCopy
  value="1234567.89"
  showLabel={false}
  size="sm"
/>
```

**OneClickCopyInline Variant:**

A minimal inline variant that shows the copy button on hover.

```javascript
import { OneClickCopyInline } from './components/common/OneClickCopy';

<OneClickCopyInline value="Jita IV - Moon 4" label="Station">
  Jita IV - Moon 4 - Caldari Navy Assembly Plant
</OneClickCopyInline>
```

---

### 3. BulkCopyPanel Component (`/src/components/common/BulkCopyPanel.jsx`)

A panel for selecting and copying multiple items with various format options.

**Features:**
- Select individual items or all at once
- Multiple format options (names only, details, CSV, in-game, shopping list)
- Keyboard shortcuts (Ctrl+A, Ctrl+C)
- Selection count indicator
- Visual feedback on copy

**Props:**
```javascript
{
  items: Array,                              // Items to copy
  getItemName: (item) => string,            // Extract item name
  getItemDetails: (item) => string,         // Extract detailed info
  preSelectedItems: Array,                  // Pre-selected item IDs
  onSelectionChange: (selectedIds) => void, // Selection callback
  onCopy: (items, format) => void,          // Copy callback
  compact: boolean                          // Compact mode
}
```

**Usage:**
```javascript
import { BulkCopyPanel } from './components/common/BulkCopyPanel';

const items = [
  { id: 1, name: 'Tritanium', price: 5.50 },
  { id: 2, name: 'Pyerite', price: 12.00 },
];

<BulkCopyPanel
  items={items}
  getItemName={(item) => item.name}
  getItemDetails={(item) => `${item.name}: ${item.price} ISK`}
  onCopy={(items, format) => {
    console.log(`Copied ${items.length} items in ${format} format`);
  }}
/>
```

**Format Options:**
- **names** - Item names only (one per line)
- **details** - Full details using getItemDetails
- **csv** - CSV format with headers
- **ingame** - EVE Online format
- **shopping** - Shopping list format (quantity x item)

**BulkCopyList Companion:**

A list component with checkboxes for item selection.

```javascript
import { BulkCopyList } from './components/common/BulkCopyPanel';

<BulkCopyList
  items={items}
  selectedIds={selectedIds}
  onToggleItem={(id) => toggleSelection(id)}
  renderItem={(item) => (
    <div>{item.name} - {item.price} ISK</div>
  )}
/>
```

---

### 4. TradeClipboard Component (`/src/components/common/TradeClipboard.jsx`)

A smart clipboard manager showing history with pinning and re-copy features.

**Features:**
- Shows last 10 clipboard operations
- Pin frequently used items
- Click to re-copy from history
- Expand/collapse long text
- Format badges (Text, JSON, CSV, In-Game)
- Relative timestamps
- Clear history (preserves pinned)
- Persists to localStorage

**Props:**
```javascript
{
  onItemCopy: (id) => void,  // Callback when history item copied
  compact: boolean,          // Compact mode
  maxItems: number          // Max history items (default: 10)
}
```

**Usage:**
```javascript
import { TradeClipboard } from './components/common/TradeClipboard';

// In a sidebar
<aside className="w-80">
  <TradeClipboard compact />
</aside>

// Full page
<TradeClipboard
  maxItems={20}
  onItemCopy={(id) => {
    console.log('Re-copied item:', id);
  }}
/>
```

**Clipboard Item Structure:**
```javascript
{
  id: number,           // Unique ID (timestamp)
  text: string,         // Copied text
  format: string,       // Format type
  label: string,        // User-friendly label
  timestamp: string,    // ISO timestamp
  pinned: boolean      // Pin status
}
```

---

## Integration Examples

### Trading Table with Copy Buttons

```javascript
import { OneClickCopy } from './components/common/OneClickCopy';
import { BulkCopyPanel } from './components/common/BulkCopyPanel';

function TradingTable({ opportunities }) {
  const [selected, setSelected] = useState([]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={() => setSelected(/* toggle all */)}
              />
            </th>
            <th>Item</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map(opp => (
            <tr key={opp.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(opp.id)}
                  onChange={() => /* toggle */}
                />
              </td>
              <td>{opp.name}</td>
              <td>{opp.price}</td>
              <td>
                <OneClickCopy
                  value={opp.name}
                  showLabel={false}
                  size="sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected.length > 0 && (
        <BulkCopyPanel
          items={opportunities.filter(o => selected.includes(o.id))}
          getItemName={(item) => item.name}
          compact
        />
      )}
    </div>
  );
}
```

### Dashboard with Clipboard History

```javascript
import { TradeClipboard } from './components/common/TradeClipboard';
import { OneClickCopy } from './components/common/OneClickCopy';

function TradingDashboard() {
  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1">
        <h1>Trading Opportunities</h1>
        {/* Your trading data */}
      </div>

      {/* Sidebar with clipboard */}
      <aside className="w-80 space-y-4">
        <TradeClipboard compact />

        <div className="p-4 bg-space-dark rounded-lg">
          <h3>Quick Copy</h3>
          <OneClickCopy
            value="Jita IV - Moon 4"
            label="Jita Station"
          />
        </div>
      </aside>
    </div>
  );
}
```

### Station Trading Page

```javascript
import { OneClickCopyInline } from './components/common/OneClickCopy';

function StationDetails({ station }) {
  return (
    <div>
      <h2>Station Information</h2>
      <dl>
        <dt>Name</dt>
        <dd>
          <OneClickCopyInline value={station.name}>
            {station.name}
          </OneClickCopyInline>
        </dd>

        <dt>Region</dt>
        <dd>
          <OneClickCopyInline value={station.region}>
            {station.region}
          </OneClickCopyInline>
        </dd>

        <dt>Station ID</dt>
        <dd>
          <OneClickCopyInline value={station.id}>
            {station.id}
          </OneClickCopyInline>
        </dd>
      </dl>
    </div>
  );
}
```

---

## Keyboard Shortcuts

### BulkCopyPanel
- **Ctrl/Cmd + A** - Select all items
- **Ctrl/Cmd + C** - Copy selected items (when items selected and no text highlighted)

### TradeClipboard
- Click any history item to re-copy

---

## Styling

All components use Tailwind CSS and follow the EVETrade dark space theme:

**Colors:**
- `accent-cyan` - Primary accent color
- `space-dark` - Dark background
- `space-light` - Light background overlay
- `text-primary` - Primary text
- `text-secondary` - Secondary text
- `green-400` - Success state

**Animations:**
- `animate-bounce-once` - Bounce animation on copy success
- `transition-all duration-200` - Smooth state transitions
- `scale-105` - Subtle scale on hover/success

---

## localStorage Keys

- `evetrade-clipboard-history` - Clipboard history (max 10 items + pinned)

---

## Browser Compatibility

Requires modern browsers with:
- Clipboard API (`navigator.clipboard.writeText`)
- localStorage
- ES6+ features

**Fallback:** Components will gracefully degrade if Clipboard API is not available, logging errors to console.

---

## Testing

Example files are provided for each component:
- `/src/components/common/OneClickCopy.example.jsx`
- `/src/components/common/BulkCopyPanel.example.jsx`
- `/src/components/common/TradeClipboard.example.jsx`

To view examples, import and render them in your development environment.

---

## Best Practices

1. **Label Everything** - Always provide meaningful labels for clipboard operations
2. **Format Appropriately** - Use the right format for your data (text, JSON, CSV, in-game)
3. **Provide Feedback** - All components include visual feedback; don't disable it
4. **Pin Common Items** - Users should pin frequently copied items in TradeClipboard
5. **Limit Bulk Operations** - Don't allow copying thousands of items at once
6. **Clear History** - Remind users to clear clipboard history periodically

---

## Performance Considerations

- **History Limit** - Clipboard history is limited to 10 items + pinned items
- **localStorage** - History persists across sessions; pinned items are never cleared
- **Re-renders** - Components use `useCallback` to minimize unnecessary re-renders
- **Animation** - CSS transitions are GPU-accelerated for smooth performance

---

## Future Enhancements

Potential improvements for future versions:

1. **Export History** - Export clipboard history to file
2. **Search History** - Search through clipboard history
3. **Categories** - Organize clipboard items by category
4. **Keyboard Navigation** - Navigate clipboard history with arrow keys
5. **Sync Across Tabs** - Sync clipboard across browser tabs
6. **Custom Formats** - User-defined copy formats
7. **Clipboard Preview** - Preview before copying
8. **Copy Templates** - Pre-defined copy templates for common operations

---

## Support

For issues or questions:
- Check example files for usage patterns
- Review component props and API documentation
- Test with browser console open to see any errors
- Verify Clipboard API is available in your browser

---

## License

Part of the EVETrade project. Same license as parent repository.
