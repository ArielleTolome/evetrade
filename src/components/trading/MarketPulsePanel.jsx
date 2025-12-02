import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatISK } from '../../utils/formatters';

export function MarketPulsePanel({ marketPulse, delay = '0ms' }) {
  return (
    <GlassmorphicCard className="h-full animate-fade-in-up" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-accent-cyan flex items-center gap-2">
          <span className="text-xl">📊</span> Market Pulse
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-text-muted">Live</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-space-black/40 to-space-black/10 border border-white/5 rounded-xl hover:border-accent-cyan/20 transition-colors group">
            <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Total Volume</div>
            <div className="text-lg font-bold text-text-primary group-hover:text-accent-cyan transition-colors truncate" title={formatISK(marketPulse.totalVolume, false)}>
              {formatISK(marketPulse.totalVolume, false).replace(' ISK', '')}
              <span className="text-xs text-text-muted font-normal ml-1">ISK</span>
            </div>
            <div className={`text-xs mt-1 flex items-center gap-1 ${marketPulse.volumeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-[10px]">{marketPulse.volumeChange >= 0 ? '▲' : '▼'}</span>
              {Math.abs(marketPulse.volumeChange)}%
              <span className="text-text-muted text-[10px] ml-1">24h</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-space-black/40 to-space-black/10 border border-white/5 rounded-xl hover:border-accent-purple/20 transition-colors group">
            <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Active Items</div>
            <div className="text-lg font-bold text-text-primary group-hover:text-accent-purple transition-colors">
              {marketPulse.activeItems.toLocaleString()}
            </div>
            <div className="text-xs text-text-muted mt-1">
              Currently traded
            </div>
          </div>
        </div>

        {/* Top Movers */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 pl-1">Price Movers (24h)</h3>
          <div className="space-y-2">
            {marketPulse.topMovers.map((mover, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors">
                <span className="text-sm font-medium text-text-primary">{mover.item}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-16 h-1.5 rounded-full overflow-hidden bg-space-black`}>
                    <div
                      className={`h-full rounded-full ${mover.direction === 'up' ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(mover.change) * 5, 100)}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-bold w-12 text-right ${mover.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {mover.direction === 'up' ? '+' : ''}{mover.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 pl-1">Most Active</h3>
          <div className="space-y-2">
            {marketPulse.mostActive.map((active, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors group">
                <span className="text-sm font-medium text-text-primary">{active.item}</span>
                <span className="text-sm font-mono text-accent-cyan/80 group-hover:text-accent-cyan transition-colors">{active.volume.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
