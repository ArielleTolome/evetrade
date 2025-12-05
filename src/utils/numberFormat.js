/**
 * Checks if a value is a valid, displayable number.
 * @param {*} value The value to check.
 * @returns {string} "valid" if the value is a valid number, otherwise a string indicating the type of invalidity.
 */
function getNumberValidationState(value) {
  if (value === null || value === undefined) {
    return 'not-provided';
  }
  if (isNaN(value)) {
    return 'not-a-number';
  }
  if (!isFinite(value)) {
    return 'infinite';
  }
  return 'valid';
}

/**
 * Handles invalid number states, returning the appropriate placeholder.
 * @param {*} value The value to check.
 * @returns {string|null} The placeholder string if invalid, otherwise null.
 */
function handleInvalidNumber(value) {
    const state = getNumberValidationState(value);
    switch (state) {
        case 'not-provided':
            return 'N/A';
        case 'not-a-number':
            return 'Invalid';
        case 'infinite':
            return value > 0 ? '∞' : '-∞';
        case 'valid':
        default:
            return null;
    }
}


/**
 * Formats a number as ISK currency.
 * @param {number} value The number to format.
 * @param {boolean} [compact=false] - Whether to use compact notation (K, M, B, T).
 * @param {number} [decimals=2] - The number of decimal places.
 * @returns {string} The formatted ISK string.
 */
export function formatISK(value, compact = false, decimals = 2) {
  const invalidPlaceholder = handleInvalidNumber(value);
  if (invalidPlaceholder) return invalidPlaceholder;

  if (compact) {
    return formatCompact(value, decimals);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a number with locale-aware thousand separators.
 * @param {number} value The number to format.
 * @param {number} [decimals=2] The number of decimal places.
 * @returns {string} The formatted number string.
 */
export function formatNumber(value, decimals = 2) {
  const invalidPlaceholder = handleInvalidNumber(value);
  if (invalidPlaceholder) return invalidPlaceholder;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a number as a percentage.
 * @param {number} value The number to format (e.g., 0.1234 for 12.34%).
 * @param {number} [decimals=2] The number of decimal places.
 * @param {boolean} [showSign=false] Whether to show a '+' for positive numbers.
 * @returns {string} The formatted percentage string.
 */
export function formatPercent(value, decimals = 2, showSign = false) {
  const invalidPlaceholder = handleInvalidNumber(value);
  if (invalidPlaceholder) return invalidPlaceholder;

  const options = {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };
  if (showSign) {
    options.signDisplay = 'exceptZero';
  }
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Formats a number into a compact, abbreviated format (K, M, B, T).
 * @param {number} value The number to format.
 * @param {number} [decimals=2] The number of decimal places for the compact form.
 * @returns {string} The compact number string.
 */
export function formatCompact(value, decimals = 2) {
  const invalidPlaceholder = handleInvalidNumber(value);
  if (invalidPlaceholder) return invalidPlaceholder;

  const absValue = Math.abs(value);
  // Intl.NumberFormat with compact notation is great for this.
  if (absValue < 1000) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    }).format(value);
  }

  const options = {
    notation: 'compact',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Checks if a value is a valid, displayable number.
 * Excludes NaN, Infinity, and -Infinity.
 * @param {*} value The value to check.
 * @returns {boolean} True if the value is a valid number.
 */
export function isValidNumber(value) {
    return getNumberValidationState(value) === 'valid';
}
