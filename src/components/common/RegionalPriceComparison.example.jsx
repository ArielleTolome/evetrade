import { RegionalPriceComparison } from './RegionalPriceComparison';

/**
 * Example usage of RegionalPriceComparison component
 * This file demonstrates both compact and full views
 */
export function RegionalPriceComparisonExample() {
  return (
    <div className="p-6 bg-space-black min-h-screen">
      <h1 className="text-2xl font-bold text-accent-cyan mb-6">Regional Price Comparison Examples</h1>

      <div className="space-y-8">
        {/* Full View Example */}
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-3">Full View</h2>
          <RegionalPriceComparison
            buyPrice={1250000}
            sellPrice={1500000}
            volume={500}
            currentStation="Jita IV - Moon 4"
            compact={false}
          />
        </section>

        {/* Compact View Example - with arbitrage */}
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-3">Compact View (with arbitrage)</h2>
          <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Regional Comparison:</span>
              <RegionalPriceComparison
                buyPrice={5000000}
                sellPrice={5200000}
                volume={1000}
                currentStation="Amarr VIII"
                compact={true}
              />
            </div>
          </div>
        </section>

        {/* Compact View Example - no arbitrage */}
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-3">Compact View (best price already)</h2>
          <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Regional Comparison:</span>
              <RegionalPriceComparison
                buyPrice={500000}
                sellPrice={550000}
                volume={250}
                currentStation="Jita IV"
                compact={true}
              />
            </div>
          </div>
        </section>

        {/* Integration Example - In a trading table row */}
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-3">Integration Example (Table Context)</h2>
          <div className="bg-space-dark/30 rounded-xl border border-accent-cyan/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-space-mid/80 border-b border-accent-cyan/20">
                  <th className="text-left px-4 py-3 text-accent-cyan">Item</th>
                  <th className="text-left px-4 py-3 text-accent-cyan">Price</th>
                  <th className="text-left px-4 py-3 text-accent-cyan">Regional Arbitrage</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-accent-cyan/5 hover:bg-accent-cyan/5">
                  <td className="px-4 py-3 text-text-primary">Tritanium</td>
                  <td className="px-4 py-3 text-text-primary font-mono">5.50 ISK</td>
                  <td className="px-4 py-3">
                    <RegionalPriceComparison
                      buyPrice={5.5}
                      sellPrice={5.8}
                      volume={1000000}
                      currentStation="Jita"
                      compact={true}
                    />
                  </td>
                </tr>
                <tr className="hover:bg-accent-cyan/5">
                  <td className="px-4 py-3 text-text-primary">PLEX</td>
                  <td className="px-4 py-3 text-text-primary font-mono">2,450,000 ISK</td>
                  <td className="px-4 py-3">
                    <RegionalPriceComparison
                      buyPrice={2450000}
                      sellPrice={2500000}
                      volume={10}
                      currentStation="Dodixie"
                      compact={true}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Multiple Items Comparison */}
        <section>
          <h2 className="text-lg font-medium text-text-primary mb-3">Multiple Items</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-accent-cyan mb-2">High-value Module</h3>
              <RegionalPriceComparison
                buyPrice={850000000}
                sellPrice={900000000}
                volume={5}
                currentStation="Jita"
                compact={false}
              />
            </div>
            <div>
              <h3 className="text-sm text-accent-cyan mb-2">Ore Commodity</h3>
              <RegionalPriceComparison
                buyPrice={125000}
                sellPrice={135000}
                volume={5000}
                currentStation="Rens"
                compact={false}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RegionalPriceComparisonExample;
