# Arbitrage Scanner - Quick Start Guide

## Quick Examples

### 1. Basic Scan (Default Parameters)
Scans the four major trade hubs with sensible defaults:

```bash
curl "https://evetrade.vercel.app/api/arbitrage"
```

**Default behavior:**
- Regions: Jita, Amarr, Dodixie, Rens
- Min Profit: 1,000 ISK per unit
- Min ROI: 5%
- Max Volume: 60,000 m³ (Blockade Runner capacity)
- Min Depth: 3 orders on each side
- Max Budget: 1B ISK
- Tax: 8%

### 2. High-Value Opportunities Only
Find big-ticket items with significant profit:

```bash
curl "https://evetrade.vercel.app/api/arbitrage?minProfit=100000&minROI=15&maxBudget=5000000000"
```

**Parameters:**
- Min Profit: 100,000 ISK per unit
- Min ROI: 15%
- Max Budget: 5B ISK

### 3. Small Cargo (Interceptor/Frigate)
For quick, low-volume runs:

```bash
curl "https://evetrade.vercel.app/api/arbitrage?maxVolume=2500&minProfit=500&maxBudget=100000000"
```

**Parameters:**
- Max Volume: 2,500 m³ (T1 Frigate capacity)
- Min Profit: 500 ISK per unit
- Max Budget: 100M ISK

### 4. Freighter Loads
Maximum cargo capacity for large-scale hauling:

```bash
curl "https://evetrade.vercel.app/api/arbitrage?maxVolume=1000000&minProfit=10000&maxBudget=10000000000"
```

**Parameters:**
- Max Volume: 1,000,000 m³ (Freighter capacity)
- Min Profit: 10,000 ISK per unit
- Max Budget: 10B ISK

### 5. Two-Region Arbitrage
Focus on a specific region pair (e.g., Jita ↔ Amarr):

```bash
curl "https://evetrade.vercel.app/api/arbitrage?regions=10000002,10000043&minROI=8"
```

**Parameters:**
- Regions: 10000002 (Jita), 10000043 (Amarr)
- Min ROI: 8%

### 6. Conservative/Safe Trades
High order depth for reliable execution:

```bash
curl "https://evetrade.vercel.app/api/arbitrage?minDepth=10&minProfit=5000"
```

**Parameters:**
- Min Depth: 10 orders on each side
- Min Profit: 5,000 ISK per unit

### 7. Custom Region Set
Scan specific regions (e.g., Caldari space):

```bash
curl "https://evetrade.vercel.app/api/arbitrage?regions=10000002,10000033,10000016,10000020"
```

**Parameters:**
- Regions: The Forge, Lonetrek, The Citadel, Khanid

## Region IDs Reference

### Major Trade Hubs
```
10000002 = The Forge (Jita)
10000043 = Domain (Amarr)
10000032 = Sinq Laison (Dodixie)
10000030 = Heimatar (Rens)
10000042 = Metropolis (Hek)
```

### Other High-Activity Regions
```
10000033 = Lonetrek (Caldari)
10000048 = Lonetrek (Caldari)
10000064 = Essence (Gallente)
10000068 = Verge Vendor (Gallente)
10000069 = Black Rise (Lowsec)
```

## React Hook Usage

### Basic Implementation

```javascript
import { useArbitrageScanner } from './hooks/useArbitrageScanner';

function MyComponent() {
  const { data, loading, error, scan, getStats } = useArbitrageScanner();

  const handleScan = () => {
    scan({
      regions: ['10000002', '10000043'],
      minProfit: 5000,
      minROI: 10,
    });
  };

  const stats = getStats();

  if (loading) return <div>Scanning...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleScan}>Scan</button>
      {data && (
        <div>
          <p>Found {stats.totalOpportunities} opportunities</p>
          <p>Total Profit: {stats.totalProfit.toLocaleString()} ISK</p>
        </div>
      )}
    </div>
  );
}
```

### With Filtering

```javascript
const { data, updateFilters, filterOptions } = useArbitrageScanner();

// Sort by ROI instead of profit
updateFilters({ sortBy: 'ROI', sortOrder: 'desc' });

// Filter by risk score
updateFilters({ minRiskScore: 50 });

// Limit investment
updateFilters({ maxInvestment: 500000000 });
```

### Search and Filter

```javascript
const { filterByItem, filterByRegionPair } = useArbitrageScanner();

// Find all tritanium opportunities
const tritaniumOpps = filterByItem('Tritanium');

// Find all Jita → Amarr trades
const jitaToAmarr = filterByRegionPair('The Forge', 'Domain');
```

## Direct API Usage (Without Hook)

```javascript
import { fetchArbitrage } from './api/trading';

async function scanForOpportunities() {
  try {
    const results = await fetchArbitrage({
      regions: ['10000002', '10000043', '10000032'],
      minProfit: 2000,
      minROI: 8,
      maxVolume: 60000,
      minDepth: 5,
    });

    console.log(`Found ${results.length} opportunities`);
    return results;
  } catch (error) {
    console.error('Scan failed:', error);
  }
}
```

## Response Format

Each opportunity includes:

```javascript
{
  "Item ID": 34,                    // EVE type ID
  "Item": "Tritanium",              // Item name
  "Buy Region": "The Forge",        // Where to buy
  "Sell Region": "Domain",          // Where to sell
  "Buy Price": 5.50,                // Price to buy at
  "Sell Price": 6.20,               // Price to sell at
  "Profit per Unit": 0.62,          // Profit per single item
  "Total Profit": 620000,           // Total profit for full quantity
  "Quantity": 1000000,              // How many items to trade
  "Volume (m³)": 10000,             // Total cargo volume
  "ROI": 11.3,                      // Return on investment %
  "Risk Score": 85,                 // 0-100 (higher = safer)
  "Order Depth": "45/38",           // Buy orders / Sell orders
  "Investment": 5500000             // Total ISK required
}
```

## Understanding Risk Score

The risk score (0-100) indicates orderbook liquidity:

| Score | Risk Level | Description |
|-------|-----------|-------------|
| 0-30 | High | Thin orderbook, orders may not fill |
| 31-60 | Medium | Moderate depth, some execution risk |
| 61-100 | Low | Deep orderbook, reliable execution |

**Formula:**
```
depthScore = min((buy orders + sell orders) / 20 × 50, 50)
volumeScore = min(total volume / 10000 × 50, 50)
riskScore = depthScore + volumeScore
```

## Ship Cargo Capacities

For `maxVolume` parameter reference:

| Ship Type | Approximate Capacity (m³) |
|-----------|---------------------------|
| T1 Frigate | 2,500 |
| Interceptor | 150 |
| Cruiser | 5,000 |
| Battlecruiser | 10,000 |
| Battleship | 15,000 |
| Industrial | 30,000-40,000 |
| Blockade Runner | 60,000 |
| Deep Space Transport | 62,500 |
| Freighter | 1,200,000 |
| Jump Freighter | 360,000 |

## Performance Tips

1. **Fewer Regions**: 2-3 regions scan much faster than 5+
2. **Higher Thresholds**: Increase minProfit and minROI to reduce processing
3. **Lower Volume**: Smaller maxVolume = fewer items to analyze
4. **Increase minDepth**: Reduces computation on illiquid items

## Common Use Cases

### Day Trading (Station-Bound)
```javascript
scan({
  regions: ['10000002'], // Jita only
  minProfit: 1000,
  minROI: 5,
  maxVolume: 1,          // Small items
  maxBudget: 100000000,
});
```

### Regional Hauling
```javascript
scan({
  regions: ['10000002', '10000043'], // Jita ↔ Amarr
  minProfit: 5000,
  minROI: 10,
  maxVolume: 60000,      // Blockade Runner
  minDepth: 5,           // Good liquidity
});
```

### Empire-Wide Survey
```javascript
scan({
  regions: ['10000002', '10000043', '10000032', '10000030', '10000042'],
  minProfit: 10000,
  minROI: 15,
  maxVolume: 1000000,    // Freighter
  maxBudget: 10000000000,
});
```

### Low-Risk Only
```javascript
scan({
  regions: ['10000002', '10000043'],
  minProfit: 2000,
  minROI: 8,
  minDepth: 10,          // High liquidity requirement
});

// Then filter results
updateFilters({ minRiskScore: 70 });
```

## Error Handling

```javascript
const { scan, error } = useArbitrageScanner();

try {
  await scan({ regions: ['10000002', '10000043'] });
} catch (err) {
  if (err.message.includes('timeout')) {
    // ESI API timeout
    console.log('Scan timed out, try fewer regions');
  } else if (err.message.includes('At least 2 valid regions')) {
    // Invalid parameters
    console.log('Need at least 2 regions');
  } else {
    // Other error
    console.error('Scan failed:', err);
  }
}
```

## Caching Behavior

- **Client Cache**: 60 seconds
- **CDN Cache**: 120 seconds
- **Type Info**: Indefinite (LRU cache)
- **Region Names**: Indefinite (LRU cache)

Identical requests within 60 seconds return cached results.

## Limitations

- Maximum 60 pages per region (30 buy + 30 sell)
- Results limited to top 500 opportunities
- 15-second timeout per ESI request
- Requires at least 2 regions
- Type info batched to 1000 items at a time

## Troubleshooting

### Slow Scans
- Reduce number of regions
- Increase filter thresholds
- Check ESI API status

### No Results
- Lower minProfit or minROI
- Increase maxVolume
- Decrease minDepth
- Check that regions have active markets

### Timeout Errors
- Reduce number of regions
- Try again later (ESI may be slow)
- Check ESI status: https://esi.evetech.net/status.json

## Additional Resources

- Full documentation: `/ARBITRAGE_SCANNER.md`
- Example implementation: `/src/hooks/useArbitrageScanner.example.js`
- API source: `/api/arbitrage.js`
- Hook source: `/src/hooks/useArbitrageScanner.js`
- EVE ESI Docs: https://esi.evetech.net/ui/
