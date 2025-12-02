# Skeleton Loading Components

Comprehensive skeleton loading components for EVETrade with shimmer animation support.

## Overview

The Skeleton component library provides a full suite of loading placeholders that match the design system and can be used throughout the application to improve perceived performance and provide better user feedback during data loading.

## Files

- `/src/components/common/Skeleton.jsx` - Main component library (531 lines)
- `/src/components/common/Skeleton.example.jsx` - Usage examples and documentation (393 lines)
- Exported from `/src/components/common/index.js`

## Components

### Base Components

#### `<Skeleton />`
The foundational skeleton component with maximum flexibility.

```jsx
import { Skeleton } from '@/components/common';

// Basic usage
<Skeleton width={200} height={20} />

// Circle variant
<Skeleton circle size={40} />

// With pulse animation
<Skeleton width="100%" height={60} animation="pulse" />

// Custom rounded corners
<Skeleton width="75%" height={60} rounded="xl" />
```

**Props:**
- `width`: number | string - Width in px or CSS value
- `height`: number | string - Height in px or CSS value
- `circle`: boolean - Render as circle
- `size`: number | string - Size for circle variant
- `animation`: 'shimmer' | 'pulse' - Animation type (default: 'shimmer')
- `variant`: 'default' | 'text' | 'title' | 'subtitle' | 'button' | 'input' | 'card' | 'avatar'
- `rounded`: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `className`: string - Additional CSS classes

### Pre-built Components

#### `<SkeletonText />`
Single line text placeholder with configurable width.

```jsx
<SkeletonText width="60%" />
<SkeletonText width={200} />
```

**Props:**
- `width`: string (default: '100%')
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonParagraph />`
Multiple lines of text with last line shorter.

```jsx
<SkeletonParagraph lines={3} />
<SkeletonParagraph lines={5} animation="pulse" />
```

**Props:**
- `lines`: number (default: 3)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonAvatar />`
Circular avatar placeholder with size variants.

```jsx
<SkeletonAvatar size="md" />
<SkeletonAvatar size="lg" />
```

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' (default: 'md')
  - xs: 24px, sm: 32px, md: 40px, lg: 56px, xl: 72px, 2xl: 96px
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonButton />`
Button placeholder with size variants.

```jsx
<SkeletonButton size="md" />
<SkeletonButton size="lg" fullWidth />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `fullWidth`: boolean (default: false)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonCard />`
Card placeholder with optional custom content.

```jsx
// Default card with title, text, and buttons
<SkeletonCard />

// Custom card content
<SkeletonCard>
  <SkeletonAvatar size="lg" />
  <SkeletonText />
  <SkeletonParagraph lines={2} />
</SkeletonCard>
```

**Props:**
- `children`: ReactNode - Custom card content
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonTable />`
Table with configurable rows and columns.

```jsx
<SkeletonTable rows={5} columns={6} />
<SkeletonTable rows={10} columns={8} showHeader={true} />
```

**Props:**
- `rows`: number (default: 5)
- `columns`: number (default: 6)
- `showHeader`: boolean (default: true)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonChart />`
Chart placeholder with legend and bar effect.

```jsx
<SkeletonChart height={300} showLegend={true} />
```

**Props:**
- `height`: number (default: 300)
- `showLegend`: boolean (default: true)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonStat />`
Stat card placeholder for dashboard statistics.

```jsx
<SkeletonStat />

// Grid of stats
<div className="grid md:grid-cols-3 gap-6">
  <SkeletonStat />
  <SkeletonStat />
  <SkeletonStat />
</div>
```

**Props:**
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonList />`
List items with optional avatars and actions.

```jsx
<SkeletonList items={5} />
<SkeletonList items={3} withAvatar={true} />
<SkeletonList items={4} withAvatar={true} withActions={true} />
```

**Props:**
- `items`: number (default: 5)
- `withAvatar`: boolean (default: false)
- `withActions`: boolean (default: false)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonForm />`
Form with labels and input fields.

```jsx
<SkeletonForm fields={6} columns={1} />
<SkeletonForm fields={6} columns={2} showSubmit={true} />
<SkeletonForm fields={9} columns={3} />
```

**Props:**
- `fields`: number (default: 6)
- `columns`: 1 | 2 | 3 (default: 1)
- `showSubmit`: boolean (default: true)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonGrid />`
Grid of card placeholders.

```jsx
<SkeletonGrid items={6} columns={3} />
<SkeletonGrid items={8} columns={4} />
```

**Props:**
- `items`: number (default: 6)
- `columns`: 1 | 2 | 3 | 4 (default: 3)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonTabs />`
Tabbed interface placeholder.

```jsx
<SkeletonTabs tabs={3} />
```

**Props:**
- `tabs`: number (default: 3)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonHeader />`
Page header with optional breadcrumbs.

```jsx
<SkeletonHeader showBreadcrumbs={true} />
<SkeletonHeader showBreadcrumbs={false} />
```

**Props:**
- `showBreadcrumbs`: boolean (default: true)
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonModal />`
Modal dialog placeholder.

```jsx
<SkeletonModal />
```

**Props:**
- `className`: string
- `animation`: 'shimmer' | 'pulse'

### Page-Level Components

#### `<SkeletonPage />`
Full page skeleton with header, form, and table.

```jsx
function MyPage() {
  const { data, loading } = usePageData();

  if (loading) {
    return <SkeletonPage />;
  }

  return <PageContent data={data} />;
}
```

**Props:**
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonDashboard />`
Dashboard layout with stats, chart, and table.

```jsx
function Dashboard() {
  const { data, loading } = useDashboardData();

  if (loading) {
    return <SkeletonDashboard />;
  }

  return <DashboardContent data={data} />;
}
```

**Props:**
- `className`: string
- `animation`: 'shimmer' | 'pulse'

#### `<SkeletonTradingPage />`
EVETrade-specific trading page layout.

```jsx
function StationTradingPage() {
  const { data, loading } = useTradingData();

  if (loading) {
    return <SkeletonTradingPage />;
  }

  return <TradingPageContent data={data} />;
}
```

**Props:**
- `animation`: 'shimmer' | 'pulse'

## Animations

### Shimmer (Default)
A smooth left-to-right shimmer effect using CSS gradients and keyframes.

```jsx
<Skeleton animation="shimmer" />
```

### Pulse
A subtle pulsing effect using Tailwind's `animate-pulse`.

```jsx
<Skeleton animation="pulse" />
```

## Design System Integration

### Colors
- **Light Mode**: Gray gradients (200 → 300 → 200)
- **Dark Mode**: Space theme colors (space-mid/50 → space-light/50 → space-mid/50)

### Animations
- Uses Tailwind's `animate-shimmer` from config (2s linear infinite)
- Background gradient with 400% width for smooth shimmer effect

### Rounded Corners
- Matches component design: `rounded-md` for most, `rounded-lg` for cards, `rounded-full` for avatars

## Usage Examples

### Loading States

```jsx
import { SkeletonTable, SkeletonCard } from '@/components/common';

function TradingResults() {
  const { data, loading } = useTradingData();

  if (loading) {
    return (
      <div className="glass p-6">
        <SkeletonTable rows={10} columns={8} />
      </div>
    );
  }

  return <TradingTable data={data} />;
}
```

### Composed Layouts

```jsx
function UserProfile() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="glass p-6">
        <div className="flex items-center gap-4 mb-6">
          <SkeletonAvatar size="xl" />
          <div className="flex-1 space-y-2">
            <SkeletonText width="40%" />
            <SkeletonText width="60%" />
          </div>
        </div>
        <SkeletonParagraph lines={4} />
        <div className="flex gap-2 mt-4">
          <SkeletonButton />
          <SkeletonButton />
        </div>
      </div>
    );
  }

  return <UserProfileContent user={user} />;
}
```

### Dashboard Layout

```jsx
function TradingDashboard() {
  const { stats, charts, trades, loading } = useDashboardData();

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <StatsGrid stats={stats} />
      <ChartSection data={charts} />
      <TradesTable data={trades} />
    </div>
  );
}
```

### Progressive Loading

```jsx
function DataView() {
  const { stats, loading: statsLoading } = useStats();
  const { data, loading: dataLoading } = useData();

  return (
    <div className="space-y-6">
      {/* Stats load first */}
      {statsLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
      ) : (
        <StatsGrid stats={stats} />
      )}

      {/* Data loads separately */}
      {dataLoading ? (
        <SkeletonTable rows={10} columns={6} />
      ) : (
        <DataTable data={data} />
      )}
    </div>
  );
}
```

## Best Practices

### 1. Match Component Structure
Use skeleton components that match the structure of the actual content:

```jsx
// Good: Matches the actual component structure
if (loading) {
  return (
    <SkeletonCard>
      <SkeletonAvatar size="lg" />
      <SkeletonText />
      <SkeletonParagraph lines={2} />
    </SkeletonCard>
  );
}

// Avoid: Generic skeleton that doesn't match
if (loading) {
  return <div className="animate-pulse h-32 bg-gray-200" />;
}
```

### 2. Use Appropriate Sizes
Choose skeleton sizes that approximate the actual content:

```jsx
// Good: Realistic sizes
<SkeletonText width="60%" />
<SkeletonText width="40%" />

// Avoid: Full width for everything
<SkeletonText width="100%" />
<SkeletonText width="100%" />
```

### 3. Show Structure Early
Display the page structure immediately, even before API calls:

```jsx
function Page() {
  const [loading, setLoading] = useState(true);

  // Structure visible immediately
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1>Trading Dashboard</h1>
      {loading ? <SkeletonDashboard /> : <DashboardContent />}
    </div>
  );
}
```

### 4. Use Page-Level Skeletons for Simplicity
For full pages, use the pre-built page skeletons:

```jsx
// Good: Simple and consistent
if (loading) return <SkeletonTradingPage />;

// Avoid: Recreating the layout manually every time
if (loading) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SkeletonHeader />
      <SkeletonForm />
      <SkeletonTable />
    </div>
  );
}
```

### 5. Consider Animation Choice
- Use `shimmer` (default) for most cases - it's more engaging
- Use `pulse` for simpler, less distracting loading states

```jsx
// High-attention area: use shimmer
<SkeletonCard animation="shimmer" />

// Background data: use pulse
<SkeletonList animation="pulse" />
```

## Compatibility

### Existing SkeletonLoader.jsx
The new Skeleton components extend and improve the existing `SkeletonLoader.jsx`:

- `SkeletonPage` and `SkeletonTable` are re-implemented with more features
- Old components remain backward compatible
- Consider migrating to new components for enhanced features

### Migration Path
```jsx
// Old
import { Skeleton, SkeletonTable } from './SkeletonLoader';

// New
import { Skeleton, SkeletonTable } from '@/components/common';
// Or
import { Skeleton, SkeletonTable } from './Skeleton';
```

## Performance

- Minimal re-renders: No state or props changes during animation
- CSS-only animations: No JavaScript calculations
- Lightweight: 16KB component file, tree-shakeable exports
- Works with React 19's concurrent features

## Dark Mode

All skeleton components automatically adapt to dark mode using Tailwind's `dark:` variants:

- **Light Mode**: Gray base with lighter shimmer
- **Dark Mode**: Space-themed colors matching the app's design system

No additional configuration needed - dark mode works automatically.

## Accessibility

- Uses semantic HTML structure
- No interactive elements (loading state only)
- Proper contrast ratios in both light and dark modes
- Screen readers announce content as loading (via parent component context)

## Browser Support

- Modern browsers with CSS gradient and animation support
- Fallback: Static gray boxes (still functional without animations)
- Tested on: Chrome, Firefox, Safari, Edge

## Related Components

- `LoadingSpinner` - For inline or centered loading indicators
- `EmptyState` - For no-data states after loading completes
- `ProgressBar` - For determinate loading progress

## Future Enhancements

Potential improvements for future versions:

1. Skeleton variants for specific EVE Online components (market graphs, ship cards)
2. Configurable shimmer speed and direction
3. Content-aware skeletons that adapt to viewport size
4. Skeleton state persistence across navigation
5. A11y improvements with loading announcements
