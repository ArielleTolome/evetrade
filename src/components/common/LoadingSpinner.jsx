import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/utils';

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ size = 'md', className = '' }) {
  const { prefersReducedMotion } = useReducedMotion();
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-full border-accent-cyan/30',
        prefersReducedMotion
          ? 'animate-pulse border-t-accent-cyan/30'
          : 'animate-spin border-t-accent-cyan',
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-black/80 backdrop-blur-sm">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-text-secondary animate-pulse">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading indicator
 */
export function LoadingDots({ className = '' }) {
  const { prefersReducedMotion } = useReducedMotion();
  return (
    <span className={cn('inline-flex gap-1', className)}>
      <span
        className={cn(
          'w-1.5 h-1.5 bg-accent-cyan rounded-full',
          prefersReducedMotion ? 'animate-pulse' : 'animate-bounce'
        )}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={cn(
          'w-1.5 h-1.5 bg-accent-cyan rounded-full',
          prefersReducedMotion ? 'animate-pulse' : 'animate-bounce'
        )}
        style={{ animationDelay: '150ms' }}
      />
      <span
        className={cn(
          'w-1.5 h-1.5 bg-accent-cyan rounded-full',
          prefersReducedMotion ? 'animate-pulse' : 'animate-bounce'
        )}
        style={{ animationDelay: '300ms' }}
      />
    </span>
  );
}

export default LoadingSpinner;
