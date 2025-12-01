import { useState } from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';

/**
 * WatchlistQuickAdd Component
 * Quick add button for adding items to watchlists
 * Shows watchlist selector when clicked
 */
export function WatchlistQuickAdd({ item, className = '' }) {
  const {
    isWatched,
    addToWatchlist,
    removeFromWatchlist,
    watchlistArray,
    activeList,
    getWatchlistForItem,
  } = useWatchlist();

  const [showMenu, setShowMenu] = useState(false);

  const itemId = item['Item ID'] || item.itemId;
  const watched = isWatched(itemId);
  const currentWatchlist = getWatchlistForItem(itemId);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (watched && currentWatchlist) {
      // If already watched, remove it
      removeFromWatchlist(itemId, currentWatchlist.id);
      setShowMenu(false);
    } else {
      // If not watched, show menu to select watchlist
      setShowMenu(!showMenu);
    }
  };

  const handleAddToList = (e, listId) => {
    e.stopPropagation();
    addToWatchlist(item, listId);
    setShowMenu(false);
  };

  const handleBlur = (e) => {
    // Close menu when clicking outside
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowMenu(false);
    }
  };

  return (
    <div className={`relative ${className}`} onBlur={handleBlur}>
      <button
        onClick={handleToggle}
        className={`p-1.5 rounded transition-colors ${
          watched
            ? 'text-accent-purple bg-accent-purple/20 hover:bg-accent-purple/30'
            : 'text-text-secondary hover:text-accent-purple hover:bg-accent-purple/10'
        }`}
        title={watched ? `Remove from ${currentWatchlist?.name || 'watchlist'}` : 'Add to watchlist'}
      >
        <svg
          className="w-4 h-4"
          fill={watched ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>

      {showMenu && !watched && (
        <div className="absolute z-50 mt-2 right-0 min-w-48 bg-space-dark/95 backdrop-blur-md border border-accent-cyan/20 rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-accent-cyan/10">
              Add to Watchlist
            </div>
            {watchlistArray.map((list) => (
              <button
                key={list.id}
                onClick={(e) => handleAddToList(e, list.id)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent-purple/10 transition-colors ${
                  list.id === activeList ? 'text-accent-purple' : 'text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{list.name}</span>
                  <span className="text-xs text-text-secondary">
                    {list.items.length} item{list.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchlistQuickAdd;
