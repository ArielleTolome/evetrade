# Smart Route Optimizer

A comprehensive route planning feature for EVETrade that uses ESI's route planning API to calculate optimal routes with risk analysis and intelligent recommendations.

## Overview

The Smart Route Optimizer provides traders and haulers with detailed route information including:
- Multiple route preferences (shortest, secure, insecure)
- System-by-system security analysis
- Real-time kill statistics and risk scoring
- Jump fatigue calculations for capital ships
- Cargo value-based risk assessment
- Gank hotspot detection
- Intelligent safety recommendations

## Architecture

### Components

#### 1. API Endpoint: `/api/route-optimizer.js`

Serverless function that interfaces with ESI API and calculates route metrics.

**Features:**
- ESI route calculation with avoid system support
- System security status fetching
- Recent kill data integration
- Risk scoring algorithm
- Jump fatigue calculation
- Gank hotspot detection
- Smart recommendations

**Query Parameters:**
```javascript
{
  origin: number,           // Origin system ID (required)
  destination: number,      // Destination system ID (required)
  preference: string,       // 'shortest', 'secure', or 'insecure' (default: 'shortest')
  avoidSystems: string,     // Comma-separated system IDs to avoid
  cargoValue: number,       // Cargo value in ISK (optional)
  calculateRisk: boolean    // Enable risk calculation (default: true)
}
```

**Response Structure:**
```javascript
{
  origin: {
    system_id: number,
    name: string,
    security_status: number,
    security_level: string,
    risk_score: number,
    is_hotspot: boolean,
    hotspot_name: string,
    recent_kills: number
  },
  destination: { /* same structure */ },
  preference: string,
  statistics: {
    total_jumps: number,
    estimated_time: string,
    high_sec_systems: number,
    low_sec_systems: number,
    null_sec_systems: number,
    average_risk: number,
    risk_rating: string,
    highest_risk: number,
    most_dangerous_system: string,
    jump_fatigue_minutes: number
  },
  route: [/* array of system objects */],
  recommendations: [/* array of safety recommendations */],
  metadata: {
    cargo_value: number,
    avoided_systems: array,
    risk_calculated: boolean
  }
}
```

#### 2. React Hook: `useRouteOptimizer`

Custom hook providing route calculation with caching and comparison.

**Features:**
- Route calculation with request cancellation
- Intelligent caching (routes don't change often)
- Multi-route comparison
- ISK per jump calculations
- Profit after fuel costs
- Alternative route suggestions

**API:**
```javascript
import { useRouteOptimizer } from './hooks/useRouteOptimizer';

const {
  // State
  route,                    // Current route data
  loading,                  // Loading state
  error,                    // Error state
  comparison,               // Comparison data
  cachedRoutes,            // Cached routes

  // Actions
  calculateRoute,           // Calculate a single route
  compareRoutes,            // Compare multiple preferences
  clearCache,              // Clear cached data

  // Utilities
  calculateIskPerJump,      // Calculate ISK/jump for a trade
  calculateNetProfit,       // Calculate profit after fuel
  getSuggestedAlternatives  // Get safer alternatives
} = useRouteOptimizer();
```

#### 3. Additional Hooks

**`useRouteHistory`** - Manage route calculation history
```javascript
const { history, addToHistory, clearHistory, removeFromHistory } = useRouteHistory(10);
```

**`useRouteTradeEfficiency`** - Calculate trade efficiency metrics
```javascript
const { calculateEfficiency, compareTrades } = useRouteTradeEfficiency();
```

#### 4. API Client Function: `fetchOptimizedRoute`

Added to `/src/api/trading.js` for consistent API access.

```javascript
import { fetchOptimizedRoute } from './api/trading';

const route = await fetchOptimizedRoute({
  origin: 30000142,
  destination: 30002187,
  preference: 'shortest',
  avoidSystems: [30002659],
  cargoValue: 5000000000
});
```

## Risk Calculation Algorithm

### Base Risk by Security Status

```javascript
Security Status  | Base Risk
-----------------|----------
1.0 - 0.9       | 0.1%
0.9 - 0.7       | 0.5%
0.7 - 0.5       | 2.0%
0.5 - 0.3       | 15.0%
0.3 - 0.1       | 35.0%
< 0.1           | 75.0%
```

### Multipliers

**Gank Hotspots:**
- Uedama: 5.0x
- Rancer: 5.0x
- Amamake: 4.0x
- Tama: 3.5x
- Niarja: 3.0x
- Sivala: 2.5x
- Jita: 1.5x

**Cargo Value:**
- > 10B ISK: 3.0x
- > 5B ISK: 2.0x
- > 1B ISK: 1.5x

**Recent Kill Activity:**
- > 100 PvP kills: 2.0x
- > 50 PvP kills: 1.5x
- > 20 PvP kills: 1.2x

### Risk Ratings

```javascript
Average Risk  | Rating
--------------|--------
< 1%          | minimal
< 5%          | low
< 15%         | medium
< 40%         | high
≥ 40%         | extreme
```

## Usage Examples

### Basic Route Calculation

```javascript
import { useRouteOptimizer } from './hooks/useRouteOptimizer';

function RouteCalculator() {
  const { calculateRoute, route, loading } = useRouteOptimizer();

  const handleCalculate = async () => {
    await calculateRoute({
      origin: 30000142,      // Jita
      destination: 30002187, // Amarr
      preference: 'shortest'
    });
  };

  return (
    <div>
      <button onClick={handleCalculate} disabled={loading}>
        Calculate Route
      </button>
      {route && (
        <div>
          <h3>Route: {route.origin.name} → {route.destination.name}</h3>
          <p>Jumps: {route.statistics.total_jumps}</p>
          <p>Time: {route.statistics.estimated_time}</p>
          <p>Risk: {route.statistics.risk_rating}</p>
        </div>
      )}
    </div>
  );
}
```

### Route Comparison

```javascript
function RouteComparison() {
  const { compareRoutes, comparison, loading } = useRouteOptimizer();

  const handleCompare = async () => {
    await compareRoutes(
      30000142,    // Jita
      30002187,    // Amarr
      5000000000   // 5B ISK cargo
    );
  };

  return (
    <div>
      <button onClick={handleCompare} disabled={loading}>
        Compare Routes
      </button>
      {comparison && (
        <div>
          <h3>Recommended: {comparison.recommendation.preference}</h3>
          <p>{comparison.recommendation.reason}</p>
          {Object.entries(comparison.routes).map(([pref, route]) => (
            <div key={pref}>
              <h4>{pref}</h4>
              {route.error ? (
                <p>Error: {route.error}</p>
              ) : (
                <div>
                  <p>Jumps: {route.statistics.total_jumps}</p>
                  <p>Risk: {route.statistics.risk_rating}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Trade Efficiency Calculation

```javascript
import { useRouteOptimizer, useRouteTradeEfficiency } from './hooks/useRouteOptimizer';

function TradeEfficiency() {
  const { route } = useRouteOptimizer();
  const { calculateEfficiency } = useRouteTradeEfficiency();

  const trade = {
    Item: 'Compressed Veldspar',
    profit: 50000000,  // 50M ISK
    volume: 15000      // 15k m³
  };

  const efficiency = calculateEfficiency(route, trade);

  return (
    <div>
      <h3>Trade Efficiency</h3>
      <p>ISK/Jump: {efficiency.iskPerJump.toLocaleString()}</p>
      <p>ISK/Minute: {efficiency.iskPerMinute.toLocaleString()}</p>
      <p>ISK/m³: {efficiency.iskPerM3.toLocaleString()}</p>
    </div>
  );
}
```

### Avoiding Dangerous Systems

```javascript
function SafeRoute() {
  const { calculateRoute, route } = useRouteOptimizer();

  const handleSafeRoute = async () => {
    await calculateRoute({
      origin: 30000142,
      destination: 30002187,
      preference: 'secure',  // High-sec only
      avoidSystems: [
        30002659,  // Uedama (major gank hotspot)
        30002305,  // Niarja (chokepoint)
      ]
    });
  };

  return (
    <button onClick={handleSafeRoute}>
      Calculate Safe Route
    </button>
  );
}
```

## Integration with Existing Components

### With Station Hauling

```javascript
import { fetchStationHauling } from './api/trading';
import { useRouteOptimizer } from './hooks/useRouteOptimizer';

function HaulingWithRoute() {
  const { calculateRoute, calculateIskPerJump } = useRouteOptimizer();
  const [trades, setTrades] = useState([]);

  const handleSearch = async () => {
    // Get hauling opportunities
    const haulingResults = await fetchStationHauling({
      from: 'sell-10000002:60003760',
      to: 'buy-10000043:60008494',
      minProfit: 1000000,
      maxWeight: 30000,
      minROI: 5,
      maxBudget: 1000000000,
      tax: 0.08
    });

    // Calculate route for the best trade
    if (haulingResults.length > 0) {
      const route = await calculateRoute({
        origin: 30000142,
        destination: 30002187,
        preference: 'shortest',
        cargoValue: haulingResults[0]['Net Profit']
      });

      // Calculate ISK per jump
      const iskPerJump = calculateIskPerJump(route, haulingResults[0]['Net Profit']);
      console.log(`ISK per jump: ${iskPerJump.toLocaleString()}`);
    }

    setTrades(haulingResults);
  };

  return (
    <button onClick={handleSearch}>
      Find Hauling Routes
    </button>
  );
}
```

### With Cargo Optimizer

```javascript
import { CargoOptimizer } from './components/routing';
import { useRouteOptimizer } from './hooks/useRouteOptimizer';

function OptimizedHauling() {
  const { route, calculateRoute } = useRouteOptimizer();
  const [trades, setTrades] = useState([]);

  return (
    <div>
      {/* Calculate route first */}
      <RouteSelector onRouteCalculated={calculateRoute} />

      {/* Show route info */}
      {route && (
        <div>
          <p>Route: {route.statistics.total_jumps} jumps</p>
          <p>Risk: {route.statistics.risk_rating}</p>
        </div>
      )}

      {/* Optimize cargo for the route */}
      <CargoOptimizer trades={trades} />
    </div>
  );
}
```

## Performance Considerations

### Caching Strategy

1. **Route Cache**: Routes are cached with a composite key including origin, destination, preference, and cargo value
2. **System Info Cache**: In-memory cache for system information (rarely changes)
3. **Kill Data Cache**: 1-hour cache for kill statistics (updated hourly by ESI)
4. **Client Cache**: IndexedDB/localStorage cache via `useCache` hook

### API Rate Limiting

- ESI has rate limits: 150 requests per second per IP
- Route optimizer batches system info requests
- Kill data is fetched once and cached
- Cache headers set to 5-10 minutes

## Testing

### Test Script

Run the test script to verify structure:

```bash
node api/route-optimizer.test.js
```

### Manual Testing

1. Start development server:
```bash
npm run dev
```

2. Test in browser console:
```javascript
fetch('/api/route-optimizer?origin=30000142&destination=30002187&preference=shortest')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Sample System IDs

- **Jita** (The Forge): 30000142
- **Amarr** (Domain): 30002187
- **Dodixie** (Sinq Laison): 30002659
- **Rens** (Heimatar): 30002510
- **Hek** (Metropolis): 30002053
- **Perimeter** (The Forge): 30000144

## Known Limitations

1. **No Jump Bridge Support**: Does not account for alliance jump bridges
2. **Simplified Jump Fatigue**: Uses approximation, not exact EVE formula
3. **Static Hotspot List**: Gank hotspots are hardcoded, not dynamic
4. **No Wormhole Routes**: Cannot calculate routes through wormholes
5. **Structure Gates**: Player-built gates not included in routing

## Future Enhancements

### Planned Features

1. **Jump Bridge Integration**
   - Support for alliance jump bridge networks
   - Custom jump bridge configuration

2. **Dynamic Hotspot Detection**
   - Machine learning based on kill patterns
   - Recent activity weighting

3. **Wormhole Support**
   - Known wormhole connections
   - Thera integration

4. **Advanced Risk Modeling**
   - Time-of-day risk factors
   - War declaration checks
   - Character security status

5. **Route Sharing**
   - Share routes with corp/alliance
   - Public route library

6. **Multi-Stop Optimization**
   - Traveling salesman problem solver
   - Pickup/delivery scheduling

7. **Live Tracking**
   - Real-time location tracking
   - Auto-update as you travel

## API Reference

### ESI Endpoints Used

#### Route Calculation
```
GET /route/{origin}/{destination}/
Parameters:
  - flag: 'shortest', 'secure', 'insecure'
  - avoid[]: system IDs to avoid
```

#### System Information
```
GET /universe/systems/{system_id}/
Returns:
  - name, security_status, etc.
```

#### Kill Statistics
```
GET /universe/system_kills/
Returns:
  - system_id, ship_kills, pod_kills, npc_kills
```

## Error Handling

The route optimizer handles various error cases:

- Invalid system IDs
- No route found (disconnected systems)
- ESI API timeouts (15 second timeout)
- Rate limiting (automatic retry with backoff)
- Server errors (retry up to 2 times)

All errors are logged and returned in user-friendly format:

```javascript
{
  error: "Failed to calculate route",
  message: "No route found between these systems",
  requestId: "abc123"
}
```

## Security Considerations

- No authentication required (public ESI data)
- Input validation on all parameters
- System ID range validation (30000000-32000000)
- Cargo value capped at 1e15
- CORS headers enabled
- No sensitive data stored

## Contributing

When modifying the route optimizer:

1. Update risk calculation algorithm if adding new factors
2. Update test cases in `route-optimizer.test.js`
3. Maintain backward compatibility with existing API
4. Update this documentation
5. Test with various system combinations
6. Verify ESI endpoints are still correct

## Support

For issues or questions:
- Check ESI Swagger docs: https://esi.evetech.net/ui
- EVE Online forums: https://forums.eveonline.com/
- GitHub issues: Your repository issues page

## License

Part of the EVETrade project. See main project LICENSE file.
