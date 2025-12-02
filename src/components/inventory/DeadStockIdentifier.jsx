import { useState, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatNumber, formatISK, formatRelativeTime } from '../../utils/formatters';

/**
 * Dead Stock Identifier Component
 * Identifies items that haven't sold recently and suggests actions
 */
export function DeadStockIdentifier({
  inventory = [],
  salesHistory = [],
  currentPrices = {},
  className = '',
}) {
  const [deadStockDays, setDeadStockDays] = useState(7);
  const [sortBy, setSortBy] = useState('iskTiedUp'); // iskTiedUp, daysSinceLastSale, quantity

  /**
   * Analyze dead stock
   */
  const deadStockAnalysis = useMemo(() => {
    if (!inventory.length) return [];

    const now = Date.now();
    const deadStockThreshold = deadStockDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    const analysis = inventory.map(item => {
      // Find sales for this item
      const itemSales = salesHistory.filter(
        sale => sale.itemId?.toString() === item.itemId?.toString()
      );

      let lastSaleDate = null;
      let daysSinceLastSale = Infinity;

      if (itemSales.length > 0) {
        // Find most recent sale
        const dates = itemSales.map(s => new Date(s.date || s.timestamp).getTime());
        lastSaleDate = new Date(Math.max(...dates));
        daysSinceLastSale = (now - lastSaleDate) / (1000 * 60 * 60 * 24);
      }

      // Calculate ISK tied up
      const currentPrice = currentPrices[item.itemId] || item.price || item.buyPrice || 0;
      const iskTiedUp = (item.quantity || 0) * currentPrice;

      // Calculate opportunity cost (could have invested this ISK elsewhere)
      // Assume 5% daily return as baseline trading opportunity
      const opportunityCost = iskTiedUp * 0.05 * Math.min(daysSinceLastSale, 30);

      // Determine if it's dead stock
      const isDead = itemSales.length === 0 || daysSinceLastSale > deadStockDays;

      return {
        ...item,
        lastSaleDate,
        daysSinceLastSale,
        iskTiedUp,
        opportunityCost,
        isDead,
        hasSales: itemSales.length > 0,
      };
    });

    // Filter only dead stock items
    return analysis.filter(item => item.isDead);
  }, [inventory, salesHistory, currentPrices, deadStockDays]);

  /**
   * Sort the analysis
   */
  const sortedAnalysis = useMemo(() => {
    const sorted = [...deadStockAnalysis];

    switch (sortBy) {
      case 'iskTiedUp':
        sorted.sort((a, b) => b.iskTiedUp - a.iskTiedUp);
        break;
      case 'daysSinceLastSale':
        sorted.sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale);
        break;
      case 'quantity':
        sorted.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        break;
    }

    return sorted;
  }, [deadStockAnalysis, sortBy]);

  /**
   * Calculate totals
   */
  const totals = useMemo(() => {
    return deadStockAnalysis.reduce(
      (acc, item) => ({
        iskTiedUp: acc.iskTiedUp + item.iskTiedUp,
        opportunityCost: acc.opportunityCost + item.opportunityCost,
        items: acc.items + 1,
      }),
      { iskTiedUp: 0, opportunityCost: 0, items: 0 }
    );
  }, [deadStockAnalysis]);

  /**
   * Get suggested action for an item
   */
  const getSuggestedAction = (item) => {
    if (!item.hasSales) {
      return {
        action: 'Liquidate',
        reason: 'No sales history',
        color: 'accent-gold',
      };
    }

    if (item.daysSinceLastSale > deadStockDays * 2) {
      return {
        action: 'Move to Different Market',
        reason: `No sales for ${Math.floor(item.daysSinceLastSale)} days`,
        color: 'accent-gold',
      };
    }

    if (item.daysSinceLastSale > deadStockDays * 1.5) {
      return {
        action: 'Reprice Aggressively',
        reason: 'Stale inventory',
        color: 'accent-purple',
      };
    }

    return {
      action: 'Reprice',
      reason: 'Slow moving',
      color: 'accent-cyan',
    };
  };

  // Empty state
  if (inventory.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-text-secondary">No inventory data available</p>
        </div>
      </GlassmorphicCard>
    );
  }

  if (deadStockAnalysis.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-text-primary">
            Dead Stock Identifier
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            No items unsold for {deadStockDays}+ days
          </p>
        </div>

        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-accent-cyan opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-text-secondary font-semibold">All Clear!</p>
          <p className="text-sm text-text-secondary mt-2">
            All inventory items have sold within the last {deadStockDays} days
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-text-secondary mb-2">
            Dead Stock Threshold (days)
          </label>
          <input
            type="number"
            value={deadStockDays}
            onChange={(e) => setDeadStockDays(Math.max(1, parseInt(e.target.value) || 7))}
            min="1"
            max="90"
            className="w-full px-4 py-2 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary focus:outline-none focus:border-accent-cyan/50"
          />
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Dead Stock Identifier
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Items that haven't sold in {deadStockDays}+ days
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Dead Stock Threshold (days)
          </label>
          <input
            type="number"
            value={deadStockDays}
            onChange={(e) => setDeadStockDays(Math.max(1, parseInt(e.target.value) || 7))}
            min="1"
            max="90"
            className="w-full px-4 py-2 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary focus:outline-none focus:border-accent-cyan/50"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary focus:outline-none focus:border-accent-cyan/50"
          >
            <option value="iskTiedUp">ISK Tied Up</option>
            <option value="daysSinceLastSale">Days Since Last Sale</option>
            <option value="quantity">Quantity</option>
          </select>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="mb-6 p-4 bg-accent-gold/10 border border-accent-gold/30 rounded-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-accent-gold mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold text-accent-gold">
              {totals.items} Dead Stock Items Found
            </div>
            <div className="text-sm text-text-secondary mt-1">
              {formatISK(totals.iskTiedUp)} tied up •
              Opportunity cost: {formatISK(totals.opportunityCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Dead Stock Items</div>
          <div className="text-2xl font-bold text-accent-gold">
            {totals.items}
          </div>
        </div>

        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">ISK Tied Up</div>
          <div className="text-2xl font-bold text-accent-gold">
            {formatISK(totals.iskTiedUp)}
          </div>
        </div>

        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Opportunity Cost</div>
          <div className="text-2xl font-bold text-accent-purple">
            {formatISK(totals.opportunityCost)}
          </div>
        </div>
      </div>

      {/* Dead Stock List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          Dead Stock Items ({sortedAnalysis.length})
        </h3>

        <div className="space-y-2">
          {sortedAnalysis.map(item => {
            const suggestion = getSuggestedAction(item);

            return (
              <div
                key={item.itemId}
                className="p-4 bg-space-mid/30 rounded-lg border border-accent-gold/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary">
                      {item.itemName}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {item.hasSales ? (
                        <>
                          Last sale: {formatRelativeTime(item.lastSaleDate)} •
                          {Math.floor(item.daysSinceLastSale)} days ago
                        </>
                      ) : (
                        'No sales history'
                      )}
                    </div>
                  </div>

                  <div className={`ml-4 px-3 py-1 bg-${suggestion.color}/10 border border-${suggestion.color}/30 rounded-lg text-xs font-semibold text-${suggestion.color} whitespace-nowrap`}>
                    {suggestion.action}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-text-secondary text-xs">Quantity</div>
                    <div className="text-text-primary font-semibold">
                      {formatNumber(item.quantity, 0)}
                    </div>
                  </div>

                  <div>
                    <div className="text-text-secondary text-xs">ISK Tied Up</div>
                    <div className="text-text-primary font-semibold">
                      {formatISK(item.iskTiedUp)}
                    </div>
                  </div>

                  <div>
                    <div className="text-text-secondary text-xs">Days Stale</div>
                    <div className="text-text-primary font-semibold">
                      {item.daysSinceLastSale === Infinity
                        ? 'Never'
                        : Math.floor(item.daysSinceLastSale)}
                    </div>
                  </div>

                  <div>
                    <div className="text-text-secondary text-xs">Opportunity Cost</div>
                    <div className="text-text-primary font-semibold">
                      {formatISK(item.opportunityCost)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-accent-cyan/10">
                  <div className="text-xs text-text-secondary">
                    <span className="font-semibold">Suggested Action:</span> {suggestion.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Legend */}
      <div className="mt-6 pt-4 border-t border-accent-cyan/10">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Action Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="font-semibold text-accent-cyan mb-1">Reprice</div>
            <div className="text-text-secondary text-xs">
              Item is slow moving. Adjust price to be more competitive.
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-purple mb-1">Reprice Aggressively</div>
            <div className="text-text-secondary text-xs">
              Stale inventory. Consider significant price reduction.
            </div>
          </div>
          <div>
            <div className="font-semibold text-accent-gold mb-1">Move/Liquidate</div>
            <div className="text-text-secondary text-xs">
              Try different market or sell at cost to free up ISK.
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            const csv = [
              ['Item Name', 'Quantity', 'ISK Tied Up', 'Days Since Last Sale', 'Opportunity Cost', 'Suggested Action'],
              ...sortedAnalysis.map(item => {
                const suggestion = getSuggestedAction(item);
                return [
                  item.itemName,
                  item.quantity,
                  item.iskTiedUp.toFixed(2),
                  item.daysSinceLastSale === Infinity ? 'Never' : Math.floor(item.daysSinceLastSale),
                  item.opportunityCost.toFixed(2),
                  suggestion.action,
                ];
              })
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dead-stock-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full px-4 py-2 bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 rounded-lg hover:bg-accent-cyan/30 transition-colors"
        >
          Export to CSV
        </button>
      </div>
    </GlassmorphicCard>
  );
}

export default DeadStockIdentifier;
