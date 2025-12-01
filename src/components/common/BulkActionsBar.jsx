import { useState, useCallback, useMemo } from 'react';
import { formatISK } from '../../utils/formatters';

export function BulkActionsBar({
  items = [],
  selectedIds = [],
  onSelectionChange,
  onBulkFavorite,
  onBulkUnfavorite,
  onBulkCopy,
  onBulkAddToShoppingList,
  onExport,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(true);

  // Selection stats
  const stats = useMemo(() => {
    const selected = items.filter(item =>
      selectedIds.includes(item['Item ID'] || item.itemId)
    );

    const totalProfit = selected.reduce((sum, item) =>
      sum + (item['Net Profit'] || 0), 0
    );

    const totalVolume = selected.reduce((sum, item) =>
      sum + (item['Volume'] || 0), 0
    );

    return {
      count: selected.length,
      totalProfit,
      totalVolume,
      items: selected,
    };
  }, [items, selectedIds]);

  // Select all
  const selectAll = useCallback(() => {
    const allIds = items.map(item => item['Item ID'] || item.itemId);
    onSelectionChange?.(allIds);
  }, [items, onSelectionChange]);

  // Deselect all
  const deselectAll = useCallback(() => {
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // Toggle item selection
  const toggleItem = useCallback((itemId) => {
    if (selectedIds.includes(itemId)) {
      onSelectionChange?.(selectedIds.filter(id => id !== itemId));
    } else {
      onSelectionChange?.([...selectedIds, itemId]);
    }
  }, [selectedIds, onSelectionChange]);

  // Copy selected to clipboard
  const copySelected = useCallback(() => {
    const text = stats.items.map(item =>
      `${item['Item']}\t${item['Buy Price']}\t${item['Sell Price']}\t${item['Net Profit']}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    onBulkCopy?.(stats.items);
  }, [stats.items, onBulkCopy]);

  // Export to CSV
  const exportCSV = useCallback(() => {
    const headers = ['Item', 'Buy Price', 'Sell Price', 'Volume', 'Net Profit', 'Margin'];
    const rows = stats.items.map(item => [
      item['Item'],
      item['Buy Price'],
      item['Sell Price'],
      item['Volume'],
      item['Net Profit'],
      item['Gross Margin']
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evetrade-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    onExport?.(stats.items);
  }, [stats.items, onExport]);

  if (!isVisible || stats.count === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 ${className}`}>
      <div className="flex items-center gap-4 px-6 py-3 bg-space-dark/95 backdrop-blur-md border border-accent-cyan/30 rounded-xl shadow-2xl">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-4 border-r border-accent-cyan/20">
          <span className="text-accent-cyan font-bold text-lg">{stats.count}</span>
          <span className="text-text-secondary text-sm">selected</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pr-4 border-r border-accent-cyan/20">
          <div className="text-center">
            <div className="text-green-400 font-mono text-sm">{formatISK(stats.totalProfit, false)}</div>
            <div className="text-xs text-text-secondary">Total Profit</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBulkFavorite?.(stats.items)}
            className="p-2 text-accent-gold hover:bg-accent-gold/20 rounded-lg transition-colors"
            title="Add to favorites"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>

          <button
            onClick={() => onBulkAddToShoppingList?.(stats.items)}
            className="p-2 text-accent-cyan hover:bg-accent-cyan/20 rounded-lg transition-colors"
            title="Add to shopping list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>

          <button
            onClick={copySelected}
            className="p-2 text-text-secondary hover:bg-white/10 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={exportCSV}
            className="p-2 text-text-secondary hover:bg-white/10 rounded-lg transition-colors"
            title="Export CSV"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <div className="h-6 w-px bg-accent-cyan/20 mx-2" />

          <button
            onClick={selectAll}
            className="px-3 py-1 text-xs text-accent-cyan hover:bg-accent-cyan/20 rounded transition-colors"
          >
            Select All
          </button>

          <button
            onClick={deselectAll}
            className="px-3 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            deselectAll();
            setIsVisible(false);
          }}
          className="ml-2 p-1 text-text-secondary hover:text-text-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Export selection checkbox component for use in tables
export function SelectionCheckbox({
  itemId,
  isSelected,
  onToggle,
  className = '',
}) {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle?.(itemId)}
        className="sr-only peer"
      />
      <div className="w-5 h-5 rounded border-2 border-accent-cyan/30 bg-space-dark/50 peer-checked:bg-accent-cyan peer-checked:border-accent-cyan flex items-center justify-center transition-colors">
        {isSelected && (
          <svg className="w-3 h-3 text-space-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </label>
  );
}

export default BulkActionsBar;
