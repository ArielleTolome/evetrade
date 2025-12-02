# Copy Components Quick Reference

This directory contains production-ready clipboard management components for EVETrade.

## Components Created

### Core Components
1. **useClipboard.jsx** - Custom hook for clipboard operations with history
2. **OneClickCopy.jsx** - One-click copy buttons with visual feedback
3. **BulkCopyPanel.jsx** - Bulk selection and copying of multiple items
4. **TradeClipboard.jsx** - Smart clipboard history manager with pinning

### Example Files
1. **OneClickCopy.example.jsx** - Usage examples for OneClickCopy
2. **BulkCopyPanel.example.jsx** - Usage examples for BulkCopyPanel
3. **TradeClipboard.example.jsx** - Usage examples for TradeClipboard
4. **CopyComponents.integration.example.jsx** - Full integration demo

### Tests
1. **useClipboard.test.jsx** - Comprehensive tests for useClipboard hook

## Quick Start

### Basic Copy Button
```javascript
import { OneClickCopy } from './components/common/OneClickCopy';

<OneClickCopy
  value="Tritanium"
  label="Copy Item"
/>
```

### Bulk Copy
```javascript
import { BulkCopyPanel } from './components/common/BulkCopyPanel';

<BulkCopyPanel
  items={tradeData}
  getItemName={(item) => item.name}
  onCopy={(items, format) => console.log('Copied', items)}
/>
```

### Clipboard History
```javascript
import { TradeClipboard } from './components/common/TradeClipboard';

<TradeClipboard compact />
```

### Custom Hook
```javascript
import { useClipboard } from '../hooks/useClipboard';

const { copy, history } = useClipboard();
await copy('My data', 'text', { label: 'Custom Label' });
```

## Features

- One-click copying with visual feedback
- Multiple format support (text, JSON, CSV, in-game)
- Clipboard history with localStorage persistence
- Pin frequently used items
- Keyboard shortcuts (Ctrl+A, Ctrl+C)
- Dark mode compatible
- Fully typed and documented

## File Locations

```
/src/hooks/useClipboard.jsx
/src/hooks/useClipboard.test.jsx
/src/components/common/OneClickCopy.jsx
/src/components/common/BulkCopyPanel.jsx
/src/components/common/TradeClipboard.jsx
/src/components/common/*.example.jsx
```

## Documentation

See `/COPY_PASTE_COMPONENTS.md` for full documentation.

## Integration

Components are fully integrated with EVETrade's:
- Tailwind CSS theme
- Dark mode support
- Existing utility functions (formatters)
- React 19 features
- TypeScript-ready props

## Running Examples

To view examples in development:

```javascript
// In your router or dev page
import { OneClickCopyExample } from './components/common/OneClickCopy.example';
import { BulkCopyPanelExample } from './components/common/BulkCopyPanel.example';
import { TradeClipboardExample } from './components/common/TradeClipboard.example';
import { CopyComponentsIntegrationExample } from './components/common/CopyComponents.integration.example';

// Render any example component
<OneClickCopyExample />
```

## Testing

Run tests:
```bash
npm test -- useClipboard.test
```

## Browser Support

Requires:
- Clipboard API support
- localStorage
- Modern ES6+ JavaScript

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
