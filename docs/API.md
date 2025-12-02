# API Reference

This document covers the API endpoints and client-side API functions used in EVETrade.

## Overview

EVETrade uses three types of API calls:

1. **EVETrade API** - Serverless functions for trading calculations
2. **EVE ESI API** - Official EVE Online API for character/market data
3. **S3 Resources** - Static universe data (regions, stations, items)

## API Client

The API client (`src/api/client.js`) provides:

- Axios instance with 60-second timeout
- Automatic retry with exponential backoff
- Rate limit (429) handling
- Error reporting to Sentry

```javascript
import { fetchWithRetry, fetchResource } from '../api/client';

// Fetch from EVETrade API
const data = await fetchWithRetry('/station?station=60003760');

// Fetch static resource
const regions = await fetchResource('regions');
```

## Trading Endpoints

### Station Trading

Find profitable margin trades within a station.

```javascript
import { fetchStationTrading } from '../api/trading';

const trades = await fetchStationTrading({
  stationId: '60003760',     // Jita 4-4
  minProfit: 1000000,        // Minimum profit per unit
  tax: 0.08,                 // Sales tax rate
  minVolume: 10,             // Minimum daily volume
  brokerFee: 0.03,           // Broker fee rate
  marginAbove: 5,            // Minimum margin %
  marginBelow: 50,           // Maximum margin %
});
```

**Endpoint:** `GET /station`

| Parameter | Type | Description |
|-----------|------|-------------|
| station | string | Station ID |
| profit | number | Minimum profit per unit |
| tax | number | Sales tax rate (0-1) |
| min_volume | number | Minimum daily volume |
| fee | number | Broker fee rate (0-1) |
| margins | string | Min,Max margin percentages |

### Station Hauling

Find profitable trades between two stations.

```javascript
import { fetchStationHauling } from '../api/trading';

const routes = await fetchStationHauling({
  from: '60003760',          // Source station ID
  to: '60008494',            // Destination station ID
  minProfit: 1000000,        // Minimum total profit
  maxWeight: 60000,          // Maximum cargo volume (m³)
  minROI: 5,                 // Minimum ROI %
  maxBudget: 1000000000,     // Maximum investment
  tax: 0.08,                 // Sales tax
  systemSecurity: 0.5,       // Minimum system security
  routeSafety: 'secure',     // secure, shortest, insecure
});
```

**Endpoint:** `GET /hauling`

| Parameter | Type | Description |
|-----------|------|-------------|
| from | string | Source station/region ID |
| to | string | Destination station/region ID |
| minProfit | number | Minimum total profit |
| maxWeight | number | Maximum cargo volume (m³) |
| minROI | number | Minimum ROI percentage |
| maxBudget | number | Maximum investment |
| tax | number | Sales tax rate |
| systemSecurity | number | Minimum system security |
| routeSafety | string | Route preference |

### Region Hauling

Find profitable trades between two regions.

```javascript
import { fetchRegionHauling } from '../api/trading';

const routes = await fetchRegionHauling({
  from: '10000002',          // The Forge (Jita)
  to: '10000043',            // Domain (Amarr)
  minProfit: 5000000,
  maxWeight: 60000,
  minROI: 10,
  maxBudget: 500000000,
  tax: 0.08,
  systemSecurity: 0.5,
  structureType: 'NPC',      // NPC, Player, Both
  routeSafety: 'secure',
});
```

### Market Orders

Get buy/sell orders for an item between regions.

```javascript
import { fetchOrders } from '../api/trading';

const orders = await fetchOrders({
  itemId: 34,                // Tritanium
  from: '10000002',          // Source region
  to: '10000043',            // Destination region
});
```

**Endpoint:** `GET /orders`

| Parameter | Type | Description |
|-----------|------|-------------|
| itemId | number | Type ID of the item |
| from | string | Source region ID |
| to | string | Destination region ID |

### Arbitrage Scanner

Find cross-region arbitrage opportunities.

```javascript
import { fetchArbitrage } from '../api/trading';

const opportunities = await fetchArbitrage({
  regions: ['10000002', '10000043', '10000032', '10000030'],
  minProfit: 1000000,
  minROI: 5,
  maxVolume: 60000,
  minDepth: 3,               // Minimum order depth
  maxBudget: 1000000000,
  tax: 0.08,
});
```

**Endpoint:** `GET /arbitrage`

### Route Optimizer

Get optimized routes with risk analysis.

```javascript
import { fetchOptimizedRoute } from '../api/trading';

const route = await fetchOptimizedRoute({
  origin: 30000142,          // Jita system
  destination: 30002187,     // Amarr system
  preference: 'shortest',    // shortest, secure, insecure
  avoidSystems: [30002718],  // Systems to avoid
  cargoValue: 1000000000,    // For risk calculation
  calculateRisk: true,
});
```

**Endpoint:** `GET /route-optimizer`

### PI Optimizer

Get planetary interaction optimization data.

```javascript
import { fetchPIOpportunities } from '../api/trading';

const piData = await fetchPIOpportunities({
  regionId: 10000002,
  tier: 'all',               // all, p1, p2, p3, p4
  minProfit: 0,
  minROI: 0,
  minVolume: 0,
  characterId: 12345,        // Optional
  accessToken: 'token',      // Optional
});
```

**Endpoint:** `GET /pi-optimizer`

## EVE ESI API

The ESI client (`src/api/esi.js`) provides wrappers for the official EVE Online API.

### Character Information

```javascript
import { getCharacterInfo, getCharacterPortrait } from '../api/esi';

const character = await getCharacterInfo(characterId);
const portrait = await getCharacterPortrait(characterId);
```

### Wallet Operations

```javascript
import {
  getWalletBalance,
  getWalletTransactions,
  getWalletJournal,
} from '../api/esi';

const balance = await getWalletBalance(characterId, accessToken);
const transactions = await getWalletTransactions(characterId, accessToken);
const journal = await getWalletJournal(characterId, accessToken, page);
```

### Market Orders

```javascript
import {
  getCharacterOrders,
  getCharacterOrderHistory,
  getCorporationOrders,
} from '../api/esi';

const orders = await getCharacterOrders(characterId, accessToken);
const history = await getCharacterOrderHistory(characterId, accessToken, page);
const corpOrders = await getCorporationOrders(corporationId, accessToken);
```

### Assets & Skills

```javascript
import {
  getCharacterAssets,
  getCharacterSkills,
  getCharacterStandings,
} from '../api/esi';

const assets = await getCharacterAssets(characterId, accessToken, page);
const skills = await getCharacterSkills(characterId, accessToken);
const standings = await getCharacterStandings(characterId, accessToken);
```

### Universe Data

```javascript
import {
  getTypeInfo,
  getStationInfo,
  getSystemInfo,
  getRegionInfo,
  getMarketPrices,
} from '../api/esi';

const item = await getTypeInfo(typeId);
const station = await getStationInfo(stationId);
const system = await getSystemInfo(systemId);
const region = await getRegionInfo(regionId);
const prices = await getMarketPrices();
```

### Market History

```javascript
import {
  getMarketHistory,
  getMarketOrders,
  getMarketHistoryMultiRegion,
  getMarketOrdersMultiRegion,
} from '../api/esi';

// Single region
const history = await getMarketHistory(regionId, typeId);
const orders = await getMarketOrders(regionId, typeId, 'all');

// Multiple regions in parallel
const multiHistory = await getMarketHistoryMultiRegion(typeId, regionIds);
const multiOrders = await getMarketOrdersMultiRegion(typeId, regionIds);
```

### Order Analysis

```javascript
import { analyzeMarketOrders } from '../api/esi';

const orders = await getMarketOrders(regionId, typeId);
const analysis = analyzeMarketOrders(orders, stationId);

// Returns:
// {
//   buyOrders: 45,
//   sellOrders: 32,
//   bestBuyPrice: 1234.56,
//   bestSellPrice: 1300.00,
//   buyersAtBestPrice: 3,
//   sellersAtBestPrice: 2,
//   totalBuyVolume: 50000,
//   totalSellVolume: 35000,
//   buyWalls: [...],
//   sellWalls: [...],
//   spread: 5.0,
//   competitionLevel: 'medium',
// }
```

### Tax Calculation

```javascript
import { calculateTradingTaxes } from '../api/esi';

const taxes = calculateTradingTaxes(skills, standings);

// Returns:
// {
//   salesTax: 0.044,
//   brokerFee: 0.015,
//   totalFees: 0.074,
//   accountingLevel: 5,
//   brokerRelationsLevel: 5,
// }
```

## Trade Hub Regions

```javascript
import { TRADE_HUB_REGIONS } from '../api/esi';

// {
//   'The Forge': 10000002,      // Jita
//   'Domain': 10000043,         // Amarr
//   'Heimatar': 10000030,       // Rens
//   'Sinq Laison': 10000032,    // Dodixie
//   'Metropolis': 10000042,     // Hek
// }
```

## Static Resources

Static data is fetched from S3 and cached locally.

```javascript
import { fetchResource } from '../api/client';

// Available resources:
const regions = await fetchResource('regions');       // All regions
const stations = await fetchResource('stations');     // All stations
const systems = await fetchResource('systems');       // All solar systems
const items = await fetchResource('items');           // All market items
```

### Resource Provider

The `useResources` hook provides cached access to universe data:

```javascript
import { useResources } from '../hooks/useResources';

function MyComponent() {
  const { regions, stations, items, loading, error } = useResources();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <select>
      {regions.map(r => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  );
}
```

## Error Handling

All API functions throw errors that can be caught:

```javascript
try {
  const data = await fetchStationTrading(params);
} catch (error) {
  if (error.message.includes('429')) {
    // Rate limited - retry later
  } else if (error.message.includes('401')) {
    // Authentication required
  } else {
    // Other error
    console.error('API Error:', error.message);
  }
}
```

## Request Cancellation

API calls support AbortController for cancellation:

```javascript
const controller = new AbortController();

const fetchData = async () => {
  try {
    const data = await fetchWithRetry('/station?station=60003760', {
      signal: controller.signal,
    });
    return data;
  } catch (error) {
    if (error.name === 'CanceledError') {
      // Request was cancelled
      return null;
    }
    throw error;
  }
};

// Cancel the request
controller.abort();
```

## Serverless Functions

The `/api/` directory contains Vercel serverless functions:

| Function | Description |
|----------|-------------|
| `station.js` | Station trading calculations |
| `hauling.js` | Hauling route calculations |
| `orders.js` | Market order data |
| `arbitrage.js` | Cross-region arbitrage |
| `contracts.js` | Contract search |
| `industry.js` | Industry manufacturing |
| `route-optimizer.js` | Route optimization |
| `pi-optimizer.js` | PI optimization |
| `lp-optimizer.js` | LP conversion |
| `corp-orders.js` | Corporation orders |

These functions are deployed to Vercel and handle the heavy calculations server-side.
