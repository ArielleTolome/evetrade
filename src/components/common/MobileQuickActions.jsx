import { useState } from 'react';

/**
 * MobileQuickActions - Bottom action bar for mobile devices
 * Provides quick access to common trading actions with swipe-up drawer
 */
export function MobileQuickActions({
  onRefresh,
  onCopyAll,
  onMultibuy,
  onSaveRoute,
  onToggleFavorites,
  onToggleHighQuality,
  showFavoritesOnly,
  highQualityOnly,
  isLoading,
  tradesCount = 0,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Bottom Action Bar - Mobile Only */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${className}`}>
        {/* Expanded Drawer */}
        <div
          className={`bg-space-dark border-t border-accent-cyan/20 transition-all duration-300 ease-out overflow-hidden ${
            isExpanded ? 'max-h-[400px]' : 'max-h-0'
          }`}
        >
          <div className="p-4 space-y-3">
            {/* Filter Toggles */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onToggleFavorites?.();
                  setIsExpanded(false);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  showFavoritesOnly
                    ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                    : 'bg-white/5 border-accent-cyan/20 text-text-secondary'
                }`}
              >
                <svg
                  className={`w-5 h-5 ${showFavoritesOnly ? 'fill-accent-gold' : 'fill-none'}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
                <span className="text-sm font-medium">Favorites</span>
              </button>

              <button
                onClick={() => {
                  onToggleHighQuality?.();
                  setIsExpanded(false);
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  highQualityOnly
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-white/5 border-accent-cyan/20 text-text-secondary'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">High Quality</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onCopyAll?.();
                  setIsExpanded(false);
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Copy All</span>
              </button>

              <button
                onClick={() => {
                  onMultibuy?.();
                  setIsExpanded(false);
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Multibuy</span>
              </button>
            </div>

            <button
              onClick={() => {
                onSaveRoute?.();
                setIsExpanded(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 text-text-secondary border border-accent-cyan/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-sm font-medium">Save Route</span>
            </button>
          </div>
        </div>

        {/* Main Bottom Bar */}
        <div className="bg-space-dark/95 backdrop-blur-xl border-t border-accent-cyan/20 px-4 py-2 safe-area-inset-bottom">
          <div className="flex items-center justify-between gap-2">
            {/* Trades Count */}
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span className="text-accent-cyan font-bold">{tradesCount}</span>
              <span>trades</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              {/* Refresh */}
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-3 rounded-xl text-accent-cyan active:bg-white/10 disabled:opacity-50"
                title="Refresh"
              >
                <svg
                  className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Favorites Quick Toggle */}
              <button
                onClick={onToggleFavorites}
                className={`p-3 rounded-xl active:bg-white/10 ${
                  showFavoritesOnly ? 'text-accent-gold' : 'text-text-secondary'
                }`}
                title="Toggle Favorites"
              >
                <svg
                  className={`w-6 h-6 ${showFavoritesOnly ? 'fill-accent-gold' : 'fill-none'}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>

              {/* More Actions */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-3 rounded-xl transition-colors ${
                  isExpanded ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-text-secondary active:bg-white/10'
                }`}
                title="More Actions"
              >
                <svg
                  className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileQuickActions;
