# EVETrade Animation & Micro-Interaction Guide

This guide provides comprehensive documentation for the animation system and micro-interactions available in the EVETrade application.

## Overview

The EVETrade animation system features:
- **Subtle, professional animations** that match the space/cyberpunk theme
- **Performance-optimized** using CSS animations and transforms
- **Reusable React components** for complex animations
- **CSS utility classes** for quick, simple effects
- **Accessibility-friendly** with reduced motion support

---

## Table of Contents

1. [React Transition Components](#react-transition-components)
2. [CSS Utility Classes](#css-utility-classes)
3. [Tailwind Animation Classes](#tailwind-animation-classes)
4. [Best Practices](#best-practices)
5. [Performance Tips](#performance-tips)

---

## React Transition Components

Located in `/src/components/common/Transitions.jsx`, these components provide rich, configurable animations.

### FadeIn

Fade animation with optional direction.

```jsx
import { FadeIn } from '@/components/common/Transitions';

<FadeIn direction="up" duration={600} delay={100}>
  <div>Your content</div>
</FadeIn>
```

**Props:**
- `direction`: `'up'` | `'down'` | `'left'` | `'right'` | `null` (default: `null`)
- `duration`: Animation duration in ms (default: `600`)
- `delay`: Animation delay in ms (default: `0`)
- `show`: Control visibility (default: `true`)
- `className`: Additional CSS classes

**Use Cases:**
- Introducing page content
- Revealing cards or sections
- Smooth page transitions

---

### SlideIn

Slide animation from any direction.

```jsx
import { SlideIn } from '@/components/common/Transitions';

<SlideIn direction="left" duration={400}>
  <div>Your content</div>
</SlideIn>
```

**Props:**
- `direction`: `'up'` | `'down'` | `'left'` | `'right'` (default: `'up'`)
- `duration`: Animation duration in ms (default: `400`)
- `delay`: Animation delay in ms (default: `0`)
- `show`: Control visibility (default: `true`)
- `className`: Additional CSS classes

**Use Cases:**
- Navigation panels
- Sidebar menus
- Notification toasts

---

### ScaleIn

Scale up animation from center.

```jsx
import { ScaleIn } from '@/components/common/Transitions';

<ScaleIn duration={300} delay={50}>
  <button>Click Me</button>
</ScaleIn>
```

**Props:**
- `duration`: Animation duration in ms (default: `300`)
- `delay`: Animation delay in ms (default: `0`)
- `show`: Control visibility (default: `true`)
- `className`: Additional CSS classes

**Use Cases:**
- Modal dialogs
- Tooltips
- Popups

---

### BounceIn

Playful bounce animation for attention.

```jsx
import { BounceIn } from '@/components/common/Transitions';

<BounceIn duration={500}>
  <div className="badge">New!</div>
</BounceIn>
```

**Props:**
- `duration`: Animation duration in ms (default: `500`)
- `delay`: Animation delay in ms (default: `0`)
- `show`: Control visibility (default: `true`)
- `className`: Additional CSS classes

**Use Cases:**
- Badges and notifications
- Success messages
- Highlighting new features

---

### StaggeredList

Animate list items in sequence.

```jsx
import { StaggeredList } from '@/components/common/Transitions';

<StaggeredList
  staggerDelay={100}
  animation="fade-up"
  className="space-y-3"
>
  {items.map(item => (
    <TradeCard key={item.id} data={item} />
  ))}
</StaggeredList>
```

**Props:**
- `staggerDelay`: Delay between items in ms (default: `50`)
- `initialDelay`: Delay before first item in ms (default: `0`)
- `animation`: `'fade-up'` | `'slide-up'` | `'scale'` | `'bounce'` (default: `'fade-up'`)
- `show`: Control visibility (default: `true`)
- `className`: Container CSS classes
- `itemClassName`: CSS classes for each item

**Use Cases:**
- Trade results lists
- Navigation menus
- Dashboard cards

---

### Collapse

Height animation for accordions.

```jsx
import { Collapse } from '@/components/common/Transitions';

const [isOpen, setIsOpen] = useState(false);

<Collapse isOpen={isOpen} duration={300}>
  <div>Collapsible content</div>
</Collapse>
```

**Props:**
- `isOpen`: Whether content is expanded (required)
- `duration`: Animation duration in ms (default: `300`)
- `className`: Additional CSS classes

**Use Cases:**
- Accordions
- Expandable sections
- FAQ items
- Filter panels

---

### Shake

Shake animation for errors and attention.

```jsx
import { Shake } from '@/components/common/Transitions';

const [hasError, setHasError] = useState(false);

<Shake trigger={hasError} duration={400}>
  <input type="text" />
</Shake>
```

**Props:**
- `trigger`: Boolean to trigger animation
- `duration`: Animation duration in ms (default: `400`)
- `className`: Additional CSS classes

**Use Cases:**
- Form validation errors
- Invalid inputs
- Warning messages

---

### CountUp

Number count-up animation.

```jsx
import { CountUp } from '@/components/common/Transitions';

<CountUp
  value={1234567}
  duration={1000}
  decimals={0}
  prefix=""
  suffix=" ISK"
/>
```

**Props:**
- `value`: Target number (required)
- `duration`: Animation duration in ms (default: `1000`)
- `decimals`: Decimal places (default: `0`)
- `prefix`: String before number (default: `''`)
- `suffix`: String after number (default: `''`)
- `formatter`: Custom formatter function
- `className`: Additional CSS classes

**Use Cases:**
- Dashboard statistics
- Profit displays
- Trade counters

---

### PresenceTransition

Animate mount/unmount with different animations.

```jsx
import { PresenceTransition } from '@/components/common/Transitions';

const [show, setShow] = useState(false);

<PresenceTransition
  show={show}
  enter="animate-fade-in-up"
  exit="animate-fade-out"
  duration={300}
>
  <Modal />
</PresenceTransition>
```

**Props:**
- `show`: Whether to show content (required)
- `enter`: Enter animation class (default: `'animate-fade-in-up'`)
- `exit`: Exit animation class (default: `'animate-fade-out'`)
- `duration`: Animation duration in ms (default: `300`)
- `className`: Additional CSS classes

**Use Cases:**
- Modals
- Dropdowns
- Conditional content

---

### Pulsate

Continuous pulsating animation.

```jsx
import { Pulsate } from '@/components/common/Transitions';

<Pulsate type="glow" active={true}>
  <div className="notification-dot" />
</Pulsate>
```

**Props:**
- `type`: `'scale'` | `'glow'` | `'opacity'` (default: `'glow'`)
- `active`: Whether animation is active (default: `true`)
- `className`: Additional CSS classes

**Use Cases:**
- Notification indicators
- Loading states
- Active status indicators

---

### Lift

Lift effect on hover.

```jsx
import { Lift } from '@/components/common/Transitions';

<Lift>
  <div className="card">Card content</div>
</Lift>
```

**Use Cases:**
- Interactive cards
- Clickable panels
- Hoverable items

---

### Press

Button press effect on click.

```jsx
import { Press } from '@/components/common/Transitions';

<Press>
  <button>Click Me</button>
</Press>
```

**Use Cases:**
- Buttons
- Interactive elements
- Clickable icons

---

## CSS Utility Classes

These classes can be applied directly to elements for quick effects.

### Button Press Effect

```html
<button class="btn-primary btn-press">
  Submit
</button>
```

Scales down slightly when clicked (0.97x scale).

---

### Link Underline Animation

```html
<a href="#" class="link-underline text-accent-cyan">
  Learn More
</a>
```

Animated underline that slides in from left on hover.

---

### Card Lift Effect

```html
<div class="card-lift glass-panel p-6">
  Card content
</div>
```

Lifts card up with cyan shadow on hover.

---

### Input Focus Glow

```html
<input type="text" class="input-glow" />
```

Adds glowing cyan ring on focus.

---

### Ripple Effect

```html
<button class="ripple btn-secondary">
  Click Me
</button>
```

Material-design style ripple on click.

---

### Stagger Delays

```html
<div class="stagger-1">Item 1</div>
<div class="stagger-2">Item 2</div>
<div class="stagger-3">Item 3</div>
```

Classes: `.stagger-1` through `.stagger-8` (50ms increments)

---

### Transitions

```html
<div class="transition-smooth">Smooth transition</div>
<div class="transition-spring">Spring transition</div>
```

- `.transition-smooth`: Standard easing (cubic-bezier(0.4, 0, 0.2, 1))
- `.transition-spring`: Bouncy easing (cubic-bezier(0.34, 1.56, 0.64, 1))

---

### Hover Scale

```html
<div class="hover-scale">Scale 1.05</div>
<div class="hover-scale-sm">Scale 1.02</div>
```

- `.hover-scale`: 1.05x scale on hover
- `.hover-scale-sm`: 1.02x scale on hover

---

### Glow Effects

```html
<div class="glow-cyan">Cyan glow</div>
<div class="glow-cyan-lg">Large cyan glow</div>
<div class="glow-purple">Purple glow</div>
<div class="glow-gold">Gold glow</div>
```

Adds subtle colored box-shadow.

---

### Border Glow

```html
<div class="border-glow glass-panel">
  Hover for animated border
</div>
```

Animated gradient border appears on hover.

---

### Pulse Ring

```html
<div class="pulse-ring w-3 h-3 bg-accent-cyan rounded-full">
</div>
```

Expanding ring animation for notifications.

---

## Tailwind Animation Classes

Use these classes directly in your JSX:

### Core Animations

```html
<div class="animate-fade-in">Fade in</div>
<div class="animate-fade-in-up">Fade in from bottom</div>
<div class="animate-fade-in-down">Fade in from top</div>
<div class="animate-slide-up">Slide up</div>
<div class="animate-slide-in-left">Slide from left</div>
<div class="animate-slide-in-right">Slide from right</div>
<div class="animate-scale-in">Scale in</div>
<div class="animate-bounce-in">Bounce in</div>
```

### Special Effects

```html
<div class="animate-press">Press effect</div>
<div class="animate-lift">Lift effect</div>
<div class="animate-shake">Shake</div>
<div class="animate-glow-pulse">Glowing pulse</div>
<div class="animate-count-up">Count up</div>
```

### Existing Animations

```html
<div class="animate-twinkle">Star twinkle</div>
<div class="animate-float">Floating</div>
<div class="animate-glow">Glow effect</div>
<div class="animate-shimmer">Loading shimmer</div>
<div class="animate-pulse-slow">Slow pulse</div>
```

---

## Best Practices

### 1. Use Subtle Animations

Keep animations fast and subtle. The EVETrade theme is professional, not playful.

```jsx
// Good: Quick, subtle
<FadeIn duration={400}>

// Avoid: Too slow, distracting
<FadeIn duration={2000}>
```

### 2. Stagger List Items

For lists, use staggered animations for a polished feel:

```jsx
<StaggeredList staggerDelay={50} animation="fade-up">
  {items.map(item => <Item key={item.id} {...item} />)}
</StaggeredList>
```

### 3. Respect Reduced Motion

Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. Use Appropriate Timing

| Animation Type | Recommended Duration |
|---------------|---------------------|
| Micro-interactions (button press, hover) | 150-200ms |
| Content transitions (fade, slide) | 300-400ms |
| Page transitions | 400-600ms |
| Count-ups and complex animations | 800-1200ms |

### 5. Combine Effects

Combine animations for richer experiences:

```jsx
<Lift>
  <Press>
    <button className="btn-primary">
      Submit Trade
    </button>
  </Press>
</Lift>
```

### 6. Don't Overuse

Not everything needs to animate. Use animations to:
- Guide user attention
- Provide feedback
- Show relationships
- Indicate state changes

---

## Performance Tips

### 1. Use CSS Transforms

Prefer `transform` and `opacity` for animations (GPU-accelerated):

```css
/* Good - GPU accelerated */
transform: translateY(-4px);
opacity: 0.5;

/* Avoid - forces layout recalculation */
top: -4px;
visibility: hidden;
```

### 2. Avoid Animating Expensive Properties

Don't animate these properties:
- `width`, `height`
- `margin`, `padding`
- `border-width`
- `box-shadow` (use sparingly)

### 3. Use `will-change` Sparingly

Only for complex animations that need optimization:

```css
.complex-animation {
  will-change: transform, opacity;
}
```

Remove after animation completes.

### 4. Batch Animations

Use `StaggeredList` instead of individual delays:

```jsx
// Good - optimized
<StaggeredList>
  {items.map(item => <Item key={item.id} />)}
</StaggeredList>

// Avoid - creates many timers
{items.map((item, i) => (
  <FadeIn key={item.id} delay={i * 100}>
    <Item />
  </FadeIn>
))}
```

### 5. Lazy Load Heavy Animations

For complex animations on large lists, consider virtualization:

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

// Only animate visible items
```

---

## Examples

### Trading Results List

```jsx
<StaggeredList
  staggerDelay={50}
  animation="fade-up"
  className="space-y-3"
>
  {trades.map(trade => (
    <Lift key={trade.id}>
      <TradeCard trade={trade} />
    </Lift>
  ))}
</StaggeredList>
```

### Profit Counter

```jsx
<div className="stat-card">
  <CountUp
    value={totalProfit}
    duration={1500}
    decimals={0}
    suffix=" ISK"
    className="text-3xl font-display text-accent-gold"
  />
</div>
```

### Error Feedback

```jsx
<Shake trigger={hasError}>
  <input
    type="number"
    className={`input-glow ${hasError ? 'border-red-500' : ''}`}
  />
</Shake>
```

### Modal Dialog

```jsx
<PresenceTransition show={isOpen}>
  <ScaleIn>
    <div className="modal glass-panel">
      <h2>Confirm Trade</h2>
      {/* Modal content */}
    </div>
  </ScaleIn>
</PresenceTransition>
```

---

## Support

For questions or issues with animations:
1. Check the example file: `src/components/common/Transitions.example.jsx`
2. Review existing usage in the codebase
3. Consult this documentation

Happy animating!
