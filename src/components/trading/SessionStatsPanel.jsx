import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { Button } from '../common/Button';
import { formatISK, formatPercent } from '../../utils/formatters';

export function SessionStatsPanel({
  sessionStats,
  sessionDuration,
  iskPerHour,
  resetSession,
  addSessionISK,
  stats,
  delay = '0ms'
}) {
  return (
    <GlassmorphicCard className="h-full animate-fade-in-up" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-accent-cyan flex items-center gap-2">
          <span className="text-xl">⏱️</span> Session
        </h2>
        <Button
          onClick={resetSession}
          variant="ghost"
          size="sm"
          className="text-xs text-text-muted hover:text-red-400 p-1 px-2 h-auto min-h-0 border border-white/5 hover:border-red-400/30 bg-white/5"
          title="Reset session"
        >
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gradient-to-br from-space-black/40 to-space-black/10 border border-white/5 rounded-xl text-center">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">ISK Earned</div>
            <div className="text-lg font-bold text-accent-gold glow-text">{formatISK(sessionStats.iskEarned)}</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-space-black/40 to-space-black/10 border border-white/5 rounded-xl text-center">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Trades</div>
            <div className="text-lg font-bold text-text-primary">{sessionStats.tradesCompleted}</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-space-black/40 to-space-black/10 border border-white/5 rounded-xl text-center">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Time</div>
            <div className="text-lg font-bold text-text-primary font-mono">
              {Math.floor(sessionDuration / 3600)}h {Math.floor((sessionDuration % 3600) / 60)}m
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-space-black/40 to-space-black/10 border border-white/5 rounded-xl text-center">
            <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">ISK / Hour</div>
            <div className="text-lg font-bold text-accent-cyan truncate">{formatISK(iskPerHour, false)}</div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-2 pl-1">Quick Add Profit</div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => addSessionISK(1000000)}
              variant="secondary"
              size="sm"
              className="py-2 bg-green-500/5 text-green-400 hover:bg-green-500/15 text-xs font-bold border-green-500/20"
            >
              +1M
            </Button>
            <Button
              onClick={() => addSessionISK(10000000)}
              variant="secondary"
              size="sm"
              className="py-2 bg-green-500/5 text-green-400 hover:bg-green-500/15 text-xs font-bold border-green-500/20"
            >
              +10M
            </Button>
            <Button
              onClick={() => addSessionISK(100000000)}
              variant="secondary"
              size="sm"
              className="py-2 bg-green-500/5 text-green-400 hover:bg-green-500/15 text-xs font-bold border-green-500/20"
            >
              +100M
            </Button>
          </div>
        </div>

        {/* Historical Stats */}
        {stats && (
          <div className="border-t border-white/10 pt-4 mt-2">
            <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-3 pl-1">All-Time Performance</div>
            <div className="space-y-2 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-xs">Total Profit</span>
                <span className="text-accent-gold font-bold">{formatISK(stats.totalProfit || 0)}</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-xs">Win Rate</span>
                <span className="text-accent-cyan font-bold">{formatPercent(stats.winRate || 0)}</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary text-xs">Total Trades</span>
                <span className="text-text-primary">{stats.completedTrades || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}
