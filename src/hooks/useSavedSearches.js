import { useState, useEffect, useCallback } from 'react';

const MAX_SAVED_SEARCHES = 10;

/**
 * Custom hook for managing saved searches in localStorage
 * @param {string} pageKey - Unique identifier for the page (e.g., 'station-trading', 'station-hauling')
 * @returns {Object} - Methods and state for managing saved searches
 */
export function useSavedSearches(pageKey) {
  const storageKey = \`evetrade_saved_searches_\${pageKey}\`;
  const [savedSearches, setSavedSearches] = useState([]);

  // Load saved searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedSearches(parsed);
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
      setSavedSearches([]);
    }
  }, [storageKey]);

  /**
   * Save a new search
   * @param {string} name - Name for the saved search
   * @param {Object} parameters - Search parameters to save
   * @returns {Object} - Success status and message
   */
  const saveSearch = useCallback((name, parameters) => {
    try {
      if (!name || !name.trim()) {
        return { success: false, message: 'Search name is required' };
      }

      if (!parameters || Object.keys(parameters).length === 0) {
        return { success: false, message: 'No parameters to save' };
      }

      const newSearch = {
        id: Date.now().toString(),
        name: name.trim(),
        parameters,
        timestamp: new Date().toISOString(),
      };

      setSavedSearches((prev) => {
        const updatedSearches = [newSearch, ...prev];
        if (updatedSearches.length > MAX_SAVED_SEARCHES) {
          updatedSearches.pop();
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify(updatedSearches));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
          return prev;
        }
        return updatedSearches;
      });

      return { success: true, message: 'Search saved successfully' };
    } catch (error) {
      console.error('Error saving search:', error);
      return { success: false, message: 'Failed to save search' };
    }
  }, [storageKey]);

  /**
   * Delete a saved search
   * @param {string} id - ID of the search to delete
   * @returns {Object} - Success status and message
   */
  const deleteSearch = useCallback((id) => {
    try {
      setSavedSearches((prev) => {
        const updatedSearches = prev.filter((search) => search.id !== id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(updatedSearches));
        } catch (error) {
          console.error('Error updating localStorage:', error);
          return prev;
        }
        return updatedSearches;
      });

      return { success: true, message: 'Search deleted successfully' };
    } catch (error) {
      console.error('Error deleting search:', error);
      return { success: false, message: 'Failed to delete search' };
    }
  }, [storageKey]);

  /**
   * Load a saved search
   * @param {string} id - ID of the search to load
   * @returns {Object|null} - The saved search parameters or null if not found
   */
  const loadSearch = useCallback((id) => {
    try {
      const search = savedSearches.find((s) => s.id === id);
      return search ? search.parameters : null;
    } catch (error) {
      console.error('Error loading search:', error);
      return null;
    }
  }, [savedSearches]);

  /**
   * Clear all saved searches
   * @returns {Object} - Success status and message
   */
  const clearAll = useCallback(() => {
    try {
      setSavedSearches([]);
      localStorage.removeItem(storageKey);
      return { success: true, message: 'All searches cleared' };
    } catch (error) {
      console.error('Error clearing searches:', error);
      return { success: false, message: 'Failed to clear searches' };
    }
  }, [storageKey]);

  return {
    savedSearches,
    saveSearch,
    deleteSearch,
    loadSearch,
    clearAll,
    maxSearches: MAX_SAVED_SEARCHES,
    isAtLimit: savedSearches.length >= MAX_SAVED_SEARCHES,
  };
}
