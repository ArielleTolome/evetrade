# Market Momentum & Trend Indicators

Comprehensive market analysis components for EVETrade that provide traders with actionable insights into market conditions, price trends, and trading opportunities.

## Overview

This suite of analytics components helps traders make informed decisions by analyzing:
- Market momentum and direction
- Price trends over multiple timeframes
- Future price projections
- Overall market health
- Trading signals based on technical indicators

## Components

### 1. MarketMomentum

Visual momentum indicator showing current market conditions at a glance.

**Features:**
- Bullish/Bearish/Neutral market classification
- Momentum score (-100 to 100)
- Volume momentum indicator
- Spread quality assessment
- Color-coded visual feedback

**Usage:**

```jsx
import { MarketMomentum } from '@/components/analytics';

<MarketMomentum
  trend="bullish"           // 'bullish', 'bearish', or 'neutral'
  momentum={75}             // -100 to 100
  volumeMomentum={25}       // Volume change percentage
  spread={10000}            // Price spread (sell - buy)
  midPrice={1250000}        // Mid price for calculations
  compact={false}           // Compact mode for tables
  showLabels={true}         // Show text labels
/>
```

**Compact Variants:**

```jsx
// Inline for tables
<MomentumIndicatorInline trend="bullish" momentum={75} />

// Badge for compact spaces
<MomentumBadge trend="bullish" />
```

### 2. TrendAnalysis

Detailed trend analysis panel showing price movements and market pressure.

**Features:**
- 7-day and 30-day price trends
- Volume trend analysis
- Buy/sell pressure indicator
- Predicted direction with confidence level
- Visual trend bars

**Usage:**

```jsx
import { TrendAnalysis } from '@/components/analytics';

<TrendAnalysis
  priceHistory={historicalPrices}    // Array of {date, average, high, low}
  volumeData={{
    recentAvg: 150,
    historicalAvg: 100
  }}
  currentPrice={1250000}
  buyVolume={5000000}
  sellVolume={4500000}
  predictedDirection="bullish"       // 'bullish', 'bearish', 'neutral'
  confidence={75}                    // 0-100
  compact={false}
/>
```

**Compact Variant:**

```jsx
<TrendIndicatorCompact trend="up" changePercent={5.2} />
```

### 3. PriceProjection

Price projection component with confidence bands and visualization.

**Features:**
- 1-week, 1-month, and 3-month projections
- Confidence bands based on volatility
- Linear regression analysis
- Simple chart visualization
- Projected price changes

**Usage:**

```jsx
import { PriceProjection } from '@/components/analytics';

<PriceProjection
  currentPrice={1250000}
  priceHistory={historicalPrices}    // Array of {date, average, high, low}
  compact={false}
/>
```

**Calculations:**
- Uses linear regression on last 30 days of price data
- Adjusts confidence based on R-squared and volatility
- Confidence bands scale with projection timeframe

### 4. MarketHealth

Market health score component showing overall market quality.

**Features:**
- Overall health score (0-100)
- Liquidity score (volume + order depth)
- Stability score (volatility + spread)
- Opportunity score (margin + volume + trend)
- Visual radar chart
- Color-coded status indicators

**Usage:**

```jsx
import { MarketHealth } from '@/components/analytics';

<MarketHealth
  volume={150}                  // Daily volume
  orderDepth={9500000}          // Total buy + sell orders
  volatility={12}               // Volatility percentage
  spread={10000}                // Price spread
  midPrice={1250000}            // Mid price
  marginPercent={5}             // Profit margin %
  trend={25}                    // Momentum (-100 to 100)
  compact={false}
/>
```

**Compact Variants:**

```jsx
// Badge
<HealthBadge score={85} />

// Circular meter
<HealthMeter score={85} size={80} />
```

**Scoring:**
- **Liquidity (35%)**: Based on trading volume and order book depth
- **Stability (30%)**: Based on price volatility and spread
- **Opportunity (35%)**: Based on profit margin, volume, and trend

## Hook: useMomentum

Custom hook for calculating market momentum and technical indicators.

**Features:**
- RSI (Relative Strength Index)
- Moving Averages (SMA, EMA)
- MACD (Moving Average Convergence Divergence)
- VWAP (Volume-Weighted Average Price)
- Volume momentum
- Buy/sell pressure
- Trading signals generation

**Usage:**

```jsx
import { useMomentum } from '@/hooks/useMomentum';

const momentum = useMomentum(
  priceHistory,    // Array of {date, average, high, low}
  volumeHistory,   // Array of {date, volume}
  {                // Order book data
    buy_volume: 5000000,
    sell_volume: 4500000
  }
);

// Returns:
// {
//   trend: 'bullish' | 'bearish' | 'neutral',
//   momentum: -100 to 100,
//   confidence: 0 to 100,
//   strength: 'strong' | 'moderate' | 'weak',
//   indicators: {
//     rsi: number,
//     shortMA: number,
//     longMA: number,
//     ema12: number,
//     ema26: number,
//     macd: number,
//     macdSignal: number,
//     macdHistogram: number,
//     vwap: number,
//     volatility: number,
//     volumeMomentum: number,
//     pressure: number
//   },
//   signals: Array<{
//     type: 'buy' | 'sell' | 'neutral',
//     strength: 'strong' | 'moderate' | 'weak',
//     reason: string,
//     indicator: string,
//     value: number
//   }>,
//   hasData: boolean,
//   dataPoints: number
// }
```

## Hook: usePriceChange

Simple hook for calculating price change over time.

**Usage:**

```jsx
import { usePriceChange } from '@/hooks/useMomentum';

const change = usePriceChange(
  currentPrice,     // Current price
  priceHistory,     // Historical data
  7                 // Days to look back
);

// Returns:
// {
//   change: number,           // Absolute change
//   changePercent: number,    // Percentage change
//   direction: 'up' | 'down' | 'neutral',
//   oldPrice: number
// }
```

## Integration Examples

### In a Trading Table

```jsx
import {
  MomentumIndicatorInline,
  TrendIndicatorCompact,
  HealthBadge
} from '@/components/analytics';

<table>
  <thead>
    <tr>
      <th>Item</th>
      <th>Price</th>
      <th>Momentum</th>
      <th>7d Trend</th>
      <th>Health</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{formatISK(item.price)}</td>
        <td>
          <MomentumIndicatorInline
            trend={item.momentum.trend}
            momentum={item.momentum.value}
          />
        </td>
        <td>
          <TrendIndicatorCompact
            trend={item.priceChange.direction}
            changePercent={item.priceChange.percent}
          />
        </td>
        <td>
          <HealthBadge score={item.healthScore} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### In a Detail Panel

```jsx
import {
  MarketMomentum,
  TrendAnalysis,
  PriceProjection,
  MarketHealth
} from '@/components/analytics';
import { useMomentum } from '@/hooks/useMomentum';

function ItemDetailPanel({ item }) {
  const momentum = useMomentum(
    item.priceHistory,
    item.volumeHistory,
    item.orderBook
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <MarketMomentum
        trend={momentum.trend}
        momentum={momentum.momentum}
        volumeMomentum={momentum.indicators.volumeMomentum}
        spread={item.spread}
        midPrice={item.midPrice}
      />

      <MarketHealth
        volume={item.volume}
        orderDepth={item.orderDepth}
        volatility={momentum.indicators.volatility}
        spread={item.spread}
        midPrice={item.midPrice}
        marginPercent={item.marginPercent}
        trend={momentum.momentum}
      />

      <div className="col-span-2">
        <TrendAnalysis
          priceHistory={item.priceHistory}
          volumeData={item.volumeData}
          currentPrice={item.currentPrice}
          buyVolume={item.buyVolume}
          sellVolume={item.sellVolume}
          predictedDirection={momentum.trend}
          confidence={momentum.confidence}
        />
      </div>

      <div className="col-span-2">
        <PriceProjection
          currentPrice={item.currentPrice}
          priceHistory={item.priceHistory}
        />
      </div>
    </div>
  );
}
```

## Technical Indicators Explained

### RSI (Relative Strength Index)
- Range: 0-100
- > 70: Overbought (potential sell signal)
- < 30: Oversold (potential buy signal)
- 40-60: Neutral zone

### Moving Averages
- **Short MA (7-day)**: Recent price trend
- **Long MA (30-day)**: Overall price trend
- **Golden Cross**: Short MA crosses above Long MA (bullish)
- **Death Cross**: Short MA crosses below Long MA (bearish)

### MACD
- **MACD Line**: Difference between 12-day and 26-day EMA
- **Signal Line**: 9-day EMA of MACD
- **Histogram**: Difference between MACD and Signal
- Positive MACD = Bullish, Negative = Bearish

### Volume Momentum
- Compares recent 7-day volume to historical average
- > 25%: Surging volume
- > 0%: Rising volume
- < -25%: Falling volume

### Buy/Sell Pressure
- Ratio of buy orders to sell orders
- > 60%: Strong buy pressure
- < 40%: Strong sell pressure
- 45-55%: Balanced

## Color Coding

### Trend Colors
- **Green**: Bullish/Positive/Good
- **Red**: Bearish/Negative/Poor
- **Yellow**: Neutral/Stable/Fair
- **Cyan**: Excellent/High quality

### Health Score Ranges
- **80-100**: Excellent (Green)
- **60-79**: Good (Cyan)
- **40-59**: Fair (Yellow)
- **20-39**: Poor (Orange)
- **0-19**: Very Poor (Red)

## Performance Considerations

- All calculations are memoized using React's `useMemo`
- Historical data should be cached where possible
- Compact modes reduce DOM complexity for tables
- Price projections use efficient linear regression
- Indicators update only when input data changes

## Best Practices

1. **Use compact modes in tables** to maintain performance with large datasets
2. **Cache historical data** to avoid recalculating indicators
3. **Show full components** in detail views or modals for in-depth analysis
4. **Combine indicators** for stronger trading signals
5. **Consider timeframes** - short-term vs long-term trends may differ
6. **Use confidence levels** to gauge reliability of predictions
7. **Monitor multiple indicators** - don't rely on a single metric

## Future Enhancements

Potential additions to these components:
- Bollinger Bands
- Fibonacci retracements
- Support/Resistance levels
- Order flow analysis
- Market depth visualization
- Comparative analysis (multiple items)
- Custom indicator configuration
- Historical backtesting

## See Also

- [Volume Indicators Documentation](./VolumeTrendIndicators.md)
- [Analytics Dashboard](../src/components/analytics/AnalyticsDashboard.example.jsx)
- [EVE ESI Market Data](https://esi.evetech.net/ui/)
