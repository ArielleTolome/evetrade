# Toast Notification System

A comprehensive toast/notification system for EVETrade with a space/cyberpunk theme, supporting multiple notification types, queuing, and rich interactions.

## Features

- **Multiple Toast Types**: success, error, warning, info
- **Stack-based Positioning**: Top-right positioning (top-left on mobile)
- **Auto-dismiss**: Configurable duration (default 5s) with progress bar
- **Manual Dismiss**: X button on each toast
- **Pause on Hover**: Timer pauses when hovering over toast
- **Progress Bar**: Visual indicator showing time remaining
- **Action Buttons**: Optional action buttons within toasts
- **Smooth Animations**: Enter/exit animations with slide-in effect
- **Queueing**: Maximum 5 toasts visible at once (others queued automatically)
- **Accessible**: ARIA live regions for screen readers
- **Mobile Responsive**: Full width on mobile, fixed width on desktop
- **Glassmorphic Design**: Matches EVETrade's space/cyberpunk theme

## Installation

The Toast system is already integrated into the app via `ToastProvider` in `/src/App.jsx`.

## Usage

### Basic Usage

```jsx
import { useToast } from '../components/common/ToastProvider';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please review this action');
  };

  const handleInfo = () => {
    toast.info('New data available');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### With Custom Duration

```jsx
const toast = useToast();

// 3 seconds
toast.success('Saved!', { duration: 3000 });

// 10 seconds
toast.error('Critical error', { duration: 10000 });

// Never auto-dismiss
toast.warning('Manual dismiss only', { duration: Infinity });
```

### With Action Button

```jsx
const toast = useToast();

toast.info('New message received', {
  duration: 10000,
  action: {
    label: 'View',
    onClick: () => {
      // Navigate to message or perform action
      console.log('Action clicked');
    }
  }
});

toast.error('Failed to save changes', {
  action: {
    label: 'Retry',
    onClick: () => {
      // Retry the failed operation
      saveChanges();
    }
  }
});
```

### Dismissing Toasts

```jsx
const toast = useToast();

// Get toast ID when creating
const id = toast.success('Processing...');

// Dismiss specific toast
toast.dismiss(id);

// Dismiss all toasts
toast.dismissAll();
```

## API Reference

### `useToast()` Hook

Returns an object with the following methods:

#### `toast.success(message, options)`
Show a success toast with green accent.

**Parameters:**
- `message` (string): The message to display
- `options` (object, optional):
  - `duration` (number): Auto-dismiss duration in ms (default: 5000)
  - `action` (object): Action button config
    - `label` (string): Button text
    - `onClick` (function): Click handler

**Returns:** Toast ID (string)

#### `toast.error(message, options)`
Show an error toast with red accent.

Same parameters as `toast.success()`.

#### `toast.warning(message, options)`
Show a warning toast with gold accent.

Same parameters as `toast.success()`.

#### `toast.info(message, options)`
Show an info toast with cyan accent.

Same parameters as `toast.success()`.

#### `toast.dismiss(id)`
Manually dismiss a specific toast.

**Parameters:**
- `id` (string): The toast ID returned from creation methods

#### `toast.dismissAll()`
Dismiss all visible and queued toasts.

## Design Guidelines

### When to Use Each Type

- **Success** (Green): Successful operations, confirmations, completed actions
  - "Trade saved successfully"
  - "Added to watchlist"
  - "Copied to clipboard"

- **Error** (Red): Failed operations, errors, critical issues
  - "Failed to load data"
  - "Invalid input"
  - "Network error"

- **Warning** (Gold): Important information, potential issues, cautions
  - "Market price changed significantly"
  - "Low volume detected"
  - "Action cannot be undone"

- **Info** (Cyan): General information, tips, non-critical updates
  - "New data available"
  - "Keyboard shortcut: Press F"
  - "Feature updated"

### Duration Guidelines

- **Quick confirmations**: 3000ms (3 seconds)
  - "Copied to clipboard"
  - "Saved"

- **Standard messages**: 5000ms (5 seconds) - default
  - "Trade route saved successfully"
  - "Filters applied"

- **Important information**: 7000-10000ms (7-10 seconds)
  - Error messages with details
  - Messages with action buttons

- **Manual dismiss only**: `Infinity`
  - Critical errors requiring user acknowledgment
  - Multi-step instructions

### Accessibility

The toast system is built with accessibility in mind:

- ARIA live regions announce toast messages to screen readers
- Keyboard accessible (Tab to focus dismiss button, Enter/Space to dismiss)
- Sufficient color contrast for all toast types
- Progress bar has proper ARIA attributes

## Examples

### Form Submission

```jsx
const toast = useToast();

const handleSubmit = async (data) => {
  try {
    await api.submitForm(data);
    toast.success('Form submitted successfully!');
    navigate('/success');
  } catch (error) {
    toast.error(`Failed to submit form: ${error.message}`, {
      duration: 7000,
      action: {
        label: 'Retry',
        onClick: () => handleSubmit(data)
      }
    });
  }
};
```

### Bulk Operations

```jsx
const toast = useToast();

const handleBulkDelete = (items) => {
  const count = items.length;

  toast.warning(`Deleting ${count} items...`, { duration: 2000 });

  api.bulkDelete(items)
    .then(() => {
      toast.success(`Successfully deleted ${count} items`);
    })
    .catch((error) => {
      toast.error(`Failed to delete items: ${error.message}`);
    });
};
```

### Clipboard Operations

```jsx
const toast = useToast();

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { duration: 2000 });
  } catch (error) {
    toast.error('Failed to copy to clipboard');
  }
};
```

### Real-time Updates

```jsx
const toast = useToast();

useEffect(() => {
  const subscription = marketData.subscribe((update) => {
    if (update.priceChange > 10) {
      toast.warning(`Price alert: ${update.itemName} changed by ${update.priceChange}%`, {
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => navigate(`/item/${update.itemId}`)
        }
      });
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

## Demo

To see all toast features in action, check out `/src/components/common/ToastDemo.jsx` or visit the demo page in development.

## Theming

Toasts automatically adapt to the current theme (light/dark) using Tailwind's dark mode classes. The colors are defined in `tailwind.config.js`:

- Success: `accent-green` (#00ff9d)
- Error: `red-500`
- Warning: `accent-gold` (#ffd700)
- Info: `accent-cyan` (#00f0ff)

## Technical Details

### Architecture

- **ToastProvider**: Context provider managing toast state and queue
- **Toast**: Individual toast component with animations and progress
- **useToast**: Hook providing convenient methods for creating toasts

### Performance

- Maximum 5 visible toasts prevents UI clutter
- Automatic queuing for additional toasts
- RequestAnimationFrame for smooth progress animations
- Minimal re-renders using React context

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback for clipboard API if not supported
- Progressive enhancement for animations
