/**
 * EmptyState Component
 * Displays context-aware suggestions when no data is found
 */
export function EmptyState({ mode, suggestions, className = '' }) {
  const getTitle = () => {
    switch (mode) {
      case 'station-trading':
        return 'No margin trades found at this station';
      case 'station-hauling':
        return 'No hauling trades found between these stations';
      case 'region-hauling':
        return 'No regional trades found';
      default:
        return 'No trades found';
    }
  };

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-2xl mx-auto">
        {/* Icon */}
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-text-secondary/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-display text-text-secondary mb-4">
          {getTitle()}
        </h3>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-text-secondary/70 text-sm mb-4">
              Try these suggestions to find more opportunities:
            </p>
            <ul className="space-y-2.5 text-left">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/10 hover:border-accent-cyan/20 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-text-secondary text-sm leading-relaxed">
                    {suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
