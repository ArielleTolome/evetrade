import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 500)
 * @returns {any} The debounced value
 *
 * @example
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 300);
 *
 * // Use debouncedSearch for expensive operations
 * useEffect(() => {
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
