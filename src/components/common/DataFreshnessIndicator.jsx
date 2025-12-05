import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import Tooltip from './Tooltip';

const getFreshness = (lastUpdated) => {
  const diff = new Date().getTime() - new Date(lastUpdated).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 5) return { status: 'Fresh', color: 'bg-fresh', textColor: 'text-fresh' };
  if (minutes < 15) return { status: 'Recent', color: 'bg-recent', textColor: 'text-recent' };
  if (minutes < 30) return { status: 'Stale', color: 'bg-stale', textColor: 'text-stale' };
  return { status: 'Old', color: 'bg-old', textColor: 'text-old' };
};

const formatRelativeTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 30) return 'just now';
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

const formatExactTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

export const DataFreshnessIndicator = ({
  lastUpdated,
  refreshInterval,
  onRefresh,
  showLabel = true,
  compact = false,
  autoRefresh = false,
  size = 'md',
  className,
  isRefreshing = false,
}) => {
  const [tick, setTick] = useState(0);
  const [countdown, setCountdown] = useState(refreshInterval ? refreshInterval / 1000 : 0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            onRefresh?.();
            return refreshInterval / 1000;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [autoRefresh, refreshInterval, onRefresh]);

  const { status, color, textColor } = useMemo(() => getFreshness(lastUpdated), [lastUpdated, tick]);
  const relativeTime = useMemo(() => formatRelativeTime(lastUpdated), [lastUpdated, tick]);
  const exactTime = useMemo(() => formatExactTime(lastUpdated), [lastUpdated]);

  const sizeClasses = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };
  const iconSizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };

  const Component = onRefresh ? 'button' : 'div';
  const props = {
    className: cn(
      'flex items-center gap-2 font-body transition-colors duration-300',
      onRefresh && !isRefreshing && 'cursor-pointer hover:opacity-80',
      isRefreshing && 'cursor-wait',
      className
    ),
    role: 'status',
    'aria-live': 'polite',
    'aria-label': `Data freshness: ${status}. Last updated: ${relativeTime}`,
  };

  if (onRefresh) {
    props.onClick = !isRefreshing ? onRefresh : undefined;
    props.disabled = isRefreshing;
    props.type = 'button';
  }

  const mainComponent = (
    <Component {...props}>
      <div className="relative flex items-center justify-center">
        {isRefreshing && (
          <span
            className={cn('absolute rounded-full', sizeClasses[size], color, 'animate-pulse-dot')}
            style={{ animationDuration: '1.5s' }}
          />
        )}
        <span className={cn('rounded-full', sizeClasses[size], color)} />
      </div>

      {!compact && showLabel && (
        <span className="text-sm text-freshness-text">
          {autoRefresh && refreshInterval ? `Refreshing in ${countdown}s` : `Updated ${relativeTime}`}
        </span>
      )}

      {!compact && (status === 'Stale' || status === 'Old') && (
        <AlertTriangle className={cn(iconSizeClasses[size], textColor)} />
      )}
    </Component>
  );

  return (
    <Tooltip content={`Last updated: ${exactTime}`} position="top">
      {mainComponent}
    </Tooltip>
  );
};

DataFreshnessIndicator.propTypes = {
  lastUpdated: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
  refreshInterval: PropTypes.number,
  onRefresh: PropTypes.func,
  showLabel: PropTypes.bool,
  compact: PropTypes.bool,
  autoRefresh: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  isRefreshing: PropTypes.bool,
};

export default DataFreshnessIndicator;