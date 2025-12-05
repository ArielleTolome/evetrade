import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { getMarketOrders } from '../api/esi';

const STORAGE_KEY = 'evetrade_price_alerts';
const SETTINGS_KEY = 'evetrade_alert_settings';
const HISTORY_KEY = 'evetrade_alert_history';

/**
 * Price alerts hook
 * Manages price alerts with localStorage persistence, browser notifications, and ESI market data checking
 *
 * Alert types:
 * - price_above: Trigger when market price goes above threshold
 * - price_below: Trigger when market price goes below threshold
 * - undercut: Trigger when someone undercuts your order (requires auth)
 * - order_expiry: Trigger when order is about to expire (requires auth)
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

  const [alertHistory, setAlertHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load alert history from localStorage:', e);
      return [];
    }
  });

  // Track triggered alerts that haven't been dismissed yet
  const [triggeredAlerts, setTriggeredAlerts] = useState(() => {
    try {
      const stored = localStorage.getItem('evetrade_triggered_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch {
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
        checkInterval: 60000, // Check every minute
      };
    } catch {
      return {
        browserNotifications: false,
        soundEnabled: true,
        soundVolume: 0.5,
        checkInterval: 60000,
      };
    }
  });

  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const [isChecking, setIsChecking] = useState(false);
  const audioRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    // Simple beep sound
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOTqXh8LRlHQc5k9nyyncrBSl+zPLaizsKGGS57OihUhMNSpzf8r1nHwU=';
    audioRef.current.volume = settings.soundVolume;
  }, [settings.soundVolume]);

  // Persist alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage:', e);
    }
  }, [alerts]);

  // Persist history to localStorage
  useEffect(() => {
    try {
      // Keep only last 100 history items
      const recentHistory = alertHistory.slice(-100);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(recentHistory));
    } catch (e) {
      console.warn('Failed to save alert history to localStorage:', e);
    }
  }, [alertHistory]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save alert settings to localStorage:', e);
    }
  }, [settings]);

  // Persist triggered alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('evetrade_triggered_alerts', JSON.stringify(triggeredAlerts));
    } catch (e) {
      console.warn('Failed to save triggered alerts to localStorage:', e);
    }
  }, [triggeredAlerts]);

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
  const showNotification = useCallback((alert, currentPrice) => {
    if (!settings.browserNotifications || notificationPermission !== 'granted') {
      return;
    }

    const title = `Price Alert: ${alert.itemName}`;
    const body = getAlertMessage(alert, currentPrice);

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

  // Add alert to history and triggered alerts
  const addToHistory = useCallback((alert, currentPrice, message) => {
    const historyItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      alertId: alert.id,
      itemName: alert.itemName,
      typeId: alert.typeId,
      alertType: alert.alertType,
      type: alert.alertType,
      threshold: alert.threshold,
      currentPrice,
      currentValue: currentPrice?.toLocaleString() + ' ISK',
      condition: alert.alertType === 'price_above' ? 'above' : 'below',
      message,
      triggeredAt: new Date().toISOString(),
    };
    setAlertHistory(prev => [...prev, historyItem]);
    // Also add to triggered alerts (active notifications)
    setTriggeredAlerts(prev => [...prev, historyItem]);
  }, []);

  // Dismiss a triggered alert
  const dismissTriggered = useCallback((alertId) => {
    setTriggeredAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  // Dismiss all triggered alerts
  const dismissAllTriggered = useCallback(() => {
    setTriggeredAlerts([]);
  }, []);

  // Create new alert
  const createAlert = useCallback((alertData) => {
    const newAlert = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      enabled: true,
      lastChecked: null,
      lastTriggered: null,
      ...alertData,
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert.id;
  }, []);

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

  // Toggle alert enabled status
  const toggleAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ));
  }, []);

  // Check single alert against market data
  const checkSingleAlert = useCallback(async (alert) => {
    if (!alert.enabled || !alert.typeId) {
      return false;
    }

    // Validate required properties
    if (!alert.typeId || typeof alert.typeId !== 'number') {
      console.warn(`Alert ${alert.id} missing valid typeId`);
      return false;
    }

    try {
      // Get market orders for this item (using The Forge region ID: 10000002)
      const regionId = alert.regionId || 10000002;

      // Validate regionId before making API call
      if (!regionId || typeof regionId !== 'number') {
        console.warn(`Alert ${alert.id} has invalid regionId`);
        return false;
      }

      const orders = await getMarketOrders(regionId, alert.typeId);

      if (!orders || orders.length === 0) {
        return false;
      }

      // Get best prices
      const sellOrders = orders.filter(o => !o.is_buy_order).sort((a, b) => a.price - b.price);
      const buyOrders = orders.filter(o => o.is_buy_order).sort((a, b) => b.price - a.price);

      const bestSellPrice = sellOrders[0]?.price || 0;
      const _bestBuyPrice = buyOrders[0]?.price || 0;

      // Initialize currentPrice with a default value to prevent undefined comparisons
      let currentPrice = 0;

      // Determine which price to check based on alert type
      if (alert.alertType === 'price_below' || alert.alertType === 'price_above') {
        // Use sell price for general price alerts
        currentPrice = bestSellPrice;
      }

      let isTriggered = false;
      let message = '';

      switch (alert.alertType) {
        case 'price_above':
          if (currentPrice > alert.threshold) {
            isTriggered = true;
            message = `Price is now ${currentPrice.toLocaleString()} ISK (above ${alert.threshold.toLocaleString()} ISK)`;
          }
          break;
        case 'price_below':
          if (currentPrice < alert.threshold && currentPrice > 0) {
            isTriggered = true;
            message = `Price is now ${currentPrice.toLocaleString()} ISK (below ${alert.threshold.toLocaleString()} ISK)`;
          }
          break;
        case 'undercut':
          // This would require character order data - placeholder for now
          message = 'Undercut detection requires authentication';
          break;
        case 'order_expiry':
          // This would require character order data - placeholder for now
          message = 'Order expiry detection requires authentication';
          break;
        default:
          break;
      }

      // Update last checked time
      updateAlert(alert.id, { lastChecked: new Date().toISOString() });

      if (isTriggered) {
        // Trigger the alert
        playNotificationSound();
        showNotification(alert, currentPrice);
        addToHistory(alert, currentPrice, message);
        updateAlert(alert.id, {
          lastTriggered: new Date().toISOString(),
          lastTriggerPrice: currentPrice,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error checking alert ${alert.id}:`, error);
      return false;
    }
  }, [updateAlert, playNotificationSound, showNotification, addToHistory]);

  // Check all enabled alerts
  const checkAllAlerts = useCallback(async () => {
    if (isChecking || alerts.length === 0) {
      return;
    }

    setIsChecking(true);
    const enabledAlerts = alerts.filter(a => a.enabled);

    try {
      const results = await Promise.allSettled(
        enabledAlerts.map(alert => checkSingleAlert(alert))
      );

      const triggeredCount = results.filter(
        r => r.status === 'fulfilled' && r.value === true
      ).length;

      if (triggeredCount > 0) {
        console.log(`${triggeredCount} alert(s) triggered`);
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    } finally {
      setIsChecking(false);
    }
  }, [alerts, isChecking, checkSingleAlert]);

  // Start automatic checking
  const startAutoCheck = useCallback(() => {
    // Clear any existing interval to prevent memory leaks
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    // Check immediately
    checkAllAlerts();

    // Set up interval
    checkIntervalRef.current = setInterval(() => {
      checkAllAlerts();
    }, settings.checkInterval);
  }, [checkAllAlerts, settings.checkInterval]);

  // Stop automatic checking
  const stopAutoCheck = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setAlertHistory([]);
  }, []);

  // Check alerts against provided trading data (e.g., from station trading results)
  const checkAlerts = useCallback((tradingData) => {
    if (!tradingData || !Array.isArray(tradingData) || tradingData.length === 0) {
      return;
    }
    if (!alerts || alerts.length === 0) {
      return;
    }

    const enabledAlerts = alerts.filter(a => a.enabled);
    if (enabledAlerts.length === 0) {
      return;
    }

    // Check each alert against the trading data
    for (const alert of enabledAlerts) {
      // Find matching item in trading data
      const matchingItem = tradingData.find(item => {
        const itemId = item['Item ID'] || item.itemId || item.type_id;
        return itemId && String(itemId) === String(alert.typeId);
      });

      if (!matchingItem) continue;

      // Get current price from trading data
      const sellPrice = matchingItem['Sell Price'] || matchingItem.sellPrice || matchingItem.price || 0;
      const buyPrice = matchingItem['Buy Price'] || matchingItem.buyPrice || 0;
      const currentPrice = sellPrice || buyPrice;

      if (currentPrice <= 0) continue;

      let isTriggered = false;
      let message = '';

      switch (alert.alertType) {
        case 'price_above':
          if (currentPrice > alert.threshold) {
            isTriggered = true;
            message = `Price is now ${currentPrice.toLocaleString()} ISK (above ${alert.threshold.toLocaleString()} ISK)`;
          }
          break;
        case 'price_below':
          if (currentPrice < alert.threshold && currentPrice > 0) {
            isTriggered = true;
            message = `Price is now ${currentPrice.toLocaleString()} ISK (below ${alert.threshold.toLocaleString()} ISK)`;
          }
          break;
        default:
          break;
      }

      if (isTriggered) {
        // Check if we've triggered this alert recently (within 5 minutes) to avoid spam
        if (alert.lastTriggered) {
          const lastTriggerTime = new Date(alert.lastTriggered).getTime();
          const now = Date.now();
          if (now - lastTriggerTime < 300000) { // 5 minutes
            continue;
          }
        }

        // Trigger the alert
        playNotificationSound();
        showNotification(alert, currentPrice);
        addToHistory(alert, currentPrice, message);
        updateAlert(alert.id, {
          lastTriggered: new Date().toISOString(),
          lastTriggerPrice: currentPrice,
        });
      }
    }
  }, [alerts, playNotificationSound, showNotification, addToHistory, updateAlert]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);

  // Clean up and restart interval when checkInterval setting changes
  useEffect(() => {
    // If an interval is currently running, restart it with the new interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = setInterval(() => {
        checkAllAlerts();
      }, settings.checkInterval);
    }
  }, [settings.checkInterval, checkAllAlerts]);

  // Stats
  const stats = useMemo(() => ({
    total: alerts.length,
    enabled: alerts.filter(a => a.enabled).length,
    disabled: alerts.filter(a => !a.enabled).length,
    recentlyTriggered: alerts.filter(a => {
      if (!a.lastTriggered) return false;
      const triggerTime = new Date(a.lastTriggered).getTime();
      const now = Date.now();
      return now - triggerTime < 3600000; // Within last hour
    }).length,
  }), [alerts]);

  return {
    alerts,
    alertHistory,
    triggeredAlerts,
    stats,
    settings,
    notificationPermission,
    isChecking,
    createAlert,
    removeAlert,
    updateAlert,
    toggleAlert,
    checkSingleAlert,
    checkAllAlerts,
    checkAlerts,
    startAutoCheck,
    stopAutoCheck,
    clearAllAlerts,
    clearHistory,
    dismissTriggered,
    dismissAllTriggered,
    updateSettings,
    requestNotificationPermission,
  };
}

/**
 * Get alert message based on type and current price
 */
function getAlertMessage(alert, currentPrice) {
  const priceStr = currentPrice != null ? currentPrice.toLocaleString() : 'unknown';
  switch (alert.alertType) {
    case 'price_above':
      return `${alert.itemName} is now ${priceStr} ISK (above ${alert.threshold.toLocaleString()} ISK)`;
    case 'price_below':
      return `${alert.itemName} is now ${priceStr} ISK (below ${alert.threshold.toLocaleString()} ISK)`;
    case 'undercut':
      return `Your ${alert.itemName} order has been undercut`;
    case 'order_expiry':
      return `Your ${alert.itemName} order is expiring soon`;
    default:
      return `Alert triggered for ${alert.itemName}`;
  }
}

export default usePriceAlerts;
