import { useEveAuth } from './useEveAuth';
import { formatISK } from '../utils/formatters';

/**
 * Wallet Validator Hook
 *
 * Provides wallet balance validation and affordability checking for trades.
 * Uses the existing useEveAuth hook to access wallet data.
 *
 * @returns {Object} Wallet validation utilities
 * @returns {Function} canAfford - Check if wallet balance >= amount
 * @returns {number|null} walletBalance - Current wallet balance in ISK
 * @returns {boolean} isWalletLoaded - Whether wallet data has been loaded
 * @returns {Function} formatShortfall - Format "Need X more ISK" message
 *
 * @example
 * const { canAfford, walletBalance, isWalletLoaded, formatShortfall } = useWalletValidator();
 *
 * if (isWalletLoaded && !canAfford(1000000)) {
 *   console.log(formatShortfall(1000000)); // "Need 500K ISK"
 * }
 */
export function useWalletValidator() {
  const { isAuthenticated } = useEveAuth();

  // Note: The wallet balance is loaded in the trading pages via the ESI API
  // We're creating a hook that accepts wallet balance as a parameter
  // This allows for better separation of concerns and reusability

  /**
   * Check if the user can afford a given amount
   * @param {number} amount - The ISK amount to check
   * @param {number|null} walletBalance - Current wallet balance
   * @returns {boolean} True if wallet balance >= amount
   */
  const canAfford = (amount, walletBalance) => {
    if (!isAuthenticated || walletBalance === null || walletBalance === undefined) {
      return false;
    }
    return walletBalance >= amount;
  };

  /**
   * Calculate and format the shortfall message
   * @param {number} amount - The ISK amount required
   * @param {number|null} walletBalance - Current wallet balance
   * @returns {string} Formatted shortfall message (e.g., "Need 1.5M ISK")
   */
  const formatShortfall = (amount, walletBalance) => {
    if (!isAuthenticated || walletBalance === null || walletBalance === undefined) {
      return 'Login to check';
    }

    const shortfall = amount - walletBalance;
    if (shortfall <= 0) {
      return 'Can afford';
    }

    return `Need ${formatISK(shortfall, false)}`;
  };

  /**
   * Get affordability status with detailed information
   * @param {number} amount - The ISK amount required
   * @param {number|null} walletBalance - Current wallet balance
   * @returns {Object} Affordability status
   */
  const getAffordabilityStatus = (amount, walletBalance) => {
    if (!isAuthenticated) {
      return {
        canAfford: false,
        status: 'unauthenticated',
        message: 'Login to check',
        shortfall: null,
      };
    }

    if (walletBalance === null || walletBalance === undefined) {
      return {
        canAfford: false,
        status: 'loading',
        message: 'Loading...',
        shortfall: null,
      };
    }

    const affordable = walletBalance >= amount;
    const shortfall = affordable ? 0 : amount - walletBalance;

    return {
      canAfford: affordable,
      status: affordable ? 'affordable' : 'insufficient',
      message: affordable ? 'Can afford' : formatShortfall(amount, walletBalance),
      shortfall: affordable ? 0 : shortfall,
    };
  };

  return {
    canAfford,
    formatShortfall,
    getAffordabilityStatus,
    isAuthenticated,
  };
}

export default useWalletValidator;
