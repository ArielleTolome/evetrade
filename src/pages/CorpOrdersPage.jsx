import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { useEveAuth } from '../hooks/useEveAuth';
import { useCorpOrders } from '../hooks/useCorpOrders';
import { formatISK, formatNumber, formatRelativeTime } from '../utils/formatters';

/**
 * Health Score Badge Component
 */
function HealthScoreBadge({ health }) {
  let bgColor, textColor, label;

  if (health >= 70) {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-400';
    label = 'Healthy';
  } else if (health >= 40) {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-400';
    label = 'Warning';
  } else {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-400';
    label = 'Critical';
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${bgColor.replace('/20', '')}`} />
      <span className={`text-xs ${textColor}`}>{health.toFixed(0)}</span>
      <span className={`px-2 py-0.5 rounded text-xs ${bgColor} ${textColor}`}>
        {label}
      </span>
    </div>
  );
}

/**
 * Corporation Orders Page
 * Displays corporation market orders with health monitoring and undercut detection
 */
export function CorpOrdersPage() {
  const { isAuthenticated, character, login } = useEveAuth();
  const [corporationId, setCorporationId] = useState('');
  const [groupBy, setGroupBy] = useState('item');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [healthFilter, setHealthFilter] = useState('all');

  const {
    data,
    loading,
    error,
    lastUpdated,
    summary,
    orders,
    fetchOrders,
    refresh,
    getOrdersNeedingAttention,
    getUndercutOrders,
    getExpiringOrders,
    getTotalExposure,
    getOrderTypeBreakdown,
    getHealthStats,
    filterByHealth,
    clearError,
  } = useCorpOrders(corporationId, {
    groupBy,
    includeHistory,
    autoRefresh,
    refreshInterval: 300, // 5 minutes
  });

  // Handle initial load when user provides corporation ID
  const handleLoadOrders = useCallback(() => {
    if (corporationId && isAuthenticated) {
      fetchOrders();
    }
  }, [corporationId, isAuthenticated, fetchOrders]);

  // Auto-load if we have a corporation ID
  useEffect(() => {
    if (corporationId && isAuthenticated && !data && !loading) {
      handleLoadOrders();
    }
  }, [corporationId, isAuthenticated, data, loading, handleLoadOrders]);

  // Get statistics
  const orderBreakdown = getOrderTypeBreakdown();
  const healthStats = getHealthStats();
  const ordersNeedingAttention = getOrdersNeedingAttention();
  const undercutOrders = getUndercutOrders();
  const expiringOrders = getExpiringOrders();
  const totalExposure = getTotalExposure();

  // Filter orders by health
  const filteredOrders = useMemo(() => {
    if (healthFilter === 'all') return orders;

    if (healthFilter === 'healthy') {
      return filterByHealth(70, 100);
    } else if (healthFilter === 'warning') {
      return filterByHealth(40, 69);
    } else if (healthFilter === 'critical') {
      return filterByHealth(0, 39);
    }

    return orders;
  }, [orders, healthFilter, filterByHealth]);

  // Get unique locations and items
  const uniqueStats = useMemo(() => {
    if (!orders || orders.length === 0) return { items: 0, locations: 0 };

    const items = new Set();
    const locations = new Set();

    orders.forEach(order => {
      items.add(order['Type ID']);
      locations.add(order['Location ID']);
    });

    return {
      items: items.size,
      locations: locations.size,
    };
  }, [orders]);

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <PageLayout
        title="Corporation Orders"
        subtitle="Monitor your corporation's market orders with health tracking and undercut detection"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-text-primary mb-2">Login Required</h3>
            <p className="text-text-secondary mb-6">
              Connect your EVE Online account to view corporation market orders.
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Requires scope: esi-markets.read_corporation_orders.v1
            </p>
            <Button onClick={login} variant="primary" className="px-8 py-3">
              Login with EVE Online
            </Button>
          </GlassmorphicCard>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Corporation Orders"
      subtitle="Monitor your corporation's market orders with health tracking and undercut detection"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Corporation ID Input and Controls */}
        <GlassmorphicCard className="mb-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-text-secondary mb-2">
                  Corporation ID
                </label>
                <input
                  type="text"
                  value={corporationId}
                  onChange={(e) => setCorporationId(e.target.value)}
                  placeholder="Enter corporation ID"
                  className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:border-accent-cyan focus:outline-none min-h-[44px]"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleLoadOrders}
                  disabled={loading || !corporationId}
                  variant="primary"
                  className="w-full sm:w-auto min-h-[44px] px-6"
                >
                  {loading ? 'Loading...' : 'Load Orders'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-text-secondary">Group by:</label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary min-h-[44px]"
                  >
                    <option value="item">Item</option>
                    <option value="location">Location</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={includeHistory}
                    onChange={(e) => setIncludeHistory(e.target.checked)}
                    disabled={loading}
                    className="w-5 h-5 sm:w-4 sm:h-4 rounded border-accent-cyan/30 bg-space-dark/50 text-accent-cyan focus:ring-accent-cyan"
                  />
                  Include history
                </label>

                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    disabled={loading}
                    className="w-5 h-5 sm:w-4 sm:h-4 rounded border-accent-cyan/30 bg-space-dark/50 text-accent-cyan focus:ring-accent-cyan"
                  />
                  Auto-refresh (5m)
                </label>
              </div>

              {lastUpdated && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary">
                    Updated: {formatRelativeTime(lastUpdated)}
                  </span>
                  <Button
                    onClick={refresh}
                    disabled={loading}
                    variant="secondary"
                    className="flex items-center gap-2 min-h-[44px] px-4"
                  >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </GlassmorphicCard>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-red-400 font-medium mb-1">Error</div>
                <div className="text-red-300 text-sm">{error.message}</div>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Summary Dashboard */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GlassmorphicCard className="p-4">
              <div className="text-xs text-text-secondary mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-text-primary mb-2">
                {formatNumber(orderBreakdown?.total || 0, 0)}
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-green-400">
                  Buy: {formatNumber(orderBreakdown?.buy || 0, 0)}
                </span>
                <span className="text-red-400">
                  Sell: {formatNumber(orderBreakdown?.sell || 0, 0)}
                </span>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-4">
              <div className="text-xs text-text-secondary mb-1">Total ISK Exposure</div>
              <div className="text-2xl font-bold text-accent-gold mb-2">
                {formatISK(totalExposure, false)}
              </div>
              <div className="text-xs text-text-secondary">
                Across all orders
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-4">
              <div className="text-xs text-text-secondary mb-1">Orders Needing Attention</div>
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {formatNumber(summary.ordersNeedingAttention || 0, 0)}
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-red-400">
                  Undercut: {undercutOrders.length}
                </span>
                <span className="text-yellow-400">
                  Expiring: {expiringOrders.length}
                </span>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-4">
              <div className="text-xs text-text-secondary mb-1">Unique Items / Locations</div>
              <div className="text-2xl font-bold text-accent-cyan mb-2">
                {uniqueStats.items} / {uniqueStats.locations}
              </div>
              <div className="text-xs text-text-secondary">
                Items being traded
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {/* Alerts Section */}
        {(undercutOrders.length > 0 || expiringOrders.length > 0 || healthStats?.critical > 0) && (
          <GlassmorphicCard className="mb-6">
            <h3 className="text-lg font-display text-accent-cyan mb-4">Alerts</h3>

            <div className="space-y-3">
              {/* Undercut Orders */}
              {undercutOrders.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-400 mb-1">
                        {undercutOrders.length} Undercut Order{undercutOrders.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {undercutOrders.slice(0, 3).map((order, idx) => (
                          <div key={idx}>
                            {order.itemName} at {order.locationName} ({order.count} order{order.count !== 1 ? 's' : ''})
                          </div>
                        ))}
                        {undercutOrders.length > 3 && (
                          <div className="mt-1 text-red-400">+{undercutOrders.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expiring Orders */}
              {expiringOrders.length > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-yellow-400 mb-1">
                        {expiringOrders.length} Expiring Order{expiringOrders.length !== 1 ? 's' : ''} (&lt; 7 days)
                      </div>
                      <div className="text-xs text-text-secondary">
                        {expiringOrders.slice(0, 3).map((order, idx) => (
                          <div key={idx}>
                            {order.itemName} - {order.daysRemaining}d remaining
                          </div>
                        ))}
                        {expiringOrders.length > 3 && (
                          <div className="mt-1 text-yellow-400">+{expiringOrders.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Critical Health Orders */}
              {healthStats?.critical > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-400 mb-1">
                        {healthStats.critical} Order{healthStats.critical !== 1 ? 's' : ''} with Critical Health
                      </div>
                      <div className="text-xs text-text-secondary">
                        Health score below 40 - immediate attention recommended
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassmorphicCard>
        )}

        {/* Orders Table */}
        {data && (
          <GlassmorphicCard>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-display text-text-primary">Orders</h3>

              <div className="flex items-center gap-3">
                <label className="text-sm text-text-secondary">Filter by health:</label>
                <select
                  value={healthFilter}
                  onChange={(e) => setHealthFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary min-h-[44px]"
                >
                  <option value="all">All ({orders.length})</option>
                  <option value="healthy">Healthy ({healthStats?.healthy || 0})</option>
                  <option value="warning">Warning ({healthStats?.warning || 0})</option>
                  <option value="critical">Critical ({healthStats?.critical || 0})</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredOrders.map((item, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-accent-cyan/10">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-text-primary font-medium truncate">
                            {item['Item']}
                          </h4>
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {item['Location']}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-text-secondary text-xs">Total Exposure</span>
                          <p className="font-mono text-accent-gold">{formatISK(item['Total Exposure (ISK)'], false)}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Orders</span>
                          <p className="font-mono text-text-primary">
                            <span className="text-green-400">{item['Buy Orders']}</span> / <span className="text-red-400">{item['Sell Orders']}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Volume</span>
                          <p className="font-mono text-text-secondary">
                            {formatNumber(item['Total Volume Remaining'], 0)} / {formatNumber(item['Total Volume'], 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Attention</span>
                          <p className={`font-mono ${item['Orders Needing Attention'] > 0 ? 'text-yellow-400' : 'text-text-secondary'}`}>
                            {item['Orders Needing Attention']}
                          </p>
                        </div>
                      </div>

                      {item['Order Details'] && item['Order Details'].length > 0 && (
                        <div className="border-t border-accent-cyan/10 pt-3 space-y-2">
                          <div className="text-xs text-text-secondary mb-2">Order Details:</div>
                          {item['Order Details'].map((order, orderIdx) => (
                            <div key={orderIdx} className="p-2 bg-space-black/30 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className={order.isBuyOrder ? 'text-green-400' : 'text-red-400'}>
                                  {order.isBuyOrder ? 'BUY' : 'SELL'}
                                </span>
                                <HealthScoreBadge health={order.health} />
                              </div>
                              <div className="text-text-secondary space-y-0.5">
                                <div>Price: {formatISK(order.price, false)}</div>
                                <div>Volume: {formatNumber(order.volumeRemain, 0)} / {formatNumber(order.volumeTotal, 0)}</div>
                                <div>Days: {Math.ceil((new Date(order.issued).getTime() + order.duration * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))}d</div>
                                {order.isUndercut && (
                                  <div className="text-red-400">
                                    Undercut by {formatISK(order.undercutBy || 0, false)}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-secondary border-b border-accent-cyan/20">
                        <th className="text-left py-3 px-3">Item</th>
                        <th className="text-left py-3 px-3">Location</th>
                        <th className="text-right py-3 px-3">Exposure</th>
                        <th className="text-center py-3 px-3">Buy/Sell</th>
                        <th className="text-right py-3 px-3">Volume</th>
                        <th className="text-center py-3 px-3">Attention</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((item, idx) => (
                        <tr key={idx} className="border-b border-accent-cyan/10 hover:bg-white/5">
                          <td className="py-3 px-3 text-text-primary">
                            {item['Item']}
                          </td>
                          <td className="py-3 px-3 text-text-secondary text-xs">
                            {item['Location']}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-accent-gold">
                            {formatISK(item['Total Exposure (ISK)'], false)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-green-400">{item['Buy Orders']}</span>
                            {' / '}
                            <span className="text-red-400">{item['Sell Orders']}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-text-secondary">
                            {formatNumber(item['Total Volume Remaining'], 0)} / {formatNumber(item['Total Volume'], 0)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item['Orders Needing Attention'] > 0
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {item['Orders Needing Attention']}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-text-secondary">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No orders found</p>
                <p className="text-xs mt-1">Try adjusting your filters or load orders for a corporation</p>
              </div>
            )}
          </GlassmorphicCard>
        )}

        {/* Help Section */}
        {!data && !loading && !error && (
          <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h3 className="text-sm font-medium text-accent-cyan mb-2">How to Use Corporation Orders</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Enter your corporation ID and click "Load Orders" to fetch your corporation's market orders</li>
              <li>• Health scores indicate order performance: Green (70-100) = Healthy, Yellow (40-69) = Warning, Red (0-39) = Critical</li>
              <li>• Orders are automatically checked for undercuts by comparing against current market prices</li>
              <li>• Expiring orders (less than 7 days) are highlighted in the alerts section</li>
              <li>• Use "Auto-refresh" to keep orders updated every 5 minutes</li>
              <li>• Group orders by Item, Location, or Both to organize your view</li>
            </ul>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default CorpOrdersPage;
