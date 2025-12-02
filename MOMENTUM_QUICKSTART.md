# Market Momentum Analytics - Quick Start Guide

Get started with EVETrade's market momentum and trend indicators in 5 minutes.

## Quick Installation

All components are already installed. Just import and use!

## 1. Basic Momentum Indicator

Add momentum to a single item:

```jsx
import { useMomentum } from './hooks/useMomentum';
import { MomentumBadge } from './components/analytics';

function ItemCard({ item }) {
  const momentum = useMomentum(
    item.priceHistory,
    item.volumeHistory,
    item.orderBook
  );

  return (
    <div>
      <h3>{item.name}</h3>
      <MomentumBadge trend={momentum.trend} />
      <p>Momentum: {momentum.momentum.toFixed(0)}</p>
    </div>
  );
}
```

## 2. Add to Trading Tables

Enhance your trading tables with compact indicators:

```jsx
import {
  MomentumIndicatorInline,
  TrendIndicatorCompact,
  HealthBadge
} from './components/analytics';

function TradingTableRow({ item }) {
  return (
    <tr>
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
  );
}
```

## 3. Full Analytics Dashboard

Create a complete analytics view:

```jsx
import {
  MarketMomentum,
  TrendAnalysis,
  PriceProjection,
  MarketHealth
} from './components/analytics';
import { useMomentum } from './hooks/useMomentum';

function ItemAnalytics({ item }) {
  const momentum = useMomentum(
    item.priceHistory,
    item.volumeHistory,
    { buy_volume: item.buyVolume, sell_volume: item.sellVolume }
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Top row - Key metrics */}
      <MarketMomentum
        trend={momentum.trend}
        momentum={momentum.momentum}
        volumeMomentum={momentum.indicators.volumeMomentum}
        spread={item.sellPrice - item.buyPrice}
        midPrice={(item.buyPrice + item.sellPrice) / 2}
      />

      <MarketHealth
        volume={item.volume}
        orderDepth={item.buyVolume + item.sellVolume}
        volatility={momentum.indicators.volatility}
        spread={item.sellPrice - item.buyPrice}
        midPrice={(item.buyPrice + item.sellPrice) / 2}
        marginPercent={item.marginPercent}
        trend={momentum.momentum}
      />

      {/* Bottom row - Detailed analysis */}
      <TrendAnalysis
        priceHistory={item.priceHistory}
        volumeData={{
          recentAvg: item.recentVolume,
          historicalAvg: item.avgVolume
        }}
        currentPrice={item.currentPrice}
        buyVolume={item.buyVolume}
        sellVolume={item.sellVolume}
        predictedDirection={momentum.trend}
        confidence={momentum.confidence}
      />

      <PriceProjection
        currentPrice={item.currentPrice}
        priceHistory={item.priceHistory}
      />
    </div>
  );
}
```

## 4. Simple Price Change

Track price changes without full momentum analysis:

```jsx
import { usePriceChange } from './hooks/useMomentum';
import { TrendIndicatorCompact } from './components/analytics';

function PriceTracker({ item }) {
  const change7d = usePriceChange(item.currentPrice, item.priceHistory, 7);
  const change30d = usePriceChange(item.currentPrice, item.priceHistory, 30);

  return (
    <div>
      <div>
        7-day: <TrendIndicatorCompact
          trend={change7d.direction}
          changePercent={change7d.changePercent}
        />
      </div>
      <div>
        30-day: <TrendIndicatorCompact
          trend={change30d.direction}
          changePercent={change30d.changePercent}
        />
      </div>
    </div>
  );
}
```

## 5. Trading Signals

Display automated trading signals:

```jsx
import { useMomentum } from './hooks/useMomentum';

function TradingSignals({ item }) {
  const momentum = useMomentum(
    item.priceHistory,
    item.volumeHistory,
    item.orderBook
  );

  return (
    <div>
      <h3>Trading Signals ({momentum.signals.length})</h3>
      {momentum.signals.map((signal, idx) => (
        <div
          key={idx}
          className={`
            p-2 rounded border
            ${signal.type === 'buy' ? 'bg-green-500/10 border-green-500/30' : ''}
            ${signal.type === 'sell' ? 'bg-red-500/10 border-red-500/30' : ''}
          `}
        >
          <strong>{signal.type.toUpperCase()}</strong> - {signal.reason}
          <div className="text-xs">
            {signal.indicator}: {signal.value} ({signal.strength})
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Data Format

Your API should return data in this format:

```javascript
{
  // Current market data
  currentPrice: 1250000,
  buyPrice: 1245000,
  sellPrice: 1255000,
  volume: 150,
  buyVolume: 5000000,
  sellVolume: 4500000,

  // Historical data (at least 7 days, ideally 30)
  priceHistory: [
    {
      date: "2025-11-24T00:00:00Z",
      average: 1250000,
      high: 1275000,
      low: 1225000,
      volume: 150
    },
    // ... more entries
  ],

  volumeHistory: [
    {
      date: "2025-11-24T00:00:00Z",
      volume: 150
    },
    // ... more entries
  ],

  // Optional: Order book data for pressure indicators
  orderBook: {
    buy_volume: 5000000,
    sell_volume: 4500000
  }
}
```

## Component Cheat Sheet

### Full Components (for dashboards/detail views)
- `<MarketMomentum />` - Visual momentum indicator
- `<TrendAnalysis />` - Multi-timeframe trend analysis
- `<PriceProjection />` - Price forecasting
- `<MarketHealth />` - Overall market scoring

### Compact Components (for tables/grids)
- `<MomentumBadge />` - Minimal momentum badge
- `<MomentumIndicatorInline />` - Inline momentum display
- `<TrendIndicatorCompact />` - Compact trend arrow
- `<HealthBadge />` - Health score badge
- `<HealthMeter />` - Circular health gauge

### Hooks
- `useMomentum(prices, volumes, orderBook)` - Full momentum analysis
- `usePriceChange(current, history, days)` - Simple price change

## Common Props

Most components accept these common props:

```jsx
// Display mode
compact={false}          // Switch to compact mode
showLabels={true}        // Show/hide text labels

// Market data
trend="bullish"          // 'bullish' | 'bearish' | 'neutral'
momentum={75}            // -100 to 100
currentPrice={1250000}   // Current price in ISK
priceHistory={[...]}     // Array of historical prices
volumeHistory={[...]}    // Array of historical volumes

// Order book
buyVolume={5000000}      // Total buy order volume
sellVolume={4500000}     // Total sell order volume

// Spread
spread={10000}           // sellPrice - buyPrice
midPrice={1247500}       // (buyPrice + sellPrice) / 2
```

## Color Guide

Components use consistent color coding:

- **Green**: Bullish, positive, increasing, good
- **Red**: Bearish, negative, decreasing, poor
- **Yellow**: Neutral, stable, fair
- **Cyan**: Excellent, high quality

## Performance Tips

1. **Cache historical data** - Don't fetch on every render
2. **Use compact mode in tables** - Better performance with large datasets
3. **Memoize calculations** - The hook already does this
4. **Limit data points** - 30 days is usually sufficient
5. **Debounce updates** - Don't update on every price tick

## Example: Complete Item Card

```jsx
import { useMomentum } from './hooks/useMomentum';
import {
  MomentumBadge,
  HealthMeter,
  TrendIndicatorCompact
} from './components/analytics';
import { formatISK } from './utils/formatters';

function ItemCard({ item }) {
  const momentum = useMomentum(
    item.priceHistory,
    item.volumeHistory,
    { buy_volume: item.buyVolume, sell_volume: item.sellVolume }
  );

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">{item.name}</h3>
        <MomentumBadge trend={momentum.trend} />
      </div>

      {/* Price */}
      <div className="text-2xl font-mono mb-2">
        {formatISK(item.currentPrice)}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-400">7d Change</div>
          <TrendIndicatorCompact
            trend={item.priceChange7d.direction}
            changePercent={item.priceChange7d.percent}
          />
        </div>
        <div>
          <div className="text-xs text-gray-400">Health</div>
          <HealthMeter score={item.healthScore} size={40} />
        </div>
      </div>

      {/* Signals */}
      {momentum.signals.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-1">
            {momentum.signals.length} Trading Signals
          </div>
          {momentum.signals.slice(0, 2).map((signal, idx) => (
            <div key={idx} className="text-xs text-gray-300">
              • {signal.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Next Steps

1. **Try the example**: Check out `MomentumAnalytics.example.jsx`
2. **Read the docs**: See `docs/MomentumIndicators.md`
3. **Integrate**: Add to your existing pages
4. **Customize**: Adjust colors and thresholds to your needs

## Need Help?

- **Full Documentation**: `/docs/MomentumIndicators.md`
- **Example Code**: `/src/components/analytics/MomentumAnalytics.example.jsx`
- **Summary**: `MOMENTUM_ANALYTICS_SUMMARY.md`

Happy Trading! 🚀
