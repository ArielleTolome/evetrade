import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/common/EmptyState';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { PriceAlertModal } from '../components/common/PriceAlertModal';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { formatISK, formatDateTime } from '../utils/formatters';

/**
 * Alert Card Component
 */
function AlertCard({ alert, onToggle, onDelete, onEdit, onCheckNow }) {
  const getAlertTypeInfo = (type) => {
    switch (type) {
      case 'price_below':
        return { label: 'Price Below', icon: 'M19 14l-7 7m0 0l-7-7m7 7V3', color: 'text-green-400' };
      case 'price_above':
        return { label: 'Price Above', icon: 'M5 10l7-7m0 0l7 7m-7-7v18', color: 'text-red-400' };
      case 'undercut':
        return { label: 'Undercut Alert', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-orange-400' };
      case 'order_expiry':
        return { label: 'Order Expiry', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-purple-400' };
      default:
        return { label: 'Unknown', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'text-text-secondary' };
    }
  };

  const typeInfo = getAlertTypeInfo(alert.alertType);

  return (
    <GlassmorphicCard
      className={`p-5 ${!alert.enabled ? 'opacity-60' : ''}`}
      hover={false}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-text-primary">{alert.itemName}</h3>
            {!alert.enabled && (
              <span className="px-2 py-0.5 text-xs bg-text-secondary/20 text-text-secondary rounded-full">
                Disabled
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary">Type ID: {alert.typeId}</p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(alert.id)}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark
            ${alert.enabled ? 'bg-accent-cyan' : 'bg-gray-600'}
          `}
          role="switch"
          aria-checked={alert.enabled}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
              transition duration-200 ease-in-out
              ${alert.enabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {/* Alert Type Badge */}
      <div className="flex items-center gap-2 mb-4">
        <svg className={`w-5 h-5 ${typeInfo.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeInfo.icon} />
        </svg>
        <span className="text-sm text-text-secondary">{typeInfo.label}</span>
      </div>

      {/* Threshold */}
      <div className="mb-4 p-3 rounded-lg bg-space-dark/50 border border-accent-cyan/10">
        <div className="text-sm text-text-secondary mb-1">Threshold Price</div>
        <div className="text-xl font-bold font-mono text-accent-cyan">
          {formatISK(alert.threshold, false)}
        </div>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <div className="text-text-secondary mb-1">Created</div>
          <div className="text-text-primary">{formatDateTime(alert.createdAt)}</div>
        </div>
        {alert.lastTriggered && (
          <div>
            <div className="text-text-secondary mb-1">Last Triggered</div>
            <div className="text-green-400">{formatDateTime(alert.lastTriggered)}</div>
          </div>
        )}
      </div>

      {alert.lastTriggerPrice && (
        <div className="mb-4 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="text-xs text-green-400">
            Last trigger: {formatISK(alert.lastTriggerPrice, false)}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onCheckNow(alert.id)}
          variant="secondary"
          size="sm"
          className="flex items-center justify-center gap-2 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Check Now
        </Button>
        <Button
          onClick={() => onDelete(alert.id)}
          variant="danger"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </Button>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * History Item Component
 */
function HistoryItem({ item }) {
  return (
    <div className="p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/10 hover:border-accent-cyan/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-text-primary">{item.itemName}</h4>
          <p className="text-xs text-text-secondary mt-1">Type ID: {item.typeId}</p>
        </div>
        <div className="text-xs text-text-secondary text-right">
          {formatDateTime(item.triggeredAt)}
        </div>
      </div>
      <div className="text-sm text-text-secondary mb-2">
        {item.message}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 font-mono">
          {formatISK(item.currentPrice, false)}
        </span>
        <span className="text-text-secondary">triggered at</span>
      </div>
    </div>
  );
}

/**
 * Alerts Page Component
 */
export function AlertsPage() {
  const {
    alerts,
    alertHistory,
    stats,
    settings,
    notificationPermission,
    isChecking,
    createAlert,
    removeAlert,
    toggleAlert,
    checkSingleAlert,
    checkAllAlerts,
    clearAllAlerts,
    clearHistory,
    updateSettings,
    requestNotificationPermission,
  } = usePriceAlerts();

  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState('all'); // all, enabled, disabled

  // Filter alerts based on enabled status
  const filteredAlerts = alerts.filter(alert => {
    if (filterEnabled === 'enabled') return alert.enabled;
    if (filterEnabled === 'disabled') return !alert.enabled;
    return true;
  });

  const handleCreateAlert = (alertData) => {
    createAlert(alertData);
    setShowModal(false);
  };

  const handleCheckNow = async (alertId) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      await checkSingleAlert(alert);
    }
  };

  const handleDeleteAlert = (alertId) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      removeAlert(alertId);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all alerts? This cannot be undone.')) {
      clearAllAlerts();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear alert history? This cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <PageLayout
      title="Price Alerts"
      subtitle="Monitor market prices and get notified when conditions are met"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <GlassmorphicCard className="text-center py-4">
            <div className="text-3xl font-bold text-accent-cyan">{stats.total}</div>
            <div className="text-sm text-text-secondary mt-1">Total Alerts</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="text-center py-4">
            <div className="text-3xl font-bold text-green-400">{stats.enabled}</div>
            <div className="text-sm text-text-secondary mt-1">Enabled</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="text-center py-4">
            <div className="text-3xl font-bold text-orange-400">{stats.recentlyTriggered}</div>
            <div className="text-sm text-text-secondary mt-1">Recently Triggered</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="text-center py-4">
            <div className="text-3xl font-bold text-purple-400">{alertHistory.length}</div>
            <div className="text-sm text-text-secondary mt-1">History Items</div>
          </GlassmorphicCard>
        </div>

        {/* Controls Bar */}
        <GlassmorphicCard className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              {/* Filter */}
              <select
                value={filterEnabled}
                onChange={(e) => setFilterEnabled(e.target.value)}
                className="px-4 py-2.5 min-h-[44px] rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
              >
                <option value="all">All Alerts</option>
                <option value="enabled">Enabled Only</option>
                <option value="disabled">Disabled Only</option>
              </select>

              {/* Check All Button */}
              <Button
                onClick={checkAllAlerts}
                variant="secondary"
                disabled={isChecking || stats.enabled === 0}
                loading={isChecking}
                className="flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Check All Alerts
              </Button>

              {/* History Button */}
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="ghost"
                className="flex items-center justify-center gap-2 border border-accent-cyan/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
            </div>

            <div className="flex items-stretch sm:items-center gap-3">
              {/* Settings Button */}
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                className="flex items-center justify-center gap-2 border border-accent-cyan/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Button>

              {/* Create Alert Button */}
              <Button
                onClick={() => setShowModal(true)}
                variant="primary"
                className="flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Alert
              </Button>
            </div>
          </div>
        </GlassmorphicCard>

        {/* Settings Panel */}
        {showSettings && (
          <GlassmorphicCard className="mb-6 bg-gradient-to-r from-accent-purple/5 to-accent-cyan/5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Alert Settings
            </h3>

            <div className="space-y-4">
              {/* Browser Notifications */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-space-dark/30">
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
                <div className="flex items-center gap-3">
                  {notificationPermission === 'default' && (
                    <Button
                      onClick={requestNotificationPermission}
                      variant="secondary"
                      size="sm"
                    >
                      Enable Notifications
                    </Button>
                  )}
                  {notificationPermission === 'granted' && (
                    <input
                      type="checkbox"
                      checked={settings.browserNotifications}
                      onChange={(e) => updateSettings({ browserNotifications: e.target.checked })}
                      className="w-5 h-5 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan cursor-pointer"
                    />
                  )}
                </div>
              </div>

              {/* Sound Notifications */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-space-dark/30">
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
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-accent-cyan/20 text-accent-cyan focus:ring-accent-cyan cursor-pointer"
                />
              </div>

              {/* Sound Volume */}
              {settings.soundEnabled && (
                <div className="p-4 rounded-lg bg-space-dark/30 border-l-4 border-accent-cyan/50">
                  <label className="text-sm font-medium text-text-primary mb-3 block">
                    Volume: {Math.round((settings.soundVolume || 0.5) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume || 0.5}
                    onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(6 182 212) 0%, rgb(6 182 212) ${(settings.soundVolume || 0.5) * 100}%, rgb(15 23 42) ${(settings.soundVolume || 0.5) * 100}%, rgb(15 23 42) 100%)`
                    }}
                  />
                </div>
              )}
            </div>
          </GlassmorphicCard>
        )}

        {/* History Panel */}
        {showHistory && (
          <GlassmorphicCard className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Alert History ({alertHistory.length})
              </h3>
              {alertHistory.length > 0 && (
                <Button
                  onClick={handleClearHistory}
                  variant="danger"
                  size="sm"
                >
                  Clear History
                </Button>
              )}
            </div>

            {alertHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">No alert history yet</p>
                <p className="text-sm text-text-secondary/70 mt-1">
                  Triggered alerts will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alertHistory.slice().reverse().map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </GlassmorphicCard>
        )}

        {/* Alerts Grid */}
        {filteredAlerts.length === 0 ? (
          <>
            {alerts.length === 0 ? (
              <EmptyState
                icon={<Bell className="w-10 h-10" />}
                title="No alerts configured"
                description="Create alerts to get notified about price changes, undercuts, or expiring orders."
                action={{ text: 'Create Alert', onClick: () => setShowModal(true) }}
              />
            ) : (
              <EmptyState
                variant="search"
                title="No alerts match your filter"
                description="Try adjusting your filter to see more alerts."
              />
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onToggle={toggleAlert}
                  onDelete={handleDeleteAlert}
                  onEdit={setEditingAlert}
                  onCheckNow={handleCheckNow}
                />
              ))}
            </div>

            {/* Bulk Actions */}
            {alerts.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={handleClearAll}
                  variant="danger"
                  size="sm"
                >
                  Delete All Alerts
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <PriceAlertModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAlert(null);
        }}
        onSave={handleCreateAlert}
        initialAlert={editingAlert}
      />
    </PageLayout>
  );
}

export default AlertsPage;
