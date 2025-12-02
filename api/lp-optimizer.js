/**
 * LP Store Optimizer API Endpoint
 * Calculates best ISK/LP conversion rates for loyalty point stores
 *
 * Query params:
 * - characterId: Character ID (required if using character LP balances)
 * - corporationId: Corporation ID to filter LP store offers
 * - regionId: Region ID for market prices (default: 10000002 - The Forge/Jita)
 * - minIskPerLp: Minimum ISK/LP threshold filter
 * - category: Item category filter
 *
 * Headers:
 * - Authorization: Bearer token for authenticated ESI calls (optional)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests
const JITA_REGION_ID = 10000002; // Default to Jita for market prices

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
 * Fetch character LP balances from ESI
 */
async function fetchCharacterLPBalances(characterId, token) {
  if (!token) {
    throw new Error('Authorization token required for character LP balances');
  }

  const url = `${ESI_BASE}/characters/${characterId}/loyalty/points/?datasource=tranquility`;
  const response = await fetchWithTimeout(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Missing required scope: esi-characters.read_loyalty.v1');
    }
    throw new Error(`Failed to fetch LP balances: HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch LP store offers for a corporation
 */
async function fetchLPStoreOffers(corporationId) {
  const url = `${ESI_BASE}/loyalty/stores/${corporationId}/offers/?datasource=tranquility`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 404) {
      return []; // Corporation has no LP store
    }
    throw new Error(`Failed to fetch LP store offers: HTTP ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch market orders for multiple items in a region
 */
async function fetchMarketPrices(regionId, typeIds) {
  if (typeIds.length === 0) return {};

  const prices = {};
  const uniqueTypeIds = [...new Set(typeIds)];

  // Batch fetch market orders for all types
  // We'll fetch them individually but in parallel to avoid ESI limitations
  const batchSize = 10;
  for (let i = 0; i < uniqueTypeIds.length; i += batchSize) {
    const batch = uniqueTypeIds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (typeId) => {
        try {
          const url = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=sell&type_id=${typeId}`;
          const response = await fetchWithTimeout(url);

          if (response.ok) {
            const orders = await response.json();
            if (orders.length > 0) {
              // Get lowest sell price
              const lowestSell = orders.reduce((min, o) => (o.price < min ? o.price : min), Infinity);
              prices[typeId] = lowestSell;
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch market price for type ${typeId}:`, error.message);
          // Don't fail the entire request, just skip this item
        }
      })
    );
  }

  return prices;
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
 * Calculate ISK/LP ratio for an LP store offer
 */
function calculateIskPerLP(offer, marketPrices, requiredItemPrices) {
  const { type_id, quantity, lp_cost, isk_cost, required_items } = offer;

  // Get sell price of the output item
  const sellPrice = marketPrices[type_id];
  if (!sellPrice || sellPrice === Infinity) {
    return null; // Can't calculate without market price
  }

  // Calculate revenue from selling the output
  const revenue = sellPrice * quantity;

  // Calculate cost of required items
  let requiredItemsCost = 0;
  if (required_items && required_items.length > 0) {
    for (const item of required_items) {
      const itemPrice = requiredItemPrices[item.type_id];
      if (!itemPrice || itemPrice === Infinity) {
        // Can't calculate if we don't have prices for required items
        return null;
      }
      requiredItemsCost += itemPrice * item.quantity;
    }
  }

  // Calculate net profit
  const netProfit = revenue - isk_cost - requiredItemsCost;

  // Calculate ISK per LP
  if (lp_cost === 0) return null;
  const iskPerLP = netProfit / lp_cost;

  return {
    iskPerLP,
    revenue,
    totalCost: isk_cost + requiredItemsCost,
    netProfit,
    isk_cost,
    requiredItemsCost,
  };
}

/**
 * Process LP store offers and calculate conversions
 */
async function processLPOffers(offers, regionId, minIskPerLp) {
  if (offers.length === 0) return [];

  // Collect all type IDs we need prices for (output items + required items)
  const outputTypeIds = offers.map((o) => o.type_id);
  const requiredTypeIds = offers
    .flatMap((o) => o.required_items || [])
    .map((item) => item.type_id);

  const allTypeIds = [...new Set([...outputTypeIds, ...requiredTypeIds])];

  // Fetch market prices
  const marketPrices = await fetchMarketPrices(regionId, allTypeIds);

  // Fetch item names
  const itemNames = await getItemNames(allTypeIds);

  // Calculate ISK/LP for each offer
  const conversions = [];

  for (const offer of offers) {
    const calculation = calculateIskPerLP(offer, marketPrices, marketPrices);

    if (!calculation) continue; // Skip if we couldn't calculate

    const { iskPerLP, revenue, totalCost, netProfit, isk_cost, requiredItemsCost } = calculation;

    // Apply minimum threshold filter
    if (minIskPerLp !== null && iskPerLP < minIskPerLp) continue;

    // Get required items details
    const requiredItems = (offer.required_items || []).map((item) => ({
      type_id: item.type_id,
      name: itemNames[item.type_id] || `Unknown Item #${item.type_id}`,
      quantity: item.quantity,
      price: marketPrices[item.type_id] || 0,
      totalCost: (marketPrices[item.type_id] || 0) * item.quantity,
    }));

    conversions.push({
      offer_id: offer.offer_id,
      type_id: offer.type_id,
      item_name: itemNames[offer.type_id] || `Unknown Item #${offer.type_id}`,
      quantity: offer.quantity,
      lp_cost: offer.lp_cost,
      isk_cost: offer.isk_cost,
      required_items: requiredItems,
      analysis: {
        sell_price: marketPrices[offer.type_id],
        revenue,
        total_cost: totalCost,
        net_profit: netProfit,
        isk_per_lp: Math.round(iskPerLP * 100) / 100,
        roi: totalCost > 0 ? Math.round(((netProfit / totalCost) * 100) * 100) / 100 : 0,
      },
    });
  }

  // Sort by ISK/LP descending
  conversions.sort((a, b) => b.analysis.isk_per_lp - a.analysis.isk_per_lp);

  return conversions;
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
    const { characterId, corporationId, regionId, minIskPerLp, category } = req.query;
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Validate corporationId (required)
    const corpId = validateInt(corporationId, 'corporationId', 1);
    if (!corpId) {
      return res.status(400).json({
        error: 'Corporation ID is required',
        hint: 'Provide a corporation ID to view their LP store offers'
      });
    }

    // Validate optional parameters
    const charId = characterId ? validateInt(characterId, 'characterId', 1) : null;
    const regId = regionId ? validateInt(regionId, 'regionId', 1) : JITA_REGION_ID;
    const minIskPerLpValue = minIskPerLp ? validateFloat(minIskPerLp, 'minIskPerLp', 0, Infinity, null) : null;

    // Fetch character LP balance if characterId provided
    let lpBalance = null;
    if (charId) {
      try {
        const balances = await fetchCharacterLPBalances(charId, token);
        const corpBalance = balances.find(b => b.corporation_id === corpId);
        lpBalance = corpBalance ? corpBalance.loyalty_points : 0;
      } catch (error) {
        console.warn(`[${requestId}] Failed to fetch LP balance:`, error.message);
        // Don't fail the request, just skip LP balance
      }
    }

    // Fetch LP store offers
    const offers = await fetchLPStoreOffers(corpId);

    if (offers.length === 0) {
      return res.status(200).json({
        corporation_id: corpId,
        lp_balance: lpBalance,
        conversions: [],
        message: 'No LP store offers found for this corporation',
      });
    }

    // Process offers and calculate conversions
    const conversions = await processLPOffers(offers, regId, minIskPerLpValue);

    // Set cache headers (LP stores don't change often, market prices update every 5 min)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

    return res.status(200).json({
      corporation_id: corpId,
      lp_balance: lpBalance,
      region_id: regId,
      conversions: conversions.slice(0, 100), // Limit to top 100
      total_offers: offers.length,
      calculated_offers: conversions.length,
    });
  } catch (error) {
    console.error(`[${requestId}] LP Optimizer error:`, error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Failed to calculate LP conversions',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
