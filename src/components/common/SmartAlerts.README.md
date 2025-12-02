# Smart Alerts System - Developer Documentation

## Overview

The Smart Alerts System is a comprehensive alert framework for EVETrade that provides intelligent, priority-based notifications for market opportunities.

## Architecture

### Components

1. **useSmartAlerts** (`/src/hooks/useSmartAlerts.jsx`)
   - Core hook managing alert state and logic
   - localStorage persistence
   - Alert checking and triggering
   - Notification management

2. **SmartAlertPanel** (`/src/components/common/SmartAlertPanel.jsx`)
   - Main UI for creating and managing alerts
   - Quick preset selection
   - Custom alert creation
   - Settings management

3. **AlertNotificationCenter** (`/src/components/common/AlertNotificationCenter.jsx`)
   - Displays triggered alerts
   - Shows alert history
   - Provides quick actions (copy, watchlist, acknowledge)
   - Filtering and search

4. **QuickAlertButton** (`/src/components/common/QuickAlertButton.jsx`)
   - Inline alert creation from table rows
   - Pre-filled with current market data
   - Smart threshold suggestions
   - Preset quick-access

## Installation

All files are already created in the codebase:

```
src/
├── hooks/
│   └── useSmartAlerts.jsx
└── components/
    └── common/
        ├── SmartAlertPanel.jsx
        ├── AlertNotificationCenter.jsx
        ├── QuickAlertButton.jsx
        └── SmartAlerts.example.jsx
```

## Basic Usage

### 1. Import the Hook and Components

```javascript
import { useSmartAlerts } from '../../hooks/useSmartAlerts';
import { SmartAlertPanel } from './SmartAlertPanel';
import { AlertNotificationCenter } from './AlertNotificationCenter';
import { QuickAlertButton } from './QuickAlertButton';
```

### 2. Initialize the Hook

```javascript
function MyTradingPage() {
  const {
    alerts,
    activeAlerts,
    triggeredAlerts,
    triggeredHistory,
    alertsByPriority,
    settings,
    notificationPermission,
    addAlert,
    addAlertFromPreset,
    removeAlert,
    resetAlert,
    checkAlerts,
    acknowledgeAlert,
    acknowledgeAll,
    clearAllAlerts,
    clearHistory,
    updateSettings,
    requestNotificationPermission,
    exportAlerts,
    importAlerts,
    ALERT_TYPES,
    PRIORITY_LEVELS,
    ALERT_PRESETS,
  } = useSmartAlerts();

  // ... rest of component
}
```

### 3. Check Alerts Against Market Data

```javascript
useEffect(() => {
  if (trades && trades.length > 0) {
    const triggered = checkAlerts(trades);
    if (triggered.length > 0) {
      console.log('Alerts triggered:', triggered);
      // Optionally show notification center
      setShowNotificationCenter(true);
    }
  }
}, [trades, checkAlerts]);
```

### 4. Render Components

```jsx
return (
  <div>
    {/* Alert Panel */}
    <SmartAlertPanel
      alerts={alerts}
      activeAlerts={activeAlerts}
      alertsByPriority={alertsByPriority}
      onCreateAlert={addAlert}
      onCreateFromPreset={addAlertFromPreset}
      onRemoveAlert={removeAlert}
      onResetAlert={resetAlert}
      onClearAll={clearAllAlerts}
      settings={settings}
      notificationPermission={notificationPermission}
      onUpdateSettings={updateSettings}
      onRequestNotificationPermission={requestNotificationPermission}
      ALERT_TYPES={ALERT_TYPES}
      PRIORITY_LEVELS={PRIORITY_LEVELS}
      ALERT_PRESETS={ALERT_PRESETS}
    />

    {/* Notification Center */}
    <AlertNotificationCenter
      triggeredAlerts={triggeredAlerts}
      triggeredHistory={triggeredHistory}
      onAcknowledge={acknowledgeAlert}
      onAcknowledgeAll={acknowledgeAll}
      onClearHistory={clearHistory}
      PRIORITY_LEVELS={PRIORITY_LEVELS}
      ALERT_TYPES={ALERT_TYPES}
    />

    {/* Quick Alert Button (in table rows) */}
    <QuickAlertButton
      item={tradeItem}
      onCreateAlert={addAlert}
      onCreateFromPreset={addAlertFromPreset}
      ALERT_TYPES={ALERT_TYPES}
      PRIORITY_LEVELS={PRIORITY_LEVELS}
      ALERT_PRESETS={ALERT_PRESETS}
    />
  </div>
);
```

## API Reference

### useSmartAlerts Hook

#### Returned Values

##### State
- `alerts` - All alert configurations
- `activeAlerts` - Enabled, non-triggered alerts
- `triggeredAlerts` - Recently triggered, unacknowledged alerts
- `acknowledgedAlerts` - Acknowledged alerts
- `triggeredHistory` - Complete trigger history (max 100 items)
- `alertsByPriority` - Alerts grouped by priority level
- `settings` - User preferences
- `notificationPermission` - Browser notification permission status

##### Methods

**Alert Management**
- `addAlert(config)` - Create new alert
  ```javascript
  addAlert({
    itemName: 'Tritanium',
    itemId: 34,
    type: ALERT_TYPES.MARGIN_THRESHOLD,
    condition: 'above',
    threshold: 20,
    priority: PRIORITY_LEVELS.HIGH,
    oneTime: true,
  });
  ```

- `addAlertFromPreset(presetId, itemName, itemId)` - Create from preset
  ```javascript
  addAlertFromPreset('margin_20', 'Tritanium', 34);
  ```

- `removeAlert(alertId)` - Delete alert
- `updateAlert(alertId, updates)` - Modify alert
- `resetAlert(alertId)` - Reset triggered alert to active

**Alert Checking**
- `checkAlerts(trades)` - Check alerts against market data
  ```javascript
  const triggered = checkAlerts(marketData);
  ```

- `calculateOptimalThreshold(trades, itemName, alertType)` - Get suggested thresholds
  ```javascript
  const suggestions = calculateOptimalThreshold(trades, 'Tritanium', ALERT_TYPES.MARGIN_THRESHOLD);
  // Returns: { average, stdDev, suggested, conservative, aggressive }
  ```

**Acknowledgement**
- `acknowledgeAlert(alertId)` - Mark alert as read
- `acknowledgeAll()` - Mark all alerts as read

**History**
- `clearHistory()` - Clear trigger history

**Settings**
- `updateSettings(newSettings)` - Update preferences
  ```javascript
  updateSettings({
    soundEnabled: true,
    soundVolume: 0.7,
    browserNotifications: true,
    groupSimilarAlerts: true,
    autoAcknowledge: false,
  });
  ```

- `requestNotificationPermission()` - Request browser notification access

**Import/Export**
- `exportAlerts()` - Export configuration as JSON string
- `importAlerts(jsonString)` - Import configuration from JSON

##### Constants

- `ALERT_TYPES` - Available alert types
  ```javascript
  {
    PRICE_DROP: 'priceDropBelow',
    PRICE_RISE: 'priceRiseAbove',
    MARGIN_THRESHOLD: 'marginReaches',
    VOLUME_SPIKE: 'volumeSpike',
    COMPETITION_UNDERCUT: 'competitionUndercut',
    BUY_PRICE_BELOW: 'buyPriceBelow',
    SELL_PRICE_ABOVE: 'sellPriceAbove',
    NET_PROFIT_ABOVE: 'netProfitAbove',
  }
  ```

- `PRIORITY_LEVELS` - Priority levels
  ```javascript
  {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  }
  ```

- `ALERT_PRESETS` - Quick preset configurations
  ```javascript
  [
    {
      id: 'margin_20',
      name: '20% Margin Opportunity',
      description: 'Alert when an item reaches 20% or higher margin',
      type: ALERT_TYPES.MARGIN_THRESHOLD,
      condition: 'above',
      threshold: 20,
      priority: PRIORITY_LEVELS.HIGH,
    },
    // ... more presets
  ]
  ```

### Component Props

#### SmartAlertPanel

```typescript
interface SmartAlertPanelProps {
  alerts: Alert[];
  activeAlerts: Alert[];
  alertsByPriority: Record<string, Alert[]>;
  onCreateAlert: (config: AlertConfig) => void;
  onCreateFromPreset: (presetId: string, itemName: string, itemId?: string) => void;
  onRemoveAlert: (alertId: string) => void;
  onResetAlert: (alertId: string) => void;
  onUpdateAlert: (alertId: string, updates: Partial<Alert>) => void;
  onClearAll: () => void;
  settings: AlertSettings;
  notificationPermission: 'default' | 'granted' | 'denied';
  onUpdateSettings: (settings: Partial<AlertSettings>) => void;
  onRequestNotificationPermission: () => Promise<boolean>;
  ALERT_TYPES: typeof ALERT_TYPES;
  PRIORITY_LEVELS: typeof PRIORITY_LEVELS;
  ALERT_PRESETS: AlertPreset[];
  onCalculateOptimalThreshold?: (trades: any[], itemName: string, alertType: string) => ThresholdSuggestions;
}
```

#### AlertNotificationCenter

```typescript
interface AlertNotificationCenterProps {
  triggeredAlerts: Alert[];
  triggeredHistory: Alert[];
  onAcknowledge: (alertId: string) => void;
  onAcknowledgeAll: () => void;
  onClearHistory: () => void;
  onAddToWatchlist?: (itemName: string, itemId?: string) => void;
  onCopyItemName?: (itemName: string) => void;
  PRIORITY_LEVELS: typeof PRIORITY_LEVELS;
  ALERT_TYPES: typeof ALERT_TYPES;
  className?: string;
}
```

#### QuickAlertButton

```typescript
interface QuickAlertButtonProps {
  item: TradeItem;
  onCreateAlert: (config: AlertConfig) => void;
  onCreateFromPreset: (presetId: string, itemName: string, itemId?: string) => void;
  ALERT_TYPES: typeof ALERT_TYPES;
  PRIORITY_LEVELS: typeof PRIORITY_LEVELS;
  ALERT_PRESETS: AlertPreset[];
  historicalData?: any;
  className?: string;
}
```

## Data Structures

### Alert Configuration

```typescript
interface AlertConfig {
  itemName: string;          // Item to track
  itemId?: string | number;  // Optional item ID
  type: string;              // Alert type (from ALERT_TYPES)
  condition: 'above' | 'below' | 'equals';
  threshold: number;         // Threshold value
  priority: string;          // Priority level (from PRIORITY_LEVELS)
  oneTime: boolean;          // Auto-disable after trigger
  enabled?: boolean;         // Is alert enabled

  // Optional baseline values for spike/drop detection
  baselineVolume?: number;
  baselinePrice?: number;
  baselineMargin?: number;
}
```

### Alert Object

```typescript
interface Alert extends AlertConfig {
  id: string;                // Unique alert ID
  createdAt: string;         // ISO timestamp
  triggered: boolean;        // Has alert triggered
  acknowledged: boolean;     // Has user acknowledged
  triggeredAt?: string;      // ISO timestamp of trigger
  currentValue?: number;     // Value when triggered
  trade?: any;               // Trade data when triggered
}
```

### Alert Settings

```typescript
interface AlertSettings {
  browserNotifications: boolean;  // Enable browser notifications
  soundEnabled: boolean;          // Enable sound alerts
  soundVolume: number;            // Volume (0-1)
  groupSimilarAlerts: boolean;    // Group similar alerts
  autoAcknowledge: boolean;       // Auto-acknowledge after 5s
  showOnlyHighPriority: boolean;  // Filter to high priority only
}
```

## Trade Data Format

The alert system expects trade data in this format:

```javascript
{
  'Item': 'Tritanium',           // or item
  'Item ID': 34,                 // or itemId
  'Buy Price': 5.50,             // or buyPrice
  'Sell Price': 7.25,            // or sellPrice
  'Gross Margin': 31.78,         // or margin (percentage)
  'Net Profit': 1250000,         // or netProfit
  'Volume': 1000000,             // or volume
}
```

Both naming conventions (with quotes and camelCase) are supported.

## LocalStorage Keys

The system uses these localStorage keys:
- `evetrade_smart_alerts` - Alert configurations
- `evetrade_smart_alert_settings` - User settings
- `evetrade_triggered_history` - Trigger history (max 100 items)

## Browser Compatibility

- **Chrome/Edge**: Full support including notifications
- **Firefox**: Full support including notifications
- **Safari**: Full support (may require notification permission per session)
- **Mobile**: Limited notification support, check browser capabilities

## Performance Considerations

- Alert checking runs on every trade data update
- Maximum 100 items in trigger history (auto-pruned)
- LocalStorage has ~5-10MB limit (should support 1000+ alerts)
- Notification sounds use data URLs (no external files)

## Testing

Example test cases:

```javascript
// Test alert creation
const alertId = addAlert({
  itemName: 'Test Item',
  type: ALERT_TYPES.MARGIN_THRESHOLD,
  condition: 'above',
  threshold: 15,
  priority: PRIORITY_LEVELS.MEDIUM,
  oneTime: true,
});

// Test alert triggering
const trades = [
  { 'Item': 'Test Item', 'Gross Margin': 20 }
];
const triggered = checkAlerts(trades);
expect(triggered.length).toBe(1);

// Test acknowledgement
acknowledgeAlert(alertId);
expect(triggeredAlerts.length).toBe(0);
```

## Common Patterns

### Pattern 1: Alert on High Margin Items

```javascript
// Automatically create alerts for all items with >15% margin
trades.forEach(trade => {
  if (trade['Gross Margin'] > 15) {
    addAlertFromPreset('margin_20', trade['Item'], trade['Item ID']);
  }
});
```

### Pattern 2: Volume Spike Detection

```javascript
// Set baseline volume and alert on 2x spike
addAlert({
  itemName: 'Tritanium',
  type: ALERT_TYPES.VOLUME_SPIKE,
  condition: 'above',
  threshold: 2, // 2x baseline
  baselineVolume: currentVolume,
  priority: PRIORITY_LEVELS.HIGH,
  oneTime: false, // Keep checking
});
```

### Pattern 3: Competition Monitoring

```javascript
// Alert when your margin gets undercut
addAlert({
  itemName: 'Expensive Module',
  type: ALERT_TYPES.COMPETITION_UNDERCUT,
  condition: 'below',
  threshold: 0, // Placeholder
  baselineMargin: currentMargin,
  priority: PRIORITY_LEVELS.CRITICAL,
  oneTime: false,
});
```

## Troubleshooting

### Alerts Not Triggering

1. Check trade data format matches expected format
2. Verify alert is enabled and not already triggered (if one-time)
3. Ensure item name matches exactly (case-sensitive)
4. Check threshold and condition logic

### Memory Issues

1. Clear old history: `clearHistory()`
2. Remove unused alerts: `removeAlert(alertId)`
3. Export important alerts before clearing
4. Check localStorage usage in browser dev tools

### Notification Issues

1. Verify permission: `notificationPermission === 'granted'`
2. Check browser notification settings
3. Ensure HTTPS (required for notifications in some browsers)
4. Try requesting permission again

## Migration from Old Alert System

If migrating from the previous `usePriceAlerts` hook:

```javascript
// Old system
import { usePriceAlerts } from '../../hooks/usePriceAlerts';
const { alerts, createAlert } = usePriceAlerts();

// New system
import { useSmartAlerts } from '../../hooks/useSmartAlerts';
const { alerts, addAlert, ALERT_TYPES, PRIORITY_LEVELS } = useSmartAlerts();

// Update alert creation calls
// Old: createAlert({ itemName, type: 'margin', condition: 'above', threshold: 20 })
// New: addAlert({ itemName, type: ALERT_TYPES.MARGIN_THRESHOLD, condition: 'above', threshold: 20, priority: PRIORITY_LEVELS.MEDIUM })
```

The old `PriceAlertPanel` component can still be used alongside the new system if needed.

## Future Development

See `/SMART_ALERTS_GUIDE.md` for planned features and roadmap.

## Support

For questions or issues:
1. Check the example file: `/src/components/common/SmartAlerts.example.jsx`
2. Review this documentation
3. Check user guide: `/SMART_ALERTS_GUIDE.md`
4. Open an issue on GitHub
