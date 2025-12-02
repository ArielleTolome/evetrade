# Trading Dashboard - Layout Reference

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TRADING DASHBOARD                                │
│                    Your command center for EVE Online trading            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  TOP OPPORTUNITIES                           [Min Profit] [Max Invest]  │
├─────────────────────────────────┬───────────────────────────────────────┤
│  STATION TRADES (MARGIN)        │  HAULING ROUTES (ISK/JUMP)           │
│                                 │                                       │
│  ┌──────────────────────────┐   │  ┌──────────────────────────┐        │
│  │ PLEX                      │   │  │ Tritanium                │        │
│  │ Buy: 3.45M | Sell: 3.50M │   │  │ Jita → Amarr (20 jumps)  │        │
│  │ Profit: 50.00K ISK       │   │  │ ISK/Jump: 125.00K ISK    │        │
│  │ 1.45% margin             │   │  │ Total: 2.50M ISK         │        │
│  │ [Copy Name] [Details] [⭐]│   │  │ [Copy Name] [Details]    │        │
│  └──────────────────────────┘   │  └──────────────────────────┘        │
│                                 │                                       │
│  (4 more items...)              │  (4 more items...)                   │
└─────────────────────────────────┴───────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────────────────┐
│  ACTIVE ALERTS         [🔊 On]  │  WATCHLIST QUICK VIEW                │
├─────────────────────────────────┼───────────────────────────────────────┤
│  ⚠️ PLEX                        │  ┌──────────────────────────┐        │
│  Sell Price is above 3.6M ISK  │  │ Skill Injector    +3.2% ↑│        │
│  Current: 3.65M ISK            │  │ Buy: 825M | Sell: 850M   │        │
│  Triggered: 5m ago             │  │ [Copy] [Remove]          │        │
│  [Dismiss ✕]                   │  └──────────────────────────┘        │
│                                 │                                       │
│  (No other active alerts)       │  (2 more items...)                   │
└─────────────────────────────────┴───────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────────────────┐
│  MARKET PULSE                   │  QUICK TRADE CALCULATOR              │
├─────────────────────────────────┼───────────────────────────────────────┤
│  Total Volume: 1.25T ISK ↑5.2% │  Item Name: [____________]           │
│  Active Items: 8,547            │  Buy Price: [____________]           │
│                                 │  Sell Price: [____________]          │
│  PRICE MOVERS (24h):            │  Quantity: [____________]            │
│  PLEX          +12.5% ↑        │                                       │
│  Skill Inj     -3.2% ↓         │  Broker Fee: [3.0]% Tax: [2.5]%     │
│  Tritanium     +8.7% ↑         │                                       │
│  Comp. Ore     -5.1% ↓         │  ───────────────────────              │
│                                 │  Gross Profit:   125.50M ISK         │
│  MOST ACTIVE:                   │  Fees & Taxes:    8.75M ISK          │
│  PLEX          145,000          │  Net Profit:    116.75M ISK          │
│  Tritanium     98,000,000       │  ROI:            15.23%              │
│  Skill Inj     8,500            │                                       │
│                                 │  [Copy Result]                        │
└─────────────────────────────────┴───────────────────────────────────────┘

┌─────────────────────────────────┬───────────────────────────────────────┐
│  SESSION STATS          [Reset] │                                       │
├─────────────────────────────────┤                                       │
│  ┌──────────────┬──────────────┐│  QUICK TIPS:                         │
│  │ ISK Earned   │ Trades       ││  • Use filters to find opportunities │
│  │ 150.00M ISK  │ 12           ││    matching your budget              │
│  ├──────────────┼──────────────┤│  • Click Watch to track prices       │
│  │ Time Trading │ ISK/Hour     ││  • Active alerts appear in panel     │
│  │ 2h 15m       │ 66.67M       ││  • Calculator verifies margins       │
│  └──────────────┴──────────────┘│  • Session stats track performance   │
│                                 │                                       │
│  Quick Add: [+1M] [+10M] [+100M]│                                       │
│                                 │                                       │
│  ALL-TIME STATS:                │                                       │
│  Total Profit: 1.25B ISK        │                                       │
│  Win Rate: 67.5%                │                                       │
│  Total Trades: 248              │                                       │
└─────────────────────────────────┴───────────────────────────────────────┘
```

## Color Scheme

### Text Colors
- **Headers:** Cyan (`text-accent-cyan`)
- **Primary Text:** White/Light (`text-text-primary`)
- **Secondary Text:** Gray (`text-text-secondary`)
- **Positive Values:** Green (`text-green-400`)
- **Negative Values:** Red (`text-red-400`)
- **Profit/ISK:** Gold (`text-accent-gold`)

### Background Colors
- **Panel Background:** Dark with glassmorphic effect (`bg-space-dark/50`)
- **Input Fields:** Darker (`bg-space-black/50`)
- **Hover States:** Lighter (`hover:bg-accent-cyan/20`)

### Borders
- **Default:** Subtle cyan (`border-accent-cyan/10`)
- **Active/Hover:** Brighter cyan (`border-accent-cyan/30`)
- **Alerts:** Yellow (`border-yellow-500/30`)

## Component Hierarchy

```
TradingDashboardPage
├── PageLayout
│   ├── title: "Trading Dashboard"
│   └── subtitle: "Your command center for EVE Online trading"
│
└── Grid Container (max-w-7xl, 2 columns on md+)
    │
    ├── Top Opportunities Panel (col-span-2, full width)
    │   ├── Filter Controls
    │   │   ├── Min Profit Input
    │   │   └── Max Investment Input
    │   │
    │   └── Grid (2 columns)
    │       ├── Station Trades Column
    │       │   └── 5x Trade Cards
    │       │       ├── Item name & prices
    │       │       ├── Profit & margin
    │       │       └── Actions (Copy, Details, Watch)
    │       │
    │       └── Hauling Routes Column
    │           └── 5x Route Cards
    │               ├── Item & route info
    │               ├── ISK/jump & total
    │               └── Actions (Copy, Details)
    │
    ├── Active Alerts Panel
    │   ├── Header with sound toggle
    │   └── Alert List
    │       └── Alert Cards
    │           ├── Item name & condition
    │           ├── Current value
    │           ├── Timestamp
    │           └── Dismiss button
    │
    ├── Watchlist Quick View Panel
    │   ├── Header
    │   └── Item List
    │       └── Item Cards
    │           ├── Item name
    │           ├── Buy/sell prices
    │           ├── % change indicator
    │           └── Actions (Copy, Remove)
    │
    ├── Market Pulse Panel
    │   ├── Overall Stats Grid
    │   │   ├── Total Volume
    │   │   └── Active Items
    │   │
    │   ├── Price Movers Section
    │   │   └── 4x Mover Rows
    │   │       ├── Item name
    │   │       └── Change % with arrow
    │   │
    │   └── Most Active Section
    │       └── 3x Active Rows
    │           ├── Item name
    │           └── Volume
    │
    ├── Quick Trade Calculator Panel
    │   ├── Input Fields
    │   │   ├── Item Name
    │   │   ├── Buy Price
    │   │   ├── Sell Price
    │   │   ├── Quantity
    │   │   ├── Broker Fee %
    │   │   └── Sales Tax %
    │   │
    │   ├── Results Display
    │   │   ├── Gross Profit
    │   │   ├── Fees & Taxes
    │   │   ├── Net Profit
    │   │   └── ROI %
    │   │
    │   └── Copy Button
    │
    └── Session Stats Panel
        ├── Header with Reset
        ├── Stats Grid
        │   ├── ISK Earned
        │   ├── Trades Count
        │   ├── Time Trading
        │   └── ISK/Hour
        │
        ├── Quick Add Buttons
        │   ├── +1M ISK
        │   ├── +10M ISK
        │   └── +100M ISK
        │
        └── All-Time Stats (if available)
            ├── Total Profit
            ├── Win Rate
            └── Total Trades
```

## Responsive Breakpoints

### Desktop (md and up: >= 768px)
- 2-column grid layout
- All panels visible side-by-side
- Compact spacing
- Full feature set

### Mobile (< 768px)
- Single column stack
- Panels full width
- Increased padding
- Touch-friendly buttons
- Simplified grids (may go to 1 column)

## Panel Sizes (Desktop)

### Full Width Panels
- Top Opportunities: 100% width, 2 internal columns

### Half Width Panels
- Active Alerts: 50% width
- Watchlist Quick View: 50% width
- Market Pulse: 50% width
- Quick Trade Calculator: 50% width
- Session Stats: 50% width (can span for bottom tips)

## Interaction States

### Buttons
```
Default:   bg-accent-cyan/10 text-accent-cyan
Hover:     bg-accent-cyan/20 text-accent-cyan
Active:    bg-accent-cyan/30 text-accent-cyan
Disabled:  opacity-50 cursor-not-allowed
```

### Input Fields
```
Default:   border-accent-cyan/30
Focus:     border-accent-cyan
Error:     border-red-500/50
```

### Cards
```
Default:   border-accent-cyan/10
Hover:     border-accent-cyan/30 (for interactive cards)
Active:    border-accent-cyan/50
```

## Icons & Indicators

### Trend Arrows
- Up: ↑ (green)
- Down: ↓ (red)

### Status Indicators
- Active: Green dot with pulse animation
- Inactive: Red dot static
- Warning: Yellow/orange

### Action Icons
- Copy: Clipboard icon
- Remove: Trash/X icon
- Watch: Star icon
- Sound On/Off: Speaker icons

## Animation Guidelines

### Transitions
- Duration: 200-300ms
- Easing: ease-in-out
- Properties: colors, border, transform

### Hover Effects
- Cards: Slight lift (-translate-y-1)
- Buttons: Background color change
- Icons: Scale slightly (1.05x)

### Copy Feedback
- Button text changes to "Copied!"
- 2-second timeout
- No animation, instant feedback

## Accessibility Features

### Color Contrast
- All text meets WCAG AA standards
- Important values use high contrast
- Color not sole indicator (icons/text too)

### Focus States
- Visible focus rings
- Keyboard navigable
- Tab order logical

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Button descriptions
- Live region for alerts

## Data Update Patterns

### Real-Time
- Session stats (ISK, trades, time)
- Calculator results (as you type)
- Copy button feedback

### Periodic (if API connected)
- Top opportunities (every 1-5 minutes)
- Market pulse (every 5 minutes)
- Watchlist prices (every 2-5 minutes)

### Event-Driven
- Alerts (when conditions met)
- Watchlist updates (manual or on navigation)

### Static (Demo Mode)
- Mock opportunities data
- Mock market pulse data
- Used when API not available

## Print Layout (Future)

### Suggested Print Sections
1. Session Stats Summary
2. Top 10 Opportunities
3. Current Watchlist
4. All-Time Performance Stats

### Print Optimizations
- Remove interactive elements
- Simplify colors to grayscale
- Compress grids to single column
- Include timestamp of print
