# Badge Component Quick Start

Quick reference guide for using the Badge component system in EVETrade.

## Installation

```jsx
import { Badge, StatusBadge, BadgeGroup } from '../components/common/Badge';
// or from index
import { Badge, StatusBadge, BadgeGroup } from '../components/common';
```

## Quick Examples

### Basic Usage

```jsx
// Simple badge
<Badge>Default Badge</Badge>

// With colors
<Badge color="green">Success</Badge>
<Badge color="red">Error</Badge>
<Badge color="gold">Warning</Badge>
<Badge color="cyan">Info</Badge>

// Different variants
<Badge variant="solid">Solid</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="subtle">Subtle</Badge>

// Different sizes
<Badge size="xs">Tiny</Badge>
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### Status Indicators

```jsx
// Order/Trade status badges (pre-configured)
<StatusBadge status="active" />     // Green with pulse
<StatusBadge status="pending" />    // Gold
<StatusBadge status="completed" />  // Cyan
<StatusBadge status="failed" />     // Red
<StatusBadge status="expired" />    // Gray

// Icon only
<StatusBadge status="active" showLabel={false} />
```

### With Dot Indicators

```jsx
// Static dot
<Badge dot color="green">Online</Badge>

// Pulsing dot
<Badge dot pulse color="green">Live</Badge>
```

### Removable Badges

```jsx
const [tags, setTags] = useState(['Tag 1', 'Tag 2']);

{tags.map((tag, idx) => (
  <Badge
    key={idx}
    onRemove={() => setTags(tags.filter((_, i) => i !== idx))}
  >
    {tag}
  </Badge>
))}
```

### With Icons

```jsx
const Icon = () => <svg>...</svg>;

<Badge icon={<Icon />}>With Icon</Badge>
<Badge icon={<Icon />} iconPosition="right">Icon Right</Badge>
```

### Badge Groups

```jsx
<BadgeGroup>
  <Badge color="cyan">React</Badge>
  <Badge color="purple">Vite</Badge>
  <Badge color="pink">Tailwind</Badge>
</BadgeGroup>
```

## Common Patterns

### Trading Table Row

```jsx
<td>
  <BadgeGroup>
    <Badge size="xs" color="cyan">High Volume</Badge>
    {profitable && <Badge size="xs" color="green" dot>Profitable</Badge>}
  </BadgeGroup>
</td>
```

### Order Status

```jsx
<div className="flex items-center justify-between">
  <span>Order #{id}</span>
  <StatusBadge status={status} size="sm" />
</div>
```

### Category Tags

```jsx
<BadgeGroup>
  {categories.map(cat => (
    <Badge key={cat} size="xs" color="purple" variant="outline">
      {cat}
    </Badge>
  ))}
</BadgeGroup>
```

### Live Indicator

```jsx
<Badge dot pulse color={isLive ? 'green' : 'gray'}>
  {isLive ? 'Live' : 'Offline'}
</Badge>
```

## Color Guide

| Color | Usage | Example |
|-------|-------|---------|
| cyan | Default, informational, new | `<Badge color="cyan">New</Badge>` |
| green | Success, active, profitable | `<Badge color="green">Active</Badge>` |
| red | Error, failed, critical | `<Badge color="red">Error</Badge>` |
| gold | Warning, pending, premium | `<Badge color="gold">Premium</Badge>` |
| purple | Categories, special features | `<Badge color="purple">Ships</Badge>` |
| pink | Trending, featured | `<Badge color="pink">Trending</Badge>` |
| gray | Neutral, inactive | `<Badge color="gray">Inactive</Badge>` |

## Props Quick Reference

### Badge

| Prop | Type | Default | Options |
|------|------|---------|---------|
| variant | string | 'solid' | solid, outline, subtle |
| color | string | 'cyan' | cyan, green, red, gold, purple, pink, gray |
| size | string | 'sm' | xs, sm, md, lg |
| dot | boolean | false | - |
| pulse | boolean | false | - (requires dot=true) |
| icon | node | - | Any React component |
| iconPosition | string | 'left' | left, right |
| onRemove | function | - | Callback when close clicked |
| pill | boolean | false | - |

### StatusBadge

| Prop | Type | Default | Options |
|------|------|---------|---------|
| status | string | required | active, pending, completed, failed, expired |
| size | string | 'sm' | xs, sm, md, lg |
| showLabel | boolean | true | - |
| showDot | boolean | true | - |

## Files

- `/src/components/common/Badge.jsx` - Main component
- `/src/components/common/Badge.example.jsx` - Component showcase
- `/src/components/common/Badge.integration.example.jsx` - Real-world examples
- `/src/components/common/Badge.test.jsx` - Test suite
- `/src/components/common/Badge.md` - Full documentation
- `/src/components/common/index.js` - Common exports

## Need More?

See `Badge.md` for complete documentation including:
- Accessibility guidelines
- Performance tips
- Advanced usage patterns
- Browser support

See `Badge.example.jsx` for a visual component showcase.
See `Badge.integration.example.jsx` for real-world integration examples.
