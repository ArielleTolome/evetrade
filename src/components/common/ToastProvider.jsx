import { createContext, useContext, useReducer, useCallback, useRef, useMemo } from 'react';
import { Toast } from './Toast';

/**
 * Toast Context
 */
const ToastContext = createContext(null);

/**
 * Maximum number of toasts visible at once
 */
export const MAX_VISIBLE_TOASTS = 5;

// Reducer action types
const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';
const DISMISS_ALL = 'DISMISS_ALL';

// Initial state for the reducer
const initialState = {
  toasts: [],
  queue: [],
};

// Reducer function to manage toast state
function toastReducer(state, action) {
  switch (action.type) {
    case ADD_TOAST: {
      const { toast } = action.payload;
      if (state.toasts.length < MAX_VISIBLE_TOASTS) {
        return {
          ...state,
          toasts: [...state.toasts, toast],
        };
      } else {
        return {
          ...state,
          queue: [...state.queue, toast],
        };
      }
    }
    case REMOVE_TOAST: {
      const { id } = action.payload;
      const newToasts = state.toasts.filter((t) => t.id !== id);

      // If no toast was removed, do nothing.
      if (newToasts.length === state.toasts.length) {
        return state;
      }

      // A toast was removed, so there's space. Process the queue.
      const spotsToFill = MAX_VISIBLE_TOASTS - newToasts.length;
      if (spotsToFill > 0 && state.queue.length > 0) {
        const toastsFromQueue = state.queue.slice(0, spotsToFill);
        const remainingQueue = state.queue.slice(spotsToFill);

        return {
          toasts: [...newToasts, ...toastsFromQueue],
          queue: remainingQueue,
        };
      }

      return {
        ...state,
        toasts: newToasts,
      };
    }
    case DISMISS_ALL: {
      return {
        ...state,
        toasts: [],
        queue: [],
      };
    }
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}


/**
 * Toast Provider Component
 * Manages toast notifications with queueing and automatic dismissal
 */
export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const { toasts } = state;
  const toastIdCounter = useRef(0);

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

    dispatch({ type: ADD_TOAST, payload: { toast } });

    return id;
  }, []);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    dispatch({ type: REMOVE_TOAST, payload: { id } });
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    dispatch({ type: DISMISS_ALL });
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

  const value = useMemo(() => ({
    toasts,
    success,
    error,
    warning,
    info,
    dismiss: removeToast,
    dismissAll,
  }), [toasts, success, error, warning, info, removeToast, dismissAll]);

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
