import { useMemo, useState, useCallback } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * SmartMultibuyBudget - Generates optimal multibuy lists based on budget and risk tolerance
 * Uses wallet balance and trade data to suggest what to buy
 */
export function SmartMultibuyBudget({
  trades = [],
  walletBalance = 0,
  onCopyMultibuy,
  className = '',
}) {
  const [budget, setBudget] = useState(walletBalance * 0.5); // Default to 50% of wallet
  const [riskLevel, setRiskLevel] = useState('balanced'); // conservative, balanced, aggressive
  const [diversification, setDiversification] = useState('medium'); // low, medium, high
  const [showList, setShowList] = useState(false);

  // Generate optimized buy list
  const optimizedList = useMemo(() => {
    if (!trades.length || budget <= 0) return { items: [], stats: null };

    // Filter and score trades based on risk level
    const scoredTrades = trades
      .map(trade => {
        const price = trade['Buy Price'] || 0;
        const profit = trade['Net Profit'] || 0;
        const volume = trade['Volume'] || 0;
        const margin = (trade['Gross Margin'] || 0) / 100;

        if (price <= 0 || profit <= 0) return null;

        // Calculate risk-adjusted score
        let score = 0;

        // Volume factor (higher volume = safer)
        const volumeScore = Math.min(1, volume / 500) * 30;

        // Margin factor (reasonable margins are safer)
        const marginScore = margin >= 0.05 && margin <= 0.30 ? 25 : margin < 0.05 ? 10 : 15;

        // Profit factor
        const profitScore = Math.min(1, profit / 10000000) * 25;

        // Affordability factor
        const affordability = price <= budget * 0.1 ? 20 : price <= budget * 0.25 ? 15 : 10;

        score = volumeScore + marginScore + profitScore + affordability;

        // Adjust by risk level
        if (riskLevel === 'conservative') {
          // Prefer high volume, reasonable margins
          score += volume > 200 ? 20 : 0;
          score -= margin > 0.3 ? 20 : 0;
        } else if (riskLevel === 'aggressive') {
          // Prefer high profit potential
          score += profit > 5000000 ? 20 : 0;
          score += margin > 0.2 ? 10 : 0;
        }

        return {
          ...trade,
          itemName: trade['Item'] || trade.name,
          itemId: trade['Item ID'] || trade.itemId,
          price,
          profit,
          volume,
          margin,
          score,
        };
      })
      .filter(t => t !== null)
      .sort((a, b) => b.score - a.score);

    // Determine how many items to include based on diversification
    const maxItems = diversification === 'low' ? 3 : diversification === 'medium' ? 7 : 15;
    const maxPerItem = diversification === 'low' ? budget * 0.5 : diversification === 'medium' ? budget * 0.25 : budget * 0.15;

    // Build optimized list
    const items = [];
    let remainingBudget = budget;
    let totalExpectedProfit = 0;

    for (const trade of scoredTrades) {
      if (items.length >= maxItems) break;
      if (remainingBudget <= 0) break;

      // Calculate optimal quantity
      const maxAffordable = Math.floor(remainingBudget / trade.price);
      const maxPerItemQty = Math.floor(maxPerItem / trade.price);
      const maxByVolume = Math.ceil(trade.volume * 0.5); // Don't exceed 50% of daily volume

      const quantity = Math.min(maxAffordable, maxPerItemQty, maxByVolume, 100);

      if (quantity <= 0) continue;

      const cost = trade.price * quantity;
      const expectedProfit = trade.profit * quantity / trade.volume; // Pro-rated profit

      items.push({
        ...trade,
        quantity,
        cost,
        expectedProfit,
      });

      remainingBudget -= cost;
      totalExpectedProfit += expectedProfit;
    }

    return {
      items,
      stats: {
        totalItems: items.length,
        totalCost: budget - remainingBudget,
        remainingBudget,
        totalExpectedProfit,
        avgRiskScore: items.length > 0
          ? items.reduce((sum, i) => sum + i.score, 0) / items.length
          : 0,
      },
    };
  }, [trades, budget, riskLevel, diversification]);

  // Copy to clipboard in multibuy format
  const handleCopyMultibuy = useCallback(() => {
    if (!optimizedList.items.length) return;

    const multibuyText = optimizedList.items
      .map(item => `${item.itemName} ${item.quantity}`)
      .join('\n');

    onCopyMultibuy?.(multibuyText);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(multibuyText);
    }
  }, [optimizedList.items, onCopyMultibuy]);

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-accent-cyan/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-text-primary font-medium">Smart Multibuy</h3>
            <p className="text-xs text-text-secondary">
              Optimized shopping list based on your budget
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 space-y-4">
        {/* Budget Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Budget</span>
            <span className="text-accent-cyan font-medium">{formatISK(budget, true)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={walletBalance}
            step={walletBalance / 100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
          />
          <div className="flex justify-between text-xs text-text-secondary">
            <span>0</span>
            <span>{formatISK(walletBalance, true)}</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="space-y-2">
          <span className="text-sm text-text-secondary">Risk Tolerance</span>
          <div className="flex gap-2">
            {['conservative', 'balanced', 'aggressive'].map(level => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                  riskLevel === level
                    ? level === 'conservative'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : level === 'balanced'
                        ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-transparent'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Diversification */}
        <div className="space-y-2">
          <span className="text-sm text-text-secondary">Diversification</span>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map(level => (
              <button
                key={level}
                onClick={() => setDiversification(level)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs transition-colors ${
                  diversification === level
                    ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-transparent'
                }`}
              >
                {level === 'low' ? '1-3 items' : level === 'medium' ? '5-7 items' : '10-15 items'}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {optimizedList.stats && (
          <div className="p-4 bg-white/5 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-accent-cyan">
                  {optimizedList.stats.totalItems}
                </div>
                <div className="text-xs text-text-secondary">Items</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent-gold">
                  {formatISK(optimizedList.stats.totalCost, true)}
                </div>
                <div className="text-xs text-text-secondary">Total Cost</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">
                  {formatISK(optimizedList.stats.totalExpectedProfit, true)}
                </div>
                <div className="text-xs text-text-secondary">Expected Profit</div>
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary">
                  {optimizedList.stats.avgRiskScore.toFixed(0)}
                </div>
                <div className="text-xs text-text-secondary">Risk Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Item List */}
        <button
          onClick={() => setShowList(!showList)}
          className="w-full flex items-center justify-between px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <span className="text-sm text-text-primary">
            {showList ? 'Hide' : 'Show'} Shopping List
          </span>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${showList ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Item List */}
        {showList && optimizedList.items.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {optimizedList.items.map((item, idx) => (
              <div
                key={item.itemId}
                className="p-2 rounded-lg bg-white/5 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-text-primary truncate">{item.itemName}</div>
                  <div className="text-xs text-text-secondary">
                    {item.quantity}x @ {formatISK(item.price, true)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-accent-gold">{formatISK(item.cost, true)}</div>
                  <div className="text-xs text-green-400">+{formatISK(item.expectedProfit, true)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Copy Button */}
        <button
          onClick={handleCopyMultibuy}
          disabled={!optimizedList.items.length}
          className="w-full flex items-center justify-center gap-2 p-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Copy Multibuy List</span>
        </button>
      </div>
    </div>
  );
}

export default SmartMultibuyBudget;
