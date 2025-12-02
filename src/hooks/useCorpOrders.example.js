import React, { useEffect } from 'react';
import { useCorpOrders } from './useCorpOrders';

/**
 * Example: Basic Corporation Orders Dashboard
 *
 * This example shows how to fetch and display corporation market orders
 * with analysis of order health, undercuts, and expiring orders.
 */
export function CorpOrdersDashboard({ corporationId }) {
  const {
    loading,
    error,
    summary,
    orders,
    fetchOrders,
    getOrdersNeedingAttention,
    getUndercutOrders,
    getExpiringOrders,
    getTotalExposure,
    getOrderTypeBreakdown,
    getHealthStats,
  } = useCorpOrders(corporationId, {
    groupBy: 'item', // Group by item
    includeHistory: false, // Don't include historical data
  });

  // Fetch orders on mount
  useEffect(() => {
    if (corporationId) {
      fetchOrders();
    }
  }, [corporationId, fetchOrders]);

  if (loading) {
    return <div>Loading corporation orders...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Orders</h3>
        <p>{error.message}</p>
        {error.message.includes('scope') && (
          <p>
            Please log out and log back in to grant the required permissions:
            <br />
            <code>esi-markets.read_corporation_orders.v1</code>
          </p>
        )}
      </div>
    );
  }

  if (!summary) {
    return <div>No data available. Click "Fetch Orders" to load.</div>;
  }

  const ordersNeedingAttention = getOrdersNeedingAttention();
  const undercutOrders = getUndercutOrders();
  const expiringOrders = getExpiringOrders();
  const totalExposure = getTotalExposure();
  const typeBreakdown = getOrderTypeBreakdown();
  const healthStats = getHealthStats();

  return (
    <div className="corp-orders-dashboard">
      <h2>Corporation Orders Dashboard</h2>

      {/* Summary Section */}
      <section className="summary-section">
        <h3>Summary</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{summary.totalOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Buy Orders</div>
            <div className="stat-value">{summary.totalBuyOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sell Orders</div>
            <div className="stat-value">{summary.totalSellOrders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Exposure</div>
            <div className="stat-value">
              {(totalExposure / 1e9).toFixed(2)}B ISK
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-label">Need Attention</div>
            <div className="stat-value">{summary.ordersNeedingAttention}</div>
          </div>
        </div>
      </section>

      {/* Health Section */}
      <section className="health-section">
        <h3>Order Health</h3>
        {healthStats && (
          <div className="health-breakdown">
            <div className="health-bar">
              <div
                className="health-segment healthy"
                style={{ width: `${healthStats.healthyPercentage}%` }}
              >
                {healthStats.healthy} Healthy
              </div>
              <div
                className="health-segment warning"
                style={{ width: `${healthStats.warningPercentage}%` }}
              >
                {healthStats.warning} Warning
              </div>
              <div
                className="health-segment critical"
                style={{ width: `${healthStats.criticalPercentage}%` }}
              >
                {healthStats.critical} Critical
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Alerts Section */}
      {(undercutOrders.length > 0 || expiringOrders.length > 0) && (
        <section className="alerts-section">
          <h3>Alerts</h3>

          {undercutOrders.length > 0 && (
            <div className="alert-group">
              <h4>Undercut Orders ({undercutOrders.length} items)</h4>
              <ul>
                {undercutOrders.slice(0, 5).map((item, idx) => (
                  <li key={idx}>
                    <strong>{item.itemName}</strong> at {item.locationName}
                    <br />
                    {item.count} order(s) undercut
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expiringOrders.length > 0 && (
            <div className="alert-group">
              <h4>Expiring Soon ({expiringOrders.length} orders)</h4>
              <ul>
                {expiringOrders.slice(0, 5).map((order, idx) => (
                  <li key={idx}>
                    <strong>{order.itemName}</strong> at {order.locationName}
                    <br />
                    Expires in {order.daysRemaining} day(s)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Orders Table */}
      <section className="orders-section">
        <h3>All Orders by Item</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Location</th>
              <th>Buy Orders</th>
              <th>Sell Orders</th>
              <th>Total Exposure</th>
              <th>Need Attention</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item, idx) => (
              <tr key={idx}>
                <td>{item['Item']}</td>
                <td>{item['Location']}</td>
                <td>{item['Buy Orders']}</td>
                <td>{item['Sell Orders']}</td>
                <td>{(item['Total Exposure (ISK)'] / 1e6).toFixed(2)}M ISK</td>
                <td className={item['Orders Needing Attention'] > 0 ? 'warning' : ''}>
                  {item['Orders Needing Attention']}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/**
 * Example: Auto-Refreshing Order Monitor
 *
 * This example shows how to use auto-refresh to keep orders up-to-date
 */
export function AutoRefreshOrderMonitor({ corporationId }) {
  const {
    loading,
    error,
    summary,
    lastUpdated,
    getUndercutOrders,
  } = useCorpOrders(corporationId, {
    groupBy: 'item',
    autoRefresh: true,
    refreshInterval: 300, // Refresh every 5 minutes
  });

  const undercutOrders = getUndercutOrders();

  return (
    <div className="order-monitor">
      <h2>Order Monitor (Auto-Refresh)</h2>

      {lastUpdated && (
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {loading && <div className="loading-indicator">Refreshing...</div>}

      {error && <div className="error">{error.message}</div>}

      {summary && (
        <div className="monitor-stats">
          <div>Total Orders: {summary.totalOrders}</div>
          <div className={undercutOrders.length > 0 ? 'alert' : ''}>
            Undercut Orders: {undercutOrders.length}
          </div>
        </div>
      )}

      {undercutOrders.length > 0 && (
        <div className="undercut-alerts">
          <h3>Undercut Alerts</h3>
          {undercutOrders.map((item, idx) => (
            <div key={idx} className="alert-card">
              <strong>{item.itemName}</strong>
              <div>Location: {item.locationName}</div>
              <div>Undercut orders: {item.count}</div>
              {item.orders.map((order, orderIdx) => (
                <div key={orderIdx} className="order-detail">
                  {order.isBuyOrder ? 'Buy' : 'Sell'} @ {order.price.toLocaleString()} ISK
                  {order.undercutStatus.isUndercut && (
                    <span className="undercut-info">
                      (Competitor @ {order.undercutStatus.competitorPrice.toLocaleString()})
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Order Health Breakdown
 *
 * Shows detailed health analysis of all orders
 */
export function OrderHealthBreakdown({ corporationId }) {
  const {
    loading,
    error,
    fetchOrders,
    filterByHealth,
    getHealthStats,
  } = useCorpOrders(corporationId);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const healthStats = getHealthStats();
  const criticalOrders = filterByHealth(0, 39);
  const warningOrders = filterByHealth(40, 69);
  const healthyOrders = filterByHealth(70, 100);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!healthStats) return <div>No data</div>;

  return (
    <div className="health-breakdown">
      <h2>Order Health Breakdown</h2>

      <div className="health-summary">
        <div className="health-stat critical">
          <h3>Critical (0-39)</h3>
          <div className="count">{healthStats.critical}</div>
          <div className="percentage">
            {healthStats.criticalPercentage.toFixed(1)}%
          </div>
        </div>
        <div className="health-stat warning">
          <h3>Warning (40-69)</h3>
          <div className="count">{healthStats.warning}</div>
          <div className="percentage">
            {healthStats.warningPercentage.toFixed(1)}%
          </div>
        </div>
        <div className="health-stat healthy">
          <h3>Healthy (70-100)</h3>
          <div className="count">{healthStats.healthy}</div>
          <div className="percentage">
            {healthStats.healthyPercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {criticalOrders.length > 0 && (
        <section>
          <h3>Critical Orders</h3>
          {criticalOrders.map((item, idx) => (
            <div key={idx} className="order-item critical">
              <h4>{item['Item']} @ {item['Location']}</h4>
              <ul>
                {item['Order Details'].map((order, orderIdx) => (
                  <li key={orderIdx}>
                    {order.isBuyOrder ? 'Buy' : 'Sell'} @ {order.price.toLocaleString()} ISK
                    - Health: {order.health}
                    {order.undercutStatus.isUndercut && ' (UNDERCUT)'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/**
 * Example: Location-Based Grouping
 *
 * Shows orders grouped by location instead of item
 */
export function LocationBasedOrders({ corporationId }) {
  const {
    loading,
    error,
    orders,
    fetchOrders,
  } = useCorpOrders(corporationId, {
    groupBy: 'location', // Group by location instead of item
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="location-orders">
      <h2>Orders by Location</h2>

      {orders.map((location, idx) => (
        <div key={idx} className="location-group">
          <h3>{location['Location']}</h3>
          <div className="location-stats">
            <div>Total Orders: {location['Buy Orders'] + location['Sell Orders']}</div>
            <div>Total Exposure: {(location['Total Exposure (ISK)'] / 1e9).toFixed(2)}B ISK</div>
            <div>Items Traded: {location['Order Details'].length}</div>
          </div>

          {location['Orders Needing Attention'] > 0 && (
            <div className="attention-notice">
              {location['Orders Needing Attention']} order(s) need attention
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Example: Simple Alert Component
 *
 * Minimal component that just shows critical alerts
 */
export function SimpleOrderAlerts({ corporationId }) {
  const { getOrdersNeedingAttention, fetchOrders } = useCorpOrders(corporationId);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const alerts = getOrdersNeedingAttention();

  if (alerts.length === 0) {
    return <div className="no-alerts">All orders are healthy!</div>;
  }

  return (
    <div className="simple-alerts">
      <h3>Orders Needing Attention ({alerts.length})</h3>
      <ul>
        {alerts.map((alert, idx) => (
          <li key={idx}>
            {alert.itemName} at {alert.locationName} - {alert.count} order(s)
          </li>
        ))}
      </ul>
    </div>
  );
}
