import { useState } from 'react';
import { EnhancedExport } from './EnhancedExport';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * EnhancedExport Examples
 * Demonstrates usage of the EnhancedExport component
 */
export function EnhancedExportExample() {
  // Sample trading data
  const sampleData = [
    {
      'Item': 'Tritanium',
      'Buy Price': 5.45,
      'Sell Price': 5.55,
      'Volume': 1000000,
      'Buy Total': 5450000,
      'Sell Total': 5550000,
      'Net Profit': 75000,
      'Gross Margin': 1.83,
      'ROI': 1.38,
      'Buy Location': 'Jita IV - Moon 4',
      'Sell Location': 'Jita IV - Moon 4',
      'date': new Date().toISOString(),
    },
    {
      'Item': 'Pyerite',
      'Buy Price': 12.30,
      'Sell Price': 12.50,
      'Volume': 500000,
      'Buy Total': 6150000,
      'Sell Total': 6250000,
      'Net Profit': 65000,
      'Gross Margin': 1.63,
      'ROI': 1.06,
      'Buy Location': 'Jita IV - Moon 4',
      'Sell Location': 'Jita IV - Moon 4',
      'date': new Date().toISOString(),
    },
    {
      'Item': 'PLEX',
      'Buy Price': 3450000,
      'Sell Price': 3500000,
      'Volume': 10,
      'Buy Total': 34500000,
      'Sell Total': 35000000,
      'Net Profit': 275000,
      'Gross Margin': 1.45,
      'ROI': 0.80,
      'Buy Location': 'Jita IV - Moon 4',
      'Sell Location': 'Jita IV - Moon 4',
      'date': new Date().toISOString(),
    },
  ];

  const defaultColumns = [
    { key: 'Item', label: 'Item', export: true },
    { key: 'Buy Price', label: 'Buy Price', export: true, format: 'isk' },
    { key: 'Sell Price', label: 'Sell Price', export: true, format: 'isk' },
    { key: 'Volume', label: 'Volume', export: true, format: 'number' },
    { key: 'Buy Total', label: 'Buy Total', export: true, format: 'isk' },
    { key: 'Sell Total', label: 'Sell Total', export: true, format: 'isk' },
    { key: 'Profit per Unit', label: 'Profit/Unit', export: true, format: 'isk' },
    { key: 'Net Profit', label: 'Net Profit', export: true, format: 'isk' },
    { key: 'Gross Margin', label: 'Gross Margin', export: true, format: 'percent' },
    { key: 'ROI', label: 'ROI', export: true, format: 'percent' },
    { key: 'Buy Location', label: 'Buy Location', export: false },
    { key: 'Sell Location', label: 'Sell Location', export: false },
  ];

  const [exportCount, setExportCount] = useState(0);

  const handleExport = (data) => {
    console.log('Exported:', data);
    setExportCount(prev => prev + 1);
  };

  return (
    <div className="space-y-8 p-8 bg-space-black min-h-screen">
      <div>
        <h1 className="text-3xl font-display text-accent-cyan mb-2">Enhanced Export</h1>
        <p className="text-text-secondary">
          Advanced export functionality with multiple formats and templates
        </p>
      </div>

      {/* Example 1: Basic Usage */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Basic Usage</h3>
        <p className="text-text-secondary text-sm mb-4">
          Simple export with default settings
        </p>
        <EnhancedExport
          data={sampleData}
          defaultColumns={defaultColumns}
          filename="my-trades"
          onExport={handleExport}
        />
        {exportCount > 0 && (
          <p className="text-xs text-green-400 mt-2">
            Total exports this session: {exportCount}
          </p>
        )}
      </GlassmorphicCard>

      {/* Example 2: With Templates */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">With Templates</h3>
        <p className="text-text-secondary text-sm mb-4">
          Pre-configured column sets for different use cases
        </p>
        <EnhancedExport
          data={sampleData}
          defaultColumns={defaultColumns}
          filename="station-trading"
          showTemplates={true}
          onExport={handleExport}
        />
      </GlassmorphicCard>

      {/* Example 3: With Date Range */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">With Date Range Filter</h3>
        <p className="text-text-secondary text-sm mb-4">
          Filter data by date before export
        </p>
        <EnhancedExport
          data={sampleData}
          defaultColumns={defaultColumns}
          filename="filtered-trades"
          showTemplates={true}
          showDateRange={true}
          onExport={handleExport}
        />
      </GlassmorphicCard>

      {/* Example 4: Sample Data Display */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Sample Data</h3>
        <p className="text-text-secondary text-sm mb-4">
          This is the data being exported in the examples above
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-cyan/20">
                <th className="text-left p-2 text-text-secondary">Item</th>
                <th className="text-right p-2 text-text-secondary">Buy</th>
                <th className="text-right p-2 text-text-secondary">Sell</th>
                <th className="text-right p-2 text-text-secondary">Volume</th>
                <th className="text-right p-2 text-text-secondary">Profit</th>
                <th className="text-right p-2 text-text-secondary">ROI</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row, i) => (
                <tr key={i} className="border-b border-accent-cyan/10">
                  <td className="p-2 text-text-primary">{row['Item']}</td>
                  <td className="p-2 text-right text-text-primary">{row['Buy Price'].toFixed(2)}</td>
                  <td className="p-2 text-right text-text-primary">{row['Sell Price'].toFixed(2)}</td>
                  <td className="p-2 text-right text-text-primary">{row['Volume'].toLocaleString()}</td>
                  <td className="p-2 text-right text-green-400">{row['Net Profit'].toLocaleString()}</td>
                  <td className="p-2 text-right text-accent-gold">{row['ROI'].toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>

      {/* Example 5: Export Formats */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Export Formats</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-accent-gold mb-3">Available Formats</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-xl">📊</span>
                <div>
                  <p className="text-text-primary font-medium">CSV</p>
                  <p className="text-xs">Standard comma-separated values</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">📈</span>
                <div>
                  <p className="text-text-primary font-medium">Excel CSV</p>
                  <p className="text-xs">UTF-8 BOM for perfect Excel compatibility</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">📋</span>
                <div>
                  <p className="text-text-primary font-medium">TSV</p>
                  <p className="text-xs">Tab-separated values</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🔧</span>
                <div>
                  <p className="text-text-primary font-medium">JSON</p>
                  <p className="text-xs">Full data with metadata for programmatic use</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">📑</span>
                <div>
                  <p className="text-text-primary font-medium">Google Sheets</p>
                  <p className="text-xs">Copy-paste ready format</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-accent-gold mb-3">Templates</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-text-primary font-medium">Basic</p>
                  <p className="text-xs">Essential columns only</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-text-primary font-medium">Detailed</p>
                  <p className="text-xs">All trading metrics</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-text-primary font-medium">Accounting</p>
                  <p className="text-xs">Fees and tax breakdown</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-text-primary font-medium">Station Trading</p>
                  <p className="text-xs">Optimized for margin trading</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-text-primary font-medium">Hauling</p>
                  <p className="text-xs">Includes location data</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Example 6: Features */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Features</h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Multiple export formats (CSV, Excel, TSV, JSON, Google Sheets)</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pre-configured templates for different use cases</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Custom column selection with select all/clear options</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Automatic calculation of additional fields (margins, ROI, fees)</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Number formatting options (ISK, percentages, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Date range filtering for historical data</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Live preview of export data</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Excel CSV with UTF-8 BOM for perfect compatibility</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>JSON export includes metadata (timestamp, column info)</span>
          </li>
        </ul>
      </GlassmorphicCard>
    </div>
  );
}

export default EnhancedExportExample;
