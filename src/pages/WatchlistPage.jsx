import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/common/EmptyState';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { ItemAutocomplete } from '../components/forms';
import { usePortfolio } from '../hooks/usePortfolio';
import { useResources } from '../hooks/useResources';
import { useEveAuth } from '../hooks/useEveAuth';
import { getCharacterAssets, getCharacterOrders, getTypeNames } from '../api/esi';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Watchlist Item Card Component
 */
function WatchlistItemCard({ item, onRemove, onViewOrders, assetQuantity, activeOrders }) {
  const priceChange = item.currentPrice && item.previousPrice
    ? ((item.currentPrice - item.previousPrice) / item.previousPrice) * 100
    : 0;
  const isUp = priceChange > 0;
  const isDown = priceChange < 0;

  // Calculate estimated value if we have quantity and price
  const estimatedValue = assetQuantity && item.currentPrice
    ? assetQuantity * item.currentPrice
    : null;

  // Check if user owns this item
  const userOwnsItem = assetQuantity > 0;

  return (
    <div className={`bg-space-dark/50 border rounded-lg p-4 hover:border-accent-cyan/40 transition-colors ${userOwnsItem ? 'border-accent-gold/40 shadow-lg shadow-accent-gold/10' : 'border-accent-cyan/20'
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-text-primary">{item.name}</h4>
            {userOwnsItem && (
              <span className="px-2 py-0.5 text-xs bg-accent-gold/20 text-accent-gold rounded-full border border-accent-gold/30">
                Owned
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary/70">ID: {item.itemId}</p>
        </div>
        <Button
          onClick={() => onRemove(item.id)}
          variant="ghost"
          size="sm"
          className="p-1 h-auto min-h-0 text-text-secondary hover:text-red-400"
          aria-label="Remove from watchlist"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
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

      {/* Character Asset & Order Info */}
      {(assetQuantity > 0 || activeOrders?.length > 0) && (
        <div className="border-t border-accent-cyan/10 pt-3 mb-3">
          <div className="grid grid-cols-2 gap-3">
            {assetQuantity > 0 && (
              <div>
                <div className="text-xs text-text-secondary mb-1">You Own</div>
                <div className="text-sm font-mono text-accent-gold font-semibold">
                  {formatNumber(assetQuantity, 0)}
                </div>
                {estimatedValue && (
                  <div className="text-xs text-green-400 mt-0.5">
                    {formatISK(estimatedValue, false)}
                  </div>
                )}
              </div>
            )}
            {activeOrders?.length > 0 && (
              <div>
                <div className="text-xs text-text-secondary mb-1">Active Orders</div>
                <div className="text-sm font-mono text-accent-purple font-semibold">
                  {activeOrders.length}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {activeOrders.filter(o => o.is_buy_order).length} buy / {activeOrders.filter(o => !o.is_buy_order).length} sell
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

      <Button
        onClick={() => onViewOrders(item)}
        variant="secondary"
        className="w-full mt-3 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
      >
        View Market Orders
      </Button>
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
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="flex-1 border border-accent-cyan/20 text-text-secondary hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!itemName}
              variant="primary"
              className="flex-1"
            >
              Add to Watchlist
            </Button>
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
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingCharacterData, setLoadingCharacterData] = useState(false);

  // Get item ID from name
  const getItemId = useCallback((itemName) => {
    if (!invTypes) return null;
    const entry = Object.entries(invTypes).find(([, name]) => name === itemName);
    return entry ? entry[0] : null;
  }, [invTypes]);

  // Load character assets and orders when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadCharacterData();
    } else {
      setAssets([]);
      setOrders([]);
    }
  }, [isAuthenticated, character?.id]);

  // Load character assets and orders
  const loadCharacterData = async () => {
    setLoadingCharacterData(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Load assets from all pages
      let allAssets = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const pageAssets = await getCharacterAssets(character.id, accessToken, page);
        if (pageAssets && pageAssets.length > 0) {
          allAssets = [...allAssets, ...pageAssets];
          page++;
          if (pageAssets.length < 1000) {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      }

      // Filter to only hangar assets (top-level items)
      const hangarAssets = allAssets.filter(
        (asset) => asset.location_flag === 'Hangar' || !asset.location_flag
      );
      setAssets(hangarAssets);

      // Load orders
      const characterOrders = await getCharacterOrders(character.id, accessToken);
      setOrders(characterOrders || []);
    } catch (err) {
      console.error('Error loading character data:', err);
    } finally {
      setLoadingCharacterData(false);
    }
  };

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

  // Get asset quantity for a specific item
  const getAssetQuantity = useCallback((itemId) => {
    return assets
      .filter((asset) => asset.type_id === parseInt(itemId))
      .reduce((sum, asset) => sum + asset.quantity, 0);
  }, [assets]);

  // Get active orders for a specific item
  const getActiveOrders = useCallback((itemId) => {
    return orders.filter((order) => order.type_id === parseInt(itemId));
  }, [orders]);

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
  const stats = useMemo(() => {
    const baseStats = {
      total: watchlist?.length || 0,
      withAlerts: watchlist?.filter((w) => w.alertType && w.alertType !== 'none').length || 0,
      withTargets: watchlist?.filter((w) => w.targetPrice).length || 0,
    };

    // Calculate portfolio stats if authenticated
    if (isAuthenticated && watchlist?.length > 0) {
      let totalValue = 0;
      let totalActiveOrders = 0;
      let itemsOwned = 0;

      watchlist.forEach((item) => {
        const quantity = getAssetQuantity(item.itemId);
        const itemOrders = getActiveOrders(item.itemId);

        if (quantity > 0) {
          itemsOwned++;
          if (item.currentPrice) {
            totalValue += quantity * item.currentPrice;
          }
        }

        totalActiveOrders += itemOrders.length;
      });

      return {
        ...baseStats,
        totalValue,
        totalActiveOrders,
        itemsOwned,
      };
    }

    return baseStats;
  }, [watchlist, isAuthenticated, assets, orders, getAssetQuantity, getActiveOrders]);

  return (
    <PageLayout
      title="Trade Watchlist"
      subtitle="Track items and set price alerts"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Portfolio Summary Card (if authenticated) */}
        {isAuthenticated && stats.itemsOwned > 0 && (
          <GlassmorphicCard className="mb-8 bg-gradient-to-br from-accent-gold/10 to-accent-purple/10 border-accent-gold/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-display text-lg text-text-primary">Your Portfolio</h3>
              </div>
              {loadingCharacterData && (
                <div className="text-xs text-text-secondary flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                  Updating...
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-space-dark/30">
                <div className="text-2xl font-bold text-accent-gold">{formatISK(stats.totalValue, false)}</div>
                <div className="text-xs text-text-secondary mt-1">Total Value</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-space-dark/30">
                <div className="text-2xl font-bold text-accent-purple">{stats.totalActiveOrders}</div>
                <div className="text-xs text-text-secondary mt-1">Active Orders</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-space-dark/30">
                <div className="text-2xl font-bold text-green-400">{stats.itemsOwned}</div>
                <div className="text-xs text-text-secondary mt-1">Items Owned</div>
              </div>
            </div>
          </GlassmorphicCard>
        )}

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
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </Button>
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
                assetQuantity={isAuthenticated ? getAssetQuantity(item.itemId) : 0}
                activeOrders={isAuthenticated ? getActiveOrders(item.itemId) : []}
              />
            ))}
          </div>
        ) : (
          <>
            {searchTerm || filter !== 'all' ? (
              <EmptyState
                variant="search"
                title="No items match your filters"
                description="Try adjusting your search or filter criteria."
              />
            ) : (
              <EmptyState
                icon={<Star className="w-8 h-8" />}
                title="Your watchlist is empty"
                description="Add items from any trading page to track their prices and set alerts."
                action={{ text: 'Browse Trading', to: '/station-trading' }}
              />
            )}
          </>
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
