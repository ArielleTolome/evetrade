import { QuickCopyButtons, QuickCopyButton } from './QuickCopyButtons';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * QuickCopyButtons Examples
 * Demonstrates usage of the QuickCopyButtons component
 */
export function QuickCopyButtonsExample() {
  const handleCopy = (data) => {
    console.log('Copied:', data);
  };

  return (
    <div className="space-y-8 p-8 bg-space-black min-h-screen">
      <div>
        <h1 className="text-3xl font-display text-accent-cyan mb-2">Quick Copy Buttons</h1>
        <p className="text-text-secondary">One-click copy functionality for trading data</p>
      </div>

      {/* Example 1: Basic Usage */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Basic Usage</h3>
        <QuickCopyButtons
          itemName="Tritanium"
          price={5.50}
          quantity={1000000}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Example 2: Compact Mode */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Compact Mode</h3>
        <div className="flex items-center gap-4">
          <span className="text-text-primary">Tritanium - 1,000,000 x 5.50 ISK</span>
          <QuickCopyButtons
            itemName="Tritanium"
            price={5.50}
            quantity={1000000}
            compact={true}
            onCopy={handleCopy}
          />
        </div>
      </GlassmorphicCard>

      {/* Example 3: Custom Formats */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Custom Formats</h3>
        <QuickCopyButtons
          itemName="PLEX"
          price={3500000}
          quantity={10}
          customFormats={[
            {
              id: 'evepraisal',
              label: 'EVE Praisal',
              getValue: () => `10x PLEX`,
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
            },
          ]}
          onCopy={handleCopy}
        />
      </GlassmorphicCard>

      {/* Example 4: Single Copy Button */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Single Copy Button</h3>
        <div className="space-y-3">
          <QuickCopyButton
            value="Jita IV - Moon 4 - Caldari Navy Assembly Plant"
            label="Copy Station"
            size="sm"
            onCopy={(val) => console.log('Copied:', val)}
          />
          <QuickCopyButton
            value="30000142"
            label="Copy System ID"
            size="md"
            onCopy={(val) => console.log('Copied:', val)}
          />
          <QuickCopyButton
            value="The Forge"
            label="Copy Region"
            size="lg"
            onCopy={(val) => console.log('Copied:', val)}
          />
        </div>
      </GlassmorphicCard>

      {/* Example 5: In Trading Table Row */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">In Trading Table Row</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent-cyan/20">
                <th className="text-left p-3 text-text-secondary">Item</th>
                <th className="text-right p-3 text-text-secondary">Buy Price</th>
                <th className="text-right p-3 text-text-secondary">Sell Price</th>
                <th className="text-right p-3 text-text-secondary">Volume</th>
                <th className="text-center p-3 text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-accent-cyan/10">
                <td className="p-3 text-text-primary">Tritanium</td>
                <td className="p-3 text-right text-text-primary">5.45</td>
                <td className="p-3 text-right text-text-primary">5.55</td>
                <td className="p-3 text-right text-text-primary">1,000,000</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <QuickCopyButtons
                      itemName="Tritanium"
                      price={5.55}
                      quantity={1000000}
                      compact={true}
                      onCopy={handleCopy}
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-accent-cyan/10">
                <td className="p-3 text-text-primary">Pyerite</td>
                <td className="p-3 text-right text-text-primary">12.30</td>
                <td className="p-3 text-right text-text-primary">12.50</td>
                <td className="p-3 text-right text-text-primary">500,000</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <QuickCopyButtons
                      itemName="Pyerite"
                      price={12.50}
                      quantity={500000}
                      compact={true}
                      onCopy={handleCopy}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

export default QuickCopyButtonsExample;
