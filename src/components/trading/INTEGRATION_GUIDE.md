# Market Analysis Components - Integration Guide

## Quick Start

### 1. Import Components

```jsx
import {
  MarketSpreadAnalyzer,
  PriceVolatilityIndex,
  ManipulationDetector,
  RegionalPriceComparison,
} from '@/components/trading';
```

### 2. Basic Usage

```jsx
function MyTradingPage() {
  return (
    <div>
      {/* Market Spread - shows bid/ask spread quality */}
      <MarketSpreadAnalyzer
        bidPrice={1250000}
        askPrice={1500000}
      />

      {/* Price Volatility - shows risk level */}
      <PriceVolatilityIndex
        typeId={34}
        regionId={10000002}
      />

      {/* Manipulation Detector - flags suspicious patterns */}
      <ManipulationDetector
        currentPrice={1500000}
        previousPrice={1000000}
        volume={50000}
        averageVolume={10000}
      />

      {/* Regional Comparison - shows arbitrage opportunities */}
      <RegionalPriceComparison
        typeId={34}
        volume={500}
      />
    </div>
  );
}
```

## Integration with Existing Pages

### Station Trading Page

Add spread and manipulation detection to help traders identify good opportunities:

```jsx
// src/pages/StationTradingPage.jsx
import { MarketSpreadAnalyzer, ManipulationDetector } from '@/components/trading';

function StationTradingPage() {
  // ... existing code

  return (
    <div>
      {/* Existing trading form */}
      <TradingForm />

      {/* Add market analysis */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <MarketSpreadAnalyzer
            bidPrice={results.highestBuy}
            askPrice={results.lowestSell}
          />
          <ManipulationDetector
            currentPrice={results.currentPrice}
            previousPrice={results.previousPrice}
            volume={results.volume}
            averageVolume={results.avgVolume}
          />
        </div>
      )}

      {/* Existing results table */}
      <TradingTable data={results} />
    </div>
  );
}
```

### Region Hauling Page

Add regional comparison to show best routes:

```jsx
// src/pages/RegionHaulingPage.jsx
import { RegionalPriceComparison } from '@/components/trading';

function RegionHaulingPage() {
  // ... existing code

  return (
    <div>
      {/* Existing hauling form */}
      <HaulingForm />

      {/* Add regional analysis for each item */}
      {selectedItems.map(item => (
        <div key={item.typeId} className="mb-6">
          <h3>{item.name}</h3>
          <RegionalPriceComparison
            typeId={item.typeId}
            volume={item.quantity}
          />
        </div>
      ))}
    </div>
  );
}
```

### Trading Table with Compact Views

Add inline indicators to your existing tables:

```jsx
// src/components/tables/TradingTable.jsx
import {
  MarketSpreadAnalyzer,
  PriceVolatilityIndex,
  ManipulationDetector,
  RegionalPriceComparison,
} from '@/components/trading';

function TradingTable({ trades }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Spread</th>
          <th>Volatility</th>
          <th>Risk</th>
          <th>Arbitrage</th>
        </tr>
      </thead>
      <tbody>
        {trades.map(trade => (
          <tr key={trade.id}>
            <td>{trade.name}</td>
            <td>{formatISK(trade.price)}</td>
            <td>
              <MarketSpreadAnalyzer
                bidPrice={trade.bidPrice}
                askPrice={trade.askPrice}
                compact
              />
            </td>
            <td>
              <PriceVolatilityIndex
                typeId={trade.typeId}
                regionId={trade.regionId}
                compact
              />
            </td>
            <td>
              <ManipulationDetector
                currentPrice={trade.currentPrice}
                previousPrice={trade.previousPrice}
                volume={trade.volume}
                averageVolume={trade.avgVolume}
                compact
              />
            </td>
            <td>
              <RegionalPriceComparison
                typeId={trade.typeId}
                compact
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Data Requirements

### MarketSpreadAnalyzer
- `bidPrice`: Highest buy order (from market orders API)
- `askPrice`: Lowest sell order (from market orders API)
- `historicalSpread`: (Optional) Average spread from historical data

### PriceVolatilityIndex
- `typeId`: EVE item type ID
- `regionId`: EVE region ID
- OR `priceHistory`: Array of historical prices

### ManipulationDetector
- `currentPrice`: Current market price
- `previousPrice`: Price 24h ago
- `volume`: Current 24h volume
- `averageVolume`: 7-day average volume
- `largeOrders`: (Optional) Array of large orders
- `priceHistory`: (Optional) Historical price data

### RegionalPriceComparison
- `typeId`: EVE item type ID
- `volume`: Trading volume for profit calculations

## API Integration

### Fetching Market Orders

```jsx
import { getMarketOrders } from '@/api/esi';

async function fetchMarketData(regionId, typeId) {
  const orders = await getMarketOrders(regionId, typeId);

  // Get highest buy and lowest sell
  const buyOrders = orders.filter(o => o.is_buy_order);
  const sellOrders = orders.filter(o => !o.is_buy_order);

  const highestBuy = Math.max(...buyOrders.map(o => o.price));
  const lowestSell = Math.min(...sellOrders.map(o => o.price));

  return { highestBuy, lowestSell, orders };
}
```

### Fetching Market History

```jsx
import { getMarketHistory } from '@/api/esi';

async function fetchHistoricalData(regionId, typeId) {
  const history = await getMarketHistory(regionId, typeId);

  // Get current and previous price
  const latest = history[history.length - 1];
  const previous = history[history.length - 2];

  return {
    currentPrice: latest.average,
    previousPrice: previous.average,
    volume: latest.volume,
    history,
  };
}
```

## Styling Customization

All components accept a `className` prop for custom styling:

```jsx
<MarketSpreadAnalyzer
  bidPrice={1000000}
  askPrice={1100000}
  className="shadow-lg rounded-xl"
/>
```

## Performance Optimization

### Caching
Components automatically cache API responses for 1 hour. To clear cache:

```jsx
import { clearCached } from '@/hooks/useCache';

// Clear specific cache
await clearCached('market_history_10000002_34');

// Clear all cache
await clearAllCache();
```

### Lazy Loading
For pages with many components, use lazy loading:

```jsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/common';

const MarketAnalysis = lazy(() => import('@/components/trading/MarketAnalysis'));

function TradingPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MarketAnalysis />
    </Suspense>
  );
}
```

## Troubleshooting

### Component Not Rendering
- Check that all required props are provided
- Verify data types (numbers not strings)
- Check browser console for errors

### API Errors
- Verify ESI API is accessible
- Check network tab for failed requests
- Ensure typeId and regionId are valid

### Styling Issues
- Ensure Tailwind CSS is configured correctly
- Check that custom colors are defined in tailwind.config.js
- Verify parent container has proper dimensions

## Examples

See `/src/components/trading/MarketAnalysis.example.jsx` for complete working examples including:
- Market Analysis Dashboard
- Trading Table with Compact Views
- Item Deep Dive
- Risk Assessment Widget
- Station Trading Dashboard
- Hauling Route Planner

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review example files for usage patterns
3. Check component JSDoc comments for prop details
4. Consult EVETrade documentation
