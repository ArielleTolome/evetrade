import PropTypes from 'prop-types';
import SkeletonLoader from './SkeletonLoader';

/**
 * A skeleton loader component that mimics the structure of a list item.
 * It's designed to be used in place of list items while data is loading.
 *
 * @param {object} props - The component props.
 * @param {number} [props.count=1] - The number of list item skeletons to render.
 * @returns {JSX.Element} The rendered list item skeleton component.
 */
const ListItemSkeleton = ({ count }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <SkeletonLoader circular height={40} width={40} />
          <div className="flex-1 space-y-2">
            <SkeletonLoader height={16} width="75%" rounded />
            <SkeletonLoader height={12} width="50%" rounded />
          </div>
        </div>
      ))}
    </div>
  );
};

ListItemSkeleton.propTypes = {
  count: PropTypes.number,
};

ListItemSkeleton.defaultProps = {
  count: 1,
};

export default ListItemSkeleton;
