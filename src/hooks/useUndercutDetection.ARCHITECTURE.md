# useUndercutDetection Hook - Architecture & Workflow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    useUndercutDetection Hook                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  State Management:                                            │
│  ├─ undercutOrders: Array<Order>                            │
│  ├─ loading: boolean                                         │
│  └─ error: Error | null                                      │
│                                                               │
│  Core Functions:                                              │
│  ├─ checkOrders()           Main detection logic             │
│  ├─ getUndercutAmount()     Get ISK difference              │
│  ├─ getRecommendedPrice()   Calculate competitive price     │
│  └─ calculateOptimalPrice() Strategy-based pricing          │
│                                                               │
│  Computed Values:                                             │
│  └─ undercutStats           Statistics summary               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────┐
│  ESI API         │
│                  │
│  Character       │
│  Orders          │
└────────┬─────────┘
         │
         │ getCharacterOrders()
         │
         ▼
┌──────────────────────────────────────────────┐
│  Component/Page                               │
│  - Fetches character orders                   │
│  - Fetches market orders for each item        │
│  - Calls hook.checkOrders(myOrders, market)  │
└───────────────────┬──────────────────────────┘
                    │
                    │
         ┌──────────▼─────────────┐
         │  ESI API               │
         │                        │
         │  Market Orders         │
         │  (for comparison)      │
         └──────────┬─────────────┘
                    │
                    │ getMarketOrders()
                    │
                    ▼
┌──────────────────────────────────────────────┐
│  checkOrders() Logic                         │
│                                               │
│  For each character order:                   │
│  1. Filter relevant market orders            │
│     (same type_id & location_id)             │
│  2. Determine if buy or sell order           │
│  3. Check for better competitor prices       │
│  4. Calculate undercut details               │
│  5. Generate recommendations                 │
│                                               │
└───────────────────┬──────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│  Results                                      │
│                                               │
│  undercutOrders: [                           │
│    {                                          │
│      ...originalOrder,                       │
│      isUndercut: true,                       │
│      undercutBy: 1.50,                       │
│      undercutPercent: 1.5,                   │
│      competitorCount: 3,                     │
│      bestCompetitorPrice: 98.50,             │
│      recommendedPrice: 98.49,                │
│      profitLoss: 1500                        │
│    }                                          │
│  ]                                            │
│                                               │
└───────────────────┬──────────────────────────┘
                    │
                    │
                    ▼
           ┌────────────────┐
           │  Component UI  │
           │  - Display     │
           │  - Alerts      │
           │  - Actions     │
           └────────────────┘
```

## Order Comparison Logic

### Sell Order Detection

```
Character Sell Order: 100.00 ISK
                      ▲
                      │ YOUR ORDER
                      │
──────────────────────┼───────────────────────
  Market Sell Orders: │
                      │
    98.50 ISK  ◄──────┤ UNDERCUT #1 (Best)
    99.00 ISK  ◄──────┤ UNDERCUT #2
   100.50 ISK         │ (Worse than yours)
   101.00 ISK         │ (Worse than yours)
                      │
──────────────────────┼───────────────────────
                      │
  Detection Result:   │
  ✓ Undercut by 1.50 ISK (1.5%)
  ✓ 2 competitors ahead
  → Recommended: 98.49 ISK
```

### Buy Order Detection

```
Character Buy Order: 50.00 ISK
                     ▲
                     │ YOUR ORDER
                     │
─────────────────────┼──────────────────────
  Market Buy Orders: │
                     │
    52.00 ISK  ◄─────┤ OUTBID #1 (Best)
    51.00 ISK  ◄─────┤ OUTBID #2
    49.00 ISK        │ (Worse than yours)
    48.00 ISK        │ (Worse than yours)
                     │
─────────────────────┼──────────────────────
                     │
  Detection Result:  │
  ✓ Outbid by 2.00 ISK (4.0%)
  ✓ 2 competitors ahead
  → Recommended: 52.01 ISK
```

## Pricing Strategy Comparison

```
Current Market State:
Best Sell: 100.00 ISK
2nd:       100.50 ISK
3rd:       101.00 ISK
4th:       101.50 ISK
5th:       102.00 ISK

Your Order: 103.00 ISK (UNDERCUT)

┌─────────────────────────────────────────────────────┐
│ AGGRESSIVE Strategy                                  │
│ Goal: Beat best price immediately                   │
│                                                      │
│ Recommendation: 99.99 ISK                           │
│ Reason: 0.01 ISK better than best competitor       │
│ Impact: -3.01 ISK per unit                          │
│ Position: #1 (guaranteed)                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ MODERATE Strategy                                    │
│ Goal: Match best price (rely on timestamp)         │
│                                                      │
│ Recommendation: 100.00 ISK                          │
│ Reason: Match best price                            │
│ Impact: -3.00 ISK per unit                          │
│ Position: #1 or #2 (depends on timestamp)          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CONSERVATIVE Strategy                                │
│ Goal: Stay competitive within top 5                 │
│                                                      │
│ Recommendation: 102.00 ISK                          │
│ Reason: Match 5th best price                        │
│ Impact: -1.00 ISK per unit                          │
│ Position: #5 to #6 (acceptable range)              │
└─────────────────────────────────────────────────────┘
```

## Hook State Lifecycle

```
┌─────────────┐
│  Initial    │
│  State      │
│             │
│ undercut: []│
│ loading: F  │
│ error: null │
└──────┬──────┘
       │
       │ checkOrders() called
       │
       ▼
┌─────────────┐
│  Loading    │
│  State      │
│             │
│ undercut: []│
│ loading: T  │◄────── Fetching and comparing
│ error: null │        market data
└──────┬──────┘
       │
       │ Detection complete
       │
       ▼
┌─────────────┐
│  Success    │
│  State      │
│             │
│ undercut: […│◄────── Results available
│ loading: F  │
│ error: null │
└──────┬──────┘
       │
       │ User action or error
       │
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Refresh  │  │ Clear    │  │ Error    │
│ (Re-run) │  │ Results  │  │ State    │
└──────────┘  └──────────┘  └──────────┘
```

## Integration Patterns

### Pattern 1: Single Character Monitor

```javascript
Character → Hook → Display
     │         │
     │         └─→ Auto-refresh every N minutes
     │
     └─→ ESI API (Character Orders + Market Data)
```

### Pattern 2: Multi-Character Dashboard

```javascript
Characters Array
  │
  ├─→ Character 1 → Hook Instance 1
  ├─→ Character 2 → Hook Instance 2
  └─→ Character 3 → Hook Instance 3
                     │
                     └─→ Aggregate Stats
                         └─→ Dashboard Display
```

### Pattern 3: Alert System Integration

```javascript
Hook → checkOrders()
  │
  ├─→ Detect new undercuts
  │
  ├─→ Compare with previous state
  │
  └─→ Trigger alerts
      │
      ├─→ Browser Notification
      ├─→ Email/SMS (via backend)
      └─→ In-app notification
```

### Pattern 4: Automated Order Management

```javascript
Hook → checkOrders()
  │
  ├─→ Detect undercuts
  │
  ├─→ calculateOptimalPrice(strategy)
  │
  └─→ Generate update recommendations
      │
      ├─→ User Review & Approve
      │
      └─→ Auto-update orders via ESI
          (requires OAuth scopes)
```

## Performance Optimization Flow

```
┌──────────────────────────────────────────┐
│ Component Mounts                          │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Fetch Character Orders                    │
│ - Single API call                         │
│ - Returns all active orders               │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Group Orders by Region + Type             │
│ - Reduce duplicate API calls              │
│ - Example: 50 orders → 10 unique items   │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Parallel Market Data Fetch                │
│ - Promise.all() for speed                │
│ - Fetch all 10 items simultaneously       │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Combine All Market Data                   │
│ - Merge into single array                │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Single checkOrders() Call                 │
│ - Process all orders at once              │
│ - O(n*m) where n=orders, m=market_orders │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Cache Results                             │
│ - Store in hook state                     │
│ - Re-use for getRecommendedPrice()       │
└──────────────────────────────────────────┘
```

## Error Handling Flow

```
checkOrders()
  │
  ├─→ No character orders
  │   └─→ Return [], no error
  │
  ├─→ No market orders
  │   └─→ Set error: "No market orders"
  │
  ├─→ API fetch fails
  │   └─→ Throw error, caught by component
  │
  ├─→ Invalid order structure
  │   └─→ Skip order, continue processing
  │
  └─→ Success
      └─→ Return undercut orders
```

## Memory & State Management

```
Hook State (per instance):
├─ undercutOrders: Array
│  └─ Cleared on clearUndercutOrders()
│
├─ loading: boolean
│  └─ Updated during checkOrders()
│
└─ error: Object | null
   └─ Cleared on successful check

Computed Values (useMemo):
└─ undercutStats
   └─ Recalculated when undercutOrders changes
   └─ Memoized to prevent unnecessary recalculation

Functions (useCallback):
└─ All functions wrapped in useCallback
   └─ Stable references across re-renders
   └─ Dependencies properly declared
```

## Extension Points

The hook is designed to be extensible:

```javascript
// Custom strategy
function calculateOptimalPrice(order, market, 'custom') {
  // Add your own pricing logic
}

// Custom statistics
const customStats = useMemo(() => {
  return {
    ...undercutStats,
    mostProfitableToUpdate: findMostProfitable(undercutOrders),
    urgentOrders: filterUrgent(undercutOrders),
  };
}, [undercutOrders]);

// Persistence
useEffect(() => {
  localStorage.setItem('undercuts', JSON.stringify(undercutOrders));
}, [undercutOrders]);

// Analytics
useEffect(() => {
  if (undercutOrders.length > 0) {
    trackEvent('orders_undercut', {
      count: undercutOrders.length,
      totalLoss: undercutStats.totalPotentialLoss,
    });
  }
}, [undercutOrders]);
```

## Type Definitions (TypeScript Ready)

```typescript
interface Order {
  order_id: number;
  type_id: number;
  location_id: number;
  region_id: number;
  price: number;
  volume_remain: number;
  is_buy_order: boolean;
}

interface UndercutOrder extends Order {
  isUndercut: boolean;
  isBuyOrder: boolean;
  undercutBy: number;
  undercutPercent: number;
  competitorCount: number;
  bestCompetitorPrice: number;
  recommendedPrice: number;
  volumeRemaining: number;
  profitLoss: number;
  detectedAt: string;
}

interface UndercutStats {
  total: number;
  buyOrders: number;
  sellOrders: number;
  totalPotentialLoss: number;
  averageUndercutPercent: number;
  mostUndercutOrder: UndercutOrder | null;
}

interface PricingRecommendation {
  price: number;
  strategy: 'aggressive' | 'moderate' | 'conservative';
  reason: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volumeImpact: number;
  competitorCount: number;
  bestCompetitorPrice: number;
  isImprovement: boolean;
}

type Strategy = 'aggressive' | 'moderate' | 'conservative';
```

## Future Enhancements

Potential features for future versions:

1. **Historical Tracking**: Track undercut frequency over time
2. **Smart Timing**: Suggest best times to update orders
3. **Cost Analysis**: Factor in broker fees and taxes
4. **Competitor Profiling**: Identify and track specific competitors
5. **Auto-Update**: Integrate with ESI OAuth to auto-update orders
6. **Machine Learning**: Predict optimal pricing based on historical data
7. **Multi-Region**: Compare opportunities across regions
8. **Mobile Alerts**: Push notifications via service worker

---

For implementation details, see:
- **Hook Code**: `useUndercutDetection.js`
- **Tests**: `useUndercutDetection.test.js`
- **Examples**: `useUndercutDetection.example.js`
- **Documentation**: `useUndercutDetection.README.md`
