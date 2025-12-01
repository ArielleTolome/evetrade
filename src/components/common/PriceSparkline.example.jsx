import PriceSparkline from './PriceSparkline';
import PriceHistoryChart from './PriceHistoryChart';
import GlassmorphicCard from './GlassmorphicCard';

/**
 * Example usage of PriceSparkline and PriceHistoryChart components
 * This demonstrates how to integrate price visualization into trading tables and detail views
 */
export function PriceChartExamples() {
  // Sample price data
  const samplePrices = [
    { item: 'Tritanium', price: 6.50 },
    { item: 'Pyerite', price: 12.30 },
    { item: 'Mexallon', price: 89.45 },
    { item: 'Isogen', price: 142.80 },
    { item: 'PLEX', price: 3250000 },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold text-accent-cyan mb-4">
          Price Sparkline Examples
        </h2>
        <p className="text-gray-400 mb-6">
          Mini sparkline charts for inline display in tables
        </p>

        {/* Table example */}
        <GlassmorphicCard>
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent-cyan/20">
                <th className="text-left py-2 text-accent-cyan">Item</th>
                <th className="text-right py-2 text-accent-cyan">Price</th>
                <th className="text-right py-2 text-accent-cyan">Trend</th>
              </tr>
            </thead>
            <tbody>
              {samplePrices.map((item) => (
                <tr key={item.item} className="border-b border-accent-cyan/10">
                  <td className="py-3 text-white">{item.item}</td>
                  <td className="py-3 text-right font-mono text-white">
                    {item.price.toLocaleString()} ISK
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end">
                      <PriceSparkline price={item.price} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassmorphicCard>

        {/* Different sizes */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-accent-cyan mb-3">
            Different Sizes
          </h3>
          <GlassmorphicCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Small (60x20)</span>
                <PriceSparkline price={1234567} width={60} height={20} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Default (80x24)</span>
                <PriceSparkline price={1234567} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Large (120x32)</span>
                <PriceSparkline price={1234567} width={120} height={32} />
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Different data points */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-accent-cyan mb-3">
            Different Time Periods
          </h3>
          <GlassmorphicCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">7 days (7 points)</span>
                <PriceSparkline price={1234567} points={7} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">14 days (14 points)</span>
                <PriceSparkline price={1234567} points={14} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">30 days (30 points)</span>
                <PriceSparkline price={1234567} points={30} />
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-accent-cyan mb-4">
          Price History Chart Examples
        </h2>
        <p className="text-gray-400 mb-6">
          Detailed price history charts for item detail pages
        </p>

        {/* Full chart */}
        <PriceHistoryChart
          price={3250000}
          width={800}
          height={400}
          days={30}
          title="PLEX Price History"
        />

        {/* Compact chart */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-accent-cyan mb-3">
            Compact View
          </h3>
          <PriceHistoryChart
            price={142.80}
            width={500}
            height={250}
            days={14}
            title="Isogen - 14 Days"
          />
        </div>

        {/* Side by side comparison */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-accent-cyan mb-3">
            Side by Side Comparison
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <PriceHistoryChart
              price={6.50}
              width={400}
              height={250}
              days={30}
              title="Tritanium"
            />
            <PriceHistoryChart
              price={12.30}
              width={400}
              height={250}
              days={30}
              title="Pyerite"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-accent-cyan mb-4">
          Integration Examples
        </h2>
        <p className="text-gray-400 mb-6">
          How to use these components in your trading pages
        </p>

        <GlassmorphicCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Usage in Trading Tables
            </h3>
            <pre className="bg-space-black p-4 rounded text-sm overflow-x-auto">
              <code className="text-accent-cyan">
{`// In your TradingTable component
import PriceSparkline from './components/common/PriceSparkline';

// Add to your table columns
{
  data: null,
  title: 'Price Trend',
  render: (data, type, row) => {
    return \`<div id="sparkline-\${row.type_id}"></div>\`;
  },
  createdCell: (td, cellData, rowData) => {
    ReactDOM.createRoot(td.querySelector('div')).render(
      <PriceSparkline price={rowData.sell_price} />
    );
  }
}`}
              </code>
            </pre>

            <h3 className="text-lg font-semibold text-white mt-6">
              Usage in Item Detail Views
            </h3>
            <pre className="bg-space-black p-4 rounded text-sm overflow-x-auto">
              <code className="text-accent-cyan">
{`// In your OrdersPage or item detail page
import PriceHistoryChart from './components/common/PriceHistoryChart';

function ItemDetailPage({ item }) {
  return (
    <div>
      <h1>{item.name}</h1>

      <PriceHistoryChart
        price={item.currentPrice}
        width={800}
        height={400}
        days={30}
        title={\`\${item.name} Price History\`}
      />
    </div>
  );
}`}
              </code>
            </pre>
          </div>
        </GlassmorphicCard>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-accent-cyan mb-4">
          Component API
        </h2>

        <GlassmorphicCard>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                PriceSparkline Props
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-cyan/20">
                    <th className="text-left py-2 text-accent-cyan">Prop</th>
                    <th className="text-left py-2 text-accent-cyan">Type</th>
                    <th className="text-left py-2 text-accent-cyan">Default</th>
                    <th className="text-left py-2 text-accent-cyan">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">price</td>
                    <td className="py-2">number</td>
                    <td className="py-2 italic">required</td>
                    <td className="py-2">Current price value</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">width</td>
                    <td className="py-2">number</td>
                    <td className="py-2">80</td>
                    <td className="py-2">Width in pixels</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">height</td>
                    <td className="py-2">number</td>
                    <td className="py-2">24</td>
                    <td className="py-2">Height in pixels</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">points</td>
                    <td className="py-2">number</td>
                    <td className="py-2">7</td>
                    <td className="py-2">Number of data points</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">showTooltip</td>
                    <td className="py-2">boolean</td>
                    <td className="py-2">true</td>
                    <td className="py-2">Show tooltip on hover</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                PriceHistoryChart Props
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-accent-cyan/20">
                    <th className="text-left py-2 text-accent-cyan">Prop</th>
                    <th className="text-left py-2 text-accent-cyan">Type</th>
                    <th className="text-left py-2 text-accent-cyan">Default</th>
                    <th className="text-left py-2 text-accent-cyan">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">price</td>
                    <td className="py-2">number</td>
                    <td className="py-2 italic">required</td>
                    <td className="py-2">Current price value</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">width</td>
                    <td className="py-2">number</td>
                    <td className="py-2">600</td>
                    <td className="py-2">Width in pixels</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">height</td>
                    <td className="py-2">number</td>
                    <td className="py-2">300</td>
                    <td className="py-2">Height in pixels</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">days</td>
                    <td className="py-2">number</td>
                    <td className="py-2">30</td>
                    <td className="py-2">Number of days of history</td>
                  </tr>
                  <tr className="border-b border-accent-cyan/10">
                    <td className="py-2 font-mono">title</td>
                    <td className="py-2">string</td>
                    <td className="py-2">"Price History"</td>
                    <td className="py-2">Chart title</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
}

export default PriceChartExamples;
