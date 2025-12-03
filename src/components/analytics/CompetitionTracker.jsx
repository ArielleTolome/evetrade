import { useState, useEffect, useCallback } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getCharacterOrders } from '../../api/esi';
import { formatISK, formatRelativeTime, formatCompact } from '../../utils/formatters';

const STORAGE_KEY = 'eve_competition_tracker';
const REFRESH_INTERVAL = 60000; // 1 minute

/**
 * CompetitionTracker Component
 *
 * Monitor order updates on watched items, track undercutting frequency,
 * identify aggressive competitors, and show competitor price patterns.
 */
export function CompetitionTracker() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [watchedItems, setWatchedItems] = useState([]);
  const [orderSnapshots, setOrderSnapshots] = useState({});
  const [competitorStats, setCompetitorStats] = useState({});
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setWatchedItems(data.watchedItems || []);
        setOrderSnapshots(data.orderSnapshots || {});
        setCompetitorStats(data.competitorStats || {});
      }
    } catch (error) {
      console.error('Failed to load competition tracker data:', error);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    try {
      const data = {
        watchedItems,
        orderSnapshots,
        competitorStats,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save competition tracker data:', error);
    }
  }, [watchedItems, orderSnapshots, competitorStats]);

  // Fetch current orders
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !character?.id) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (token) {
        const orders = await getCharacterOrders(character.id, token);
        setActiveOrders(orders || []);
        setLastUpdate(new Date());

        // Process order changes
        processOrderChanges(orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, character, getAccessToken]);

  // Process order changes to detect undercutting
  const processOrderChanges = useCallback((currentOrders) => {
    const now = Date.now();

    currentOrders.forEach((order) => {
      const key = `${order.type_id}_${order.location_id}`;
      const previousSnapshot = orderSnapshots[key];

      if (previousSnapshot) {
        // Check if we've been undercut
        const wasUndercut =
          order.is_buy_order
            ? order.price < previousSnapshot.price
            : order.price > previousSnapshot.price;

        if (wasUndercut) {
          // Record undercut event
          setCompetitorStats((prev) => {
            const itemKey = order.type_id.toString();
            const current = prev[itemKey] || {
              typeId: order.type_id,
              totalUndercuts: 0,
              lastUndercut: null,
              avgTimeBetweenUndercuts: 0,
              competitorActivity: [],
            };

            const timeSinceLastUndercut = current.lastUndercut
              ? now - current.lastUndercut
              : 0;

            return {
              ...prev,
              [itemKey]: {
                ...current,
                totalUndercuts: current.totalUndercuts + 1,
                lastUndercut: now,
                avgTimeBetweenUndercuts:
                  current.totalUndercuts > 0
                    ? (current.avgTimeBetweenUndercuts * current.totalUndercuts +
                        timeSinceLastUndercut) /
                      (current.totalUndercuts + 1)
                    : timeSinceLastUndercut,
                competitorActivity: [
                  ...current.competitorActivity,
                  {
                    timestamp: now,
                    oldPrice: previousSnapshot.price,
                    newPrice: order.price,
                    priceDiff: Math.abs(order.price - previousSnapshot.price),
                  },
                ].slice(-50), // Keep last 50 events
              },
            };
          });
        }
      }

      // Update snapshot
      setOrderSnapshots((prev) => ({
        ...prev,
        [key]: {
          orderId: order.order_id,
          typeId: order.type_id,
          price: order.price,
          volumeRemain: order.volume_remain,
          timestamp: now,
          isBuyOrder: order.is_buy_order,
        },
      }));
    });
  }, [orderSnapshots]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders]);

  // Add item to watch list
  const addWatchedItem = (typeId, typeName) => {
    if (!typeId) return;

    const item = {
      typeId: parseInt(typeId),
      typeName: typeName || `Item ${typeId}`,
      addedAt: Date.now(),
    };

    setWatchedItems((prev) => {
      if (prev.some((i) => i.typeId === item.typeId)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  // Remove item from watch list
  const removeWatchedItem = (typeId) => {
    setWatchedItems((prev) => prev.filter((i) => i.typeId !== typeId));
  };

  // Clear all data
  const clearAllData = () => {
    setWatchedItems([]);
    setOrderSnapshots({});
    setCompetitorStats({});
    localStorage.removeItem(STORAGE_KEY);
  };

  // Get stats for a specific item
  const getItemStats = (typeId) => {
    return competitorStats[typeId.toString()] || null;
  };

  // Calculate competition metrics
  const calculateMetrics = () => {
    const items = watchedItems.map((item) => {
      const stats = getItemStats(item.typeId);
      const orders = activeOrders.filter((o) => o.type_id === item.typeId);

      return {
        ...item,
        stats,
        orders,
        activeOrderCount: orders.length,
        totalUndercuts: stats?.totalUndercuts || 0,
        lastUndercut: stats?.lastUndercut || null,
        competitionLevel: calculateCompetitionLevel(stats),
      };
    });

    return items.sort((a, b) => b.totalUndercuts - a.totalUndercuts);
  };

  const calculateCompetitionLevel = (stats) => {
    if (!stats || stats.totalUndercuts === 0) return 'low';

    const avgHoursBetweenUndercuts = stats.avgTimeBetweenUndercuts
      ? stats.avgTimeBetweenUndercuts / (1000 * 60 * 60)
      : Infinity;

    if (avgHoursBetweenUndercuts < 1) return 'extreme';
    if (avgHoursBetweenUndercuts < 4) return 'high';
    if (avgHoursBetweenUndercuts < 12) return 'medium';
    return 'low';
  };

  const getCompetitionColor = (level) => {
    switch (level) {
      case 'extreme':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const trackedItems = calculateMetrics();
  const [newTypeId, setNewTypeId] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Competition Tracker
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Monitor order updates and track competitor activity
        </p>
      </div>

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <div className="glass p-6 border-l-4 border-yellow-500">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                Authentication Required
              </h3>
              <p className="text-text-secondary text-sm">
                Please log in with your EVE Online account to track your market orders and monitor competition.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Control Panel
          </h3>
          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-sm text-text-secondary">
                Updated {formatRelativeTime(lastUpdate)}
              </span>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                disabled={!isAuthenticated}
                className="w-4 h-4 rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan disabled:opacity-50"
              />
              <span className="text-sm text-text-secondary">Auto-refresh</span>
            </label>
            <button
              onClick={fetchOrders}
              disabled={loading || !isAuthenticated}
              className="px-4 py-2 bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 rounded hover:bg-accent-cyan/30 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm text-text-secondary mb-2">
              Type ID
            </label>
            <input
              type="text"
              value={newTypeId}
              onChange={(e) => setNewTypeId(e.target.value)}
              placeholder="34"
              className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary focus:border-accent-cyan focus:outline-none"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm text-text-secondary mb-2">
              Item Name (Optional)
            </label>
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Tritanium"
              className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary focus:border-accent-cyan focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                addWatchedItem(newTypeId, newTypeName);
                setNewTypeId('');
                setNewTypeName('');
              }}
              disabled={!newTypeId}
              className="w-full btn-primary disabled:opacity-50"
            >
              Add to Watchlist
            </button>
          </div>
        </div>

        {watchedItems.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (window.confirm('Clear all tracking data?')) {
                  clearAllData();
                }
              }}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        )}
      </div>

      {/* Tracked Items */}
      {trackedItems.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Tracked Items
          </h3>

          <div className="space-y-2">
            {trackedItems.map((item) => (
              <div
                key={item.typeId}
                className={`p-4 bg-space-dark/30 rounded border cursor-pointer transition-all ${
                  selectedItemId === item.typeId
                    ? 'border-accent-cyan'
                    : 'border-accent-cyan/10 hover:border-accent-cyan/30'
                }`}
                onClick={() =>
                  setSelectedItemId(selectedItemId === item.typeId ? null : item.typeId)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">
                        {item.typeName}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Type ID: {item.typeId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-text-secondary">Undercuts</div>
                      <div className="text-lg font-mono font-bold text-red-400">
                        {item.totalUndercuts}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-text-secondary">Active Orders</div>
                      <div className="text-lg font-mono font-bold text-text-primary">
                        {item.activeOrderCount}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded text-xs border ${getCompetitionColor(
                        item.competitionLevel
                      )}`}
                    >
                      {item.competitionLevel.toUpperCase()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWatchedItem(item.typeId);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedItemId === item.typeId && item.stats && (
                  <div className="mt-4 pt-4 border-t border-accent-cyan/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-space-dark/50 rounded p-3">
                        <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                          Last Undercut
                        </div>
                        <div className="text-sm font-mono text-text-primary">
                          {item.lastUndercut
                            ? formatRelativeTime(new Date(item.lastUndercut))
                            : 'Never'}
                        </div>
                      </div>

                      <div className="bg-space-dark/50 rounded p-3">
                        <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                          Avg Time Between
                        </div>
                        <div className="text-sm font-mono text-text-primary">
                          {item.stats.avgTimeBetweenUndercuts
                            ? `${(
                                item.stats.avgTimeBetweenUndercuts /
                                (1000 * 60 * 60)
                              ).toFixed(1)}h`
                            : 'N/A'}
                        </div>
                      </div>

                      <div className="bg-space-dark/50 rounded p-3">
                        <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                          Activity Events
                        </div>
                        <div className="text-sm font-mono text-text-primary">
                          {item.stats.competitorActivity?.length || 0}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    {item.stats.competitorActivity &&
                      item.stats.competitorActivity.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-text-primary mb-2">
                            Recent Activity
                          </h4>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {[...item.stats.competitorActivity]
                              .reverse()
                              .slice(0, 10)
                              .map((activity, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs p-2 bg-space-dark/30 rounded"
                                >
                                  <span className="text-text-secondary">
                                    {formatRelativeTime(new Date(activity.timestamp))}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-text-primary">
                                      {formatISK(activity.oldPrice, false)}
                                    </span>
                                    <span className="text-text-secondary">→</span>
                                    <span className="font-mono text-red-400">
                                      {formatISK(activity.newPrice, false)}
                                    </span>
                                    <span className="text-text-secondary">
                                      (-{formatISK(activity.priceDiff, false)})
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Active Orders */}
                    {item.orders && item.orders.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-text-primary mb-2">
                          Your Active Orders
                        </h4>
                        <div className="space-y-1">
                          {item.orders.map((order) => (
                            <div
                              key={order.order_id}
                              className="flex items-center justify-between text-xs p-2 bg-space-dark/30 rounded"
                            >
                              <span
                                className={`px-2 py-1 rounded ${
                                  order.is_buy_order
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-purple-500/20 text-purple-400'
                                }`}
                              >
                                {order.is_buy_order ? 'BUY' : 'SELL'}
                              </span>
                              <span className="font-mono text-text-primary">
                                {formatISK(order.price)}
                              </span>
                              <span className="text-text-secondary">
                                {formatCompact(order.volume_remain)} remaining
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {trackedItems.length === 0 && (
        <div className="glass p-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Items Tracked
          </h3>
          <p className="text-text-secondary">
            Add items to your watchlist to start monitoring competition
          </p>
        </div>
      )}
    </div>
  );
}

export default CompetitionTracker;
