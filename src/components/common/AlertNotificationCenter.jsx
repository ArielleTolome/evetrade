import { useState, useMemo } from 'react';
import { formatNumber } from '../../utils/formatters';

/**
 * Alert Notification Center Component
 * Shows active alerts, trigger history, and provides one-click actions
 */
export function AlertNotificationCenter({
  triggeredAlerts = [],
  triggeredHistory = [],
  onAcknowledge,
  onAcknowledgeAll,
  onClearHistory,
  onAddToWatchlist,
  onCopyItemName,
  PRIORITY_LEVELS,
  ALERT_TYPES,
  className = '',
}) {
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showHistory, setShowHistory] = useState(false);

  // Get unacknowledged alerts
  const unacknowledgedAlerts = useMemo(() =>
    triggeredAlerts.filter(a => !a.acknowledged)
  , [triggeredAlerts]);

  // Filter triggered alerts
  const filteredTriggered = useMemo(() => {
    return unacknowledgedAlerts.filter(alert => {
      if (filterPriority !== 'all' && alert.priority !== filterPriority) return false;
      if (filterType !== 'all' && alert.type !== filterType) return false;
      return true;
    });
  }, [unacknowledgedAlerts, filterPriority, filterType]);

  // Filter history
  const filteredHistory = useMemo(() => {
    return triggeredHistory.filter(alert => {
      if (filterPriority !== 'all' && alert.priority !== filterPriority) return false;
      if (filterType !== 'all' && alert.type !== filterType) return false;
      return true;
    });
  }, [triggeredHistory, filterPriority, filterType]);

  const getPriorityBadge = (priority) => {
    const badges = {
      [PRIORITY_LEVELS?.CRITICAL || 'critical']: {
        color: 'bg-red-500/20 text-red-400 border-red-500/40',
        icon: '🚨',
        label: 'Critical',
      },
      [PRIORITY_LEVELS?.HIGH || 'high']: {
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        icon: '⚠️',
        label: 'High',
      },
      [PRIORITY_LEVELS?.MEDIUM || 'medium']: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        icon: '📢',
        label: 'Medium',
      },
      [PRIORITY_LEVELS?.LOW || 'low']: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        icon: 'ℹ️',
        label: 'Low',
      },
    };
    return badges[priority] || badges[PRIORITY_LEVELS?.MEDIUM || 'medium'];
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      priceDropBelow: 'Price Drop',
      priceRiseAbove: 'Price Rise',
      marginReaches: 'Margin',
      volumeSpike: 'Volume Spike',
      competitionUndercut: 'Competition Undercut',
      buyPriceBelow: 'Buy Price',
      sellPriceAbove: 'Sell Price',
      netProfitAbove: 'Net Profit',
    };
    return labels[type] || type;
  };

  const formatValue = (value, type) => {
    if (!value) return 'N/A';

    if (type === 'marginReaches') {
      return `${value.toFixed(2)}%`;
    }
    if (type === 'volumeSpike') {
      return `${formatNumber(value)} units`;
    }
    if (type === 'priceDropBelow' || type === 'priceRiseAbove') {
      return `${(value * 100).toFixed(0)}%`;
    }
    return `${formatNumber(value)} ISK`;
  };

  const handleCopyItemName = (itemName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(itemName).then(() => {
        onCopyItemName?.(itemName);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = itemName;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        onCopyItemName?.(itemName);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const renderAlertCard = (alert, showActions = true) => {
    const badge = getPriorityBadge(alert.priority);
    const currentValue = alert.currentValue;
    const trade = alert.trade;

    return (
      <div
        key={alert.id}
        className={`p-4 rounded-lg border transition-all ${
          alert.priority === (PRIORITY_LEVELS?.CRITICAL || 'critical')
            ? 'bg-red-500/5 border-red-500/30 animate-pulse'
            : 'bg-accent-gold/5 border-accent-gold/30'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badge.color}`}>
                {badge.icon} {badge.label}
              </span>
              <span className="text-accent-cyan font-medium">{alert.itemName}</span>
              <span className="text-xs text-text-secondary">
                {new Date(alert.triggeredAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Alert Details */}
            <div className="text-sm text-text-secondary mb-3">
              <p className="mb-1">
                <span className="text-text-primary font-medium">{getAlertTypeLabel(alert.type)}</span>
                {' triggered at '}
                <span className="text-accent-gold font-mono">{formatValue(currentValue, alert.type)}</span>
              </p>

              {trade && (
                <div className="mt-2 p-2 rounded bg-space-dark/30 border border-accent-cyan/10 text-xs space-y-1">
                  <p>
                    <span className="text-text-secondary">Buy:</span>{' '}
                    <span className="text-text-primary font-mono">
                      {formatNumber(trade['Buy Price'] || 0)} ISK
                    </span>
                  </p>
                  <p>
                    <span className="text-text-secondary">Sell:</span>{' '}
                    <span className="text-text-primary font-mono">
                      {formatNumber(trade['Sell Price'] || 0)} ISK
                    </span>
                  </p>
                  <p>
                    <span className="text-text-secondary">Margin:</span>{' '}
                    <span className="text-green-400 font-mono">
                      {(trade['Gross Margin'] || 0).toFixed(2)}%
                    </span>
                  </p>
                  <p>
                    <span className="text-text-secondary">Net Profit:</span>{' '}
                    <span className="text-accent-gold font-mono">
                      {formatNumber(trade['Net Profit'] || 0)} ISK
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {showActions && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyItemName(alert.itemName)}
                  className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-medium transition-all hover:bg-accent-cyan/20 flex items-center gap-1"
                  title="Copy item name to clipboard"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Name
                </button>

                {onAddToWatchlist && (
                  <button
                    type="button"
                    onClick={() => onAddToWatchlist(alert.itemName, alert.itemId)}
                    className="px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs font-medium transition-all hover:bg-accent-purple/20 flex items-center gap-1"
                    title="Add to watchlist"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Add to Watchlist
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onAcknowledge?.(alert.id)}
                  className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium transition-all hover:bg-green-500/20 flex items-center gap-1"
                  title="Acknowledge and dismiss"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Acknowledge
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-space-dark/30 rounded-xl border border-accent-cyan/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-space-mid/50 border-b border-accent-cyan/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="text-xl font-display font-semibold text-text-primary">
              Notification Center
            </h2>
            <div className="flex gap-2">
              {unacknowledgedAlerts.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-medium animate-pulse">
                  {unacknowledgedAlerts.length} New
                </span>
              )}
              {triggeredHistory.length > 0 && (
                <span className="px-2 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan text-xs font-medium">
                  {triggeredHistory.length} History
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {unacknowledgedAlerts.length > 0 && (
              <button
                type="button"
                onClick={onAcknowledgeAll}
                className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium transition-all hover:bg-green-500/20"
              >
                Mark All as Read
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-secondary text-sm hover:bg-space-mid hover:text-text-primary transition-all"
            >
              {showHistory ? 'Show Active' : 'Show History'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Filters */}
        {(unacknowledgedAlerts.length > 0 || triggeredHistory.length > 0) && (
          <div className="mb-4 flex gap-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-purple"
            >
              <option value="all">All Priorities</option>
              {PRIORITY_LEVELS && Object.entries(PRIORITY_LEVELS).map(([_key, value]) => {
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
              {ALERT_TYPES && Object.entries(ALERT_TYPES).map(([_key, value]) => (
                <option key={value} value={value}>{getAlertTypeLabel(value)}</option>
              ))}
            </select>
          </div>
        )}

        {/* Active Alerts */}
        {!showHistory && (
          <>
            {filteredTriggered.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-text-secondary mb-2">No active notifications</p>
                <p className="text-text-secondary/70 text-sm">
                  {unacknowledgedAlerts.length === 0
                    ? 'All caught up! Alerts will appear here when triggered.'
                    : 'No notifications match your filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTriggered.map(alert => renderAlertCard(alert, true))}
              </div>
            )}
          </>
        )}

        {/* History */}
        {showHistory && (
          <>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-text-secondary mb-2">No notification history</p>
                <p className="text-text-secondary/70 text-sm">Past notifications will appear here</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredHistory.map(alert => renderAlertCard(alert, false))}
                </div>

                {triggeredHistory.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-accent-cyan/10 flex justify-between items-center">
                    <p className="text-sm text-text-secondary">
                      Showing {filteredHistory.length} of {triggeredHistory.length} notification{triggeredHistory.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      type="button"
                      onClick={onClearHistory}
                      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium transition-all hover:bg-red-500/20"
                    >
                      Clear History
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AlertNotificationCenter;
