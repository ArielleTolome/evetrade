/**
 * AutocompleteSkeleton Component
 * Displays a skeleton loading state for autocomplete components
 */
export function AutocompleteSkeleton({ label, showTradeHubs = false }) {
  return (
    <div className="animate-pulse" data-testid="autocomplete-skeleton">
      {label && (
        <div className="h-5 bg-space-dark/50 rounded-md w-1/3 mb-2"></div>
      )}

      {showTradeHubs && (
        <div className="mb-3">
          <div className="h-4 bg-space-dark/50 rounded-md w-1/4 mb-2"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-8 bg-space-dark/50 rounded-lg w-16"></div>
            <div className="h-8 bg-space-dark/50 rounded-lg w-20"></div>
            <div className="h-8 bg-space-dark/50 rounded-lg w-12"></div>
            <div className="h-8 bg-space-dark/50 rounded-lg w-24"></div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="h-[46px] w-full bg-space-dark/50 rounded-lg"></div>
      </div>
    </div>
  );
}

export default AutocompleteSkeleton;
