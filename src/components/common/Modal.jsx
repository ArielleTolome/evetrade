import React, { useCallback, createContext } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

const ModalContext = createContext({});

function ModalHeader({ children, className = '' }) {
  return <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 ${className}`}>{children}</div>;
}

function ModalTitle({ children, className = '', ...props }) {
  return (
    <DialogTitle className={`text-xl font-display font-bold text-text-primary ${className}`} {...props}>
      {children}
    </DialogTitle>
  );
}

function ModalBody({ children, className = '' }) {
  return <div className={`px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto max-h-[60dvh] sm:max-h-[70vh] ${className}`}>{children}</div>;
}

function ModalFooter({ children, className = '' }) {
  return (
    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pb-safe ${className}`}>
      {children}
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  showCloseButton = true,
  title,
  children,
  className = '',
  initialFocus,
}) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[95vh]',
  };

  const hasCustomLayout = React.Children.toArray(children).some(
    (child) => child?.type === ModalHeader || child?.type === ModalBody || child?.type === ModalFooter
  );

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} initialFocus={initialFocus}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-space-black/80 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`
                  w-full ${sizeClasses[size]}
                  transform text-left align-middle
                  bg-space-dark/95 backdrop-blur-xl
                  rounded-t-2xl sm:rounded-2xl shadow-2xl
                  border border-accent-cyan/20 border-b-0 sm:border-b
                  transition-all
                  overflow-hidden
                  max-h-[90vh] sm:max-h-[85vh]
                  ${size === 'full' ? 'flex flex-col' : ''}
                  ${className}
                `}
                style={{
                  boxShadow: '0 0 30px rgba(0, 240, 255, 0.1), 0 20px 60px rgba(0, 0, 0, 0.5)',
                }}
              >
                <ModalContext.Provider value={{ onClose, size }}>
                  {title && !hasCustomLayout ? (
                    <>
                      <ModalHeader>
                        <div className="flex items-center justify-between">
                          <ModalTitle>{title}</ModalTitle>
                          {showCloseButton && (
                            <button
                              onClick={onClose}
                              className="text-text-secondary hover:text-accent-cyan transition-colors p-1 rounded-lg hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark"
                              aria-label="Close modal"
                            >
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                          className="absolute top-4 right-4 text-text-secondary hover:text-accent-cyan transition-colors p-1 rounded-lg hover:bg-white/5 z-10 focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark"
                          aria-label="Close modal"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {children}
                    </>
                  )}
                </ModalContext.Provider>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
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
