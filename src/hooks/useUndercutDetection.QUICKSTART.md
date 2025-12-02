# useUndercutDetection - Quick Start Guide

Get up and running with undercut detection in 5 minutes.

## Installation

Already included in the project! Just import it:

```javascript
import { useUndercutDetection } from './hooks/useUndercutDetection';
```

## Quick Example

```javascript
import React, { useEffect } from 'react';
import { useUndercutDetection } from './hooks/useUndercutDetection';
import { getCharacterOrders, getMarketOrders } from '../api/esi';

function OrderMonitor({ characterId, accessToken }) {
  const {
    undercutOrders,
    undercutStats,
    checkOrders
  } = useUndercutDetection();

  useEffect(() => {
    async function monitor() {
      // 1. Get your orders
      const myOrders = await getCharacterOrders(characterId, accessToken);

      // 2. Get market data
      const marketData = [];
      for (const order of myOrders) {
        const market = await getMarketOrders(order.region_id, order.type_id);
        marketData.push(...market);
      }

      // 3. Check for undercuts
      await checkOrders(myOrders, marketData);
    }

    monitor();
  }, [characterId, accessToken, checkOrders]);

  return (
    <div>
      <h2>Undercut Monitor</h2>
      <p>Undercut Orders: {undercutStats.total}</p>
      <p>Potential Loss: {undercutStats.totalPotentialLoss.toLocaleString()} ISK</p>

      {undercutOrders.map(order => (
        <div key={order.order_id}>
          <p>Type: {order.type_id}</p>
          <p>Your Price: {order.price.toLocaleString()} ISK</p>
          <p>Best Competitor: {order.bestCompetitorPrice.toLocaleString()} ISK</p>
          <p>Recommended: {order.recommendedPrice.toLocaleString()} ISK</p>
        </div>
      ))}
    </div>
  );
}

export default OrderMonitor;
```

## What You Get

### 1. Undercut Detection
```javascript
const { undercutOrders } = useUndercutDetection();

// Each undercut order contains:
undercutOrders[0] = {
  order_id: 12345,
  type_id: 34,
  price: 100.00,
  undercutBy: 1.50,           // ISK difference
  undercutPercent: 1.5,       // Percentage
  competitorCount: 3,         // Orders ahead of you
  recommendedPrice: 98.49,    // Suggested new price
  profitLoss: 1500,          // Potential ISK loss
}
```

### 2. Statistics
```javascript
const { undercutStats } = useUndercutDetection();

undercutStats = {
  total: 5,                    // Total undercut
  buyOrders: 2,                // Buy orders
  sellOrders: 3,               // Sell orders
  totalPotentialLoss: 50000,   // Total ISK at risk
  averageUndercutPercent: 2.3, // Average %
}
```

### 3. Smart Pricing
```javascript
const { calculateOptimalPrice } = useUndercutDetection();

// Aggressive: Beat by 0.01 ISK
const aggressive = calculateOptimalPrice(order, marketData, 'aggressive');

// Moderate: Match best price
const moderate = calculateOptimalPrice(order, marketData, 'moderate');

// Conservative: Stay in top 5
const conservative = calculateOptimalPrice(order, marketData, 'conservative');
```

## Common Use Cases

### Case 1: Simple Alert
```javascript
function SimpleAlert({ characterId, accessToken }) {
  const { undercutOrders, checkOrders } = useUndercutDetection();

  useEffect(() => {
    // Check every 5 minutes
    const check = async () => {
      const orders = await getCharacterOrders(characterId, accessToken);
      const market = await fetchMarketData(orders);
      await checkOrders(orders, market);
    };

    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (undercutOrders.length > 0) {
    return <div style={{ color: 'red' }}>
      ⚠️ {undercutOrders.length} orders undercut!
    </div>;
  }

  return <div style={{ color: 'green' }}>✓ All orders competitive</div>;
}
```

### Case 2: Priority List
```javascript
function PriorityList() {
  const { undercutOrders } = useUndercutDetection();

  // Sort by profit impact
  const sorted = [...undercutOrders].sort(
    (a, b) => b.profitLoss - a.profitLoss
  );

  return (
    <div>
      <h3>Fix These First:</h3>
      {sorted.map((order, idx) => (
        <div key={order.order_id}>
          <span>#{idx + 1}</span>
          <span>Loss: {order.profitLoss.toLocaleString()} ISK</span>
          <button>Update to {order.recommendedPrice} ISK</button>
        </div>
      ))}
    </div>
  );
}
```

### Case 3: Browser Notifications
```javascript
function NotificationMonitor({ characterId, accessToken }) {
  const { undercutOrders, checkOrders } = useUndercutDetection();
  const prevCount = useRef(0);

  useEffect(() => {
    if (undercutOrders.length > prevCount.current) {
      new Notification('Order Undercut!', {
        body: `${undercutOrders.length - prevCount.current} new undercuts`,
      });
    }
    prevCount.current = undercutOrders.length;
  }, [undercutOrders.length]);

  // ... rest of component
}
```

## Performance Tips

### Batch API Calls
```javascript
// ❌ Bad: One call per order
for (const order of orders) {
  await getMarketOrders(order.region_id, order.type_id);
}

// ✅ Good: Group by unique items
const unique = new Map();
orders.forEach(o => {
  unique.set(`${o.region_id}-${o.type_id}`, o);
});

const marketData = await Promise.all(
  Array.from(unique.values()).map(o =>
    getMarketOrders(o.region_id, o.type_id)
  )
);
```

### Cache Results
```javascript
const cache = new Map();
const CACHE_TIME = 30000; // 30 seconds

async function getCachedMarketOrders(regionId, typeId) {
  const key = `${regionId}-${typeId}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.time < CACHE_TIME) {
    return cached.data;
  }

  const data = await getMarketOrders(regionId, typeId);
  cache.set(key, { data, time: Date.now() });
  return data;
}
```

## Troubleshooting

### Problem: No undercuts detected
```javascript
// Check 1: Are market orders from same location?
console.log('Character order location:', order.location_id);
console.log('Market order locations:', marketOrders.map(o => o.location_id));

// Check 2: Are you filtering out your own orders?
const filtered = marketOrders.filter(o => o.order_id !== myOrder.order_id);
```

### Problem: Performance issues
```javascript
// Solution: Batch and cache
async function efficientCheck(characterId, accessToken) {
  const orders = await getCharacterOrders(characterId, accessToken);

  // Group by region+type
  const groups = new Map();
  orders.forEach(o => {
    const key = `${o.region_id}-${o.type_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  });

  // Parallel fetch
  const marketPromises = Array.from(groups.keys()).map(key => {
    const [region, type] = key.split('-');
    return getMarketOrders(parseInt(region), parseInt(type));
  });

  const allMarket = (await Promise.all(marketPromises)).flat();
  return checkOrders(orders, allMarket);
}
```

## Next Steps

1. **Read the full docs**: `useUndercutDetection.README.md`
2. **Check examples**: `useUndercutDetection.example.js`
3. **Understand architecture**: `useUndercutDetection.ARCHITECTURE.md`
4. **Run tests**: `npm test useUndercutDetection.test.js`

## API Summary

```javascript
const {
  // State
  undercutOrders,        // Array of undercut orders
  undercutStats,         // Summary statistics
  loading,               // Boolean: checking
  error,                 // Error object or null

  // Functions
  checkOrders,           // (myOrders, marketOrders) => Promise<Array>
  getUndercutAmount,     // (order) => number
  getRecommendedPrice,   // (order, marketOrders?) => number
  calculateOptimalPrice, // (order, market, strategy) => Object
  clearUndercutOrders,   // () => void
  reset,                 // () => void
} = useUndercutDetection();
```

## Questions?

- Check the README for detailed documentation
- See example.js for more use cases
- Review test.js for edge cases
- Consult ARCHITECTURE.md for deep dive

---

**Ready to start?** Copy the Quick Example above and modify for your needs!
