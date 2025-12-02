import { useState, useCallback } from 'react';
import { formatISK } from '../../utils/formatters';

/**
 * QuickPricePanel - One-click price copy panel for station trading
 * Inspired by EVE Tycoon's quick-copy functionality
 *
 * Features:
 * - Copy exact prices
 * - Copy undercut prices (beat competition by 0.01 ISK)
 * - Copy custom offset prices
 * - Visual feedback on copy
 */
export function QuickPricePanel({
  buyPrice,
  sellPrice,
  itemName,
  onCopy,
  className = ''
}) {
  const [copiedField, setCopiedField] = useState(null);
  const [customOffset, setCustomOffset] = useState(0.01);

  const copyToClipboard = useCallback(async (value, field) => {
    try {
      // Format as plain number for EVE Online paste
      const textValue = typeof value === 'number' ? value.toFixed(2) : String(value);
      await navigator.clipboard.writeText(textValue);
      setCopiedField(field);
      onCopy?.(`${field} copied!`);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [onCopy]);

  // Calculate undercut/overcut prices
  const undercutSell = sellPrice ? (sellPrice - customOffset) : null; // Price to SELL at (undercut highest buy)
  const overbidBuy = buyPrice ? (buyPrice + customOffset) : null; // Price to BUY at (overbid lowest sell)

  return (
    <div className={`bg-space-dark/60 border border-accent-cyan/20 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display text-accent-cyan">Quick Copy Prices</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary">Offset:</label>
          <input
            type="number"
            value={customOffset}
            onChange={(e) => setCustomOffset(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
            step="0.01"
            min="0.01"
            className="w-20 px-2 py-1 text-xs bg-space-black/50 border border-accent-cyan/20 rounded text-text-primary focus:outline-none focus:border-accent-cyan"
          />
          <span className="text-xs text-text-secondary">ISK</span>
        </div>
      </div>

      {itemName && (
        <div className="text-xs text-text-secondary mb-3 truncate" title={itemName}>
          {itemName}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* BUY Section - You're placing a BUY order */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-red-400 uppercase tracking-wider mb-2">
            Place Buy Order
          </div>

          {/* Match lowest sell (instant buy) */}
          <PriceButton
            label="Match Sell"
            sublabel="Instant buy"
            price={buyPrice}
            onClick={() => copyToClipboard(buyPrice, 'match-buy')}
            isCopied={copiedField === 'match-buy'}
            variant="neutral"
          />

          {/* Undercut lowest sell (become best buy order) */}
          <PriceButton
            label="Beat Sellers"
            sublabel={`-${customOffset} ISK`}
            price={buyPrice ? buyPrice - customOffset : null}
            onClick={() => copyToClipboard(buyPrice - customOffset, 'undercut-buy')}
            isCopied={copiedField === 'undercut-buy'}
            variant="success"
          />

          {/* Match highest buy order */}
          <PriceButton
            label="Match Buyers"
            sublabel="Match top buy"
            price={sellPrice}
            onClick={() => copyToClipboard(sellPrice, 'match-buyers')}
            isCopied={copiedField === 'match-buyers'}
            variant="neutral"
          />

          {/* Overbid highest buy (become #1 buy order) */}
          <PriceButton
            label="Beat Buyers"
            sublabel={`+${customOffset} ISK`}
            price={overbidBuy ? sellPrice + customOffset : null}
            onClick={() => copyToClipboard(sellPrice + customOffset, 'overbid-buy')}
            isCopied={copiedField === 'overbid-buy'}
            variant="primary"
          />
        </div>

        {/* SELL Section - You're placing a SELL order */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-green-400 uppercase tracking-wider mb-2">
            Place Sell Order
          </div>

          {/* Match highest buy (instant sell) */}
          <PriceButton
            label="Match Buyers"
            sublabel="Instant sell"
            price={sellPrice}
            onClick={() => copyToClipboard(sellPrice, 'match-sell')}
            isCopied={copiedField === 'match-sell'}
            variant="neutral"
          />

          {/* Overbid highest buy (become best sell order) */}
          <PriceButton
            label="Beat Buyers"
            sublabel={`+${customOffset} ISK`}
            price={sellPrice ? sellPrice + customOffset : null}
            onClick={() => copyToClipboard(sellPrice + customOffset, 'overbid-sell')}
            isCopied={copiedField === 'overbid-sell'}
            variant="success"
          />

          {/* Match lowest sell */}
          <PriceButton
            label="Match Sellers"
            sublabel="Match top sell"
            price={buyPrice}
            onClick={() => copyToClipboard(buyPrice, 'match-sellers')}
            isCopied={copiedField === 'match-sellers'}
            variant="neutral"
          />

          {/* Undercut lowest sell (become #1 sell order) */}
          <PriceButton
            label="Beat Sellers"
            sublabel={`-${customOffset} ISK`}
            price={undercutSell ? buyPrice - customOffset : null}
            onClick={() => copyToClipboard(buyPrice - customOffset, 'undercut-sell')}
            isCopied={copiedField === 'undercut-sell'}
            variant="primary"
          />
        </div>
      </div>

      {/* Quick tip */}
      <div className="mt-4 pt-3 border-t border-accent-cyan/10">
        <div className="text-[10px] text-text-secondary/70">
          <span className="text-accent-cyan">Tip:</span> "Beat" prices help you become the top order. Use "Match" for instant trades.
        </div>
      </div>
    </div>
  );
}

/**
 * Individual price button component
 */
function PriceButton({ label, sublabel, price, onClick, isCopied, variant = 'neutral' }) {
  const variants = {
    neutral: 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
    success: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 text-green-400',
    primary: 'bg-accent-cyan/10 border-accent-cyan/30 hover:bg-accent-cyan/20 hover:border-accent-cyan/50 text-accent-cyan',
  };

  if (price === null || price === undefined || isNaN(price)) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 opacity-50">
        <div>
          <div className="text-xs text-text-secondary">{label}</div>
          <div className="text-[10px] text-text-secondary/50">{sublabel}</div>
        </div>
        <div className="text-xs text-text-secondary">N/A</div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${variants[variant]} ${isCopied ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
    >
      <div className="text-left">
        <div className="text-xs text-text-primary">{label}</div>
        <div className="text-[10px] text-text-secondary/70">{sublabel}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-text-primary">{formatISK(price, false)}</span>
        {isCopied ? (
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
}

/**
 * Compact inline version for table rows
 */
export function QuickCopyButtons({ buyPrice, sellPrice, onCopy }) {
  const [copiedButton, setCopiedButton] = useState(null);

  const copyPrice = useCallback(async (value, field) => {
    try {
      await navigator.clipboard.writeText(value.toFixed(2));
      setCopiedButton(field);
      onCopy?.(`Copied ${formatISK(value, false)}`);
      setTimeout(() => setCopiedButton(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [onCopy]);

  return (
    <div className="flex items-center gap-1">
      {/* Copy buy price (to place buy order) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          copyPrice(buyPrice, 'buy');
        }}
        className={`p-1.5 rounded text-xs transition-all ${copiedButton === 'buy' ? 'bg-green-500/30 text-green-400 ring-2 ring-green-400/50' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
        title={`Copy buy price: ${formatISK(buyPrice, false)}`}
      >
        {copiedButton === 'buy' ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          'B'
        )}
      </button>

      {/* Copy undercut buy price */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          copyPrice(buyPrice - 0.01, 'buy-under');
        }}
        className={`p-1.5 rounded text-xs transition-all ${copiedButton === 'buy-under' ? 'bg-green-500/30 text-green-400 ring-2 ring-green-400/50' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}
        title={`Copy undercut buy: ${formatISK(buyPrice - 0.01, false)}`}
      >
        {copiedButton === 'buy-under' ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          'B-'
        )}
      </button>

      {/* Copy sell price (to place sell order) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          copyPrice(sellPrice, 'sell');
        }}
        className={`p-1.5 rounded text-xs transition-all ${copiedButton === 'sell' ? 'bg-green-500/30 text-green-400 ring-2 ring-green-400/50' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
        title={`Copy sell price: ${formatISK(sellPrice, false)}`}
      >
        {copiedButton === 'sell' ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          'S'
        )}
      </button>

      {/* Copy overbid sell price */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          copyPrice(sellPrice + 0.01, 'sell-over');
        }}
        className={`p-1.5 rounded text-xs transition-all ${copiedButton === 'sell-over' ? 'bg-green-500/30 text-green-400 ring-2 ring-green-400/50' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
        title={`Copy overbid sell: ${formatISK(sellPrice + 0.01, false)}`}
      >
        {copiedButton === 'sell-over' ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          'S+'
        )}
      </button>
    </div>
  );
}

export default QuickPricePanel;
