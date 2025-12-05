import { useState, useCallback, useEffect, useMemo, createContext, useContext } from 'react';
import {
  getCharacterInfo,
  getCharacterPortrait,
  getWalletBalance,
  getCharacterSkills,
  getCharacterOrders,
  getCharacterAssets,
  calculateTradingTaxes,
} from '../api/esi';

const STORAGE_KEY = 'evetrade_characters';
const ACTIVE_CHARACTER_KEY = 'evetrade_active_character';

/**
 * Multi-character management for EVETrade
 * Allows users to manage multiple EVE Online characters and switch between them
 */

const MultiCharacterContext = createContext(null);

/**
 * Parse JWT token to extract character info
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function MultiCharacterProvider({ children }) {
  const [characters, setCharacters] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeCharacterId, setActiveCharacterId] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_CHARACTER_KEY) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [characterData, setCharacterData] = useState({});

  // Listen for character added from EveAuth
  useEffect(() => {
    const handleCharacterAdded = (event) => {
      const { characterId: _characterId, authData } = event.detail;
      addCharacter(authData).catch(console.error);
    };

    const handleLogout = () => {
      setCharacters([]);
      setActiveCharacterId(null);
      setCharacterData({});
    };

    window.addEventListener('eveauth:character-added', handleCharacterAdded);
    window.addEventListener('eveauth:logout', handleLogout);

    return () => {
      window.removeEventListener('eveauth:character-added', handleCharacterAdded);
      window.removeEventListener('eveauth:logout', handleLogout);
    };
  }, []);

  // Persist characters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch (e) {
      console.warn('Failed to save characters:', e);
    }
  }, [characters]);

  // Persist active character
  useEffect(() => {
    try {
      if (activeCharacterId) {
        localStorage.setItem(ACTIVE_CHARACTER_KEY, activeCharacterId);
      } else {
        localStorage.removeItem(ACTIVE_CHARACTER_KEY);
      }
    } catch (e) {
      console.warn('Failed to save active character:', e);
    }
  }, [activeCharacterId]);

  /**
   * Add a new character from auth tokens
   */
  const addCharacter = useCallback(async (authData) => {
    const { accessToken, refreshToken, expiresAt } = authData;

    // Parse token to get character info
    const tokenData = parseJwt(accessToken);
    if (!tokenData) {
      throw new Error('Invalid access token');
    }

    const characterId = tokenData.sub?.split(':')[2];
    if (!characterId) {
      throw new Error('Could not extract character ID from token');
    }

    // Check if character already exists
    const exists = characters.some(c => c.id === characterId);
    if (exists) {
      // Update existing character's tokens
      setCharacters(prev => prev.map(c =>
        c.id === characterId
          ? { ...c, accessToken, refreshToken, expiresAt, lastUpdated: Date.now() }
          : c
      ));
      return characterId;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch character details
      const [charInfo, portrait] = await Promise.all([
        getCharacterInfo(characterId),
        getCharacterPortrait(characterId),
      ]);

      const newCharacter = {
        id: characterId,
        name: tokenData.name || charInfo.name,
        corporationId: charInfo.corporation_id,
        allianceId: charInfo.alliance_id,
        portrait: portrait.px128x128 || portrait.px64x64,
        accessToken,
        refreshToken,
        expiresAt,
        addedAt: Date.now(),
        lastUpdated: Date.now(),
      };

      setCharacters(prev => [...prev, newCharacter]);

      // Set as active if it's the first character
      if (characters.length === 0) {
        setActiveCharacterId(characterId);
      }

      return characterId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [characters]);

  /**
   * Remove a character
   */
  const removeCharacter = useCallback((characterId) => {
    setCharacters(prev => prev.filter(c => c.id !== characterId));
    setCharacterData(prev => {
      const next = { ...prev };
      delete next[characterId];
      return next;
    });

    // If removing active character, switch to first available
    if (activeCharacterId === characterId) {
      const remaining = characters.filter(c => c.id !== characterId);
      setActiveCharacterId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [characters, activeCharacterId]);

  /**
   * Switch active character
   */
  const switchCharacter = useCallback((characterId) => {
    const exists = characters.some(c => c.id === characterId);
    if (exists) {
      setActiveCharacterId(characterId);
    }
  }, [characters]);

  /**
   * Get valid access token for a character (with refresh if needed)
   */
  const getAccessToken = useCallback(async (characterId) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return null;

    // Check if token is still valid (with 5 min buffer)
    if (character.expiresAt - Date.now() > 5 * 60 * 1000) {
      return character.accessToken;
    }

    // Need to refresh - this would require the token refresh logic
    // For now, return the current token and let the caller handle refresh
    return character.accessToken;
  }, [characters]);

  /**
   * Fetch detailed data for a character
   */
  const fetchCharacterData = useCallback(async (characterId) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken(characterId);

      const [wallet, skills, orders, assets] = await Promise.allSettled([
        getWalletBalance(characterId, accessToken),
        getCharacterSkills(characterId, accessToken),
        getCharacterOrders(characterId, accessToken),
        getCharacterAssets(characterId, accessToken),
      ]);

      const data = {
        wallet: wallet.status === 'fulfilled' ? wallet.value : null,
        skills: skills.status === 'fulfilled' ? skills.value : null,
        orders: orders.status === 'fulfilled' ? orders.value : null,
        assets: assets.status === 'fulfilled' ? assets.value : null,
        taxes: skills.status === 'fulfilled' ? calculateTradingTaxes(skills.value, null) : null,
        fetchedAt: Date.now(),
      };

      setCharacterData(prev => ({
        ...prev,
        [characterId]: data,
      }));

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [characters, getAccessToken]);

  /**
   * Get aggregated data across all characters
   */
  const getAggregatedData = useCallback(() => {
    const allData = Object.values(characterData);

    return {
      totalWallet: allData.reduce((sum, d) => sum + (d.wallet || 0), 0),
      totalOrders: allData.reduce((sum, d) => sum + (d.orders?.length || 0), 0),
      totalAssets: allData.reduce((sum, d) => sum + (d.assets?.length || 0), 0),
      characterCount: characters.length,
    };
  }, [characterData, characters]);

  /**
   * Get active character
   */
  const activeCharacter = useMemo(() => {
    return characters.find(c => c.id === activeCharacterId) || null;
  }, [characters, activeCharacterId]);

  /**
   * Get active character's data
   */
  const activeCharacterData = useMemo(() => {
    return activeCharacterId ? characterData[activeCharacterId] || null : null;
  }, [characterData, activeCharacterId]);

  /**
   * Refresh all characters' data
   */
  const refreshAllCharacters = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all(characters.map(c => fetchCharacterData(c.id)));
    } finally {
      setLoading(false);
    }
  }, [characters, fetchCharacterData]);

  const value = {
    // State
    characters,
    activeCharacter,
    activeCharacterId,
    activeCharacterData,
    characterData,
    loading,
    error,

    // Actions
    addCharacter,
    removeCharacter,
    switchCharacter,
    fetchCharacterData,
    refreshAllCharacters,
    getAccessToken,
    getAggregatedData,

    // Utilities
    clearError: () => setError(null),
  };

  return (
    <MultiCharacterContext.Provider value={value}>
      {children}
    </MultiCharacterContext.Provider>
  );
}

/**
 * Hook to use multi-character context
 */
export function useMultiCharacter() {
  const context = useContext(MultiCharacterContext);
  if (!context) {
    throw new Error('useMultiCharacter must be used within a MultiCharacterProvider');
  }
  return context;
}

export default useMultiCharacter;
