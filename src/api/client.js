import axios from 'axios';
import * as Sentry from '@sentry/react';
import { getApiEndpoint, RESOURCE_ENDPOINT } from '../utils/constants';
import { isSupabaseConfigured, fetchFromSupabase } from '../lib/supabase';
import { registry as circuitBreakerRegistry, CircuitBreakerError } from '../utils/circuitBreaker';

/**
 * Create axios instance with custom configuration
 */
const apiClient = axios.create({
  baseURL: getApiEndpoint(),
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create resource client for S3 resources (fallback)
 */
const resourceClient = axios.create({
  baseURL: RESOURCE_ENDPOINT,
  timeout: 30000,
});

/**
 * Extracts a descriptive name for a circuit from a URL path.
 * e.g., /v1/markets/10000002/orders/ -> v1:markets:orders
 * @param {string} url - The URL to parse.
 * @returns {string} A circuit name.
 */
function getCircuitNameFromUrl(url) {
  if (!url) return 'default';
  try {
    // Use a simple regex to avoid full URL parsing for relative paths
    const path = url.split('?')[0];
    const parts = path.split('/').filter(p => p && !/^\d+$/.test(p) && p !== 'api');
    return parts.length > 0 ? parts.join(':') : 'default';
  } catch (e) {
    return 'default';
  }
}

/**
 * Request Interceptor: Checks if the circuit allows the request.
 */
apiClient.interceptors.request.use(
  (config) => {
    const circuitName = getCircuitNameFromUrl(config.url);
    const circuit = circuitBreakerRegistry.getCircuit(circuitName);

    if (!circuit.isRequestAllowed()) {
      throw new CircuitBreakerError(`Circuit breaker ${circuitName} is OPEN`);
    }

    // Attach circuit to config for the response interceptor
    config.circuit = circuit;
    return config;
  },
  (error) => {
    // Errors in request setup are rare, but we should reject them.
    return Promise.reject(error);
  }
);


/**
 * Response Interceptor: Records success or failure on the circuit.
 */
apiClient.interceptors.response.use(
  (response) => {
    // A successful response (2xx) is recorded on the circuit.
    if (response.config.circuit) {
      response.config.circuit.recordSuccess();
    }
    return response;
  },
  (error) => {
    // Don't record client-side cancellations as failures
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    // Record the failure on the circuit.
    if (error.config?.circuit) {
      error.config.circuit.recordFailure(error);
    }

    // Sentry reporting for non-circuit-breaker errors
    if (error.name !== 'CircuitBreakerError') {
       Sentry.withScope((scope) => {
        scope.setTag('errorType', 'apiError');
        scope.setExtra('url', error.config?.url);
        scope.setExtra('method', error.config?.method);
        scope.setExtra('status', error.response?.status);
        Sentry.captureException(error);
      });
    }

    return Promise.reject(error);
  }
);


/**
 * Fetch data using the API client.
 * The circuit breaker is applied automatically by the interceptor.
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options (can include signal for abort)
 * @returns {Promise} Response data
 */
export async function fetchData(url, options = {}) {
  try {
    const response = await apiClient.get(url, options);
    return response.data;
  } catch (error) {
    if (error.name === 'CircuitBreakerError') {
      console.warn(error.message);
    }

    if (error.response) {
      throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
    }
    throw error;
  }
}

/**
 * Fetch resource from Supabase (primary) or S3 (fallback)
 * @param {string} filename - Resource filename (without .json extension)
 * @returns {Promise} Resource data
 */
export async function fetchResource(filename) {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
    try {
      const data = await fetchFromSupabase(filename);
      return data;
    } catch (error) {
      console.warn(`Supabase fetch failed for ${filename}, falling back to S3:`, error.message);
    }
  }

  // Fallback to S3
  try {
    const response = await resourceClient.get(`${filename}.json`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch resource: ${filename}`, error);

    // Report resource loading failures to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('errorType', 'resourceLoading');
      scope.setExtra('filename', filename);
      scope.setExtra('source', 's3Fallback');
      Sentry.captureException(error);
    });

    throw error;
  }
}

export { apiClient, resourceClient };
