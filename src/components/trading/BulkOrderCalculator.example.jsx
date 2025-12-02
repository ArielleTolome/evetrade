import { BulkOrderCalculator } from './BulkOrderCalculator';
import { GlassmorphicCard } from '../common/GlassmorphicCard';

/**
 * BulkOrderCalculator Examples
 * Demonstrates usage of the BulkOrderCalculator component
 */
export function BulkOrderCalculatorExample() {
  const handleCalculate = (calculations) => {
    console.log('Calculations:', calculations);
    // Could send to analytics, save to database, etc.
  };

  return (
    <div className="space-y-8 p-8 bg-space-black min-h-screen">
      <div>
        <h1 className="text-3xl font-display text-accent-cyan mb-2">Bulk Order Calculator</h1>
        <p className="text-text-secondary">
          Calculate profits for multiple trade orders with detailed breakdown
        </p>
      </div>

      {/* Example 1: Basic Usage */}
      <div className="max-w-6xl">
        <BulkOrderCalculator onCalculate={handleCalculate} />
      </div>

      {/* Example 2: Custom Fees */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Custom Broker Fees & Sales Tax</h3>
        <p className="text-text-secondary text-sm mb-4">
          Adjust fees based on your standings and skills. Lower fees = higher profits!
        </p>
        <BulkOrderCalculator
          defaultBrokerFee={0.025} // 2.5% (reduced from 3% with skills)
          defaultSalesTax={0.02}   // 2.0% (reduced from 2.5% with skills)
          onCalculate={handleCalculate}
        />
      </GlassmorphicCard>

      {/* Example 3: Features Overview */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-accent-gold mb-3">Calculations</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Total investment (buy orders + broker fees)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Total revenue (sell orders - fees - taxes)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Gross profit (before fees)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Net profit (after all fees)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>ROI percentage</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Profit per unit</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Gross and net margins</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-accent-gold mb-3">Break-even Analysis</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Minimum sell price to break even</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Break-even quantity (if current trade is unprofitable)</span>
              </li>
            </ul>

            <h4 className="text-sm font-medium text-accent-gold mb-3 mt-6">User Interface</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Add/remove items dynamically</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expand/collapse detailed breakdowns</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Color-coded profit/loss indicators</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Export calculations to CSV</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Total summary for all items</span>
              </li>
            </ul>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Example 4: Use Cases */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Use Cases</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h4 className="text-sm font-medium text-accent-cyan mb-2">Station Trading</h4>
            <p className="text-xs text-text-secondary">
              Calculate profits for margin trading multiple items in a single station.
              Perfect for Jita, Amarr, or other major trade hubs.
            </p>
          </div>
          <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h4 className="text-sm font-medium text-accent-cyan mb-2">Hauling Contracts</h4>
            <p className="text-xs text-text-secondary">
              Plan multi-item hauling routes. Enter buy prices at source and sell prices
              at destination to see total profit before you haul.
            </p>
          </div>
          <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h4 className="text-sm font-medium text-accent-cyan mb-2">Manufacturing Profits</h4>
            <p className="text-xs text-text-secondary">
              Calculate profits for manufactured goods. Enter material costs as buy price
              and market value as sell price.
            </p>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Example 5: Tips */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Tips</h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent-gold font-bold">1</span>
            </div>
            <div>
              <p className="text-text-primary font-medium mb-1">Adjust your fees</p>
              <p>
                Train Broker Relations and Accounting skills to reduce fees. Factor in NPC
                corporation standings for additional reductions.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent-gold font-bold">2</span>
            </div>
            <div>
              <p className="text-text-primary font-medium mb-1">Use break-even analysis</p>
              <p>
                The minimum sell price shows you the lowest price you can sell at without
                losing ISK. Always price above this!
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent-gold font-bold">3</span>
            </div>
            <div>
              <p className="text-text-primary font-medium mb-1">Compare multiple strategies</p>
              <p>
                Add the same item with different quantities to see how volume affects
                total profit and ROI.
              </p>
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

export default BulkOrderCalculatorExample;
