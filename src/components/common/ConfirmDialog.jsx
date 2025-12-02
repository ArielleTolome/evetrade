import { useEffect, useRef } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * ConfirmDialog Component
 * A modal dialog that asks for confirmation before destructive actions
 *
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Callback when dialog is closed/cancelled
 * @param {function} onConfirm - Callback when user confirms the action
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message/description
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} variant - Button variant: "danger" (red) or "primary" (cyan) (default: "danger")
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';

      // Focus the cancel button by default (safer default for destructive actions)
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle focus trap within dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
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
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      icon: 'text-red-500',
    },
    primary: {
      button: 'bg-accent-cyan hover:bg-accent-cyan/90 text-space-dark',
      icon: 'text-accent-cyan',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-space-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md mx-4 animate-fade-in-up"
      >
        <GlassmorphicCard className="relative">
          {/* Warning Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 rounded-full bg-${variant === 'danger' ? 'red' : 'accent-cyan'}-500/10 flex items-center justify-center`}>
              <svg
                className={`w-6 h-6 ${currentVariant.icon}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            id="dialog-title"
            className="text-xl font-display font-semibold text-text-primary text-center mb-3"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="dialog-description"
            className="text-text-secondary text-center mb-6"
          >
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              ref={cancelButtonRef}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-text-primary hover:bg-white/5 transition-colors font-medium"
              type="button"
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2.5 rounded-lg ${currentVariant.button} transition-colors font-medium shadow-lg`}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  );
}

export default ConfirmDialog;
