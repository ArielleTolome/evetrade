import { useCallback } from 'react';

/**
 * Custom hook for calculating profit metrics and efficiency ratings for trades
 *
 * @description
 * Calculates various profit metrics including:
 * - Profit per hour based on volume and trade velocity
 * - ROI (Return on Investment) percentage
 * - Capital efficiency rating
 * - Time to recover initial investment
 * - Overall profitability rating (0-5 stars)
 *
 * @returns {Object} Hook API
 * @returns {Function} calculateMetrics - Function to calculate metrics for a trade
 *
 * @example
 * const { calculateMetrics } = useProfitMetrics();
 * const metrics = calculateMetrics(trade, { assumedTurnover: 0.3 });
 * console.log(metrics.profitPerHour); // ISK per hour
 */
export function useProfitMetrics() {
  /**
   * Calculate comprehensive profit metrics for a single trade
   *
   * @param {Object} trade - Trade object with pricing and volume data
   * @param {number} trade.Volume - Daily trading volume
   * @param {number} trade.profitPerUnit - Profit per unit (after taxes)
   * @param {number} trade.buyPrice - Buy price per unit
   * @param {number} trade.netProfit - Total net profit
   * @param {Object} options - Calculation options
   * @param {number} [options.hoursPerDay=24] - Hours in a trading day
   * @param {number} [options.assumedTurnover=0.5] - Percentage of daily volume you can capture (0-1)
   *
   * @returns {Object} Calculated metrics
   * @returns {number} profitPerHour - Estimated ISK profit per hour
   * @returns {number} estimatedSalesPerHour - Estimated units sold per hour
   * @returns {number} roi - Return on investment as percentage
   * @returns {number} capitalRequired - Capital needed for one trading cycle
   * @returns {number} capitalEfficiency - Profit per hour per million ISK invested
   * @returns {number} timeToRecover - Hours needed to recover initial investment
   * @returns {number} rating - Profitability rating (0-5 stars)
   */
  const calculateMetrics = useCallback((trade, options = {}) => {
    const {
      hoursPerDay = 24,
      assumedTurnover = 0.5, // 50% of daily volume you can capture
    } = options;

    // Extract values from trade object with fallbacks for different property names
    const volume = trade['Volume'] || trade.volume || 0;
    const profitPerUnit = trade['Profit per Unit'] || trade.profitPerUnit || 0;
    const buyPrice = trade['Buy Price'] || trade.buyPrice || 0;
    const _netProfit = trade['Net Profit'] || trade.netProfit || 0;

    // Calculate estimated sales per hour
    // Formula: (daily volume / 24 hours) * market capture rate
    const estimatedSalesPerHour = (volume / hoursPerDay) * assumedTurnover;

    // Calculate profit per hour
    // Formula: profit per unit * estimated sales per hour
    const profitPerHour = profitPerUnit * estimatedSalesPerHour;

    // Calculate ROI (Return on Investment)
    // Formula: (profit per unit / buy price) * 100
    const roi = buyPrice > 0 ? (profitPerUnit / buyPrice) * 100 : 0;

    // Calculate capital required for one trading cycle
    // Cap at 100 units to keep investment reasonable
    const capitalRequired = buyPrice * Math.min(volume, 100);

    // Calculate capital efficiency
    // Formula: (profit per hour / capital required) * 1,000,000
    // This gives profit per hour per million ISK invested
    const capitalEfficiency = capitalRequired > 0 ? (profitPerHour / capitalRequired) * 1000000 : 0;

    // Calculate time to recover investment
    // Formula: capital required / profit per hour
    // Returns Infinity if profitPerHour is 0
    const timeToRecover = profitPerHour > 0 ? capitalRequired / profitPerHour : Infinity;

    // Calculate profitability rating (0-5 stars)
    // Based on multiple factors for a comprehensive rating
    let rating = 0;

    // High profit per hour tiers
    if (profitPerHour > 10000000) rating++;  // > 10M ISK/hour
    if (profitPerHour > 50000000) rating++;  // > 50M ISK/hour

    // Good ROI tiers
    if (roi > 5) rating++;   // > 5% ROI
    if (roi > 10) rating++;  // > 10% ROI

    // High volume (liquidity) bonus
    if (volume > 100) rating++;

    return {
      profitPerHour,
      estimatedSalesPerHour,
      roi,
      capitalRequired,
      capitalEfficiency,
      timeToRecover,
      rating: Math.min(rating, 5), // Cap at 5 stars
    };
  }, []);

  return { calculateMetrics };
}

export default useProfitMetrics;
