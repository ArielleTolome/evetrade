# PI (Planetary Interaction) Optimizer Feature

## Overview

The PI Optimizer feature helps EVE Online players identify profitable Planetary Interaction trading opportunities by analyzing market prices for PI materials across all tiers (P0 through P4).

## Files Created

### Backend API
- **`/api/pi-optimizer.js`** - Serverless function that analyzes PI materials and calculates profitability

### Frontend Hook
- **`/src/hooks/usePIOptimizer.js`** - React hook for fetching and managing PI optimization data

### API Integration
- **`/src/api/trading.js`** - Added `fetchPIOpportunities()` function for easy API consumption

## Features

### 1. PI Material Analysis
- Analyzes all PI material tiers (P0, P1, P2, P3, P4)
- Calculates buy/sell spreads and profit margins
- Identifies liquidity levels (High, Medium, Low)
- Computes profit per m³ for cargo optimization

### 2. Market Statistics
- Best buy and sell prices
- Daily trading volumes
- Number of active orders
- Spread percentages

### 3. Character PI Integration (Optional)
For authenticated users with ESI access:
- Fetches character's PI colonies
- Shows planet types and upgrade levels
- Provides personalized PI recommendations

## API Endpoint

### `/api/pi-optimizer`

**Method:** GET

**Query Parameters:**
- `regionId` (optional, default: 10000002) - Region ID for market prices (The Forge/Jita)
- `tier` (optional, default: 'all') - PI tier filter (all, P0, P1, P2, P3, P4)
- `minProfit` (optional, default: 0) - Minimum profit per unit in ISK
- `minROI` (optional, default: 0) - Minimum ROI percentage
- `minVolume` (optional, default: 0) - Minimum daily sell volume
- `characterId` (optional) - EVE character ID for personalized analysis

**Headers:**
- `Authorization: Bearer {access_token}` (optional, required for character-specific data)

**Response:**
```json
{
  "opportunities": [
    {
      "Item ID": 2389,
      "Item": "Bacteria",
      "Tier": "P1",
      "Tier Name": "Processed Materials",
      "Buy Price": 1500.50,
      "Sell Price": 1200.00,
      "Spread": 300.50,
      "Spread %": 25.0,
      "Profit per Unit": 300.50,
      "ROI": 25.0,
      "Volume (m³)": 0.38,
      "Profit per m³": 790.79,
      "Daily Sell Volume": 50000,
      "Daily Buy Volume": 45000,
      "Liquidity": "Medium",
      "Orders": 42
    }
  ],
  "total": 100,
  "regionId": 10000002,
  "tier": "all",
  "characterPI": {
    "planets": [...],
    "total": 6,
    "analyzed": 6
  },
  "requestId": "abc123"
}
```

## React Hook Usage

### Basic Usage

```javascript
import { usePIOptimizer } from '../hooks/usePIOptimizer';

function PITradingPage() {
  const {
    data,
    loading,
    error,
    fetchPIOpportunities,
  } = usePIOptimizer();

  const handleSearch = async () => {
    await fetchPIOpportunities({
      regionId: 10000002, // Jita
      tier: 'P2', // Only P2 materials
      minROI: 10, // Minimum 10% ROI
      minVolume: 10000, // Minimum 10k daily volume
    });
  };

  return (
    <div>
      <button onClick={handleSearch}>Find PI Opportunities</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <h2>Found {data.total} opportunities</h2>
          {data.opportunities.map(opp => (
            <div key={opp['Item ID']}>
              <h3>{opp.Item}</h3>
              <p>ROI: {opp.ROI}%</p>
              <p>Profit: {opp['Profit per Unit']} ISK</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### With Character Authentication

```javascript
const handleAuthenticatedSearch = async () => {
  await fetchPIOpportunities({
    regionId: 10000002,
    tier: 'all',
    characterId: 123456789,
    accessToken: 'your_esi_access_token',
  });
};

// Access character PI data
if (data?.characterPI) {
  console.log('Character has', data.characterPI.total, 'PI colonies');
  data.characterPI.planets.forEach(planet => {
    console.log(`Planet ${planet['Planet ID']} - ${planet['Planet Type']}`);
  });
}
```

### Filtering and Sorting

```javascript
const {
  data,
  filterOpportunities,
  sortOpportunities,
  getOpportunitiesByTier,
  calculateSummary,
} = usePIOptimizer();

// Filter opportunities
const filtered = filterOpportunities(data?.opportunities, {
  tier: 'P3',
  minProfit: 1000,
  liquidity: 'High',
  search: 'robotics',
});

// Sort by profit per m³
const sorted = sortOpportunities(filtered, 'Profit per m³', false);

// Group by tier
const byTier = getOpportunitiesByTier(data?.opportunities);
console.log('P1 opportunities:', byTier.P1.length);

// Calculate statistics
const summary = calculateSummary(data?.opportunities);
console.log('Average ROI:', summary.avgROI);
console.log('Highest profit item:', summary.highestProfit.Item);
```

## API Client Usage

```javascript
import { fetchPIOpportunities } from '../api/trading';

// Basic fetch
const data = await fetchPIOpportunities({
  regionId: 10000002,
  tier: 'P2',
  minROI: 15,
});

// With authentication
const authData = await fetchPIOpportunities({
  regionId: 10000002,
  tier: 'all',
  characterId: 123456789,
  accessToken: 'your_esi_access_token',
});
```

## PI Material Tiers

### P0 - Raw Materials
Extracted directly from planets:
- Aqueous Liquids, Base Metals, Carbon Compounds, etc.
- Lowest profit margins but highest volumes
- Used as input for P1 processing

### P1 - Processed Materials
First tier of processing:
- Bacteria, Biofuels, Biomass, Electrolytes, etc.
- Moderate profit margins
- Used as input for P2 processing

### P2 - Refined Materials
Second tier of processing:
- Biocells, Construction Blocks, Consumer Electronics, etc.
- Good profit margins with decent volume
- Used as input for P3 processing

### P3 - Specialized Materials
Third tier of processing:
- Biotech Research Reports, Robotics, Guidance Systems, etc.
- Higher profit margins but lower volume
- Used as input for P4 processing

### P4 - Advanced Materials
Fourth tier (final products):
- Broadcast Node, Nano-Factory, Wetware Mainframe, etc.
- Highest profit margins but lowest liquidity
- Used in POS fuel blocks and advanced manufacturing

## Profit Calculation

The optimizer calculates profit opportunities by:

1. **Spread Trading**: Buy at lowest sell price, sell at highest buy price
   - Profit = Best Buy Price - Best Sell Price
   - ROI = (Profit / Best Sell Price) × 100

2. **Cargo Optimization**: Considers volume for hauling efficiency
   - Profit per m³ = Profit / Volume
   - Helps identify most profitable items for limited cargo space

3. **Liquidity Assessment**: Based on daily trading volume
   - High: > 100,000 units/day
   - Medium: 10,000 - 100,000 units/day
   - Low: < 10,000 units/day

## ESI Scopes Required

For character-specific features:
- `esi-planets.manage_planets.v1` - Read character's PI colonies
- `esi-planets.read_customs_offices.v1` - Read customs office info

## Performance Considerations

- API caches market data for 5 minutes (ESI update frequency)
- Hook implements client-side caching with 5-minute TTL
- Limited to analyzing first 100 materials to avoid timeouts
- Parallel fetching for market orders to improve performance
- LRU cache for type info to reduce ESI calls

## Error Handling

The API and hook handle various error scenarios:

1. **Authentication Errors (401)**: Token expired or invalid
2. **Forbidden Errors (403)**: Missing required ESI scopes
3. **Rate Limiting (429)**: Automatic retry with exponential backoff
4. **Timeout Errors**: 15-second timeout per ESI request
5. **Network Errors**: Automatic retry up to 3 times

## Cache Management

```javascript
const { clearCache } = usePIOptimizer();

// Clear specific cache entry
clearCache({
  regionId: 10000002,
  tier: 'P2',
  minROI: 10,
});

// Clear all cache
clearCache();
```

## Integration Example

Complete example showing PI optimizer in a trading page:

```javascript
import { usePIOptimizer } from '../hooks/usePIOptimizer';
import { useState } from 'react';

function PIOptimizationPage() {
  const {
    data,
    loading,
    error,
    fetchPIOpportunities,
    filterOpportunities,
    calculateSummary,
  } = usePIOptimizer();

  const [filters, setFilters] = useState({
    regionId: 10000002,
    tier: 'all',
    minROI: 10,
    minVolume: 5000,
  });

  const handleSearch = async () => {
    await fetchPIOpportunities(filters);
  };

  const summary = data ? calculateSummary(data.opportunities) : null;

  return (
    <div>
      <h1>PI Material Optimizer</h1>

      {/* Filters */}
      <div>
        <select
          value={filters.tier}
          onChange={(e) => setFilters({...filters, tier: e.target.value})}
        >
          <option value="all">All Tiers</option>
          <option value="P0">P0 - Raw</option>
          <option value="P1">P1 - Processed</option>
          <option value="P2">P2 - Refined</option>
          <option value="P3">P3 - Specialized</option>
          <option value="P4">P4 - Advanced</option>
        </select>

        <input
          type="number"
          placeholder="Min ROI %"
          value={filters.minROI}
          onChange={(e) => setFilters({...filters, minROI: +e.target.value})}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <h2>Summary</h2>
          <p>Total Opportunities: {summary.totalOpportunities}</p>
          <p>Average ROI: {summary.avgROI.toFixed(2)}%</p>
          <p>Best Item: {summary.highestROI?.Item} ({summary.highestROI?.ROI}% ROI)</p>
        </div>
      )}

      {/* Results */}
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
      {data?.opportunities && (
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Tier</th>
              <th>Buy Price</th>
              <th>Sell Price</th>
              <th>Profit</th>
              <th>ROI</th>
              <th>Liquidity</th>
            </tr>
          </thead>
          <tbody>
            {data.opportunities.map(opp => (
              <tr key={opp['Item ID']}>
                <td>{opp.Item}</td>
                <td>{opp.Tier}</td>
                <td>{opp['Buy Price'].toLocaleString()} ISK</td>
                <td>{opp['Sell Price'].toLocaleString()} ISK</td>
                <td>{opp['Profit per Unit'].toLocaleString()} ISK</td>
                <td>{opp.ROI}%</td>
                <td>{opp.Liquidity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## Future Enhancements

Potential improvements for future versions:

1. **Production Chain Analysis**: Calculate profit for full P0→P4 production chains
2. **Customs Office Tax Integration**: Factor in import/export taxes per system
3. **Planet Recommendation**: Suggest best planets for specific PI products
4. **Historical Price Trends**: Show price history and volatility
5. **Multi-Region Comparison**: Compare PI prices across multiple trade hubs
6. **Route Optimization**: Calculate best hauling routes for PI materials
7. **Manufacturing Integration**: Link PI materials to T2 ship/module production

## Related Features

This feature complements other EVETrade features:
- **Hauling Optimizer**: Use PI profit data for cross-region hauling
- **Market Analysis**: Track PI price trends over time
- **Industry Calculator**: Calculate manufacturing costs using PI materials
- **Contract Finder**: Find underpriced PI contracts

## Support

For issues or questions:
- Check API logs using the `requestId` returned in responses
- Verify ESI scopes are properly authorized
- Ensure market data is available for the selected region
- Confirm type IDs are valid PI materials
