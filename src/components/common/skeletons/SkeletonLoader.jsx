import PropTypes from 'prop-types';
import { cn } from '../../../lib/utils';

/**
 * A configurable skeleton loader component with a shimmer effect.
 * This component serves as a base for creating more complex skeleton structures.
 * It respects the 'prefers-reduced-motion' media query to disable animation.
 *
 * @param {object} props - The component props.
 * @param {string|number} [props.width] - The width of the skeleton loader.
 * @param {string|number} [props.height] - The height of the skeleton loader.
 * @param {boolean} [props.rounded=false] - If true, applies medium rounded corners.
 * @param {boolean} [props.circular=false] - If true, renders the skeleton as a circle.
 * @param {string} [props.className] - Additional CSS classes for customization.
 * @returns {JSX.Element} The rendered skeleton loader component.
 */
const SkeletonLoader = ({ width, height, rounded, circular, className }) => {
  const style = {
    width: width,
    height: height,
  };

  const classes = cn(
    'bg-[#1B263B]',
    'relative',
    'overflow-hidden',
    {
      'rounded-md': rounded,
      'rounded-full': circular,
    },
    className
  );

  return (
    <div className={classes} style={style}>
      <div
        className={cn(
          'absolute',
          'inset-0',
          'bg-gradient-to-r',
          'from-transparent',
          'via-[#415A77]/50',
          'to-transparent',
          'motion-safe:animate-shimmer'
        )}
      />
    </div>
  );
};

SkeletonLoader.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rounded: PropTypes.bool,
  circular: PropTypes.bool,
  className: PropTypes.string,
};

export default SkeletonLoader;
