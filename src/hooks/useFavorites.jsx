import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'evetrade-favorites';

/**
 * Favorites/Bookmarks management hook
 * Persists favorite item IDs to localStorage
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (err) {
        console.error('Failed to save favorites:', err);
      }
    }
  }, [favorites, isLoaded]);

  /**
   * Add an item ID to favorites
   */
  const addFavorite = useCallback((itemId) => {
    setFavorites((prev) => {
      if (prev.includes(itemId)) return prev;
      return [...prev, itemId];
    });
  }, []);

  /**
   * Remove an item ID from favorites
   */
  const removeFavorite = useCallback((itemId) => {
    setFavorites((prev) => prev.filter((id) => id !== itemId));
  }, []);

  /**
   * Check if an item ID is favorited
   */
  const isFavorite = useCallback((itemId) => {
    return favorites.includes(itemId);
  }, [favorites]);

  /**
   * Toggle favorite status for an item ID
   */
  const toggleFavorite = useCallback((itemId) => {
    setFavorites((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      return [...prev, itemId];
    });
  }, []);

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  };
}

export default useFavorites;
