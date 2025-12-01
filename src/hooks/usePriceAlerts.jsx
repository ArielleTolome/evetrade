import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'evetrade_price_alerts';

/**
 * Price alerts hook
 * Manages price alerts with localStorage persistence
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

  // Persist to localStorage whenever alerts change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage:', e);
    }
  }, [alerts]);

  // Create new alert
  const createAlert = useCallback((alert) => {
    const newAlert = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      triggered: false,
      oneTime: true, // Default to one-time alerts
      ...alert,
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
        triggered.push({
          ...alert,
          currentValue,
          trade,
          triggeredAt: new Date().toISOString(),
        });

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
  }, [alerts, updateAlert]);

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

  return {
    alerts,
    triggeredAlerts,
    activeCount,
    triggeredCount,
    createAlert,
    removeAlert,
    updateAlert,
    resetAlert,
    checkAlerts,
    clearTriggered,
    dismissTriggered,
    clearAllAlerts,
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

export default usePriceAlerts;
