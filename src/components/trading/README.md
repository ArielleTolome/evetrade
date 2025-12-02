# Trading Components - Market Analysis Suite

A comprehensive set of React components for analyzing EVE Online markets, detecting manipulation, and identifying trading opportunities.

## Components Overview

### 1. MarketSpreadAnalyzer
Displays bid/ask spread analysis for market trading decisions.

**Features:**
- Bid/ask spread as percentage
- Color-coded spreads (tight = green, wide = red)
- Historical spread comparison
- Visual spread indicator
- Compact and full view modes

**Usage:**
```jsx
import { MarketSpreadAnalyzer } from './components/trading';

// Full view
<MarketSpreadAnalyzer
  bidPrice={1250000}
  askPrice={1500000}
  historicalSpread={0.15}
/>

// Compact view (for tables)
<MarketSpreadAnalyzer
  bidPrice={5000000}
  askPrice={5100000}
  compact
/>
```

**Props:**
- `bidPrice` (number, required) - Highest buy order price
- `askPrice` (number, required) - Lowest sell order price
- `historicalSpread` (number, optional) - Historical average spread percentage
- `compact` (boolean, default: false) - Show compact inline view
- `className` (string, optional) - Additional CSS classes

**Spread Ratings:**
- Excellent: ≤1% (green)
- Good: 1-3% (cyan)
- Fair: 3-7% (yellow)
- Wide: 7-15% (orange)
- Very Wide: >15% (red)

---

### 2. PriceVolatilityIndex
Calculates and displays price volatility based on historical market data.

**Features:**
- Standard deviation calculation
- Volatility rating (Low/Medium/High/Extreme)
- Visual price range indicator
- Fetches market history from ESI API
- Risk level assessment
- Loading and error states

**Usage:**
```jsx
import { PriceVolatilityIndex } from './components/trading';

// Auto-fetch from ESI
<PriceVolatilityIndex
  typeId={34}
  regionId={10000002}
/>

// With manual data
<PriceVolatilityIndex
  priceHistory={[
    { date: '2024-01-01', average: 1000000, highest: 1100000, lowest: 900000 },
    // ... more data points
  ]}
  compact
/>
```

**Props:**
- `typeId` (number, optional) - EVE item type ID for auto-fetch
- `regionId` (number, optional) - EVE region ID for auto-fetch
- `priceHistory` (array, optional) - Manual price history data
- `compact` (boolean, default: false) - Show compact inline view
- `className` (string, optional) - Additional CSS classes

**Volatility Ratings:**
- Low: ≤5% CV (green) - Stable prices, low risk
- Medium: 5-15% CV (cyan) - Moderate swings, balanced risk/reward
- High: 15-30% CV (yellow) - Significant fluctuations, high risk/reward
- Extreme: >30% CV (red) - Highly unstable, speculative

**Data Source:**
Uses last 30 days of market history from ESI API endpoint: `/markets/{region_id}/history/?type_id={type_id}`

---

### 3. ManipulationDetector
Detects suspicious market manipulation patterns.

**Features:**
- Price spike detection (>30% in 24h)
- Price crash detection (>30% drop in 24h)
- Volume manipulation (>5x average)
- Price wall detection (large orders)
- Pump & dump pattern recognition
- Artificial stability detection
- Risk level indicator (None/Low/Medium/High/Critical)

**Usage:**
```jsx
import { ManipulationDetector } from './components/trading';

<ManipulationDetector
  currentPrice={1500000}
  previousPrice={1000000}
  volume={50000}
  averageVolume={10000}
  largeOrders={[
    { volume: 1500, price: 1450000, is_buy_order: true },
  ]}
  priceHistory={[
    { average: 1000000 },
    { average: 1400000 },
    { average: 1100000 },
  ]}
/>
```

**Props:**
- `currentPrice` (number, required) - Current market price
- `previousPrice` (number, required) - Price 24h ago
- `volume` (number, required) - Current 24h volume
- `averageVolume` (number, required) - 7-day average volume
- `largeOrders` (array, optional) - Large orders to analyze
- `priceHistory` (array, optional) - Historical price data
- `compact` (boolean, default: false) - Show compact inline view
- `className` (string, optional) - Additional CSS classes

**Detection Patterns:**
1. **Price Spike**: >30% increase in 24h (High severity)
2. **Price Crash**: >30% decrease in 24h (High severity)
3. **Volume Spike**: Volume >5x average (Medium/High severity)
4. **Price Wall**: Single order >20% of daily volume (Medium severity)
5. **Pump & Dump**: Spike followed by rapid decline (Critical severity)
6. **Artificial Stability**: <0.5% variation over 7 days (Low severity)

**Risk Levels:**
- None: No issues detected (green)
- Low: Minor irregularities (cyan)
- Medium: Some manipulation indicators (yellow)
- High: Multiple manipulation indicators (orange)
- Critical: Severe manipulation detected (red)

---

### 4. RegionalPriceComparison
Compares item prices across major EVE Online trade hubs.

**Features:**
- Compares 5 major trade hubs (Jita, Amarr, Dodixie, Rens, Hek)
- Shows lowest buy and highest sell prices
- Calculates arbitrage opportunities
- Jump count and route planning
- ISK per jump efficiency metrics
- Best buy/sell location highlighting
- Auto-fetches market orders

**Usage:**
```jsx
import { RegionalPriceComparison } from './components/trading';

// Auto-fetch prices
<RegionalPriceComparison
  typeId={34}
  volume={500}
/>

// Compact view (for tables)
<RegionalPriceComparison
  typeId={34}
  compact
/>
```

**Props:**
- `typeId` (number, required) - EVE item type ID
- `volume` (number, default: 100) - Trading volume for profit calculations
- `compact` (boolean, default: false) - Show compact inline view
- `className` (string, optional) - Additional CSS classes

**Trade Hubs:**
- Jita IV - Moon 4 (The Forge) - Usually cheapest
- Amarr VIII (Domain)
- Dodixie IX (Sinq Laison)
- Rens VI (Heimatar)
- Hek VIII (Metropolis)

**Data Source:**
Fetches market orders from ESI API: `/markets/{region_id}/orders/?type_id={type_id}`

---

## Complete Examples

### Station Trading Dashboard
```jsx
import {
  MarketSpreadAnalyzer,
  ManipulationDetector,
} from './components/trading';

function StationTradingView({ item }) {
  return (
    <div className="space-y-4">
      <MarketSpreadAnalyzer
        bidPrice={item.bidPrice}
        askPrice={item.askPrice}
        historicalSpread={item.avgSpread}
      />

      <ManipulationDetector
        currentPrice={item.currentPrice}
        previousPrice={item.previousPrice}
        volume={item.volume}
        averageVolume={item.avgVolume}
      />
    </div>
  );
}
```

### Trading Table with Compact Views
```jsx
import {
  MarketSpreadAnalyzer,
  PriceVolatilityIndex,
  ManipulationDetector,
  RegionalPriceComparison,
} from './components/trading';

function TradingTable({ trades }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Item</th>
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

### Hauling Route Planner
```jsx
import { RegionalPriceComparison } from './components/trading';

function HaulingRoutes({ commodities }) {
  return (
    <div className="space-y-4">
      {commodities.map(item => (
        <div key={item.typeId}>
          <h3>{item.name}</h3>
          <RegionalPriceComparison
            typeId={item.typeId}
            volume={item.cargoCapacity}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## Styling

All components follow the EVETrade design system:

**Color Scheme:**
- `accent-cyan` - Primary accent color
- `accent-gold` - Secondary accent color
- `space-dark` - Dark background
- `space-mid` - Mid-tone background
- `text-primary` - Primary text color
- `text-secondary` - Secondary text color

**Risk Colors:**
- Green (400/500) - Safe, low risk, positive
- Cyan (400/500) - Medium risk, informational
- Yellow (400/500) - Caution, moderate risk
- Orange (400/500) - Warning, high risk
- Red (400/500) - Danger, critical risk

**Responsive Design:**
All components are responsive and work on mobile, tablet, and desktop screens.

---

## Performance Considerations

### Caching
Components use the `useCache` hook to cache API responses:
- Market history: 1 hour cache
- Regional prices: 1 hour cache

### Loading States
All components with API calls include loading states with spinners.

### Error Handling
All components gracefully handle errors and display user-friendly messages.

### Memoization
Expensive calculations are memoized using `useMemo` to prevent unnecessary re-computations.

---

## API Integration

### ESI API Endpoints Used

1. **Market History**
   - Endpoint: `/markets/{region_id}/history/?type_id={type_id}`
   - Used by: PriceVolatilityIndex
   - Returns: Daily market statistics (date, average, highest, lowest, volume)

2. **Market Orders**
   - Endpoint: `/markets/{region_id}/orders/?type_id={type_id}`
   - Used by: RegionalPriceComparison, MarketSpreadAnalyzer
   - Returns: Current market orders with prices and volumes

### Rate Limiting
ESI API has rate limits:
- Error limit: 100 requests per second
- Burst limit: 10 requests per second

Components implement caching to minimize API calls.

---

## Testing

See `MarketAnalysis.example.jsx` for comprehensive usage examples and test scenarios.

---

## Dependencies

- React 19+
- `../../utils/formatters` - formatISK, formatPercent, formatNumber, formatCompact
- `../../api/esi` - getMarketHistory, getMarketOrders
- `../../hooks/useCache` - getCached, setCached
- `../../utils/constants` - TRADE_HUBS
- `../common/LoadingSpinner` - Loading states

---

## Future Enhancements

Potential improvements:
1. Real-time market data streaming via WebSockets
2. Machine learning for manipulation detection
3. Historical volatility charts with interactive graphs
4. Multi-region route optimization
5. Portfolio tracking and risk analysis
6. Price alert notifications
7. Market depth visualization
8. Order book heat maps

---

## Contributing

When adding new features:
1. Follow existing code patterns
2. Use Tailwind CSS classes
3. Include JSDoc comments
4. Add loading and error states
5. Support both compact and full views
6. Update this README with examples

---

## License

Part of the EVETrade project. See main project LICENSE file.
