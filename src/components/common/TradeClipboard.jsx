import { useState, useCallback } from 'react';
import { useClipboard } from '../../hooks/useClipboard';
import { formatRelativeTime } from '../../utils/formatters';

/**
 * TradeClipboard Component
 * A smart clipboard manager with history and pinned items
 *
 * @param {Function} onItemCopy - Callback when an item is copied from history
 * @param {boolean} compact - Compact mode
 * @param {number} maxItems - Maximum number of items to display (default: 10)
 */
export function TradeClipboard({
  onItemCopy,
  compact = false,
  maxItems = 10,
}) {
  const { history, clearHistory, removeFromHistory, pinItem, recopy } = useClipboard();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Toggle item expansion
  const toggleExpand = useCallback((id) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle clear history with confirmation
  const handleClearHistory = useCallback(() => {
    if (showConfirmClear) {
      clearHistory();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setShowConfirmClear(false), 3000);
    }
  }, [showConfirmClear, clearHistory]);

  // Handle re-copy from history
  const handleRecopy = useCallback(async (id) => {
    const result = await recopy(id);
    if (result.success) {
      onItemCopy?.(id);
    }
  }, [recopy, onItemCopy]);

  // Get pinned and recent items
  const pinnedItems = history.filter(item => item.pinned);
  const recentItems = history.filter(item => !item.pinned).slice(0, maxItems);

  if (history.length === 0) {
    return (
      <div className={`text-center ${compact ? 'py-6' : 'py-8'} text-text-secondary`}>
        <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium mb-1">No clipboard history</p>
        <p className="text-xs opacity-75">Copied items will appear here</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? 'p-3' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary">Clipboard History</h3>
          <div className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded-full text-xs font-medium">
            {history.length}
          </div>
        </div>

        {/* Clear button */}
        {recentItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${showConfirmClear
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'bg-space-light/10 text-text-secondary hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/30'
              }
            `}
          >
            {showConfirmClear ? 'Click to Confirm' : 'Clear History'}
          </button>
        )}
      </div>

      {/* Pinned items */}
      {pinnedItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
            </svg>
            <span>Pinned</span>
          </div>
          <div className="space-y-1">
            {pinnedItems.map((item) => (
              <ClipboardItem
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggleExpand={() => toggleExpand(item.id)}
                onRecopy={() => handleRecopy(item.id)}
                onRemove={() => removeFromHistory(item.id)}
                onTogglePin={() => pinItem(item.id)}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent items */}
      {recentItems.length > 0 && (
        <div className="space-y-2">
          {pinnedItems.length > 0 && (
            <div className="text-xs font-medium text-text-secondary">Recent</div>
          )}
          <div className="space-y-1">
            {recentItems.map((item) => (
              <ClipboardItem
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggleExpand={() => toggleExpand(item.id)}
                onRecopy={() => handleRecopy(item.id)}
                onRemove={() => removeFromHistory(item.id)}
                onTogglePin={() => pinItem(item.id)}
                compact={compact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="pt-2 border-t border-accent-cyan/10 text-xs text-text-secondary text-center">
        Click any item to copy again
      </div>
    </div>
  );
}

/**
 * ClipboardItem Component
 * Individual clipboard history item
 */
function ClipboardItem({
  item,
  isExpanded,
  onToggleExpand,
  onRecopy,
  onRemove,
  onTogglePin,
  compact,
}) {
  const [justCopied, setJustCopied] = useState(false);

  const handleRecopy = useCallback(async () => {
    await onRecopy();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  }, [onRecopy]);

  const formatBadge = {
    text: { label: 'Text', color: 'blue' },
    json: { label: 'JSON', color: 'purple' },
    csv: { label: 'CSV', color: 'green' },
    ingame: { label: 'In-Game', color: 'orange' },
  };

  const badge = formatBadge[item.format] || formatBadge.text;
  const badgeColors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  // Truncate text for preview
  const previewText = item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text;

  return (
    <div
      className={`
        group relative rounded-lg border transition-all duration-200
        ${justCopied
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-space-light/5 border-accent-cyan/20 hover:bg-space-light/10 hover:border-accent-cyan/40'
        }
      `}
    >
      <div className={`flex items-start gap-3 ${compact ? 'p-2' : 'p-3'}`}>
        {/* Main content - clickable to copy */}
        <button
          onClick={handleRecopy}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            {/* Format badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badgeColors[badge.color]}`}>
              {badge.label}
            </span>

            {/* Label */}
            <span className="text-xs font-medium text-text-primary truncate">
              {item.label}
            </span>

            {/* Timestamp */}
            <span className="text-xs text-text-secondary ml-auto flex-shrink-0">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>

          {/* Preview text */}
          <div className={`text-xs text-text-secondary font-mono ${isExpanded ? '' : 'truncate'}`}>
            {isExpanded ? item.text : previewText}
          </div>
        </button>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Re-copy button */}
          <button
            onClick={handleRecopy}
            className="p-1.5 rounded hover:bg-accent-cyan/10 text-accent-cyan transition-colors"
            title="Copy again"
          >
            {justCopied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* Pin button */}
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded transition-colors ${item.pinned ? 'text-accent-cyan bg-accent-cyan/10' : 'text-text-secondary hover:bg-space-light/20'}`}
            title={item.pinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-4 h-4" fill={item.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Expand button (if text is long) */}
          {item.text.length > 100 && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded hover:bg-space-light/20 text-text-secondary transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradeClipboard;
