import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ScrollProgress = ({
  variant = 'bar',
  position = 'top',
  height = '4px',
  trackElement,
  color,
  showPercentage = false,
}) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const requestRef = useRef();
  const throttleTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableElement = trackElement?.current || document.scrollingElement || document.documentElement;

      const totalHeight = scrollableElement.scrollHeight - scrollableElement.clientHeight;
      if (totalHeight <= 0) {
        setScrollPercentage(0);
        return;
      }
      const progress = (scrollableElement.scrollTop / totalHeight) * 100;
      setScrollPercentage(progress);
    };

    handleScroll(); // Set initial scroll position

    const scrollHandler = () => {
      if (throttleTimeoutRef.current === null) {
        throttleTimeoutRef.current = setTimeout(() => {
          throttleTimeoutRef.current = null;
          requestRef.current = requestAnimationFrame(handleScroll);
        }, 100);
      }
    };

    const target = trackElement?.current || window;
    target.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      target.removeEventListener('scroll', scrollHandler);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [trackElement]);

  const progressBarStyles = {
    width: `${scrollPercentage}%`,
  };

  if (variant === 'bar') {
    return (
      <div
        className={`fixed w-full z-50 transition-opacity duration-300 ${
          position === 'top' ? 'top-0 left-0 right-0' : 'bottom-0 left-0 right-0'
        } ${scrollPercentage > 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ height }}
        role="progressbar"
        aria-valuenow={scrollPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className={`h-full ${!color ? 'bg-gradient-to-r from-[#415A77] to-[#778DA9]' : ''} relative`}
          style={{ ...progressBarStyles, backgroundColor: color }}
        >
          <div
            className="absolute right-0 top-0 h-full w-4"
            style={{
              boxShadow: `0 0 10px 2px ${color || '#415A77'}, 0 0 20px 4px ${color || '#415A77'}`,
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    const circleSize = '60px';
    const strokeWidth = 5;
    const radius = (60 - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (scrollPercentage / 100) * circumference;

    return (
      <div
        className={`fixed z-50 transition-opacity duration-300 ${position.includes('top') ? 'top-4' : 'bottom-4'} ${position.includes('left') ? 'left-4' : 'right-4'} ${scrollPercentage > 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: circleSize, height: circleSize }}
        role="progressbar"
        aria-valuenow={scrollPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#415A77" />
              <stop offset="100%" stopColor="#778DA9" />
            </linearGradient>
          </defs>
          <circle
            strokeWidth={strokeWidth}
            stroke="rgba(27, 38, 59, 0.3)"
            fill="transparent"
            r={radius}
            cx={30}
            cy={30}
          />
          <circle
            className="transition-all duration-200 ease-linear"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={color ? color : "url(#progressGradient)"}
            fill="transparent"
            r={radius}
            cx={30}
            cy={30}
            style={{ filter: `drop-shadow(0px 0px 5px ${color || '#415A77'})` }}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
            {Math.round(scrollPercentage)}%
          </div>
        )}
      </div>
    );
  }

    if (variant === 'line') {
    return (
      <div
        className={`fixed h-full z-50 transition-opacity duration-300 ${
          position === 'left' ? 'left-0 top-0 bottom-0' : 'right-0 top-0 bottom-0'
        } ${scrollPercentage > 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: height }}
        role="progressbar"
        aria-valuenow={scrollPercentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div className="relative w-full h-full">
          <div
            className={`absolute top-0 left-0 w-full ${!color ? 'bg-gradient-to-b from-[#415A77] to-[#778DA9]' : ''}`}
            style={{ height: `${scrollPercentage}%`, backgroundColor: color }}
          >
             <div
                className="absolute bottom-0 left-0 w-full h-4"
                style={{
                  boxShadow: `0 0 10px 2px ${color || '#415A77'}, 0 0 20px 4px ${color || '#415A77'}`,
                }}
              />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

ScrollProgress.propTypes = {
  variant: PropTypes.oneOf(['bar', 'circle', 'line']),
  position: PropTypes.string,
  height: PropTypes.string,
  trackElement: PropTypes.object,
  color: PropTypes.string,
  showPercentage: PropTypes.bool,
};

export default ScrollProgress;
