/**
 * Skeleton Loader Component
 * Placeholder loading animation for content
 */
export function Skeleton({ className = '', variant = 'text' }) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-space-mid/50 rounded';

  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24',
    card: 'h-32 w-full',
    table: 'h-12 w-full',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

/**
 * Skeleton Table Rows
 */
export function SkeletonTable({ rows = 5, columns = 6 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 py-3 border-b border-accent-cyan/10">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-4 flex-1 ${colIndex === 0 ? 'w-32' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Card
 */
export function SkeletonCard() {
  return (
    <div className="glass p-6 space-y-4">
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

/**
 * Full page skeleton loader
 */
export function SkeletonPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="title" className="w-48" />
        <Skeleton variant="text" className="w-96" />
      </div>

      {/* Form skeleton */}
      <div className="glass p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
        <Skeleton variant="button" className="mt-6 w-full h-12" />
      </div>

      {/* Table skeleton */}
      <div className="glass p-6">
        <SkeletonTable rows={8} columns={7} />
      </div>
    </div>
  );
}

export default Skeleton;
