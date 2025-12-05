import { useState, useCallback, useEffect, useRef } from 'react';
import * as Sentry from '@sentry/react';
import { getCharacterLoyaltyPoints, getTypeNames } from '../api/esi';

/**
 * NPC Corporation IDs for common LP stores
 */
const NPC_CORPORATIONS = {
  1000125: 'Serpentis Corporation',
  1000035: 'Caldari Navy',
  1000036: 'Imperial Academy',
  1000046: 'Gallente Federation Navy',
  1000051: 'Republic Fleet',
  1000084: 'Sisters of EVE',
  1000127: 'Guristas Pirates',
  1000134: 'Blood Raiders',
  1000137: 'Mordu\'s Legion Command',
  1000180: 'Concord',
};

/**
 * Hook for managing character LP (Loyalty Points) balance
 * Fetches LP from ESI and provides utilities for LP management
 *
 * @param {Object} options - Configuration options
 * @param {number} options.characterId - Character ID
 * @param {Function} options.getAccessToken - Function to get access token
 * @returns {Object} LP state and methods
 */
export function useCharacterLP(options = {}) {
  const { characterId, getAccessToken } = options;

  const [lpData, setLpData] = useState([]);
  const [corporationNames, setCorporationNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Fetch LP balance from ESI
   */
  const fetchLPBalance = useCallback(async () => {
    if (!characterId || !getAccessToken) {
      return null;
    }

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const lpPoints = await getCharacterLoyaltyPoints(characterId, accessToken);

      if (abortController.signal.aborted) {
        return null;
      }

      // Get corporation names for any unknown corporations
      const unknownCorpIds = lpPoints
        .map((lp) => lp.corporation_id)
        .filter((id) => !NPC_CORPORATIONS[id] && !corporationNames[id]);

      if (unknownCorpIds.length > 0) {
        try {
          const names = await getTypeNames(unknownCorpIds);
          const nameMap = {};
          names.forEach((n) => {
            nameMap[n.id] = n.name;
          });
          setCorporationNames((prev) => ({ ...prev, ...nameMap }));
        } catch {
          // Non-critical error, continue with IDs
        }
      }

      // Sort by LP amount (highest first)
      const sortedLP = [...lpPoints].sort((a, b) => b.loyalty_points - a.loyalty_points);

      setLpData(sortedLP);
      setLastUpdated(new Date());

      return sortedLP;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }

      Sentry.withScope((scope) => {
        scope.setTag('errorType', 'useCharacterLP');
        scope.setExtra('characterId', characterId);
        Sentry.captureException(err);
      });

      const errorMessage = err.message || 'Failed to fetch LP balance';
      setError({ message: errorMessage, original: err });
      throw err;
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [characterId, getAccessToken, corporationNames]);

  /**
   * Get corporation name by ID
   */
  const getCorporationName = useCallback(
    (corporationId) => {
      return NPC_CORPORATIONS[corporationId] || corporationNames[corporationId] || `Corporation #${corporationId}`;
    },
    [corporationNames]
  );

  /**
   * Get total LP across all corporations
   */
  const getTotalLP = useCallback(() => {
    return lpData.reduce((total, lp) => total + lp.loyalty_points, 0);
  }, [lpData]);

  /**
   * Get LP for a specific corporation
   */
  const getLPForCorporation = useCallback(
    (corporationId) => {
      const entry = lpData.find((lp) => lp.corporation_id === corporationId);
      return entry?.loyalty_points || 0;
    },
    [lpData]
  );

  /**
   * Get corporations with LP above a threshold
   */
  const getCorporationsAboveThreshold = useCallback(
    (threshold) => {
      return lpData.filter((lp) => lp.loyalty_points >= threshold);
    },
    [lpData]
  );

  /**
   * Format LP data for display
   */
  const getFormattedLPData = useCallback(() => {
    return lpData.map((lp) => ({
      corporationId: lp.corporation_id,
      corporationName: getCorporationName(lp.corporation_id),
      loyaltyPoints: lp.loyalty_points,
      formattedLP: lp.loyalty_points.toLocaleString(),
    }));
  }, [lpData, getCorporationName]);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setLpData([]);
    setError(null);
    setLastUpdated(null);
  }, []);

  /**
   * Cancel pending requests
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  return {
    // State
    lpData,
    loading,
    error,
    lastUpdated,

    // Core methods
    fetchLPBalance,
    reset,
    cancel,

    // Utilities
    getCorporationName,
    getTotalLP,
    getLPForCorporation,
    getCorporationsAboveThreshold,
    getFormattedLPData,
  };
}

export default useCharacterLP;
