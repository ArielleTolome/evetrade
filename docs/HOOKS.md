# Custom Hooks Reference

This document describes all custom React hooks in EVETrade.

## Overview

EVETrade uses custom hooks for:
- API data fetching and caching
- Authentication and character management
- Trading calculations and analysis
- UI state management
- Alerts and notifications

## Hook Categories

| Category | Hooks | Description |
|----------|-------|-------------|
| Core Data | `useApiCall`, `useCache`, `useResources` | Data fetching and caching |
| Authentication | `useEveAuth`, `useMultiCharacter` | EVE SSO and character management |
| Trading Analysis | `useArbitrageScanner`, `useMarketVelocity`, `useMarketTrends` | Market analysis |
| Optimization | `useRouteOptimizer`, `usePIOptimizer`, `useLPOptimizer` | Profit optimization |
| Trading Tools | `useTradeForm`, `useTradeNotes`, `useTradeHistory` | Trading workflow |
| Alerts | `useSmartAlerts`, `usePriceAlerts`, `useStockAlerts` | Alert management |
| UI | `useClipboard`, `useKeyboardShortcuts`, `useWatchlist` | User interaction |

## Core Data Hooks

### useApiCall

Generic wrapper for API calls with loading/error state.

```jsx
import { useApiCall } from '../hooks/useApiCall';
import { fetchStationTrading } from '../api/trading';

function StationTradingPage() {
  const { data, loading, error, execute } = useApiCall();

  const handleSubmit = async (formData) => {
    await execute(() => fetchStationTrading(formData));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <TradingTable data={data} />;
}
```

**Returns:**
- `data` - Response data (null initially)
- `loading` - Boolean loading state
- `error` - Error object or null
- `execute(asyncFn)` - Function to execute API call

### useCache

Local caching for expensive operations.

```jsx
import { useCache } from '../hooks/useCache';

function MyComponent() {
  const { get, set, remove, clear } = useCache('myPrefix');

  // Get cached value
  const cached = get('key');

  // Set with 1 hour expiry
  set('key', value, 3600000);

  // Remove specific key
  remove('key');

  // Clear all cached items with prefix
  clear();
}
```

**Returns:**
- `get(key)` - Get cached value or null
- `set(key, value, ttl)` - Cache value with TTL (ms)
- `remove(key)` - Remove cached item
- `clear()` - Clear all items with prefix

### useResources

Access to cached universe data (regions, stations, items).

```jsx
import { useResources } from '../hooks/useResources';

function RegionSelect() {
  const { regions, stations, items, loading, error } = useResources();

  if (loading) return <SkeletonLoader />;

  return (
    <select>
      {regions.map(r => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  );
}
```

**Returns:**
- `regions` - Array of region objects
- `stations` - Array of station objects
- `systems` - Array of solar system objects
- `items` - Array of item objects
- `loading` - Boolean loading state
- `error` - Error object or null
- `getRegionById(id)` - Lookup function
- `getStationById(id)` - Lookup function
- `getItemById(id)` - Lookup function

## Authentication Hooks

### useEveAuth

EVE Online SSO authentication management.

```jsx
import { useEveAuth } from '../hooks/useEveAuth';

function LoginButton() {
  const {
    character,
    isAuthenticated,
    login,
    logout,
    accessToken,
    loading,
  } = useEveAuth();

  if (loading) return <LoadingSpinner />;

  if (isAuthenticated) {
    return (
      <div>
        <img src={character.portrait} alt={character.name} />
        <span>{character.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <button onClick={login}>Login with EVE</button>;
}
```

**Returns:**
- `character` - Character object with id, name, portrait
- `isAuthenticated` - Boolean authentication state
- `login()` - Initiate SSO login
- `logout()` - Clear authentication
- `accessToken` - Current access token
- `refreshToken` - Current refresh token
- `loading` - Boolean loading state
- `error` - Error object or null

### useMultiCharacter

Manage multiple EVE characters.

```jsx
import { useMultiCharacter } from '../hooks/useMultiCharacter';

function CharacterSwitcher() {
  const {
    characters,
    activeCharacter,
    switchCharacter,
    addCharacter,
    removeCharacter,
  } = useMultiCharacter();

  return (
    <div>
      {characters.map(char => (
        <button
          key={char.id}
          onClick={() => switchCharacter(char.id)}
          className={char.id === activeCharacter?.id ? 'active' : ''}
        >
          {char.name}
        </button>
      ))}
      <button onClick={addCharacter}>Add Character</button>
    </div>
  );
}
```

## Trading Analysis Hooks

### useArbitrageScanner

Scan for cross-region arbitrage opportunities.

```jsx
import { useArbitrageScanner } from '../hooks/useArbitrageScanner';

function ArbitragePage() {
  const {
    opportunities,
    loading,
    error,
    scan,
    filters,
    setFilters,
  } = useArbitrageScanner();

  return (
    <div>
      <button onClick={scan}>Scan for Arbitrage</button>
      {opportunities.map(opp => (
        <ArbitrageCard key={opp.itemId} opportunity={opp} />
      ))}
    </div>
  );
}
```

**Returns:**
- `opportunities` - Array of arbitrage opportunities
- `loading` - Boolean loading state
- `error` - Error object or null
- `scan(params)` - Execute scan
- `filters` - Current filter settings
- `setFilters(filters)` - Update filters

### useMarketVelocity

Analyze how quickly items sell.

```jsx
import { useMarketVelocity } from '../hooks/useMarketVelocity';

function VelocityIndicator({ itemId, regionId }) {
  const { velocity, loading, error, refresh } = useMarketVelocity(itemId, regionId);

  if (loading) return <Skeleton />;

  return (
    <div>
      <span>Daily Volume: {velocity.avgVolume}</span>
      <span>Sell Rate: {velocity.turnoverRate}x</span>
    </div>
  );
}
```

### useMarketTrends

Detect market trends and patterns.

```jsx
import { useMarketTrends } from '../hooks/useMarketTrends';

function TrendBadge({ itemId, regionId }) {
  const { trend, confidence, direction } = useMarketTrends(itemId, regionId);

  return (
    <Badge variant={direction === 'up' ? 'success' : 'warning'}>
      {trend} ({confidence}% confidence)
    </Badge>
  );
}
```

### useUndercutDetection

Monitor for order undercuts.

```jsx
import { useUndercutDetection } from '../hooks/useUndercutDetection';

function UndercutAlert({ orders }) {
  const { undercuts, checkUndercuts } = useUndercutDetection(orders);

  useEffect(() => {
    const interval = setInterval(checkUndercuts, 60000);
    return () => clearInterval(interval);
  }, []);

  return undercuts.map(u => (
    <Alert key={u.orderId}>
      {u.itemName} undercut by {formatISK(u.amount)}
    </Alert>
  ));
}
```

### useScamDetection

Detect potential contract scams.

```jsx
import { useScamDetection } from '../hooks/useScamDetection';

function ContractCard({ contract }) {
  const { riskLevel, warnings, isScam } = useScamDetection(contract);

  return (
    <Card className={isScam ? 'border-red-500' : ''}>
      {warnings.map(w => (
        <WarningBadge key={w}>{w}</WarningBadge>
      ))}
    </Card>
  );
}
```

## Optimization Hooks

### useRouteOptimizer

Optimize trade routes.

```jsx
import { useRouteOptimizer } from '../hooks/useRouteOptimizer';

function RoutePlanner() {
  const {
    route,
    loading,
    error,
    optimize,
    waypoints,
    addWaypoint,
    removeWaypoint,
  } = useRouteOptimizer();

  return (
    <div>
      <WaypointList
        waypoints={waypoints}
        onAdd={addWaypoint}
        onRemove={removeWaypoint}
      />
      <button onClick={optimize}>Optimize Route</button>
      {route && <RouteDisplay route={route} />}
    </div>
  );
}
```

### usePIOptimizer

Optimize planetary interaction setups.

```jsx
import { usePIOptimizer } from '../hooks/usePIOptimizer';

function PIOptimizer() {
  const {
    opportunities,
    loading,
    analyze,
    filters,
    setFilters,
  } = usePIOptimizer();

  return (
    <div>
      <PIFilters filters={filters} onChange={setFilters} />
      <button onClick={analyze}>Analyze</button>
      <PIOpportunityList opportunities={opportunities} />
    </div>
  );
}
```

### useLPOptimizer

Find best loyalty point conversions.

```jsx
import { useLPOptimizer } from '../hooks/useLPOptimizer';

function LPOptimizer() {
  const {
    conversions,
    loading,
    optimize,
    selectedCorp,
    setSelectedCorp,
  } = useLPOptimizer();

  return (
    <div>
      <CorpSelect value={selectedCorp} onChange={setSelectedCorp} />
      <button onClick={optimize}>Find Best Conversions</button>
      <ConversionList conversions={conversions} />
    </div>
  );
}
```

### useIndustryProfits

Calculate manufacturing profitability.

```jsx
import { useIndustryProfits } from '../hooks/useIndustryProfits';

function IndustryCalculator() {
  const {
    profits,
    loading,
    calculate,
    blueprint,
    setBlueprint,
  } = useIndustryProfits();

  return (
    <div>
      <BlueprintSelect value={blueprint} onChange={setBlueprint} />
      <button onClick={calculate}>Calculate</button>
      <ProfitBreakdown profits={profits} />
    </div>
  );
}
```

## Trading Tools Hooks

### useTradeForm

Manage trading form state.

```jsx
import { useTradeForm } from '../hooks/useTradeForm';

function TradingForm() {
  const {
    form,
    errors,
    updateField,
    validate,
    reset,
    isValid,
  } = useTradeForm({
    station: '',
    minProfit: 1000000,
    tax: 0.08,
  });

  const handleSubmit = () => {
    if (validate()) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        value={form.station}
        onChange={(v) => updateField('station', v)}
        error={errors.station}
      />
    </form>
  );
}
```

### useTradeNotes

Manage trade annotations.

```jsx
import { useTradeNotes } from '../hooks/useTradeNotes';

function TradeNotes({ itemId }) {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    loading,
  } = useTradeNotes(itemId);

  return (
    <div>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onUpdate={updateNote}
          onDelete={deleteNote}
        />
      ))}
      <AddNoteForm onAdd={addNote} />
    </div>
  );
}
```

### useTradeHistory

Track trading history.

```jsx
import { useTradeHistory } from '../hooks/useTradeHistory';

function TradeHistory() {
  const {
    history,
    addTrade,
    getTotalProfit,
    getTradesByItem,
    clear,
  } = useTradeHistory();

  return (
    <div>
      <h3>Total Profit: {formatISK(getTotalProfit())}</h3>
      <TradeList trades={history} />
    </div>
  );
}
```

### useTradeSession

Track trading session timing.

```jsx
import { useTradeSession } from '../hooks/useTradeSession';

function SessionTimer() {
  const {
    startTime,
    duration,
    isActive,
    start,
    stop,
    reset,
  } = useTradeSession();

  return (
    <div>
      <span>Session: {formatDuration(duration)}</span>
      {!isActive ? (
        <button onClick={start}>Start</button>
      ) : (
        <button onClick={stop}>Stop</button>
      )}
    </div>
  );
}
```

## Alert Hooks

### useSmartAlerts

Comprehensive alert management.

```jsx
import { useSmartAlerts } from '../hooks/useSmartAlerts';

function AlertCenter() {
  const {
    alerts,
    createAlert,
    deleteAlert,
    dismissAlert,
    activeAlerts,
  } = useSmartAlerts();

  return (
    <div>
      <AlertForm onSubmit={createAlert} />
      <AlertList
        alerts={activeAlerts}
        onDismiss={dismissAlert}
        onDelete={deleteAlert}
      />
    </div>
  );
}
```

### usePriceAlerts

Price-based alerts.

```jsx
import { usePriceAlerts } from '../hooks/usePriceAlerts';

function PriceAlertManager({ itemId }) {
  const {
    alerts,
    createAlert,
    deleteAlert,
    triggered,
  } = usePriceAlerts(itemId);

  return (
    <div>
      <button onClick={() => createAlert({ targetPrice: 1000000, type: 'below' })}>
        Alert when below 1M
      </button>
      {triggered.map(alert => (
        <Notification key={alert.id}>Price hit target!</Notification>
      ))}
    </div>
  );
}
```

### useStockAlerts

Stock level alerts.

```jsx
import { useStockAlerts } from '../hooks/useStockAlerts';

function StockAlerts() {
  const {
    alerts,
    lowStockItems,
    createAlert,
    deleteAlert,
  } = useStockAlerts();

  return (
    <div>
      {lowStockItems.map(item => (
        <Alert key={item.id} variant="warning">
          {item.name} stock is low ({item.quantity} remaining)
        </Alert>
      ))}
    </div>
  );
}
```

## UI Hooks

### useClipboard

Clipboard operations.

```jsx
import { useClipboard } from '../hooks/useClipboard';

function CopyButton({ text }) {
  const { copy, copied, error } = useClipboard();

  return (
    <button onClick={() => copy(text)}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
```

### useKeyboardShortcuts

Register keyboard shortcuts.

```jsx
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function TradingPage() {
  useKeyboardShortcuts({
    'ctrl+s': () => saveTrade(),
    'ctrl+f': () => focusSearch(),
    'escape': () => closeModal(),
  });

  return <div>...</div>;
}
```

### useWatchlist

Manage item watchlist.

```jsx
import { useWatchlist } from '../hooks/useWatchlist';

function WatchlistPage() {
  const {
    items,
    addItem,
    removeItem,
    isWatched,
    clear,
  } = useWatchlist();

  return (
    <div>
      {items.map(item => (
        <WatchlistItem
          key={item.id}
          item={item}
          onRemove={() => removeItem(item.id)}
        />
      ))}
    </div>
  );
}
```

### useFavorites

Manage favorite stations/routes.

```jsx
import { useFavorites } from '../hooks/useFavorites';

function FavoriteButton({ stationId }) {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(stationId);

  return (
    <button onClick={() => favorited ? removeFavorite(stationId) : addFavorite(stationId)}>
      {favorited ? '★' : '☆'}
    </button>
  );
}
```

### useDiscordWebhook

Send notifications to Discord.

```jsx
import { useDiscordWebhook } from '../hooks/useDiscordWebhook';

function NotificationSettings() {
  const {
    webhookUrl,
    setWebhookUrl,
    sendNotification,
    isConfigured,
  } = useDiscordWebhook();

  return (
    <div>
      <input
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        placeholder="Discord Webhook URL"
      />
      {isConfigured && (
        <button onClick={() => sendNotification('Test message')}>
          Test Notification
        </button>
      )}
    </div>
  );
}
```

## Utility Hooks

### usePortfolio

Track portfolio value.

```jsx
import { usePortfolio } from '../hooks/usePortfolio';

function PortfolioSummary() {
  const {
    totalValue,
    items,
    addItem,
    removeItem,
    updateQuantity,
  } = usePortfolio();

  return (
    <div>
      <h2>Portfolio Value: {formatISK(totalValue)}</h2>
      <PortfolioList items={items} />
    </div>
  );
}
```

### useProfitMetrics

Calculate profit metrics.

```jsx
import { useProfitMetrics } from '../hooks/useProfitMetrics';

function ProfitDashboard({ trades }) {
  const {
    totalProfit,
    avgProfit,
    profitPerHour,
    roi,
  } = useProfitMetrics(trades);

  return (
    <div>
      <StatCard label="Total Profit" value={formatISK(totalProfit)} />
      <StatCard label="ISK/Hour" value={formatISK(profitPerHour)} />
      <StatCard label="ROI" value={`${roi.toFixed(1)}%`} />
    </div>
  );
}
```

### useProfitTracking

Track profit over time.

```jsx
import { useProfitTracking } from '../hooks/useProfitTracking';

function ProfitChart() {
  const {
    history,
    recordProfit,
    getDailyProfits,
    getWeeklyProfits,
  } = useProfitTracking();

  return (
    <Chart data={getDailyProfits()} />
  );
}
```

### useMomentum

Market momentum analysis.

```jsx
import { useMomentum } from '../hooks/useMomentum';

function MomentumIndicator({ itemId, regionId }) {
  const { momentum, trend, strength } = useMomentum(itemId, regionId);

  return (
    <div className={`momentum-${momentum}`}>
      Momentum: {momentum} ({strength}%)
    </div>
  );
}
```

### useWalletValidator

Validate wallet transactions.

```jsx
import { useWalletValidator } from '../hooks/useWalletValidator';

function WalletCheck() {
  const {
    isValid,
    balance,
    validate,
    errors,
  } = useWalletValidator();

  return (
    <div>
      {isValid ? (
        <span>Balance: {formatISK(balance)}</span>
      ) : (
        <span className="text-red-500">{errors.join(', ')}</span>
      )}
    </div>
  );
}
```

### useZkillboard

Fetch zkillboard data.

```jsx
import { useZkillboard } from '../hooks/useZkillboard';

function SystemSafety({ systemId }) {
  const {
    kills,
    loading,
    recentActivity,
    dangerLevel,
  } = useZkillboard(systemId);

  return (
    <Badge variant={dangerLevel === 'high' ? 'danger' : 'success'}>
      {recentActivity} kills in 24h
    </Badge>
  );
}
```

## Hook Patterns

### Combining Hooks

```jsx
function TradeAnalysis({ itemId, regionId }) {
  const { velocity } = useMarketVelocity(itemId, regionId);
  const { trend } = useMarketTrends(itemId, regionId);
  const { momentum } = useMomentum(itemId, regionId);
  const { isWatched, addItem } = useWatchlist();

  return (
    <Card>
      <VelocityBadge velocity={velocity} />
      <TrendBadge trend={trend} />
      <MomentumBadge momentum={momentum} />
      <button onClick={() => addItem(itemId)}>
        {isWatched(itemId) ? 'Watching' : 'Add to Watchlist'}
      </button>
    </Card>
  );
}
```

### Error Handling

```jsx
function SafeDataFetch() {
  const { data, loading, error, execute } = useApiCall();

  useEffect(() => {
    execute(fetchData).catch(console.error);
  }, []);

  if (error) {
    return (
      <ErrorBoundary>
        <RetryButton onClick={() => execute(fetchData)} />
      </ErrorBoundary>
    );
  }

  return <DataDisplay data={data} />;
}
```
