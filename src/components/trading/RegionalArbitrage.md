# RegionalArbitrage Component

A React component that displays profitable arbitrage opportunities across EVE Online's major trade hubs by comparing real-time market prices.

## Overview

The RegionalArbitrage component fetches live market data from the ESI API for the five major trade hubs (Jita, Amarr, Dodixie, Rens, and Hek) and calculates profitable arbitrage routes where traders can buy low in one hub and sell high in another.

## Features

- **Real-time Market Data**: Fetches current market orders from ESI API
- **Multi-Hub Comparison**: Analyzes prices across all 5 major trade hubs
- **Best Route Highlighting**: Clearly shows the most profitable arbitrage opportunity
- **ROI Calculations**: Displays profit per unit and ROI percentage
- **Jump Distance**: Shows approximate jump count between hubs
- **Volume Analysis**: Displays daily trading volume for each hub
- **Interactive Selection**: Optional callback for route selection
- **Loading States**: Elegant loading and error handling
- **Consistent Styling**: Matches EVETrade's space theme with Tailwind CSS

## Installation

The component is part of the EVETrade trading components suite:

```javascript
import { RegionalArbitrage } from '@/components/trading';
// or
import { RegionalArbitrage } from '@/components/trading/RegionalArbitrage';
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `itemId` | `number` | Yes | - | EVE Online type ID for the item to analyze |
| `itemName` | `string` | No | `'Item'` | Display name of the item |
| `onSelect` | `function` | No | - | Callback when user selects an arbitrage route |

### onSelect Callback

When provided, the `onSelect` callback receives a route object with the following structure:

```javascript
{
  buyHub: 'Jita',           // Hub to buy from
  buyRegion: 'The Forge',   // Region name
  buyPrice: 5.50,           // Price to buy at
  sellHub: 'Amarr',         // Hub to sell to
  sellRegion: 'Domain',     // Region name
  sellPrice: 6.25,          // Price to sell at
  profitPerUnit: 0.75,      // Profit per unit
  roi: 13.64,               // Return on investment (%)
  jumps: 24                 // Jump distance
}
```

## Usage Examples

### Basic Usage

```jsx
import { RegionalArbitrage } from '@/components/trading';

function ArbitragePage() {
  return (
    <div className="container mx-auto p-6">
      <RegionalArbitrage
        itemId={34}
        itemName="Tritanium"
      />
    </div>
  );
}
```

### With Route Selection

```jsx
import { useState } from 'react';
import { RegionalArbitrage } from '@/components/trading';

function InteractiveArbitrage() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    console.log('Selected route:', route);
    // Navigate to route planner, add to watchlist, etc.
  };

  return (
    <div className="space-y-4">
      <RegionalArbitrage
        itemId={34}
        itemName="Tritanium"
        onSelect={handleRouteSelect}
      />

      {selectedRoute && (
        <div className="p-4 bg-accent-cyan/10 rounded-lg">
          <h3>Selected Route</h3>
          <p>
            Buy from {selectedRoute.buyHub} at {selectedRoute.buyPrice} ISK
            and sell to {selectedRoute.sellHub} at {selectedRoute.sellPrice} ISK
          </p>
          <p>Profit: {selectedRoute.profitPerUnit} ISK per unit ({selectedRoute.roi}% ROI)</p>
        </div>
      )}
    </div>
  );
}
```

### Dynamic Item Analysis

```jsx
import { useState } from 'react';
import { RegionalArbitrage } from '@/components/trading';

function DynamicArbitrage() {
  const [item, setItem] = useState({ id: 34, name: 'Tritanium' });

  const popularItems = [
    { id: 34, name: 'Tritanium' },
    { id: 35, name: 'Pyerite' },
    { id: 36, name: 'Mexallon' },
  ];

  return (
    <div className="space-y-4">
      <select
        value={item.id}
        onChange={(e) => {
          const selected = popularItems.find(i => i.id === parseInt(e.target.value));
          setItem(selected);
        }}
        className="px-3 py-2 border rounded"
      >
        {popularItems.map(item => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>

      <RegionalArbitrage
        itemId={item.id}
        itemName={item.name}
        onSelect={(route) => console.log(route)}
      />
    </div>
  );
}
```

## Component Structure

The component displays:

1. **Header**: Title and item name
2. **Best Route Card**: Highlighted card showing the most profitable arbitrage opportunity
   - Buy hub and price
   - Sell hub and price
   - Profit per unit, ROI, and jump distance
   - Optional "Select This Route" button
3. **Hub Comparison Table**: Sortable table showing all hubs with:
   - Trade hub name and region
   - Best buy price (lowest sell order) with star for best
   - Best sell price (highest buy order) with star for best
   - Daily volume
4. **All Routes List**: Expandable list of all profitable routes (if more than one exists)
5. **Trading Tips**: Helpful information about considerations for arbitrage trading

## Data Flow

1. Component receives `itemId` prop
2. Fetches market orders from ESI for each trade hub's region
3. Filters orders to specific hub stations
4. Analyzes buy and sell orders to find best prices
5. Calculates all possible arbitrage routes
6. Sorts routes by profit per unit
7. Renders comparison table and highlights best route

## Styling

The component uses:
- **GlassmorphicCard**: Main container with frosted glass effect
- **Tailwind CSS**: Utility classes for layout and styling
- **Space Theme Colors**:
  - `accent-cyan`: Primary accent color
  - `accent-gold`: Secondary accent for highlights
  - `text-primary`, `text-secondary`: Text hierarchy
  - `space-dark`, `space-mid`: Background colors

## Performance Considerations

- **Parallel Fetching**: All hub data fetched simultaneously using `Promise.all`
- **Memoization**: Arbitrage calculations memoized with `useMemo`
- **Cleanup**: Proper component unmounting to prevent memory leaks
- **Error Handling**: Graceful degradation when hub data unavailable

## API Dependencies

The component uses the following from `/api/esi.js`:

```javascript
import { getMarketOrders } from '@/api/esi';
```

The `getMarketOrders` function fetches market orders from the EVE ESI API:
```
GET /markets/{region_id}/orders/?type_id={type_id}&order_type=all
```

## Utility Dependencies

```javascript
import { formatISK, formatNumber, formatPercent } from '@/utils/formatters';
import { TRADE_HUBS } from '@/utils/constants';
```

## Best Practices

1. **Item Validation**: Ensure `itemId` is a valid EVE type ID
2. **Error Handling**: Component handles API failures gracefully
3. **Loading States**: Shows spinner while fetching data
4. **Volume Consideration**: Check daily volume before committing to large trades
5. **Route Safety**: Consider security status of systems between hubs
6. **Market Depth**: Verify sufficient buy orders exist at destination

## Future Enhancements

Potential improvements:
- Cache market data with configurable TTL
- Historical arbitrage tracking
- Alert notifications for profitable opportunities
- Integration with route planning tools
- Cargo capacity calculations
- Transaction cost estimates (fuel, time, risk)

## Related Components

- **RegionalPriceComparison**: Similar component with different focus
- **MarketSpreadAnalyzer**: Single-hub market depth analysis
- **OptimalPricing**: Competitive pricing recommendations

## Support

For issues or questions:
- Check the example file: `RegionalArbitrage.example.jsx`
- Review integration guide: `INTEGRATION_GUIDE.md`
- See main README: `README.md`

## License

Part of EVETrade - MIT License
