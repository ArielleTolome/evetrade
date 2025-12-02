import { RouterProvider } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { ResourceProvider } from './hooks/useResources';
import { ThemeProvider } from './store/ThemeContext';
import { EveAuthProvider } from './hooks/useEveAuth';
import { router } from './router';
import { ErrorBoundary } from './components/common/ErrorBoundary';

/**
 * Main App Component
 * Wrapped with Sentry error boundary for automatic error reporting
 */
function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorBoundary>
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-space-black via-space-dark to-space-black">
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="mb-4 text-gray-400">{error?.message || 'An unexpected error occurred'}</p>
              <button
                onClick={resetError}
                className="px-6 py-3 bg-accent-cyan hover:bg-accent-cyan/80 text-space-black font-semibold rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </ErrorBoundary>
      )}
      onError={(error, componentStack) => {
        console.error('Sentry caught error:', error, componentStack);
      }}
    >
      <ThemeProvider>
        <EveAuthProvider>
          <ResourceProvider>
            <RouterProvider router={router} />
          </ResourceProvider>
        </EveAuthProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
