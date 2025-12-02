import { useState, useCallback } from 'react';
import { useClipboard } from '../../hooks/useClipboard';

/**
 * OneClickCopy Component
 * A reusable component for one-click copying with visual feedback
 *
 * @param {string} value - The value to copy
 * @param {string} format - Format type: 'text', 'json', 'csv', 'ingame'
 * @param {string} label - Label to display and use in history
 * @param {string} className - Additional CSS classes
 * @param {boolean} showLabel - Whether to show the label text
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {Function} onCopy - Callback fired after successful copy
 */
export function OneClickCopy({
  value,
  format = 'text',
  label,
  className = '',
  showLabel = true,
  size = 'md',
  onCopy,
}) {
  const { copy } = useClipboard();
  const [isHovered, setIsHovered] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await copy(value, format, { label });

    if (result.success) {
      setJustCopied(true);
      onCopy?.(value, format);

      // Reset copied state after animation
      setTimeout(() => {
        setJustCopied(false);
      }, 2000);
    }
  }, [value, format, label, copy, onCopy]);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        inline-flex items-center rounded-lg font-medium transition-all duration-200
        ${sizeClasses[size]}
        ${justCopied
          ? 'bg-green-500/20 text-green-400 border border-green-500/50 scale-105'
          : 'bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/20 hover:scale-105'
        }
        ${className}
      `}
      aria-label={`Copy ${label || 'value'}`}
      title={`Copy ${label || 'value'}`}
    >
      {/* Icon with animation */}
      <span className={`flex-shrink-0 transition-transform duration-200 ${justCopied ? 'scale-110' : ''}`}>
        {justCopied ? (
          <svg
            className={`${iconSizes[size]} animate-bounce-once`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className={iconSizes[size]}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </span>

      {/* Label */}
      {showLabel && (
        <span className="truncate">
          {justCopied ? 'Copied!' : label || 'Copy'}
        </span>
      )}
    </button>
  );
}

/**
 * OneClickCopyInline Component
 * Minimal inline copy button that appears on hover
 */
export function OneClickCopyInline({
  value,
  format = 'text',
  label,
  children,
  className = '',
}) {
  const { copy } = useClipboard();
  const [isHovered, setIsHovered] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await copy(value, format, { label });

    if (result.success) {
      setJustCopied(true);
      setTimeout(() => {
        setJustCopied(false);
      }, 2000);
    }
  }, [value, format, label, copy]);

  return (
    <div
      className={`relative inline-flex items-center gap-2 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content */}
      <span className="truncate">
        {children || value}
      </span>

      {/* Copy button - appears on hover */}
      <button
        onClick={handleCopy}
        className={`
          flex-shrink-0 p-1 rounded transition-all duration-200
          ${(isHovered || justCopied) ? 'opacity-100' : 'opacity-0'}
          ${justCopied
            ? 'bg-green-500/20 text-green-400'
            : 'bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20'
          }
        `}
        aria-label={`Copy ${label || 'value'}`}
      >
        {justCopied ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>

      {/* Tooltip */}
      {isHovered && !justCopied && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-space-black border border-accent-cyan/30 rounded text-xs whitespace-nowrap z-10 pointer-events-none">
          Click to copy
        </div>
      )}
    </div>
  );
}

export default OneClickCopy;
