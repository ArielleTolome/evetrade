
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

const AccordionItem = forwardRef(
  (
    { id, title, content, icon, disabled, isOpen, onToggle, variant },
    ref
  ) => {
    const handleToggle = () => {
      if (!disabled) {
        onToggle(id);
      }
    };

    const variantClasses = {
      default: 'border-b border-white/10',
      card: 'mb-2 rounded-lg bg-space-dark/50 backdrop-blur-sm border border-white/10 shadow-lg',
      flush: '',
    };

    return (
      <div className={variantClasses[variant]}>
        <h3>
          <button
            ref={ref}
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls={`accordion-content-${id}`}
            id={`accordion-header-${id}`}
            disabled={disabled}
          className="flex items-center justify-between w-full p-4 text-left text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <span className="font-medium">{title}</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </button>
        </h3>
        <div
          id={`accordion-content-${id}`}
          role="region"
          aria-labelledby={`accordion-header-${id}`}
          className={`transition-all duration-200 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-screen' : 'max-h-0'
          }`}
        >
          <div className="p-4 text-gray-300">{content}</div>
        </div>
      </div>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';

AccordionItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'card', 'flush']),
};

export default AccordionItem;
