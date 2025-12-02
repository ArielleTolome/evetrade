import { useState, useCallback } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * Quick Copy Buttons Component
 * Provides one-click copy functionality for trading data with visual feedback
 */
export function QuickCopyButtons({
  itemName = '',
  price = 0,
  quantity = 0,
  customFormats = [],
  onCopy,
  compact = false,
}) {
  const [copiedItem, setCopiedItem] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);

  // Copy to clipboard with feedback
  const copyToClipboard = useCallback(async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      onCopy?.({ type, text });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [onCopy]);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((e, text, type) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyToClipboard(text, type);
    }
  }, [copyToClipboard]);

  // Pre-defined copy formats
  const formats = [
    {
      id: 'itemName',
      label: 'Item',
      getValue: () => itemName,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      getValue: () => formatNumber(price, 2),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'quantity',
      label: 'Qty',
      getValue: () => formatNumber(quantity, 0),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ),
    },
    {
      id: 'formatted',
      label: 'Formatted',
      getValue: () => `Buy ${formatNumber(quantity, 0)}x ${itemName} at ${formatISK(price)}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  // Add custom formats
  const allFormats = [...formats, ...customFormats];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {allFormats.map((format) => {
          const value = format.getValue();
          const isCopied = copiedItem === format.id;

          return (
            <button
              key={format.id}
              onClick={() => copyToClipboard(value, format.id)}
              onKeyDown={(e) => handleKeyDown(e, value, format.id)}
              onMouseEnter={() => setShowTooltip(format.id)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`
                relative p-1.5 rounded-md transition-all duration-200
                ${isCopied
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/20'
                }
              `}
              aria-label={`Copy ${format.label}`}
              title={`Copy ${format.label}`}
            >
              {isCopied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                format.icon
              )}

              {/* Tooltip */}
              {showTooltip === format.id && !isCopied && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-space-black border border-accent-cyan/30 rounded text-xs whitespace-nowrap z-10">
                  {format.label}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-text-secondary font-medium">Quick Copy</label>
      <div className="grid grid-cols-2 gap-2">
        {allFormats.map((format) => {
          const value = format.getValue();
          const isCopied = copiedItem === format.id;

          return (
            <button
              key={format.id}
              onClick={() => copyToClipboard(value, format.id)}
              onKeyDown={(e) => handleKeyDown(e, value, format.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                ${isCopied
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/20'
                }
              `}
              aria-label={`Copy ${format.label}`}
            >
              {isCopied ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="flex-shrink-0">{format.icon}</span>
              )}
              <span className="truncate">{isCopied ? 'Copied!' : format.label}</span>
            </button>
          );
        })}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-text-secondary mt-1">
        Tip: Focus a button and press Enter/Space to copy
      </div>
    </div>
  );
}

/**
 * Single Quick Copy Button
 * For individual copy actions
 */
export function QuickCopyButton({
  value,
  label,
  icon,
  onCopy,
  className = '',
  size = 'md',
}) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      onCopy?.(value);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [value, onCopy]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyToClipboard();
    }
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

  return (
    <button
      onClick={copyToClipboard}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center gap-2 rounded-lg transition-all duration-200 font-medium
        ${sizeClasses[size]}
        ${isCopied
          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
          : 'bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/20'
        }
        ${className}
      `}
      aria-label={`Copy ${label}`}
    >
      {isCopied ? (
        <>
          <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          {icon || (
            <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default QuickCopyButtons;
