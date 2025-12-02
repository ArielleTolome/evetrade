/**
 * AffordabilityBadge Examples and Demonstrations
 *
 * This file shows all the different states and use cases for the
 * AffordabilityBadge and AffordabilityIndicator components.
 *
 * To view these examples, import this component in a test page.
 */

import React, { useState } from 'react';
import { AffordabilityBadge, AffordabilityIndicator } from './AffordabilityBadge';
import { GlassmorphicCard } from './GlassmorphicCard';
import { formatISK } from '../../utils/formatters';

export function AffordabilityBadgeExamples() {
  const [walletBalance, setWalletBalance] = useState(10000000); // 10M ISK
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display text-text-primary mb-2">
          AffordabilityBadge Examples
        </h1>
        <p className="text-text-secondary">
          Visual demonstrations of all badge states and use cases
        </p>
      </div>

      {/* Controls */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">Controls</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Wallet Balance: {formatISK(walletBalance)}
            </label>
            <input
              type="range"
              min="0"
              max="100000000"
              step="1000000"
              value={walletBalance}
              onChange={(e) => setWalletBalance(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={isAuthenticated}
                onChange={(e) => setIsAuthenticated(e.target.checked)}
              />
              Authenticated
            </label>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Basic States */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">Basic States</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Can Afford:</span>
            <AffordabilityBadge cost={5000000} walletBalance={walletBalance} />
            <span className="text-text-secondary text-sm">
              Cost: {formatISK(5000000)} (5M ISK)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Cannot Afford:</span>
            <AffordabilityBadge cost={50000000} walletBalance={walletBalance} />
            <span className="text-text-secondary text-sm">
              Cost: {formatISK(50000000)} (50M ISK)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Not Authenticated:</span>
            <AffordabilityBadge cost={5000000} walletBalance={null} />
            <span className="text-text-secondary text-sm">
              walletBalance = null
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Loading:</span>
            <AffordabilityBadge cost={5000000} walletBalance={null} />
            <span className="text-text-secondary text-sm">
              (Same as not authenticated - shows gray)
            </span>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Compact Mode */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">Compact Mode</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Normal:</span>
            <AffordabilityBadge cost={5000000} walletBalance={walletBalance} compact={false} />
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Compact:</span>
            <AffordabilityBadge cost={5000000} walletBalance={walletBalance} compact={true} />
            <span className="text-text-secondary text-sm">(Icon only, smaller padding)</span>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Indicator Variant */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">
          AffordabilityIndicator (Dot Only)
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Can Afford:</span>
            <AffordabilityIndicator cost={5000000} walletBalance={walletBalance} />
            <span className="text-text-secondary text-sm">Green dot</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Cannot Afford:</span>
            <AffordabilityIndicator cost={50000000} walletBalance={walletBalance} />
            <span className="text-text-secondary text-sm">Red dot</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-32 text-text-secondary text-sm">Not Auth:</span>
            <AffordabilityIndicator cost={5000000} walletBalance={null} />
            <span className="text-text-secondary text-sm">Gray dot</span>
          </div>
        </div>
      </GlassmorphicCard>

      {/* In Table Row Context */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">In Table Context</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary border-b border-accent-cyan/20">
                <th className="text-left py-2 px-3">Item</th>
                <th className="text-right py-2 px-3">Buy Price</th>
                <th className="text-right py-2 px-3">Sell Price</th>
                <th className="text-center py-2 px-3">Can Afford?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { item: 'Tritanium', buy: 5000000, sell: 5500000 },
                { item: 'PLEX', buy: 45000000, sell: 47000000 },
                { item: 'Rifter', buy: 250000, sell: 275000 },
                { item: 'Titan Blueprint', buy: 500000000, sell: 525000000 },
              ].map((trade) => (
                <tr key={trade.item} className="border-b border-accent-cyan/10 hover:bg-white/5">
                  <td className="py-2 px-3 text-text-primary">
                    <div className="flex items-center gap-2">
                      <AffordabilityIndicator cost={trade.buy} walletBalance={walletBalance} />
                      {trade.item}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-text-primary">
                    <div className="flex flex-col items-end gap-1">
                      {formatISK(trade.buy, false)}
                      <AffordabilityBadge
                        cost={trade.buy}
                        walletBalance={walletBalance}
                        compact={true}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-text-primary">
                    {formatISK(trade.sell, false)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex justify-center">
                      <AffordabilityBadge cost={trade.buy} walletBalance={walletBalance} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>

      {/* Different Cost Levels */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">Different Price Points</h2>
        <p className="text-text-secondary text-sm mb-4">
          Your wallet: {formatISK(walletBalance)}
        </p>
        <div className="space-y-4">
          {[
            { label: 'Very Cheap', cost: 100000 },
            { label: 'Affordable', cost: 5000000 },
            { label: 'Just Enough', cost: walletBalance },
            { label: 'Slightly Over', cost: walletBalance + 1000000 },
            { label: 'Very Expensive', cost: 100000000 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <span className="w-32 text-text-secondary text-sm">{item.label}:</span>
              <AffordabilityBadge cost={item.cost} walletBalance={walletBalance} />
              <span className="text-text-secondary text-sm">{formatISK(item.cost)}</span>
            </div>
          ))}
        </div>
      </GlassmorphicCard>

      {/* Inline Usage Examples */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">Inline Usage</h2>
        <div className="space-y-4 text-text-primary">
          <p className="flex items-center gap-2">
            <AffordabilityIndicator cost={5000000} walletBalance={walletBalance} />
            This trade costs {formatISK(5000000)} and you can afford it!
          </p>

          <p className="flex items-center gap-2">
            <AffordabilityIndicator cost={50000000} walletBalance={walletBalance} />
            This expensive trade costs {formatISK(50000000)}. Check the badge:
            <AffordabilityBadge cost={50000000} walletBalance={walletBalance} compact={true} />
          </p>

          <p className="flex flex-wrap items-center gap-2">
            Multiple items:
            <AffordabilityBadge cost={1000000} walletBalance={walletBalance} compact={true} />
            <AffordabilityBadge cost={5000000} walletBalance={walletBalance} compact={true} />
            <AffordabilityBadge cost={50000000} walletBalance={walletBalance} compact={true} />
          </p>
        </div>
      </GlassmorphicCard>

      {/* Filter Example */}
      <GlassmorphicCard>
        <h2 className="text-xl font-display text-text-primary mb-4">Filter Example</h2>
        <AffordableTradesFilter walletBalance={walletBalance} />
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Example of filtering trades by affordability
 */
function AffordableTradesFilter({ walletBalance }) {
  const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);

  const trades = [
    { item: 'Tritanium', cost: 5000000 },
    { item: 'PLEX', cost: 45000000 },
    { item: 'Rifter', cost: 250000 },
    { item: 'Titan Blueprint', cost: 500000000 },
    { item: 'Minerals', cost: 1000000 },
  ];

  const filteredTrades = showOnlyAffordable
    ? trades.filter((t) => walletBalance >= t.cost)
    : trades;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-text-secondary text-sm">
          Showing {filteredTrades.length} of {trades.length} trades
        </p>
        <button
          onClick={() => setShowOnlyAffordable(!showOnlyAffordable)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            showOnlyAffordable
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-white/5 border-accent-cyan/20 text-text-secondary hover:bg-white/10'
          }`}
          disabled={!walletBalance}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-sm">
            {showOnlyAffordable ? 'Show All' : 'Affordable Only'}
          </span>
        </button>
      </div>

      <div className="space-y-2">
        {filteredTrades.map((trade) => (
          <div
            key={trade.item}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AffordabilityIndicator cost={trade.cost} walletBalance={walletBalance} />
              <span className="text-text-primary font-medium">{trade.item}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-text-secondary font-mono">{formatISK(trade.cost)}</span>
              <AffordabilityBadge cost={trade.cost} walletBalance={walletBalance} compact={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AffordabilityBadgeExamples;
