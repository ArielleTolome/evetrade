import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const statusClasses = {
  success: 'border-[#00ff9d]',
  warning: 'border-[#ffd700]',
  error: 'border-[#d73000]',
  info: 'border-[#415A77]',
};

const TimelineItem = React.forwardRef(
  ({ title, description, timestamp, icon: Icon, status = 'info', children, className, ...props }, forwardedRef) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCollapsible, setIsCollapsible] = useState(false);
    const descriptionRef = useRef(null);
    const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

    // Combine forwardedRef and internal ref
    useEffect(() => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(ref.current);
      } else if (forwardedRef) {
        forwardedRef.current = ref.current;
      }
    }, [forwardedRef, ref]);

    const content = description || children;

    useEffect(() => {
      if (descriptionRef.current) {
        setIsCollapsible(descriptionRef.current.scrollHeight > 50);
      }
    }, [content]);

    return (
      <div
        ref={ref}
        className={cn(
          'timeline-item relative flex flex-col transition-all duration-500 ease-out',
          isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
          className
        )}
        {...props}
      >
        <div className="flex items-start">
          <div className="absolute left-[-23px] top-0 flex h-full items-center">
            <div
              className={cn(
                'z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#1B263B] border-2',
                statusClasses[status]
              )}
            >
              {Icon ? (
                <Icon className="h-4 w-4 text-[#E0E1DD]" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-[#778DA9]" />
              )}
            </div>
          </div>
          <div className="ml-6 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-[#E0E1DD]">{title}</h4>
              <time className="text-xs text-[#778DA9]">{timestamp}</time>
            </div>
            {content && (
              <div className="mt-2 text-sm text-gray-400">
                <div
                  ref={descriptionRef}
                  className={cn('overflow-hidden transition-all duration-300 ease-in-out', {
                    'max-h-12': !isExpanded && isCollapsible,
                    'max-h-screen': isExpanded || !isCollapsible,
                  })}
                >
                  {content}
                </div>
                {isCollapsible && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-xs text-[#778DA9] hover:text-[#E0E1DD] flex items-center"
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                    <ChevronDown
                      className={cn('ml-1 h-3 w-3 transition-transform duration-200', {
                        'rotate-180': isExpanded,
                      })}
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TimelineItem.displayName = 'TimelineItem';

TimelineItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  timestamp: PropTypes.string,
  icon: PropTypes.elementType,
  status: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  className: PropTypes.string,
};

export { TimelineItem };
