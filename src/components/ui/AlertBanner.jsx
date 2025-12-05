import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';

const AlertBanner = ({
  id,
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  actionLabel,
  duration = null,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const remainingTimeRef = useRef(duration);
  const animationFrameRef = useRef(null);

  const handleDismiss = () => {
    setIsExiting(true);
  };

  useEffect(() => {
    if (duration) {
      let lastTime = Date.now();
      const updateProgress = () => {
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
      };
    }
  }, [duration]);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        if (onDismiss) {
          onDismiss(id);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onDismiss, id]);

  const theme = {
    info: {
      bg: 'bg-[#1B263B]',
      border: 'border-[#415A77]',
      text: 'text-[#E0E1DD]',
      progress: 'bg-[#415A77]',
    },
    success: {
      bg: 'bg-[#0D1B2A]',
      border: 'border-[#00ff9d]',
      text: 'text-[#E0E1DD]',
      progress: 'bg-[#00ff9d]',
    },
    warning: {
      bg: 'bg-[#0D1B2A]',
      border: 'border-[#ffd700]',
      text: 'text-[#E0E1DD]',
      progress: 'bg-[#ffd700]',
    },
    error: {
      bg: 'bg-[#0D1B2A]',
      border: 'border-[#d73000]',
      text: 'text-[#E0E1DD]',
      progress: 'bg-[#d73000]',
    },
  };

  const selectedTheme = theme[type] || theme.info;

  return (
    <div
      className={`relative w-full p-4 border-l-4 ${selectedTheme.bg} ${
        selectedTheme.border
      } ${
        selectedTheme.text
      } transition-all duration-300 ease-in-out mb-2 ${
        isExiting ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'
      } animate-slide-down-and-fade-in`}
    >
      <div className="flex items-center max-w-7xl mx-auto">
        <div className="flex-shrink-0">
          {type === 'info' && <Info className="h-5 w-5" />}
          {type === 'success' && <CheckCircle className="h-5 w-5" />}
          {type === 'warning' && <AlertTriangle className="h-5 w-5" />}
          {type === 'error' && <XCircle className="h-5 w-5" />}
        </div>
        <div className="ml-4 flex-grow">
          <p className="font-bold">{title}</p>
          <p className="text-sm">{message}</p>
        </div>
        {action && actionLabel && (
          <div className="ml-4">
            <button
              onClick={action}
              className="px-4 py-2 text-sm font-medium bg-transparent border border-white/20 rounded-md hover:bg-white/10 transition-colors"
            >
              {actionLabel}
            </button>
          </div>
        )}
        {dismissible && (
          <div className="ml-4">
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      {duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className={`h-full ${selectedTheme.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

AlertBanner.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  action: PropTypes.func,
  actionLabel: PropTypes.string,
  duration: PropTypes.number,
};

export default AlertBanner;
