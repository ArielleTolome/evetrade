import { SECURITY_COLORS } from './constants';

/**
 * Get the security level index (0-10) from a decimal security status
 * @param {number} security - Security status (e.g., 0.5, 1.0, -0.1)
 * @returns {number} Security level index (0-10)
 */
export function getSecurityLevel(security) {
  if (security === null || security === undefined || isNaN(security)) {
    return 0;
  }
  // Round to nearest 0.1 and convert to index
  const rounded = Math.round(security * 10);
  return Math.max(0, Math.min(10, rounded));
}

/**
 * Get security color classes for a given security status
 * @param {number} security - Security status
 * @returns {object} Object with bg and text color classes
 */
export function getSecurityColors(security) {
  const level = getSecurityLevel(security);
  return SECURITY_COLORS[level] || SECURITY_COLORS[0];
}

/**
 * Get the display text for a security status
 * @param {number} security - Security status
 * @returns {string} Formatted security string (e.g., "0.5", "1.0")
 */
export function formatSecurityStatus(security) {
  if (security === null || security === undefined || isNaN(security)) {
    return '0.0';
  }
  return security.toFixed(1);
}

/**
 * Determine if a location is high-sec (0.5+)
 * @param {number} security - Security status
 * @returns {boolean}
 */
export function isHighSec(security) {
  return security >= 0.5;
}

/**
 * Determine if a location is low-sec (0.1 - 0.4)
 * @param {number} security - Security status
 * @returns {boolean}
 */
export function isLowSec(security) {
  return security >= 0.1 && security < 0.5;
}

/**
 * Determine if a location is null-sec (below 0.1)
 * @param {number} security - Security status
 * @returns {boolean}
 */
export function isNullSec(security) {
  return security < 0.1;
}

/**
 * Get security classification label
 * @param {number} security - Security status
 * @returns {string} "High-Sec", "Low-Sec", or "Null-Sec"
 */
export function getSecurityClassification(security) {
  if (isHighSec(security)) return 'High-Sec';
  if (isLowSec(security)) return 'Low-Sec';
  return 'Null-Sec';
}

/**
 * Check if a station name indicates a player structure (citadel)
 * @param {string} stationName - Name of the station
 * @returns {boolean}
 */
export function isCitadel(stationName) {
  if (!stationName) return false;
  return stationName.endsWith('*');
}

/**
 * Clean station name (remove citadel marker)
 * @param {string} stationName - Name of the station
 * @returns {string} Cleaned station name
 */
export function cleanStationName(stationName) {
  if (!stationName) return '';
  return stationName.replace(/\*$/, '');
}
