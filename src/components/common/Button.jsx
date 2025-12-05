import React from 'react';
import { Link } from 'react-router-dom';
import useRipple from '../../hooks/useRipple';

/**
 * Button Component
 * Reusable button with multiple variants and states
 */
export function Button({
    children,
    variant = 'primary', // primary, secondary, ghost, danger
    size = 'md', // sm, md, lg
    className = '',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    to,
    onClick,
    type = 'button',
    disableRipple = false,
    ...props
}) {
    const [ripples, createRipple] = useRipple();

    const handleMouseDown = (e) => {
        if (!disableRipple) {
            createRipple(e);
        }
    };

    const handleKeyDown = (e) => {
        if (!disableRipple && (e.key === 'Enter' || e.key === ' ')) {
            const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
            const event = {
                ...e,
                currentTarget: e.currentTarget,
                clientX: left + width / 2,
                clientY: top + height / 2,
            };
            createRipple(event);
        }
    };

    // Base classes
    const baseClasses = `
    relative overflow-hidden
    inline-flex items-center justify-center
    font-display font-medium tracking-wide
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-black
    active:scale-95
  `;

    // Variant classes
    const variants = {
        primary: `
      bg-gradient-to-r from-accent-cyan to-accent-purple
      text-white
      shadow-lg shadow-accent-cyan/20
      hover:shadow-accent-cyan/40 hover:-translate-y-0.5
      border border-transparent
    `,
        secondary: `
      bg-white/5 backdrop-blur-sm
      text-accent-cyan
      border border-accent-cyan/30
      hover:bg-accent-cyan/10 hover:border-accent-cyan/60
      hover:shadow-lg hover:shadow-accent-cyan/10
    `,
        ghost: `
      bg-transparent
      text-text-secondary hover:text-white
      hover:bg-white/5
    `,
        danger: `
      bg-red-500/10
      text-red-400
      border border-red-500/30
      hover:bg-red-500/20 hover:border-red-500/50
    `,
    };

    // Size classes - ensuring min-height for touch targets on mobile
    const sizes = {
        sm: 'text-xs px-3 py-2 rounded-md gap-1.5 min-h-[44px] sm:min-h-[36px]',
        md: 'text-sm px-4 sm:px-5 py-2.5 rounded-lg gap-2 min-h-[44px] sm:min-h-[40px]',
        lg: 'text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl gap-3 min-h-[48px]',
    };

    const classes = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${className}
  `;

    const spinner = (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    const rippleColor = (variant === 'primary' || variant === 'danger') ? 'rgba(224, 225, 221, 0.2)' : 'rgba(65, 90, 119, 0.3)';

    const content = (
        <>
            {loading && spinner}
            {!loading && icon && iconPosition === 'left' && <span className="text-lg">{icon}</span>}
            <span className="relative z-10">{children}</span>
            {!loading && icon && iconPosition === 'right' && <span className="text-lg">{icon}</span>}
            {!disableRipple && ripples.map((ripple) => (
                <span
                    key={ripple.key}
                    className="ripple"
                    style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        transform: 'scale(0)',
                        animation: 'ripple 600ms linear',
                        backgroundColor: rippleColor,
                        left: `${ripple.x - (ripple.size/2)}px`,
                        top: `${ripple.y - (ripple.size/2)}px`,
                        width: `${ripple.size}px`,
                        height: `${ripple.size}px`,
                    }}
                />
            ))}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={classes} onMouseDown={handleMouseDown} onKeyDown={handleKeyDown} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            {...props}
        >
            {content}
        </button>
    );
}

export default Button;
