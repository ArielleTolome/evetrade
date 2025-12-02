/**
 * Example usage of useContractFinder hook
 * This file demonstrates how to integrate the Contract Opportunity Finder
 * into a React component.
 */

import React, { useState, useEffect } from 'react';
import { useContractFinder } from './useContractFinder';

/**
 * Example: Basic Contract Finder Component
 */
export function BasicContractFinderExample() {
  const {
    contracts,
    loading,
    error,
    statistics,
    search,
    filterByType,
  } = useContractFinder();

  const [regionId, setRegionId] = useState('10000002'); // Jita
  const [contractType, setContractType] = useState('all');

  const handleSearch = async () => {
    await search({
      regionId,
      contractType,
      minProfit: 5000000, // 5M ISK minimum
      maxVolume: 50000,   // 50k m³ max
    });
  };

  return (
    <div>
      <h1>Contract Opportunity Finder</h1>

      {/* Search Controls */}
      <div>
        <select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          <option value="10000002">The Forge (Jita)</option>
          <option value="10000043">Domain (Amarr)</option>
          <option value="10000030">Heimatar (Rens)</option>
          <option value="10000032">Sinq Laison (Dodixie)</option>
        </select>

        <select value={contractType} onChange={(e) => setContractType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="item_exchange">Item Exchange</option>
          <option value="courier">Courier</option>
          <option value="auction">Auction</option>
        </select>

        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search Contracts'}
        </button>
      </div>

      {/* Statistics */}
      {contracts && (
        <div>
          <h2>Statistics</h2>
          <p>Total Contracts: {statistics.totalContracts}</p>
          <p>Item Exchange: {statistics.itemExchangeCount}</p>
          <p>Courier: {statistics.courierCount}</p>
          <p>Auction: {statistics.auctionCount}</p>
          <p>Average Profit: {statistics.avgProfit.toLocaleString()} ISK</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error.message}
        </div>
      )}

      {/* Results */}
      {contracts && contracts.length > 0 && (
        <div>
          <h2>Results ({contracts.length} opportunities)</h2>
          <table>
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Profit</th>
                <th>Volume</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {contracts.slice(0, 20).map((contract) => (
                <tr key={contract['Contract ID']}>
                  <td>{contract['Contract ID']}</td>
                  <td>{contract.Type}</td>
                  <td>{contract.Location || `${contract.From} → ${contract.To}`}</td>
                  <td>{(contract.Profit || contract.Reward || 0).toLocaleString()} ISK</td>
                  <td>{contract.Volume} m³</td>
                  <td>{contract.Expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Courier-Specific Contract Finder
 */
export function CourierContractFinderExample() {
  const {
    contracts,
    loading,
    search,
    sortByProfitability,
    getCourierRoute,
  } = useContractFinder();

  const [sortBy, setSortBy] = useState('iskPerJump');

  useEffect(() => {
    // Auto-search on mount
    search({
      regionId: 10000002,
      contractType: 'courier',
      minRewardPerJump: 1000000, // 1M ISK per jump minimum
      maxCollateral: 500000000,  // 500M ISK max collateral
      maxVolume: 30000,          // 30k m³ max
    });
  }, [search]);

  const courierContracts = contracts || [];
  const sortedContracts = sortByProfitability(courierContracts, sortBy);

  return (
    <div>
      <h1>Courier Contract Finder</h1>

      {loading && <p>Loading courier contracts...</p>}

      {/* Sort Controls */}
      <div>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="iskPerJump">ISK per Jump</option>
          <option value="iskPerM3">ISK per m³</option>
          <option value="jumps">Fewest Jumps</option>
          <option value="volume">Smallest Volume</option>
          <option value="profit">Highest Reward</option>
        </select>
      </div>

      {/* Courier Results */}
      {sortedContracts.length > 0 && (
        <div>
          <h2>Courier Opportunities ({sortedContracts.length})</h2>
          {sortedContracts.map((contract) => {
            const route = getCourierRoute(contract['Contract ID']);

            return (
              <div key={contract['Contract ID']} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>Contract #{contract['Contract ID']}</h3>
                <p><strong>Route:</strong> {route?.from} → {route?.to} ({route?.jumps} jumps)</p>
                <p><strong>Reward:</strong> {route?.reward.toLocaleString()} ISK</p>
                <p><strong>Collateral:</strong> {route?.collateral.toLocaleString()} ISK</p>
                <p><strong>Volume:</strong> {route?.volume} m³</p>
                <p><strong>ISK/Jump:</strong> {route?.iskPerJump.toLocaleString()}</p>
                <p><strong>ISK/m³:</strong> {route?.iskPerM3.toLocaleString()}</p>
                <p><strong>Expires:</strong> {contract.Expires}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Advanced Filtering
 */
export function AdvancedFilteringExample() {
  const {
    contracts,
    loading,
    search,
    filterContracts,
    getTopOpportunities,
  } = useContractFinder();

  const [filters, setFilters] = useState({
    type: 'all',
    minProfit: 1000000,
    maxVolume: 100000,
    maxJumps: 30,
    location: '',
  });

  // Initial search
  useEffect(() => {
    search({
      regionId: 10000002,
      contractType: 'all',
      minProfit: 1000000,
    });
  }, [search]);

  // Apply filters
  const filteredContracts = filterContracts(filters);
  const topOpportunities = getTopOpportunities('all', 10);

  return (
    <div>
      <h1>Advanced Contract Filtering</h1>

      {/* Filter Controls */}
      <div>
        <h2>Filters</h2>

        <label>
          Contract Type:
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">All</option>
            <option value="item_exchange">Item Exchange</option>
            <option value="courier">Courier</option>
            <option value="auction">Auction</option>
          </select>
        </label>

        <label>
          Min Profit:
          <input
            type="number"
            value={filters.minProfit}
            onChange={(e) => setFilters({ ...filters, minProfit: Number(e.target.value) })}
          />
        </label>

        <label>
          Max Volume:
          <input
            type="number"
            value={filters.maxVolume}
            onChange={(e) => setFilters({ ...filters, maxVolume: Number(e.target.value) })}
          />
        </label>

        <label>
          Max Jumps:
          <input
            type="number"
            value={filters.maxJumps}
            onChange={(e) => setFilters({ ...filters, maxJumps: Number(e.target.value) })}
          />
        </label>

        <label>
          Location:
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="e.g., Jita"
          />
        </label>
      </div>

      {/* Top Opportunities */}
      {topOpportunities.length > 0 && (
        <div>
          <h2>Top 10 Opportunities</h2>
          <ul>
            {topOpportunities.map((contract) => (
              <li key={contract['Contract ID']}>
                {contract.Type} - {contract['Contract ID']} - Profit: {(contract.Profit || contract.Reward || 0).toLocaleString()} ISK
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filtered Results */}
      {filteredContracts.length > 0 && (
        <div>
          <h2>Filtered Results ({filteredContracts.length})</h2>
          <p>Showing contracts matching your criteria...</p>
          {/* Render filtered contracts here */}
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
}

/**
 * Example: Item Exchange with Details
 */
export function ItemExchangeDetailExample() {
  const { contracts, loading, search } = useContractFinder();

  useEffect(() => {
    search({
      regionId: 10000002,
      contractType: 'item_exchange',
      minProfit: 10000000, // 10M ISK minimum
    });
  }, [search]);

  const itemContracts = contracts?.filter((c) => c.Type === 'Item Exchange') || [];

  return (
    <div>
      <h1>Item Exchange Opportunities</h1>

      {loading && <p>Analyzing item exchange contracts...</p>}

      {itemContracts.map((contract) => (
        <div key={contract['Contract ID']} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
          <h3>Contract #{contract['Contract ID']}</h3>
          <p><strong>Location:</strong> {contract.Location}</p>
          <p><strong>Items:</strong> {contract.Items} items</p>
          <p><strong>Contract Price:</strong> {contract['Contract Price'].toLocaleString()} ISK</p>
          <p><strong>Market Value:</strong> {contract['Market Value'].toLocaleString()} ISK</p>
          <p><strong>Profit:</strong> {contract.Profit.toLocaleString()} ISK ({contract['Profit %']}%)</p>
          <p><strong>Volume:</strong> {contract.Volume} m³</p>
          <p><strong>Expires:</strong> {contract.Expires}</p>

          {/* Item Details */}
          {contract.itemDetails && contract.itemDetails.length > 0 && (
            <div>
              <h4>Items in Contract:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Market Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.itemDetails.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.marketPrice.toLocaleString()} ISK</td>
                      <td>{item.totalValue.toLocaleString()} ISK</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Example: Statistics Dashboard
 */
export function StatisticsDashboardExample() {
  const { contracts, statistics, search, loading } = useContractFinder();

  useEffect(() => {
    search({ regionId: 10000002 });
  }, [search]);

  return (
    <div>
      <h1>Contract Statistics Dashboard</h1>

      {loading && <p>Loading contract data...</p>}

      {contracts && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h2>Total Contracts</h2>
            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{statistics.totalContracts}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h2>Item Exchange</h2>
            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{statistics.itemExchangeCount}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h2>Courier</h2>
            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{statistics.courierCount}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h2>Auction</h2>
            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{statistics.auctionCount}</p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h2>Total Profit Potential</h2>
            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>
              {statistics.totalProfit.toLocaleString()} ISK
            </p>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h2>Average Profit</h2>
            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>
              {statistics.avgProfit.toLocaleString()} ISK
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default {
  BasicContractFinderExample,
  CourierContractFinderExample,
  AdvancedFilteringExample,
  ItemExchangeDetailExample,
  StatisticsDashboardExample,
};
