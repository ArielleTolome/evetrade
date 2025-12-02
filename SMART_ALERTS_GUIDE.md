# Smart Alert System - User Guide

The Smart Alert System provides powerful, actionable price alerts for EVE Online trading, helping you catch profitable opportunities and track market changes in real-time.

## Features Overview

### 1. Multiple Alert Types

- **Price Drop Below** - Alert when an item's price drops below a threshold
- **Price Rise Above** - Alert when an item's price rises above a threshold
- **Margin Threshold** - Alert when profit margin reaches a specific percentage
- **Volume Spike** - Alert when trading volume increases significantly
- **Competition Undercut** - Alert when margins drop due to competition
- **Buy Price Below** - Alert when buy orders drop below a threshold
- **Sell Price Above** - Alert when sell orders rise above a threshold
- **Net Profit Above** - Alert when net profit exceeds a threshold

### 2. Priority Levels

Each alert can be assigned a priority level that affects notifications:

- **Critical** 🚨 - Highest priority, persistent notifications, triple beep
- **High** ⚠️ - Important alerts, double beep
- **Medium** 📢 - Standard alerts, single beep
- **Low** ℹ️ - Informational alerts, single beep

Higher priority alerts play louder and more frequent notification sounds to grab your attention.

### 3. Quick Presets

Pre-configured alert templates for common scenarios:

- **20% Margin Opportunity** - Alert for excellent profit margins (High priority)
- **15% Margin Opportunity** - Alert for good profit margins (Medium priority)
- **50% Price Drop** - Alert for significant price drops (Critical priority)
- **Volume Spike (2x)** - Alert when volume doubles (High priority)
- **High Profit (1M+ ISK)** - Alert for million ISK+ profits (High priority)

### 4. Smart Threshold Calculation

The system can calculate optimal alert thresholds based on:
- Item volatility
- Historical price ranges
- Standard deviation
- Current market conditions

### 5. Notification Center

- View all triggered alerts
- See complete alert history
- Quick actions for each alert:
  - Copy item name to clipboard
  - Add to watchlist
  - View in market
  - Acknowledge/dismiss
- Filter by priority or type
- Mark all as read

### 6. Quick Alert Button

Add alerts directly from any trade row with:
- One-click preset application
- Pre-filled current prices
- Suggested thresholds based on current data
- Custom alert creation

## Getting Started

### Step 1: Enable Browser Notifications (Optional)

1. Click the settings icon in the Smart Alert Panel
2. Click "Enable" next to "Browser Notifications"
3. Allow notifications when prompted by your browser

### Step 2: Create Your First Alert

**Option A: Using Quick Presets**

1. Find an item you want to track in the trading table
2. Click the bell icon (🔔) in the Actions column
3. Select a preset like "20% Margin Opportunity"
4. Done! The alert is now active

**Option B: Custom Alert**

1. Click "+ New Alert" in the Smart Alert Panel
2. Enter the item name and ID (optional)
3. Choose alert type (e.g., "Margin")
4. Set condition (above/below/equals)
5. Enter threshold value
6. Select priority level
7. Choose if it's a one-time alert
8. Click "Create Alert"

**Option C: Quick Alert Button**

1. Click the bell icon next to any trade item
2. Select a preset or "Create Custom Alert"
3. For custom alerts, the form is pre-filled with current prices
4. Adjust threshold and priority as needed
5. Click "Create Alert"

### Step 3: Monitor Alerts

The system automatically checks your alerts against current market data. When an alert triggers:

1. **Sound notification** plays (if enabled)
2. **Browser notification** appears (if enabled)
3. **Notification center** badge updates
4. **Alert appears in notification center** with one-click actions

## Advanced Features

### Grouping Similar Alerts

Enable "Group Similar Alerts" in settings to reduce notification noise. The system will combine multiple alerts of the same type into a single notification.

### Auto-Acknowledge

Enable "Auto-acknowledge Alerts" to automatically dismiss triggered alerts after 5 seconds. Useful if you just want quick notifications without manual cleanup.

### Alert Filtering

Filter alerts by:
- **Priority**: Show only Critical, High, Medium, or Low priority alerts
- **Type**: Filter by specific alert types (Margin, Volume, Price, etc.)

### Export/Import Alerts

**Export your alert configurations:**
1. Click "Export Alerts" button
2. Save the JSON file to your computer
3. Share with other players or backup for later

**Import alert configurations:**
1. Click "Import Alerts" button
2. Select a previously exported JSON file
3. All alerts and settings are restored

### One-Time vs Recurring Alerts

- **One-Time Alerts**: Trigger once, then automatically disable. Perfect for catching specific opportunities.
- **Recurring Alerts**: Continue triggering each time conditions are met. Good for ongoing monitoring.

### Alert History

View your complete alert history in the Notification Center:
1. Click "Show History" to see all past triggered alerts
2. Review when and why alerts triggered
3. Analyze patterns in market behavior
4. Clear history when no longer needed

## Best Practices

### For Station Trading

1. Set **Margin Threshold** alerts at 15-20% for quality trades
2. Use **Competition Undercut** alerts to monitor your active listings
3. Set **Volume Spike** alerts to catch sudden demand increases
4. Enable **Critical priority** for margin alerts above 25%

### For Hauling

1. Set **Price Drop** alerts on popular items you haul
2. Use **Buy Price Below** alerts to catch cheap items in source stations
3. Set **Sell Price Above** alerts for destination station opportunities
4. Use **Medium priority** for regular monitoring

### For Market Analysis

1. Track 10-20 high-volume items with **Volume Spike** alerts
2. Set **Price Rise/Drop** alerts on strategic materials
3. Use **Low priority** for long-term tracking items
4. Review alert history weekly to identify trends

### Alert Management

1. **Don't over-alert**: Start with 5-10 carefully chosen alerts
2. **Use priority wisely**: Reserve Critical for truly important opportunities
3. **Review regularly**: Check and clean up triggered alerts weekly
4. **Adjust thresholds**: Fine-tune based on what actually triggers
5. **Export backups**: Save your alert configurations monthly

## Troubleshooting

### Alerts Not Triggering

- Verify the alert is enabled (not disabled or triggered)
- Check filter settings in the alert list
- Ensure the item name matches exactly
- Confirm current market data is loading

### No Notifications Appearing

- Check browser notification permissions
- Verify "Browser Notifications" is enabled in settings
- Check system Do Not Disturb settings
- Try refreshing the page

### Sound Not Playing

- Verify "Sound Notifications" is enabled
- Check sound volume slider (not set to 0)
- Ensure browser allows audio playback
- Try clicking the page first (some browsers require interaction)

### Too Many Notifications

- Enable "Group Similar Alerts" in settings
- Increase alert thresholds to reduce frequency
- Use higher priority levels only for critical items
- Enable "Auto-acknowledge" for quick dismissal

## Keyboard Shortcuts

When the notification center is open:

- **Escape** - Close notification center
- **A** - Acknowledge all alerts
- **H** - Toggle between active/history view
- **C** - Clear history (when in history view)

## Integration with Other Features

### Watchlist Integration

Alerts work seamlessly with the watchlist:
- Add alerted items to watchlist with one click
- Set alerts on watched items
- Track price changes for alerted items

### Trading Table Integration

- Quick alert button on every trade row
- Pre-filled with current market data
- Suggested thresholds based on item statistics

### Session Timer Integration

Alerts persist across sessions:
- Set alerts before logging out
- Get notifications when you return
- Review triggered alerts from previous sessions

## API Reference

See `/src/hooks/useSmartAlerts.jsx` for the complete API.

### Key Methods

```javascript
const {
  // State
  alerts,              // All alerts
  activeAlerts,        // Enabled, non-triggered alerts
  triggeredAlerts,     // Recently triggered alerts
  triggeredHistory,    // Complete trigger history

  // Alert Management
  addAlert,            // Create new alert
  addAlertFromPreset,  // Create from preset
  removeAlert,         // Delete alert
  updateAlert,         // Modify alert
  resetAlert,          // Reset triggered alert

  // Alert Checking
  checkAlerts,         // Check alerts against market data

  // Notifications
  acknowledgeAlert,    // Mark alert as read
  acknowledgeAll,      // Mark all as read

  // Settings
  updateSettings,      // Update preferences
  requestNotificationPermission, // Request browser permission

  // Import/Export
  exportAlerts,        // Export to JSON
  importAlerts,        // Import from JSON

} = useSmartAlerts();
```

## Data Persistence

All alerts and settings are stored in localStorage:
- **Alerts**: Persist across browser sessions
- **Settings**: Saved automatically
- **History**: Limited to 100 most recent triggers
- **Cross-tab sync**: Changes sync across browser tabs

## Privacy & Security

- All data stored locally in your browser
- No data sent to external servers
- Export files contain only your alert configurations
- Clear history to remove all stored data

## Support & Feedback

For issues or feature requests:
1. Check this guide first
2. Review the example integration file
3. Check browser console for errors
4. Report issues on GitHub

## Future Enhancements

Planned features:
- [ ] Mobile app notifications
- [ ] Discord webhook integration
- [ ] Slack notifications
- [ ] Email alerts
- [ ] Advanced analytics on alert patterns
- [ ] Machine learning threshold suggestions
- [ ] Alert templates for specific trading strategies
- [ ] Multi-region alert support

---

**Pro Tip**: Start simple with a few high-priority margin alerts, then expand as you learn what works best for your trading style!
