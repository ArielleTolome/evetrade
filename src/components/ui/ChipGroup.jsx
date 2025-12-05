import React, { Children, cloneElement, isValidElement, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const ChipGroup = ({
  children,
  wrap = true,
  gap = 'gap-2',
  className,
  ...props
}) => {
  const chipRefs = useRef([]);

  useEffect(() => {
    chipRefs.current = chipRefs.current.slice(0, Children.count(children));
  }, [children]);

  const handleKeyDown = (e, index) => {
    let nextIndex;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % chipRefs.current.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + chipRefs.current.length) % chipRefs.current.length;
    }

    if (nextIndex !== undefined) {
      const nextChip = chipRefs.current[nextIndex];
      if (nextChip) {
        nextChip.focus();
      }
    }
  };

  return (
    <div
      className={cn(
        'flex',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        gap,
        className
      )}
      role="toolbar"
      aria-label="Chip group"
      {...props}
    >
      {/* eslint-disable-next-line react-hooks/refs -- callback ref pattern for managing child refs */}
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) {
          return null;
        }
        const originalOnKeyDown = child.props.onKeyDown;
        return cloneElement(child, {
          ref: (el) => (chipRefs.current[index] = el),
          onKeyDown: (e) => {
            handleKeyDown(e, index);
            if (originalOnKeyDown) {
              originalOnKeyDown(e);
            }
          },
        });
      })}
    </div>
  );
};

ChipGroup.propTypes = {
  children: PropTypes.node.isRequired,
  wrap: PropTypes.bool,
  gap: PropTypes.string,
  className: PropTypes.string,
};

export default ChipGroup;
