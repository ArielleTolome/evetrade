import { TradeSessionTimer } from './TradeSessionTimer';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * TradeSessionTimer Examples
 * Demonstrates usage of the TradeSessionTimer component
 */
export function TradeSessionTimerExample() {
  const handleSessionStart = (data) => {
    console.log('Session started:', data);
  };

  const handleSessionPause = (data) => {
    console.log('Session paused:', data);
  };

  const handleSessionEnd = (data) => {
    console.log('Session ended:', data);
    // Could send to analytics, update database, etc.
  };

  return (
    <div className="space-y-8 p-8 bg-space-black min-h-screen">
      <div>
        <h1 className="text-3xl font-display text-accent-cyan mb-2">Trade Session Timer</h1>
        <p className="text-text-secondary">Track your trading sessions and calculate ISK/hour</p>
      </div>

      {/* Example 1: Full Featured Timer */}
      <div className="max-w-2xl">
        <TradeSessionTimer
          onSessionStart={handleSessionStart}
          onSessionPause={handleSessionPause}
          onSessionEnd={handleSessionEnd}
          showHistory={true}
        />
      </div>

      {/* Example 2: Compact Timer */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Compact Mode</h3>
        <p className="text-text-secondary text-sm mb-4">
          Use this in a header or sidebar for minimal space usage
        </p>
        <TradeSessionTimer
          compact={true}
          showHistory={false}
          onSessionStart={handleSessionStart}
          onSessionEnd={handleSessionEnd}
        />
      </GlassmorphicCard>

      {/* Example 3: Integration Example */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Integration Example</h3>
        <p className="text-text-secondary text-sm mb-4">
          The timer can be integrated into your trading dashboard
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="p-4 bg-space-black/50 rounded-lg border border-accent-cyan/10">
              <h4 className="text-sm text-text-secondary mb-2">Current Trades</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-primary">Tritanium</span>
                  <span className="text-green-400">+5.5M ISK</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-primary">Pyerite</span>
                  <span className="text-green-400">+2.3M ISK</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-primary">PLEX</span>
                  <span className="text-green-400">+45.0M ISK</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-space-black/50 rounded-lg border border-accent-cyan/10">
              <h4 className="text-sm text-text-secondary mb-2">Market Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-text-secondary">Active Orders: </span>
                  <span className="text-text-primary font-bold">12</span>
                </div>
                <div>
                  <span className="text-text-secondary">Volume: </span>
                  <span className="text-text-primary font-bold">5.2M m³</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <TradeSessionTimer
              compact={false}
              showHistory={false}
              onSessionEnd={handleSessionEnd}
            />
          </div>
        </div>
      </GlassmorphicCard>

      {/* Example 4: Usage Notes */}
      <GlassmorphicCard>
        <h3 className="text-lg font-display text-accent-cyan mb-4">Features</h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Start/pause/stop session tracking with accurate timing</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Manual ISK earned tracking with quick add buttons (+1M, +10M)</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Real-time ISK/hour calculation based on current session</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Session history stored in localStorage (persists across page refreshes)</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Today's summary showing total sessions, duration, and ISK earned</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Visual status indicator (green pulse when active, red when stopped)</span>
          </li>
        </ul>
      </GlassmorphicCard>
    </div>
  );
}

export default TradeSessionTimerExample;
