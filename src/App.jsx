import { RouterProvider } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { ResourceProvider } from './hooks/useResources';
import { ThemeProvider } from './contexts/ThemeContext';
import { EveAuthProvider } from './hooks/useEveAuth';
import { MultiCharacterProvider } from './hooks/useMultiCharacter';
import { ToastProvider } from './components/common/ToastProvider';
import { router } from './router';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import KeyboardShortcutsModal from './components/common/KeyboardShortcutsModal';
import { useModal } from './components/common/Modal';
import React, { useEffect } from 'react';

/**
 * Main App Component
 * Wrapped with Sentry error boundary for automatic error reporting
 */
function App() {
  const { isOpen, open, close } = useModal();

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (event.key === '?' && !isInputFocused) {
        event.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <KeyboardShortcutsModal isOpen={isOpen} onClose={close} />
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
          <ToastProvider>
            <EveAuthProvider>
              <MultiCharacterProvider>
                <ResourceProvider>
                  <RouterProvider router={router} />
                </ResourceProvider>
              </MultiCharacterProvider>
            </EveAuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </Sentry.ErrorBoundary>
    </>
  );
}

export default App;
