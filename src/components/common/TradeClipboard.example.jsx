import { useState } from 'react';
import { TradeClipboard } from './TradeClipboard';
import { OneClickCopy } from './OneClickCopy';
import { BulkCopyPanel } from './BulkCopyPanel';

/**
 * Example usage of TradeClipboard component
 */
export function TradeClipboardExample() {
  const [testItems, setTestItems] = useState([
    'Tritanium',
    'Pyerite',
    'Mexallon',
    'Isogen',
    'Nocxium',
  ]);

  return (
    <div className="p-8 space-y-8 bg-space-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">TradeClipboard Example</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Actions */}
          <div className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-accent-cyan">Copy Some Items</h2>
              <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20 space-y-4">
                <p className="text-sm text-text-secondary">
                  Use these buttons to populate the clipboard history:
                </p>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <OneClickCopy
                      value="Tritanium"
                      label="Copy Tritanium"
                      format="text"
                    />
                    <OneClickCopy
                      value="Pyerite"
                      label="Copy Pyerite"
                      format="text"
                    />
                  </div>

                  <div className="flex gap-2">
                    <OneClickCopy
                      value={{ item: 'Mexallon', price: 95.00, qty: 100000 }}
                      label="Copy JSON"
                      format="json"
                    />
                    <OneClickCopy
                      value={['Isogen', 'Nocxium', 'Megacyte']}
                      label="Copy CSV"
                      format="csv"
                    />
                  </div>

                  <div className="flex gap-2">
                    <OneClickCopy
                      value="Jita IV - Moon 4 - Caldari Navy Assembly Plant"
                      label="Copy Station"
                      format="ingame"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-accent-cyan">Bulk Copy Items</h2>
              <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
                <BulkCopyPanel
                  items={testItems}
                  getItemName={(item) => item}
                  compact
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-accent-cyan">Complex Data</h2>
              <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20 space-y-3">
                <OneClickCopy
                  value={[
                    { item: 'Tritanium', buy: 5.50, sell: 6.00 },
                    { item: 'Pyerite', buy: 12.00, sell: 13.50 },
                    { item: 'Mexallon', buy: 95.00, sell: 105.00 },
                  ]}
                  label="Copy Trading List (CSV)"
                  format="csv"
                />

                <OneClickCopy
                  value={JSON.stringify({
                    station: 'Jita IV - Moon 4',
                    items: ['Tritanium', 'Pyerite'],
                    total: 1250000,
                  }, null, 2)}
                  label="Copy Trade Summary (JSON)"
                  format="json"
                />

                <OneClickCopy
                  value="Buy 1,000,000x Tritanium at 5.50 ISK\nBuy 500,000x Pyerite at 12.00 ISK"
                  label="Copy Shopping List"
                  format="text"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-accent-cyan">Features</h2>
              <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Automatically tracks last 10 copies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pin frequently used items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Click any item to copy again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Shows format type and timestamp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Expand long text for full preview</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Clear history (preserves pinned)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Persists to localStorage</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Right Column - Clipboard History */}
          <div className="space-y-6">
            <section className="sticky top-8 space-y-4">
              <h2 className="text-xl font-semibold text-accent-cyan">Clipboard History</h2>
              <div className="bg-space-dark rounded-lg border border-accent-cyan/20">
                <TradeClipboard />
              </div>
            </section>
          </div>
        </div>

        {/* Usage Instructions */}
        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-accent-cyan">Usage Instructions</h2>
          <div className="p-6 bg-space-dark rounded-lg border border-accent-cyan/20">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-text-primary mb-3">How to Use</h3>
              <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
                <li>Copy items using the buttons on the left side</li>
                <li>Watch them appear in the clipboard history on the right</li>
                <li>Click any history item to copy it again</li>
                <li>Pin items you use frequently by clicking the bookmark icon</li>
                <li>Expand long text items by clicking the expand arrow</li>
                <li>Remove items you don't need with the X button</li>
                <li>Clear all unpinned history with the "Clear History" button</li>
              </ol>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">Format Types</h3>
              <ul className="space-y-2 text-sm text-text-secondary list-disc list-inside">
                <li><span className="font-semibold text-blue-400">Text</span> - Plain text format</li>
                <li><span className="font-semibold text-purple-400">JSON</span> - Structured JSON data</li>
                <li><span className="font-semibold text-green-400">CSV</span> - Comma-separated values</li>
                <li><span className="font-semibold text-orange-400">In-Game</span> - EVE Online compatible format</li>
              </ul>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">Integration Example</h3>
              <pre className="bg-space-black p-4 rounded text-xs overflow-x-auto">
{`import { TradeClipboard } from './components/common/TradeClipboard';

function MyTradingPage() {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        {/* Your main content */}
      </div>

      <aside className="w-80">
        <TradeClipboard compact />
      </aside>
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TradeClipboardExample;
