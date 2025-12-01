# ProfitPerHour Component Usage Guide

## Overview

The `ProfitPerHour` component and `useProfitMetrics` hook provide comprehensive profit efficiency calculations for EVE Online trades, helping traders identify the most time-efficient opportunities.

## Features

### Calculated Metrics

1. **Profit per Hour**: Estimated ISK earnings per hour based on volume and trade velocity
2. **ROI (Return on Investment)**: Percentage return on invested capital
3. **Capital Efficiency**: Profit per hour per million ISK invested
4. **Time to Recover**: Hours needed to recover initial investment
5. **Star Rating**: 0-5 star rating based on overall profitability

## Installation

The files have been created in the following locations:
- Hook: `/src/hooks/useProfitMetrics.jsx`
- Component: `/src/components/common/ProfitPerHour.jsx`
- Tests: `/src/hooks/useProfitMetrics.test.jsx` and `/src/components/common/ProfitPerHour.test.jsx`

## Usage Examples

### 1. Basic Usage - Inline Mode (for table cells)

```jsx
import { ProfitPerHour } from '../components/common/ProfitPerHour';

function TradingTable({ trades }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Profit</th>
          <th>Efficiency</th>
        </tr>
      </thead>
      <tbody>
        {trades.map(trade => (
          <tr key={trade.id}>
            <td>{trade.itemName}</td>
            <td>{formatISK(trade['Net Profit'])}</td>
            <td>
              <ProfitPerHour trade={trade} inline={true} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 2. Expanded Mode (for detail views)

```jsx
import { ProfitPerHour } from '../components/common/ProfitPerHour';

function TradeDetails({ trade }) {
  return (
    <div className="trade-details">
      <h2>{trade.itemName}</h2>

      {/* Other trade details... */}

      <ProfitPerHour
        trade={trade}
        inline={false}
      />
    </div>
  );
}
```

### 3. Custom Options

```jsx
import { ProfitPerHour } from '../components/common/ProfitPerHour';

function OptimisticTradeView({ trade }) {
  return (
    <ProfitPerHour
      trade={trade}
      inline={false}
      options={{
        assumedTurnover: 0.7,  // Assume 70% market capture
        hoursPerDay: 24
      }}
    />
  );
}
```

### 4. Using the Hook Directly

```jsx
import { useProfitMetrics } from '../hooks/useProfitMetrics';
import { formatISK } from '../utils/formatters';

function CustomMetricsDisplay({ trade }) {
  const { calculateMetrics } = useProfitMetrics();

  const metrics = calculateMetrics(trade, {
    assumedTurnover: 0.5
  });

  return (
    <div>
      <p>Hourly Profit: {formatISK(metrics.profitPerHour)}</p>
      <p>ROI: {metrics.roi.toFixed(1)}%</p>
      <p>Rating: {metrics.rating}/5 stars</p>
    </div>
  );
}
```

### 5. Sorting Trades by Efficiency

```jsx
import { useProfitMetrics } from '../hooks/useProfitMetrics';

function TradeList({ trades }) {
  const { calculateMetrics } = useProfitMetrics();

  const sortedTrades = [...trades].sort((a, b) => {
    const metricsA = calculateMetrics(a);
    const metricsB = calculateMetrics(b);
    return metricsB.profitPerHour - metricsA.profitPerHour;
  });

  return (
    <div>
      <h2>Top Trades by Profit/Hour</h2>
      {sortedTrades.map(trade => (
        <div key={trade.id}>
          <ProfitPerHour trade={trade} />
        </div>
      ))}
    </div>
  );
}
```

## Trade Object Format

The component expects trade objects with the following properties:

```javascript
const trade = {
  // Standard format (capitalized with spaces)
  'Volume': 100,                // Daily trading volume
  'Profit per Unit': 10000,     // Profit per unit after taxes
  'Buy Price': 100000,          // Buy price per unit
  'Net Profit': 1000000,        // Total net profit

  // Alternative format (lowercase)
  volume: 100,
  profitPerUnit: 10000,
  buyPrice: 100000,
  netProfit: 1000000
};
```

## Options

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trade` | Object | Required | Trade data object |
| `inline` | Boolean | `true` | Display mode: `true` for compact, `false` for expanded |
| `options` | Object | `{}` | Calculation options (see below) |

### Calculation Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hoursPerDay` | Number | `24` | Hours in a trading day |
| `assumedTurnover` | Number | `0.5` | Market capture rate (0-1) |

## Metrics Explanation

### Profit per Hour
```
profitPerHour = (profitPerUnit * estimatedSalesPerHour)
estimatedSalesPerHour = (volume / hoursPerDay) * assumedTurnover
```

Example: If an item has 100 daily volume, 10,000 ISK profit per unit, and you capture 50% of the market:
- Sales per hour: (100 / 24) * 0.5 = 2.08 units/hour
- Profit per hour: 10,000 * 2.08 = 20,833 ISK/hour

### ROI (Return on Investment)
```
ROI = (profitPerUnit / buyPrice) * 100
```

Example: If profit is 10,000 ISK and buy price is 100,000 ISK:
- ROI: (10,000 / 100,000) * 100 = 10%

### Capital Efficiency
```
capitalEfficiency = (profitPerHour / capitalRequired) * 1,000,000
```

This metric shows how much ISK you earn per hour for every million ISK invested.

Example: If you earn 20,833 ISK/hour with 10M ISK invested:
- Capital Efficiency: (20,833 / 10,000,000) * 1,000,000 = 2.08

### Time to Recover
```
timeToRecover = capitalRequired / profitPerHour
```

Example: If you need 10M ISK and earn 20,833 ISK/hour:
- Time to Recover: 10,000,000 / 20,833 = 480 hours (20 days)

### Star Rating

The rating system (0-5 stars) considers multiple factors:
- ⭐ Profit > 10M ISK/hour
- ⭐ Profit > 50M ISK/hour
- ⭐ ROI > 5%
- ⭐ ROI > 10%
- ⭐ Volume > 100 units

## Color Coding

### ROI Colors
- 🟢 Green (`text-green-400`): ROI ≥ 10%
- 🟡 Yellow (`text-yellow-400`): ROI ≥ 5%
- 🟠 Orange (`text-orange-400`): ROI ≥ 2%
- 🔴 Red (`text-red-400`): ROI < 2%

### Capital Efficiency Colors
- 🟢 Green: Efficiency ≥ 100
- 🟡 Yellow: Efficiency ≥ 50
- 🟠 Orange: Efficiency ≥ 20
- 🔴 Red: Efficiency < 20

## Integration with Existing Pages

### Example: Add to TradingTable

```jsx
// In src/components/tables/TradingTable.jsx

import { ProfitPerHour } from '../common/ProfitPerHour';

// Add a new column definition
const columns = [
  // ... existing columns ...
  {
    title: 'Efficiency',
    data: null,
    render: (data, type, row) => {
      if (type === 'display') {
        return '<div class="efficiency-cell"></div>';
      }
      return data['Profit per Unit'] || 0;
    }
  }
];

// After table initialization, render React components in cells
trades.forEach((trade, index) => {
  const cell = table.cell(index, 'efficiency:name').node();
  const container = cell.querySelector('.efficiency-cell');

  if (container) {
    const root = createRoot(container);
    root.render(<ProfitPerHour trade={trade} inline={true} />);
  }
});
```

## Testing

Run the tests with:

```bash
npm test -- useProfitMetrics
npm test -- ProfitPerHour
```

## Performance Considerations

- The `calculateMetrics` function is memoized with `useCallback` for optimal performance
- Inline mode minimizes DOM elements for table rendering
- Details in inline mode are conditionally rendered only when clicked

## Assumptions and Limitations

1. **Market Capture Rate**: Default 50% assumes you can capture half the daily volume. Adjust based on your market presence.
2. **Trading Hours**: Assumes 24-hour trading day. EVE markets are always active, but your trading time may vary.
3. **Capital Calculation**: Caps at 100 units to keep initial investment reasonable.
4. **Competition**: Doesn't account for market competition or price changes over time.
5. **Volume Consistency**: Assumes daily volume is consistent throughout the day.

## Best Practices

1. **Use Inline Mode for Tables**: Keeps the UI compact and performant
2. **Use Expanded Mode for Details**: Provides comprehensive metrics when viewing individual trades
3. **Adjust Turnover Rate**: Conservative traders should use 0.3-0.4, aggressive traders 0.6-0.7
4. **Sort by Multiple Metrics**: Combine profit/hour with ROI for balanced decision-making
5. **Consider Capital Efficiency**: For traders with limited ISK, prioritize high efficiency trades

## Future Enhancements

Potential improvements for future versions:
- Historical volume trends
- Peak trading hours analysis
- Competition factor based on order book depth
- Dynamic turnover rate based on item type
- Risk assessment scoring
- Market volatility indicators
