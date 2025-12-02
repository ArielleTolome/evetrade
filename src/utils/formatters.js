/**
 * Format a number with locale-specific separators
 * @description Converts a numeric value to a locale-formatted string with thousands
 * separators and fixed decimal places. Uses US English formatting (commas for thousands).
 * Handles edge cases like null, undefined, and NaN by returning '0'.
 * @param {number|null|undefined} value - The number to format
 * @param {number} [decimals=2] - Number of decimal places to display
 * @returns {string} Formatted number string with locale-specific separators
 * @example
 * formatNumber(1234567.89)
 * // returns '1,234,567.89'
 * @example
 * formatNumber(42, 0)
 * // returns '42'
 * @example
 * formatNumber(null)
 * // returns '0'
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format ISK (EVE Online currency) with appropriate suffix
 * @description Formats ISK amounts using metric suffixes (K, M, B, T) for large values.
 * Automatically scales the number and appends the appropriate suffix. Values under
 * 1,000 are displayed with full precision.
 * - T (Trillion): >= 1,000,000,000,000
 * - B (Billion): >= 1,000,000,000
 * - M (Million): >= 1,000,000
 * - K (Thousand): >= 1,000
 * @param {number|null|undefined} value - The ISK amount to format
 * @param {boolean} [showSuffix=true] - Whether to append ' ISK' to the result
 * @returns {string} Formatted ISK string with metric suffix
 * @example
 * formatISK(1234567890)
 * // returns '1.23B ISK'
 * @example
 * formatISK(5500000, false)
 * // returns '5.50M'
 * @example
 * formatISK(999)
 * // returns '999.00 ISK'
 * @example
 * formatISK(1500000000000)
 * // returns '1.50T ISK'
 */
export function formatISK(value, showSuffix = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return showSuffix ? '0 ISK' : '0';
  }

  const absValue = Math.abs(value);
  let formatted;

  if (absValue >= 1_000_000_000_000) {
    formatted = (value / 1_000_000_000_000).toFixed(2) + 'T';
  } else if (absValue >= 1_000_000_000) {
    formatted = (value / 1_000_000_000).toFixed(2) + 'B';
  } else if (absValue >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(2) + 'M';
  } else if (absValue >= 1_000) {
    formatted = (value / 1_000).toFixed(2) + 'K';
  } else {
    formatted = formatNumber(value, 2);
  }

  return showSuffix ? `${formatted} ISK` : formatted;
}

/**
 * Format volume in cubic meters
 * @description Formats volume values with the m³ (cubic meters) unit suffix.
 * Used for displaying cargo capacity and item volumes in EVE Online.
 * @param {number|null|undefined} value - The volume in cubic meters
 * @returns {string} Formatted volume string with m³ suffix
 * @example
 * formatVolume(1500.5)
 * // returns '1,500.50 m³'
 * @example
 * formatVolume(0)
 * // returns '0.00 m³'
 */
export function formatVolume(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 m³';
  }
  return `${formatNumber(value, 2)} m³`;
}

/**
 * Format percentage values
 * @description Converts a decimal value to a percentage string. Expects input as
 * a decimal (e.g., 0.15 for 15%, 1.0 for 100%). Commonly used for margin calculations,
 * tax rates, and profit percentages.
 * @param {number|null|undefined} value - The decimal value to convert (0.15 = 15%)
 * @param {number} [decimals=1] - Number of decimal places in the percentage
 * @returns {string} Formatted percentage string with % symbol
 * @example
 * formatPercent(0.15)
 * // returns '15.0%'
 * @example
 * formatPercent(0.08525, 2)
 * // returns '8.53%'
 * @example
 * formatPercent(1.0)
 * // returns '100.0%'
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format large numbers compactly
 * @description Similar to formatISK but without the 'ISK' suffix and with different
 * precision rules. Used for displaying large numeric values like trade volumes or
 * item quantities in a compact format. Uses 1 decimal place for scaled values,
 * 0 decimals for unscaled values.
 * @param {number|null|undefined} value - The number to format compactly
 * @returns {string} Compact number string with metric suffix (K, M, or B)
 * @example
 * formatCompact(1234567)
 * // returns '1.2M'
 * @example
 * formatCompact(5432)
 * // returns '5.4K'
 * @example
 * formatCompact(999)
 * // returns '999'
 * @example
 * formatCompact(3500000000)
 * // returns '3.5B'
 */
export function formatCompact(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B';
  } else if (absValue >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  } else if (absValue >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }

  return formatNumber(value, 0);
}

/**
 * Capitalize first letter of a string
 * @description Converts the first character of a string to uppercase while leaving
 * the rest unchanged. Useful for normalizing user input or formatting labels.
 * @param {string|null|undefined} str - The string to capitalize
 * @returns {string} String with first letter capitalized, or empty string if input is falsy
 * @example
 * capitalize('hello world')
 * // returns 'Hello world'
 * @example
 * capitalize('SHOUTING')
 * // returns 'SHOUTING'
 * @example
 * capitalize('')
 * // returns ''
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format time duration in human-readable format
 * @description Converts a duration in seconds to a human-friendly string representation.
 * Automatically selects the appropriate time units based on the duration:
 * - Less than 60s: "Xs"
 * - Less than 1 hour: "Xm Ys"
 * - 1 hour or more: "Xh Ym"
 * Useful for displaying route times, skill training durations, or cache expiry times.
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 * @example
 * formatDuration(45)
 * // returns '45s'
 * @example
 * formatDuration(125)
 * // returns '2m 5s'
 * @example
 * formatDuration(7265)
 * // returns '2h 1m'
 */
export function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

/**
 * Format a date relative to now
 * @description Converts a date to a relative time string (e.g., "2h ago", "3d ago").
 * Automatically selects the appropriate time unit based on how much time has passed.
 * Useful for displaying when market data was last updated or when a trade was executed.
 * @param {Date|string|number} date - The date to format (can be Date object, ISO string, or timestamp)
 * @returns {string} Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000))
 * // returns '2h ago'
 * @example
 * formatRelativeTime(new Date(Date.now() - 30 * 1000))
 * // returns 'Just now'
 * @example
 * formatRelativeTime('2024-01-15T10:00:00Z')
 * // returns '5d ago' (if current date is 2024-01-20)
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format a date and time in a readable format
 * @description Converts a date to a localized date and time string.
 * Useful for displaying timestamps on alerts, orders, and history items.
 * @param {Date|string|number} date - The date to format (can be Date object, ISO string, or timestamp)
 * @returns {string} Formatted date and time string
 * @example
 * formatDateTime('2024-01-15T10:30:00Z')
 * // returns '1/15/2024, 10:30 AM'
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'Invalid date';
  }
}
