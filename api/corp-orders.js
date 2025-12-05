/**
 * Corporation Orders API Endpoint
 * Fetches and aggregates corporation market orders with analysis
 *
 * Query params:
 * - corporationId: Corporation ID
 * - groupBy: How to group orders ('item', 'location', 'both') - default: 'item'
 * - includeHistory: Include historical orders for profit tracking (default: false)
 *
 * Headers:
 * - Authorization: Bearer {access_token} (required)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests

/**
 * Validate and parse an integer parameter
 */
function validateInt(value, paramName, min = 1, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === null || value === '') return null;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
    throw new Error(`Invalid ${paramName}: must be an integer between ${min} and ${max}`);
  }
  return num;
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = ESI_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('ESI request timeout');
    }
    throw error;
  }
}

/**
 * Fetch corporation market orders from ESI
 * Requires: esi-markets.read_corporation_orders.v1 scope
 */
async function fetchCorporationOrders(corporationId, accessToken) {
  const url = `${ESI_BASE}/corporations/${corporationId}/orders/?datasource=tranquility`;

  const response = await fetchWithTimeout(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Missing required scope esi-markets.read_corporation_orders.v1');
    }
    if (response.status === 404) {
      throw new Error('Corporation not found or no access');
    }
    throw new Error(`ESI Error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch corporation order history
 * Requires: esi-markets.read_corporation_orders.v1 scope
 */
async function fetchCorporationOrderHistory(corporationId, accessToken) {
  const url = `${ESI_BASE}/corporations/${corporationId}/orders/history/?datasource=tranquility`;

  const allOrders = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 5) { // Limit to 5 pages for performance
    try {
      const response = await fetchWithTimeout(`${url}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) break;
        throw new Error(`ESI Error: ${response.status}`);
      }

      const orders = await response.json();
      allOrders.push(...orders);

      const totalPages = parseInt(response.headers.get('x-pages') || '1', 10);
      hasMore = page < totalPages;
      page++;
    } catch (error) {
      console.warn(`Failed to fetch history page ${page}:`, error.message);
      break;
    }
  }

  return allOrders;
}

/**
 * Fetch current market data for comparison (to detect undercuts)
 */
async function fetchMarketOrdersForItem(regionId, typeId) {
  const url = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&type_id=${typeId}`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch market data for ${typeId}:`, error.message);
    return [];
  }
}

/**
 * Fetch item names from ESI
 */
async function getItemNames(typeIds) {
  if (typeIds.length === 0) return {};

  // ESI has a limit of 1000 IDs per request
  const chunks = [];
  for (let i = 0; i < typeIds.length; i += 1000) {
    chunks.push(typeIds.slice(i, i + 1000));
  }

  const names = {};

  for (const chunk of chunks) {
    try {
      const response = await fetchWithTimeout(`${ESI_BASE}/universe/names/?datasource=tranquility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      });

      if (response.ok) {
        const data = await response.json();
        for (const item of data) {
          names[item.id] = item.name;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch item names:', error.message);
    }
  }

  return names;
}

/**
 * Get location names (stations/structures)
 */
async function getLocationNames(locationIds, accessToken) {
  const names = {};
  const stationIds = locationIds.filter(id => id < 1000000000000); // Stations have lower IDs
  const structureIds = locationIds.filter(id => id >= 1000000000000); // Player structures

  // Fetch station names
  if (stationIds.length > 0) {
    try {
      const response = await fetchWithTimeout(`${ESI_BASE}/universe/names/?datasource=tranquility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stationIds),
      });

      if (response.ok) {
        const data = await response.json();
        for (const item of data) {
          names[item.id] = item.name;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch station names:', error.message);
    }
  }

  // Fetch structure names (requires auth)
  for (const structureId of structureIds) {
    try {
      const response = await fetchWithTimeout(
        `${ESI_BASE}/universe/structures/${structureId}/?datasource=tranquility`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        names[structureId] = data.name;
      }
    } catch {
      // Ignore errors, we'll just use a placeholder name
      names[structureId] = `Structure #${structureId}`;
    }
  }

  return names;
}

/**
 * Analyze order undercut status
 */
function analyzeUndercut(corpOrder, marketOrders) {
  const isBuyOrder = corpOrder.is_buy_order;
  const competingOrders = marketOrders.filter(o =>
    o.is_buy_order === isBuyOrder &&
    o.order_id !== corpOrder.order_id
  );

  if (competingOrders.length === 0) {
    return {
      isUndercut: false,
      competitorPrice: null,
      priceDifference: 0,
      rank: 1,
    };
  }

  // For buy orders, higher prices are better
  // For sell orders, lower prices are better
  competingOrders.sort((a, b) =>
    isBuyOrder ? b.price - a.price : a.price - b.price
  );

  const bestCompetitorPrice = competingOrders[0].price;
  const isUndercut = isBuyOrder
    ? corpOrder.price < bestCompetitorPrice
    : corpOrder.price > bestCompetitorPrice;

  const priceDifference = Math.abs(corpOrder.price - bestCompetitorPrice);

  // Find rank (position in order book)
  const allOrders = [...competingOrders, corpOrder].sort((a, b) =>
    isBuyOrder ? b.price - a.price : a.price - b.price
  );
  const rank = allOrders.findIndex(o => o.order_id === corpOrder.order_id) + 1;

  return {
    isUndercut,
    competitorPrice: bestCompetitorPrice,
    priceDifference,
    rank,
    totalCompetitors: competingOrders.length,
  };
}

/**
 * Calculate order health score (0-100)
 * Based on: time remaining, fill rate, undercut status
 */
function calculateOrderHealth(order, undercutStatus) {
  let health = 100;

  // Time remaining penalty (0-30 points)
  const now = new Date();
  const issued = new Date(order.issued);
  const daysOld = (now - issued) / (1000 * 60 * 60 * 24);
  const daysRemaining = 90 - daysOld; // Orders last 90 days max

  if (daysRemaining < 7) {
    health -= 30;
  } else if (daysRemaining < 14) {
    health -= 15;
  }

  // Fill rate penalty (0-20 points)
  const fillRate = (order.volume_total - order.volume_remain) / order.volume_total;
  if (fillRate < 0.1) {
    health -= 20; // Very slow moving
  } else if (fillRate < 0.3) {
    health -= 10;
  }

  // Undercut penalty (0-50 points)
  if (undercutStatus.isUndercut) {
    health -= 50;
  } else if (undercutStatus.rank > 1) {
    health -= 20; // Not undercut but not at best price
  }

  return Math.max(0, health);
}

/**
 * Aggregate corporation orders
 */
function aggregateOrders(orders, marketData, historicalOrders, groupBy = 'item') {
  const groups = {};

  for (const order of orders) {
    let groupKey;

    if (groupBy === 'item') {
      groupKey = order.type_id;
    } else if (groupBy === 'location') {
      groupKey = order.location_id;
    } else if (groupBy === 'both') {
      groupKey = `${order.type_id}_${order.location_id}`;
    } else {
      groupKey = order.type_id; // Default to item
    }

    if (!groups[groupKey]) {
      groups[groupKey] = {
        typeId: order.type_id,
        locationId: order.location_id,
        regionId: order.region_id,
        orders: [],
        buyOrders: 0,
        sellOrders: 0,
        totalBuyVolume: 0,
        totalSellVolume: 0,
        totalBuyValue: 0,
        totalSellValue: 0,
        avgBuyPrice: 0,
        avgSellPrice: 0,
        ordersNeedingAttention: [],
      };
    }

    const group = groups[groupKey];

    // Analyze undercut status
    const itemMarketData = marketData[order.type_id] || [];
    const undercutStatus = analyzeUndercut(order, itemMarketData);
    const health = calculateOrderHealth(order, undercutStatus);

    const orderWithAnalysis = {
      orderId: order.order_id,
      isBuyOrder: order.is_buy_order,
      price: order.price,
      volumeRemain: order.volume_remain,
      volumeTotal: order.volume_total,
      volumeFilled: order.volume_total - order.volume_remain,
      fillRate: ((order.volume_total - order.volume_remain) / order.volume_total) * 100,
      issued: order.issued,
      duration: order.duration,
      escrow: order.escrow,
      range: order.range,
      undercutStatus,
      health,
    };

    group.orders.push(orderWithAnalysis);

    if (order.is_buy_order) {
      group.buyOrders++;
      group.totalBuyVolume += order.volume_remain;
      group.totalBuyValue += order.price * order.volume_remain;
    } else {
      group.sellOrders++;
      group.totalSellVolume += order.volume_remain;
      group.totalSellValue += order.price * order.volume_remain;
    }

    // Track orders needing attention
    if (health < 70) {
      group.ordersNeedingAttention.push({
        orderId: order.order_id,
        reason: undercutStatus.isUndercut ? 'undercut' : health < 30 ? 'expiring_soon' : 'slow_moving',
        health,
      });
    }
  }

  // Calculate averages
  for (const group of Object.values(groups)) {
    if (group.buyOrders > 0) {
      group.avgBuyPrice = group.totalBuyValue / group.totalBuyVolume;
    }
    if (group.sellOrders > 0) {
      group.avgSellPrice = group.totalSellValue / group.totalSellVolume;
    }

    // Calculate potential profit if we have both buy and sell orders
    if (group.buyOrders > 0 && group.sellOrders > 0) {
      group.potentialProfit = (group.avgSellPrice - group.avgBuyPrice) *
        Math.min(group.totalBuyVolume, group.totalSellVolume);
    }
  }

  return groups;
}

/**
 * Format aggregated data for response
 */
function formatResponse(aggregatedData, itemNames, locationNames) {
  const result = [];

  for (const [_key, group] of Object.entries(aggregatedData)) {
    result.push({
      'Type ID': group.typeId,
      'Item': itemNames[group.typeId] || `Item #${group.typeId}`,
      'Location ID': group.locationId,
      'Location': locationNames[group.locationId] || `Location #${group.locationId}`,
      'Buy Orders': group.buyOrders,
      'Sell Orders': group.sellOrders,
      'Buy Volume': Math.round(group.totalBuyVolume),
      'Sell Volume': Math.round(group.totalSellVolume),
      'Buy Value (ISK)': Math.round(group.totalBuyValue),
      'Sell Value (ISK)': Math.round(group.totalSellValue),
      'Total Exposure (ISK)': Math.round(group.totalBuyValue + group.totalSellValue),
      'Avg Buy Price': Math.round(group.avgBuyPrice * 100) / 100,
      'Avg Sell Price': Math.round(group.avgSellPrice * 100) / 100,
      'Potential Profit': Math.round(group.potentialProfit || 0),
      'Orders Needing Attention': group.ordersNeedingAttention.length,
      'Order Details': group.orders,
      'Attention Details': group.ordersNeedingAttention,
    });
  }

  // Sort by total exposure (descending)
  result.sort((a, b) => b['Total Exposure (ISK)'] - a['Total Exposure (ISK)']);

  return result;
}

export default async function handler(req, res) {
  // Generate request ID for debugging
  const requestId = req.headers['x-vercel-id'] || crypto.randomUUID?.() || Date.now().toString(36);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Request-ID', requestId);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { corporationId, groupBy = 'item', includeHistory = 'false' } = req.query;
    const authHeader = req.headers.authorization;

    // Validate authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Format: Bearer {access_token}'
      });
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Validate corporation ID
    if (!corporationId) {
      return res.status(400).json({ error: 'Corporation ID is required' });
    }

    const corpId = validateInt(corporationId, 'corporationId', 1);
    if (corpId === null) {
      return res.status(400).json({ error: 'Invalid Corporation ID: must be a positive integer' });
    }

    // Validate groupBy parameter
    const validGroupBy = ['item', 'location', 'both'];
    if (!validGroupBy.includes(groupBy)) {
      return res.status(400).json({
        error: `Invalid groupBy parameter. Must be one of: ${validGroupBy.join(', ')}`
      });
    }

    console.log(`[${requestId}] Fetching orders for corporation ${corpId}`);

    // Fetch corporation orders
    const orders = await fetchCorporationOrders(corpId, accessToken);

    if (orders.length === 0) {
      return res.status(200).json({
        summary: {
          totalOrders: 0,
          totalBuyOrders: 0,
          totalSellOrders: 0,
          totalExposure: 0,
          ordersNeedingAttention: 0,
        },
        orders: [],
      });
    }

    // Fetch historical orders if requested
    let historicalOrders = [];
    if (includeHistory === 'true') {
      try {
        historicalOrders = await fetchCorporationOrderHistory(corpId, accessToken);
      } catch (error) {
        console.warn(`[${requestId}] Failed to fetch order history:`, error.message);
      }
    }

    // Get unique type IDs and location IDs
    const typeIds = [...new Set(orders.map(o => o.type_id))];
    const locationIds = [...new Set(orders.map(o => o.location_id))];

    console.log(`[${requestId}] Found ${orders.length} orders for ${typeIds.length} items across ${locationIds.length} locations`);

    // Fetch market data for undercut detection (limit to avoid overload)
    const marketData = {};
    const typeIdsToFetch = typeIds.slice(0, 50); // Limit to first 50 items for performance

    await Promise.all(
      typeIdsToFetch.map(async (typeId) => {
        // Use the first region ID where this item is being traded
        const order = orders.find(o => o.type_id === typeId);
        if (order) {
          marketData[typeId] = await fetchMarketOrdersForItem(order.region_id, typeId);
        }
      })
    );

    // Aggregate orders
    const aggregatedData = aggregateOrders(orders, marketData, historicalOrders, groupBy);

    // Fetch names for items and locations
    const [itemNames, locationNames] = await Promise.all([
      getItemNames(typeIds),
      getLocationNames(locationIds, accessToken),
    ]);

    // Format response
    const formattedData = formatResponse(aggregatedData, itemNames, locationNames);

    // Calculate summary statistics
    const summary = {
      totalOrders: orders.length,
      totalBuyOrders: orders.filter(o => o.is_buy_order).length,
      totalSellOrders: orders.filter(o => !o.is_buy_order).length,
      totalExposure: formattedData.reduce((sum, item) => sum + item['Total Exposure (ISK)'], 0),
      ordersNeedingAttention: formattedData.reduce((sum, item) => sum + item['Orders Needing Attention'], 0),
      uniqueItems: typeIds.length,
      uniqueLocations: locationIds.length,
    };

    // Set cache headers (orders can change frequently)
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');

    return res.status(200).json({
      summary,
      orders: formattedData,
    });
  } catch (error) {
    console.error(`[${requestId}] Corp orders error:`, error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';

    // Determine status code based on error
    let statusCode = 500;
    if (error.message.includes('Forbidden') || error.message.includes('scope')) {
      statusCode = 403;
    } else if (error.message.includes('not found') || error.message.includes('no access')) {
      statusCode = 404;
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 401;
    }

    return res.status(statusCode).json({
      error: 'Failed to fetch corporation orders',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
