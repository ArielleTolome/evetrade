# TradeRiskScore Component Usage Guide

## Overview

The `TradeRiskScore` component provides a comprehensive risk assessment for trading opportunities in EVE Online. It analyzes multiple risk factors and displays an overall risk score with detailed breakdowns.

**Component Location**: `/src/components/common/TradeRiskScore.jsx`

## Features

- **Holistic Risk Assessment**: Combines 4 key risk factors with weighted scoring
- **Visual Risk Gauge**: Animated circular gauge showing overall risk (0-100)
- **Risk Factor Breakdown**: Individual analysis of each risk component
- **Multiple Display Modes**: Compact badge for tables, full display for detail views
- **Color-Coded Risk Levels**: Low (green), Medium (yellow), High (orange), Extreme (red)
- **Expandable Details**: Optional collapsible view for space-saving

## Risk Factors Analyzed

### 1. Volume Risk (35% weight)
- **Purpose**: Detect scam potential and liquidity issues
- **Scoring**:
  - Volume = 0: 100 risk (cannot execute)
  - Volume = 1: 100 risk (extreme scam risk)
  - Volume ≤ 5: 70 risk (high scam risk)
  - Volume ≤ 20: 40 risk (moderate liquidity concerns)
  - Volume ≤ 50: 20 risk (minor liquidity risk)
  - Volume > 50: 0 risk (good liquidity)

### 2. Margin Risk (25% weight)
- **Purpose**: Identify suspicious deals and competitive markets
- **Scoring**:
  - Margin > 50%: 80 risk (likely scam/stale data)
  - Margin > 40%: 50 risk (suspicious, verify)
  - Margin < 3%: 60 risk (highly competitive)
  - Margin < 5%: 30 risk (competitive)
  - Margin 15-30%: 0 risk (healthy margin)

### 3. Capital Risk (20% weight)
- **Purpose**: Assess capital exposure and investment size
- **Calculation**: `buyPrice × min(volume, 100)`
- **Scoring**:
  - Capital > 10B ISK: 90 risk (extreme exposure)
  - Capital > 1B ISK: 70 risk (significant exposure)
  - Capital > 100M ISK: 40 risk (moderate)
  - Capital > 10M ISK: 15 risk (low)
  - Capital < 10M ISK: 0 risk (safe)

### 4. Spread Risk (20% weight)
- **Purpose**: Detect price volatility and market instability
- **Calculation**: `((sellPrice - buyPrice) / buyPrice) × 100`
- **Scoring**:
  - Spread > 200%: 95 risk (extreme instability)
  - Spread > 100%: 80 risk (high volatility)
  - Spread > 50%: 50 risk (notable volatility)
  - Spread > 25%: 25 risk (moderate)
  - Spread < 25%: 0 risk (stable)

## Overall Risk Levels

| Level | Score Range | Color | Description |
|-------|-------------|-------|-------------|
| **Low** | 0-25 | Green | Safe trade with minimal risk factors |
| **Medium** | 26-50 | Yellow | Moderate risk, proceed with caution |
| **High** | 51-75 | Orange | Significant risk, careful consideration needed |
| **Extreme** | 76-100 | Red | Very high risk, likely a scam or unrealistic |

## Usage Examples

### 1. Compact Badge Mode (for Tables)

Perfect for displaying risk scores in DataTables columns:

```jsx
import { TradeRiskBadge } from '../components/common/TradeRiskScore';

// In your table column definition
{
  title: 'Risk',
  data: null,
  render: (data, type, row) => {
    // Create a container that React can render into
    return '<div class="risk-badge-container"></div>';
  },
  createdCell: (td, cellData, rowData) => {
    const container = td.querySelector('.risk-badge-container');
    const root = createRoot(container);
    root.render(<TradeRiskBadge trade={rowData} />);
  }
}
```

Or simpler inline usage:

```jsx
<TradeRiskScore trade={tradeData} compact={true} />
// or use the convenience export:
<TradeRiskBadge trade={tradeData} />
```

### 2. Full Display Mode

For detail pages or expanded views:

```jsx
import TradeRiskScore from '../components/common/TradeRiskScore';

function TradeDetailPage({ trade }) {
  return (
    <div>
      <h2>Trade Analysis</h2>
      <TradeRiskScore
        trade={trade}
        showGauge={true}
        showBreakdown={true}
        expandable={false}
      />
    </div>
  );
}
```

### 3. Expandable Mode

Space-saving collapsible version:

```jsx
<TradeRiskScore
  trade={trade}
  expandable={true}
  showGauge={true}
  showBreakdown={true}
/>
```

### 4. Custom Display Options

```jsx
// Gauge only, no breakdown
<TradeRiskScore
  trade={trade}
  showGauge={true}
  showBreakdown={false}
/>

// Breakdown only, no gauge
<TradeRiskScore
  trade={trade}
  showGauge={false}
  showBreakdown={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trade` | Object | **required** | Trade data object with price, volume, margin fields |
| `compact` | Boolean | `false` | Show compact badge view (for table cells) |
| `showBreakdown` | Boolean | `true` | Display individual risk factor breakdown |
| `showGauge` | Boolean | `true` | Show circular gauge visualization |
| `expandable` | Boolean | `false` | Allow toggling details on/off |

## Required Trade Data Fields

The component expects these fields in the `trade` object:

```javascript
{
  'Volume': 100,              // Number of items available
  'Gross Margin': 15.5,       // Margin percentage (15.5 = 15.5%)
  'Buy Price': 1000000,       // ISK per unit
  'Sell Price': 1155000,      // ISK per unit
  'Net Profit': 155000        // ISK profit (used for context)
}
```

All fields are optional with safe defaults (0) if missing.

## Integration with TradingTable

### Adding Risk Column to DataTable

```jsx
import { createRoot } from 'react-dom/client';
import { TradeRiskBadge } from './components/common/TradeRiskScore';

const columns = [
  // ... other columns
  {
    title: 'Risk',
    data: null,
    orderable: true,
    className: 'text-center',
    render: (data, type, row) => {
      if (type === 'sort' || type === 'filter') {
        // Calculate risk score for sorting/filtering
        const factors = calculateRiskFactors(row);
        const { totalScore } = calculateOverallRisk(factors);
        return totalScore;
      }
      return '<div class="risk-badge-container"></div>';
    },
    createdCell: (td, cellData, rowData) => {
      const container = td.querySelector('.risk-badge-container');
      if (container) {
        const root = createRoot(container);
        root.render(<TradeRiskBadge trade={rowData} />);
      }
    }
  },
  // ... other columns
];
```

### Sorting by Risk Score

The risk score is calculated consistently, so you can sort by it:

```javascript
// Default sort by risk (safest first)
order: [[riskColumnIndex, 'asc']]

// Or most risky first
order: [[riskColumnIndex, 'desc']]
```

## Styling and Theming

The component uses the existing EVETrade theme:

- **Dark Mode**: Space-themed colors (`space-dark`, `accent-cyan`)
- **Risk Colors**:
  - Green (`text-green-400`, `bg-green-400`)
  - Yellow (`text-yellow-400`, `bg-yellow-400`)
  - Orange (`text-orange-400`, `bg-orange-400`)
  - Red (`text-red-500`, `bg-red-500`)
- **Animations**: Smooth transitions on gauge and bars (700-1000ms)
- **Shadows**: Glow effects for risk level emphasis

## Performance Considerations

- Uses `useMemo` to cache risk calculations
- Re-calculates only when `trade` object changes
- Lightweight rendering in compact mode
- Efficient SVG gauge with CSS transitions

## Best Practices

1. **Always Show Risk in Tables**: Help users identify risky trades at a glance
2. **Use Compact Mode for Lists**: Full display for single-trade views
3. **Combine with Other Metrics**: Risk score complements profit and margin data
4. **Educate Users**: Link to help documentation explaining risk factors
5. **Filter by Risk**: Allow users to filter out extreme-risk trades

## Example: Complete Implementation

```jsx
import { useState } from 'react';
import TradeRiskScore, { TradeRiskBadge } from './components/common/TradeRiskScore';
import { formatISK } from './utils/formatters';

function TradingOpportunityCard({ trade }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
      {/* Header with compact badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{trade['Type Name']}</h3>
        <TradeRiskBadge trade={trade} />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-text-secondary">Net Profit</div>
          <div className="text-green-400 font-mono">
            {formatISK(trade['Net Profit'])}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Margin</div>
          <div className="text-accent-cyan font-mono">
            {trade['Gross Margin'].toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary">Volume</div>
          <div className="text-text-primary font-mono">
            {trade['Volume']}
          </div>
        </div>
      </div>

      {/* Toggle detailed risk */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-accent-cyan hover:text-accent-cyan/80"
      >
        {showDetails ? 'Hide' : 'Show'} Risk Analysis
      </button>

      {/* Detailed risk view */}
      {showDetails && (
        <div className="mt-4">
          <TradeRiskScore
            trade={trade}
            showGauge={true}
            showBreakdown={true}
            expandable={false}
          />
        </div>
      )}
    </div>
  );
}

export default TradingOpportunityCard;
```

## Testing

Example trade data for testing different risk levels:

```javascript
// Low risk trade
const lowRiskTrade = {
  'Type Name': 'Tritanium',
  'Volume': 10000,
  'Gross Margin': 15,
  'Buy Price': 5.50,
  'Sell Price': 6.33,
  'Net Profit': 8300
};

// High risk trade (low volume)
const highRiskTrade = {
  'Type Name': 'Rare Blueprint',
  'Volume': 1,
  'Gross Margin': 45,
  'Buy Price': 500000000,
  'Sell Price': 725000000,
  'Net Profit': 225000000
};

// Extreme risk trade (suspicious margin)
const extremeRiskTrade = {
  'Type Name': 'Suspicious Item',
  'Volume': 1,
  'Gross Margin': 80,
  'Buy Price': 100000,
  'Sell Price': 180000,
  'Net Profit': 80000
};
```

## Future Enhancements

Potential additions to consider:

- Historical risk tracking (trend over time)
- User risk preferences (hide trades above certain risk level)
- Custom risk weights (let users adjust factor importance)
- Additional risk factors (region security status, market activity, etc.)
- Risk score API for backend filtering

## Support

For questions or issues with the TradeRiskScore component:
- Review the component code: `/src/components/common/TradeRiskScore.jsx`
- Check existing implementations in the codebase
- Refer to similar components: `TradingStats.jsx`, `ProgressBar.jsx`
