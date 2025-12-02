# OrderBookDepth Integration Guide

Quick guide for integrating the OrderBookDepth component into your EVETrade pages.

## Quick Start (5 minutes)

### 1. Import the Component

```jsx
import { OrderBookDepth } from '../components/trading/OrderBookDepth';
```

### 2. Add to Your Page

```jsx
function YourTradingPage() {
  const [orders, setOrders] = useState({ buy: [], sell: [] });

  return (
    <div className="container mx-auto p-4">
      <OrderBookDepth
        buyOrders={orders.buy}
        sellOrders={orders.sell}
        itemName="Tritanium"
      />
    </div>
  );
}
```

### 3. Fetch Data from API

```jsx
useEffect(() => {
  async function fetchMarketOrders() {
    try {
      const response = await fetch(`/api/market-orders/${typeId}`);
      const data = await response.json();

      setOrders({
        buy: data.filter(o => o.is_buy_order),
        sell: data.filter(o => !o.is_buy_order)
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }

  fetchMarketOrders();
}, [typeId]);
```

## Integration Examples

### Example 1: OrdersPage.jsx (Market Depth View)

```jsx
import { useState, useEffect } from 'react';
import { OrderBookDepth } from '../components/trading/OrderBookDepth';
import PageLayout from '../components/layout/PageLayout';

export function OrdersPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [orders, setOrders] = useState({ buy: [], sell: [] });
  const [loading, setLoading] = useState(false);

  const fetchOrders = async (typeId, regionId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://esi.evetech.net/latest/markets/${regionId}/orders/?type_id=${typeId}`
      );
      const data = await response.json();

      setOrders({
        buy: data.filter(o => o.is_buy_order),
        sell: data.filter(o => !o.is_buy_order)
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Market Orders">
      <div className="space-y-6">
        {/* Item selection form */}
        <ItemSelectionForm onSelect={fetchOrders} />

        {/* Order Book Depth */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <OrderBookDepth
            buyOrders={orders.buy}
            sellOrders={orders.sell}
            itemName={selectedItem?.name || 'Select an item'}
          />
        )}
      </div>
    </PageLayout>
  );
}
```

### Example 2: TradingTable Expansion (Compact Mode)

```jsx
import { TradingTable } from '../components/tables/TradingTable';
import { OrderBookDepth } from '../components/trading/OrderBookDepth';

export function TradingPage() {
  const [trades, setTrades] = useState([]);

  const columns = [
    { key: 'itemName', label: 'Item' },
    { key: 'profit', label: 'Profit' },
    // ... other columns
  ];

  const expandedRowContent = (row) => {
    return (
      <div className="p-4 bg-space-dark/30">
        <OrderBookDepth
          buyOrders={row.buyOrders}
          sellOrders={row.sellOrders}
          itemName={row.itemName}
          compact
        />
      </div>
    );
  };

  return (
    <TradingTable
      data={trades}
      columns={columns}
      expandedRow={expandedRowContent}
    />
  );
}
```

### Example 3: Dashboard Widget (Compact)

```jsx
import { OrderBookDepth } from '../components/trading/OrderBookDepth';

export function TradingDashboard() {
  const [topItems, setTopItems] = useState([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {topItems.map(item => (
        <OrderBookDepth
          key={item.typeId}
          buyOrders={item.buyOrders}
          sellOrders={item.sellOrders}
          itemName={item.name}
          compact
        />
      ))}
    </div>
  );
}
```

### Example 4: Real-Time Updates with WebSocket

```jsx
import { useState, useEffect } from 'react';
import { OrderBookDepth } from '../components/trading/OrderBookDepth';

export function LiveOrderBook({ typeId, regionId }) {
  const [orders, setOrders] = useState({ buy: [], sell: [] });

  useEffect(() => {
    // Initial fetch
    fetchInitialOrders();

    // WebSocket for real-time updates
    const ws = new WebSocket('wss://your-ws-server.com/market-feed');

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      if (update.typeId === typeId && update.regionId === regionId) {
        setOrders(prev => ({
          buy: updateOrders(prev.buy, update.buy),
          sell: updateOrders(prev.sell, update.sell)
        }));
      }
    };

    return () => ws.close();
  }, [typeId, regionId]);

  const fetchInitialOrders = async () => {
    // ... fetch logic
  };

  const updateOrders = (existing, updates) => {
    // Merge update logic
    return [...existing, ...updates].reduce((acc, order) => {
      const existing = acc.find(o => o.order_id === order.order_id);
      if (existing) {
        return acc.map(o => o.order_id === order.order_id ? order : o);
      }
      return [...acc, order];
    }, []);
  };

  return (
    <OrderBookDepth
      buyOrders={orders.buy}
      sellOrders={orders.sell}
      itemName={`Type ${typeId}`}
    />
  );
}
```

### Example 5: Multiple Markets Side-by-Side

```jsx
import { OrderBookDepth } from '../components/trading/OrderBookDepth';

export function MultiMarketView({ typeId }) {
  const [markets, setMarkets] = useState({
    jita: { buy: [], sell: [] },
    amarr: { buy: [], sell: [] },
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold text-accent-cyan mb-4">
          Jita - The Forge
        </h2>
        <OrderBookDepth
          buyOrders={markets.jita.buy}
          sellOrders={markets.jita.sell}
          itemName="PLEX"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-accent-cyan mb-4">
          Amarr - Domain
        </h2>
        <OrderBookDepth
          buyOrders={markets.amarr.buy}
          sellOrders={markets.amarr.sell}
          itemName="PLEX"
        />
      </div>
    </div>
  );
}
```

## Data Sources

### ESI API (EVE Swagger Interface)

```javascript
// Get market orders for a specific item in a region
const getMarketOrders = async (typeId, regionId) => {
  const url = `https://esi.evetech.net/latest/markets/${regionId}/orders/`;
  const params = new URLSearchParams({ type_id: typeId });

  const response = await fetch(`${url}?${params}`);
  const orders = await response.json();

  return {
    buy: orders.filter(o => o.is_buy_order),
    sell: orders.filter(o => !o.is_buy_order)
  };
};

// Usage
const { buy, sell } = await getMarketOrders(34, 10000002); // Tritanium in The Forge
```

### Backend API (Cached/Processed)

```javascript
// Your backend might provide pre-processed market data
const getMarketDepth = async (itemName, region) => {
  const response = await fetch(`/api/market-depth/${itemName}/${region}`);
  const data = await response.json();

  return {
    buy: data.buyOrders,
    sell: data.sellOrders,
    itemName: data.itemName
  };
};
```

### Local State (Testing/Development)

```javascript
const mockOrders = {
  buy: [
    { price: 999000, volume: 15000 },
    { price: 998500, volume: 8500 },
  ],
  sell: [
    { price: 1001000, volume: 12500 },
    { price: 1001500, volume: 9200 },
  ]
};
```

## Common Patterns

### Loading State

```jsx
{loading ? (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner />
  </div>
) : (
  <OrderBookDepth {...orderProps} />
)}
```

### Error Handling

```jsx
{error ? (
  <ErrorMessage message={error} onRetry={fetchOrders} />
) : (
  <OrderBookDepth {...orderProps} />
)}
```

### Empty State

```jsx
{orders.buy.length === 0 && orders.sell.length === 0 ? (
  <EmptyState message="No market orders available" />
) : (
  <OrderBookDepth {...orderProps} />
)}
```

### Refresh Button

```jsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-semibold">Market Depth</h2>
  <button
    onClick={refreshOrders}
    disabled={loading}
    className="btn-secondary"
  >
    {loading ? 'Refreshing...' : 'Refresh'}
  </button>
</div>

<OrderBookDepth {...orderProps} />
```

## Performance Tips

1. **Memoize Props**: Use `useMemo` for order arrays to prevent unnecessary re-renders
   ```jsx
   const buyOrders = useMemo(() =>
     rawOrders.filter(o => o.is_buy_order),
     [rawOrders]
   );
   ```

2. **Debounce Updates**: For real-time data, debounce updates to avoid excessive renders
   ```jsx
   const debouncedOrders = useDebounce(orders, 500);
   ```

3. **Virtual Scrolling**: For very large order books, consider limiting displayed orders
   ```jsx
   const topBuys = orders.buy.slice(0, 20);
   const topSells = orders.sell.slice(0, 20);
   ```

4. **Lazy Loading**: Load order book data only when the user views it
   ```jsx
   const [visible, setVisible] = useState(false);

   useEffect(() => {
     if (visible) {
       fetchOrders();
     }
   }, [visible]);
   ```

## Troubleshooting

### Orders Not Displaying
- Check that order objects have `price` and `volume` (or `volume_remain`) properties
- Verify orders array is not empty
- Check console for errors

### Incorrect Liquidity Score
- Ensure you're passing all available orders, not just top N
- Check that price and volume values are numbers, not strings

### Price Walls Not Detected
- Walls are detected when volume > average * 1.2
- If all orders have similar volume, no walls will be detected
- You can adjust threshold in the component if needed

### Styling Issues
- Make sure Tailwind CSS is properly configured
- Verify custom theme colors are defined in `index.css`
- Check that parent container has appropriate width

## Questions?

Check the main documentation in `OrderBookDepth.md` or the example file `OrderBookDepth.example.jsx`.
