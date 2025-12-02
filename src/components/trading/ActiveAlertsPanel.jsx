import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { Button } from '../common/Button';
import { formatRelativeTime } from '../../utils/formatters';

export function ActiveAlertsPanel({
  triggeredAlerts = [],
  dismissTriggered,
  settings,
  updateSettings,
  delay = '0ms'
}) {
  const safeTriggeredAlerts = triggeredAlerts || [];

  return (
    <GlassmorphicCard className="h-full animate-fade-in-up" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-accent-cyan flex items-center gap-2">
          <span className="text-xl">🔔</span> Active Alerts
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => updateSettings({ soundEnabled: !settings?.soundEnabled })}
            variant="ghost"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors p-0 border-none ${
              settings?.soundEnabled ? 'bg-accent-cyan/20 border border-accent-cyan/50' : 'bg-space-black/50 border border-white/10'
            }`}
            title={settings?.soundEnabled ? "Sound On" : "Sound Off"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                settings?.soundEnabled ? 'translate-x-6 bg-accent-cyan shadow-glow' : 'translate-x-1 bg-text-muted'
              }`}
            />
          </Button>
        </div>
      </div>

      {safeTriggeredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-text-secondary h-[250px]">
          <div className="w-16 h-16 rounded-full bg-space-black/30 flex items-center justify-center mb-4 border border-white/5">
            <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-sm font-medium">No active alerts</p>
          <p className="text-xs text-text-muted mt-1 max-w-[200px] text-center">Price alerts will appear here when your conditions are met</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {safeTriggeredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="relative p-4 bg-gradient-to-br from-accent-gold/5 to-transparent border border-accent-gold/20 rounded-xl overflow-hidden animate-pulse-slow"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold"></div>

              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pl-2">
                  <div className="text-sm font-bold text-accent-gold flex items-center gap-2">
                    {alert.itemName}
                    <span className="w-2 h-2 rounded-full bg-accent-gold animate-ping"></span>
                  </div>
                  <div className="text-xs text-text-primary mt-1">
                    {alert.type === 'buy' ? 'Buy Order' : 'Sell Order'} {alert.condition === 'above' ? '>' : '<'} {alert.threshold}
                  </div>
                  <div className="text-xs font-mono text-text-secondary mt-1">
                    Current: <span className="text-white">{alert.currentValue}</span>
                  </div>
                </div>
                <Button
                  onClick={() => dismissTriggered(alert.id)}
                  variant="ghost"
                  size="sm"
                  className="text-text-muted hover:text-white hover:bg-white/10 p-1 h-6 w-6 rounded-full"
                  title="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <div className="text-[10px] text-text-muted pl-2 text-right">
                {formatRelativeTime(alert.triggeredAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/5 text-center">
        <Button variant="ghost" className="text-xs text-text-secondary hover:text-white">
          Manage Alerts
        </Button>
      </div>
    </GlassmorphicCard>
  );
}
