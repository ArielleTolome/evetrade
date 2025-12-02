import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { Button } from '../common/Button';
import { formatISK } from '../../utils/formatters';
import { useState, useMemo } from 'react';

export function OpportunitiesPanel({
  minProfit,
  setMinProfit,
  maxInvestment,
  setMaxInvestment,
  filteredStationTrades,
  filteredHaulingRoutes,
  copyToClipboard,
  copiedItem,
  addToWatchlist,
  copyTradeDetails,
  delay = '0ms'
}) {
  const [activeTab, setActiveTab] = useState('station');

  return (
    <GlassmorphicCard className="md:col-span-2 h-full animate-fade-in-up" style={{ animationDelay: delay }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-display text-accent-cyan flex items-center gap-2">
            <span className="text-2xl">⚡</span> Top Opportunities
          </h2>
          <p className="text-xs text-text-secondary mt-1">High-value trades available right now</p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Min Profit</label>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-text-muted text-xs">Ƶ</span>
              <input
                type="number"
                placeholder="1,000,000"
                value={minProfit}
                onChange={(e) => setMinProfit(e.target.value)}
                className="w-32 pl-6 pr-3 py-1.5 text-sm bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 focus:outline-none transition-all placeholder:text-text-muted/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Max Invest</label>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-text-muted text-xs">Ƶ</span>
              <input
                type="number"
                placeholder="100M"
                value={maxInvestment}
                onChange={(e) => setMaxInvestment(e.target.value)}
                className="w-36 pl-6 pr-3 py-1.5 text-sm bg-space-black/50 border border-white/10 rounded-lg text-text-primary focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 focus:outline-none transition-all placeholder:text-text-muted/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('station')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'station'
              ? 'border-accent-cyan text-accent-cyan'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Station Trading
        </button>
        <button
          onClick={() => setActiveTab('hauling')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'hauling'
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Hauling Routes
        </button>
      </div>

      <div className="space-y-3 min-h-[300px]">
        {activeTab === 'station' && (
          <div className="space-y-3 animate-fade-in">
            {filteredStationTrades.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                 <div className="text-4xl mb-2">🔍</div>
                 <p>No station trades match your criteria</p>
               </div>
            ) : (
              filteredStationTrades.slice(0, 5).map((trade, idx) => (
                <div
                  key={idx}
                  className="group relative p-4 bg-gradient-to-r from-space-black/40 to-space-black/20 border border-white/5 rounded-xl hover:border-accent-cyan/30 hover:shadow-lg hover:shadow-accent-cyan/5 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-cyan/0 group-hover:bg-accent-cyan rounded-l-xl transition-all duration-300"></div>

                  <div className="flex items-start justify-between mb-3 pl-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-base font-bold text-text-primary group-hover:text-accent-cyan transition-colors">{trade.item}</div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          {trade.margin.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Buy: <span className="text-text-primary">{formatISK(trade.buyPrice)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          Sell: <span className="text-text-primary">{formatISK(trade.sellPrice)}</span>
                        </span>
                        <span className="text-text-muted">Vol: {trade.volume.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <div className="text-lg font-bold text-accent-cyan glow-text">{formatISK(trade.profit)}</div>
                      <div className="text-[10px] uppercase tracking-wide text-text-muted">Profit / Unit</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pl-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      onClick={() => copyToClipboard(trade.item, trade.item)}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs bg-white/5 hover:bg-white/10 border-white/5"
                    >
                      {copiedItem === trade.item ? '✓ Copied' : 'Copy Name'}
                    </Button>
                    <Button
                      onClick={() => copyTradeDetails(trade)}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs bg-white/5 hover:bg-white/10 border-white/5"
                    >
                      Details
                    </Button>
                    <Button
                      onClick={() => addToWatchlist({
                        'Item ID': trade.itemId,
                        'Item': trade.item,
                        'Buy Price': trade.buyPrice,
                        'Sell Price': trade.sellPrice
                      })}
                      variant="ghost"
                      size="sm"
                      className="w-8 px-0 flex items-center justify-center bg-white/5 hover:bg-accent-cyan/20 hover:text-accent-cyan border-white/5"
                      title="Add to watchlist"
                    >
                      ★
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'hauling' && (
          <div className="space-y-3 animate-fade-in">
             {filteredHaulingRoutes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                 <div className="text-4xl mb-2">🚛</div>
                 <p>No hauling routes match your criteria</p>
               </div>
            ) : (
              filteredHaulingRoutes.slice(0, 5).map((route, idx) => (
                <div
                  key={idx}
                  className="group relative p-4 bg-gradient-to-r from-space-black/40 to-space-black/20 border border-white/5 rounded-xl hover:border-accent-gold/30 hover:shadow-lg hover:shadow-accent-gold/5 transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold/0 group-hover:bg-accent-gold rounded-l-xl transition-all duration-300"></div>

                  <div className="flex items-start justify-between mb-3 pl-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-base font-bold text-text-primary group-hover:text-accent-gold transition-colors">{route.item}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-text-primary">{route.from}</span>
                        <span className="text-text-muted">→</span>
                        <span className="text-text-primary">{route.to}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-text-muted">{route.jumps} jumps</span>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <div className="text-lg font-bold text-accent-gold glow-text">{formatISK(route.iskPerJump)}</div>
                      <div className="text-[10px] uppercase tracking-wide text-text-muted">ISK / Jump</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pl-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      onClick={() => copyToClipboard(route.item, route.item)}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs bg-white/5 hover:bg-white/10 border-white/5"
                    >
                      {copiedItem === route.item ? '✓ Copied' : 'Copy Name'}
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(`${route.item}\n${route.from} → ${route.to}\n${route.jumps} jumps\n${formatISK(route.profit)} profit`, route.item + '_details')}
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs bg-white/5 hover:bg-white/10 border-white/5"
                    >
                      Route Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-center">
        <Button variant="ghost" className="text-xs text-accent-cyan hover:text-white">
          View All Opportunities →
        </Button>
      </div>
    </GlassmorphicCard>
  );
}
