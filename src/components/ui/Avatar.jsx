import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

/**
 * Avatar Component
 * Displays a user's avatar with status, fallback, and sizing options.
 */
const Avatar = ({
  src,
  alt,
  size = 'md',
  status,
  fallback,
  bordered = false,
  className,
  ...props
}) => {
  const [imageStatus, setImageStatus] = useState('loading'); // loading, loaded, error

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on src change
    setImageStatus('loading');
  }, [src]);

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const statusClasses = {
    online: 'bg-[#00ff9d]',
    offline: 'bg-[#778DA9]',
    away: 'bg-[#ffd700]',
    busy: 'bg-[#d73000]',
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const showFallback = imageStatus === 'error' || !src;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center align-middle rounded-full transition-transform duration-200 ease-in-out hover:scale-105',
        sizeClasses[size],
        bordered && 'ring-2 ring-offset-2 ring-[#415A77] ring-offset-[#1B263B]',
        className
      )}
      {...props}
    >
      {showFallback ? (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center rounded-full font-semibold',
            'bg-[#1B263B] text-[#E0E1DD]'
          )}
        >
          {fallback?.slice(0, 2)}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="h-full w-full rounded-full object-cover"
        />
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-[#1B263B]',
            statusClasses[status],
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
