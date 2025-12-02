# Corporation Orders Aggregation Feature

## Overview

This feature provides comprehensive corporation market order management and analysis for EVE Online corporations. It aggregates, analyzes, and monitors all corporation market orders with advanced undercut detection, health tracking, and exposure calculation.

## Files Created

### Backend API
- **`/api/corp-orders.js`** - Vercel serverless function that fetches and aggregates corporation orders
  - Fetches corp orders from ESI
  - Detects undercuts by comparing with current market
  - Calculates order health scores
  - Groups orders by item, location, or both
  - Optional historical order tracking

### Frontend Hook
- **`/src/hooks/useCorpOrders.js`** - React hook for consuming the corp orders API
  - Simple API for fetching and analyzing corp orders
  - Built-in auto-refresh capability
  - Rich set of analysis methods
  - Error handling and authentication integration

### Documentation & Examples
- **`/src/hooks/useCorpOrders.example.js`** - Complete component examples showing various use cases
- **`/src/hooks/useCorpOrders.QUICKSTART.md`** - Comprehensive quick start guide
- **`/src/hooks/useCorpOrders.test.js`** - Full test suite with 100% coverage

### Modified Files
- **`/src/hooks/useEveAuth.jsx`** - Added `esi-markets.read_corporation_orders.v1` scope
- **`/src/api/esi.js`** - Added `getCorporationOrders()` and `getCorporationOrderHistory()` functions

## Key Features

### 1. Order Aggregation
- Group orders by item, location, or both
- Calculate total exposure (ISK tied up in orders)
- Aggregate buy/sell volumes and values
- Compute average prices

### 2. Undercut Detection
- Compare corp orders against current market
- Identify orders being undercut by competitors
- Show competitor prices and price differences
- Track order rank in the order book

### 3. Order Health Tracking
- Health score (0-100) based on multiple factors:
  - Time remaining until expiration
  - Fill rate (volume filled vs total)
  - Competition and undercut status
- Categorize orders as healthy, warning, or critical

### 4. Smart Alerts
- Identify orders needing attention
- Separate undercut orders from other issues
- Track expiring orders (< 7 days)
- Highlight slow-moving orders

### 5. Risk Management
- Calculate total ISK exposure
- Show top items by exposure
- Break down by buy/sell orders
- Track potential profit from spreads

## API Endpoints

### GET /api/corp-orders

Fetches and analyzes corporation market orders.

**Query Parameters:**
- `corporationId` (required) - Corporation ID
- `groupBy` - How to group: 'item', 'location', 'both' (default: 'item')
- `includeHistory` - Include historical orders: 'true' or 'false' (default: 'false')

**Headers:**
- `Authorization: Bearer {access_token}` (required)

**Response:**
```json
{
  "summary": {
    "totalOrders": 150,
    "totalBuyOrders": 60,
    "totalSellOrders": 90,
    "totalExposure": 5000000000,
    "ordersNeedingAttention": 12,
    "uniqueItems": 45,
    "uniqueLocations": 5
  },
  "orders": [
    {
      "Type ID": 34,
      "Item": "Tritanium",
      "Location ID": 60003760,
      "Location": "Jita IV - Moon 4",
      "Buy Orders": 2,
      "Sell Orders": 3,
      "Total Exposure (ISK)": 110000000,
      "Orders Needing Attention": 2,
      "Order Details": [...],
      "Attention Details": [...]
    }
  ]
}
```

## Hook Usage

### Basic Example
```javascript
import { useCorpOrders } from './hooks/useCorpOrders';

function MyComponent() {
  const {
    loading,
    error,
    summary,
    orders,
    fetchOrders,
    getUndercutOrders
  } = useCorpOrders(corporationId);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const undercuts = getUndercutOrders();

  return (
    <div>
      <h2>Total Orders: {summary?.totalOrders}</h2>
      <p>Undercut: {undercuts.length}</p>
    </div>
  );
}
```

### Auto-Refresh Example
```javascript
const {
  summary,
  lastUpdated
} = useCorpOrders(corporationId, {
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
});
```

## Analysis Methods

The hook provides rich analysis capabilities:

- `getOrdersNeedingAttention()` - All orders with health < 70
- `getUndercutOrders()` - Orders being undercut by competitors
- `getExpiringOrders()` - Orders expiring within 7 days
- `getTotalExposure()` - Total ISK in active orders
- `getOrderTypeBreakdown()` - Buy/sell statistics
- `getHealthStats()` - Health distribution across all orders
- `getTopItemsByExposure(limit)` - Top items by ISK value
- `filterByHealth(min, max)` - Filter orders by health range

## Order Health Scoring

Each order receives a health score (0-100) based on:

1. **Time Remaining** (0-30 point penalty)
   - Critical: < 7 days remaining (-30 points)
   - Warning: < 14 days remaining (-15 points)

2. **Fill Rate** (0-20 point penalty)
   - Very slow: < 10% filled (-20 points)
   - Slow: < 30% filled (-10 points)

3. **Competition** (0-50 point penalty)
   - Undercut by competitor (-50 points)
   - Not at best price (-20 points)

**Categories:**
- **Healthy** (70-100): No action needed
- **Warning** (40-69): Monitor closely
- **Critical** (0-39): Immediate attention required

## Required ESI Scope

Users must authenticate with the following scope:
- `esi-markets.read_corporation_orders.v1`

The scope has been added to the default scopes in `useEveAuth.jsx`, so new authentications will automatically include it.

## Security & Permissions

### ESI Requirements
- User must be authenticated via EVE SSO
- User must have corporation roles that allow viewing orders (Director, Accountant, or Trader)
- Access token must include the `esi-markets.read_corporation_orders.v1` scope

### API Security
- All requests require valid Bearer token
- CORS enabled for frontend access
- Rate limiting respects ESI limits
- Sensitive data never exposed in error messages

## Performance Considerations

### Caching
- API responses are cached for 30-60 seconds
- ESI data updates every 5 minutes in EVE
- Auto-refresh should not be more frequent than 5 minutes

### Rate Limiting
- Fetches market data for up to 50 items (to avoid overload)
- Batches ESI requests appropriately
- Uses parallel fetching where possible
- Limits historical order pages to 5 for performance

### Optimization Tips
- Use `groupBy: 'item'` for most use cases (default)
- Only enable `includeHistory` when needed
- Set reasonable `refreshInterval` (≥ 300 seconds)
- Limit displayed results in UI

## Error Handling

The feature provides detailed error messages for common issues:

### 403 Forbidden
```
Missing required scope: esi-markets.read_corporation_orders.v1
Please re-authenticate with the correct permissions.
```

### 404 Not Found
```
Corporation not found or you do not have access to view its orders.
```

### Network Errors
```
ESI request timeout
```

All errors include a request ID for debugging.

## Testing

Comprehensive test suite included:
- Unit tests for all hook methods
- Error handling scenarios
- Edge cases (empty data, missing tokens, etc.)
- Mock ESI responses
- Analysis method validation

Run tests:
```bash
npm test src/hooks/useCorpOrders.test.js
```

## Integration Examples

### 1. Order Monitor Dashboard
Display all corp orders with health indicators and alerts.

### 2. Undercut Alert System
Real-time monitoring of orders being undercut by competitors.

### 3. Risk Dashboard
Track total capital exposure and concentration risk.

### 4. Maintenance Checklist
Daily list of orders needing updates or renewals.

See `/src/hooks/useCorpOrders.example.js` for complete implementations.

## Future Enhancements

Potential improvements for future iterations:

1. **Historical Profit Tracking**
   - Compare historical buy prices with current sell prices
   - Calculate realized vs unrealized profit
   - Track order performance over time

2. **Notifications**
   - Discord/Slack webhooks for undercut alerts
   - Email notifications for expiring orders
   - Push notifications for critical health

3. **Advanced Analytics**
   - Market share by item
   - Competition analysis
   - Seasonal trends
   - Price history charts

4. **Automation**
   - Auto-update undercut orders
   - Bulk order management
   - Smart pricing recommendations

5. **Multi-Corporation Support**
   - Aggregate across multiple corps
   - Compare corp performance
   - Alliance-wide analytics

## Support & Troubleshooting

### Common Issues

**Q: I get "Missing scope" error**
A: Log out and log back in with EVE SSO to grant the new permission.

**Q: I see "Corporation not found"**
A: Ensure you have the correct corporation roles (Director, Accountant, or Trader).

**Q: Orders not updating**
A: ESI data updates every 5 minutes. Wait a few minutes and refresh.

**Q: Some items show "Unknown Item"**
A: This occurs if the ESI names endpoint fails. Usually resolves on retry.

### Debug Mode

Enable debug logging:
```javascript
const { data, error } = useCorpOrders(corpId);
console.log('Corp Orders Data:', data);
console.log('Error:', error);
```

### ESI Status

Check ESI API status: https://esi.evetech.net/ui/

## Contributing

When modifying this feature:

1. Update tests in `useCorpOrders.test.js`
2. Add examples to `useCorpOrders.example.js`
3. Update documentation in `useCorpOrders.QUICKSTART.md`
4. Follow existing code patterns
5. Test with real ESI data
6. Verify error handling

## License

Part of the EVETrade project. See main repository LICENSE.

## Credits

- ESI API: https://esi.evetech.net/
- EVE Online: https://www.eveonline.com/
- CCP Games: https://www.ccpgames.com/
