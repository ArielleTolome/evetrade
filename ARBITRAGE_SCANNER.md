# Cross-Region Arbitrage Scanner

A powerful feature for EVETrade that identifies profitable price discrepancies across multiple regions in EVE Online.

## Overview

The Arbitrage Scanner analyzes market data from multiple regions simultaneously to find opportunities where items can be bought in one region and sold in another for a profit, accounting for taxes and fees.

## Features

### 1. Multi-Region Scanning
- Scans multiple regions in parallel for maximum efficiency
- Default regions include major trade hubs: Jita, Amarr, Dodixie, Rens
- Supports custom region combinations
- Fetches up to 60 pages per region (buy and sell orders)

### 2. Smart Opportunity Detection
- Identifies price spreads between region pairs
- Calculates net profit after sales tax
- Validates both directions (A→B and B→A)
- Ensures sufficient order depth on both sides

### 3. Risk Assessment
- Risk Score (0-100): Combines order depth and volume
  - 0-30: High risk (thin orderbook)
  - 31-60: Medium risk
  - 61-100: Low risk (deep orderbook)
- Order Depth tracking: Shows buy/sell order counts
- Volume analysis: Total available units

### 4. Cargo Optimization
- Filters by maximum m³ per item
- Perfect for industrial ships (60,000m³ default)
- Adjustable for different cargo capacities

### 5. Financial Controls
- Minimum profit per unit threshold
- Minimum ROI percentage filter
- Maximum investment budget limit
- Sales tax consideration (default 8%)

## API Endpoint

### `/api/arbitrage.js`

**Method:** GET

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `regions` | string | '10000002,10000043,10000032,10000030' | Comma-separated region IDs |
| `minProfit` | number | 1000 | Minimum profit per unit (ISK) |
| `minROI` | number | 5 | Minimum return on investment (%) |
| `maxVolume` | number | 60000 | Maximum m³ per item |
| `minDepth` | number | 3 | Minimum order depth (orders on each side) |
| `maxBudget` | number | 1000000000 | Maximum budget for buying (ISK) |
| `tax` | number | 0.08 | Sales tax rate (decimal) |

**Response Format:**

```json
[
  {
    "Item ID": 34,
    "Item": "Tritanium",
    "Buy Region": "The Forge",
    "Sell Region": "Domain",
    "Buy Price": 5.50,
    "Sell Price": 6.20,
    "Profit per Unit": 0.62,
    "Total Profit": 620000,
    "Quantity": 1000000,
    "Volume (m³)": 10000,
    "ROI": 11.3,
    "Risk Score": 85,
    "Order Depth": "45/38",
    "Investment": 5500000
  }
]
```

**Caching:**
- `Cache-Control: public, max-age=60, s-maxage=120`
- Client cache: 60 seconds
- CDN cache: 120 seconds

## React Hook

### `useArbitrageScanner()`

A comprehensive React hook providing arbitrage scanning capabilities with built-in filtering and statistics.

**Returns:**

```javascript
{
  // State
  data: array,              // Filtered results
  rawData: array,           // Unfiltered results
  loading: boolean,         // Scan in progress
  error: object|null,       // Error information
  lastUpdated: Date|null,   // Last successful scan time
  filterOptions: object,    // Current filter settings

  // Actions
  scan: function,           // Start a new scan
  cancel: function,         // Cancel current scan
  reset: function,          // Reset all state
  updateFilters: function,  // Update filter settings
  resetFilters: function,   // Reset to default filters

  // Utilities
  getStats: function,       // Get summary statistics
  getRegions: function,     // Get list of regions in results
  filterByItem: function,   // Filter by item name
  filterByRegionPair: function, // Filter by region pair
}
```

**Example Usage:**

```javascript
import { useArbitrageScanner } from './hooks/useArbitrageScanner';

function ArbitragePage() {
  const { data, loading, scan, getStats } = useArbitrageScanner();

  const handleScan = () => {
    scan({
      regions: ['10000002', '10000043'], // Jita and Amarr
      minProfit: 5000,
      minROI: 10,
      maxVolume: 30000,
    });
  };

  const stats = getStats();

  return (
    <div>
      <button onClick={handleScan} disabled={loading}>
        Scan for Opportunities
      </button>

      {stats.totalOpportunities > 0 && (
        <p>Found {stats.totalOpportunities} opportunities
           worth {stats.totalProfit.toLocaleString()} ISK</p>
      )}

      {/* Display results */}
    </div>
  );
}
```

## API Client Function

### `fetchArbitrage(params)`

Direct API call for arbitrage scanning, automatically included in `/src/api/trading.js`.

**Usage:**

```javascript
import { fetchArbitrage } from './api/trading';

const opportunities = await fetchArbitrage({
  regions: ['10000002', '10000043', '10000032'],
  minProfit: 2000,
  minROI: 8,
  maxVolume: 60000,
});
```

## Major Trade Hub Regions

| Region ID | Region Name | Primary Station | Security |
|-----------|-------------|-----------------|----------|
| 10000002 | The Forge | Jita IV - Moon 4 | High |
| 10000043 | Domain | Amarr VIII - Emperor Family Academy | High |
| 10000032 | Sinq Laison | Dodixie IX - Moon 20 | High |
| 10000030 | Heimatar | Rens VI - Moon 8 | High |
| 10000042 | Metropolis | Hek VIII - Moon 12 | High |

## Algorithm Details

### 1. Data Collection
- Fetches market orders from ESI API for all specified regions
- Parallel fetching with batch limits (10 pages at a time)
- Up to 30 buy pages and 30 sell pages per region
- Handles timeouts and errors gracefully

### 2. Cross-Region Analysis
For each item type that exists in multiple regions:
- Groups orders by type and region
- Filters items exceeding maxVolume
- Checks minimum order depth requirement

### 3. Opportunity Identification
For each region pair (A, B):
- **Direction A→B**: Buy from sell orders in A, sell to buy orders in B
- **Direction B→A**: Buy from sell orders in B, sell to buy orders in A
- Calculates feasible quantity based on:
  - Budget constraint
  - Supply availability
  - Demand availability

### 4. Profitability Calculation
```
totalBuyCost = buyPrice × quantity
totalSellRevenue = sellPrice × quantity
salesTaxAmount = totalSellRevenue × tax
profit = totalSellRevenue - totalBuyCost - salesTaxAmount
profitPerUnit = profit / quantity
roi = (profit / totalBuyCost) × 100
```

### 5. Risk Scoring
```
buyDepth = number of buy orders
sellDepth = number of sell orders
totalVolume = sum of all order volumes

depthScore = min((buyDepth + sellDepth) / 20 × 50, 50)
volumeScore = min(totalVolume / 10000 × 50, 50)

riskScore = depthScore + volumeScore
```

### 6. Filtering and Sorting
- Applies minProfit threshold
- Applies minROI threshold
- Limits results to top 500 opportunities
- Sorts by total profit (descending)

## Performance Considerations

### API Endpoint
- Timeout: 15 seconds per ESI request
- Parallel page fetching (10 pages at a time)
- LRU cache for type info (2000 entries max)
- LRU cache for region names (100 entries)
- Request batching for type names (1000 at a time)

### Caching Strategy
- Market data cached for 60 seconds (client)
- CDN cache for 120 seconds
- Type info cached indefinitely (LRU eviction)
- Region names cached indefinitely (LRU eviction)

### Optimization Tips
1. **Reduce Region Count**: Fewer regions = faster scans
2. **Increase Filters**: Higher thresholds = faster processing
3. **Limit Volume**: Lower maxVolume = fewer items analyzed
4. **Increase minDepth**: Reduces computation on thin orderbooks

## Integration with Existing Features

The arbitrage scanner complements existing EVETrade features:

1. **Station Trading**: Identifies inter-region opportunities
2. **Hauling Pages**: Provides region-level trade routes
3. **Order Depth**: Detailed view of specific item opportunities
4. **Trading Table**: Reusable component for displaying results

## Future Enhancements

Potential improvements:
- [ ] Jump distance calculation between regions
- [ ] Route safety scoring
- [ ] Historical price trend analysis
- [ ] Volume velocity tracking
- [ ] Alert system for high-value opportunities
- [ ] Export to route optimizer
- [ ] Multi-item hauling optimization
- [ ] Profit margin tracking over time

## Error Handling

The system handles various error conditions:
- ESI API timeouts (15s limit)
- Rate limiting (429 responses)
- Server errors (500+ responses)
- Network failures
- Invalid parameters
- Insufficient data

Errors are logged with request IDs for debugging and reported to Sentry in production.

## Security

- CORS enabled for cross-origin requests
- Input validation on all parameters
- Numeric bounds checking
- Array size limits
- No authentication required (public market data)

## Testing

To test the arbitrage scanner:

```bash
# Local development
npm run dev

# Test API endpoint directly
curl "http://localhost:5173/api/arbitrage?regions=10000002,10000043&minProfit=5000&minROI=10"

# Production test
curl "https://evetrade.vercel.app/api/arbitrage?regions=10000002,10000043"
```

## License

Part of the EVETrade project. See main project LICENSE for details.
