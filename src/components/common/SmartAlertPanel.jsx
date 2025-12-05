import { useState } from 'react';
import { formatNumber } from '../../utils/formatters';
import { FormInput } from '../forms/FormInput';

/**
 * Smart Alert Panel Component
 * Advanced alert configuration with presets, priority levels, and smart thresholds
 */
export function SmartAlertPanel({
  alerts,
  activeAlerts,
  alertsByPriority,
  onCreateAlert,
  onCreateFromPreset,
  onRemoveAlert,
  onResetAlert,
  onUpdateAlert: _onUpdateAlert,
  onClearAll,
  settings = {},
  notificationPermission = 'default',
  onUpdateSettings,
  onRequestNotificationPermission,
  ALERT_TYPES,
  PRIORITY_LEVELS,
  ALERT_PRESETS,
  onCalculateOptimalThreshold: _onCalculateOptimalThreshold,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    itemName: '',
    itemId: '',
    type: ALERT_TYPES.MARGIN_THRESHOLD,
    condition: 'above',
    threshold: '',
    priority: PRIORITY_LEVELS.MEDIUM,
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
      priority: formData.priority,
      oneTime: formData.oneTime,
    });

    // Reset form
    setFormData({
      itemName: '',
      itemId: '',
      type: ALERT_TYPES.MARGIN_THRESHOLD,
      condition: 'above',
      threshold: '',
      priority: PRIORITY_LEVELS.MEDIUM,
      oneTime: true,
    });
    setIsCreating(false);
  };

  const handlePresetClick = (preset) => {
    if (!formData.itemName.trim()) {
      setErrors({ itemName: 'Please enter an item name first' });
      return;
    }

    onCreateFromPreset?.(preset.id, formData.itemName.trim(), formData.itemId || null);
    setShowPresets(false);
    setFormData({
      itemName: '',
      itemId: '',
      type: ALERT_TYPES.MARGIN_THRESHOLD,
      condition: 'above',
      threshold: '',
      priority: PRIORITY_LEVELS.MEDIUM,
      oneTime: true,
    });
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      [ALERT_TYPES.PRICE_DROP]: 'Price Drop',
      [ALERT_TYPES.PRICE_RISE]: 'Price Rise',
      [ALERT_TYPES.MARGIN_THRESHOLD]: 'Margin',
      [ALERT_TYPES.VOLUME_SPIKE]: 'Volume Spike',
      [ALERT_TYPES.COMPETITION_UNDERCUT]: 'Competition Undercut',
      [ALERT_TYPES.BUY_PRICE_BELOW]: 'Buy Price',
      [ALERT_TYPES.SELL_PRICE_ABOVE]: 'Sell Price',
      [ALERT_TYPES.NET_PROFIT_ABOVE]: 'Net Profit',
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

  const getPriorityBadge = (priority) => {
    const badges = {
      [PRIORITY_LEVELS.CRITICAL]: {
        color: 'bg-red-500/20 text-red-400 border-red-500/40',
        icon: '🚨',
        label: 'Critical',
      },
      [PRIORITY_LEVELS.HIGH]: {
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        icon: '⚠️',
        label: 'High',
      },
      [PRIORITY_LEVELS.MEDIUM]: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        icon: '📢',
        label: 'Medium',
      },
      [PRIORITY_LEVELS.LOW]: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        icon: 'ℹ️',
        label: 'Low',
      },
    };
    return badges[priority] || badges[PRIORITY_LEVELS.MEDIUM];
  };

  const formatThreshold = (value, type) => {
    if (type === ALERT_TYPES.MARGIN_THRESHOLD) {
      return `${value.toFixed(2)}%`;
    }
    if (type === ALERT_TYPES.VOLUME_SPIKE) {
      return `${value.toFixed(1)}x baseline`;
    }
    if (type === ALERT_TYPES.PRICE_DROP || type === ALERT_TYPES.PRICE_RISE) {
      return `${(value * 100).toFixed(0)}% of baseline`;
    }
    return `${formatNumber(value)} ISK`;
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filterPriority !== 'all' && alert.priority !== filterPriority) return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    return true;
  });

  const pendingAlerts = filteredAlerts.filter(a => !a.triggered && !a.acknowledged);
  const triggeredAlerts = filteredAlerts.filter(a => a.triggered || a.acknowledged);

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
              Smart Alerts
            </h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan text-xs font-medium">
                {pendingAlerts.length} Active
              </span>
              {triggeredAlerts.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-medium">
                  {triggeredAlerts.length} Triggered
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
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

        {/* Priority Summary */}
        {activeAlerts && activeAlerts.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {Object.entries(alertsByPriority).map(([priority, alerts]) => {
              if (alerts.length === 0) return null;
              const badge = getPriorityBadge(priority);
              return (
                <div
                  key={priority}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${badge.color}`}
                >
                  <span className="mr-1">{badge.icon}</span>
                  {alerts.length} {badge.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Settings */}
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
                    Play sound alerts (higher priority = more beeps)
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
                  />
                </div>
              )}

              {/* Group Similar Alerts */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-text-primary mb-1 block">
                    Group Similar Alerts
                  </label>
                  <p className="text-xs text-text-secondary">
                    Reduce noise by grouping similar alert types
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.groupSimilarAlerts}
                  onChange={(e) => onUpdateSettings?.({ groupSimilarAlerts: e.target.checked })}
                  className="w-4 h-4 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan mt-0.5"
                />
              </div>

              {/* Auto Acknowledge */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-text-primary mb-1 block">
                    Auto-acknowledge Alerts
                  </label>
                  <p className="text-xs text-text-secondary">
                    Automatically acknowledge alerts after 5 seconds
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAcknowledge}
                  onChange={(e) => onUpdateSettings?.({ autoAcknowledge: e.target.checked })}
                  className="w-4 h-4 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan mt-0.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        {isCreating && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="w-full px-4 py-3 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-sm font-medium transition-all hover:bg-accent-purple/20 flex items-center justify-between"
            >
              <span>Quick Presets</span>
              <svg
                className={`w-5 h-5 transition-transform ${showPresets ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showPresets && (
              <div className="mt-3 p-4 bg-space-mid/30 rounded-lg border border-accent-purple/20 space-y-2">
                <p className="text-sm text-text-secondary mb-3">
                  Enter an item name above, then click a preset:
                </p>
                {ALERT_PRESETS.map(preset => {
                  const badge = getPriorityBadge(preset.priority);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className="w-full p-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-left transition-all hover:bg-space-mid hover:border-accent-cyan/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-text-primary font-medium text-sm">{preset.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badge.color}`}>
                              {badge.icon} {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">{preset.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Alert Form */}
        {isCreating && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Create Custom Alert</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Item Name"
                value={formData.itemName}
                onChange={(value) => handleInputChange('itemName', value)}
                placeholder="e.g., Tritanium"
                error={errors.itemName}
                required
              />

              <FormInput
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
                  {Object.entries(ALERT_TYPES).map(([_key, value]) => (
                    <option key={value} value={value}>{getAlertTypeLabel(value)}</option>
                  ))}
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

              <div className="space-y-1">
                <label className="block text-sm font-medium text-text-secondary">
                  Priority <span className="text-red-400 ml-1">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
                >
                  {Object.entries(PRIORITY_LEVELS).map(([_key, value]) => {
                    const badge = getPriorityBadge(value);
                    return (
                      <option key={value} value={value}>
                        {badge.icon} {badge.label}
                      </option>
                    );
                  })}
                </select>
              </div>

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
                onClick={() => {
                  setIsCreating(false);
                  setShowPresets(false);
                }}
                className="px-4 py-2 rounded-lg bg-space-mid/50 border border-accent-cyan/20 text-text-secondary transition-all hover:bg-space-mid hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        {alerts.length > 0 && (
          <div className="mb-4 flex gap-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-purple"
            >
              <option value="all">All Priorities</option>
              {Object.entries(PRIORITY_LEVELS).map(([_key, value]) => {
                const badge = getPriorityBadge(value);
                return (
                  <option key={value} value={value}>{badge.label}</option>
                );
              })}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-purple"
            >
              <option value="all">All Types</option>
              {Object.entries(ALERT_TYPES).map(([_key, value]) => (
                <option key={value} value={value}>{getAlertTypeLabel(value)}</option>
              ))}
            </select>
          </div>
        )}

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-text-secondary mb-2">No alerts configured</p>
            <p className="text-text-secondary/70 text-sm">Create an alert or use a quick preset to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const badge = getPriorityBadge(alert.priority);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border transition-all ${
                      alert.triggered || alert.acknowledged
                        ? 'bg-accent-gold/5 border-accent-gold/30'
                        : 'bg-space-mid/30 border-accent-cyan/10 hover:border-accent-cyan/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-accent-cyan font-medium">{alert.itemName}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badge.color}`}>
                            {badge.icon} {badge.label}
                          </span>
                          {alert.triggered && (
                            <span className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-medium">
                              Triggered
                            </span>
                          )}
                          {alert.acknowledged && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                              Acknowledged
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
                );
              })}
            </div>

            {alerts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-accent-cyan/10 flex justify-between items-center">
                <p className="text-sm text-text-secondary">
                  Showing {filteredAlerts.length} of {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
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

export default SmartAlertPanel;
