import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Toast } from './Toast';

/**
 * Toast Context
 */
const ToastContext = createContext(null);

/**
 * Maximum number of toasts visible at once
 */
const MAX_VISIBLE_TOASTS = 5;

/**
 * Toast Provider Component
 * Manages toast notifications with queueing and automatic dismissal
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [queue, setQueue] = useState([]);
  const toastIdCounter = useRef(0);

  // Process queue when visible toasts change
  const processQueue = useCallback(() => {
    setToasts((currentToasts) => {
      if (currentToasts.length < MAX_VISIBLE_TOASTS) {
        setQueue((currentQueue) => {
          if (currentQueue.length === 0) return currentQueue;

          const toastsToAdd = currentQueue.slice(0, MAX_VISIBLE_TOASTS - currentToasts.length);
          const remainingQueue = currentQueue.slice(MAX_VISIBLE_TOASTS - currentToasts.length);

          // Add queued toasts to visible toasts
          const newToasts = [...currentToasts, ...toastsToAdd];

          // Return remaining queue
          return remainingQueue;
        });

        return currentToasts;
      }
      return currentToasts;
    });
  }, []);

  // Add a toast (either show immediately or queue it)
  const addToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      duration = 5000,
      action = null,
    } = options;

    const id = `toast-${toastIdCounter.current++}-${Date.now()}`;
    const toast = {
      id,
      message,
      type,
      duration,
      action,
    };

    setToasts((currentToasts) => {
      if (currentToasts.length < MAX_VISIBLE_TOASTS) {
        return [...currentToasts, toast];
      } else {
        // Queue the toast if we're at max capacity
        setQueue((currentQueue) => [...currentQueue, toast]);
        return currentToasts;
      }
    });

    return id;
  }, []);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts((currentToasts) => {
      const filtered = currentToasts.filter((t) => t.id !== id);

      // Process queue after removing a toast
      if (filtered.length < currentToasts.length) {
        setTimeout(processQueue, 100);
      }

      return filtered;
    });
  }, [processQueue]);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    setToasts([]);
    setQueue([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'error' });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'warning' });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'info' });
  }, [addToast]);

  const value = {
    toasts,
    success,
    error,
    warning,
    info,
    dismiss: removeToast,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container - Top Right, Mobile Responsive */}
      <div
        className="fixed top-4 right-4 left-4 sm:left-auto z-50 pointer-events-none"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        <div className="flex flex-col gap-3 pointer-events-auto max-w-md sm:max-w-sm md:max-w-md w-full sm:w-96 ml-auto">
          {toasts.map((toast, index) => (
            <div
              key={toast.id}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              className="animate-slide-in-right"
            >
              <Toast
                id={toast.id}
                type={toast.type}
                message={toast.message}
                duration={toast.duration}
                action={toast.action}
                onDismiss={removeToast}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast notifications
 * @returns {Object} Toast methods and state
 * @throws {Error} If used outside ToastProvider
 *
 * @example
 * const toast = useToast();
 *
 * // Show different types of toasts
 * toast.success('Operation completed!');
 * toast.error('Something went wrong');
 * toast.warning('Please review this');
 * toast.info('New update available');
 *
 * // With custom duration
 * toast.success('Saved!', { duration: 3000 });
 *
 * // With action button
 * toast.info('New message received', {
 *   duration: 10000,
 *   action: {
 *     label: 'View',
 *     onClick: () => console.log('Action clicked')
 *   }
 * });
 *
 * // Dismiss specific toast
 * const id = toast.success('Message');
 * toast.dismiss(id);
 *
 * // Dismiss all toasts
 * toast.dismissAll();
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export default ToastProvider;
