# Badge Component Documentation

A comprehensive badge/tag component system for EVETrade with space/cyberpunk theming.

## Features

- **Multiple Variants**: solid, outline, subtle (background opacity)
- **Multiple Colors**: cyan (default), green (success), red (error), gold (warning), purple, pink, gray
- **Multiple Sizes**: xs, sm, md, lg
- **Optional Dot Indicator**: with pulsing animation for active states
- **Optional Icons**: left or right positioned
- **Optional Close Button**: for removable badges
- **Pill Shape**: fully rounded option
- **Text Truncation**: automatic ellipsis for long text
- **Theme Consistency**: matches EVETrade's space/cyberpunk aesthetic

## Installation

```jsx
import { Badge, StatusBadge, BadgeGroup } from '../components/common/Badge';
// or
import { Badge, StatusBadge, BadgeGroup } from '../components/common';
```

## Basic Usage

### Simple Badge

```jsx
<Badge>Default Badge</Badge>
<Badge color="green">Success</Badge>
<Badge color="red">Error</Badge>
<Badge color="gold">Warning</Badge>
```

### Variants

```jsx
<Badge variant="solid" color="cyan">Solid</Badge>
<Badge variant="outline" color="cyan">Outline</Badge>
<Badge variant="subtle" color="cyan">Subtle</Badge>
```

### Sizes

```jsx
<Badge size="xs">Extra Small</Badge>
<Badge size="sm">Small (default)</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### With Dot Indicator

```jsx
<Badge dot color="green">Online</Badge>
<Badge dot pulse color="green">Live</Badge>
<Badge dot color="gray">Offline</Badge>
```

### With Icons

```jsx
const AlertIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

<Badge icon={<AlertIcon />} color="red">Error</Badge>
<Badge icon={<AlertIcon />} iconPosition="right" color="red">Error</Badge>
```

### Removable Badge

```jsx
const [tags, setTags] = useState(['Tag 1', 'Tag 2', 'Tag 3']);

const removeTag = (index) => {
  setTags(tags.filter((_, i) => i !== index));
};

{tags.map((tag, index) => (
  <Badge key={index} onRemove={() => removeTag(index)}>
    {tag}
  </Badge>
))}
```

### Pill Shape

```jsx
<Badge pill color="cyan">Pill Badge</Badge>
<Badge pill color="purple" dot pulse>Live</Badge>
```

## StatusBadge Component

Pre-configured badges for order/trade status.

### Available Statuses

- `active` - Green with pulse animation
- `pending` - Gold/yellow
- `completed` - Cyan
- `failed` - Red
- `expired` - Gray

### Usage

```jsx
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="completed" />
<StatusBadge status="failed" />
<StatusBadge status="expired" />
```

### Options

```jsx
// Different sizes
<StatusBadge status="active" size="xs" />
<StatusBadge status="active" size="sm" />
<StatusBadge status="active" size="md" />
<StatusBadge status="active" size="lg" />

// Icon only (no label)
<StatusBadge status="active" showLabel={false} />

// Without dot indicator
<StatusBadge status="active" showDot={false} />
```

## BadgeGroup Component

Container for displaying multiple badges with proper spacing.

```jsx
<BadgeGroup>
  <Badge color="cyan">React</Badge>
  <Badge color="purple">Vite</Badge>
  <Badge color="pink">Tailwind</Badge>
</BadgeGroup>

// No wrapping
<BadgeGroup wrap={false}>
  <Badge>Badge 1</Badge>
  <Badge>Badge 2</Badge>
</BadgeGroup>
```

## Props Reference

### Badge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | node | - | Badge content (required) |
| variant | string | 'solid' | Badge variant: 'solid', 'outline', 'subtle' |
| color | string | 'cyan' | Badge color: 'cyan', 'green', 'red', 'gold', 'purple', 'pink', 'gray' |
| size | string | 'sm' | Badge size: 'xs', 'sm', 'md', 'lg' |
| dot | boolean | false | Show dot indicator |
| pulse | boolean | false | Pulse animation for dot (requires dot=true) |
| icon | node | - | Icon component to display |
| iconPosition | string | 'left' | Icon position: 'left', 'right' |
| onRemove | function | - | Remove callback, shows close button when provided |
| pill | boolean | false | Use pill (fully rounded) shape |
| className | string | '' | Additional CSS classes |
| title | string | - | Tooltip text |

### StatusBadge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| status | string | - | Status type: 'active', 'pending', 'completed', 'failed', 'expired' (required) |
| size | string | 'sm' | Badge size: 'xs', 'sm', 'md', 'lg' |
| showLabel | boolean | true | Show status label text |
| showDot | boolean | true | Show dot indicator |
| className | string | '' | Additional CSS classes |

### BadgeGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | node | - | Badge components (required) |
| wrap | boolean | true | Enable flex wrapping |
| className | string | '' | Additional CSS classes |

## Real-World Examples

### Trading Table Row

```jsx
<tr>
  <td>{item.name}</td>
  <td>
    <BadgeGroup>
      <Badge size="xs" color="cyan">High Volume</Badge>
      {item.isProfitable && (
        <Badge size="xs" color="green" dot pulse>Profitable</Badge>
      )}
    </BadgeGroup>
  </td>
</tr>
```

### Order Management

```jsx
<div className="order-card">
  <div className="flex justify-between items-center">
    <h3>Buy Order #{order.id}</h3>
    <StatusBadge status={order.status} />
  </div>
  <div className="flex gap-2 mt-2">
    {order.isUrgent && <Badge color="red" size="xs">Urgent</Badge>}
    {order.isNew && <Badge color="cyan" size="xs">New</Badge>}
  </div>
</div>
```

### Filter Tags

```jsx
const [filters, setFilters] = useState(['Ships', 'Modules', 'Minerals']);

<div className="mb-4">
  <h3 className="text-sm mb-2">Active Filters:</h3>
  <BadgeGroup>
    {filters.map((filter, index) => (
      <Badge
        key={index}
        color="purple"
        variant="outline"
        onRemove={() => setFilters(filters.filter((_, i) => i !== index))}
      >
        {filter}
      </Badge>
    ))}
  </BadgeGroup>
</div>
```

### Live Status Indicator

```jsx
<div className="server-status">
  <Badge dot pulse color={isOnline ? 'green' : 'red'}>
    {isOnline ? 'Server Online' : 'Server Offline'}
  </Badge>
</div>
```

## Design Guidelines

### Color Usage

- **Cyan**: Default, informational, new items
- **Green**: Success, active, online, profitable
- **Red**: Error, failed, critical, offline
- **Gold**: Warning, pending, premium features
- **Purple**: Special features, categories
- **Pink**: Trending, featured, highlights
- **Gray**: Neutral, inactive, disabled, expired

### Size Guidelines

- **xs**: Very compact spaces, table cells, inline content
- **sm**: Default size, general use
- **md**: Prominent features, larger cards
- **lg**: Headers, hero sections, emphasis

### Variant Usage

- **Solid**: Primary badges, important information
- **Outline**: Secondary badges, less emphasis
- **Subtle**: Background badges, categorization

## Accessibility

- All badges include proper color contrast for readability
- Interactive badges (with onRemove) include proper ARIA labels
- StatusBadge includes title attributes for tooltip information
- Icon-only badges should include a title prop for screen readers

```jsx
<Badge title="This trade is currently active" color="green" dot pulse />
<StatusBadge status="active" showLabel={false} /> {/* Automatically includes title */}
```

## Performance

- Badge components are lightweight and optimized for rendering in lists
- Use BadgeGroup for multiple badges to ensure proper spacing
- Icon components are not bundled with the Badge component, reducing bundle size

## Browser Support

Works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties
- SVG rendering
