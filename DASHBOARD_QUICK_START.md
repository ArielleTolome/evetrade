# Trading Dashboard - Quick Start Guide

## Access the Dashboard

Navigate to `/dashboard` or click "Dashboard" in the main navigation menu.

## Dashboard Sections Overview

### 1. Top Opportunities (Top Section - Full Width)
**What it shows:** Best trading opportunities right now
**Quick actions:**
- Filter by min profit and max investment
- Click "Copy Name" to copy item to clipboard
- Click "Copy Details" for full trade information
- Click "Watch" to add to your watchlist

**Two columns:**
- **Left:** Station Trades (margin trading at single station)
- **Right:** Hauling Routes (moving items between stations)

### 2. Active Alerts (Left Column)
**What it shows:** Price alerts that have triggered
**Quick actions:**
- Toggle sound notifications on/off
- Dismiss individual alerts with X button
- See when each alert triggered

### 3. Watchlist Quick View (Right Column)
**What it shows:** Items you're tracking with price changes
**Quick actions:**
- Copy item name
- Remove from watchlist
- See % change since added (green = up, red = down)

### 4. Market Pulse (Left Column)
**What it shows:** Overall market health and trends
**Information displayed:**
- Total market volume with 24h change
- Active items being traded
- Biggest price movers (24h)
- Most active items by volume

### 5. Quick Trade Calculator (Right Column)
**What it does:** Calculate profit for any trade before executing
**How to use:**
1. Enter item name (optional, for reference)
2. Enter buy price per unit
3. Enter sell price per unit
4. Enter quantity
5. Adjust broker fee % and sales tax % if needed
6. View calculated results:
   - Gross profit
   - Fees & taxes
   - Net profit (what you actually make)
   - ROI %
7. Click "Copy Result" to copy formatted calculation

### 6. Session Stats (Left Column)
**What it shows:** Your current trading session performance
**Tracks:**
- ISK earned this session
- Number of trades completed
- Time spent trading
- ISK per hour rate

**Quick actions:**
- Click +1M, +10M, or +100M to add ISK earned
- Click "Reset" to start new session
- View all-time stats (if ESI connected)

## Common Workflows

### Finding a Good Trade
1. Set your min profit filter (e.g., 1M ISK)
2. Set your max investment filter (e.g., 100M ISK)
3. Browse filtered opportunities
4. Use calculator to verify margins
5. Copy item name and search in-game
6. Add to watchlist if good long-term opportunity

### Tracking Your Session
1. Start trading session (no need to click anything)
2. After each trade, click appropriate +ISK button
3. Monitor ISK/hour rate
4. At end of session, note your stats
5. Click "Reset" when starting new session

### Managing Alerts
1. Set price alerts on other pages
2. Check Active Alerts panel regularly
3. When alert triggers, you'll see it here (with sound if enabled)
4. Dismiss alerts after taking action
5. Toggle sound on/off based on preference

### Using Watchlist
1. Add items from Top Opportunities
2. Monitor price changes in Quick View
3. Copy names when good opportunity appears
4. Remove items no longer interesting

## Tips for Best Results

### Filtering Opportunities
- Start with conservative filters
- Gradually adjust based on your capital
- Min profit should cover your time investment
- Max investment should be 50-80% of your liquid ISK

### Session Tracking
- Reset at start of each trading session
- Add ISK immediately after each trade
- Use ISK/hour to measure efficiency
- Compare to your hourly goals

### Calculator Usage
- Always verify margins before large trades
- Adjust fee percentages to match your standings
- Factor in market movement (buy high, sell low orders)
- Copy results for record keeping

### Market Pulse Insights
- Watch price movers for trending items
- High volume = easier to enter/exit positions
- Volume changes indicate market shifts
- Use movers to predict future opportunities

## Keyboard Shortcuts

- `?` - Show all keyboard shortcuts
- `Esc` - Close modals/dismiss alerts
- Standard copy shortcuts work in calculator

## Mobile Usage

The dashboard is fully responsive:
- Panels stack vertically on mobile
- All features available on smaller screens
- Touch-friendly buttons and inputs
- Swipe to scroll through opportunities

## Troubleshooting

**Opportunities not showing:**
- Check your filters aren't too restrictive
- Mock data displays by default
- Real data requires API integration

**Alerts not appearing:**
- Ensure alerts are set on other pages
- Check browser notification permissions
- Alerts need market data to trigger

**Session stats reset:**
- Check browser localStorage settings
- Ensure not in private/incognito mode
- Stats persist across refreshes normally

**Calculator showing wrong results:**
- Verify all fields filled with numbers
- Check fee percentages are correct decimals
- Ensure realistic price values entered

## Next Steps

1. **Set up alerts** - Go to watchlist/trading pages to create alerts
2. **Build watchlist** - Add items from opportunities panel
3. **Start session tracking** - Begin adding ISK after trades
4. **Customize filters** - Adjust to your trading style
5. **Monitor market pulse** - Identify trending opportunities

## Integration with Other Features

- **Watchlist Page:** More detailed view and management
- **Price Alerts:** Created on other pages, viewed here
- **Trade History:** Historical stats if ESI connected
- **Calculator Page:** More advanced calculator features
- **Tools Page:** Additional productivity tools

## Support

For detailed documentation, see [TRADING_DASHBOARD.md](TRADING_DASHBOARD.md)

For general project info, see [CLAUDE.md](CLAUDE.md)
