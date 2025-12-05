import { useState, useCallback, useRef, useEffect } from 'react';
import * as Sentry from '@sentry/react';

/**
 * Generic API call hook with request cancellation support
 * @param {Function} apiFunction - The API function to call
 * @returns {object} State and execute function
 */
export function useApiCall(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortControllerRef = useRef(null);

  // Cleanup: abort any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (params) => {
      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);

      try {
        // Pass the abort signal to the API function
        const result = await apiFunction(params, abortController.signal);

        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setData(result);
          setLastUpdated(new Date());
        }
        return result;
      } catch (_err) {
        // Don't set error state for intentional aborts
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          console.log('Request cancelled');
          return null;
        }

        // Report API errors to Sentry
        Sentry.withScope((scope) => {
          scope.setTag('errorType', 'useApiCall');
          scope.setExtra('apiFunction', apiFunction.name || 'anonymous');
          scope.setExtra('params', params);
          Sentry.captureException(err);
        });

        const errorMessage = err.message || 'An error occurred';
        if (!abortController.signal.aborted) {
          setError({ message: errorMessage, original: err });
        }
        throw err;
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLastUpdated(null);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    execute,
    reset,
    cancel,
  };
}
