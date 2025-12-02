# OrderBookDepth Component

A visual market depth component that displays buy and sell orders in a horizontal bar chart format, showing cumulative volume, spread analysis, and liquidity metrics.

## Features

### Visual Representation
- **Horizontal bar chart** showing cumulative order volume
- **Buy orders** (green bars) grow from left to right
- **Sell orders** (red bars) grow from right to left
- **Price walls** (large orders) highlighted with thicker borders and shield emoji 🛡️
- **Hover interactions** to display cumulative volume at each price level
- **Responsive design** with compact mode for embedding in tables

### Market Metrics
- **Spread Analysis**: Absolute ISK difference and percentage between best buy/sell
- **Liquidity Score**: Automatic classification as Thin/Normal/Deep market
- **Total Volume**: Sum of all buy and sell orders
- **Price Walls**: Detection of large orders that may act as support/resistance
- **Best Buy/Sell**: Highlights the top of book prices

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `buyOrders` | `Array<{price: number, volume: number}>` | `[]` | Array of buy orders |
| `sellOrders` | `Array<{price: number, volume: number}>` | `[]` | Array of sell orders |
| `itemName` | `string` | `'Item'` | Name of the item being traded |
| `compact` | `boolean` | `false` | Enable compact mode for embedding in tables |
| `className` | `string` | `''` | Additional CSS classes |

### Order Object Format

Orders can have either `volume` or `volume_remain` property:

```javascript
{
  price: 1000000,        // Order price in ISK
  volume: 5000,          // Total volume (alternative: volume_remain)
  // ... other ESI fields are ignored but won't cause errors
}
```

## Usage

### Basic Usage

```jsx
import { OrderBookDepth } from './components/trading/OrderBookDepth';

function MyTradingPage() {
  const buyOrders = [
    { price: 999500, volume: 15000 },
    { price: 999000, volume: 8500 },
    { price: 998500, volume: 12000 },
  ];

  const sellOrders = [
    { price: 1001000, volume: 12500 },
    { price: 1001500, volume: 9200 },
    { price: 1002000, volume: 7800 },
  ];

  return (
    <OrderBookDepth
      buyOrders={buyOrders}
      sellOrders={sellOrders}
      itemName="Tritanium"
    />
  );
}
```

### Compact Mode (for tables)

```jsx
<OrderBookDepth
  buyOrders={buyOrders}
  sellOrders={sellOrders}
  itemName="Tritanium"
  compact
/>
```

### With ESI API Data

```jsx
import { useEffect, useState } from 'react';
import { OrderBookDepth } from './components/trading/OrderBookDepth';

function MarketOrdersView({ typeId, regionId }) {
  const [orders, setOrders] = useState({ buy: [], sell: [] });

  useEffect(() => {
    async function fetchOrders() {
      const response = await fetch(
        `https://esi.evetech.net/latest/markets/${regionId}/orders/?type_id=${typeId}`
      );
      const data = await response.json();

      const buy = data.filter(o => o.is_buy_order);
      const sell = data.filter(o => !o.is_buy_order);

      setOrders({ buy, sell });
    }

    fetchOrders();
  }, [typeId, regionId]);

  return (
    <OrderBookDepth
      buyOrders={orders.buy}
      sellOrders={orders.sell}
      itemName={`Type ${typeId}`}
    />
  );
}
```

## Liquidity Score Calculation

The component automatically calculates a liquidity score based on:

1. **Volume Score** (max 40 points): Total volume across all orders
2. **Order Count Score** (max 30 points): Number of distinct orders
3. **Spread Score** (max 30 points): Tightness of spread (lower is better)

**Classification:**
- **Deep Market**: Score ≥ 70 (green) - High liquidity, tight spread, many orders
- **Normal Market**: Score ≥ 40 (cyan) - Moderate liquidity
- **Thin Market**: Score < 40 (red) - Low liquidity, wide spread, few orders

## Price Wall Detection

Price walls are automatically detected when an order's volume exceeds the average volume by 20% or more. These large orders often act as:

- **Support levels** (buy walls) - preventing price from falling below
- **Resistance levels** (sell walls) - preventing price from rising above

Price walls are visually distinguished by:
- Thicker, more prominent bars
- Stronger border colors
- Shield emoji 🛡️ indicator

## Styling

The component uses Tailwind CSS with EVETrade's space theme colors:

- **Buy orders**: `accent-green` (#00ff9d)
- **Sell orders**: `accent-pink` (#ff0099)
- **Spread**: `accent-cyan` (#00f0ff)
- **Background**: Glassmorphic cards with blur effects

## Performance

The component is optimized for performance with:

- `useMemo` hooks for expensive calculations
- Efficient sorting and filtering algorithms
- Configurable display limits (10 orders in full mode, 5 in compact)
- Smooth CSS transitions for hover effects

## Examples

See `OrderBookDepth.example.jsx` for a comprehensive demo showing:

- Normal market liquidity
- Thin market (low liquidity)
- Deep market (high liquidity)
- Compact mode in grids
- Empty state handling
- Integration examples

## Integration with Other Components

### With TradingTable

```jsx
<TradingTable
  data={trades}
  expandedRow={(row) => (
    <OrderBookDepth
      buyOrders={row.buyOrders}
      sellOrders={row.sellOrders}
      itemName={row.itemName}
      compact
    />
  )}
/>
```

### With MarketOrdersPage

```jsx
import { OrderBookDepth } from '../components/trading/OrderBookDepth';

function OrdersPage() {
  // ... fetch orders from API

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OrderBookDepth
        buyOrders={buyOrders}
        sellOrders={sellOrders}
        itemName={selectedItem}
      />
      {/* Other components */}
    </div>
  );
}
```

## Accessibility

- Semantic HTML structure
- Hover states for keyboard navigation
- Color-coded but also uses icons and text labels
- Readable font sizes and contrast ratios

## Browser Support

Works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS backdrop-filter (for glassmorphic effects)
- ES6+ JavaScript features

## Future Enhancements

Potential improvements for future versions:

- Historical depth overlay (show depth changes over time)
- Click to set price alerts at specific levels
- Export depth data as image or CSV
- Animated transitions when orders update
- Integration with WebSocket for real-time updates
- Order age visualization (color by timestamp)
- Volume-weighted average price (VWAP) lines

## Related Components

- `MarketSpreadAnalyzer` - Analyzes spread over time
- `PriceVolatilityIndex` - Measures price volatility
- `ManipulationDetector` - Detects market manipulation
- `RegionalPriceComparison` - Compare prices across regions
