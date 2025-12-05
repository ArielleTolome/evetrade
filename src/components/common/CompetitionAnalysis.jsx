import { useMemo } from 'react';
import { formatISK, formatPercent } from '../../utils/formatters';
import { analyzeCompetition } from './CompetitionAnalysis.utils';


export function CompetitionAnalysis({ trade, compact = false }) {
  const analysis = useMemo(() => analyzeCompetition(trade), [trade]);

  if (compact) {
    return (
      <span
        className={`px-2 py-0.5 text-xs rounded-full ${analysis.levelInfo.bg} ${analysis.levelInfo.color}`}
        title={`${analysis.levelInfo.label} - Spread: ${formatPercent(analysis.spreadPercent / 100, 2)}`}
      >
        {analysis.levelInfo.icon} {analysis.levelInfo.label.split(' ')[0]}
      </span>
    );
  }

  return (
    <div className="bg-space-dark/30 rounded-lg p-4 border border-accent-cyan/10">
      <h4 className="text-sm font-medium text-accent-cyan mb-3">Competition Analysis</h4>

      {/* Level badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${analysis.levelInfo.bg} ${analysis.levelInfo.color}`}>
          {analysis.levelInfo.icon} {analysis.levelInfo.label}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-text-secondary">Spread</span>
          <div className="font-mono text-text-primary">{formatISK(analysis.spread, false)}</div>
          <div className="text-xs text-text-secondary">{formatPercent(analysis.spreadPercent / 100, 2)}</div>
        </div>

        <div>
          <span className="text-text-secondary">Est. Orders</span>
          <div className="font-mono text-text-primary">
            <span className="text-red-400">{analysis.estimatedBuyOrders}B</span>
            {' / '}
            <span className="text-green-400">{analysis.estimatedSellOrders}S</span>
          </div>
        </div>

        <div>
          <span className="text-text-secondary">Undercut Risk</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-space-dark rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  analysis.undercutRisk > 70 ? 'bg-red-400' :
                  analysis.undercutRisk > 40 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ width: `${analysis.undercutRisk}%` }}
              />
            </div>
            <span className="text-xs font-mono text-text-primary">{analysis.undercutRisk}%</span>
          </div>
        </div>

        <div>
          <span className="text-text-secondary">Margin</span>
          <div className={`font-mono ${
            analysis.margin > 15 ? 'text-green-400' :
            analysis.margin > 8 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {formatPercent(analysis.margin / 100, 1)}
          </div>
        </div>
      </div>

      {/* Recommended prices */}
      <div className="mt-4 pt-3 border-t border-accent-cyan/10">
        <div className="text-xs text-text-secondary mb-2">Recommended Prices</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-red-500/10 rounded px-2 py-1">
            <span className="text-red-400">Buy at:</span>
            <span className="ml-1 font-mono text-text-primary">{formatISK(analysis.recommendedBuy, false)}</span>
          </div>
          <div className="bg-green-500/10 rounded px-2 py-1">
            <span className="text-green-400">Sell at:</span>
            <span className="ml-1 font-mono text-text-primary">{formatISK(analysis.recommendedSell, false)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompetitionAnalysis;
