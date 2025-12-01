import { useState, useEffect, useCallback, createContext, useContext } from 'react';

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
    'esi-assets.read_assets.v1',
    'esi-characters.read_standings.v1',
    'esi-skills.read_skills.v1',
  ].join(' '),
  authUrl: 'https://login.eveonline.com/v2/oauth/authorize',
  tokenUrl: 'https://login.eveonline.com/v2/oauth/token',
  verifyUrl: 'https://esi.evetech.net/verify/',
};

const AUTH_STORAGE_KEY = 'eve_auth';

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
 */
export function EveAuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load auth from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if token is still valid
        if (parsed.expiresAt > Date.now()) {
          setAuth(parsed);
          // Extract character info from token
          const tokenData = parseJwt(parsed.accessToken);
          if (tokenData) {
            const characterId = tokenData.sub?.split(':')[2];
            setCharacter({
              id: characterId,
              name: tokenData.name,
            });
          }
        } else if (parsed.refreshToken) {
          // Token expired, try to refresh
          refreshAccessToken(parsed.refreshToken);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
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

    const authData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setAuth(authData);

    // Extract character info
    const tokenData = parseJwt(data.access_token);
    if (tokenData) {
      const characterId = tokenData.sub?.split(':')[2];
      setCharacter({
        id: characterId,
        name: tokenData.name,
      });
    }
  };

  // Refresh access token
  const refreshAccessToken = async (refreshToken) => {
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

      const authData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setAuth(authData);

      // Extract character info
      const tokenData = parseJwt(data.access_token);
      if (tokenData) {
        const characterId = tokenData.sub?.split(':')[2];
        setCharacter({
          id: characterId,
          name: tokenData.name,
        });
      }

      return authData.accessToken;
    } catch {
      logout();
      return null;
    }
  };

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

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
    setCharacter(null);
    setError(null);
  }, []);

  // Get valid access token (refresh if needed)
  const getAccessToken = useCallback(async () => {
    if (!auth) return null;

    // Check if token is about to expire (within 5 minutes)
    if (auth.expiresAt - Date.now() < 5 * 60 * 1000) {
      return await refreshAccessToken(auth.refreshToken);
    }

    return auth.accessToken;
  }, [auth]);

  const value = {
    isAuthenticated: !!auth,
    character,
    loading,
    error,
    login,
    logout,
    getAccessToken,
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
