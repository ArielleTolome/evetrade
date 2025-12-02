import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'evetrade_watchlists';

/**
 * Watchlist management hook
 * Manages multiple watchlists with price tracking and alerts
 * Persists to localStorage
 */
export function useWatchlist() {
  const [watchlists, setWatchlists] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        default: { name: 'Default', items: [], createdAt: Date.now() },
      };
    } catch (e) {
      console.warn('Failed to load watchlists from localStorage:', e);
      return { default: { name: 'Default', items: [], createdAt: Date.now() } };
    }
  });

  const [activeList, setActiveList] = useState('default');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists));
    } catch (e) {
      console.warn('Failed to save watchlists to localStorage:', e);
    }
  }, [watchlists]);

  // Create new watchlist
  const createWatchlist = useCallback((name) => {
    const id = `list_${Date.now()}`;
    setWatchlists(prev => ({
      ...prev,
      [id]: { name, items: [], createdAt: Date.now() },
    }));
    return id;
  }, []);

  // Delete watchlist
  const deleteWatchlist = useCallback((listId) => {
    if (listId === 'default') return; // Can't delete default
    setWatchlists(prev => {
      const { [listId]: removed, ...rest } = prev;
      return rest;
    });
    if (activeList === listId) setActiveList('default');
  }, [activeList]);

  // Rename watchlist
  const renameWatchlist = useCallback((listId, newName) => {
    setWatchlists(prev => {
      if (!prev[listId]) return prev;
      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          name: newName,
        },
      };
    });
  }, []);

  // Add item to watchlist
  const addToWatchlist = useCallback((item, listId = activeList) => {
    const itemData = {
      id: item['Item ID'] || item.itemId || Date.now(),
      name: item['Item'] || item.name,
      addedAt: Date.now(),
      initialPrice: {
        buy: item['Buy Price'] || item.buyPrice,
        sell: item['Sell Price'] || item.sellPrice,
      },
      currentPrice: {
        buy: item['Buy Price'] || item.buyPrice,
        sell: item['Sell Price'] || item.sellPrice,
      },
      notes: '',
      alerts: [],
    };

    setWatchlists(prev => {
      if (!prev[listId]) return prev;
      if (prev[listId].items.find(i => i.id === itemData.id)) return prev;

      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: [...prev[listId].items, itemData],
        },
      };
    });
  }, [activeList]);

  // Remove item from watchlist
  const removeFromWatchlist = useCallback((itemId, listId = activeList) => {
    setWatchlists(prev => {
      if (!prev[listId]) return prev;
      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: prev[listId].items.filter(i => i.id !== itemId),
        },
      };
    });
  }, [activeList]);

  // Update notes for a watchlist item
  const updateItemNotes = useCallback((itemId, notes, listId = activeList) => {
    setWatchlists(prev => {
      if (!prev[listId]) return prev;
      return {
        ...prev,
        [listId]: {
          ...prev[listId],
          items: prev[listId].items.map(item =>
            item.id === itemId ? { ...item, notes } : item
          ),
        },
      };
    });
  }, [activeList]);

  // Check if item is in any watchlist
  const isWatched = useCallback((itemId) => {
    return Object.values(watchlists).some(list =>
      list.items.some(item => item.id === itemId)
    );
  }, [watchlists]);

  // Get watchlist containing item
  const getWatchlistForItem = useCallback((itemId) => {
    const entry = Object.entries(watchlists).find(([, list]) =>
      list.items.some(item => item.id === itemId)
    );
    return entry ? { id: entry[0], ...entry[1] } : null;
  }, [watchlists]);

  // Get all watched item IDs
  const watchedIds = useMemo(() => {
    const ids = new Set();
    Object.values(watchlists).forEach(list => {
      list.items.forEach(item => ids.add(item.id));
    });
    return Array.from(ids);
  }, [watchlists]);

  // Update prices for watched items
  const updatePrices = useCallback((trades) => {
    setWatchlists(prev => {
      const updated = { ...prev };

      Object.keys(updated).forEach(listId => {
        updated[listId] = {
          ...updated[listId],
          items: updated[listId].items.map(item => {
            const trade = trades.find(t =>
              (t['Item ID'] || t.itemId) === item.id
            );
            if (trade) {
              return {
                ...item,
                currentPrice: {
                  buy: trade['Buy Price'] || trade.buyPrice,
                  sell: trade['Sell Price'] || trade.sellPrice,
                },
                lastUpdated: Date.now(),
              };
            }
            return item;
          }),
        };
      });

      return updated;
    });
  }, []);

  // Get current watchlist
  const currentList = useMemo(() => {
    return watchlists[activeList] || watchlists.default;
  }, [watchlists, activeList]);

  // Get all watchlist entries as array
  const watchlistArray = useMemo(() => {
    return Object.entries(watchlists).map(([id, list]) => ({
      id,
      ...list,
    }));
  }, [watchlists]);

  // Get total item count across all watchlists
  const totalItemCount = useMemo(() => {
    return Object.values(watchlists).reduce((sum, list) => sum + list.items.length, 0);
  }, [watchlists]);

  return {
    watchlists,
    watchlistArray,
    activeList,
    setActiveList,
    currentList,
    totalItemCount,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateItemNotes,
    isWatched,
    getWatchlistForItem,
    watchedIds,
    updatePrices,
  };
}

export default useWatchlist;
