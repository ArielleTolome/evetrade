import React, { useState } from 'react';
import { usePIOptimizer } from './usePIOptimizer';

/**
 * Example component demonstrating usePIOptimizer hook
 * Shows how to search for PI opportunities and display results
 */
export function PIOptimizerExample() {
  const {
    data,
    loading,
    error,
    lastUpdated,
    fetchPIOpportunities,
    filterOpportunities,
    sortOpportunities,
    calculateSummary,
    getOpportunitiesByTier,
    clearCache,
  } = usePIOptimizer();

  const [filters, setFilters] = useState({
    regionId: 10000002, // The Forge (Jita)
    tier: 'all',
    minROI: 5,
    minProfit: 1000,
    minVolume: 5000,
  });

  const [sortField, setSortField] = useState('ROI');
  const [sortAsc, setSortAsc] = useState(false);

  // Handle search
  const handleSearch = async () => {
    try {
      await fetchPIOpportunities({
        regionId: filters.regionId,
        tier: filters.tier,
        minROI: filters.minROI,
        minProfit: filters.minProfit,
        minVolume: filters.minVolume,
      });
    } catch (_err) {
      console.error('Failed to fetch PI opportunities:', err);
    }
  };

  // Get filtered and sorted opportunities
  const getProcessedOpportunities = () => {
    if (!data?.opportunities) return [];

    let processed = [...data.opportunities];

    // Sort
    processed = sortOpportunities(processed, sortField, sortAsc);

    return processed;
  };

  const opportunities = getProcessedOpportunities();
  const summary = data ? calculateSummary(data.opportunities) : null;
  const byTier = data ? getOpportunitiesByTier(data.opportunities) : null;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>PI Material Optimizer</h1>

      {/* Search Filters */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Search Filters</h2>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            Region:
            <select
              value={filters.regionId}
              onChange={(e) => setFilters({...filters, regionId: +e.target.value})}
              style={{ marginLeft: '5px' }}
            >
              <option value={10000002}>The Forge (Jita)</option>
              <option value={10000043}>Domain (Amarr)</option>
              <option value={10000032}>Sinq Laison (Dodixie)</option>
              <option value={10000030}>Heimatar (Rens)</option>
            </select>
          </label>

          <label style={{ marginLeft: '20px' }}>
            Tier:
            <select
              value={filters.tier}
              onChange={(e) => setFilters({...filters, tier: e.target.value})}
              style={{ marginLeft: '5px' }}
            >
              <option value="all">All Tiers</option>
              <option value="P0">P0 - Raw Materials</option>
              <option value="P1">P1 - Processed</option>
              <option value="P2">P2 - Refined</option>
              <option value="P3">P3 - Specialized</option>
              <option value="P4">P4 - Advanced</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            Min ROI (%):
            <input
              type="number"
              value={filters.minROI}
              onChange={(e) => setFilters({...filters, minROI: +e.target.value})}
              style={{ marginLeft: '5px', width: '80px' }}
              min={0}
              max={1000}
            />
          </label>

          <label style={{ marginLeft: '20px', marginRight: '10px' }}>
            Min Profit (ISK):
            <input
              type="number"
              value={filters.minProfit}
              onChange={(e) => setFilters({...filters, minProfit: +e.target.value})}
              style={{ marginLeft: '5px', width: '100px' }}
              min={0}
            />
          </label>

          <label style={{ marginLeft: '20px' }}>
            Min Volume:
            <input
              type="number"
              value={filters.minVolume}
              onChange={(e) => setFilters({...filters, minVolume: +e.target.value})}
              style={{ marginLeft: '5px', width: '100px' }}
              min={0}
            />
          </label>
        </div>

        <div>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px',
            }}
          >
            {loading ? 'Searching...' : 'Search Opportunities'}
          </button>

          <button
            onClick={() => clearCache()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <h2>Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div>
              <strong>Total Opportunities:</strong> {summary.totalOpportunities}
            </div>
            <div>
              <strong>Average ROI:</strong> {summary.avgROI.toFixed(2)}%
            </div>
            <div>
              <strong>Average Profit:</strong> {summary.avgProfit.toLocaleString()} ISK
            </div>
            <div>
              <strong>Best ROI:</strong> {summary.highestROI?.Item} ({summary.highestROI?.ROI}%)
            </div>
            <div>
              <strong>Highest Profit:</strong> {summary.highestProfit?.Item}
            </div>
            <div>
              <strong>Last Updated:</strong> {lastUpdated?.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Tier Breakdown */}
      {byTier && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '5px' }}>
          <h2>Opportunities by Tier</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div><strong>P0:</strong> {byTier.P0.length}</div>
            <div><strong>P1:</strong> {byTier.P1.length}</div>
            <div><strong>P2:</strong> {byTier.P2.length}</div>
            <div><strong>P3:</strong> {byTier.P3.length}</div>
            <div><strong>P4:</strong> {byTier.P4.length}</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading PI opportunities...</p>
        </div>
      )}

      {/* Results Table */}
      {!loading && opportunities.length > 0 && (
        <div>
          <h2>Opportunities ({opportunities.length})</h2>

          {/* Sorting Controls */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>
              Sort by:
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                style={{ marginLeft: '5px' }}
              >
                <option value="ROI">ROI</option>
                <option value="Profit per Unit">Profit per Unit</option>
                <option value="Profit per m³">Profit per m³</option>
                <option value="Daily Sell Volume">Daily Volume</option>
                <option value="Spread %">Spread %</option>
              </select>
            </label>

            <label style={{ marginLeft: '20px' }}>
              <input
                type="checkbox"
                checked={sortAsc}
                onChange={(e) => setSortAsc(e.target.checked)}
              />
              Ascending
            </label>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4CAF50', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Item</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Tier</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Buy Price</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Sell Price</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Profit</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>ROI</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Profit/m³</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Volume</th>
                <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Liquidity</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp, index) => (
                <tr
                  key={opp['Item ID']}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                  }}
                >
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{opp.Item}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        backgroundColor: getTierColor(opp.Tier),
                        borderRadius: '3px',
                        fontSize: '0.9em',
                      }}
                    >
                      {opp.Tier}
                    </span>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {opp['Buy Price'].toLocaleString()} ISK
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {opp['Sell Price'].toLocaleString()} ISK
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                    {opp['Profit per Unit'].toLocaleString()} ISK
                  </td>
                  <td
                    style={{
                      padding: '8px',
                      border: '1px solid #ddd',
                      textAlign: 'right',
                      color: opp.ROI >= 20 ? 'green' : opp.ROI >= 10 ? 'orange' : 'inherit',
                      fontWeight: opp.ROI >= 20 ? 'bold' : 'normal',
                    }}
                  >
                    {opp.ROI}%
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {opp['Profit per m³'].toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    {opp['Daily Sell Volume'].toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        backgroundColor: getLiquidityColor(opp.Liquidity),
                        borderRadius: '3px',
                        fontSize: '0.9em',
                      }}
                    >
                      {opp.Liquidity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && data && opportunities.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>No opportunities found matching your criteria. Try adjusting the filters.</p>
        </div>
      )}
    </div>
  );
}

// Helper function to get tier badge color
function getTierColor(tier) {
  const colors = {
    P0: '#e3f2fd',
    P1: '#c8e6c9',
    P2: '#fff9c4',
    P3: '#ffe0b2',
    P4: '#f8bbd0',
  };
  return colors[tier] || '#f0f0f0';
}

// Helper function to get liquidity badge color
function getLiquidityColor(liquidity) {
  const colors = {
    High: '#c8e6c9',
    Medium: '#fff9c4',
    Low: '#ffccbc',
  };
  return colors[liquidity] || '#f0f0f0';
}

export default PIOptimizerExample;
