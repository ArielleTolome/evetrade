import { GlassmorphicCard } from '../common/GlassmorphicCard';

export function DashboardHeader() {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  return (
    <div className="mb-8 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">
              {greeting}, Capsuleer
            </span>
          </h1>
          <p className="text-text-secondary text-lg">
            Markets are active. New opportunities detected in <span className="text-accent-gold">Jita</span> and <span className="text-accent-gold">Amarr</span>.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-space-black/40 border border-white/10 backdrop-blur-md flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-text-muted">System Status: <span className="text-green-400">Online</span></span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-space-black/40 border border-white/10 backdrop-blur-md hidden sm:flex items-center gap-3">
             <span className="text-sm font-medium text-text-muted">Market Data: <span className="text-accent-cyan">Live</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
