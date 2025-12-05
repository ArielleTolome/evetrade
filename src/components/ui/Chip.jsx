import React, { forwardRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import PropTypes from 'prop-types';

const chipVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark border',
  {
    variants: {
      variant: {
        filled: 'bg-[#1B263B] text-[#E0E1DD] border-[#415A77] hover:bg-[#415A77]/50',
        outlined: 'bg-transparent border-[#415A77] text-[#E0E1DD] hover:bg-[#415A77]/50',
      },
      size: {
        sm: 'px-2.5 py-1 text-xs gap-1.5',
        md: 'px-3 py-1.5 text-sm gap-2',
      },
      selected: {
        true: 'bg-[#415A77] text-[#E0E1DD] border-[#415A77]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      selected: false,
    },
  }
);

const iconSize = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

const Chip = forwardRef(
  (
    {
      label,
      variant = 'filled',
      color,
      size = 'md',
      removable = false,
      onRemove,
      onClick,
      icon: Icon,
      selected = false,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [isRemoved, setIsRemoved] = useState(false);

    const handleRemove = (e) => {
      e.stopPropagation();
      setIsRemoved(true);
      setTimeout(() => {
        if (onRemove) {
          onRemove();
        }
      }, 200);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (onClick) {
          onClick();
        }
      } else if (removable && e.key === 'Escape') {
        e.preventDefault();
        handleRemove(e);
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const isClickable = !!onClick;

    const customColorStyle = color
      ? variant === 'outlined'
        ? { borderColor: color, color }
        : { backgroundColor: color, borderColor: color }
      : {};

    return (
      <div
        ref={ref}
        className={cn(
          chipVariants({ variant, size, selected }),
          isClickable && 'cursor-pointer active:scale-95',
          isRemoved ? 'opacity-0 scale-75' : 'opacity-100 scale-100',
          selected && 'hover:bg-[#415A77]/80',
          className
        )}
        style={customColorStyle}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={isClickable ? 0 : -1}
        aria-pressed={selected}
        {...props}
      >
        {Icon && <Icon className={cn(iconSize[size])} />}
        <span>{label}</span>
        {removable && (
          <button
            onClick={handleRemove}
            className="ml-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label={`Remove ${label}`}
            tabIndex="-1"
          >
            <X className={cn(iconSize[size])} />
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['filled', 'outlined']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
  icon: PropTypes.elementType,
  selected: PropTypes.bool,
  className: PropTypes.string,
  onKeyDown: PropTypes.func,
};

export default Chip;
