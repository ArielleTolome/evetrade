import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

const sizeStyles = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-2.5 py-1.5 text-sm gap-1.5',
  lg: 'px-3 py-2 text-base gap-2',
};

const variantStyles = {
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  primary: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
  // Add other color variants if needed
};

/**
 * A flexible compound badge with icon, label, value, and an optional action.
 * @param {{
 *   icon: React.ReactNode,
 *   label: string,
 *   value: string | number,
 *   onRemove?: () => void,
 *   size?: 'sm' | 'md' | 'lg',
 *   variant?: 'default' | 'primary',
 *   className?: string
 * }} props
 */
export const CompoundBadge = ({
  icon,
  label,
  value,
  onRemove,
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const sizeClass = sizeStyles[size];
  const colorClass = variantStyles[variant];

  return (
    <div
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors duration-200 ease-in-out',
        sizeClass,
        colorClass,
        { 'hover:bg-opacity-30': !onRemove },
        className
      )}
      aria-label={`${label}: ${value}`}
    >
      {icon}
      <span className="font-normal mx-1">{label}:</span>
      <span className="font-bold">{value}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
