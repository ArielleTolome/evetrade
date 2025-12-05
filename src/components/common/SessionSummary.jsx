import { useState } from 'react';
import { formatISK } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Session Summary Component
 * Displays a collapsible floating panel with trade session tracking information
 */
export function SessionSummary({
  sessionDuration,
  viewedCount,
  shoppingListCount,
  totalPotentialProfit,
  shoppingList = [],
  onClearSession,
  onExportShoppingList,
  onRemoveFromShoppingList,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const formatSessionTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleExport = () => {
    if (onExportShoppingList) {
      onExportShoppingList();
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your session? This will reset all tracking data.')) {
      onClearSession();
      setIsExpanded(false);
      setShowShoppingList(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md">
      {/* Collapsed State - Mini Summary */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-space-dark/90 backdrop-blur-md border border-accent-cyan/30 rounded-xl px-4 py-3 shadow-lg hover:border-accent-cyan/50 transition-all duration-300 hover:shadow-accent-cyan/20 hover:-translate-y-1"
        >
          <div className="flex items-center gap-3">
            {/* Session Icon */}
            <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>

            {/* Quick Stats */}
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-text-secondary">Time:</span>
                <span className="text-accent-cyan font-medium">{formatSessionTime(sessionDuration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-text-secondary">List:</span>
                <span className="text-accent-cyan font-medium">{shoppingListCount}</span>
              </div>
              {totalPotentialProfit > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-green-400 font-medium">{formatISK(totalPotentialProfit, false)}</span>
                </div>
              )}
            </div>

            {/* Notification Badge */}
            {shoppingListCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-accent-cyan text-space-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {shoppingListCount}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Expanded State - Full Panel */}
      {isExpanded && (
        <GlassmorphicCard className="w-96 animate-slide-in-right" padding="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-accent-cyan/20">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-bold text-text-primary">Session Tracker</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-text-secondary hover:text-accent-cyan transition-colors"
              aria-label="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="p-4 space-y-3">
            {/* Session Duration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-text-secondary text-sm">Session Duration</span>
              </div>
              <span className="text-text-primary font-semibold">{formatSessionTime(sessionDuration)}</span>
            </div>

            {/* Viewed Trades */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-text-secondary text-sm">Trades Viewed</span>
              </div>
              <span className="text-text-primary font-semibold">{viewedCount}</span>
            </div>

            {/* Shopping List Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-text-secondary text-sm">Shopping List</span>
              </div>
              <span className="text-text-primary font-semibold">{shoppingListCount}</span>
            </div>

            {/* Total Potential Profit */}
            <div className="flex items-center justify-between pt-2 border-t border-accent-cyan/10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-text-secondary text-sm font-medium">Potential Profit</span>
              </div>
              <span className="text-green-400 font-bold text-lg">{formatISK(totalPotentialProfit)}</span>
            </div>
          </div>

          {/* Shopping List Preview */}
          {shoppingListCount > 0 && (
            <div className="border-t border-accent-cyan/20">
              <button
                onClick={() => setShowShoppingList(!showShoppingList)}
                className="w-full p-4 flex items-center justify-between hover:bg-accent-cyan/5 transition-colors"
              >
                <span className="text-sm font-medium text-text-primary">
                  View Shopping List ({shoppingListCount})
                </span>
                <svg
                  className={`w-4 h-4 text-accent-cyan transition-transform ${showShoppingList ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Shopping List Items */}
              {showShoppingList && (
                <div className="max-h-64 overflow-y-auto border-t border-accent-cyan/10">
                  {shoppingList.map((trade) => (
                    <div
                      key={trade['Item ID']}
                      className="p-3 border-b border-accent-cyan/10 last:border-b-0 hover:bg-accent-cyan/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-primary truncate">
                            {trade['Item Name'] || `Item ${trade['Item ID']}`}
                          </div>
                          <div className="text-xs text-green-400 mt-1">
                            +{formatISK(trade['Net Profit'] || 0)}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveFromShoppingList(trade['Item ID'])}
                          className="text-text-secondary hover:text-red-400 transition-colors"
                          aria-label="Remove from shopping list"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-accent-cyan/20 flex gap-2">
            {shoppingListCount > 0 && (
              <button
                onClick={handleExport}
                className="flex-1 px-3 py-2 bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 rounded-lg text-accent-cyan text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            )}
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors"
            >
              Clear Session
            </button>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
}

export default SessionSummary;
