# Smart Alerts System - Implementation Checklist

## Overview

This document provides a step-by-step guide for integrating the Smart Alerts system into EVETrade pages.

## Created Files

### Core Files
- ✅ `/src/hooks/useSmartAlerts.jsx` - Main alert logic and state management
- ✅ `/src/components/common/SmartAlertPanel.jsx` - Alert configuration UI
- ✅ `/src/components/common/AlertNotificationCenter.jsx` - Notification center UI
- ✅ `/src/components/common/QuickAlertButton.jsx` - Inline alert creation button

### Documentation
- ✅ `/SMART_ALERTS_GUIDE.md` - User guide
- ✅ `/src/components/common/SmartAlerts.README.md` - Developer documentation
- ✅ `/src/components/common/SmartAlerts.example.jsx` - Integration example

## Integration Steps

### Step 1: Basic Integration (Required)

1. **Import the hook in your trading page:**
   ```javascript
   import { useSmartAlerts } from '../../hooks/useSmartAlerts';
   ```

2. **Initialize the hook:**
   ```javascript
   const {
     alerts,
     triggeredAlerts,
     addAlert,
     checkAlerts,
     ALERT_TYPES,
     PRIORITY_LEVELS,
     ALERT_PRESETS,
     // ... other exports
   } = useSmartAlerts();
   ```

3. **Check alerts when trade data updates:**
   ```javascript
   useEffect(() => {
     if (trades && trades.length > 0) {
       checkAlerts(trades);
     }
   }, [trades, checkAlerts]);
   ```

### Step 2: Add Alert Panel (Required)

1. **Import the component:**
   ```javascript
   import { SmartAlertPanel } from '../../components/common/SmartAlertPanel';
   ```

2. **Add to your page layout:**
   ```jsx
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
   ```

### Step 3: Add Notification Center (Optional but Recommended)

1. **Import the component:**
   ```javascript
   import { AlertNotificationCenter } from '../../components/common/AlertNotificationCenter';
   ```

2. **Add state for visibility:**
   ```javascript
   const [showNotificationCenter, setShowNotificationCenter] = useState(false);
   ```

3. **Add notification badge to header:**
   ```jsx
   <button
     onClick={() => setShowNotificationCenter(!showNotificationCenter)}
     className="relative px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold"
   >
     Notifications
     {triggeredAlerts.length > 0 && (
       <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
         {triggeredAlerts.length}
       </span>
     )}
   </button>
   ```

4. **Render the notification center:**
   ```jsx
   {showNotificationCenter && (
     <AlertNotificationCenter
       triggeredAlerts={triggeredAlerts}
       triggeredHistory={triggeredHistory}
       onAcknowledge={acknowledgeAlert}
       onAcknowledgeAll={acknowledgeAll}
       onClearHistory={clearHistory}
       PRIORITY_LEVELS={PRIORITY_LEVELS}
       ALERT_TYPES={ALERT_TYPES}
     />
   )}
   ```

### Step 4: Add Quick Alert Buttons (Optional but Recommended)

1. **Import the component:**
   ```javascript
   import { QuickAlertButton } from '../../components/common/QuickAlertButton';
   ```

2. **Add to your TradingTable or custom table:**
   ```jsx
   // In your table's actions column
   <QuickAlertButton
     item={trade}
     onCreateAlert={addAlert}
     onCreateFromPreset={addAlertFromPreset}
     ALERT_TYPES={ALERT_TYPES}
     PRIORITY_LEVELS={PRIORITY_LEVELS}
     ALERT_PRESETS={ALERT_PRESETS}
   />
   ```

3. **Update TradingTable component (if needed):**
   - Pass `onCreateAlert`, `onCreateFromPreset`, and constants as props
   - Add QuickAlertButton to the actions column

### Step 5: Add Watchlist Integration (Optional)

1. **Import watchlist hook:**
   ```javascript
   import { useWatchlist } from '../../hooks/useWatchlist';
   const { addToWatchlist } = useWatchlist();
   ```

2. **Create handler:**
   ```javascript
   const handleAddToWatchlist = (itemName, itemId) => {
     addToWatchlist(itemName, itemId);
     // Optional: show toast notification
   };
   ```

3. **Pass to notification center:**
   ```jsx
   <AlertNotificationCenter
     // ... other props
     onAddToWatchlist={handleAddToWatchlist}
   />
   ```

### Step 6: Add Export/Import (Optional)

1. **Add export button:**
   ```jsx
   <button
     onClick={() => {
       const json = exportAlerts();
       const blob = new Blob([json], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `evetrade-alerts-${Date.now()}.json`;
       a.click();
       URL.revokeObjectURL(url);
     }}
   >
     Export Alerts
   </button>
   ```

2. **Add import button:**
   ```jsx
   <label>
     Import Alerts
     <input
       type="file"
       accept=".json"
       onChange={(e) => {
         const file = e.target.files?.[0];
         if (file) {
           const reader = new FileReader();
           reader.onload = (event) => {
             const json = event.target?.result;
             if (json && typeof json === 'string') {
               const success = importAlerts(json);
               alert(success ? 'Success!' : 'Failed to import');
             }
           };
           reader.readAsText(file);
         }
       }}
       className="hidden"
     />
   </label>
   ```

## Pages to Update

### Priority 1 (Most Used)
- [ ] `/src/pages/StationTradingPage.jsx`
- [ ] `/src/pages/StationHaulingPage.jsx`

### Priority 2 (Frequently Used)
- [ ] `/src/pages/RegionHaulingPage.jsx`
- [ ] `/src/pages/PortfolioPage.jsx`

### Priority 3 (Optional)
- [ ] `/src/pages/OrdersPage.jsx`

## Testing Checklist

### Functionality Tests
- [ ] Create alert from SmartAlertPanel
- [ ] Create alert from quick preset
- [ ] Create alert from QuickAlertButton
- [ ] Alert triggers when conditions are met
- [ ] Browser notification appears (if enabled)
- [ ] Sound notification plays (if enabled)
- [ ] Alert appears in notification center
- [ ] Acknowledge individual alert
- [ ] Acknowledge all alerts
- [ ] View alert history
- [ ] Clear alert history
- [ ] Delete alert
- [ ] Reset triggered alert
- [ ] Export alerts to JSON
- [ ] Import alerts from JSON
- [ ] Add alerted item to watchlist
- [ ] Copy item name to clipboard

### UI/UX Tests
- [ ] Alert panel displays correctly
- [ ] Notification center displays correctly
- [ ] Quick alert button menu opens correctly
- [ ] Priority badges display correct colors
- [ ] Alert types display correct labels
- [ ] Filters work correctly
- [ ] Settings save and persist
- [ ] Responsive design works on mobile
- [ ] Dark theme compatibility

### Browser Tests
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Edge Cases
- [ ] No alerts configured
- [ ] Many alerts (50+)
- [ ] Very long item names
- [ ] Duplicate alerts
- [ ] Invalid threshold values
- [ ] Missing item data
- [ ] No notification permission
- [ ] localStorage full

## Performance Checklist

- [ ] Alert checking doesn't slow down data updates
- [ ] No memory leaks from notifications
- [ ] localStorage usage within limits
- [ ] Notification sounds don't overlap excessively
- [ ] UI remains responsive with many alerts

## Documentation Review

- [ ] Read SMART_ALERTS_GUIDE.md
- [ ] Read SmartAlerts.README.md
- [ ] Review SmartAlerts.example.jsx
- [ ] Understand all alert types
- [ ] Understand priority levels
- [ ] Know all quick presets

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Browser notifications tested
- [ ] Sound notifications tested
- [ ] Export/import tested
- [ ] Mobile responsiveness verified

### Post-deployment
- [ ] Monitor for errors in production
- [ ] Gather user feedback
- [ ] Track alert usage metrics
- [ ] Monitor localStorage usage
- [ ] Check notification delivery rates

## Rollback Plan

If issues occur after deployment:

1. **Temporary disable alerts:**
   ```javascript
   // In affected pages, comment out alert checking
   // useEffect(() => {
   //   checkAlerts(trades);
   // }, [trades]);
   ```

2. **Remove components:**
   - Comment out SmartAlertPanel
   - Comment out AlertNotificationCenter
   - Comment out QuickAlertButton

3. **Keep data intact:**
   - Alert configurations remain in localStorage
   - Users can re-enable after fix

## Future Enhancements

Based on SMART_ALERTS_GUIDE.md, consider implementing:

1. **Phase 1** (High Priority)
   - Mobile app notifications
   - Discord webhook integration
   - Advanced analytics dashboard

2. **Phase 2** (Medium Priority)
   - Email alerts
   - Slack notifications
   - Multi-region alert support

3. **Phase 3** (Low Priority)
   - Machine learning threshold suggestions
   - Alert templates for trading strategies
   - Community alert sharing

## Support Resources

- User Guide: `/SMART_ALERTS_GUIDE.md`
- Developer Docs: `/src/components/common/SmartAlerts.README.md`
- Example Integration: `/src/components/common/SmartAlerts.example.jsx`
- GitHub Issues: For bug reports and feature requests

## Success Metrics

Track these metrics after implementation:

- Number of alerts created per user
- Most popular alert types
- Most popular presets
- Alert trigger rate
- Notification acknowledgement rate
- Average alerts per user
- Alert export/import usage
- User retention improvement
- Trading success correlation

---

**Note**: This is a comprehensive system. Start with basic integration (Steps 1-2) and gradually add optional features based on user feedback and needs.
