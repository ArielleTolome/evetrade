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
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPortfolio({ ...DEFAULT_PORTFOLIO, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    }
    setIsLoaded(true);
  }, []);

  // Save portfolio to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
      } catch (err) {
        console.error('Failed to save portfolio:', err);
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
