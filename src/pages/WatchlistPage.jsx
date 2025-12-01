import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { ItemAutocomplete } from '../components/forms';
import { usePortfolio } from '../hooks/usePortfolio';
import { useResources } from '../hooks/useResources';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Watchlist Item Card Component
 */
function WatchlistItemCard({ item, onRemove, onViewOrders }) {
  const priceChange = item.currentPrice && item.previousPrice
    ? ((item.currentPrice - item.previousPrice) / item.previousPrice) * 100
    : 0;
  const isUp = priceChange > 0;
  const isDown = priceChange < 0;

  return (
    <div className="bg-space-dark/50 border border-accent-cyan/20 rounded-lg p-4 hover:border-accent-cyan/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-text-primary">{item.name}</h4>
          <p className="text-xs text-text-secondary/70">ID: {item.itemId}</p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-text-secondary hover:text-red-400 transition-colors"
          aria-label="Remove from watchlist"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-text-secondary mb-1">Target Price</div>
          <div className="text-sm font-mono text-accent-cyan">
            {item.targetPrice ? formatISK(item.targetPrice, false) : 'Not set'}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Alert Type</div>
          <div className="text-sm text-text-primary capitalize">{item.alertType || 'None'}</div>
        </div>
      </div>

      {item.currentPrice && (
        <div className="flex items-center justify-between pt-3 border-t border-accent-cyan/10">
          <div>
            <div className="text-xs text-text-secondary mb-1">Last Price</div>
            <div className="text-lg font-bold text-text-primary">
              {formatISK(item.currentPrice, false)}
            </div>
          </div>
          {priceChange !== 0 && (
            <div className={`flex items-center gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              <svg className={`w-4 h-4 ${isDown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="font-mono text-sm">{formatPercent(Math.abs(priceChange) / 100, 1)}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => onViewOrders(item)}
        className="w-full mt-3 px-3 py-2 text-sm bg-accent-cyan/10 text-accent-cyan rounded-lg hover:bg-accent-cyan/20 transition-colors"
      >
        View Market Orders
      </button>
    </div>
  );
}

/**
 * Add to Watchlist Modal Component
 */
function AddWatchlistModal({ onClose, onAdd }) {
  const [itemName, setItemName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState('none');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName) return;

    onAdd({
      name: itemName,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      alertType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-space-dark border border-accent-cyan/20 rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="font-display text-xl text-text-primary mb-4">Add to Watchlist</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Item</label>
            <ItemAutocomplete
              value={itemName}
              onChange={setItemName}
              placeholder="Search for an item..."
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Target Price (optional)</label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter target price..."
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan font-mono"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Alert When</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
            >
              <option value="none">No alerts</option>
              <option value="below">Price drops below target</option>
              <option value="above">Price rises above target</option>
              <option value="any">Any significant change</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-accent-cyan/20 text-text-secondary hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!itemName}
              className="flex-1 px-4 py-2 rounded-lg bg-accent-cyan text-space-black font-medium hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
            >
              Add to Watchlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Watchlist Page Component
 */
export function WatchlistPage() {
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const { invTypes } = useResources();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get item ID from name
  const getItemId = useCallback((itemName) => {
    if (!invTypes) return null;
    const entry = Object.entries(invTypes).find(([, name]) => name === itemName);
    return entry ? entry[0] : null;
  }, [invTypes]);

  // Handle adding item to watchlist
  const handleAdd = useCallback((item) => {
    const itemId = getItemId(item.name);
    if (itemId) {
      addToWatchlist({
        ...item,
        itemId,
        addedAt: new Date().toISOString(),
      });
    }
    setShowAddModal(false);
  }, [getItemId, addToWatchlist]);

  // Handle viewing orders for an item
  const handleViewOrders = useCallback((item) => {
    // Navigate to orders page with the item
    navigate(`/orders?itemId=${item.itemId}`);
  }, [navigate]);

  // Filter watchlist items
  const filteredItems = useMemo(() => {
    let items = watchlist || [];

    // Apply search filter
    if (searchTerm) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply alert type filter
    if (filter !== 'all') {
      items = items.filter((item) => item.alertType === filter);
    }

    return items;
  }, [watchlist, searchTerm, filter]);

  // Stats
  const stats = useMemo(() => ({
    total: watchlist?.length || 0,
    withAlerts: watchlist?.filter((w) => w.alertType && w.alertType !== 'none').length || 0,
    withTargets: watchlist?.filter((w) => w.targetPrice).length || 0,
  }), [watchlist]);

  return (
    <PageLayout
      title="Trade Watchlist"
      subtitle="Track items and set price alerts"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <GlassmorphicCard className="text-center py-4">
            <div className="text-3xl font-bold text-accent-cyan">{stats.total}</div>
            <div className="text-sm text-text-secondary">Watched Items</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="text-center py-4">
            <div className="text-3xl font-bold text-accent-gold">{stats.withAlerts}</div>
            <div className="text-sm text-text-secondary">With Alerts</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="text-center py-4">
            <div className="text-3xl font-bold text-accent-purple">{stats.withTargets}</div>
            <div className="text-sm text-text-secondary">Target Prices</div>
          </GlassmorphicCard>
        </div>

        {/* Controls */}
        <GlassmorphicCard className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search watchlist..."
                className="w-full px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
            >
              <option value="all">All Items</option>
              <option value="below">Below Target Alerts</option>
              <option value="above">Above Target Alerts</option>
              <option value="any">Any Change Alerts</option>
            </select>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-space-black font-medium rounded-lg hover:bg-accent-cyan/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>
        </GlassmorphicCard>

        {/* Watchlist Items */}
        {filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <WatchlistItemCard
                key={item.id}
                item={item}
                onRemove={removeFromWatchlist}
                onViewOrders={handleViewOrders}
              />
            ))}
          </div>
        ) : (
          <GlassmorphicCard className="text-center py-12">
            {searchTerm || filter !== 'all' ? (
              <>
                <p className="text-text-secondary text-lg">No items match your filters</p>
                <p className="text-text-secondary/70 mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-text-secondary text-lg">Your watchlist is empty</p>
                <p className="text-text-secondary/70 mt-2">
                  Add items to track their prices and set alerts
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-6 py-2 bg-accent-cyan text-space-black font-medium rounded-lg hover:bg-accent-cyan/90 transition-colors"
                >
                  Add Your First Item
                </button>
              </>
            )}
          </GlassmorphicCard>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddWatchlistModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </PageLayout>
  );
}

export default WatchlistPage;
