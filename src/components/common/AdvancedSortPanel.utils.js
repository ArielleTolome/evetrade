/**
 * Predefined sort presets for common trading strategies
 */
export const SORT_PRESETS = [
  {
    id: 'bestOverall',
    name: 'Best Overall',
    icon: '⭐',
    sorts: [{ column: 'Score', direction: 'desc' }],
    description: 'Balanced score considering all factors'
  },
  {
    id: 'highestProfit',
    name: 'Highest Profit',
    icon: '💰',
    sorts: [{ column: 'Net Profit', direction: 'desc' }],
    description: 'Maximum ISK per trade'
  },
  {
    id: 'bestROI',
    name: 'Best ROI',
    icon: '📈',
    sorts: [{ column: 'ROI', direction: 'desc' }],
    description: 'Highest return on investment'
  },
  {
    id: 'safest',
    name: 'Safest Trades',
    icon: '🛡️',
    sorts: [
      { column: 'Volume', direction: 'desc' },
      { column: 'Gross Margin', direction: 'asc' }
    ],
    description: 'High volume, reasonable margins'
  },
  {
    id: 'quickFlips',
    name: 'Quick Flips',
    icon: '⚡',
    sorts: [
      { column: 'Volume', direction: 'desc' },
      { column: 'Profit per Unit', direction: 'desc' }
    ],
    description: 'Fast-moving items with good profit'
  },
  {
    id: 'hiddenGems',
    name: 'Hidden Gems',
    icon: '💎',
    sorts: [
      { column: 'Gross Margin', direction: 'desc' },
      { column: 'Net Profit', direction: 'desc' }
    ],
    description: 'High margin opportunities'
  },
];

/**
 * Available columns that can be sorted
 */
export const SORTABLE_COLUMNS = [
  { key: 'Item', label: 'Item Name', type: 'string' },
  { key: 'Buy Price', label: 'Buy Price', type: 'number' },
  { key: 'Sell Price', label: 'Sell Price', type: 'number' },
  { key: 'Volume', label: 'Volume', type: 'number' },
  { key: 'Profit per Unit', label: 'Profit/Unit', type: 'number' },
  { key: 'Net Profit', label: 'Net Profit', type: 'number' },
  { key: 'Gross Margin', label: 'Margin', type: 'number' },
  { key: 'Score', label: 'Score', type: 'number' },
  { key: 'ROI', label: 'ROI', type: 'number' },
];


/**
 * Utility function to apply multi-column sorting to data
 *
 * @param {Array} data - Data array to sort
 * @param {Array} sorts - Array of sort configurations [{column, direction}, ...]
 * @param {Array} columns - Column definitions with type information
 * @returns {Array} Sorted data
 */
export function applySorts(data, sorts, columns) {
  if (!sorts || sorts.length === 0) return data;

  return [...data].sort((a, b) => {
    // Apply each sort in order until we find a non-zero comparison
    for (const sort of sorts) {
      const aVal = a[sort.column];
      const bVal = b[sort.column];

      // Handle null/undefined
      if (aVal == null && bVal == null) continue;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Determine if numeric comparison
      const col = columns?.find(c => c.key === sort.column);
      const isNumeric = col?.type === 'num' || col?.type === 'number' || typeof aVal === 'number';

      let comparison;
      if (isNumeric) {
        comparison = Number(aVal) - Number(bVal);
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      // If values are different, return the comparison
      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison;
      }

      // If values are equal, continue to next sort
    }

    // All sorts resulted in equality
    return 0;
  });
}
