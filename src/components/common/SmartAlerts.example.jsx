/**
 * Smart Alerts System - Integration Example
 *
 * This example shows how to integrate the enhanced alert system into your trading pages.
 * The smart alert system provides:
 * - Multiple alert types (price drops, margin thresholds, volume spikes, etc.)
 * - Priority levels (Critical, High, Medium, Low)
 * - Quick presets for common alert scenarios
 * - Notification center with history
 * - Quick alert buttons in trade rows
 * - Smart threshold calculations based on item volatility
 */

import { useState, useEffect } from 'react';
import { useSmartAlerts } from '../../hooks/useSmartAlerts';
import { SmartAlertPanel } from './SmartAlertPanel';
import { AlertNotificationCenter } from './AlertNotificationCenter';
import { QuickAlertButton } from './QuickAlertButton';
import { useWatchlist } from '../../hooks/useWatchlist';

/**
 * Example Page Component with Smart Alerts Integration
 */
export function StationTradingPageWithAlerts() {
  const [trades, _setTrades] = useState([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Initialize smart alerts hook
  const {
    alerts,
    activeAlerts,
    triggeredAlerts,
    acknowledgedAlerts: _acknowledgedAlerts,
    triggeredHistory,
    settings,
    notificationPermission,
    alertsByPriority,
    addAlert,
    addAlertFromPreset,
    removeAlert,
    updateAlert,
    resetAlert,
    clearAllAlerts,
    checkAlerts,
    calculateOptimalThreshold,
    acknowledgeAlert,
    acknowledgeAll,
    clearHistory,
    updateSettings,
    requestNotificationPermission,
    exportAlerts,
    importAlerts,
    ALERT_TYPES,
    PRIORITY_LEVELS,
    ALERT_PRESETS,
  } = useSmartAlerts();

  // Initialize watchlist hook
  const { addToWatchlist } = useWatchlist();

  // Check alerts whenever trades data changes
  useEffect(() => {
    if (trades && trades.length > 0) {
      const triggered = checkAlerts(trades);
      if (triggered.length > 0) {
        console.log(`${triggered.length} alert(s) triggered!`, triggered);
        // Optionally show notification center when alerts trigger
        setShowNotificationCenter(true);
      }
    }
  }, [trades, checkAlerts]);

  // Handle copying item name to clipboard
  const handleCopyItemName = (itemName) => {
    console.log(`Copied item name: ${itemName}`);
    // Could show a toast notification here
  };

  // Handle adding item to watchlist from notification center
  const handleAddToWatchlist = (itemName, itemId) => {
    addToWatchlist(itemName, itemId);
    console.log(`Added ${itemName} to watchlist`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header with Notification Badge */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Station Trading
        </h1>

        {/* Notification Badge */}
        <button
          type="button"
          onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          className="relative px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold transition-all hover:bg-accent-gold/20"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Notifications</span>
            {triggeredAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {triggeredAlerts.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Notification Center (conditional) */}
      {showNotificationCenter && (
        <div className="mb-8">
          <AlertNotificationCenter
            triggeredAlerts={triggeredAlerts}
            triggeredHistory={triggeredHistory}
            onAcknowledge={acknowledgeAlert}
            onAcknowledgeAll={acknowledgeAll}
            onClearHistory={clearHistory}
            onAddToWatchlist={handleAddToWatchlist}
            onCopyItemName={handleCopyItemName}
            PRIORITY_LEVELS={PRIORITY_LEVELS}
            ALERT_TYPES={ALERT_TYPES}
          />
        </div>
      )}

      {/* Smart Alert Panel */}
      <div className="mb-8">
        <SmartAlertPanel
          alerts={alerts}
          activeAlerts={activeAlerts}
          alertsByPriority={alertsByPriority}
          onCreateAlert={addAlert}
          onCreateFromPreset={addAlertFromPreset}
          onRemoveAlert={removeAlert}
          onResetAlert={resetAlert}
          onUpdateAlert={updateAlert}
          onClearAll={clearAllAlerts}
          settings={settings}
          notificationPermission={notificationPermission}
          onUpdateSettings={updateSettings}
          onRequestNotificationPermission={requestNotificationPermission}
          ALERT_TYPES={ALERT_TYPES}
          PRIORITY_LEVELS={PRIORITY_LEVELS}
          ALERT_PRESETS={ALERT_PRESETS}
          onCalculateOptimalThreshold={calculateOptimalThreshold}
        />
      </div>

      {/* Trading Results Table (example with QuickAlertButton) */}
      <div className="bg-space-dark/30 rounded-xl border border-accent-cyan/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-space-mid/50 border-b border-accent-cyan/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Item</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Buy Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Sell Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Margin</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">Net Profit</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, index) => (
                <tr key={index} className="border-b border-accent-cyan/5 hover:bg-space-mid/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-text-primary">
                    {trade['Item'] || trade.item}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-text-primary font-mono">
                    {(trade['Buy Price'] || trade.buyPrice || 0).toLocaleString()} ISK
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-text-primary font-mono">
                    {(trade['Sell Price'] || trade.sellPrice || 0).toLocaleString()} ISK
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-green-400 font-mono">
                    {(trade['Gross Margin'] || trade.margin || 0).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-accent-gold font-mono">
                    {(trade['Net Profit'] || trade.netProfit || 0).toLocaleString()} ISK
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Quick Alert Button */}
                      <QuickAlertButton
                        item={trade}
                        onCreateAlert={addAlert}
                        onCreateFromPreset={addAlertFromPreset}
                        ALERT_TYPES={ALERT_TYPES}
                        PRIORITY_LEVELS={PRIORITY_LEVELS}
                        ALERT_PRESETS={ALERT_PRESETS}
                      />

                      {/* Watchlist Button */}
                      <button
                        type="button"
                        onClick={() => handleAddToWatchlist(
                          trade['Item'] || trade.item,
                          trade['Item ID'] || trade.itemId
                        )}
                        className="p-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple transition-all hover:bg-accent-purple/20"
                        title="Add to watchlist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Management Actions */}
      <div className="mt-8 flex gap-4">
        <button
          type="button"
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
          className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium transition-all hover:bg-accent-cyan/20"
        >
          Export Alerts
        </button>

        <label className="px-4 py-2 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-sm font-medium transition-all hover:bg-accent-purple/20 cursor-pointer">
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
                    if (success) {
                      alert('Alerts imported successfully!');
                    } else {
                      alert('Failed to import alerts. Please check the file format.');
                    }
                  }
                };
                reader.readAsText(file);
              }
            }}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

/**
 * Usage Notes:
 *
 * 1. Import the hook and components:
 *    import { useSmartAlerts } from '../../hooks/useSmartAlerts';
 *    import { SmartAlertPanel } from './SmartAlertPanel';
 *    import { AlertNotificationCenter } from './AlertNotificationCenter';
 *    import { QuickAlertButton } from './QuickAlertButton';
 *
 * 2. Initialize the hook in your component:
 *    const {
 *      alerts,
 *      addAlert,
 *      checkAlerts,
 *      // ... other methods
 *    } = useSmartAlerts();
 *
 * 3. Check alerts when your trade data updates:
 *    useEffect(() => {
 *      if (trades && trades.length > 0) {
 *        checkAlerts(trades);
 *      }
 *    }, [trades, checkAlerts]);
 *
 * 4. Add QuickAlertButton to your table rows:
 *    <QuickAlertButton
 *      item={trade}
 *      onCreateAlert={addAlert}
 *      onCreateFromPreset={addAlertFromPreset}
 *      ALERT_TYPES={ALERT_TYPES}
 *      PRIORITY_LEVELS={PRIORITY_LEVELS}
 *      ALERT_PRESETS={ALERT_PRESETS}
 *    />
 *
 * 5. Display the notification center:
 *    <AlertNotificationCenter
 *      triggeredAlerts={triggeredAlerts}
 *      triggeredHistory={triggeredHistory}
 *      onAcknowledge={acknowledgeAlert}
 *      onAcknowledgeAll={acknowledgeAll}
 *      // ... other props
 *    />
 */

export default StationTradingPageWithAlerts;
