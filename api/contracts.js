/**
 * Contracts API Endpoint
 * Finds profitable contract opportunities from public contracts
 *
 * Query params:
 * - regionId: Region ID to search (default: 10000002 - The Forge/Jita)
 * - contractType: Contract type filter (all, item_exchange, courier, auction)
 * - minProfit: Minimum profit threshold
 * - maxCollateral: Maximum collateral for courier contracts
 * - maxVolume: Maximum volume in m³ (for filtering courier contracts)
 * - minRewardPerJump: Minimum ISK per jump for courier contracts
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests
const CACHE_MAX_SIZE = 5000; // Maximum cache entries

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
const locationCache = new LRUCache(CACHE_MAX_SIZE);
const routeCache = new LRUCache(CACHE_MAX_SIZE);
const marketPriceCache = new LRUCache(CACHE_MAX_SIZE);

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
 * Fetch all pages in parallel with batching
 */
async function fetchPagesInParallel(baseUrl, maxPages, hasPageParam = true) {
  const batchSize = 10;
  const allData = [];
  const errors = [];

  for (let batchStart = 1; batchStart <= maxPages; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, maxPages);
    const pageNumbers = [];
    for (let p = batchStart; p <= batchEnd; p++) {
      pageNumbers.push(p);
    }

    const batchResults = await Promise.allSettled(
      pageNumbers.map(async (page) => {
        const url = hasPageParam ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}` : baseUrl;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      })
    );

    for (let i = 0; i < batchResults.length; i++) {
      const result = batchResults[i];
      if (result.status === 'fulfilled') {
        allData.push(...(Array.isArray(result.value) ? result.value : [result.value]));
      } else {
        errors.push({ page: pageNumbers[i], error: result.reason?.message || 'Unknown error' });
      }
    }
  }

  return { data: allData, errors };
}

/**
 * Fetch public contracts for a region
 */
async function fetchPublicContracts(regionId) {
  const url = `${ESI_BASE}/contracts/public/${regionId}/?datasource=tranquility`;

  // Get first page to determine total pages
  const firstResponse = await fetchWithTimeout(url);

  if (!firstResponse.ok) {
    throw new Error(`ESI API error: ${firstResponse.status}`);
  }

  const totalPages = parseInt(firstResponse.headers.get('x-pages') || '1', 10);
  const maxPages = Math.min(totalPages, 20); // Limit to 20 pages to avoid timeouts

  // Fetch all pages in parallel
  const result = await fetchPagesInParallel(url, maxPages, true);

  if (result.errors.length > 0) {
    console.warn(`Region ${regionId} contract fetch errors:`, result.errors.slice(0, 5));
  }

  return result.data;
}

/**
 * Fetch contract items for item_exchange contracts
 */
async function fetchContractItems(contractId) {
  try {
    const url = `${ESI_BASE}/contracts/public/items/${contractId}/?datasource=tranquility`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch items for contract ${contractId}:`, error.message);
    return [];
  }
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

    // Fetch volumes for uncached items (in batches)
    const volumeBatch = uncached.slice(0, 50); // Limit to 50 to avoid too many requests
    await Promise.allSettled(
      volumeBatch.map(async (typeId) => {
        if (!typeInfoCache.has(typeId)) {
          await getTypeInfo(typeId);
        }
      })
    );
  }

  // Return map of type info
  const result = {};
  for (const id of uniqueIds) {
    result[id] = typeInfoCache.get(id) || { volume: 0.01, name: `Item #${id}` };
  }
  return result;
}

/**
 * Get location name (station or structure)
 */
async function getLocationName(locationId) {
  const cached = locationCache.get(locationId);
  if (cached) {
    return cached;
  }

  try {
    let name;
    // Check if it's an NPC station (ID < 100000000) or structure
    if (locationId < 100000000) {
      const response = await fetchWithTimeout(`${ESI_BASE}/universe/stations/${locationId}/?datasource=tranquility`);
      if (response.ok) {
        const data = await response.json();
        name = data.name;
      }
    } else {
      // Structure - requires auth, so just use generic name
      name = `Structure #${locationId}`;
    }

    if (!name) {
      name = `Location #${locationId}`;
    }

    locationCache.set(locationId, name);
    return name;
  } catch {
    return `Location #${locationId}`;
  }
}

/**
 * Calculate route distance between two systems
 */
async function getRouteDistance(originSystemId, destSystemId, routeSafety = 'shortest') {
  const cacheKey = `${originSystemId}-${destSystemId}-${routeSafety}`;
  const cached = routeCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const flagMap = {
      'shortest': 'shortest',
      'secure': 'secure',
      'insecure': 'insecure'
    };
    const flag = flagMap[routeSafety] || 'shortest';

    const url = `${ESI_BASE}/route/${originSystemId}/${destSystemId}/?datasource=tranquility&flag=${flag}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      routeCache.set(cacheKey, 0);
      return 0;
    }

    const route = await response.json();
    const jumps = Array.isArray(route) ? route.length : 0;

    routeCache.set(cacheKey, jumps);
    return jumps;
  } catch {
    routeCache.set(cacheKey, 0);
    return 0;
  }
}

/**
 * Get market price for an item (average of buy/sell)
 */
async function getMarketPrice(regionId, typeId) {
  const cacheKey = `${regionId}-${typeId}`;
  const cached = marketPriceCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const url = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&type_id=${typeId}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      marketPriceCache.set(cacheKey, 0);
      return 0;
    }

    const orders = await response.json();

    // Get best buy and sell prices
    const buyOrders = orders.filter(o => o.is_buy_order);
    const sellOrders = orders.filter(o => !o.is_buy_order);

    const bestBuy = buyOrders.length > 0
      ? Math.max(...buyOrders.map(o => o.price))
      : 0;
    const bestSell = sellOrders.length > 0
      ? Math.min(...sellOrders.map(o => o.price))
      : 0;

    // Use sell price as market value (what you'd pay to buy)
    const price = bestSell > 0 ? bestSell : bestBuy;

    marketPriceCache.set(cacheKey, price);
    return price;
  } catch {
    marketPriceCache.set(cacheKey, 0);
    return 0;
  }
}

/**
 * Analyze item_exchange contracts for profitability
 */
async function analyzeItemExchangeContracts(contracts, regionId, minProfit) {
  const opportunities = [];

  // Filter to item_exchange contracts
  const itemContracts = contracts.filter(c => c.type === 'item_exchange');

  // Fetch items for all contracts in batches
  const contractsWithItems = await Promise.allSettled(
    itemContracts.slice(0, 100).map(async (contract) => {
      const items = await fetchContractItems(contract.contract_id);
      return { contract, items };
    })
  );

  // Get all unique type IDs
  const allTypeIds = new Set();
  contractsWithItems.forEach(result => {
    if (result.status === 'fulfilled' && result.value.items) {
      result.value.items.forEach(item => allTypeIds.add(item.type_id));
    }
  });

  // Batch fetch type info
  const typeInfo = await batchGetTypeInfo([...allTypeIds]);

  // Analyze each contract
  for (const result of contractsWithItems) {
    if (result.status !== 'fulfilled') continue;

    const { contract, items } = result.value;

    if (!items || items.length === 0) continue;

    // Calculate total market value
    let totalMarketValue = 0;
    let totalVolume = 0;
    const itemDetails = [];

    for (const item of items) {
      const info = typeInfo[item.type_id] || { volume: 0.01, name: `Item #${item.type_id}` };
      const quantity = item.quantity || 1;
      const marketPrice = await getMarketPrice(regionId, item.type_id);

      totalMarketValue += marketPrice * quantity;
      totalVolume += info.volume * quantity;

      itemDetails.push({
        name: info.name,
        quantity,
        marketPrice,
        totalValue: marketPrice * quantity,
      });
    }

    const contractPrice = contract.price || 0;
    const profit = totalMarketValue - contractPrice;
    const profitPercent = contractPrice > 0 ? (profit / contractPrice) * 100 : 0;

    // Only include profitable contracts
    if (profit >= minProfit) {
      const startLocation = await getLocationName(contract.start_location_id);

      opportunities.push({
        'Contract ID': contract.contract_id,
        'Type': 'Item Exchange',
        'Location': startLocation,
        'Items': items.length,
        'Contract Price': Math.round(contractPrice),
        'Market Value': Math.round(totalMarketValue),
        'Profit': Math.round(profit),
        'Profit %': Math.round(profitPercent * 10) / 10,
        'Volume': Math.round(totalVolume * 10) / 10,
        'Days to Complete': contract.days_to_complete,
        'Expires': new Date(contract.date_expired).toISOString().split('T')[0],
        'itemDetails': itemDetails.slice(0, 10), // Top 10 items
      });
    }
  }

  return opportunities;
}

/**
 * Analyze courier contracts for profitability
 */
async function analyzeCourierContracts(contracts, maxCollateral, maxVolume, minRewardPerJump) {
  const opportunities = [];

  // Filter to courier contracts
  const courierContracts = contracts.filter(c =>
    c.type === 'courier' &&
    c.collateral <= maxCollateral &&
    c.volume <= maxVolume
  );

  // Analyze each contract
  for (const contract of courierContracts.slice(0, 100)) {
    // Calculate route if both locations are known
    const jumps = await getRouteDistance(
      contract.start_location_id,
      contract.end_location_id
    );

    if (jumps === 0) continue; // Skip if route can't be calculated

    const reward = contract.reward || 0;
    const rewardPerJump = jumps > 0 ? reward / jumps : 0;
    const rewardPerM3 = contract.volume > 0 ? reward / contract.volume : 0;
    const collateralRatio = reward > 0 ? contract.collateral / reward : 0;

    // Filter by minimum reward per jump
    if (rewardPerJump < minRewardPerJump) continue;

    const startLocation = await getLocationName(contract.start_location_id);
    const endLocation = await getLocationName(contract.end_location_id);

    opportunities.push({
      'Contract ID': contract.contract_id,
      'Type': 'Courier',
      'From': startLocation,
      'To': endLocation,
      'Reward': Math.round(reward),
      'Collateral': Math.round(contract.collateral),
      'Volume': Math.round(contract.volume * 10) / 10,
      'Jumps': jumps,
      'ISK/Jump': Math.round(rewardPerJump),
      'ISK/m³': Math.round(rewardPerM3),
      'Collateral Ratio': Math.round(collateralRatio * 100) / 100,
      'Days to Complete': contract.days_to_complete,
      'Expires': new Date(contract.date_expired).toISOString().split('T')[0],
    });
  }

  return opportunities;
}

/**
 * Analyze auction contracts
 */
async function analyzeAuctionContracts(contracts, regionId, minProfit) {
  const opportunities = [];

  // Filter to auction contracts
  const auctionContracts = contracts.filter(c => c.type === 'auction');

  // Similar to item_exchange, fetch items and calculate value
  const contractsWithItems = await Promise.allSettled(
    auctionContracts.slice(0, 50).map(async (contract) => {
      const items = await fetchContractItems(contract.contract_id);
      return { contract, items };
    })
  );

  const allTypeIds = new Set();
  contractsWithItems.forEach(result => {
    if (result.status === 'fulfilled' && result.value.items) {
      result.value.items.forEach(item => allTypeIds.add(item.type_id));
    }
  });

  const typeInfo = await batchGetTypeInfo([...allTypeIds]);

  for (const result of contractsWithItems) {
    if (result.status !== 'fulfilled') continue;

    const { contract, items } = result.value;

    if (!items || items.length === 0) continue;

    let totalMarketValue = 0;
    let totalVolume = 0;

    for (const item of items) {
      const info = typeInfo[item.type_id] || { volume: 0.01, name: `Item #${item.type_id}` };
      const quantity = item.quantity || 1;
      const marketPrice = await getMarketPrice(regionId, item.type_id);

      totalMarketValue += marketPrice * quantity;
      totalVolume += info.volume * quantity;
    }

    const currentBid = contract.price || 0; // Current highest bid or starting price
    const buyout = contract.buyout || 0;

    // Calculate potential profit vs buyout
    const profitVsBuyout = buyout > 0 ? totalMarketValue - buyout : 0;
    const profitVsCurrentBid = totalMarketValue - currentBid;

    if (profitVsBuyout >= minProfit || profitVsCurrentBid >= minProfit) {
      const location = await getLocationName(contract.start_location_id);

      opportunities.push({
        'Contract ID': contract.contract_id,
        'Type': 'Auction',
        'Location': location,
        'Items': items.length,
        'Current Bid': Math.round(currentBid),
        'Buyout': Math.round(buyout),
        'Market Value': Math.round(totalMarketValue),
        'Profit (Buyout)': Math.round(profitVsBuyout),
        'Profit (Current)': Math.round(profitVsCurrentBid),
        'Volume': Math.round(totalVolume * 10) / 10,
        'Days to Complete': contract.days_to_complete,
        'Expires': new Date(contract.date_expired).toISOString().split('T')[0],
      });
    }
  }

  return opportunities;
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
      regionId = '10000002', // The Forge (Jita) by default
      contractType = 'all',
      minProfit = '1000000',
      maxCollateral = '1000000000',
      maxVolume = '30000',
      minRewardPerJump = '1000000',
    } = req.query;

    // Validate parameters
    const params = {
      regionId: validateInt(regionId, 'regionId', 1, 99999999, 10000002),
      contractType: ['all', 'item_exchange', 'courier', 'auction'].includes(contractType)
        ? contractType
        : 'all',
      minProfit: validateFloat(minProfit, 'minProfit', 0, 1e15, 1000000),
      maxCollateral: validateFloat(maxCollateral, 'maxCollateral', 0, 1e15, 1000000000),
      maxVolume: validateFloat(maxVolume, 'maxVolume', 0, 1e9, 30000),
      minRewardPerJump: validateFloat(minRewardPerJump, 'minRewardPerJump', 0, 1e15, 1000000),
    };

    console.log(`[${requestId}] Fetching contracts for region ${params.regionId}, type: ${params.contractType}`);

    // Fetch public contracts
    const contracts = await fetchPublicContracts(params.regionId);

    console.log(`[${requestId}] Found ${contracts.length} contracts`);

    let opportunities = [];

    // Analyze contracts based on type
    if (params.contractType === 'all' || params.contractType === 'item_exchange') {
      const itemOpps = await analyzeItemExchangeContracts(
        contracts,
        params.regionId,
        params.minProfit
      );
      opportunities.push(...itemOpps);
      console.log(`[${requestId}] Found ${itemOpps.length} item_exchange opportunities`);
    }

    if (params.contractType === 'all' || params.contractType === 'courier') {
      const courierOpps = await analyzeCourierContracts(
        contracts,
        params.maxCollateral,
        params.maxVolume,
        params.minRewardPerJump
      );
      opportunities.push(...courierOpps);
      console.log(`[${requestId}] Found ${courierOpps.length} courier opportunities`);
    }

    if (params.contractType === 'all' || params.contractType === 'auction') {
      const auctionOpps = await analyzeAuctionContracts(
        contracts,
        params.regionId,
        params.minProfit
      );
      opportunities.push(...auctionOpps);
      console.log(`[${requestId}] Found ${auctionOpps.length} auction opportunities`);
    }

    // Sort by profit descending
    opportunities.sort((a, b) => {
      const profitA = a['Profit'] || a['Profit (Current)'] || a['ISK/Jump'] || 0;
      const profitB = b['Profit'] || b['Profit (Current)'] || b['ISK/Jump'] || 0;
      return profitB - profitA;
    });

    // Limit results
    opportunities = opportunities.slice(0, 500);

    console.log(`[${requestId}] Returning ${opportunities.length} total opportunities`);

    // Set cache headers (contracts update every 5 minutes in EVE)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

    return res.status(200).json(opportunities);
  } catch (error) {
    console.error(`[${requestId}] Contracts error:`, error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Failed to fetch contract data',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
