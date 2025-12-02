# Advanced Analytics Components

This directory contains advanced analytics features for EVE Online trading analysis.

## Components

### 1. ProfitPerHourCalculator

**File:** `ProfitPerHourCalculator.jsx`

**Purpose:** Track actual trading time with start/stop timer and calculate ISK/hour profitability.

**Features:**
- Start/stop/pause/resume timer for trading sessions
- Track starting and ending ISK amounts
- Calculate real-time ISK/hour rate
- Historical session data with localStorage persistence
- Compare different trading activities (station trading vs hauling)
- Auto-update ISK from wallet (when authenticated)
- Session statistics and activity breakdown
- Export session history

**Usage:**
```jsx
import { ProfitPerHourCalculator } from './components/analytics';

function AnalyticsPage() {
  return <ProfitPerHourCalculator />;
}
```

**Authentication:** Optional but recommended for auto-wallet updates

**LocalStorage Key:** `eve_profit_tracking`

---

### 2. SeasonalTrends

**File:** `SeasonalTrends.jsx`

**Purpose:** Analyze historical price patterns to identify best times to buy and sell.

**Features:**
- Day of week analysis with heatmap
- Monthly pattern analysis
- Weekday vs weekend comparison
- Price trend analysis (30-day vs 90-day)
- Visual heatmaps showing price patterns
- Best buy/sell day recommendations
- Volume pattern analysis

**Usage:**
```jsx
import { SeasonalTrends } from './components/analytics';

function TrendsPage() {
  return <SeasonalTrends />;
}
```

**API Calls:**
- `getMarketHistory(regionId, typeId)` - Fetches historical market data from ESI

**Authentication:** Not required (uses public ESI endpoints)

---

### 3. CompetitionTracker

**File:** `CompetitionTracker.jsx`

**Purpose:** Monitor order updates and track competitor activity in your markets.

**Features:**
- Watch list for items
- Track order updates and undercutting frequency
- Identify most aggressive competitors
- Show competitor price patterns
- Competition level indicators (low/medium/high/extreme)
- Activity history with timestamps
- Auto-refresh mode for real-time monitoring
- Undercut statistics per item

**Usage:**
```jsx
import { CompetitionTracker } from './components/analytics';

function CompetitionPage() {
  return <CompetitionTracker />;
}
```

**API Calls:**
- `getCharacterOrders(characterId, accessToken)` - Fetches active orders

**Authentication:** Required (needs access to character orders)

**LocalStorage Key:** `eve_competition_tracker`

**Auto-refresh:** Every 60 seconds when enabled

---

### 4. MarketShareEstimator

**File:** `MarketShareEstimator.jsx`

**Purpose:** Calculate your market share as a percentage of total market volume.

**Features:**
- Calculate market share for each item you trade
- Separate buy-side and sell-side analysis
- Track market share changes over time
- Dominance rankings across items
- Visual history charts
- Market share categories (Dominant, Major Player, Significant, etc.)
- Trend indicators (up/down/stable)
- Timeframe selection (7/30/90 days)

**Usage:**
```jsx
import { MarketShareEstimator } from './components/analytics';

function MarketSharePage() {
  return <MarketShareEstimator />;
}
```

**API Calls:**
- `getCharacterOrders(characterId, accessToken)` - Fetches active orders
- `getMarketHistory(regionId, typeId)` - Fetches volume data

**Authentication:** Required (needs access to character orders)

**LocalStorage Key:** `eve_market_share`

---

## Hooks

### useProfitTracking

**File:** `../../hooks/useProfitTracking.jsx`

**Purpose:** Custom hook for managing trading session tracking.

**Features:**
- Session state management
- Timer functionality
- Trade logging
- Historical data persistence
- Statistics calculations

**API:**
```javascript
const {
  // State
  isTracking,
  currentSession,
  sessions,
  elapsedTime,

  // Actions
  startSession,
  stopSession,
  pauseSession,
  resumeSession,
  addTrade,
  updateSessionISK,
  deleteSession,
  clearAllSessions,

  // Computed
  getStatistics,
  getCurrentStats,
} = useProfitTracking();
```

**LocalStorage:** Automatically saves and loads session data

---

## Integration Examples

### Add to Router

```jsx
import {
  ProfitPerHourCalculator,
  SeasonalTrends,
  CompetitionTracker,
  MarketShareEstimator,
} from './components/analytics';

const routes = [
  {
    path: '/analytics/profit-per-hour',
    element: <ProfitPerHourCalculator />,
  },
  {
    path: '/analytics/seasonal-trends',
    element: <SeasonalTrends />,
  },
  {
    path: '/analytics/competition',
    element: <CompetitionTracker />,
  },
  {
    path: '/analytics/market-share',
    element: <MarketShareEstimator />,
  },
];
```

### Create Analytics Dashboard

```jsx
import { useState } from 'react';
import {
  ProfitPerHourCalculator,
  SeasonalTrends,
  CompetitionTracker,
  MarketShareEstimator,
} from './components/analytics';

function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('profit');

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('profit')}>Profit/Hour</button>
        <button onClick={() => setActiveTab('trends')}>Trends</button>
        <button onClick={() => setActiveTab('competition')}>Competition</button>
        <button onClick={() => setActiveTab('share')}>Market Share</button>
      </div>

      {activeTab === 'profit' && <ProfitPerHourCalculator />}
      {activeTab === 'trends' && <SeasonalTrends />}
      {activeTab === 'competition' && <CompetitionTracker />}
      {activeTab === 'share' && <MarketShareEstimator />}
    </div>
  );
}
```

---

## Data Persistence

All components use localStorage for data persistence:

| Component | Storage Key | Data Stored |
|-----------|-------------|-------------|
| ProfitPerHourCalculator | `eve_profit_tracking` | Sessions, current session, trades |
| CompetitionTracker | `eve_competition_tracker` | Watched items, snapshots, competitor stats |
| MarketShareEstimator | `eve_market_share` | Market share data, history |

**Storage Limits:**
- Profit tracking: Last 100 sessions
- Competition: Last 50 events per item
- Market share: Last 30 data points per item

---

## Authentication Requirements

| Component | Auth Required | ESI Scopes Needed |
|-----------|---------------|-------------------|
| ProfitPerHourCalculator | Optional | `esi-wallet.read_character_wallet.v1` (for auto-update) |
| SeasonalTrends | No | None (public endpoints) |
| CompetitionTracker | Yes | `esi-markets.read_character_orders.v1` |
| MarketShareEstimator | Yes | `esi-markets.read_character_orders.v1` |

---

## Styling

All components use:
- Tailwind CSS utility classes
- Project color variables (defined in `index.css`)
- Glassmorphic design patterns
- Responsive grid layouts
- Dark theme by default

**Color Scheme:**
- Primary accent: `accent-cyan` (#00d4ff)
- Secondary: `accent-purple` (#8b5cf6)
- Success: `green-400`
- Warning: `yellow-400`
- Danger: `red-400`

---

## Performance Considerations

1. **API Rate Limiting:** Components respect ESI rate limits
2. **LocalStorage:** Data is compressed and limited to prevent quota issues
3. **Auto-refresh:** Can be disabled to reduce API calls
4. **Lazy Loading:** Consider code-splitting for better initial load times

---

## Future Enhancements

Potential improvements:
- Export data to CSV/JSON
- Advanced charting with Chart.js or Recharts
- Push notifications for undercuts
- Machine learning price predictions
- Multi-character support
- Cloud sync (Supabase integration)
- Mobile-optimized views

---

## Troubleshooting

### LocalStorage Full
If users encounter storage quota issues:
```javascript
// Clear old data
localStorage.removeItem('eve_profit_tracking');
localStorage.removeItem('eve_competition_tracker');
localStorage.removeItem('eve_market_share');
```

### Authentication Errors
Ensure EVE SSO is properly configured:
- `VITE_EVE_CLIENT_ID` environment variable set
- Redirect URI matches EVE Developer application
- Required scopes are requested

### API Errors
Common issues:
- 403: Token expired, need to refresh
- 404: Invalid type/region ID
- 429: Rate limited, slow down requests

---

## Contributing

When adding new analytics features:

1. Follow existing component structure
2. Use TypeScript-style JSDoc comments
3. Implement localStorage persistence
4. Handle auth and non-auth states
5. Add loading and error states
6. Include empty states
7. Use existing formatters from `utils/formatters.js`
8. Follow Tailwind CSS patterns
9. Update this README

---

## License

Part of EVETrade application - see main project LICENSE
