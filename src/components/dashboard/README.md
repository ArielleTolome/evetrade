# Dashboard Widgets

Reusable dashboard widget components for EVETrade, designed with a space/cyberpunk theme and glassmorphic styling.

## Components

### StatCard

Large number display with label, ideal for showing key metrics.

**Features:**
- Animated number transitions
- Optional trend indicators (up/down arrows with percentage)
- Icons support
- Mini sparkline charts
- Color variants (cyan, gold, green, red, purple)
- Click handlers for drill-down
- Skeleton loading state

**Usage:**
```jsx
import { StatCard } from './components/dashboard';

<StatCard
  label="Total Profit"
  value={15234567}
  format="isk"
  icon="💰"
  variant="green"
  trend={{ direction: 'up', value: 12.5 }}
  sparklineData={[120, 150, 140, 180, 170, 200]}
  onClick={() => console.log('Clicked')}
  description="Last 7 days"
/>
```

**Props:**
- `label` (string): The label text
- `value` (number): The numeric value to display
- `format` (string): Format type: 'number', 'isk', 'percent'
- `icon` (string|ReactNode): Icon to display
- `variant` (string): Color variant: 'cyan', 'gold', 'green', 'red', 'purple'
- `trend` (object): { direction: 'up'|'down', value: number }
- `onClick` (function): Click handler
- `description` (string): Optional description text
- `sparklineData` (array): Data for mini sparkline
- `loading` (boolean): Show skeleton loading state
- `className` (string): Additional CSS classes

---

### MiniChart

Sparkline and bar chart component for visualizing data trends.

**Features:**
- Line, area, and bar chart types
- Hover tooltips
- Responsive sizing
- Custom value formatting
- Multiple color variants

**Usage:**
```jsx
import { MiniChart } from './components/dashboard';

<MiniChart
  data={[120, 150, 140, 180, 170, 200]}
  type="area"
  color="cyan"
  height="h-24"
  showTooltip={true}
  formatValue={(v) => `${v.toLocaleString()} ISK`}
/>

// With labeled data
<MiniChart
  data={[
    { value: 1200, label: 'Mon' },
    { value: 1900, label: 'Tue' },
    { value: 1500, label: 'Wed' },
  ]}
  type="bar"
  color="green"
/>
```

**Props:**
- `data` (array): Array of numbers or objects with {value, label}
- `type` (string): Chart type: 'line', 'area', 'bar'
- `color` (string): Color variant: 'cyan', 'gold', 'green', 'red', 'purple'
- `height` (string): Height class (e.g., 'h-16', 'h-24')
- `showTooltip` (boolean): Show value on hover
- `formatValue` (function): Custom value formatter
- `className` (string): Additional CSS classes

---

### ProgressRing

Circular progress indicator with animated fill.

**Features:**
- Animated fill on mount
- Percentage display in center
- Custom center content
- Configurable colors and sizes
- Label support

**Usage:**
```jsx
import { ProgressRing, ProgressRingGroup } from './components/dashboard';

<ProgressRing
  percentage={75}
  size="lg"
  color="cyan"
  label="Completion"
  animate={true}
/>

// Multiple rings
<ProgressRingGroup
  rings={[
    { percentage: 75, color: 'cyan', label: 'Trades' },
    { percentage: 92, color: 'green', label: 'Profit' },
    { percentage: 100, color: 'gold', label: 'Orders', centerContent: '✓' },
  ]}
/>
```

**Props:**
- `percentage` (number): Progress percentage (0-100)
- `size` (string): Size variant: 'sm', 'md', 'lg', 'xl'
- `color` (string): Color variant: 'cyan', 'gold', 'green', 'red', 'purple'
- `strokeWidth` (number): Width of the progress ring
- `animate` (boolean): Animate the fill on mount
- `showPercentage` (boolean): Show percentage text in center
- `centerContent` (string|ReactNode): Custom center content
- `label` (string): Label text below the ring
- `className` (string): Additional CSS classes

---

### DataCard

Card with header, content, and optional footer, supporting various states.

**Features:**
- Collapsible content
- Refresh button
- Loading state with spinner
- Error state with retry
- Header actions
- Footer support
- Color variants

**Usage:**
```jsx
import { DataCard } from './components/dashboard';

<DataCard
  title="Trading Summary"
  subtitle="Last 24 hours"
  collapsible={true}
  refreshable={true}
  onRefresh={async () => await fetchData()}
  variant="cyan"
  loading={false}
  error={false}
  footer={<div>Last updated: 2 minutes ago</div>}
>
  <p>Your content here</p>
</DataCard>

// With error state
<DataCard
  title="Failed to Load"
  error={true}
  errorMessage="Unable to fetch market data"
  onRetry={() => retryFetch()}
>
  Content
</DataCard>
```

**Props:**
- `title` (string): Card title
- `subtitle` (string|ReactNode): Optional subtitle
- `children` (ReactNode): Card content
- `footer` (ReactNode): Optional footer content
- `actions` (ReactNode): Optional header actions
- `collapsible` (boolean): Enable collapse functionality
- `defaultCollapsed` (boolean): Initial collapsed state
- `refreshable` (boolean): Show refresh button
- `onRefresh` (function): Refresh callback
- `loading` (boolean): Loading state
- `error` (boolean): Error state
- `errorMessage` (string): Error message text
- `onRetry` (function): Retry callback
- `variant` (string): Color variant: 'default', 'cyan', 'gold', 'green', 'red', 'purple'
- `className` (string): Additional CSS classes

---

### QuickActions

Grid of action buttons with icons and keyboard shortcuts.

**Features:**
- Grid or list layout
- Keyboard shortcuts display
- Hover effects
- Disabled states
- Color variants
- Responsive columns

**Usage:**
```jsx
import { QuickActions, QuickActionsGroup } from './components/dashboard';

<QuickActions
  actions={[
    {
      id: 'station',
      label: 'Station Trading',
      icon: '🏪',
      onClick: () => handleAction(),
      shortcut: 'Alt+S',
      color: 'cyan',
      description: 'Trade at a single station',
    },
    {
      id: 'hauling',
      label: 'Region Hauling',
      icon: '🚀',
      onClick: () => handleAction(),
      shortcut: 'Alt+H',
      color: 'gold',
      disabled: true,
    },
  ]}
  layout="grid"
  columns={3}
  size="md"
  showShortcuts={true}
/>

// Grouped actions
<QuickActionsGroup
  groups={[
    {
      title: 'Trading',
      actions: tradingActions,
      columns: 2,
    },
    {
      title: 'Management',
      actions: managementActions,
      columns: 4,
      size: 'sm',
    },
  ]}
/>
```

**Props:**
- `actions` (array): Array of action objects
  - `id` (string): Unique identifier
  - `label` (string): Button label
  - `icon` (string|ReactNode): Icon
  - `onClick` (function): Click handler
  - `shortcut` (string): Keyboard shortcut (e.g., 'Alt+S')
  - `disabled` (boolean): Disabled state
  - `color` (string): Color variant
  - `description` (string): Optional description
- `layout` (string): Layout variant: 'grid', 'list'
- `columns` (number): Grid columns (2, 3, 4, 5, 6)
- `size` (string): Size variant: 'sm', 'md', 'lg'
- `showShortcuts` (boolean): Display keyboard shortcuts
- `className` (string): Additional CSS classes

---

### ActivityFeed

List of recent activities with timestamps and pagination.

**Features:**
- Activity type icons
- Relative timestamps
- Links to related items
- Metadata display
- Load more pagination
- Compact variant
- Loading skeleton

**Usage:**
```jsx
import { ActivityFeed, ActivityFeedCompact } from './components/dashboard';

<ActivityFeed
  activities={[
    {
      id: 1,
      type: 'profit',
      title: 'High profit trade executed',
      description: 'Tritanium sold for 15.2M ISK profit',
      timestamp: Date.now() - 5 * 60 * 1000,
      link: '#trade-1',
      metadata: { margin: '23%', volume: '150' },
      icon: '💰',
    },
    {
      id: 2,
      type: 'alert',
      title: 'Price alert triggered',
      description: 'PLEX price dropped below threshold',
      timestamp: Date.now() - 15 * 60 * 1000,
      onClick: () => console.log('Clicked'),
    },
  ]}
  pageSize={10}
  showLoadMore={true}
  onLoadMore={() => fetchMore()}
  hasMore={true}
/>

// Compact version
<ActivityFeedCompact
  activities={activities}
  maxItems={5}
/>
```

**Props:**
- `activities` (array): Array of activity objects
  - `id` (string|number): Unique identifier
  - `type` (string): Activity type: 'trade', 'alert', 'profit', 'loss', 'warning', 'info', 'success', 'error', 'update', 'default'
  - `title` (string): Activity title
  - `description` (string): Description text
  - `timestamp` (number): Unix timestamp
  - `link` (string): Optional link URL
  - `onClick` (function): Click handler (overrides link)
  - `metadata` (object): Key-value pairs to display
  - `icon` (string|ReactNode): Custom icon (overrides type icon)
- `pageSize` (number): Items per page
- `showLoadMore` (boolean): Show load more button
- `onLoadMore` (function): Load more callback
- `loading` (boolean): Loading state
- `hasMore` (boolean): Whether more items available
- `emptyMessage` (string): Message when no activities
- `className` (string): Additional CSS classes

---

## Design System

All components follow the EVETrade design system:

### Colors
- **Cyan** (`accent-cyan`): Primary actions, information
- **Gold** (`accent-gold`): Warnings, important metrics
- **Green** (`accent-green`): Success, profit, positive trends
- **Red** (`red-400`): Errors, loss, negative trends
- **Purple** (`accent-purple`): Special features, highlights

### Sizes
- **sm**: Small, compact displays
- **md**: Default size
- **lg**: Large, emphasis displays
- **xl**: Extra large, hero displays

### Animation
- Smooth transitions (200-300ms)
- Easing: cubic ease-out
- Hover effects: scale, glow, border changes
- Loading: pulse, spin animations

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliant
- Loading and error states clearly indicated

---

## Best Practices

1. **Loading States**: Always provide loading prop when data is being fetched
2. **Error Handling**: Use error state with retry callback for failed operations
3. **Responsive Design**: Components are mobile-first, test on all breakpoints
4. **Performance**: Use React.memo for components that re-render frequently
5. **Consistency**: Stick to the color variants for semantic meaning

## Examples

See `Dashboard.example.jsx` for comprehensive usage examples of all components.

## Dependencies

These components use:
- React 19
- Tailwind CSS
- EVETrade utility functions (`formatters.js`)
- GlassmorphicCard component
- LoadingSpinner component
