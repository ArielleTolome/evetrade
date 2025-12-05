import PropTypes from 'prop-types';
import SkeletonLoader from './SkeletonLoader';

/**
 * A skeleton loader component that mimics the structure of a table row.
 * It's designed to be used in place of table rows while data is loading.
 *
 * @param {object} props - The component props.
 * @param {number} [props.count=1] - The number of table row skeletons to render.
 * @returns {JSX.Element} The rendered table row skeleton component.
 */
const TableRowSkeleton = ({ count }) => {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="flex items-center space-x-4 p-4">
      <SkeletonLoader circular height={40} width={40} />
      <div className="flex-1 space-y-2">
        <SkeletonLoader height={16} width="75%" rounded />
        <SkeletonLoader height={12} width="50%" rounded />
      </div>
      <SkeletonLoader height={24} width="15%" rounded />
      <SkeletonLoader height={24} width="10%" rounded />
    </div>
  ));
};

TableRowSkeleton.propTypes = {
  count: PropTypes.number,
};

TableRowSkeleton.defaultProps = {
  count: 1,
};

export default TableRowSkeleton;
