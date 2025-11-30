# Component Documentation

This document describes the reusable components in EVETrade Modern.

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
