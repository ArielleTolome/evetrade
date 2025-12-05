# Price Alerts - Quick Start Guide

Get price alerts up and running in your EVETrade page in 5 minutes.

## Step 1: Import the Hook and Components

```jsx
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { PriceAlertPanel } from '../components/common/PriceAlertPanel';
import { useToast } from '../components/common/ToastProvider';
```

## Step 2: Initialize in Your Component

```jsx
function YourTradingPage() {
  const [trades, setTrades] = useState([]);
  
  // Initialize alerts
  const {
    alerts,
    createAlert,
    removeAlert,
    resetAlert,
    checkAlerts,
    clearAllAlerts,
  } = usePriceAlerts();
  
  // Initialize toasts
  const { warning } = useToast();
}
```

## Step 3: Check Alerts When Data Updates

```jsx
useEffect(() => {
  if (trades.length > 0) {
    const triggered = checkAlerts(trades);
    
    // Show toast for each triggered alert
    triggered.forEach(alert => {
      warning(`Alert: ${alert.itemName}`, { duration: 5000 });
    });
  }
}, [trades, checkAlerts, warning]);
```

## Step 4: Add UI Components

```jsx
return (
  <div>
    {/* Your existing page content */}
    
    {/* Alert Management Panel */}
    <PriceAlertPanel
      alerts={alerts}
      onCreateAlert={createAlert}
      onRemoveAlert={removeAlert}
      onResetAlert={resetAlert}
      onClearAll={clearAllAlerts}
    />
  </div>
);
```

## Complete Example

```jsx
import { useState, useEffect } from 'react';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { PriceAlertPanel } from '../components/common/PriceAlertPanel';
import { useToast } from '../components/common/ToastProvider';

function StationTradingPageWithAlerts() {
  const [trades, setTrades] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  
  const {
    alerts,
    activeCount,
    createAlert,
    removeAlert,
    resetAlert,
    checkAlerts,
    clearAllAlerts,
  } = usePriceAlerts();
  
  const { warning } = useToast();
  
  // Check alerts when data updates
  useEffect(() => {
    if (trades.length > 0) {
      const triggered = checkAlerts(trades);
      triggered.forEach(alert => {
        warning(`Alert: ${alert.itemName}`, { duration: 5000 });
      });
    }
  }, [trades, checkAlerts, warning]);
  
  return (
    <div className="min-h-screen bg-space-black p-6">
      {/* Header with Alert Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Station Trading
        </h1>
        
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold transition-all hover:bg-accent-gold/20"
        >
          Alerts {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>
      
      {/* Collapsible Alert Panel */}
      {showAlerts && (
        <div className="mb-6">
          <PriceAlertPanel
            alerts={alerts}
            onCreateAlert={createAlert}
            onRemoveAlert={removeAlert}
            onResetAlert={resetAlert}
            onClearAll={clearAllAlerts}
          />
        </div>
      )}
      
      {/* Your existing trading form and table */}
      {/* ... */}
    </div>
  );
}

export default StationTradingPageWithAlerts;
```

## Common Use Cases

### 1. Alert on High Margin Items

```jsx
// Create alert for items with margin above 15%
createAlert({
  itemName: 'Tritanium',
  type: 'margin',
  condition: 'above',
  threshold: 15.0,
  oneTime: false,
});
```

### 2. Alert on Low Volume (Restocking)

```jsx
// Alert when volume drops below threshold
createAlert({
  itemName: 'Veldspar',
  type: 'volume',
  condition: 'below',
  threshold: 1000,
  oneTime: true,
});
```

### 3. Alert on Profitable Trades

```jsx
// Alert on high profit opportunities
createAlert({
  itemName: 'PLEX',
  type: 'profit',
  condition: 'above',
  threshold: 50000000, // 50M ISK
  oneTime: false,
});
```

### 4. Quick Alert from Table

Add this to each table row:

```jsx
<button
  onClick={() => {
    createAlert({
      itemName: row['Item'],
      itemId: row['Item ID'],
      type: 'margin',
      condition: 'above',
      threshold: row['Gross Margin'] * 1.1,
      oneTime: false,
    });
  }}
  className="text-accent-cyan hover:text-accent-cyan/80"
>
  + Alert
</button>
```

## Tips

1. **Position the Panel**: Place `PriceAlertPanel` where it makes sense for your layout (header, sidebar, modal, etc.)
2. **Auto-check**: Always check alerts when data updates
3. **User Feedback**: Use toasts for immediate feedback
4. **Confirmation**: Confirm before clearing all alerts
5. **Mobile**: Panel is responsive, works great on mobile

## Need Help?

See the full documentation: `PriceAlertPanel.README.md`
See examples: `PriceAlertPanel.example.jsx`

## That's It!

You now have a fully functional price alert system with:
- ✅ localStorage persistence
- ✅ Toast notifications
- ✅ Full CRUD operations
- ✅ Responsive UI
- ✅ Multiple alert types

Happy trading! 🚀
