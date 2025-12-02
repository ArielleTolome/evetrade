# Market Velocity Analysis - Quick Start Guide

## Overview

The `useMarketVelocity` hook analyzes EVE Online market data to identify high-turnover trading opportunities. It helps traders find items that sell quickly, reducing the time capital is tied up in inventory.

## What is Market Velocity?

Market velocity measures how fast items sell in the market. High velocity means:
- Items turn over quickly
- Your ISK isn't locked up for long
- Lower risk of price changes while holding inventory
- More trading cycles per day/week

The hook calculates a **Velocity Score (0-100)** based on:
1. **Daily Volume**: How much trades per day
2. **Days to Sell**: How long it takes to clear current supply
3. **Order Competition**: How many other traders are active

## Quick Start

### Basic Usage

```javascript
import { useMarketVelocity } from '../hooks/useMarketVelocity';

function MyTradingPage() {
  const jitaRegionId = 10000002;

  const { velocities, loading, error } = useMarketVelocity(jitaRegionId, {
    typeIds: [34, 35, 36], // Tritanium, Pyerite, Mexallon
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {velocities.map(item => (
        <div key={item.typeId}>
          <h3>Type {item.typeId}</h3>
          <p>Velocity Score: {item.velocityScore}/100</p>
          <p>Days to Sell: {item.daysToSell}</p>
          <p>Daily Volume: {item.dailyVolume7d.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## Configuration Options

### `typeIds` (Array<number>, required)
List of item type IDs to analyze.

```javascript
typeIds: [34, 35, 36, 37, 38]  // Minerals
```

### `minVolume` (number, default: 0)
Minimum daily trading volume threshold.

```javascript
minVolume: 10000  // Only items with 10k+ daily volume
```

### `minVelocityScore` (number, default: 0)
Minimum velocity score (0-100).

```javascript
minVelocityScore: 60  // Only high-velocity items
```

### `minSpread` (number, default: 0)
Minimum profit spread percentage.

```javascript
minSpread: 5  // At least 5% spread
```

### `competitionFilter` (string, default: 'all')
Filter by competition level: `'all'`, `'low'`, `'medium'`, `'high'`, `'extreme'`.

```javascript
competitionFilter: 'low'  // Only low competition items
```

## Return Values

### `velocities` (Array)
Array of velocity analysis objects, one per item:

```javascript
{
  typeId: 34,
  velocityScore: 75,           // 0-100 score
  dailyVolume7d: 15000,        // 7-day average daily volume
  dailyVolume30d: 14500,       // 30-day average daily volume
  volumeTrend: 'increasing',   // 'increasing', 'decreasing', 'stable'
  volumeTrendPercent: 12.5,    // Percentage change
  daysToSell: 3.2,             // Estimated days to sell current supply
  currentSpread: 8.5,          // Current buy/sell spread %
  competitionLevel: 'low',     // 'low', 'medium', 'high', 'extreme'
  sellOrders: 15,              // Number of competing sell orders
  totalSellVolume: 50000,      // Total available supply
  bestBuyPrice: 5.50,          // Highest buy order price
  bestSellPrice: 6.00,         // Lowest sell order price
  lastUpdated: Date            // Timestamp of analysis
}
```

### `loading` (boolean)
True while fetching data.

### `error` (Object)
Error object if fetch failed: `{ message: string, original: Error }`

### `lastUpdated` (Date)
Timestamp of last data fetch.

### `refresh` (Function)
Manually trigger data refresh:

```javascript
<button onClick={refresh}>Refresh Data</button>
```

### `statistics` (Object)
Aggregate statistics across all filtered items:

```javascript
{
  totalItems: 10,
  averageVelocityScore: 65,
  averageDailyVolume: 12500,
  averageDaysToSell: 4.5,
  averageSpread: 6.8,
  highVelocityCount: 3  // Items with score >= 70
}
```

### `topOpportunities` (Array)
Top 10 items sorted by velocity score (highest first).

## Understanding Velocity Score

### Score Ranges

- **80-100**: Exceptional quick-flip opportunity
  - Sells in hours to 1-2 days
  - Very high volume
  - Low inventory risk

- **60-79**: Good active trading opportunity
  - Sells in 2-5 days
  - High volume
  - Moderate inventory risk

- **40-59**: Moderate turnover
  - Sells in 5-10 days
  - Medium volume
  - Requires patience

- **0-39**: Slow mover
  - Sells in 10+ days
  - Low volume
  - High capital tie-up risk

## Common Use Cases

### 1. Find Quick Flip Opportunities

```javascript
const { topOpportunities } = useMarketVelocity(10000002, {
  typeIds: tradingItemList,
  minVelocityScore: 70,
  minSpread: 3,
  competitionFilter: 'low'
});

// topOpportunities contains best quick-flip items
```

### 2. Track Volume Trends

```javascript
const { velocities } = useMarketVelocity(regionId, {
  typeIds: watchlist
});

const trending = velocities.filter(item =>
  item.volumeTrend === 'increasing' &&
  item.volumeTrendPercent > 20
);
```

### 3. Multi-Region Comparison

```javascript
const jitaVelocity = useMarketVelocity(10000002, { typeIds: [34] });
const amarrVelocity = useMarketVelocity(10000043, { typeIds: [34] });

// Compare velocity between regions
const bestRegion = jitaVelocity.velocities[0].velocityScore >
                   amarrVelocity.velocities[0].velocityScore
                   ? 'Jita' : 'Amarr';
```

### 4. Real-time Monitoring

```javascript
const { velocities, refresh, lastUpdated } = useMarketVelocity(regionId, {
  typeIds: portfolioItems
});

// Auto-refresh every 5 minutes
useEffect(() => {
  const interval = setInterval(refresh, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [refresh]);
```

## Trading Strategies

### High-Velocity Station Trading
Focus on items with:
- Velocity Score: 70+
- Days to Sell: < 3
- Competition: Low to Medium
- Spread: 3%+

**Goal**: Multiple daily flips, consistent small profits

### Medium-Velocity Value Trading
Focus on items with:
- Velocity Score: 50-70
- Days to Sell: 3-7
- Spread: 5%+

**Goal**: Weekly cycles, larger profits per trade

### Volume Trend Trading
Focus on items with:
- Volume Trend: Increasing
- Trend Percent: 20%+
- Velocity Score: Any

**Goal**: Ride momentum, anticipate demand spikes

## Performance Tips

### Batch Analysis
Analyze multiple items in parallel (the hook handles this automatically):

```javascript
// Efficient - single hook call
const { velocities } = useMarketVelocity(regionId, {
  typeIds: [34, 35, 36, 37, 38]  // Analyzes all in parallel
});

// Less efficient - multiple hook calls
// Don't do this unless comparing regions
const v1 = useMarketVelocity(regionId, { typeIds: [34] });
const v2 = useMarketVelocity(regionId, { typeIds: [35] });
```

### Reasonable Item Counts
ESI rate limit: ~150 requests/second

- Safe: < 50 items per hook
- Moderate: 50-100 items
- Heavy: 100+ items (may trigger rate limiting)

### Caching Strategy
Data updates every ~5 minutes is reasonable:

```javascript
// Don't refresh too frequently
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

## Integration Examples

### Add to Existing Trading Page

```javascript
function StationTradingPage() {
  const [selectedItems, setSelectedItems] = useState([]);

  // Add velocity analysis
  const { velocities, statistics } = useMarketVelocity(regionId, {
    typeIds: selectedItems,
    minVolume: 1000
  });

  return (
    <div>
      <h2>Station Trading</h2>

      {/* Show velocity stats */}
      <div className="velocity-stats">
        <p>Average Velocity: {statistics.averageVelocityScore}/100</p>
        <p>Avg Days to Sell: {statistics.averageDaysToSell}</p>
      </div>

      {/* Enhance trading table with velocity data */}
      <table>
        {velocities.map(item => (
          <tr key={item.typeId}>
            <td>{item.typeId}</td>
            <td>
              <span className={getVelocityColor(item.velocityScore)}>
                {item.velocityScore}
              </span>
            </td>
            <td>{item.daysToSell} days</td>
            <td>{item.currentSpread}%</td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### Create Velocity Dashboard

```javascript
function VelocityDashboard() {
  const popularItems = [34, 35, 36, 37, 38, 39, 40]; // Minerals

  const {
    velocities,
    loading,
    topOpportunities,
    statistics
  } = useMarketVelocity(10000002, {
    typeIds: popularItems,
    minVelocityScore: 50
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="velocity-dashboard">
      <h1>Market Velocity Dashboard</h1>

      <section className="overview">
        <h2>Overview</h2>
        <StatCard label="Items Analyzed" value={statistics.totalItems} />
        <StatCard label="Avg Velocity" value={`${statistics.averageVelocityScore}/100`} />
        <StatCard label="High Velocity" value={statistics.highVelocityCount} />
      </section>

      <section className="top-opportunities">
        <h2>Top 10 Quick-Flip Opportunities</h2>
        {topOpportunities.map((item, index) => (
          <OpportunityCard
            key={item.typeId}
            rank={index + 1}
            item={item}
          />
        ))}
      </section>
    </div>
  );
}
```

## Troubleshooting

### No Results Returned

**Problem**: `velocities` array is empty

**Solutions**:
1. Check filters aren't too restrictive
2. Verify typeIds are valid
3. Ensure regionId is correct
4. Check for API errors in console

### Slow Performance

**Problem**: Takes long time to load

**Solutions**:
1. Reduce number of typeIds
2. ESI may be experiencing issues
3. Check network connectivity
4. Rate limiting may be active

### Inaccurate Scores

**Problem**: Velocity scores don't match expectations

**Solutions**:
1. Scores are relative, not absolute
2. Low-volume markets have different dynamics
3. Recent market events can skew data
4. 7-day trends may not reflect current state

## API Reference

See `/src/api/esi.js` for underlying API calls:
- `getMarketHistory(regionId, typeId)` - Fetches historical market data
- `getMarketOrders(regionId, typeId, orderType)` - Fetches current orders
- `analyzeMarketOrders(orders)` - Analyzes competition and spread

## Related Hooks

- `useMarketTrends` - Price trend analysis
- `useUndercutDetection` - Monitor order undercutting
- `usePriceAlerts` - Price change notifications
- `useApiCall` - Generic API call wrapper

## Support

For issues, feature requests, or questions:
- GitHub: [evetrade repository](https://github.com/awhipp/evetrade)
- Check existing hooks in `/src/hooks/` for patterns
- Review ESI API docs: https://esi.evetech.net/ui/

## License

Part of EVETrade - MIT License
