# useIndustryProfits Hook - Quick Start Guide

## Overview

The `useIndustryProfits` hook provides an easy way to fetch and manage character blueprint profitability data from the EVETrade Industry API.

## Installation

The hook is already included in the project. Simply import it:

```javascript
import { useIndustryProfits } from './hooks/useIndustryProfits';
```

## Basic Usage

### Simple Example

```javascript
import React, { useState } from 'react';
import { useIndustryProfits } from './hooks/useIndustryProfits';

function MyIndustryComponent() {
  const [characterId, setCharacterId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const {
    data,
    loading,
    error,
    fetchIndustryProfits
  } = useIndustryProfits();

  const handleFetch = async () => {
    try {
      await fetchIndustryProfits({
        characterId: parseInt(characterId),
        accessToken: accessToken,
        regionId: 10000002, // The Forge (Jita)
      });
    } catch (err) {
      console.error('Failed to fetch blueprints:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleFetch}>Fetch Blueprints</button>
      {data && (
        <div>
          <p>Found {data.total} blueprints</p>
          <ul>
            {data.blueprints.map(bp => (
              <li key={bp['Blueprint ID']}>
                {bp['Blueprint Name']} - {bp['Market Price'].toLocaleString()} ISK
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### Hook Parameters

```javascript
useIndustryProfits(options)
```

**Options:**
- `cacheTimeout` (number): Cache duration in milliseconds (default: 300000 = 5 minutes)

### Return Values

The hook returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `data` | object\|null | API response data |
| `loading` | boolean | Whether request is in progress |
| `error` | object\|null | Error object if request failed |
| `lastUpdated` | Date\|null | Timestamp of last successful fetch |
| `fetchIndustryProfits` | function | Function to fetch data |
| `filterBlueprints` | function | Function to filter blueprints |
| `reset` | function | Reset all state |
| `cancel` | function | Cancel pending request |
| `clearCache` | function | Clear cached data |

### fetchIndustryProfits Parameters

```javascript
fetchIndustryProfits({
  characterId,      // Required: EVE character ID
  accessToken,      // Required: ESI access token
  regionId,         // Optional: Region ID (default: 10000002)
  minProfit,        // Optional: Minimum profit filter
  minROI,           // Optional: Minimum ROI % filter
  activity,         // Optional: Industry activity filter
  meLevel,          // Optional: Material efficiency filter (0-10)
  forceRefresh      // Optional: Bypass cache (default: false)
})
```

## Advanced Usage

### With Filters

```javascript
const { data, fetchIndustryProfits, filterBlueprints } = useIndustryProfits();

// Fetch all blueprints
await fetchIndustryProfits({
  characterId: 123456,
  accessToken: 'token',
});

// Filter for high ME blueprints
const highMEBlueprints = filterBlueprints(data.blueprints, {
  meLevel: 10,
  minPrice: 1000000,
  runsType: 'original'
});
```

### With Auto-Refresh

```javascript
import { useEffect } from 'react';

function AutoRefreshExample({ characterId, accessToken }) {
  const { data, fetchIndustryProfits } = useIndustryProfits({
    cacheTimeout: 300000 // 5 minutes
  });

  useEffect(() => {
    if (!characterId || !accessToken) return;

    // Initial fetch
    fetchIndustryProfits({ characterId, accessToken });

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchIndustryProfits({
        characterId,
        accessToken,
        forceRefresh: true
      });
    }, 300000);

    return () => clearInterval(interval);
  }, [characterId, accessToken]);

  return (
    <div>
      {data && <p>Blueprints: {data.total}</p>}
    </div>
  );
}
```

### With Search

```javascript
const [searchTerm, setSearchTerm] = useState('');

const filteredBlueprints = data?.blueprints
  ? filterBlueprints(data.blueprints, { search: searchTerm })
  : [];

return (
  <div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search blueprints..."
    />
    {filteredBlueprints.map(bp => (
      <div key={bp['Blueprint ID']}>{bp['Blueprint Name']}</div>
    ))}
  </div>
);
```

## Filter Options

The `filterBlueprints` function accepts these filters:

```javascript
filterBlueprints(blueprints, {
  meLevel: 10,              // Filter by ME level
  minPrice: 1000000,        // Minimum market price
  search: 'rifter',         // Search blueprint names
  runsType: 'original'      // 'original', 'copy', or omit for all
})
```

## Common Regions

```javascript
const REGIONS = {
  THE_FORGE: 10000002,      // Jita
  DOMAIN: 10000043,         // Amarr
  SINQ_LAISON: 10000032,    // Dodixie
  HEIMATAR: 10000030,       // Rens
  METROPOLIS: 10000042,     // Hek
};

// Use in fetch
fetchIndustryProfits({
  characterId,
  accessToken,
  regionId: REGIONS.THE_FORGE
});
```

## Error Handling

```javascript
const { error, fetchIndustryProfits } = useIndustryProfits();

const handleFetch = async () => {
  try {
    await fetchIndustryProfits({
      characterId: 123456,
      accessToken: 'token'
    });
  } catch (err) {
    if (err.message.includes('Authentication')) {
      // Handle auth error - redirect to login
      window.location.href = '/login';
    } else if (err.message.includes('403')) {
      // Handle missing scopes
      alert('Please authorize blueprint access');
    } else {
      // Handle other errors
      console.error('Unexpected error:', err);
    }
  }
};

// Or use error state
if (error) {
  return (
    <div className="error">
      <h3>Error Loading Blueprints</h3>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try Again</button>
    </div>
  );
}
```

## Caching

The hook automatically caches results for 5 minutes (configurable):

```javascript
// Custom cache timeout (10 minutes)
const { fetchIndustryProfits } = useIndustryProfits({
  cacheTimeout: 600000
});

// Force refresh (bypass cache)
fetchIndustryProfits({
  characterId,
  accessToken,
  forceRefresh: true
});

// Clear cache manually
clearCache();

// Clear cache for specific params only
clearCache({ characterId, regionId });
```

## Response Data Structure

```javascript
{
  data: {
    blueprints: [
      {
        "Blueprint ID": 1001,
        "Blueprint Type ID": 689,
        "Blueprint Name": "Rifter Blueprint",
        "Material Efficiency": 10,
        "Time Efficiency": 20,
        "Runs": "Original",  // or number for BPCs
        "Market Price": 5000000,
        "Location ID": 60003760,
        "Location Flag": "Hangar",
        "Quantity": 1
      }
    ],
    total: 50,          // Blueprints returned
    totalOwned: 125,    // Total blueprints owned
    activeJobs: 5,      // Active industry jobs
    requestId: "abc123" // Debug request ID
  },
  loading: false,
  error: null,
  lastUpdated: Date
}
```

## Testing

The hook includes comprehensive tests. Run them with:

```bash
npm test src/hooks/useIndustryProfits.test.js
```

## Complete Example

See `useIndustryProfits.example.js` for complete working examples including:
- Basic form-based fetching
- Auto-fetch on mount
- Advanced filtering
- Search functionality
- Multiple region support

## Troubleshooting

### "characterId is required"
Make sure you're passing a numeric character ID:
```javascript
fetchIndustryProfits({
  characterId: parseInt(myCharacterId), // Convert to number
  accessToken
});
```

### "Authentication failed"
Your access token may have expired. Re-authenticate with ESI:
```javascript
// Redirect to ESI auth flow
window.location.href = 'https://login.eveonline.com/...';
```

### "Access forbidden - missing scopes"
Ensure your ESI token has the `esi-characters.read_blueprints.v1` scope.

### No blueprints returned
Check that:
1. Character actually owns blueprints
2. Filters aren't too restrictive
3. Character ID is correct

## Performance Tips

1. **Use caching**: Don't set `forceRefresh: true` on every call
2. **Filter client-side**: Use `filterBlueprints` instead of re-fetching
3. **Debounce searches**: Use debouncing for search inputs
4. **Limit refreshes**: Don't auto-refresh more often than every 5 minutes

## Related Documentation

- API Endpoint: `/api/industry.README.md`
- Example Component: `useIndustryProfits.example.js`
- Tests: `useIndustryProfits.test.js`
- ESI Documentation: https://esi.evetech.net/ui/

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Verify ESI token scopes
3. Check network tab for API responses
4. Review example files for working implementations
