/**
 * AnalyticsDashboard Example
 *
 * Example implementation showing how to integrate all analytics components
 * into a unified dashboard interface.
 */

import { useState } from 'react';
import {
  ProfitPerHourCalculator,
  SeasonalTrends,
  CompetitionTracker,
  MarketShareEstimator,
} from './index';

/**
 * Analytics Dashboard with Tabs
 *
 * This example shows how to create a tabbed interface for all analytics features.
 */
export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('profit');

  const tabs = [
    { id: 'profit', label: 'Profit/Hour', icon: '⏱️' },
    { id: 'trends', label: 'Seasonal Trends', icon: '📊' },
    { id: 'competition', label: 'Competition', icon: '🎯' },
    { id: 'share', label: 'Market Share', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-space-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-text-primary mb-2">
            Advanced Analytics
          </h1>
          <p className="text-text-secondary">
            Track your trading performance and analyze market trends
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass mb-6">
          <div className="flex gap-2 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-cyan text-space-black font-semibold'
                    : 'bg-space-dark text-text-secondary hover:text-text-primary hover:bg-space-mid'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'profit' && <ProfitPerHourCalculator />}
          {activeTab === 'trends' && <SeasonalTrends />}
          {activeTab === 'competition' && <CompetitionTracker />}
          {activeTab === 'share' && <MarketShareEstimator />}
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics Grid Layout
 *
 * Alternative layout showing multiple components in a grid.
 */
export function AnalyticsGrid() {
  return (
    <div className="min-h-screen bg-space-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-display font-bold text-text-primary mb-8">
          Trading Analytics Overview
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Quick Stats
            </h2>
            <ProfitPerHourCalculator />
          </div>

          {/* Competition Monitor */}
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Competition Monitor
            </h2>
            <CompetitionTracker />
          </div>

          {/* Market Share */}
          <div className="glass p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Market Share Analysis
            </h2>
            <MarketShareEstimator />
          </div>

          {/* Seasonal Trends */}
          <div className="glass p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Seasonal Price Patterns
            </h2>
            <SeasonalTrends />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple Page Integration
 *
 * Example of using individual components as standalone pages.
 */
export function ProfitTrackerPage() {
  return (
    <div className="min-h-screen bg-space-black">
      <div className="max-w-6xl mx-auto p-6">
        <ProfitPerHourCalculator />
      </div>
    </div>
  );
}

export function TrendsPage() {
  return (
    <div className="min-h-screen bg-space-black">
      <div className="max-w-6xl mx-auto p-6">
        <SeasonalTrends />
      </div>
    </div>
  );
}

export function CompetitionPage() {
  return (
    <div className="min-h-screen bg-space-black">
      <div className="max-w-6xl mx-auto p-6">
        <CompetitionTracker />
      </div>
    </div>
  );
}

export function MarketSharePage() {
  return (
    <div className="min-h-screen bg-space-black">
      <div className="max-w-6xl mx-auto p-6">
        <MarketShareEstimator />
      </div>
    </div>
  );
}

// Router integration example
export const analyticsRoutes = [
  {
    path: '/analytics',
    element: <AnalyticsDashboard />,
  },
  {
    path: '/analytics/profit',
    element: <ProfitTrackerPage />,
  },
  {
    path: '/analytics/trends',
    element: <TrendsPage />,
  },
  {
    path: '/analytics/competition',
    element: <CompetitionPage />,
  },
  {
    path: '/analytics/market-share',
    element: <MarketSharePage />,
  },
];

export default AnalyticsDashboard;
