import { useEffect, useState, useRef } from 'react';

/**
 * Toast Notification Component
 * Simple toast notification that displays a message and auto-dismisses
 */
export function Toast({ message, onClose, duration = 3000, type = 'success' }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const progressPercent = (remaining / duration) * 100;
        setProgress(progressPercent);

        if (remaining <= 0) {
          onClose();
        } else {
          animationRef.current = requestAnimationFrame(animate);
        }
      }
    };

    if (!isPaused) {
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);

      timerRef.current = setTimeout(() => {
        onClose();
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, duration, onClose]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    info: 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    alert: 'bg-accent-gold/20 border-accent-gold/50 text-accent-gold',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    alert: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  };

  const progressBarColors = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    info: 'bg-accent-cyan',
    warning: 'bg-yellow-400',
    alert: 'bg-accent-gold',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg overflow-hidden ${typeStyles[type] || typeStyles.info}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {icons[type] || icons.info}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div
          className={`absolute bottom-0 left-0 h-1 transition-all ${progressBarColors[type] || progressBarColors.info}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Individual toast item with pause-on-hover and progress bar
 */
function ToastItem({ toast, onRemove }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration || 5000);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  const duration = toast.duration || 5000;

  useEffect(() => {
    const animate = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const progressPercent = (remaining / duration) * 100;
        setProgress(progressPercent);

        if (remaining <= 0) {
          onRemove(toast.id);
        } else {
          animationRef.current = requestAnimationFrame(animate);
        }
      }
    };

    if (!isPaused) {
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);

      timerRef.current = setTimeout(() => {
        onRemove(toast.id);
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, duration, toast.id, onRemove]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    info: 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    alert: 'bg-accent-gold/20 border-accent-gold/50 text-accent-gold',
  };

  const progressBarColors = {
    success: 'bg-green-400',
    error: 'bg-red-400',
    info: 'bg-accent-cyan',
    warning: 'bg-yellow-400',
    alert: 'bg-accent-gold',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    alert: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  };

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg overflow-hidden ${
        typeStyles[toast.type] || typeStyles.info
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icons[toast.type] || icons.info}
      <span className="font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 p-1 rounded hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div
        className={`absolute bottom-0 left-0 h-1 transition-all ${
          progressBarColors[toast.type] || progressBarColors.info
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * Toast container component
 * Manages multiple toasts stacked vertically
 */
export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-in-right">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);

    // Note: Auto-removal is now handled by ToastItem component
    // to support pause-on-hover functionality

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
}
