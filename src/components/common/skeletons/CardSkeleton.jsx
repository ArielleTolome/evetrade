import PropTypes from 'prop-types';
import SkeletonLoader from './SkeletonLoader';

/**
 * A skeleton loader component that mimics the structure of a card.
 * It's designed to be used in place of cards while data is loading.
 *
 * @param {object} props - The component props.
 * @param {string} [props.variant='stat'] - The variant of the card skeleton to render.
 * @returns {JSX.Element} The rendered card skeleton component.
 */
const CardSkeleton = ({ variant }) => {
  if (variant === 'stat') {
    return (
      <div className="bg-background p-4 rounded-lg space-y-2">
        <SkeletonLoader height={16} width="50%" rounded />
        <SkeletonLoader height={24} width="75%" rounded />
        <SkeletonLoader height={12} width="25%" rounded />
      </div>
    );
  }

  return (
    <div className="bg-background p-4 rounded-lg space-y-4">
      <SkeletonLoader height={150} width="100%" rounded />
      <div className="space-y-2">
        <SkeletonLoader height={20} width="80%" rounded />
        <SkeletonLoader height={16} width="60%" rounded />
      </div>
    </div>
  );
};

CardSkeleton.propTypes = {
  variant: PropTypes.string,
};

CardSkeleton.defaultProps = {
  variant: 'stat',
};

export default CardSkeleton;
