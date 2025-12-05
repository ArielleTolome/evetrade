import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

const STORAGE_KEY = 'evetrade_smart_alerts';
const SETTINGS_KEY = 'evetrade_smart_alert_settings';
const TRIGGERED_HISTORY_KEY = 'evetrade_triggered_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Priority levels for alerts
 */
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Alert type configurations
 */
export const ALERT_TYPES = {
  PRICE_DROP: 'priceDropBelow',
  PRICE_RISE: 'priceRiseAbove',
  MARGIN_THRESHOLD: 'marginReaches',
  VOLUME_SPIKE: 'volumeSpike',
  COMPETITION_UNDERCUT: 'competitionUndercut',
  BUY_PRICE_BELOW: 'buyPriceBelow',
  SELL_PRICE_ABOVE: 'sellPriceAbove',
  NET_PROFIT_ABOVE: 'netProfitAbove',
};

/**
 * Quick preset configurations
 */
export const ALERT_PRESETS = [
  {
    id: 'margin_20',
    name: '20% Margin Opportunity',
    description: 'Alert when an item reaches 20% or higher margin',
    type: ALERT_TYPES.MARGIN_THRESHOLD,
    condition: 'above',
    threshold: 20,
    priority: PRIORITY_LEVELS.HIGH,
  },
  {
    id: 'margin_15',
    name: '15% Margin Opportunity',
    description: 'Alert when an item reaches 15% or higher margin',
    type: ALERT_TYPES.MARGIN_THRESHOLD,
    condition: 'above',
    threshold: 15,
    priority: PRIORITY_LEVELS.MEDIUM,
  },
  {
    id: 'price_drop_50',
    name: '50% Price Drop',
    description: 'Alert when price drops by 50% or more',
    type: ALERT_TYPES.PRICE_DROP,
    condition: 'below',
    threshold: 0.5, // 50% of original price
    priority: PRIORITY_LEVELS.CRITICAL,
  },
  {
    id: 'volume_spike_200',
    name: 'Volume Spike (2x)',
    description: 'Alert when volume doubles from baseline',
    type: ALERT_TYPES.VOLUME_SPIKE,
    condition: 'above',
    threshold: 2, // 2x baseline
    priority: PRIORITY_LEVELS.HIGH,
  },
  {
    id: 'high_profit_1m',
    name: 'High Profit (1M+ ISK)',
    description: 'Alert when net profit exceeds 1 million ISK',
    type: ALERT_TYPES.NET_PROFIT_ABOVE,
    condition: 'above',
    threshold: 1000000,
    priority: PRIORITY_LEVELS.HIGH,
  },
];

/**
 * Smart Alerts Hook
 * Enhanced alert system with priority levels, presets, and smart thresholds
 */
export function useSmartAlerts() {
  const [alerts, setAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load smart alerts from localStorage:', e);
      return [];
    }
  });

  const [triggeredHistory, setTriggeredHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(TRIGGERED_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load triggered history from localStorage:', e);
      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        browserNotifications: false,
        soundEnabled: true,
        soundVolume: 0.5,
        groupSimilarAlerts: true,
        autoAcknowledge: false,
        showOnlyHighPriority: false,
      };
    } catch {
      return {
        browserNotifications: false,
        soundEnabled: true,
        soundVolume: 0.5,
        groupSimilarAlerts: true,
        autoAcknowledge: false,
        showOnlyHighPriority: false,
      };
    }
  });

  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const audioRef = useRef(null);

  // Initialize audio elements
  useEffect(() => {
    audioRef.current = new Audio();
    // Using a data URL for a simple notification beep sound
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOTqXh8LRlHQc5k9nyyncrBSl+zPLaizsKGGS57OihUhMNSpzf8r1nHwU=';
    audioRef.current.volume = settings.soundVolume;
  }, [settings.soundVolume]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save smart alerts to localStorage:', e);
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(TRIGGERED_HISTORY_KEY, JSON.stringify(triggeredHistory));
    } catch (e) {
      console.warn('Failed to save triggered history to localStorage:', e);
    }
  }, [triggeredHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save smart alert settings to localStorage:', e);
    }
  }, [settings]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }

    return false;
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Play notification sound based on priority
  const playNotificationSound = useCallback((priority) => {
    if (!settings.soundEnabled || !audioRef.current) {
      return;
    }

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = settings.soundVolume;

      // Play multiple times for higher priority alerts
      const playCount = priority === PRIORITY_LEVELS.CRITICAL ? 3 : priority === PRIORITY_LEVELS.HIGH ? 2 : 1;

      let played = 0;
      const playNext = () => {
        if (played < playCount) {
          audioRef.current.play().catch(e => {
            console.warn('Failed to play notification sound:', e);
          });
          played++;
          if (played < playCount) {
            setTimeout(playNext, 500);
          }
        }
      };

      playNext();
    } catch (e) {
      console.warn('Failed to play notification sound:', e);
    }
  }, [settings.soundEnabled, settings.soundVolume]);

  // Show browser notification
  const showNotification = useCallback((alert, currentValue, _trade) => {
    if (!settings.browserNotifications || notificationPermission !== 'granted') {
      return;
    }

    const title = `${getPriorityEmoji(alert.priority)} ${alert.itemName}`;
    const body = getAlertDescription(alert, currentValue);

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `alert-${alert.id}`,
        requireInteraction: alert.priority === PRIORITY_LEVELS.CRITICAL,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      if (alert.priority !== PRIORITY_LEVELS.CRITICAL) {
        setTimeout(() => notification.close(), 10000);
      }
    } catch (e) {
      console.warn('Failed to show notification:', e);
    }
  }, [settings.browserNotifications, notificationPermission]);

  // Add alert
  const addAlert = useCallback((alertConfig) => {
    const newAlert = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      triggered: false,
      acknowledged: false,
      priority: PRIORITY_LEVELS.MEDIUM,
      oneTime: true,
      enabled: true,
      ...alertConfig,
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert.id;
  }, []);

  // Add alert from preset
  const addAlertFromPreset = useCallback((presetId, itemName, itemId = null) => {
    const preset = ALERT_PRESETS.find(p => p.id === presetId);
    if (!preset) return null;

    return addAlert({
      itemName,
      itemId,
      type: preset.type,
      condition: preset.condition,
      threshold: preset.threshold,
      priority: preset.priority,
      oneTime: true,
    });
  }, [addAlert]);

  // Remove alert
  const removeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Update alert
  const updateAlert = useCallback((alertId, updates) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, ...updates } : a
    ));
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  // Acknowledge all alerts
  const acknowledgeAll = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  }, []);

  // Calculate optimal threshold based on item volatility
  const calculateOptimalThreshold = useCallback((trades, itemName, alertType) => {
    if (!trades || trades.length === 0) return null;

    const itemTrades = trades.filter(t =>
      (t['Item'] || t.item || '').toLowerCase() === itemName.toLowerCase()
    );

    if (itemTrades.length === 0) return null;

    // Get values based on alert type
    const values = itemTrades.map(t => {
      switch (alertType) {
        case ALERT_TYPES.MARGIN_THRESHOLD:
          return t['Gross Margin'] || 0;
        case ALERT_TYPES.NET_PROFIT_ABOVE:
          return t['Net Profit'] || 0;
        case ALERT_TYPES.BUY_PRICE_BELOW:
          return t['Buy Price'] || 0;
        case ALERT_TYPES.SELL_PRICE_ABOVE:
          return t['Sell Price'] || 0;
        case ALERT_TYPES.VOLUME_SPIKE:
          return t['Volume'] || 0;
        default:
          return 0;
      }
    });

    // Calculate statistics
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Suggest threshold based on 1 standard deviation above average (for above conditions)
    // or 1 standard deviation below average (for below conditions)
    return {
      average: avg,
      stdDev: stdDev,
      suggested: avg + stdDev,
      conservative: avg + (2 * stdDev),
      aggressive: avg + (0.5 * stdDev),
    };
  }, []);

  // Check alerts against current market data
  const checkAlerts = useCallback((trades) => {
    if (!trades || trades.length === 0) return [];

    const triggered = [];
    const now = new Date().toISOString();

    alerts.forEach(alert => {
      if (!alert.enabled || alert.triggered || alert.acknowledged) return;

      // Find matching trade by item ID or name
      const trade = trades.find(t => {
        const itemId = t['Item ID'] || t.itemId;
        const itemName = t['Item'] || t.item;

        if (alert.itemId && itemId) {
          return String(itemId) === String(alert.itemId);
        }
        if (alert.itemName && itemName) {
          return itemName.toLowerCase() === alert.itemName.toLowerCase();
        }
        return false;
      });

      if (!trade) return;

      let isTriggered = false;
      let currentValue = 0;

      // Check conditions based on alert type
      switch (alert.type) {
        case ALERT_TYPES.MARGIN_THRESHOLD:
          currentValue = trade['Gross Margin'] || 0;
          isTriggered = checkCondition(currentValue, alert.condition, alert.threshold);
          break;

        case ALERT_TYPES.NET_PROFIT_ABOVE:
          currentValue = trade['Net Profit'] || 0;
          isTriggered = checkCondition(currentValue, alert.condition, alert.threshold);
          break;

        case ALERT_TYPES.BUY_PRICE_BELOW:
          currentValue = trade['Buy Price'] || 0;
          isTriggered = checkCondition(currentValue, alert.condition, alert.threshold);
          break;

        case ALERT_TYPES.SELL_PRICE_ABOVE:
          currentValue = trade['Sell Price'] || 0;
          isTriggered = checkCondition(currentValue, alert.condition, alert.threshold);
          break;

        case ALERT_TYPES.VOLUME_SPIKE: {
          currentValue = trade['Volume'] || 0;
          const baselineVolume = alert.baselineVolume || alert.threshold;
          isTriggered = currentValue >= baselineVolume * (alert.threshold || 2);
          break;
        }

        case ALERT_TYPES.PRICE_DROP: {
          currentValue = trade['Buy Price'] || 0;
          const originalPrice = alert.baselinePrice || (alert.threshold * 2); // Estimate
          isTriggered = currentValue <= originalPrice * alert.threshold;
          break;
        }

        case ALERT_TYPES.PRICE_RISE: {
          currentValue = trade['Sell Price'] || 0;
          const basePrice = alert.baselinePrice || (alert.threshold / 2); // Estimate
          isTriggered = currentValue >= basePrice * alert.threshold;
          break;
        }

        case ALERT_TYPES.COMPETITION_UNDERCUT: {
          // Check if margin dropped significantly
          currentValue = trade['Gross Margin'] || 0;
          const expectedMargin = alert.baselineMargin || 10;
          isTriggered = currentValue < expectedMargin * 0.7; // 30% drop in margin
          break;
        }

        default:
          break;
      }

      if (isTriggered) {
        const triggeredAlert = {
          ...alert,
          currentValue,
          trade,
          triggeredAt: now,
        };
        triggered.push(triggeredAlert);

        // Add to history
        setTriggeredHistory(prev => {
          const newHistory = [triggeredAlert, ...prev].slice(0, MAX_HISTORY_ITEMS);
          return newHistory;
        });

        // Play sound and show notification
        playNotificationSound(alert.priority);
        showNotification(alert, currentValue, trade);

        // Mark as triggered if one-time alert
        if (alert.oneTime) {
          updateAlert(alert.id, { triggered: true, triggeredAt: now });
        }

        // Auto-acknowledge if enabled
        if (settings.autoAcknowledge) {
          setTimeout(() => {
            acknowledgeAlert(alert.id);
          }, 5000);
        }
      }
    });

    return triggered;
  }, [alerts, settings.autoAcknowledge, updateAlert, acknowledgeAlert, playNotificationSound, showNotification]);

  // Reset alert
  const resetAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, triggered: false, acknowledged: false, triggeredAt: null } : a
    ));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setTriggeredHistory([]);
  }, []);

  // Export alerts configuration
  const exportAlerts = useCallback(() => {
    const exportData = {
      alerts,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(exportData, null, 2);
  }, [alerts, settings]);

  // Import alerts configuration
  const importAlerts = useCallback((jsonString) => {
    try {
      const importData = JSON.parse(jsonString);
      if (importData.alerts && Array.isArray(importData.alerts)) {
        setAlerts(importData.alerts);
      }
      if (importData.settings) {
        setSettings(prev => ({ ...prev, ...importData.settings }));
      }
      return true;
    } catch (e) {
      console.error('Failed to import alerts:', e);
      return false;
    }
  }, []);

  // Computed values
  const activeAlerts = useMemo(() =>
    alerts.filter(a => a.enabled && !a.triggered && !a.acknowledged)
  , [alerts]);

  const triggeredAlerts = useMemo(() =>
    alerts.filter(a => a.triggered && !a.acknowledged)
  , [alerts]);

  const acknowledgedAlerts = useMemo(() =>
    alerts.filter(a => a.acknowledged)
  , [alerts]);

  const alertsByPriority = useMemo(() => {
    const groups = {
      [PRIORITY_LEVELS.CRITICAL]: [],
      [PRIORITY_LEVELS.HIGH]: [],
      [PRIORITY_LEVELS.MEDIUM]: [],
      [PRIORITY_LEVELS.LOW]: [],
    };
    activeAlerts.forEach(alert => {
      const priority = alert.priority || PRIORITY_LEVELS.MEDIUM;
      if (groups[priority]) {
        groups[priority].push(alert);
      }
    });
    return groups;
  }, [activeAlerts]);

  return {
    // State
    alerts,
    activeAlerts,
    triggeredAlerts,
    acknowledgedAlerts,
    triggeredHistory,
    settings,
    notificationPermission,
    alertsByPriority,

    // Alert management
    addAlert,
    addAlertFromPreset,
    removeAlert,
    updateAlert,
    resetAlert,
    clearAllAlerts,

    // Alert checking
    checkAlerts,
    calculateOptimalThreshold,

    // Acknowledgement
    acknowledgeAlert,
    acknowledgeAll,

    // History
    clearHistory,

    // Settings
    updateSettings,
    requestNotificationPermission,

    // Import/Export
    exportAlerts,
    importAlerts,

    // Constants
    ALERT_TYPES,
    PRIORITY_LEVELS,
    ALERT_PRESETS,
  };
}

/**
 * Check if a condition is met
 */
function checkCondition(value, condition, threshold) {
  switch (condition) {
    case 'above':
      return value > threshold;
    case 'below':
      return value < threshold;
    case 'equals':
      return Math.abs(value - threshold) < 0.01;
    default:
      return false;
  }
}

/**
 * Get priority emoji
 */
function getPriorityEmoji(priority) {
  switch (priority) {
    case PRIORITY_LEVELS.CRITICAL:
      return '🚨';
    case PRIORITY_LEVELS.HIGH:
      return '⚠️';
    case PRIORITY_LEVELS.MEDIUM:
      return '📢';
    case PRIORITY_LEVELS.LOW:
      return 'ℹ️';
    default:
      return '🔔';
  }
}

/**
 * Get alert description
 */
function getAlertDescription(alert, currentValue) {
  const type = getAlertTypeLabel(alert.type);
  const condition = getConditionLabel(alert.condition);
  const threshold = formatThreshold(alert.threshold, alert.type);
  const current = formatThreshold(currentValue, alert.type);

  return `${type} is ${condition} ${threshold} (Current: ${current})`;
}

/**
 * Get alert type label
 */
function getAlertTypeLabel(type) {
  const labels = {
    [ALERT_TYPES.PRICE_DROP]: 'Price',
    [ALERT_TYPES.PRICE_RISE]: 'Price',
    [ALERT_TYPES.MARGIN_THRESHOLD]: 'Margin',
    [ALERT_TYPES.VOLUME_SPIKE]: 'Volume',
    [ALERT_TYPES.COMPETITION_UNDERCUT]: 'Competition',
    [ALERT_TYPES.BUY_PRICE_BELOW]: 'Buy Price',
    [ALERT_TYPES.SELL_PRICE_ABOVE]: 'Sell Price',
    [ALERT_TYPES.NET_PROFIT_ABOVE]: 'Net Profit',
  };
  return labels[type] || type;
}

/**
 * Get condition label
 */
function getConditionLabel(condition) {
  const labels = {
    above: 'above',
    below: 'below',
    equals: 'equals',
  };
  return labels[condition] || condition;
}

/**
 * Format threshold value
 */
function formatThreshold(value, type) {
  if (type === ALERT_TYPES.MARGIN_THRESHOLD) {
    return `${value.toFixed(2)}%`;
  }
  if (type === ALERT_TYPES.VOLUME_SPIKE) {
    return `${value.toLocaleString()}x`;
  }
  if (type === ALERT_TYPES.PRICE_DROP || type === ALERT_TYPES.PRICE_RISE) {
    return `${(value * 100).toFixed(0)}%`;
  }
  return `${value.toLocaleString()} ISK`;
}

export default useSmartAlerts;
