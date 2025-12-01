/**
 * TradeRiskScore Demo/Test Component
 *
 * This component demonstrates all the different modes and configurations
 * of the TradeRiskScore component. Use it for:
 * - Visual testing during development
 * - Documentation/showcase
 * - Integration testing
 *
 * To use: Import this into a page and render it
 * Example: <TradeRiskScoreDemo />
 */

import { useState } from 'react';
import TradeRiskScore, {
  TradeRiskBadge,
  calculateRiskFactors,
  calculateOverallRisk
} from './TradeRiskScore';

/**
 * Sample trade data representing different risk scenarios
 */
const SAMPLE_TRADES = {
  lowRisk: {
    'Type Name': 'Tritanium',
    'Volume': 10000,
    'Gross Margin': 15.5,
    'Buy Price': 5.50,
    'Sell Price': 6.35,
    'Net Profit': 8500000,
  },
  mediumRisk: {
    'Type Name': 'Megathron',
    'Volume': 25,
    'Gross Margin': 8.2,
    'Buy Price': 125000000,
    'Sell Price': 135250000,
    'Net Profit': 256250000,
  },
  highRisk: {
    'Type Name': 'Rare Blueprint',
    'Volume': 3,
    'Gross Margin': 38.5,
    'Buy Price': 850000000,
    'Sell Price': 1177250000,
    'Net Profit': 981750000,
  },
  extremeRisk: {
    'Type Name': 'Suspicious Item',
    'Volume': 1,
    'Gross Margin': 75.8,
    'Buy Price': 500000,
    'Sell Price': 879000,
    'Net Profit': 379000,
  },
  competitiveMarket: {
    'Type Name': 'PLEX',
    'Volume': 15000,
    'Gross Margin': 2.1,
    'Buy Price': 3500000,
    'Sell Price': 3573500,
    'Net Profit': 1102500000,
  },
  volatileMarket: {
    'Type Name': 'Volatile Item',
    'Volume': 50,
    'Gross Margin': 45.0,
    'Buy Price': 10000000,
    'Sell Price': 14500000,
    'Net Profit': 225000000,
  },
};

/**
 * Demo Section Component
 */
function DemoSection({ title, description, children }) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-accent-cyan mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Main Demo Component
 */
export function TradeRiskScoreDemo() {
  const [selectedTrade, setSelectedTrade] = useState('lowRisk');
  const [showCompact, setShowCompact] = useState(false);
  const [showGauge, setShowGauge] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [expandable, setExpandable] = useState(false);

  const currentTrade = SAMPLE_TRADES[selectedTrade];

  // Calculate risk for display
  const factors = calculateRiskFactors(currentTrade);
  const { totalScore, level } = calculateOverallRisk(factors);

  return (
    <div className="min-h-screen bg-space-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-accent-cyan mb-2">
            TradeRiskScore Component Demo
          </h1>
          <p className="text-text-secondary">
            Interactive demonstration of the TradeRiskScore component with various configurations
          </p>
        </div>

        {/* Controls */}
        <DemoSection
          title="Controls"
          description="Adjust these settings to see different component configurations"
        >
          <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Trade Selector */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Sample Trade
                </label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full bg-space-dark border border-accent-cyan/20 rounded px-3 py-2 text-text-primary"
                >
                  <option value="lowRisk">Low Risk (Score ~18)</option>
                  <option value="mediumRisk">Medium Risk (Score ~35)</option>
                  <option value="highRisk">High Risk (Score ~62)</option>
                  <option value="extremeRisk">Extreme Risk (Score ~88)</option>
                  <option value="competitiveMarket">Competitive Market</option>
                  <option value="volatileMarket">Volatile Market</option>
                </select>
              </div>

              {/* Display Mode */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Display Mode
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={showCompact}
                      onChange={(e) => setShowCompact(e.target.checked)}
                      className="rounded"
                    />
                    Compact Mode
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={expandable}
                      onChange={(e) => setExpandable(e.target.checked)}
                      disabled={showCompact}
                      className="rounded"
                    />
                    Expandable
                  </label>
                </div>
              </div>

              {/* Display Options */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Display Options (Full Mode)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={showGauge}
                      onChange={(e) => setShowGauge(e.target.checked)}
                      disabled={showCompact}
                      className="rounded"
                    />
                    Show Gauge
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="checkbox"
                      checked={showBreakdown}
                      onChange={(e) => setShowBreakdown(e.target.checked)}
                      disabled={showCompact}
                      className="rounded"
                    />
                    Show Breakdown
                  </label>
                </div>
              </div>
            </div>

            {/* Current Trade Info */}
            <div className="mt-4 pt-4 border-t border-accent-cyan/10">
              <h3 className="text-sm font-medium text-text-secondary mb-2">
                Current Trade Data
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                <div>
                  <div className="text-text-secondary">Volume</div>
                  <div className="text-text-primary font-mono">
                    {currentTrade['Volume']}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Margin</div>
                  <div className="text-text-primary font-mono">
                    {currentTrade['Gross Margin'].toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Buy Price</div>
                  <div className="text-text-primary font-mono">
                    {currentTrade['Buy Price'].toLocaleString()} ISK
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Risk Score</div>
                  <div className="text-text-primary font-mono font-bold">
                    {totalScore}/100
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Risk Level</div>
                  <div className="text-text-primary font-mono font-bold capitalize">
                    {level}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DemoSection>

        {/* Live Preview */}
        <DemoSection
          title="Live Preview"
          description="See the component render with your current settings"
        >
          <div className="bg-space-dark/30 rounded-lg p-6 border border-accent-cyan/10">
            <TradeRiskScore
              trade={currentTrade}
              compact={showCompact}
              showGauge={showGauge && !showCompact}
              showBreakdown={showBreakdown && !showCompact}
              expandable={expandable && !showCompact}
            />
          </div>
        </DemoSection>

        {/* All Risk Levels Side by Side */}
        <DemoSection
          title="All Risk Levels"
          description="Compact badges for all risk scenarios"
        >
          <div className="bg-space-dark/30 rounded-lg p-6 border border-accent-cyan/10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(SAMPLE_TRADES).map(([key, trade]) => {
                const factors = calculateRiskFactors(trade);
                const { totalScore, level } = calculateOverallRisk(factors);
                return (
                  <div key={key} className="text-center">
                    <div className="text-xs text-text-secondary mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="flex justify-center">
                      <TradeRiskBadge trade={trade} />
                    </div>
                    <div className="text-xs text-text-secondary/70 mt-1">
                      {totalScore}/100
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DemoSection>

        {/* Full Display Grid */}
        <DemoSection
          title="Full Display Modes"
          description="All sample trades with full risk assessment display"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(SAMPLE_TRADES).map(([key, trade]) => (
              <div key={key}>
                <h3 className="text-sm font-medium text-text-secondary mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} - {trade['Type Name']}
                </h3>
                <TradeRiskScore
                  trade={trade}
                  showGauge={true}
                  showBreakdown={true}
                  expandable={false}
                />
              </div>
            ))}
          </div>
        </DemoSection>

        {/* Table Integration Example */}
        <DemoSection
          title="Table Integration"
          description="Example of how the component looks in a data table"
        >
          <div className="bg-space-dark/30 rounded-lg overflow-hidden border border-accent-cyan/10">
            <table className="w-full text-sm">
              <thead className="bg-space-dark/50">
                <tr>
                  <th className="px-4 py-3 text-left text-text-secondary font-medium">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right text-text-secondary font-medium">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-right text-text-secondary font-medium">
                    Margin
                  </th>
                  <th className="px-4 py-3 text-right text-text-secondary font-medium">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-center text-text-secondary font-medium">
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SAMPLE_TRADES).map(([key, trade], index) => (
                  <tr
                    key={key}
                    className={`${
                      index % 2 === 0 ? 'bg-space-dark/20' : 'bg-space-dark/10'
                    } hover:bg-space-dark/40 transition-colors`}
                  >
                    <td className="px-4 py-3 text-text-primary">
                      {trade['Type Name']}
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary font-mono">
                      {trade['Volume'].toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-accent-cyan font-mono">
                      {trade['Gross Margin'].toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right text-green-400 font-mono">
                      {(trade['Net Profit'] / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <TradeRiskBadge trade={trade} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DemoSection>

        {/* Code Examples */}
        <DemoSection
          title="Code Examples"
          description="Copy these snippets to use in your code"
        >
          <div className="space-y-4">
            <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
              <h3 className="text-sm font-medium text-accent-cyan mb-2">
                Compact Badge (for tables)
              </h3>
              <pre className="text-xs text-text-primary overflow-x-auto">
                <code>{`import { TradeRiskBadge } from './components/common/TradeRiskScore';

<TradeRiskBadge trade={tradeData} />`}</code>
              </pre>
            </div>

            <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
              <h3 className="text-sm font-medium text-accent-cyan mb-2">
                Full Display
              </h3>
              <pre className="text-xs text-text-primary overflow-x-auto">
                <code>{`import TradeRiskScore from './components/common/TradeRiskScore';

<TradeRiskScore
  trade={tradeData}
  showGauge={true}
  showBreakdown={true}
/>`}</code>
              </pre>
            </div>

            <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
              <h3 className="text-sm font-medium text-accent-cyan mb-2">
                Calculate Risk Programmatically
              </h3>
              <pre className="text-xs text-text-primary overflow-x-auto">
                <code>{`import { calculateRiskFactors, calculateOverallRisk } from './components/common/TradeRiskScore';

const factors = calculateRiskFactors(tradeData);
const { totalScore, level, info } = calculateOverallRisk(factors);

console.log(\`Risk: \${totalScore}/100 (\${level})\`);`}</code>
              </pre>
            </div>
          </div>
        </DemoSection>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-text-secondary">
          <p>TradeRiskScore Component Demo</p>
          <p className="mt-2">
            For more information, see{' '}
            <code className="text-accent-cyan">TradeRiskScore.README.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TradeRiskScoreDemo;
