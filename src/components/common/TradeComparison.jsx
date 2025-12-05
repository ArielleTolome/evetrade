import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { formatISK, formatPercent, formatNumber } from '../../utils/formatters';

const COMPARISON_METRICS = [
  { key: 'Net Profit', label: 'Net Profit', format: 'isk', higherIsBetter: true, weight: 0.35 },
  { key: 'Gross Margin', label: 'Margin', format: 'percent', higherIsBetter: true, weight: 0.20 },
  { key: 'Volume', label: 'Volume', format: 'number', higherIsBetter: true, weight: 0.25 },
  { key: 'Profit per Unit', label: 'Profit/Unit', format: 'isk', higherIsBetter: true, weight: 0.15 },
  { key: 'Buy Price', label: 'Buy Price', format: 'isk', higherIsBetter: false, weight: 0.05 },
];

/**
 * Format value based on type
 */
function formatValue(value, format) {
  switch (format) {
    case 'isk': return formatISK(value, false);
    case 'percent': return formatPercent(value / 100, 1);
    case 'number': return formatNumber(value, 0);
    default: return value;
  }
}

/**
 * Calculate overall score for a trade
 */
function calculateOverallScore(trade, allTrades, metrics) {
  let score = 0;

  metrics.forEach(metric => {
    const values = allTrades.map(t => t[metric.key] || 0);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = maxVal - minVal || 1;
    const value = trade[metric.key] || 0;

    let normalizedScore;
    if (metric.higherIsBetter) {
      normalizedScore = (value - minVal) / range;
    } else {
      normalizedScore = (maxVal - value) / range;
    }

    score += normalizedScore * metric.weight;
  });

  return score;
}

/**
 * Generate comparison URL hash
 */
function generateComparisonHash(trades) {
  const itemIds = trades.map(t => t['Item ID'] || t['Item']).join(',');
  return btoa(itemIds).substring(0, 16);
}

/**
 * Export comparison as image using Canvas API
 */
function exportAsImage(elementRef, filename = 'trade-comparison.png') {
  if (!elementRef.current) return;

  // Use html2canvas or similar library in production
  // For now, we'll use a simple screenshot approach
  import('html2canvas').then(html2canvas => {
    html2canvas.default(elementRef.current, {
      backgroundColor: '#0a0e1a',
      scale: 2,
    }).then(canvas => {
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  }).catch(() => {
    // Fallback: just show a message if html2canvas is not available
    alert('Image export requires html2canvas library. Please copy the comparison manually.');
  });
}

/**
 * TradeComparison Component
 * Compare multiple trades side by side with advanced features
 */
export function TradeComparison({
  trades = [],
  onRemove,
  onClear,
  maxTrades = 4,
  enableDragDrop = false,
  onAddTrade,
}) {
  const [pinnedMetrics, setPinnedMetrics] = useState(['Net Profit', 'Volume']);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pinnedComparisons, setPinnedComparisons] = useState(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('evetrade_pinned_comparisons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [dragOver, setDragOver] = useState(null);
  const comparisonRef = useRef(null);
  const shareUrlRef = useRef(null);

  // Save pinned comparisons to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('evetrade_pinned_comparisons', JSON.stringify(pinnedComparisons));
    } catch (e) {
      console.error('Failed to save pinned comparisons:', e);
    }
  }, [pinnedComparisons]);

  // Find best value for each metric
  const bestValues = useMemo(() => {
    const best = {};
    COMPARISON_METRICS.forEach(metric => {
      const values = trades.map(t => t[metric.key] || 0);
      if (values.length === 0) return;

      if (metric.higherIsBetter) {
        best[metric.key] = Math.max(...values);
      } else {
        best[metric.key] = Math.min(...values);
      }
    });
    return best;
  }, [trades]);

  // Calculate overall scores
  const scores = useMemo(() => {
    return trades.map(trade => ({
      trade,
      score: calculateOverallScore(trade, trades, COMPARISON_METRICS),
    }));
  }, [trades]);

  // Find overall winner
  const winner = useMemo(() => {
    if (scores.length === 0) return null;
    return scores.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  }, [scores]);

  // Toggle pinned metric
  const togglePinned = useCallback((key) => {
    setPinnedMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  // Pin current comparison
  const pinComparison = useCallback(() => {
    if (trades.length < 2) return;

    const comparison = {
      id: generateComparisonHash(trades),
      trades: trades.map(t => ({
        'Item': t['Item'],
        'Item ID': t['Item ID'],
        'Net Profit': t['Net Profit'],
        'Gross Margin': t['Gross Margin'],
        'Volume': t['Volume'],
        'Profit per Unit': t['Profit per Unit'],
        'Buy Price': t['Buy Price'],
      })),
      timestamp: Date.now(),
      winnerItem: winner?.trade['Item'],
    };

    setPinnedComparisons(prev => {
      const exists = prev.find(p => p.id === comparison.id);
      if (exists) return prev;
      return [comparison, ...prev].slice(0, 10); // Keep max 10
    });
  }, [trades, winner]);

  // Remove pinned comparison
  const removePinnedComparison = useCallback((id) => {
    setPinnedComparisons(prev => prev.filter(p => p.id !== id));
  }, []);

  // Load pinned comparison
  const loadPinnedComparison = useCallback((comparison) => {
    onClear?.();
    comparison.trades.forEach(trade => {
      onAddTrade?.(trade);
    });
  }, [onClear, onAddTrade]);

  // Share comparison
  const shareComparison = useCallback(() => {
    const hash = generateComparisonHash(trades);
    const _url = `${window.location.origin}${window.location.pathname}?comparison=${hash}`;
    setShowShareModal(true);
  }, [trades]);

  // Copy share URL
  const copyShareUrl = useCallback(() => {
    if (shareUrlRef.current) {
      shareUrlRef.current.select();
      document.execCommand('copy');
      // Could add a toast notification here
    }
  }, []);

  // Export as CSV
  const exportCSV = useCallback(() => {
    const headers = ['Metric', ...trades.map((t, i) => `Trade ${i + 1}: ${t['Item']}`)];
    const rows = COMPARISON_METRICS.map(metric => [
      metric.label,
      ...trades.map(trade => {
        const value = trade[metric.key] || 0;
        return formatValue(value, metric.format);
      })
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trade-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [trades]);

  // Export as image
  const exportImage = useCallback(() => {
    exportAsImage(comparisonRef, 'trade-comparison.png');
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e, slotIndex) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    setDragOver(slotIndex);
  }, [enableDragDrop]);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e, _slotIndex) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    setDragOver(null);

    try {
      const tradeData = JSON.parse(e.dataTransfer.getData('trade'));
      onAddTrade?.(tradeData);
    } catch (err) {
      console.error('Failed to parse dropped trade:', err);
    }
  }, [enableDragDrop, onAddTrade]);

  if (trades.length === 0) {
    return (
      <div className="bg-space-dark/40 backdrop-blur-sm border border-accent-cyan/20 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚖️</div>
        <h3 className="font-display text-lg text-text-primary mb-2">Trade Comparison</h3>
        <p className="text-text-secondary text-sm mb-4">
          Select 2-{maxTrades} trades to compare them side by side
        </p>
        {enableDragDrop && (
          <p className="text-xs text-text-secondary">
            Drag trades here to add them to comparison
          </p>
        )}

        {/* Pinned Comparisons */}
        {pinnedComparisons.length > 0 && (
          <div className="mt-6 pt-6 border-t border-accent-cyan/10">
            <h4 className="text-sm text-text-secondary mb-3">Pinned Comparisons</h4>
            <div className="space-y-2">
              {pinnedComparisons.map(comparison => (
                <div
                  key={comparison.id}
                  className="flex items-center justify-between p-3 bg-space-mid/30 rounded-lg hover:bg-space-mid/50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="text-sm text-text-primary">
                      {comparison.trades.map(t => t['Item']).join(' vs ')}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Winner: {comparison.winnerItem}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadPinnedComparison(comparison)}
                      className="text-xs text-accent-cyan hover:text-accent-cyan/80"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => removePinnedComparison(comparison.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        ref={comparisonRef}
        className="bg-space-dark/40 backdrop-blur-sm border border-accent-cyan/20 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent-cyan/10 bg-space-mid/50">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg text-accent-cyan">
              Comparing {trades.length} Trades
            </h3>
            {trades.length >= 2 && (
              <button
                onClick={pinComparison}
                className="text-xs text-accent-gold hover:text-accent-gold/80 flex items-center gap-1"
                title="Pin this comparison"
              >
                <span>📌</span>
                Pin
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="text-xs text-accent-cyan hover:text-accent-cyan/80 px-2 py-1 rounded border border-accent-cyan/30 hover:border-accent-cyan/50"
            >
              Export CSV
            </button>
            <button
              onClick={exportImage}
              className="text-xs text-accent-cyan hover:text-accent-cyan/80 px-2 py-1 rounded border border-accent-cyan/30 hover:border-accent-cyan/50"
            >
              Export Image
            </button>
            <button
              onClick={shareComparison}
              className="text-xs text-accent-cyan hover:text-accent-cyan/80 px-2 py-1 rounded border border-accent-cyan/30 hover:border-accent-cyan/50"
            >
              Share
            </button>
            <button
              onClick={onClear}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Trade headers */}
        <div className={`grid grid-cols-[150px_repeat(${maxTrades},1fr)] border-b border-accent-cyan/10`}>
          <div className="p-3 bg-space-mid/50 text-sm text-text-secondary font-medium">Metric</div>
          {Array(maxTrades).fill(null).map((_, idx) => {
            const trade = trades[idx];
            if (trade) {
              const isWinner = winner?.trade === trade;
              return (
                <div
                  key={idx}
                  className={`p-3 text-center relative ${isWinner ? 'bg-accent-gold/10' : 'bg-space-mid/30'}`}
                >
                  {isWinner && (
                    <div className="absolute top-1 right-1 text-accent-gold text-lg" title="Best Overall">
                      👑
                    </div>
                  )}
                  <div className="font-medium text-text-primary text-sm truncate pr-6" title={trade['Item']}>
                    {trade['Item']?.substring(0, 20)}{trade['Item']?.length > 20 ? '...' : ''}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Score: {(scores.find(s => s.trade === trade)?.score * 100 || 0).toFixed(0)}
                  </div>
                  <button
                    onClick={() => onRemove?.(trade)}
                    className="absolute top-1 left-1 text-text-secondary hover:text-red-400 text-lg leading-none w-5 h-5 flex items-center justify-center"
                    title="Remove from comparison"
                  >
                    ×
                  </button>
                </div>
              );
            }

            // Empty slot
            return (
              <div
                key={`empty-${idx}`}
                className={`p-3 bg-space-dark/30 text-center text-text-secondary text-xs flex items-center justify-center cursor-pointer hover:bg-space-dark/40 transition-colors ${dragOver === idx ? 'bg-accent-cyan/10 border-2 border-dashed border-accent-cyan' : ''}`}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
              >
                {enableDragDrop ? 'Drop trade here' : '+ Add trade'}
              </div>
            );
          })}
        </div>

        {/* Metrics comparison */}
        <div className="divide-y divide-accent-cyan/5">
          {COMPARISON_METRICS.map(metric => {
            const isPinned = pinnedMetrics.includes(metric.key);

            return (
              <div
                key={metric.key}
                className={`grid grid-cols-[150px_repeat(${maxTrades},1fr)] ${isPinned ? 'bg-accent-cyan/5' : ''}`}
              >
                <div className="p-3 flex items-center gap-2">
                  <button
                    onClick={() => togglePinned(metric.key)}
                    className={`text-sm ${isPinned ? 'text-accent-cyan' : 'text-text-secondary'} hover:text-accent-cyan transition-colors`}
                    title={isPinned ? 'Unpin metric' : 'Pin metric'}
                  >
                    {isPinned ? '★' : '☆'}
                  </button>
                  <span className="text-sm text-text-secondary">{metric.label}</span>
                  <span className="text-xs text-text-secondary/50" title={`Weight: ${metric.weight * 100}%`}>
                    ({metric.weight * 100}%)
                  </span>
                </div>

                {Array(maxTrades).fill(null).map((_, idx) => {
                  const trade = trades[idx];
                  if (trade) {
                    const value = trade[metric.key] || 0;
                    const isBest = value === bestValues[metric.key];

                    return (
                      <div
                        key={idx}
                        className={`p-3 text-center ${isBest ? 'bg-green-500/10' : ''}`}
                      >
                        <span className={`font-mono text-sm ${isBest ? 'text-green-400 font-bold' : 'text-text-primary'}`}>
                          {formatValue(value, metric.format)}
                        </span>
                        {isBest && <span className="ml-1 text-xs text-green-400">✓</span>}
                      </div>
                    );
                  }

                  return (
                    <div key={`empty-${idx}`} className="p-3 bg-space-dark/20" />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Recommendation */}
        {winner && trades.length >= 2 && (
          <div className="p-4 bg-accent-gold/10 border-t border-accent-gold/20">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-accent-gold text-lg">👑</span>
              <span className="text-text-primary font-medium">Recommended:</span>
              <span className="text-accent-gold font-semibold">{winner.trade['Item']}</span>
              <span className="text-text-secondary text-sm">
                (Overall Score: {(winner.score * 100).toFixed(0)}/100)
              </span>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              This trade has the best weighted score across all metrics. Consider volume and margin when making your final decision.
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-space-dark border border-accent-cyan/30 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-accent-cyan mb-4">Share Comparison</h3>
            <p className="text-sm text-text-secondary mb-4">
              Copy this URL to share your trade comparison:
            </p>
            <div className="flex gap-2 mb-4">
              <input
                ref={shareUrlRef}
                type="text"
                readOnly
                value={`${window.location.origin}${window.location.pathname}?comparison=${generateComparisonHash(trades)}`}
                className="flex-1 px-3 py-2 bg-space-black/50 border border-accent-cyan/20 rounded text-text-primary text-sm font-mono"
              />
              <button
                onClick={copyShareUrl}
                className="px-4 py-2 bg-accent-cyan text-space-dark rounded font-medium hover:bg-accent-cyan/80 transition-colors"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 bg-space-mid/50 border border-accent-cyan/20 rounded text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default TradeComparison;
