import { useOfflineMode } from '../../hooks/useOfflineMode';

/**
 * Offline Indicator Component
 * Shows a banner when the user is offline with cached data information
 */
export function OfflineIndicator({ className = '' }) {
  const {
    isOnline,
    offlineDurationText,
    cacheHealth,
    settings,
    updateSettings,
  } = useOfflineMode();

  // Don't show if online or warning is disabled
  if (isOnline || !settings.showOfflineWarning) {
    return null;
  }

  const getCacheHealthColor = () => {
    if (cacheHealth >= 70) return 'text-green-400';
    if (cacheHealth >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCacheHealthLabel = () => {
    if (cacheHealth >= 70) return 'Good';
    if (cacheHealth >= 40) return 'Limited';
    return 'Low';
  };

  return (
    <div className={`bg-amber-500/10 border border-amber-500/30 rounded-lg ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Offline icon */}
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          </div>

          {/* Status text */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-amber-400">
                You're Offline
              </span>
              {offlineDurationText && (
                <span className="text-xs text-text-secondary">
                  ({offlineDurationText})
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Using cached data. Some features may be unavailable.
            </p>
          </div>
        </div>

        {/* Cache health and dismiss */}
        <div className="flex items-center gap-4">
          {/* Cache health indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-text-secondary">Cache:</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-space-dark rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    cacheHealth >= 70 ? 'bg-green-500' :
                    cacheHealth >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${cacheHealth}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${getCacheHealthColor()}`}>
                {getCacheHealthLabel()}
              </span>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => updateSettings({ showOfflineWarning: false })}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <svg className="w-4 h-4 text-text-secondary hover:text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Offline Badge
 * Shows a small badge in the header when offline
 */
export function OfflineBadge({ className = '' }) {
  const { isOnline } = useOfflineMode();

  if (isOnline) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      <span className="text-xs font-medium text-amber-400">Offline</span>
    </div>
  );
}

export default OfflineIndicator;
