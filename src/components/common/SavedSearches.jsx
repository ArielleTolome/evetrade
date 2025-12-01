import { useState } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * SavedSearches Component
 * UI for saving, loading, and managing saved searches
 */
export function SavedSearches({
  savedSearches = [],
  onSave,
  onLoad,
  onDelete,
  isAtLimit = false,
  maxSearches = 10,
}) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showList, setShowList] = useState(false);

  const handleSaveClick = () => {
    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    const result = onSave(searchName);
    if (result.success) {
      setSearchName('');
      setShowSaveDialog(false);
      setShowList(true);
    } else {
      alert(result.message || 'Failed to save search');
    }
  };

  const handleLoad = (id) => {
    onLoad(id);
    setShowList(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete saved search "${name}"?`)) {
      onDelete(id);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setShowSaveDialog(!showSaveDialog)}
          disabled={isAtLimit}
          className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          title={isAtLimit ? `Maximum ${maxSearches} searches allowed` : 'Save current search parameters'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save Search
          {isAtLimit && <span className="text-xs">({savedSearches.length}/{maxSearches})</span>}
        </button>

        {savedSearches.length > 0 && (
          <button
            type="button"
            onClick={() => setShowList(!showList)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Load Search ({savedSearches.length})
          </button>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <GlassmorphicCard className="p-4 animate-fade-in">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Save Current Search</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter a name for this search..."
                className="flex-1 px-3 py-2 bg-space-dark/30 border border-accent-cyan/20 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan/50"
                maxLength={50}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveClick();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSaveClick}
                className="btn-primary px-4 py-2 text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSearchName('');
                }}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassmorphicCard>
      )}

      {/* Saved Searches List */}
      {showList && savedSearches.length > 0 && (
        <GlassmorphicCard className="p-4 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Saved Searches</h3>
              <button
                type="button"
                onClick={() => setShowList(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 bg-space-dark/30 border border-accent-cyan/10 rounded-lg hover:border-accent-cyan/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">
                      {search.name}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatDate(search.timestamp)}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      type="button"
                      onClick={() => handleLoad(search.id)}
                      className="px-3 py-1 text-sm bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan rounded transition-colors"
                      title="Load this search"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(search.id, search.name)}
                      className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                      title="Delete this search"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
}

export default SavedSearches;
