import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { Button } from '../common/Button';
import { formatISK } from '../../utils/formatters';

export function WatchlistQuickView({
  currentList,
  removeFromWatchlist,
  copyToClipboard,
  copiedItem,
  delay = '0ms'
}) {
  return (
    <GlassmorphicCard className="h-full animate-fade-in-up" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-accent-cyan flex items-center gap-2">
          <span className="text-xl">⭐</span> Watchlist
        </h2>
        <span className="text-xs px-2 py-1 rounded bg-white/5 text-text-muted border border-white/5">
          {currentList.items.length} Items
        </span>
      </div>

      {currentList.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-text-secondary h-[250px]">
          <div className="w-16 h-16 rounded-full bg-space-black/30 flex items-center justify-center mb-4 border border-white/5">
            <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Watchlist is empty</p>
          <p className="text-xs text-text-muted mt-1">Track items for quick access</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {currentList.items.map((item) => {
            const priceChange = item.currentPrice?.sell
              ? ((item.currentPrice.sell - item.initialPrice.sell) / item.initialPrice.sell) * 100
              : 0;
            const isPositive = priceChange >= 0;

            return (
              <div
                key={item.id}
                className="group p-3 bg-space-black/30 border border-white/5 rounded-xl hover:bg-space-black/50 hover:border-accent-cyan/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">{item.name}</div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <div className="text-[10px] uppercase text-text-muted">Buy</div>
                        <div className="text-xs text-text-primary">{formatISK(item.currentPrice?.buy || item.initialPrice.buy)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-text-muted">Sell</div>
                        <div className="text-xs text-text-primary">{formatISK(item.currentPrice?.sell || item.initialPrice.sell)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      isPositive
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                    </div>
                    {priceChange !== 0 && (
                      <div className="text-[10px] text-text-muted mt-1">
                        since added
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    onClick={() => copyToClipboard(item.name, item.name)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs bg-white/5 hover:bg-white/10 border-white/5"
                  >
                    {copiedItem === item.name ? '✓' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => removeFromWatchlist(item.id)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 px-0 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 border-transparent"
                    title="Remove"
                  >
                    ×
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

       <div className="mt-4 pt-3 border-t border-white/5 text-center">
        <Button variant="ghost" className="text-xs text-text-secondary hover:text-white">
          Full Watchlist →
        </Button>
      </div>
    </GlassmorphicCard>
  );
}
