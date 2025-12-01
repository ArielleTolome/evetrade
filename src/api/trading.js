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
  systemSecurity,
  routeSafety,
}) {
  const queryParams = new URLSearchParams({
    from: from,
    to: to,
    minProfit: minProfit,
    maxWeight: maxWeight,
    minROI: minROI,
    maxBudget: maxBudget,
    tax: tax,
    systemSecurity: systemSecurity,
    routeSafety: routeSafety,
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
  systemSecurity,
  structureType,
  routeSafety,
}) {
  const queryParams = new URLSearchParams({
    from: from,
    to: to,
    minProfit: minProfit,
    maxWeight: maxWeight,
    minROI: minROI,
    maxBudget: maxBudget,
    tax: tax,
    systemSecurity: systemSecurity,
    structureType: structureType,
    routeSafety: routeSafety,
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
