/**
 * Example Usage of useArbitrageScanner Hook
 *
 * This example demonstrates how to use the arbitrage scanner in your components.
 */

import React, { useState } from 'react';
import { useArbitrageScanner } from './useArbitrageScanner';

export function ArbitrageScannerExample() {
  const {
    data,
    loading,
    error,
    lastUpdated,
    filterOptions,
    scan,
    cancel,
    reset,
    updateFilters,
    resetFilters,
    getStats,
    getRegions,
    filterByItem,
    filterByRegionPair,
  } = useArbitrageScanner();

  const [scanParams, setScanParams] = useState({
    regions: ['10000002', '10000043', '10000032', '10000030'], // Jita, Amarr, Dodixie, Rens
    minProfit: 1000,
    minROI: 5,
    maxVolume: 60000,
    minDepth: 3,
    maxBudget: 1000000000,
    tax: 0.08,
  });

  const handleScan = async () => {
    try {
      await scan(scanParams);
    } catch (_err) {
      console.error('Scan failed:', err);
    }
  };

  const stats = getStats();
  const regions = getRegions();

  return (
    <div className="arbitrage-scanner">
      <h2>Cross-Region Arbitrage Scanner</h2>

      {/* Scan Controls */}
      <div className="controls">
        <h3>Scan Parameters</h3>

        <label>
          Regions (comma-separated IDs):
          <input
            type="text"
            value={scanParams.regions.join(',')}
            onChange={(e) => setScanParams({
              ...scanParams,
              regions: e.target.value.split(',').map(r => r.trim())
            })}
          />
        </label>

        <label>
          Min Profit per Unit:
          <input
            type="number"
            value={scanParams.minProfit}
            onChange={(e) => setScanParams({
              ...scanParams,
              minProfit: parseFloat(e.target.value)
            })}
          />
        </label>

        <label>
          Min ROI (%):
          <input
            type="number"
            value={scanParams.minROI}
            onChange={(e) => setScanParams({
              ...scanParams,
              minROI: parseFloat(e.target.value)
            })}
          />
        </label>

        <label>
          Max Volume (m³):
          <input
            type="number"
            value={scanParams.maxVolume}
            onChange={(e) => setScanParams({
              ...scanParams,
              maxVolume: parseFloat(e.target.value)
            })}
          />
        </label>

        <label>
          Min Order Depth:
          <input
            type="number"
            value={scanParams.minDepth}
            onChange={(e) => setScanParams({
              ...scanParams,
              minDepth: parseInt(e.target.value)
            })}
          />
        </label>

        <label>
          Max Budget:
          <input
            type="number"
            value={scanParams.maxBudget}
            onChange={(e) => setScanParams({
              ...scanParams,
              maxBudget: parseFloat(e.target.value)
            })}
          />
        </label>

        <label>
          Sales Tax (decimal):
          <input
            type="number"
            step="0.01"
            value={scanParams.tax}
            onChange={(e) => setScanParams({
              ...scanParams,
              tax: parseFloat(e.target.value)
            })}
          />
        </label>

        <div className="buttons">
          <button onClick={handleScan} disabled={loading}>
            {loading ? 'Scanning...' : 'Scan for Opportunities'}
          </button>
          <button onClick={cancel} disabled={!loading}>
            Cancel Scan
          </button>
          <button onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      {data && data.length > 0 && (
        <div className="filters">
          <h3>Filters</h3>

          <label>
            Sort By:
            <select
              value={filterOptions.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
            >
              <option value="Total Profit">Total Profit</option>
              <option value="ROI">ROI</option>
              <option value="Profit per Unit">Profit per Unit</option>
              <option value="Risk Score">Risk Score</option>
              <option value="Investment">Investment</option>
            </select>
          </label>

          <label>
            Sort Order:
            <select
              value={filterOptions.sortOrder}
              onChange={(e) => updateFilters({ sortOrder: e.target.value })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>

          <label>
            Min Risk Score:
            <input
              type="number"
              value={filterOptions.minRiskScore}
              onChange={(e) => updateFilters({ minRiskScore: parseInt(e.target.value) })}
            />
          </label>

          <label>
            Max Investment:
            <input
              type="number"
              value={filterOptions.maxInvestment || ''}
              placeholder="No limit"
              onChange={(e) => updateFilters({
                maxInvestment: e.target.value ? parseFloat(e.target.value) : null
              })}
            />
          </label>

          <button onClick={resetFilters}>Reset Filters</button>
        </div>
      )}

      {/* Statistics */}
      {data && data.length > 0 && (
        <div className="stats">
          <h3>Statistics</h3>
          <p>Total Opportunities: {stats.totalOpportunities}</p>
          <p>Total Profit: {stats.totalProfit.toLocaleString()} ISK</p>
          <p>Average ROI: {stats.averageROI.toFixed(2)}%</p>
          <p>Average Risk Score: {stats.averageRiskScore.toFixed(1)}</p>
          <p>Total Investment: {stats.totalInvestment.toLocaleString()} ISK</p>
          <p>Regions: {regions.join(', ')}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error">
          <h3>Error</h3>
          <p>{error.message}</p>
        </div>
      )}

      {/* Results Table */}
      {data && data.length > 0 && (
        <div className="results">
          <h3>Arbitrage Opportunities</h3>
          {lastUpdated && (
            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Buy Region</th>
                <th>Sell Region</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Profit/Unit</th>
                <th>Total Profit</th>
                <th>Quantity</th>
                <th>Volume (m³)</th>
                <th>ROI (%)</th>
                <th>Risk Score</th>
                <th>Order Depth</th>
                <th>Investment</th>
              </tr>
            </thead>
            <tbody>
              {data.map((opportunity, index) => (
                <tr key={index}>
                  <td>{opportunity['Item']}</td>
                  <td>{opportunity['Buy Region']}</td>
                  <td>{opportunity['Sell Region']}</td>
                  <td>{opportunity['Buy Price'].toLocaleString()}</td>
                  <td>{opportunity['Sell Price'].toLocaleString()}</td>
                  <td>{opportunity['Profit per Unit'].toLocaleString()}</td>
                  <td>{opportunity['Total Profit'].toLocaleString()}</td>
                  <td>{opportunity['Quantity'].toLocaleString()}</td>
                  <td>{opportunity['Volume (m³)'].toLocaleString()}</td>
                  <td>{opportunity['ROI']}%</td>
                  <td>{opportunity['Risk Score']}</td>
                  <td>{opportunity['Order Depth']}</td>
                  <td>{opportunity['Investment'].toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Helper Functions Examples */}
      <div className="examples">
        <h3>Additional Features</h3>

        <div>
          <h4>Filter by Item Name</h4>
          <input
            type="text"
            placeholder="Search for item..."
            onChange={(e) => {
              const results = filterByItem(e.target.value);
              console.log('Filtered results:', results);
            }}
          />
        </div>

        <div>
          <h4>Filter by Region Pair</h4>
          <select onChange={(e) => {
            const results = filterByRegionPair(e.target.value, null);
            console.log('Filtered by buy region:', results);
          }}>
            <option value="">Select Buy Region</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * Alternative: Using the fetchArbitrage API directly
 */
import { fetchArbitrage } from '../api/trading';

export async function directApiExample() {
  try {
    const opportunities = await fetchArbitrage({
      regions: ['10000002', '10000043'], // Jita and Amarr only
      minProfit: 5000,
      minROI: 10,
      maxVolume: 30000,
      minDepth: 5,
      maxBudget: 500000000,
      tax: 0.08,
    });

    console.log('Found opportunities:', opportunities);
    return opportunities;
  } catch (_error) {
    console.error('Failed to fetch arbitrage data:', error);
  }
}

/**
 * Key Region IDs for Reference:
 *
 * Major Trade Hubs:
 * - 10000002: The Forge (Jita)
 * - 10000043: Domain (Amarr)
 * - 10000032: Sinq Laison (Dodixie)
 * - 10000030: Heimatar (Rens)
 * - 10000042: Metropolis (Hek)
 *
 * Other Important Regions:
 * - 10000069: Black Rise (Lowsec/FW)
 * - 10000048: Lonetrek (Caldari)
 * - 10000054: Aridia (Minmatar)
 */
