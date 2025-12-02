/**
 * useMarketVelocity Hook - Usage Examples
 *
 * This file demonstrates various ways to use the useMarketVelocity hook
 * to identify high-turnover trading opportunities in EVE Online.
 */

import React from 'react';
import { useMarketVelocity } from './useMarketVelocity';
import { TRADE_HUBS } from '../utils/constants';

/**
 * Example 1: Basic Usage - Analyze specific items in Jita
 */
function BasicVelocityAnalysis() {
  const jitaRegionId = TRADE_HUBS[0].regionId; // 10000002

  const { velocities, loading, error, refresh } = useMarketVelocity(jitaRegionId, {
    typeIds: [34, 35, 36, 37, 38], // Tritanium, Pyerite, Mexallon, Isogen, Nocxium
  });

  if (loading) return <div>Analyzing market velocity...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Market Velocity Analysis</h2>
      <button onClick={refresh}>Refresh Data</button>

      {velocities.map(item => (
        <div key={item.typeId}>
          <h3>Type ID: {item.typeId}</h3>
          <p>Velocity Score: {item.velocityScore}/100</p>
          <p>Daily Volume (7d): {item.dailyVolume7d.toLocaleString()}</p>
          <p>Days to Sell: {item.daysToSell}</p>
          <p>Current Spread: {item.currentSpread}%</p>
          <p>Competition: {item.competitionLevel}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 2: Filtered High-Velocity Opportunities
 * Find items with high turnover, good margins, and low competition
 */
function HighVelocityOpportunities() {
  const jitaRegionId = 10000002;

  // List of common trading items to analyze
  const tradingItems = [
    34, 35, 36, 37, 38, 39, 40, // Minerals
    44, // Enriched Uranium
    11399, // Morphite
    16272, 16273, 16274, // Datacores
  ];

  const {
    velocities,
    loading,
    error,
    statistics,
    topOpportunities
  } = useMarketVelocity(jitaRegionId, {
    typeIds: tradingItems,
    minVolume: 10000,           // At least 10k daily volume
    minVelocityScore: 60,       // High velocity score
    minSpread: 3,               // At least 3% spread
    competitionFilter: 'low',   // Low competition only
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>High-Velocity Quick Flip Opportunities</h2>

      <div>
        <h3>Statistics</h3>
        <p>Total Items: {statistics.totalItems}</p>
        <p>Average Velocity Score: {statistics.averageVelocityScore}</p>
        <p>Average Daily Volume: {statistics.averageDailyVolume.toLocaleString()}</p>
        <p>Average Days to Sell: {statistics.averageDaysToSell}</p>
        <p>High Velocity Items (70+): {statistics.highVelocityCount}</p>
      </div>

      <div>
        <h3>Top 10 Opportunities</h3>
        {topOpportunities.map((item, index) => (
          <div key={item.typeId}>
            <h4>#{index + 1} - Type ID: {item.typeId}</h4>
            <p>Velocity Score: {item.velocityScore}/100</p>
            <p>Daily Volume: {item.dailyVolume7d.toLocaleString()}</p>
            <p>Days to Sell: {item.daysToSell}</p>
            <p>Spread: {item.currentSpread}%</p>
            <p>Best Buy: {item.bestBuyPrice.toLocaleString()} ISK</p>
            <p>Best Sell: {item.bestSellPrice.toLocaleString()} ISK</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 3: Multi-Region Comparison
 * Compare velocity across different trade hubs
 */
function MultiRegionVelocity() {
  const typeId = 34; // Tritanium

  // Analyze Jita
  const jitaAnalysis = useMarketVelocity(10000002, {
    typeIds: [typeId],
  });

  // Analyze Amarr
  const amarrAnalysis = useMarketVelocity(10000043, {
    typeIds: [typeId],
  });

  // Analyze Dodixie
  const dodixieAnalysis = useMarketVelocity(10000032, {
    typeIds: [typeId],
  });

  if (jitaAnalysis.loading || amarrAnalysis.loading || dodixieAnalysis.loading) {
    return <div>Loading multi-region analysis...</div>;
  }

  const regions = [
    { name: 'Jita', data: jitaAnalysis },
    { name: 'Amarr', data: amarrAnalysis },
    { name: 'Dodixie', data: dodixieAnalysis },
  ];

  return (
    <div>
      <h2>Multi-Region Velocity Comparison</h2>
      <p>Item: Type ID {typeId}</p>

      {regions.map(({ name, data }) => (
        <div key={name}>
          <h3>{name}</h3>
          {data.velocities[0] && (
            <>
              <p>Velocity Score: {data.velocities[0].velocityScore}/100</p>
              <p>Daily Volume: {data.velocities[0].dailyVolume7d.toLocaleString()}</p>
              <p>Days to Sell: {data.velocities[0].daysToSell}</p>
              <p>Spread: {data.velocities[0].currentSpread}%</p>
              <p>Competition: {data.velocities[0].competitionLevel}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Example 4: Volume Trend Analysis
 * Track items with increasing volume trends
 */
function VolumeTemAnalysis() {
  const jitaRegionId = 10000002;

  const tradingItems = [
    34, 35, 36, 37, 38, 39, 40, // Minerals
  ];

  const { velocities, loading } = useMarketVelocity(jitaRegionId, {
    typeIds: tradingItems,
  });

  if (loading) return <div>Loading...</div>;

  // Filter for increasing volume trends
  const increasingVolume = velocities.filter(
    item => item.volumeTrend === 'increasing'
  );

  return (
    <div>
      <h2>Items with Increasing Volume</h2>
      <p>These items are gaining trading momentum</p>

      {increasingVolume.map(item => (
        <div key={item.typeId}>
          <h3>Type ID: {item.typeId}</h3>
          <p>Volume Trend: {item.volumeTrend} ({item.volumeTrendPercent > 0 ? '+' : ''}{item.volumeTrendPercent}%)</p>
          <p>7-day Volume: {item.dailyVolume7d.toLocaleString()}</p>
          <p>30-day Volume: {item.dailyVolume30d.toLocaleString()}</p>
          <p>Velocity Score: {item.velocityScore}/100</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 5: Using Utility Functions Directly
 * Access calculation functions for custom analysis
 */
function CustomVelocityCalculation() {
  const jitaRegionId = 10000002;

  const {
    velocities,
    calculateAverageDailyVolume,
    calculateDaysToSell,
    calculateVelocityScore,
  } = useMarketVelocity(jitaRegionId, {
    typeIds: [34], // Tritanium
  });

  // You can use the utility functions for custom calculations
  // For example, calculating custom metrics:

  const customAnalysis = velocities.map(item => {
    // Custom calculation: ISK velocity (daily volume * average price)
    const avgPrice = (item.bestBuyPrice + item.bestSellPrice) / 2;
    const iskVelocity = item.dailyVolume7d * avgPrice;

    // Custom ROI estimation
    const potentialProfit = item.bestSellPrice - item.bestBuyPrice;
    const dailyROI = (potentialProfit / item.bestBuyPrice) * 100;

    return {
      typeId: item.typeId,
      velocityScore: item.velocityScore,
      iskVelocity: Math.round(iskVelocity),
      dailyROI: Math.round(dailyROI * 100) / 100,
      daysToSell: item.daysToSell,
    };
  });

  return (
    <div>
      <h2>Custom Velocity Analysis</h2>
      {customAnalysis.map(item => (
        <div key={item.typeId}>
          <h3>Type ID: {item.typeId}</h3>
          <p>Velocity Score: {item.velocityScore}/100</p>
          <p>ISK Velocity: {item.iskVelocity.toLocaleString()} ISK/day</p>
          <p>Daily ROI: {item.dailyROI}%</p>
          <p>Days to Sell: {item.daysToSell}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 6: Real-time Monitoring Dashboard
 * Auto-refresh velocity data for live monitoring
 */
function VelocityMonitoringDashboard() {
  const jitaRegionId = 10000002;
  const [autoRefresh, setAutoRefresh] = React.useState(false);

  const {
    velocities,
    loading,
    lastUpdated,
    refresh,
    topOpportunities
  } = useMarketVelocity(jitaRegionId, {
    typeIds: [34, 35, 36, 37, 38],
    minVelocityScore: 50,
  });

  // Auto-refresh every 5 minutes
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  return (
    <div>
      <h2>Velocity Monitoring Dashboard</h2>

      <div>
        <button onClick={refresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Now'}
        </button>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (5 min)
        </label>
        {lastUpdated && (
          <p>Last Updated: {lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>

      <div>
        <h3>Live Top Opportunities</h3>
        {topOpportunities.map((item, index) => (
          <div key={item.typeId} style={{
            padding: '10px',
            backgroundColor: item.velocityScore >= 80 ? '#d4edda' :
                           item.velocityScore >= 60 ? '#fff3cd' : '#f8f9fa'
          }}>
            <strong>#{index + 1} - Type {item.typeId}</strong>
            <span style={{ marginLeft: '10px' }}>
              Score: {item.velocityScore} |
              Volume: {item.dailyVolume7d.toLocaleString()} |
              Days: {item.daysToSell} |
              Spread: {item.currentSpread}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 7: Integration with Existing Trading Page
 * Add velocity analysis to station trading workflow
 */
function EnhancedStationTrading() {
  const [selectedStation, setSelectedStation] = React.useState(60003760); // Jita 4-4
  const [selectedItems, setSelectedItems] = React.useState([34, 35, 36]);

  const jitaRegionId = 10000002;

  const { velocities, loading, statistics } = useMarketVelocity(jitaRegionId, {
    typeIds: selectedItems,
    minVolume: 1000,
  });

  return (
    <div>
      <h2>Station Trading with Velocity Analysis</h2>

      <div>
        <h3>Velocity Overview</h3>
        <p>Items Analyzed: {statistics.totalItems}</p>
        <p>Average Velocity: {statistics.averageVelocityScore}/100</p>
        <p>Avg Days to Sell: {statistics.averageDaysToSell}</p>
      </div>

      <div>
        <h3>Trading Recommendations</h3>
        {velocities.map(item => {
          // Provide trading advice based on velocity metrics
          let recommendation = '';
          if (item.velocityScore >= 70) {
            recommendation = 'Excellent quick-flip opportunity';
          } else if (item.velocityScore >= 50) {
            recommendation = 'Good for active trading';
          } else if (item.velocityScore >= 30) {
            recommendation = 'Moderate turnover, requires patience';
          } else {
            recommendation = 'Slow mover, high capital tie-up risk';
          }

          return (
            <div key={item.typeId}>
              <h4>Type ID: {item.typeId}</h4>
              <p><strong>Recommendation:</strong> {recommendation}</p>
              <p>Velocity Score: {item.velocityScore}/100</p>
              <p>Expected Days to Sell: {item.daysToSell}</p>
              <p>Daily Volume: {item.dailyVolume7d.toLocaleString()}</p>
              <p>Competition Level: {item.competitionLevel}</p>
              <p>Current Spread: {item.currentSpread}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export {
  BasicVelocityAnalysis,
  HighVelocityOpportunities,
  MultiRegionVelocity,
  VolumeTemAnalysis,
  CustomVelocityCalculation,
  VelocityMonitoringDashboard,
  EnhancedStationTrading,
};
