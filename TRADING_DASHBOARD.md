# Trading Dashboard

A comprehensive command center for EVE Online traders that consolidates all essential trading information and quick actions into a single, powerful interface.

## Overview

The Trading Dashboard (`/dashboard`) serves as the central hub for active traders, providing real-time insights, quick-action capabilities, and comprehensive market analysis at a glance.

## Features

### 1. Top Opportunities Panel

**Station Trading (Margin Trading)**
- Displays top 5 most profitable station trades
- Shows buy/sell prices with profit calculations
- Real-time margin percentages
- One-click copy for item names and full trade details
- Quick "Watch" button to add items to watchlist

**Hauling Routes**
- Top 5 routes sorted by ISK per jump
- Route information (from/to stations, jump count)
- Total profit and ISK/jump calculations
- Copy route details with single click

**Smart Filtering**
- Min Profit filter: Only show opportunities above threshold
- Max Investment filter: Respect your capital limitations
- Real-time filtering as you type
- Filters apply to both station trading and hauling

### 2. Active Alerts Panel

**Price Alert Management**
- Displays all triggered price alerts in real-time
- Shows alert details (item, condition, threshold, current value)
- Timestamp showing when alert was triggered
- Quick dismiss button for individual alerts
- Sound toggle for alert notifications

**Alert Details Include:**
- Item name
- Alert type (buy price, sell price, margin, volume, profit)
- Condition (above, below, equals)
- Target threshold
- Current actual value
- Relative time since trigger

### 3. Watchlist Quick View

**Compact Item Display**
- All watched items from active watchlist
- Current buy/sell prices
- Price change percentage from initial add
- Visual indicators (green for gains, red for losses)
- Up/down arrows showing price direction

**Quick Actions**
- Copy item name to clipboard
- Remove from watchlist
- Visual feedback on copy (button changes to "Copied!")

### 4. Market Pulse

**Market-Wide Statistics**
- Total market volume with 24h change indicator
- Active item count (items being traded)
- Volume trend indicators (up/down arrows)

**Price Movers (24h)**
- Top items with biggest price changes
- Percentage change with direction indicators
- Color-coded (green for up, red for down)
- Helps identify trending items

**Most Active Items**
- Items with highest trading volume
- Volume numbers for each item
- Identifies liquid markets for safe trading

### 5. Quick Trade Calculator

**Input Fields:**
- Item name (for reference)
- Buy price (ISK per unit)
- Sell price (ISK per unit)
- Quantity (number of units)
- Broker fee percentage (default 3.0%)
- Sales tax percentage (default 2.5%)

**Calculated Results:**
- Gross profit (before fees)
- Total fees and taxes
- Net profit (after all costs)
- ROI (Return on Investment) percentage

**Features:**
- Real-time calculation as you type
- Color-coded results (green for profit, red for loss)
- Copy formatted result to clipboard
- Customizable fee percentages

### 6. Session Stats

**Current Session Tracking:**
- ISK earned this session
- Number of trades completed
- Time spent trading (hours and minutes)
- ISK per hour rate

**Quick Add Buttons:**
- +1M ISK button
- +10M ISK button
- +100M ISK button
- Automatically increments trade counter

**Historical Stats (if ESI authenticated):**
- All-time total profit
- Win rate percentage
- Total completed trades

**Session Management:**
- Reset button to start new session
- Auto-saves to localStorage
- Persists across page refreshes
- Confirmation dialog before reset

## Data Sources

### Real-Time Data
- Watchlist prices (from `useWatchlist` hook)
- Price alerts (from `usePriceAlerts` hook)
- Trade history stats (from `useTradeHistory` hook)
- Session stats (localStorage)

### Mock Data (For Demonstration)
- Top station trading opportunities
- Top hauling routes
- Market pulse statistics
- Price movers and active items

**Note:** In production, replace mock data with actual API calls to trading endpoints.

## Usage

### Quick Start

1. **Navigate to Dashboard**
   - Access via `/dashboard` route
   - Or click "Dashboard" in navigation menu

2. **Filter Opportunities**
   - Set min profit threshold (e.g., 1M ISK)
   - Set max investment limit (e.g., 100M ISK)
   - Opportunities auto-filter

3. **Add to Watchlist**
   - Click "Watch" on any opportunity
   - View in Watchlist Quick View panel
   - Track price changes over time

4. **Set Price Alerts**
   - From watchlist or other pages
   - View triggered alerts in Active Alerts panel
   - Toggle sound on/off as needed

5. **Calculate Trades**
   - Input trade details in calculator
   - See real-time profit calculations
   - Copy results for reference

6. **Track Session**
   - Use quick add buttons after each trade
   - Monitor ISK/hour rate
   - Reset when starting new session

### Best Practices

**For Station Trading:**
1. Set max investment to your available capital
2. Set min profit to your target per trade
3. Focus on high-margin, high-volume items
4. Use calculator to verify margins after fees

**For Hauling:**
1. Filter by min profit for route efficiency
2. Consider jump count vs profit
3. Check volume to ensure you can haul it
4. Add profitable routes to watchlist

**For Session Tracking:**
1. Reset session at start of trading
2. Add ISK after each completed trade
3. Monitor ISK/hour to measure efficiency
4. Compare to historical win rate

## Integration with Other Features

### Watchlist Integration
- Seamlessly add opportunities to watchlist
- View watchlist items with price tracking
- Remove items directly from dashboard

### Price Alerts Integration
- View triggered alerts in real-time
- Sound toggle for alert notifications
- Quick dismiss functionality

### Trade History Integration
- All-time stats display (if ESI connected)
- Win rate and profit tracking
- Historical performance context

### Session Timer Integration
- Tracks active trading time
- Calculates ISK/hour rate
- Persists session data

## Technical Implementation

### State Management
```javascript
// Hooks used
useWatchlist()      // Watchlist data and actions
usePriceAlerts()    // Alert management
useTradeHistory()   // Historical trading stats

// Local state
sessionStats        // Current session tracking
quickCalc           // Calculator inputs
copiedItem          // Copy feedback
minProfit           // Opportunity filter
maxInvestment       // Opportunity filter
```

### Data Persistence
- Session stats: `localStorage` (`evetrade_current_session`)
- Watchlist: Managed by `useWatchlist` hook
- Alerts: Managed by `usePriceAlerts` hook
- Trade history: Managed by `useTradeHistory` hook

### Performance
- Memoized calculations for filtered data
- Memoized calculator results
- Efficient re-renders with useMemo
- LocalStorage for offline persistence

## Customization

### Adjusting Filters
Default values can be modified in state initialization:
```javascript
const [minProfit, setMinProfit] = useState('1000000');        // 1M ISK
const [maxInvestment, setMaxInvestment] = useState('100000000'); // 100M ISK
```

### Calculator Defaults
Modify default fee percentages:
```javascript
brokerFee: 3.0,   // 3% broker fee
salesTax: 2.5,    // 2.5% sales tax
```

### Mock Data Replacement
Replace mock data with API calls:
```javascript
// Replace mockStationTrades with:
const { data: stationTrades } = useApiCall('/api/station-trading', params);

// Replace mockHaulingRoutes with:
const { data: haulingRoutes } = useApiCall('/api/hauling', params);
```

## Keyboard Shortcuts

The dashboard respects global keyboard shortcuts:
- `?` - Show keyboard shortcuts help
- `Cmd/Ctrl + K` - Quick search (if implemented)
- `Esc` - Close modals/alerts

## Mobile Responsiveness

The dashboard is fully responsive:
- **Desktop (md+):** 2-column grid layout
- **Mobile:** Single column, stacked panels
- Touch-friendly buttons and inputs
- Optimized scrolling for long lists

## Future Enhancements

### Planned Features
1. **Live Market Data**
   - Real opportunities from EVE market
   - Auto-refresh capabilities
   - Price change animations

2. **Customizable Panels**
   - Drag-and-drop panel ordering
   - Show/hide panels
   - Resize panels

3. **Advanced Filtering**
   - Filter by item category
   - Filter by security status
   - Filter by station/region

4. **Export Capabilities**
   - Export session stats to CSV
   - Export opportunities list
   - Share configurations

5. **Notifications**
   - Browser notifications for alerts
   - Daily summary notifications
   - Custom alert sounds

6. **AI Insights**
   - Trend predictions
   - Opportunity recommendations
   - Risk assessment

## Troubleshooting

### Watchlist items not showing
- Ensure items are added to the active watchlist
- Check watchlist panel for active list selection

### Alerts not triggering
- Verify alert conditions are correct
- Ensure page has market data to check against
- Check browser notification permissions

### Session stats reset unexpectedly
- Check browser's localStorage settings
- Ensure cookies/storage are not being cleared
- Verify localStorage quota is not exceeded

### Calculator showing incorrect results
- Verify all input fields are filled
- Check fee percentages are correct
- Ensure numeric inputs (no text)

## Support

For issues or feature requests:
1. Check existing documentation
2. Review CLAUDE.md for project structure
3. Submit GitHub issue with:
   - Dashboard section affected
   - Expected behavior
   - Actual behavior
   - Console errors (if any)

## Related Documentation

- [PRODUCTIVITY_TOOLS.md](PRODUCTIVITY_TOOLS.md) - Other productivity features
- [WATCHLIST_INTEGRATION_EXAMPLE.md](WATCHLIST_INTEGRATION_EXAMPLE.md) - Watchlist usage
- [docs/TradeHistoryTracker.md](docs/TradeHistoryTracker.md) - Trade history features
- [CLAUDE.md](CLAUDE.md) - Project architecture
