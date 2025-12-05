/**
 * Calculate affordability status
 * @param {number} cost - Cost of the trade (buy price * quantity)
 * @param {number} walletBalance - Current wallet balance
 * @returns {Object} Affordability status
 */
export function calculateAffordability(cost, walletBalance) {
  if (walletBalance === null || walletBalance === undefined) {
    return { status: 'unknown', canAfford: null, shortfall: 0, percentage: 0 };
  }

  const canAfford = walletBalance >= cost;
  const shortfall = canAfford ? 0 : cost - walletBalance;
  const percentage = cost > 0 ? Math.min(100, (walletBalance / cost) * 100) : 100;

  let status;
  if (canAfford) {
    if (percentage > 200) {
      status = 'comfortable'; // Can afford 2x+
    } else if (percentage > 120) {
      status = 'affordable';  // Can afford with buffer
    } else {
      status = 'tight';       // Can barely afford
    }
  } else {
    if (percentage >= 75) {
      status = 'close';       // Almost there
    } else if (percentage >= 50) {
      status = 'partial';     // Have half
    } else {
      status = 'unaffordable'; // Far from affording
    }
  }

  return { status, canAfford, shortfall, percentage };
}
