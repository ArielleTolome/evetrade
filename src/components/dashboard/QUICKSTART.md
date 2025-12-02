# Dashboard Widgets - Quick Start Guide

Get started with EVETrade dashboard widgets in 5 minutes.

## Installation

The components are already included in the project. Import them from the dashboard module:

```jsx
import {
  StatCard,
  MiniChart,
  ProgressRing,
  DataCard,
  QuickActions,
  ActivityFeed
} from './components/dashboard';
```

## Quick Examples

### 1. Display a Key Metric

```jsx
<StatCard
  label="Total Profit"
  value={15234567}
  format="isk"
  icon="💰"
  variant="green"
/>
```

### 2. Show a Trend Chart

```jsx
<MiniChart
  data={[120, 150, 140, 180, 170, 200]}
  type="area"
  color="cyan"
  height="h-24"
/>
```

### 3. Display Progress

```jsx
<ProgressRing
  percentage={75}
  color="cyan"
  label="Completion"
/>
```

### 4. Create a Data Panel

```jsx
<DataCard
  title="Trading Summary"
  refreshable
  onRefresh={async () => await fetchData()}
>
  <p>Your content here</p>
</DataCard>
```

### 5. Add Quick Actions

```jsx
<QuickActions
  actions={[
    {
      id: 'trade',
      label: 'Start Trading',
      icon: '🏪',
      onClick: () => navigate('/trade'),
      color: 'cyan',
    }
  ]}
/>
```

### 6. Show Recent Activity

```jsx
<ActivityFeed
  activities={[
    {
      id: 1,
      type: 'profit',
      title: 'Trade executed',
      description: 'Made 15M ISK profit',
      timestamp: Date.now(),
    }
  ]}
/>
```

## Common Patterns

### Dashboard Layout

```jsx
function TradingDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stats Row */}
      <StatCard label="Profit" value={1000000} format="isk" variant="green" />
      <StatCard label="Trades" value={42} format="number" variant="cyan" />
      <StatCard label="Margin" value={25} format="percent" variant="gold" />

      {/* Main Content */}
      <div className="lg:col-span-2">
        <DataCard title="Recent Trades">
          <ActivityFeed activities={trades} />
        </DataCard>
      </div>

      {/* Sidebar */}
      <div>
        <DataCard title="Quick Actions">
          <QuickActions actions={actions} layout="list" />
        </DataCard>
      </div>
    </div>
  );
}
```

### With Loading State

```jsx
function DataPanel() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);

  return (
    <DataCard title="Market Data" loading={loading}>
      {data && <MiniChart data={data.prices} />}
    </DataCard>
  );
}
```

### With Error Handling

```jsx
function TradingPanel() {
  const [error, setError] = useState(false);

  const handleRetry = async () => {
    setError(false);
    try {
      await fetchData();
    } catch (e) {
      setError(true);
    }
  };

  return (
    <DataCard
      title="Trading Data"
      error={error}
      errorMessage="Failed to load trading data"
      onRetry={handleRetry}
    >
      {/* Content */}
    </DataCard>
  );
}
```

## Color Guide

Choose colors based on meaning:

- **cyan** - Primary actions, neutral info
- **gold** - Warnings, important metrics
- **green** - Success, profit, gains
- **red** - Errors, losses, alerts
- **purple** - Special features, premium

## Format Types

StatCard supports these formats:

- `format="number"` - 1,234 (comma separated)
- `format="isk"` - 1.2M ISK (abbreviated)
- `format="percent"` - 25% (percentage)

## Responsive Design

Components are mobile-first. Use Tailwind grid classes:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</div>
```

## Next Steps

- View `Dashboard.example.jsx` for comprehensive examples
- Read `README.md` for full API documentation
- Check existing EVETrade pages for integration patterns
- Customize colors and sizes to match your needs

## Tips

1. Always provide `loading` prop when fetching data
2. Use consistent color variants for semantic meaning
3. Add `onClick` handlers to make metrics clickable
4. Group related actions using `QuickActionsGroup`
5. Use `ActivityFeedCompact` for sidebar widgets
6. Combine `StatCard` with `sparklineData` for mini trends

## Need Help?

Check these files:
- `README.md` - Full documentation
- `Dashboard.example.jsx` - Working examples
- `src/components/common/` - Related components

Happy building!
