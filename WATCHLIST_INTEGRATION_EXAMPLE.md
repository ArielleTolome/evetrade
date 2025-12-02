# Watchlist Integration Example

This document shows how to integrate the enhanced Watchlist functionality into your trading pages.

## Overview

The enhanced watchlist system includes:
- **LocalStorage Persistence**: Watchlist items are automatically saved
- **Price Tracking**: Shows current buy/sell prices with change indicators
- **Notes**: Add custom notes to each watchlist item
- **Sorting & Filtering**: Sort by date, name, or price changes; filter by text
- **Collapsible UI**: Minimize to a floating button or collapse the content
- **Quick Add from Tables**: Add items directly from TradingTable with one click

## Complete Integration Example

```jsx
import { useWatchlist } from '../hooks/useWatchlist';
import { WatchlistPanel } from '../components/common/WatchlistPanel';
import { TradingTable } from '../components/tables/TradingTable';

function YourTradingPage() {
  // 1. Initialize the watchlist hook
  const {
    addToWatchlist,
    isWatched,
    updatePrices,
  } = useWatchlist();

  // 2. Your existing trading data fetch
  const [trades, setTrades] = useState([]);

  // 3. When you receive new trading data, update watchlist prices
  useEffect(() => {
    if (trades.length > 0) {
      updatePrices(trades);
    }
  }, [trades, updatePrices]);

  // 4. Handler for adding items to watchlist
  const handleAddToWatchlist = useCallback((item) => {
    addToWatchlist(item);
    // Optional: Show a toast notification
    console.log(`Added ${item['Item']} to watchlist`);
  }, [addToWatchlist]);

  return (
    <div>
      {/* Your existing trading form and controls */}

      {/* Trading Table with Watchlist Integration */}
      <TradingTable
        data={trades}
        columns={yourColumns}
        onAddToWatchlist={handleAddToWatchlist}
        isItemWatched={isWatched}
        // ... your other props
      />

      {/* Watchlist Panel */}
      <WatchlistPanel className="mt-8" />
    </div>
  );
}
```

## Hook API Reference

### useWatchlist()

Returns an object with these methods and properties:

```typescript
{
  // State
  watchlists: Object,              // All watchlists keyed by ID
  watchlistArray: Array,            // Watchlists as array
  activeList: string,               // Currently active watchlist ID
  currentList: Object,              // Currently active watchlist object
  totalItemCount: number,           // Total items across all watchlists

  // Watchlist Management
  setActiveList: (id: string) => void,
  createWatchlist: (name: string) => string,
  deleteWatchlist: (id: string) => void,
  renameWatchlist: (id: string, name: string) => void,

  // Item Management
  addToWatchlist: (item: Object, listId?: string) => void,
  removeFromWatchlist: (itemId: number, listId?: string) => void,
  updateItemNotes: (itemId: number, notes: string, listId?: string) => void,

  // Utilities
  isWatched: (itemId: number) => boolean,
  getWatchlistForItem: (itemId: number) => Object | null,
  watchedIds: Array<number>,
  updatePrices: (trades: Array) => void,
}
```

## TradingTable Props

New watchlist-related props for TradingTable:

```typescript
{
  onAddToWatchlist?: (item: Object) => void,
  isItemWatched?: (itemId: number) => boolean,
}
```

When these props are provided, TradingTable automatically adds a watchlist column with:
- A purple eye icon in the header
- Add button (+ icon) for unwatched items
- Checkmark icon for items already in the watchlist
- Disabled state for already-watched items

## Item Format

The watchlist expects items with these properties:

```javascript
{
  'Item ID': number,        // or itemId
  'Item': string,           // or name
  'Buy Price': number,      // or buyPrice
  'Sell Price': number,     // or sellPrice
}
```

## WatchlistPanel Features

### Collapsible UI
- Click the collapse button (^) in the header to hide/show content
- Click the minimize button (-) to minimize to a floating button in bottom-right
- Click the floating button to restore the panel

### Multiple Watchlists
- Create new watchlists with the "+ New List" button
- Switch between watchlists using tabs
- Rename or delete custom watchlists (default list cannot be deleted)
- Each list maintains its own items

### Sorting & Filtering
- **Filter**: Text search across item names and notes
- **Sort by**: Date Added, Name, Buy Change %, Sell Change %
- **Direction**: Toggle between ascending/descending with arrow button

### Price Change Indicators
Each item shows:
- Current buy/sell prices
- Change percentage since added
- Arrow indicators: ▲ (increase), ▼ (decrease), — (no change)
- Color coding: Green (positive), Red (negative), Gray (neutral)

### Notes
- Add custom notes to any item
- Notes are searchable in the filter
- Click "+ Add Note" to add or "Edit Note" to modify

## LocalStorage

All watchlist data is automatically persisted to localStorage under the key `evetrade_watchlists`.

Data structure:
```json
{
  "default": {
    "name": "Default",
    "items": [...],
    "createdAt": 1234567890
  },
  "list_1234567890": {
    "name": "High Priority",
    "items": [...],
    "createdAt": 1234567890
  }
}
```

Each item in the items array:
```json
{
  "id": 12345,
  "name": "Tritanium",
  "addedAt": 1234567890,
  "lastUpdated": 1234567899,
  "initialPrice": {
    "buy": 1000,
    "sell": 1100
  },
  "currentPrice": {
    "buy": 1050,
    "sell": 1150
  },
  "notes": "Good margin, watch for competition",
  "alerts": []
}
```

## Styling

The WatchlistPanel uses the existing EVETrade design system:
- Space theme colors (space-dark, space-mid)
- Accent colors (accent-cyan, accent-purple)
- Glassmorphic effects
- Responsive design

## Best Practices

1. **Update Prices Regularly**: Call `updatePrices()` whenever you fetch new trading data
2. **Show Feedback**: Consider adding toast notifications when items are added to watchlist
3. **Handle Errors**: The hooks handle localStorage errors gracefully
4. **Performance**: The panel uses memoization for optimal rendering
5. **User Experience**: Place WatchlistPanel below your results for easy access

## Example with Toast Notifications

```jsx
import { Toast } from '../components/common/Toast';

function YourTradingPage() {
  const [toast, setToast] = useState(null);
  const { addToWatchlist, isWatched } = useWatchlist();

  const handleAddToWatchlist = useCallback((item) => {
    if (isWatched(item['Item ID'])) {
      setToast({
        message: 'Item is already in your watchlist',
        type: 'info',
      });
      return;
    }

    addToWatchlist(item);
    setToast({
      message: `Added ${item['Item']} to watchlist`,
      type: 'success',
    });
  }, [addToWatchlist, isWatched]);

  return (
    <div>
      {/* Your content */}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
```

## Future Enhancements

Possible future additions:
- Export watchlist to CSV
- Import watchlist from file
- Share watchlist via URL
- Price alert notifications when thresholds are met
- Historical price charts for watched items
- Watchlist templates for different trading strategies
