/**
 * Cross-Region Arbitrage Scanner API Endpoint
 * Finds profitable price discrepancies across multiple regions
 *
 * Query params:
 * - regions: Comma-separated region IDs (default: major trade hubs)
 * - minProfit: Minimum profit per unit
 * - minROI: Minimum return on investment (%)
 * - maxVolume: Maximum m³ per item (for cargo constraints)
 * - minDepth: Minimum order depth (number of orders on each side)
 * - maxBudget: Maximum budget for buying
 * - tax: Sales tax rate (decimal)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests
const TYPE_CACHE_MAX_SIZE = 2000; // Maximum entries in type info cache

// Major trade hub regions (default)
const DEFAULT_REGIONS = ['10000002', '10000043', '10000032', '10000030']; // Jita, Amarr, Dodixie, Rens

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

// Cache for region names
const regionNameCache = new LRUCache(100);

/**
 * Validate and parse numeric parameter
 */
function validateFloat(value, paramName, min = 0, max = Infinity, defaultValue = null) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num) || num < min || num > max) {
    return defaultValue;
  }
  return num;
}

function validateInt(value, paramName, min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue = null) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
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
 * Fetch pages in parallel with a limit
 */
async function fetchPagesInParallel(baseUrl, maxPages) {
  const batchSize = 10;
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

  // Limit pages (30 each = 60 total requests per region)
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
 * Fetch multiple regions in parallel
 */
async function fetchMultipleRegions(regionIds) {
  const results = await Promise.allSettled(
    regionIds.map(regionId => fetchRegionOrders(regionId))
  );

  const regionData = {};
  const allErrors = [];

  for (let i = 0; i < results.length; i++) {
    const regionId = regionIds[i];
    const result = results[i];

    if (result.status === 'fulfilled') {
      regionData[regionId] = result.value.orders;
      allErrors.push(...result.value.errors);
    } else {
      console.error(`Failed to fetch region ${regionId}:`, result.reason);
      allErrors.push({ region: regionId, error: result.reason?.message || 'Unknown error' });
      regionData[regionId] = [];
    }
  }

  return { regionData, errors: allErrors };
}

/**
 * Batch fetch type info for multiple type IDs
 */
async function batchGetTypeInfo(typeIds) {
  const uniqueIds = [...new Set(typeIds)];
  const uncached = uniqueIds.filter(id => !typeInfoCache.has(id));

  // Fetch names and volumes in batch
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

    // Fetch volumes for uncached items (sample first 100)
    const volumeNeeded = uncached.slice(0, 100);
    const volumeResults = await Promise.allSettled(
      volumeNeeded.map(async (typeId) => {
        const response = await fetchWithTimeout(`${ESI_BASE}/universe/types/${typeId}/?datasource=tranquility`);
        if (!response.ok) return { typeId, volume: 0.01 };
        const data = await response.json();
        return { typeId, volume: data.packaged_volume || data.volume || 0.01 };
      })
    );

    for (const result of volumeResults) {
      if (result.status === 'fulfilled') {
        const { typeId, volume } = result.value;
        const cached = typeInfoCache.get(typeId);
        if (cached) {
          cached.volume = volume;
          typeInfoCache.set(typeId, cached);
        } else {
          typeInfoCache.set(typeId, { volume, name: `Item #${typeId}` });
        }
      }
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
 * Fetch region name from ESI
 */
async function getRegionName(regionId) {
  const cached = regionNameCache.get(regionId);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(`${ESI_BASE}/universe/regions/${regionId}/?datasource=tranquility`);
    if (response.ok) {
      const data = await response.json();
      regionNameCache.set(regionId, data.name);
      return data.name;
    }
  } catch (e) {
    console.warn(`Failed to fetch region ${regionId} name:`, e.message);
  }
  return `Region #${regionId}`;
}

/**
 * Calculate order depth risk score
 * Lower score = higher risk (thin orderbook)
 * Higher score = lower risk (deep orderbook)
 */
function calculateRiskScore(buyOrders, sellOrders) {
  const buyDepth = buyOrders.length;
  const sellDepth = sellOrders.length;
  const totalVolume = buyOrders.reduce((sum, o) => sum + o.volume_remain, 0) +
                     sellOrders.reduce((sum, o) => sum + o.volume_remain, 0);

  // Score from 0-100
  const depthScore = Math.min((buyDepth + sellDepth) / 20 * 50, 50);
  const volumeScore = Math.min(totalVolume / 10000 * 50, 50);

  return Math.round(depthScore + volumeScore);
}

/**
 * Find arbitrage opportunities across regions
 */
async function findArbitrageOpportunities(regionData, params) {
  const { minProfit, minROI, maxVolume, minDepth, maxBudget, tax } = params;
  const regionIds = Object.keys(regionData);

  // Group orders by type and region
  const ordersByType = {};

  for (const regionId of regionIds) {
    const orders = regionData[regionId];

    for (const order of orders) {
      const typeId = order.type_id;

      if (!ordersByType[typeId]) {
        ordersByType[typeId] = {};
      }

      if (!ordersByType[typeId][regionId]) {
        ordersByType[typeId][regionId] = { buy: [], sell: [] };
      }

      if (order.is_buy_order) {
        ordersByType[typeId][regionId].buy.push(order);
      } else {
        ordersByType[typeId][regionId].sell.push(order);
      }
    }
  }

  // Filter to types that exist in multiple regions
  const multiRegionTypes = Object.keys(ordersByType).filter(typeId => {
    const regions = Object.keys(ordersByType[typeId]);
    return regions.length >= 2;
  });

  // Fetch type info
  const typeInfo = await batchGetTypeInfo(multiRegionTypes.map(t => parseInt(t)));

  const opportunities = [];

  // For each type, find arbitrage opportunities between region pairs
  for (const typeId of multiRegionTypes) {
    const regions = Object.keys(ordersByType[typeId]);
    const info = typeInfo[typeId];

    // Skip items that are too large
    if (info.volume > maxVolume) continue;

    // Check all region pairs
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const regionA = regions[i];
        const regionB = regions[j];

        const ordersA = ordersByType[typeId][regionA];
        const ordersB = ordersByType[typeId][regionB];

        // Check if we have sufficient order depth
        const depthA = ordersA.buy.length + ordersA.sell.length;
        const depthB = ordersB.buy.length + ordersB.sell.length;

        if (depthA < minDepth || depthB < minDepth) continue;

        // Find best buy and sell prices in each region
        const bestSellA = ordersA.sell.length > 0 ?
          ordersA.sell.reduce((min, o) => o.price < min.price ? o : min, ordersA.sell[0]) : null;
        const bestBuyA = ordersA.buy.length > 0 ?
          ordersA.buy.reduce((max, o) => o.price > max.price ? o : max, ordersA.buy[0]) : null;

        const bestSellB = ordersB.sell.length > 0 ?
          ordersB.sell.reduce((min, o) => o.price < min.price ? o : min, ordersB.sell[0]) : null;
        const bestBuyB = ordersB.buy.length > 0 ?
          ordersB.buy.reduce((max, o) => o.price > max.price ? o : max, ordersB.buy[0]) : null;

        // Check both directions for arbitrage
        // Direction 1: Buy in A, Sell in B
        if (bestSellA && bestBuyB && bestBuyB.price > bestSellA.price) {
          const buyPrice = bestSellA.price;
          const sellPrice = bestBuyB.price;

          const maxByBudget = Math.floor(maxBudget / buyPrice);
          const maxBySupply = bestSellA.volume_remain;
          const maxByDemand = bestBuyB.volume_remain;

          const quantity = Math.min(maxByBudget, maxBySupply, maxByDemand);

          if (quantity > 0) {
            const totalBuyCost = buyPrice * quantity;
            const totalSellRevenue = sellPrice * quantity;
            const salesTaxAmount = totalSellRevenue * tax;
            const profit = totalSellRevenue - totalBuyCost - salesTaxAmount;
            const profitPerUnit = profit / quantity;

            if (profitPerUnit >= minProfit) {
              const roi = (profit / totalBuyCost) * 100;

              if (roi >= minROI) {
                const riskScore = calculateRiskScore(ordersA.buy, ordersA.sell) +
                                 calculateRiskScore(ordersB.buy, ordersB.sell);

                opportunities.push({
                  'Item ID': parseInt(typeId),
                  'Item': info.name,
                  'Buy Region': regionA,
                  'Sell Region': regionB,
                  'Buy Price': Math.round(buyPrice * 100) / 100,
                  'Sell Price': Math.round(sellPrice * 100) / 100,
                  'Profit per Unit': Math.round(profitPerUnit * 100) / 100,
                  'Total Profit': Math.round(profit),
                  'Quantity': quantity,
                  'Volume (m³)': Math.round(info.volume * quantity * 100) / 100,
                  'ROI': Math.round(roi * 10) / 10,
                  'Risk Score': Math.round(riskScore / 2), // Average of both regions
                  'Order Depth': `${ordersA.sell.length}/${ordersB.buy.length}`,
                  'Investment': Math.round(totalBuyCost),
                });
              }
            }
          }
        }

        // Direction 2: Buy in B, Sell in A
        if (bestSellB && bestBuyA && bestBuyA.price > bestSellB.price) {
          const buyPrice = bestSellB.price;
          const sellPrice = bestBuyA.price;

          const maxByBudget = Math.floor(maxBudget / buyPrice);
          const maxBySupply = bestSellB.volume_remain;
          const maxByDemand = bestBuyA.volume_remain;

          const quantity = Math.min(maxByBudget, maxBySupply, maxByDemand);

          if (quantity > 0) {
            const totalBuyCost = buyPrice * quantity;
            const totalSellRevenue = sellPrice * quantity;
            const salesTaxAmount = totalSellRevenue * tax;
            const profit = totalSellRevenue - totalBuyCost - salesTaxAmount;
            const profitPerUnit = profit / quantity;

            if (profitPerUnit >= minProfit) {
              const roi = (profit / totalBuyCost) * 100;

              if (roi >= minROI) {
                const riskScore = calculateRiskScore(ordersB.buy, ordersB.sell) +
                                 calculateRiskScore(ordersA.buy, ordersA.sell);

                opportunities.push({
                  'Item ID': parseInt(typeId),
                  'Item': info.name,
                  'Buy Region': regionB,
                  'Sell Region': regionA,
                  'Buy Price': Math.round(buyPrice * 100) / 100,
                  'Sell Price': Math.round(sellPrice * 100) / 100,
                  'Profit per Unit': Math.round(profitPerUnit * 100) / 100,
                  'Total Profit': Math.round(profit),
                  'Quantity': quantity,
                  'Volume (m³)': Math.round(info.volume * quantity * 100) / 100,
                  'ROI': Math.round(roi * 10) / 10,
                  'Risk Score': Math.round(riskScore / 2), // Average of both regions
                  'Order Depth': `${ordersB.sell.length}/${ordersA.buy.length}`,
                  'Investment': Math.round(totalBuyCost),
                });
              }
            }
          }
        }
      }
    }
  }

  // Sort by total profit descending
  opportunities.sort((a, b) => b['Total Profit'] - a['Total Profit']);

  return opportunities.slice(0, 500);
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
      regions: regionsParam,
      minProfit = '1000',
      minROI = '5',
      maxVolume = '60000',
      minDepth = '3',
      maxBudget = '1000000000',
      tax = '0.08',
    } = req.query;

    // Parse regions
    const regions = regionsParam ?
      regionsParam.split(',').map(r => r.trim()).filter(r => r) :
      DEFAULT_REGIONS;

    // Validate regions
    const validRegions = regions.filter(r => {
      const id = parseInt(r, 10);
      return !isNaN(id) && id > 0;
    });

    if (validRegions.length < 2) {
      return res.status(400).json({ error: 'At least 2 valid regions required for arbitrage scanning' });
    }

    // Validate and parse numeric parameters
    const params = {
      minProfit: validateFloat(minProfit, 'minProfit', 0, 1e15, 1000),
      minROI: validateFloat(minROI, 'minROI', 0, 10000, 5),
      maxVolume: validateFloat(maxVolume, 'maxVolume', 0, 1e9, 60000),
      minDepth: validateInt(minDepth, 'minDepth', 1, 1000, 3),
      maxBudget: validateFloat(maxBudget, 'maxBudget', 0, 1e15, 1000000000),
      tax: validateFloat(tax, 'tax', 0, 1, 0.08),
    };

    console.log(`[${requestId}] Scanning ${validRegions.length} regions for arbitrage opportunities`);

    // Fetch orders from all regions in parallel
    const { regionData, errors } = await fetchMultipleRegions(validRegions);

    if (errors.length > 0) {
      console.warn(`[${requestId}] Fetch errors:`, errors.slice(0, 5));
    }

    // Find arbitrage opportunities
    const opportunities = await findArbitrageOpportunities(regionData, params);

    // Fetch region names for display
    const regionNames = {};
    for (const regionId of validRegions) {
      regionNames[regionId] = await getRegionName(regionId);
    }

    // Update opportunities with region names
    for (const opp of opportunities) {
      opp['Buy Region'] = regionNames[opp['Buy Region']] || opp['Buy Region'];
      opp['Sell Region'] = regionNames[opp['Sell Region']] || opp['Sell Region'];
    }

    console.log(`[${requestId}] Found ${opportunities.length} arbitrage opportunities`);

    // Set cache headers (market data updates every 5 minutes in EVE)
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');

    return res.status(200).json(opportunities);
  } catch (error) {
    console.error(`[${requestId}] Arbitrage error:`, error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Failed to fetch arbitrage data',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
