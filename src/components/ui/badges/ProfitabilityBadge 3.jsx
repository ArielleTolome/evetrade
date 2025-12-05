import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { cn } from '../../../lib/utils';

const getProfitability = (percentage) => {
  if (percentage > 30) {
    return {
      level: 'exceptional',
      label: 'Exceptional Profit',
      color: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
      icon: TrendingUp,
      animation: 'animate-glow',
    };
  }
  if (percentage > 15) {
    return {
      level: 'high',
      label: 'High Profit',
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: ArrowUp,
    };
  }
  if (percentage > 5) {
    return {
      level: 'moderate',
      label: 'Moderate Profit',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      icon: ArrowUp,
    };
  }
  if (percentage >= 0) {
    return {
      level: 'low',
      label: 'Low Profit',
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      icon: ArrowUp,
    };
  }
  return {
    level: 'loss',
    label: 'Loss',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: ArrowDown,
  };
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-2.5 py-1.5 text-sm gap-1.5',
  lg: 'px-3 py-2 text-base gap-2',
};

/**
 * A badge for displaying profit margins.
 * @param {{
 *   percentage: number,
 *   size: 'sm' | 'md' | 'lg',
 *   className?: string
 * }} props
 */
export const ProfitabilityBadge = ({ percentage, size = 'md', className = '' }) => {
  const { label, color, icon: Icon, animation } = getProfitability(percentage);
  const sizeClass = sizeStyles[size];
  const formattedPercentage = `${percentage.toFixed(2)}%`;

  return (
    <div
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors duration-200 ease-in-out hover:bg-opacity-30',
        color,
        sizeClass,
        animation,
        className
      )}
      aria-label={`Profitability: ${label} at ${formattedPercentage}`}
      role="status"
    >
      <Icon className="h-4 w-4" />
      <span>{formattedPercentage}</span>
    </div>
  );
};
