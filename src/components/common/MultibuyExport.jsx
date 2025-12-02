import { useState, useCallback, useMemo } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';
import { Button } from './Button';
import { generateMultibuyFormat } from './QuickCopyButtons';

/**
 * Extract item name and quantity from data row
 * Handles different data formats and key naming conventions
 * @param {object} row - Data row
 * @returns {object|null} Object with {name, quantity} or null
 */
function extractItemData(row) {
  // Try different possible key combinations
  const nameKeys = ['Item', 'name', 'Name', 'item_name', 'itemName'];
  const quantityKeys = ['Quantity', 'quantity', 'Qty', 'qty', 'Volume', 'volume'];

  let name = null;
  let quantity = null;

  // Find name
  for (const key of nameKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      name = String(row[key]);
      break;
    }
  }

  // Find quantity
  for (const key of quantityKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      const val = Number(row[key]);
      if (!isNaN(val)) {
        quantity = Math.floor(val);
        break;
      }
    }
  }

  if (name && quantity !== null) {
    return { name, quantity };
  }

  return null;
}

/**
 * MultibuyExport Component
 * Exports trading data in EVE Online Multibuy format
 */
export function MultibuyExport({
  data = [],
  buttonLabel = 'Copy as Multibuy',
  buttonSize = 'md',
  showPreview = false,
  maxPreviewItems = 5,
  className = '',
  onCopy,
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Extract and format items
  const items = useMemo(() => {
    return data
      .map(row => extractItemData(row))
      .filter(item => item !== null);
  }, [data]);

  // Generate multibuy string
  const multibuyText = useMemo(() => {
    return generateMultibuyFormat(items);
  }, [items]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!multibuyText) return;

    try {
      await navigator.clipboard.writeText(multibuyText);
      setIsCopied(true);
      onCopy?.(multibuyText);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [multibuyText, onCopy]);

  // Handle button click
  const handleClick = useCallback(() => {
    if (showPreview) {
      setShowModal(true);
    } else {
      copyToClipboard();
    }
  }, [showPreview, copyToClipboard]);

  // Handle modal copy
  const handleModalCopy = useCallback(() => {
    copyToClipboard();
    setShowModal(false);
  }, [copyToClipboard]);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          flex items-center gap-2 rounded-lg transition-all duration-200 font-medium
          ${sizeClasses[buttonSize]}
          ${isCopied
            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
            : 'bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/20'
          }
          ${className}
        `}
        aria-label={buttonLabel}
      >
        {isCopied ? (
          <>
            <svg className={iconSizes[buttonSize]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg className={iconSizes[buttonSize]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>{buttonLabel}</span>
            <span className="text-xs text-text-secondary">({items.length})</span>
          </>
        )}
      </button>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-black/80 backdrop-blur-sm">
          <GlassmorphicCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-display text-accent-cyan">Multibuy Preview</h3>
                <p className="text-sm text-text-secondary mt-1">
                  {items.length} item{items.length !== 1 ? 's' : ''} ready to copy
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto mb-4">
              <div className="bg-space-black/40 rounded-lg p-4 border border-accent-cyan/20">
                <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap">
                  {items.slice(0, maxPreviewItems).map((item, idx) => (
                    <div key={idx}>{item.name} {item.quantity}</div>
                  ))}
                  {items.length > maxPreviewItems && (
                    <div className="text-text-secondary mt-2">
                      ... and {items.length - maxPreviewItems} more item{items.length - maxPreviewItems !== 1 ? 's' : ''}
                    </div>
                  )}
                </pre>
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-4 p-3 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
              <p className="text-xs text-text-secondary">
                <strong className="text-accent-cyan">Tip:</strong> In EVE Online, open the Market window,
                click the "Multibuy" tab, paste this list, and click "Paste from Clipboard" to quickly
                add all items to your shopping list.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleModalCopy}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </GlassmorphicCard>
        </div>
      )}
    </>
  );
}

/**
 * Compact Multibuy Button
 * Smaller version for use in table toolbars
 */
export function MultibuyExportCompact({
  data = [],
  onCopy,
  className = '',
}) {
  return (
    <MultibuyExport
      data={data}
      buttonLabel="Multibuy"
      buttonSize="sm"
      showPreview={false}
      onCopy={onCopy}
      className={className}
    />
  );
}

/**
 * Multibuy Button with Preview
 * Shows a preview modal before copying
 */
export function MultibuyExportWithPreview({
  data = [],
  onCopy,
  className = '',
  maxPreviewItems = 10,
}) {
  return (
    <MultibuyExport
      data={data}
      buttonLabel="Copy as Multibuy"
      buttonSize="md"
      showPreview={true}
      maxPreviewItems={maxPreviewItems}
      onCopy={onCopy}
      className={className}
    />
  );
}

export default MultibuyExport;
