import { useState, useEffect, useCallback, useMemo } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';
import { formatISK, formatDuration } from '../../utils/formatters';

const STORAGE_KEY = 'evetrade_sessions';

/**
 * Trade Session Timer Component
 * Tracks trading sessions with timer, ISK earned, and ISK/hour calculations
 */
export function TradeSessionTimer({
  onSessionStart,
  onSessionPause,
  onSessionEnd,
  showHistory = true,
  compact = false,
}) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [iskEarned, setIskEarned] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing from localStorage on mount
        setSessions(parsed);
      }
    } catch (err) {
      console.error('Failed to load sessions from localStorage:', err);
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((newSessions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      setSessions(newSessions);
    } catch (err) {
      console.error('Failed to save sessions to localStorage:', err);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStart - pausedTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, sessionStart, pausedTime]);

  // Start session
  const handleStart = useCallback(() => {
    const now = Date.now();
    setIsActive(true);
    setIsPaused(false);
    setSessionStart(now);
    setElapsedSeconds(0);
    setPausedTime(0);
    setIskEarned(0);
    onSessionStart?.({ timestamp: now });
  }, [onSessionStart]);

  // Pause session
  const handlePause = useCallback(() => {
    if (isPaused) {
      // Resume
      const pauseDuration = Date.now() - pausedTime;
      setPausedTime(pauseDuration);
      setIsPaused(false);
    } else {
      // Pause
      setPausedTime(Date.now());
      setIsPaused(true);
    }
    onSessionPause?.({ paused: !isPaused, elapsedSeconds });
  }, [isPaused, elapsedSeconds, pausedTime, onSessionPause]);

  // Stop session
  const handleStop = useCallback(() => {
    if (isActive) {
      const session = {
        id: Date.now(),
        startTime: sessionStart,
        duration: elapsedSeconds,
        iskEarned,
        iskPerHour: elapsedSeconds > 0 ? (iskEarned / elapsedSeconds) * 3600 : 0,
        date: new Date(sessionStart).toISOString(),
      };

      const newSessions = [session, ...sessions].slice(0, 50); // Keep last 50 sessions
      saveSessions(newSessions);

      onSessionEnd?.(session);
    }

    setIsActive(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setSessionStart(null);
    setPausedTime(0);
    setIskEarned(0);
  }, [isActive, sessionStart, elapsedSeconds, iskEarned, sessions, saveSessions, onSessionEnd]);

  // Update ISK earned
  const handleIskChange = useCallback((value) => {
    const numValue = parseFloat(value) || 0;
    setIskEarned(numValue);
  }, []);

  // Add ISK to current total
  const handleAddIsk = useCallback((amount) => {
    setIskEarned(prev => prev + amount);
  }, []);

  // Calculate ISK per hour
  const iskPerHour = useMemo(() => {
    if (elapsedSeconds === 0) return 0;
    return (iskEarned / elapsedSeconds) * 3600;
  }, [iskEarned, elapsedSeconds]);

  // Format elapsed time
  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Delete session
  const handleDeleteSession = useCallback((sessionId) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(newSessions);
  }, [sessions, saveSessions]);

  // Clear all sessions
  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all session history?')) {
      saveSessions([]);
    }
  }, [saveSessions]);

  // Today's stats
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s =>
      new Date(s.date).toDateString() === today
    );

    return {
      count: todaySessions.length,
      totalDuration: todaySessions.reduce((sum, s) => sum + s.duration, 0),
      totalIsk: todaySessions.reduce((sum, s) => sum + s.iskEarned, 0),
    };
  }, [sessions]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-space-dark/50 border border-accent-cyan/20 rounded-lg">
        {/* Timer display */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive && !isPaused ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-mono text-lg text-text-primary">{formattedTime}</span>
        </div>

        {/* ISK/hr */}
        <div className="text-sm text-text-secondary">
          {formatISK(iskPerHour)}/hr
        </div>

        {/* Controls */}
        <div className="flex gap-1 ml-auto">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
              title="Start session"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className={`p-1.5 rounded transition-colors ${
                  isPaused
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                }`}
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleStop}
                className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                title="Stop session"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <GlassmorphicCard padding="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display text-accent-cyan">Trade Session Timer</h3>
        {showHistory && (
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="text-sm text-text-secondary hover:text-accent-cyan transition-colors"
          >
            {showHistoryPanel ? 'Hide History' : 'View History'}
          </button>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${isActive && !isPaused ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <div className="font-mono text-5xl text-text-primary font-bold">
            {formattedTime}
          </div>
        </div>
        {isPaused && (
          <div className="text-sm text-yellow-400">Paused</div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-space-black/50 rounded-lg border border-accent-cyan/10">
          <div className="text-xs text-text-secondary mb-1">ISK Earned</div>
          <div className="text-xl font-bold text-accent-cyan">{formatISK(iskEarned)}</div>
        </div>
        <div className="p-4 bg-space-black/50 rounded-lg border border-accent-cyan/10">
          <div className="text-xs text-text-secondary mb-1">ISK/Hour</div>
          <div className="text-xl font-bold text-accent-gold">{formatISK(iskPerHour)}/hr</div>
        </div>
      </div>

      {/* ISK Input */}
      {isActive && (
        <div className="mb-6">
          <label className="text-xs text-text-secondary mb-2 block">Update ISK Earned</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={iskEarned}
              onChange={(e) => handleIskChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
              placeholder="Enter ISK earned"
              step="1000000"
            />
            <button
              onClick={() => handleAddIsk(1000000)}
              className="px-3 py-2 bg-accent-cyan/10 text-accent-cyan rounded-lg hover:bg-accent-cyan/20 transition-colors text-sm"
              title="Add 1M ISK"
            >
              +1M
            </button>
            <button
              onClick={() => handleAddIsk(10000000)}
              className="px-3 py-2 bg-accent-cyan/10 text-accent-cyan rounded-lg hover:bg-accent-cyan/20 transition-colors text-sm"
              title="Add 10M ISK"
            >
              +10M
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isActive ? (
          <button
            onClick={handleStart}
            className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Session
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className={`flex-1 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                isPaused
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              }`}
            >
              {isPaused ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resume
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </>
              )}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop & Save
            </button>
          </>
        )}
      </div>

      {/* Today's Summary */}
      {todayStats.count > 0 && (
        <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
          <div className="text-xs text-text-secondary mb-2">Today's Summary</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-text-secondary">Sessions</div>
              <div className="text-text-primary font-bold">{todayStats.count}</div>
            </div>
            <div>
              <div className="text-text-secondary">Duration</div>
              <div className="text-text-primary font-bold">{formatDuration(todayStats.totalDuration)}</div>
            </div>
            <div>
              <div className="text-text-secondary">Total ISK</div>
              <div className="text-accent-cyan font-bold">{formatISK(todayStats.totalIsk, false)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Session History */}
      {showHistoryPanel && showHistory && sessions.length > 0 && (
        <div className="mt-6 border-t border-accent-cyan/20 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-text-primary">Session History</h4>
            <button
              onClick={handleClearHistory}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-space-black/50 border border-accent-cyan/10 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="text-xs text-text-secondary">
                    {new Date(session.date).toLocaleString()}
                  </div>
                  <div className="text-sm text-text-primary mt-1">
                    {formatDuration(session.duration)} - {formatISK(session.iskEarned)}
                  </div>
                  <div className="text-xs text-accent-gold mt-1">
                    {formatISK(session.iskPerHour)}/hr
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                  aria-label="Delete session"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default TradeSessionTimer;
