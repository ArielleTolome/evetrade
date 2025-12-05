import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Divider = ({
  orientation = 'horizontal',
  label,
  variant = 'solid',
  spacing = 'md',
  fade = false,
  className,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  // Spacing classes
  const spacingClasses = isHorizontal
    ? { sm: 'my-2', md: 'my-4', lg: 'my-8' }
    : { sm: 'mx-2', md: 'mx-4', lg: 'mx-8' };

  // Base line style
  const baseLineColor = 'border-[#415A77]/30';
  const lineStyleClasses = {
    solid: baseLineColor,
    dashed: `${baseLineColor} border-dashed`,
    dotted: `${baseLineColor} border-dotted`,
  };

  // --- Render with Label ---
  if (label) {
    const lineElement = (
      <div
        className={cn(
          'flex-grow',
          isHorizontal ? 'h-px' : 'w-px',
          !fade && (isHorizontal ? 'border-t' : 'border-l'),
          !fade && lineStyleClasses[variant]
        )}
      />
    );

    const firstLineFade = isHorizontal
      ? 'bg-gradient-to-r from-transparent to-[#415A77]/30'
      : 'bg-gradient-to-b from-transparent to-[#415A77]/30';

    const secondLineFade = isHorizontal
      ? 'bg-gradient-to-l from-transparent to-[#415A77]/30'
      : 'bg-gradient-to-t from-transparent to-[#415A77]/30';

    return (
      <div
        className={cn(
          'flex items-center whitespace-nowrap',
          isHorizontal ? 'flex-row' : 'flex-col',
          spacingClasses[spacing],
          className
        )}
        role="separator"
        aria-label={label}
        {...props}
      >
        {fade ? (
          <div className={cn(isHorizontal ? 'h-px' : 'w-px', 'flex-grow', firstLineFade)} />
        ) : (
          lineElement
        )}
        <span className={cn(isHorizontal ? 'mx-4' : 'my-4', 'text-sm text-[#778DA9]')}>{label}</span>
        {fade ? (
          <div className={cn(isHorizontal ? 'h-px' : 'w-px', 'flex-grow', secondLineFade)} />
        ) : (
          lineElement
        )}
      </div>
    );
  }

  // --- Render without Label ---
  if (isHorizontal) {
    if (fade) {
      return (
        <div
          className={cn(
            'h-px w-full',
            'bg-gradient-to-r from-transparent via-[#415A77]/30 to-transparent',
            spacingClasses[spacing],
            className
          )}
          role="separator"
          {...props}
        />
      );
    }
    // Use <hr> for semantic correctness when no label is present
    return (
      <hr
        className={cn('border-t', lineStyleClasses[variant], spacingClasses[spacing], className)}
        {...props}
      />
    );
  }

  // Vertical Divider
  if (fade) {
    return (
      <div
        className={cn(
          'inline-block h-full w-px self-stretch',
          'bg-gradient-to-b from-transparent via-[#415A77]/30 to-transparent',
          spacingClasses[spacing],
          className
        )}
        role="separator"
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'inline-block self-stretch border-l',
        lineStyleClasses[variant],
        spacingClasses[spacing],
        className
      )}
      role="separator"
      {...props}
    />
  );
};

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  label: PropTypes.string,
  variant: PropTypes.oneOf(['solid', 'dashed', 'dotted']),
  spacing: PropTypes.oneOf(['sm', 'md', 'lg']),
  fade: PropTypes.bool,
  className: PropTypes.string,
};

export { Divider };
export default Divider;
