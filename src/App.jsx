import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { ResourceProvider } from './hooks/useResources';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { EveAuthProvider } from './hooks/useEveAuth';
import { MultiCharacterProvider } from './hooks/useMultiCharacter';
import { ToastProvider } from './components/common/ToastProvider';
import { router } from './router';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import KeyboardShortcuts from './components/common/KeyboardShortcuts';

/**
 * Main App Component
 * Wrapped with Sentry error boundary for automatic error reporting
 */
function App() {
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Placeholder for global search modal functionality
  const toggleSearchModal = () => {
    console.log('Toggling search modal...');
  };

  const toggleShortcutsModal = () => {
    setIsShortcutsModalOpen((prev) => !prev);
  };

  useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal);

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorBoundary>
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-space-black via-space-dark to-space-black">
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="mb-4 text-text-secondary">{error?.message || 'An unexpected error occurred'}</p>
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
      <AccessibilityProvider>
        <ThemeProvider>
          <ToastProvider>
            <EveAuthProvider>
            <MultiCharacterProvider>
              <ResourceProvider>
                <RouterProvider router={router} />
                <KeyboardShortcuts isOpen={isShortcutsModalOpen} onClose={toggleShortcutsModal} />
              </ResourceProvider>
            </MultiCharacterProvider>
          </EveAuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </AccessibilityProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
