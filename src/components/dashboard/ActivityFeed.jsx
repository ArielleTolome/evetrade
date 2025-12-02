import { useState } from 'react';

/**
 * Format relative time
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const date = new Date(timestamp);
  const diff = now - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString();
}

/**
 * ActivityFeed - List of recent activities with timestamps
 *
 * @param {array} activities - Array of activity objects
 *   { id, type, title, description, timestamp, link, metadata, icon }
 * @param {number} pageSize - Number of items per page
 * @param {boolean} showLoadMore - Show load more button
 * @param {function} onLoadMore - Callback when load more is clicked
 * @param {boolean} loading - Loading state
 * @param {boolean} hasMore - Whether more items are available
 * @param {string} emptyMessage - Message when no activities
 * @param {string} className - Additional CSS classes
 */
export function ActivityFeed({
  activities = [],
  pageSize = 10,
  showLoadMore = true,
  onLoadMore,
  loading = false,
  hasMore = false,
  emptyMessage = 'No recent activity',
  className = '',
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleActivities = activities.slice(0, visibleCount);

  const handleLoadMore = () => {
    if (onLoadMore) {
      onLoadMore();
    } else {
      setVisibleCount(prev => prev + pageSize);
    }
  };

  const canLoadMore = onLoadMore ? hasMore : visibleCount < activities.length;

  const activityTypeConfig = {
    trade: { color: 'text-accent-cyan', bgColor: 'bg-accent-cyan/10', icon: '💰' },
    alert: { color: 'text-accent-gold', bgColor: 'bg-accent-gold/10', icon: '🔔' },
    profit: { color: 'text-accent-green', bgColor: 'bg-accent-green/10', icon: '📈' },
    loss: { color: 'text-red-400', bgColor: 'bg-red-400/10', icon: '📉' },
    warning: { color: 'text-accent-gold', bgColor: 'bg-accent-gold/10', icon: '⚠️' },
    info: { color: 'text-accent-cyan', bgColor: 'bg-accent-cyan/10', icon: 'ℹ️' },
    success: { color: 'text-accent-green', bgColor: 'bg-accent-green/10', icon: '✅' },
    error: { color: 'text-red-400', bgColor: 'bg-red-400/10', icon: '❌' },
    update: { color: 'text-accent-purple', bgColor: 'bg-accent-purple/10', icon: '🔄' },
    default: { color: 'text-text-secondary', bgColor: 'bg-white/5', icon: '•' },
  };

  if (activities.length === 0 && !loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-4xl mb-3 opacity-50">📭</div>
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {visibleActivities.map((activity, index) => {
          const config = activityTypeConfig[activity.type] || activityTypeConfig.default;
          const icon = activity.icon || config.icon;

          return (
            <div
              key={activity.id || index}
              className="group relative flex gap-3 p-3 rounded-lg bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center text-lg`}>
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {activity.link ? (
                      <a
                        href={activity.link}
                        className={`font-medium ${config.color} hover:underline`}
                        onClick={(e) => {
                          if (activity.onClick) {
                            e.preventDefault();
                            activity.onClick();
                          }
                        }}
                      >
                        {activity.title}
                      </a>
                    ) : (
                      <div className="font-medium text-text-primary">
                        {activity.title}
                      </div>
                    )}
                    {activity.description && (
                      <p className="text-sm text-text-muted mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs px-2 py-0.5 rounded bg-white/5 text-text-muted"
                          >
                            {key}: <span className="font-mono">{value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-xs text-text-muted">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-cyan to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity rounded-l-lg" />
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {showLoadMore && canLoadMore && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-cyan/30 text-text-primary rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              `Load More (${activities.length - visibleCount} remaining)`
            )}
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2 mt-2">
          {[...Array(3)].map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loading state for activity item
 */
function ActivityItemSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white/5 dark:bg-white/5 animate-pulse">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-full" />
      </div>
      <div className="flex-shrink-0 h-3 w-16 bg-white/5 rounded" />
    </div>
  );
}

/**
 * Compact activity feed variant
 */
export function ActivityFeedCompact({ activities = [], maxItems = 5, className = '' }) {
  const recentActivities = activities.slice(0, maxItems);

  return (
    <div className={`space-y-1 ${className}`}>
      {recentActivities.map((activity, index) => (
        <div
          key={activity.id || index}
          className="flex items-center justify-between px-3 py-2 rounded hover:bg-white/5 transition-colors text-sm"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="flex-shrink-0">{activity.icon || '•'}</span>
            <span className="truncate text-text-primary">{activity.title}</span>
          </div>
          <span className="flex-shrink-0 text-xs text-text-muted ml-2">
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}

export { ActivityItemSkeleton };
export default ActivityFeed;
