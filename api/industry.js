/**
 * Industry Profits API Endpoint
 * Calculates profitability for character blueprints based on current market prices
 *
 * Query params:
 * - character_id: EVE Online character ID (required)
 * - region_id: Market region for price lookups (default: 10000002 - The Forge/Jita)
 * - min_profit: Minimum profit threshold (default: 0)
 * - min_roi: Minimum ROI percentage (default: 0)
 * - activity: Industry activity type (manufacturing, researching_time_efficiency, researching_material_efficiency, copying, invention, reaction)
 * - me_level: Filter by material efficiency level (0-10)
 *
 * Headers:
 * - Authorization: Bearer {access_token} (required for ESI authentication)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests

/**
 * Validate and parse an integer parameter
 */
function validateInt(value, paramName, min = 0, max = Number.MAX_SAFE_INTEGER) {
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
 * Fetch all pages of a paginated ESI endpoint
 */
async function fetchAllPages(endpoint, accessToken, maxPages = 10) {
  const results = [];
  let page = 1;
  let hasMore = true;
  const errors = [];

  while (hasMore && page <= maxPages) {
    try {
      const pageEndpoint = endpoint.includes('?')
        ? `${endpoint}&page=${page}`
        : `${endpoint}?page=${page}`;

      const response = await fetchWithTimeout(
        `${ESI_BASE}${pageEndpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) break; // No more pages
        errors.push(`Page ${page}: HTTP ${response.status}`);
        break;
      }

      const data = await response.json();
      results.push(...data);

      const totalPages = parseInt(response.headers.get('x-pages') || '1', 10);
      hasMore = page < totalPages;
      page++;
    } catch (error) {
      errors.push(`Page ${page}: ${error.message}`);
      break;
    }
  }

  if (errors.length > 0 && results.length === 0) {
    throw new Error(`Failed to fetch pages: ${errors.join(', ')}`);
  }

  return results;
}

/**
 * Fetch market orders for a type in a region
 */
async function fetchMarketOrders(regionId, typeId) {
  const url = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=sell&type_id=${typeId}`;

  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      if (response.status === 404) return []; // No orders
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch orders for type ${typeId}:`, error.message);
    return [];
  }
}

/**
 * Get best sell price from market orders
 */
function getBestSellPrice(orders) {
  if (!orders || orders.length === 0) return null;

  // Sort by price ascending and return lowest
  const sortedOrders = orders.sort((a, b) => a.price - b.price);
  return sortedOrders[0].price;
}

/**
 * Batch fetch type names from ESI
 */
async function getTypeNames(typeIds) {
  if (!typeIds || typeIds.length === 0) return {};

  const uniqueIds = [...new Set(typeIds)];
  const names = {};

  // ESI limits to 1000 IDs per request
  const chunks = [];
  for (let i = 0; i < uniqueIds.length; i += 1000) {
    chunks.push(uniqueIds.slice(i, i + 1000));
  }

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
      console.warn('Failed to batch fetch names:', error.message);
    }
  }

  return names;
}

/**
 * Calculate manufacturing costs and profits for blueprints
 */
async function calculateBlueprintProfits(blueprints, jobs, regionId, params) {
  const { meLevel } = params;

  const profitableBlueprints = [];
  const typeIdsToFetch = new Set();

  // Filter blueprints by ME level if specified
  let filteredBlueprints = blueprints;
  if (meLevel !== null) {
    filteredBlueprints = blueprints.filter(bp =>
      bp.material_efficiency === meLevel
    );
  }

  // Get unique blueprint type IDs for batch name lookup
  for (const bp of filteredBlueprints) {
    typeIdsToFetch.add(bp.type_id);
  }

  // Fetch blueprint names
  const blueprintNames = await getTypeNames([...typeIdsToFetch]);

  // For each blueprint, calculate profitability
  // Note: This is a simplified calculation. A full implementation would need:
  // 1. Blueprint details from SDE (materials required, product type, etc.)
  // 2. Material costs from market
  // 3. Job costs (installation fees, taxes)
  //
  // For now, we'll return blueprint data with market price of the blueprint itself
  for (const bp of filteredBlueprints) {
    try {
      // Get market orders for this blueprint
      const orders = await fetchMarketOrders(regionId, bp.type_id);
      const blueprintPrice = getBestSellPrice(orders);

      if (!blueprintPrice) continue;

      // Simplified profit calculation
      // In a real implementation, this would calculate:
      // - Material costs for manufacturing
      // - Output product market value
      // - Job installation costs
      // - Profit = (output value) - (material costs) - (job costs)

      const blueprintInfo = {
        'Blueprint ID': bp.item_id,
        'Blueprint Type ID': bp.type_id,
        'Blueprint Name': blueprintNames[bp.type_id] || `Blueprint #${bp.type_id}`,
        'Material Efficiency': bp.material_efficiency || 0,
        'Time Efficiency': bp.time_efficiency || 0,
        'Runs': bp.runs === -1 ? 'Original' : bp.runs,
        'Market Price': Math.round(blueprintPrice * 100) / 100,
        'Location ID': bp.location_id,
        'Location Flag': bp.location_flag,
        'Quantity': bp.quantity || 1,
      };

      profitableBlueprints.push(blueprintInfo);

      // Limit API calls - only process first 50 blueprints to avoid timeout
      if (profitableBlueprints.length >= 50) break;

    } catch (error) {
      console.warn(`Failed to process blueprint ${bp.type_id}:`, error.message);
      continue;
    }
  }

  // Sort by market price descending
  profitableBlueprints.sort((a, b) => b['Market Price'] - a['Market Price']);

  return profitableBlueprints;
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
    // Get access token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid ESI access token in the Authorization header'
      });
    }

    const accessToken = authHeader.substring(7);

    // Parse and validate query parameters
    const {
      character_id,
      region_id = '10000002', // Default to The Forge (Jita)
      min_profit = '0',
      min_roi = '0',
      activity,
      me_level,
    } = req.query;

    if (!character_id) {
      return res.status(400).json({ error: 'character_id is required' });
    }

    const characterId = validateInt(character_id, 'character_id', 1);
    if (characterId === null) {
      return res.status(400).json({ error: 'Invalid character_id: must be a positive integer' });
    }

    const regionId = validateInt(region_id, 'region_id', 1);
    if (regionId === null) {
      return res.status(400).json({ error: 'Invalid region_id: must be a positive integer' });
    }

    const params = {
      minProfit: validateFloat(min_profit, 'min_profit', 0, 1e15, 0),
      minROI: validateFloat(min_roi, 'min_roi', 0, 10000, 0),
      activity: activity || null,
      meLevel: me_level ? validateInt(me_level, 'me_level', 0, 10) : null,
    };

    console.log(`[${requestId}] Fetching blueprints for character ${characterId}`);

    // Fetch character blueprints and industry jobs in parallel
    const [blueprints, jobs] = await Promise.all([
      fetchAllPages(`/characters/${characterId}/blueprints/`, accessToken, 5),
      fetchAllPages(`/characters/${characterId}/industry/jobs/`, accessToken, 3).catch(err => {
        console.warn(`[${requestId}] Failed to fetch jobs:`, err.message);
        return []; // Jobs are optional
      }),
    ]);

    if (!blueprints || blueprints.length === 0) {
      return res.status(200).json({
        message: 'No blueprints found for this character',
        blueprints: [],
        total: 0,
      });
    }

    console.log(`[${requestId}] Found ${blueprints.length} blueprints, ${jobs.length} active jobs`);

    // Calculate profitability
    const profitableBlueprints = await calculateBlueprintProfits(
      blueprints,
      jobs,
      regionId,
      params
    );

    // Set cache headers (blueprint data updates rarely)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

    return res.status(200).json({
      blueprints: profitableBlueprints,
      total: profitableBlueprints.length,
      totalOwned: blueprints.length,
      activeJobs: jobs.length,
      requestId,
    });

  } catch (error) {
    console.error(`[${requestId}] Industry error:`, error);

    // Handle specific ESI errors
    if (error.message.includes('403')) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have the required ESI scopes. Please ensure you have authorized: esi-characters.read_blueprints.v1',
        requestId,
      });
    }

    if (error.message.includes('401')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Your access token may have expired. Please re-authenticate with ESI.',
        requestId,
      });
    }

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Failed to fetch industry data',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
