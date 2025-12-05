import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'evetrade-clipboard-history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Custom hook for clipboard operations with history tracking
 * @returns {Object} Clipboard utilities
 * @property {Function} copy - Copy text to clipboard with optional format
 * @property {boolean} copied - Recently copied indicator
 * @property {Array} history - Array of recent clipboard items
 * @property {Function} clearHistory - Clear clipboard history
 * @property {Function} removeFromHistory - Remove specific item from history
 * @property {Function} pinItem - Pin/unpin a history item
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (_err) {
      console.error('Failed to load clipboard history:', err);
      return [];
    }
  });

  const copiedTimeoutRef = useRef(null);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (_err) {
      console.error('Failed to save clipboard history:', err);
    }
  }, [history]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Format data based on specified format type
   */
  const formatData = useCallback((data, format = 'text') => {
    if (typeof data === 'string') {
      return data;
    }

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'csv':
        if (Array.isArray(data)) {
          // Handle array of objects
          if (data.length > 0 && typeof data[0] === 'object') {
            const headers = Object.keys(data[0]);
            const csvRows = [
              headers.join(','),
              ...data.map(row => headers.map(h => {
                const value = row[h];
                // Escape values containing commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              }).join(','))
            ];
            return csvRows.join('\n');
          }
          // Handle array of primitives
          return data.join('\n');
        }
        return String(data);

      case 'ingame':
        // EVE Online in-game format (item names separated by newlines)
        if (Array.isArray(data)) {
          return data.map(item => {
            if (typeof item === 'object' && item.name) {
              return item.name;
            }
            return String(item);
          }).join('\n');
        }
        return String(data);

      default:
        return String(data);
    }
  }, []);

  /**
   * Copy text to clipboard and add to history
   */
  const copy = useCallback(async (data, format = 'text', options = {}) => {
    const { label, skipHistory = false } = options;

    try {
      const text = formatData(data, format);
      await navigator.clipboard.writeText(text);

      // Set copied state
      setCopied(true);

      // Clear previous timeout
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }

      // Reset copied state after 2 seconds
      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);

      // Add to history (unless skipped)
      if (!skipHistory) {
        setHistory(prev => {
          const newItem = {
            id: Date.now(),
            text,
            format,
            label: label || `${format} copy`,
            timestamp: new Date().toISOString(),
            pinned: false,
          };

          // Remove duplicate if exists (same text)
          const filtered = prev.filter(item => item.text !== text);

          // Add new item at the beginning
          const updated = [newItem, ...filtered];

          // Keep only pinned items + most recent items (up to MAX_HISTORY_ITEMS)
          const pinned = updated.filter(item => item.pinned);
          const unpinned = updated.filter(item => !item.pinned).slice(0, MAX_HISTORY_ITEMS - pinned.length);

          return [...pinned, ...unpinned];
        });
      }

      return { success: true, text };
    } catch (_err) {
      console.error('Failed to copy to clipboard:', err);
      return { success: false, error: err.message };
    }
  }, [formatData]);

  /**
   * Clear all clipboard history
   */
  const clearHistory = useCallback(() => {
    setHistory(prev => prev.filter(item => item.pinned));
  }, []);

  /**
   * Remove specific item from history
   */
  const removeFromHistory = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  /**
   * Toggle pin status of a history item
   */
  const pinItem = useCallback((id) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    ));
  }, []);

  /**
   * Re-copy an item from history
   */
  const recopy = useCallback(async (id) => {
    const item = history.find(h => h.id === id);
    if (item) {
      return copy(item.text, item.format, { label: item.label, skipHistory: true });
    }
    return { success: false, error: 'Item not found' };
  }, [history, copy]);

  return {
    copy,
    copied,
    history,
    clearHistory,
    removeFromHistory,
    pinItem,
    recopy,
  };
}

export default useClipboard;
