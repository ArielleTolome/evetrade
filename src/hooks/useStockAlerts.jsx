import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing stock level alerts and notifications
 * Persists thresholds to localStorage and triggers browser notifications
 */
export function useStockAlerts() {
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('evetrade_stock_alerts');
    return saved ? JSON.parse(saved) : {};
  });

  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('evetrade_stock_alerts', JSON.stringify(alerts));
  }, [alerts]);

  /**
   * Request notification permission from the browser
   */
  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }

    return false;
  }, []);

  /**
   * Set stock threshold for an item
   * @param {string|number} itemId - The item type ID
   * @param {string} itemName - The item name for display
   * @param {number} threshold - The minimum quantity before alerting
   */
  const setThreshold = useCallback((itemId, itemName, threshold) => {
    setAlerts(prev => ({
      ...prev,
      [itemId]: {
        itemId,
        itemName,
        threshold,
        lastAlerted: null,
      }
    }));
  }, []);

  /**
   * Remove threshold for an item
   * @param {string|number} itemId - The item type ID
   */
  const removeThreshold = useCallback((itemId) => {
    setAlerts(prev => {
      const newAlerts = { ...prev };
      delete newAlerts[itemId];
      return newAlerts;
    });
  }, []);

  /**
   * Check stock levels and trigger alerts if needed
   * @param {Array} inventory - Array of inventory items with { itemId, itemName, quantity }
   * @returns {Array} Items that are below threshold
   */
  const checkStockLevels = useCallback((inventory) => {
    const lowStockItems = [];
    const now = Date.now();

    inventory.forEach(item => {
      const alert = alerts[item.itemId];
      if (!alert) return;

      if (item.quantity <= alert.threshold) {
        lowStockItems.push({
          ...item,
          threshold: alert.threshold,
          deficit: alert.threshold - item.quantity,
        });

        // Only send notification if we haven't alerted in the last hour
        const lastAlerted = alert.lastAlerted;
        const oneHour = 60 * 60 * 1000;

        if (!lastAlerted || (now - lastAlerted) > oneHour) {
          sendNotification(item, alert);

          // Update last alerted time
          setAlerts(prev => ({
            ...prev,
            [item.itemId]: {
              ...prev[item.itemId],
              lastAlerted: now,
            }
          }));
        }
      }
    });

    return lowStockItems;
  }, [alerts]);

  /**
   * Send browser notification for low stock
   */
  const sendNotification = (item, alert) => {
    if (notificationPermission !== 'granted') return;

    try {
      const notification = new Notification('Low Stock Alert - EVETrade', {
        body: `${item.itemName} is low (${item.quantity}/${alert.threshold})`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `stock-alert-${item.itemId}`, // Prevents duplicate notifications
        requireInteraction: false,
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  /**
   * Get all configured alerts
   */
  const getAllAlerts = useCallback(() => {
    return Object.values(alerts);
  }, [alerts]);

  /**
   * Get alert for specific item
   */
  const getAlert = useCallback((itemId) => {
    return alerts[itemId] || null;
  }, [alerts]);

  /**
   * Clear all alerts
   */
  const clearAllAlerts = useCallback(() => {
    setAlerts({});
  }, []);

  return {
    // State
    alerts: getAllAlerts(),
    notificationPermission,

    // Methods
    setThreshold,
    removeThreshold,
    checkStockLevels,
    requestNotificationPermission,
    getAlert,
    clearAllAlerts,
  };
}
