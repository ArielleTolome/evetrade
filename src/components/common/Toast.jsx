import { useEffect, useState, useRef } from 'react';

/**
 * Individual Toast Component
 * Displays a single notification with type-specific styling, animations, and progress bar
 */
export function Toast({ id, type = 'info', message, duration = 5000, onDismiss, action }) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);
  const remainingTimeRef = useRef(duration);
  const pausedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const dismissTimeoutRef = useRef(null);

  // Toast type configurations with cyberpunk/space theme
  const config = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: 'bg-accent-green/10 dark:bg-accent-green/20',
      borderColor: 'border-accent-green/30',
      iconColor: 'text-accent-green',
      progressColor: 'bg-accent-green',
      glowColor: 'shadow-accent-green/20',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: 'bg-red-500/10 dark:bg-red-500/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-500',
      progressColor: 'bg-red-500',
      glowColor: 'shadow-red-500/20',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: 'bg-accent-gold/10 dark:bg-accent-gold/20',
      borderColor: 'border-accent-gold/30',
      iconColor: 'text-accent-gold',
      progressColor: 'bg-accent-gold',
      glowColor: 'shadow-accent-gold/20',
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      bgColor: 'bg-accent-cyan/10 dark:bg-accent-cyan/20',
      borderColor: 'border-accent-cyan/30',
      iconColor: 'text-accent-cyan',
      progressColor: 'bg-accent-cyan',
      glowColor: 'shadow-accent-cyan/20',
    },
  };

  const toastConfig = config[type] || config.info;

  // Handle auto-dismiss with smooth progress animation
  useEffect(() => {
    if (duration === Infinity) return;

    let lastTime = Date.now();

    const updateProgress = () => {
      if (pausedRef.current) {
        lastTime = Date.now();
        animationFrameRef.current = requestAnimationFrame(updateProgress);
        return;
      }

      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      remainingTimeRef.current -= deltaTime;
      const newProgress = Math.max(0, (remainingTimeRef.current / duration) * 100);
      setProgress(newProgress);

      if (remainingTimeRef.current <= 0) {
        handleDismiss();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [duration]);

  const handleDismiss = () => {
    if (isExiting) return; // Already dismissing
    setIsExiting(true);
    // Clear any existing timeout before creating a new one
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    dismissTimeoutRef.current = setTimeout(() => {
      onDismiss(id);
      dismissTimeoutRef.current = null;
    }, 300); // Match animation duration
  };

  const handleMouseEnter = () => {
    pausedRef.current = true;
  };

  const handleMouseLeave = () => {
    pausedRef.current = false;
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        relative w-full overflow-hidden
        ${toastConfig.bgColor}
        backdrop-blur-xl
        border ${toastConfig.borderColor}
        rounded-lg shadow-xl ${toastConfig.glowColor}
        transition-all duration-300 ease-out
        ${
          isExiting
            ? 'opacity-0 translate-x-full scale-95'
            : 'opacity-100 translate-x-0 scale-100'
        }
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glassmorphic gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${toastConfig.iconColor}`}>
            {toastConfig.icon}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary dark:text-text-primary break-words">
              {message}
            </p>

            {/* Action button */}
            {action && (
              <button
                onClick={action.onClick}
                className={`
                  mt-2 text-xs font-semibold ${toastConfig.iconColor}
                  hover:underline focus:outline-none focus-visible:ring-2 focus:ring-offset-2 focus:ring-accent-cyan/50 rounded
                  transition-all
                `}
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0 text-text-secondary hover:text-text-primary
              transition-colors focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan/50 rounded p-1
            "
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 dark:bg-white/5">
          <div
            className={`h-full ${toastConfig.progressColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      )}
    </div>
  );
}

export default Toast;
