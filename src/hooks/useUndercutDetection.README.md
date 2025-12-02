# useUndercutDetection Hook

A React hook for monitoring EVE Online market orders and detecting when they've been undercut by competitors.

## Features

- **Automatic Undercut Detection**: Identifies when your buy orders have been outbid or sell orders have been undercut
- **Pricing Recommendations**: Suggests optimal prices to regain competitive position
- **Multiple Pricing Strategies**: Supports aggressive, moderate, and conservative pricing approaches
- **Real-time Analysis**: Calculate competitor count, undercut percentage, and potential profit impact
- **Statistics & Insights**: Provides summary statistics of all undercut orders

## Installation

The hook is already included in the EVETrade project. Import it from:

```javascript
import { useUndercutDetection } from './hooks/useUndercutDetection';
```

## Basic Usage

```javascript
import { useUndercutDetection } from './hooks/useUndercutDetection';
import { getCharacterOrders, getMarketOrders } from '../api/esi';

function OrderMonitor({ characterId, accessToken }) {
  const {
    undercutOrders,
    undercutStats,
    loading,
    error,
    checkOrders,
  } = useUndercutDetection();

  async function checkMyOrders() {
    // 1. Fetch character's orders
    const myOrders = await getCharacterOrders(characterId, accessToken);

    // 2. Fetch market orders for comparison
    const marketOrders = await getMarketOrders(regionId, typeId, 'all');

    // 3. Check for undercuts
    const undercuts = await checkOrders(myOrders, marketOrders);

    console.log(`Found ${undercuts.length} undercut orders`);
  }

  return (
    <div>
      <button onClick={checkMyOrders}>Check Orders</button>
      {undercutOrders.map(order => (
        <div key={order.order_id}>
          <p>Undercut by: {order.undercutPercent.toFixed(2)}%</p>
          <p>Recommended: {order.recommendedPrice.toLocaleString()} ISK</p>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Hook Return Values

```javascript
const {
  undercutOrders,      // Array of orders that have been undercut
  undercutStats,       // Summary statistics
  loading,             // Boolean: checking in progress
  error,               // Error object if check failed
  checkOrders,         // Function: check for undercuts
  getUndercutAmount,   // Function: get undercut amount for an order
  getRecommendedPrice, // Function: get recommended price
  calculateOptimalPrice, // Function: calculate price by strategy
  clearUndercutOrders, // Function: clear undercut list
  reset,               // Function: reset all state
} = useUndercutDetection();
```

### Functions

#### `checkOrders(characterOrders, marketOrders)`

Checks character orders against market orders to detect undercuts.

**Parameters:**
- `characterOrders` (Array): Character's active orders from `getCharacterOrders()`
- `marketOrders` (Array): Market orders from `getMarketOrders()`

**Returns:** Promise<Array> - Array of undercut orders

**Example:**
```javascript
const undercuts = await checkOrders(myOrders, marketData);
```

#### `getUndercutAmount(order)`

Returns how much an order was undercut by.

**Parameters:**
- `order` (Object): Order object with undercut data

**Returns:** Number - Amount in ISK

**Example:**
```javascript
const amount = getUndercutAmount(undercutOrder);
console.log(`Undercut by ${amount} ISK`);
```

#### `getRecommendedPrice(order, marketOrders?)`

Returns suggested price to become competitive (0.01 ISK better than best competitor).

**Parameters:**
- `order` (Object): Order object
- `marketOrders` (Array, optional): Current market orders for recalculation

**Returns:** Number - Recommended price in ISK

**Example:**
```javascript
const newPrice = getRecommendedPrice(order);
```

#### `calculateOptimalPrice(order, marketOrders, strategy)`

Calculates optimal price based on pricing strategy.

**Parameters:**
- `order` (Object): Character's order
- `marketOrders` (Array): All market orders
- `strategy` (String): One of 'aggressive', 'moderate', 'conservative'

**Returns:** Object with pricing recommendation

**Example:**
```javascript
const rec = calculateOptimalPrice(order, marketData, 'aggressive');
console.log(`Recommended: ${rec.price} ISK`);
console.log(`Reason: ${rec.reason}`);
```

### Pricing Strategies

#### Aggressive
- **Sell Orders**: Beat best price by 0.01 ISK (undercut by 0.01)
- **Buy Orders**: Beat best price by 0.01 ISK (outbid by 0.01)
- **Use Case**: When you need immediate sales/purchases

```javascript
const aggressive = calculateOptimalPrice(order, marketData, 'aggressive');
// Best sell: 100.00 ISK → Recommend: 99.99 ISK
```

#### Moderate
- **Sell Orders**: Match best price
- **Buy Orders**: Match best price
- **Use Case**: When you want to compete but rely on timestamp priority

```javascript
const moderate = calculateOptimalPrice(order, marketData, 'moderate');
// Best sell: 100.00 ISK → Recommend: 100.00 ISK
```

#### Conservative
- **Sell Orders**: Stay within top 5 orders
- **Buy Orders**: Stay within top 5 orders
- **Use Case**: When you're willing to wait for better position

```javascript
const conservative = calculateOptimalPrice(order, marketData, 'conservative');
// Top 5 range: 99.50-100.50 ISK → Adjust to stay in range
```

## Order Object Structure

### Character Order (Input)
```javascript
{
  order_id: 12345,
  type_id: 34,           // Item type ID
  location_id: 60003760, // Station/structure ID
  region_id: 10000002,   // Region ID
  price: 100.00,         // Order price
  volume_remain: 1000,   // Remaining volume
  is_buy_order: false,   // true for buy, false for sell
}
```

### Undercut Order (Output)
```javascript
{
  ...originalOrder,      // All original order fields
  isUndercut: true,
  isBuyOrder: false,
  undercutBy: 1.50,      // Amount undercut (ISK)
  undercutPercent: 1.5,  // Percentage undercut
  competitorCount: 3,    // How many orders ahead
  bestCompetitorPrice: 98.50,
  recommendedPrice: 98.49,
  volumeRemaining: 1000,
  profitLoss: 1500,      // Potential loss (undercutBy * volume)
  detectedAt: "2025-12-02T10:30:00Z",
}
```

## Statistics Object

```javascript
undercutStats = {
  total: 5,                    // Total undercut orders
  buyOrders: 2,                // Undercut buy orders
  sellOrders: 3,               // Undercut sell orders
  totalPotentialLoss: 50000,   // Total ISK at risk
  averageUndercutPercent: 2.3, // Average undercut %
  mostUndercutOrder: {...},    // Order with highest %
}
```

## Integration with ESI API

The hook works seamlessly with EVE Online's ESI API:

```javascript
import { getCharacterOrders, getMarketOrders } from '../api/esi';

async function monitorOrders(characterId, accessToken) {
  // 1. Get all character orders
  const myOrders = await getCharacterOrders(characterId, accessToken);

  // 2. Group by region and type for efficient API calls
  const uniqueItems = new Map();
  myOrders.forEach(order => {
    const key = `${order.region_id}-${order.type_id}`;
    if (!uniqueItems.has(key)) {
      uniqueItems.set(key, {
        regionId: order.region_id,
        typeId: order.type_id,
      });
    }
  });

  // 3. Fetch market data for all unique items
  const allMarketOrders = [];
  for (const { regionId, typeId } of uniqueItems.values()) {
    const orders = await getMarketOrders(regionId, typeId, 'all');
    allMarketOrders.push(...orders);
  }

  // 4. Check for undercuts
  const undercuts = await checkOrders(myOrders, allMarketOrders);

  return undercuts;
}
```

## Advanced Examples

### Automatic Monitoring with Intervals

```javascript
function AutoMonitor({ characterId, accessToken, interval = 300000 }) {
  const { checkOrders, undercutOrders } = useUndercutDetection();

  useEffect(() => {
    async function check() {
      const myOrders = await getCharacterOrders(characterId, accessToken);
      const marketData = await fetchMarketDataForOrders(myOrders);
      await checkOrders(myOrders, marketData);
    }

    check(); // Check immediately
    const timer = setInterval(check, interval); // Check every 5 minutes
    return () => clearInterval(timer);
  }, [characterId, accessToken, interval]);

  return <UndercutDisplay orders={undercutOrders} />;
}
```

### Priority Queue by Profit Impact

```javascript
function PriorityQueue() {
  const { undercutOrders } = useUndercutDetection();

  // Sort by potential profit loss (highest first)
  const prioritized = [...undercutOrders].sort(
    (a, b) => b.profitLoss - a.profitLoss
  );

  return (
    <div>
      {prioritized.map((order, idx) => (
        <div key={order.order_id} className={idx === 0 ? 'urgent' : ''}>
          <h3>Priority #{idx + 1}</h3>
          <p>At Risk: {order.profitLoss.toLocaleString()} ISK</p>
          <button>Update Order</button>
        </div>
      ))}
    </div>
  );
}
```

### Multi-Strategy Comparison

```javascript
function StrategyComparer({ order, marketOrders }) {
  const { calculateOptimalPrice } = useUndercutDetection();

  const aggressive = calculateOptimalPrice(order, marketOrders, 'aggressive');
  const moderate = calculateOptimalPrice(order, marketOrders, 'moderate');
  const conservative = calculateOptimalPrice(order, marketOrders, 'conservative');

  return (
    <table>
      <tr>
        <th>Strategy</th>
        <th>Price</th>
        <th>Change</th>
      </tr>
      <tr>
        <td>Aggressive</td>
        <td>{aggressive.price} ISK</td>
        <td>{aggressive.priceChange} ISK</td>
      </tr>
      <tr>
        <td>Moderate</td>
        <td>{moderate.price} ISK</td>
        <td>{moderate.priceChange} ISK</td>
      </tr>
      <tr>
        <td>Conservative</td>
        <td>{conservative.price} ISK</td>
        <td>{conservative.priceChange} ISK</td>
      </tr>
    </table>
  );
}
```

### Browser Notifications

```javascript
function NotificationMonitor({ characterId, accessToken }) {
  const { undercutOrders, checkOrders } = useUndercutDetection();
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    if (undercutOrders.length > lastCount) {
      const newUndercuts = undercutOrders.length - lastCount;
      new Notification('EVETrade Alert', {
        body: `${newUndercuts} order(s) have been undercut!`,
        icon: '/favicon.ico',
      });
    }
    setLastCount(undercutOrders.length);
  }, [undercutOrders.length]);

  // ... monitoring logic
}
```

## Performance Considerations

### Batch API Requests

Instead of calling `getMarketOrders()` for each order individually, group requests:

```javascript
// ❌ Slow - separate request for each order
for (const order of orders) {
  const market = await getMarketOrders(order.region_id, order.type_id);
}

// ✅ Fast - group by unique region/type combinations
const unique = new Map();
orders.forEach(o => unique.set(`${o.region_id}-${o.type_id}`, o));
const marketData = await Promise.all(
  Array.from(unique.values()).map(o =>
    getMarketOrders(o.region_id, o.type_id)
  )
);
```

### Rate Limiting

ESI has rate limits. Add delays between requests if needed:

```javascript
async function fetchWithDelay(requests, delayMs = 100) {
  const results = [];
  for (const request of requests) {
    results.push(await request());
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return results;
}
```

### Caching

Cache market data for a few seconds to avoid redundant API calls:

```javascript
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

async function getCachedMarketOrders(regionId, typeId) {
  const key = `${regionId}-${typeId}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await getMarketOrders(regionId, typeId);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

## Testing

Run the included tests:

```bash
npm test useUndercutDetection.test.js
```

See `useUndercutDetection.test.js` for comprehensive test examples.

## Related Hooks

- **usePriceAlerts**: Set alerts for specific price thresholds
- **usePortfolio**: Track trading history and performance
- **useApiCall**: Generic API call wrapper with cancellation

## Troubleshooting

### "No market orders provided for comparison"

Make sure you're passing market orders that match the character orders (same region_id and type_id):

```javascript
// Ensure market orders are for the same items
const relevantOrders = marketOrders.filter(
  mo => mo.type_id === characterOrder.type_id
);
```

### Orders Not Detected as Undercut

Verify that:
1. Market orders include the location_id field
2. Character orders and market orders are from the same location
3. Order IDs are correctly filtered to exclude character's own orders

### Performance Issues

If checking many orders:
1. Batch API requests (see Performance Considerations)
2. Use pagination for large order lists
3. Consider checking only active/recent orders
4. Implement caching (see examples above)

## Contributing

Found a bug or have a feature request? Please open an issue in the EVETrade repository.

## License

Part of the EVETrade project. See main repository for license information.
