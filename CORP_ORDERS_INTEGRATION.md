# Corporation Orders Feature - Integration Checklist

## Quick Integration Guide

This checklist helps you integrate the Corporation Orders Aggregation feature into your EVETrade application.

## Prerequisites

✅ **Required Files Created**
- [x] `/api/corp-orders.js` - Serverless API function
- [x] `/src/hooks/useCorpOrders.js` - React hook
- [x] `/src/hooks/useCorpOrders.example.js` - Example components
- [x] `/src/hooks/useCorpOrders.test.js` - Test suite
- [x] `/src/hooks/useCorpOrders.QUICKSTART.md` - Documentation

✅ **Modified Files**
- [x] `/src/hooks/useEveAuth.jsx` - Added corp orders scope
- [x] `/src/api/esi.js` - Added corp order API functions

## Integration Steps

### Step 1: Verify Authentication Setup

Your app must have the EVE SSO authentication provider properly configured.

**Check:**
```javascript
// In your main App.jsx or index.jsx
import { EveAuthProvider } from './hooks/useEveAuth';

function App() {
  return (
    <EveAuthProvider>
      {/* Your app components */}
    </EveAuthProvider>
  );
}
```

**Verify Environment Variables:**
```bash
# .env or .env.local
VITE_EVE_CLIENT_ID=your_eve_client_id
VITE_EVE_REDIRECT_URI=http://localhost:5173/auth/callback
```

**Test Authentication:**
1. User clicks login
2. Redirects to EVE SSO
3. Grants permissions including `esi-markets.read_corporation_orders.v1`
4. Returns to your app with valid token

### Step 2: Create a Corporation Orders Page

Create a new page component to display corporation orders.

**Example: `/src/pages/CorpOrdersPage.jsx`**
```javascript
import React, { useEffect, useState } from 'react';
import { useCorpOrders } from '../hooks/useCorpOrders';
import { useEveAuth } from '../hooks/useEveAuth';

export default function CorpOrdersPage() {
  const { character, isAuthenticated } = useEveAuth();
  const [corpId, setCorpId] = useState(null);

  const {
    loading,
    error,
    summary,
    orders,
    fetchOrders,
    getOrdersNeedingAttention,
    getUndercutOrders,
  } = useCorpOrders(corpId);

  useEffect(() => {
    // Fetch corp ID from character info
    // You might need to get this from character data
    if (character) {
      // Placeholder - replace with actual corp ID from character
      setCorpId(98000001); // Example corp ID
    }
  }, [character]);

  useEffect(() => {
    if (corpId && isAuthenticated) {
      fetchOrders();
    }
  }, [corpId, isAuthenticated, fetchOrders]);

  if (!isAuthenticated) {
    return <div>Please log in with EVE SSO</div>;
  }

  if (loading) {
    return <div>Loading corporation orders...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const needAttention = getOrdersNeedingAttention();
  const undercuts = getUndercutOrders();

  return (
    <div className="corp-orders-page">
      <h1>Corporation Orders</h1>

      {summary && (
        <div className="summary">
          <div>Total Orders: {summary.totalOrders}</div>
          <div>Total Exposure: {(summary.totalExposure / 1e9).toFixed(2)}B ISK</div>
          <div>Need Attention: {summary.ordersNeedingAttention}</div>
        </div>
      )}

      {undercuts.length > 0 && (
        <div className="alerts">
          <h2>Undercut Orders</h2>
          {undercuts.map((item, idx) => (
            <div key={idx}>
              {item.itemName} - {item.count} order(s) undercut
            </div>
          ))}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Location</th>
            <th>Buy Orders</th>
            <th>Sell Orders</th>
            <th>Total Exposure</th>
            <th>Need Attention</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((item, idx) => (
            <tr key={idx}>
              <td>{item['Item']}</td>
              <td>{item['Location']}</td>
              <td>{item['Buy Orders']}</td>
              <td>{item['Sell Orders']}</td>
              <td>{(item['Total Exposure (ISK)'] / 1e6).toFixed(2)}M ISK</td>
              <td>{item['Orders Needing Attention']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Step 3: Add Route to Navigation

Add a route to your router configuration.

**If using React Router:**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CorpOrdersPage from './pages/CorpOrdersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/corp-orders" element={<CorpOrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Add to Navigation Menu:**
```javascript
<nav>
  <Link to="/">Home</Link>
  <Link to="/station-trading">Station Trading</Link>
  <Link to="/corp-orders">Corporation Orders</Link>
  {/* Other links */}
</nav>
```

### Step 4: Test the Integration

**Manual Testing Checklist:**

- [ ] User can log in with EVE SSO
- [ ] User is redirected back after auth
- [ ] Corp orders page loads without errors
- [ ] Corporation ID is correctly set
- [ ] API call to `/api/corp-orders` succeeds
- [ ] Orders are displayed in the table
- [ ] Summary statistics are shown
- [ ] Undercut alerts appear (if applicable)
- [ ] Error states display properly
- [ ] Loading states work correctly

**Test Different Scenarios:**

1. **No Authentication:**
   - Navigate to /corp-orders without logging in
   - Should show "Please log in" message

2. **Missing Scope:**
   - Log in with old session (before scope added)
   - Should show "Missing scope" error
   - Log out and log back in
   - Should work correctly

3. **No Corporation Access:**
   - Use a character without corp permissions
   - Should show "No access" error

4. **Empty Orders:**
   - Use a corp with no active orders
   - Should show "No orders" state gracefully

5. **Large Order Set:**
   - Use a corp with many orders
   - Should load and display without performance issues

### Step 5: Optional Enhancements

**Add Auto-Refresh:**
```javascript
const { ... } = useCorpOrders(corpId, {
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
});
```

**Add Filtering:**
```javascript
const [healthFilter, setHealthFilter] = useState({ min: 0, max: 100 });
const filteredOrders = filterByHealth(healthFilter.min, healthFilter.max);
```

**Add Sorting:**
```javascript
const [sortBy, setSortBy] = useState('exposure');
const sortedOrders = [...orders].sort((a, b) => {
  if (sortBy === 'exposure') {
    return b['Total Exposure (ISK)'] - a['Total Exposure (ISK)'];
  }
  // Other sort options
});
```

**Add Export:**
```javascript
import { exportToCSV } from '../utils/export';

function handleExport() {
  exportToCSV(orders, 'corp-orders.csv');
}
```

## Common Integration Issues

### Issue 1: "Missing required scope" Error

**Cause:** User authenticated before the scope was added to the config.

**Solution:**
1. User logs out
2. Clear localStorage (to remove old auth data)
3. User logs in again
4. New scope is included in auth request

**Code to force re-auth:**
```javascript
if (error?.message.includes('scope')) {
  return (
    <div>
      <p>Missing permissions. Please log out and log back in.</p>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}
```

### Issue 2: "Corporation not found" Error

**Cause:** Character doesn't have the required corporation roles.

**Solution:**
- User needs Director, Accountant, or Trader roles
- Contact corp leadership to grant permissions

**Code to show helpful message:**
```javascript
if (error?.message.includes('Corporation not found')) {
  return (
    <div>
      <p>You don't have access to corporation orders.</p>
      <p>Required roles: Director, Accountant, or Trader</p>
    </div>
  );
}
```

### Issue 3: API Endpoint Not Found (404)

**Cause:** Serverless function not deployed or path incorrect.

**Solution:**
1. Verify file exists at `/api/corp-orders.js`
2. Check Vercel deployment includes the file
3. Verify fetch URL matches API path

**Debug:**
```javascript
console.log('Fetching from:', `/api/corp-orders?corporationId=${corpId}`);
```

### Issue 4: CORS Errors

**Cause:** API endpoint missing CORS headers.

**Solution:**
The `/api/corp-orders.js` already includes CORS headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

Verify these are present in your deployment.

### Issue 5: Slow Performance

**Cause:** Too many items or locations to process.

**Solution:**
1. Use appropriate groupBy option (default 'item' is fastest)
2. Don't enable includeHistory unless needed
3. Set reasonable autoRefresh interval (≥ 300 seconds)
4. Limit market data fetching (already limited to 50 items)

**Optimization:**
```javascript
const { ... } = useCorpOrders(corpId, {
  groupBy: 'item',           // Fastest option
  includeHistory: false,     // Reduces API calls
  autoRefresh: false,        // Only refresh manually
});
```

## Styling

Add CSS for a polished look:

```css
/* Corp Orders Page Styles */
.corp-orders-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary > div {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.alerts {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.alerts h2 {
  color: #856404;
  margin-top: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f8f9fa;
  font-weight: 600;
}

tr:hover {
  background: #f8f9fa;
}

.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
}
```

## Monitoring & Analytics

Track usage and errors:

```javascript
// Track page views
useEffect(() => {
  analytics.track('Corp Orders Page Viewed', {
    corporationId: corpId,
  });
}, [corpId]);

// Track errors
useEffect(() => {
  if (error) {
    analytics.track('Corp Orders Error', {
      error: error.message,
      corporationId: corpId,
    });
  }
}, [error, corpId]);

// Track successful loads
useEffect(() => {
  if (data) {
    analytics.track('Corp Orders Loaded', {
      totalOrders: summary?.totalOrders,
      totalExposure: summary?.totalExposure,
    });
  }
}, [data, summary]);
```

## Production Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`npm test`)
- [ ] ESI scope added to production EVE app registration
- [ ] Environment variables set in Vercel
- [ ] CORS headers configured
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Performance monitoring in place
- [ ] Rate limiting considered
- [ ] User documentation updated
- [ ] Support team briefed on new feature

## User Documentation

Provide users with:

1. **How to access:** "Navigate to Corporation Orders in the menu"
2. **Requirements:** "You need Director, Accountant, or Trader roles"
3. **What it shows:** "All active corporation market orders with analysis"
4. **How to interpret:** "Health score, undercut status, etc."
5. **Troubleshooting:** "Common errors and solutions"

## Support Resources

For implementation help:

- **Quick Start Guide:** `/src/hooks/useCorpOrders.QUICKSTART.md`
- **Examples:** `/src/hooks/useCorpOrders.example.js`
- **Tests:** `/src/hooks/useCorpOrders.test.js`
- **Architecture:** `/CORP_ORDERS_ARCHITECTURE.md`
- **Feature Overview:** `/CORP_ORDERS_FEATURE.md`

## Next Steps After Integration

1. **Gather User Feedback**
   - What features are most used?
   - What's missing?
   - Performance issues?

2. **Monitor Metrics**
   - API response times
   - Error rates
   - User engagement

3. **Iterate and Improve**
   - Add requested features
   - Fix bugs
   - Optimize performance

4. **Consider Enhancements**
   - Discord/Slack notifications
   - Historical profit tracking
   - Automated order updates
   - Multi-corporation support

## Getting Help

If you encounter issues during integration:

1. Check the example components
2. Review the test file for usage patterns
3. Verify ESI API status: https://esi.evetech.net/ui/
4. Check browser console for detailed errors
5. Review Vercel function logs
6. Test API endpoint directly with curl/Postman

## Success Criteria

Integration is complete when:

✅ Users can view corporation orders
✅ Undercut detection works
✅ Health scores are calculated
✅ Alerts are displayed
✅ Performance is acceptable
✅ Errors are handled gracefully
✅ Documentation is available
✅ Tests pass
✅ Feature is deployed to production
✅ Users are using it successfully

---

**Integration complete!** Your EVETrade app now has corporation order management capabilities.
