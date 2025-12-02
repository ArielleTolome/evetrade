# useMarketTrends Hook

A React hook for analyzing EVE Online market history data to identify trends and predict price movements.

## Features

- **Trend Detection**: Identifies bullish, bearish, or neutral market trends using linear regression
- **Price Predictions**: Forecasts future prices based on historical patterns
- **Support & Resistance**: Calculates key price levels for trading decisions
- **Volume Analysis**: Detects volume trends (increasing, decreasing, stable)
- **Confidence Scoring**: Provides confidence levels (0-100) for predictions
- **Price Change Tracking**: Monitors 7-day and 30-day price changes

## Installation

The hook is already integrated into the project. No additional installation needed.

## Basic Usage

```jsx
import { useMarketTrends } from '../hooks/useMarketTrends';

function MarketAnalysis({ typeId, regionId }) {
  const {
    trend,
    trendStrength,
    predictedPrice,
    confidence,
    loading,
    error
  } = useMarketTrends(typeId, regionId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Market Trend: {trend}</h3>
      <p>Strength: {trendStrength}%</p>
      <p>Predicted Price: {predictedPrice?.toLocaleString()} ISK</p>
      <p>Confidence: {confidence}%</p>
    </div>
  );
}
```

## API Reference

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `typeId` | number | Yes | EVE Online item type ID |
| `regionId` | number | Yes | EVE Online region ID |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `trend` | string | Trend direction: 'bullish', 'bearish', or 'neutral' |
| `trendStrength` | number | Strength of trend (0-100) |
| `priceChange7d` | number | Percentage price change over 7 days |
| `priceChange30d` | number | Percentage price change over 30 days |
| `volumeTrend` | string | Volume trend: 'increasing', 'decreasing', or 'stable' |
| `predictedPrice` | number \| null | Estimated price for next day |
| `confidence` | number | Prediction confidence level (0-100) |
| `supportLevel` | number \| null | Support price level |
| `resistanceLevel` | number \| null | Resistance price level |
| `loading` | boolean | Data loading state |
| `error` | object \| null | Error information if fetch fails |
| `marketHistory` | array | Raw market history data |

### Analysis Functions

The hook also exports these utility functions for custom analysis:

#### `calculateMovingAverage(data, period)`

Calculates simple moving average.

```jsx
const { calculateMovingAverage } = useMarketTrends(typeId, regionId);
const prices = [100, 102, 104, 106, 108];
const ma3 = calculateMovingAverage(prices, 3);
// Returns: [102, 104, 106]
```

#### `calculateTrend(prices)`

Performs linear regression to determine trend.

```jsx
const { calculateTrend } = useMarketTrends(typeId, regionId);
const trend = calculateTrend([100, 102, 104, 106, 108]);
// Returns: { slope: 2, intercept: 100, r2: 1.0 }
```

#### `calculateSupportResistance(prices)`

Identifies support and resistance levels.

```jsx
const { calculateSupportResistance } = useMarketTrends(typeId, regionId);
const levels = calculateSupportResistance([100, 120, 95, 125, 90]);
// Returns: { supportLevel: 95, resistanceLevel: 122.5 }
```

#### `predictPrice(history, days)`

Predicts future price based on trend.

```jsx
const { predictPrice } = useMarketTrends(typeId, regionId);
const history = [{ average: 100 }, { average: 102 }, { average: 104 }];
const predicted = predictPrice(history, 1);
// Returns predicted price for 1 day ahead
```

## Examples

### Complete Market Analysis Dashboard

See [useMarketTrends.example.jsx](./useMarketTrends.example.jsx) for comprehensive examples including:
- Full market trend analysis component
- Simple market trend display
- Advanced custom analysis using exported functions

### Trading Signals

```jsx
function TradingSignals({ typeId, regionId }) {
  const {
    trend,
    trendStrength,
    supportLevel,
    resistanceLevel,
    marketHistory,
  } = useMarketTrends(typeId, regionId);

  const currentPrice = marketHistory[marketHistory.length - 1]?.average;

  const signals = [];

  if (trend === 'bullish' && trendStrength > 50) {
    signals.push('🟢 Strong buy signal - Bullish trend');
  }

  if (currentPrice && supportLevel && currentPrice <= supportLevel * 1.05) {
    signals.push('🟢 Price near support - Good entry point');
  }

  if (currentPrice && resistanceLevel && currentPrice >= resistanceLevel * 0.95) {
    signals.push('🔴 Price near resistance - Consider taking profit');
  }

  return (
    <div>
      {signals.map((signal, i) => (
        <div key={i}>{signal}</div>
      ))}
    </div>
  );
}
```

### Price Chart with Moving Averages

```jsx
function PriceChart({ typeId, regionId }) {
  const {
    marketHistory,
    calculateMovingAverage,
    loading,
  } = useMarketTrends(typeId, regionId);

  if (loading || !marketHistory.length) return null;

  const prices = marketHistory.map(d => d.average);
  const ma7 = calculateMovingAverage(prices, 7);
  const ma30 = calculateMovingAverage(prices, 30);

  return (
    <div>
      <h4>Price Chart</h4>
      <p>Current: {prices[prices.length - 1].toLocaleString()} ISK</p>
      <p>7-Day MA: {ma7[ma7.length - 1]?.toFixed(2)} ISK</p>
      <p>30-Day MA: {ma30[ma30.length - 1]?.toFixed(2)} ISK</p>
    </div>
  );
}
```

## Algorithm Details

### Trend Calculation

Uses linear regression to fit a trend line through historical prices:
- **Slope** determines trend direction and strength
- **R-squared** (coefficient of determination) measures how well the trend fits
- Trend strength combines slope magnitude and R-squared value

### Support & Resistance

Identifies local price extrema:
- **Support**: Average of recent local minimum prices
- **Resistance**: Average of recent local maximum prices
- Uses 3 most recent extrema for calculation

### Price Prediction

Simple linear extrapolation:
- Projects the trend line forward by specified days
- Constrains predictions to reasonable bounds (1% to 200% of current price)
- Confidence based on data availability, trend fit, and volume stability

### Volume Trend

Compares recent vs earlier volume:
- **Increasing**: Recent 7-day average > 15% higher than previous 7 days
- **Decreasing**: Recent 7-day average > 15% lower than previous 7 days
- **Stable**: Change within ±15%

## Performance

- Automatically fetches market history on mount
- Memoizes calculations using `useMemo` and `useCallback`
- Cleans up on unmount to prevent memory leaks
- Typical response time: < 500ms for 90 days of data

## Error Handling

- Gracefully handles missing or invalid data
- Reports errors to Sentry for monitoring
- Returns null/default values for insufficient data
- Validates all inputs before calculations

## Testing

Comprehensive test suite with 23+ test cases covering:
- Trend detection (bullish, bearish, neutral)
- Price change calculations
- Volume trend analysis
- Support/resistance levels
- Price predictions
- Error handling
- Edge cases

Run tests:
```bash
npm test -- useMarketTrends.test.js
```

## Dependencies

- React 19 (useState, useEffect, useCallback, useMemo)
- ESI API client (`../api/esi`)
- Sentry for error tracking

## Browser Support

Works in all modern browsers with ES6+ support.

## License

Part of the EVETrade project.

## Related

- [useProfitMetrics](./useProfitMetrics.jsx) - Calculate profit metrics
- [usePriceAlerts](./usePriceAlerts.js) - Price alert system
- [ESI API](../api/esi.js) - EVE Online API client
