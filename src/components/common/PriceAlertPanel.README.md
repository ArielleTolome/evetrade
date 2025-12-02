# Price Alert Notification System

A comprehensive price alert system for EVETrade with localStorage persistence, toast notifications, and an intuitive management UI.

## Features

- **Create Alerts**: Set alerts for specific items based on price, margin, volume, or profit
- **Multiple Conditions**: Alert when values are above, below, or equal to thresholds
- **LocalStorage Persistence**: Alerts survive page refreshes and browser restarts
- **Browser Notifications**: Desktop notifications when alerts trigger (with permission)
- **Sound Alerts**: Customizable audio notifications with volume control
- **Toast Notifications**: Visual notifications when alerts are triggered
- **Quick Alert Creation**: Create alerts directly from trading table rows
- **Alert Management**: Full CRUD operations for alerts
- **One-Time or Recurring**: Choose whether alerts trigger once or repeatedly
- **Visual Feedback**: Badges, icons, and color coding for alert states
- **Settings Panel**: Configure notification preferences (sound, browser notifications)

## Components

### 1. `usePriceAlerts` Hook

The core hook that manages all alert state and operations.

```jsx
import { usePriceAlerts } from '../hooks/usePriceAlerts';

const {
  alerts,                        // Array of all alerts
  triggeredAlerts,               // Array of recently triggered alerts
  activeCount,                   // Number of active (not triggered) alerts
  triggeredCount,                // Number of triggered alerts
  settings,                      // Alert settings (sound, notifications)
  notificationPermission,        // Browser notification permission status
  createAlert,                   // Function to create new alert
  addAlert,                      // Alias for createAlert
  removeAlert,                   // Function to delete an alert
  updateAlert,                   // Function to update an alert
  resetAlert,                    // Function to reset a triggered alert
  checkAlerts,                   // Function to check alerts against data
  getAlerts,                     // Function to get all alerts
  clearTriggered,                // Function to clear all triggered alerts
  dismissTriggered,              // Function to dismiss a specific triggered alert
  clearAllAlerts,                // Function to clear all alerts
  updateSettings,                // Function to update alert settings
  requestNotificationPermission, // Function to request browser notification permission
} = usePriceAlerts();
```

### 2. `PriceAlertPanel` Component

Main UI component for managing alerts with settings panel.

```jsx
import { PriceAlertPanel } from '../components/common/PriceAlertPanel';

<PriceAlertPanel
  alerts={alerts}
  onCreateAlert={createAlert}
  onRemoveAlert={removeAlert}
  onResetAlert={resetAlert}
  onClearAll={clearAllAlerts}
  settings={settings}
  notificationPermission={notificationPermission}
  onUpdateSettings={updateSettings}
  onRequestNotificationPermission={requestNotificationPermission}
/>
```

**New Props:**
- `settings` - Alert notification settings object
- `notificationPermission` - Browser notification permission status
- `onUpdateSettings` - Callback to update settings
- `onRequestNotificationPermission` - Callback to request browser notification permission

### 3. `AlertNotification` Component

Displays individual triggered alerts.

```jsx
import { AlertNotification } from '../components/common/AlertNotification';

<AlertNotification
  alert={triggeredAlert}
  onDismiss={dismissTriggered}
  onViewItem={(alert) => {
    // Navigate to item or show details
  }}
/>
```

### 4. `Toast` & `ToastContainer` Components

Toast notification system (enhanced existing component).

```jsx
import { ToastContainer, useToast } from '../components/common/Toast';

const { toasts, addToast, removeToast } = useToast();

// Add a toast
addToast('Alert triggered!', 'alert', 5000);

// Render toasts
<ToastContainer toasts={toasts} onRemove={removeToast} />
```

## Alert Types

| Type | Description | Format |
|------|-------------|--------|
| `margin` | Gross margin percentage | `15.50%` |
| `profit` | Net profit in ISK | `1,234,567 ISK` |
| `buyPrice` | Buy price in ISK | `500,000 ISK` |
| `sellPrice` | Sell price in ISK | `750,000 ISK` |
| `volume` | Trading volume | `1,234` |

## Conditions

| Condition | Description |
|-----------|-------------|
| `above` | Trigger when value is above threshold |
| `below` | Trigger when value is below threshold |
| `equals` | Trigger when value equals threshold (±0.01) |

## Usage Examples

### Basic Integration

```jsx
import { useState, useEffect } from 'react';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { PriceAlertPanel } from '../components/common/PriceAlertPanel';
import { ToastContainer, useToast } from '../components/common/Toast';

function TradingPage() {
  const [trades, setTrades] = useState([]);
  const { alerts, createAlert, checkAlerts, dismissTriggered } = usePriceAlerts();
  const { toasts, addToast, removeToast } = useToast();

  // Check alerts when trades update
  useEffect(() => {
    if (trades.length > 0) {
      const triggered = checkAlerts(trades);
      triggered.forEach(alert => {
        addToast(`Alert: ${alert.itemName}`, 'alert');
      });
    }
  }, [trades, checkAlerts, addToast]);

  return (
    <div>
      <PriceAlertPanel alerts={alerts} onCreateAlert={createAlert} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
```

### Creating Alerts Programmatically

```jsx
// Create a margin alert
createAlert({
  itemName: 'Tritanium',
  itemId: 34,
  type: 'margin',
  condition: 'above',
  threshold: 15.0,
  oneTime: true,
});

// Create a volume alert
createAlert({
  itemName: 'Veldspar',
  type: 'volume',
  condition: 'above',
  threshold: 10000,
  oneTime: false, // Recurring
});

// Create a profit alert
createAlert({
  itemName: 'PLEX',
  type: 'profit',
  condition: 'above',
  threshold: 100000000, // 100M ISK
  oneTime: true,
});
```

### Quick Alert from Table Row

The `TradingTable` component now supports quick alert creation directly from rows:

```jsx
import { TradingTable } from '../components/tables/TradingTable';
import { usePriceAlerts } from '../hooks/usePriceAlerts';

function TradingPage() {
  const { createAlert } = usePriceAlerts();
  const [trades, setTrades] = useState([]);

  return (
    <TradingTable
      data={trades}
      columns={columns}
      onCreateAlert={createAlert}  // Enable quick alert buttons
    />
  );
}
```

The table will automatically add an "Alert" column with bell icons. When clicked, it creates an alert with:
- Item name and ID from the row
- Alert type set to 'margin'
- Condition set to 'above'
- Threshold set to the current margin value

### Alert with Custom Notification

```jsx
const { checkAlerts } = usePriceAlerts();
const { addToast } = useToast();

useEffect(() => {
  if (trades.length > 0) {
    const triggered = checkAlerts(trades);

    triggered.forEach(alert => {
      const message = `${alert.itemName}: ${alert.type} is ${alert.condition} ${formatThreshold(alert.threshold, alert.type)}`;
      addToast(message, 'alert', 8000);
    });
  }
}, [trades, checkAlerts, addToast]);
```

### Managing Notification Settings

```jsx
const {
  settings,
  notificationPermission,
  updateSettings,
  requestNotificationPermission,
} = usePriceAlerts();

// Request browser notification permission
const handleEnableNotifications = async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    updateSettings({ browserNotifications: true });
  }
};

// Toggle sound alerts
const handleToggleSound = () => {
  updateSettings({ soundEnabled: !settings.soundEnabled });
};

// Adjust volume
const handleVolumeChange = (volume) => {
  updateSettings({ soundVolume: volume });
};
```

## Data Format

### Alert Object

```typescript
{
  id: string;                // Unique ID (timestamp)
  itemName: string;          // Item name (required)
  itemId?: string | number;  // Item ID (optional)
  type: AlertType;           // margin | profit | buyPrice | sellPrice | volume
  condition: Condition;      // above | below | equals
  threshold: number;         // Threshold value
  oneTime: boolean;          // One-time or recurring
  triggered: boolean;        // Whether alert has triggered
  createdAt: string;         // ISO timestamp
  triggeredAt?: string;      // ISO timestamp (when triggered)
}
```

### Trade Data Format

The alert system expects trade objects with these properties:

```typescript
{
  'Item': string;           // or item
  'Item ID'?: number;       // or itemId
  'Gross Margin'?: number;  // or margin (percentage)
  'Net Profit'?: number;    // or netProfit (ISK)
  'Buy Price'?: number;     // or buyPrice (ISK)
  'Sell Price'?: number;    // or sellPrice (ISK)
  'Volume'?: number;        // or volume
}
```

## Styling

The components use EVETrade's space theme with these key colors:

- **Active Alerts**: `accent-cyan` (#00d4ff)
- **Triggered Alerts**: `accent-gold` (#ffd700)
- **One-time Badge**: `accent-purple` (#8b5cf6)
- **Delete Actions**: Red variants
- **Backgrounds**: `space-dark`, `space-mid` with transparency

## LocalStorage

Alerts and settings are persisted to localStorage:

**Alerts Storage** (`evetrade_price_alerts`):
```javascript
localStorage.setItem('evetrade_price_alerts', JSON.stringify([
  {
    id: '1701234567890',
    itemName: 'Tritanium',
    type: 'margin',
    condition: 'above',
    threshold: 15.0,
    oneTime: true,
    triggered: false,
    createdAt: '2025-12-01T12:00:00.000Z',
  },
  // ... more alerts
]));
```

**Settings Storage** (`evetrade_alert_settings`):
```javascript
localStorage.setItem('evetrade_alert_settings', JSON.stringify({
  browserNotifications: false,  // Enable/disable browser notifications
  soundEnabled: true,           // Enable/disable sound alerts
  soundVolume: 0.5,             // Volume level (0.0 to 1.0)
}));
```

## Best Practices

1. **Check Alerts on Data Load**: Call `checkAlerts(trades)` whenever new trading data is loaded
2. **Request Permissions Early**: Request notification permissions during user onboarding or setup
3. **Sound Settings**: Provide volume control for sound alerts to avoid annoying users
4. **Toast Duration**: Use 5-8 seconds for alert notifications
5. **Alert Limits**: Consider limiting the number of active alerts (e.g., 20-50)
6. **Performance**: `checkAlerts` is optimized but avoid calling it too frequently
7. **User Feedback**: Always show confirmation for destructive actions (clear all, delete)
8. **Mobile Support**: Panel is responsive and works on mobile devices
9. **Browser Support**: Check for `Notification` API availability before using browser notifications

## Advanced Features

### Batch Alert Creation

```jsx
const createAlertsForTopItems = (topTrades) => {
  topTrades.slice(0, 10).forEach(trade => {
    createAlert({
      itemName: trade['Item'],
      itemId: trade['Item ID'],
      type: 'margin',
      condition: 'above',
      threshold: trade['Gross Margin'] * 1.2,
      oneTime: false,
    });
  });
};
```

### Alert Statistics

```jsx
const getAlertStats = (alerts) => {
  return {
    total: alerts.length,
    active: alerts.filter(a => !a.triggered).length,
    triggered: alerts.filter(a => a.triggered).length,
    byType: {
      margin: alerts.filter(a => a.type === 'margin').length,
      profit: alerts.filter(a => a.type === 'profit').length,
      // ... etc
    },
  };
};
```

### Export/Import Alerts

```jsx
// Export
const exportAlerts = (alerts) => {
  const dataStr = JSON.stringify(alerts, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'evetrade-alerts.json';
  link.click();
};

// Import
const importAlerts = async (file) => {
  const text = await file.text();
  const importedAlerts = JSON.parse(text);
  importedAlerts.forEach(alert => createAlert(alert));
};
```

## Troubleshooting

### Alerts Not Triggering

1. Check that trade data format matches expected format
2. Ensure `checkAlerts(trades)` is being called with valid data
3. Verify alert thresholds are reasonable
4. Check browser console for errors

### LocalStorage Issues

1. Check if localStorage is available (private browsing may block it)
2. Clear localStorage if corrupted: `localStorage.removeItem('evetrade_price_alerts')`
3. Check storage quota (unlikely with alerts)

### Performance Issues

1. Limit number of active alerts (50-100 max recommended)
2. Debounce `checkAlerts` calls if called frequently
3. Use memo/useMemo for expensive calculations

## Files

- `/src/hooks/usePriceAlerts.jsx` - Main hook
- `/src/components/common/PriceAlertPanel.jsx` - Management UI
- `/src/components/common/AlertNotification.jsx` - Notification component
- `/src/components/common/Toast.jsx` - Toast system (enhanced)
- `/src/components/common/PriceAlertPanel.example.jsx` - Usage examples

## Recent Enhancements (Completed)

- ✅ **Browser Notifications**: Desktop notifications with Notification API
- ✅ **Sound Alerts**: Audio notifications with customizable volume
- ✅ **Settings Panel**: Centralized notification preferences
- ✅ **Quick Alerts**: Create alerts directly from trading table rows
- ✅ **LocalStorage Persistence**: Settings persist across sessions

## Future Enhancements

- Email/SMS notifications (requires backend)
- Alert templates (save common alert patterns)
- Alert groups/categories
- Price history charts in alerts
- Bulk edit operations
- Alert sharing/export
- Custom sound files
- Alert conditions: percentage change over time
- Alert preview/test functionality

## License

Part of EVETrade - see main repository license.
