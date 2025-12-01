import { useMemo } from 'react';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * Trade Opportunity Score Component
 * Visual indicator showing how good a trading opportunity is
 */
export function TradeOpportunityScore({
  trade,
  allTrades = [],
  showBreakdown = false,
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
}) {
  const score = useMemo(() => {
    if (!trade) return null;

    const margin = (trade['Gross Margin'] || 0);
    const volume = trade['Volume'] || 0;
    const netProfit = trade['Net Profit'] || 0;
    const profitPerUnit = trade['Profit per Unit'] || 0;
    const buyPrice = trade['Buy Price'] || 1;

    // Calculate component scores (0-100)
    const marginScore = Math.min(margin / 25 * 100, 100);

    // Volume score relative to market (logarithmic scale)
    const volumeScore = Math.min(Math.log10(volume + 1) / Math.log10(10000) * 100, 100);

    // Profit score (logarithmic scale for large values)
    const profitScore = Math.min(Math.log10(netProfit + 1) / Math.log10(100000000) * 100, 100);

    // ROI score (profit relative to investment)
    const roi = (profitPerUnit / buyPrice) * 100;
    const roiScore = Math.min(roi / 20 * 100, 100);

    // Competition score (inverse - fewer orders = higher score)
    // This would need order count data, using margin volatility as proxy
    const competitionScore = margin > 5 ? Math.min(margin / 15 * 100, 100) : 0;

    // Calculate overall score with weighted components
    const overall = (
      marginScore * 0.25 +
      volumeScore * 0.25 +
      profitScore * 0.30 +
      roiScore * 0.10 +
      competitionScore * 0.10
    );

    // Determine grade
    let grade, gradeColor, gradeBg;
    if (overall >= 85) {
      grade = 'S';
      gradeColor = 'text-accent-gold';
      gradeBg = 'bg-accent-gold/20';
    } else if (overall >= 70) {
      grade = 'A';
      gradeColor = 'text-green-400';
      gradeBg = 'bg-green-500/20';
    } else if (overall >= 55) {
      grade = 'B';
      gradeColor = 'text-blue-400';
      gradeBg = 'bg-blue-500/20';
    } else if (overall >= 40) {
      grade = 'C';
      gradeColor = 'text-yellow-400';
      gradeBg = 'bg-yellow-500/20';
    } else if (overall >= 25) {
      grade = 'D';
      gradeColor = 'text-orange-400';
      gradeBg = 'bg-orange-500/20';
    } else {
      grade = 'F';
      gradeColor = 'text-red-400';
      gradeBg = 'bg-red-500/20';
    }

    return {
      overall: Math.round(overall),
      grade,
      gradeColor,
      gradeBg,
      components: {
        margin: { score: Math.round(marginScore), value: margin, label: 'Margin' },
        volume: { score: Math.round(volumeScore), value: volume, label: 'Volume' },
        profit: { score: Math.round(profitScore), value: netProfit, label: 'Profit' },
        roi: { score: Math.round(roiScore), value: roi, label: 'ROI' },
      },
    };
  }, [trade]);

  if (!score) return null;

  const sizeClasses = {
    sm: {
      container: 'gap-1',
      grade: 'w-6 h-6 text-xs',
      bar: 'h-1 w-10',
      text: 'text-[10px]',
    },
    md: {
      container: 'gap-2',
      grade: 'w-8 h-8 text-sm',
      bar: 'h-1.5 w-16',
      text: 'text-xs',
    },
    lg: {
      container: 'gap-3',
      grade: 'w-10 h-10 text-base',
      bar: 'h-2 w-20',
      text: 'text-sm',
    },
  };

  const s = sizeClasses[size];

  return (
    <div className={`flex items-center ${s.container} ${className}`}>
      {/* Grade Badge */}
      <div className={`
        ${s.grade} rounded-lg font-bold flex items-center justify-center
        ${score.gradeBg} ${score.gradeColor}
      `}>
        {score.grade}
      </div>

      {/* Score Bar or Breakdown */}
      {showBreakdown ? (
        <div className="flex flex-col gap-1">
          {Object.entries(score.components).map(([key, comp]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`${s.text} text-text-secondary w-12`}>{comp.label}</span>
              <div className={`${s.bar} bg-space-dark rounded-full overflow-hidden`}>
                <div
                  className={`h-full rounded-full transition-all ${
                    comp.score >= 70 ? 'bg-green-400' :
                    comp.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${comp.score}%` }}
                />
              </div>
              <span className={`${s.text} text-text-secondary w-6`}>{comp.score}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <div className={`${s.bar} bg-space-dark rounded-full overflow-hidden`}>
            <div
              className={`h-full rounded-full transition-all ${
                score.overall >= 70 ? 'bg-green-400' :
                score.overall >= 40 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${score.overall}%` }}
            />
          </div>
          <span className={`${s.text} text-text-secondary`}>{score.overall}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact trade opportunity indicator for table cells
 */
export function TradeOpportunityBadge({ trade, className = '' }) {
  const score = useMemo(() => {
    if (!trade) return null;

    const margin = (trade['Gross Margin'] || 0);
    const volume = trade['Volume'] || 0;
    const netProfit = trade['Net Profit'] || 0;

    // Quick score calculation
    const marginScore = Math.min(margin / 25 * 100, 100);
    const volumeScore = Math.min(Math.log10(volume + 1) / Math.log10(10000) * 100, 100);
    const profitScore = Math.min(Math.log10(netProfit + 1) / Math.log10(100000000) * 100, 100);

    const overall = (marginScore * 0.3 + volumeScore * 0.3 + profitScore * 0.4);

    if (overall >= 80) return { emoji: '🔥', label: 'Hot', color: 'text-orange-400' };
    if (overall >= 65) return { emoji: '⭐', label: 'Great', color: 'text-accent-gold' };
    if (overall >= 50) return { emoji: '👍', label: 'Good', color: 'text-green-400' };
    if (overall >= 35) return { emoji: '👌', label: 'OK', color: 'text-blue-400' };
    return { emoji: '📊', label: 'Low', color: 'text-text-secondary' };
  }, [trade]);

  if (!score) return null;

  return (
    <span className={`inline-flex items-center gap-1 ${score.color} ${className}`} title={score.label}>
      <span>{score.emoji}</span>
    </span>
  );
}

export default TradeOpportunityScore;
