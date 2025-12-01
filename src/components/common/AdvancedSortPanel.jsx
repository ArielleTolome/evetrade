import { useState, useCallback, useMemo } from 'react';

/**
 * Predefined sort presets for common trading strategies
 */
const SORT_PRESETS = [
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
const SORTABLE_COLUMNS = [
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
 * AdvancedSortPanel Component
 *
 * Provides a sophisticated sorting interface with:
 * - Multi-column sorting (sort by A, then by B, then by C)
 * - Custom sort presets for common trading strategies
 * - Drag-and-drop sort priority (via move buttons)
 * - Visual sort indicators
 * - Expandable/collapsible interface
 *
 * @param {Array} currentSort - Current sort configuration array
 * @param {Function} onChange - Callback when sort changes
 * @param {string} className - Additional CSS classes
 */
export function AdvancedSortPanel({
  currentSort = [],
  onChange,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [customSorts, setCustomSorts] = useState(currentSort);

  // Apply preset
  const applyPreset = useCallback((preset) => {
    setActivePreset(preset.id);
    setCustomSorts(preset.sorts);
    onChange?.(preset.sorts);
  }, [onChange]);

  // Add sort column
  const addSort = useCallback((column, direction = 'desc') => {
    const newSorts = [...customSorts, { column, direction }];
    setCustomSorts(newSorts);
    setActivePreset(null);
    onChange?.(newSorts);
  }, [customSorts, onChange]);

  // Remove sort column
  const removeSort = useCallback((index) => {
    const newSorts = customSorts.filter((_, i) => i !== index);
    setCustomSorts(newSorts);
    setActivePreset(null);
    onChange?.(newSorts);
  }, [customSorts, onChange]);

  // Toggle direction
  const toggleDirection = useCallback((index) => {
    const newSorts = [...customSorts];
    newSorts[index].direction = newSorts[index].direction === 'asc' ? 'desc' : 'asc';
    setCustomSorts(newSorts);
    setActivePreset(null);
    onChange?.(newSorts);
  }, [customSorts, onChange]);

  // Move sort priority up
  const moveSortUp = useCallback((index) => {
    if (index === 0) return;
    const newSorts = [...customSorts];
    [newSorts[index - 1], newSorts[index]] = [newSorts[index], newSorts[index - 1]];
    setCustomSorts(newSorts);
    setActivePreset(null);
    onChange?.(newSorts);
  }, [customSorts, onChange]);

  // Move sort priority down
  const moveSortDown = useCallback((index) => {
    if (index === customSorts.length - 1) return;
    const newSorts = [...customSorts];
    [newSorts[index], newSorts[index + 1]] = [newSorts[index + 1], newSorts[index]];
    setCustomSorts(newSorts);
    setActivePreset(null);
    onChange?.(newSorts);
  }, [customSorts, onChange]);

  // Clear all sorts
  const clearSorts = useCallback(() => {
    setCustomSorts([]);
    setActivePreset(null);
    onChange?.([]);
  }, [onChange]);

  // Available columns (not already in sort)
  const availableColumns = useMemo(() => {
    const usedColumns = customSorts.map(s => s.column);
    return SORTABLE_COLUMNS.filter(c => !usedColumns.includes(c.key));
  }, [customSorts]);

  // Summary text for collapsed state
  const sortSummary = useMemo(() => {
    if (customSorts.length === 0) return 'No sorting applied';
    if (customSorts.length === 1) {
      const sort = customSorts[0];
      return `${sort.column} (${sort.direction === 'desc' ? '↓' : '↑'})`;
    }
    return `${customSorts.length} columns`;
  }, [customSorts]);

  return (
    <div className={`bg-space-dark/40 backdrop-blur-sm border border-accent-cyan/20 rounded-lg ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-space-dark/20 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-accent-cyan transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-sm font-medium text-text-primary">Advanced Sorting</span>
          {customSorts.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded-full">
              {customSorts.length} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activePreset && (
            <span className="text-xs text-accent-gold">
              {SORT_PRESETS.find(p => p.id === activePreset)?.icon} {SORT_PRESETS.find(p => p.id === activePreset)?.name}
            </span>
          )}
          {!activePreset && customSorts.length > 0 && (
            <span className="text-xs text-text-secondary">
              {sortSummary}
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-accent-cyan/10">
          {/* Presets */}
          <div className="mb-4">
            <div className="text-xs text-text-secondary mb-2 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Presets
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    activePreset === preset.id
                      ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/20'
                      : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/50 hover:bg-space-dark/70'
                  }`}
                  title={preset.description}
                >
                  <span className="mr-1">{preset.icon}</span>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current sorts */}
          {customSorts.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-text-secondary mb-2 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Current Sort Order {customSorts.length > 1 && '(higher priority first)'}
              </div>
              <div className="space-y-2">
                {customSorts.map((sort, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-space-dark/50 rounded-lg border border-accent-cyan/10 hover:border-accent-cyan/30 transition-colors"
                  >
                    {/* Priority number */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveSortUp(index)}
                        disabled={index === 0}
                        className="p-0.5 text-accent-cyan hover:text-accent-cyan/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSortDown(index)}
                        disabled={index === customSorts.length - 1}
                        className="p-0.5 text-accent-cyan hover:text-accent-cyan/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <span className="text-xs text-text-secondary font-mono w-6 text-center">{index + 1}.</span>

                    {/* Column name */}
                    <span className="text-sm text-text-primary flex-1 font-medium">{sort.column}</span>

                    {/* Direction toggle */}
                    <button
                      type="button"
                      onClick={() => toggleDirection(index)}
                      className="px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan rounded hover:bg-accent-cyan/20 transition-colors border border-accent-cyan/30"
                    >
                      {sort.direction === 'desc' ? (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          DESC
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          ASC
                        </span>
                      )}
                    </button>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeSort(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      title="Remove this sort"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add column */}
          {availableColumns.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-text-secondary mb-2 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Sort Column
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColumns.map(col => (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => addSort(col.key)}
                    className="px-2 py-1 text-xs bg-space-dark/50 border border-accent-cyan/20 text-text-secondary rounded hover:border-accent-cyan/50 hover:text-text-primary hover:bg-space-dark/70 transition-colors"
                  >
                    + {col.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear button */}
          {customSorts.length > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-accent-cyan/10">
              <button
                type="button"
                onClick={clearSorts}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Sorts
              </button>

              {customSorts.length > 1 && (
                <span className="text-xs text-text-secondary">
                  Sorting by {customSorts.length} columns
                </span>
              )}
            </div>
          )}

          {/* Empty state */}
          {customSorts.length === 0 && availableColumns.length === SORTABLE_COLUMNS.length && (
            <div className="text-center py-6 text-text-secondary text-xs">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <p>No sorting applied</p>
              <p className="mt-1 opacity-75">Choose a preset or add columns above</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

// Export helpers
export { SORT_PRESETS, SORTABLE_COLUMNS };
export default AdvancedSortPanel;
