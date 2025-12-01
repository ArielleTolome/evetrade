import { useState, useMemo } from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { formatNumber } from '../../utils/formatters';
import { FormInput } from '../forms/FormInput';

/**
 * WatchlistPanel Component
 * Manages multiple watchlists with price tracking and alerts
 */
export function WatchlistPanel({ className = '' }) {
  const {
    watchlists,
    watchlistArray,
    activeList,
    setActiveList,
    currentList,
    totalItemCount,
    createWatchlist,
    deleteWatchlist,
    renameWatchlist,
    removeFromWatchlist,
  } = useWatchlist();

  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  // Calculate price changes for items
  const itemsWithChanges = useMemo(() => {
    if (!currentList) return [];

    return currentList.items.map(item => {
      const initialBuy = item.initialPrice?.buy || 0;
      const initialSell = item.initialPrice?.sell || 0;
      const currentBuy = item.currentPrice?.buy || 0;
      const currentSell = item.currentPrice?.sell || 0;

      const buyChange = initialBuy > 0 ? ((currentBuy - initialBuy) / initialBuy) * 100 : 0;
      const sellChange = initialSell > 0 ? ((currentSell - initialSell) / initialSell) * 100 : 0;
      const marginChange = sellChange - buyChange;

      return {
        ...item,
        changes: {
          buy: buyChange,
          sell: sellChange,
          margin: marginChange,
        },
      };
    });
  }, [currentList]);

  const handleCreateList = (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = newListName.trim();
    if (!trimmedName) {
      setError('Watchlist name is required');
      return;
    }

    if (watchlistArray.some(list => list.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A watchlist with this name already exists');
      return;
    }

    const newId = createWatchlist(trimmedName);
    setActiveList(newId);
    setNewListName('');
    setIsCreatingList(false);
  };

  const handleRenameList = (listId) => {
    setError('');

    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setError('Watchlist name is required');
      return;
    }

    if (watchlistArray.some(list => list.id !== listId && list.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A watchlist with this name already exists');
      return;
    }

    renameWatchlist(listId, trimmedName);
    setEditingListId(null);
    setEditingName('');
  };

  const handleDeleteList = (listId) => {
    if (listId === 'default') return;
    if (confirm('Are you sure you want to delete this watchlist? All items will be removed.')) {
      deleteWatchlist(listId);
    }
  };

  const handleRemoveItem = (itemId) => {
    if (confirm('Remove this item from the watchlist?')) {
      removeFromWatchlist(itemId, activeList);
    }
  };

  const startEditingList = (listId, currentName) => {
    setEditingListId(listId);
    setEditingName(currentName);
    setError('');
  };

  const cancelEditing = () => {
    setEditingListId(null);
    setEditingName('');
    setError('');
  };

  const formatPriceChange = (change) => {
    if (change === 0) return '0.00%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-text-secondary';
  };

  return (
    <div className={`bg-space-dark/30 rounded-xl border border-accent-cyan/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-space-mid/50 border-b border-accent-cyan/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h2 className="text-xl font-display font-semibold text-text-primary">
              Watchlists
            </h2>
            <span className="px-2 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-medium">
              {totalItemCount} item{totalItemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingList(!isCreatingList)}
            className="px-4 py-2 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-sm font-medium transition-all hover:bg-accent-purple/20 hover:border-accent-purple/50"
          >
            {isCreatingList ? 'Cancel' : '+ New List'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Create Watchlist Form */}
        {isCreatingList && (
          <form onSubmit={handleCreateList} className="mb-6 p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Watchlist</h3>
            <div className="flex gap-2">
              <FormInput
                value={newListName}
                onChange={setNewListName}
                placeholder="Enter watchlist name"
                error={error}
                className="flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-accent-purple/10 border border-accent-purple/30 text-accent-purple font-medium transition-all hover:bg-accent-purple/20 hover:border-accent-purple/50"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Watchlist Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {watchlistArray.map((list) => (
            <div key={list.id} className="flex items-center gap-1">
              {editingListId === list.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-purple"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleRenameList(list.id)}
                    className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors"
                    title="Save"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="p-2 rounded-lg bg-space-dark/50 text-text-secondary hover:bg-space-mid transition-colors"
                    title="Cancel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveList(list.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeList === list.id
                        ? 'bg-accent-purple/20 border border-accent-purple/40 text-accent-purple'
                        : 'bg-space-mid/30 border border-accent-cyan/10 text-text-secondary hover:text-text-primary hover:border-accent-cyan/30'
                    }`}
                  >
                    {list.name}
                    <span className="ml-2 text-xs opacity-70">({list.items.length})</span>
                  </button>
                  {list.id !== 'default' && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEditingList(list.id, list.name)}
                        className="p-1.5 rounded-lg bg-space-mid/30 text-text-secondary hover:text-accent-purple hover:bg-accent-purple/10 transition-colors"
                        title="Rename"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteList(list.id)}
                        className="p-1.5 rounded-lg bg-space-mid/30 text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {error && editingListId && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Watchlist Items */}
        {itemsWithChanges.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-text-secondary mb-2">No items in this watchlist</p>
            <p className="text-text-secondary/70 text-sm">Add items from the trading results to track their prices</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itemsWithChanges.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-space-mid/30 border border-accent-cyan/10 hover:border-accent-cyan/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-accent-cyan font-medium">{item.name}</span>
                      <span className="text-xs text-text-secondary">ID: {item.id}</span>
                    </div>

                    {/* Price Information */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* Buy Price */}
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Buy Price</p>
                        <div className="space-y-0.5">
                          <p className="text-text-primary font-mono">
                            {formatNumber(item.currentPrice?.buy || 0)} ISK
                          </p>
                          <p className={`text-xs font-medium ${getChangeColor(item.changes.buy)}`}>
                            {formatPriceChange(item.changes.buy)}
                          </p>
                        </div>
                      </div>

                      {/* Sell Price */}
                      <div>
                        <p className="text-text-secondary text-xs mb-1">Sell Price</p>
                        <div className="space-y-0.5">
                          <p className="text-text-primary font-mono">
                            {formatNumber(item.currentPrice?.sell || 0)} ISK
                          </p>
                          <p className={`text-xs font-medium ${getChangeColor(item.changes.sell)}`}>
                            {formatPriceChange(item.changes.sell)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 pt-3 border-t border-accent-cyan/10 text-xs text-text-secondary space-y-1">
                      <p>Added: {new Date(item.addedAt).toLocaleString()}</p>
                      {item.lastUpdated && (
                        <p>Last Updated: {new Date(item.lastUpdated).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium transition-all hover:bg-red-500/20"
                    title="Remove from watchlist"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {itemsWithChanges.length > 0 && (
          <div className="mt-6 pt-4 border-t border-accent-cyan/10">
            <p className="text-sm text-text-secondary">
              Watching {itemsWithChanges.length} item{itemsWithChanges.length !== 1 ? 's' : ''} in {currentList.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistPanel;
