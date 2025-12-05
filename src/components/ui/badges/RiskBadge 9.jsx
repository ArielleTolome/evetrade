import React from 'react';
import { Shield, AlertTriangle, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '../../../lib/utils';

const riskLevels = {
  low: {
    icon: Shield,
    label: 'Low Risk',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  medium: {
    icon: ShieldAlert,
    label: 'Medium Risk',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  high: {
    icon: AlertTriangle,
    label: 'High Risk',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  critical: {
    icon: ShieldX,
    label: 'Critical Risk',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-2.5 py-1.5 text-sm gap-1.5',
  lg: 'px-3 py-2 text-base gap-2',
};

/**
 * A badge for displaying trade risk levels.
 * @param {{
 *   level: 'low' | 'medium' | 'high' | 'critical',
 *   size: 'sm' | 'md' | 'lg',
 *   className?: string
 * }} props
 */
export const RiskBadge = ({ level = 'low', size = 'md', className = '' }) => {
  const { icon: Icon, label, color } = riskLevels[level];
  const sizeClass = sizeStyles[size];

  return (
    <div
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors duration-200 ease-in-out hover:bg-opacity-30',
        color,
        sizeClass,
        className
      )}
      aria-label={`Risk level: ${label}`}
      role="status"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
};
