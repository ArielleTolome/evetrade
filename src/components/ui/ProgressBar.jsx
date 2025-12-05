import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'default',
  color = 'primary',
  indeterminate = false,
  className,
  ...props
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const sizeClasses = {
    sm: 'h-1', // 4px
    md: 'h-2', // 8px
    lg: 'h-3', // 12px
  };

  const colorClasses = {
    primary: '#415A77',
    success: '#00ff9d',
    warning: '#ffd700',
    danger: '#d73000',
  };

  const trackStyle = {
    backgroundColor: '#1B263B',
  };

  const fillStyle = {};
  const fillClasses = ['h-full', 'rounded-full', 'transition-all', 'duration-300', 'ease-in-out'];

  if (indeterminate) {
    fillStyle.animation = 'indeterminate-animation 1.5s infinite linear';
    fillStyle.backgroundImage = `linear-gradient(to right, transparent 0%, ${colorClasses[color]} 50%, transparent 100%)`;
    fillStyle.backgroundSize = '200% 100%';
    fillStyle.width = '100%';
  } else {
    fillStyle.width = `${percentage}%`;
    switch (variant) {
      case 'gradient':
        fillStyle.backgroundImage = `linear-gradient(to right, #415A77, #778DA9)`;
        break;
      case 'striped':
        fillStyle.backgroundImage = `repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 0, rgba(255, 255, 255, 0.15) 10px, transparent 10px, transparent 20px)`;
        fillStyle.backgroundColor = colorClasses[color];
        break;
      case 'animated':
        fillStyle.backgroundImage = `repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.2) 0, rgba(255, 255, 255, 0.2) 10px, transparent 10px, transparent 20px)`;
        fillStyle.backgroundSize = '40px 40px';
        fillStyle.animation = 'striped-animation 1s linear infinite';
        fillStyle.backgroundColor = colorClasses[color];
        break;
      case 'default':
      default:
        fillStyle.backgroundColor = colorClasses[color];
        break;
    }
  }

  return (
    <div className={twMerge('w-full', className)}>
      {(label || (showValue && size !== 'lg')) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {showValue && !indeterminate && size !== 'lg' && (
            <span className="text-sm font-medium text-text-secondary">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={clsx('w-full rounded-full overflow-hidden', sizeClasses[size])}
        style={trackStyle}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin="0"
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        {...props}
      >
        <div style={fillStyle} className={clsx(fillClasses)}>
          {showValue && !indeterminate && size === 'lg' && (
            <span className="flex items-center justify-center h-full text-xs font-bold text-space-black">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
      <style>{`
        @keyframes striped-animation {
          from { background-position: 40px 0; }
          to { background-position: 0 0; }
        }
        @keyframes indeterminate-animation {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.string,
  showValue: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'gradient', 'striped', 'animated']),
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger']),
  indeterminate: PropTypes.bool,
  className: PropTypes.string,
};

export default ProgressBar;
