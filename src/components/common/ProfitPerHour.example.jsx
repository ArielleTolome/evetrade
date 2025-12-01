import { ProfitPerHour } from './ProfitPerHour';
import { formatISK } from '../../utils/formatters';

/**
 * Example usage of ProfitPerHour component
 * This file demonstrates various use cases and configurations
 */

// Example trade data
const exampleTrades = [
  {
    id: 1,
    itemName: 'Tritanium',
    Volume: 500,
    'Profit per Unit': 5000,
    'Buy Price': 50000,
    'Net Profit': 2500000,
  },
  {
    id: 2,
    itemName: 'PLEX',
    Volume: 50,
    'Profit per Unit': 50000000,
    'Buy Price': 2000000000,
    'Net Profit': 2500000000,
  },
  {
    id: 3,
    itemName: 'Nocxium',
    Volume: 200,
    'Profit per Unit': 100000,
    'Buy Price': 1000000,
    'Net Profit': 20000000,
  },
];

// Example 1: Inline mode in a table
export function InlineTableExample() {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-text-primary">
        Example 1: Inline Mode (Table)
      </h3>
      <table className="w-full border border-accent-cyan/20">
        <thead>
          <tr className="bg-space-darker">
            <th className="p-3 text-left text-text-primary">Item</th>
            <th className="p-3 text-right text-text-primary">Net Profit</th>
            <th className="p-3 text-right text-text-primary">Volume</th>
            <th className="p-3 text-right text-text-primary">Efficiency</th>
          </tr>
        </thead>
        <tbody>
          {exampleTrades.map(trade => (
            <tr key={trade.id} className="border-t border-accent-cyan/10">
              <td className="p-3 text-text-primary">{trade.itemName}</td>
              <td className="p-3 text-right font-mono text-green-400">
                {formatISK(trade['Net Profit'])}
              </td>
              <td className="p-3 text-right text-text-secondary">
                {trade.Volume}
              </td>
              <td className="p-3">
                <ProfitPerHour trade={trade} inline={true} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-text-secondary mt-2">
        Click on the efficiency values to see more details
      </p>
    </div>
  );
}

// Example 2: Expanded mode in a card
export function ExpandedCardExample() {
  const trade = exampleTrades[1]; // Use PLEX as example

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-text-primary">
        Example 2: Expanded Mode (Detail View)
      </h3>
      <div className="max-w-md">
        <div className="bg-space-dark/30 border border-accent-cyan/10 rounded-lg p-4 mb-4">
          <h4 className="text-lg font-semibold text-text-primary mb-2">
            {trade.itemName}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Net Profit:</span>
              <span className="font-mono text-green-400">
                {formatISK(trade['Net Profit'])}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Volume:</span>
              <span className="font-mono text-text-primary">
                {trade.Volume} units
              </span>
            </div>
          </div>
        </div>

        <ProfitPerHour trade={trade} inline={false} />
      </div>
    </div>
  );
}

// Example 3: Custom options
export function CustomOptionsExample() {
  const trade = exampleTrades[2]; // Use Nocxium

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-text-primary">
        Example 3: Custom Market Capture Rates
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conservative */}
        <div>
          <h4 className="text-sm font-semibold text-text-secondary mb-2">
            Conservative (30%)
          </h4>
          <ProfitPerHour
            trade={trade}
            inline={false}
            options={{ assumedTurnover: 0.3 }}
          />
        </div>

        {/* Moderate */}
        <div>
          <h4 className="text-sm font-semibold text-text-secondary mb-2">
            Moderate (50%)
          </h4>
          <ProfitPerHour
            trade={trade}
            inline={false}
            options={{ assumedTurnover: 0.5 }}
          />
        </div>

        {/* Aggressive */}
        <div>
          <h4 className="text-sm font-semibold text-text-secondary mb-2">
            Aggressive (70%)
          </h4>
          <ProfitPerHour
            trade={trade}
            inline={false}
            options={{ assumedTurnover: 0.7 }}
          />
        </div>
      </div>
      <p className="text-sm text-text-secondary mt-4">
        Adjust the market capture rate based on your trading style and market presence
      </p>
    </div>
  );
}

// Example 4: Comparison view
export function ComparisonExample() {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-text-primary">
        Example 4: Trade Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exampleTrades.map(trade => (
          <div key={trade.id}>
            <h4 className="text-lg font-semibold text-text-primary mb-2">
              {trade.itemName}
            </h4>
            <ProfitPerHour trade={trade} inline={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 5: Complete page example
export function CompletePageExample() {
  return (
    <div className="min-h-screen bg-space-darker p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          ProfitPerHour Component Examples
        </h1>

        <InlineTableExample />
        <ExpandedCardExample />
        <CustomOptionsExample />
        <ComparisonExample />
      </div>
    </div>
  );
}

export default CompletePageExample;
