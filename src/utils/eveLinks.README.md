# EVE Online Deep Links Utility

This module provides utilities for integrating with the EVE Online client through deep links (eve:// protocol).

## Features

- Open market details for items
- Show item information windows
- Set autopilot destinations
- Add waypoints to routes
- Open contracts
- Copy text to clipboard with feedback
- Validation functions for EVE IDs

## Installation

The utilities are already available in the project:

```javascript
import {
  openMarketDetails,
  showItemInfo,
  setDestination,
  addWaypoint,
  openContract,
  copyToClipboardWithFeedback,
  isValidTypeId,
  isValidSolarSystemId,
  isValidContractId,
} from '@/utils/eveLinks';
```

## API Reference

### `openMarketDetails(typeId)`

Opens the market details window for a specific item in the EVE Online client.

**Parameters:**
- `typeId` (number): The EVE type ID of the item

**Returns:** `string` - The generated EVE link URL

**Throws:** Error if typeId is invalid or EVE client cannot be opened

**Example:**
```javascript
import { openMarketDetails } from '@/utils/eveLinks';

// Open Tritanium market details
try {
  openMarketDetails(34);
} catch (error) {
  console.error('Failed to open EVE client:', error);
}
```

### `showItemInfo(typeId)`

Opens the item information window for a specific item in the EVE Online client.

**Parameters:**
- `typeId` (number): The EVE type ID of the item

**Returns:** `string` - The generated EVE link URL

**Throws:** Error if typeId is invalid or EVE client cannot be opened

**Example:**
```javascript
import { showItemInfo } from '@/utils/eveLinks';

// Show PLEX info window
showItemInfo(44992);
```

### `setDestination(solarSystemId)`

Sets the autopilot destination to a specific solar system in the EVE Online client.

**Parameters:**
- `solarSystemId` (number): The EVE solar system ID

**Returns:** `string` - The generated EVE link URL

**Throws:** Error if solarSystemId is invalid or EVE client cannot be opened

**Example:**
```javascript
import { setDestination } from '@/utils/eveLinks';

// Set destination to Jita
setDestination(30000142);
```

### `addWaypoint(solarSystemId)`

Adds a waypoint to the autopilot route in the EVE Online client.

**Parameters:**
- `solarSystemId` (number): The EVE solar system ID

**Returns:** `string` - The generated EVE link URL

**Throws:** Error if solarSystemId is invalid or EVE client cannot be opened

**Example:**
```javascript
import { addWaypoint } from '@/utils/eveLinks';

// Add Amarr as a waypoint
addWaypoint(30002187);
```

### `openContract(contractId)`

Opens a specific contract in the EVE Online client.

**Parameters:**
- `contractId` (number): The EVE contract ID

**Returns:** `string` - The generated EVE link URL

**Throws:** Error if contractId is invalid or EVE client cannot be opened

**Example:**
```javascript
import { openContract } from '@/utils/eveLinks';

// Open a specific contract
openContract(123456789);
```

### `copyToClipboardWithFeedback(text, onSuccess, onError)`

Copies text to the clipboard with proper error handling and feedback callbacks.

**Parameters:**
- `text` (string): Text to copy to clipboard
- `onSuccess` (function, optional): Callback function called on successful copy
- `onError` (function, optional): Callback function called on error

**Returns:** `Promise<boolean>` - True if successful, false otherwise

**Example:**
```javascript
import { copyToClipboardWithFeedback } from '@/utils/eveLinks';

await copyToClipboardWithFeedback(
  'Tritanium',
  () => console.log('Copied!'),
  (error) => console.error('Failed:', error)
);
```

### Validation Functions

#### `isValidTypeId(typeId)`

Validates if a type ID is valid (positive integer).

**Returns:** `boolean`

#### `isValidSolarSystemId(solarSystemId)`

Validates if a solar system ID is valid (positive integer).

**Returns:** `boolean`

#### `isValidContractId(contractId)`

Validates if a contract ID is valid (positive integer).

**Returns:** `boolean`

**Example:**
```javascript
import { isValidTypeId } from '@/utils/eveLinks';

if (isValidTypeId(typeId)) {
  openMarketDetails(typeId);
} else {
  console.error('Invalid type ID');
}
```

## React Component

The `EveActionButtons` component provides a ready-to-use button group for EVE Online integration.

### Basic Usage

```javascript
import { EveActionButtons } from '@/components/common/EveActionButtons';

function TradingRow({ item }) {
  return (
    <div className="flex items-center justify-between">
      <span>{item.name}</span>
      <EveActionButtons
        typeId={item.typeId}
        typeName={item.name}
        solarSystemId={item.solarSystemId}
        onCopy={(name) => console.log(`Copied: ${name}`)}
      />
    </div>
  );
}
```

### Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `typeId` | number | No* | Item type ID (required for market/info actions) |
| `typeName` | string | No* | Item name for copy action |
| `solarSystemId` | number | No | Solar system ID for destination actions |
| `stationId` | number | No | Station ID (reserved for future features) |
| `onCopy` | function | No | Callback when copy succeeds |
| `compact` | boolean | No | Use smaller button variant (default: false) |
| `className` | string | No | Additional CSS classes |

*At least one of `typeId` or `typeName` should be provided for the component to be useful.

### Compact Variant

Use the compact variant in tables or dense layouts:

```javascript
import { EveActionButtonsCompact } from '@/components/common/EveActionButtons';

<EveActionButtonsCompact
  typeId={34}
  typeName="Tritanium"
  solarSystemId={30000142}
/>
```

## EVE:// Protocol Reference

The eve:// protocol allows web applications to interact with the EVE Online client. Here are the supported formats:

| Action | Format | Example |
|--------|--------|---------|
| Market Details | `eve://market/showMarketDetails/?typeid={typeId}` | `eve://market/showMarketDetails/?typeid=34` |
| Item Info | `eve://showinfo/{typeId}` | `eve://showinfo/34` |
| Set Destination | `eve://client/setDestination?target={systemId}` | `eve://client/setDestination?target=30000142` |
| Add Waypoint | `eve://client/addWaypoint?target={systemId}` | `eve://client/addWaypoint?target=30000142` |
| Open Contract | `eve://contract/{contractId}` | `eve://contract/123456789` |

## Common EVE IDs

### Popular Items

| Item | Type ID |
|------|---------|
| Tritanium | 34 |
| PLEX | 44992 |
| Skill Injector | 40520 |
| Ishtar | 12005 |

### Major Trade Hubs

| System | Solar System ID |
|--------|-----------------|
| Jita | 30000142 |
| Amarr | 30002187 |
| Dodixie | 30002659 |
| Rens | 30002510 |
| Hek | 30002053 |

## Error Handling

All functions throw errors with descriptive messages when:
- Invalid parameters are provided (not a number, null, undefined, etc.)
- The EVE client cannot be opened (not installed or protocol not registered)

Always wrap calls in try-catch blocks for production use:

```javascript
try {
  openMarketDetails(typeId);
  showToast('Opening market in EVE...', 'success');
} catch (error) {
  showToast(error.message || 'Failed to open EVE client', 'error');
}
```

## Browser Compatibility

The clipboard functionality uses the modern Clipboard API with a fallback to `document.execCommand('copy')` for older browsers.

The eve:// protocol links work by setting `window.location.href`. This requires:
- EVE Online client to be installed
- The eve:// protocol handler to be registered with the operating system
- User permission in some browsers (they may prompt before opening external applications)

## Testing

Unit tests are provided in `eveLinks.test.js`. Run them with:

```bash
npm test -- eveLinks.test.js
```

All functions are thoroughly tested including:
- Valid input handling
- Invalid input handling
- Error cases
- URL generation
- Clipboard operations

## Related Files

- `/src/utils/eveLinks.js` - Core utility functions
- `/src/components/common/EveActionButtons.jsx` - React component
- `/src/components/common/EveActionButtons.example.jsx` - Usage examples
- `/src/utils/eveLinks.test.js` - Unit tests

## Contributing

When adding new EVE:// protocol links:

1. Add the function to `/src/utils/eveLinks.js`
2. Add corresponding tests to `/src/utils/eveLinks.test.js`
3. Update this README with the new functionality
4. If applicable, update the `EveActionButtons` component

## License

This code is part of the EVETrade project and follows the same license.
