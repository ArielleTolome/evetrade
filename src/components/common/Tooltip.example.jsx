import { useState } from 'react';
import { Tooltip, InfoTooltip } from './Tooltip';

/**
 * Tooltip Component Examples
 * Demonstrates various usage patterns
 */
export function TooltipExamples() {
  const [isControlledOpen, setIsControlledOpen] = useState(false);

  return (
    <div className="p-8 space-y-12 bg-space-dark min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-display text-text-primary mb-8">
          Tooltip Component Examples
        </h1>

        {/* Basic Tooltips */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Basic Tooltips</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="This tooltip appears on top" position="top">
              <button className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-text-primary rounded-lg border border-accent-cyan/50 transition-colors">
                Top
              </button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the bottom" position="bottom">
              <button className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-text-primary rounded-lg border border-accent-cyan/50 transition-colors">
                Bottom
              </button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the left" position="left">
              <button className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-text-primary rounded-lg border border-accent-cyan/50 transition-colors">
                Left
              </button>
            </Tooltip>

            <Tooltip content="This tooltip appears on the right" position="right">
              <button className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-text-primary rounded-lg border border-accent-cyan/50 transition-colors">
                Right
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Trigger Modes */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Trigger Modes</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="Hover to see this tooltip (300ms delay)" trigger="hover">
              <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                Hover (default)
              </button>
            </Tooltip>

            <Tooltip content="Click to toggle this tooltip" trigger="click" position="bottom">
              <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                Click
              </button>
            </Tooltip>

            <Tooltip content="Focus to see this tooltip" trigger="focus" position="bottom">
              <input
                type="text"
                placeholder="Focus me"
                className="px-4 py-2 bg-space-light text-text-primary rounded-lg border border-text-secondary/30 focus:border-accent-cyan focus:outline-none transition-colors"
              />
            </Tooltip>
          </div>
        </section>

        {/* Rich Content */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Rich Content</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip
              content={
                <div className="space-y-2">
                  <div className="font-display text-accent-cyan">Trading Tip</div>
                  <p className="text-sm">
                    Station trading requires lower margins but higher volume. Consider items with
                    100+ daily volume for best results.
                  </p>
                  <div className="text-xs text-text-secondary mt-2 pt-2 border-t border-accent-cyan/20">
                    Press ESC to close
                  </div>
                </div>
              }
              position="right"
              maxWidth="300px"
            >
              <button className="px-4 py-2 bg-accent-purple/20 hover:bg-accent-purple/30 text-text-primary rounded-lg border border-accent-purple/50 transition-colors">
                Rich Content
              </button>
            </Tooltip>

            <Tooltip
              content={
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-accent-green">✓</span>
                    <span>High liquidity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent-green">✓</span>
                    <span>Low competition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent-gold">⚠</span>
                    <span>Medium volume</span>
                  </div>
                </div>
              }
              position="bottom"
            >
              <button className="px-4 py-2 bg-accent-green/20 hover:bg-accent-green/30 text-text-primary rounded-lg border border-accent-green/50 transition-colors">
                Status List
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Controlled Mode */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Controlled Mode</h2>
          <div className="flex gap-4 items-center">
            <Tooltip
              content="This tooltip is controlled externally"
              isOpen={isControlledOpen}
              onOpenChange={setIsControlledOpen}
              position="right"
            >
              <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                Controlled Tooltip
              </button>
            </Tooltip>
            <button
              onClick={() => setIsControlledOpen(!isControlledOpen)}
              className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-text-primary rounded-lg border border-accent-cyan/50 transition-colors"
            >
              {isControlledOpen ? 'Hide' : 'Show'} Tooltip
            </button>
          </div>
        </section>

        {/* Info Tooltip Helper */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Info Tooltip Helper</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-text-primary">Station Trading</span>
              <InfoTooltip
                content="Buy low and sell high at the same station. Requires minimal hauling."
                position="right"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-primary">Margin Percentage</span>
              <InfoTooltip
                content="The difference between buy and sell prices, expressed as a percentage. Higher is better."
                position="right"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-primary">Daily Volume</span>
              <InfoTooltip
                content={
                  <div className="space-y-1">
                    <p>Average units traded per day.</p>
                    <ul className="list-disc list-inside text-xs mt-2">
                      <li>High: 1000+ units/day</li>
                      <li>Medium: 100-1000 units/day</li>
                      <li>Low: &lt;100 units/day</li>
                    </ul>
                  </div>
                }
                position="right"
              />
            </div>
          </div>
        </section>

        {/* Custom Delay */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Custom Delay</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="No delay" delay={0} position="top">
              <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                No Delay
              </button>
            </Tooltip>

            <Tooltip content="500ms delay" delay={500} position="top">
              <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                500ms Delay
              </button>
            </Tooltip>

            <Tooltip content="1 second delay" delay={1000} position="top">
              <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                1s Delay
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Disabled State */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Disabled State</h2>
          <div className="flex gap-4">
            <Tooltip content="This tooltip is disabled" disabled position="top">
              <button className="px-4 py-2 bg-space-light text-text-secondary rounded-lg border border-text-secondary/30 opacity-50 cursor-not-allowed">
                Disabled Tooltip
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Edge Cases - Auto Flip */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Auto Position Flip</h2>
          <p className="text-text-secondary text-sm">
            Try these near the edges of the viewport. The tooltip will automatically flip to stay visible.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-start">
              <Tooltip content="Tooltip flips from left to right when near edge" position="left">
                <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                  Left Edge
                </button>
              </Tooltip>
            </div>
            <div className="flex justify-end">
              <Tooltip content="Tooltip flips from right to left when near edge" position="right">
                <button className="px-4 py-2 bg-space-light hover:bg-space-mid text-text-primary rounded-lg border border-text-secondary/30 transition-colors">
                  Right Edge
                </button>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* Keyboard Accessibility */}
        <section className="space-y-4">
          <h2 className="text-xl font-display text-accent-cyan">Keyboard Accessibility</h2>
          <div className="bg-space-light p-4 rounded-lg border border-accent-cyan/20">
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-space-dark rounded border border-text-secondary/30 text-xs">Tab</kbd>
                <span>Navigate to tooltip trigger</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-space-dark rounded border border-text-secondary/30 text-xs">Enter</kbd>
                <span>Activate click triggers</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-space-dark rounded border border-text-secondary/30 text-xs">Esc</kbd>
                <span>Close tooltip and return focus</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TooltipExamples;
