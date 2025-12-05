import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const NotificationBadge = ({
  count,
  max = 99,
  showZero = false,
  variant = 'default',
  pulse = false,
  position = 'top-right',
}) => {
  const [scale, setScale] = useState(1);
  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let animationFrameId;
    let timeoutId;

    animationFrameId = requestAnimationFrame(() => {
      setScale(1.2);
      timeoutId = setTimeout(() => setScale(1), 150);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [count]);

  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;

  const positionClasses = {
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  };

  const variantClasses = {
    default: 'bg-badge-default text-badge-text',
    urgent: 'bg-badge-urgent text-badge-text',
    dot: 'bg-badge-default p-1',
  };

  const baseClasses =
    'absolute flex items-center justify-center rounded-full text-xs font-bold transition-transform duration-150 ease-out';

  const badgeClasses = cn(
    baseClasses,
    variantClasses[variant],
    positionClasses[position],
    {
      'h-5 min-w-[20px] px-1.5': variant !== 'dot',
      'h-2 w-2': variant === 'dot',
      'animate-badge-pulse': pulse,
    }
  );

  return (
    <span
      className={badgeClasses}
      style={{ transform: `scale(${scale})` }}
      aria-label={variant === 'dot' ? 'New notification' : `${count} notifications`}
    >
      {variant !== 'dot' && displayCount}
    </span>
  );
};

NotificationBadge.propTypes = {
  count: PropTypes.number.isRequired,
  max: PropTypes.number,
  showZero: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'dot', 'urgent']),
  pulse: PropTypes.bool,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left']),
};

export default NotificationBadge;
