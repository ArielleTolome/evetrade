# useArbitrageScanner Hook Documentation

## Overview

`useArbitrageScanner` is a React hook that provides comprehensive cross-region arbitrage scanning capabilities for EVE Online market data. It handles API calls, filtering, sorting, and provides utility functions for analyzing arbitrage opportunities.

## Installation

The hook is already integrated into the EVETrade codebase. Simply import it:

```javascript
import { useArbitrageScanner } from './hooks/useArbitrageScanner';
```

## Basic Usage

```javascript
import { useArbitrageScanner } from './hooks/useArbitrageScanner';

function ArbitragePage() {
  const {
    data,          // Filtered results
    loading,       // Scan status
    error,         // Error state
    scan,          // Trigger scan
    getStats       // Get statistics
  } = useArbitrageScanner();

  const handleScan = () => {
    scan({
      regions: ['10000002', '10000043'], // Jita and Amarr
      minProfit: 5000,
      minROI: 10,
    });
  };

  if (loading) return <div>Scanning markets...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const stats = getStats();

  return (
    <div>
      <button onClick={handleScan}>Scan for Opportunities</button>
      {data && (
        <div>
          <p>Found {stats.totalOpportunities} opportunities</p>
          <p>Total Profit: {stats.totalProfit.toLocaleString()} ISK</p>
          <p>Average ROI: {stats.averageROI.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### Returned Object

```typescript
{
  // State
  data: Array<Opportunity>,           // Filtered and sorted opportunities
  rawData: Array<Opportunity>,        // Unfiltered results
  loading: boolean,                    // True when scan is in progress
  error: { message: string, original: Error } | null,
  lastUpdated: Date | null,           // Timestamp of last successful scan
  filterOptions: FilterOptions,        // Current filter settings

  // Actions
  scan: (params: ScanParams) => Promise<Array<Opportunity>>,
  cancel: () => void,                  // Cancel current scan
  reset: () => void,                   // Reset all state
  updateFilters: (filters: Partial<FilterOptions>) => void,
  resetFilters: () => void,            // Reset to default filters

  // Utilities
  getStats: () => Stats,               // Get summary statistics
  getRegions: () => Array<string>,     // Get unique regions in results
  filterByItem: (itemName: string) => Array<Opportunity>,
  filterByRegionPair: (buyRegion?: string, sellRegion?: string) => Array<Opportunity>,
}
```

### Types

#### ScanParams

```typescript
{
  regions?: Array<string>,    // Region IDs (default: major trade hubs)
  minProfit?: number,         // Min profit per unit (default: 1000 ISK)
  minROI?: number,            // Min ROI percentage (default: 5%)
  maxVolume?: number,         // Max m³ per item (default: 60000)
  minDepth?: number,          // Min order depth (default: 3)
  maxBudget?: number,         // Max budget (default: 1B ISK)
  tax?: number,               // Sales tax rate (default: 0.08)
}
```

#### Opportunity

```typescript
{
  'Item ID': number,
  'Item': string,
  'Buy Region': string,
  'Sell Region': string,
  'Buy Price': number,
  'Sell Price': number,
  'Profit per Unit': number,
  'Total Profit': number,
  'Quantity': number,
  'Volume (m³)': number,
  'ROI': number,
  'Risk Score': number,        // 0-100 (higher = safer)
  'Order Depth': string,        // "buy_orders/sell_orders"
  'Investment': number,
}
```

#### FilterOptions

```typescript
{
  sortBy: 'Total Profit' | 'ROI' | 'Profit per Unit' | 'Risk Score' | 'Investment',
  sortOrder: 'asc' | 'desc',
  minRiskScore: number,         // 0-100
  maxInvestment: number | null,
}
```

#### Stats

```typescript
{
  totalOpportunities: number,
  totalProfit: number,
  averageROI: number,
  averageRiskScore: number,
  totalInvestment: number,
}
```

## Usage Examples

### Example 1: Simple Scan

```javascript
function SimpleScan() {
  const { data, loading, scan } = useArbitrageScanner();

  return (
    <div>
      <button onClick={() => scan({})} disabled={loading}>
        Scan Major Trade Hubs
      </button>

      {data && data.map((opp, i) => (
        <div key={i}>
          {opp['Item']}: {opp['Total Profit'].toLocaleString()} ISK profit
        </div>
      ))}
    </div>
  );
}
```

### Example 2: With Custom Parameters

```javascript
function CustomScan() {
  const { data, loading, scan } = useArbitrageScanner();

  const scanHighValue = () => {
    scan({
      regions: ['10000002', '10000043', '10000032'], // Jita, Amarr, Dodixie
      minProfit: 50000,      // 50k ISK per unit minimum
      minROI: 15,            // 15% ROI minimum
      maxVolume: 30000,      // T2 transport ship capacity
      minDepth: 5,           // Good liquidity
      maxBudget: 5000000000, // 5B ISK max
      tax: 0.08,
    });
  };

  return (
    <button onClick={scanHighValue} disabled={loading}>
      Scan High-Value Opportunities
    </button>
  );
}
```

### Example 3: With Filtering and Sorting

```javascript
function FilteredScan() {
  const {
    data,
    loading,
    scan,
    updateFilters,
    resetFilters,
    filterOptions
  } = useArbitrageScanner();

  return (
    <div>
      <button onClick={() => scan({})}>Scan</button>

      {/* Sorting Controls */}
      <select
        value={filterOptions.sortBy}
        onChange={(e) => updateFilters({ sortBy: e.target.value })}
      >
        <option value="Total Profit">Sort by Total Profit</option>
        <option value="ROI">Sort by ROI</option>
        <option value="Risk Score">Sort by Risk Score</option>
        <option value="Profit per Unit">Sort by Profit/Unit</option>
      </select>

      <select
        value={filterOptions.sortOrder}
        onChange={(e) => updateFilters({ sortOrder: e.target.value })}
      >
        <option value="desc">High to Low</option>
        <option value="asc">Low to High</option>
      </select>

      {/* Risk Filter */}
      <label>
        Min Risk Score: {filterOptions.minRiskScore}
        <input
          type="range"
          min="0"
          max="100"
          value={filterOptions.minRiskScore}
          onChange={(e) => updateFilters({ minRiskScore: parseInt(e.target.value) })}
        />
      </label>

      {/* Investment Filter */}
      <label>
        Max Investment (ISK):
        <input
          type="number"
          placeholder="No limit"
          value={filterOptions.maxInvestment || ''}
          onChange={(e) => updateFilters({
            maxInvestment: e.target.value ? parseFloat(e.target.value) : null
          })}
        />
      </label>

      <button onClick={resetFilters}>Reset Filters</button>

      {/* Results */}
      {data && data.map((opp, i) => (
        <div key={i}>
          {opp['Item']}: {opp['Total Profit'].toLocaleString()} ISK
          (ROI: {opp['ROI']}%, Risk: {opp['Risk Score']})
        </div>
      ))}
    </div>
  );
}
```

### Example 4: With Statistics Dashboard

```javascript
function StatsDashboard() {
  const { data, loading, scan, getStats, getRegions } = useArbitrageScanner();

  const stats = getStats();
  const regions = getRegions();

  return (
    <div>
      <button onClick={() => scan({})} disabled={loading}>
        Scan Markets
      </button>

      {stats.totalOpportunities > 0 && (
        <div className="stats-panel">
          <h3>Market Summary</h3>
          <div className="stat">
            <label>Opportunities Found:</label>
            <value>{stats.totalOpportunities}</value>
          </div>
          <div className="stat">
            <label>Total Potential Profit:</label>
            <value>{stats.totalProfit.toLocaleString()} ISK</value>
          </div>
          <div className="stat">
            <label>Average ROI:</label>
            <value>{stats.averageROI.toFixed(2)}%</value>
          </div>
          <div className="stat">
            <label>Average Risk Score:</label>
            <value>{stats.averageRiskScore.toFixed(1)} / 100</value>
          </div>
          <div className="stat">
            <label>Total Investment Required:</label>
            <value>{stats.totalInvestment.toLocaleString()} ISK</value>
          </div>
          <div className="stat">
            <label>Regions Scanned:</label>
            <value>{regions.join(', ')}</value>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Example 5: With Search and Advanced Filtering

```javascript
function AdvancedSearch() {
  const {
    data,
    loading,
    scan,
    filterByItem,
    filterByRegionPair,
    getRegions
  } = useArbitrageScanner();

  const [search, setSearch] = useState('');
  const [selectedBuyRegion, setSelectedBuyRegion] = useState('');
  const [selectedSellRegion, setSelectedSellRegion] = useState('');

  const regions = getRegions();

  // Get filtered results
  let results = data;
  if (search) {
    results = filterByItem(search);
  }
  if (selectedBuyRegion || selectedSellRegion) {
    results = filterByRegionPair(selectedBuyRegion, selectedSellRegion);
  }

  return (
    <div>
      <button onClick={() => scan({})} disabled={loading}>
        Scan Markets
      </button>

      {/* Search by Item */}
      <input
        type="text"
        placeholder="Search for item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filter by Region Pair */}
      <select
        value={selectedBuyRegion}
        onChange={(e) => setSelectedBuyRegion(e.target.value)}
      >
        <option value="">Any Buy Region</option>
        {regions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      <select
        value={selectedSellRegion}
        onChange={(e) => setSelectedSellRegion(e.target.value)}
      >
        <option value="">Any Sell Region</option>
        {regions.map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      {/* Results */}
      <div>Found {results.length} matching opportunities</div>
      {results.map((opp, i) => (
        <div key={i}>
          <strong>{opp['Item']}</strong>
          <br />
          {opp['Buy Region']} → {opp['Sell Region']}
          <br />
          Profit: {opp['Total Profit'].toLocaleString()} ISK
          (ROI: {opp['ROI']}%)
        </div>
      ))}
    </div>
  );
}
```

### Example 6: Auto-Refresh Scanner

```javascript
function AutoRefreshScanner() {
  const { data, loading, scan, lastUpdated, cancel } = useArbitrageScanner();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!autoRefresh) return;

    // Scan immediately
    scan({});

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      scan({});
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      cancel();
    };
  }, [autoRefresh, scan, cancel]);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
        />
        Auto-refresh every 5 minutes
      </label>

      {lastUpdated && (
        <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}

      {loading && <p>Scanning...</p>}
      {data && <p>Found {data.length} opportunities</p>}
    </div>
  );
}
```

### Example 7: Export to CSV

```javascript
function ExportableScanner() {
  const { data, loading, scan } = useArbitrageScanner();

  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    // Create CSV header
    const headers = Object.keys(data[0]).join(',');

    // Create CSV rows
    const rows = data.map(opp =>
      Object.values(opp).map(val =>
        typeof val === 'string' ? `"${val}"` : val
      ).join(',')
    );

    // Combine and download
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arbitrage-opportunities-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button onClick={() => scan({})} disabled={loading}>
        Scan Markets
      </button>

      {data && data.length > 0 && (
        <button onClick={exportToCSV}>
          Export to CSV ({data.length} opportunities)
        </button>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Cancel on Unmount

Always cancel pending requests when component unmounts:

```javascript
useEffect(() => {
  return () => {
    cancel();
  };
}, [cancel]);
```

The hook handles this automatically, but you can also call `cancel()` manually.

### 2. Debounce Frequent Scans

If triggering scans from user input, debounce the calls:

```javascript
import { useDebounce } from './useDebounce';

function DebouncedScan() {
  const [params, setParams] = useState({});
  const debouncedParams = useDebounce(params, 500);
  const { scan } = useArbitrageScanner();

  useEffect(() => {
    scan(debouncedParams);
  }, [debouncedParams]);
}
```

### 3. Handle Errors Gracefully

```javascript
const { scan, error } = useArbitrageScanner();

const handleScan = async () => {
  try {
    await scan({});
  } catch (err) {
    // Show user-friendly error message
    toast.error('Failed to scan markets. Please try again.');
    console.error('Scan error:', err);
  }
};
```

### 4. Provide Loading Feedback

```javascript
const { loading, scan } = useArbitrageScanner();

return (
  <button onClick={() => scan({})} disabled={loading}>
    {loading ? (
      <>
        <Spinner /> Scanning...
      </>
    ) : (
      'Scan Markets'
    )}
  </button>
);
```

### 5. Validate User Input

```javascript
const handleScan = () => {
  const minProfit = parseFloat(profitInput);
  if (isNaN(minProfit) || minProfit < 0) {
    toast.error('Invalid profit threshold');
    return;
  }

  scan({ minProfit });
};
```

## Performance Considerations

- **Fewer regions = faster scans**: Limit to 2-3 regions for quick results
- **Higher thresholds = less processing**: Increase minProfit/minROI to reduce computation
- **Use filtering**: Apply filters client-side rather than re-scanning
- **Cache results**: Use `rawData` to access unfiltered results without re-scanning

## Integration with Existing Components

### Use with TradingTable

```javascript
import { TradingTable } from '../components/tables/TradingTable';
import { useArbitrageScanner } from '../hooks/useArbitrageScanner';

function ArbitragePage() {
  const { data, loading, scan } = useArbitrageScanner();

  return (
    <div>
      <button onClick={() => scan({})}>Scan</button>
      <TradingTable data={data} loading={loading} />
    </div>
  );
}
```

## Troubleshooting

### No results returned
- Lower minProfit or minROI thresholds
- Increase maxVolume limit
- Decrease minDepth requirement
- Verify regions have active markets

### Slow scans
- Reduce number of regions
- Increase filter thresholds
- Check ESI API status

### Timeout errors
- Reduce number of regions
- Try again later
- Check network connection

## Related Documentation

- API Documentation: `/ARBITRAGE_SCANNER.md`
- Quick Start Guide: `/api/arbitrage.QUICKSTART.md`
- Example Implementation: `/src/hooks/useArbitrageScanner.example.js`
- API Source: `/api/arbitrage.js`
