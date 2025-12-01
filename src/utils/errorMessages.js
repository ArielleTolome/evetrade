/**
 * Error message mapping utility
 * Converts API errors into user-friendly messages
 */

/**
 * HTTP status code to user-friendly message mapping
 */
const HTTP_STATUS_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Authentication required. Please log in again.',
  403: 'Access denied. You may have been temporarily blocked.',
  404: 'The requested resource could not be found. Please try again.',
  408: 'Request timed out. Please check your connection and try again.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'Server error. Our team has been notified. Please try again later.',
  502: 'Bad gateway. The server is temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again in a few moments.',
  504: 'Gateway timeout. The server took too long to respond. Please try again later.',
};

/**
 * Error type to user-friendly message mapping
 */
const ERROR_TYPE_MESSAGES = {
  network: 'Network connection failed. Please check your internet connection and try again.',
  timeout: 'Request timed out. Please check your connection and try again.',
  cors: 'Cross-origin request blocked. Please contact support if this persists.',
  parse: 'Unable to process server response. Please try again.',
  unknown: 'An unexpected error occurred. Please try again.',
};

/**
 * Determines the type of error
 * @param {Error} error - The error object
 * @returns {string} Error type
 */
function getErrorType(error) {
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'timeout';
    }
    if (error.message?.includes('Network Error')) {
      return 'network';
    }
    if (error.message?.includes('CORS')) {
      return 'cors';
    }
    return 'network';
  }
  return 'http';
}

/**
 * Transforms an API error into a user-friendly message
 * @param {Error} error - The error object from axios or fetch
 * @param {string} defaultMessage - Optional default message if no mapping exists
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(error, defaultMessage = null) {
  // Check if error has a response (HTTP error)
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    // Use server-provided message if it exists and is user-friendly
    if (serverMessage && typeof serverMessage === 'string' && serverMessage.length < 200) {
      return serverMessage;
    }

    // Use status code mapping
    if (HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status];
    }

    // Generic server error for unmapped 5xx errors
    if (status >= 500) {
      return HTTP_STATUS_MESSAGES[500];
    }

    // Generic client error for unmapped 4xx errors
    if (status >= 400) {
      return 'There was a problem with your request. Please try again.';
    }
  }

  // Handle non-HTTP errors (network, timeout, etc.)
  const errorType = getErrorType(error);
  if (errorType !== 'http' && ERROR_TYPE_MESSAGES[errorType]) {
    return ERROR_TYPE_MESSAGES[errorType];
  }

  // Use default message if provided
  if (defaultMessage) {
    return defaultMessage;
  }

  // Fallback to unknown error
  return ERROR_TYPE_MESSAGES.unknown;
}

/**
 * Formats an error for logging while returning user-friendly message
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred (e.g., 'fetchTrades')
 * @returns {object} Object with userMessage and logDetails
 */
export function formatError(error, context = '') {
  const userMessage = getUserFriendlyErrorMessage(error);

  const logDetails = {
    context,
    status: error.response?.status,
    statusText: error.response?.statusText,
    message: error.message,
    code: error.code,
    url: error.config?.url,
    method: error.config?.method,
  };

  return {
    userMessage,
    logDetails,
  };
}

/**
 * Check if an error is retryable
 * @param {Error} error - The error object
 * @returns {boolean} True if error is retryable
 */
export function isRetryableError(error) {
  // Network errors are retryable
  if (!error.response) {
    return true;
  }

  const status = error.response.status;

  // Rate limiting, server errors, and gateway errors are retryable
  return status === 429 || status >= 500;
}

export { HTTP_STATUS_MESSAGES, ERROR_TYPE_MESSAGES };
