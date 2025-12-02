# Route Optimizer Integration Guide

Quick guide for integrating the Smart Route Optimizer into existing EVETrade pages.

## Option 1: Add to RouteOptimizationPage

The easiest integration is to add the route optimizer as a new tab in the existing Route Optimization page.

### Step 1: Import the Hook and Component

```javascript
// In src/pages/RouteOptimizationPage.jsx
import { useRouteOptimizer } from '../hooks/useRouteOptimizer';
import RouteOptimizerExample from '../components/routing/RouteOptimizer.example';
```

### Step 2: Add Tab

```javascript
const tabs = [
  { id: 'planner', label: 'Route Planner', icon: '🗺️' },
  { id: 'cargo', label: 'Cargo Optimizer', icon: '📦' },
  { id: 'fuel', label: 'Fuel Calculator', icon: '⛽' },
  { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
  { id: 'optimizer', label: 'Route Optimizer', icon: '🎯' }, // NEW
];
```

### Step 3: Add Tab Content

```javascript
{activeTab === 'optimizer' && (
  <RouteOptimizerExample />
)}
```

### Complete Example

```javascript
// src/pages/RouteOptimizationPage.jsx
import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import {
  MultiStopPlanner,
  CargoOptimizer,
  FuelCostCalculator,
  RouteRiskAssessment
} from '../components/routing';
import RouteOptimizerExample from '../components/routing/RouteOptimizer.example';

export function RouteOptimizationPage() {
  const [activeTab, setActiveTab] = useState('planner');

  const tabs = [
    { id: 'planner', label: 'Route Planner', icon: '🗺️' },
    { id: 'cargo', label: 'Cargo Optimizer', icon: '📦' },
    { id: 'fuel', label: 'Fuel Calculator', icon: '⛽' },
    { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
    { id: 'optimizer', label: 'Smart Optimizer', icon: '🎯' }, // NEW
  ];

  return (
    <PageLayout
      title="Route Optimization"
      subtitle="Advanced tools for planning and optimizing your trade routes"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg border transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/20'
                    : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/40 hover:bg-space-dark/70'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Descriptions */}
          <div className="p-4 bg-space-dark/30 border border-accent-cyan/10 rounded-lg">
            {activeTab === 'optimizer' && (
              <p className="text-sm text-text-secondary">
                Calculate optimal routes between systems using ESI's route planning API.
                Get detailed risk analysis, security status, recent kill data, and intelligent
                recommendations for safe trading.
              </p>
            )}
            {/* ... other tab descriptions */}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'planner' && <MultiStopPlanner className="mb-8" />}
          {activeTab === 'cargo' && <CargoOptimizer trades={[]} className="mb-8" />}
          {activeTab === 'fuel' && <FuelCostCalculator className="mb-8" />}
          {activeTab === 'risk' && <RouteRiskAssessment className="mb-8" />}
          {activeTab === 'optimizer' && <RouteOptimizerExample />}
        </div>
      </div>
    </PageLayout>
  );
}
```

## Option 2: Add to Station Hauling Page

Enhance hauling results with route information.

### Step 1: Add Hook to HaulingPage

```javascript
// In src/pages/StationHaulingPage.jsx
import { useRouteOptimizer } from '../hooks/useRouteOptimizer';

export function StationHaulingPage() {
  const { calculateRoute, route, loading: routeLoading } = useRouteOptimizer();
  // ... existing code
}
```

### Step 2: Add Route Calculation for Selected Trade

```javascript
const handleCalculateRoute = async (trade) => {
  // Parse system IDs from trade data
  const originSystemId = parseSystemIdFromLocation(trade.From);
  const destSystemId = parseSystemIdFromLocation(trade['Take To']);

  if (originSystemId && destSystemId) {
    await calculateRoute({
      origin: originSystemId,
      destination: destSystemId,
      preference: 'shortest',
      cargoValue: trade['Net Profit']
    });
  }
};
```

### Step 3: Display Route Info in Results

```javascript
{trades.length > 0 && (
  <div className="mb-4">
    <button
      onClick={() => handleCalculateRoute(trades[0])}
      disabled={routeLoading}
      className="px-4 py-2 bg-accent-cyan/20 border border-accent-cyan rounded-lg"
    >
      {routeLoading ? 'Calculating Route...' : 'Calculate Route'}
    </button>

    {route && (
      <div className="mt-4 p-4 bg-space-dark/30 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Route Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Jumps: </span>
            <span className="text-text-primary font-medium">
              {route.statistics.total_jumps}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Time: </span>
            <span className="text-text-primary font-medium">
              {route.statistics.estimated_time}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Risk: </span>
            <span className={`font-medium ${getRiskColor(route.statistics.risk_rating)}`}>
              {route.statistics.risk_rating}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">ISK/Jump: </span>
            <span className="text-green-400 font-medium">
              {Math.round(trades[0]['Net Profit'] / route.statistics.total_jumps).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
)}
```

## Option 3: Create New Dedicated Page

Create a standalone route optimizer page.

### Step 1: Create New Page

```javascript
// src/pages/RouteOptimizerPage.jsx
import { PageLayout } from '../components/layout/PageLayout';
import RouteOptimizerExample from '../components/routing/RouteOptimizer.example';

export function RouteOptimizerPage() {
  return (
    <PageLayout
      title="Smart Route Optimizer"
      subtitle="Calculate optimal routes with intelligent risk analysis"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <RouteOptimizerExample />

        {/* Optional: Add help section */}
        <div className="mt-8 p-6 bg-space-dark/30 border border-accent-cyan/10 rounded-lg">
          <h3 className="text-xl font-display text-text-primary mb-4">
            How to Use the Route Optimizer
          </h3>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <h4 className="text-accent-cyan font-medium mb-2">1. Enter System IDs</h4>
              <p>Enter the origin and destination system IDs. You can find system IDs in-game or use popular trade hubs:</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Jita: 30000142</li>
                <li>Amarr: 30002187</li>
                <li>Dodixie: 30002659</li>
                <li>Rens: 30002510</li>
              </ul>
            </div>

            <div>
              <h4 className="text-accent-cyan font-medium mb-2">2. Choose Route Preference</h4>
              <ul className="list-disc list-inside ml-4">
                <li><strong>Shortest:</strong> Fastest route (may include low-sec)</li>
                <li><strong>Secure:</strong> High-sec only (slower but safer)</li>
                <li><strong>Insecure:</strong> Absolute shortest (includes null-sec)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-accent-cyan font-medium mb-2">3. Set Cargo Value (Optional)</h4>
              <p>Enter your cargo value for more accurate risk assessment. Higher values increase calculated risk.</p>
            </div>

            <div>
              <h4 className="text-accent-cyan font-medium mb-2">4. Compare Routes</h4>
              <p>Use "Compare All Routes" to see all three preferences side-by-side with recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default RouteOptimizerPage;
```

### Step 2: Add to Router

```javascript
// src/router.jsx
import { RouteOptimizerPage } from './pages/RouteOptimizerPage';

const router = createBrowserRouter([
  // ... existing routes
  {
    path: '/route-optimizer',
    element: <RouteOptimizerPage />,
  },
]);
```

### Step 3: Add to Navigation

```javascript
// src/components/common/Navbar.jsx
const menuItems = [
  // ... existing items
  {
    label: 'Route Optimizer',
    path: '/route-optimizer',
    icon: '🎯',
  },
];
```

## Option 4: Add as Component to Trading Tables

Enhance trading tables with inline route calculation.

### Step 1: Create Inline Route Button

```javascript
// In TradingTable or similar component
import { useRouteOptimizer } from '../hooks/useRouteOptimizer';

function TradeRowWithRoute({ trade }) {
  const { calculateRoute, route, loading } = useRouteOptimizer();
  const [expanded, setExpanded] = useState(false);

  const handleShowRoute = async () => {
    if (!route) {
      await calculateRoute({
        origin: parseSystemId(trade.From),
        destination: parseSystemId(trade['Take To']),
        preference: 'shortest'
      });
    }
    setExpanded(!expanded);
  };

  return (
    <>
      <tr>
        {/* ... existing columns */}
        <td>
          <button
            onClick={handleShowRoute}
            disabled={loading}
            className="text-xs px-2 py-1 bg-accent-cyan/20 rounded"
          >
            {loading ? '...' : expanded ? 'Hide Route' : 'Show Route'}
          </button>
        </td>
      </tr>

      {expanded && route && (
        <tr>
          <td colSpan="100%" className="bg-space-dark/50 p-4">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Jumps: </span>
                <span className="text-text-primary">{route.statistics.total_jumps}</span>
              </div>
              <div>
                <span className="text-text-secondary">Time: </span>
                <span className="text-text-primary">{route.statistics.estimated_time}</span>
              </div>
              <div>
                <span className="text-text-secondary">Risk: </span>
                <span className={getRiskColor(route.statistics.risk_rating)}>
                  {route.statistics.risk_rating}
                </span>
              </div>
              <div>
                <span className="text-text-secondary">ISK/Jump: </span>
                <span className="text-green-400">
                  {Math.round(trade['Net Profit'] / route.statistics.total_jumps).toLocaleString()}
                </span>
              </div>
            </div>
            {route.recommendations.length > 0 && (
              <div className="mt-2 text-xs text-yellow-400">
                ⚠️ {route.recommendations[0]}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
```

## Helper Functions

These utility functions are useful for any integration:

```javascript
// Parse system ID from location string
function parseSystemIdFromLocation(location) {
  // If location is already a system ID
  if (typeof location === 'number') return location;

  // If location is a string like "Station Name (System)"
  // You'll need to map this to system IDs using your resources
  // For now, return null if not found
  return null;
}

// Get risk color class
function getRiskColor(rating) {
  const colors = {
    minimal: 'text-green-400',
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    extreme: 'text-red-400',
  };
  return colors[rating] || 'text-text-secondary';
}

// Format ISK
function formatISK(value) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toLocaleString();
}
```

## Testing Your Integration

### 1. Basic Functionality Test
```javascript
// In browser console after navigating to your page
fetch('/api/route-optimizer?origin=30000142&destination=30002187&preference=shortest')
  .then(r => r.json())
  .then(console.log);
```

### 2. Hook Test
```javascript
// In your component
useEffect(() => {
  console.log('Route data:', route);
  console.log('Loading:', loading);
  console.log('Error:', error);
}, [route, loading, error]);
```

### 3. Visual Test
1. Navigate to your integrated page
2. Enter system IDs (use Jita: 30000142 and Amarr: 30002187)
3. Click calculate
4. Verify route displays correctly
5. Check risk ratings make sense
6. Test route comparison

## Troubleshooting

### Issue: "No route found"
- Check system IDs are valid (30000000-32000000 range)
- Verify systems are connected (not in disconnected regions)

### Issue: Route calculation is slow
- First calculation fetches from ESI (slow)
- Subsequent calculations use cache (fast)
- Consider showing loading state

### Issue: Risk scores seem wrong
- Verify cargo value is set correctly
- Check ESI kill data is being fetched
- Review risk calculation algorithm in docs

### Issue: System names not showing
- ESI may be slow to respond
- System names are fetched separately
- Falls back to "System #ID" if fetch fails

## Best Practices

1. **Always show loading state** - Route calculation can take 1-2 seconds
2. **Cache aggressively** - Routes don't change, so cache extensively
3. **Handle errors gracefully** - ESI can timeout or rate limit
4. **Show ISK/jump** - Most useful metric for traders
5. **Highlight dangerous routes** - Use color coding for risk levels
6. **Provide alternatives** - Suggest secure routes when risk is high

## Next Steps

After integration:
1. Test with real data
2. Gather user feedback
3. Monitor API performance
4. Add telemetry/analytics
5. Consider adding features:
   - Route favoriting
   - Historical route data
   - Route sharing
   - Real-time tracking

## Support

- Full documentation: `/ROUTE_OPTIMIZER.md`
- API reference: `/api/route-optimizer.js`
- Hook documentation: `/src/hooks/useRouteOptimizer.js`
- Example component: `/src/components/routing/RouteOptimizer.example.jsx`
