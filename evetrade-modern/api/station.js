/**
 * Station Trading API Endpoint
 * Finds profitable margin trading opportunities within a single station
 *
 * Query params:
 * - station: Station ID
 * - profit: Minimum profit threshold
 * - tax: Sales tax rate (decimal)
 * - min_volume: Minimum daily volume
 * - fee: Broker fee rate (decimal)
 * - margins: "marginAbove,marginBelow" (percentages as decimals)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';

// Station ID to Region ID mapping (common stations)
const STATION_REGIONS = {
  // Jita
  60003760: 10000002, // Jita IV - Moon 4 - Caldari Navy Assembly Plant
  // Amarr
  60008494: 10000043, // Amarr VIII (Oris) - Emperor Family Academy
  // Dodixie
  60011866: 10000032, // Dodixie IX - Moon 20 - Federation Navy Assembly Plant
  // Rens
  60004588: 10000030, // Rens VI - Moon 8 - Brutor Tribe Treasury
  // Hek
  60005686: 10000042, // Hek VIII - Moon 12 - Boundless Creation Factory
};

/**
 * Fetch pages in parallel with a limit
 */
async function fetchPagesInParallel(baseUrl, maxPages) {
  const batchSize = 20;
  const allOrders = [];

  for (let batchStart = 1; batchStart <= maxPages; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize - 1, maxPages);
    const pageNumbers = [];
    for (let p = batchStart; p <= batchEnd; p++) {
      pageNumbers.push(p);
    }

    const batchResults = await Promise.all(
      pageNumbers.map(async (page) => {
        try {
          const response = await fetch(`${baseUrl}&page=${page}`);
          if (response.ok) {
            return await response.json();
          }
          return [];
        } catch {
          return [];
        }
      })
    );

    for (const orders of batchResults) {
      allOrders.push(...orders);
    }
  }

  return allOrders;
}

/**
 * Fetch market orders from ESI for a region (parallel fetching)
 * Fetches buy and sell orders separately to avoid pagination issues
 */
async function fetchRegionOrders(regionId, typeId = null) {
  let buyUrl = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=buy`;
  let sellUrl = `${ESI_BASE}/markets/${regionId}/orders/?datasource=tranquility&order_type=sell`;

  if (typeId) {
    buyUrl += `&type_id=${typeId}`;
    sellUrl += `&type_id=${typeId}`;
  }

  // Get total pages for each order type
  const [buyFirstResponse, sellFirstResponse] = await Promise.all([
    fetch(`${buyUrl}&page=1`),
    fetch(`${sellUrl}&page=1`)
  ]);

  if (!buyFirstResponse.ok || !sellFirstResponse.ok) {
    throw new Error(`ESI API error`);
  }

  const buyTotalPages = parseInt(buyFirstResponse.headers.get('x-pages') || '1');
  const sellTotalPages = parseInt(sellFirstResponse.headers.get('x-pages') || '1');

  // Limit pages (60 each = 120 total requests max)
  const maxBuyPages = Math.min(buyTotalPages, 60);
  const maxSellPages = Math.min(sellTotalPages, 60);

  // Fetch both buy and sell orders in parallel
  const [buyOrders, sellOrders] = await Promise.all([
    fetchPagesInParallel(buyUrl, maxBuyPages),
    fetchPagesInParallel(sellUrl, maxSellPages)
  ]);

  return [...buyOrders, ...sellOrders];
}

/**
 * Fetch region ID for a station from ESI
 */
async function getStationRegion(stationId) {
  // Check cache first
  if (STATION_REGIONS[stationId]) {
    return STATION_REGIONS[stationId];
  }

  // Fetch from ESI
  const response = await fetch(`${ESI_BASE}/universe/stations/${stationId}/?datasource=tranquility`);
  if (!response.ok) {
    throw new Error(`Could not find station ${stationId}`);
  }

  const data = await response.json();
  const systemId = data.system_id;

  // Get system info to find region
  const systemResponse = await fetch(`${ESI_BASE}/universe/systems/${systemId}/?datasource=tranquility`);
  if (!systemResponse.ok) {
    throw new Error(`Could not find system for station ${stationId}`);
  }

  const systemData = await systemResponse.json();
  const constellationId = systemData.constellation_id;

  // Get constellation to find region
  const constResponse = await fetch(`${ESI_BASE}/universe/constellations/${constellationId}/?datasource=tranquility`);
  if (!constResponse.ok) {
    throw new Error(`Could not find constellation ${constellationId}`);
  }

  const constData = await constResponse.json();
  return constData.region_id;
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
    const response = await fetch(`${ESI_BASE}/universe/names/?datasource=tranquility`, {
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
  }

  return names;
}

/**
 * Calculate station trading opportunities
 */
function calculateTrades(orders, stationId, params) {
  const { minProfit, tax, minVolume, brokerFee, marginAbove, marginBelow } = params;

  // Filter orders for this station (ensure numeric comparison)
  const stationIdNum = parseInt(stationId);
  const stationOrders = orders.filter(o => o.location_id === stationIdNum);

  // Group by type_id
  const ordersByType = {};
  for (const order of stationOrders) {
    if (!ordersByType[order.type_id]) {
      ordersByType[order.type_id] = { buy: [], sell: [] };
    }
    if (order.is_buy_order) {
      ordersByType[order.type_id].buy.push(order);
    } else {
      ordersByType[order.type_id].sell.push(order);
    }
  }

  const trades = [];

  for (const [typeId, typeOrders] of Object.entries(ordersByType)) {
    const { buy, sell } = typeOrders;

    if (buy.length === 0 || sell.length === 0) continue;

    // Best buy order (highest price - existing buy orders you'd compete with)
    const highestBuy = buy.reduce((max, o) => o.price > max.price ? o : max, buy[0]);
    // Best sell order (lowest price - existing sell orders you'd compete with)
    const lowestSell = sell.reduce((min, o) => o.price < min.price ? o : min, sell[0]);

    // For station trading (margin trading):
    // You place a buy order slightly above the highest current buy (to get filled first)
    // Then place a sell order slightly below the lowest current sell (to get filled first)
    // Your profit is the spread minus fees

    // The "buy price" is what you'd pay (just above highest buy order)
    // The "sell price" is what you'd receive (just below lowest sell order)
    const buyPrice = highestBuy.price * 1.0001; // Place buy order 0.01% above best buy
    const sellPrice = lowestSell.price * 0.9999; // Place sell order 0.01% below best sell

    // Skip if no margin (your buy price must be lower than your sell price)
    if (buyPrice >= sellPrice) continue;

    // Calculate fees and profit
    const buyFee = buyPrice * brokerFee;
    const sellFee = sellPrice * brokerFee;
    const salesTax = sellPrice * tax;

    const profitPerUnit = sellPrice - buyPrice - buyFee - sellFee - salesTax;

    if (profitPerUnit <= 0) continue;

    // Calculate margin
    const grossMargin = ((sellPrice - buyPrice) / buyPrice) * 100;

    // Apply margin filters
    if (grossMargin < marginAbove || grossMargin > marginBelow) continue;

    // Volume is based on market depth - use minimum of buy/sell volume
    const volume = Math.min(highestBuy.volume_remain, lowestSell.volume_remain);

    // Calculate net profit (profit * volume)
    const netProfit = profitPerUnit * volume;

    if (netProfit < minProfit) continue;

    trades.push({
      'Item ID': parseInt(typeId),
      'Item': `Item #${typeId}`, // Will be replaced with actual name
      'Buy Price': Math.round(buyPrice * 100) / 100,
      'Sell Price': Math.round(sellPrice * 100) / 100,
      'Volume': volume,
      'Profit per Unit': Math.round(profitPerUnit * 100) / 100,
      'Net Profit': Math.round(netProfit * 100) / 100,
      'Gross Margin': Math.round(grossMargin * 100) / 100,
    });
  }

  // Sort by net profit descending
  trades.sort((a, b) => b['Net Profit'] - a['Net Profit']);

  return trades.slice(0, 500);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { station, profit, tax, min_volume, fee, margins } = req.query;

    if (!station) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    const stationId = parseInt(station);
    const minProfit = parseFloat(profit) || 1000000;
    const salesTax = parseFloat(tax) || 0.08;
    const minVolume = parseInt(min_volume) || 1;
    const brokerFee = parseFloat(fee) || 0.03;

    // Parse margins (format: "above,below")
    let marginAbove = 0.05;
    let marginBelow = 0.50;
    if (margins) {
      const [above, below] = margins.split(',').map(parseFloat);
      marginAbove = (above || 0.05) * 100; // Convert to percentage
      marginBelow = (below || 0.50) * 100;
    }

    // Get region for this station
    const regionId = await getStationRegion(stationId);

    // Fetch all market orders for the region
    const orders = await fetchRegionOrders(regionId);

    // Calculate trading opportunities
    const trades = calculateTrades(orders, stationId, {
      minProfit,
      tax: salesTax,
      minVolume,
      brokerFee,
      marginAbove,
      marginBelow,
    });

    // Fetch item names
    const typeIds = trades.map(t => t['Item ID']);
    const names = await getItemNames(typeIds);

    // Update trades with item names
    for (const trade of trades) {
      trade['Item'] = names[trade['Item ID']] || `Unknown Item #${trade['Item ID']}`;
    }

    return res.status(200).json(trades);
  } catch (error) {
    console.error('Station trading error:', error);
    return res.status(500).json({
      error: 'Failed to fetch trading data',
      message: error.message
    });
  }
}
