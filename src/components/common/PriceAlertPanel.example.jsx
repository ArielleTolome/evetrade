import { useState, useEffect } from 'react';
import { usePriceAlerts } from '../../hooks/usePriceAlerts';
import { PriceAlertPanel } from '../../components/common/PriceAlertPanel';
import { AlertNotification } from '../../components/common/AlertNotification';
import { useToast } from '../../components/common/ToastProvider';

/**
 * Example: Integrating Price Alerts with Trading Page
 * 
 * This example shows how to integrate the price alert system
 * into a trading page (like StationTradingPage, RegionHaulingPage, etc.)
 */
export function ExampleTradingPageWithAlerts() {
  const [trades, _setTrades] = useState([]);
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  // Initialize price alerts hook
  const {
    alerts,
    triggeredAlerts,
    activeCount,
    createAlert,
    removeAlert,
    resetAlert,
    checkAlerts,
    dismissTriggered,
    clearAllAlerts,
  } = usePriceAlerts();

  // Initialize toast notifications
  const { warning } = useToast();

  // Check alerts whenever trades data changes
  useEffect(() => {
    if (trades.length > 0) {
      const triggered = checkAlerts(trades);
      
      // Show toast notifications for triggered alerts
      triggered.forEach((alert) => {
        const itemName = alert.itemName || 'Unknown Item';
        const message = `Alert: ${itemName} - ${getAlertMessage(alert)}`;
        warning(message, { duration: 8000 });
      });
    }
  }, [trades, checkAlerts, warning]);

  // Helper to format alert message
  const getAlertMessage = (alert) => {
    const typeLabel = {
      buyPrice: 'Buy Price',
      sellPrice: 'Sell Price',
      margin: 'Margin',
      volume: 'Volume',
      profit: 'Net Profit',
    }[alert.type] || alert.type;

    const condition = {
      above: 'above',
      below: 'below',
      equals: 'equals',
    }[alert.condition] || alert.condition;

    const formatValue = (value, type) => {
      if (type === 'margin') return `${value.toFixed(2)}%`;
      if (type === 'volume') return value.toLocaleString();
      return `${value.toLocaleString()} ISK`;
    };

    return `${typeLabel} is ${condition} ${formatValue(alert.threshold, alert.type)}`;
  };

  // Handle viewing item from alert notification
  const handleViewItem = (alert) => {
    // Find the item in trades and scroll to it or navigate to it
    console.log('View item:', alert.itemName);
    dismissTriggered(alert.id);
  };

  return (
    <div className="min-h-screen bg-space-black p-6">
      {/* Header with Alert Button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Trading Dashboard
        </h1>
        
        <button
          type="button"
          onClick={() => setShowAlertPanel(!showAlertPanel)}
          className="relative px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold font-medium transition-all hover:bg-accent-gold/20"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Price Alerts</span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-accent-gold/30 text-xs">
                {activeCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Alert Panel (collapsible) */}
      {showAlertPanel && (
        <div className="mb-6 animate-slide-up">
          <PriceAlertPanel
            alerts={alerts}
            onCreateAlert={createAlert}
            onRemoveAlert={removeAlert}
            onResetAlert={resetAlert}
            onClearAll={() => {
              if (confirm('Are you sure you want to clear all alerts?')) {
                clearAllAlerts();
              }
            }}
          />
        </div>
      )}

      {/* Main Content - Your trading table, forms, etc. */}
      <div className="space-y-6">
        {/* Example: Trading form, results table, etc. */}
        <div className="bg-space-dark/30 rounded-xl border border-accent-cyan/10 p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Trading Opportunities
          </h2>
          {/* Your trading content here */}
        </div>
      </div>

      {/* Alert Notifications (bottom-right) */}
      {triggeredAlerts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full">
          {triggeredAlerts.map(alert => (
            <AlertNotification
              key={alert.id}
              alert={alert}
              onDismiss={dismissTriggered}
              onViewItem={handleViewItem}
            />
          ))}
        </div>
      )}

    </div>
  );
}

/**
 * Example: Quick Alert Creation from Trading Table
 * 
 * This example shows how to add a "Create Alert" button to each row
 * in the trading table for quick alert creation.
 */
export function QuickAlertButton({ trade, onCreateAlert }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleCreateMarginAlert = () => {
    const margin = trade['Gross Margin'] || 0;
    onCreateAlert({
      itemName: trade['Item'] || trade.item,
      itemId: trade['Item ID'] || trade.itemId,
      type: 'margin',
      condition: 'above',
      threshold: margin * 1.1, // 10% higher than current margin
      oneTime: false, // Recurring alert
    });
    setShowOptions(false);
  };

  const handleCreateVolumeAlert = () => {
    const volume = trade['Volume'] || 0;
    onCreateAlert({
      itemName: trade['Item'] || trade.item,
      itemId: trade['Item ID'] || trade.itemId,
      type: 'volume',
      condition: 'above',
      threshold: volume * 1.5, // 50% higher than current volume
      oneTime: false,
    });
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="p-1.5 rounded hover:bg-accent-cyan/10 text-accent-cyan transition-all"
        title="Create alert"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-1 bg-space-dark border border-accent-cyan/20 rounded-lg shadow-xl p-2 whitespace-nowrap z-10">
          <button
            type="button"
            onClick={handleCreateMarginAlert}
            className="block w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-accent-cyan/10 rounded transition-all"
          >
            Alert on Margin
          </button>
          <button
            type="button"
            onClick={handleCreateVolumeAlert}
            className="block w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-accent-cyan/10 rounded transition-all"
          >
            Alert on Volume
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Minimal Integration
 * 
 * Simplest way to add price alerts to any page
 */
export function MinimalAlertExample() {
  const { alerts: _alerts, createAlert: _createAlert, checkAlerts } = usePriceAlerts();
  const [trades, _setTrades] = useState([]);

  // Check alerts whenever data updates
  useEffect(() => {
    if (trades.length > 0) {
      const triggered = checkAlerts(trades);
      triggered.forEach(alert => {
        alert(`Price alert triggered for ${alert.itemName}`);
      });
    }
  }, [trades, checkAlerts]);

  return (
    <div>
      {/* Your existing page content */}
      
      {/* Add alert panel anywhere */}
      <PriceAlertPanel
        alerts={alerts}
        onCreateAlert={createAlert}
        // ... other handlers
      />
    </div>
  );
}

export default ExampleTradingPageWithAlerts;
