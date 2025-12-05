import { useMemo, useState } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';
import { Button } from './Button';
import { formatISK, formatNumber } from '../../utils/formatters';
import { useWatchlist } from '../../hooks/useWatchlist';

/**
 * Decision levels with their visual styling
 */
const DECISIONS = {
  GO: {
    label: 'GO',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    shadowColor: 'shadow-green-500/30',
    glowColor: 'shadow-green-500/50',
    icon: '✓',
    description: 'Good trade opportunity',
  },
  WAIT: {
    label: 'WAIT',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    shadowColor: 'shadow-yellow-500/30',
    glowColor: 'shadow-yellow-500/50',
    icon: '⚠',
    description: 'Proceed with caution',
  },
  AVOID: {
    label: 'AVOID',
    color: 'text-red-500',
    bg: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    shadowColor: 'shadow-red-500/30',
    glowColor: 'shadow-red-500/50',
    icon: '⛔',
    description: 'High risk trade',
  },
};

/**
 * Evaluate a single factor and return score and reason
 */
function evaluateFactor(type, value) {
  const evaluations = {
    margin: (margin) => {
      if (margin > 15) return { score: 100, reason: `Excellent margin (${margin.toFixed(1)}%)`, level: 'good' };
      if (margin > 10) return { score: 85, reason: `Good margin (${margin.toFixed(1)}%)`, level: 'good' };
      if (margin > 5) return { score: 60, reason: `Moderate margin (${margin.toFixed(1)}%)`, level: 'okay' };
      if (margin > 3) return { score: 40, reason: `Thin margin (${margin.toFixed(1)}%)`, level: 'risky' };
      return { score: 20, reason: `Very low margin (${margin.toFixed(1)}%)`, level: 'risky' };
    },
    volume: (volume) => {
      if (volume >= 100) return { score: 100, reason: `Excellent volume (${formatNumber(volume, 0)} units)`, level: 'good' };
      if (volume >= 50) return { score: 85, reason: `Good volume (${formatNumber(volume, 0)} units)`, level: 'good' };
      if (volume >= 10) return { score: 60, reason: `Moderate volume (${formatNumber(volume, 0)} units)`, level: 'okay' };
      if (volume >= 5) return { score: 30, reason: `Low volume warning (${formatNumber(volume, 0)} units)`, level: 'risky' };
      if (volume > 0) return { score: 10, reason: `Very low volume - potential scam (${formatNumber(volume, 0)} units)`, level: 'risky' };
      return { score: 0, reason: 'No volume available', level: 'risky' };
    },
    competition: (count) => {
      if (count < 3) return { score: 100, reason: `Minimal competition (${count} sellers)`, level: 'good' };
      if (count < 5) return { score: 85, reason: `Low competition (${count} sellers)`, level: 'good' };
      if (count < 10) return { score: 60, reason: `Moderate competition (${count} sellers)`, level: 'okay' };
      if (count < 15) return { score: 40, reason: `High competition (${count} sellers)`, level: 'okay' };
      return { score: 20, reason: `Crowded market (${count}+ sellers)`, level: 'risky' };
    },
    dataAge: (minutes) => {
      if (minutes < 5) return { score: 100, reason: `Fresh data (${Math.round(minutes)}m ago)`, level: 'good' };
      if (minutes < 10) return { score: 80, reason: `Recent data (${Math.round(minutes)}m ago)`, level: 'okay' };
      if (minutes < 15) return { score: 60, reason: `Aging data (${Math.round(minutes)}m ago)`, level: 'okay' };
      if (minutes < 30) return { score: 30, reason: `Stale data warning (${Math.round(minutes)}m ago)`, level: 'risky' };
      return { score: 10, reason: `Very stale data (${Math.round(minutes)}m ago)`, level: 'risky' };
    },
    affordability: (canAfford) => {
      if (canAfford) return { score: 100, reason: 'You can afford this trade', level: 'good' };
      return { score: 0, reason: 'Insufficient funds', level: 'risky' };
    },
    roi: (roi) => {
      if (roi > 20) return { score: 100, reason: `Excellent ROI (${roi.toFixed(1)}%)`, level: 'good' };
      if (roi > 15) return { score: 85, reason: `Good ROI (${roi.toFixed(1)}%)`, level: 'good' };
      if (roi > 10) return { score: 70, reason: `Decent ROI (${roi.toFixed(1)}%)`, level: 'okay' };
      if (roi > 5) return { score: 50, reason: `Moderate ROI (${roi.toFixed(1)}%)`, level: 'okay' };
      return { score: 30, reason: `Low ROI (${roi.toFixed(1)}%)`, level: 'risky' };
    },
  };

  return evaluations[type](value);
}

/**
 * Calculate overall decision based on factor scores
 */
function calculateDecision(factors, userCanAfford) {
  // If user can't afford, immediate AVOID
  if (!userCanAfford) {
    return DECISIONS.AVOID;
  }

  // Count risky factors
  const riskyCounts = factors.filter(f => f.level === 'risky').length;

  // Calculate average score
  const avgScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length;

  // Decision logic
  if (riskyCounts >= 2 || avgScore < 40) {
    return DECISIONS.AVOID;
  }
  if (riskyCounts >= 1 || avgScore < 70) {
    return DECISIONS.WAIT;
  }
  return DECISIONS.GO;
}

/**
 * Factor display component
 */
function FactorIndicator({ factor }) {
  const levelColors = {
    good: 'text-green-400',
    okay: 'text-yellow-400',
    risky: 'text-red-400',
  };

  const levelIcons = {
    good: '✓',
    okay: '○',
    risky: '✗',
  };

  return (
    <div className="flex items-start gap-2">
      <span className={`${levelColors[factor.level]} text-sm mt-0.5`}>
        {levelIcons[factor.level]}
      </span>
      <p className="text-sm text-text-secondary flex-1">
        {factor.reason}
      </p>
    </div>
  );
}

/**
 * QuickDecisionCard Component
 * Displays a trade opportunity with a clear GO/WAIT/AVOID recommendation
 *
 * @param {Object} props
 * @param {Object} props.item - Item information { name, typeId }
 * @param {number} props.profit - Net profit amount
 * @param {number} props.margin - Profit margin percentage
 * @param {number} props.volume - Available volume/quantity
 * @param {number} props.roi - Return on investment percentage
 * @param {number} props.competition - Number of competing sellers
 * @param {number} props.dataAge - Minutes since data refresh
 * @param {boolean} props.userCanAfford - Whether user can afford the trade
 * @param {string} props.fromLocation - Source location name
 * @param {string} props.toLocation - Destination location name
 * @param {number} props.buyPrice - Buy price for the item
 * @param {number} props.sellPrice - Sell price for the item
 * @param {string} props.className - Additional CSS classes
 */
export function QuickDecisionCard({
  item,
  profit,
  margin,
  volume,
  roi,
  competition,
  dataAge,
  userCanAfford = true,
  fromLocation,
  toLocation,
  buyPrice,
  sellPrice,
  className = '',
}) {
  const [copyFeedback, setCopyFeedback] = useState('');
  const { addToWatchlist, removeFromWatchlist, isWatched, getWatchlistForItem } = useWatchlist();

  const itemId = item.typeId || item.itemId || item['Item ID'];
  const watched = isWatched(itemId);
  const currentWatchlist = getWatchlistForItem(itemId);

  // Calculate decision factors
  const { decision, factors } = useMemo(() => {
    const factors = [
      { type: 'margin', ...evaluateFactor('margin', margin) },
      { type: 'volume', ...evaluateFactor('volume', volume) },
      { type: 'competition', ...evaluateFactor('competition', competition) },
      { type: 'dataAge', ...evaluateFactor('dataAge', dataAge) },
      { type: 'affordability', ...evaluateFactor('affordability', userCanAfford) },
      { type: 'roi', ...evaluateFactor('roi', roi) },
    ];

    const decision = calculateDecision(factors, userCanAfford);

    return { decision, factors };
  }, [margin, volume, competition, dataAge, userCanAfford, roi]);

  // Handle copy details to clipboard
  const handleCopyDetails = async () => {
    const details = `Trade Opportunity: ${item.name}
Decision: ${decision.label}
Profit: ${formatISK(profit)}
Margin: ${margin.toFixed(1)}%
ROI: ${roi.toFixed(1)}%
Volume: ${formatNumber(volume, 0)} units
Competition: ${competition} sellers
From: ${fromLocation}
To: ${toLocation}
Data Age: ${Math.round(dataAge)} minutes ago`;

    try {
      await navigator.clipboard.writeText(details);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  // Handle add/remove from watchlist
  const handleToggleWatchlist = () => {
    if (!itemId) return;

    if (watched && currentWatchlist) {
      removeFromWatchlist(itemId, currentWatchlist.id);
    } else {
      const watchlistItem = {
        itemId: itemId,
        name: item.name,
        buyPrice: buyPrice,
        sellPrice: sellPrice,
      };
      addToWatchlist(watchlistItem);
    }
  };

  // Generate EVE Online link
  const eveLink = `eve://showinfo:${item.typeId}`;

  return (
    <GlassmorphicCard className={className} padding="p-0">
      {/* Decision Header */}
      <div className={`px-6 py-4 border-b ${decision.borderColor} ${decision.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-3xl ${decision.color}`}>
              {decision.icon}
            </div>
            <div>
              <div className={`text-2xl font-bold font-mono ${decision.color} uppercase tracking-wider`}>
                {decision.label}
              </div>
              <p className="text-xs text-text-secondary/80 mt-0.5">
                {decision.description}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${decision.bg} border ${decision.borderColor} ${decision.shadowColor} shadow-lg`}>
            <div className={`text-xl font-bold ${decision.color} font-mono`}>
              {formatISK(profit)}
            </div>
            <div className="text-xs text-text-secondary/70 text-center">
              Profit
            </div>
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-display text-text-primary mb-2">
          {item.name}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-text-secondary">From:</span>
            <span className="text-text-primary ml-2">{fromLocation}</span>
          </div>
          <div>
            <span className="text-text-secondary">To:</span>
            <span className="text-text-primary ml-2">{toLocation}</span>
          </div>
        </div>
      </div>

      {/* Decision Breakdown */}
      <div className="px-6 py-4 border-b border-white/5">
        <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
          Decision Factors
        </h4>
        <div className="space-y-2">
          {factors.map((factor, index) => (
            <FactorIndicator key={index} factor={factor} />
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Margin
            </div>
            <div className={`text-lg font-mono font-bold ${
              margin > 10 ? 'text-green-400' : margin > 5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {margin.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              Volume
            </div>
            <div className={`text-lg font-mono font-bold ${
              volume >= 50 ? 'text-green-400' : volume >= 10 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {formatNumber(volume, 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
              ROI
            </div>
            <div className={`text-lg font-mono font-bold ${
              roi > 15 ? 'text-green-400' : roi > 10 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {roi.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = eveLink}
            icon="🚀"
          >
            Open in EVE
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyDetails}
            icon={copyFeedback ? '✓' : '📋'}
          >
            {copyFeedback || 'Copy Details'}
          </Button>
          <Button
            variant={watched ? 'primary' : 'ghost'}
            size="sm"
            onClick={handleToggleWatchlist}
            icon={watched ? '★' : '☆'}
          >
            {watched ? 'Watching' : 'Add to Watchlist'}
          </Button>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default QuickDecisionCard;
