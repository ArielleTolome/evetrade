import { useToast } from './ToastProvider';

/**
 * Toast Demo Component
 * Demonstrates all features of the Toast notification system
 *
 * This is a demo/example component showing how to use the toast system.
 * You can import and use this component to test the toast functionality,
 * or reference it to see usage patterns.
 */
export function ToastDemo() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Trade completed successfully!', {
      duration: 5000,
    });
  };

  const handleError = () => {
    toast.error('Failed to fetch market data. Please try again.', {
      duration: 7000,
    });
  };

  const handleWarning = () => {
    toast.warning('Market price has changed significantly', {
      duration: 6000,
    });
  };

  const handleInfo = () => {
    toast.info('New market data available', {
      duration: 5000,
    });
  };

  const handleWithAction = () => {
    toast.info('Your trade order has been placed', {
      duration: 10000,
      action: {
        label: 'View Order',
        onClick: () => {
          console.log('View order clicked');
          alert('This would navigate to the order details page');
        },
      },
    });
  };

  const handleMultiple = () => {
    toast.success('First notification');
    setTimeout(() => toast.info('Second notification'), 500);
    setTimeout(() => toast.warning('Third notification'), 1000);
    setTimeout(() => toast.error('Fourth notification'), 1500);
    setTimeout(() => toast.success('Fifth notification'), 2000);
    setTimeout(() => toast.info('Sixth notification (queued)'), 2500);
    setTimeout(() => toast.warning('Seventh notification (queued)'), 3000);
  };

  const handleDismissAll = () => {
    toast.dismissAll();
  };

  const handleLongMessage = () => {
    toast.info(
      'This is a longer message to demonstrate how the toast handles text wrapping and longer content. The toast should expand to accommodate this content while maintaining its design.'
    );
  };

  const handleInfinite = () => {
    toast.warning('This toast will not auto-dismiss', {
      duration: Infinity,
    });
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Toast Notification Demo
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={handleSuccess}
          className="px-4 py-3 bg-accent-green text-space-black font-semibold rounded-lg hover:bg-accent-green/90 transition-colors"
        >
          Show Success Toast
        </button>

        <button
          onClick={handleError}
          className="px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
        >
          Show Error Toast
        </button>

        <button
          onClick={handleWarning}
          className="px-4 py-3 bg-accent-gold text-space-black font-semibold rounded-lg hover:bg-accent-gold/90 transition-colors"
        >
          Show Warning Toast
        </button>

        <button
          onClick={handleInfo}
          className="px-4 py-3 bg-accent-cyan text-space-black font-semibold rounded-lg hover:bg-accent-cyan/90 transition-colors"
        >
          Show Info Toast
        </button>

        <button
          onClick={handleWithAction}
          className="px-4 py-3 bg-accent-purple text-white font-semibold rounded-lg hover:bg-accent-purple/90 transition-colors"
        >
          Toast with Action
        </button>

        <button
          onClick={handleMultiple}
          className="px-4 py-3 bg-accent-pink text-white font-semibold rounded-lg hover:bg-accent-pink/90 transition-colors"
        >
          Show Multiple Toasts
        </button>

        <button
          onClick={handleLongMessage}
          className="px-4 py-3 bg-space-light text-text-primary font-semibold rounded-lg hover:bg-space-light/80 transition-colors border border-white/10"
        >
          Long Message Toast
        </button>

        <button
          onClick={handleInfinite}
          className="px-4 py-3 bg-space-light text-text-primary font-semibold rounded-lg hover:bg-space-light/80 transition-colors border border-white/10"
        >
          No Auto-Dismiss
        </button>

        <button
          onClick={handleDismissAll}
          className="px-4 py-3 bg-space-mid text-text-secondary font-semibold rounded-lg hover:bg-space-light transition-colors border border-white/10"
        >
          Dismiss All
        </button>
      </div>

      <div className="mt-8 p-4 bg-space-dark/60 rounded-lg border border-white/5">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Usage Example:
        </h3>
        <pre className="text-xs text-accent-cyan overflow-x-auto">
          {`import { useToast } from './components/common/ToastProvider';

function MyComponent() {
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await submitForm();
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form');
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}`}
        </pre>
      </div>
    </div>
  );
}

export default ToastDemo;
