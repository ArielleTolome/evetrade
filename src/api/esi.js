/**
 * EVE Online ESI API Client
 * Handles all ESI API calls with authentication
 */

const ESI_BASE_URL = 'https://esi.evetech.net/latest';

/**
 * Make authenticated ESI API call
 */
async function esiRequest(endpoint, accessToken, options = {}) {
  const url = `${ESI_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ESI Error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get character public information
 */
export async function getCharacterInfo(characterId) {
  return esiRequest(`/characters/${characterId}/`);
}

/**
 * Get character portrait URLs
 */
export async function getCharacterPortrait(characterId) {
  return esiRequest(`/characters/${characterId}/portrait/`);
}

/**
 * Get corporation public information
 */
export async function getCorporationInfo(corporationId) {
  return esiRequest(`/corporations/${corporationId}/`);
}

/**
 * Get alliance public information
 */
export async function getAllianceInfo(allianceId) {
  return esiRequest(`/alliances/${allianceId}/`);
}

/**
 * Get character wallet balance
 */
export async function getWalletBalance(characterId, accessToken) {
  return esiRequest(`/characters/${characterId}/wallet/`, accessToken);
}

/**
 * Get character wallet transactions
 */
export async function getWalletTransactions(characterId, accessToken) {
  return esiRequest(`/characters/${characterId}/wallet/transactions/`, accessToken);
}

/**
 * Get character wallet journal
 */
export async function getWalletJournal(characterId, accessToken, page = 1) {
  return esiRequest(`/characters/${characterId}/wallet/journal/?page=${page}`, accessToken);
}

/**
 * Get character market orders
 */
export async function getCharacterOrders(characterId, accessToken) {
  return esiRequest(`/characters/${characterId}/orders/`, accessToken);
}

/**
 * Get character order history
 */
export async function getCharacterOrderHistory(characterId, accessToken, page = 1) {
  return esiRequest(`/characters/${characterId}/orders/history/?page=${page}`, accessToken);
}

/**
 * Get character assets
 */
export async function getCharacterAssets(characterId, accessToken, page = 1) {
  return esiRequest(`/characters/${characterId}/assets/?page=${page}`, accessToken);
}

/**
 * Get character skills
 */
export async function getCharacterSkills(characterId, accessToken) {
  return esiRequest(`/characters/${characterId}/skills/`, accessToken);
}

/**
 * Get character standings
 */
export async function getCharacterStandings(characterId, accessToken) {
  return esiRequest(`/characters/${characterId}/standings/`, accessToken);
}

/**
 * Get type information (item details)
 */
export async function getTypeInfo(typeId) {
  return esiRequest(`/universe/types/${typeId}/`);
}

/**
 * Get station information
 */
export async function getStationInfo(stationId) {
  return esiRequest(`/universe/stations/${stationId}/`);
}

/**
 * Get structure information (requires auth for player structures)
 */
export async function getStructureInfo(structureId, accessToken) {
  return esiRequest(`/universe/structures/${structureId}/`, accessToken);
}

/**
 * Get solar system information
 */
export async function getSystemInfo(systemId) {
  return esiRequest(`/universe/systems/${systemId}/`);
}

/**
 * Get constellation information
 */
export async function getConstellationInfo(constellationId) {
  return esiRequest(`/universe/constellations/${constellationId}/`);
}

/**
 * Get region information
 */
export async function getRegionInfo(regionId) {
  return esiRequest(`/universe/regions/${regionId}/`);
}

/**
 * Get region ID from solar system ID (requires chained lookups)
 * Returns { regionId, regionName, systemName, constellationName }
 */
export async function getRegionFromSystem(systemId) {
  try {
    // Get system info to find constellation
    const systemInfo = await getSystemInfo(systemId);
    if (!systemInfo?.constellation_id) return null;

    // Get constellation info to find region
    const constellationInfo = await getConstellationInfo(systemInfo.constellation_id);
    if (!constellationInfo?.region_id) return null;

    // Get region info for name
    const regionInfo = await getRegionInfo(constellationInfo.region_id);

    return {
      regionId: constellationInfo.region_id,
      regionName: regionInfo?.name || null,
      systemName: systemInfo.name,
      constellationName: constellationInfo.name,
    };
  } catch (err) {
    console.warn(`Failed to get region from system ${systemId}:`, err);
    return null;
  }
}

/**
 * Get market prices (all items)
 */
export async function getMarketPrices() {
  return esiRequest('/markets/prices/');
}

/**
 * Batch get type names
 */
export async function getTypeNames(typeIds) {
  if (typeIds.length === 0) return [];

  // ESI limits to 1000 IDs per request
  const chunks = [];
  for (let i = 0; i < typeIds.length; i += 1000) {
    chunks.push(typeIds.slice(i, i + 1000));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      fetch(`${ESI_BASE_URL}/universe/names/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      }).then((r) => r.json())
    )
  );

  return results.flat();
}

/**
 * Get market history for a type in a region
 */
export async function getMarketHistory(regionId, typeId) {
  return esiRequest(`/markets/${regionId}/history/?type_id=${typeId}`);
}

/**
 * Get market orders for a type in a region
 * Returns all buy and sell orders for the specified item
 * @param {number} regionId - Region ID
 * @param {number} typeId - Type ID of the item
 * @param {string} orderType - 'all', 'buy', or 'sell' (default: 'all')
 * @returns {Promise<Array>} Array of market orders
 */
export async function getMarketOrders(regionId, typeId, orderType = 'all') {
  const orders = await esiRequest(
    `/markets/${regionId}/orders/?type_id=${typeId}&order_type=${orderType}`
  );
  return orders;
}

/**
 * Analyze market orders to get competition data
 * @param {Array} orders - Array of market orders from getMarketOrders
 * @param {number} stationId - Optional station ID to filter orders
 * @returns {Object} Competition analysis data
 */
export function analyzeMarketOrders(orders, stationId = null) {
  let filteredOrders = orders;
  if (stationId) {
    filteredOrders = orders.filter(o => o.location_id === stationId);
  }

  const buyOrders = filteredOrders.filter(o => o.is_buy_order);
  const sellOrders = filteredOrders.filter(o => !o.is_buy_order);

  // Sort by price
  buyOrders.sort((a, b) => b.price - a.price);  // Highest buy first
  sellOrders.sort((a, b) => a.price - b.price); // Lowest sell first

  // Get best prices
  const bestBuyPrice = buyOrders[0]?.price || 0;
  const bestSellPrice = sellOrders[0]?.price || 0;

  // Count orders at best price (competition)
  const buyersAtBestPrice = buyOrders.filter(o => o.price === bestBuyPrice).length;
  const sellersAtBestPrice = sellOrders.filter(o => o.price === bestSellPrice).length;

  // Calculate total volume available
  const totalBuyVolume = buyOrders.reduce((sum, o) => sum + o.volume_remain, 0);
  const totalSellVolume = sellOrders.reduce((sum, o) => sum + o.volume_remain, 0);

  // Price walls (orders with > 10% of total volume at a price point)
  const buyWalls = findPriceWalls(buyOrders, totalBuyVolume);
  const sellWalls = findPriceWalls(sellOrders, totalSellVolume);

  // Calculate spread
  const spread = bestSellPrice > 0 && bestBuyPrice > 0
    ? ((bestSellPrice - bestBuyPrice) / bestSellPrice) * 100
    : 0;

  return {
    buyOrders: buyOrders.length,
    sellOrders: sellOrders.length,
    bestBuyPrice,
    bestSellPrice,
    buyersAtBestPrice,
    sellersAtBestPrice,
    totalBuyVolume,
    totalSellVolume,
    buyWalls,
    sellWalls,
    spread,
    competitionLevel: getCompetitionLevel(buyersAtBestPrice, sellersAtBestPrice),
  };
}

/**
 * Find price walls in order book
 */
function findPriceWalls(orders, totalVolume) {
  const priceGroups = {};
  orders.forEach(order => {
    const price = order.price;
    if (!priceGroups[price]) {
      priceGroups[price] = 0;
    }
    priceGroups[price] += order.volume_remain;
  });

  const walls = [];
  const threshold = totalVolume * 0.1; // 10% of total volume

  Object.entries(priceGroups).forEach(([price, volume]) => {
    if (volume >= threshold) {
      walls.push({
        price: parseFloat(price),
        volume,
        percentage: (volume / totalVolume) * 100,
      });
    }
  });

  return walls;
}

/**
 * Determine competition level
 */
function getCompetitionLevel(buyers, sellers) {
  const total = buyers + sellers;
  if (total <= 2) return 'low';
  if (total <= 5) return 'medium';
  if (total <= 10) return 'high';
  return 'extreme';
}

/**
 * Calculate trading taxes based on skills and standings
 */
export function calculateTradingTaxes(skills, standings) {
  // Find Accounting skill (reduces sales tax)
  const accountingSkill = skills?.skills?.find((s) => s.skill_id === 16622);
  const accountingLevel = accountingSkill?.active_skill_level || 0;

  // Find Broker Relations skill (reduces broker fee)
  const brokerRelationsSkill = skills?.skills?.find((s) => s.skill_id === 3446);
  const brokerRelationsLevel = brokerRelationsSkill?.active_skill_level || 0;

  // Base rates
  const baseSalesTax = 0.08; // 8%
  const baseBrokerFee = 0.03; // 3%

  // Calculate actual rates
  const salesTax = baseSalesTax * (1 - 0.11 * accountingLevel);

  // Broker fee is more complex, depends on standings
  let brokerFee = baseBrokerFee - (0.003 * brokerRelationsLevel);

  // Apply standings bonus if available
  if (standings) {
    const corpStanding = Math.max(0, standings.corpStanding || 0);
    const factionStanding = Math.max(0, standings.factionStanding || 0);
    const standingBonus = 0.0003 * corpStanding + 0.0002 * factionStanding;
    brokerFee = Math.max(0.01, brokerFee - standingBonus);
  }

  return {
    salesTax,
    brokerFee,
    totalFees: salesTax + brokerFee * 2, // Broker fee paid on both buy and sell
    accountingLevel,
    brokerRelationsLevel,
  };
}

export default {
  getCharacterInfo,
  getCharacterPortrait,
  getCorporationInfo,
  getAllianceInfo,
  getWalletBalance,
  getWalletTransactions,
  getWalletJournal,
  getCharacterOrders,
  getCharacterOrderHistory,
  getCharacterAssets,
  getCharacterSkills,
  getCharacterStandings,
  getTypeInfo,
  getStationInfo,
  getStructureInfo,
  getSystemInfo,
  getConstellationInfo,
  getRegionInfo,
  getRegionFromSystem,
  getMarketPrices,
  getTypeNames,
  getMarketHistory,
  getMarketOrders,
  analyzeMarketOrders,
  calculateTradingTaxes,
};
