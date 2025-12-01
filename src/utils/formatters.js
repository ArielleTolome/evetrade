/**
 * Format a number with locale-specific separators
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
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
 * @param {number} value - The ISK amount
 * @param {boolean} showSuffix - Whether to show 'ISK' suffix
 * @returns {string} Formatted ISK string
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
 * Format volume (m³)
 * @param {number} value - The volume in cubic meters
 * @returns {string} Formatted volume string
 */
export function formatVolume(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 m³';
  }
  return `${formatNumber(value, 2)} m³`;
}

/**
 * Format percentage
 * @param {number} value - The decimal value (e.g., 0.15 for 15%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format large numbers compactly
 * @param {number} value - The number to format
 * @returns {string} Compact number string
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
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format time duration in human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
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
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
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
