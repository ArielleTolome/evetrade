import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useToast } from '../components/common/ToastProvider';

/**
 * EVE Online SSO Configuration
 * You'll need to register your app at https://developers.eveonline.com/
 * and get a Client ID
 */
const EVE_SSO_CONFIG = {
  clientId: import.meta.env.VITE_EVE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_EVE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  scopes: [
    'esi-wallet.read_character_wallet.v1',
    'esi-markets.read_character_orders.v1',
    'esi-markets.read_corporation_orders.v1',
    'esi-assets.read_assets.v1',
    'esi-characters.read_standings.v1',
    'esi-skills.read_skills.v1',
    'esi-planets.manage_planets.v1',
  ].join(' '),
  authUrl: 'https://login.eveonline.com/v2/oauth/authorize',
  tokenUrl: 'https://login.eveonline.com/v2/oauth/token',
  verifyUrl: 'https://esi.evetech.net/verify/',
};

const AUTH_STORAGE_KEY = 'eve_auth';
const OLD_AUTH_STORAGE_KEY = 'eve_auth'; // Keep for migration
const NEW_AUTH_STORAGE_KEY = 'eve_auth_multi';

/**
 * Parse JWT token to extract character info
 */
function parseJwt(token) {
  try {
    // Validate token format (JWT should have 3 parts: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format: expected 3 parts, got', parts.length);
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT token:', error);
    return null;
  }
}

/**
 * Migrate old single-character auth to new multi-character format
 */
function migrateOldAuth() {
  const oldAuth = localStorage.getItem(OLD_AUTH_STORAGE_KEY);
  const newAuth = localStorage.getItem(NEW_AUTH_STORAGE_KEY);

  // Only migrate if old auth exists and new doesn't
  if (oldAuth && !newAuth) {
    try {
      const parsed = JSON.parse(oldAuth);
      // Extract character info from token
      const tokenData = parseJwt(parsed.accessToken);
      if (tokenData) {
        const characterId = tokenData.sub?.split(':')[2];
        const migrated = {
          characters: [{
            id: characterId,
            name: tokenData.name,
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            expiresAt: parsed.expiresAt,
            addedAt: Date.now(),
          }],
          activeCharacterId: characterId,
        };
        localStorage.setItem(NEW_AUTH_STORAGE_KEY, JSON.stringify(migrated));
        localStorage.removeItem(OLD_AUTH_STORAGE_KEY);
        return migrated;
      }
    } catch (e) {
      console.warn('Failed to migrate old auth:', e);
    }
  }
  return null;
}

/**
 * Generate random string for PKCE
 */
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

/**
 * Generate code challenge for PKCE
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * EVE Auth Context
 */
const EveAuthContext = createContext(null);

/**
 * EVE Auth Provider Component
 * Now integrated with multi-character support
 */
export function EveAuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [multiCharAuth, setMultiCharAuth] = useState(null);
  const [authStatus, setAuthStatus] = useState('unauthenticated');
  const [notificationShown, setNotificationShown] = useState(false);
  const toast = useToast();

  // Ref to track in-flight refresh requests and prevent race conditions
  const refreshPromiseRef = useRef(null);

  // Load auth from storage on mount - check for migration first
  useEffect(() => {
    // Try to migrate old auth first
    const migrated = migrateOldAuth();
    if (migrated) {
      setMultiCharAuth(migrated);
      setAuth({
        accessToken: migrated.characters[0].accessToken,
        refreshToken: migrated.characters[0].refreshToken,
        expiresAt: migrated.characters[0].expiresAt,
      });
      setCharacter({
        id: migrated.characters[0].id,
        name: migrated.characters[0].name,
      });
      setLoading(false);
      return;
    }

    // Load new multi-character auth
    const stored = localStorage.getItem(NEW_AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMultiCharAuth(parsed);

        // Set active character as current auth
        const activeChar = parsed.characters.find(c => c.id === parsed.activeCharacterId);
        if (activeChar && activeChar.expiresAt > Date.now()) {
          setAuth({
            accessToken: activeChar.accessToken,
            refreshToken: activeChar.refreshToken,
            expiresAt: activeChar.expiresAt,
          });
          setCharacter({
            id: activeChar.id,
            name: activeChar.name,
          });
        } else if (activeChar?.refreshToken) {
          // Token expired, mark for refresh but don't call it here
          // The getAccessToken function will handle the refresh on first use
          setAuth({
            accessToken: '',
            refreshToken: activeChar.refreshToken,
            expiresAt: 0, // Force refresh on next getAccessToken call
          });
          setCharacter({
            id: activeChar.id,
            name: activeChar.name,
          });
        }
      } catch {
        localStorage.removeItem(NEW_AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = sessionStorage.getItem('eve_oauth_state');
      const codeVerifier = sessionStorage.getItem('eve_code_verifier');

      if (code && state && storedState === state && codeVerifier) {
        setLoading(true);
        try {
          await exchangeCodeForToken(code, codeVerifier);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          setError(err.message);
        } finally {
          sessionStorage.removeItem('eve_oauth_state');
          sessionStorage.removeItem('eve_code_verifier');
          setLoading(false);
        }
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exchange authorization code for tokens
  const exchangeCodeForToken = async (code, codeVerifier) => {
    const response = await fetch(EVE_SSO_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: EVE_SSO_CONFIG.clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    // Extract character info from token
    const tokenData = parseJwt(data.access_token);
    if (!tokenData) {
      throw new Error('Invalid token received');
    }

    const characterId = tokenData.sub?.split(':')[2];
    if (!characterId) {
      throw new Error('Could not extract character ID');
    }

    // Load or create multi-char auth structure
    let multiAuth = multiCharAuth || { characters: [], activeCharacterId: null };

    // Check if character already exists
    const existingIndex = multiAuth.characters.findIndex(c => c.id === characterId);
    const newCharData = {
      id: characterId,
      name: tokenData.name,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      addedAt: existingIndex >= 0 ? multiAuth.characters[existingIndex].addedAt : Date.now(),
      lastUpdated: Date.now(),
    };

    if (existingIndex >= 0) {
      // Update existing character
      multiAuth.characters[existingIndex] = newCharData;
    } else {
      // Add new character
      multiAuth.characters.push(newCharData);
    }

    // Set as active if first character or if specifically adding this one
    if (!multiAuth.activeCharacterId || multiAuth.characters.length === 1) {
      multiAuth.activeCharacterId = characterId;
    }

    // Save to localStorage
    localStorage.setItem(NEW_AUTH_STORAGE_KEY, JSON.stringify(multiAuth));
    setMultiCharAuth(multiAuth);

    // Update current auth state
    setAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    });
    setCharacter({
      id: characterId,
      name: tokenData.name,
    });

    // Dispatch event for MultiCharacterProvider to pick up
    window.dispatchEvent(new CustomEvent('eveauth:character-added', {
      detail: { characterId, authData: newCharData }
    }));
  };

  // Logout (removes all characters)
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(NEW_AUTH_STORAGE_KEY);
    setAuth(null);
    setCharacter(null);
    setMultiCharAuth(null);
    setError(null);
    // Clear any in-flight refresh promise
    refreshPromiseRef.current = null;
    // Notify MultiCharacterProvider
    window.dispatchEvent(new CustomEvent('eveauth:logout'));
  }, []);

  // Refresh access token
  const refreshAccessToken = useCallback(async (refreshToken) => {
    try {
      const response = await fetch(EVE_SSO_CONFIG.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: EVE_SSO_CONFIG.clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const expiresAt = Date.now() + data.expires_in * 1000;

      // Extract character info
      const tokenData = parseJwt(data.access_token);
      if (!tokenData) {
        throw new Error('Invalid token received during refresh');
      }

      const characterId = tokenData.sub?.split(':')[2];
      if (!characterId) {
        throw new Error('Could not extract character ID from refreshed token');
      }

      const authData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
      };

      // Update both old and new storage formats if multi-char auth exists
      // Use functional update to avoid stale closure issues
      setMultiCharAuth(currentMultiCharAuth => {
        if (!currentMultiCharAuth) return currentMultiCharAuth;

        const updatedMultiAuth = { ...currentMultiCharAuth };
        const charIndex = updatedMultiAuth.characters.findIndex(c => c.id === characterId);
        if (charIndex >= 0) {
          updatedMultiAuth.characters[charIndex] = {
            ...updatedMultiAuth.characters[charIndex],
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            expiresAt,
            lastUpdated: Date.now(),
          };
          localStorage.setItem(NEW_AUTH_STORAGE_KEY, JSON.stringify(updatedMultiAuth));
          return updatedMultiAuth;
        }
        return currentMultiCharAuth;
      });

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setAuth(authData);
      setCharacter({
        id: characterId,
        name: tokenData.name,
      });

      return authData.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    } finally {
      // Clear the refresh promise ref
      refreshPromiseRef.current = null;
    }
  }, [logout]);

  // Start OAuth login flow
  const login = useCallback(async () => {
    if (!EVE_SSO_CONFIG.clientId) {
      setError('EVE SSO Client ID not configured. Please set VITE_EVE_CLIENT_ID environment variable.');
      return;
    }

    const state = generateRandomString(32);
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('eve_oauth_state', state);
    sessionStorage.setItem('eve_code_verifier', codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: EVE_SSO_CONFIG.redirectUri,
      client_id: EVE_SSO_CONFIG.clientId,
      scope: EVE_SSO_CONFIG.scopes,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${EVE_SSO_CONFIG.authUrl}?${params}`;
  }, []);

  // Get valid access token (refresh if needed)
  const getAccessToken = useCallback(async () => {
    if (!auth) return null;

    // Check if token is about to expire (within 5 minutes)
    if (auth.expiresAt - Date.now() < 5 * 60 * 1000) {
      // Check if there's already a refresh in progress
      if (refreshPromiseRef.current) {
        // Reuse the existing promise to avoid duplicate refresh requests
        return await refreshPromiseRef.current;
      }

      // Start a new refresh and store the promise
      refreshPromiseRef.current = refreshAccessToken(auth.refreshToken);
      return await refreshPromiseRef.current;
    }

    return auth.accessToken;
  }, [auth, refreshAccessToken]);

  useEffect(() => {
    const checkTokenExpiry = () => {
      if (!auth) {
        setAuthStatus('unauthenticated');
        return;
      }

      const timeUntilExpiry = auth.expiresAt - Date.now();
      if (timeUntilExpiry <= 0) {
        setAuthStatus('expired');
        logout();
      } else if (timeUntilExpiry <= 5 * 60 * 1000) {
        setAuthStatus('expiring-soon');
        if (!notificationShown) {
          toast.warning('Your session is about to expire.', {
            action: {
              label: 'Refresh',
              onClick: () => getAccessToken(),
            },
          });
          setNotificationShown(true);
        }
      } else {
        setAuthStatus('authenticated');
        setNotificationShown(false);
      }
    };

    const interval = setInterval(checkTokenExpiry, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [auth, getAccessToken, logout, toast]);

  const value = {
    isAuthenticated: !!auth,
    character,
    loading,
    error,
    login,
    logout,
    getAccessToken,
    authStatus,
    clearError: () => setError(null),
  };

  return (
    <EveAuthContext.Provider value={value}>
      {children}
    </EveAuthContext.Provider>
  );
}

/**
 * Hook to use EVE auth context
 */
export function useEveAuth() {
  const context = useContext(EveAuthContext);
  if (!context) {
    throw new Error('useEveAuth must be used within an EveAuthProvider');
  }
  return context;
}

export default useEveAuth;
