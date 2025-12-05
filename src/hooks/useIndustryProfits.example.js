/**
 * Example usage of useIndustryProfits hook
 *
 * This file demonstrates how to use the useIndustryProfits hook
 * to fetch and display character blueprint profitability data.
 */

import React, { useEffect, useState } from 'react';
import { useIndustryProfits } from './useIndustryProfits';

function IndustryProfitsExample() {
  // Initialize the hook
  const {
    data,
    loading,
    error,
    lastUpdated,
    fetchIndustryProfits,
    filterBlueprints,
    clearCache,
  } = useIndustryProfits({
    cacheTimeout: 300000, // 5 minutes
  });

  // Component state
  const [characterId, setCharacterId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [regionId, setRegionId] = useState(10000002); // The Forge (Jita)
  const [meFilter, setMeFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Handle form submission to fetch blueprints
   */
  const handleFetchBlueprints = async (e) => {
    e.preventDefault();

    try {
      await fetchIndustryProfits({
        characterId: parseInt(characterId),
        accessToken,
        regionId,
        minProfit: 0,
        minROI: 0,
        meLevel: meFilter,
        forceRefresh: false, // Use cache if available
      });
    } catch (_err) {
      console.error('Failed to fetch blueprints:', err);
    }
  };

  /**
   * Handle refresh (bypass cache)
   */
  const handleRefresh = async () => {
    try {
      await fetchIndustryProfits({
        characterId: parseInt(characterId),
        accessToken,
        regionId,
        meLevel: meFilter,
        forceRefresh: true, // Force fresh data
      });
    } catch (_err) {
      console.error('Failed to refresh blueprints:', err);
    }
  };

  // Filter blueprints based on current filters
  const filteredBlueprints = data?.blueprints
    ? filterBlueprints(data.blueprints, {
        meLevel: meFilter,
        search: searchTerm,
      })
    : [];

  return (
    <div className="industry-profits-example">
      <h1>Industry Profits Analysis</h1>

      {/* Input Form */}
      <form onSubmit={handleFetchBlueprints}>
        <div>
          <label>
            Character ID:
            <input
              type="number"
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              required
            />
          </label>
        </div>

        <div>
          <label>
            ESI Access Token:
            <input
              type="text"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Bearer token from ESI"
              required
            />
          </label>
        </div>

        <div>
          <label>
            Region ID:
            <select value={regionId} onChange={(e) => setRegionId(parseInt(e.target.value))}>
              <option value={10000002}>The Forge (Jita)</option>
              <option value={10000043}>Domain (Amarr)</option>
              <option value={10000032}>Sinq Laison (Dodixie)</option>
              <option value={10000030}>Heimatar (Rens)</option>
              <option value={10000042}>Metropolis (Hek)</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Blueprints'}
        </button>
      </form>

      {/* Filters */}
      {data && (
        <div className="filters">
          <div>
            <label>
              ME Level:
              <select value={meFilter || ''} onChange={(e) => setMeFilter(e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">All</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <option key={level} value={level}>
                    ME {level}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Search:
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blueprint names..."
              />
            </label>
          </div>

          <button onClick={handleRefresh} disabled={loading}>
            Refresh Data
          </button>

          <button onClick={() => clearCache()}>
            Clear Cache
          </button>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Results Display */}
      {data && (
        <div className="results">
          <h2>Results</h2>
          <div className="stats">
            <p>Total Blueprints Owned: {data.totalOwned}</p>
            <p>Blueprints Shown: {filteredBlueprints.length}</p>
            <p>Active Industry Jobs: {data.activeJobs}</p>
          </div>

          {filteredBlueprints.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Blueprint Name</th>
                  <th>ME</th>
                  <th>TE</th>
                  <th>Runs</th>
                  <th>Market Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlueprints.map((bp) => (
                  <tr key={bp['Blueprint ID']}>
                    <td>{bp['Blueprint Name']}</td>
                    <td>{bp['Material Efficiency']}</td>
                    <td>{bp['Time Efficiency']}</td>
                    <td>{bp['Runs']}</td>
                    <td>{bp['Market Price'].toLocaleString()} ISK</td>
                    <td>{bp['Quantity']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No blueprints match the current filters.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Example: Using the hook in a functional component with auto-fetch
function AutoFetchExample({ characterId, accessToken }) {
  const { data, loading, error, fetchIndustryProfits } = useIndustryProfits();

  useEffect(() => {
    if (characterId && accessToken) {
      fetchIndustryProfits({
        characterId,
        accessToken,
        regionId: 10000002,
        minProfit: 1000000, // 1M ISK minimum
        minROI: 10, // 10% minimum ROI
      });
    }
  }, [characterId, accessToken, fetchIndustryProfits]);

  if (loading) return <div>Loading blueprints...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h2>Your Top Blueprints</h2>
      <p>Found {data.total} profitable blueprints</p>
      {data.blueprints.map((bp) => (
        <div key={bp['Blueprint ID']}>
          {bp['Blueprint Name']} - {bp['Market Price']} ISK
        </div>
      ))}
    </div>
  );
}

// Example: Using with custom filters
function FilteredExample() {
  const { data, fetchIndustryProfits, filterBlueprints } = useIndustryProfits();
  const [filters, setFilters] = useState({
    meLevel: 10, // Only ME 10 blueprints
    minPrice: 1000000, // Minimum 1M ISK
    runsType: 'original', // Only originals
  });

  const filtered = data?.blueprints
    ? filterBlueprints(data.blueprints, filters)
    : [];

  return (
    <div>
      <h2>High-Value Original Blueprints (ME 10)</h2>
      <p>Showing {filtered.length} blueprints</p>
      {/* Display filtered blueprints */}
    </div>
  );
}

export default IndustryProfitsExample;
export { AutoFetchExample, FilteredExample };
