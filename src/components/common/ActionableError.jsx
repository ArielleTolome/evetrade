/**
 * Actionable Error Display Component
 * Shows error messages with helpful suggestions and actions
 */

/**
 * Map common error types to helpful suggestions
 */
const ERROR_SUGGESTIONS = {
  network: {
    title: 'Connection Issue',
    message: 'Unable to connect to the server.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Wait a moment and try again',
    ],
    icon: 'network',
  },
  timeout: {
    title: 'Request Timeout',
    message: 'The request took too long to complete.',
    suggestions: [
      'Try narrowing your search criteria',
      'Select a single trade hub instead of multiple regions',
      'Wait a moment for server load to decrease',
    ],
    icon: 'clock',
  },
  rateLimit: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait before trying again.',
    suggestions: [
      'Wait 30 seconds before your next search',
      'Consider saving your search parameters for reuse',
    ],
    icon: 'pause',
  },
  noResults: {
    title: 'No Trades Found',
    message: 'No profitable trades match your current criteria.',
    suggestions: [
      'Lower the minimum profit requirement',
      'Increase the maximum budget',
      'Try a different station or region',
      'Reduce the minimum ROI percentage',
    ],
    icon: 'search',
  },
  serverError: {
    title: 'Server Error',
    message: 'The server encountered an issue processing your request.',
    suggestions: [
      'Wait a moment and try again',
      'Try with simpler search parameters',
      'Check EVE Online server status',
    ],
    icon: 'server',
  },
  invalidStation: {
    title: 'Invalid Station',
    message: 'The selected station could not be found.',
    suggestions: [
      'Select a station from the dropdown list',
      'Try one of the major trade hubs (Jita, Amarr, Dodixie)',
      'Check for typos in the station name',
    ],
    icon: 'location',
  },
  authError: {
    title: 'Authentication Error',
    message: 'Your EVE Online login has expired.',
    suggestions: [
      'Log in again with your EVE account',
      'Check that you\'ve granted the necessary permissions',
    ],
    icon: 'lock',
  },
  default: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred.',
    suggestions: [
      'Try refreshing the page',
      'Clear your browser cache',
      'Try again in a few minutes',
    ],
    icon: 'error',
  },
};

/**
 * Analyze error message to determine type
 */
function analyzeError(error) {
  const message = typeof error === 'string' ? error : error?.message || '';
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('failed to fetch')) {
    return 'network';
  }
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return 'timeout';
  }
  if (lowerMessage.includes('rate') || lowerMessage.includes('429') || lowerMessage.includes('too many')) {
    return 'rateLimit';
  }
  if (lowerMessage.includes('no results') || lowerMessage.includes('no trades') || lowerMessage.includes('empty')) {
    return 'noResults';
  }
  if (lowerMessage.includes('500') || lowerMessage.includes('server error') || lowerMessage.includes('internal')) {
    return 'serverError';
  }
  if (lowerMessage.includes('station') || lowerMessage.includes('location')) {
    return 'invalidStation';
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('401') || lowerMessage.includes('unauthorized') || lowerMessage.includes('token')) {
    return 'authError';
  }
  return 'default';
}

/**
 * Icon components for different error types
 */
const ErrorIcons = {
  network: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
    </svg>
  ),
  clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pause: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  search: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  server: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  location: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  lock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  error: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

/**
 * Actionable Error Component
 */
export function ActionableError({
  error,
  onRetry,
  onDismiss,
  className = '',
}) {
  const errorType = analyzeError(error);
  const errorInfo = ERROR_SUGGESTIONS[errorType];
  const Icon = ErrorIcons[errorInfo.icon];

  const originalMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={`rounded-xl border border-red-500/30 bg-red-500/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-red-500/10 border-b border-red-500/20">
        <div className="text-red-400">
          <Icon />
        </div>
        <div>
          <h3 className="font-medium text-red-400">{errorInfo.title}</h3>
          <p className="text-sm text-red-300/80">{errorInfo.message}</p>
        </div>
      </div>

      {/* Original error message (if different) */}
      {originalMessage && originalMessage !== errorInfo.message && (
        <div className="px-5 py-3 bg-red-500/5 border-b border-red-500/10">
          <p className="text-sm text-red-300/70 font-mono">
            {originalMessage}
          </p>
        </div>
      )}

      {/* Suggestions */}
      <div className="px-5 py-4">
        <p className="text-sm font-medium text-text-secondary mb-3">Things to try:</p>
        <ul className="space-y-2">
          {errorInfo.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-5 py-4 bg-space-dark/30 border-t border-red-500/10">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline Error Message Component
 * Simpler version for inline use
 */
export function InlineError({ message, onRetry, className = '' }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 ${className}`}>
      <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="flex-1 text-sm text-red-300">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Empty State Component
 * For when no results are found
 */
export function NoResultsMessage({
  onAdjustFilters,
  suggestions = [],
  className = '',
}) {
  const defaultSuggestions = [
    'Lower the minimum profit requirement',
    'Increase the maximum budget',
    'Try a different station or region',
    'Reduce the minimum ROI percentage',
    'Check if the market has low activity right now',
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-text-primary mb-2">No Trades Found</h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        No profitable trades match your current search criteria. Try adjusting your filters.
      </p>

      <div className="max-w-md mx-auto text-left bg-space-dark/30 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-text-secondary mb-3">Suggestions:</p>
        <ul className="space-y-2">
          {displaySuggestions.slice(0, 4).map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {onAdjustFilters && (
        <button
          onClick={onAdjustFilters}
          className="px-6 py-2 rounded-lg bg-accent-cyan/20 text-accent-cyan font-medium hover:bg-accent-cyan/30 transition-colors"
        >
          Adjust Filters
        </button>
      )}
    </div>
  );
}

export default ActionableError;
