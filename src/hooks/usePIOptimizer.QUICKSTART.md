# usePIOptimizer Hook - Quick Start Guide

## Installation

No installation needed - the hook is already integrated into the EVETrade codebase.

## Basic Usage

```javascript
import { usePIOptimizer } from '../hooks/usePIOptimizer';

function MyComponent() {
  const { data, loading, error, fetchPIOpportunities } = usePIOptimizer();

  const handleSearch = async () => {
    await fetchPIOpportunities({
      regionId: 10000002, // Jita
      tier: 'P2',         // P2 materials only
      minROI: 10,         // 10% minimum ROI
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleSearch}>Search</button>
      {data?.opportunities.map(opp => (
        <div key={opp['Item ID']}>
          {opp.Item} - ROI: {opp.ROI}%
        </div>
      ))}
    </div>
  );
}
```

## Available Methods

### fetchPIOpportunities(params)
Fetches PI opportunities from the API.

**Parameters:**
- `regionId` (number, default: 10000002) - Market region ID
- `tier` (string, default: 'all') - PI tier (all, P0, P1, P2, P3, P4)
- `minROI` (number, default: 0) - Minimum ROI percentage
- `minProfit` (number, default: 0) - Minimum profit per unit
- `minVolume` (number, default: 0) - Minimum daily volume
- `characterId` (number, optional) - Character ID for personalized data
- `accessToken` (string, optional) - ESI access token
- `forceRefresh` (boolean, default: false) - Bypass cache

**Returns:** Promise<data>

### filterOpportunities(opportunities, filters)
Filters opportunities by criteria.

**Filters:**
- `tier` - Filter by tier
- `minProfit` - Minimum profit
- `minROI` - Minimum ROI
- `liquidity` - Liquidity level (High, Medium, Low)
- `search` - Search by item name
- `minVolume` - Minimum daily volume

### sortOpportunities(opportunities, sortBy, ascending)
Sorts opportunities by a field.

**Fields:** ROI, Profit per Unit, Profit per m³, Daily Sell Volume, Spread %

### getOpportunitiesByTier(opportunities)
Groups opportunities by tier (P0-P4).

### calculateSummary(opportunities)
Calculates summary statistics.

## Common Patterns

### Filter and Sort
```javascript
const { data, filterOpportunities, sortOpportunities } = usePIOptimizer();

const filtered = filterOpportunities(data?.opportunities, {
  tier: 'P3',
  minROI: 20,
  liquidity: 'High',
});

const sorted = sortOpportunities(filtered, 'ROI', false);
```

### With Authentication
```javascript
await fetchPIOpportunities({
  regionId: 10000002,
  tier: 'all',
  characterId: myCharacterId,
  accessToken: myAccessToken,
});

// Access character PI data
if (data?.characterPI) {
  console.log('Planets:', data.characterPI.planets);
}
```

### Cache Management
```javascript
const { clearCache } = usePIOptimizer();

// Clear specific cache entry
clearCache({ regionId: 10000002, tier: 'P2' });

// Clear all cache
clearCache();
```

### Summary Statistics
```javascript
const { data, calculateSummary } = usePIOptimizer();

const summary = calculateSummary(data?.opportunities);
console.log('Average ROI:', summary.avgROI);
console.log('Best item:', summary.highestROI.Item);
```

## Response Structure

```javascript
{
  opportunities: [
    {
      'Item ID': 2389,
      'Item': 'Bacteria',
      'Tier': 'P1',
      'Tier Name': 'Processed Materials',
      'Buy Price': 1500.50,
      'Sell Price': 1200.00,
      'Spread': 300.50,
      'Spread %': 25.0,
      'Profit per Unit': 300.50,
      'ROI': 25.0,
      'Volume (m³)': 0.38,
      'Profit per m³': 790.79,
      'Daily Sell Volume': 50000,
      'Daily Buy Volume': 45000,
      'Liquidity': 'Medium',
      'Orders': 42
    }
  ],
  total: 100,
  regionId: 10000002,
  tier: 'all',
  characterPI: { /* Optional, if authenticated */ }
}
```

## Error Handling

```javascript
try {
  await fetchPIOpportunities({ regionId: 10000002 });
} catch (err) {
  console.error('Failed:', err.message);
}

// Or use error state
if (error) {
  return <div>Error: {error.message}</div>;
}
```

## Performance Tips

1. **Use caching**: Data is cached for 5 minutes by default
2. **Avoid over-fetching**: Use filters to reduce data size
3. **Cancel on unmount**: Hook automatically cancels pending requests
4. **Batch operations**: Filter and sort in one pass

## Testing

```javascript
import { renderHook, waitFor } from '@testing-library/react';
import { usePIOptimizer } from './usePIOptimizer';

test('fetches PI opportunities', async () => {
  const { result } = renderHook(() => usePIOptimizer());

  await result.current.fetchPIOpportunities({
    regionId: 10000002,
    tier: 'P1',
  });

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).not.toBeNull();
});
```

## See Also

- [Full Documentation](../../../PI_OPTIMIZER.md)
- [Example Component](./usePIOptimizer.example.jsx)
- [Test Suite](./usePIOptimizer.test.js)
- [API Endpoint](/api/pi-optimizer.js)
