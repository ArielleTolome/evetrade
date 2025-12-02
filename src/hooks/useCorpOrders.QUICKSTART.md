# Corporation Orders Aggregation - Quick Start Guide

## Overview

The Corporation Orders Aggregation feature allows you to view, analyze, and manage your corporation's market orders in EVE Online. It provides:

- **Order Aggregation**: Group orders by item, location, or both
- **Undercut Detection**: Automatically identifies when your orders are being undercut
- **Health Tracking**: Monitors order health based on fill rate, time remaining, and competition
- **Exposure Calculation**: Total ISK tied up in active orders
- **Alerts**: Highlights orders needing immediate attention

## Required ESI Scope

To use this feature, you need the following ESI scope:
- `esi-markets.read_corporation_orders.v1`

Make sure to log out and log back in with EVE SSO if you haven't granted this permission yet.

## Basic Usage

### 1. Simple Dashboard

```javascript
import { useCorpOrders } from './hooks/useCorpOrders';

function MyCorpOrders() {
  const {
    loading,
    error,
    summary,
    orders,
    fetchOrders
  } = useCorpOrders(98000001); // Your corporation ID

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Corporation Orders</h2>
      <p>Total Orders: {summary?.totalOrders}</p>
      <p>Total Exposure: {(summary?.totalExposure / 1e9).toFixed(2)}B ISK</p>

      {orders.map(item => (
        <div key={item['Type ID']}>
          <h3>{item['Item']}</h3>
          <p>Buy Orders: {item['Buy Orders']}</p>
          <p>Sell Orders: {item['Sell Orders']}</p>
          <p>Total Value: {(item['Total Exposure (ISK)'] / 1e6).toFixed(2)}M ISK</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Alert System

```javascript
function CorpOrderAlerts() {
  const {
    getOrdersNeedingAttention,
    getUndercutOrders,
    fetchOrders
  } = useCorpOrders(98000001);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const alerts = getOrdersNeedingAttention();
  const undercuts = getUndercutOrders();

  return (
    <div>
      <h2>Orders Needing Attention: {alerts.length}</h2>

      {undercuts.length > 0 && (
        <div className="undercut-alert">
          <h3>Undercut Orders</h3>
          {undercuts.map(item => (
            <div key={item.typeId}>
              {item.itemName} - {item.count} order(s) undercut
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Auto-Refresh Monitor

```javascript
function OrderMonitor() {
  const {
    summary,
    lastUpdated,
    getUndercutOrders
  } = useCorpOrders(98000001, {
    autoRefresh: true,
    refreshInterval: 300, // Refresh every 5 minutes
  });

  const undercuts = getUndercutOrders();

  return (
    <div>
      <p>Last Updated: {lastUpdated?.toLocaleTimeString()}</p>
      <p>Total Orders: {summary?.totalOrders}</p>
      {undercuts.length > 0 && (
        <div className="alert">
          {undercuts.length} order(s) are being undercut!
        </div>
      )}
    </div>
  );
}
```

## API Options

### Hook Configuration

```javascript
useCorpOrders(corporationId, {
  groupBy: 'item',        // 'item', 'location', or 'both'
  includeHistory: false,  // Include historical orders
  autoRefresh: false,     // Auto-refresh orders
  refreshInterval: 300,   // Refresh interval in seconds
})
```

### Grouping Options

- **`item`** (default): Groups all orders for the same item across locations
- **`location`**: Groups all orders at the same location across items
- **`both`**: Groups orders by both item AND location (most granular)

## Available Methods

### State

- `data`: Raw API response
- `loading`: Boolean indicating if data is being fetched
- `error`: Error object if fetch failed
- `lastUpdated`: Timestamp of last successful fetch
- `summary`: Summary statistics
- `orders`: Array of aggregated orders

### Actions

- `fetchOrders()`: Manually fetch orders
- `refresh()`: Alias for fetchOrders
- `reset()`: Clear all state
- `clearError()`: Clear error state

### Analysis Methods

- `getOrdersNeedingAttention()`: Returns orders with health < 70
- `getUndercutOrders()`: Returns only undercut orders
- `getExpiringOrders()`: Returns orders expiring within 7 days
- `getTotalExposure()`: Returns total ISK in active orders
- `getOrderTypeBreakdown()`: Returns buy/sell order statistics
- `getHealthStats()`: Returns health distribution (healthy/warning/critical)
- `getTopItemsByExposure(limit)`: Returns top N items by ISK value
- `filterByHealth(min, max)`: Filter orders by health score (0-100)

## Order Health Explained

Each order gets a health score from 0-100 based on:

1. **Time Remaining** (0-30 points penalty)
   - Critical if < 7 days remaining
   - Warning if < 14 days remaining

2. **Fill Rate** (0-20 points penalty)
   - Very slow if < 10% filled
   - Slow if < 30% filled

3. **Competition** (0-50 points penalty)
   - Critical if undercut by competitor
   - Warning if not at best price

### Health Categories

- **Healthy** (70-100): No action needed
- **Warning** (40-69): Monitor closely
- **Critical** (0-39): Needs immediate attention

## Understanding Undercut Detection

The system compares your corp orders against all market orders to determine:

- `isUndercut`: Whether a competitor has a better price
- `competitorPrice`: The best competing price
- `priceDifference`: How much better the competitor's price is
- `rank`: Your order's position in the order book
- `totalCompetitors`: How many other orders exist

### For Buy Orders
You're undercut if someone is offering a higher buy price.

### For Sell Orders
You're undercut if someone is offering a lower sell price.

## Response Format

### Summary Object

```javascript
{
  totalOrders: 150,
  totalBuyOrders: 60,
  totalSellOrders: 90,
  totalExposure: 5000000000,      // ISK
  ordersNeedingAttention: 12,
  uniqueItems: 45,
  uniqueLocations: 5
}
```

### Order Object

```javascript
{
  'Type ID': 34,
  'Item': 'Tritanium',
  'Location ID': 60003760,
  'Location': 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
  'Buy Orders': 2,
  'Sell Orders': 3,
  'Buy Volume': 1000000,
  'Sell Volume': 500000,
  'Buy Value (ISK)': 50000000,
  'Sell Value (ISK)': 60000000,
  'Total Exposure (ISK)': 110000000,
  'Avg Buy Price': 50,
  'Avg Sell Price': 120,
  'Potential Profit': 35000000,
  'Orders Needing Attention': 2,
  'Order Details': [...],          // Individual orders
  'Attention Details': [...]        // Why orders need attention
}
```

### Order Detail Object

```javascript
{
  orderId: 5000001,
  isBuyOrder: false,
  price: 120.50,
  volumeRemain: 250000,
  volumeTotal: 500000,
  volumeFilled: 250000,
  fillRate: 50,                     // Percentage
  issued: '2024-01-15T00:00:00Z',
  duration: 90,                     // Days
  escrow: 30000000,
  range: 'region',
  undercutStatus: {
    isUndercut: true,
    competitorPrice: 115.00,
    priceDifference: 5.50,
    rank: 2,
    totalCompetitors: 5
  },
  health: 30                        // 0-100
}
```

## Common Use Cases

### 1. Daily Order Maintenance

```javascript
function DailyMaintenance() {
  const { getUndercutOrders, getExpiringOrders } = useCorpOrders(corpId);

  const undercuts = getUndercutOrders();
  const expiring = getExpiringOrders();

  return (
    <div>
      <h2>Daily Checklist</h2>
      <p>Update {undercuts.length} undercut orders</p>
      <p>Renew {expiring.length} expiring orders</p>
    </div>
  );
}
```

### 2. Risk Management

```javascript
function RiskDashboard() {
  const { getTotalExposure, getTopItemsByExposure } = useCorpOrders(corpId);

  const exposure = getTotalExposure();
  const topItems = getTopItemsByExposure(10);

  return (
    <div>
      <h2>Risk Analysis</h2>
      <p>Total Capital at Risk: {(exposure / 1e9).toFixed(2)}B ISK</p>
      <h3>Top 10 Exposures</h3>
      {topItems.map(item => (
        <div key={item.typeId}>
          {item.itemName}: {(item.exposure / 1e6).toFixed(2)}M ISK
        </div>
      ))}
    </div>
  );
}
```

### 3. Performance Tracking

```javascript
function PerformanceTracker() {
  const { orders } = useCorpOrders(corpId);

  const totalProfit = orders.reduce(
    (sum, item) => sum + (item['Potential Profit'] || 0),
    0
  );

  return (
    <div>
      <h2>Potential Profit</h2>
      <p>{(totalProfit / 1e9).toFixed(2)}B ISK</p>
    </div>
  );
}
```

## Error Handling

### Common Errors

1. **Missing Scope**
   ```
   Error: Missing required scope: esi-markets.read_corporation_orders.v1
   ```
   **Solution**: Log out and log back in with EVE SSO to grant the required permission.

2. **No Access**
   ```
   Error: Corporation not found or you do not have access
   ```
   **Solution**: Ensure you have director or accountant roles in the corporation.

3. **Rate Limiting**
   ```
   Error: ESI request timeout
   ```
   **Solution**: Reduce auto-refresh frequency or retry after a few seconds.

### Handling Errors in Components

```javascript
function SafeComponent() {
  const { error, loading, clearError } = useCorpOrders(corpId);

  if (error) {
    return (
      <div className="error">
        <p>{error.message}</p>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }

  // ... rest of component
}
```

## Performance Tips

1. **Use Auto-Refresh Wisely**: ESI data updates every 5 minutes, so don't refresh more frequently than that.

2. **Limit Historical Data**: Only use `includeHistory: true` when you need profit tracking, as it requires additional API calls.

3. **Choose Appropriate Grouping**:
   - Use `groupBy: 'item'` for most cases
   - Use `groupBy: 'location'` for multi-station analysis
   - Use `groupBy: 'both'` only when you need detailed breakdowns

4. **Cache Results**: The API returns cache headers, so leverage browser caching when possible.

## Integration with EVE SSO

The hook automatically handles authentication through the `useEveAuth` hook. Make sure your app is wrapped with the `EveAuthProvider`:

```javascript
import { EveAuthProvider } from './hooks/useEveAuth';

function App() {
  return (
    <EveAuthProvider>
      <YourComponents />
    </EveAuthProvider>
  );
}
```

## Next Steps

- See `useCorpOrders.example.js` for complete component examples
- Check `useCorpOrders.test.js` for testing patterns
- Review the API endpoint at `/api/corp-orders.js` for backend details

## Support

For issues or questions:
1. Check ESI API status: https://esi.evetech.net/ui/
2. Verify your corporation roles
3. Ensure you have the required ESI scope
4. Check browser console for detailed error messages
