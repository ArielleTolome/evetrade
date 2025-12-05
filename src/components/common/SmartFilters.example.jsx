/**
 * SmartFilters Component - Usage Example
 *
 * This file demonstrates how to use the SmartFilters component
 * with trading data filtering.
 */

import { useState, useMemo } from 'react';
import { SmartFilters } from './SmartFilters';

/**
 * Example: Using SmartFilters with TradingTable
 */
export function TradingPageWithFilters() {
  const [tradingData, _setTradingData] = useState([]);
  const [filters, setFilters] = useState({});

  // Apply filters to trading data
  const filteredData = useMemo(() => {
    if (!tradingData || tradingData.length === 0) return [];

    return tradingData.filter(row => {
      const volume = row['Volume'] || 0;
      const margin = row['Gross Margin'] || 0;
      const profit = row['Net Profit'] || 0;

      // Hide scams (volume = 1)
      if (filters.hideScams && volume === 1) {
        return false;
      }

      // Hide low volume (< 10)
      if (filters.hideLowVolume && volume < 10) {
        return false;
      }

      // High quality only (good margins AND volume)
      if (filters.highQualityOnly) {
        if (margin < 10 || volume < 50) {
          return false;
        }
      }

      // Verified only (volume > 100)
      if (filters.verifiedOnly && volume <= 100) {
        return false;
      }

      // Volume range
      if (filters.minVolume && volume < filters.minVolume) {
        return false;
      }
      if (filters.maxVolume !== null && volume > filters.maxVolume) {
        return false;
      }

      // Margin range
      if (filters.minMargin && margin < filters.minMargin) {
        return false;
      }
      if (filters.maxMargin !== null && margin > filters.maxMargin) {
        return false;
      }

      // Profit range
      if (filters.minProfit && profit < filters.minProfit) {
        return false;
      }
      if (filters.maxProfit !== null && profit > filters.maxProfit) {
        return false;
      }

      // Risk level filtering (example implementation)
      if (filters.riskLevels && filters.riskLevels.length < 4) {
        const riskLevel = calculateRiskLevel(row);
        if (!filters.riskLevels.includes(riskLevel)) {
          return false;
        }
      }

      return true;
    });
  }, [tradingData, filters]);

  return (
    <div>
      <SmartFilters
        onChange={setFilters}
        initialFilters={filters}
        data={tradingData}
      />

      {/* Your TradingTable component */}
      <TradingTable data={filteredData} />
    </div>
  );
}

/**
 * Example: Calculate risk level based on trading data
 * This is a sample implementation - adjust based on your needs
 */
function calculateRiskLevel(row) {
  const volume = row['Volume'] || 0;
  const margin = row['Gross Margin'] || 0;

  // Low risk: high volume, good margins
  if (volume >= 100 && margin >= 10) {
    return 'low';
  }

  // Medium risk: moderate volume and margins
  if (volume >= 50 && margin >= 5) {
    return 'medium';
  }

  // High risk: low volume or thin margins
  if (volume >= 10 || margin >= 3) {
    return 'high';
  }

  // Extreme risk: very low volume or very thin margins
  return 'extreme';
}

/**
 * Example: Filter configuration object structure
 */
export const exampleFilters = {
  // Quick toggles
  hideScams: true,              // Filters out volume=1 trades
  hideLowVolume: false,          // Filters trades with volume < 10
  highQualityOnly: false,        // Shows only trades with good margins AND volume
  verifiedOnly: false,           // Shows trades with volume > 100

  // Range filters
  minVolume: 0,                  // Minimum volume
  maxVolume: null,               // Maximum volume (null = no limit)
  minMargin: 0,                  // Minimum margin percentage
  maxMargin: 100,                // Maximum margin percentage
  minProfit: 0,                  // Minimum net profit (ISK)
  maxProfit: null,               // Maximum net profit (null = no limit)

  // Risk levels
  riskLevels: ['low', 'medium', 'high', 'extreme'],
};

/**
 * Example: Preset configurations
 */
export const presetExamples = {
  // Safe Trades - Conservative, lower risk
  safe: {
    minVolume: 50,
    maxMargin: 30,
    minMargin: 10,
    hideScams: true,
    riskLevels: ['low', 'medium'],
  },

  // High Profit - Focus on maximum ISK gain
  highProfit: {
    minProfit: 10000000, // 10M ISK
    riskLevels: ['low', 'medium', 'high', 'extreme'],
  },

  // Quick Flips - Fast turnover trades
  quickFlips: {
    minVolume: 100,
    minMargin: 5,
    maxMargin: 20,
    hideScams: true,
    riskLevels: ['low', 'medium'],
  },

  // Hidden Gems - High margin, moderate volume
  hiddenGems: {
    minMargin: 20,
    minVolume: 20,
    maxVolume: 200,
    riskLevels: ['low', 'medium', 'high'],
  },
};
