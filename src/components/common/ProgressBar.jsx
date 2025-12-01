/**
 * ProgressBar Component
 * A glassmorphic progress bar for displaying loading progress
 */
export function ProgressBar({
  progress = 0,
  total = 100,
  className = '',
  showPercentage = true,
  label = '',
}) {
  // Calculate percentage (0-100)
  const percentage = total > 0 ? Math.min(100, Math.max(0, (progress / total) * 100)) : 0;
  const roundedPercentage = Math.round(percentage);

  return (
    <div
      className={`w-full ${className}`}
      role="progressbar"
      aria-valuenow={roundedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || `Loading progress: ${roundedPercentage}%`}
    >
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2 text-sm">
          {label && (
            <span className="text-text-secondary font-medium">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-accent-cyan font-mono font-semibold">
              {roundedPercentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className="
          relative h-3 rounded-full overflow-hidden
          bg-space-dark/30 dark:bg-space-dark/30 bg-gray-200/50
          backdrop-blur-sm
          border border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300
          shadow-inner
        "
      >
        {/* Progress fill */}
        <div
          className="
            absolute inset-y-0 left-0
            bg-gradient-to-r from-accent-cyan via-blue-500 to-accent-cyan
            transition-all duration-500 ease-out
            shadow-lg shadow-accent-cyan/30
          "
          style={{
            width: `${percentage}%`,
            backgroundSize: '200% 100%',
            animation: percentage > 0 && percentage < 100 ? 'shimmer 2s infinite' : 'none',
          }}
        />

        {/* Animated shimmer overlay */}
        {percentage > 0 && percentage < 100 && (
          <div
            className="
              absolute inset-y-0 left-0
              bg-gradient-to-r from-transparent via-white/20 to-transparent
              animate-shimmer
            "
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Progress text (e.g., "3/8 resources loaded") */}
      {total > 0 && (
        <div className="mt-2 text-xs text-text-secondary/80 text-center">
          {progress} / {total} loaded
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact ProgressBar (no labels, smaller height)
 */
export function CompactProgressBar({ progress = 0, total = 100, className = '' }) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (progress / total) * 100)) : 0;
  const roundedPercentage = Math.round(percentage);

  return (
    <div
      className={`w-full ${className}`}
      role="progressbar"
      aria-valuenow={roundedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Loading progress: ${roundedPercentage}%`}
    >
      <div
        className="
          relative h-1.5 rounded-full overflow-hidden
          bg-space-dark/20 dark:bg-space-dark/20 bg-gray-200/30
          backdrop-blur-sm
        "
      >
        <div
          className="
            absolute inset-y-0 left-0
            bg-gradient-to-r from-accent-cyan to-blue-500
            transition-all duration-500 ease-out
          "
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
