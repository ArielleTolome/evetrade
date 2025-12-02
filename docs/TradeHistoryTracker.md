# Trade History Tracker

The Trade History Tracker is a comprehensive feature that allows authenticated EVE Online players to track their trading performance, analyze profit/loss, and view detailed trading statistics.

## Components

### 1. useTradeHistory Hook

**Location:** `/src/hooks/useTradeHistory.jsx`

A custom React hook that fetches and analyzes wallet transactions from the EVE Online ESI API.

#### Features

- **Transaction Fetching**: Automatically fetches wallet transactions when user is authenticated
- **FIFO Profit Calculation**: Uses First-In-First-Out method to match buy/sell orders and calculate realized profits
- **Performance Statistics**: Calculates win rate, average profit, ROI, and other metrics
- **Time-based Grouping**: Groups transactions by day, week, or month for timeline analysis
- **Local Caching**: Caches summary statistics in localStorage and transaction data for 5 minutes
- **Item Name Resolution**: Automatically fetches item names from ESI for all transaction type IDs

#### API

```jsx
const {
  transactions,        // Raw transaction data from ESI
  typeNames,          // Map of type_id -> item name
  tradeAnalysis,      // Array of analyzed trades with profit/loss
  stats,              // Overall statistics
  loading,            // Loading state
  error,              // Error message if any
  refresh,            // Function to manually refresh data
  groupByPeriod,      // Function to group transactions by time period
  isAuthenticated,    // Authentication status
} = useTradeHistory();
```

#### Statistics Object

```javascript
{
  totalProfit: number,        // Total realized profit/loss
  completedTrades: number,    // Number of completed trade cycles
  profitableTrades: number,   // Number of profitable trades
  losingTrades: number,       // Number of losing trades
  winRate: number,            // Win rate (0-1)
  totalInvested: number,      // Total ISK spent on purchases
  totalRevenue: number,       // Total ISK from sales
  avgProfit: number,          // Average profit per item
  roi: number,                // Return on investment (0-1)
  bestTrade: object,          // Best performing trade
  worstTrade: object,         // Worst performing trade
  uniqueItems: number,        // Number of unique items traded
  totalTransactions: number,  // Total transaction count
}
```

#### Trade Analysis Object

```javascript
{
  typeId: number,             // EVE item type ID
  typeName: string,           // Item name
  totalProfit: number,        // Total profit for this item
  totalBought: number,        // Total quantity purchased
  totalSold: number,          // Total quantity sold
  remainingQty: number,       // Unsold quantity
  completedTrades: number,    // Number of buy/sell cycles
  avgBuyPrice: number,        // Average buy price
  avgSellPrice: number,       // Average sell price
  profitMargin: number,       // Profit margin percentage (0-1)
  lastTradeDate: string,      // ISO date of last trade
}
```

### 2. TradeHistoryPanel Component

**Location:** `/src/components/common/TradeHistoryPanel.jsx`

A comprehensive UI component that displays trade history analysis with charts, statistics, and detailed trade listings.

#### Features

- **Authentication Handling**: Shows login prompt for unauthenticated users
- **Summary Cards**: Displays total profit, win rate, average profit, and trade count
- **Profit Timeline Chart**: Visual bar chart showing profit over time (daily/weekly/monthly)
- **Trade Details Table**: Sortable, filterable list of all trades
- **Best/Worst Trades**: Highlights your most and least profitable trades
- **Date Filtering**: Filter trades by 24h, 7d, 30d, or all time
- **Sort Options**: Sort by profit, margin, volume, or item name
- **Refresh Button**: Manually refresh data from ESI

#### Usage

```jsx
import { TradeHistoryPanel } from '../components/common/TradeHistoryPanel';

function MyPage() {
  return (
    <div>
      <TradeHistoryPanel />
    </div>
  );
}
```

The component is fully self-contained and requires no props. It handles authentication state internally.

## Integration with Portfolio Page

The Trade History Tracker is integrated into the Portfolio page as a tab for authenticated users.

**Location:** `/src/pages/PortfolioPage.jsx`

To access:
1. Navigate to the Portfolio page
2. Login with your EVE Online character (if not already logged in)
3. Click the "Trade History" tab

## How It Works

### 1. Authentication

The feature requires EVE Online SSO authentication with the following scopes:
- `esi-wallet.read_character_wallet.v1` - To read wallet transactions

### 2. Data Flow

```
User Login → ESI Auth → Fetch Transactions → Fetch Item Names → Calculate Profits → Display Results
                                                                        ↓
                                                              Cache to localStorage
```

### 3. Profit Calculation Logic

The system uses **FIFO (First-In-First-Out)** method to calculate realized profits:

1. **Group Transactions**: All transactions are grouped by item type (type_id)
2. **Sort by Date**: Buys and sells are sorted chronologically
3. **Match Orders**: For each sell order, match against oldest buy orders first
4. **Calculate Profit**: `(sell_price - buy_price) * quantity`
5. **Track Inventory**: Remaining unsold quantity is tracked

#### Example

```
Buy 100 units @ 1000 ISK  (Day 1)
Buy 50 units @ 1100 ISK   (Day 2)
Sell 120 units @ 1200 ISK (Day 3)

Profit Calculation:
- First 100 units: (1200 - 1000) * 100 = 20,000 ISK
- Next 20 units: (1200 - 1100) * 20 = 2,000 ISK
- Total Profit: 22,000 ISK
- Remaining: 30 units @ 1100 ISK (unsold)
```

### 4. Caching Strategy

- **Summary Stats**: Cached indefinitely in localStorage
- **Transaction Data**: Cached for 5 minutes
- **Automatic Refresh**: On mount if cache is older than 5 minutes
- **Manual Refresh**: Via refresh button

## Technical Details

### Dependencies

- React 19 hooks (useState, useEffect, useCallback, useMemo)
- ESI API client (`src/api/esi.js`)
- EVE Auth hook (`src/hooks/useEveAuth.jsx`)
- Formatters (`src/utils/formatters.js`)
- GlassmorphicCard component

### ESI Endpoints Used

1. `/characters/{character_id}/wallet/transactions/`
   - Returns last 1000 transactions
   - Requires authentication

2. `/universe/names/` (POST)
   - Batch resolves type IDs to names
   - Supports up to 1000 IDs per request
   - No authentication required

### Performance Considerations

- **Batched Name Resolution**: Type names are fetched in batches of 1000
- **Memoized Calculations**: All expensive calculations use `useMemo`
- **Limited Display**: Only shows last 50 trades in table (full data still analyzed)
- **Chart Optimization**: Timeline chart limited to last 30 periods

### Browser Compatibility

- Requires localStorage support
- Requires ES6+ (Arrow functions, destructuring, etc.)
- Tested on modern browsers (Chrome, Firefox, Safari, Edge)

## Customization

### Changing Cache Duration

Edit `CACHE_DURATION` in `/src/hooks/useTradeHistory.jsx`:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Changing Chart Period Options

Edit chart period buttons in `/src/components/common/TradeHistoryPanel.jsx`:

```jsx
<button onClick={() => setChartPeriod('day')}>Daily</button>
<button onClick={() => setChartPeriod('week')}>Weekly</button>
<button onClick={() => setChartPeriod('month')}>Monthly</button>
```

### Changing Display Limits

```jsx
// In TradeHistoryPanel.jsx
{sortedTrades.slice(0, 50).map((trade) => ( // Change 50 to desired limit

// In timeline chart
{profitTimeline.slice(-30).map((period, idx) => ( // Change 30 to desired limit
```

## Error Handling

The feature handles various error scenarios:

1. **Not Authenticated**: Shows login prompt
2. **ESI API Errors**: Displays error message with retry option
3. **Network Timeouts**: Error message with manual refresh
4. **Invalid Token**: Automatically attempts token refresh
5. **No Transactions**: Shows empty state message

## Future Enhancements

Potential improvements:

1. **Export Functionality**: Export trade history to CSV/Excel
2. **Advanced Filtering**: Filter by item, location, profit threshold
3. **Tax Calculation**: Factor in sales tax and broker fees
4. **Multi-Character Support**: Track multiple characters
5. **Historical Trends**: Show profit trends over longer periods
6. **Trade Alerts**: Notify when specific profit targets are hit
7. **Portfolio Tracking**: Track current asset values
8. **Comparison Tools**: Compare performance across time periods

## Troubleshooting

### Transactions Not Loading

1. Check authentication status
2. Verify EVE SSO scopes are correct
3. Check browser console for API errors
4. Try manual refresh

### Incorrect Profit Calculations

1. Verify all transactions are from the same character
2. Check for transaction imports from other sources
3. Ensure transactions are within ESI's 1000 transaction limit

### Performance Issues

1. Clear localStorage cache
2. Reduce display limits
3. Filter by shorter date ranges
4. Check for large numbers of unique items

## License

Part of the EVETrade project. See main repository LICENSE for details.
