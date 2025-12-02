import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

const ZKILL_API = 'https://zkillboard.com/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Zkillboard integration for route safety analysis
 * Fetches recent kills data to assess route danger levels
 */
export function useZkillboard() {
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Fetch recent kills for a solar system
   */
  const fetchSystemKills = useCallback(async (systemId, options = {}) => {
    const { hours = 24, limit = 50 } = options;
    const cacheKey = `system_${systemId}_${hours}`;

    // Check cache
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Zkillboard rate limits: 10 requests per second
      // Adding delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await fetch(
        `${ZKILL_API}/systemID/${systemId}/pastSeconds/${hours * 3600}/`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'EVETrade/1.0 (https://evetrade.space)',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zkillboard API error: ${response.status}`);
      }

      const kills = await response.json();
      const limitedKills = kills.slice(0, limit);

      // Cache the result
      setCache(prev => ({
        ...prev,
        [cacheKey]: { data: limitedKills, timestamp: Date.now() },
      }));

      return limitedKills;
    } catch (err) {
      console.warn(`Failed to fetch kills for system ${systemId}:`, err);
      return [];
    }
  }, [cache]);

  /**
   * Fetch recent kills for a region
   */
  const fetchRegionKills = useCallback(async (regionId, options = {}) => {
    const { hours = 1, limit = 100 } = options;
    const cacheKey = `region_${regionId}_${hours}`;

    // Check cache
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await fetch(
        `${ZKILL_API}/regionID/${regionId}/pastSeconds/${hours * 3600}/`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'EVETrade/1.0 (https://evetrade.space)',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zkillboard API error: ${response.status}`);
      }

      const kills = await response.json();
      const limitedKills = kills.slice(0, limit);

      setCache(prev => ({
        ...prev,
        [cacheKey]: { data: limitedKills, timestamp: Date.now() },
      }));

      return limitedKills;
    } catch (err) {
      console.warn(`Failed to fetch kills for region ${regionId}:`, err);
      return [];
    }
  }, [cache]);

  /**
   * Analyze kill data to determine danger level
   */
  const analyzeKillData = useCallback((kills) => {
    if (!kills || kills.length === 0) {
      return {
        dangerLevel: 'safe',
        score: 0,
        killCount: 0,
        shipKills: 0,
        podKills: 0,
        avgValue: 0,
        topShipsLost: [],
        activeHours: [],
        gateCamps: false,
        smartbombers: false,
      };
    }

    // Analyze kills
    const podTypeId = 670; // Capsule type ID
    const shipKills = kills.filter(k => k.killmail?.victim?.ship_type_id !== podTypeId);
    const podKills = kills.filter(k => k.killmail?.victim?.ship_type_id === podTypeId);

    // Calculate total value
    const totalValue = kills.reduce((sum, k) => sum + (k.zkb?.totalValue || 0), 0);
    const avgValue = kills.length > 0 ? totalValue / kills.length : 0;

    // Analyze time distribution to detect gate camps
    const hourCounts = {};
    kills.forEach(k => {
      const hour = new Date(k.killmail?.killmail_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const activeHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Detect potential gate camps (many kills in short time)
    const gateCamps = kills.length > 10 && (
      Object.values(hourCounts).some(count => count > 5) ||
      podKills.length > 5
    );

    // Detect smartbombing (multiple pod kills with high sec status victims)
    const smartbombers = podKills.length > 3;

    // Count ship types lost
    const shipTypeCounts = {};
    kills.forEach(k => {
      const shipTypeId = k.killmail?.victim?.ship_type_id;
      if (shipTypeId && shipTypeId !== podTypeId) {
        shipTypeCounts[shipTypeId] = (shipTypeCounts[shipTypeId] || 0) + 1;
      }
    });

    const topShipsLost = Object.entries(shipTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([typeId, count]) => ({ typeId: parseInt(typeId), count }));

    // Calculate danger score (0-100)
    let score = 0;
    score += Math.min(kills.length * 2, 40); // Up to 40 points for kill count
    score += gateCamps ? 20 : 0;
    score += smartbombers ? 15 : 0;
    score += podKills.length > 3 ? 10 : 0;
    score += avgValue > 100000000 ? 15 : (avgValue > 10000000 ? 10 : 0);
    score = Math.min(score, 100);

    // Determine danger level
    let dangerLevel = 'safe';
    if (score >= 70) dangerLevel = 'deadly';
    else if (score >= 50) dangerLevel = 'dangerous';
    else if (score >= 30) dangerLevel = 'risky';
    else if (score >= 10) dangerLevel = 'caution';

    return {
      dangerLevel,
      score,
      killCount: kills.length,
      shipKills: shipKills.length,
      podKills: podKills.length,
      avgValue,
      topShipsLost,
      activeHours,
      gateCamps,
      smartbombers,
    };
  }, []);

  /**
   * Get route safety analysis
   * Takes an array of system IDs and returns safety data for each
   */
  const analyzeRoute = useCallback(async (systemIds, options = {}) => {
    if (!systemIds || systemIds.length === 0) {
      return { systems: [], overallDanger: 'safe', overallScore: 0 };
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch kills for each system (with rate limiting)
      const systemAnalyses = [];

      for (const systemId of systemIds) {
        const kills = await fetchSystemKills(systemId, options);
        const analysis = analyzeKillData(kills);
        systemAnalyses.push({
          systemId,
          ...analysis,
        });
      }

      // Calculate overall route danger
      const avgScore = systemAnalyses.reduce((sum, s) => sum + s.score, 0) / systemAnalyses.length;
      const maxScore = Math.max(...systemAnalyses.map(s => s.score));
      const dangerousSystems = systemAnalyses.filter(s => s.score >= 50);

      // Overall score weighted by max danger
      const overallScore = Math.round((avgScore * 0.4) + (maxScore * 0.6));

      let overallDanger = 'safe';
      if (overallScore >= 70 || dangerousSystems.length >= 3) overallDanger = 'deadly';
      else if (overallScore >= 50 || dangerousSystems.length >= 2) overallDanger = 'dangerous';
      else if (overallScore >= 30 || dangerousSystems.length >= 1) overallDanger = 'risky';
      else if (overallScore >= 10) overallDanger = 'caution';

      return {
        systems: systemAnalyses,
        overallDanger,
        overallScore,
        dangerousSystems: dangerousSystems.length,
        totalKills: systemAnalyses.reduce((sum, s) => sum + s.killCount, 0),
      };
    } catch (err) {
      setError(err.message);
      return { systems: [], overallDanger: 'unknown', overallScore: 0 };
    } finally {
      setLoading(false);
    }
  }, [fetchSystemKills, analyzeKillData]);

  /**
   * Get quick safety check for a single system
   */
  const getSystemSafety = useCallback(async (systemId, options = {}) => {
    const kills = await fetchSystemKills(systemId, options);
    return analyzeKillData(kills);
  }, [fetchSystemKills, analyzeKillData]);

  /**
   * Get recent kills for display
   */
  const getRecentKills = useCallback(async (systemId, limit = 10) => {
    const kills = await fetchSystemKills(systemId, { limit });
    return kills.map(k => ({
      killmailId: k.killmail_id,
      time: k.killmail?.killmail_time,
      victimShipTypeId: k.killmail?.victim?.ship_type_id,
      victimCharacterId: k.killmail?.victim?.character_id,
      victimCorporationId: k.killmail?.victim?.corporation_id,
      value: k.zkb?.totalValue || 0,
      attackerCount: k.killmail?.attackers?.length || 0,
      npc: k.zkb?.npc || false,
      solo: k.zkb?.solo || false,
      awox: k.zkb?.awox || false,
    }));
  }, [fetchSystemKills]);

  /**
   * Format ISK value for display
   */
  const formatISK = useCallback((value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toLocaleString();
  }, []);

  /**
   * Get danger color for styling
   */
  const getDangerColor = useCallback((level) => {
    const colors = {
      safe: { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-500' },
      caution: { bg: 'bg-yellow-600/20', text: 'text-yellow-400', border: 'border-yellow-500' },
      risky: { bg: 'bg-orange-600/20', text: 'text-orange-400', border: 'border-orange-500' },
      dangerous: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-500' },
      deadly: { bg: 'bg-red-800/30', text: 'text-red-300', border: 'border-red-600' },
      unknown: { bg: 'bg-slate-600/20', text: 'text-slate-400', border: 'border-slate-500' },
    };
    return colors[level] || colors.unknown;
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  return {
    // State
    loading,
    error,

    // Analysis methods
    analyzeRoute,
    getSystemSafety,
    getRecentKills,
    fetchSystemKills,
    fetchRegionKills,
    analyzeKillData,

    // Utilities
    formatISK,
    getDangerColor,
    clearCache,
  };
}

export default useZkillboard;
