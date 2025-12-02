# Animation System Quick Start

This guide provides a quick reference for using the new animation system in EVETrade.

## Quick Examples

### Fade in a card

```jsx
import { FadeIn } from '@/components/common/Transitions';

<FadeIn direction="up">
  <div className="glass-panel p-6">
    Your content here
  </div>
</FadeIn>
```

### Animate a list of items

```jsx
import { StaggeredList } from '@/components/common/Transitions';

<StaggeredList staggerDelay={100} animation="fade-up">
  {items.map(item => (
    <div key={item.id} className="glass-panel p-4">
      {item.name}
    </div>
  ))}
</StaggeredList>
```

### Add hover lift effect

```jsx
// Option 1: Using component
import { Lift } from '@/components/common/Transitions';

<Lift>
  <div className="glass-panel p-6">Card</div>
</Lift>

// Option 2: Using CSS class
<div className="glass-panel p-6 card-lift">Card</div>
```

### Button with press effect

```jsx
// Option 1: Using component
import { Press } from '@/components/common/Transitions';

<Press>
  <button className="btn-primary">Submit</button>
</Press>

// Option 2: Using CSS class
<button className="btn-primary btn-press">Submit</button>
```

### Show profit with count-up animation

```jsx
import { CountUp } from '@/components/common/Transitions';

<CountUp
  value={totalProfit}
  duration={1500}
  suffix=" ISK"
  className="text-3xl font-display text-accent-gold"
/>
```

### Error shake animation

```jsx
import { Shake } from '@/components/common/Transitions';

const [hasError, setHasError] = useState(false);

<Shake trigger={hasError}>
  <input
    type="text"
    className="input-glow"
    onChange={(e) => {
      if (!isValid(e.target.value)) {
        setHasError(true);
      }
    }}
  />
</Shake>
```

### Accordion with collapse animation

```jsx
import { Collapse } from '@/components/common/Transitions';

const [isOpen, setIsOpen] = useState(false);

<>
  <button onClick={() => setIsOpen(!isOpen)}>
    Toggle Section
  </button>
  <Collapse isOpen={isOpen}>
    <div className="p-4">
      Collapsible content here
    </div>
  </Collapse>
</>
```

### Modal with presence animation

```jsx
import { PresenceTransition } from '@/components/common/Transitions';

const [showModal, setShowModal] = useState(false);

<PresenceTransition show={showModal}>
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="glass-panel p-6 max-w-md">
      <h2>Modal Title</h2>
      <button onClick={() => setShowModal(false)}>Close</button>
    </div>
  </div>
</PresenceTransition>
```

## CSS-Only Quick Effects

### Links with animated underline

```html
<a href="#" class="link-underline text-accent-cyan">
  Hover me
</a>
```

### Input with focus glow

```html
<input
  type="text"
  class="input-glow px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20"
/>
```

### Glowing elements

```html
<div class="glow-cyan">Cyan glow</div>
<div class="glow-purple">Purple glow</div>
<div class="glow-gold">Gold glow</div>
```

### Hover scale effects

```html
<div class="hover-scale">Scales to 1.05</div>
<div class="hover-scale-sm">Scales to 1.02</div>
```

### Pulsing notification dot

```html
<div class="pulse-ring w-3 h-3 bg-accent-cyan rounded-full"></div>
```

## Tailwind Animation Classes

Use these directly in your JSX:

```jsx
// Fade animations
<div className="animate-fade-in">Simple fade</div>
<div className="animate-fade-in-up">Fade from bottom</div>

// Slide animations
<div className="animate-slide-in-left">Slide from left</div>
<div className="animate-slide-in-right">Slide from right</div>

// Scale & bounce
<div className="animate-scale-in">Scale in</div>
<div className="animate-bounce-in">Bounce in</div>

// Special effects
<div className="animate-glow-pulse">Glowing pulse</div>
<div className="animate-shake">Shake</div>
```

## Staggered Animation Delays

```jsx
<div className="animate-fade-in-up stagger-1">Item 1</div>
<div className="animate-fade-in-up stagger-2">Item 2</div>
<div className="animate-fade-in-up stagger-3">Item 3</div>
```

Available: `.stagger-1` through `.stagger-8` (increments of 50ms)

## Common Patterns

### Trading card with all effects

```jsx
import { Lift, Press } from '@/components/common/Transitions';

<Lift>
  <div className="glass-panel p-6 border-glow rounded-lg">
    <h3 className="font-display text-accent-cyan">Trade Item</h3>
    <p className="text-text-secondary">Details here</p>
    <Press>
      <button className="btn-primary btn-press mt-4">
        Execute Trade
      </button>
    </Press>
  </div>
</Lift>
```

### Stats dashboard with count-ups

```jsx
import { FadeIn, CountUp } from '@/components/common/Transitions';

<div className="grid grid-cols-3 gap-6">
  <FadeIn delay={0}>
    <div className="glass-panel p-6 text-center">
      <CountUp value={totalProfit} suffix=" ISK" className="text-2xl" />
      <p className="text-text-secondary mt-2">Total Profit</p>
    </div>
  </FadeIn>
  <FadeIn delay={100}>
    <div className="glass-panel p-6 text-center">
      <CountUp value={tradeCount} suffix=" Trades" className="text-2xl" />
      <p className="text-text-secondary mt-2">Completed</p>
    </div>
  </FadeIn>
  <FadeIn delay={200}>
    <div className="glass-panel p-6 text-center">
      <CountUp value={winRate} decimals={1} suffix="%" className="text-2xl" />
      <p className="text-text-secondary mt-2">Win Rate</p>
    </div>
  </FadeIn>
</div>
```

## Tips

1. **Keep it subtle**: Most animations should be 300-400ms
2. **Use staggering**: Lists look better with staggered animations
3. **Combine effects**: Mix hover, press, and glow for rich interactions
4. **Match the theme**: Use cyan, purple, and gold glows for the space theme
5. **Test on mobile**: Ensure animations feel good on touch devices

## More Information

- Full documentation: `/ANIMATIONS.md`
- Live examples: `/src/components/common/Transitions.example.jsx`
- Component source: `/src/components/common/Transitions.jsx`
