/**
 * Planetary Interaction (PI) Optimizer API Endpoint
 * Analyzes PI material chains and identifies profitable opportunities
 *
 * Query params:
 * - regionId: Region ID for market prices (default: 10000002 - The Forge/Jita)
 * - tier: PI tier filter (all, P0, P1, P2, P3, P4)
 * - minProfit: Minimum profit per unit (default: 0)
 * - minROI: Minimum ROI percentage (default: 0)
 * - minVolume: Minimum daily volume (default: 0)
 * - characterId: Optional character ID for personalized PI analysis
 *
 * Headers:
 * - Authorization: Bearer {access_token} (optional, for character-specific data)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests
const CACHE_MAX_SIZE = 2000; // Maximum cache entries

/**
 * PI Material Type IDs organized by tier
 * Based on EVE Online SDE data
 */
const PI_MATERIALS = {
  P0: {
    // Raw materials (extracted from planets)
    name: 'Raw Materials',
    typeIds: [
      2267, // Aqueous Liquids
      2268, // Base Metals
      2269, // Carbon Compounds
      2270, // Complex Organisms
      2272, // Micro Organisms
      2286, // Noble Gas
      2287, // Noble Metals
      2288, // Non-CS Crystals
      2305, // Felsic Magma
      2306, // Heavy Metals
      2307, // Ionic Solutions
      2308, // Reactive Gas
      2309, // Suspended Plasma
      2310, // Planktic Colonies
      2311, // Autotrophs
    ],
  },
  P1: {
    // Processed materials (first tier processing)
    name: 'Processed Materials',
    typeIds: [
      2389, // Bacteria
      2390, // Biofuels
      2392, // Biomass
      2393, // Chiral Structures
      2395, // Electrolytes
      2396, // Industrial Fibers
      2397, // Oxidizing Compound
      2398, // Oxygen
      2399, // Plasmoids
      2400, // Precious Metals
      2401, // Proteins
      2463, // Reactive Metals
      2327, // Toxic Metals
      9828, // Silicon
      3645, // Water
    ],
  },
  P2: {
    // Refined materials (second tier processing)
    name: 'Refined Materials',
    typeIds: [
      2312, // Biocells
      2317, // Construction Blocks
      2321, // Consumer Electronics
      2328, // Coolant
      2329, // Enriched Uranium
      2344, // Fertilizer
      2345, // Genetically Enhanced Livestock
      2346, // Livestock
      2348, // Mechanical Parts
      2349, // Microfiber Shielding
      2350, // Miniature Electronics
      2351, // Nanites
      2352, // Oxides
      2354, // Polyaramids
      2355, // Polytextiles
      2356, // Rocket Fuel
      2357, // Silicon
      2358, // Superconductors
      2359, // Supertensile Plastics
      2360, // Synthetic Oil
      2361, // Test Cultures
      2366, // Transmitter
      2367, // Viral Agent
      2368, // Water-Cooled CPU
    ],
  },
  P3: {
    // Specialized materials (third tier processing)
    name: 'Specialized Materials',
    typeIds: [
      2469, // Biotech Research Reports
      2470, // Camera Drones
      2471, // Condensates
      2472, // Cryoprotectant Solution
      9836, // Data Chips
      2473, // Gel-Matrix Biopaste
      9838, // Guidance Systems
      2474, // Hazmat Detection Systems
      2475, // Hermetic Membranes
      9839, // High-Tech Transmitters
      2476, // Industrial Explosives
      9840, // Neocoms
      2477, // Nuclear Reactors
      2478, // Planetary Vehicles
      9842, // Robotics
      9843, // Smartfab Units
      9846, // Supercomputers
      9847, // Synthetic Synapses
      9848, // Transcranial Microcontrollers
      9849, // Ukomi Superconductors
      2479, // Vaccines
    ],
  },
  P4: {
    // Advanced materials (fourth tier processing)
    name: 'Advanced Materials',
    typeIds: [
      2867, // Broadcast Node
      2868, // Integrity Response Drones
      2869, // Nano-Factory
      2870, // Organic Mortar Applicators
      2871, // Recursive Computing Module
      2872, // Self-Harmonizing Power Core
      2875, // Sterile Conduits
      2876, // Wetware Mainframe
    ],
  },
};

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

// Caches
const typeInfoCache = new LRUCache(CACHE_MAX_SIZE);
const marketOrdersCache = new LRUCache(CACHE_MAX_SIZE);

/**
 * Validate and parse an integer parameter
 */
function validateInt(value, paramName, min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue = null) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
    return defaultValue;
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
 * Fetch type information from ESI
 */
async function getTypeInfo(typeId) {
  const cached = typeInfoCache.get(typeId);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithTimeout(`${ESI_BASE}/universe/types/${typeId}/?datasource=tranquility`);
    if (!response.ok) {
      return { volume: 0.01, name: `Item #${typeId}`, typeId };
    }

    const data = await response.json();
    const info = {
      volume: data.packaged_volume || data.volume || 0.01,
      name: data.name || `Item #${typeId}`,
      typeId: typeId,
    };

    typeInfoCache.set(typeId, info);
    return info;
  } catch {
    return { volume: 0.01, name: `Item #${typeId}`, typeId };
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
            typeInfoCache.set(item.id, { name: item.name, volume: 0.01, typeId: item.id });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to batch fetch names:', e.message);
    }

    // Fetch volumes for a sample (limit to avoid timeouts)
    const volumeSample = uncached.slice(0, 30);
    await Promise.allSettled(
      volumeSample.map(async (typeId) => {
        if (!typeInfoCache.has(typeId)) {
          await getTypeInfo(typeId);
        }
      })
    );
  }

  // Return map of type info
  const result = {};
  for (const id of uniqueIds) {
    result[id] = typeInfoCache.get(id) || { volume: 0.01, name: `Item #${id}`, typeId: id };
  }
  return result;
}

/**
 * Fetch market orders for a region and type
 */
async function fetchMarketOrders(regionId, typeId) {
  const cacheKey = `${regionId}-${typeId}`;
  const cached = marketOrdersCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&type_id=${typeId}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      if (response.status === 404) return { buy: [], sell: [] };
      throw new Error(`HTTP ${response.status}`);
    }

    const orders = await response.json();
    const buyOrders = orders.filter(o => o.is_buy_order);
    const sellOrders = orders.filter(o => !o.is_buy_order);

    const result = { buy: buyOrders, sell: sellOrders };
    marketOrdersCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`Failed to fetch orders for type ${typeId}:`, error.message);
    return { buy: [], sell: [] };
  }
}

/**
 * Calculate market statistics for a type
 */
function calculateMarketStats(orders) {
  const { buy, sell } = orders;

  // Best prices
  const bestBuyPrice = buy.length > 0 ? Math.max(...buy.map(o => o.price)) : 0;
  const bestSellPrice = sell.length > 0 ? Math.min(...sell.map(o => o.price)) : 0;

  // Total volumes
  const buyVolume = buy.reduce((sum, o) => sum + o.volume_remain, 0);
  const sellVolume = sell.reduce((sum, o) => sum + o.volume_remain, 0);

  // Spread
  const spread = bestSellPrice > 0 && bestBuyPrice > 0 ? bestSellPrice - bestBuyPrice : 0;
  const spreadPercent = bestBuyPrice > 0 ? (spread / bestBuyPrice) * 100 : 0;

  return {
    bestBuyPrice,
    bestSellPrice,
    buyVolume,
    sellVolume,
    totalOrders: buy.length + sell.length,
    spread,
    spreadPercent,
  };
}

/**
 * Analyze PI materials for profit opportunities
 */
async function analyzePIMaterials(regionId, tier, params) {
  const { minProfit, minROI, minVolume } = params;
  const opportunities = [];

  // Determine which tiers to analyze
  let tiersToAnalyze = [];
  if (tier === 'all') {
    tiersToAnalyze = ['P0', 'P1', 'P2', 'P3', 'P4'];
  } else {
    tiersToAnalyze = [tier];
  }

  // Collect all type IDs to analyze
  const typeIdsToAnalyze = [];
  for (const tierName of tiersToAnalyze) {
    if (PI_MATERIALS[tierName]) {
      typeIdsToAnalyze.push(...PI_MATERIALS[tierName].typeIds);
    }
  }

  // Batch fetch type info
  const typeInfo = await batchGetTypeInfo(typeIdsToAnalyze);

  // Fetch market data for each type
  for (const tierName of tiersToAnalyze) {
    if (!PI_MATERIALS[tierName]) continue;

    const tierData = PI_MATERIALS[tierName];
    const tierTypeIds = tierData.typeIds;

    for (const typeId of tierTypeIds) {
      try {
        const orders = await fetchMarketOrders(regionId, typeId);
        const stats = calculateMarketStats(orders);
        const info = typeInfo[typeId];

        // Skip if no market activity
        if (stats.bestSellPrice === 0 || stats.totalOrders === 0) continue;

        // Skip if below minimum volume
        if (stats.sellVolume < minVolume) continue;

        // Calculate potential profit (buy at sell price, sell at buy price)
        const profit = stats.bestBuyPrice - stats.bestSellPrice;
        const roi = stats.bestSellPrice > 0 ? (profit / stats.bestSellPrice) * 100 : 0;

        // Skip if below minimum thresholds
        if (profit < minProfit || roi < minROI) continue;

        // Calculate profit per m3
        const profitPerM3 = info.volume > 0 ? profit / info.volume : 0;

        // Determine liquidity rating
        let liquidity = 'Low';
        if (stats.sellVolume > 100000) liquidity = 'High';
        else if (stats.sellVolume > 10000) liquidity = 'Medium';

        opportunities.push({
          'Item ID': typeId,
          'Item': info.name,
          'Tier': tierName,
          'Tier Name': tierData.name,
          'Buy Price': Math.round(stats.bestBuyPrice * 100) / 100,
          'Sell Price': Math.round(stats.bestSellPrice * 100) / 100,
          'Spread': Math.round(stats.spread * 100) / 100,
          'Spread %': Math.round(stats.spreadPercent * 10) / 10,
          'Profit per Unit': Math.round(profit * 100) / 100,
          'ROI': Math.round(roi * 10) / 10,
          'Volume (m³)': Math.round(info.volume * 100) / 100,
          'Profit per m³': Math.round(profitPerM3),
          'Daily Sell Volume': stats.sellVolume,
          'Daily Buy Volume': stats.buyVolume,
          'Liquidity': liquidity,
          'Orders': stats.totalOrders,
        });

        // Limit results to avoid timeouts (analyze first 100 materials)
        if (opportunities.length >= 100) break;
      } catch (error) {
        console.warn(`Failed to analyze type ${typeId}:`, error.message);
        continue;
      }
    }

    if (opportunities.length >= 100) break;
  }

  // Sort by ROI descending
  opportunities.sort((a, b) => b['ROI'] - a['ROI']);

  return opportunities.slice(0, 100);
}

/**
 * Fetch character PI colonies (authenticated)
 */
async function fetchCharacterPlanets(characterId, accessToken) {
  try {
    const url = `${ESI_BASE}/characters/${characterId}/planets/?datasource=tranquility`;
    const response = await fetchWithTimeout(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch character planets: HTTP ${response.status}`);
      return [];
    }

    const planets = await response.json();
    return planets;
  } catch (error) {
    console.warn(`Failed to fetch character planets:`, error.message);
    return [];
  }
}

/**
 * Fetch detailed planet information
 */
async function fetchPlanetDetails(characterId, planetId, accessToken) {
  try {
    const url = `${ESI_BASE}/characters/${characterId}/planets/${planetId}/?datasource=tranquility`;
    const response = await fetchWithTimeout(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const details = await response.json();
    return details;
  } catch (error) {
    console.warn(`Failed to fetch planet details for ${planetId}:`, error.message);
    return null;
  }
}

/**
 * Analyze character's PI setup (authenticated feature)
 */
async function analyzeCharacterPI(characterId, accessToken, regionId) {
  const planets = await fetchCharacterPlanets(characterId, accessToken);

  if (!planets || planets.length === 0) {
    return {
      planets: [],
      total: 0,
      message: 'No PI colonies found for this character',
    };
  }

  const colonyInfo = [];

  // Fetch details for each planet (limited to first 10 to avoid timeout)
  const planetsToAnalyze = planets.slice(0, 10);

  for (const planet of planetsToAnalyze) {
    const details = await fetchPlanetDetails(characterId, planet.planet_id, accessToken);

    if (details) {
      colonyInfo.push({
        'Planet ID': planet.planet_id,
        'Planet Type': planet.planet_type,
        'Solar System ID': planet.solar_system_id,
        'Last Update': new Date(planet.last_update).toISOString(),
        'Num Pins': details.pins ? details.pins.length : 0,
        'Upgrade Level': planet.upgrade_level || 0,
      });
    }
  }

  return {
    planets: colonyInfo,
    total: planets.length,
    analyzed: colonyInfo.length,
  };
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
    const {
      regionId = '10000002', // Default to The Forge (Jita)
      tier = 'all',
      minProfit = '0',
      minROI = '0',
      minVolume = '0',
      characterId,
    } = req.query;

    // Validate tier parameter
    const validTiers = ['all', 'P0', 'P1', 'P2', 'P3', 'P4'];
    const selectedTier = validTiers.includes(tier) ? tier : 'all';

    // Validate numeric parameters
    const params = {
      regionId: validateInt(regionId, 'regionId', 1, 99999999, 10000002),
      minProfit: validateFloat(minProfit, 'minProfit', 0, 1e15, 0),
      minROI: validateFloat(minROI, 'minROI', 0, 10000, 0),
      minVolume: validateFloat(minVolume, 'minVolume', 0, 1e15, 0),
    };

    console.log(`[${requestId}] Analyzing PI materials for region ${params.regionId}, tier: ${selectedTier}`);

    // Analyze PI materials
    const opportunities = await analyzePIMaterials(params.regionId, selectedTier, params);

    let characterPIData = null;

    // If character ID provided and authenticated, fetch character PI data
    if (characterId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.substring(7);
        const charId = validateInt(characterId, 'characterId', 1);

        if (charId) {
          console.log(`[${requestId}] Fetching PI data for character ${charId}`);
          characterPIData = await analyzeCharacterPI(charId, accessToken, params.regionId);
        }
      }
    }

    // Set cache headers (PI market data updates every 5 minutes in EVE)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

    const response = {
      opportunities,
      total: opportunities.length,
      regionId: params.regionId,
      tier: selectedTier,
      requestId,
    };

    // Add character PI data if available
    if (characterPIData) {
      response.characterPI = characterPIData;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${requestId}] PI Optimizer error:`, error);

    // Handle specific ESI errors
    if (error.message.includes('403')) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You do not have the required ESI scopes. Please ensure you have authorized: esi-planets.manage_planets.v1',
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
      error: 'Failed to fetch PI data',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
