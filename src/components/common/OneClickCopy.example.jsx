import { useState } from 'react';
import { OneClickCopy, OneClickCopyInline } from './OneClickCopy';

/**
 * Example usage of OneClickCopy components
 */
export function OneClickCopyExample() {
  const [copyLog, setCopyLog] = useState([]);

  const handleCopy = (value, format) => {
    setCopyLog(prev => [`Copied: ${value} (${format})`, ...prev.slice(0, 4)]);
  };

  return (
    <div className="p-8 space-y-8 bg-space-black min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">OneClickCopy Examples</h1>

        {/* Basic Usage */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Basic Copy Buttons</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <div className="flex flex-wrap gap-4">
              <OneClickCopy
                value="Tritanium"
                label="Item Name"
                format="text"
                onCopy={handleCopy}
              />
              <OneClickCopy
                value="1234567.89"
                label="Price"
                format="text"
                onCopy={handleCopy}
              />
              <OneClickCopy
                value={{ item: 'Tritanium', price: 5.50, qty: 1000 }}
                label="JSON Data"
                format="json"
                onCopy={handleCopy}
              />
            </div>
          </div>
        </section>

        {/* Size Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Size Variants</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <div className="flex items-center gap-4">
              <OneClickCopy
                value="Small button"
                label="Small"
                size="sm"
                onCopy={handleCopy}
              />
              <OneClickCopy
                value="Medium button"
                label="Medium"
                size="md"
                onCopy={handleCopy}
              />
              <OneClickCopy
                value="Large button"
                label="Large"
                size="lg"
                onCopy={handleCopy}
              />
            </div>
          </div>
        </section>

        {/* Icon Only (No Label) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Icon Only</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <div className="flex gap-2">
              <OneClickCopy
                value="Copy me!"
                showLabel={false}
                onCopy={handleCopy}
              />
              <OneClickCopy
                value="And me!"
                showLabel={false}
                size="lg"
                onCopy={handleCopy}
              />
            </div>
          </div>
        </section>

        {/* Inline Copy */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Inline Copy (Hover to Show)</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20 space-y-4">
            <div className="text-text-primary">
              <OneClickCopyInline value="Jita IV - Moon 4 - Caldari Navy Assembly Plant" label="Station">
                Jita IV - Moon 4 - Caldari Navy Assembly Plant
              </OneClickCopyInline>
            </div>
            <div className="text-text-primary">
              Character ID: <OneClickCopyInline value="123456789" label="Character ID">
                123456789
              </OneClickCopyInline>
            </div>
            <div className="text-text-primary">
              Price: <OneClickCopyInline value="1234567.89" label="Price">
                1,234,567.89 ISK
              </OneClickCopyInline>
            </div>
          </div>
        </section>

        {/* Trade Data Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Trading Use Cases</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <div className="space-y-4">
              {/* Item row */}
              <div className="p-4 bg-space-light/5 rounded-lg border border-accent-cyan/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-text-primary font-semibold">Tritanium</h3>
                  <div className="flex gap-2">
                    <OneClickCopy
                      value="Tritanium"
                      label="Item"
                      size="sm"
                      onCopy={handleCopy}
                    />
                    <OneClickCopy
                      value="5.50"
                      label="Price"
                      size="sm"
                      onCopy={handleCopy}
                    />
                    <OneClickCopy
                      value="1000000"
                      label="Quantity"
                      size="sm"
                      onCopy={handleCopy}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-text-secondary">Buy Price</div>
                    <div className="text-text-primary">5.50 ISK</div>
                  </div>
                  <div>
                    <div className="text-text-secondary">Sell Price</div>
                    <div className="text-text-primary">6.00 ISK</div>
                  </div>
                  <div>
                    <div className="text-text-secondary">Profit</div>
                    <div className="text-green-400">500,000 ISK</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Format Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Format Options</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <div className="grid grid-cols-2 gap-4">
              <OneClickCopy
                value="Tritanium"
                label="Text Format"
                format="text"
                onCopy={handleCopy}
              />
              <OneClickCopy
                value={['Tritanium', 'Pyerite', 'Mexallon']}
                label="In-Game Format"
                format="ingame"
                onCopy={handleCopy}
              />
              <OneClickCopy
                value={{ item: 'Tritanium', price: 5.50 }}
                label="JSON Format"
                format="json"
                onCopy={handleCopy}
              />
              <OneClickCopy
                value={[
                  { item: 'Tritanium', price: 5.50 },
                  { item: 'Pyerite', price: 12.00 }
                ]}
                label="CSV Format"
                format="csv"
                onCopy={handleCopy}
              />
            </div>
          </div>
        </section>

        {/* Copy Log */}
        {copyLog.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-accent-cyan">Recent Copies</h2>
            <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
              <div className="space-y-2">
                {copyLog.map((log, index) => (
                  <div key={index} className="text-sm text-text-secondary font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default OneClickCopyExample;
