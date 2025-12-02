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
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests

/**
 * Validate and parse an integer parameter
 * @returns {number|null} Parsed integer or null if invalid
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
async function fetchWithTimeout(url, timeoutMs = ESI_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
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
 * Format: "regionId:stationId" (may have preference prefix like "buy-" or "sell-")
 * @returns {object|null} Parsed location or null if invalid
 */
function parseLocation(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') return null;

  let rest = locationStr;

  // Remove preference prefix if present
  if (locationStr.startsWith('buy-')) {
    rest = locationStr.slice(4);
  } else if (locationStr.startsWith('sell-')) {
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
  let errors = [];

  while (hasMore) {
    try {
      const response = await fetchWithTimeout(`${url}&page=${page}`);

      if (!response.ok) {
        if (response.status === 404) break;
        errors.push(`Page ${page}: HTTP ${response.status}`);
        break;
      }

      const orders = await response.json();
      allOrders.push(...orders);

      const totalPages = parseInt(response.headers.get('x-pages') || '1', 10);
      hasMore = page < totalPages;
      page++;

      // Safety limit
      if (page > 10) break;
    } catch (error) {
      errors.push(`Page ${page}: ${error.message}`);
      break;
    }
  }

  if (errors.length > 0 && allOrders.length === 0) {
    throw new Error(`Failed to fetch orders: ${errors.join(', ')}`);
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
    const { itemId, from, to } = req.query;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    // Validate itemId is a positive integer
    const typeId = validateInt(itemId, 'itemId', 1);
    if (typeId === null) {
      return res.status(400).json({ error: 'Invalid Item ID: must be a positive integer' });
    }

    const fromLocation = parseLocation(from);
    const toLocation = parseLocation(to);

    if (!fromLocation) {
      return res.status(400).json({ error: 'From location is required and must be valid (format: regionId:stationId)' });
    }

    // Fetch orders from both regions (may be the same region)
    const regionsToFetch = new Set([fromLocation.regionId]);
    if (toLocation && toLocation.regionId !== fromLocation.regionId) {
      regionsToFetch.add(toLocation.regionId);
    }

    const ordersByRegion = {};
    const fetchErrors = [];

    await Promise.all(
      Array.from(regionsToFetch).map(async (regionId) => {
        try {
          ordersByRegion[regionId] = await fetchItemOrders(regionId, typeId);
        } catch (error) {
          fetchErrors.push({ regionId, error: error.message });
          ordersByRegion[regionId] = [];
        }
      })
    );

    // Log errors if any occurred but we still have some data
    if (fetchErrors.length > 0) {
      console.warn(`[${requestId}] Partial fetch errors:`, fetchErrors);
    }

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

    // Set cache headers (market data updates every 5 minutes in EVE)
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');

    return res.status(200).json({
      from: fromBuyOrders,
      to: toSellOrders,
    });
  } catch (error) {
    console.error(`[${requestId}] Orders error:`, error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Failed to fetch order data',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
