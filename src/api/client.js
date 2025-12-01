import axios from 'axios';
import { getApiEndpoint, RESOURCE_ENDPOINT } from '@utils/constants';
import { isSupabaseConfigured, fetchFromSupabase } from '@lib/supabase';

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
 * Calculate delay with exponential backoff
 * @param {number} retryCount - Current retry attempt
 * @returns {number} Delay in milliseconds
 */
function getRetryDelay(retryCount) {
  return Math.min(1000 * Math.pow(2, retryCount), 30000);
}

/**
 * Sleep for specified duration
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Response interceptor for retry logic
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Initialize retry count
    if (!config._retryCount) {
      config._retryCount = 0;
    }

    // Handle specific error codes
    const status = error.response?.status;

    // Rate limiting - retry with backoff
    if (status === 429 && config._retryCount < 3) {
      config._retryCount++;
      const delay = getRetryDelay(config._retryCount);
      console.log(`Rate limited. Retrying in ${delay}ms (attempt ${config._retryCount}/3)`);
      await sleep(delay);
      return apiClient(config);
    }

    // Auth errors
    if (status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }

    // Forbidden
    if (status === 403) {
      throw new Error('Access denied. You may have been temporarily blocked.');
    }

    // Server errors - retry
    if (status >= 500 && config._retryCount < 2) {
      config._retryCount++;
      const delay = getRetryDelay(config._retryCount);
      console.log(`Server error. Retrying in ${delay}ms (attempt ${config._retryCount}/2)`);
      await sleep(delay);
      return apiClient(config);
    }

    // Network errors - retry
    if (!error.response && config._retryCount < 2) {
      config._retryCount++;
      const delay = getRetryDelay(config._retryCount);
      console.log(`Network error. Retrying in ${delay}ms (attempt ${config._retryCount}/2)`);
      await sleep(delay);
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

/**
 * Fetch with retry wrapper
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise} Response data
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  try {
    const response = await apiClient.get(url, options);
    return response.data;
  } catch (error) {
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
    throw error;
  }
}

export { apiClient, resourceClient };
