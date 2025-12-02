# EVETrade Productivity Tools

This document provides comprehensive documentation for the 4 productivity tools added to EVETrade.

## Overview

These tools are designed to enhance the trading experience by providing quick access to common operations, session tracking, bulk calculations, and advanced export capabilities.

### Components

1. **QuickCopyButtons** - One-click copy functionality for trading data
2. **TradeSessionTimer** - Track trading sessions with ISK/hour calculations
3. **BulkOrderCalculator** - Calculate profits for multiple orders with detailed breakdowns
4. **EnhancedExport** - Advanced export with multiple formats and templates

---

## 1. QuickCopyButtons

**Location:** `/src/components/common/QuickCopyButtons.jsx`

### Features

- One-click copy for item names, prices, quantities, and formatted strings
- Visual feedback with checkmark and color change on successful copy
- Keyboard shortcuts (Enter/Space when focused)
- Toast notifications via Clipboard API
- Compact mode for inline usage
- Custom format support

### Usage

```jsx
import { QuickCopyButtons, QuickCopyButton } from './components/common/QuickCopyButtons';

// Basic usage
<QuickCopyButtons
  itemName="Tritanium"
  price={5.50}
  quantity={1000000}
  onCopy={(data) => console.log('Copied:', data)}
/>

// Compact mode (for table rows)
<QuickCopyButtons
  itemName="Tritanium"
  price={5.50}
  quantity={1000000}
  compact={true}
/>

// Single button
<QuickCopyButton
  value="Jita IV - Moon 4"
  label="Copy Station"
  size="md"
/>
```

### Props

#### QuickCopyButtons

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `itemName` | string | `''` | Item name to copy |
| `price` | number | `0` | Price value |
| `quantity` | number | `0` | Quantity/volume |
| `customFormats` | array | `[]` | Custom copy formats |
| `onCopy` | function | - | Callback when item is copied |
| `compact` | boolean | `false` | Use compact icon-only mode |

#### QuickCopyButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | - | Value to copy (required) |
| `label` | string | - | Button label (required) |
| `icon` | node | - | Custom icon component |
| `onCopy` | function | - | Callback when copied |
| `size` | string | `'md'` | Size: 'sm', 'md', 'lg' |

### Custom Formats

You can add custom copy formats:

```jsx
<QuickCopyButtons
  itemName="PLEX"
  price={3500000}
  quantity={10}
  customFormats={[
    {
      id: 'evepraisal',
      label: 'EVE Praisal',
      getValue: () => `10x PLEX`,
      icon: <svg>...</svg>,
    },
  ]}
/>
```

### Example File

See `/src/components/common/QuickCopyButtons.example.jsx` for complete examples.

---

## 2. TradeSessionTimer

**Location:** `/src/components/common/TradeSessionTimer.jsx`

### Features

- Start/pause/resume/stop session tracking
- Real-time ISK earned tracking with manual input
- Automatic ISK/hour calculation
- Session history with localStorage persistence
- Today's summary (total sessions, duration, ISK)
- Visual status indicator (green pulse when active)
- Quick ISK add buttons (+1M, +10M)
- Compact mode for headers/sidebars

### Usage

```jsx
import { TradeSessionTimer } from './components/common/TradeSessionTimer';

// Full featured timer
<TradeSessionTimer
  onSessionStart={(data) => console.log('Started:', data)}
  onSessionPause={(data) => console.log('Paused:', data)}
  onSessionEnd={(data) => console.log('Ended:', data)}
  showHistory={true}
/>

// Compact mode
<TradeSessionTimer
  compact={true}
  showHistory={false}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSessionStart` | function | - | Callback when session starts |
| `onSessionPause` | function | - | Callback when session pauses/resumes |
| `onSessionEnd` | function | - | Callback when session ends |
| `showHistory` | boolean | `true` | Show session history panel |
| `compact` | boolean | `false` | Use compact mode |

### Session Data

When a session ends, the callback receives:

```javascript
{
  id: 1638360000000,
  startTime: 1638360000000,
  duration: 3600, // seconds
  iskEarned: 50000000,
  iskPerHour: 50000000,
  date: "2024-12-01T10:00:00.000Z"
}
```

### Local Storage

Sessions are stored in localStorage under the key `evetrade_sessions`. The last 50 sessions are kept.

### Example File

See `/src/components/common/TradeSessionTimer.example.jsx` for complete examples.

---

## 3. BulkOrderCalculator

**Location:** `/src/components/trading/BulkOrderCalculator.jsx`

### Features

- Calculate profits for multiple items simultaneously
- Detailed breakdown of investment, revenue, and fees
- Break-even analysis (minimum sell price, break-even quantity)
- Expandable item details
- Color-coded profit/loss indicators
- Customizable broker fees and sales tax
- CSV export
- Total summary across all items

### Usage

```jsx
import { BulkOrderCalculator } from './components/trading/BulkOrderCalculator';

// Basic usage with default fees
<BulkOrderCalculator
  onCalculate={(calculations) => console.log(calculations)}
/>

// With custom fees (based on skills/standings)
<BulkOrderCalculator
  defaultBrokerFee={0.025} // 2.5%
  defaultSalesTax={0.02}   // 2.0%
  onCalculate={(calculations) => console.log(calculations)}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCalculate` | function | - | Callback when export is triggered |
| `defaultBrokerFee` | number | `0.03` | Default broker fee (3%) |
| `defaultSalesTax` | number | `0.025` | Default sales tax (2.5%) |

### Calculations

For each item, the calculator computes:

- **Investment**
  - Buy Order Total = Buy Price × Quantity
  - Buy Broker Fee = Buy Order Total × Broker Fee %
  - Total Investment = Buy Order Total + Buy Broker Fee

- **Revenue**
  - Sell Order Total = Sell Price × Quantity
  - Sell Broker Fee = Sell Order Total × Broker Fee %
  - Sales Tax = Sell Order Total × Sales Tax %
  - Total Revenue = Sell Order Total - Sell Broker Fee - Sales Tax

- **Profit Metrics**
  - Gross Profit = Sell Order Total - Buy Order Total
  - Net Profit = Total Revenue - Total Investment
  - Profit per Unit = Net Profit / Quantity
  - ROI % = (Net Profit / Total Investment) × 100
  - Gross Margin % = ((Sell Price - Buy Price) / Buy Price) × 100
  - Net Margin % = (Net Profit / Total Revenue) × 100

- **Break-even**
  - Min Sell Price = Buy Price / (1 - (Broker Fee % + Sales Tax %))
  - Break-even Quantity = calculated when current trade is unprofitable

### Example File

See `/src/components/trading/BulkOrderCalculator.example.jsx` for complete examples.

---

## 4. EnhancedExport

**Location:** `/src/components/common/EnhancedExport.jsx`

### Features

- Multiple export formats: CSV, Excel CSV, TSV, JSON, Google Sheets
- Pre-configured templates: Basic, Detailed, Accounting, Station Trading, Hauling
- Custom column selection
- Automatic calculation of additional fields (margins, ROI, fees)
- Date range filtering
- Live preview
- Number formatting options
- Metadata inclusion (for JSON)
- UTF-8 BOM for Excel compatibility

### Usage

```jsx
import { EnhancedExport } from './components/common/EnhancedExport';

const data = [
  {
    'Item': 'Tritanium',
    'Buy Price': 5.45,
    'Sell Price': 5.55,
    'Volume': 1000000,
    // ... more fields
  },
];

const columns = [
  { key: 'Item', label: 'Item', export: true },
  { key: 'Buy Price', label: 'Buy Price', export: true, format: 'isk' },
  { key: 'Sell Price', label: 'Sell Price', export: true, format: 'isk' },
  // ... more columns
];

<EnhancedExport
  data={data}
  defaultColumns={columns}
  filename="my-trades"
  showTemplates={true}
  showDateRange={true}
  onExport={(info) => console.log('Exported:', info)}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | array | `[]` | Data to export (required) |
| `defaultColumns` | array | `[]` | Column definitions (required) |
| `filename` | string | `'evetrade-export'` | Base filename for downloads |
| `onExport` | function | - | Callback when export completes |
| `showTemplates` | boolean | `true` | Show template selection |
| `showDateRange` | boolean | `false` | Show date range filter |

### Column Definition

```javascript
{
  key: 'Item',           // Data field key
  label: 'Item Name',    // Display label
  export: true,          // Include in export by default
  format: 'isk'          // Optional: 'isk', 'percent', 'number'
}
```

### Export Formats

1. **CSV** - Standard comma-separated values
2. **Excel CSV** - With UTF-8 BOM for perfect Excel compatibility
3. **TSV** - Tab-separated values
4. **JSON** - Full data with metadata
5. **Google Sheets** - Copy-paste ready format

### Templates

1. **Basic** - Essential columns (Item, Buy/Sell Price, Volume, Net Profit)
2. **Detailed** - All trading metrics (Margins, ROI, totals)
3. **Accounting** - Fees and tax breakdown
4. **Station Trading** - Optimized for margin trading
5. **Hauling** - Includes location data

### Calculated Fields

The component automatically calculates these additional fields if not present:

- Buy Total, Sell Total
- Buy Fee, Sell Fee, Sales Tax
- Gross Profit, Net Profit
- Gross Margin, Net Margin, ROI
- Profit per Unit
- ISK per m³
- Turnover ratio

### Example File

See `/src/components/common/EnhancedExport.example.jsx` for complete examples.

---

## Integration Examples

### In a Trading Table

```jsx
import { QuickCopyButtons } from './components/common/QuickCopyButtons';
import { EnhancedExport } from './components/common/EnhancedExport';

function TradingTable({ data }) {
  return (
    <div>
      {/* Export button */}
      <div className="flex justify-end mb-4">
        <EnhancedExport
          data={data}
          defaultColumns={columns}
          filename="station-trades"
        />
      </div>

      {/* Table */}
      <table>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.Item}</td>
              <td>{row['Buy Price']}</td>
              <td>{row['Sell Price']}</td>
              <td>
                <QuickCopyButtons
                  itemName={row.Item}
                  price={row['Sell Price']}
                  quantity={row.Volume}
                  compact={true}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### In a Dashboard

```jsx
import { TradeSessionTimer } from './components/common/TradeSessionTimer';
import { BulkOrderCalculator } from './components/trading/BulkOrderCalculator';

function TradingDashboard() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Calculator */}
      <div className="col-span-2">
        <BulkOrderCalculator />
      </div>

      {/* Right: Session Timer */}
      <div>
        <TradeSessionTimer
          onSessionEnd={(session) => {
            // Track session data
            analytics.track('session_ended', session);
          }}
        />
      </div>
    </div>
  );
}
```

### In a Header

```jsx
import { TradeSessionTimer } from './components/common/TradeSessionTimer';

function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      <div className="logo">EVETrade</div>

      {/* Compact timer in header */}
      <TradeSessionTimer compact={true} showHistory={false} />

      <nav>...</nav>
    </header>
  );
}
```

---

## Technical Details

### Dependencies

All components use:
- React hooks (useState, useEffect, useCallback, useMemo)
- Tailwind CSS for styling
- Project utility functions from `/src/utils/formatters.js`
- Clipboard API for copy functionality
- localStorage for persistence (TradeSessionTimer)

### Browser Support

- Modern browsers with Clipboard API support
- localStorage required for session persistence
- No external dependencies beyond React

### Accessibility

All components include:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Semantic HTML

### Performance

- Memoized calculations to prevent unnecessary re-renders
- Efficient state management
- Debounced updates where appropriate
- Optimized re-render triggers

---

## Keyboard Shortcuts

### QuickCopyButtons
- **Enter/Space** (when focused): Copy the value

### TradeSessionTimer
- No specific shortcuts (button-based interface)

### BulkOrderCalculator
- **Tab**: Navigate between inputs
- **Enter**: Move to next field

### EnhancedExport
- **Esc**: Close export panel (when implemented)

---

## Customization

### Theming

All components use Tailwind CSS classes from the project's design system:
- `accent-cyan` - Primary accent color
- `accent-gold` - Secondary accent color
- `space-dark` - Dark background
- `space-black` - Darker background
- `text-primary`, `text-secondary` - Text colors

### Extending Components

Each component is designed to be extended:

```jsx
// Custom QuickCopyButtons with additional format
import { QuickCopyButtons } from './components/common/QuickCopyButtons';

function MyQuickCopy(props) {
  return (
    <QuickCopyButtons
      {...props}
      customFormats={[
        {
          id: 'discord',
          label: 'Discord',
          getValue: () => `**${props.itemName}** - ${props.quantity}x at ${props.price} ISK`,
          icon: <DiscordIcon />,
        },
      ]}
    />
  );
}
```

---

## Testing

Example test files would follow this pattern:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickCopyButtons } from './QuickCopyButtons';

describe('QuickCopyButtons', () => {
  it('copies item name to clipboard', async () => {
    const onCopy = jest.fn();
    render(<QuickCopyButtons itemName="Tritanium" onCopy={onCopy} />);

    const button = screen.getByLabelText('Copy Item');
    fireEvent.click(button);

    expect(onCopy).toHaveBeenCalledWith({ type: 'itemName', text: 'Tritanium' });
  });
});
```

---

## Troubleshooting

### QuickCopyButtons

**Issue:** Copy not working
- **Solution:** Ensure HTTPS (Clipboard API requires secure context)
- **Solution:** Check browser console for clipboard permissions

### TradeSessionTimer

**Issue:** Sessions not persisting
- **Solution:** Check localStorage is enabled in browser
- **Solution:** Verify localStorage quota not exceeded

### BulkOrderCalculator

**Issue:** Calculations seem wrong
- **Solution:** Verify broker fee and sales tax percentages are correct
- **Solution:** Check input values are numbers, not strings

### EnhancedExport

**Issue:** Excel file has encoding issues
- **Solution:** Use "Excel CSV" format instead of regular CSV
- **Solution:** Ensure UTF-8 BOM is included (automatic in Excel CSV format)

---

## Future Enhancements

Potential improvements for each component:

### QuickCopyButtons
- Add copy history
- Batch copy multiple items
- Custom keyboard shortcuts
- Integration with EVE Online multibuy format

### TradeSessionTimer
- Chart/graph of ISK/hour over time
- Export session history to CSV
- Session goals and targets
- Automatic ISK tracking via API integration

### BulkOrderCalculator
- Save/load calculation sets
- Import from CSV
- Market data integration for auto-fill prices
- Profit optimization suggestions

### EnhancedExport
- More export formats (XML, Markdown table)
- Cloud storage integration (Google Drive, Dropbox)
- Scheduled exports
- Email export functionality

---

## Support

For issues or questions:
1. Check this documentation
2. Review example files
3. Check browser console for errors
4. Open an issue on GitHub

---

## License

These components are part of EVETrade and follow the same license as the main project.
