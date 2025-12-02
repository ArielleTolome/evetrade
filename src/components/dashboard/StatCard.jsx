import { useMemo, useState, useEffect, useRef } from 'react';
import { formatISK, formatPercent, formatNumber } from '../../utils/formatters';
import GlassmorphicCard from '../common/GlassmorphicCard';

/**
 * Animated number component
 */
function AnimatedNumber({ value, format = 'number', duration = 500 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (cubic ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    previousValue.current = value;
  }, [value, duration]);

  const formatted = useMemo(() => {
    switch (format) {
      case 'isk': return formatISK(displayValue, false);
      case 'percent': return formatPercent(displayValue / 100, 1);
      case 'number': return formatNumber(Math.round(displayValue), 0);
      default: return Math.round(displayValue);
    }
  }, [displayValue, format]);

  return <span>{formatted}</span>;
}

/**
 * Skeleton loading state for StatCard
 */
function StatCardSkeleton({ variant = 'cyan' }) {
  const colorClasses = {
    cyan: 'bg-accent-cyan/5',
    gold: 'bg-accent-gold/5',
    green: 'bg-accent-green/5',
    red: 'bg-red-400/5',
    purple: 'bg-accent-purple/5',
  };

  return (
    <GlassmorphicCard padding="p-4 sm:p-6">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg ${colorClasses[variant]}`} />
          <div className="w-16 h-6 bg-white/5 dark:bg-white/5 rounded" />
        </div>
        <div className="w-24 h-8 bg-white/10 dark:bg-white/10 rounded mb-2" />
        <div className="w-32 h-4 bg-white/5 dark:bg-white/5 rounded" />
      </div>
    </GlassmorphicCard>
  );
}

/**
 * StatCard - Large number display with label
 *
 * @param {string} label - The label text
 * @param {number} value - The numeric value to display
 * @param {string} format - Format type: 'number', 'isk', 'percent'
 * @param {string|ReactNode} icon - Icon to display (emoji or component)
 * @param {string} variant - Color variant: 'cyan', 'gold', 'green', 'red', 'purple'
 * @param {object} trend - Trend indicator { direction: 'up'|'down', value: number }
 * @param {function} onClick - Click handler for drill-down
 * @param {string} description - Optional description text
 * @param {array} sparklineData - Optional data for mini sparkline chart
 * @param {boolean} loading - Show skeleton loading state
 * @param {string} className - Additional CSS classes
 */
export function StatCard({
  label,
  value = 0,
  format = 'number',
  icon,
  variant = 'cyan',
  trend = null,
  onClick,
  description,
  sparklineData = null,
  loading = false,
  className = '',
}) {
  const colorClasses = {
    cyan: 'text-accent-cyan border-accent-cyan/30',
    gold: 'text-accent-gold border-accent-gold/30',
    green: 'text-accent-green border-accent-green/30',
    red: 'text-red-400 border-red-400/30',
    purple: 'text-accent-purple border-accent-purple/30',
  };

  const iconBgClasses = {
    cyan: 'bg-accent-cyan/20',
    gold: 'bg-accent-gold/20',
    green: 'bg-accent-green/20',
    red: 'bg-red-400/20',
    purple: 'bg-accent-purple/20',
  };

  if (loading) {
    return <StatCardSkeleton variant={variant} />;
  }

  return (
    <GlassmorphicCard
      hover={!!onClick}
      onClick={onClick}
      padding="p-4 sm:p-6"
      className={`border-l-4 ${colorClasses[variant]} ${className}`}
    >
      {/* Header with icon and trend */}
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={`p-2.5 rounded-lg ${iconBgClasses[variant]} ${colorClasses[variant]} text-2xl backdrop-blur-sm`}>
            {icon}
          </div>
        )}
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium ${
            trend.direction === 'up'
              ? 'text-accent-green bg-accent-green/10'
              : 'text-red-400 bg-red-400/10'
          }`}>
            <span className="text-lg leading-none">
              {trend.direction === 'up' ? '↑' : '↓'}
            </span>
            <span className="font-mono">
              {typeof trend.value === 'number' ? `${trend.value.toFixed(1)}%` : trend.value}
            </span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`text-3xl sm:text-4xl font-bold font-mono mb-2 ${colorClasses[variant]}`}>
        <AnimatedNumber value={value} format={format} duration={600} />
      </div>

      {/* Label */}
      <div className="text-sm text-text-secondary font-medium mb-1">
        {label}
      </div>

      {/* Description */}
      {description && (
        <div className="text-xs text-text-muted mt-2">
          {description}
        </div>
      )}

      {/* Mini Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5 dark:border-white/5">
          <MiniSparkline data={sparklineData} color={variant} />
        </div>
      )}
    </GlassmorphicCard>
  );
}

/**
 * Mini sparkline for StatCard
 */
function MiniSparkline({ data, color }) {
  const colorStroke = {
    cyan: '#00f0ff',
    gold: '#ffd700',
    green: '#00ff9d',
    red: '#f87171',
    purple: '#bc13fe',
  };

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      viewBox="0 0 100 20"
      className="w-full h-6 opacity-60"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={colorStroke[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export { StatCardSkeleton, AnimatedNumber };
export default StatCard;
