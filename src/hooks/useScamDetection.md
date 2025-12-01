# useScamDetection Hook

A comprehensive scam detection and volume analysis system for EVE Online station trading. This hook analyzes market trades to identify potential scams, market manipulation, and suspicious trading patterns.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Detection Criteria](#detection-criteria)
- [Risk Levels](#risk-levels)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Common Scam Patterns](#common-scam-patterns)
- [Best Practices](#best-practices)

## Overview

The `useScamDetection` hook provides intelligent scam detection for EVE Online market trades by analyzing:

- **Volume Patterns**: Single-unit trades, abnormally low volumes
- **Margin Anomalies**: Margins that are "too good to be true"
- **Price Spreads**: Extreme differences between buy and sell prices
- **Market Comparison**: Volume and margin deviations from market averages
- **Profit/Volume Ratio**: High profit on suspiciously low volume

## Installation

The hook is already included in the project. Import it in your component:

```jsx
import { useScamDetection } from '../hooks/useScamDetection';
```

## API Reference

### useScamDetection(options?)

Main hook function that returns scam detection utilities.

**Parameters:**
- `options` (Object, optional): Configuration object to customize detection thresholds

**Returns:** Object with the following methods:

#### calculateScamRisk(trade, allTrades?)

Calculates a comprehensive risk score for a single trade.

**Parameters:**
- `trade` (Object): Trade object with properties like 'Volume', 'Gross Margin', 'Buy Price', 'Sell Price'
- `allTrades` (Array, optional): All trades in the market for comparison

**Returns:** Object with:
```javascript
{
  score: 65,           // Risk score 0-100
  reasons: [...],      // Array of warning messages
  level: 'high',       // 'low' | 'medium' | 'high' | 'extreme'
  metadata: {          // Extracted trade data
    volume: 1,
    margin: 60,
    buyPrice: 1000000,
    sellPrice: 1600000,
    netProfit: 600000
  }
}
```

#### isLikelyScam(trade, allTrades?)

Quick boolean check if a trade is likely a scam.

**Parameters:**
- `trade` (Object): Trade to check
- `allTrades` (Array, optional): Market context

**Returns:** `boolean` - true if risk score >= 50

#### getScamWarnings(trade, allTrades?)

Get array of human-readable warning messages.

**Parameters:**
- `trade` (Object): Trade to analyze
- `allTrades` (Array, optional): Market context

**Returns:** `Array<string>` - Warning messages

#### getDetailedAssessment(trade, allTrades?)

Get comprehensive risk assessment with recommendations.

**Parameters:**
- `trade` (Object): Trade to analyze
- `allTrades` (Array, optional): Market context

**Returns:** Object with:
```javascript
{
  score: 65,
  reasons: [...],
  level: 'high',
  recommendations: [
    'CAUTION - High scam risk detected',
    'Verify item authenticity in-game before trading',
    ...
  ],
  summary: 'HIGH RISK (65/100)'
}
```

#### analyzeAll(trades)

Batch analyze multiple trades and sort by risk.

**Parameters:**
- `trades` (Array): Array of trade objects

**Returns:** Array of trades with `scamRisk` property attached, sorted by risk score (highest first)

#### getScamStatistics(trades)

Get statistical overview of scam prevalence in a dataset.

**Parameters:**
- `trades` (Array): Array of trades to analyze

**Returns:** Object with:
```javascript
{
  total: 100,
  extremeRisk: 5,
  highRisk: 15,
  mediumRisk: 30,
  lowRisk: 50,
  averageScore: 28.5
}
```

## Detection Criteria

### Volume Analysis

| Volume | Points Added | Risk Indicator |
|--------|-------------|----------------|
| 1 unit | +60 | Classic scam pattern |
| 2-5 units | +30 | Very low volume |
| 6-20 units | +10 | Low volume |
| > 20 units | 0 | Normal volume |

### Margin Analysis

| Margin | Points Added | Risk Indicator |
|--------|-------------|----------------|
| > 50% | +25 | Too good to be true |
| 40-50% | +15 | Very high margin |
| < 40% | 0 | Normal margin |

### Price Spread Analysis

| Spread | Points Added | Risk Indicator |
|--------|-------------|----------------|
| Sell > Buy × 10 | +20 | Extreme price manipulation |
| < 10× | 0 | Normal spread |

### Combined Factors

| Condition | Points Added | Risk Indicator |
|-----------|-------------|----------------|
| Profit > 10M ISK + Volume ≤ 5 | +10 | High profit, low volume |
| Volume < 10% of market avg | +15 | Far below market average |
| Margin > avg + 2σ | +10 | Statistical outlier |

## Risk Levels

| Level | Score Range | Color Code | Recommendation |
|-------|------------|------------|----------------|
| **Low** | 0-29 | 🟢 Green | Relatively safe |
| **Medium** | 30-49 | 🟡 Yellow | Proceed with caution |
| **High** | 50-69 | 🟠 Orange | High risk, verify carefully |
| **Extreme** | 70-100 | 🔴 Red | DO NOT TRADE |

## Usage Examples

### Basic Usage in StationTradingPage

```jsx
import { useScamDetection } from '../hooks/useScamDetection';

function StationTradingPage() {
  const { calculateScamRisk, isLikelyScam } = useScamDetection();
  const [data, setData] = useState([]);

  // Add risk indicator to table columns
  const columns = [
    // ... existing columns
    {
      key: 'risk',
      label: 'Risk',
      render: (_, row) => {
        const risk = calculateScamRisk(row, data);

        if (risk.level === 'low') return null;

        return (
          <div className={`risk-badge ${risk.level}`}>
            {risk.level.toUpperCase()}
          </div>
        );
      }
    }
  ];

  return (/* ... */);
}
```

### Warning Modal for High-Risk Trades

```jsx
function TradeWarning({ trade, allTrades, onProceed }) {
  const { getDetailedAssessment } = useScamDetection();
  const assessment = getDetailedAssessment(trade, allTrades);

  if (assessment.level === 'low') return null;

  return (
    <div className="modal">
      <h2>{assessment.summary}</h2>
      <ul>
        {assessment.reasons.map(reason => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <ul>
        {assessment.recommendations.map(rec => (
          <li key={rec}>{rec}</li>
        ))}
      </ul>
      {assessment.level !== 'extreme' && (
        <button onClick={onProceed}>Proceed Anyway</button>
      )}
    </div>
  );
}
```

### Statistics Dashboard

```jsx
function ScamDashboard({ trades }) {
  const { getScamStatistics } = useScamDetection();
  const stats = getScamStatistics(trades);

  return (
    <div className="stats">
      <div>Total: {stats.total}</div>
      <div className="red">Extreme: {stats.extremeRisk}</div>
      <div className="orange">High: {stats.highRisk}</div>
      <div className="yellow">Medium: {stats.mediumRisk}</div>
      <div className="green">Low: {stats.lowRisk}</div>
      <div>Avg Score: {stats.averageScore.toFixed(1)}/100</div>
    </div>
  );
}
```

### Filter Safe Trades Only

```jsx
function SafeTradesList({ trades }) {
  const { analyzeAll } = useScamDetection();

  const safeTrades = useMemo(() => {
    const analyzed = analyzeAll(trades);
    return analyzed.filter(t =>
      t.scamRisk.level === 'low' ||
      t.scamRisk.level === 'medium'
    );
  }, [trades, analyzeAll]);

  return (
    <div>
      Showing {safeTrades.length} safe trades
      {/* render trades */}
    </div>
  );
}
```

## Configuration

Customize detection thresholds by passing options:

```jsx
const { calculateScamRisk } = useScamDetection({
  // Volume thresholds
  singleVolumePoints: 80,           // default: 60
  veryLowVolumePoints: 40,          // default: 30
  lowVolumePoints: 15,              // default: 10
  veryLowVolumeThreshold: 3,        // default: 5
  lowVolumeThreshold: 30,           // default: 20

  // Margin thresholds
  extremeMarginPoints: 30,          // default: 25
  veryHighMarginPoints: 20,         // default: 15
  extremeMarginThreshold: 45,       // default: 50
  veryHighMarginThreshold: 35,      // default: 40

  // Price spread thresholds
  extremeSpreadPoints: 25,          // default: 20
  extremeSpreadMultiplier: 8,       // default: 10

  // Market comparison
  volumeDeviationPoints: 20,        // default: 15
  volumeDeviationRatio: 0.05,       // default: 0.1
  minMarketSampleSize: 50,          // default: 100

  // Risk levels
  extremeRiskThreshold: 75,         // default: 70
  highRiskThreshold: 55,            // default: 50
  mediumRiskThreshold: 35,          // default: 30
  scamThreshold: 45,                // default: 50
});
```

### Conservative Mode

```jsx
const conservative = useScamDetection({
  singleVolumePoints: 80,
  scamThreshold: 40,
  extremeMarginThreshold: 40,
  lowVolumeThreshold: 50,
});
```

### Aggressive Mode (Higher Risk Tolerance)

```jsx
const aggressive = useScamDetection({
  singleVolumePoints: 40,
  scamThreshold: 65,
  extremeMarginThreshold: 60,
  lowVolumeThreshold: 10,
});
```

## Common Scam Patterns

### 1. Jita PLEX Scam

**Pattern:**
- Single unit volume
- Extremely high margin (70-90%)
- Buy price well above market

**Example:**
```javascript
{
  Item: 'PLEX',
  Volume: 1,
  'Gross Margin': 80,
  'Buy Price': 3500000,
  'Sell Price': 6300000
}
// Risk Score: 85+ (EXTREME)
```

### 2. Margin Trading Scam

**Pattern:**
- Very low volume (1-5 units)
- Massive price spread (10x+)
- Unrealistic arbitrage opportunity

**Example:**
```javascript
{
  Item: 'Rare Blueprint',
  Volume: 2,
  'Gross Margin': 95,
  'Buy Price': 500000,
  'Sell Price': 9750000
}
// Risk Score: 90+ (EXTREME)
```

### 3. Fake Arbitrage

**Pattern:**
- Low volume
- High margin (40-60%)
- Price significantly above historical average

**Example:**
```javascript
{
  Item: 'Tech 2 Module',
  Volume: 10,
  'Gross Margin': 55,
  'Buy Price': 2000000,
  'Sell Price': 3100000
}
// Risk Score: 60-70 (HIGH)
```

### 4. Legitimate High-Volume Trade (Not a Scam)

**Pattern:**
- High volume (500+ units)
- Reasonable margin (10-30%)
- Consistent with market averages

**Example:**
```javascript
{
  Item: 'Compressed Ore',
  Volume: 1000,
  'Gross Margin': 15,
  'Buy Price': 100000,
  'Sell Price': 115000
}
// Risk Score: 0-15 (LOW)
```

## Best Practices

### 1. Always Provide Market Context

```jsx
// ✅ Good - provides market context
const risk = calculateScamRisk(trade, allTrades);

// ⚠️ Less accurate - no context
const risk = calculateScamRisk(trade);
```

### 2. Show Warnings Before Trade Execution

```jsx
const handleTrade = (trade) => {
  if (isLikelyScam(trade, allTrades)) {
    showWarningModal(trade);
  } else {
    executeTrade(trade);
  }
};
```

### 3. Use Visual Indicators

```jsx
const getRiskColor = (level) => {
  switch (level) {
    case 'extreme': return 'bg-red-600';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    default: return 'bg-green-500';
  }
};
```

### 4. Filter by Default, Don't Hide

```jsx
// ✅ Show all but highlight risky trades
<TradeList trades={trades} highlightRisk />

// ⚠️ Don't hide high-risk trades entirely
// Users should see warnings to learn
```

### 5. Educate Users

Display explanations for risk scores:

```jsx
{risk.reasons.map(reason => (
  <Tooltip content={reason}>
    <WarningIcon />
  </Tooltip>
))}
```

### 6. Monitor False Positives

Track legitimate trades flagged as scams to tune thresholds:

```jsx
const handleFalsePositive = (trade) => {
  // Log for analysis
  console.log('False positive reported:', {
    trade,
    risk: calculateScamRisk(trade, allTrades)
  });
};
```

### 7. Combine with Historical Data

```jsx
// Use historical volume from evetrade_historical_volume
const enhancedRisk = calculateScamRisk(trade, allTrades);
if (trade.historicalVolume > 10000 && enhancedRisk.level === 'high') {
  // Probably false positive - high historical volume
  enhancedRisk.level = 'medium';
}
```

## Integration Checklist

- [ ] Import hook in StationTradingPage
- [ ] Add risk column to trading table
- [ ] Display warning badges for high-risk trades
- [ ] Show detailed assessment on row click/hover
- [ ] Add scam statistics to dashboard
- [ ] Create warning modal for extreme risk trades
- [ ] Add filter toggle for risk levels
- [ ] Test with known scam patterns
- [ ] Monitor and tune thresholds based on feedback
- [ ] Document risk indicators in help page

## Performance Considerations

- Hook uses `useMemo` and `useCallback` for optimization
- Market comparison only runs when `allTrades` has sufficient data
- Batch analysis (`analyzeAll`) processes all trades in one pass
- No external API calls - all calculations are local

## TypeScript Support

While the hook is written in JSX, TypeScript definitions can be added:

```typescript
interface Trade {
  'Volume': number;
  'Gross Margin': number;
  'Buy Price': number;
  'Sell Price': number;
  'Net Profit'?: number;
  'Item'?: string;
}

interface ScamRisk {
  score: number;
  reasons: string[];
  level: 'low' | 'medium' | 'high' | 'extreme';
  metadata: {
    volume: number;
    margin: number;
    buyPrice: number;
    sellPrice: number;
    netProfit: number;
  };
}

interface UseScamDetection {
  calculateScamRisk: (trade: Trade, allTrades?: Trade[]) => ScamRisk;
  isLikelyScam: (trade: Trade, allTrades?: Trade[]) => boolean;
  getScamWarnings: (trade: Trade, allTrades?: Trade[]) => string[];
  // ... other methods
}
```

## Contributing

To improve scam detection:

1. Report false positives/negatives
2. Suggest new detection patterns
3. Contribute threshold tuning based on real data
4. Add support for additional scam types

## Related Resources

- [EVE University - Market Scams](https://wiki.eveuniversity.org/Scams_in_EVE_Online#Market_scams)
- [EVE Online Market Guide](https://www.eveonline.com/market)
- [Station Trading Guide](https://wiki.eveuniversity.org/Trading)

## License

This hook is part of the EVETrade project and follows the same license.
