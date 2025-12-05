import PropTypes from 'prop-types';
import SkeletonLoader from './SkeletonLoader';

/**
 * A skeleton loader component that mimics the structure of a form.
 * It's designed to be used in place of forms while data is loading.
 *
 * @param {object} props - The component props.
 * @param {number} [props.count=1] - The number of form field skeletons to render.
 * @returns {JSX.Element} The rendered form skeleton component.
 */
const FormSkeleton = ({ count }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonLoader height={16} width="25%" rounded />
          <SkeletonLoader height={40} width="100%" rounded />
        </div>
      ))}
    </div>
  );
};

FormSkeleton.propTypes = {
  count: PropTypes.number,
};

FormSkeleton.defaultProps = {
  count: 1,
};

export default FormSkeleton;
