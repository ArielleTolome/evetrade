# Modal Component Documentation

A fully-featured, accessible modal/dialog component system for EVETrade.

## Features

- Accessible with proper ARIA attributes and focus management
- Focus trap within modal when open
- Close on Escape key (configurable)
- Optional close on backdrop click
- Multiple sizes: `sm`, `md`, `lg`, `xl`, `full`
- Smooth enter/exit animations (scale + fade)
- Portal rendering to document.body
- Body scroll prevention when open
- Multiple modal stacking with proper z-index management
- Glassmorphic design with backdrop blur
- Fully responsive (full width on mobile with padding)

## Installation

The Modal component is already available in the common components:

```jsx
import { Modal, useModal } from '@/components/common';
```

## Basic Usage

### Simple Modal with Title

The easiest way to use the modal:

```jsx
import { Modal, useModal, Button } from '@/components/common';

function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <Button onClick={open}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={close} title="My Modal">
        <p>This is the modal content!</p>
      </Modal>
    </>
  );
}
```

### Custom Layout with Sub-components

For more control, use the sub-components:

```jsx
import { Modal, useModal, Button } from '@/components/common';

function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <Button onClick={open}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={close} size="lg">
        <Modal.Header>
          <Modal.Title>Custom Modal</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Your content here...</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

## Props

### Modal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls modal visibility |
| `onClose` | `function` | required | Callback when modal should close |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal size |
| `closeOnBackdrop` | `boolean` | `true` | Close modal when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close modal on Escape key |
| `showCloseButton` | `boolean` | `true` | Show close button in header |
| `title` | `string` | - | Optional title (creates automatic header) |
| `className` | `string` | `''` | Additional classes for modal container |
| `backdropClassName` | `string` | `''` | Additional classes for backdrop |
| `children` | `React.ReactNode` | required | Modal content |

### Modal Sizes

- `sm`: 400px max width
- `md`: 512px max width (default)
- `lg`: 672px max width
- `xl`: 896px max width
- `full`: 95vw x 95vh (near fullscreen)

## useModal Hook

The `useModal` hook provides a simple way to manage modal state:

```jsx
const { isOpen, open, close, toggle } = useModal(initialState);
```

### Hook API

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Current modal state |
| `open` | `function` | Open the modal |
| `close` | `function` | Close the modal |
| `toggle` | `function` | Toggle modal state |

## Examples

### Confirmation Dialog

```jsx
function DeleteConfirmation({ itemName, onConfirm }) {
  const { isOpen, open, close } = useModal();

  const handleConfirm = () => {
    onConfirm();
    close();
  };

  return (
    <>
      <Button variant="danger" onClick={open}>Delete</Button>

      <Modal isOpen={isOpen} onClose={close} size="sm">
        <Modal.Header>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to delete "{itemName}"?</p>
          <p className="text-text-muted text-sm">This action cannot be undone.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

### Form Modal

```jsx
function CreateTradeModal() {
  const { isOpen, open, close } = useModal();
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
    close();
  };

  return (
    <>
      <Button onClick={open}>Create Trade</Button>

      <Modal isOpen={isOpen} onClose={close} title="New Trade">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Item Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-space-mid border border-white/10 rounded-lg"
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-space-mid border border-white/10 rounded-lg"
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
```

### Loading Modal

```jsx
function AsyncActionButton() {
  const { isOpen, open, close } = useModal();

  const handleAction = async () => {
    open();
    try {
      await performAsyncAction();
      close();
    } catch (error) {
      console.error(error);
      close();
    }
  };

  return (
    <>
      <Button onClick={handleAction}>Perform Action</Button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        closeOnBackdrop={false}
        closeOnEscape={false}
        showCloseButton={false}
      >
        <div className="text-center py-8">
          <LoadingSpinner size="xl" className="mx-auto mb-4" />
          <p className="text-text-secondary">Processing...</p>
        </div>
      </Modal>
    </>
  );
}
```

### Full Screen Modal

```jsx
function DataViewer() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <Button onClick={open}>View Details</Button>

      <Modal isOpen={isOpen} onClose={close} size="full">
        <Modal.Header>
          <Modal.Title>Data Viewer</Modal.Title>
        </Modal.Header>

        <Modal.Body className="flex-1">
          {/* Large data display, charts, etc. */}
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={close}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

### Nested Modals

Multiple modals can be stacked. Each modal gets a higher z-index automatically:

```jsx
function NestedModalExample() {
  const modal1 = useModal();
  const modal2 = useModal();

  return (
    <>
      <Button onClick={modal1.open}>Open First Modal</Button>

      <Modal isOpen={modal1.isOpen} onClose={modal1.close} title="First Modal">
        <p>This is the first modal</p>
        <Button onClick={modal2.open}>Open Second Modal</Button>
      </Modal>

      <Modal isOpen={modal2.isOpen} onClose={modal2.close} title="Second Modal">
        <p>This is the second modal, stacked on top!</p>
      </Modal>
    </>
  );
}
```

### Prevent Accidental Close

For important actions, disable backdrop and escape key closing:

```jsx
<Modal
  isOpen={isOpen}
  onClose={close}
  closeOnBackdrop={false}
  closeOnEscape={false}
  title="Important Notice"
>
  <p>You must acknowledge this message.</p>
  <Button onClick={close}>I Understand</Button>
</Modal>
```

## Accessibility

The Modal component follows WCAG 2.1 AA guidelines:

- **Focus Management**: Focus is automatically trapped within the modal
- **Keyboard Navigation**: Tab and Shift+Tab cycle through focusable elements
- **Escape Key**: Closes the modal (unless disabled)
- **ARIA Attributes**: Proper `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
- **Focus Return**: Focus returns to the trigger element when modal closes
- **Screen Reader Support**: All interactive elements are properly labeled

## Styling

The Modal uses EVETrade's design system with glassmorphic styling:

- Dark backdrop with blur effect
- Glassmorphic card with backdrop filter
- Cyan accent colors for focus and hover states
- Smooth animations for enter/exit
- Responsive design with mobile-first approach

### Custom Styling

You can customize the modal appearance using className props:

```jsx
<Modal
  isOpen={isOpen}
  onClose={close}
  className="bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20"
  backdropClassName="backdrop-blur-md"
>
  {/* Your content */}
</Modal>
```

## Best Practices

1. **Always use the useModal hook** for state management - it's cleaner and more maintainable
2. **Keep modals focused** - one clear purpose per modal
3. **Use appropriate sizes** - don't make small confirmations take up the whole screen
4. **Provide clear actions** - always include Cancel and Confirm buttons
5. **Handle loading states** - show loading indicators for async operations
6. **Test keyboard navigation** - ensure all interactive elements are reachable via keyboard
7. **Consider mobile users** - modals are full-width on mobile by default

## Troubleshooting

### Modal not appearing

- Ensure `isOpen` is `true`
- Check that the modal is rendered (not conditionally hidden)
- Verify z-index isn't being overridden by other elements

### Body scroll not locked

- The component automatically handles this
- If issues persist, check for conflicting CSS on the `body` element

### Focus trap not working

- Ensure focusable elements exist within the modal
- Check that elements aren't disabled or hidden

### Multiple modals conflicting

- Each modal automatically gets a unique z-index
- Modals are registered and unregistered in a stack
- Last opened modal always appears on top

## Performance

The Modal component is optimized for performance:

- Portal rendering prevents re-renders of parent components
- Focus management uses refs to avoid unnecessary updates
- Event listeners are properly cleaned up
- Animations use CSS transitions (GPU-accelerated)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch-friendly targets

## License

Part of the EVETrade project. See project LICENSE for details.
