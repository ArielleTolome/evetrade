import { useState, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatNumber, formatISK } from '../../utils/formatters';

/**
 * Restock Suggestions Component
 * Analyzes sales velocity and suggests restock quantities
 */
export function RestockSuggestions({
  inventory = [],
  salesHistory = [],
  className = '',
}) {
  const [targetDays, setTargetDays] = useState(7);
  const [sortBy, setSortBy] = useState('priority'); // priority, profit, velocity, daysRemaining

  /**
   * Calculate sales velocity and restock recommendations
   */
  const restockAnalysis = useMemo(() => {
    if (!inventory.length || !salesHistory.length) return [];

    const analysis = inventory.map(item => {
      // Find sales for this item
      const itemSales = salesHistory.filter(
        sale => sale.itemId?.toString() === item.itemId?.toString()
      );

      if (itemSales.length === 0) {
        return {
          ...item,
          velocity: 0,
          daysRemaining: Infinity,
          recommendedRestock: 0,
          iskNeeded: 0,
          priority: 0,
          hasData: false,
        };
      }

      // Calculate velocity (items per day)
      const totalSold = itemSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
      const oldestSale = new Date(Math.min(...itemSales.map(s => new Date(s.date || s.timestamp))));
      const newestSale = new Date(Math.max(...itemSales.map(s => new Date(s.date || s.timestamp))));
      const daysCovered = Math.max(1, (newestSale - oldestSale) / (1000 * 60 * 60 * 24));
      const velocity = totalSold / daysCovered;

      // Calculate days remaining at current stock
      const currentStock = item.quantity || 0;
      const daysRemaining = velocity > 0 ? currentStock / velocity : Infinity;

      // Calculate recommended restock quantity
      const targetStock = velocity * targetDays;
      const recommendedRestock = Math.max(0, Math.ceil(targetStock - currentStock));

      // Calculate ISK needed (use buy price or current market price)
      const pricePerUnit = item.buyPrice || item.price || 0;
      const iskNeeded = recommendedRestock * pricePerUnit;

      // Calculate average profit per item
      const avgProfit = item.profitPerUnit || item.margin || 0;
      const totalProfit = avgProfit * velocity * targetDays;

      // Priority score: combination of profit potential and urgency
      // Higher priority = more profitable + running out sooner
      const urgencyScore = daysRemaining < targetDays ? (targetDays - daysRemaining) / targetDays : 0;
      const profitScore = totalProfit / (totalProfit + 1000000); // Normalize
      const priority = (urgencyScore * 0.6 + profitScore * 0.4) * 100;

      return {
        ...item,
        velocity,
        daysRemaining,
        recommendedRestock,
        iskNeeded,
        totalProfit,
        priority,
        hasData: true,
      };
    });

    // Filter items that have sales data
    return analysis.filter(item => item.hasData);
  }, [inventory, salesHistory, targetDays]);

  /**
   * Sort the analysis
   */
  const sortedAnalysis = useMemo(() => {
    const sorted = [...restockAnalysis];

    switch (sortBy) {
      case 'priority':
        sorted.sort((a, b) => b.priority - a.priority);
        break;
      case 'profit':
        sorted.sort((a, b) => (b.totalProfit || 0) - (a.totalProfit || 0));
        break;
      case 'velocity':
        sorted.sort((a, b) => b.velocity - a.velocity);
        break;
      case 'daysRemaining':
        sorted.sort((a, b) => a.daysRemaining - b.daysRemaining);
        break;
      default:
        break;
    }

    return sorted;
  }, [restockAnalysis, sortBy]);

  /**
   * Calculate total ISK needed for all recommendations
   */
  const totalIskNeeded = useMemo(() => {
    return restockAnalysis.reduce((sum, item) => sum + item.iskNeeded, 0);
  }, [restockAnalysis]);

  /**
   * Calculate total potential profit
   */
  const totalPotentialProfit = useMemo(() => {
    return restockAnalysis.reduce((sum, item) => sum + (item.totalProfit || 0), 0);
  }, [restockAnalysis]);

  // Empty state
  if (inventory.length === 0 || salesHistory.length === 0) {
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-text-secondary">No sales data available</p>
          <p className="text-sm text-text-secondary mt-2">
            Sales history is needed to calculate restock suggestions
          </p>
        </div>
      </GlassmorphicCard>
    );
  }

  if (restockAnalysis.length === 0) {
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-text-secondary">No matching sales data</p>
          <p className="text-sm text-text-secondary mt-2">
            No sales found for items in your current inventory
          </p>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Restock Suggestions
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Based on sales velocity and target inventory days
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Target Days of Inventory
          </label>
          <input
            type="number"
            value={targetDays}
            onChange={(e) => setTargetDays(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="30"
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
            <option value="priority">Priority (Urgency + Profit)</option>
            <option value="profit">Potential Profit</option>
            <option value="velocity">Sales Velocity</option>
            <option value="daysRemaining">Days Remaining</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Items Needing Restock</div>
          <div className="text-2xl font-bold text-accent-cyan">
            {sortedAnalysis.filter(i => i.recommendedRestock > 0).length}
          </div>
        </div>

        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Total ISK Needed</div>
          <div className="text-2xl font-bold text-accent-gold">
            {formatISK(totalIskNeeded)}
          </div>
        </div>

        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Potential Profit ({targetDays}d)</div>
          <div className="text-2xl font-bold text-accent-purple">
            {formatISK(totalPotentialProfit)}
          </div>
        </div>
      </div>

      {/* Restock List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          Recommendations ({sortedAnalysis.length} items)
        </h3>

        <div className="space-y-2">
          {sortedAnalysis.map(item => {
            const needsRestock = item.recommendedRestock > 0;
            const isUrgent = item.daysRemaining < 2;

            return (
              <div
                key={item.itemId}
                className={`p-4 rounded-lg border ${
                  isUrgent
                    ? 'bg-accent-gold/10 border-accent-gold/30'
                    : needsRestock
                    ? 'bg-accent-cyan/5 border-accent-cyan/20'
                    : 'bg-space-mid/30 border-accent-cyan/10'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold text-text-primary">
                        {item.itemName}
                      </span>
                      {isUrgent && (
                        <span className="ml-2 px-2 py-0.5 bg-accent-gold/20 text-accent-gold text-xs rounded">
                          URGENT
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <div className="text-text-secondary text-xs">Current Stock</div>
                        <div className="text-text-primary font-semibold">
                          {formatNumber(item.quantity, 0)}
                        </div>
                      </div>

                      <div>
                        <div className="text-text-secondary text-xs">Sales/Day</div>
                        <div className="text-text-primary font-semibold">
                          {formatNumber(item.velocity, 1)}
                        </div>
                      </div>

                      <div>
                        <div className="text-text-secondary text-xs">Days Remaining</div>
                        <div className="text-text-primary font-semibold">
                          {item.daysRemaining === Infinity
                            ? '∞'
                            : formatNumber(item.daysRemaining, 1)}
                        </div>
                      </div>

                      <div>
                        <div className="text-text-secondary text-xs">Priority Score</div>
                        <div className="text-text-primary font-semibold">
                          {formatNumber(item.priority, 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {needsRestock && (
                  <div className="mt-3 pt-3 border-t border-accent-cyan/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-accent-cyan">
                          Recommended Restock: {formatNumber(item.recommendedRestock, 0)} units
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          ISK Needed: {formatISK(item.iskNeeded)} •
                          Potential Profit: {formatISK(item.totalProfit)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!needsRestock && (
                  <div className="mt-3 pt-3 border-t border-accent-cyan/10">
                    <div className="text-sm text-text-secondary">
                      Stock is sufficient for {targetDays} days
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 pt-4 border-t border-accent-cyan/10">
        <button
          onClick={() => {
            const csv = [
              ['Item Name', 'Current Stock', 'Sales/Day', 'Days Remaining', 'Recommended Restock', 'ISK Needed', 'Potential Profit'],
              ...sortedAnalysis.map(item => [
                item.itemName,
                item.quantity,
                item.velocity.toFixed(2),
                item.daysRemaining === Infinity ? 'Infinity' : item.daysRemaining.toFixed(1),
                item.recommendedRestock,
                item.iskNeeded.toFixed(2),
                (item.totalProfit || 0).toFixed(2),
              ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `restock-suggestions-${new Date().toISOString().split('T')[0]}.csv`;
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

export default RestockSuggestions;
