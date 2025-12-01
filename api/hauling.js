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

// Cache for type info (volume, etc.)
const typeInfoCache = new Map();

/**
 * Parse location string into components
 * Format: "preference-regionId:stationId" or "preference-regionId"
 */
function parseLocation(locationStr) {
  if (!locationStr) return null;

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
  const regionId = parseInt(parts[0]);
  const stationId = parts[1] ? parseInt(parts[1]) : null;

  return { preference, regionId, stationId };
}

/**
 * Fetch pages in parallel with a limit
 */
async function fetchPagesInParallel(baseUrl, maxPages) {
  const batchSize = 15;
  const allOrders = [];

  for (let batchStart = 1; batchStart <= maxPages; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, maxPages);
    const pageNumbers = [];
    for (let p = batchStart; p <= batchEnd; p++) {
      pageNumbers.push(p);
    }

    const batchResults = await Promise.all(
      pageNumbers.map(async (page) => {
        try {
          const response = await fetch(`${baseUrl}&page=${page}`);
          if (response.ok) {
            return await response.json();
          }
          return [];
        } catch {
          return [];
        }
      })
    );

    for (const orders of batchResults) {
      allOrders.push(...orders);
    }
  }

  return allOrders;
}

/**
 * Fetch market orders from ESI for a region (parallel fetching)
 * Fetches buy and sell orders separately
 */
async function fetchRegionOrders(regionId) {
  const buyUrl = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=buy`;
  const sellUrl = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=sell`;

  // Get total pages for each order type
  const [buyFirstResponse, sellFirstResponse] = await Promise.all([
    fetch(`${buyUrl}&page=1`),
    fetch(`${sellUrl}&page=1`)
  ]);

  if (!buyFirstResponse.ok || !sellFirstResponse.ok) {
    throw new Error(`ESI API error`);
  }

  const buyTotalPages = parseInt(buyFirstResponse.headers.get('x-pages') || '1');
  const sellTotalPages = parseInt(sellFirstResponse.headers.get('x-pages') || '1');

  // Limit pages (30 each = 60 total requests)
  const maxBuyPages = Math.min(buyTotalPages, 30);
  const maxSellPages = Math.min(sellTotalPages, 30);

  // Fetch both buy and sell orders in parallel
  const [buyOrders, sellOrders] = await Promise.all([
    fetchPagesInParallel(buyUrl, maxBuyPages),
    fetchPagesInParallel(sellUrl, maxSellPages)
  ]);

  return [...buyOrders, ...sellOrders];
}

/**
 * Fetch type information (volume, name) from ESI
 */
async function getTypeInfo(typeId) {
  if (typeInfoCache.has(typeId)) {
    return typeInfoCache.get(typeId);
  }

  try {
    const response = await fetch(`${ESI_BASE}/universe/types/${typeId}/?datasource=tranquility`);
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
      const response = await fetch(`${ESI_BASE}/universe/names/?datasource=tranquility`, {
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
      console.error('Failed to batch fetch names:', e);
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
      const response = await fetch(`${ESI_BASE}/universe/stations/${stationId}/?datasource=tranquility`);
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
  const { minProfit, maxWeight, minROI, maxBudget, tax, brokerFee = 0 } = params;

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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
      return res.status(400).json({ error: 'Invalid location format' });
    }

    const params = {
      minProfit: parseFloat(minProfit),
      maxWeight: parseFloat(maxWeight),
      minROI: parseFloat(minROI),
      maxBudget: parseFloat(maxBudget),
      tax: parseFloat(tax),
    };

    // Fetch orders from both regions
    const [fromOrders, toOrders] = await Promise.all([
      fetchRegionOrders(fromLocation.regionId),
      fetchRegionOrders(toLocation.regionId),
    ]);

    // Calculate trading opportunities
    const trades = await calculateHaulingTrades(
      fromOrders,
      toOrders,
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

    return res.status(200).json(trades);
  } catch (error) {
    console.error('Hauling error:', error);
    return res.status(500).json({
      error: 'Failed to fetch hauling data',
      message: error.message
    });
  }
}
