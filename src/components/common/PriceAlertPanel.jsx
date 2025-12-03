import { useState } from 'react';
import { formatNumber } from '../../utils/formatters';
import { FormInput } from '../forms/FormInput';

/**
 * Price Alert Panel Component
 * Manages price alerts for trading items with notification settings
 */
export function PriceAlertPanel({
  alerts,
  onCreateAlert,
  onRemoveAlert,
  onResetAlert,
  onClearAll,
  settings = {},
  notificationPermission = 'default',
  onUpdateSettings,
  onRequestNotificationPermission,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [showTriggered, setShowTriggered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    itemId: '',
    type: 'margin',
    condition: 'above',
    threshold: '',
    oneTime: true,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    
    if (!formData.threshold || formData.threshold <= 0) {
      newErrors.threshold = 'Threshold must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onCreateAlert?.({
      itemName: formData.itemName.trim(),
      itemId: formData.itemId || null,
      type: formData.type,
      condition: formData.condition,
      threshold: Number(formData.threshold),
      oneTime: formData.oneTime,
    });
    
    // Reset form
    setFormData({
      itemName: '',
      itemId: '',
      type: 'margin',
      condition: 'above',
      threshold: '',
      oneTime: true,
    });
    setIsCreating(false);
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      buyPrice: 'Buy Price',
      sellPrice: 'Sell Price',
      margin: 'Margin',
      volume: 'Volume',
      profit: 'Net Profit',
    };
    return labels[type] || type;
  };

  const getConditionLabel = (condition) => {
    const labels = {
      above: 'Above',
      below: 'Below',
      equals: 'Equals',
    };
    return labels[condition] || condition;
  };

  const formatThreshold = (value, type) => {
    if (type === 'margin') {
      return `${value.toFixed(2)}%`;
    }
    if (type === 'volume') {
      return formatNumber(value);
    }
    return `${formatNumber(value)} ISK`;
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="bg-space-dark/30 rounded-xl border border-accent-cyan/10 overflow-hidden">
      {/* Header */}
      <div className="bg-space-mid/50 border-b border-accent-cyan/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="text-xl font-display font-semibold text-text-primary">
              Price Alerts
            </h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan text-xs font-medium">
                {activeAlerts.length} Active
              </span>
              {triggeredAlerts.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-medium">
                  {triggeredAlerts.length} Triggered
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {alerts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTriggered(!showTriggered)}
                className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-secondary text-sm hover:bg-space-mid hover:text-text-primary transition-all"
              >
                {showTriggered ? 'Show Active' : 'Show Triggered'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-secondary text-sm hover:bg-space-mid hover:text-text-primary transition-all"
              title="Alert Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium transition-all hover:bg-accent-cyan/20 hover:border-accent-cyan/50"
            >
              {isCreating ? 'Cancel' : '+ New Alert'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Alert Settings */}
        {showSettings && (
          <div className="mb-6 p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Alert Settings</h3>

            <div className="space-y-4">
              {/* Browser Notifications */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-sm font-medium text-text-primary">
                      Browser Notifications
                    </label>
                    {notificationPermission === 'granted' && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                        Enabled
                      </span>
                    )}
                    {notificationPermission === 'denied' && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">
                    Show desktop notifications when alerts trigger
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {notificationPermission === 'default' && (
                    <button
                      type="button"
                      onClick={onRequestNotificationPermission}
                      className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-medium transition-all hover:bg-accent-cyan/20"
                    >
                      Enable
                    </button>
                  )}
                  {notificationPermission === 'granted' && (
                    <input
                      type="checkbox"
                      checked={settings.browserNotifications}
                      onChange={(e) => onUpdateSettings?.({ browserNotifications: e.target.checked })}
                      className="w-4 h-4 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan"
                    />
                  )}
                </div>
              </div>

              {/* Sound Notifications */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-text-primary mb-1 block">
                    Sound Notifications
                  </label>
                  <p className="text-xs text-text-secondary">
                    Play a sound when alerts trigger
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings?.({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan mt-0.5"
                />
              </div>

              {/* Sound Volume */}
              {settings.soundEnabled && (
                <div className="pl-4 border-l-2 border-accent-cyan/20">
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Volume: {Math.round((settings.soundVolume || 0.5) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume || 0.5}
                    onChange={(e) => onUpdateSettings?.({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(6 182 212) 0%, rgb(6 182 212) ${(settings.soundVolume || 0.5) * 100}%, rgb(15 23 42) ${(settings.soundVolume || 0.5) * 100}%, rgb(15 23 42) 100%)`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Alert Form */}
        {isCreating && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Alert</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="itemName"
                label="Item Name"
                value={formData.itemName}
                onChange={(value) => handleInputChange('itemName', value)}
                placeholder="e.g., Tritanium"
                error={errors.itemName}
                required
              />
              
              <FormInput
                id="itemId"
                label="Item ID (Optional)"
                value={formData.itemId}
                onChange={(value) => handleInputChange('itemId', value)}
                placeholder="e.g., 34"
                type="number"
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">
                  Alert Type <span className="text-red-400 ml-1">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
                >
                  <option value="margin">Margin (%)</option>
                  <option value="profit">Net Profit (ISK)</option>
                  <option value="buyPrice">Buy Price (ISK)</option>
                  <option value="sellPrice">Sell Price (ISK)</option>
                  <option value="volume">Volume</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">
                  Condition <span className="text-red-400 ml-1">*</span>
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="equals">Equals</option>
                </select>
              </div>
              
              <FormInput
                id="threshold"
                label="Threshold"
                value={formData.threshold}
                onChange={(value) => handleInputChange('threshold', value)}
                placeholder="Enter value"
                type="number"
                step="0.01"
                min="0"
                error={errors.threshold}
                required
              />
              
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="oneTime"
                  checked={formData.oneTime}
                  onChange={(e) => handleInputChange('oneTime', e.target.checked)}
                  className="w-4 h-4 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan"
                />
                <label htmlFor="oneTime" className="text-sm text-text-secondary cursor-pointer">
                  One-time alert (auto-disable after trigger)
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-medium transition-all hover:bg-accent-cyan/20 hover:border-accent-cyan/50"
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg bg-space-mid/50 border border-accent-cyan/20 text-text-secondary transition-all hover:bg-space-mid hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-text-secondary mb-2">No alerts configured</p>
            <p className="text-text-secondary/70 text-sm">Create an alert to get notified when prices meet your criteria</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {(showTriggered ? triggeredAlerts : activeAlerts).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all $${
                    alert.triggered
                      ? 'bg-accent-gold/5 border-accent-gold/30'
                      : 'bg-space-mid/30 border-accent-cyan/10 hover:border-accent-cyan/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-accent-cyan font-medium">{alert.itemName}</span>
                        {alert.triggered && (
                          <span className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-medium">
                            Triggered
                          </span>
                        )}
                        {alert.oneTime && !alert.triggered && (
                          <span className="px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-medium">
                            One-time
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-text-secondary space-y-1">
                        <p>
                          <span className="text-text-primary">{getAlertTypeLabel(alert.type)}</span>
                          {' '}
                          <span className="text-accent-cyan">{getConditionLabel(alert.condition).toLowerCase()}</span>
                          {' '}
                          <span className="text-text-primary font-mono">{formatThreshold(alert.threshold, alert.type)}</span>
                        </p>
                        
                        {alert.triggeredAt && (
                          <p className="text-xs">
                            Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                          </p>
                        )}
                        
                        <p className="text-xs">
                          Created: {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {alert.triggered && (
                        <button
                          type="button"
                          onClick={() => onResetAlert?.(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-medium transition-all hover:bg-accent-cyan/20"
                          title="Reset alert"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveAlert?.(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium transition-all hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {alerts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-accent-cyan/10 flex justify-between items-center">
                <p className="text-sm text-text-secondary">
                  Total: {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
                </p>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium transition-all hover:bg-red-500/20"
                >
                  Clear All Alerts
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PriceAlertPanel;
