/**
 * Market Analysis Components - Usage Examples
 *
 * This file demonstrates how to use the 4 Market Analysis components
 * in various scenarios within the EVETrade application.
 */

import React from 'react';
import {
  MarketSpreadAnalyzer,
  PriceVolatilityIndex,
  ManipulationDetector,
  RegionalPriceComparison,
} from './index';

/**
 * Example 1: Complete Market Analysis Dashboard
 * Shows all 4 components working together to provide comprehensive market insights
 */
export function MarketAnalysisDashboard() {
  // Example market data for Tritanium in The Forge
  const marketData = {
    typeId: 34, // Tritanium
    regionId: 10000002, // The Forge
    bidPrice: 5.50,
    askPrice: 5.75,
    currentPrice: 5.62,
    previousPrice: 5.45,
    volume: 50000000,
    averageVolume: 45000000,
    historicalSpread: 3.2,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-accent-cyan mb-6">
        Market Analysis - Tritanium (The Forge)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Spread Analyzer */}
        <MarketSpreadAnalyzer
          bidPrice={marketData.bidPrice}
          askPrice={marketData.askPrice}
          historicalSpread={marketData.historicalSpread}
        />

        {/* Price Volatility Index */}
        <PriceVolatilityIndex
          typeId={marketData.typeId}
          regionId={marketData.regionId}
        />

        {/* Manipulation Detector */}
        <ManipulationDetector
          currentPrice={marketData.currentPrice}
          previousPrice={marketData.previousPrice}
          volume={marketData.volume}
          averageVolume={marketData.averageVolume}
        />

        {/* Regional Price Comparison */}
        <RegionalPriceComparison
          typeId={marketData.typeId}
          volume={1000}
        />
      </div>
    </div>
  );
}

/**
 * Example 2: Trading Table with Compact Analysis
 * Shows how to use compact mode in a data table
 */
export function TradingTableExample() {
  const trades = [
    {
      id: 1,
      itemName: 'Tritanium',
      typeId: 34,
      bidPrice: 5.50,
      askPrice: 5.75,
      currentPrice: 5.62,
      previousPrice: 5.45,
      volume: 50000000,
      averageVolume: 45000000,
    },
    {
      id: 2,
      itemName: 'Pyerite',
      typeId: 35,
      bidPrice: 8.20,
      askPrice: 8.50,
      currentPrice: 8.35,
      previousPrice: 7.80,
      volume: 20000000,
      averageVolume: 18000000,
    },
    {
      id: 3,
      itemName: 'Mexallon',
      typeId: 36,
      bidPrice: 45.00,
      askPrice: 46.50,
      currentPrice: 45.75,
      previousPrice: 45.20,
      volume: 5000000,
      averageVolume: 4800000,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-xl font-bold text-accent-cyan mb-4">
        Active Trading Opportunities
      </h2>

      <div className="bg-space-dark/30 rounded-lg border border-accent-cyan/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-space-mid/30 border-b border-accent-cyan/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Spread</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Volatility</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Manipulation</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary">Arbitrage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-cyan/10">
            {trades.map(trade => (
              <tr key={trade.id} className="hover:bg-space-mid/20 transition-colors">
                <td className="px-4 py-3 text-sm text-text-primary font-medium">
                  {trade.itemName}
                </td>
                <td className="px-4 py-3">
                  <MarketSpreadAnalyzer
                    bidPrice={trade.bidPrice}
                    askPrice={trade.askPrice}
                    compact
                  />
                </td>
                <td className="px-4 py-3">
                  <PriceVolatilityIndex
                    typeId={trade.typeId}
                    regionId={10000002}
                    compact
                  />
                </td>
                <td className="px-4 py-3">
                  <ManipulationDetector
                    currentPrice={trade.currentPrice}
                    previousPrice={trade.previousPrice}
                    volume={trade.volume}
                    averageVolume={trade.averageVolume}
                    compact
                  />
                </td>
                <td className="px-4 py-3">
                  <RegionalPriceComparison
                    typeId={trade.typeId}
                    compact
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Example 3: Single Item Deep Dive
 * Detailed analysis of a specific item with all metrics
 */
export function ItemDeepDive({ typeId, itemName }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-accent-cyan mb-2">{itemName}</h1>
      <p className="text-sm text-text-secondary mb-6">
        Type ID: {typeId} | Region: The Forge
      </p>

      <div className="space-y-4">
        {/* Spread Analysis */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">Bid/Ask Spread</h3>
          <MarketSpreadAnalyzer
            bidPrice={1250000}
            askPrice={1500000}
            historicalSpread={15}
          />
        </div>

        {/* Volatility Analysis */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">Price Volatility</h3>
          <PriceVolatilityIndex
            typeId={typeId}
            regionId={10000002}
          />
        </div>

        {/* Manipulation Detection */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">Manipulation Check</h3>
          <ManipulationDetector
            currentPrice={1500000}
            previousPrice={1200000}
            volume={5000}
            averageVolume={3000}
            largeOrders={[
              { volume: 1500, price: 1450000, is_buy_order: true },
            ]}
          />
        </div>

        {/* Regional Price Comparison */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">Regional Prices</h3>
          <RegionalPriceComparison
            typeId={typeId}
            volume={500}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Risk Assessment Widget
 * Combined risk indicator for quick decision making
 */
export function RiskAssessmentWidget({ trade }) {
  return (
    <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
      <h4 className="text-sm font-medium text-accent-cyan mb-3">
        Quick Risk Assessment
      </h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Market Spread</span>
          <MarketSpreadAnalyzer
            bidPrice={trade.bidPrice}
            askPrice={trade.askPrice}
            compact
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Volatility</span>
          <PriceVolatilityIndex
            typeId={trade.typeId}
            regionId={trade.regionId}
            compact
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Manipulation Risk</span>
          <ManipulationDetector
            currentPrice={trade.currentPrice}
            previousPrice={trade.previousPrice}
            volume={trade.volume}
            averageVolume={trade.averageVolume}
            compact
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Best Arbitrage</span>
          <RegionalPriceComparison
            typeId={trade.typeId}
            volume={trade.volume}
            compact
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 5: Station Trading Dashboard
 * Focused on spread and manipulation for day traders
 */
export function StationTradingDashboard() {
  const watchlist = [
    { itemName: 'PLEX', typeId: 44992, bidPrice: 4500000, askPrice: 4550000 },
    { itemName: 'Skill Injector', typeId: 40520, bidPrice: 750000000, askPrice: 755000000 },
    { itemName: 'Omega', typeId: 49732, bidPrice: 1800000000, askPrice: 1820000000 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-bold text-accent-cyan mb-4">
        Station Trading Watchlist
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((item, idx) => (
          <div
            key={idx}
            className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10"
          >
            <h3 className="text-sm font-medium text-text-primary mb-3">
              {item.itemName}
            </h3>

            <MarketSpreadAnalyzer
              bidPrice={item.bidPrice}
              askPrice={item.askPrice}
            />

            <div className="mt-3 pt-3 border-t border-accent-cyan/10">
              <ManipulationDetector
                currentPrice={item.askPrice}
                previousPrice={item.bidPrice * 1.05}
                volume={1000}
                averageVolume={950}
                compact={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 6: Hauling Route Planner
 * Focused on regional comparison and arbitrage
 */
export function HaulingRoutePlanner() {
  const commodities = [
    { itemName: 'Tritanium', typeId: 34, volume: 10000 },
    { itemName: 'Pyerite', typeId: 35, volume: 8000 },
    { itemName: 'Mexallon', typeId: 36, volume: 5000 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-xl font-bold text-accent-cyan mb-4">
        Best Hauling Routes
      </h2>

      <div className="space-y-4">
        {commodities.map((item, idx) => (
          <div key={idx} className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
            <h3 className="text-sm font-medium text-text-primary mb-3">
              {item.itemName} ({item.volume} units)
            </h3>

            <RegionalPriceComparison
              typeId={item.typeId}
              volume={item.volume}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  MarketAnalysisDashboard,
  TradingTableExample,
  ItemDeepDive,
  RiskAssessmentWidget,
  StationTradingDashboard,
  HaulingRoutePlanner,
};
