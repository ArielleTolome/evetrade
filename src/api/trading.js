import { fetchWithRetry } from './client';

/**
 * Fetch station trading data
 * @param {object} params - Trading parameters
 * @returns {Promise<array>} Trading opportunities
 */
export async function fetchStationTrading({
  stationId,
  minProfit,
  tax,
  minVolume,
  brokerFee,
  marginAbove,
  marginBelow,
}) {
  const queryParams = new URLSearchParams({
    station: stationId,
    profit: minProfit,
    tax: tax,
    min_volume: minVolume,
    fee: brokerFee,
    margins: `${marginAbove},${marginBelow}`,
  });

  const data = await fetchWithRetry(`/station?${queryParams.toString()}`);
  return data;
}

/**
 * Fetch station-to-station hauling data
 * @param {object} params - Hauling parameters
 * @returns {Promise<array>} Hauling opportunities
 */
export async function fetchStationHauling({
  from,
  to,
  minProfit,
  maxWeight,
  minROI,
  maxBudget,
  tax,
}) {
  const queryParams = new URLSearchParams({
    from: from,
    to: to,
    minProfit: minProfit,
    maxWeight: maxWeight,
    minROI: minROI,
    maxBudget: maxBudget,
    tax: tax,
  });

  const data = await fetchWithRetry(`/hauling?${queryParams.toString()}`);
  return data;
}

/**
 * Fetch region-to-region hauling data
 * @param {object} params - Hauling parameters
 * @returns {Promise<array>} Hauling opportunities
 */
export async function fetchRegionHauling({
  from,
  to,
  minProfit,
  maxWeight,
  minROI,
  maxBudget,
  tax,
}) {
  const queryParams = new URLSearchParams({
    from: from,
    to: to,
    minProfit: minProfit,
    maxWeight: maxWeight,
    minROI: minROI,
    maxBudget: maxBudget,
    tax: tax,
  });

  const data = await fetchWithRetry(`/hauling?${queryParams.toString()}`);
  return data;
}

/**
 * Fetch order depth data
 * @param {object} params - Order parameters
 * @returns {Promise<object>} Buy and sell orders
 */
export async function fetchOrders({ itemId, from, to }) {
  const queryParams = new URLSearchParams({
    itemId: itemId,
    from: from,
    to: to,
  });

  const data = await fetchWithRetry(`/orders?${queryParams.toString()}`);
  return data;
}

/**
 * Fetch cross-region arbitrage opportunities
 * @param {object} params - Arbitrage parameters
 * @returns {Promise<array>} Arbitrage opportunities
 */
export async function fetchArbitrage({
  regions = ['10000002', '10000043', '10000032', '10000030'],
  minProfit = 1000,
  minROI = 5,
  maxVolume = 60000,
  minDepth = 3,
  maxBudget = 1000000000,
  tax = 0.08,
}) {
  const queryParams = new URLSearchParams({
    regions: Array.isArray(regions) ? regions.join(',') : regions,
    minProfit: minProfit.toString(),
    minROI: minROI.toString(),
    maxVolume: maxVolume.toString(),
    minDepth: minDepth.toString(),
    maxBudget: maxBudget.toString(),
    tax: tax.toString(),
  });

  const data = await fetchWithRetry(`/arbitrage?${queryParams.toString()}`);
  return data;
}

/**
 * Fetch optimized route between systems
 * @param {object} params - Route parameters
 * @returns {Promise<object>} Route with risk analysis and statistics
 */
export async function fetchOptimizedRoute({
  origin,
  destination,
  preference = 'shortest',
  avoidSystems = [],
  cargoValue,
  calculateRisk = true,
}) {
  const queryParams = new URLSearchParams({
    origin: origin.toString(),
    destination: destination.toString(),
    preference: preference,
    calculateRisk: calculateRisk.toString(),
  });

  if (avoidSystems.length > 0) {
    queryParams.set('avoidSystems', avoidSystems.join(','));
  }

  if (cargoValue) {
    queryParams.set('cargoValue', cargoValue.toString());
  }

  const data = await fetchWithRetry(`/route-optimizer?${queryParams.toString()}`);
  return data;
}

/**
 * Fetch PI (Planetary Interaction) optimization data
 * @param {object} params - PI parameters
 * @returns {Promise<object>} PI opportunities and analysis
 */
export async function fetchPIOpportunities({
  regionId = 10000002,
  tier = 'all',
  minProfit = 0,
  minROI = 0,
  minVolume = 0,
  characterId,
  accessToken,
}) {
  const queryParams = new URLSearchParams({
    regionId: regionId.toString(),
    tier: tier,
  });

  if (minProfit > 0) {
    queryParams.append('minProfit', minProfit.toString());
  }

  if (minROI > 0) {
    queryParams.append('minROI', minROI.toString());
  }

  if (minVolume > 0) {
    queryParams.append('minVolume', minVolume.toString());
  }

  // Validate characterId is a valid positive integer before sending
  if (characterId) {
    const charIdNum = parseInt(characterId, 10);
    if (!isNaN(charIdNum) && charIdNum > 0 && Number.isFinite(charIdNum)) {
      queryParams.append('characterId', charIdNum.toString());
    }
  }

  const options = {};
  if (accessToken) {
    options.headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  const data = await fetchWithRetry(`/pi-optimizer?${queryParams.toString()}`, options);
  return data;
}
