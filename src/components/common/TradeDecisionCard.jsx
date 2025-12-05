import { useMemo } from 'react';

/**
 * Trade Decision Indicator Component
 * Displays GO/WAIT/AVOID recommendation based on trade quality metrics
 */

/**
 * Calculate trade decision based on margin, volume, and competition
 * @param {Object} trade - Trade object with margin, volume, profit data
 * @param {Array} allTrades - All trades for competition analysis
 * @param {Object} options - Configuration options
 * @returns {Object} Decision object with recommendation and reasons
 */
export function calculateTradeDecision(trade, allTrades = [], options = {}) {
  const {
    marginThresholdHigh = 15,    // % margin for "good"
    marginThresholdLow = 5,      // % margin for "bad"
    volumeThresholdHigh = 200,   // units for "good" volume
    volumeThresholdLow = 50,     // units for "low" volume
    profitThresholdHigh = 5000000,  // ISK for "good" profit
    competitionThreshold = 5,    // number of similar trades = high competition
  } = options;

  const margin = (trade['Gross Margin'] || trade.margin || 0);
  const volume = trade['Volume'] || trade.volume || 0;
  const profit = trade['Net Profit'] || trade['Profit per Unit'] || trade.profit || 0;

  // Calculate competition (similar margin trades)
  const similarTrades = allTrades.filter(t => {
    const otherMargin = t['Gross Margin'] || t.margin || 0;
    return Math.abs(otherMargin - margin) < 2 && t !== trade;
  }).length;

  const reasons = [];
  let score = 50; // Start neutral

  // Margin scoring
  if (margin >= marginThresholdHigh) {
    score += 20;
    reasons.push({ type: 'positive', text: 'High margin', icon: 'trending-up' });
  } else if (margin >= marginThresholdLow) {
    score += 5;
    reasons.push({ type: 'neutral', text: 'Moderate margin', icon: 'minus' });
  } else {
    score -= 20;
    reasons.push({ type: 'negative', text: 'Low margin', icon: 'trending-down' });
  }

  // Volume scoring
  if (volume >= volumeThresholdHigh) {
    score += 15;
    reasons.push({ type: 'positive', text: 'Good volume', icon: 'bar-chart' });
  } else if (volume >= volumeThresholdLow) {
    score += 5;
    reasons.push({ type: 'neutral', text: 'Moderate volume', icon: 'minus' });
  } else {
    score -= 15;
    reasons.push({ type: 'negative', text: 'Low volume', icon: 'alert' });
  }

  // Profit scoring
  if (profit >= profitThresholdHigh) {
    score += 10;
    reasons.push({ type: 'positive', text: 'High profit', icon: 'dollar' });
  }

  // Competition scoring
  if (similarTrades < 3) {
    score += 10;
    reasons.push({ type: 'positive', text: 'Low competition', icon: 'users' });
  } else if (similarTrades >= competitionThreshold) {
    score -= 10;
    reasons.push({ type: 'negative', text: `${similarTrades} competitors`, icon: 'users' });
  }

  // Determine decision
  let decision;
  if (score >= 70) {
    decision = 'GO';
  } else if (score >= 40) {
    decision = 'WAIT';
  } else {
    decision = 'AVOID';
  }

  // Calculate confidence (0-100)
  const confidence = Math.min(100, Math.max(0, score));

  return {
    decision,
    score,
    confidence,
    reasons,
    summary: getSummary(decision, reasons)
  };
}

function getSummary(decision, reasons) {
  const positives = reasons.filter(r => r.type === 'positive').length;
  const negatives = reasons.filter(r => r.type === 'negative').length;

  if (decision === 'GO') {
    return `Strong opportunity with ${positives} positive indicators`;
  } else if (decision === 'WAIT') {
    return 'Mixed signals - monitor before acting';
  } else {
    return `${negatives} warning signs detected`;
  }
}

/**
 * Compact badge showing GO/WAIT/AVOID
 */
export function TradeDecisionBadge({ trade, allTrades = [], showReasons: _showReasons = false, className = '' }) {
  const { decision, reasons, confidence } = useMemo(
    () => calculateTradeDecision(trade, allTrades),
    [trade, allTrades]
  );

  const config = {
    GO: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    WAIT: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    AVOID: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const { bg, border, text, icon } = config[decision];

  return (
    <div className={`group relative inline-flex ${className}`}>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${bg} ${border} ${text} border`}>
        {icon}
        <span>{decision}</span>
      </span>

      {/* Tooltip with reasons */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="bg-space-dark border border-accent-cyan/20 rounded-lg p-3 shadow-xl min-w-48">
          <div className={`text-sm font-bold ${text} mb-2`}>{decision}</div>
          <div className="space-y-1">
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  reason.type === 'positive' ? 'bg-green-400' :
                  reason.type === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <span className="text-text-secondary">{reason.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-accent-cyan/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Confidence</span>
              <span className={text}>{confidence}%</span>
            </div>
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-space-dark" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full decision card for expanded view or detailed analysis
 */
export function TradeDecisionCard({ trade, allTrades = [], className = '' }) {
  const { decision, reasons, confidence, summary } = useMemo(
    () => calculateTradeDecision(trade, allTrades),
    [trade, allTrades]
  );

  const config = {
    GO: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      glow: 'shadow-green-500/20',
    },
    WAIT: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/20',
    },
    AVOID: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      glow: 'shadow-red-500/20',
    },
  };

  const { bg, border, text, glow } = config[decision];

  return (
    <div className={`${bg} ${border} border rounded-lg p-4 shadow-lg ${glow} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <TradeDecisionBadge trade={trade} allTrades={allTrades} />
          <span className={`text-lg font-bold ${text}`}>{decision}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-secondary">Confidence</div>
          <div className={`text-lg font-bold ${text}`}>{confidence}%</div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-3">
        <div className="h-2 bg-space-dark rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              decision === 'GO' ? 'bg-green-400' :
              decision === 'WAIT' ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-text-secondary mb-3">{summary}</p>

      {/* Reasons */}
      <div className="grid grid-cols-2 gap-2">
        {reasons.map((reason, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
              reason.type === 'positive' ? 'bg-green-500/10 text-green-400' :
              reason.type === 'negative' ? 'bg-red-500/10 text-red-400' :
              'bg-yellow-500/10 text-yellow-400'
            }`}
          >
            {reason.type === 'positive' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {reason.type === 'negative' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {reason.type === 'neutral' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
            <span>{reason.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mini inline indicator for table cells
 */
export function TradeDecisionDot({ trade, allTrades = [], className = '' }) {
  const { decision } = useMemo(
    () => calculateTradeDecision(trade, allTrades),
    [trade, allTrades]
  );

  const colors = {
    GO: 'bg-green-400',
    WAIT: 'bg-yellow-400',
    AVOID: 'bg-red-400',
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[decision]} ${className}`}
      title={decision}
    />
  );
}

export default TradeDecisionCard;
