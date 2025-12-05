import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'evetrade_session';

/**
 * Trade session tracking hook
 * Tracks trades viewed, shopping list, and potential profit during a trading session
 */
export function useTradeSession() {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse session data:', e);
      }
    }
    return {
      startTime: Date.now(),
      viewedTrades: [],
      shoppingList: [],
      totalPotentialProfit: 0,
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  // Add trade to shopping list
  const addToShoppingList = useCallback((trade) => {
    setSession(prev => {
      if (prev.shoppingList.find(t => t['Item ID'] === trade['Item ID'])) {
        return prev;
      }
      const newList = [...prev.shoppingList, trade];
      const totalProfit = newList.reduce((sum, t) => sum + (t['Net Profit'] || 0), 0);
      return {
        ...prev,
        shoppingList: newList,
        totalPotentialProfit: totalProfit,
      };
    });
  }, []);

  // Remove from shopping list
  const removeFromShoppingList = useCallback((itemId) => {
    setSession(prev => {
      const newList = prev.shoppingList.filter(t => t['Item ID'] !== itemId);
      const totalProfit = newList.reduce((sum, t) => sum + (t['Net Profit'] || 0), 0);
      return {
        ...prev,
        shoppingList: newList,
        totalPotentialProfit: totalProfit,
      };
    });
  }, []);

  // Track viewed trade
  const trackView = useCallback((trade) => {
    setSession(prev => {
      if (prev.viewedTrades.includes(trade['Item ID'])) return prev;
      return {
        ...prev,
        viewedTrades: [...prev.viewedTrades, trade['Item ID']],
      };
    });
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    setSession({
      startTime: Date.now(),
      viewedTrades: [],
      shoppingList: [],
      totalPotentialProfit: 0,
    });
  }, []);

  // Session duration in minutes (uses stable timestamp from state initialization)
  const [mountTime] = useState(() => Date.now());
  const sessionDuration = useMemo(() => {
    return Math.floor((mountTime - session.startTime) / 60000); // minutes
  }, [session.startTime, mountTime]);

  return {
    session,
    addToShoppingList,
    removeFromShoppingList,
    trackView,
    clearSession,
    sessionDuration,
    shoppingListCount: session.shoppingList.length,
    viewedCount: session.viewedTrades.length,
    totalPotentialProfit: session.totalPotentialProfit,
  };
}

export default useTradeSession;
