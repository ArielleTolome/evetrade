import { useState, useEffect } from 'react';
import { useStockAlerts } from '../../hooks/useStockAlerts';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatNumber } from '../../utils/formatters';

/**
 * Stock Alert Panel Component
 * Manages stock level thresholds and displays alerts for low inventory
 */
export function StockAlertPanel({ inventory = [], className = '' }) {
  const {
    alerts,
    notificationPermission,
    setThreshold,
    removeThreshold,
    checkStockLevels,
    requestNotificationPermission,
    getAlert,
  } = useStockAlerts();

  const [lowStockItems, setLowStockItems] = useState([]);
  const [newAlertItem, setNewAlertItem] = useState('');
  const [newAlertThreshold, setNewAlertThreshold] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Check stock levels when inventory changes
  useEffect(() => {
    if (inventory.length > 0) {
      const items = checkStockLevels(inventory);
      setLowStockItems(items);
    }
  }, [inventory, checkStockLevels]);

  const handleAddAlert = (e) => {
    e.preventDefault();

    const item = inventory.find(i =>
      i.itemId.toString() === newAlertItem || i.itemName === newAlertItem
    );

    if (!item) {
      alert('Item not found in inventory');
      return;
    }

    const threshold = parseInt(newAlertThreshold);
    if (isNaN(threshold) || threshold < 0) {
      alert('Please enter a valid threshold');
      return;
    }

    setThreshold(item.itemId, item.itemName, threshold);
    setNewAlertItem('');
    setNewAlertThreshold('');
    setShowAddForm(false);
  };

  const handleRemoveAlert = (itemId) => {
    removeThreshold(itemId);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert('Notifications were denied. Please enable them in your browser settings.');
    }
  };

  // Empty state
  if (inventory.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-text-secondary">No inventory data available</p>
          <p className="text-sm text-text-secondary mt-2">
            Add items to your inventory to set up stock alerts
          </p>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">
            Stock Alerts
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Get notified when inventory drops below threshold
          </p>
        </div>

        {/* Notification Permission */}
        {notificationPermission !== 'granted' && (
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-accent-purple/20 text-accent-purple border border-accent-purple/30 rounded-lg hover:bg-accent-purple/30 transition-colors text-sm"
          >
            Enable Notifications
          </button>
        )}
      </div>

      {/* Low Stock Warnings */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold text-accent-gold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Low Stock Items ({lowStockItems.length})
          </h3>

          {lowStockItems.map(item => (
            <div
              key={item.itemId}
              className="p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-text-primary">
                    {item.itemName}
                  </span>
                  <div className="text-sm text-text-secondary mt-1">
                    Current: {formatNumber(item.quantity, 0)} /
                    Threshold: {formatNumber(item.threshold, 0)}
                    {item.deficit > 0 && (
                      <span className="text-accent-gold ml-2">
                        (Need {formatNumber(item.deficit, 0)} more)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Configured Alerts ({alerts.length})
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-sm text-accent-cyan hover:text-accent-cyan/80 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Alert
          </button>
        </div>

        {/* Add Alert Form */}
        {showAddForm && (
          <form onSubmit={handleAddAlert} className="p-4 bg-space-mid/50 rounded-lg border border-accent-cyan/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs text-text-secondary mb-1">
                  Item
                </label>
                <select
                  value={newAlertItem}
                  onChange={(e) => setNewAlertItem(e.target.value)}
                  className="w-full px-3 py-2 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary focus:outline-none focus:border-accent-cyan/50"
                  required
                >
                  <option value="">Select an item...</option>
                  {inventory
                    .filter(item => !getAlert(item.itemId))
                    .map(item => (
                      <option key={item.itemId} value={item.itemId}>
                        {item.itemName} (Current: {formatNumber(item.quantity, 0)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">
                  Threshold
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newAlertThreshold}
                    onChange={(e) => setNewAlertThreshold(e.target.value)}
                    placeholder="Min quantity"
                    min="0"
                    className="flex-1 px-3 py-2 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary focus:outline-none focus:border-accent-cyan/50"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 rounded-lg hover:bg-accent-cyan/30 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Alert Items */}
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-text-secondary text-sm">
            No alerts configured. Click "Add Alert" to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => {
              const inventoryItem = inventory.find(i => i.itemId.toString() === alert.itemId.toString());
              const currentQty = inventoryItem?.quantity || 0;
              const isLow = currentQty <= alert.threshold;

              return (
                <div
                  key={alert.itemId}
                  className={`p-3 rounded-lg border ${
                    isLow
                      ? 'bg-accent-gold/5 border-accent-gold/30'
                      : 'bg-space-mid/30 border-accent-cyan/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-semibold text-text-primary">
                          {alert.itemName}
                        </span>
                        {isLow && (
                          <span className="ml-2 px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-xs rounded">
                            LOW
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary mt-1">
                        Current: {formatNumber(currentQty, 0)} /
                        Threshold: {formatNumber(alert.threshold, 0)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveAlert(alert.itemId)}
                      className="ml-4 p-2 text-text-secondary hover:text-accent-gold transition-colors"
                      title="Remove alert"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="pt-4 border-t border-accent-cyan/10">
        <p className="text-xs text-text-secondary">
          {notificationPermission === 'granted'
            ? 'Browser notifications enabled. You\'ll be alerted when stock is low (max once per hour per item).'
            : 'Enable browser notifications to receive alerts when you\'re away from this page.'}
        </p>
      </div>
    </GlassmorphicCard>
  );
}

export default StockAlertPanel;
