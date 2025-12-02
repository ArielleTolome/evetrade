import React from 'react';

/**
 * Badge Component
 * A versatile badge/tag component for EVETrade with multiple variants, colors, and options
 *
 * Features:
 * - Multiple variants (solid, outline, subtle)
 * - Multiple color schemes (cyan, green, red, gold, purple, pink, gray)
 * - Multiple sizes (xs, sm, md, lg)
 * - Optional dot indicator with pulse animation
 * - Optional icons (left or right)
 * - Optional close/remove button
 * - Pill shape option
 * - Text truncation with ellipsis
 * - Space/cyberpunk theme with subtle glow effects
 *
 * @example
 * <Badge color="cyan" variant="solid" size="sm">New</Badge>
 * <Badge color="green" dot pulse>Online</Badge>
 * <Badge color="red" variant="outline" icon={<AlertIcon />}>Error</Badge>
 * <Badge onRemove={() => {}}>Removable</Badge>
 * <Badge pill>Rounded</Badge>
 */
export function Badge({
  children,
  variant = 'solid', // solid, outline, subtle
  color = 'cyan', // cyan, green, red, gold, purple, pink, gray
  size = 'sm', // xs, sm, md, lg
  dot = false,
  pulse = false,
  icon,
  iconPosition = 'left',
  onRemove,
  pill = false,
  className = '',
  title,
  ...props
}) {
  // Color configurations with cyberpunk/space theme
  const colorConfigs = {
    cyan: {
      solid: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50',
      outline: 'bg-transparent text-accent-cyan border-accent-cyan/60',
      subtle: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
      glow: 'shadow-accent-cyan/20 hover:shadow-accent-cyan/30',
      dot: 'bg-accent-cyan',
    },
    green: {
      solid: 'bg-green-500/20 text-green-400 border-green-500/50',
      outline: 'bg-transparent text-green-400 border-green-500/60',
      subtle: 'bg-green-500/10 text-green-400 border-green-500/20',
      glow: 'shadow-green-500/20 hover:shadow-green-500/30',
      dot: 'bg-green-400',
    },
    red: {
      solid: 'bg-red-500/20 text-red-400 border-red-500/50',
      outline: 'bg-transparent text-red-400 border-red-500/60',
      subtle: 'bg-red-500/10 text-red-400 border-red-500/20',
      glow: 'shadow-red-500/20 hover:shadow-red-500/30',
      dot: 'bg-red-400',
    },
    gold: {
      solid: 'bg-accent-gold/20 text-accent-gold border-accent-gold/50',
      outline: 'bg-transparent text-accent-gold border-accent-gold/60',
      subtle: 'bg-accent-gold/10 text-accent-gold border-accent-gold/20',
      glow: 'shadow-accent-gold/20 hover:shadow-accent-gold/30',
      dot: 'bg-accent-gold',
    },
    purple: {
      solid: 'bg-accent-purple/20 text-accent-purple border-accent-purple/50',
      outline: 'bg-transparent text-accent-purple border-accent-purple/60',
      subtle: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
      glow: 'shadow-accent-purple/20 hover:shadow-accent-purple/30',
      dot: 'bg-accent-purple',
    },
    pink: {
      solid: 'bg-accent-pink/20 text-accent-pink border-accent-pink/50',
      outline: 'bg-transparent text-accent-pink border-accent-pink/60',
      subtle: 'bg-accent-pink/10 text-accent-pink border-accent-pink/20',
      glow: 'shadow-accent-pink/20 hover:shadow-accent-pink/30',
      dot: 'bg-accent-pink',
    },
    gray: {
      solid: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      outline: 'bg-transparent text-gray-400 border-gray-500/40',
      subtle: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      glow: 'shadow-gray-500/10 hover:shadow-gray-500/20',
      dot: 'bg-gray-400',
    },
  };

  // Size configurations
  const sizeConfigs = {
    xs: {
      padding: 'px-1.5 py-0.5',
      text: 'text-[10px]',
      gap: 'gap-1',
      iconSize: 'w-2.5 h-2.5',
      dotSize: 'w-1.5 h-1.5',
      closeSize: 'w-3 h-3',
    },
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      gap: 'gap-1.5',
      iconSize: 'w-3 h-3',
      dotSize: 'w-2 h-2',
      closeSize: 'w-3.5 h-3.5',
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-sm',
      gap: 'gap-2',
      iconSize: 'w-4 h-4',
      dotSize: 'w-2.5 h-2.5',
      closeSize: 'w-4 h-4',
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-base',
      gap: 'gap-2.5',
      iconSize: 'w-5 h-5',
      dotSize: 'w-3 h-3',
      closeSize: 'w-5 h-5',
    },
  };

  const colorConfig = colorConfigs[color] || colorConfigs.cyan;
  const sizeConfig = sizeConfigs[size] || sizeConfigs.sm;

  // Build classes
  const baseClasses = `
    inline-flex items-center
    ${sizeConfig.padding}
    ${sizeConfig.text}
    ${sizeConfig.gap}
    ${pill ? 'rounded-full' : 'rounded-md'}
    border
    font-medium
    transition-all duration-200
    ${colorConfig[variant]}
    ${variant === 'solid' ? `shadow-sm ${colorConfig.glow}` : ''}
    truncate
    max-w-full
  `;

  return (
    <span
      className={`${baseClasses} ${className}`}
      title={title}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={`
            ${sizeConfig.dotSize}
            rounded-full
            ${colorConfig.dot}
            flex-shrink-0
            ${pulse ? 'animate-pulse' : ''}
          `}
        />
      )}

      {/* Left icon */}
      {icon && iconPosition === 'left' && (
        <span className={`${sizeConfig.iconSize} flex-shrink-0`}>{icon}</span>
      )}

      {/* Content */}
      <span className="truncate">{children}</span>

      {/* Right icon */}
      {icon && iconPosition === 'right' && (
        <span className={`${sizeConfig.iconSize} flex-shrink-0`}>{icon}</span>
      )}

      {/* Close button */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={`
            ${sizeConfig.closeSize}
            flex-shrink-0
            hover:opacity-70
            transition-opacity
            focus:outline-none
          `}
          aria-label="Remove"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

/**
 * StatusBadge Component
 * Pre-configured badge variants for order/trade status
 *
 * Statuses:
 * - active: Green with pulse animation
 * - pending: Gold/yellow
 * - completed: Cyan
 * - failed: Red
 * - expired: Gray
 *
 * @example
 * <StatusBadge status="active" />
 * <StatusBadge status="pending" size="md" />
 * <StatusBadge status="completed" showLabel={false} />
 */
export function StatusBadge({
  status,
  size = 'sm',
  showLabel = true,
  showDot = true,
  className = '',
  ...props
}) {
  const statusConfigs = {
    active: {
      color: 'green',
      label: 'Active',
      pulse: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    pending: {
      color: 'gold',
      label: 'Pending',
      pulse: false,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    completed: {
      color: 'cyan',
      label: 'Completed',
      pulse: false,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    failed: {
      color: 'red',
      label: 'Failed',
      pulse: false,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    expired: {
      color: 'gray',
      label: 'Expired',
      pulse: false,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = statusConfigs[status] || statusConfigs.pending;

  return (
    <Badge
      color={config.color}
      variant="solid"
      size={size}
      dot={showDot}
      pulse={config.pulse}
      icon={showLabel ? null : config.icon}
      className={className}
      title={config.label}
      {...props}
    >
      {showLabel && config.label}
    </Badge>
  );
}

/**
 * BadgeGroup Component
 * Container for displaying multiple badges with proper spacing
 *
 * @example
 * <BadgeGroup>
 *   <Badge color="green">Active</Badge>
 *   <Badge color="cyan">New</Badge>
 *   <Badge color="purple">Premium</Badge>
 * </BadgeGroup>
 */
export function BadgeGroup({ children, className = '', wrap = true }) {
  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        ${wrap ? 'flex-wrap' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Badge;
