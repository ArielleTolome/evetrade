import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

const STORAGE_KEY = 'evetrade_price_alerts';
const SETTINGS_KEY = 'evetrade_alert_settings';

/**
 * Price alerts hook
 * Manages price alerts with localStorage persistence, browser notifications, and sound alerts
 */
export function usePriceAlerts() {
  const [alerts, setAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load alerts from localStorage:', e);
      return [];
    }
  });

  const [triggeredAlerts, setTriggeredAlerts] = useState([]);

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        browserNotifications: false,
        soundEnabled: true,
        soundVolume: 0.5,
      };
    } catch {
      return {
        browserNotifications: false,
        soundEnabled: true,
        soundVolume: 0.5,
      };
    }
  });

  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    // Create notification sound using Web Audio API
    audioRef.current = new Audio();
    // Using a data URL for a simple notification beep sound
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOTqXh8LRlHQc5k9nyyncrBSl+zPLaizsKGGS57OihUhMNSpzf8r1nHwU=';
    audioRef.current.volume = settings.soundVolume;
  }, [settings.soundVolume]);

  // Persist to localStorage whenever alerts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage:', e);
    }
  }, [alerts]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save alert settings to localStorage:', e);
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

  // Show browser notification
  const showNotification = useCallback((alert, currentValue) => {
    if (!settings.browserNotifications || notificationPermission !== 'granted') {
      return;
    }

    const title = `Price Alert: ${alert.itemName}`;
    const body = `${getAlertTypeLabel(alert.type)} is ${alert.condition} ${formatThreshold(alert.threshold, alert.type)} (Current: ${formatThreshold(currentValue, alert.type)})`;

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `alert-${alert.id}`,
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
    } catch (e) {
      console.warn('Failed to show notification:', e);
    }
  }, [settings.browserNotifications, notificationPermission]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled || !audioRef.current) {
      return;
    }

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = settings.soundVolume;
      audioRef.current.play().catch(e => {
        console.warn('Failed to play notification sound:', e);
      });
    } catch (e) {
      console.warn('Failed to play notification sound:', e);
    }
  }, [settings.soundEnabled, settings.soundVolume]);

  // Create new alert (alias for backward compatibility)
  const createAlert = useCallback((alert) => {
    const newAlert = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      triggered: false,
      oneTime: true, // Default to one-time alerts
      ...alert,
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert.id;
  }, []);

  // Add alert (same as createAlert, exported for consistency)
  const addAlert = useCallback((alert) => {
    return createAlert(alert);
  }, [createAlert]);

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

  // Check alerts against current data
  const checkAlerts = useCallback((trades) => {
    if (!trades || trades.length === 0) return [];

    const triggered = [];

    alerts.forEach(alert => {
      if (alert.triggered) return;

      // Find matching trade by item ID or name
      const trade = trades.find(t => {
        const itemId = t['Item ID'] || t.itemId;
        const itemName = t['Item'] || t.item;

        if (alert.itemId && itemId) {
          return itemId === alert.itemId;
        }
        if (alert.itemName && itemName) {
          return itemName.toLowerCase() === alert.itemName.toLowerCase();
        }
        return false;
      });

      if (!trade) return;

      let isTriggered = false;
      const currentValue = getAlertValue(trade, alert.type);

      switch (alert.condition) {
        case 'above':
          isTriggered = currentValue > alert.threshold;
          break;
        case 'below':
          isTriggered = currentValue < alert.threshold;
          break;
        case 'equals':
          isTriggered = Math.abs(currentValue - alert.threshold) < 0.01;
          break;
        default:
          break;
      }

      if (isTriggered) {
        const triggeredAlert = {
          ...alert,
          currentValue,
          trade,
          triggeredAt: new Date().toISOString(),
        };
        triggered.push(triggeredAlert);

        // Play sound and show notification
        playNotificationSound();
        showNotification(alert, currentValue);

        // Mark as triggered if one-time alert
        if (alert.oneTime) {
          updateAlert(alert.id, { triggered: true, triggeredAt: new Date().toISOString() });
        }
      }
    });

    if (triggered.length > 0) {
      setTriggeredAlerts(prev => [...prev, ...triggered]);
    }

    return triggered;
  }, [alerts, updateAlert, playNotificationSound, showNotification]);

  // Clear all triggered alerts
  const clearTriggered = useCallback(() => {
    setTriggeredAlerts([]);
  }, []);

  // Dismiss specific triggered alert
  const dismissTriggered = useCallback((alertId) => {
    setTriggeredAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Reset alert (mark as not triggered so it can trigger again)
  const resetAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, triggered: false, triggeredAt: null } : a
    ));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    setTriggeredAlerts([]);
  }, []);

  // Get active alerts count
  const activeCount = useMemo(() =>
    alerts.filter(a => !a.triggered).length
  , [alerts]);

  // Get triggered count
  const triggeredCount = useMemo(() =>
    alerts.filter(a => a.triggered).length
  , [alerts]);

  // Get all alerts (alias for consistency)
  const getAlerts = useCallback(() => alerts, [alerts]);

  return {
    alerts,
    triggeredAlerts,
    activeCount,
    triggeredCount,
    settings,
    notificationPermission,
    createAlert,
    addAlert,
    removeAlert,
    updateAlert,
    resetAlert,
    checkAlerts,
    getAlerts,
    clearTriggered,
    dismissTriggered,
    clearAllAlerts,
    updateSettings,
    requestNotificationPermission,
  };
}

/**
 * Helper to get value from trade based on alert type
 */
function getAlertValue(trade, type) {
  switch (type) {
    case 'buyPrice':
      return trade['Buy Price'] || trade.buyPrice || 0;
    case 'sellPrice':
      return trade['Sell Price'] || trade.sellPrice || 0;
    case 'margin':
      return trade['Gross Margin'] || trade.margin || 0;
    case 'volume':
      return trade['Volume'] || trade.volume || 0;
    case 'profit':
      return trade['Net Profit'] || trade.netProfit || 0;
    default:
      return 0;
  }
}

/**
 * Helper to get alert type label
 */
function getAlertTypeLabel(type) {
  const labels = {
    buyPrice: 'Buy Price',
    sellPrice: 'Sell Price',
    margin: 'Margin',
    volume: 'Volume',
    profit: 'Net Profit',
  };
  return labels[type] || type;
}

/**
 * Helper to format threshold value based on alert type
 */
function formatThreshold(value, type) {
  if (type === 'margin') {
    return `${value.toFixed(2)}%`;
  }
  if (type === 'volume') {
    return value.toLocaleString();
  }
  return `${value.toLocaleString()} ISK`;
}

export default usePriceAlerts;
