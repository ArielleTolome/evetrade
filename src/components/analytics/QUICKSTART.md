# Analytics Features - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Import Components

```jsx
import {
  ProfitPerHourCalculator,
  SeasonalTrends,
  CompetitionTracker,
  MarketShareEstimator,
} from './components/analytics';
```

### Step 2: Add to Your App

**Option A: Simple Page**
```jsx
function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <ProfitPerHourCalculator />
    </div>
  );
}
```

**Option B: Tabbed Dashboard**
```jsx
import { useState } from 'react';

function AnalyticsDashboard() {
  const [tab, setTab] = useState('profit');

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('profit')}>Profit/Hour</button>
        <button onClick={() => setTab('trends')}>Trends</button>
        <button onClick={() => setTab('competition')}>Competition</button>
        <button onClick={() => setTab('share')}>Market Share</button>
      </div>

      {tab === 'profit' && <ProfitPerHourCalculator />}
      {tab === 'trends' && <SeasonalTrends />}
      {tab === 'competition' && <CompetitionTracker />}
      {tab === 'share' && <MarketShareEstimator />}
    </div>
  );
}
```

### Step 3: Add Routes (Optional)

```jsx
// In your router file (e.g., router.jsx or App.jsx)
import { ProfitPerHourCalculator, SeasonalTrends } from './components/analytics';

const routes = [
  {
    path: '/analytics/profit',
    element: <ProfitPerHourCalculator />,
  },
  {
    path: '/analytics/trends',
    element: <SeasonalTrends />,
  },
  // ... more routes
];
```

---

## 📊 Component Overview

### 1. Profit Per Hour Calculator
**Best for:** Tracking live trading sessions and ISK/hour

```jsx
<ProfitPerHourCalculator />
```

**Quick Actions:**
1. Click "Start Tracking"
2. Select activity type (station/hauling)
3. Enter starting ISK
4. Trade!
5. Click "Stop Session" when done

**Auth:** Optional (recommended for auto-wallet updates)

---

### 2. Seasonal Trends
**Best for:** Finding best times to buy/sell

```jsx
<SeasonalTrends />
```

**Quick Actions:**
1. Enter Region ID (e.g., 10000002 for Jita)
2. Enter Type ID (e.g., 34 for Tritanium)
3. Click "Analyze Trends"
4. Switch between Day/Month/Weekend views

**Auth:** Not required

---

### 3. Competition Tracker
**Best for:** Monitoring undercuts and competitor activity

```jsx
<CompetitionTracker />
```

**Quick Actions:**
1. Log in with EVE account
2. Add Type IDs to watchlist
3. Click "Refresh Now" or enable auto-refresh
4. View undercut frequency and competition level

**Auth:** Required

---

### 4. Market Share Estimator
**Best for:** Understanding your market dominance

```jsx
<MarketShareEstimator />
```

**Quick Actions:**
1. Log in with EVE account
2. Enter Region ID
3. Select timeframe (7/30/90 days)
4. Click "Calculate Market Share"
5. View rankings and trends

**Auth:** Required

---

## 🔐 Authentication

Some features require EVE SSO authentication:

```jsx
import { useEveAuth } from './hooks/useEveAuth';

function MyComponent() {
  const { isAuthenticated, login } = useEveAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Login with EVE Online</button>;
  }

  return <CompetitionTracker />;
}
```

**Required Scopes:**
- `esi-wallet.read_character_wallet.v1` (for wallet balance)
- `esi-markets.read_character_orders.v1` (for orders)

---

## 💾 Data Persistence

All data is automatically saved to localStorage:

```javascript
// Data is saved automatically on changes
// To clear manually:
localStorage.removeItem('eve_profit_tracking');
localStorage.removeItem('eve_competition_tracker');
localStorage.removeItem('eve_market_share');
```

---

## 🎨 Styling

Components use Tailwind CSS and match the project theme automatically.

**Color Variables Available:**
- `accent-cyan` - Primary accent
- `accent-purple` - Secondary accent
- `space-black` - Dark background
- `space-dark` - Card background
- `text-primary` - Main text
- `text-secondary` - Muted text

**Glass Effect:**
```jsx
<div className="glass p-6">
  {/* Content with glassmorphic background */}
</div>
```

---

## 🐛 Common Issues

### "Authentication Required" Warning
**Solution:** Log in with EVE Online account
```jsx
const { login } = useEveAuth();
<button onClick={login}>Login</button>
```

### LocalStorage Full
**Solution:** Clear old data
```javascript
localStorage.clear();
// Or remove specific keys
localStorage.removeItem('eve_profit_tracking');
```

### API Rate Limit
**Solution:** Disable auto-refresh or slow down manual refreshes
- Wait 1 minute between manual refreshes
- Auto-refresh is set to 60 seconds by default

### No Historical Data
**Solution:** ESI only provides ~13 months of history
- This is an EVE API limitation
- Recent items may have less data

---

## 📈 Tips for Best Results

### Profit Per Hour Calculator
- ✅ Track sessions regularly for accurate averages
- ✅ Use different activity types to compare strategies
- ✅ Enable auto-wallet update if authenticated
- ❌ Don't forget to stop sessions when done

### Seasonal Trends
- ✅ Use popular trade hubs (Jita, Amarr) for more data
- ✅ Look at 90-day trends for better patterns
- ✅ Check weekday vs weekend differences
- ❌ New items may not have enough history

### Competition Tracker
- ✅ Add your most profitable items to watchlist
- ✅ Enable auto-refresh during active trading
- ✅ Monitor competition level changes
- ❌ Don't add too many items (performance)

### Market Share Estimator
- ✅ Calculate regularly to track growth
- ✅ Focus on high-volume items for meaningful shares
- ✅ Track trend changes over time
- ❌ Small items may show inflated percentages

---

## 🎯 Example Workflows

### Daily Trading Routine
1. Open **Profit Per Hour Calculator**
2. Start new session
3. Check **Competition Tracker** for undercuts
4. Trade items
5. Stop session and review statistics

### Weekly Analysis
1. Open **Seasonal Trends**
2. Analyze your main trading items
3. Identify best buy/sell times
4. Adjust trading schedule accordingly

### Monthly Review
1. Open **Market Share Estimator**
2. Calculate share for all items
3. Identify dominant vs minor positions
4. Adjust strategy to increase share

---

## 📚 More Information

- **Full Documentation:** See `README.md` in this directory
- **Examples:** See `AnalyticsDashboard.example.jsx`
- **Implementation Guide:** See `/ANALYTICS_FEATURES.md` in project root

---

## 🆘 Need Help?

Check these files:
1. `/src/components/analytics/README.md` - Full component docs
2. `/ANALYTICS_FEATURES.md` - Implementation summary
3. Component source code - Inline JSDoc comments

---

## ✅ Quick Checklist

Before using analytics:
- [ ] Components imported correctly
- [ ] Routes added (if using routing)
- [ ] EVE SSO configured (if using auth features)
- [ ] Tailwind CSS working
- [ ] Browser localStorage enabled

For authenticated features:
- [ ] Logged in with EVE Online
- [ ] Required scopes approved
- [ ] Token not expired

---

**That's it! You're ready to use Advanced Analytics! 🚀**
