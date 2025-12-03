/**
 * Hauling API Endpoint
 * Finds profitable trading opportunities between stations/regions
 *
 * Query params:
 * - from: Origin location (format: "preference-regionId:stationId" or "preference-regionId")
 * - to: Destination location (same format, or "preference-nearby")
 * - minProfit: Minimum profit threshold
 * - maxWeight: Maximum cargo weight (m³)
 * - minROI: Minimum return on investment (%)
 * - maxBudget: Maximum budget for buying
 * - tax: Sales tax rate (decimal)
 * - systemSecurity: Security filter (all, high, low, null)
 * - routeSafety: Route preference (shortest, secure, insecure)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests
const TYPE_CACHE_MAX_SIZE = 2000; // Maximum entries in type info cache

/**
 * Simple LRU Cache implementation
 */
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }
}

// Cache for type info (volume, etc.) with LRU eviction
const typeInfoCache = new LRUCache(TYPE_CACHE_MAX_SIZE);

/**
 * Validate and parse an integer parameter
 */
function validateInt(value, _paramName, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === null || value === '') return null;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

/**
 * Validate and parse a float parameter
 */
function validateFloat(value, paramName, min = 0, max = Infinity, defaultValue = null) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num) || num < min || num > max) {
    return defaultValue;
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
 * Parse location string into components
 * Format: "preference-regionId:stationId" or "preference-regionId"
 * @returns {object|null} Parsed location or null if invalid
 */
function parseLocation(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') return null;

  let preference = 'sell';
  let rest = locationStr;

  if (locationStr.startsWith('buy-')) {
    preference = 'buy';
    rest = locationStr.slice(4);
  } else if (locationStr.startsWith('sell-')) {
    preference = 'sell';
    rest = locationStr.slice(5);
  }

  const parts = rest.split(':');
  const regionId = parseInt(parts[0], 10);

  // Validate regionId
  if (isNaN(regionId) || regionId <= 0) return null;

  // Validate stationId if provided
  let stationId = null;
  if (parts[1]) {
    stationId = parseInt(parts[1], 10);
    if (isNaN(stationId) || stationId <= 0) return null;
  }

  return { preference, regionId, stationId };
}

/**
 * Fetch pages in parallel with a limit
 * @returns {{ orders: Array, errors: Array }} Results and any errors encountered
 */
async function fetchPagesInParallel(baseUrl, maxPages) {
  const batchSize = 10; // Reduced from 15 to avoid rate limiting
  const allOrders = [];
  const errors = [];

  for (let batchStart = 1; batchStart <= maxPages; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, maxPages);
    const pageNumbers = [];
    for (let p = batchStart; p <= batchEnd; p++) {
      pageNumbers.push(p);
    }

    const batchResults = await Promise.allSettled(
      pageNumbers.map(async (page) => {
        const response = await fetchWithTimeout(`${baseUrl}&page=${page}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      })
    );

    for (let i = 0; i < batchResults.length; i++) {
      const result = batchResults[i];
      if (result.status === 'fulfilled') {
        allOrders.push(...(result.value || []));
      } else {
        errors.push({ page: pageNumbers[i], error: result.reason?.message || 'Unknown error' });
      }
    }
  }

  return { orders: allOrders, errors };
}

/**
 * Fetch market orders from ESI for a region (parallel fetching)
 * Fetches buy and sell orders separately
 * @returns {{ orders: Array, errors: Array }} Orders and any errors encountered
 */
async function fetchRegionOrders(regionId) {
  const buyUrl = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=buy`;
  const sellUrl = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=sell`;

  // Get total pages for each order type
  const [buyFirstResponse, sellFirstResponse] = await Promise.all([
    fetchWithTimeout(`${buyUrl}&page=1`),
    fetchWithTimeout(`${sellUrl}&page=1`)
  ]);

  if (!buyFirstResponse.ok || !sellFirstResponse.ok) {
    throw new Error(`ESI API error: buy=${buyFirstResponse.status}, sell=${sellFirstResponse.status}`);
  }

  const buyTotalPages = parseInt(buyFirstResponse.headers.get('x-pages') || '1', 10);
  const sellTotalPages = parseInt(sellFirstResponse.headers.get('x-pages') || '1', 10);

  // Limit pages (30 each = 60 total requests)
  const maxBuyPages = Math.min(buyTotalPages, 30);
  const maxSellPages = Math.min(sellTotalPages, 30);

  // Fetch both buy and sell orders in parallel
  const [buyResult, sellResult] = await Promise.all([
    fetchPagesInParallel(buyUrl, maxBuyPages),
    fetchPagesInParallel(sellUrl, maxSellPages)
  ]);

  const allErrors = [...buyResult.errors, ...sellResult.errors];
  if (allErrors.length > 0) {
    console.warn(`Region ${regionId} fetch errors:`, allErrors.slice(0, 5));
  }

  return {
    orders: [...buyResult.orders, ...sellResult.orders],
    errors: allErrors
  };
}

/**
 * Fetch type information (volume, name) from ESI
 */
async function getTypeInfo(typeId) {
  const cached = typeInfoCache.get(typeId);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithTimeout(`${ESI_BASE}/universe/types/${typeId}/?datasource=tranquility`);
    if (!response.ok) {
      return { volume: 0.01, name: `Item #${typeId}` };
    }

    const data = await response.json();
    const info = {
      volume: data.packaged_volume || data.volume || 0.01,
      name: data.name || `Item #${typeId}`,
    };

    typeInfoCache.set(typeId, info);
    return info;
  } catch {
    return { volume: 0.01, name: `Item #${typeId}` };
  }
}

/**
 * Batch fetch type info for multiple type IDs
 */
async function batchGetTypeInfo(typeIds) {
  const uniqueIds = [...new Set(typeIds)];
  const uncached = uniqueIds.filter(id => !typeInfoCache.has(id));

  // Fetch names in batch
  if (uncached.length > 0) {
    try {
      const response = await fetchWithTimeout(`${ESI_BASE}/universe/names/?datasource=tranquility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uncached.slice(0, 1000)),
      });

      if (response.ok) {
        const names = await response.json();
        for (const item of names) {
          if (!typeInfoCache.has(item.id)) {
            typeInfoCache.set(item.id, { name: item.name, volume: 0.01 });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to batch fetch names:', e.message);
    }
  }

  // Return map of type info
  const result = {};
  for (const id of uniqueIds) {
    result[id] = typeInfoCache.get(id) || { volume: 0.01, name: `Item #${id}` };
  }
  return result;
}

/**
 * Fetch station name from ESI
 */
async function getStationName(stationId) {
  try {
    // Check if it's an NPC station (ID < 100000000) or structure
    if (stationId < 100000000) {
      const response = await fetchWithTimeout(`${ESI_BASE}/universe/stations/${stationId}/?datasource=tranquility`);
      if (response.ok) {
        const data = await response.json();
        return data.name;
      }
    }
    return `Station #${stationId}`;
  } catch {
    return `Station #${stationId}`;
  }
}

/**
 * Calculate hauling opportunities
 */
async function calculateHaulingTrades(fromOrders, toOrders, fromLocation, toLocation, params) {
  const { minProfit, maxWeight, minROI, maxBudget, tax } = params;

  // Group orders by type_id
  // From location: we want to BUY (look at sell orders) or SELL (look at buy orders)
  // To location: we want to SELL (look at buy orders) or BUY (look at sell orders)

  const fromPref = fromLocation.preference; // 'sell' means we buy from sell orders
  const toPref = toLocation.preference; // 'buy' means we sell to buy orders

  // Filter by station if specified
  let filteredFromOrders = fromOrders;
  let filteredToOrders = toOrders;

  if (fromLocation.stationId) {
    filteredFromOrders = fromOrders.filter(o => o.location_id === fromLocation.stationId);
  }
  if (toLocation.stationId) {
    filteredToOrders = toOrders.filter(o => o.location_id === toLocation.stationId);
  }

  // Separate buy and sell orders
  const fromSellOrders = filteredFromOrders.filter(o => !o.is_buy_order);
  const fromBuyOrders = filteredFromOrders.filter(o => o.is_buy_order);
  const toSellOrders = filteredToOrders.filter(o => !o.is_buy_order);
  const toBuyOrders = filteredToOrders.filter(o => o.is_buy_order);

  // Determine which orders to use based on preferences
  // fromPref='sell' -> buy from sell orders at origin
  // toPref='buy' -> sell to buy orders at destination
  const buyFrom = fromPref === 'sell' ? fromSellOrders : fromBuyOrders;
  const sellTo = toPref === 'buy' ? toBuyOrders : toSellOrders;

  // Group by type_id
  const buyByType = {};
  for (const order of buyFrom) {
    if (!buyByType[order.type_id]) buyByType[order.type_id] = [];
    buyByType[order.type_id].push(order);
  }

  const sellByType = {};
  for (const order of sellTo) {
    if (!sellByType[order.type_id]) sellByType[order.type_id] = [];
    sellByType[order.type_id].push(order);
  }

  // Find common type_ids
  const commonTypes = Object.keys(buyByType).filter(t => sellByType[t]);

  // Batch fetch type info
  const typeInfo = await batchGetTypeInfo(commonTypes.map(t => parseInt(t)));

  const trades = [];

  for (const typeId of commonTypes) {
    const buyOrders = buyByType[typeId];
    const sellOrders = sellByType[typeId];

    const info = typeInfo[typeId] || { volume: 0.01, name: `Item #${typeId}` };

    // Best buy price (lowest sell order at origin)
    const bestBuy = buyOrders.reduce((min, o) => o.price < min.price ? o : min, buyOrders[0]);
    // Best sell price (highest buy order at destination)
    const bestSell = sellOrders.reduce((max, o) => o.price > max.price ? o : max, sellOrders[0]);

    const buyPrice = bestBuy.price;
    const sellPrice = bestSell.price;

    // Skip if no profit margin
    if (sellPrice <= buyPrice) continue;

    // Calculate how many we can trade
    const maxByBudget = Math.floor(maxBudget / buyPrice);
    const maxByVolume = Math.floor(maxWeight / info.volume);
    const maxBySupply = bestBuy.volume_remain;
    const maxByDemand = bestSell.volume_remain;

    const quantity = Math.min(maxByBudget, maxByVolume, maxBySupply, maxByDemand);

    if (quantity <= 0) continue;

    // Calculate profit
    const totalBuyCost = buyPrice * quantity;
    const totalSellRevenue = sellPrice * quantity;
    const salesTaxAmount = totalSellRevenue * tax;
    const profit = totalSellRevenue - totalBuyCost - salesTaxAmount;

    if (profit < minProfit) continue;

    // Calculate ROI
    const roi = (profit / totalBuyCost) * 100;

    if (roi < minROI) continue;

    trades.push({
      'Item ID': parseInt(typeId),
      'Item': info.name,
      'From': fromLocation.stationId ? `Station #${fromLocation.stationId}` : `Region #${fromLocation.regionId}`,
      'Take To': toLocation.stationId ? `Station #${toLocation.stationId}` : `Region #${toLocation.regionId}`,
      'Quantity': quantity,
      'Buy Price': Math.round(buyPrice * 100) / 100,
      'Sell Price': Math.round(sellPrice * 100) / 100,
      'Profit': Math.round(profit),
      'ROI': Math.round(roi * 10) / 10,
      'Profit per Jump': Math.round(profit), // Placeholder - would need route calculation
      'Jumps': 'N/A',
      'fromLocation': `${fromLocation.regionId}:${fromLocation.stationId || '0'}`,
      'toLocation': `${toLocation.regionId}:${toLocation.stationId || '0'}`,
    });
  }

  // Sort by profit descending
  trades.sort((a, b) => b['Profit'] - a['Profit']);

  return trades.slice(0, 500);
}

export default async function handler(req, res) {
  // Generate request ID for debugging
  const requestId = req.headers['x-vercel-id'] || crypto.randomUUID?.() || Date.now().toString(36);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Request-ID', requestId);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      from,
      to,
      minProfit = '1000000',
      maxWeight = '30000',
      minROI = '5',
      maxBudget = '1000000000',
      tax = '0.08',
    } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'From and To locations are required' });
    }

    const fromLocation = parseLocation(from);
    const toLocation = parseLocation(to);

    if (!fromLocation || !toLocation) {
      return res.status(400).json({ error: 'Invalid location format (expected: preference-regionId:stationId)' });
    }

    // Validate and parse numeric parameters with sensible bounds
    const params = {
      minProfit: validateFloat(minProfit, 'minProfit', 0, 1e15, 1000000),
      maxWeight: validateFloat(maxWeight, 'maxWeight', 0, 1e9, 30000),
      minROI: validateFloat(minROI, 'minROI', 0, 10000, 5),
      maxBudget: validateFloat(maxBudget, 'maxBudget', 0, 1e15, 1000000000),
      tax: validateFloat(tax, 'tax', 0, 1, 0.08),
    };

    // Fetch orders from both regions
    const [fromResult, toResult] = await Promise.all([
      fetchRegionOrders(fromLocation.regionId),
      fetchRegionOrders(toLocation.regionId),
    ]);

    const fetchErrors = [...fromResult.errors, ...toResult.errors];
    if (fetchErrors.length > 0) {
      console.warn(`[${requestId}] Fetch errors:`, fetchErrors.slice(0, 5));
    }

    // Calculate trading opportunities
    const trades = await calculateHaulingTrades(
      fromResult.orders,
      toResult.orders,
      fromLocation,
      toLocation,
      params
    );

    // Fetch station names for display
    const stationIds = new Set();
    if (fromLocation.stationId) stationIds.add(fromLocation.stationId);
    if (toLocation.stationId) stationIds.add(toLocation.stationId);

    const stationNames = {};
    for (const id of stationIds) {
      stationNames[id] = await getStationName(id);
    }

    // Update trades with station names
    for (const trade of trades) {
      if (fromLocation.stationId && stationNames[fromLocation.stationId]) {
        trade['From'] = stationNames[fromLocation.stationId];
      }
      if (toLocation.stationId && stationNames[toLocation.stationId]) {
        trade['Take To'] = stationNames[toLocation.stationId];
      }
    }

    // Set cache headers (market data updates every 5 minutes in EVE)
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');

    return res.status(200).json(trades);
  } catch (error) {
    console.error(`[${requestId}] Hauling error:`, error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Failed to fetch hauling data',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
