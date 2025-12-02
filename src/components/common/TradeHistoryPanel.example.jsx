import { TradeHistoryPanel } from './TradeHistoryPanel';
import { EveAuthProvider } from '../../hooks/useEveAuth';

/**
 * Trade History Panel Example
 *
 * This example shows how to use the TradeHistoryPanel component
 * to display a comprehensive trade history analysis with profit tracking.
 *
 * Features:
 * - Displays total profit, win rate, and trading statistics
 * - Shows profit timeline with visual chart
 * - Lists all trades with profit/loss calculations
 * - Filters by date range
 * - Sorts by profit, margin, volume, or name
 * - Shows best and worst trades
 * - Handles authentication state (shows login prompt if not authenticated)
 */

export function TradeHistoryPanelExample() {
  return (
    <EveAuthProvider>
      <div className="min-h-screen bg-space-dark p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-display text-text-primary mb-8">
            Trade History Panel Example
          </h1>

          <TradeHistoryPanel />

          <div className="mt-8 p-6 bg-white/5 rounded-lg">
            <h2 className="text-xl font-display text-text-primary mb-4">
              How It Works
            </h2>
            <div className="text-text-secondary space-y-2">
              <p>
                <strong>Authentication Required:</strong> This component requires
                EVE Online authentication to fetch wallet transactions from the ESI API.
              </p>
              <p>
                <strong>Data Source:</strong> Transaction data is fetched from the
                ESI /characters/character_id/wallet/transactions/ endpoint.
              </p>
              <p>
                <strong>Profit Calculation:</strong> Uses FIFO (First In, First Out)
                method to match buy and sell orders and calculate realized profits.
              </p>
              <p>
                <strong>Caching:</strong> Summary statistics are cached in localStorage
                and transaction data is cached for 5 minutes to reduce API calls.
              </p>
              <p>
                <strong>Filtering:</strong> Supports filtering by date range (24h, 7d, 30d, all time).
              </p>
              <p>
                <strong>Sorting:</strong> Can sort by profit, margin, volume, or item name.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EveAuthProvider>
  );
}

export default TradeHistoryPanelExample;
