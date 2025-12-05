import { useRef } from 'react';
import Modal from './Modal';

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
  const cancelButtonRef = useRef(null);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500/50',
      icon: 'text-red-500',
      iconBg: 'bg-red-500/10',
    },
    primary: {
      button: 'bg-accent-cyan hover:bg-accent-cyan/90 text-space-dark focus-visible:ring-accent-cyan/50',
      icon: 'text-accent-cyan',
      iconBg: 'bg-accent-cyan/10',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" initialFocus={cancelButtonRef}>
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className={`w-12 h-12 rounded-full ${currentVariant.iconBg} flex items-center justify-center`}>
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

        <Modal.Title as="h3" className="text-xl font-display font-semibold text-text-primary mb-3">
          {title}
        </Modal.Title>

        <p className="text-text-secondary mb-6">{message}</p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-text-primary hover:bg-white/5 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg ${currentVariant.button} transition-colors font-medium shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark`}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
