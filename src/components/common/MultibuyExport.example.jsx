import { MultibuyExport, MultibuyExportCompact, MultibuyExportWithPreview } from './MultibuyExport';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * MultibuyExport Examples
 * Demonstrates usage of the MultibuyExport component
 */
export function MultibuyExportExample() {
  // Sample trading data
  const sampleData = [
    { Item: 'Tritanium', Quantity: 1000000, 'Net Profit': 50000 },
    { Item: 'Pyerite', Quantity: 500000, 'Net Profit': 75000 },
    { Item: 'Mexallon', Quantity: 250000, 'Net Profit': 100000 },
    { Item: 'Isogen', Quantity: 100000, 'Net Profit': 125000 },
    { Item: 'Nocxium', Quantity: 50000, 'Net Profit': 150000 },
    { Item: 'Zydrine', Quantity: 25000, 'Net Profit': 175000 },
    { Item: 'Megacyte', Quantity: 10000, 'Net Profit': 200000 },
    { Item: 'Morphite', Quantity: 5000, 'Net Profit': 250000 },
  ];

  // Sample data with different key names
  const alternateData = [
    { name: 'PLEX', quantity: 10 },
    { name: 'Skill Injector', quantity: 5 },
    { name: 'Skill Extractor', quantity: 3 },
  ];

  // Sample data with Volume key
  const volumeData = [
    { Item: 'Compressed Veldspar', Volume: 50000 },
    { Item: 'Compressed Scordite', Volume: 40000 },
    { Item: 'Compressed Pyroxeres', Volume: 30000 },
  ];

  const handleCopy = (text) => {
    console.log('Copied multibuy text:', text);
  };

  return (
    <div className="space-y-8 p-8 bg-space-black min-h-screen">
      <div>
        <h1 className="text-3xl font-display text-accent-cyan mb-2">Multibuy Export Component</h1>
        <p className="text-text-secondary">Export trading data in EVE Online Multibuy format</p>
      </div>

      {/* Example 1: Basic Usage */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Basic Usage</h3>
        <p className="text-text-secondary mb-4">
          Standard button that copies immediately when clicked
        </p>
        <MultibuyExport
          data={sampleData}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Example 2: Compact Version */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Compact Version</h3>
        <p className="text-text-secondary mb-4">
          Smaller button for use in toolbars or table headers
        </p>
        <MultibuyExportCompact
          data={sampleData}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Example 3: With Preview Modal */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">With Preview Modal</h3>
        <p className="text-text-secondary mb-4">
          Shows a preview of the multibuy list before copying
        </p>
        <MultibuyExportWithPreview
          data={sampleData}
          maxPreviewItems={5}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Example 4: Different Data Format */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Different Data Format</h3>
        <p className="text-text-secondary mb-4">
          Works with different key naming conventions (name/quantity instead of Item/Quantity)
        </p>
        <MultibuyExport
          data={alternateData}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Example 5: Volume as Quantity */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Using Volume as Quantity</h3>
        <p className="text-text-secondary mb-4">
          Automatically detects Volume field when Quantity is not available
        </p>
        <MultibuyExport
          data={volumeData}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Example 6: In Trading Table Context */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">In Trading Table Context</h3>
        <p className="text-text-secondary mb-4">
          Example of how to use in a trading table toolbar
        </p>
        <div className="space-y-4">
          {/* Mock table toolbar */}
          <div className="flex items-center justify-between p-3 bg-space-dark/40 rounded-lg border border-accent-cyan/20">
            <div className="text-text-secondary text-sm">
              {sampleData.length} profitable trades found
            </div>
            <div className="flex gap-2">
              <MultibuyExportCompact
                data={sampleData}
                onCopy={handleCopy}
              />
              <button className="px-3 py-2 text-sm bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/20 rounded-lg transition-colors">
                Export CSV
              </button>
            </div>
          </div>

          {/* Mock table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-accent-cyan/20">
                  <th className="text-left p-3 text-text-secondary">Item</th>
                  <th className="text-right p-3 text-text-secondary">Quantity</th>
                  <th className="text-right p-3 text-text-secondary">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.slice(0, 3).map((item, idx) => (
                  <tr key={idx} className="border-b border-accent-cyan/10">
                    <td className="p-3 text-text-primary">{item.Item}</td>
                    <td className="p-3 text-right text-text-primary">{item.Quantity.toLocaleString()}</td>
                    <td className="p-3 text-right text-text-primary">{item['Net Profit'].toLocaleString()} ISK</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Example 7: Large Dataset */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Large Dataset with Preview</h3>
        <p className="text-text-secondary mb-4">
          Preview modal is especially useful for large datasets
        </p>
        <MultibuyExportWithPreview
          data={[...Array(50)].map((_, i) => ({
            Item: `Trade Item ${i + 1}`,
            Quantity: Math.floor(Math.random() * 1000000),
          }))}
          maxPreviewItems={10}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Info Section */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">How to Use in EVE Online</h3>
        <ol className="list-decimal list-inside space-y-2 text-text-secondary">
          <li>Click one of the "Copy as Multibuy" buttons above</li>
          <li>In EVE Online, open the Market window (Alt+R)</li>
          <li>Click the "Multibuy" tab at the bottom</li>
          <li>Right-click in the text area and select "Paste from Clipboard"</li>
          <li>Items and quantities will be automatically recognized</li>
          <li>Review the list and click "Buy All" to purchase</li>
        </ol>
        <div className="mt-4 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
          <p className="text-sm text-text-secondary">
            <strong className="text-accent-cyan">Format:</strong> The multibuy format is simple:
            <code className="ml-2 text-accent-pink">Item Name quantity</code> (one per line).
            EVE Online's market system automatically parses this format.
          </p>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

export default MultibuyExportExample;
