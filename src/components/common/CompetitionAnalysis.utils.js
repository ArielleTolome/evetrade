export const COMPETITION_LEVELS = {
  low: { label: 'Low Competition', color: 'text-green-400', bg: 'bg-green-400/20', icon: '🟢' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/20', icon: '🟡' },
  high: { label: 'High Competition', color: 'text-orange-400', bg: 'bg-orange-400/20', icon: '🟠' },
  extreme: { label: 'Extreme', color: 'text-red-400', bg: 'bg-red-400/20', icon: '🔴' },
};

/**
 * Analyze competition level based on trade data
 */
export function analyzeCompetition(trade) {
  const buyPrice = trade['Buy Price'] || trade.buyPrice || 0;
  const sellPrice = trade['Sell Price'] || trade.sellPrice || 0;
  const margin = trade['Gross Margin'] || trade.margin || 0;
  const volume = trade['Volume'] || trade.volume || 0;

  // Calculate spread
  const spread = sellPrice - buyPrice;
  const spreadPercent = buyPrice > 0 ? (spread / buyPrice) * 100 : 0;

  // Estimate competition level
  let level = 'low';
  if (margin < 3) level = 'extreme';
  else if (margin < 8) level = 'high';
  else if (margin < 15) level = 'medium';

  // Estimate order count based on volume (rough approximation)
  const estimatedBuyOrders = Math.max(1, Math.floor(volume / 50));
  const estimatedSellOrders = Math.max(1, Math.floor(volume / 30));

  // Calculate undercut risk (how likely you'll be undercut)
  let undercutRisk = 0;
  if (level === 'extreme') undercutRisk = 90;
  else if (level === 'high') undercutRisk = 70;
  else if (level === 'medium') undercutRisk = 40;
  else undercutRisk = 20;

  // Recommended price position
  const recommendedBuy = buyPrice * 1.001; // 0.1% above current
  const recommendedSell = sellPrice * 0.999; // 0.1% below current

  return {
    spread,
    spreadPercent,
    level,
    levelInfo: COMPETITION_LEVELS[level],
    estimatedBuyOrders,
    estimatedSellOrders,
    undercutRisk,
    recommendedBuy,
    recommendedSell,
    margin,
  };
}
