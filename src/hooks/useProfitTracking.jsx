import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'eve_profit_tracking';
const MAX_SESSIONS = 100; // Keep last 100 sessions

/**
 * useProfitTracking Hook
 *
 * Tracks trading sessions with start/stop timer, calculates ISK/hour,
 * maintains historical session data in localStorage.
 *
 * @returns {Object} Tracking state and control functions
 */
export function useProfitTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing from localStorage on mount
        setSessions(data.sessions || []);

        // Resume active session if exists
        if (data.currentSession && data.currentSession.isActive) {
          const elapsed = Date.now() - data.currentSession.startTime;
          setCurrentSession(data.currentSession);
          setElapsedTime(elapsed);
          setIsTracking(true);
        }
      }
    } catch (error) {
      console.error('Failed to load profit tracking data:', error);
    }
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    try {
      const data = {
        sessions: sessions.slice(-MAX_SESSIONS), // Keep only last N sessions
        currentSession: isTracking ? currentSession : null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save profit tracking data:', error);
    }
  }, [sessions, currentSession, isTracking]);

  // Timer effect
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1000);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking]);

  /**
   * Start a new tracking session
   * @param {string} activityType - Type of trading activity (e.g., 'station', 'hauling')
   * @param {Object} metadata - Additional session metadata
   */
  const startSession = useCallback((activityType = 'station', metadata = {}) => {
    const session = {
      id: Date.now(),
      activityType,
      startTime: Date.now(),
      endTime: null,
      startingISK: metadata.startingISK || 0,
      endingISK: metadata.startingISK || 0,
      trades: [],
      metadata: {
        location: metadata.location || 'Unknown',
        ...metadata,
      },
      isActive: true,
    };

    setCurrentSession(session);
    setElapsedTime(0);
    setIsTracking(true);
  }, []);

  /**
   * Stop current tracking session
   * @param {number} endingISK - Final ISK amount
   */
  const stopSession = useCallback((endingISK = 0) => {
    if (!currentSession) return;

    const endTime = Date.now();
    const duration = endTime - currentSession.startTime;
    const profit = endingISK - currentSession.startingISK;
    const iskPerHour = duration > 0 ? (profit / duration) * 3600000 : 0;

    const completedSession = {
      ...currentSession,
      endTime,
      endingISK,
      duration,
      profit,
      iskPerHour,
      isActive: false,
    };

    setSessions((prev) => [...prev, completedSession]);
    setCurrentSession(null);
    setIsTracking(false);
    setElapsedTime(0);
  }, [currentSession]);

  /**
   * Pause current session
   */
  const pauseSession = useCallback(() => {
    if (!isTracking) return;

    setCurrentSession((prev) => ({
      ...prev,
      pausedAt: Date.now(),
      pausedDuration: (prev.pausedDuration || 0) + elapsedTime,
    }));
    setIsTracking(false);
  }, [isTracking, elapsedTime]);

  /**
   * Resume paused session
   */
  const resumeSession = useCallback(() => {
    if (isTracking || !currentSession) return;

    setCurrentSession((prev) => ({
      ...prev,
      startTime: Date.now() - (prev.pausedDuration || 0),
      pausedAt: null,
    }));
    setIsTracking(true);
  }, [isTracking, currentSession]);

  /**
   * Add trade to current session
   * @param {Object} trade - Trade details
   */
  const addTrade = useCallback((trade) => {
    if (!currentSession) return;

    const tradeRecord = {
      timestamp: Date.now(),
      itemName: trade.itemName || 'Unknown',
      quantity: trade.quantity || 0,
      buyPrice: trade.buyPrice || 0,
      sellPrice: trade.sellPrice || 0,
      profit: trade.profit || 0,
      ...trade,
    };

    setCurrentSession((prev) => ({
      ...prev,
      trades: [...(prev.trades || []), tradeRecord],
      endingISK: prev.startingISK + tradeRecord.profit,
    }));
  }, [currentSession]);

  /**
   * Update session ISK manually
   * @param {number} isk - Current ISK amount
   */
  const updateSessionISK = useCallback((isk) => {
    if (!currentSession) return;

    setCurrentSession((prev) => ({
      ...prev,
      endingISK: isk,
    }));
  }, [currentSession]);

  /**
   * Delete a session by ID
   * @param {number} sessionId - Session ID to delete
   */
  const deleteSession = useCallback((sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  /**
   * Clear all sessions
   */
  const clearAllSessions = useCallback(() => {
    setSessions([]);
    if (!isTracking) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isTracking]);

  /**
   * Get statistics for all sessions
   */
  const getStatistics = useCallback(() => {
    if (sessions.length === 0) {
      return {
        totalProfit: 0,
        totalTime: 0,
        averageISKPerHour: 0,
        totalSessions: 0,
        bestSession: null,
        worstSession: null,
        byActivity: {},
      };
    }

    const totalProfit = sessions.reduce((sum, s) => sum + (s.profit || 0), 0);
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageISKPerHour = totalTime > 0 ? (totalProfit / totalTime) * 3600000 : 0;

    // Find best and worst sessions
    const sortedByProfit = [...sessions].sort((a, b) => (b.iskPerHour || 0) - (a.iskPerHour || 0));
    const bestSession = sortedByProfit[0] || null;
    const worstSession = sortedByProfit[sortedByProfit.length - 1] || null;

    // Group by activity type
    const byActivity = sessions.reduce((acc, session) => {
      const type = session.activityType || 'unknown';
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalProfit: 0,
          totalTime: 0,
          averageISKPerHour: 0,
        };
      }
      acc[type].count++;
      acc[type].totalProfit += session.profit || 0;
      acc[type].totalTime += session.duration || 0;
      acc[type].averageISKPerHour =
        acc[type].totalTime > 0
          ? (acc[type].totalProfit / acc[type].totalTime) * 3600000
          : 0;
      return acc;
    }, {});

    return {
      totalProfit,
      totalTime,
      averageISKPerHour,
      totalSessions: sessions.length,
      bestSession,
      worstSession,
      byActivity,
    };
  }, [sessions]);

  /**
   * Get current session stats
   */
  const getCurrentStats = useCallback(() => {
    if (!currentSession) return null;

    const duration = isTracking ? elapsedTime : 0;
    const profit = currentSession.endingISK - currentSession.startingISK;
    const iskPerHour = duration > 0 ? (profit / duration) * 3600000 : 0;

    return {
      duration,
      profit,
      iskPerHour,
      tradeCount: currentSession.trades?.length || 0,
      startingISK: currentSession.startingISK,
      currentISK: currentSession.endingISK,
    };
  }, [currentSession, isTracking, elapsedTime]);

  return {
    // State
    isTracking,
    currentSession,
    sessions,
    elapsedTime,

    // Actions
    startSession,
    stopSession,
    pauseSession,
    resumeSession,
    addTrade,
    updateSessionISK,
    deleteSession,
    clearAllSessions,

    // Computed
    getStatistics,
    getCurrentStats,
  };
}

export default useProfitTracking;
