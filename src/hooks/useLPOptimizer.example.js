/**
 * Example usage of the useLPOptimizer hook
 */

import React from 'react';
import { useLPOptimizer } from './useLPOptimizer';

/**
 * Example 1: Basic LP store analysis without authentication
 * Find best ISK/LP conversions for a corporation's LP store
 */
function BasicLPOptimizerExample() {
  const lpOptimizer = useLPOptimizer();

  const handleFetchConversions = async () => {
    try {
      // Fetch conversions for Caldari Navy (corporation ID: 1000035)
      // Uses Jita market prices by default
      const result = await lpOptimizer.fetchConversions({
        corporationId: 1000035, // Caldari Navy
        minIskPerLp: 1000, // Only show conversions with at least 1000 ISK/LP
      });

      console.log('Top 10 conversions:', lpOptimizer.getTopConversions(10));
      console.log('Profit potential:', lpOptimizer.calculateProfitPotential());
    } catch (error) {
      console.error('Failed to fetch LP conversions:', error);
    }
  };

  return (
    <div>
      <button onClick={handleFetchConversions} disabled={lpOptimizer.loading}>
        {lpOptimizer.loading ? 'Loading...' : 'Analyze LP Store'}
      </button>

      {lpOptimizer.error && (
        <div className="error">{lpOptimizer.error.message}</div>
      )}

      {lpOptimizer.data && (
        <div>
          <h3>Best LP Conversions</h3>
          <p>Total offers analyzed: {lpOptimizer.data.total_offers}</p>
          <p>Profitable conversions: {lpOptimizer.data.calculated_offers}</p>

          <ul>
            {lpOptimizer.getTopConversions(10).map((conversion) => (
              <li key={conversion.offer_id}>
                <strong>{conversion.item_name}</strong> -
                {conversion.analysis.isk_per_lp.toLocaleString()} ISK/LP
                (Net Profit: {conversion.analysis.net_profit.toLocaleString()} ISK)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Authenticated LP analysis with character LP balance
 * Shows conversions that the character can afford
 */
function AuthenticatedLPOptimizerExample({ accessToken, characterId }) {
  const lpOptimizer = useLPOptimizer({ accessToken });

  const handleFetchAffordableConversions = async () => {
    try {
      // Fetch conversions and include character's LP balance
      const result = await lpOptimizer.fetchConversions({
        corporationId: 1000035, // Caldari Navy
        characterId: characterId,
        regionId: 10000002, // The Forge (Jita)
        minIskPerLp: 500,
      });

      // Get only conversions the character can afford
      const affordable = lpOptimizer.getAffordableConversions();
      console.log('Affordable conversions:', affordable);

      // Calculate potential profit from affordable items
      const profitStats = lpOptimizer.calculateProfitPotential(affordable);
      console.log('Potential profit from LP:', profitStats);
    } catch (error) {
      console.error('Failed to fetch LP conversions:', error);
    }
  };

  return (
    <div>
      <button onClick={handleFetchAffordableConversions} disabled={lpOptimizer.loading}>
        {lpOptimizer.loading ? 'Loading...' : 'Show What I Can Afford'}
      </button>

      {lpOptimizer.data && (
        <div>
          <h3>Your LP Balance</h3>
          <p>Available LP: {lpOptimizer.data.lp_balance?.toLocaleString() || 'N/A'}</p>

          <h3>Affordable Conversions</h3>
          {lpOptimizer.getAffordableConversions().map((conversion) => {
            const details = lpOptimizer.getConversionDetails(conversion.offer_id);
            return (
              <div key={conversion.offer_id}>
                <h4>{conversion.item_name}</h4>
                <p>LP Cost: {conversion.lp_cost.toLocaleString()}</p>
                <p>ISK/LP: {conversion.analysis.isk_per_lp.toLocaleString()}</p>
                <p>Net Profit: {conversion.analysis.net_profit.toLocaleString()} ISK</p>
                <p>ROI: {conversion.analysis.roi}%</p>

                {details.warnings.length > 0 && (
                  <ul className="warnings">
                    {details.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Advanced filtering and analysis
 * Filter conversions by multiple criteria
 */
function AdvancedLPOptimizerExample() {
  const lpOptimizer = useLPOptimizer();
  const [filters, setFilters] = React.useState({
    minIskPerLp: 1000,
    minROI: 50,
    itemName: '',
  });

  const handleFetchConversions = async () => {
    try {
      await lpOptimizer.fetchConversions({
        corporationId: 1000125, // Federation Navy
        regionId: 10000032, // Sinq Laison (Dodixie)
      });
    } catch (error) {
      console.error('Failed to fetch LP conversions:', error);
    }
  };

  // Apply client-side filters
  const filteredConversions = lpOptimizer.filterConversions(filters);

  return (
    <div>
      <button onClick={handleFetchConversions} disabled={lpOptimizer.loading}>
        Analyze Federation Navy LP Store
      </button>

      <div className="filters">
        <label>
          Min ISK/LP:
          <input
            type="number"
            value={filters.minIskPerLp}
            onChange={(e) => setFilters({ ...filters, minIskPerLp: Number(e.target.value) })}
          />
        </label>

        <label>
          Min ROI (%):
          <input
            type="number"
            value={filters.minROI}
            onChange={(e) => setFilters({ ...filters, minROI: Number(e.target.value) })}
          />
        </label>

        <label>
          Search Item:
          <input
            type="text"
            value={filters.itemName}
            onChange={(e) => setFilters({ ...filters, itemName: e.target.value })}
          />
        </label>
      </div>

      {lpOptimizer.data && (
        <div>
          <p>Showing {filteredConversions.length} of {lpOptimizer.data.conversions.length} conversions</p>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>LP Cost</th>
                <th>ISK/LP</th>
                <th>ROI</th>
                <th>Net Profit</th>
                <th>Required Items</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversions.map((conversion) => (
                <tr key={conversion.offer_id}>
                  <td>{conversion.item_name}</td>
                  <td>{conversion.lp_cost.toLocaleString()}</td>
                  <td>{conversion.analysis.isk_per_lp.toLocaleString()}</td>
                  <td>{conversion.analysis.roi}%</td>
                  <td>{conversion.analysis.net_profit.toLocaleString()} ISK</td>
                  <td>
                    {conversion.required_items.length > 0 ? (
                      <ul>
                        {conversion.required_items.map((item) => (
                          <li key={item.type_id}>
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'None'
                    )}
                  </td>
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
 * Common Corporation IDs for LP Stores:
 * - Caldari Navy: 1000035
 * - Federation Navy: 1000125
 * - Imperial Navy (Amarr): 1000080
 * - Republic Fleet (Minmatar): 1000051
 * - Sisters of EVE: 1000109
 * - ORE: 1000094
 * - Thukker Mix: 1000098
 */

export {
  BasicLPOptimizerExample,
  AuthenticatedLPOptimizerExample,
  AdvancedLPOptimizerExample,
};
