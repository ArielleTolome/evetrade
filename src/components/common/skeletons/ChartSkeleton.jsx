import PropTypes from 'prop-types';
import SkeletonLoader from './SkeletonLoader';

/**
 * A skeleton loader component that mimics the structure of a chart.
 * It's designed to be used in place of charts while data is loading.
 *
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered chart skeleton component.
 */
const ChartSkeleton = () => {
  return (
    <div className="bg-background p-4 rounded-lg">
      <SkeletonLoader height={200} width="100%" rounded />
      <div className="flex justify-between mt-4">
        <SkeletonLoader height={16} width="15%" rounded />
        <SkeletonLoader height={16} width="15%" rounded />
        <SkeletonLoader height={16} width="15%" rounded />
        <SkeletonLoader height={16} width="15%" rounded />
      </div>
    </div>
  );
};

export default ChartSkeleton;
