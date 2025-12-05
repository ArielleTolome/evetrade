import { useEffect, useRef } from 'react';

/**
 * Mobile Form Layout Component
 */
export const MobileFormLayout = ({
  children,
  onSubmit,
  submitText = 'Submit',
  isSubmitDisabled = false,
  isSubmitting = false,
  currentStep,
  totalSteps,
}) => {
  const formRef = useRef(null);

  useEffect(() => {
    const handleFocus = (event) => {
      if (formRef.current && formRef.current.contains(event.target)) {
        event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    window.addEventListener('focusin', handleFocus);
    return () => {
      window.removeEventListener('focusin', handleFocus);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {totalSteps > 1 && (
        <div className="w-full bg-space-dark/50 h-2 rounded-full mb-4">
          <div
            className="bg-accent-cyan h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
        className="flex-grow space-y-4"
      >
        {children}
      </form>
      <div className="sticky bottom-0 bg-space-dark py-4">
        <button
          type="submit"
          disabled={isSubmitDisabled || isSubmitting}
          className="w-full px-4 py-3 text-white bg-accent-cyan rounded-lg font-semibold
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-cyan
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200"
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
      </div>
    </div>
  );
};

export default MobileFormLayout;
