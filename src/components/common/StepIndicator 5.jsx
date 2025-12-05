import React from 'react';
import { Check, Circle } from 'lucide-react';
import PropTypes from 'prop-types';

const StepIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isClickable = onStepClick !== undefined;

        const statusClasses = {
          completed: 'text-accent-cyan border-accent-cyan',
          active: 'text-accent-cyan border-accent-cyan shadow-lg shadow-accent-cyan/20',
          upcoming: 'text-gray-500 border-gray-600',
        };

        let stepStatus = 'upcoming';
        if (isCompleted) stepStatus = 'completed';
        if (isActive) stepStatus = 'active';

        const stepClasses = `flex items-center space-x-4 transition-all duration-300 ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`;
        const iconContainerClasses = `flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${statusClasses[stepStatus]}`;
        const labelClasses = `font-medium transition-all duration-300 ${isActive ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`;
        const descriptionClasses = `text-sm transition-all duration-300 ${isActive ? 'text-gray-300' : 'text-gray-500'}`;

        return (
          <React.Fragment key={step.label}>
            {/* The Step itself */}
            <div className={stepClasses} onClick={() => isClickable && onStepClick(index)}>
              <div className={iconContainerClasses}>
                {isCompleted ? <Check size={20} /> : <Circle size={12} className={isActive ? 'animate-pulse' : ''} />}
              </div>
              <div>
                <p className={labelClasses}>{step.label}</p>
                {step.description && <p className={descriptionClasses}>{step.description}</p>}
              </div>
            </div>

            {/* Connectors */}
            {index < steps.length - 1 && (
              <>
                {/* Desktop Horizontal Connector */}
                <div className={`hidden sm:block flex-auto h-0.5 rounded mx-4 ${isCompleted ? 'bg-accent-cyan' : 'bg-gray-600'}`} />

                {/* Mobile Vertical Connector */}
                <div className={`sm:hidden h-8 w-0.5 rounded ml-4 my-2 ${isCompleted ? 'bg-accent-cyan' : 'bg-gray-600'}`} />
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

StepIndicator.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func,
};

export default StepIndicator;
