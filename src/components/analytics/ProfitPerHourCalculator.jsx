import { useState, useEffect } from 'react';
import { useProfitTracking } from '../../hooks/useProfitTracking';
import { formatISK } from '../../utils/formatters';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getWalletBalance } from '../../api/esi';

/**
 * ProfitPerHourCalculator Component
 *
 * Track actual trading time with start/stop timer, calculate ISK earned,
 * show running ISK/hour rate, and maintain historical session data.
 */
export function ProfitPerHourCalculator() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const {
    isTracking,
    currentSession,
    sessions,
    elapsedTime,
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    updateSessionISK,
    deleteSession,
    clearAllSessions,
    getStatistics,
    getCurrentStats,
  } = useProfitTracking();

  const [activityType, setActivityType] = useState('station');
  const [location, setLocation] = useState('');
  const [startingISK, setStartingISK] = useState('');
  const [endingISK, setEndingISK] = useState('');
  const [autoUpdateISK, setAutoUpdateISK] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const stats = getStatistics();
  const currentStats = getCurrentStats();

  // Auto-update ISK from wallet if authenticated
  useEffect(() => {
    if (!autoUpdateISK || !isAuthenticated || !character?.id) return;

    const updateWallet = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const balance = await getWalletBalance(character.id, token);
          if (isTracking && currentSession) {
            updateSessionISK(balance);
          }
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
      }
    };

    updateWallet();
    const interval = setInterval(updateWallet, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [autoUpdateISK, isAuthenticated, character, isTracking, currentSession, getAccessToken, updateSessionISK]);

  const handleStartSession = () => {
    const isk = parseFloat(startingISK) || 0;
    startSession(activityType, {
      location,
      startingISK: isk,
    });
    setStartingISK('');
  };

  const handleStopSession = () => {
    const isk = parseFloat(endingISK) || (currentSession?.endingISK || 0);
    stopSession(isk);
    setEndingISK('');
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionDuration = (duration) => {
    const seconds = Math.floor(duration / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'station':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'hauling':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'region':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-text-secondary border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">
            Profit Per Hour Calculator
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Track your trading sessions and analyze profitability
          </p>
        </div>
      </div>

      {/* Current Session Timer */}
      {isTracking && currentStats && (
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-text-primary">
                Session Active
              </h3>
              <span className={`px-2 py-1 rounded text-xs border ${getActivityColor(currentSession.activityType)}`}>
                {currentSession.activityType}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={pauseSession}
                className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded hover:bg-yellow-500/30 transition-colors text-sm"
              >
                Pause
              </button>
              <button
                onClick={handleStopSession}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors text-sm"
              >
                Stop Session
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Elapsed Time
              </div>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {formatTime(elapsedTime)}
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Current Profit
              </div>
              <div className="text-2xl font-mono font-bold text-green-400">
                {formatISK(currentStats.profit)}
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                ISK/Hour
              </div>
              <div className="text-2xl font-mono font-bold text-purple-400">
                {formatISK(currentStats.iskPerHour, false)}/h
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Trades
              </div>
              <div className="text-2xl font-mono font-bold text-text-primary">
                {currentStats.tradeCount}
              </div>
            </div>
          </div>

          {isAuthenticated && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoUpdate"
                checked={autoUpdateISK}
                onChange={(e) => setAutoUpdateISK(e.target.checked)}
                className="w-4 h-4 rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan"
              />
              <label htmlFor="autoUpdate" className="text-sm text-text-secondary">
                Auto-update ISK from wallet (updates every minute)
              </label>
            </div>
          )}
        </div>
      )}

      {/* Paused Session */}
      {!isTracking && currentSession && (
        <div className="glass p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-text-primary">
                Session Paused
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resumeSession}
                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors text-sm"
              >
                Resume
              </button>
              <button
                onClick={handleStopSession}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors text-sm"
              >
                Stop Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Session Form */}
      {!isTracking && !currentSession && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Start New Session
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Activity Type
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary focus:border-accent-cyan focus:outline-none"
              >
                <option value="station">Station Trading</option>
                <option value="hauling">Station Hauling</option>
                <option value="region">Region Hauling</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Jita 4-4"
                className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary placeholder-text-secondary/50 focus:border-accent-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Starting ISK
              </label>
              <input
                type="number"
                value={startingISK}
                onChange={(e) => setStartingISK(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary placeholder-text-secondary/50 focus:border-accent-cyan focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleStartSession}
            className="w-full btn-primary"
          >
            Start Tracking
          </button>
        </div>
      )}

      {/* Overall Statistics */}
      {sessions.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Overall Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Total Profit
              </div>
              <div className="text-xl font-mono font-bold text-green-400">
                {formatISK(stats.totalProfit)}
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Total Time
              </div>
              <div className="text-xl font-mono font-bold text-text-primary">
                {formatSessionDuration(stats.totalTime)}
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Avg ISK/Hour
              </div>
              <div className="text-xl font-mono font-bold text-purple-400">
                {formatISK(stats.averageISKPerHour, false)}/h
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Sessions
              </div>
              <div className="text-xl font-mono font-bold text-text-primary">
                {stats.totalSessions}
              </div>
            </div>
          </div>

          {/* Activity Breakdown */}
          {Object.keys(stats.byActivity).length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-text-primary mb-3">
                By Activity Type
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats.byActivity).map(([type, data]) => (
                  <div key={type} className="bg-space-dark/50 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs border ${getActivityColor(type)}`}>
                        {type}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {data.count} sessions
                      </span>
                    </div>
                    <div className="text-lg font-mono font-bold text-cyan-400">
                      {formatISK(data.averageISKPerHour, false)}/h
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Total: {formatISK(data.totalProfit)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all session history?')) {
                  clearAllSessions();
                }
              }}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All History
            </button>
          </div>
        </div>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Session History
          </h3>

          <div className="space-y-2">
            {[...sessions].reverse().map((session) => (
              <div
                key={session.id}
                className={`p-4 bg-space-dark/30 rounded border cursor-pointer transition-all ${
                  selectedSessionId === session.id
                    ? 'border-accent-cyan'
                    : 'border-accent-cyan/10 hover:border-accent-cyan/30'
                }`}
                onClick={() => setSelectedSessionId(
                  selectedSessionId === session.id ? null : session.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs border ${getActivityColor(session.activityType)}`}>
                      {session.activityType}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-text-primary">
                        {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString()}
                      </div>
                      {session.metadata?.location && (
                        <div className="text-xs text-text-secondary">
                          {session.metadata.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-mono text-green-400">
                        {formatISK(session.profit)}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {formatSessionDuration(session.duration)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-purple-400">
                        {formatISK(session.iskPerHour, false)}/h
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this session?')) {
                          deleteSession(session.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {selectedSessionId === session.id && session.trades && session.trades.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-accent-cyan/10">
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                      Trades ({session.trades.length})
                    </h4>
                    <div className="space-y-1">
                      {session.trades.map((trade, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">{trade.itemName}</span>
                          <span className="font-mono text-green-400">
                            {formatISK(trade.profit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && !isTracking && !currentSession && (
        <div className="glass p-12 text-center">
          <div className="text-4xl mb-4">⏱️</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Sessions Yet
          </h3>
          <p className="text-text-secondary">
            Start tracking a session to see your profit per hour analytics
          </p>
        </div>
      )}
    </div>
  );
}

export default ProfitPerHourCalculator;
