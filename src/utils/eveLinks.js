/**
 * EVE Online Deep Links Utility
 * Provides functions for generating and opening EVE Online deep links (eve:// protocol)
 * @module eveLinks
 */

/**
 * Opens market details for an item in the EVE Online client
 * @param {number} typeId - The EVE type ID of the item
 * @returns {string} The EVE deep link URL
 * @example
 * openMarketDetails(34) // Opens Tritanium market details
 */
export function openMarketDetails(typeId) {
  if (!typeId || typeof typeId !== 'number') {
    throw new Error('Invalid typeId: must be a number');
  }

  const url = `eve://market/showMarketDetails/?typeid=${typeId}`;

  // Try to open the link
  try {
    window.location.href = url;
  } catch (error) {
    console.error('Failed to open EVE link:', error);
    throw new Error('Failed to open EVE Online client. Make sure the game is installed.');
  }

  return url;
}

/**
 * Shows item information window in the EVE Online client
 * @param {number} typeId - The EVE type ID of the item
 * @returns {string} The EVE deep link URL
 * @example
 * showItemInfo(34) // Shows Tritanium info window
 */
export function showItemInfo(typeId) {
  if (!typeId || typeof typeId !== 'number') {
    throw new Error('Invalid typeId: must be a number');
  }

  const url = `eve://showinfo/${typeId}`;

  // Try to open the link
  try {
    window.location.href = url;
  } catch (error) {
    console.error('Failed to open EVE link:', error);
    throw new Error('Failed to open EVE Online client. Make sure the game is installed.');
  }

  return url;
}

/**
 * Sets autopilot destination to a solar system in the EVE Online client
 * @param {number} solarSystemId - The EVE solar system ID
 * @returns {string} The EVE deep link URL
 * @example
 * setDestination(30000142) // Sets destination to Jita
 */
export function setDestination(solarSystemId) {
  if (!solarSystemId || typeof solarSystemId !== 'number') {
    throw new Error('Invalid solarSystemId: must be a number');
  }

  const url = `eve://client/setDestination?target=${solarSystemId}`;

  // Try to open the link
  try {
    window.location.href = url;
  } catch (error) {
    console.error('Failed to open EVE link:', error);
    throw new Error('Failed to open EVE Online client. Make sure the game is installed.');
  }

  return url;
}

/**
 * Adds waypoint to autopilot in the EVE Online client
 * @param {number} solarSystemId - The EVE solar system ID
 * @returns {string} The EVE deep link URL
 * @example
 * addWaypoint(30000142) // Adds Jita as waypoint
 */
export function addWaypoint(solarSystemId) {
  if (!solarSystemId || typeof solarSystemId !== 'number') {
    throw new Error('Invalid solarSystemId: must be a number');
  }

  const url = `eve://client/addWaypoint?target=${solarSystemId}`;

  // Try to open the link
  try {
    window.location.href = url;
  } catch (error) {
    console.error('Failed to open EVE link:', error);
    throw new Error('Failed to open EVE Online client. Make sure the game is installed.');
  }

  return url;
}

/**
 * Opens a contract in the EVE Online client
 * @param {number} contractId - The EVE contract ID
 * @returns {string} The EVE deep link URL
 * @example
 * openContract(123456789) // Opens specific contract
 */
export function openContract(contractId) {
  if (!contractId || typeof contractId !== 'number') {
    throw new Error('Invalid contractId: must be a number');
  }

  const url = `eve://contract/${contractId}`;

  // Try to open the link
  try {
    window.location.href = url;
  } catch (error) {
    console.error('Failed to open EVE link:', error);
    throw new Error('Failed to open EVE Online client. Make sure the game is installed.');
  }

  return url;
}

/**
 * Copy text to clipboard with proper error handling and feedback
 * @param {string} text - Text to copy to clipboard
 * @param {function} [onSuccess] - Callback function on successful copy
 * @param {function} [onError] - Callback function on error
 * @returns {Promise<boolean>} Promise that resolves to true if successful, false otherwise
 * @example
 * copyToClipboardWithFeedback('Tritanium',
 *   () => console.log('Copied!'),
 *   (err) => console.error('Failed:', err)
 * )
 */
export async function copyToClipboardWithFeedback(text, onSuccess, onError) {
  if (!text || typeof text !== 'string') {
    const error = new Error('Invalid text: must be a non-empty string');
    if (onError) onError(error);
    return false;
  }

  try {
    // Modern clipboard API (preferred)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      if (onSuccess) onSuccess();
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        if (onSuccess) onSuccess();
        return true;
      } else {
        throw new Error('Copy command was unsuccessful');
      }
    } catch (err) {
      document.body.removeChild(textArea);
      throw err;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    if (onError) onError(error);
    return false;
  }
}

/**
 * Validates if a type ID is valid
 * @param {number} typeId - The EVE type ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidTypeId(typeId) {
  return typeof typeId === 'number' && typeId > 0 && Number.isInteger(typeId);
}

/**
 * Validates if a solar system ID is valid
 * @param {number} solarSystemId - The EVE solar system ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidSolarSystemId(solarSystemId) {
  return typeof solarSystemId === 'number' && solarSystemId > 0 && Number.isInteger(solarSystemId);
}

/**
 * Validates if a contract ID is valid
 * @param {number} contractId - The EVE contract ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidContractId(contractId) {
  return typeof contractId === 'number' && contractId > 0 && Number.isInteger(contractId);
}
