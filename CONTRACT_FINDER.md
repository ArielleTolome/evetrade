# Contract Opportunity Finder

A comprehensive system for identifying profitable contract opportunities in EVE Online.

## Overview

The Contract Opportunity Finder analyzes public contracts across EVE Online regions to identify profitable trading opportunities. It supports three types of contracts:

1. **Item Exchange** - Buy/sell bundles of items below market value
2. **Courier** - Hauling contracts with good ISK/jump ratios
3. **Auction** - Undervalued items available for bidding

## Architecture

### Backend: `/api/contracts.js`

Serverless function that fetches and analyzes public contracts from ESI.

#### Features:
- Parallel pagination for efficient contract fetching (up to 20 pages)
- LRU caching for type info, locations, routes, and market prices
- Batch fetching of type information and names
- Route calculation using ESI route API
- Market price lookups for item valuation

#### API Endpoints Used:
- `GET /contracts/public/{region_id}/` - Fetch public contracts
- `GET /contracts/public/items/{contract_id}/` - Get contract items
- `GET /route/{origin}/{destination}/` - Calculate route distance
- `GET /markets/{region_id}/orders/?type_id={type_id}` - Get market prices
- `GET /universe/types/{type_id}/` - Get item info
- `GET /universe/stations/{station_id}/` - Get station names
- `POST /universe/names/` - Batch fetch names

#### Query Parameters:
- `regionId` (default: 10000002) - Region to search
- `contractType` (default: 'all') - Filter by type: all, item_exchange, courier, auction
- `minProfit` (default: 1000000) - Minimum profit threshold
- `maxCollateral` (default: 1000000000) - Max collateral for courier contracts
- `maxVolume` (default: 30000) - Max volume in m³
- `minRewardPerJump` (default: 1000000) - Min ISK/jump for courier contracts

#### Response Format:

**Item Exchange Contracts:**
```json
{
  "Contract ID": 123456,
  "Type": "Item Exchange",
  "Location": "Jita IV - Moon 4 - Caldari Navy Assembly Plant",
  "Items": 5,
  "Contract Price": 10000000,
  "Market Value": 15000000,
  "Profit": 5000000,
  "Profit %": 50.0,
  "Volume": 100.0,
  "Days to Complete": 7,
  "Expires": "2025-12-09",
  "itemDetails": [...]
}
```

**Courier Contracts:**
```json
{
  "Contract ID": 123457,
  "Type": "Courier",
  "From": "Jita IV - Moon 4",
  "To": "Amarr VIII - Emperor Family Academy",
  "Reward": 50000000,
  "Collateral": 500000000,
  "Volume": 15000.0,
  "Jumps": 25,
  "ISK/Jump": 2000000,
  "ISK/m³": 3333,
  "Collateral Ratio": 10.0,
  "Days to Complete": 1,
  "Expires": "2025-12-03"
}
```

**Auction Contracts:**
```json
{
  "Contract ID": 123458,
  "Type": "Auction",
  "Location": "Jita IV - Moon 4",
  "Items": 3,
  "Current Bid": 20000000,
  "Buyout": 30000000,
  "Market Value": 40000000,
  "Profit (Buyout)": 10000000,
  "Profit (Current)": 20000000,
  "Volume": 500.0,
  "Days to Complete": 3,
  "Expires": "2025-12-05"
}
```

### Frontend: `/src/hooks/useContractFinder.js`

Custom React hook for interacting with the contracts API.

#### Features:
- Request cancellation support via AbortController
- Filtering by contract type
- Multiple sorting strategies
- Contract statistics calculation
- Courier route information extraction
- Advanced filtering by multiple criteria

#### Hook API:

```javascript
const {
  // Data
  contracts,        // Array of contract opportunities
  loading,          // Loading state
  error,            // Error state
  lastUpdated,      // Last update timestamp
  statistics,       // Contract statistics

  // Methods
  search,           // Search for contracts
  reset,            // Reset state
  cancel,           // Cancel pending request

  // Filtering and sorting
  filterByType,              // Filter by contract type
  sortByProfitability,       // Sort by various metrics
  filterContracts,           // Advanced filtering
  getTopOpportunities,       // Get top N opportunities

  // Courier-specific
  getCourierRoute,           // Get route info for courier contract
} = useContractFinder();
```

#### Usage Example:

```javascript
import { useContractFinder } from '../hooks/useContractFinder';

function ContractsPage() {
  const {
    contracts,
    loading,
    error,
    statistics,
    search,
    filterByType,
    sortByProfitability,
  } = useContractFinder();

  // Search for contracts
  const handleSearch = async () => {
    await search({
      regionId: 10000002,
      contractType: 'all',
      minProfit: 5000000,
      maxVolume: 50000,
    });
  };

  // Filter courier contracts
  const courierContracts = filterByType('Courier');

  // Sort by ISK/Jump
  const sortedCouriers = sortByProfitability(courierContracts, 'iskPerJump');

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <Error message={error.message} />}

      <div>
        <h2>Statistics</h2>
        <p>Total: {statistics.totalContracts}</p>
        <p>Item Exchange: {statistics.itemExchangeCount}</p>
        <p>Courier: {statistics.courierCount}</p>
        <p>Auction: {statistics.auctionCount}</p>
      </div>

      <button onClick={handleSearch}>Search Contracts</button>

      {/* Display contracts... */}
    </div>
  );
}
```

#### Sorting Strategies:
- `profit` - Total profit (default)
- `profitPercent` - Profit percentage
- `iskPerJump` - ISK per jump (courier)
- `iskPerM3` - ISK per m³ (courier)
- `volume` - Volume (ascending)
- `jumps` - Jump count (ascending)
- `expires` - Expiration date (ascending)

#### Advanced Filtering:

```javascript
const filtered = filterContracts({
  type: 'courier',
  minProfit: 10000000,
  maxVolume: 30000,
  maxJumps: 20,
  minIskPerJump: 1500000,
  maxCollateral: 500000000,
  location: 'Jita',
});
```

## Performance Optimizations

1. **LRU Caching** - Prevents redundant API calls for:
   - Type information (volume, names)
   - Location names (stations, structures)
   - Route calculations
   - Market prices

2. **Parallel Fetching** - Uses Promise.allSettled for:
   - Multi-page contract fetching (batches of 10)
   - Contract item lookups
   - Type information batch fetching

3. **Request Limits** - Prevents timeouts:
   - Max 20 pages of contracts
   - Max 100 item_exchange contracts analyzed
   - Max 100 courier contracts analyzed
   - Max 50 auction contracts analyzed

4. **Batch Operations**:
   - Type names fetched in single POST request (up to 1000 IDs)
   - Volume info fetched in parallel (up to 50 items)

## Caching Strategy

- **API Response Cache**: 5 minutes (300s) browser, 10 minutes (600s) CDN
- **Memory Caches**: LRU with 5000 max entries
  - Automatically evict oldest entries when full
  - Persist across multiple requests within session

## Error Handling

1. **Timeout Protection** - 15 second timeout on all ESI requests
2. **Partial Failures** - Uses Promise.allSettled to continue on partial failures
3. **Graceful Degradation** - Falls back to generic names/values on lookup failures
4. **Request Cancellation** - AbortController support for user-cancelled requests

## Security & Rate Limiting

- CORS enabled for cross-origin requests
- Request IDs for debugging and tracing
- Batch size limits to avoid ESI rate limiting (10 concurrent requests)
- Production mode hides internal error details

## Integration Notes

### API Endpoint
The contracts API is accessible at:
```
GET /api/contracts?regionId=10000002&contractType=all&minProfit=1000000
```

### Required Dependencies
- ESI (EVE Swagger Interface) API access
- Fetch API with AbortController support
- React hooks (for frontend hook)
- axios (via apiClient)

### Major Trade Hub Regions
- The Forge (Jita): `10000002`
- Domain (Amarr): `10000043`
- Heimatar (Rens): `10000030`
- Sinq Laison (Dodixie): `10000032`
- Metropolis (Hek): `10000042`

## Future Enhancements

1. **Auto-refresh** - Implement periodic contract updates (5-10 min intervals)
2. **Contract Notifications** - Alert when new profitable contracts appear
3. **Historical Tracking** - Track contract profit trends over time
4. **Route Optimization** - Suggest multi-stop courier routes
5. **Competition Analysis** - Track how many players are viewing/bidding
6. **Risk Scoring** - Flag potentially risky contracts (scams, etc.)
7. **Character Integration** - Consider character skills for hauling capacity
8. **Bookmark Export** - Export contract locations to EVE bookmarks

## Files Created

1. `/api/contracts.js` - Serverless function (659 lines)
2. `/src/hooks/useContractFinder.js` - React hook (298 lines)
3. `/CONTRACT_FINDER.md` - This documentation

## Testing

To test the contracts API locally:

```bash
# Start dev server
npm run dev

# In another terminal, test the API
curl "http://localhost:3000/api/contracts?regionId=10000002&contractType=courier&minRewardPerJump=500000"
```

To use the hook in a component:

```javascript
import { useContractFinder } from './hooks/useContractFinder';

function MyComponent() {
  const { contracts, loading, search } = useContractFinder();

  useEffect(() => {
    search({ regionId: 10000002 });
  }, []);

  // Render contracts...
}
```

## Deployment

The contracts API will automatically deploy to Vercel with the next commit to main branch.

**Cache Headers**: Responses are cached for 5 minutes client-side, 10 minutes on CDN edge.

## License

Part of the EVETrade project. See main repository LICENSE.
