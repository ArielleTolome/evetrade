# Quick Start: EVETrade Productivity Tools

Get up and running with the new productivity tools in 5 minutes.

## What You Got

✨ **4 New Components** to supercharge your trading workflow:

1. 📋 **QuickCopyButtons** - Copy item names, prices, quantities with one click
2. ⏱️ **TradeSessionTimer** - Track session time and ISK/hour performance
3. 🧮 **BulkOrderCalculator** - Calculate profits for multiple items at once
4. 📤 **EnhancedExport** - Export data to CSV, Excel, JSON, and more

## Fastest Path to Use Them

### 1. Copy a Trade Item Name (30 seconds)

```jsx
import { QuickCopyButtons } from './components/common/QuickCopyButtons';

// In your trading table row:
<td>
  <QuickCopyButtons
    itemName="Tritanium"
    price={5.50}
    quantity={1000000}
    compact={true}
  />
</td>
```

**What you get:** Four icon buttons that copy item name, price, quantity, or a formatted string.

---

### 2. Track a Trading Session (1 minute)

```jsx
import { TradeSessionTimer } from './components/common/TradeSessionTimer';

// In your dashboard sidebar:
<TradeSessionTimer
  showHistory={true}
  onSessionEnd={(session) => {
    console.log('Made', session.iskEarned, 'ISK in', session.duration, 'seconds');
  }}
/>
```

**What you get:** Start/stop timer with ISK tracking and automatic ISK/hour calculation.

---

### 3. Calculate Bulk Trade Profits (2 minutes)

```jsx
import { BulkOrderCalculator } from './components/trading/BulkOrderCalculator';

// On a planning page:
<BulkOrderCalculator />
```

**What you get:**
- Add multiple items
- Input buy/sell prices and quantities
- See total profit, ROI, margins
- Break-even analysis
- Export to CSV

No props needed - just drop it in!

---

### 4. Export Your Trading Data (2 minutes)

```jsx
import { EnhancedExport } from './components/common/EnhancedExport';

const data = [
  { 'Item': 'Tritanium', 'Buy Price': 5.45, 'Sell Price': 5.55, 'Volume': 1000000 },
  // ... more rows
];

const columns = [
  { key: 'Item', label: 'Item', export: true },
  { key: 'Buy Price', label: 'Buy Price', export: true, format: 'isk' },
  { key: 'Sell Price', label: 'Sell Price', export: true, format: 'isk' },
  { key: 'Volume', label: 'Volume', export: true, format: 'number' },
];

<EnhancedExport
  data={data}
  defaultColumns={columns}
  filename="my-trades"
/>
```

**What you get:**
- Click to open export panel
- Choose format (CSV, Excel, TSV, JSON, Google Sheets)
- Pick template or custom columns
- Download or copy to clipboard

---

## See Them in Action

Each component has an example file you can run:

```jsx
// View examples:
import { QuickCopyButtonsExample } from './components/common/QuickCopyButtons.example';
import { TradeSessionTimerExample } from './components/common/TradeSessionTimer.example';
import { BulkOrderCalculatorExample } from './components/trading/BulkOrderCalculator.example';
import { EnhancedExportExample } from './components/common/EnhancedExport.example';

// Then render any example:
<QuickCopyButtonsExample />
```

---

## Real-World Example: Complete Trading Page

```jsx
import { useState } from 'react';
import { QuickCopyButtons } from './components/common/QuickCopyButtons';
import { TradeSessionTimer } from './components/common/TradeSessionTimer';
import { EnhancedExport } from './components/common/EnhancedExport';
import { GlassmorphicCard } from './components/common/GlassmorphicCard';

function MyTradingPage() {
  const [trades, setTrades] = useState([
    { Item: 'Tritanium', 'Buy Price': 5.45, 'Sell Price': 5.55, Volume: 1000000, 'Net Profit': 75000 },
    { Item: 'Pyerite', 'Buy Price': 12.30, 'Sell Price': 12.50, Volume: 500000, 'Net Profit': 65000 },
  ]);

  const columns = [
    { key: 'Item', label: 'Item', export: true },
    { key: 'Buy Price', label: 'Buy Price', export: true, format: 'isk' },
    { key: 'Sell Price', label: 'Sell Price', export: true, format: 'isk' },
    { key: 'Volume', label: 'Volume', export: true, format: 'number' },
    { key: 'Net Profit', label: 'Net Profit', export: true, format: 'isk' },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      {/* Main content - 3 columns */}
      <div className="col-span-3">
        <GlassmorphicCard>
          {/* Export button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-accent-cyan">Station Trading Results</h2>
            <EnhancedExport
              data={trades}
              defaultColumns={columns}
              filename="station-trades"
            />
          </div>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th>Buy</th>
                <th>Sell</th>
                <th>Profit</th>
                <th>Quick Copy</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr key={i}>
                  <td>{trade.Item}</td>
                  <td>{trade['Buy Price']}</td>
                  <td>{trade['Sell Price']}</td>
                  <td className="text-green-400">{trade['Net Profit']}</td>
                  <td>
                    <QuickCopyButtons
                      itemName={trade.Item}
                      price={trade['Sell Price']}
                      quantity={trade.Volume}
                      compact={true}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassmorphicCard>
      </div>

      {/* Sidebar - 1 column */}
      <div className="col-span-1">
        <TradeSessionTimer
          showHistory={true}
          onSessionEnd={(session) => {
            console.log('Session ended:', session);
          }}
        />
      </div>
    </div>
  );
}
```

---

## Component Sizes & Performance

| Component | Size | Renders | Memory |
|-----------|------|---------|--------|
| QuickCopyButtons | 8 KB | Fast | Low |
| TradeSessionTimer | 17 KB | 1/sec when active | Low |
| BulkOrderCalculator | 20 KB | On input change | Medium |
| EnhancedExport | 25 KB | Only when open | Low |

**Total bundle impact:** ~70 KB (gzipped: ~20 KB)

---

## Browser Requirements

✅ **Works on:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

⚠️ **Requires:**
- HTTPS (for Clipboard API)
- JavaScript enabled
- localStorage enabled (for session timer)

---

## Keyboard Shortcuts

### QuickCopyButtons
- **Tab** → Focus next button
- **Enter/Space** → Copy value

### TradeSessionTimer
- No keyboard shortcuts (button-based)

### BulkOrderCalculator
- **Tab** → Navigate between inputs
- **Enter** → Move to next field

### EnhancedExport
- **Esc** → Close panel (when focused)

---

## Common Issues

### "Clipboard write failed"
**Solution:** Ensure you're on HTTPS (localhost is OK)

### "Sessions not saving"
**Solution:** Check localStorage is enabled in browser settings

### "Components not showing"
**Solution:** Verify imports are correct and files exist

### "Styles look wrong"
**Solution:** Ensure Tailwind CSS is processing the component files

---

## Data Format

All components expect this structure:

```javascript
const tradingData = [
  {
    'Item': 'Item name',
    'Buy Price': 100.50,      // Number
    'Sell Price': 105.75,     // Number
    'Volume': 1000,           // Number
    'Net Profit': 5250,       // Number (optional)
    'Gross Margin': 5.24,     // Number (optional)
    'ROI': 5.0,               // Number (optional)
  },
  // ... more items
];

const columns = [
  {
    key: 'Item',              // Data field key
    label: 'Item Name',       // Display name
    export: true,             // Include in export
    format: undefined         // Optional: 'isk', 'percent', 'number'
  },
  // ... more columns
];
```

---

## Quick Tips

💡 **QuickCopyButtons**
- Use `compact={true}` in tables to save space
- Add custom formats for EVE Multibuy or other integrations

💡 **TradeSessionTimer**
- Use `compact={true}` in header/navbar
- Sessions persist across page refreshes (localStorage)
- Keep full version in sidebar for ISK input

💡 **BulkOrderCalculator**
- Adjust broker fee % based on your skills/standings
- Click row header to expand/collapse details
- Export results to share with corp/alliance

💡 **EnhancedExport**
- Use "Excel CSV" format for perfect Excel compatibility
- "Basic" template for quick exports
- "Detailed" template includes all calculations
- Preview before downloading to verify

---

## Next Steps

1. ✅ **Try the examples** - Run `.example.jsx` files to see components in action
2. 📖 **Read full docs** - Check `PRODUCTIVITY_TOOLS.md` for details
3. 🔧 **Integrate** - Follow `PRODUCTIVITY_TOOLS_INTEGRATION.md`
4. 🎨 **Customize** - Adjust to match your app's theme
5. 🚀 **Deploy** - Test and ship to production

---

## Need More Help?

📚 **Documentation:**
- `PRODUCTIVITY_TOOLS.md` - Complete documentation
- `PRODUCTIVITY_TOOLS_INTEGRATION.md` - Integration guide
- `PRODUCTIVITY_TOOLS_SUMMARY.md` - Quick reference

🎯 **Example Files:**
- `QuickCopyButtons.example.jsx` - Copy button examples
- `TradeSessionTimer.example.jsx` - Timer examples
- `BulkOrderCalculator.example.jsx` - Calculator examples
- `EnhancedExport.example.jsx` - Export examples

---

## One-Liner Examples

```jsx
// Minimal QuickCopyButtons
<QuickCopyButtons itemName="PLEX" price={3500000} quantity={10} compact />

// Minimal TradeSessionTimer
<TradeSessionTimer compact />

// Minimal BulkOrderCalculator (no props needed!)
<BulkOrderCalculator />

// Minimal EnhancedExport
<EnhancedExport data={myData} defaultColumns={myColumns} filename="trades" />
```

---

**Ready to trade smarter? Pick one component and try it now!**

Start with the one that solves your biggest pain point:
- 😤 Tired of typing? → **QuickCopyButtons**
- 🤔 Wonder how profitable you are? → **TradeSessionTimer**
- 🧮 Planning multiple trades? → **BulkOrderCalculator**
- 📊 Need data in Excel? → **EnhancedExport**

**Time to first implementation:** < 5 minutes ⏱️
