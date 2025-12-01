/**
 * Orders API Endpoint
 * Fetches market depth (buy/sell orders) for a specific item at locations
 *
 * Query params:
 * - itemId: Type ID of the item
 * - from: Origin location (format: "regionId:stationId")
 * - to: Destination location (same format)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';

/**
 * Parse location string into components
 * Format: "regionId:stationId" (may have preference prefix like "buy-" or "sell-")
 */
function parseLocation(locationStr) {
  if (!locationStr) return null;

  let rest = locationStr;

  // Remove preference prefix if present
  if (locationStr.startsWith('buy-')) {
    rest = locationStr.slice(4);
  } else if (locationStr.startsWith('sell-')) {
    rest = locationStr.slice(5);
  }

  const parts = rest.split(':');
  const regionId = parseInt(parts[0]);
  const stationId = parts[1] ? parseInt(parts[1]) : null;

  return { regionId, stationId };
}

/**
 * Fetch market orders for a specific item in a region
 */
async function fetchItemOrders(regionId, typeId) {
  const url = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=all&type_id=${typeId}`;

  const allOrders = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}&page=${page}`);

    if (!response.ok) {
      if (response.status === 404) break;
      throw new Error(`ESI API error: ${response.status}`);
    }

    const orders = await response.json();
    allOrders.push(...orders);

    const totalPages = parseInt(response.headers.get('x-pages') || '1');
    hasMore = page < totalPages;
    page++;

    // Safety limit
    if (page > 10) break;
  }

  return allOrders;
}

/**
 * Filter and format orders for a specific location
 */
function filterOrders(orders, stationId, isBuyOrder) {
  let filtered = orders.filter(o => o.is_buy_order === isBuyOrder);

  // Filter by station if specified
  if (stationId) {
    filtered = filtered.filter(o => o.location_id === stationId);
  }

  // Format for response
  return filtered.map(o => ({
    price: Math.round(o.price * 100) / 100,
    quantity: o.volume_remain,
    location_id: o.location_id,
    min_volume: o.min_volume,
  }));
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
    const { itemId, from, to } = req.query;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    const typeId = parseInt(itemId);
    const fromLocation = parseLocation(from);
    const toLocation = parseLocation(to);

    if (!fromLocation) {
      return res.status(400).json({ error: 'From location is required' });
    }

    // Fetch orders from both regions (may be the same region)
    const regionsToFetch = new Set([fromLocation.regionId]);
    if (toLocation && toLocation.regionId !== fromLocation.regionId) {
      regionsToFetch.add(toLocation.regionId);
    }

    const ordersByRegion = {};
    await Promise.all(
      Array.from(regionsToFetch).map(async (regionId) => {
        ordersByRegion[regionId] = await fetchItemOrders(regionId, typeId);
      })
    );

    // Get orders for "from" location (buy orders - what you can sell to)
    const fromOrders = ordersByRegion[fromLocation.regionId] || [];
    const fromBuyOrders = filterOrders(fromOrders, fromLocation.stationId, true);

    // Get orders for "to" location (sell orders - what you can buy from)
    // If same location (station trading), use same orders
    let toOrders = fromOrders;
    let toStationId = fromLocation.stationId;

    if (toLocation) {
      toOrders = ordersByRegion[toLocation.regionId] || [];
      toStationId = toLocation.stationId;
    }

    const toSellOrders = filterOrders(toOrders, toStationId, false);

    return res.status(200).json({
      from: fromBuyOrders,
      to: toSellOrders,
    });
  } catch (error) {
    console.error('Orders error:', error);
    return res.status(500).json({
      error: 'Failed to fetch order data',
      message: error.message
    });
  }
}
