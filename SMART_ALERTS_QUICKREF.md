# Smart Alerts - Quick Reference Card

## 🚀 Quick Start (30 seconds)

```javascript
// 1. Import
import { useSmartAlerts } from '../../hooks/useSmartAlerts';

// 2. Initialize
const { checkAlerts } = useSmartAlerts();

// 3. Check alerts
useEffect(() => {
  checkAlerts(trades);
}, [trades]);
```

## 📦 Components

### SmartAlertPanel
```jsx
import { SmartAlertPanel } from '../../components/common/SmartAlertPanel';

<SmartAlertPanel {...{
  alerts, activeAlerts, alertsByPriority,
  onCreateAlert: addAlert,
  onCreateFromPreset: addAlertFromPreset,
  onRemoveAlert: removeAlert,
  onResetAlert: resetAlert,
  onClearAll: clearAllAlerts,
  settings, notificationPermission,
  onUpdateSettings: updateSettings,
  onRequestNotificationPermission: requestNotificationPermission,
  ALERT_TYPES, PRIORITY_LEVELS, ALERT_PRESETS
}} />
```

### AlertNotificationCenter
```jsx
import { AlertNotificationCenter } from '../../components/common/AlertNotificationCenter';

<AlertNotificationCenter {...{
  triggeredAlerts, triggeredHistory,
  onAcknowledge: acknowledgeAlert,
  onAcknowledgeAll: acknowledgeAll,
  onClearHistory: clearHistory,
  PRIORITY_LEVELS, ALERT_TYPES
}} />
```

### QuickAlertButton
```jsx
import { QuickAlertButton } from '../../components/common/QuickAlertButton';

<QuickAlertButton {...{
  item: trade,
  onCreateAlert: addAlert,
  onCreateFromPreset: addAlertFromPreset,
  ALERT_TYPES, PRIORITY_LEVELS, ALERT_PRESETS
}} />
```

## 🎯 Alert Types

```javascript
ALERT_TYPES = {
  MARGIN_THRESHOLD: 'marginReaches',        // Most common
  NET_PROFIT_ABOVE: 'netProfitAbove',      // Popular
  VOLUME_SPIKE: 'volumeSpike',              // Market activity
  PRICE_DROP: 'priceDropBelow',             // Opportunities
  PRICE_RISE: 'priceRiseAbove',             // Opportunities
  BUY_PRICE_BELOW: 'buyPriceBelow',        // Buy signals
  SELL_PRICE_ABOVE: 'sellPriceAbove',      // Sell signals
  COMPETITION_UNDERCUT: 'competitionUndercut' // Monitoring
}
```

## 🔔 Priority Levels

```javascript
PRIORITY_LEVELS = {
  CRITICAL: 'critical',  // 🚨 3x beep, persistent
  HIGH: 'high',          // ⚠️ 2x beep
  MEDIUM: 'medium',      // 📢 1x beep (default)
  LOW: 'low'             // ℹ️ 1x beep
}
```

## ⚡ Quick Presets

```javascript
'margin_20'        // 20% Margin (High)
'margin_15'        // 15% Margin (Medium)
'price_drop_50'    // 50% Price Drop (Critical)
'volume_spike_200' // 2x Volume (High)
'high_profit_1m'   // 1M+ ISK (High)
```

## 🔧 Common Operations

### Create Alert
```javascript
addAlert({
  itemName: 'Tritanium',
  itemId: 34,
  type: ALERT_TYPES.MARGIN_THRESHOLD,
  condition: 'above',
  threshold: 20,
  priority: PRIORITY_LEVELS.HIGH,
  oneTime: true
});
```

### Create from Preset
```javascript
addAlertFromPreset('margin_20', 'Tritanium', 34);
```

### Check Alerts
```javascript
const triggered = checkAlerts(trades);
console.log(`${triggered.length} alerts triggered`);
```

### Export/Import
```javascript
// Export
const json = exportAlerts();
// Download json...

// Import
const success = importAlerts(json);
```

## 📊 Trade Data Format

```javascript
{
  'Item': 'Tritanium',      // or item
  'Item ID': 34,             // or itemId
  'Buy Price': 5.50,         // or buyPrice
  'Sell Price': 7.25,        // or sellPrice
  'Gross Margin': 31.78,     // or margin
  'Net Profit': 1250000,     // or netProfit
  'Volume': 1000000          // or volume
}
```

## 🎨 Priority Colors

```javascript
Critical: 'bg-red-500/20 text-red-400'
High:     'bg-orange-500/20 text-orange-400'
Medium:   'bg-yellow-500/20 text-yellow-400'
Low:      'bg-blue-500/20 text-blue-400'
```

## 💾 localStorage Keys

```javascript
'evetrade_smart_alerts'         // Alert configs
'evetrade_smart_alert_settings' // User settings
'evetrade_triggered_history'    // History (max 100)
```

## 🔍 Hook Return Values

```javascript
const {
  // State
  alerts,              // All alerts
  activeAlerts,        // Active only
  triggeredAlerts,     // Triggered, unacknowledged
  triggeredHistory,    // Complete history
  alertsByPriority,    // Grouped by priority
  settings,            // User preferences

  // Methods
  addAlert,
  addAlertFromPreset,
  removeAlert,
  updateAlert,
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

  // Constants
  ALERT_TYPES,
  PRIORITY_LEVELS,
  ALERT_PRESETS
} = useSmartAlerts();
```

## ⚙️ Settings

```javascript
updateSettings({
  browserNotifications: true,  // Desktop notifications
  soundEnabled: true,          // Sound alerts
  soundVolume: 0.7,            // 0-1
  groupSimilarAlerts: true,    // Reduce noise
  autoAcknowledge: false       // Auto-dismiss
});
```

## 📝 Best Practices

### Station Trading
```javascript
// High-quality trades
addAlertFromPreset('margin_20', itemName);

// Monitor competition
addAlert({
  itemName,
  type: ALERT_TYPES.COMPETITION_UNDERCUT,
  priority: PRIORITY_LEVELS.CRITICAL
});
```

### Hauling
```javascript
// Price drops at source
addAlert({
  itemName,
  type: ALERT_TYPES.PRICE_DROP,
  threshold: 0.5, // 50% of baseline
  priority: PRIORITY_LEVELS.HIGH
});
```

### Market Analysis
```javascript
// Volume spikes
addAlert({
  itemName,
  type: ALERT_TYPES.VOLUME_SPIKE,
  threshold: 2, // 2x baseline
  baselineVolume: currentVolume,
  priority: PRIORITY_LEVELS.MEDIUM,
  oneTime: false // Keep monitoring
});
```

## 🐛 Troubleshooting

### Alerts Not Triggering
```javascript
// Check alert is enabled
console.log(alert.enabled, alert.triggered);

// Verify item name matches exactly
console.log(trade['Item'], alert.itemName);

// Confirm threshold logic
console.log(currentValue, alert.condition, alert.threshold);
```

### No Notifications
```javascript
// Check permission
console.log(notificationPermission); // Should be 'granted'

// Verify settings
console.log(settings.browserNotifications); // Should be true

// Test notification
new Notification('Test'); // Should appear
```

### Performance Issues
```javascript
// Limit alerts
console.log(alerts.length); // Keep < 50

// Clear old history
clearHistory();

// Check localStorage
console.log(localStorage.length); // Monitor size
```

## 📚 Documentation

- **User Guide**: `/SMART_ALERTS_GUIDE.md`
- **Dev Docs**: `/src/components/common/SmartAlerts.README.md`
- **Implementation**: `/SMART_ALERTS_IMPLEMENTATION.md`
- **Example**: `/src/components/common/SmartAlerts.example.jsx`
- **Summary**: `/SMART_ALERTS_SUMMARY.md`

## 🎯 Integration Checklist

- [ ] Import hook
- [ ] Initialize hook
- [ ] Check alerts on data update
- [ ] Add SmartAlertPanel
- [ ] Add notification badge
- [ ] Add AlertNotificationCenter
- [ ] Add QuickAlertButton to tables
- [ ] Test all features
- [ ] Deploy
- [ ] Monitor

## 💡 Pro Tips

1. **Start Simple**: Begin with margin alerts only
2. **Use Presets**: They're optimized for common scenarios
3. **Priority Wisely**: Reserve Critical for truly important items
4. **Review Weekly**: Clean up old/unused alerts
5. **Export Often**: Backup your alert configurations
6. **Watch History**: Learn from triggered alerts
7. **Test Thoroughly**: Verify alerts trigger correctly

## 🚨 Quick Debug

```javascript
// Log alert state
console.log('Alerts:', alerts);
console.log('Triggered:', triggeredAlerts);
console.log('Settings:', settings);

// Test alert logic manually
const testResult = checkAlerts([testTrade]);
console.log('Test triggered:', testResult);

// Verify localStorage
console.log(localStorage.getItem('evetrade_smart_alerts'));
```

---

**Remember**: Quality over quantity. 5-10 well-configured alerts are better than 50 random ones!

Happy Trading! o7
