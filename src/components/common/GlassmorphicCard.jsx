/**
 * Glassmorphic Card Component
 * A frosted glass effect container for content
 */
export function GlassmorphicCard({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'p-6',
  onClick,
}) {
  const baseClasses = `
    bg-space-dark/50 dark:bg-space-dark/50 bg-white/70
    backdrop-blur-md
    border border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-200
    rounded-xl
    shadow-lg shadow-accent-cyan/5
  `;

  const hoverClasses = hover
    ? 'transition-all duration-300 hover:border-accent-cyan/40 hover:shadow-lg hover:shadow-accent-cyan/10 hover:-translate-y-1 cursor-pointer'
    : '';

  const glowClasses = glow
    ? 'animate-glow'
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${glowClasses} ${padding} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export default GlassmorphicCard;
