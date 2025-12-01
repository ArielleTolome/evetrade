# TradeRiskScore Component

## Quick Start

```jsx
import TradeRiskScore, { TradeRiskBadge } from './components/common/TradeRiskScore';

// Compact badge for tables
<TradeRiskBadge trade={tradeData} />

// Full display
<TradeRiskScore trade={tradeData} />

// Expandable version
<TradeRiskScore trade={tradeData} expandable={true} />
```

## What It Does

The TradeRiskScore component evaluates trading opportunities across 4 key risk dimensions:

1. **Volume Risk** (35%) - Scam detection via volume analysis
2. **Margin Risk** (25%) - Suspicious margins and market competition
3. **Capital Risk** (20%) - Investment size and exposure
4. **Spread Risk** (20%) - Price volatility and instability

The component outputs:
- Overall risk score (0-100)
- Risk level (Low/Medium/High/Extreme) with color coding
- Individual risk factor breakdown with explanations
- Animated circular gauge
- Expandable detailed view

## Visual Examples

### Compact Badge Mode
```
[✓ 18]  <- Low risk, green badge
[⚠ 45]  <- Medium risk, yellow badge
[⚠ 68]  <- High risk, orange badge
[⛔ 85] <- Extreme risk, red badge
```

### Full Display Mode
```
┌─────────────────────────────────────────┐
│ Trade Risk Assessment                    │
│ [Circular Gauge: 45]  [MEDIUM Risk]     │
├─────────────────────────────────────────┤
│ Volume Risk    [100 units]    20/100    │
│ ████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│ Acceptable volume - minor liquidity risk │
│                                          │
│ Margin Risk    [15.5%]        10/100    │
│ ████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│ Healthy margin - good opportunity        │
│                                          │
│ Capital Risk   [1.55M ISK]    15/100    │
│ ██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│ Low capital required - minimal exposure  │
│                                          │
│ Spread Risk    [15.1%]        25/100    │
│ ██████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │
│ Moderate spread - some volatility        │
└─────────────────────────────────────────┘
```

## Risk Score Interpretation

| Score | Level | Meaning | Action |
|-------|-------|---------|--------|
| 0-25 | **Low** | Safe trade opportunity | Execute with confidence |
| 26-50 | **Medium** | Some risk factors present | Proceed with caution |
| 51-75 | **High** | Multiple risk concerns | Careful verification needed |
| 76-100 | **Extreme** | Severe risk indicators | Likely scam, avoid |

## Component Props

```typescript
TradeRiskScore({
  trade: {                    // Required: Trade data object
    'Volume': number,         // Available quantity
    'Gross Margin': number,   // Margin % (15 = 15%)
    'Buy Price': number,      // ISK per unit
    'Sell Price': number,     // ISK per unit
    'Net Profit': number      // ISK profit
  },
  compact?: boolean,          // Default: false - Show badge only
  showBreakdown?: boolean,    // Default: true - Show factor details
  showGauge?: boolean,        // Default: true - Show circular gauge
  expandable?: boolean        // Default: false - Collapsible details
})
```

## Risk Factor Details

### Volume Risk (35% weight)
**Purpose**: Detect scam schemes and liquidity problems

| Volume | Risk Score | Interpretation |
|--------|-----------|----------------|
| 0 | 100 | Cannot execute trade |
| 1 | 100 | Classic scam pattern |
| 2-5 | 70 | Very suspicious |
| 6-20 | 40 | Limited liquidity |
| 21-50 | 20 | Acceptable |
| 51+ | 0 | Good liquidity |

**Why it matters**: Many EVE Online scams involve placing 1-unit sell orders at attractive prices. Real trading opportunities typically have higher volume.

### Margin Risk (25% weight)
**Purpose**: Identify unrealistic deals and intense competition

| Margin | Risk Score | Interpretation |
|--------|-----------|----------------|
| >50% | 80 | Likely scam or stale data |
| 40-50% | 50 | Suspicious, verify |
| 15-30% | 0 | Healthy margin |
| 5-15% | 10 | Normal |
| 3-5% | 30 | Competitive |
| <3% | 60 | Highly competitive |

**Why it matters**: Margins >40% are rare in legitimate trades. Margins <3% indicate fierce competition with thin profit margins.

### Capital Risk (20% weight)
**Purpose**: Assess financial exposure and commitment

**Calculation**: `Buy Price × min(Volume, 100)`

| Capital | Risk Score | Interpretation |
|---------|-----------|----------------|
| >10B ISK | 90 | Extreme exposure |
| 1-10B ISK | 70 | High exposure |
| 100M-1B ISK | 40 | Moderate |
| 10-100M ISK | 15 | Low |
| <10M ISK | 0 | Minimal |

**Why it matters**: Larger investments have higher risk if the trade goes bad. Consider your total capital when evaluating.

### Spread Risk (20% weight)
**Purpose**: Measure price volatility and market stability

**Calculation**: `((Sell - Buy) / Buy) × 100`

| Spread | Risk Score | Interpretation |
|--------|-----------|----------------|
| >200% | 95 | Extreme volatility |
| 100-200% | 80 | Very volatile |
| 50-100% | 50 | Volatile |
| 25-50% | 25 | Moderate |
| <25% | 0 | Stable |

**Why it matters**: Large spreads indicate unstable pricing, making it harder to predict actual execution prices.

## Integration Examples

### In a DataTable Column

```jsx
import { createRoot } from 'react-dom/client';
import { TradeRiskBadge } from './components/common/TradeRiskScore';

const columns = [
  {
    title: 'Risk',
    data: null,
    className: 'text-center',
    render: (data, type, row) => {
      if (type === 'sort') {
        // Return numeric score for sorting
        const factors = calculateRiskFactors(row);
        return calculateOverallRisk(factors).totalScore;
      }
      return '<div class="risk-badge"></div>';
    },
    createdCell: (td, cellData, rowData) => {
      const container = td.querySelector('.risk-badge');
      const root = createRoot(container);
      root.render(<TradeRiskBadge trade={rowData} />);
    }
  }
];
```

### In a Trade Detail Modal

```jsx
function TradeDetailModal({ trade, onClose }) {
  return (
    <div className="modal">
      <h2>{trade['Type Name']}</h2>

      {/* Risk Assessment */}
      <TradeRiskScore
        trade={trade}
        showGauge={true}
        showBreakdown={true}
      />

      {/* Other trade details */}
      <div className="trade-metrics">
        {/* ... */}
      </div>

      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### As a Filter Criterion

```jsx
import { calculateRiskFactors, calculateOverallRisk } from './components/common/TradeRiskScore';

function TradeFilters({ trades, onFilter }) {
  const [maxRisk, setMaxRisk] = useState(75); // Filter out extreme risk

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const factors = calculateRiskFactors(trade);
      const { totalScore } = calculateOverallRisk(factors);
      return totalScore <= maxRisk;
    });
  }, [trades, maxRisk]);

  return (
    <div>
      <label>Max Risk Level: {maxRisk}</label>
      <input
        type="range"
        min="0"
        max="100"
        value={maxRisk}
        onChange={(e) => setMaxRisk(Number(e.target.value))}
      />
      <div>Showing {filteredTrades.length} of {trades.length} trades</div>
    </div>
  );
}
```

## Styling & Theming

The component uses EVETrade's theme variables:

```css
/* Background colors */
bg-space-dark/30      /* Card backgrounds */
border-accent-cyan/10 /* Subtle borders */

/* Risk level colors */
text-green-400   /* Low risk */
text-yellow-400  /* Medium risk */
text-orange-400  /* High risk */
text-red-500     /* Extreme risk */

/* Animations */
transition-all duration-700   /* Bar animations */
transition-all duration-1000  /* Gauge animations */
```

Override styles if needed:

```jsx
<div className="custom-risk-wrapper">
  <TradeRiskScore trade={trade} />
</div>

<style jsx>{`
  .custom-risk-wrapper {
    /* Your custom styles */
  }
`}</style>
```

## Performance

- **Memoized Calculations**: Risk scores cached until trade data changes
- **Lightweight Rendering**: Compact mode renders minimal DOM
- **Efficient Updates**: Only recalculates when necessary
- **SVG Optimization**: Gauge uses CSS transforms, not JS animation

## Accessibility

- Semantic HTML structure
- Color is not the only indicator (icons + text labels)
- Tooltips provide additional context
- Keyboard navigable (when expandable)

## Testing Data

```javascript
// Test different risk scenarios
const testTrades = {
  low: {
    'Volume': 5000,
    'Gross Margin': 18,
    'Buy Price': 10000,
    'Sell Price': 11800,
    'Net Profit': 9000000
  },
  medium: {
    'Volume': 25,
    'Gross Margin': 8,
    'Buy Price': 500000,
    'Sell Price': 540000,
    'Net Profit': 1000000
  },
  high: {
    'Volume': 5,
    'Gross Margin': 35,
    'Buy Price': 100000000,
    'Sell Price': 135000000,
    'Net Profit': 175000000
  },
  extreme: {
    'Volume': 1,
    'Gross Margin': 75,
    'Buy Price': 1000000,
    'Sell Price': 1750000,
    'Net Profit': 750000
  }
};
```

## FAQ

**Q: Can I adjust the risk factor weights?**
A: Yes, modify the `weight` values in `calculateRiskFactors()`. Ensure they sum to 1.0.

**Q: How do I export risk calculations for backend use?**
A: Export `calculateRiskFactors` and `calculateOverallRisk` functions separately.

**Q: Can I add custom risk factors?**
A: Yes, add new factor objects in `calculateRiskFactors()` with score, weight, and reason.

**Q: What if my trade data has different field names?**
A: Create a mapping function or adjust the field names in the component.

**Q: How do I translate the risk labels?**
A: Modify the `RISK_LEVELS` object with your translations.

## Related Components

- `TradingStats` - Overall dataset statistics
- `TradingTable` - Main data display component
- `ProgressBar` - Similar gauge visualization

## Version History

- **v1.0** - Initial release with 4 risk factors, gauge, and breakdown
- Supports compact and full display modes
- Expandable details option
- Comprehensive tooltips and explanations

## License

Part of the EVETrade project. See main repository for license details.
