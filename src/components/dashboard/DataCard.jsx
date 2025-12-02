import { useState } from 'react';
import GlassmorphicCard from '../common/GlassmorphicCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * DataCard - Card with header, content, and optional footer
 *
 * @param {string} title - Card title
 * @param {string|ReactNode} subtitle - Optional subtitle
 * @param {ReactNode} children - Card content
 * @param {ReactNode} footer - Optional footer content
 * @param {ReactNode} actions - Optional header actions (buttons, etc.)
 * @param {boolean} collapsible - Enable collapse functionality
 * @param {boolean} defaultCollapsed - Initial collapsed state
 * @param {boolean} refreshable - Show refresh button
 * @param {function} onRefresh - Refresh callback function
 * @param {boolean} loading - Loading state
 * @param {boolean} error - Error state
 * @param {string} errorMessage - Error message text
 * @param {function} onRetry - Retry callback for error state
 * @param {string} variant - Color variant: 'default', 'cyan', 'gold', 'green', 'red', 'purple'
 * @param {string} className - Additional CSS classes
 */
export function DataCard({
  title,
  subtitle = null,
  children,
  footer = null,
  actions = null,
  collapsible = false,
  defaultCollapsed = false,
  refreshable = false,
  onRefresh,
  loading = false,
  error = false,
  errorMessage = 'An error occurred',
  onRetry,
  variant = 'default',
  className = '',
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [refreshing, setRefreshing] = useState(false);

  const variantClasses = {
    default: '',
    cyan: 'border-l-4 border-accent-cyan',
    gold: 'border-l-4 border-accent-gold',
    green: 'border-l-4 border-accent-green',
    red: 'border-l-4 border-red-400',
    purple: 'border-l-4 border-accent-purple',
  };

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <GlassmorphicCard className={`${variantClasses[variant]} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {title}
            </h3>
            {collapsible && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-text-muted hover:text-accent-cyan transition-colors"
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                <svg
                  className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-text-muted mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {refreshable && (
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-accent-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {actions}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-400/10 mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                Error Loading Data
              </h4>
              <p className="text-sm text-text-muted mb-4">
                {errorMessage}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <div className="text-text-primary">
              {children}
            </div>
          )}

          {/* Footer */}
          {footer && !loading && !error && (
            <div className="mt-4 pt-4 border-t border-white/5 dark:border-white/5">
              {footer}
            </div>
          )}
        </>
      )}
    </GlassmorphicCard>
  );
}

/**
 * Skeleton loading state for DataCard
 */
export function DataCardSkeleton({ hasFooter = false, className = '' }) {
  return (
    <GlassmorphicCard className={className}>
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-6 w-48 bg-white/10 rounded mb-2" />
            <div className="h-4 w-64 bg-white/5 rounded" />
          </div>
          <div className="w-8 h-8 bg-white/5 rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-5/6" />
          <div className="h-4 bg-white/10 rounded w-4/6" />
        </div>

        {/* Footer skeleton */}
        {hasFooter && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="h-4 bg-white/5 rounded w-32" />
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

export default DataCard;
