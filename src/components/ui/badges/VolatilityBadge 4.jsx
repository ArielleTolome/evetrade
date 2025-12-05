import React from 'react';
import { TrendingUp, TrendingDown, Zap, Thermometer } from 'lucide-react';
import { cn } from '../../../lib/utils';

const volatilityLevels = {
  stable: {
    icon: Thermometer,
    label: 'Stable',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  moderate: {
    icon: TrendingUp,
    label: 'Moderate',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  volatile: {
    icon: TrendingDown,
    label: 'Volatile',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  extreme: {
    icon: Zap,
    label: 'Extreme',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    animation: 'animate-pulse',
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-2.5 py-1.5 text-sm gap-1.5',
  lg: 'px-3 py-2 text-base gap-2',
};

/**
 * A badge for displaying market volatility.
 * @param {{
 *   level: 'stable' | 'moderate' | 'volatile' | 'extreme',
 *   size: 'sm' | 'md' | 'lg',
 *   className?: string
 * }} props
 */
export const VolatilityBadge = ({ level = 'stable', size = 'md', className = '' }) => {
  const { icon: Icon, label, color, animation } = volatilityLevels[level];
  const sizeClass = sizeStyles[size];

  return (
    <div
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors duration-200 ease-in-out hover:bg-opacity-30',
        color,
        sizeClass,
        animation,
        className
      )}
      aria-label={`Volatility: ${label}`}
      role="status"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
};
