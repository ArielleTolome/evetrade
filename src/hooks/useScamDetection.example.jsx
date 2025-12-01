/**
 * Example Usage of useScamDetection Hook
 *
 * This file demonstrates various ways to use the scam detection system.
 * Copy these examples into your components as needed.
 */

import React from 'react';
import { useScamDetection } from './useScamDetection';

/**
 * Example 1: Basic scam detection in a trading table
 */
export function TradingTableWithScamDetection({ trades }) {
  const { calculateScamRisk, isLikelyScam } = useScamDetection();

  return (
    <div>
      {trades.map((trade, index) => {
        const risk = calculateScamRisk(trade, trades);
        const isScam = isLikelyScam(trade, trades);

        return (
          <div
            key={index}
            className={`trade-row ${isScam ? 'bg-red-500/20 border-red-500' : ''}`}
          >
            <div className="flex justify-between items-center">
              <span>{trade.Item}</span>

              {/* Risk indicator */}
              {risk.level !== 'low' && (
                <div className={`risk-badge ${
                  risk.level === 'extreme' ? 'bg-red-600' :
                  risk.level === 'high' ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`}>
                  {risk.level.toUpperCase()} RISK ({risk.score})
                </div>
              )}
            </div>

            {/* Show warnings if any */}
            {risk.reasons.length > 0 && (
              <div className="warnings mt-2 text-sm text-red-400">
                {risk.reasons.map((reason, i) => (
                  <div key={i}>⚠️ {reason}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Example 2: Scam warning modal for high-risk trades
 */
export function ScamWarningModal({ trade, allTrades, onConfirm, onCancel }) {
  const { getDetailedAssessment } = useScamDetection();
  const assessment = getDetailedAssessment(trade, allTrades);

  if (assessment.level === 'low') {
    return null; // No warning needed for low-risk trades
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="text-xl font-bold text-red-500">
          {assessment.summary}
        </h2>

        <div className="my-4">
          <h3 className="font-semibold mb-2">Warning Reasons:</h3>
          <ul className="list-disc pl-5">
            {assessment.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="my-4">
          <h3 className="font-semibold mb-2">Recommendations:</h3>
          <ul className="list-disc pl-5">
            {assessment.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={onCancel} className="btn-primary">
            Cancel Trade
          </button>
          {assessment.level !== 'extreme' && (
            <button onClick={onConfirm} className="btn-secondary">
              Proceed Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Statistics dashboard for market analysis
 */
export function ScamStatisticsDashboard({ trades }) {
  const { getScamStatistics } = useScamDetection();
  const stats = getScamStatistics(trades);

  return (
    <div className="stats-grid grid grid-cols-5 gap-4">
      <div className="stat-card">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-sm">Total Trades</div>
      </div>

      <div className="stat-card bg-red-500/20">
        <div className="text-2xl font-bold text-red-400">{stats.extremeRisk}</div>
        <div className="text-sm">Extreme Risk</div>
      </div>

      <div className="stat-card bg-orange-500/20">
        <div className="text-2xl font-bold text-orange-400">{stats.highRisk}</div>
        <div className="text-sm">High Risk</div>
      </div>

      <div className="stat-card bg-yellow-500/20">
        <div className="text-2xl font-bold text-yellow-400">{stats.mediumRisk}</div>
        <div className="text-sm">Medium Risk</div>
      </div>

      <div className="stat-card bg-green-500/20">
        <div className="text-2xl font-bold text-green-400">{stats.lowRisk}</div>
        <div className="text-sm">Low Risk</div>
      </div>

      <div className="stat-card col-span-5">
        <div className="text-lg font-semibold">
          Average Risk Score: {stats.averageScore.toFixed(1)}/100
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Custom configuration for different risk tolerance
 */
export function ConservativeScamDetection({ trades }) {
  // More conservative settings - flags more trades as risky
  const { analyzeAll } = useScamDetection({
    singleVolumePoints: 80,      // Even harsher on single volume
    scamThreshold: 40,           // Lower threshold for scam determination
    extremeMarginThreshold: 40,  // Flag margins over 40% as extreme
    lowVolumeThreshold: 50,      // Consider anything under 50 units as low
  });

  const analyzedTrades = analyzeAll(trades);
  const safeTrades = analyzedTrades.filter(t => t.scamRisk.level === 'low');

  return (
    <div>
      <h3>Safe Trades Only ({safeTrades.length} of {trades.length})</h3>
      {safeTrades.map((trade, i) => (
        <div key={i}>{trade.Item} - Score: {trade.scamRisk.score}</div>
      ))}
    </div>
  );
}

/**
 * Example 5: Integration with existing StationTradingPage
 */
export function EnhancedStationTradingPage() {
  const { calculateScamRisk, getScamStatistics } = useScamDetection();
  const [data, setData] = React.useState([]);

  // Add scam risk to table columns
  const enhancedColumns = [
    // ... existing columns ...
    {
      key: 'scamRisk',
      label: 'Risk',
      render: (_, row) => {
        const risk = calculateScamRisk(row, data);

        if (risk.level === 'low') return null;

        return (
          <div className={`px-2 py-1 rounded text-xs ${
            risk.level === 'extreme' ? 'bg-red-600 text-white' :
            risk.level === 'high' ? 'bg-orange-500 text-white' :
            'bg-yellow-500 text-black'
          }`}>
            {risk.level}
          </div>
        );
      },
    },
  ];

  const stats = getScamStatistics(data);

  return (
    <div>
      {/* Show warning banner if high scam prevalence */}
      {stats.extremeRisk + stats.highRisk > data.length * 0.3 && (
        <div className="warning-banner bg-red-500/20 border-red-500 p-4 mb-4">
          ⚠️ Warning: {((stats.extremeRisk + stats.highRisk) / data.length * 100).toFixed(0)}%
          of results show high scam risk. Trade with extreme caution.
        </div>
      )}

      {/* Rest of the page */}
    </div>
  );
}

/**
 * Example 6: Simple inline check before executing a trade
 */
export function QuickScamCheck({ trade, allTrades, onProceed }) {
  const { isLikelyScam, getScamWarnings } = useScamDetection();

  const handleTrade = () => {
    if (isLikelyScam(trade, allTrades)) {
      const warnings = getScamWarnings(trade, allTrades);
      const confirmed = window.confirm(
        `WARNING: This trade is likely a scam!\n\n${warnings.join('\n')}\n\nDo you still want to proceed?`
      );
      if (!confirmed) return;
    }
    onProceed();
  };

  return (
    <button onClick={handleTrade} className="btn-primary">
      Execute Trade
    </button>
  );
}

/**
 * Example 7: Filter out scam trades automatically
 */
export function SafeTradesOnly({ trades }) {
  const { analyzeAll } = useScamDetection();

  const safeTrades = React.useMemo(() => {
    const analyzed = analyzeAll(trades);
    // Only show trades with low or medium risk
    return analyzed.filter(t =>
      t.scamRisk.level === 'low' || t.scamRisk.level === 'medium'
    );
  }, [trades, analyzeAll]);

  return (
    <div>
      <p>Showing {safeTrades.length} safe trades (filtered out {trades.length - safeTrades.length} high-risk trades)</p>
      {/* Render safe trades */}
    </div>
  );
}
