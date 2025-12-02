# RegionalArbitrage - Quick Start Guide

## 🚀 TL;DR

```jsx
import { RegionalArbitrage } from '@/components/trading';

<RegionalArbitrage
  itemId={34}
  itemName="Tritanium"
  onSelect={(route) => console.log('Selected:', route)}
/>
```

## 📦 What You Get

A complete arbitrage analysis component that:
- Fetches live market data from 5 major trade hubs
- Shows best buy/sell opportunities
- Calculates profit and ROI
- Highlights optimal trading routes

## 🎯 Quick Examples

### 1. Basic Display
```jsx
<RegionalArbitrage itemId={34} itemName="Tritanium" />
```

### 2. With Selection Handler
```jsx
<RegionalArbitrage
  itemId={34}
  itemName="Tritanium"
  onSelect={(route) => {
    // route contains: buyHub, sellHub, buyPrice, sellPrice, profitPerUnit, roi, jumps
    navigateToRoutePlanner(route);
  }}
/>
```

### 3. Dynamic Item
```jsx
const [item, setItem] = useState({ id: 34, name: 'Tritanium' });

<RegionalArbitrage itemId={item.id} itemName={item.name} />
```

## 📊 What It Shows

### Best Route Card
- Buy from: Hub name, region, price
- Sell to: Hub name, region, price
- Profit/Unit, ROI %, Jump distance
- "Select This Route" button (if onSelect provided)

### Price Comparison Table
- All 5 trade hubs
- Best buy price (★ marks lowest)
- Best sell price (★ marks highest)
- Daily volume

### All Routes List
- All profitable routes sorted by profit
- Click to select (if onSelect provided)

## 🎨 Styling

Automatically styled to match EVETrade theme:
- Glassmorphic card container
- Space theme colors (cyan/gold accents)
- Responsive layout
- Loading/error states

## 🔌 Dependencies

Already included in EVETrade:
- `GlassmorphicCard` component
- `LoadingSpinner` component
- `formatISK`, `formatNumber`, `formatPercent` utilities
- `TRADE_HUBS` constants
- `getMarketOrders` ESI API function

## 💡 Common Use Cases

### Trading Dashboard
```jsx
function TradingDashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {/* Other trading widgets */}
      </div>
      <RegionalArbitrage itemId={itemId} itemName={itemName} />
    </div>
  );
}
```

### Market Analysis Page
```jsx
function MarketAnalysis({ itemId, itemName }) {
  return (
    <div className="space-y-6">
      <PriceHistory itemId={itemId} />
      <RegionalArbitrage itemId={itemId} itemName={itemName} />
      <MarketDepth itemId={itemId} />
    </div>
  );
}
```

### Watchlist Modal
```jsx
function WatchlistModal({ items }) {
  const [selected, setSelected] = useState(items[0]);

  return (
    <Modal>
      <ItemSelector items={items} onSelect={setSelected} />
      <RegionalArbitrage
        itemId={selected.id}
        itemName={selected.name}
      />
    </Modal>
  );
}
```

## 🔥 Pro Tips

1. **Cache Awareness**: Data is fetched fresh each time. Consider adding your own caching layer for frequently checked items.

2. **Volume Check**: Always verify the daily volume before committing to large trades. Low volume = hard to fill orders.

3. **Route Safety**: Component doesn't check route security. Always verify if your route goes through low-sec or null-sec.

4. **Market Depth**: Best prices shown might have limited quantity. Check the Orders page for full market depth.

5. **Timing**: Market prices change frequently. Execute trades quickly after analysis.

## 🐛 Troubleshooting

### "No market data available"
- Item might not be traded in these hubs
- ESI API might be down
- Type ID might be invalid

### Loading forever
- Check ESI API status
- Verify itemId is correct
- Check browser console for errors

### Prices seem wrong
- ESI data can have up to 5-minute delay
- Component filters by specific hub stations only
- Ensure you're looking at the right order type (buy vs sell)

## 📚 Full Documentation

- **RegionalArbitrage.md** - Complete API documentation
- **RegionalArbitrage.example.jsx** - Detailed usage examples
- **RegionalArbitrage.STRUCTURE.md** - Component architecture

## 🎓 Learning Path

1. Start with basic usage (just itemId + itemName)
2. Add onSelect handler to see route data
3. Integrate with item selector for dynamic analysis
4. Build your own route planner using the route data
5. Add to watchlist for monitoring multiple items

## ⚡ Performance

- Fetches 5 hubs in parallel (~2-3 seconds)
- Memoized calculations
- No unnecessary re-renders
- Graceful loading states

## 🌟 Next Steps

After implementing basic arbitrage:
1. Add route planning with jump details
2. Calculate hauling costs (fuel, time, risk)
3. Track historical arbitrage opportunities
4. Set up alerts for profitable routes
5. Integrate with portfolio tracking

## 🤝 Need Help?

Check the example file for common patterns:
```bash
src/components/trading/RegionalArbitrage.example.jsx
```

Happy trading! 🚀
