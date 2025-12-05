import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Clipboard, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';

const formatValue = (value, format) => {
  if (format === 'json' && typeof value !== 'string') {
    return JSON.stringify(value, null, 2);
  }
  if (format === 'formatted' && typeof value === 'number') {
    return new Intl.NumberFormat().format(value);
  }
  return String(value);
};

export const CopyButton = ({
  value,
  format = 'text',
  onCopy,
  successDuration = 2000,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const formattedValue = formatValue(value, format);
  const { copy, copied } = useCopyToClipboard({
    onSuccess: () => {
      if (onCopy) onCopy(formattedValue);
    },
  });

  const handleCopy = (e) => {
    e.preventDefault();
    copy(formattedValue, successDuration);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy(e);
    }
  };

  const Icon = copied ? Check : Clipboard;
  const tooltipText = copied ? 'Copied!' : 'Copy';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className={cn(
          'relative p-2 rounded-md transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark',
          'transform active:scale-90',
          className
        )}
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={tooltipText}
        {...props}
      >
        <div className="relative w-5 h-5">
          <Icon
            className={cn(
              'absolute w-full h-full transition-all duration-300 ease-in-out transform',
              copied ? 'scale-100 opacity-100 text-[#00ff9d]' : 'scale-100 opacity-100 text-[#778DA9]',
              !copied && isHovered ? 'scale-110' : ''
            )}
            strokeWidth={2}
          />
        </div>
      </button>
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-md text-sm font-medium text-white whitespace-nowrap transition-all duration-200 ease-in-out pointer-events-none',
          'bg-[#1B263B] shadow-lg',
          isHovered || copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}
        role="tooltip"
      >
        {tooltipText}
      </div>
    </div>
  );
};

CopyButton.propTypes = {
  value: PropTypes.any.isRequired,
  format: PropTypes.oneOf(['text', 'json', 'formatted']),
  onCopy: PropTypes.func,
  successDuration: PropTypes.number,
  className: PropTypes.string,
};

export default CopyButton;
