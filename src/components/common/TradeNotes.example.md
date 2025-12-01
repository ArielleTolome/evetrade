# TradeNotes Component Integration Guide

## Overview
The TradeNotes component allows users to add personal notes and quick tags to any trade or item in the application.

## Usage in Trading Tables

### Basic Integration

```jsx
import TradeNotes from '../components/common/TradeNotes';

// In your table rendering logic:
<td>
  <TradeNotes
    itemId={row.itemId}
    itemName={row.itemName}
  />
</td>
```

### Example: Adding to TradingTable.jsx

```jsx
// Add to your columns definition
const columns = [
  { data: 'itemName', title: 'Item Name' },
  { data: 'buyPrice', title: 'Buy Price' },
  { data: 'sellPrice', title: 'Sell Price' },
  { data: 'profit', title: 'Profit' },
  // Add notes column
  {
    data: null,
    title: 'Notes',
    orderable: false,
    render: (data, type, row) => {
      // Return a placeholder div that React will populate
      return '<div class="trade-notes-cell" data-item-id="' + row.itemId + '" data-item-name="' + row.itemName + '"></div>';
    }
  }
];

// After DataTable initialization, render TradeNotes components
useEffect(() => {
  if (tableRef.current) {
    const cells = tableRef.current.querySelectorAll('.trade-notes-cell');
    cells.forEach(cell => {
      const itemId = cell.getAttribute('data-item-id');
      const itemName = cell.getAttribute('data-item-name');

      const root = createRoot(cell);
      root.render(
        <TradeNotes itemId={itemId} itemName={itemName} />
      );
    });
  }
}, [data]);
```

### Example: Adding to OrdersPage.jsx

```jsx
import TradeNotes from '../components/common/TradeNotes';

// In your orders list rendering:
{orders.map(order => (
  <tr key={order.orderId}>
    <td>{order.itemName}</td>
    <td>{order.price}</td>
    <td>{order.quantity}</td>
    <td>
      <TradeNotes
        itemId={order.itemId}
        itemName={order.itemName}
      />
    </td>
  </tr>
))}
```

## Features

### Quick Tags
Users can quickly tag items with predefined categories:
- Good Trade (👍)
- Bad Trade (👎)
- Testing (🧪)
- Favorite (⭐)
- Avoid (🚫)
- Scam (⚠️)
- Seasonal (📅)
- High Competition (⚔️)

### Personal Notes
Free-form text notes for detailed information about trades, market conditions, or personal observations.

### Persistence
All notes are stored in localStorage and persist across sessions.

### Search & Export
The NotesManager page (/notes) provides:
- Search notes by text or item ID
- Filter notes by tag
- Export all notes as JSON
- Import notes from JSON backup
- View statistics

## Props

### TradeNotes Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| itemId | string/number | Yes | Unique identifier for the trade item |
| itemName | string | No | Display name for the item (shows in modal header) |

## Hook API

### useTradeNotes()

Returns an object with the following methods:

```jsx
const {
  notes,           // Object: All notes keyed by itemId
  setNote,         // Function: (itemId, text) => void
  addTag,          // Function: (itemId, tagId) => void
  removeTag,       // Function: (itemId, tagId) => void
  getNote,         // Function: (itemId) => note object or null
  hasNotes,        // Function: (itemId) => boolean
  deleteNote,      // Function: (itemId) => void
  searchNotes,     // Function: (query) => array of matching notes
  getItemsByTag,   // Function: (tagId) => array of items with tag
  exportNotes,     // Function: () => JSON string
  importNotes,     // Function: (jsonString) => boolean
  stats,           // Object: { totalNotes, withText, withTags }
  QUICK_TAGS,      // Array: Tag definitions
} = useTradeNotes();
```

## Data Structure

Notes are stored as:

```json
{
  "itemId": {
    "text": "This is a good trade during peak hours",
    "tags": ["good", "favorite"],
    "updatedAt": 1638360000000
  }
}
```

## Styling

The component uses Tailwind CSS classes and supports dark mode automatically through the app's theme context.

## Performance Considerations

- Notes are stored in localStorage (max ~5-10MB depending on browser)
- Consider periodically exporting notes if you have a large collection
- The search function filters in-memory, so it's fast even with thousands of notes

## Future Enhancements

Potential additions:
- Sync notes to backend/cloud storage
- Share notes with other players
- Auto-tag based on profit thresholds
- Note templates for common scenarios
- Attach images/screenshots to notes
