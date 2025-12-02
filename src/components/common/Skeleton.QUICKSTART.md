# Skeleton Components - Quick Start

## Import

```jsx
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonDashboard,
  SkeletonTradingPage,
} from '@/components/common';
```

## Common Patterns

### Basic Component Loading

```jsx
function MyComponent() {
  const { data, loading } = useApiCall();

  if (loading) {
    return <SkeletonCard />;
  }

  return <DataDisplay data={data} />;
}
```

### Table Loading

```jsx
function DataTable() {
  const { data, loading } = useData();

  if (loading) {
    return (
      <div className="glass p-6">
        <SkeletonTable rows={10} columns={8} />
      </div>
    );
  }

  return <Table data={data} />;
}
```

### Full Page Loading

```jsx
function StationTradingPage() {
  const { data, loading } = useTradingData();

  if (loading) {
    return <SkeletonTradingPage />;
  }

  return <PageContent data={data} />;
}
```

### Dashboard Loading

```jsx
function Dashboard() {
  const { data, loading } = useDashboardData();

  if (loading) {
    return <SkeletonDashboard />;
  }

  return <DashboardContent data={data} />;
}
```

### Custom Composition

```jsx
function UserCard() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="glass p-6">
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="lg" />
          <div className="flex-1 space-y-2">
            <SkeletonText width="60%" />
            <SkeletonText width="40%" />
          </div>
        </div>
      </div>
    );
  }

  return <UserCardContent user={user} />;
}
```

## Component Reference (Quick)

| Component | Use Case | Key Props |
|-----------|----------|-----------|
| `<Skeleton />` | Base component | `width`, `height`, `circle`, `animation` |
| `<SkeletonText />` | Single line text | `width` |
| `<SkeletonParagraph />` | Multiple lines | `lines` |
| `<SkeletonAvatar />` | Circle avatar | `size` ('xs' to '2xl') |
| `<SkeletonButton />` | Button | `size`, `fullWidth` |
| `<SkeletonCard />` | Card | `children` for custom content |
| `<SkeletonTable />` | Table | `rows`, `columns` |
| `<SkeletonChart />` | Chart | `height`, `showLegend` |
| `<SkeletonStat />` | Stat card | - |
| `<SkeletonList />` | List items | `items`, `withAvatar`, `withActions` |
| `<SkeletonForm />` | Form | `fields`, `columns` |
| `<SkeletonGrid />` | Card grid | `items`, `columns` |
| `<SkeletonPage />` | Generic page | - |
| `<SkeletonDashboard />` | Dashboard | - |
| `<SkeletonTradingPage />` | Trading page | - |

## Animation Options

```jsx
// Shimmer (default) - smooth left-to-right shimmer
<SkeletonCard animation="shimmer" />

// Pulse - subtle pulsing effect
<SkeletonCard animation="pulse" />
```

## Pro Tips

1. **Match structure**: Use skeletons that match your component's layout
2. **Progressive loading**: Show skeletons for individual sections
3. **Realistic sizing**: Use appropriate widths (60%, 40%, etc.)
4. **Page-level**: Use pre-built page skeletons for full pages
5. **Dark mode**: Automatically handled, no extra work needed

## Examples by Page Type

### Trading Results Page
```jsx
<SkeletonTradingPage />
```

### Dashboard Page
```jsx
<SkeletonDashboard />
```

### Generic Page with Form and Table
```jsx
<SkeletonPage />
```

### Custom Stats Section
```jsx
<div className="grid md:grid-cols-3 gap-6">
  <SkeletonStat />
  <SkeletonStat />
  <SkeletonStat />
</div>
```

### List with Avatars
```jsx
<SkeletonList items={5} withAvatar={true} />
```

### Multi-Column Form
```jsx
<SkeletonForm fields={6} columns={2} />
```

## Need More Details?

See `/src/components/common/Skeleton.md` for full documentation.
See `/src/components/common/Skeleton.example.jsx` for live examples.
