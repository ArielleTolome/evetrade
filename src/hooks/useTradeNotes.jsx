import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'evetrade_trade_notes';

const QUICK_TAGS = [
  { id: 'good', label: 'Good Trade', color: 'green', icon: '👍' },
  { id: 'bad', label: 'Bad Trade', color: 'red', icon: '👎' },
  { id: 'testing', label: 'Testing', color: 'yellow', icon: '🧪' },
  { id: 'favorite', label: 'Favorite', color: 'gold', icon: '⭐' },
  { id: 'avoid', label: 'Avoid', color: 'red', icon: '🚫' },
  { id: 'scam', label: 'Scam', color: 'red', icon: '⚠️' },
  { id: 'seasonal', label: 'Seasonal', color: 'purple', icon: '📅' },
  { id: 'high-competition', label: 'High Competition', color: 'orange', icon: '⚔️' },
];

export function useTradeNotes() {
  const [notes, setNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Add or update note
  const setNote = useCallback((itemId, note) => {
    setNotes(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        text: note,
        updatedAt: Date.now(),
      },
    }));
  }, []);

  // Add tag to item
  const addTag = useCallback((itemId, tagId) => {
    setNotes(prev => {
      const existing = prev[itemId] || { tags: [] };
      if (existing.tags?.includes(tagId)) return prev;

      return {
        ...prev,
        [itemId]: {
          ...existing,
          tags: [...(existing.tags || []), tagId],
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  // Remove tag from item
  const removeTag = useCallback((itemId, tagId) => {
    setNotes(prev => {
      const existing = prev[itemId];
      if (!existing) return prev;

      return {
        ...prev,
        [itemId]: {
          ...existing,
          tags: existing.tags?.filter(t => t !== tagId) || [],
          updatedAt: Date.now(),
        },
      };
    });
  }, []);

  // Get note for item
  const getNote = useCallback((itemId) => {
    return notes[itemId] || null;
  }, [notes]);

  // Check if item has any notes/tags
  const hasNotes = useCallback((itemId) => {
    const note = notes[itemId];
    return note && (note.text || note.tags?.length > 0);
  }, [notes]);

  // Delete note
  const deleteNote = useCallback((itemId) => {
    setNotes(prev => {
      const { [itemId]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Search notes
  const searchNotes = useCallback((query) => {
    const lowercaseQuery = query.toLowerCase();
    return Object.entries(notes)
      .filter(([_itemId, note]) =>
        note.text?.toLowerCase().includes(lowercaseQuery)
      )
      .map(([itemId, note]) => ({ itemId, ...note }));
  }, [notes]);

  // Get all items with specific tag
  const getItemsByTag = useCallback((tagId) => {
    return Object.entries(notes)
      .filter(([_itemId, note]) => note.tags?.includes(tagId))
      .map(([itemId, note]) => ({ itemId, ...note }));
  }, [notes]);

  // Export all notes
  const exportNotes = useCallback(() => {
    return JSON.stringify(notes, null, 2);
  }, [notes]);

  // Import notes
  const importNotes = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      setNotes(prev => ({ ...prev, ...imported }));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Stats
  const stats = useMemo(() => ({
    totalNotes: Object.keys(notes).length,
    withText: Object.values(notes).filter(n => n.text).length,
    withTags: Object.values(notes).filter(n => n.tags?.length > 0).length,
  }), [notes]);

  return {
    notes,
    setNote,
    addTag,
    removeTag,
    getNote,
    hasNotes,
    deleteNote,
    searchNotes,
    getItemsByTag,
    exportNotes,
    importNotes,
    stats,
    QUICK_TAGS,
  };
}

export { QUICK_TAGS };
export default useTradeNotes;
