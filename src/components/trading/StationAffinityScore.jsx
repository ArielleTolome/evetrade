import { useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

// Get score color based on value
const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

// Score factor display component
const ScoreFactor = ({ label, score, description }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
    <div>
      <div className="text-sm text-text-primary">{label}</div>
      <div className="text-xs text-text-secondary">{description}</div>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-space-dark rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-green-500' :
            score >= 60 ? 'bg-yellow-500' :
            score >= 40 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-mono font-bold ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  </div>
);

/**
 * Station Affinity Score Component
 * @description Evaluates and scores stations for trading based on various factors
 * Uses ESI data to calculate trading viability scores
 *
 * @component
 * @example
 * <StationAffinityScore
 *   stationData={{
 *     name: "Jita IV - Moon 4 - Caldari Navy Assembly Plant",
 *     orderCount: 15000,
 *     dailyVolume: 50000000000,
 *     uniqueItems: 8000,
 *     avgSpread: 8.5,
 *     taxRate: 0.08,
 *   }}
 * />
 */
export function StationAffinityScore({
  stationData = {},
  className = '',
}) {
  const {
    name = 'Unknown Station',
    orderCount = 0,
    dailyVolume = 0,
    uniqueItems = 0,
    avgSpread = 0,
    taxRate = 0.08,
    brokerFee = 0.03,
    competition = { buyers: 0, sellers: 0 },
    isPlayerStructure = false,
  } = stationData;

  // Calculate individual scores
  const scores = useMemo(() => {
    // Liquidity Score (0-100): Based on order count and volume
    // Jita has ~50k+ orders, scale accordingly
    const liquidityScore = Math.min(100, Math.round(
      (orderCount / 10000) * 40 + (dailyVolume / 10000000000) * 60
    ));

    // Variety Score (0-100): Based on unique items available
    // Good stations have 5000+ unique items
    const varietyScore = Math.min(100, Math.round((uniqueItems / 5000) * 100));

    // Spread Score (0-100): Lower spreads are better for quick trades
    // 10%+ spread is poor, 2% or less is excellent
    const spreadScore = avgSpread <= 0 ? 0 : Math.max(0, Math.min(100, Math.round(
      100 - (avgSpread * 10)
    )));

    // Tax Efficiency (0-100): Lower effective taxes are better
    const effectiveTax = taxRate + (brokerFee * 2);
    const taxScore = Math.max(0, Math.min(100, Math.round(
      100 - (effectiveTax * 500) // 0% = 100 score, 20%+ = 0 score
    )));

    // Competition Score (0-100): Moderate competition is healthy
    const totalCompetitors = competition.buyers + competition.sellers;
    let competitionScore;
    if (totalCompetitors < 5) {
      competitionScore = 40; // Too few traders might indicate low activity
    } else if (totalCompetitors < 20) {
      competitionScore = 80; // Sweet spot
    } else if (totalCompetitors < 50) {
      competitionScore = 60; // Healthy competition
    } else {
      competitionScore = 40; // Very crowded
    }

    // Structure Bonus (0-20): Player structures often have lower fees
    const structureBonus = isPlayerStructure ? 15 : 0;

    // Calculate overall score (weighted average)
    const weights = {
      liquidity: 0.30,
      variety: 0.20,
      spread: 0.25,
      tax: 0.15,
      competition: 0.10,
    };

    const overallScore = Math.min(100, Math.round(
      liquidityScore * weights.liquidity +
      varietyScore * weights.variety +
      spreadScore * weights.spread +
      taxScore * weights.tax +
      competitionScore * weights.competition +
      structureBonus
    ));

    return {
      liquidity: liquidityScore,
      variety: varietyScore,
      spread: spreadScore,
      tax: taxScore,
      competition: competitionScore,
      overall: overallScore,
    };
  }, [orderCount, dailyVolume, uniqueItems, avgSpread, taxRate, brokerFee, competition, isPlayerStructure]);

  // Get score label
  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 45) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Avoid';
  };

  // Get recommendation
  const getRecommendation = () => {
    if (scores.overall >= 80) {
      return {
        text: 'Highly recommended for trading. Excellent liquidity and market depth.',
        icon: '✓',
        color: 'text-green-400',
      };
    }
    if (scores.overall >= 60) {
      return {
        text: 'Good trading location. Consider for moderate-volume trades.',
        icon: '○',
        color: 'text-yellow-400',
      };
    }
    if (scores.overall >= 40) {
      return {
        text: 'Use with caution. May have thin markets or high competition.',
        icon: '⚠',
        color: 'text-orange-400',
      };
    }
    return {
      text: 'Not recommended for regular trading. Consider alternative stations.',
      icon: '✗',
      color: 'text-red-400',
    };
  };

  const recommendation = getRecommendation();

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-accent-cyan/20">
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-3">
              <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Station Affinity Score
            </h2>
            <p className="text-sm text-text-secondary mt-1">{name}</p>
            {isPlayerStructure && (
              <span className="inline-block mt-2 px-2 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-medium">
                Player Structure
              </span>
            )}
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold font-mono ${getScoreColor(scores.overall)}`}>
              {scores.overall}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {getScoreLabel(scores.overall)}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Score Breakdown
          </h3>
          <div className="bg-space-dark/30 rounded-lg p-4">
            <ScoreFactor
              label="Liquidity"
              score={scores.liquidity}
              description={`${formatNumber(orderCount, 0)} orders, ${formatISK(dailyVolume)} daily volume`}
            />
            <ScoreFactor
              label="Variety"
              score={scores.variety}
              description={`${formatNumber(uniqueItems, 0)} unique items available`}
            />
            <ScoreFactor
              label="Spread"
              score={scores.spread}
              description={`Average spread: ${formatPercent(avgSpread / 100, 1)}`}
            />
            <ScoreFactor
              label="Tax Efficiency"
              score={scores.tax}
              description={`${formatPercent(taxRate, 1)} sales tax + ${formatPercent(brokerFee, 1)} broker fee`}
            />
            <ScoreFactor
              label="Competition"
              score={scores.competition}
              description={`${competition.buyers} buyers, ${competition.sellers} sellers`}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className={`p-4 rounded-lg border ${
          scores.overall >= 80 ? 'bg-green-500/10 border-green-500/30' :
          scores.overall >= 60 ? 'bg-yellow-500/10 border-yellow-500/30' :
          scores.overall >= 40 ? 'bg-orange-500/10 border-orange-500/30' :
          'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-start gap-3">
            <span className={`text-xl ${recommendation.color}`}>{recommendation.icon}</span>
            <div>
              <div className={`text-sm font-medium ${recommendation.color}`}>Recommendation</div>
              <p className="text-sm text-text-secondary mt-1">{recommendation.text}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-space-dark/30">
            <div className="text-lg font-mono font-bold text-accent-cyan">
              {formatNumber(orderCount, 0)}
            </div>
            <div className="text-xs text-text-secondary">Orders</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-space-dark/30">
            <div className="text-lg font-mono font-bold text-accent-gold">
              {formatISK(dailyVolume, false)}
            </div>
            <div className="text-xs text-text-secondary">Daily Volume</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-space-dark/30">
            <div className="text-lg font-mono font-bold text-accent-purple">
              {formatNumber(uniqueItems, 0)}
            </div>
            <div className="text-xs text-text-secondary">Items</div>
          </div>
        </div>

        {/* Trading Tips */}
        <div className="text-xs text-text-secondary space-y-1">
          <p className="font-medium text-text-primary mb-2">Trading Tips for this Station:</p>
          {scores.liquidity >= 70 && (
            <p>• High liquidity - good for quick trades and large volumes</p>
          )}
          {scores.liquidity < 40 && (
            <p>• Low liquidity - orders may take longer to fill</p>
          )}
          {scores.spread >= 70 && (
            <p>• Tight spreads - efficient for margin trading</p>
          )}
          {scores.spread < 40 && (
            <p>• Wide spreads - consider items with higher margins</p>
          )}
          {scores.competition >= 70 && (
            <p>• Healthy competition - active market with fair prices</p>
          )}
          {scores.competition < 40 && (
            <p>• Competition concerns - watch for manipulation</p>
          )}
          {isPlayerStructure && (
            <p>• Player structure - potentially lower fees than NPC stations</p>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default StationAffinityScore;
