/**
 * Profit Calculation Utilities
 * Pure functions for calculating EVE Online trading profits with all taxes and fees
 */

/**
 * Round a number to specified decimal places using precise arithmetic
 * Avoids floating-point precision issues for financial calculations
 * @param {number} value - The value to round
 * @param {number} decimals - Number of decimal places (default 2 for ISK)
 * @returns {number} Rounded value
 */
export function preciseRound(value, decimals = 2) {
  if (!Number.isFinite(value)) return 0;
  const multiplier = Math.pow(10, decimals);
  // Use Math.round with epsilon adjustment for floating-point precision
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

/**
 * Perform precise subtraction to avoid floating-point errors
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Precise difference
 */
export function preciseSubtract(a, b) {
  return preciseRound(a - b, 4);
}

/**
 * Perform precise multiplication to avoid floating-point errors
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Precise product
 */
export function preciseMultiply(a, b) {
  return preciseRound(a * b, 4);
}

/**
 * Calculate sales tax based on price, rate, and Accounting skill level
 * @param {number} price - The sale price
 * @param {number} rate - Base sales tax rate (default 0.05 for 5%)
 * @param {number} accountingLevel - Accounting skill level (0-5)
 * @returns {number} Sales tax amount
 *
 * Formula: Base tax is 5%, reduced by 10% per level of Accounting skill
 * Level 0: 5.00%
 * Level 1: 4.50%
 * Level 2: 4.05%
 * Level 3: 3.65%
 * Level 4: 3.28%
 * Level 5: 2.95%
 */
export function calculateSalesTax(price, rate = 0.05, accountingLevel = 0) {
  if (price <= 0 || rate < 0 || accountingLevel < 0 || accountingLevel > 5) {
    return 0;
  }

  // Each level of Accounting reduces tax by 10%
  const effectiveRate = rate * Math.pow(0.90, accountingLevel);
  return price * effectiveRate;
}

/**
 * Calculate broker fee based on price, skill level, and station type
 * @param {number} price - The order price
 * @param {number} rate - Base broker fee rate (default 0.03 for 3%)
 * @param {number} brokerRelationsLevel - Broker Relations skill level (0-5)
 * @param {boolean} isPlayerStructure - Whether trading at a player structure
 * @param {number} factionStanding - Faction standing (-10 to +10)
 * @param {number} corporationStanding - Corporation standing (-10 to +10)
 * @returns {number} Broker fee amount
 *
 * Formula: Base fee is 3%
 * - Reduced by 0.3% per level of Broker Relations (0.003 per level)
 * - Reduced by 0.3% per 1.0 faction standing (0.003 per point)
 * - Reduced by 0.2% per 1.0 corporation standing (0.002 per point)
 * - Minimum broker fee is 1.0%
 * - Player structures may have custom fees (typically lower)
 */
export function calculateBrokerFee(
  price,
  rate = 0.03,
  brokerRelationsLevel = 0,
  isPlayerStructure = false,
  factionStanding = 0,
  corporationStanding = 0
) {
  if (price <= 0 || rate < 0 || brokerRelationsLevel < 0 || brokerRelationsLevel > 5) {
    return 0;
  }

  // Player structures often have much lower or zero broker fees
  if (isPlayerStructure) {
    // Player structures typically charge 0.5% to 1.5%
    // For simplicity, we'll use 50% of the calculated NPC fee
    rate = rate * 0.5;
  }

  // Skill reduction: 0.3% per level (0.003)
  const skillReduction = brokerRelationsLevel * 0.003;

  // Faction standing reduction: 0.3% per 1.0 standing
  const factionReduction = Math.max(0, factionStanding) * 0.003;

  // Corporation standing reduction: 0.2% per 1.0 standing
  const corpReduction = Math.max(0, corporationStanding) * 0.002;

  // Calculate effective rate with minimum of 1.0% for NPC stations
  const effectiveRate = isPlayerStructure
    ? Math.max(0, rate - skillReduction - factionReduction - corpReduction)
    : Math.max(0.01, rate - skillReduction - factionReduction - corpReduction);

  return price * effectiveRate;
}

/**
 * Calculate net profit after all fees and taxes
 * @param {Object} params - Calculation parameters
 * @param {number} params.buyPrice - Price per unit when buying
 * @param {number} params.sellPrice - Price per unit when selling
 * @param {number} params.quantity - Number of units
 * @param {number} [params.salesTaxRate=0.05] - Base sales tax rate
 * @param {number} [params.brokerFeeRate=0.03] - Base broker fee rate
 * @param {number} [params.accountingLevel=0] - Accounting skill level (0-5)
 * @param {number} [params.brokerRelationsLevel=0] - Broker Relations skill level (0-5)
 * @param {boolean} [params.isPlayerStructure=false] - Trading at player structure
 * @param {number} [params.factionStanding=0] - Faction standing (-10 to +10)
 * @param {number} [params.corporationStanding=0] - Corporation standing (-10 to +10)
 * @returns {Object} Complete profit breakdown
 */
export function calculateNetProfit(params) {
  const {
    buyPrice = 0,
    sellPrice = 0,
    quantity = 1,
    salesTaxRate = 0.05,
    brokerFeeRate = 0.03,
    accountingLevel = 0,
    brokerRelationsLevel = 0,
    isPlayerStructure = false,
    factionStanding = 0,
    corporationStanding = 0,
  } = params;

  // Validate inputs
  if (buyPrice < 0 || sellPrice < 0 || quantity <= 0) {
    return {
      grossProfit: 0,
      buyBrokerFee: 0,
      sellBrokerFee: 0,
      salesTax: 0,
      totalFees: 0,
      netProfit: 0,
      profitPerUnit: 0,
      roi: 0,
      effectiveSalesTaxRate: 0,
      effectiveBrokerFeeRate: 0,
    };
  }

  // Calculate total values
  const totalBuyPrice = buyPrice * quantity;
  const totalSellPrice = sellPrice * quantity;
  const grossProfit = totalSellPrice - totalBuyPrice;

  // Calculate fees
  const buyBrokerFee = calculateBrokerFee(
    totalBuyPrice,
    brokerFeeRate,
    brokerRelationsLevel,
    isPlayerStructure,
    factionStanding,
    corporationStanding
  );

  const sellBrokerFee = calculateBrokerFee(
    totalSellPrice,
    brokerFeeRate,
    brokerRelationsLevel,
    isPlayerStructure,
    factionStanding,
    corporationStanding
  );

  const salesTax = calculateSalesTax(
    totalSellPrice,
    salesTaxRate,
    accountingLevel
  );

  const totalFees = buyBrokerFee + sellBrokerFee + salesTax;
  const netProfit = grossProfit - totalFees;
  const profitPerUnit = netProfit / quantity;

  // Calculate ROI based on total investment (buy price + fees)
  const totalInvestment = totalBuyPrice + buyBrokerFee;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  // Calculate effective rates
  const effectiveSalesTaxRate = salesTaxRate * Math.pow(0.90, accountingLevel);
  const skillReduction = brokerRelationsLevel * 0.003;
  const factionReduction = Math.max(0, factionStanding) * 0.003;
  const corpReduction = Math.max(0, corporationStanding) * 0.002;
  const effectiveBrokerFeeRate = isPlayerStructure
    ? Math.max(0, (brokerFeeRate * 0.5) - skillReduction - factionReduction - corpReduction)
    : Math.max(0.01, brokerFeeRate - skillReduction - factionReduction - corpReduction);

  return {
    grossProfit,
    buyBrokerFee,
    sellBrokerFee,
    salesTax,
    totalFees,
    netProfit,
    profitPerUnit,
    roi,
    effectiveSalesTaxRate,
    effectiveBrokerFeeRate,
  };
}

/**
 * Calculate break-even sell price (minimum price to not lose money)
 * @param {Object} params - Calculation parameters
 * @param {number} params.buyPrice - Price per unit when buying
 * @param {number} [params.salesTaxRate=0.05] - Base sales tax rate
 * @param {number} [params.brokerFeeRate=0.03] - Base broker fee rate
 * @param {number} [params.accountingLevel=0] - Accounting skill level (0-5)
 * @param {number} [params.brokerRelationsLevel=0] - Broker Relations skill level (0-5)
 * @param {boolean} [params.isPlayerStructure=false] - Trading at player structure
 * @param {number} [params.factionStanding=0] - Faction standing
 * @param {number} [params.corporationStanding=0] - Corporation standing
 * @returns {number} Minimum sell price to break even
 */
export function calculateBreakEven(params) {
  const {
    buyPrice = 0,
    salesTaxRate = 0.05,
    brokerFeeRate = 0.03,
    accountingLevel = 0,
    brokerRelationsLevel = 0,
    isPlayerStructure = false,
    factionStanding = 0,
    corporationStanding = 0,
  } = params;

  if (buyPrice <= 0) return 0;

  // Calculate effective rates
  const effectiveSalesTaxRate = salesTaxRate * Math.pow(0.90, accountingLevel);

  const skillReduction = brokerRelationsLevel * 0.003;
  const factionReduction = Math.max(0, factionStanding) * 0.003;
  const corpReduction = Math.max(0, corporationStanding) * 0.002;
  const effectiveBrokerFeeRate = isPlayerStructure
    ? Math.max(0, (brokerFeeRate * 0.5) - skillReduction - factionReduction - corpReduction)
    : Math.max(0.01, brokerFeeRate - skillReduction - factionReduction - corpReduction);

  // Break-even formula:
  // Sell Price = (Buy Price * (1 + Buy Broker Fee)) / (1 - Sell Broker Fee - Sales Tax)
  const buyMultiplier = 1 + effectiveBrokerFeeRate;
  const sellMultiplier = 1 - effectiveBrokerFeeRate - effectiveSalesTaxRate;

  return (buyPrice * buyMultiplier) / sellMultiplier;
}

/**
 * Calculate ROI percentage
 * @param {Object} params - Same as calculateNetProfit
 * @returns {number} ROI percentage
 */
export function calculateROI(params) {
  const result = calculateNetProfit(params);
  return result.roi;
}

/**
 * Format profit calculation for copying to clipboard
 * @param {string} itemName - Name of the item
 * @param {Object} params - Calculation parameters (same as calculateNetProfit)
 * @param {Object} result - Result from calculateNetProfit
 * @returns {string} Formatted text for clipboard
 */
export function formatProfitForCopy(itemName, params, result) {
  const { buyPrice, sellPrice, quantity } = params;
  const { grossProfit, totalFees, buyBrokerFee, sellBrokerFee, salesTax, netProfit, roi } = result;

  return `Item: ${itemName}
Buy: ${buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK x ${quantity.toLocaleString('en-US')}
Sell: ${sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK x ${quantity.toLocaleString('en-US')}
Gross: ${grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
Fees: ${totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK (Buy Broker: ${buyBrokerFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Sell Broker: ${sellBrokerFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, Tax: ${salesTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
Net Profit: ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ISK
ROI: ${roi.toFixed(2)}%`;
}

export default {
  preciseRound,
  preciseSubtract,
  preciseMultiply,
  calculateSalesTax,
  calculateBrokerFee,
  calculateNetProfit,
  calculateBreakEven,
  calculateROI,
  formatProfitForCopy,
};
