import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import {
  MultiStopPlanner,
  CargoOptimizer,
  FuelCostCalculator,
  RouteRiskAssessment
} from '../components/routing';

/**
 * Route Optimization Page
 * Showcases all route planning and optimization tools
 */
export function RouteOptimizationPage() {
  const [activeTab, setActiveTab] = useState('planner');
  const [sampleTrades] = useState([
    // Sample trade data for cargo optimizer
    { Item: 'Tritanium', Volume: 0.01, 'Net Profit': 100, itemId: 34 },
    { Item: 'Pyerite', Volume: 0.01, 'Net Profit': 150, itemId: 35 },
    { Item: 'Mexallon', Volume: 0.01, 'Net Profit': 200, itemId: 36 },
    { Item: 'Isogen', Volume: 0.01, 'Net Profit': 300, itemId: 37 },
    { Item: 'Nocxium', Volume: 0.01, 'Net Profit': 500, itemId: 38 },
    { Item: 'Zydrine', Volume: 0.01, 'Net Profit': 800, itemId: 39 },
    { Item: 'Megacyte', Volume: 0.01, 'Net Profit': 1200, itemId: 40 },
  ]);

  const tabs = [
    { id: 'planner', label: 'Route Planner', icon: '🗺️' },
    { id: 'cargo', label: 'Cargo Optimizer', icon: '📦' },
    { id: 'fuel', label: 'Fuel Calculator', icon: '⛽' },
    { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
  ];

  return (
    <PageLayout
      title="Route Optimization"
      subtitle="Advanced tools for planning and optimizing your trade routes"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg border transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/20'
                    : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/40 hover:bg-space-dark/70'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Descriptions */}
          <div className="p-4 bg-space-dark/30 border border-accent-cyan/10 rounded-lg">
            {activeTab === 'planner' && (
              <p className="text-sm text-text-secondary">
                Plan multi-stop routes with pickup and delivery points. Optimize route order for shortest path,
                save favorite routes, and get jump estimates.
              </p>
            )}
            {activeTab === 'cargo' && (
              <p className="text-sm text-text-secondary">
                Optimize your cargo selection based on ship capacity. Uses a greedy algorithm to maximize ISK per m³.
                Compare different ships and see what items to prioritize.
              </p>
            )}
            {activeTab === 'fuel' && (
              <p className="text-sm text-text-secondary">
                Calculate isotope fuel costs for jump freighter routes. Supports all JF types, skills,
                and shows net profit after fuel expenses.
              </p>
            )}
            {activeTab === 'risk' && (
              <p className="text-sm text-text-secondary">
                Assess route safety based on security status, known gank hotspots, and cargo value.
                Get alternative safer routes and safety recommendations.
              </p>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'planner' && (
            <MultiStopPlanner className="mb-8" />
          )}

          {activeTab === 'cargo' && (
            <>
              <CargoOptimizer trades={sampleTrades} className="mb-8" />
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Using Sample Data
                </h4>
                <p className="text-xs text-text-secondary">
                  This is showing sample mineral data. To use with real trades, find trades on the Station Trading
                  or Hauling pages first, then come back here to optimize your cargo selection.
                </p>
              </div>
            </>
          )}

          {activeTab === 'fuel' && (
            <FuelCostCalculator className="mb-8" />
          )}

          {activeTab === 'risk' && (
            <RouteRiskAssessment className="mb-8" />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-space-dark/30 border border-accent-cyan/10 rounded-lg">
          <h3 className="text-xl font-display text-text-primary mb-4">
            How to Use Route Optimization Tools
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-accent-cyan mb-2">🗺️ Route Planner</h4>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Add pickup and delivery stops using the buttons</li>
                <li>Select stations using the autocomplete search</li>
                <li>Drag stops to manually reorder</li>
                <li>Click "Optimize Route" for automatic optimization</li>
                <li>Save your route for later use</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-medium text-accent-cyan mb-2">📦 Cargo Optimizer</h4>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Select your ship from the presets or enter custom capacity</li>
                <li>The optimizer automatically selects best ISK/m³ items</li>
                <li>Use "Compare Ships" to see different capacity options</li>
                <li>Copy the optimized item list to clipboard</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-medium text-accent-cyan mb-2">⛽ Fuel Calculator</h4>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Select your jump freighter type</li>
                <li>Set your Jump Drive Calibration and Conservation skills</li>
                <li>Choose origin and destination stations</li>
                <li>Enter cargo value to calculate net profit</li>
                <li>Review jump-by-jump fuel costs</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm font-medium text-accent-cyan mb-2">⚠️ Risk Assessment</h4>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Select your route endpoints</li>
                <li>Enter estimated cargo value</li>
                <li>Choose route preference (shortest, secure, or high-sec)</li>
                <li>Review system-by-system risk analysis</li>
                <li>Check for safer alternative routes</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="text-sm font-medium text-green-400 mb-1">Optimize Routes</h4>
            <p className="text-xs text-text-secondary">
              Automatic route optimization using nearest-neighbor algorithm
            </p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="text-sm font-medium text-blue-400 mb-1">Maximize Profit</h4>
            <p className="text-xs text-text-secondary">
              Select optimal cargo mix for maximum ISK per m³
            </p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="text-2xl mb-2">⛽</div>
            <h4 className="text-sm font-medium text-purple-400 mb-1">Calculate Costs</h4>
            <p className="text-xs text-text-secondary">
              Accurate fuel cost calculations for jump freighters
            </p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-2xl mb-2">🛡️</div>
            <h4 className="text-sm font-medium text-red-400 mb-1">Stay Safe</h4>
            <p className="text-xs text-text-secondary">
              Identify dangerous routes and find safer alternatives
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default RouteOptimizationPage;
