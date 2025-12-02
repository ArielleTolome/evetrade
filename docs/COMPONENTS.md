# Component Documentation

This document describes the reusable components in EVETrade Modern.

## Component Directories

| Directory | Purpose | Count |
|-----------|---------|-------|
| `components/analytics/` | Market analysis visualizations | 8 |
| `components/common/` | Shared UI components | 165+ |
| `components/dashboard/` | Dashboard widgets | 8 |
| `components/forms/` | Form inputs & autocomplete | 7 |
| `components/inventory/` | Inventory management | 8 |
| `components/layout/` | Page layouts | 3 |
| `components/routing/` | Route optimization | 7 |
| `components/tables/` | Data tables | 2 |
| `components/trading/` | Trading-specific components | 25+ |

## Common Components

### GlassmorphicCard

A card component with glassmorphism effect (frosted glass appearance).

```jsx
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';

<GlassmorphicCard className="mb-8" padding="p-6">
  <h2>Card Content</h2>
</GlassmorphicCard>
```

**Props:**
- `children`: React nodes
- `className`: Additional CSS classes
- `padding`: Padding class (default: `"p-6"`)

### SecurityBadge

Displays EVE Online security status with appropriate coloring.

```jsx
import { SecurityBadge } from '../components/common/SecurityBadge';

<SecurityBadge security={0.5} showLabel />
```

**Props:**
- `security`: Number (-1.0 to 1.0)
- `showLabel`: Boolean - show "High-Sec"/"Low-Sec"/"Null-Sec" label
- `size`: `"sm"` | `"md"` | `"lg"`

### LoadingSpinner

Various loading indicators.

```jsx
import { LoadingSpinner, LoadingOverlay, LoadingDots } from '../components/common/LoadingSpinner';

<LoadingSpinner size="lg" />
<LoadingOverlay message="Loading resources..." />
<LoadingDots />
```

### SkeletonLoader

Placeholder loading states.

```jsx
import { SkeletonText, SkeletonTable, SkeletonCard } from '../components/common/SkeletonLoader';

<SkeletonTable rows={10} columns={7} />
<SkeletonCard />
<SkeletonText lines={3} />
```

### Navbar

Main navigation component with theme toggle.

```jsx
import { Navbar } from '../components/common/Navbar';

<Navbar />
```

### Footer

Site footer with links.

```jsx
import { Footer } from '../components/common/Footer';

<Footer />
```

## Form Components

### FormInput

Styled text/number input with optional suffix/prefix.

```jsx
import { FormInput } from '../components/forms';

<FormInput
  label="Minimum Profit"
  type="number"
  value={form.profit}
  onChange={(v) => updateForm('profit', v)}
  suffix="ISK"
  error={errors.profit}
  min={0}
/>
```

**Props:**
- `label`: String - field label
- `type`: `"text"` | `"number"` | `"email"` | etc.
- `value`: Current value
- `onChange`: Function(value)
- `error`: Error message string
- `suffix`: Right-side text (e.g., "ISK", "%")
- `prefix`: Left-side text
- `placeholder`: Placeholder text
- `required`: Boolean
- `disabled`: Boolean
- `min`, `max`, `step`: Number input constraints

### FormSelect

Styled select dropdown.

```jsx
import { FormSelect } from '../components/forms';

<FormSelect
  label="Sales Tax Level"
  value={form.tax}
  onChange={(v) => updateForm('tax', parseFloat(v))}
  options={[
    { value: 0.0375, label: 'Accounting 5 (3.75%)' },
    { value: 0.0450, label: 'Accounting 4 (4.50%)' },
  ]}
/>
```

**Props:**
- `label`: String - field label
- `value`: Current selected value
- `onChange`: Function(value)
- `options`: Array of `{ value, label }`
- `error`: Error message string
- `required`: Boolean
- `disabled`: Boolean

### StationAutocomplete

Searchable station/structure autocomplete.

```jsx
import { StationAutocomplete } from '../components/forms';

<StationAutocomplete
  label="Station"
  value={form.station}
  onChange={(v) => updateForm('station', v)}
  placeholder="Jita IV - Moon 4 - Caldari Navy Assembly Plant"
  error={errors.station}
  required
/>
```

**Props:**
- `label`: String - field label
- `value`: Current selected station name
- `onChange`: Function(stationName)
- `placeholder`: Placeholder text
- `error`: Error message string
- `required`: Boolean
- `disabled`: Boolean

**Features:**
- Shows security status badges
- Marks player structures with asterisk
- Searches both NPC stations and player structures

### RegionAutocomplete

Searchable region autocomplete.

```jsx
import { RegionAutocomplete } from '../components/forms';

<RegionAutocomplete
  label="Origin Region"
  value={form.fromRegion}
  onChange={(v) => updateForm('fromRegion', v)}
  placeholder="The Forge, Domain..."
  excludeRegions={[form.toRegion]}
  required
/>
```

**Props:**
- `label`: String - field label
- `value`: Current selected region name
- `onChange`: Function(regionName)
- `placeholder`: Placeholder text
- `excludeRegions`: Array of region names to hide
- `error`: Error message string
- `required`: Boolean

## Layout Components

### PageLayout

Standard page wrapper with navbar, footer, and background.

```jsx
import { PageLayout } from '../components/layout/PageLayout';

<PageLayout
  title="Station Trading"
  subtitle="Find profitable margins"
>
  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Page content */}
  </div>
</PageLayout>
```

**Props:**
- `title`: Page title (displayed in header)
- `subtitle`: Page subtitle
- `children`: Page content

### AnimatedBackground

Animated star field background.

```jsx
import { AnimatedBackground } from '../components/layout/AnimatedBackground';

<AnimatedBackground />
```

No props - renders fixed position background.

## Table Components

### TradingTable

Full-featured DataTable with export functionality.

```jsx
import { TradingTable } from '../components/tables';

const columns = [
  {
    key: 'Item',
    label: 'Item',
    className: 'font-medium',
  },
  {
    key: 'Profit',
    label: 'Profit',
    type: 'num',
    defaultSort: true,
    render: (data) => formatISK(data, false),
  },
];

<TradingTable
  data={results}
  columns={columns}
  onRowClick={(item) => handleClick(item)}
  defaultSort={{ column: 'Profit', direction: 'desc' }}
  pageLength={25}
  emptyMessage="No trades found"
/>
```

**Props:**
- `data`: Array of data objects
- `columns`: Column configuration array
- `onRowClick`: Function(rowData, rowIndex)
- `defaultSort`: `{ column: string, direction: 'asc'|'desc' }`
- `pageLength`: Initial rows per page (default: 25)
- `className`: Additional CSS classes
- `emptyMessage`: Message when no data

**Column Configuration:**
```js
{
  key: 'columnKey',      // Data object key
  label: 'Column Label', // Header text
  className: '',         // Cell CSS class
  visible: true,         // Show/hide column
  type: 'string',        // 'string' | 'num' for sorting
  defaultSort: false,    // Use as default sort column
  render: (value, row) => value, // Custom render function
}
```

**Features:**
- Export to Copy, CSV, Excel, PDF, Print
- Column visibility toggle
- Search/filter
- Pagination
- Sorting
- Responsive horizontal scroll

## Analytics Components

Located in `src/components/analytics/`:

| Component | Purpose |
|-----------|---------|
| `MarketMomentum.jsx` | Market momentum indicator |
| `PriceProjection.jsx` | Price trend projections |
| `TrendAnalysis.jsx` | Trend detection and visualization |
| `SeasonalTrends.jsx` | Seasonal pattern analysis |
| `CompetitionTracker.jsx` | Competition level monitoring |
| `MarketHealth.jsx` | Market health indicators |
| `ProfitPerHourCalculator.jsx` | ISK/hour calculations |
| `LongTermPredictions.jsx` | Long-term price predictions |

## Dashboard Components

Located in `src/components/dashboard/`:

| Component | Purpose |
|-----------|---------|
| `DataCard.jsx` | Data display card with title and value |
| `StatCard.jsx` | Statistic card with trend indicator |
| `MiniChart.jsx` | Small inline charts |
| `ActivityFeed.jsx` | Recent activity timeline |
| `QuickActions.jsx` | Quick action buttons |
| `ProgressRing.jsx` | Circular progress indicator |
| `DashboardGrid.jsx` | Grid layout for dashboard |
| `SummaryPanel.jsx` | Summary statistics panel |

## Inventory Components

Located in `src/components/inventory/`:

| Component | Purpose |
|-----------|---------|
| `InventoryValuation.jsx` | Portfolio value calculation |
| `DeadStockIdentifier.jsx` | Identify slow-moving inventory |
| `RestockSuggestions.jsx` | Restock recommendations |
| `StockAlertPanel.jsx` | Low stock alerts |
| `AssetsInventory.jsx` | Asset display and management |
| `InventoryValueTracker.jsx` | Track inventory value over time |
| `StockLevelIndicator.jsx` | Visual stock level indicator |
| `InventorySummary.jsx` | Inventory overview |

## Routing Components

Located in `src/components/routing/`:

| Component | Purpose |
|-----------|---------|
| `RouteOptimizer.jsx` | Route optimization interface |
| `CargoOptimizer.jsx` | Cargo capacity optimization |
| `FuelCostCalculator.jsx` | Jump fuel cost calculation |
| `MultiStopPlanner.jsx` | Multi-destination route planning |
| `RouteRiskAssessment.jsx` | Route safety analysis |
| `RouteMap.jsx` | Visual route display |
| `JumpCalculator.jsx` | Jump distance calculator |

## Trading Components

Located in `src/components/trading/`:

| Component | Purpose |
|-----------|---------|
| `BulkOrderCalculator.jsx` | Bulk order calculations |
| `IndustryCalculator.jsx` | Manufacturing profit calculator |
| `OrderBookDepth.jsx` | Order book visualization |
| `RegionalArbitrage.jsx` | Cross-region price comparison |
| `ContractFinder.jsx` | Contract search interface |
| `ManipulationDetector.jsx` | Market manipulation detection |
| `MarginErosionTracker.jsx` | Track margin changes over time |
| `MarketSpreadAnalyzer.jsx` | Spread analysis |
| `OptimalPricing.jsx` | Optimal price suggestions |
| `TaxCalculator.jsx` | Trading tax calculations |
| `ComprehensiveProfitCalculator.jsx` | Full profit breakdown |

## Common Components (Extended)

### UI Elements

| Component | Purpose |
|-----------|---------|
| `Badge.jsx` | Status badges with colors |
| `Button.jsx` | Styled buttons |
| `Card.jsx` | Content card container |
| `Modal.jsx` | Modal dialog |
| `Drawer.jsx` | Side drawer panel |
| `Dropdown.jsx` | Dropdown menu |
| `Tooltip.jsx` | Hover tooltips |
| `Toast.jsx` | Toast notifications |
| `Skeleton.jsx` | Loading skeleton |
| `Tabs.jsx` | Tab navigation |
| `Accordion.jsx` | Collapsible sections |

### Trading UI

| Component | Purpose |
|-----------|---------|
| `TradeRiskScore.jsx` | Risk assessment badge |
| `TradeNotes.jsx` | Trade annotation interface |
| `TradeDecisionCard.jsx` | Quick trade decision UI |
| `QuickDecisionCard.jsx` | Rapid decision interface |
| `PriceAlertPanel.jsx` | Price alert configuration |
| `WatchlistPanel.jsx` | Watchlist management |
| `SmartFilters.jsx` | Advanced filtering |
| `SmartAlerts.jsx` | Alert management |
| `AdvancedSortPanel.jsx` | Multi-column sorting |

### Data Display

| Component | Purpose |
|-----------|---------|
| `PriceCharts.jsx` | Price history charts |
| `Sparkline.jsx` | Inline trend lines |
| `OrderBookPreview.jsx` | Order book summary |
| `CompetitionAnalysis.jsx` | Competition breakdown |
| `MarketHealthDashboard.jsx` | Market health overview |
| `ProfitPerHour.jsx` | ISK/hour display |
| `ProfitTracker.jsx` | Profit tracking over time |
| `VolumeTrend.jsx` | Volume trend indicator |

### Copy & Export

| Component | Purpose |
|-----------|---------|
| `BulkCopyPanel.jsx` | Bulk data copy |
| `OneClickCopy.jsx` | Single-click copy button |
| `TradeClipboard.jsx` | Trade data clipboard |
| `MultibuyExport.jsx` | Multibuy format export |
| `ExportButtons.jsx` | Data export options |

### Alerts & Notifications

| Component | Purpose |
|-----------|---------|
| `ToastProvider.jsx` | Toast notification context |
| `PriceAlert.jsx` | Price alert display |
| `StockAlert.jsx` | Stock level alert |
| `NotificationBadge.jsx` | Notification count badge |
| `AlertBanner.jsx` | Full-width alert banner |

## Component Patterns

### Using Common Components

```jsx
import { Badge, Button, Card, Modal } from '../components/common';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Badge variant="success">Active</Badge>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        Modal content
      </Modal>
    </Card>
  );
}
```

### Using Form Components

```jsx
import { FormInput, FormSelect, StationAutocomplete } from '../components/forms';

function TradingForm() {
  const [form, setForm] = useState({
    station: '',
    minProfit: 1000000,
    tax: 0.08,
  });

  return (
    <form>
      <StationAutocomplete
        label="Station"
        value={form.station}
        onChange={(v) => setForm({ ...form, station: v })}
        required
      />
      <FormInput
        label="Min Profit"
        type="number"
        value={form.minProfit}
        onChange={(v) => setForm({ ...form, minProfit: v })}
        suffix="ISK"
      />
      <FormSelect
        label="Tax Rate"
        value={form.tax}
        onChange={(v) => setForm({ ...form, tax: parseFloat(v) })}
        options={TAX_OPTIONS}
      />
    </form>
  );
}
```

### Using Trading Components

```jsx
import { TradeRiskScore } from '../components/common/TradeRiskScore';
import { OrderBookDepth } from '../components/trading/OrderBookDepth';

function TradeDetails({ trade }) {
  return (
    <div>
      <TradeRiskScore
        volume={trade.volume}
        spread={trade.spread}
        competition={trade.competition}
      />
      <OrderBookDepth
        itemId={trade.itemId}
        regionId={trade.regionId}
      />
    </div>
  );
}
```

## Styling Guidelines

All components use Tailwind CSS with the project's space theme:

```jsx
// Card with glassmorphism
<div className="bg-space-dark/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">

// Primary action button
<button className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-space-black font-semibold rounded-lg">

// Secondary button
<button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20">

// Input field
<input className="w-full px-4 py-2 bg-space-dark/50 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:border-accent-cyan focus:outline-none" />
```
