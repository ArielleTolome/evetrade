import { useState, useEffect, useMemo } from 'react';

/**
 * Format relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(date) {
  if (!date) return 'Unknown';

  const now = new Date();
  const then = new Date(date);

  // Handle invalid dates
  if (isNaN(then.getTime())) return 'Unknown';

  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 30) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return then.toLocaleDateString();
}

/**
 * Get freshness status based on age
 */
function getFreshnessStatus(date, thresholds = {}) {
  if (!date) return { status: 'unknown', color: 'text-text-secondary', bgColor: 'bg-gray-500/20' };

  const parsedDate = new Date(date);

  // Handle invalid dates
  if (isNaN(parsedDate.getTime())) {
    return { status: 'unknown', color: 'text-text-secondary', bgColor: 'bg-gray-500/20' };
  }

  const {
    fresh = 5 * 60 * 1000,      // 5 minutes
    moderate = 15 * 60 * 1000,  // 15 minutes
    stale = 30 * 60 * 1000,     // 30 minutes
  } = thresholds;

  const age = Date.now() - parsedDate.getTime();

  if (age < fresh) {
    return {
      status: 'fresh',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      label: 'Fresh',
      icon: '●',
    };
  }
  if (age < moderate) {
    return {
      status: 'recent',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      label: 'Recent',
      icon: '●',
    };
  }
  if (age < stale) {
    return {
      status: 'aging',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      label: 'Aging',
      icon: '○',
    };
  }
  return {
    status: 'stale',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    label: 'Stale',
    icon: '○',
  };
}

/**
 * Data Freshness Indicator Component
 * Shows when data was last updated and how fresh it is
 */
export function DataFreshnessIndicator({
  lastUpdated,
  onRefresh,
  isLoading = false,
  showLabel = true,
  showTime = true,
  compact = false,
  thresholds,
  className = '',
}) {
  // Force re-render every 30 seconds to update relative time
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const freshness = useMemo(() => getFreshnessStatus(lastUpdated, thresholds), [lastUpdated, thresholds]);
  const relativeTime = useMemo(() => formatRelativeTime(lastUpdated), [lastUpdated]);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
        title={`Last updated: ${relativeTime} (${freshness.label})`}
      >
        <span className={`text-xs ${freshness.color}`}>{freshness.icon}</span>
        {showTime && <span className="text-xs text-text-secondary">{relativeTime}</span>}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-0.5 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <svg
              className={`w-3 h-3 text-text-secondary hover:text-accent-cyan ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${freshness.bgColor} border ${freshness.borderColor}`}>
        {/* Status dot */}
        <span className={`${freshness.color}`}>
          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" />
          </svg>
        </span>

        {/* Label */}
        {showLabel && (
          <span className={`text-sm font-medium ${freshness.color}`}>
            {freshness.label}
          </span>
        )}

        {/* Time */}
        {showTime && (
          <span className="text-sm text-text-secondary">
            {relativeTime}
          </span>
        )}
      </div>

      {/* Refresh button */}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  );
}

/**
 * Market Data Header Component
 * Shows title with data freshness indicator
 */
export function MarketDataHeader({
  title,
  subtitle,
  lastUpdated,
  onRefresh,
  isLoading = false,
  resultCount,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="font-display text-xl text-text-primary">
          {title}
          {resultCount !== undefined && (
            <span className="ml-2 text-accent-cyan font-normal">
              ({resultCount.toLocaleString()} results)
            </span>
          )}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      <DataFreshnessIndicator
        lastUpdated={lastUpdated}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
    </div>
  );
}

export default DataFreshnessIndicator;
