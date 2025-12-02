import { useState, useRef, useEffect, forwardRef, cloneElement } from 'react';
import { createPortal } from 'react-dom';

/**
 * Tooltip Component
 *
 * A fully accessible tooltip component with multiple trigger modes, smart positioning,
 * and keyboard support.
 *
 * @example
 * // Simple text tooltip
 * <Tooltip content="Helpful text" position="top">
 *   <button>Hover me</button>
 * </Tooltip>
 *
 * @example
 * // Rich content tooltip
 * <Tooltip
 *   content={<div><strong>Title</strong><p>Description</p></div>}
 *   position="bottom"
 *   trigger="click"
 * >
 *   <InfoIcon />
 * </Tooltip>
 *
 * @example
 * // Controlled mode
 * <Tooltip
 *   content="Controlled tooltip"
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 * >
 *   <button>Click me</button>
 * </Tooltip>
 */
export const Tooltip = forwardRef(({
  children,
  content,
  position = 'top',
  trigger = 'hover', // 'hover' | 'click' | 'focus' | 'manual'
  delay = 300,
  isOpen: controlledIsOpen,
  onOpenChange,
  disabled = false,
  className = '',
  maxWidth = '250px',
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);
  const portalRoot = useRef(null);

  // Use controlled or uncontrolled state
  const open = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  const setOpen = (value) => {
    if (controlledIsOpen === undefined) {
      setIsOpen(value);
    }
    onOpenChange?.(value);
  };

  // Initialize portal root
  useEffect(() => {
    if (!portalRoot.current) {
      portalRoot.current = document.body;
    }
  }, []);

  // Calculate tooltip position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8; // Distance from trigger element
    const arrowSize = 6;

    let newPosition = position;
    let top = 0;
    let left = 0;

    // Calculate base position
    const positions = {
      top: {
        top: triggerRect.top - tooltipRect.height - padding - arrowSize,
        left: triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2),
      },
      bottom: {
        top: triggerRect.bottom + padding + arrowSize,
        left: triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2),
      },
      left: {
        top: triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2),
        left: triggerRect.left - tooltipRect.width - padding - arrowSize,
      },
      right: {
        top: triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2),
        left: triggerRect.right + padding + arrowSize,
      },
    };

    const basePos = positions[position];
    top = basePos.top;
    left = basePos.left;

    // Check boundaries and flip if needed
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Flip vertically if needed
    if (position === 'top' && top < 0) {
      newPosition = 'bottom';
      const flipped = positions.bottom;
      top = flipped.top;
      left = flipped.left;
    } else if (position === 'bottom' && top + tooltipRect.height > viewportHeight) {
      newPosition = 'top';
      const flipped = positions.top;
      top = flipped.top;
      left = flipped.left;
    }

    // Flip horizontally if needed
    if (position === 'left' && left < 0) {
      newPosition = 'right';
      const flipped = positions.right;
      top = flipped.top;
      left = flipped.left;
    } else if (position === 'right' && left + tooltipRect.width > viewportWidth) {
      newPosition = 'left';
      const flipped = positions.left;
      top = flipped.top;
      left = flipped.left;
    }

    // Constrain to viewport (horizontal)
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    // Constrain to viewport (vertical)
    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    setActualPosition(newPosition);
    setCoords({ top, left });
  };

  // Update position when tooltip opens or window resizes
  useEffect(() => {
    if (open) {
      calculatePosition();

      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position]);

  // Handle show with delay
  const handleShow = () => {
    if (disabled) return;

    if (delay > 0 && trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setOpen(true);
      }, delay);
    } else {
      setOpen(true);
    }
  };

  // Handle hide
  const handleHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(false);
  };

  // Handle toggle
  const handleToggle = () => {
    if (disabled) return;
    setOpen(!open);
  };

  // Handle keyboard
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && open) {
      handleHide();
      triggerRef.current?.focus();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close on click outside
  useEffect(() => {
    if (open && trigger === 'click') {
      const handleClickOutside = (e) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(e.target) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(e.target)
        ) {
          handleHide();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, trigger]);

  // Build trigger handlers
  const triggerHandlers = {};

  if (trigger === 'hover') {
    triggerHandlers.onMouseEnter = handleShow;
    triggerHandlers.onMouseLeave = handleHide;
    triggerHandlers.onFocus = handleShow;
    triggerHandlers.onBlur = handleHide;
  } else if (trigger === 'click') {
    triggerHandlers.onClick = handleToggle;
  } else if (trigger === 'focus') {
    triggerHandlers.onFocus = handleShow;
    triggerHandlers.onBlur = handleHide;
  }

  // Add keyboard handler
  triggerHandlers.onKeyDown = handleKeyDown;

  // Clone child with trigger handlers
  const triggerElement = cloneElement(children, {
    ref: (node) => {
      triggerRef.current = node;
      // Forward ref if provided
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
      // Preserve original ref (read-only access)
      const childRef = children.ref;
      if (childRef) {
        if (typeof childRef === 'function') {
          childRef(node);
        } else if (childRef && typeof childRef === 'object') {
          childRef.current = node;
        }
      }
    },
    ...triggerHandlers,
    'aria-describedby': open ? 'tooltip' : undefined,
  });

  // Arrow styles based on position
  const arrowStyles = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-space-light border-x-transparent border-b-transparent',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-space-light border-x-transparent border-t-transparent',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-space-light border-y-transparent border-r-transparent',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-space-light border-y-transparent border-l-transparent',
  };

  return (
    <>
      {triggerElement}
      {open && portalRoot.current && createPortal(
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`
            fixed z-[9999]
            px-3 py-2
            bg-space-light
            text-text-primary text-sm leading-relaxed
            rounded-lg
            border border-accent-cyan/30
            shadow-lg shadow-accent-cyan/10
            animate-fade-in
            pointer-events-none
            ${className}
          `}
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            maxWidth: maxWidth,
          }}
          onMouseEnter={trigger === 'hover' ? handleShow : undefined}
          onMouseLeave={trigger === 'hover' ? handleHide : undefined}
        >
          {content}
          {/* Arrow */}
          <div
            className={`
              absolute
              w-0 h-0
              border-[6px]
              ${arrowStyles[actualPosition]}
            `}
          />
        </div>,
        portalRoot.current
      )}
    </>
  );
});

Tooltip.displayName = 'Tooltip';

/**
 * TooltipTrigger - Helper component for more complex trigger scenarios
 */
export const TooltipTrigger = forwardRef(({ children, ...props }, ref) => {
  return cloneElement(children, { ...props, ref });
});

TooltipTrigger.displayName = 'TooltipTrigger';

/**
 * InfoTooltip - Convenient icon-based tooltip
 */
export function InfoTooltip({ content, position = 'top', className = '' }) {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className={`
          inline-flex items-center justify-center
          w-4 h-4
          text-text-secondary hover:text-accent-cyan
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 rounded-full
          ${className}
        `}
        aria-label="More information"
      >
        <svg
          className="w-full h-full"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

export default Tooltip;
