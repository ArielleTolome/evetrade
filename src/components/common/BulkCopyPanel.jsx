import { useState, useCallback, useMemo, useEffect } from 'react';
import { useClipboard } from '../../hooks/useClipboard';
import { formatNumber } from '../../utils/formatters';

/**
 * BulkCopyPanel Component
 * A panel for bulk copying multiple items with various format options
 *
 * @param {Array} items - Array of items to copy
 * @param {Function} getItemName - Function to extract item name from item object
 * @param {Function} getItemDetails - Function to extract detailed info from item object
 * @param {Array} preSelectedItems - Array of pre-selected item IDs
 * @param {Function} onSelectionChange - Callback when selection changes
 * @param {Function} onCopy - Callback after successful copy
 * @param {boolean} compact - Compact mode (less padding)
 */
export function BulkCopyPanel({
  items = [],
  getItemName = (item) => item.name || String(item),
  getItemDetails = null,
  preSelectedItems = [],
  onSelectionChange,
  onCopy,
  compact = false,
}) {
  const { copy } = useClipboard();
  const [selectedIds, setSelectedIds] = useState(new Set(preSelectedItems));
  const [format, setFormat] = useState('names');
  const [justCopied, setJustCopied] = useState(false);

  // Sync with preSelectedItems
  useEffect(() => {
    setSelectedIds(new Set(preSelectedItems));
  }, [preSelectedItems]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds));
  }, [selectedIds, onSelectionChange]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter((item, index) => selectedIds.has(item.id || index));
  }, [items, selectedIds]);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item, index) => item.id || index)));
    }
  }, [items, selectedIds.size]);

  // Format selected items for copying
  const formatItems = useCallback((items, formatType) => {
    switch (formatType) {
      case 'names':
        // Item names only, one per line
        return items.map(item => getItemName(item)).join('\n');

      case 'details':
        // Full details (if getItemDetails is provided)
        if (getItemDetails) {
          return items.map(item => getItemDetails(item)).join('\n');
        }
        // Fallback to JSON
        return JSON.stringify(items, null, 2);

      case 'csv': {
        // CSV format with headers
        if (items.length === 0) return '';

        // Get all unique keys from all items
        const allKeys = new Set();
        items.forEach(item => {
          Object.keys(item).forEach(key => allKeys.add(key));
        });
        const headers = Array.from(allKeys);

        const csvRows = [
          headers.join(','),
          ...items.map(item => headers.map(key => {
            const value = item[key];
            if (value === null || value === undefined) return '';
            // Escape values containing commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(','))
        ];
        return csvRows.join('\n');
      }

      case 'ingame':
        // EVE Online in-game format (item names separated by newlines)
        return items.map(item => getItemName(item)).join('\n');

      case 'shopping':
        // Shopping list format: quantity x item name
        return items.map(item => {
          const name = getItemName(item);
          const qty = item.quantity || item.qty || 1;
          return `${formatNumber(qty, 0)}x ${name}`;
        }).join('\n');

      default:
        return items.map(item => getItemName(item)).join('\n');
    }
  }, [getItemName, getItemDetails]);

  // Handle copy action
  const handleCopy = useCallback(async () => {
    if (selectedItems.length === 0) return;

    const formatted = formatItems(selectedItems, format);
    const result = await copy(formatted, 'text', {
      label: `${selectedItems.length} items (${format})`,
    });

    if (result.success) {
      setJustCopied(true);
      onCopy?.(selectedItems, format);

      setTimeout(() => {
        setJustCopied(false);
      }, 2000);
    }
  }, [selectedItems, format, formatItems, copy, onCopy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + C to copy when items are selected
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.size > 0) {
        // Only if no text is selected
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.preventDefault();
          handleCopy();
        }
      }

      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && items.length > 0) {
        const activeElement = document.activeElement;
        // Only if not in an input field
        if (!activeElement || !['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
          e.preventDefault();
          setSelectedIds(new Set(items.map((item, index) => item.id || index)));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds.size, items, handleCopy]);

  const formatOptions = [
    { value: 'names', label: 'Item Names Only', icon: '📝' },
    { value: 'details', label: 'Full Details', icon: '📋' },
    { value: 'csv', label: 'CSV Format', icon: '📊' },
    { value: 'ingame', label: 'In-Game Format', icon: '🎮' },
    { value: 'shopping', label: 'Shopping List', icon: '🛒' },
  ];

  if (items.length === 0) {
    return (
      <div className={`text-center ${compact ? 'py-4' : 'py-8'} text-text-secondary`}>
        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No items available to copy</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? 'p-3' : 'p-4'} bg-space-light/5 border border-accent-cyan/20 rounded-lg`}>
      {/* Header with select all */}
      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedIds.size === items.length}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-accent-cyan/30 bg-space-light/10 text-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/50 cursor-pointer"
          />
          <span className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
            Select All ({items.length})
          </span>
        </label>

        {/* Selection count badge */}
        {selectedIds.size > 0 && (
          <div className="px-3 py-1 bg-accent-cyan/10 text-accent-cyan rounded-full text-xs font-semibold border border-accent-cyan/20">
            {selectedIds.size} selected
          </div>
        )}
      </div>

      {/* Format selector */}
      <div className="space-y-2">
        <label className="text-xs text-text-secondary font-medium">Copy Format</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {formatOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFormat(option.value)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${format === option.value
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50'
                  : 'bg-space-light/10 text-text-secondary hover:bg-space-light/20 border border-accent-cyan/10'
                }
              `}
            >
              <span>{option.icon}</span>
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        disabled={selectedIds.size === 0}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-base
          transition-all duration-200
          ${selectedIds.size === 0
            ? 'bg-space-light/10 text-text-secondary cursor-not-allowed opacity-50'
            : justCopied
              ? 'bg-green-500/20 text-green-400 border border-green-500/50 scale-105'
              : 'bg-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/30 border border-accent-cyan/50 hover:scale-105'
          }
        `}
      >
        {justCopied ? (
          <>
            <svg className="w-5 h-5 animate-bounce-once" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied {selectedIds.size} Items!</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy {selectedIds.size} Item{selectedIds.size !== 1 ? 's' : ''}</span>
          </>
        )}
      </button>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-text-secondary text-center">
        <kbd className="px-1.5 py-0.5 bg-space-light/20 rounded text-accent-cyan">Ctrl+A</kbd> to select all
        {' • '}
        <kbd className="px-1.5 py-0.5 bg-space-light/20 rounded text-accent-cyan">Ctrl+C</kbd> to copy
      </div>
    </div>
  );
}

/**
 * BulkCopyList Component
 * List view with checkboxes for item selection
 */
export function BulkCopyList({
  items = [],
  selectedIds = new Set(),
  onToggleItem,
  getItemName = (item) => item.name || String(item),
  renderItem,
  maxHeight = '300px',
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="space-y-1 overflow-y-auto"
      style={{ maxHeight }}
    >
      {items.map((item, index) => {
        const itemId = item.id || index;
        const isSelected = selectedIds.has(itemId);

        return (
          <label
            key={itemId}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
              ${isSelected
                ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                : 'bg-space-light/5 border border-transparent hover:bg-space-light/10 hover:border-accent-cyan/20'
              }
            `}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleItem(itemId)}
              className="w-4 h-4 rounded border-accent-cyan/30 bg-space-light/10 text-accent-cyan focus-visible:ring-2 focus:ring-accent-cyan/50 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              {renderItem ? renderItem(item, index) : (
                <span className="text-sm text-text-primary truncate">
                  {getItemName(item)}
                </span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}

export default BulkCopyPanel;
