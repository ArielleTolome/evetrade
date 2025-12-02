import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'evetrade-portfolio';

/**
 * Default portfolio state
 */
const DEFAULT_PORTFOLIO = {
  savedRoutes: [],
  tradeHistory: [],
  watchlist: [],
  settings: {
    defaultTax: 0.0375,
    defaultBrokerFee: 3,
    accountingLevel: 5,
    brokerRelationsLevel: 5,
  },
};

/**
 * Check if localStorage is available and working
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @returns {string|null} Stored value or null
 */
function safeGetItem(key) {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} True if successful
 */
function safeSetItem(key, value) {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Attempting to clear old data...');
      try {
        // Try to clear some space by removing old trade history
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          // Keep only last 100 trades instead of 1000
          if (data.tradeHistory && data.tradeHistory.length > 100) {
            data.tradeHistory = data.tradeHistory.slice(0, 100);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log('Cleared old trade history to free up space');
          }
        }
        // Try again after cleanup
        localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
        return false;
      }
    }
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

/**
 * Generate a unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Portfolio management hook
 * Persists data to localStorage
 */
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load portfolio from localStorage on mount
  useEffect(() => {
    try {
      const stored = safeGetItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPortfolio({ ...DEFAULT_PORTFOLIO, ...parsed });
        } catch (parseError) {
          console.error('Failed to parse portfolio data:', parseError);
          // If data is corrupted, start with default
          setPortfolio(DEFAULT_PORTFOLIO);
        }
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
      // Use default portfolio as fallback
      setPortfolio(DEFAULT_PORTFOLIO);
    }
    setIsLoaded(true);
  }, []);

  // Save portfolio to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        const serialized = JSON.stringify(portfolio);
        const success = safeSetItem(STORAGE_KEY, serialized);
        if (!success) {
          console.warn('Portfolio data could not be saved to localStorage');
          // Optionally notify user that data isn't being saved
        }
      } catch (err) {
        console.error('Failed to serialize portfolio:', err);
      }
    }
  }, [portfolio, isLoaded]);

  /**
   * Save a new route
   */
  const saveRoute = useCallback((route) => {
    const newRoute = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...route,
    };

    setPortfolio((prev) => ({
      ...prev,
      savedRoutes: [newRoute, ...prev.savedRoutes],
    }));

    return newRoute;
  }, []);

  /**
   * Delete a saved route
   */
  const deleteRoute = useCallback((routeId) => {
    setPortfolio((prev) => ({
      ...prev,
      savedRoutes: prev.savedRoutes.filter((r) => r.id !== routeId),
    }));
  }, []);

  /**
   * Update a saved route
   */
  const updateRoute = useCallback((routeId, updates) => {
    setPortfolio((prev) => ({
      ...prev,
      savedRoutes: prev.savedRoutes.map((r) =>
        r.id === routeId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  }, []);

  /**
   * Add a trade to history
   */
  const addTrade = useCallback((trade) => {
    const newTrade = {
      id: generateId(),
      completedAt: new Date().toISOString(),
      ...trade,
    };

    setPortfolio((prev) => ({
      ...prev,
      tradeHistory: [newTrade, ...prev.tradeHistory].slice(0, 1000), // Keep last 1000 trades
    }));

    return newTrade;
  }, []);

  /**
   * Delete a trade from history
   */
  const deleteTrade = useCallback((tradeId) => {
    setPortfolio((prev) => ({
      ...prev,
      tradeHistory: prev.tradeHistory.filter((t) => t.id !== tradeId),
    }));
  }, []);

  /**
   * Add item to watchlist
   */
  const addToWatchlist = useCallback((item) => {
    const newItem = {
      id: generateId(),
      addedAt: new Date().toISOString(),
      ...item,
    };

    setPortfolio((prev) => {
      // Check if item already exists
      const exists = prev.watchlist.some(
        (w) => w.itemId === item.itemId && w.stationId === item.stationId
      );
      if (exists) return prev;

      return {
        ...prev,
        watchlist: [newItem, ...prev.watchlist],
      };
    });

    return newItem;
  }, []);

  /**
   * Remove item from watchlist
   */
  const removeFromWatchlist = useCallback((watchlistId) => {
    setPortfolio((prev) => ({
      ...prev,
      watchlist: prev.watchlist.filter((w) => w.id !== watchlistId),
    }));
  }, []);

  /**
   * Update settings
   */
  const updateSettings = useCallback((updates) => {
    setPortfolio((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  /**
   * Calculate portfolio statistics
   */
  const getStatistics = useCallback(() => {
    const trades = portfolio.tradeHistory;

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        totalProfit: 0,
        totalVolume: 0,
        averageProfit: 0,
        winRate: 0,
        bestTrade: null,
        worstTrade: null,
        profitByDay: [],
      };
    }

    const profits = trades.map((t) => t.profit || 0);
    const totalProfit = profits.reduce((sum, p) => sum + p, 0);
    const winningTrades = trades.filter((t) => (t.profit || 0) > 0);

    // Group by day
    const profitByDay = trades.reduce((acc, trade) => {
      const day = trade.completedAt?.split('T')[0] || 'Unknown';
      if (!acc[day]) acc[day] = 0;
      acc[day] += trade.profit || 0;
      return acc;
    }, {});

    return {
      totalTrades: trades.length,
      totalProfit,
      totalVolume: trades.reduce((sum, t) => sum + (t.volume || 0), 0),
      averageProfit: totalProfit / trades.length,
      winRate: (winningTrades.length / trades.length) * 100,
      bestTrade: trades.reduce((best, t) => ((t.profit || 0) > (best?.profit || 0) ? t : best), null),
      worstTrade: trades.reduce((worst, t) => ((t.profit || 0) < (worst?.profit || -Infinity) ? t : worst), null),
      profitByDay: Object.entries(profitByDay)
        .map(([date, profit]) => ({ date, profit }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }, [portfolio.tradeHistory]);

  /**
   * Clear all data
   */
  const clearAllData = useCallback(() => {
    setPortfolio(DEFAULT_PORTFOLIO);
    try {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to clear portfolio from localStorage:', err);
    }
  }, []);

  /**
   * Export portfolio data
   */
  const exportData = useCallback(() => {
    return JSON.stringify(portfolio, null, 2);
  }, [portfolio]);

  /**
   * Import portfolio data
   */
  const importData = useCallback((jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      setPortfolio({ ...DEFAULT_PORTFOLIO, ...data });
      return true;
    } catch (err) {
      console.error('Failed to import data:', err);
      return false;
    }
  }, []);

  return {
    // Data
    savedRoutes: portfolio.savedRoutes,
    tradeHistory: portfolio.tradeHistory,
    watchlist: portfolio.watchlist,
    settings: portfolio.settings,
    isLoaded,

    // Route actions
    saveRoute,
    deleteRoute,
    updateRoute,

    // Trade actions
    addTrade,
    deleteTrade,

    // Watchlist actions
    addToWatchlist,
    removeFromWatchlist,

    // Settings
    updateSettings,

    // Statistics
    getStatistics,

    // Data management
    clearAllData,
    exportData,
    importData,
  };
}

export default usePortfolio;
