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
  calculateTradingTaxes,
};
