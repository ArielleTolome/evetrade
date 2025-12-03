import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { PriceHistoryChart } from '../components/common/PriceHistoryChart';
import { useResources } from '../hooks/useResources';
import { useEveAuth } from '../hooks/useEveAuth';
import { useWatchlist } from '../hooks/useWatchlist';
import { useFavorites } from '../hooks/useFavorites';
import { getMarketOrders, getMarketHistory, getWalletBalance, analyzeMarketOrders } from '../api/esi';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Calculate trading signal based on multiple factors
 */
function calculateTradingSignal(metrics) {
  const {
    margin,
    volume,
    competition,
    volatility,
    spread,
    trendDirection,
    priceStability,
  } = metrics;

  let score = 50;
  const positives = [];
  const negatives = [];

  // Margin analysis (0-25 points)
  if (margin >= 20) {
    score += 25;
    positives.push('High margin');
  } else if (margin >= 10) {
    score += 15;
    positives.push('Good margin');
  } else if (margin >= 5) {
    score += 5;
  } else {
    score -= 10;
    negatives.push('Low margin');
  }

  // Volume analysis (0-20 points)
  if (volume >= 100) {
    score += 20;
    positives.push('High volume');
  } else if (volume >= 50) {
    score += 10;
  } else if (volume >= 10) {
    score += 5;
    negatives.push('Moderate volume');
  } else {
    score -= 15;
    negatives.push('Low volume');
  }

  // Competition analysis (0-15 points)
  if (competition <= 5) {
    score += 15;
    positives.push('Low competition');
  } else if (competition <= 15) {
    score += 5;
  } else if (competition <= 30) {
    score -= 5;
    negatives.push('High competition');
  } else {
    score -= 15;
    negatives.push(`${competition} competitors`);
  }

  // Spread analysis (0-10 points)
  if (spread <= 2) {
    score += 10;
    positives.push('Tight spread');
  } else if (spread <= 5) {
    score += 5;
  } else if (spread >= 15) {
    score -= 5;
    negatives.push('Wide spread');
  }

  // Volatility (can be positive or negative)
  if (volatility <= 5) {
    score += 5;
    positives.push('Stable price');
  } else if (volatility >= 20) {
    score -= 10;
    negatives.push('High volatility');
  }

  // Trend direction
  if (trendDirection === 'up') {
    score += 5;
    positives.push('Upward trend');
  } else if (trendDirection === 'down') {
    score -= 5;
    negatives.push('Downward trend');
  }

  // Determine signal
  let signal, description;
  if (score >= 75) {
    signal = 'STRONG_BUY';
    description = 'Excellent opportunity - act now';
  } else if (score >= 60) {
    signal = 'BUY';
    description = 'Good opportunity with favorable conditions';
  } else if (score >= 45) {
    signal = 'WAIT';
    description = 'Mixed signals - monitor before acting';
  } else if (score >= 30) {
    signal = 'CAUTION';
    description = 'Unfavorable conditions - proceed carefully';
  } else {
    signal = 'AVOID';
    description = 'High risk - not recommended';
  }

  return {
    signal,
    score: Math.max(0, Math.min(100, score)),
    description,
    positives,
    negatives,
  };
}

/**
 * Calculate volatility index from price history
 */
function calculateVolatility(history) {
  if (!history || history.length < 2) return { index: 0, label: 'Unknown', color: 'text-gray-400' };

  const prices = history.slice(-30).map(h => h.average);
  if (prices.length < 2) return { index: 0, label: 'Unknown', color: 'text-gray-400' };

  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDiffs = prices.map(p => Math.pow(p - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  const volatilityPercent = (stdDev / mean) * 100;

  let label, color;
  if (volatilityPercent < 3) {
    label = 'Very Stable';
    color = 'text-green-400';
  } else if (volatilityPercent < 8) {
    label = 'Stable';
    color = 'text-accent-cyan';
  } else if (volatilityPercent < 15) {
    label = 'Moderate';
    color = 'text-yellow-400';
  } else if (volatilityPercent < 25) {
    label = 'Volatile';
    color = 'text-orange-400';
  } else {
    label = 'Highly Volatile';
    color = 'text-red-400';
  }

  return { index: volatilityPercent, label, color };
}

/**
 * Calculate price trend from history
 */
function calculateTrend(history) {
  if (!history || history.length < 7) return { direction: 'neutral', strength: 0, label: 'Insufficient data' };

  const recent = history.slice(-7);
  const older = history.slice(-14, -7);

  if (older.length === 0) return { direction: 'neutral', strength: 0, label: 'Insufficient data' };

  const recentAvg = recent.reduce((a, b) => a + b.average, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b.average, 0) / older.length;

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

  let direction, label, color;
  if (changePercent > 5) {
    direction = 'up';
    label = 'Strong Uptrend';
    color = 'text-green-400';
  } else if (changePercent > 2) {
    direction = 'up';
    label = 'Uptrend';
    color = 'text-green-400';
  } else if (changePercent < -5) {
    direction = 'down';
    label = 'Strong Downtrend';
    color = 'text-red-400';
  } else if (changePercent < -2) {
    direction = 'down';
    label = 'Downtrend';
    color = 'text-red-400';
  } else {
    direction = 'neutral';
    label = 'Sideways';
    color = 'text-yellow-400';
  }

  return { direction, strength: Math.abs(changePercent), label, color, changePercent };
}

/**
 * Calculate estimated daily volume from market history
 * Uses average volume over the past 7 and 30 days
 */
function calculateDailyVolume(history) {
  if (!history || history.length === 0) {
    return {
      avg7Day: 0,
      avg30Day: 0,
      trend: 'unknown',
      trendPercent: 0,
      totalValue7Day: 0,
      totalValue30Day: 0,
      peakVolume: 0,
      lowVolume: 0,
    };
  }

  // Get last 7 and 30 days of data
  const last7Days = history.slice(-7);
  const last30Days = history.slice(-30);

  // Calculate average daily volume
  const avg7Day = last7Days.length > 0
    ? last7Days.reduce((sum, d) => sum + (d.volume || 0), 0) / last7Days.length
    : 0;

  const avg30Day = last30Days.length > 0
    ? last30Days.reduce((sum, d) => sum + (d.volume || 0), 0) / last30Days.length
    : 0;

  // Calculate total ISK value traded
  const totalValue7Day = last7Days.reduce((sum, d) => sum + ((d.volume || 0) * (d.average || 0)), 0);
  const totalValue30Day = last30Days.reduce((sum, d) => sum + ((d.volume || 0) * (d.average || 0)), 0);

  // Find peak and low volume days
  const peakVolume = Math.max(...last30Days.map(d => d.volume || 0));
  const lowVolume = Math.min(...last30Days.filter(d => d.volume > 0).map(d => d.volume || 0));

  // Calculate volume trend (comparing last 7 days to previous 7 days)
  const previous7Days = history.slice(-14, -7);
  let trend = 'stable';
  let trendPercent = 0;

  if (previous7Days.length > 0) {
    const prevAvg = previous7Days.reduce((sum, d) => sum + (d.volume || 0), 0) / previous7Days.length;
    if (prevAvg > 0) {
      trendPercent = ((avg7Day - prevAvg) / prevAvg) * 100;
      if (trendPercent > 20) trend = 'increasing';
      else if (trendPercent > 5) trend = 'slightly_increasing';
      else if (trendPercent < -20) trend = 'decreasing';
      else if (trendPercent < -5) trend = 'slightly_decreasing';
      else trend = 'stable';
    }
  }

  return {
    avg7Day,
    avg30Day,
    trend,
    trendPercent,
    totalValue7Day,
    totalValue30Day,
    peakVolume,
    lowVolume,
  };
}

/**
 * Quick Profit Calculator Component
 */
function QuickProfitCalculator({ buyPrice, sellPrice, tax = 0.08, brokerFee = 0.03, quantity = 1 }) {
  const [qty, setQty] = useState(quantity);

  const calculations = useMemo(() => {
    const buyCost = buyPrice * qty;
    const sellRevenue = sellPrice * qty;
    const salesTax = sellRevenue * tax;
    const brokerCost = (buyCost + sellRevenue) * brokerFee;
    const totalCost = buyCost + salesTax + brokerCost;
    const grossProfit = sellRevenue - buyCost;
    const netProfit = sellRevenue - totalCost;
    const roi = buyCost > 0 ? (netProfit / buyCost) * 100 : 0;

    return {
      buyCost,
      sellRevenue,
      salesTax,
      brokerCost,
      totalCost,
      grossProfit,
      netProfit,
      roi,
    };
  }, [buyPrice, sellPrice, tax, brokerFee, qty]);

  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold text-accent-cyan mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Quick Profit Calculator
      </h3>

      <div className="mb-4">
        <label className="text-xs text-text-secondary mb-1 block">Quantity</label>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          className="w-full px-3 py-2 bg-space-dark/50 border border-white/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Buy Cost:</span>
          <span className="text-red-400 font-mono">{formatISK(calculations.buyCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Sell Revenue:</span>
          <span className="text-green-400 font-mono">{formatISK(calculations.sellRevenue)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Sales Tax ({formatPercent(tax)}):</span>
          <span className="text-orange-400 font-mono">-{formatISK(calculations.salesTax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Broker Fee ({formatPercent(brokerFee)}):</span>
          <span className="text-orange-400 font-mono">-{formatISK(calculations.brokerCost)}</span>
        </div>
        <div className="border-t border-white/10 pt-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Gross Profit:</span>
            <span className={`font-mono ${calculations.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(calculations.grossProfit)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white font-semibold">Net Profit:</span>
            <span className={`font-mono font-bold text-lg ${calculations.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(calculations.netProfit)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-text-secondary">ROI:</span>
            <span className={`font-mono ${calculations.roi >= 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
              {calculations.roi.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Trading Signal Card Component
 */
function TradingSignalCard({ signal, className = '' }) {
  const signalConfig = {
    STRONG_BUY: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', icon: '🚀' },
    BUY: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: '✓' },
    WAIT: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: '⏳' },
    CAUTION: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', icon: '⚠️' },
    AVOID: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', icon: '✗' },
  };

  const config = signalConfig[signal.signal] || signalConfig.WAIT;

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg ${config.bg} ${config.border} border ${config.text} font-bold text-sm`}>
            {config.icon} {signal.signal.replace('_', ' ')}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{signal.score}%</div>
          <div className="text-xs text-text-secondary">Confidence Score</div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="h-3 bg-space-dark rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              signal.score >= 60 ? 'bg-green-400' :
              signal.score >= 45 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${signal.score}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4">{signal.description}</p>

      <div className="grid grid-cols-2 gap-3">
        {signal.positives.map((item, idx) => (
          <div key={`pos-${idx}`} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded bg-green-500/10 text-green-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </div>
        ))}
        {signal.negatives.map((item, idx) => (
          <div key={`neg-${idx}`} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded bg-red-500/10 text-red-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Quick Copy Prices Component
 */
function QuickCopyPrices({ buyPrice, sellPrice, itemName }) {
  const [copiedField, setCopiedField] = useState(null);
  const [offset, setOffset] = useState(0.01);

  const copyToClipboard = async (value, field) => {
    try {
      await navigator.clipboard.writeText(value.toFixed(2));
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const PriceRow = ({ label, sublabel, price, field, variant = 'neutral' }) => {
    const variants = {
      neutral: 'bg-white/5 border-white/10 hover:bg-white/10',
      buy: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
      sell: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
    };

    return (
      <button
        onClick={() => copyToClipboard(price, field)}
        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${variants[variant]} ${copiedField === field ? 'ring-2 ring-accent-cyan' : ''}`}
      >
        <div className="text-left">
          <div className="text-sm text-text-primary">{label}</div>
          <div className="text-xs text-text-secondary">{sublabel}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-text-primary">{formatISK(price, false)}</span>
          {copiedField === field ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </button>
    );
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-accent-cyan">Quick Copy Prices</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary">Offset:</label>
          <input
            type="number"
            value={offset}
            onChange={(e) => setOffset(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
            step="0.01"
            min="0.01"
            className="w-16 px-2 py-1 text-xs bg-space-dark/50 border border-white/20 rounded text-white focus:outline-none focus:border-accent-cyan"
          />
          <span className="text-xs text-text-secondary">ISK</span>
        </div>
      </div>

      <div className="text-xs text-text-secondary mb-3 truncate">{itemName}</div>

      <div className="grid grid-cols-2 gap-4">
        {/* Buy Order Column */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
            Place Buy Order
          </div>
          <PriceRow label="Match Sell" sublabel="Instant buy" price={buyPrice} field="match-buy" variant="neutral" />
          <PriceRow label="Beat Sellers" sublabel={`-${offset} ISK`} price={buyPrice - offset} field="beat-sell" variant="buy" />
          <PriceRow label="Match Buyers" sublabel="Match top buy" price={sellPrice} field="match-buyer" variant="neutral" />
          <PriceRow label="Beat Buyers" sublabel={`+${offset} ISK`} price={sellPrice + offset} field="beat-buy" variant="buy" />
        </div>

        {/* Sell Order Column */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">
            Place Sell Order
          </div>
          <PriceRow label="Match Buyers" sublabel="Instant sell" price={sellPrice} field="match-sell" variant="neutral" />
          <PriceRow label="Beat Buyers" sublabel={`+${offset} ISK`} price={sellPrice + offset} field="overbid-sell" variant="sell" />
          <PriceRow label="Match Sellers" sublabel="Match top sell" price={buyPrice} field="match-seller" variant="neutral" />
          <PriceRow label="Beat Sellers" sublabel={`-${offset} ISK`} price={buyPrice - offset} field="undercut-sell" variant="sell" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-xs text-text-secondary">
          <span className="text-accent-cyan">Tip:</span> "Beat" prices help you become the top order. Use "Match" for instant trades.
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Wallet Funding Status Component
 */
function WalletFundingStatus({ walletBalance, tradeCost }) {
  const funded = walletBalance >= tradeCost;
  const fundedPercent = tradeCost > 0 ? Math.min(100, (walletBalance / tradeCost) * 100) : 100;
  const shortfall = Math.max(0, tradeCost - walletBalance);

  return (
    <GlassmorphicCard className={funded ? 'border-green-500/30' : 'border-red-500/30'}>
      <div className="flex items-center gap-3 mb-3">
        {funded ? (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div>
          <h3 className={`font-semibold ${funded ? 'text-green-400' : 'text-red-400'}`}>
            {funded ? 'Sufficient Funds' : 'Insufficient Funds'}
          </h3>
          {!funded && <p className="text-xs text-text-secondary">You need {formatISK(shortfall)} more</p>}
        </div>
      </div>

      <div className="mb-3">
        <div className="h-2 bg-space-dark rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${funded ? 'bg-green-400' : 'bg-red-400'}`}
            style={{ width: `${fundedPercent}%` }}
          />
        </div>
        <div className="text-xs text-text-secondary mt-1">{fundedPercent.toFixed(0)}% funded</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Your Wallet:</span>
          <span className="text-white font-mono">{formatISK(walletBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Trade Cost:</span>
          <span className="text-white font-mono">{formatISK(tradeCost)}</span>
        </div>
        {!funded && (
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-text-secondary">Shortfall:</span>
            <span className="text-red-400 font-mono">{formatISK(shortfall)}</span>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Market Competition Card
 */
function MarketCompetitionCard({ analysis }) {
  const competitionLevel = analysis?.competitionLevel || 'unknown';
  const config = {
    low: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Low Competition' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Medium Competition' },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'High Competition' },
    extreme: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Extreme Competition' },
    unknown: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Unknown' },
  };
  const c = config[competitionLevel];

  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold text-accent-cyan mb-4">Market Competition</h3>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${c.bg} ${c.color} font-semibold mb-4`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {c.label}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-space-dark/30 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{analysis?.buyOrders || 0}</div>
          <div className="text-xs text-text-secondary">Buy Orders</div>
          <div className="text-xs text-green-400 mt-1">{analysis?.buyersAtBestPrice || 0} at best price</div>
        </div>
        <div className="text-center p-3 bg-space-dark/30 rounded-lg">
          <div className="text-2xl font-bold text-red-400">{analysis?.sellOrders || 0}</div>
          <div className="text-xs text-text-secondary">Sell Orders</div>
          <div className="text-xs text-red-400 mt-1">{analysis?.sellersAtBestPrice || 0} at best price</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">Spread:</span>
          <span className={`font-mono ${analysis?.spread < 5 ? 'text-green-400' : 'text-yellow-400'}`}>
            {analysis?.spread?.toFixed(2) || 0}%
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">Total Buy Volume:</span>
          <span className="text-white font-mono">{formatNumber(analysis?.totalBuyVolume || 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Total Sell Volume:</span>
          <span className="text-white font-mono">{formatNumber(analysis?.totalSellVolume || 0)}</span>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Volatility & Trend Card
 */
function VolatilityTrendCard({ volatility, trend }) {
  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold text-accent-cyan mb-4">Price Analysis</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Volatility */}
        <div className="p-4 bg-space-dark/30 rounded-lg">
          <div className="text-xs text-text-secondary mb-2">Volatility Index</div>
          <div className={`text-xl font-bold ${volatility.color}`}>
            {volatility.index.toFixed(1)}%
          </div>
          <div className={`text-sm ${volatility.color}`}>{volatility.label}</div>
        </div>

        {/* Trend */}
        <div className="p-4 bg-space-dark/30 rounded-lg">
          <div className="text-xs text-text-secondary mb-2">Price Trend (7d)</div>
          <div className={`text-xl font-bold flex items-center gap-2 ${trend.color}`}>
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.direction === 'neutral' && '→'}
            {Math.abs(trend.changePercent || 0).toFixed(1)}%
          </div>
          <div className={`text-sm ${trend.color}`}>{trend.label}</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-space-dark/20 rounded-lg">
        <div className="text-xs text-text-secondary mb-2">What this means:</div>
        <p className="text-sm text-text-primary">
          {volatility.index < 8 && trend.direction === 'neutral' && 'Stable market with predictable prices. Good for consistent margin trading.'}
          {volatility.index < 8 && trend.direction === 'up' && 'Stable upward trend. Consider stocking up as prices may continue rising.'}
          {volatility.index < 8 && trend.direction === 'down' && 'Stable downward trend. Wait for price to stabilize before buying.'}
          {volatility.index >= 8 && volatility.index < 15 && 'Moderate volatility. Monitor prices closely and adjust orders frequently.'}
          {volatility.index >= 15 && 'High volatility. Higher risk but potential for larger margins. Trade with caution.'}
        </p>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Daily Volume Card - Shows estimated daily buy/sell volumes
 */
function DailyVolumeCard({ dailyVolume, marketAnalysis }) {
  const trendConfig = {
    increasing: { icon: '↑↑', color: 'text-green-400', label: 'Increasing' },
    slightly_increasing: { icon: '↑', color: 'text-green-400', label: 'Slightly Up' },
    stable: { icon: '→', color: 'text-yellow-400', label: 'Stable' },
    slightly_decreasing: { icon: '↓', color: 'text-red-400', label: 'Slightly Down' },
    decreasing: { icon: '↓↓', color: 'text-red-400', label: 'Decreasing' },
    unknown: { icon: '?', color: 'text-gray-400', label: 'Unknown' },
  };

  const trendInfo = trendConfig[dailyVolume.trend] || trendConfig.unknown;

  // Estimate buy/sell split based on market order volumes
  const totalOrderVolume = (marketAnalysis?.totalBuyVolume || 0) + (marketAnalysis?.totalSellVolume || 0);
  const buyRatio = totalOrderVolume > 0 ? (marketAnalysis?.totalBuyVolume || 0) / totalOrderVolume : 0.5;
  const sellRatio = 1 - buyRatio;

  const estimatedDailyBuy = dailyVolume.avg7Day * buyRatio;
  const estimatedDailySell = dailyVolume.avg7Day * sellRatio;

  return (
    <GlassmorphicCard>
      <h3 className="text-lg font-semibold text-accent-cyan mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Estimated Daily Volume
      </h3>

      {/* Main Volume Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-xs text-text-secondary mb-1">Est. Daily Buys</div>
          <div className="text-2xl font-bold text-green-400 font-mono">
            {formatNumber(Math.round(estimatedDailyBuy))}
          </div>
          <div className="text-xs text-green-400/70">units/day</div>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-xs text-text-secondary mb-1">Est. Daily Sells</div>
          <div className="text-2xl font-bold text-red-400 font-mono">
            {formatNumber(Math.round(estimatedDailySell))}
          </div>
          <div className="text-xs text-red-400/70">units/day</div>
        </div>
      </div>

      {/* Volume Averages */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">7-Day Average:</span>
          <span className="text-white font-mono font-semibold">{formatNumber(Math.round(dailyVolume.avg7Day))}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">30-Day Average:</span>
          <span className="text-white font-mono">{formatNumber(Math.round(dailyVolume.avg30Day))}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">Volume Trend:</span>
          <span className={`flex items-center gap-1 font-semibold ${trendInfo.color}`}>
            {trendInfo.icon} {trendInfo.label}
            {dailyVolume.trendPercent !== 0 && (
              <span className="text-xs">({dailyVolume.trendPercent > 0 ? '+' : ''}{dailyVolume.trendPercent.toFixed(1)}%)</span>
            )}
          </span>
        </div>
      </div>

      {/* Volume Range */}
      <div className="pt-3 border-t border-white/10">
        <div className="text-xs text-text-secondary mb-2">30-Day Volume Range</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400">{formatNumber(dailyVolume.lowVolume)}</span>
          <div className="flex-1 h-2 bg-space-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
              style={{
                width: dailyVolume.peakVolume > 0
                  ? `${Math.min(100, (dailyVolume.avg7Day / dailyVolume.peakVolume) * 100)}%`
                  : '50%'
              }}
            />
          </div>
          <span className="text-xs text-green-400">{formatNumber(dailyVolume.peakVolume)}</span>
        </div>
        <div className="text-xs text-text-secondary text-center mt-1">
          Current avg: {formatNumber(Math.round(dailyVolume.avg7Day))}
        </div>
      </div>

      {/* ISK Value Traded */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">7-Day ISK Traded:</span>
          <span className="text-accent-cyan font-mono">{formatISK(dailyVolume.totalValue7Day)}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-text-secondary">Avg Daily ISK:</span>
          <span className="text-accent-cyan font-mono">{formatISK(dailyVolume.totalValue7Day / 7)}</span>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Main Item Detail Page Component
 */
export default function ItemDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken, character } = useEveAuth();
  const { addItem, removeItem, isInWatchlist } = useWatchlist();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Get item data from URL params
  const itemId = searchParams.get('itemId');
  const itemName = searchParams.get('itemName') || 'Unknown Item';
  const stationId = searchParams.get('stationId');
  const regionId = searchParams.get('regionId') || '10000002'; // Default to The Forge
  const buyPrice = parseFloat(searchParams.get('buyPrice')) || 0;
  const sellPrice = parseFloat(searchParams.get('sellPrice')) || 0;
  const margin = parseFloat(searchParams.get('margin')) || 0;
  const volume = parseFloat(searchParams.get('volume')) || 0;
  const profit = parseFloat(searchParams.get('profit')) || 0;

  // State
  const [loading, setLoading] = useState(true);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState(null);

  // Fetch market data
  useEffect(() => {
    async function fetchData() {
      if (!itemId || !regionId) {
        setError('Missing item or region information');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch market orders and history in parallel
        const [orders, history] = await Promise.all([
          getMarketOrders(regionId, itemId).catch(() => []),
          getMarketHistory(regionId, itemId).catch(() => []),
        ]);

        // Analyze orders
        const analysis = analyzeMarketOrders(orders, stationId ? parseInt(stationId) : null);
        setMarketAnalysis(analysis);
        setPriceHistory(history);

        // Fetch wallet if authenticated
        if (isAuthenticated && character?.id) {
          try {
            const token = await getAccessToken();
            const balance = await getWalletBalance(character.id, token);
            setWalletBalance(balance);
          } catch (e) {
            console.warn('Could not fetch wallet:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [itemId, regionId, stationId, isAuthenticated, character, getAccessToken]);

  // Calculate derived metrics
  const volatility = useMemo(() => calculateVolatility(priceHistory), [priceHistory]);
  const trend = useMemo(() => calculateTrend(priceHistory), [priceHistory]);
  const dailyVolume = useMemo(() => calculateDailyVolume(priceHistory), [priceHistory]);

  const tradingSignal = useMemo(() => {
    return calculateTradingSignal({
      margin,
      volume,
      competition: (marketAnalysis?.buyOrders || 0) + (marketAnalysis?.sellOrders || 0),
      volatility: volatility.index,
      spread: marketAnalysis?.spread || 0,
      trendDirection: trend.direction,
      priceStability: volatility.index < 10,
    });
  }, [margin, volume, marketAnalysis, volatility, trend]);

  const isWatched = isInWatchlist?.(itemId);
  const isFav = isFavorite?.(itemId);

  if (!itemId) {
    return (
      <PageLayout title="Item Not Found">
        <div className="text-center py-20">
          <p className="text-text-secondary mb-4">No item specified</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-accent-cyan text-space-black rounded-lg font-semibold hover:bg-accent-cyan/80"
          >
            Go Back
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={itemName}
      description="Detailed trading analysis and signals"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{itemName}</h1>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span>Type ID: {itemId}</span>
                <span>•</span>
                <span>Region: {regionId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => isWatched ? removeItem?.(itemId) : addItem?.({ id: itemId, name: itemName })}
              className={`p-2 rounded-lg transition-colors ${isWatched ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-white/5 text-text-secondary hover:text-white'}`}
              title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <svg className="w-5 h-5" fill={isWatched ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => toggleFavorite?.(itemId)}
              className={`p-2 rounded-lg transition-colors ${isFav ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-text-secondary hover:text-white'}`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Price Summary Bar */}
        <GlassmorphicCard className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-text-secondary">Buy Price</div>
                <div className="text-xl font-bold font-mono text-green-400">{formatISK(buyPrice)}</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Sell Price</div>
                <div className="text-xl font-bold font-mono text-red-400">{formatISK(sellPrice)}</div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Margin</div>
                <div className={`text-xl font-bold ${margin >= 10 ? 'text-green-400' : margin >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {margin.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-text-secondary">Profit/Unit</div>
                <div className="text-xl font-bold font-mono text-accent-cyan">{formatISK(profit)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-text-secondary">Daily Volume</div>
                <div className="text-lg font-bold text-white">{formatNumber(volume)}</div>
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <GlassmorphicCard>
            <div className="text-center py-10">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent-cyan text-space-black rounded-lg font-semibold"
              >
                Retry
              </button>
            </div>
          </GlassmorphicCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Trading Signal & Quick Copy */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trading Signal */}
              <TradingSignalCard signal={tradingSignal} />

              {/* Quick Copy Prices */}
              <QuickCopyPrices buyPrice={buyPrice} sellPrice={sellPrice} itemName={itemName} />

              {/* Market Competition */}
              <MarketCompetitionCard analysis={marketAnalysis} />
            </div>

            {/* Right Column - Calculator & Indicators */}
            <div className="space-y-6">
              {/* Quick Profit Calculator */}
              <QuickProfitCalculator buyPrice={buyPrice} sellPrice={sellPrice} />

              {/* Wallet Status (if authenticated) */}
              {isAuthenticated && (
                <WalletFundingStatus walletBalance={walletBalance} tradeCost={buyPrice} />
              )}

              {/* Daily Volume Estimates */}
              <DailyVolumeCard dailyVolume={dailyVolume} marketAnalysis={marketAnalysis} />

              {/* Volatility & Trend */}
              <VolatilityTrendCard volatility={volatility} trend={trend} />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
