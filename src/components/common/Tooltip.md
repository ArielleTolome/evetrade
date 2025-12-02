# Tooltip Component

A fully accessible, feature-rich tooltip component for EVETrade with smart positioning, multiple trigger modes, and keyboard support.

## Features

- **Multiple Trigger Modes**: hover, click, focus, or manual control
- **Smart Positioning**: Automatically flips to stay within viewport bounds
- **Keyboard Accessible**: Full keyboard navigation with Escape to dismiss
- **Rich Content Support**: Not limited to text - use any React component
- **Portal Rendering**: Renders via portal to avoid overflow issues
- **Configurable Delay**: Customize hover delay (default 300ms)
- **Controlled & Uncontrolled**: Works both ways
- **Arrow Indicator**: Visual arrow pointing to trigger element

## Basic Usage

```jsx
import { Tooltip } from '@/components/common';

function MyComponent() {
  return (
    <Tooltip content="Helpful text" position="top">
      <button>Hover me</button>
    </Tooltip>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | required | Content to display in tooltip |
| `children` | `ReactElement` | required | Single child element to trigger tooltip |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred position (auto-flips if needed) |
| `trigger` | `'hover' \| 'click' \| 'focus' \| 'manual'` | `'hover'` | How to trigger the tooltip |
| `delay` | `number` | `300` | Delay in ms before showing (hover only) |
| `isOpen` | `boolean` | `undefined` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback when open state changes |
| `disabled` | `boolean` | `false` | Disable the tooltip |
| `className` | `string` | `''` | Additional CSS classes |
| `maxWidth` | `string` | `'250px'` | Maximum width of tooltip |

## Examples

### Rich Content

```jsx
<Tooltip
  content={
    <div>
      <strong className="text-accent-cyan">Trading Tip</strong>
      <p className="text-sm mt-1">
        Station trading requires lower margins but higher volume.
      </p>
    </div>
  }
  position="right"
  maxWidth="300px"
>
  <InfoIcon />
</Tooltip>
```

### Click Trigger

```jsx
<Tooltip content="Click to toggle" trigger="click" position="bottom">
  <button>Click me</button>
</Tooltip>
```

### Controlled Mode

```jsx
const [isOpen, setIsOpen] = useState(false);

<Tooltip
  content="Controlled tooltip"
  isOpen={isOpen}
  onOpenChange={setIsOpen}
>
  <button>Controlled</button>
</Tooltip>
```

### Custom Delay

```jsx
<Tooltip content="Shows immediately" delay={0}>
  <button>No delay</button>
</Tooltip>

<Tooltip content="Shows after 1 second" delay={1000}>
  <button>1s delay</button>
</Tooltip>
```

## Helper Components

### InfoTooltip

Convenient icon-based tooltip for common use cases:

```jsx
import { InfoTooltip } from '@/components/common';

<div className="flex items-center gap-2">
  <span>Margin Percentage</span>
  <InfoTooltip
    content="The difference between buy and sell prices"
    position="right"
  />
</div>
```

### TooltipTrigger

For more complex trigger scenarios (advanced use):

```jsx
import { TooltipTrigger } from '@/components/common';

<TooltipTrigger {...customProps}>
  <CustomComponent />
</TooltipTrigger>
```

## Keyboard Support

| Key | Action |
|-----|--------|
| `Tab` | Navigate to tooltip trigger |
| `Enter`/`Space` | Activate click triggers |
| `Escape` | Close tooltip and return focus to trigger |

## Accessibility

The tooltip component follows WAI-ARIA best practices:

- Uses `role="tooltip"` for screen readers
- Properly associates tooltip with trigger via `aria-describedby`
- Keyboard accessible with focus management
- Escape key dismisses and returns focus
- Respects prefers-reduced-motion

## Design

The tooltip follows EVETrade's space theme:

- Dark background (`bg-space-light`)
- Cyan accent border with glow effect
- Smooth fade-in animation
- Responsive text wrapping
- Small arrow indicator pointing to trigger

## Auto-Positioning

The tooltip automatically flips to stay within the viewport:

- If `position="top"` and not enough space above, flips to bottom
- If `position="right"` and not enough space right, flips to left
- Horizontally centers when possible
- Constrains to viewport with padding

## Performance

- Portal rendering prevents layout thrashing
- Efficient event listeners with proper cleanup
- Debounced position calculations on scroll/resize
- Minimal re-renders with proper memoization

## Browser Support

Works in all modern browsers that support:
- React 18+
- CSS transforms
- Portal rendering
- Position fixed

## Known Limitations

- Single child element required (use wrapper if needed)
- Tooltip content should be relatively small
- Not suitable for complex interactive content (use Modal instead)
- Max-width prevents extremely wide content

## Related Components

- `Modal` - For larger, interactive content
- `Popover` - For richer interactive popovers (future)
- `Toast` - For notifications

## Testing

See `Tooltip.example.jsx` for comprehensive examples and testing scenarios.
