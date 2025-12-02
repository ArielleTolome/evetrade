# Comprehensive Profit Calculator - Visual Guide

## Component Overview

### 1. Main Calculator (ComprehensiveProfitCalculator)

**Location in App:** Tools → Trading Efficiency → Profit Calculator

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Comprehensive Profit Calculator           [History (5)] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Trade Details              │  Tax & Fee Settings            │
│ ┌─────────────────────┐   │  ┌─────────────────────┐      │
│ │ Item Name           │   │  │ Station Type        │      │
│ │ [Tritanium____▼]    │   │  │ [NPC] [Player] ○──● │      │
│ └─────────────────────┘   │  └─────────────────────┘      │
│                            │                                │
│ Buy Price: [1000000] ISK   │  Accounting:  [━━━●━━] 5      │
│ Sell Price:[1200000] ISK   │  Broker Rel:  [━━━●━━] 5      │
│ Quantity:  [100____]       │                                │
│                            │  ▼ Advanced: NPC Standings     │
├─────────────────────────────────────────────────────────────┤
│ Calculation Results                          [Save] [Copy]  │
│                                                             │
│  Gross     │   Fees     │  Net Profit  │    ROI           │
│  +50.00M   │  -23.73M   │  +26.28M     │   +5.03%        │
│                                                             │
│  Buy Broker │ Sell Broker│  Sales Tax                      │
│  -8.25M     │  -9.00M    │  -17.70M                        │
│                                                             │
│  Per Unit: +262.75 ISK   │  Break-Even: 1,063,248 ISK      │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time calculations as you type
- Visual skill sliders
- Color-coded results (green = profit, red = loss)
- Expandable advanced settings
- History panel with save/load

### 2. Quick Profit Badge (QuickProfitBadge)

**Usage:** In trading tables for quick profit visualization

**Appearance:**
```
Profitable Trade:
┌──────────────────────────┐
│ ↗ +26.28M ISK (5.0%)    │ ← Green badge, hover for tooltip
└──────────────────────────┘

Losing Trade:
┌──────────────────────────┐
│ ↘ -5.23M ISK (-2.5%)    │ ← Red badge, hover for tooltip
└──────────────────────────┘
```

**Tooltip (on hover):**
```
┌────────────────────────────┐
│ Profit Breakdown           │
├────────────────────────────┤
│ Gross Profit:    +50.00M   │
│                            │
│ Buy Broker Fee:  -8.25M    │
│ Sell Broker Fee: -9.00M    │
│ Sales Tax:       -17.70M   │
│                            │
│ Net Profit:      +26.28M   │
│ ROI:             5.03%     │
│ Per Unit:        +262.75   │
│                            │
│ Click to open calculator   │
└────────────────────────────┘
```

### 3. History Panel

**Appearance:**
```
┌─────────────────────────────────────────────────────────────┐
│ Calculation History                            [Clear All]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐            │
│ │ Tritanium                           [↑][📋][🗑]          │
│ │ 12/01/2025 8:30 PM                                      │
│ │ Buy: 5.50  Sell: 6.00  Qty: 100,000                     │
│ │ Net Profit: +26,275.00 ISK                              │
│ └─────────────────────────────────────────────┘            │
│                                                             │
│ ┌─────────────────────────────────────────────┐            │
│ │ PLEX                                [↑][📋][🗑]          │
│ │ 12/01/2025 7:45 PM                                      │
│ │ Buy: 3.50M  Sell: 3.60M  Qty: 10                        │
│ │ Net Profit: +352,476.90 ISK                             │
│ └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘

[↑] = Load calculation
[📋] = Copy results
[🗑] = Delete from history
```

## Copy Format Example

When you click "Copy", the result is formatted for easy sharing:

```
Item: Tritanium
Buy: 5.50 ISK x 100,000
Sell: 6.00 ISK x 100,000
Gross: 50,000.00 ISK
Fees: 23,724.50 ISK (Buy Broker: 8,250.00, Sell Broker: 9,000.00, Tax: 17,700.00)
Net Profit: 26,275.50 ISK
ROI: 5.03%
```

Perfect for:
- Pasting into Discord/Slack
- Sharing with corp members
- Documenting trades
- Trade analysis

## Color Coding

### Profit Indicators
- **Green** - Profitable trade (net profit > 0)
- **Red** - Losing trade (net profit < 0)
- **Cyan** - Neutral/informational values
- **Gold** - Important metrics (break-even, per unit)
- **Purple** - ROI and secondary metrics

### Visual Cues
- 🎯 Profitable: Green background with ↗ arrow
- ⚠️ Loss: Red background with ↘ arrow
- 📊 Info: Cyan border with info icon
- ⚡ Quick action: Purple background

## Skill Level Impact

Visual comparison of different skill levels:

```
NO SKILLS (0/0):
┌────────────────────────────────────┐
│ Broker Fee:    3.00% per side      │
│ Sales Tax:     5.00%               │
│ Total Cost:    11.00%              │
│ Break-Even:    ~11.11% margin      │
└────────────────────────────────────┘

PERFECT SKILLS (5/5):
┌────────────────────────────────────┐
│ Broker Fee:    1.50% per side      │
│ Sales Tax:     2.95%               │
│ Total Cost:    5.95%               │
│ Break-Even:    ~6.32% margin       │
└────────────────────────────────────┘

SAVINGS: ~5% less fees on every trade!
```

## Station Type Comparison

```
NPC STATION:
┌────────────────────────────────────┐
│ Base Broker Fee: 3.00%             │
│ After Skills:    1.50%             │
│ Minimum:         1.00%             │
└────────────────────────────────────┘

PLAYER CITADEL:
┌────────────────────────────────────┐
│ Base Broker Fee: 1.50% (50% off)   │
│ After Skills:    0.75%             │
│ No Minimum!                        │
└────────────────────────────────────┘
```

## Responsive Design

### Desktop View (> 1024px)
- Two-column layout (Trade Details | Settings)
- Four-column results grid
- Full history panel

### Tablet View (768px - 1024px)
- Two-column layout maintained
- Two-column results grid
- Scrollable history

### Mobile View (< 768px)
- Single column layout
- Stacked inputs
- Two-column results grid
- Compact history cards

## Keyboard Shortcuts

When using the calculator:
- **Tab** - Navigate between fields
- **Enter** - Auto-focus next input
- **Esc** - Close tooltips/history
- **↑/↓** - Adjust sliders (when focused)

## Integration Examples

### In a Trading Table
```jsx
<table>
  <thead>
    <tr>
      <th>Item</th>
      <th>Buy</th>
      <th>Sell</th>
      <th>Profit</th>  ← QuickProfitBadge here
    </tr>
  </thead>
  <tbody>
    {trades.map(trade => (
      <tr>
        <td>{trade.name}</td>
        <td>{trade.buy}</td>
        <td>{trade.sell}</td>
        <td>
          <QuickProfitBadge
            buyPrice={trade.buy}
            sellPrice={trade.sell}
            quantity={trade.qty}
            onCalculatorOpen={() => openCalc(trade)}
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### As a Modal
```jsx
const [showCalc, setShowCalc] = useState(false);

{showCalc && (
  <Modal onClose={() => setShowCalc(false)}>
    <ComprehensiveProfitCalculator />
  </Modal>
)}
```

### As a Page Section
```jsx
<PageLayout>
  <ComprehensiveProfitCalculator />
</PageLayout>
```

## Tips for Best Use

### 1. Set Your Skills Once
Save your Accounting and Broker Relations levels in the calculator. They persist in localStorage.

### 2. Use History
Save interesting calculations to compare different items or strategies.

### 3. Quick Badge in Tables
Add QuickProfitBadge to any table showing trades for instant profit visibility.

### 4. Break-Even Planning
Use the break-even price to know your minimum profitable sell price before listing orders.

### 5. Station Comparison
Toggle between NPC and Player Structure to see which station gives better profits.

### 6. Copy for Records
Use the copy feature to maintain a trade log in a spreadsheet or document.

## Common Questions

**Q: Why is my calculation different from in-game?**
A: Make sure your skill levels and standings match exactly. Small differences in standings can affect fees.

**Q: Does this include transaction tax?**
A: Yes! Sales tax is automatically calculated based on your Accounting skill.

**Q: What about relist fees?**
A: Relisting an order costs another broker fee. Factor this in for items with high competition.

**Q: Can I calculate multiple items at once?**
A: Currently one at a time, but you can save multiple calculations to history for comparison.

**Q: Does it work with contracts?**
A: No, this is for market orders only. Contracts have different fee structures.

## Advanced Usage

### Margin Trading
For margin trading (frequent 0.01 ISK updates):
1. Set your actual costs (buy price)
2. Set target sell price
3. Check break-even to know minimum profitable price
4. Use history to track each item's profitability

### High-Volume Trading
For high-volume, low-margin items:
1. Pay attention to "Per Unit" profit
2. Small margins become significant with volume
3. Compare player structure vs NPC savings

### Investment Analysis
For high-value items:
1. ROI percentage is key
2. Compare to other investment options
3. Factor in time to sell (ISK/hour calculation)

## Screenshots Flow

**Step 1: Enter Item**
- Type item name
- Autocomplete appears
- Select from list

**Step 2: Enter Prices**
- Input buy price
- Input sell price
- Set quantity

**Step 3: Adjust Settings**
- Set skill levels
- Choose station type
- (Optional) Set standings

**Step 4: View Results**
- Real-time calculation
- Color-coded profit/loss
- All fees broken down

**Step 5: Save or Copy**
- Save to history for later
- Copy to clipboard
- Share with others

## Accessibility

- Full keyboard navigation
- ARIA labels for screen readers
- High contrast colors
- Focus indicators
- Tooltip descriptions
- Error states clearly marked

## Performance

- Calculations are instant (< 1ms)
- Real-time updates using useMemo
- History capped at 50 items
- LocalStorage for persistence
- No API calls required

This calculator is fully functional offline!
