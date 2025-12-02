import { EveActionButtons, EveActionButtonsCompact } from './EveActionButtons';

/**
 * Example usage of EveActionButtons component
 * This file demonstrates the various ways to use EVE Online action buttons
 */

export function EveActionButtonsExamples() {
  const handleCopy = (itemName) => {
    console.log(`Successfully copied: ${itemName}`);
  };

  return (
    <div className="p-8 space-y-8 bg-space-black min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">EVE Action Buttons Examples</h1>

      {/* Example 1: Full button set with all props */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Full Button Set</h2>
        <p className="text-text-secondary mb-4">
          Item with market details, info, destination, and copy functionality
        </p>
        <EveActionButtons
          typeId={34}
          typeName="Tritanium"
          solarSystemId={30000142}
          onCopy={handleCopy}
        />
      </div>

      {/* Example 2: Compact variant */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Compact Variant</h2>
        <p className="text-text-secondary mb-4">
          Smaller buttons for dense layouts
        </p>
        <EveActionButtonsCompact
          typeId={34}
          typeName="Tritanium"
          solarSystemId={30000142}
        />
      </div>

      {/* Example 3: Item only (no destination) */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Item Only</h2>
        <p className="text-text-secondary mb-4">
          Without destination button (no solar system ID provided)
        </p>
        <EveActionButtons
          typeId={44992}
          typeName="PLEX"
          onCopy={handleCopy}
        />
      </div>

      {/* Example 4: Copy only */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Copy Only</h2>
        <p className="text-text-secondary mb-4">
          Just the copy button (no type ID or solar system ID)
        </p>
        <EveActionButtons
          typeName="Compressed Veldspar"
          onCopy={handleCopy}
        />
      </div>

      {/* Example 5: In a table row context */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Table Context</h2>
        <p className="text-text-secondary mb-4">
          Example of how it might appear in a trading table
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-text-secondary font-medium p-3">Item</th>
                <th className="text-right text-text-secondary font-medium p-3">Price</th>
                <th className="text-right text-text-secondary font-medium p-3">Profit</th>
                <th className="text-center text-text-secondary font-medium p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3 text-white">Tritanium</td>
                <td className="p-3 text-right text-accent-cyan">5.50 ISK</td>
                <td className="p-3 text-right text-accent-green">+0.25 ISK</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <EveActionButtonsCompact
                      typeId={34}
                      typeName="Tritanium"
                      solarSystemId={30000142}
                      onCopy={handleCopy}
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3 text-white">PLEX</td>
                <td className="p-3 text-right text-accent-cyan">3,500,000.00 ISK</td>
                <td className="p-3 text-right text-accent-green">+150,000.00 ISK</td>
                <td className="p-3">
                  <div className="flex justify-center">
                    <EveActionButtonsCompact
                      typeId={44992}
                      typeName="PLEX"
                      solarSystemId={30000142}
                      onCopy={handleCopy}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Example 6: Custom styling */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Custom Styling</h2>
        <p className="text-text-secondary mb-4">
          With custom className applied
        </p>
        <EveActionButtons
          typeId={34}
          typeName="Tritanium"
          solarSystemId={30000142}
          className="border border-accent-cyan/30 rounded-lg p-2 bg-accent-cyan/5"
        />
      </div>

      {/* Implementation notes */}
      <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-accent-gold mb-4">Implementation Notes</h2>
        <ul className="space-y-2 text-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-accent-gold">•</span>
            <span>EVE:// protocol links will only work if EVE Online client is installed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold">•</span>
            <span>Tooltips appear on hover to explain what each button does</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold">•</span>
            <span>Toast notifications provide feedback for all actions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold">•</span>
            <span>Buttons are hidden if required props are not provided</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-gold">•</span>
            <span>Use compact variant in tables or dense layouts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EveActionButtonsExamples;
