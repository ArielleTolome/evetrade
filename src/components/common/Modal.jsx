import React, { useEffect, useRef, useCallback, createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility to merge Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Modal Context for managing modal state
 */
const ModalContext = createContext({});

/**
 * Focus trap utility - keeps focus within modal
 */
function useFocusTrap(isOpen, modalRef) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Store the element that had focus before modal opened
    previousFocusRef.current = document.activeElement;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      const elements = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements);
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Trap focus
    const handleTab = (e) => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTab);

    // Return focus to previous element when modal closes
    return () => {
      document.removeEventListener('keydown', handleTab);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, modalRef]);
}

/**
 * Body scroll lock - prevents body scroll when modal is open
 */
function useBodyScrollLock(isOpen) {
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);
}

/**
 * Modal stack manager - handles multiple modals with proper z-index
 */
let modalStack = [];
const getNextZIndex = () => 1000 + modalStack.length * 10;
const registerModal = (id) => {
  if (!modalStack.includes(id)) {
    modalStack.push(id);
  }
  return getNextZIndex();
};
const unregisterModal = (id) => {
  modalStack = modalStack.filter(stackId => stackId !== id);
};

/**
 * Modal Header Component
 */
function ModalHeader({ children, className = '' }) {
  return (
    <div className={cn('px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10', className)}>
      {children}
    </div>
  );
}

/**
 * Modal Title Component
 */
function ModalTitle({ children, className = '', id, ...props }) {
  return (
    <h2
      id={id}
      className={cn('text-xl font-display font-bold text-text-primary', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

/**
 * Modal Body Component
 */
function ModalBody({ children, className = '' }) {
  return (
    <div className={cn('px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto max-h-[60dvh] sm:max-h-[70dvh]', className)}>
      {children}
    </div>
  );
}

/**
 * Modal Footer Component
 */
function ModalFooter({ children, className = '' }) {
  return (
    <div className={cn('px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pb-safe', className)}>
      {children}
    </div>
  );
}

const animationMap = {
  fade: {
    enter: 'animate-modal-fade-in',
    exit: 'animate-modal-fade-out',
  },
  'slide-up': {
    enter: 'animate-modal-slide-up-in',
    exit: 'animate-modal-slide-up-out',
  },
  'slide-down': {
    enter: 'animate-modal-slide-down-in',
    exit: 'animate-modal-slide-down-out',
  },
  'slide-right': {
    enter: 'animate-modal-slide-right-in',
    exit: 'animate-modal-slide-right-out',
  },
  scale: {
    enter: 'animate-modal-scale-in',
    exit: 'animate-modal-scale-out',
  },
};

/**
 * Main Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {string} [props.size='md'] - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {string} [props.animation='fade'] - Animation type: 'fade', 'slide-up', 'slide-down', 'slide-right', 'scale'
 * @param {boolean} [props.fullscreen=false] - Fullscreen on mobile
 * @param {boolean} [props.closeOnBackdrop=true] - Close modal when clicking backdrop
 * @param {boolean} [props.closeOnEscape=true] - Close modal on Escape key
 * @param {boolean} [props.showCloseButton=true] - Show close button in header
 * @param {string} [props.title] - Optional title (creates automatic header)
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.className] - Additional classes for modal container
 * @param {string} [props.backdropClassName] - Additional classes for backdrop
 */
export function Modal({
  isOpen,
  onClose,
  size = 'md',
  animation = 'fade',
  fullscreen = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  title,
  children,
  className = '',
  backdropClassName = '',
}) {
  const modalRef = useRef(null);
  const modalId = useRef(`modal-${Math.random().toString(36).substr(2, 9)}`);
  const zIndexRef = useRef(1000);
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsAnimatingOut(false);
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => setIsMounted(false), 150); // Match exit animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manage focus trap
  useFocusTrap(isMounted, modalRef);

  // Manage body scroll lock
  useBodyScrollLock(isMounted);

  // Register/unregister modal in stack
  useEffect(() => {
    if (isMounted) {
      zIndexRef.current = registerModal(modalId.current);
    }
    return () => {
      unregisterModal(modalId.current);
    };
  }, [isMounted]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isMounted || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMounted, closeOnEscape, handleClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      handleClose();
    }
  }, [closeOnBackdrop, handleClose]);

  if (!isMounted) return null;

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[95dvh]',
  };

  const hasCustomLayout = React.Children.toArray(children).some(
    child => child?.type === ModalHeader || child?.type === ModalBody || child?.type === ModalFooter
  );

  const animationClasses = animationMap[animation] || animationMap.fade;
  const currentAnimation = isAnimatingOut ? animationClasses.exit : animationClasses.enter;
  const backdropAnimation = isAnimatingOut ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in';

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 pt-safe',
        'motion-safe:transition-opacity motion-reduce:transition-none',
        backdropClassName
      )}
      style={{ zIndex: zIndexRef.current }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-space-black/80 backdrop-blur-sm',
          backdropAnimation
        )}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        data-testid="modal-container"
        className={cn(
          'relative w-full',
          sizeClasses[size],
          'bg-space-dark/95 backdrop-blur-xl',
          'rounded-t-2xl sm:rounded-2xl shadow-2xl',
          'border border-accent-cyan/20 border-b-0 sm:border-b',
          'overflow-hidden max-h-[90vh] sm:max-h-[85vh]',
          { 'h-full w-full max-w-full max-h-full rounded-none sm:rounded-2xl': fullscreen },
          size === 'full' ? 'flex flex-col' : '',
          currentAnimation,
          'motion-reduce:animate-none',
          className
        )}
        style={{
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.1), 0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Content */}
        <ModalContext.Provider value={{ onClose: handleClose, size }}>
          {title && !hasCustomLayout ? (
            <>
              <ModalHeader>
                <div className="flex items-center justify-between">
                  <ModalTitle id="modal-title">{title}</ModalTitle>
                  {showCloseButton && (
                    <button
                      onClick={handleClose}
                      className="text-text-secondary hover:text-accent-cyan transition-colors p-1 rounded-lg hover:bg-white/5"
                      aria-label="Close modal"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </ModalHeader>
              <ModalBody>{children}</ModalBody>
            </>
          ) : (
            <>
              {showCloseButton && !hasCustomLayout && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-text-secondary hover:text-accent-cyan transition-colors p-1 rounded-lg hover:bg-white/5 z-10"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              {children}
            </>
          )}
        </ModalContext.Provider>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Attach sub-components
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

/**
 * Hook for managing modal state
 *
 * @returns {Object} Modal state and controls
 * @property {boolean} isOpen - Whether modal is open
 * @property {Function} open - Open the modal
 * @property {Function} close - Close the modal
 * @property {Function} toggle - Toggle modal state
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default Modal;
