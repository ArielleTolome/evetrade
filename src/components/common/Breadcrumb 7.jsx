import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ items }) => {
  const allItems = [{ label: 'Home', path: '/' }, ...(items || [])];
  const totalItems = allItems.length;

  return (
    <nav className="flex items-center text-sm text-gray-400" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === totalItems - 1;

          const link = isLast ? (
            <span className="ml-1 font-medium text-accent-cyan md:ml-2">{item.label}</span>
          ) : (
            <Link to={item.path} className="ml-1 text-gray-400 hover:text-accent-cyan md:ml-2">
              {item.label}
            </Link>
          );

          let visibilityClass = '';
          if (totalItems > 3 && index > 0 && index < totalItems - 1) {
            visibilityClass = 'hidden sm:inline-flex';
          }

          return (
            <React.Fragment key={index}>
              {totalItems > 3 && index === 1 && (
                <li className="inline-flex items-center sm:hidden">
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <span>...</span>
                </li>
              )}
              <li className={`inline-flex items-center ${visibilityClass}`}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-500" />}
                {link}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    })
  ),
};

Breadcrumb.defaultProps = {
    items: [],
};

export { Breadcrumb };
export default Breadcrumb;
