import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Timeline = React.forwardRef(({ children, variant = 'default', className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative pl-6 before:absolute before:left-[11px] before:top-0 before:h-full before:w-0.5 before:bg-[#415A77]',
        {
          'space-y-8': variant === 'default',
          'space-y-4': variant === 'compact',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Timeline.displayName = 'Timeline';

Timeline.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'compact']),
  className: PropTypes.string,
};

export { Timeline };
