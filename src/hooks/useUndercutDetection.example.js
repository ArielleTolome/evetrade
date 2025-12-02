/**
 * useUndercutDetection Hook - Usage Examples
 *
 * This file demonstrates how to use the useUndercutDetection hook
 * with EVE Online ESI API to monitor and manage market orders.
 */

import { useEffect, useState } from 'react';
import { useUndercutDetection } from './useUndercutDetection';
import { getCharacterOrders, getMarketOrders } from '../api/esi';

/**
 * Example 1: Basic Undercut Detection Component
 * Monitors a character's orders and alerts when they're undercut
 */
export function BasicUndercutMonitor({ characterId, accessToken }) {
  const {
    undercutOrders,
    undercutStats,
    loading,
    error,
    checkOrders,
  } = useUndercutDetection();

  const [characterOrders, setCharacterOrders] = useState([]);

  useEffect(() => {
    async function loadAndCheckOrders() {
      try {
        // 1. Fetch character's active orders
        const orders = await getCharacterOrders(characterId, accessToken);
        setCharacterOrders(orders);

        // 2. Group orders by region and type_id to batch market data requests
        const orderGroups = {};
        orders.forEach(order => {
          const key = `${order.region_id}-${order.type_id}`;
          if (!orderGroups[key]) {
            orderGroups[key] = {
              regionId: order.region_id,
              typeId: order.type_id,
              orders: [],
            };
          }
          orderGroups[key].orders.push(order);
        });

        // 3. Fetch market orders for each unique region/type combination
        const allMarketOrders = [];
        for (const group of Object.values(orderGroups)) {
          const marketOrders = await getMarketOrders(
            group.regionId,
            group.typeId,
            'all'
          );
          allMarketOrders.push(...marketOrders);
        }

        // 4. Check for undercuts
        await checkOrders(orders, allMarketOrders);
      } catch (err) {
        console.error('Failed to check orders:', err);
      }
    }

    if (characterId && accessToken) {
      loadAndCheckOrders();
      // Check every 5 minutes
      const interval = setInterval(loadAndCheckOrders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [characterId, accessToken, checkOrders]);

  if (loading) {
    return <div>Checking orders for undercuts...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Undercut Monitor</h2>
      <div>
        <p>Total Orders: {characterOrders.length}</p>
        <p>Undercut Orders: {undercutStats.total}</p>
        <p>Potential Loss: {undercutStats.totalPotentialLoss.toLocaleString()} ISK</p>
      </div>

      {undercutOrders.length > 0 && (
        <div>
          <h3>Undercut Orders</h3>
          {undercutOrders.map(order => (
            <div key={order.order_id}>
              <p>
                {order.isBuyOrder ? 'Buy' : 'Sell'} Order - Type ID: {order.type_id}
              </p>
              <p>Your Price: {order.price.toLocaleString()} ISK</p>
              <p>Best Competitor: {order.bestCompetitorPrice.toLocaleString()} ISK</p>
              <p>Undercut By: {order.undercutBy.toFixed(2)} ISK ({order.undercutPercent.toFixed(2)}%)</p>
              <p>Recommended Price: {order.recommendedPrice.toLocaleString()} ISK</p>
              <p>Competitors Ahead: {order.competitorCount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Advanced Order Management with Pricing Strategies
 */
export function AdvancedOrderManager({ characterId, accessToken }) {
  const {
    undercutOrders,
    loading,
    checkOrders,
    calculateOptimalPrice,
  } = useUndercutDetection();

  const [selectedStrategy, setSelectedStrategy] = useState('aggressive');
  const [pricingRecommendations, setPricingRecommendations] = useState([]);

  async function analyzeOrders() {
    try {
      const orders = await getCharacterOrders(characterId, accessToken);

      const allMarketOrders = [];
      for (const order of orders) {
        const marketOrders = await getMarketOrders(
          order.region_id,
          order.type_id,
          'all'
        );
        allMarketOrders.push(...marketOrders);
      }

      await checkOrders(orders, allMarketOrders);

      // Calculate pricing recommendations for all orders
      const recommendations = orders.map(order => {
        const relevantMarketOrders = allMarketOrders.filter(
          mo => mo.type_id === order.type_id && mo.location_id === order.location_id
        );
        return calculateOptimalPrice(order, relevantMarketOrders, selectedStrategy);
      });

      setPricingRecommendations(recommendations);
    } catch (err) {
      console.error('Failed to analyze orders:', err);
    }
  }

  return (
    <div>
      <h2>Advanced Order Manager</h2>

      <div>
        <label>Pricing Strategy:</label>
        <select value={selectedStrategy} onChange={e => setSelectedStrategy(e.target.value)}>
          <option value="aggressive">Aggressive (Beat by 0.01 ISK)</option>
          <option value="moderate">Moderate (Match best price)</option>
          <option value="conservative">Conservative (Top 5)</option>
        </select>
        <button onClick={analyzeOrders} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Orders'}
        </button>
      </div>

      {pricingRecommendations.length > 0 && (
        <div>
          <h3>Pricing Recommendations</h3>
          {pricingRecommendations.map((rec, idx) => (
            <div key={idx}>
              <p>Current: {rec.currentPrice.toLocaleString()} ISK</p>
              <p>Recommended: {rec.price.toLocaleString()} ISK</p>
              <p>Change: {rec.priceChange.toFixed(2)} ISK ({rec.priceChangePercent.toFixed(2)}%)</p>
              <p>Strategy: {rec.strategy}</p>
              <p>Reason: {rec.reason}</p>
              <p>Volume Impact: {rec.volumeImpact.toLocaleString()} ISK</p>
              {rec.isImprovement && <span>✓ Will improve position</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Order Priority List
 * Shows which orders need immediate attention
 */
export function OrderPriorityList({ characterId, accessToken }) {
  const {
    undercutOrders,
    undercutStats,
    checkOrders,
    getRecommendedPrice,
  } = useUndercutDetection();

  const [sortedByPriority, setSortedByPriority] = useState([]);

  async function checkAndPrioritize() {
    try {
      const orders = await getCharacterOrders(characterId, accessToken);

      const allMarketOrders = [];
      for (const order of orders) {
        const marketOrders = await getMarketOrders(
          order.region_id,
          order.type_id,
          'all'
        );
        allMarketOrders.push(...marketOrders);
      }

      const undercuts = await checkOrders(orders, allMarketOrders);

      // Sort by priority: highest profit loss first
      const sorted = [...undercuts].sort((a, b) => b.profitLoss - a.profitLoss);
      setSortedByPriority(sorted);
    } catch (err) {
      console.error('Failed to check orders:', err);
    }
  }

  useEffect(() => {
    if (characterId && accessToken) {
      checkAndPrioritize();
    }
  }, [characterId, accessToken]);

  return (
    <div>
      <h2>Order Priority List</h2>
      <p>Orders sorted by potential profit impact</p>

      {undercutStats.total > 0 && (
        <div>
          <p><strong>Total at risk: {undercutStats.totalPotentialLoss.toLocaleString()} ISK</strong></p>
        </div>
      )}

      {sortedByPriority.map((order, idx) => (
        <div key={order.order_id} style={{
          borderLeft: idx === 0 ? '4px solid red' : '4px solid orange',
          paddingLeft: '10px',
          marginBottom: '10px'
        }}>
          <h4>Priority #{idx + 1}</h4>
          <p>Type ID: {order.type_id}</p>
          <p>Current Price: {order.price.toLocaleString()} ISK</p>
          <p>Recommended: {getRecommendedPrice(order).toLocaleString()} ISK</p>
          <p>Undercut by: {order.undercutPercent.toFixed(2)}%</p>
          <p>Potential Loss: {order.profitLoss.toLocaleString()} ISK</p>
          <p>Volume Remaining: {order.volumeRemaining.toLocaleString()}</p>
          <button>Update Order</button>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 4: Real-time Alert System
 * Integrates with browser notifications
 */
export function UndercutAlertSystem({ characterId, accessToken, notificationsEnabled }) {
  const {
    undercutOrders,
    checkOrders,
  } = useUndercutDetection();

  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [previousUndercutCount, setPreviousUndercutCount] = useState(0);

  async function checkForNewUndercuts() {
    try {
      const orders = await getCharacterOrders(characterId, accessToken);

      const allMarketOrders = [];
      for (const order of orders) {
        const marketOrders = await getMarketOrders(
          order.region_id,
          order.type_id,
          'all'
        );
        allMarketOrders.push(...marketOrders);
      }

      const undercuts = await checkOrders(orders, allMarketOrders);

      // Check for new undercuts
      if (undercuts.length > previousUndercutCount && notificationsEnabled) {
        const newUndercuts = undercuts.length - previousUndercutCount;
        showNotification(
          'EVETrade Alert',
          `${newUndercuts} new order(s) have been undercut!`
        );
      }

      setPreviousUndercutCount(undercuts.length);
      setLastCheckTime(new Date());
    } catch (err) {
      console.error('Failed to check for undercuts:', err);
    }
  }

  function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
      });
    }
  }

  useEffect(() => {
    if (characterId && accessToken) {
      // Check immediately
      checkForNewUndercuts();

      // Then check every 2 minutes
      const interval = setInterval(checkForNewUndercuts, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [characterId, accessToken]);

  return (
    <div>
      <h2>Undercut Alert System</h2>
      {lastCheckTime && (
        <p>Last checked: {lastCheckTime.toLocaleTimeString()}</p>
      )}
      <p>Active undercuts: {undercutOrders.length}</p>

      {undercutOrders.length > 0 && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>
          ⚠️ You have {undercutOrders.length} undercut order(s)!
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Batch Price Update Helper
 * Helps update multiple orders efficiently
 */
export function BatchPriceUpdater({ characterId, accessToken }) {
  const {
    undercutOrders,
    checkOrders,
    calculateOptimalPrice,
  } = useUndercutDetection();

  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [strategy, setStrategy] = useState('aggressive');

  async function loadUndercuts() {
    try {
      const orders = await getCharacterOrders(characterId, accessToken);

      const allMarketOrders = [];
      for (const order of orders) {
        const marketOrders = await getMarketOrders(
          order.region_id,
          order.type_id,
          'all'
        );
        allMarketOrders.push(...marketOrders);
      }

      await checkOrders(orders, allMarketOrders);
    } catch (err) {
      console.error('Failed to load undercuts:', err);
    }
  }

  function toggleOrderSelection(orderId) {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  }

  function selectAllUndercuts() {
    setSelectedOrders(new Set(undercutOrders.map(o => o.order_id)));
  }

  function generateUpdateScript() {
    // This would generate instructions or API calls to update selected orders
    const updates = Array.from(selectedOrders).map(orderId => {
      const order = undercutOrders.find(o => o.order_id === orderId);
      if (!order) return null;

      const recommendation = calculateOptimalPrice(order, [], strategy);
      return {
        orderId: order.order_id,
        currentPrice: order.price,
        newPrice: recommendation.price,
      };
    }).filter(Boolean);

    console.log('Update orders:', updates);
    alert(`Ready to update ${updates.length} orders with ${strategy} strategy`);
  }

  return (
    <div>
      <h2>Batch Price Updater</h2>

      <div>
        <button onClick={loadUndercuts}>Refresh Undercuts</button>
        <select value={strategy} onChange={e => setStrategy(e.target.value)}>
          <option value="aggressive">Aggressive</option>
          <option value="moderate">Moderate</option>
          <option value="conservative">Conservative</option>
        </select>
      </div>

      <div>
        <button onClick={selectAllUndercuts}>Select All</button>
        <button onClick={() => setSelectedOrders(new Set())}>Clear Selection</button>
        <button
          onClick={generateUpdateScript}
          disabled={selectedOrders.size === 0}
        >
          Update Selected ({selectedOrders.size})
        </button>
      </div>

      {undercutOrders.map(order => (
        <div key={order.order_id}>
          <input
            type="checkbox"
            checked={selectedOrders.has(order.order_id)}
            onChange={() => toggleOrderSelection(order.order_id)}
          />
          <span>Type {order.type_id}</span>
          <span> - Current: {order.price.toLocaleString()} ISK</span>
          <span> - Recommended: {order.recommendedPrice.toLocaleString()} ISK</span>
          <span> - Undercut: {order.undercutPercent.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}

export default {
  BasicUndercutMonitor,
  AdvancedOrderManager,
  OrderPriorityList,
  UndercutAlertSystem,
  BatchPriceUpdater,
};
