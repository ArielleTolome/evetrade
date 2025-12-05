import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/utils';

/**
 * Glassmorphic Card Component
 * A frosted glass effect container for content
 */
export function GlassmorphicCard({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'p-4 sm:p-6',
  onClick,
}) {
  const { prefersReducedMotion } = useReducedMotion();

  const baseClasses = `
    bg-white/80 dark:bg-space-dark/60
    backdrop-blur-xl
    border border-gray-200/50 dark:border-white/5
    rounded-xl
    shadow-lg shadow-black/20
    relative overflow-hidden
  `;

  const hoverClasses = hover
    ? 'transition-all duration-300 hover:border-accent-cyan/30 hover:shadow-xl hover:shadow-accent-cyan/10 cursor-pointer group'
    : '';

  const motionHoverClasses = !prefersReducedMotion && hover ? 'hover:-translate-y-1' : '';

  const glowClasses = glow && !prefersReducedMotion
    ? 'animate-glow border-accent-cyan/30'
    : '';

  return (
    <div
      className={cn(baseClasses, hoverClasses, motionHoverClasses, glowClasses, padding, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default GlassmorphicCard;
