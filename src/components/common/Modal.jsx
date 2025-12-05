import React, { useEffect, useRef, useCallback, createContext, useId, useState } from 'react';
import { createPortal } from 'react-dom';

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
    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 ${className}`}>
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
      className={`text-xl font-display font-bold text-text-primary ${className}`}
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
    <div className={`px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto max-h-[60dvh] sm:max-h-[70dvh] ${className}`}>
      {children}
    </div>
  );
}

/**
 * Modal Footer Component
 */
function ModalFooter({ children, className = '' }) {
  return (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pb-safe ${className}`}>
      {children}
    </div>
  );
}

/**
 * Main Modal Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback when modal should close
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} props.closeOnBackdrop - Close modal when clicking backdrop (default: true)
 * @param {boolean} props.closeOnEscape - Close modal on Escape key (default: true)
 * @param {boolean} props.showCloseButton - Show close button in header (default: true)
 * @param {string} props.title - Optional title (creates automatic header)
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.className - Additional classes for modal container
 * @param {string} props.backdropClassName - Additional classes for backdrop
 */
export function Modal({
  isOpen,
  onClose,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  title,
  children,
  className = '',
  backdropClassName = '',
}) {
  const modalRef = useRef(null);
  const generatedId = useId();
  const modalIdRef = useRef(`modal-${generatedId}`);
  const [zIndex, setZIndex] = useState(1000);

  // Manage focus trap
  useFocusTrap(isOpen, modalRef);

  // Manage body scroll lock
  useBodyScrollLock(isOpen);

  // Register/unregister modal in stack
  useEffect(() => {
    const currentModalId = modalIdRef.current;
    if (isOpen) {
      setZIndex(registerModal(currentModalId));
    }
    return () => {
      unregisterModal(currentModalId);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  if (!isOpen) return null;

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[95vh]',
  };

  // Check if children contains Modal.Header, Modal.Body, Modal.Footer
  const hasCustomLayout = React.Children.toArray(children).some(
    child => child?.type === ModalHeader || child?.type === ModalBody || child?.type === ModalFooter
  );

  const modalContent = (
    <div
      className={`fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6 pt-safe ${backdropClassName}`}
      style={{ zIndex }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-space-black/80 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]}
          bg-space-dark/95 backdrop-blur-xl
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          border border-accent-cyan/20 border-b-0 sm:border-b
          animate-fade-in-up motion-reduce:animate-none
          overflow-hidden
          max-h-[90vh] sm:max-h-[85vh]
          ${size === 'full' ? 'flex flex-col' : ''}
          ${className}
        `}
        style={{
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.1), 0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Content */}
        <ModalContext.Provider value={{ onClose, size }}>
          {title && !hasCustomLayout ? (
            <>
              <ModalHeader>
                <div className="flex items-center justify-between">
                  <ModalTitle id="modal-title">{title}</ModalTitle>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
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
                  onClick={onClose}
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

  // Render to portal
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
  const [isOpen, setIsOpen] = React.useState(initialState);

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
