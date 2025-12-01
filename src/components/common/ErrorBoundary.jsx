import { Component } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Error Boundary Component
 * Catches React errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Reset error state and attempt recovery
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-space-black via-space-dark to-space-black">
          <GlassmorphicCard className="max-w-2xl w-full">
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-text-primary mb-4">
                {this.props.title || 'Something went wrong'}
              </h1>

              <p className="text-text-secondary mb-6">
                {this.props.message ||
                  'An unexpected error occurred. Please try reloading the page or contact support if the problem persists.'}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left bg-space-black/50 rounded-lg p-4 border border-red-500/20">
                  <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs text-text-secondary font-mono">
                    <p className="text-red-400 mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="overflow-auto max-h-60 text-text-secondary">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-accent-cyan hover:bg-accent-cyan/80 text-space-black font-semibold rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-space-dark border border-accent-cyan/30 hover:border-accent-cyan/60 text-text-primary font-semibold rounded-lg transition-colors duration-200"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Resource Error Fallback Component
 * Specific fallback UI for resource loading errors
 */
export function ResourceErrorFallback({ error, resetError, loadingProgress }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-space-black via-space-dark to-space-black">
      <GlassmorphicCard className="max-w-2xl w-full">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Failed to Load Resources
          </h1>

          <p className="text-text-secondary mb-6">
            Unable to load required game data. This could be due to network
            issues or server problems.
          </p>

          {loadingProgress && (
            <div className="mb-6 text-text-secondary">
              <p className="text-sm">
                Loaded {loadingProgress.current} of {loadingProgress.total}{' '}
                resources before error occurred
              </p>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 text-left bg-space-black/50 rounded-lg p-4 border border-red-500/20">
              <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                Error Details (Development Only)
              </summary>
              <div className="text-xs text-text-secondary font-mono">
                <p className="text-red-400">{error.toString()}</p>
                {error.stack && (
                  <pre className="overflow-auto max-h-60 mt-2 text-text-secondary">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetError}
              className="px-6 py-3 bg-accent-cyan hover:bg-accent-cyan/80 text-space-black font-semibold rounded-lg transition-colors duration-200"
            >
              Retry Loading
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-space-dark border border-accent-cyan/30 hover:border-accent-cyan/60 text-text-primary font-semibold rounded-lg transition-colors duration-200"
            >
              Reload Page
            </button>
          </div>

          <div className="mt-6 text-sm text-text-secondary">
            <p>
              If this problem persists, please check your internet connection or
              try again later.
            </p>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

export default ErrorBoundary;
