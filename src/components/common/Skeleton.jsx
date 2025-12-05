/**
 * Comprehensive Skeleton Loading Components
 * Provides a full suite of loading placeholders with shimmer animation
 */

/**
 * Base Skeleton Component
 * Highly configurable skeleton loader with shimmer or pulse animation
 */
export function Skeleton({
  width,
  height,
  circle = false,
  size,
  animation = 'shimmer',
  className = '',
  variant = 'default',
  rounded = 'md',
}) {
  // Handle circle variant
  if (circle) {
    const sizeValue = size || width || height || 40;

    return (
      <div
        className={`
          rounded-full
          ${animation === 'shimmer' ? 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-space-mid/50 dark:via-space-light/50 dark:to-space-mid/50 bg-[length:400%_100%]' : 'animate-pulse bg-gray-200 dark:bg-space-mid/50'}
          ${className}
        `}
        style={{
          width: typeof sizeValue === 'number' ? `${sizeValue}px` : sizeValue,
          height: typeof sizeValue === 'number' ? `${sizeValue}px` : sizeValue,
        }}
      />
    );
  }

  // Variant presets
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    subtitle: 'h-5 w-2/3',
    button: 'h-10 w-24',
    input: 'h-12 w-full',
    card: 'h-32 w-full',
    avatar: 'h-10 w-10 rounded-full',
  };

  // Rounded variants
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const baseClasses = animation === 'shimmer'
    ? 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-space-mid/50 dark:via-space-light/50 dark:to-space-mid/50 bg-[length:400%_100%]'
    : 'animate-pulse bg-gray-200 dark:bg-space-mid/50';

  const variantClass = variants[variant] || variants.default;
  const roundedClass = roundedClasses[rounded] || roundedClasses.md;

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClass}
        ${roundedClass}
        ${className}
      `}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    />
  );
}

/**
 * Skeleton Text - Single line text placeholder
 */
export function SkeletonText({ width = '100%', className = '', animation = 'shimmer' }) {
  return (
    <Skeleton
      width={width}
      height={16}
      rounded="md"
      animation={animation}
      className={className}
    />
  );
}

/**
 * Skeleton Paragraph - Multiple lines of text
 */
export function SkeletonParagraph({ lines = 3, className = '', animation = 'shimmer' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Avatar - Circle avatar placeholder
 */
export function SkeletonAvatar({ size = 'md', className = '', animation = 'shimmer' }) {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    '2xl': 96,
  };

  const sizeValue = sizes[size] || sizes.md;

  return (
    <Skeleton
      circle
      size={sizeValue}
      animation={animation}
      className={className}
    />
  );
}

/**
 * Skeleton Button - Button placeholder
 */
export function SkeletonButton({ size = 'md', fullWidth = false, className = '', animation = 'shimmer' }) {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <Skeleton
      rounded="lg"
      animation={animation}
      className={`${sizeClass} ${fullWidth ? 'w-full' : ''} ${className}`}
    />
  );
}

/**
 * Skeleton Card - Card placeholder with optional content
 */
export function SkeletonCard({ children, className = '', animation = 'shimmer' }) {
  if (children) {
    return (
      <div className={`glass p-6 space-y-4 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`glass p-6 space-y-4 ${className}`}>
      <Skeleton variant="title" animation={animation} />
      <SkeletonParagraph lines={2} animation={animation} />
      <div className="flex gap-2 pt-2">
        <SkeletonButton animation={animation} />
        <SkeletonButton animation={animation} />
      </div>
    </div>
  );
}

/**
 * Skeleton Table - Table with rows and columns
 */
export function SkeletonTable({ rows = 5, columns = 6, showHeader = true, className = '', animation = 'shimmer' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex gap-4 py-3 border-b border-accent-cyan/10">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height={16} className="flex-1" animation={animation} rounded="sm" />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              height={16}
              className="flex-1"
              animation={animation}
              rounded="sm"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Chart - Chart placeholder
 */
export function SkeletonChart({ height = 300, showLegend = true, className = '', animation = 'shimmer' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showLegend && (
        <div className="flex gap-4 justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton width={12} height={12} rounded="sm" animation={animation} />
              <SkeletonText width={60} animation={animation} />
            </div>
          ))}
        </div>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <Skeleton
          width="100%"
          height="100%"
          rounded="lg"
          animation={animation}
        />
        {/* Chart bars overlay effect */}
        <div className="absolute inset-0 flex items-end justify-around p-4 gap-2">
          {[45, 72, 38, 85, 52, 67, 41, 78].map((height, i) => (
            <div
              key={i}
              className={`flex-1 ${animation === 'shimmer' ? 'animate-shimmer' : 'animate-pulse'} bg-gradient-to-t from-accent-cyan/20 to-transparent rounded-t`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Stat - Stat card placeholder
 */
export function SkeletonStat({ className = '', animation = 'shimmer' }) {
  return (
    <div className={`glass p-6 space-y-3 ${className}`}>
      <SkeletonText width="40%" animation={animation} />
      <Skeleton height={32} width="60%" rounded="md" animation={animation} />
      <div className="flex items-center gap-2">
        <Skeleton width={16} height={16} rounded="sm" animation={animation} />
        <SkeletonText width="30%" animation={animation} />
      </div>
    </div>
  );
}

/**
 * Skeleton List - List items placeholder
 */
export function SkeletonList({ items = 5, withAvatar = false, withActions = false, className = '', animation = 'shimmer' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 glass rounded-lg">
          {withAvatar && <SkeletonAvatar size="md" animation={animation} />}
          <div className="flex-1 space-y-2">
            <SkeletonText width="40%" animation={animation} />
            <SkeletonText width="60%" animation={animation} />
          </div>
          {withActions && (
            <div className="flex gap-2">
              <SkeletonButton size="sm" animation={animation} />
              <SkeletonButton size="sm" animation={animation} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Form - Form with labels and inputs
 */
export function SkeletonForm({ fields = 6, columns = 1, showSubmit = true, className = '', animation = 'shimmer' }) {
  const gridCols = columns === 1 ? '' : columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <div className={`glass p-6 ${className}`}>
      <div className={`grid ${gridCols} gap-6`}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonText width="30%" animation={animation} />
            <Skeleton variant="input" animation={animation} rounded="lg" />
          </div>
        ))}
      </div>
      {showSubmit && (
        <SkeletonButton
          size="lg"
          fullWidth
          animation={animation}
          className="mt-6 h-12"
        />
      )}
    </div>
  );
}

/**
 * Skeleton Dashboard - Dashboard with stats, chart, and table
 */
export function SkeletonDashboard({ className = '', animation = 'shimmer' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 space-y-8 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="title" width="300px" animation={animation} />
        <SkeletonText width="400px" animation={animation} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} animation={animation} />
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass p-6">
        <Skeleton variant="subtitle" width="200px" animation={animation} className="mb-6" />
        <SkeletonChart height={350} animation={animation} />
      </div>

      {/* Table Section */}
      <div className="glass p-6">
        <Skeleton variant="subtitle" width="250px" animation={animation} className="mb-6" />
        <SkeletonTable rows={8} columns={7} animation={animation} />
      </div>
    </div>
  );
}

/**
 * Skeleton Page - Full page skeleton (re-exported for compatibility)
 */
export function SkeletonPage({ animation = 'shimmer' }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="title" width="300px" animation={animation} />
        <SkeletonText width="400px" animation={animation} />
      </div>

      {/* Form skeleton */}
      <SkeletonForm fields={6} columns={3} animation={animation} />

      {/* Table skeleton */}
      <div className="glass p-6">
        <SkeletonTable rows={8} columns={7} animation={animation} />
      </div>
    </div>
  );
}

/**
 * Skeleton Trading Page - EVETrade specific skeleton for trading pages
 */
export function SkeletonTradingPage({ animation = 'shimmer' }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="title" width="280px" animation={animation} />
        <SkeletonText width="450px" animation={animation} />
      </div>

      {/* Trading Form */}
      <div className="glass p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonText width="35%" animation={animation} />
              <Skeleton variant="input" animation={animation} rounded="lg" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-4">
          <SkeletonButton size="lg" fullWidth animation={animation} className="h-12" />
          <SkeletonButton size="lg" animation={animation} className="h-12 w-32" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonStat key={i} animation={animation} />
        ))}
      </div>

      {/* Results Table */}
      <div className="glass p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="subtitle" width="180px" animation={animation} />
          <div className="flex gap-2">
            <SkeletonButton size="sm" animation={animation} />
            <SkeletonButton size="sm" animation={animation} />
          </div>
        </div>
        <SkeletonTable rows={10} columns={8} animation={animation} />
      </div>
    </div>
  );
}

/**
 * Skeleton Grid - Generic grid of cards
 */
export function SkeletonGrid({ items = 6, columns = 3, className = '', animation = 'shimmer' }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gridClass = gridCols[columns] || gridCols[3];

  return (
    <div className={`grid ${gridClass} gap-6 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} animation={animation} />
      ))}
    </div>
  );
}

/**
 * Skeleton Tabs - Tabbed interface placeholder
 */
export function SkeletonTabs({ tabs = 3, className = '', animation = 'shimmer' }) {
  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex gap-4 border-b border-accent-cyan/10 mb-6">
        {Array.from({ length: tabs }).map((_, i) => (
          <SkeletonButton key={i} size="md" animation={animation} className="mb-[-1px]" />
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        <SkeletonParagraph lines={4} animation={animation} />
        <div className="grid md:grid-cols-2 gap-6">
          <SkeletonCard animation={animation} />
          <SkeletonCard animation={animation} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Header - Page header with breadcrumbs
 */
export function SkeletonHeader({ showBreadcrumbs = true, className = '', animation = 'shimmer' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showBreadcrumbs && (
        <div className="flex items-center gap-2">
          <SkeletonText width={60} animation={animation} />
          <span className="text-text-muted">/</span>
          <SkeletonText width={80} animation={animation} />
        </div>
      )}
      <div className="space-y-2">
        <Skeleton variant="title" width="300px" animation={animation} />
        <SkeletonText width="450px" animation={animation} />
      </div>
    </div>
  );
}

/**
 * Skeleton Modal - Modal dialog placeholder
 */
export function SkeletonModal({ className = '', animation = 'shimmer' }) {
  return (
    <div className={`glass p-6 max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <Skeleton variant="title" width="200px" animation={animation} />
        <Skeleton width={24} height={24} rounded="sm" animation={animation} />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <SkeletonParagraph lines={3} animation={animation} />
        <SkeletonForm fields={4} columns={2} showSubmit={false} animation={animation} className="!p-0" />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-accent-cyan/10">
        <SkeletonButton animation={animation} />
        <SkeletonButton animation={animation} />
      </div>
    </div>
  );
}

// Default export
export default Skeleton;
