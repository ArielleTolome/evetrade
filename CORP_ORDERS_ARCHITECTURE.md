# Corporation Orders Feature - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Component (e.g., CorpOrdersDashboard)                      │  │
│  │                                                              │  │
│  │  - Displays orders                                          │  │
│  │  - Shows alerts and health status                           │  │
│  │  - Handles user interactions                                │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│                         │ uses                                     │
│                         ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  useCorpOrders Hook                                         │  │
│  │  /src/hooks/useCorpOrders.js                                │  │
│  │                                                              │  │
│  │  State Management:                                          │  │
│  │  - data, loading, error, lastUpdated                        │  │
│  │                                                              │  │
│  │  Actions:                                                   │  │
│  │  - fetchOrders()                                            │  │
│  │  - refresh()                                                │  │
│  │  - reset()                                                  │  │
│  │                                                              │  │
│  │  Analysis Methods:                                          │  │
│  │  - getOrdersNeedingAttention()                              │  │
│  │  - getUndercutOrders()                                      │  │
│  │  - getExpiringOrders()                                      │  │
│  │  - getTotalExposure()                                       │  │
│  │  - getHealthStats()                                         │  │
│  │  - filterByHealth()                                         │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│                         │ uses                                     │
│                         ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  useEveAuth Hook                                            │  │
│  │  /src/hooks/useEveAuth.jsx                                  │  │
│  │                                                              │  │
│  │  - getAccessToken()                                         │  │
│  │  - isAuthenticated                                          │  │
│  │  - Manages EVE SSO authentication                           │  │
│  │  - Includes corp orders scope                               │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
└─────────────────────────┼──────────────────────────────────────────┘
                          │
                          │ HTTP Request
                          │ GET /api/corp-orders?corporationId=...
                          │ Authorization: Bearer {token}
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                   Vercel Serverless Function                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  /api/corp-orders.js                                        │  │
│  │                                                              │  │
│  │  Request Processing:                                        │  │
│  │  1. Validate authentication                                 │  │
│  │  2. Parse query parameters                                  │  │
│  │  3. Fetch data from ESI                                     │  │
│  │  4. Analyze and aggregate                                   │  │
│  │  5. Return formatted response                               │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│                         │ calls multiple ESI endpoints             │
│                         │                                          │
│  ┌──────────────────────┴──────────────────────────────────────┐  │
│  │  ESI API Calls:                                             │  │
│  │                                                              │  │
│  │  fetchCorporationOrders()                                   │  │
│  │  ├─ GET /corporations/{id}/orders/                          │  │
│  │  │  Returns active corp orders                              │  │
│  │                                                              │  │
│  │  fetchCorporationOrderHistory() [optional]                  │  │
│  │  ├─ GET /corporations/{id}/orders/history/                  │  │
│  │  │  Returns historical orders (up to 5 pages)               │  │
│  │                                                              │  │
│  │  fetchMarketOrdersForItem() [for each item]                 │  │
│  │  ├─ GET /markets/{region}/orders/?type_id={id}              │  │
│  │  │  Returns current market orders for comparison            │  │
│  │                                                              │  │
│  │  getItemNames()                                             │  │
│  │  ├─ POST /universe/names/                                   │  │
│  │  │  Returns item names (batch up to 1000)                   │  │
│  │                                                              │  │
│  │  getLocationNames()                                         │  │
│  │  ├─ POST /universe/names/                                   │  │
│  │  ├─ GET /universe/structures/{id}/                          │  │
│  │  │  Returns station/structure names                         │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│                         │ processes data                           │
│                         ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Data Processing Pipeline:                                  │  │
│  │                                                              │  │
│  │  1. analyzeUndercut()                                       │  │
│  │     - Compare corp order vs market orders                   │  │
│  │     - Determine if undercut                                 │  │
│  │     - Calculate rank in order book                          │  │
│  │                                                              │  │
│  │  2. calculateOrderHealth()                                  │  │
│  │     - Time remaining score                                  │  │
│  │     - Fill rate score                                       │  │
│  │     - Competition score                                     │  │
│  │     - Combined health (0-100)                               │  │
│  │                                                              │  │
│  │  3. aggregateOrders()                                       │  │
│  │     - Group by item/location/both                           │  │
│  │     - Sum volumes and values                                │  │
│  │     - Calculate averages                                    │  │
│  │     - Identify orders needing attention                     │  │
│  │                                                              │  │
│  │  4. formatResponse()                                        │  │
│  │     - Add item/location names                               │  │
│  │     - Sort by exposure                                      │  │
│  │     - Include summary stats                                 │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                          │
│                         │ returns JSON                             │
│                         ▼                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  Response Format:                                           │  │
│  │  {                                                           │  │
│  │    summary: {                                               │  │
│  │      totalOrders, totalExposure, etc.                       │  │
│  │    },                                                        │  │
│  │    orders: [                                                │  │
│  │      {                                                       │  │
│  │        "Item", "Location",                                  │  │
│  │        "Buy Orders", "Sell Orders",                         │  │
│  │        "Total Exposure (ISK)",                              │  │
│  │        "Orders Needing Attention",                          │  │
│  │        "Order Details": [                                   │  │
│  │          {                                                   │  │
│  │            orderId, price, volume,                          │  │
│  │            undercutStatus, health                           │  │
│  │          }                                                   │  │
│  │        ]                                                     │  │
│  │      }                                                       │  │
│  │    ]                                                         │  │
│  │  }                                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          │ Response sent back
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EVE Online ESI API                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  https://esi.evetech.net/latest/                                   │
│                                                                     │
│  Endpoints Used:                                                   │
│  - /corporations/{id}/orders/                                      │
│  - /corporations/{id}/orders/history/                              │
│  - /markets/{region}/orders/?type_id={id}                          │
│  - /universe/names/                                                │
│  - /universe/structures/{id}/                                      │
│                                                                     │
│  Authentication: Bearer token from EVE SSO                         │
│  Required Scope: esi-markets.read_corporation_orders.v1            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Load

```
User clicks "Load Orders"
    ↓
Component calls fetchOrders()
    ↓
useCorpOrders hook
    ├─ Gets access token from useEveAuth
    ├─ Builds API request URL
    └─ Sends GET /api/corp-orders
        ↓
Serverless Function
    ├─ Validates auth token
    ├─ Fetches corp orders from ESI
    ├─ Fetches market data for comparison
    ├─ Analyzes undercut status
    ├─ Calculates health scores
    ├─ Aggregates by groupBy option
    ├─ Fetches item/location names
    └─ Returns formatted response
        ↓
useCorpOrders hook
    ├─ Updates state with data
    └─ Sets lastUpdated timestamp
        ↓
Component re-renders with new data
```

### 2. Auto-Refresh Flow

```
Hook initialized with autoRefresh: true
    ↓
useEffect sets up interval
    ↓
Every refreshInterval seconds:
    ├─ Calls fetchOrders()
    ├─ Shows loading indicator
    ├─ Fetches fresh data
    └─ Updates UI with new data
        ↓
Cleanup on unmount:
    └─ Clears interval
```

### 3. Analysis Method Flow

```
Component calls getUndercutOrders()
    ↓
useCorpOrders hook
    ├─ Accesses current data state
    ├─ Filters orders with undercut status
    ├─ Formats results for display
    └─ Returns array of undercut orders
        ↓
Component renders undercut alerts
```

## Key Components

### Frontend (React)

1. **Components** - UI layer
   - Display orders and analytics
   - Handle user interactions
   - Show alerts and notifications

2. **useCorpOrders Hook** - Business logic layer
   - State management
   - API communication
   - Data analysis
   - Caching and refresh logic

3. **useEveAuth Hook** - Authentication layer
   - EVE SSO integration
   - Token management
   - Scope validation

### Backend (Vercel)

1. **API Handler** - Request processing
   - Input validation
   - Authentication check
   - Error handling
   - Response formatting

2. **ESI Integration** - External API layer
   - ESI API calls
   - Rate limiting
   - Timeout handling
   - Parallel requests

3. **Data Processing** - Business logic
   - Undercut detection
   - Health calculation
   - Aggregation
   - Name resolution

## Security Model

```
User Authentication (EVE SSO)
    ↓
Access Token with Scopes
    ├─ esi-markets.read_corporation_orders.v1 (required)
    └─ Other scopes for additional features
        ↓
Token sent to Serverless Function
    ↓
Function validates token with ESI
    ├─ Check token expiry
    ├─ Verify scopes
    └─ Confirm corp access
        ↓
ESI returns data only if authorized
    ↓
Function processes and returns data
    ↓
Frontend displays data
```

## Caching Strategy

```
┌─────────────────────────────────────────────────────┐
│  Browser Cache                                      │
│  - Cache-Control: public, max-age=30, s-maxage=60  │
│  - Stores API responses for 30-60 seconds           │
└─────────────────────────────────────────────────────┘
                    ↑
                    │ Response headers
                    │
┌─────────────────────────────────────────────────────┐
│  Serverless Function                                │
│  - No persistent cache (stateless)                  │
│  - Fresh data on each request                       │
└─────────────────────────────────────────────────────┘
                    ↑
                    │ ESI responses
                    │
┌─────────────────────────────────────────────────────┐
│  ESI API Cache                                      │
│  - ESI updates market data every 5 minutes          │
│  - Order data can be slightly stale                 │
└─────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Error occurs at any level
    ↓
Error caught and logged
    ↓
Determine error type:
    ├─ 401 Unauthorized → "Please log in"
    ├─ 403 Forbidden → "Missing scope, re-authenticate"
    ├─ 404 Not Found → "Corp not found or no access"
    ├─ Timeout → "ESI request timeout, try again"
    └─ Other → Generic error message
        ↓
Error state updated in hook
    ↓
Component displays error to user
    ↓
User can:
    ├─ Retry
    ├─ Clear error
    └─ Re-authenticate
```

## Performance Optimization

### 1. Parallel Requests
```
ESI Requests are parallelized:
- Fetch corp orders
- Fetch corp history (if enabled)
- Fetch market data for items (parallel batch)
- Fetch names (batched up to 1000)

All run concurrently → Faster response
```

### 2. Request Limiting
```
Market data limited to 50 items
    └─ Prevents API overload
    └─ Focuses on most important items

History limited to 5 pages
    └─ Reduces response time
    └─ Covers recent orders
```

### 3. Batch Processing
```
Item names fetched in batches:
- Group up to 1000 IDs
- Single POST request
- Reduces API calls

Location names batched similarly
```

## State Management

```
useCorpOrders Hook State:

┌─────────────────────────────────┐
│ data              (full API     │
│                   response)     │
├─────────────────────────────────┤
│ loading           (boolean)     │
├─────────────────────────────────┤
│ error             (object/null) │
├─────────────────────────────────┤
│ lastUpdated       (Date/null)   │
└─────────────────────────────────┘
        │
        ├─ Derived State (computed on-demand):
        │
        ├─ summary
        ├─ orders
        ├─ getOrdersNeedingAttention()
        ├─ getUndercutOrders()
        ├─ getExpiringOrders()
        ├─ getTotalExposure()
        └─ etc.
```

## Testing Architecture

```
┌─────────────────────────────────────────────────┐
│  useCorpOrders.test.js                          │
│                                                 │
│  Mock Dependencies:                             │
│  ├─ useEveAuth → Mock auth methods              │
│  ├─ fetch → Mock API responses                  │
│  └─ ESI responses → Test data                   │
│                                                 │
│  Test Coverage:                                 │
│  ├─ Basic functionality                         │
│  ├─ Error handling                              │
│  ├─ Analysis methods                            │
│  ├─ Options (groupBy, etc.)                     │
│  ├─ Utility methods                             │
│  └─ Edge cases                                  │
└─────────────────────────────────────────────────┘
```

## Deployment

```
Code pushed to repository
    ↓
Vercel Auto-Deploy
    ├─ Deploys serverless function to /api/corp-orders
    ├─ Builds React frontend with hook
    └─ CDN deployment
        ↓
Users access feature
    ├─ Frontend from CDN
    └─ API from Vercel edge network
```
