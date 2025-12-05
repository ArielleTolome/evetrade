import { useState, useEffect, useCallback } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import {
  getCharacterInfo,
  getCharacterPortrait,
  getCorporationInfo,
  getAllianceInfo,
  getWalletBalance,
  getCharacterSkills,
  calculateTradingTaxes,
} from '../../api/esi';
import { formatISK, formatPercent } from '../../utils/formatters';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Character Profile Component
 * Displays EVE Online character information
 */
export function CharacterProfile() {
  const { isAuthenticated, character, getAccessToken, login, logout, loading: authLoading, error: authError } = useEveAuth();
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [taxes, setTaxes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCharacterData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Fetch character info and portrait (public endpoints)
      const [charInfo, portrait] = await Promise.all([
        getCharacterInfo(character.id),
        getCharacterPortrait(character.id),
      ]);

      // Fetch corporation info
      let corpInfo = null;
      let allianceInfo = null;
      if (charInfo.corporation_id) {
        corpInfo = await getCorporationInfo(charInfo.corporation_id);
        if (corpInfo.alliance_id) {
          allianceInfo = await getAllianceInfo(corpInfo.alliance_id);
        }
      }

      setProfile({
        ...charInfo,
        portrait: portrait.px128x128,
        corporation: corpInfo,
        alliance: allianceInfo,
      });

      // Fetch wallet balance (authenticated)
      try {
        const balance = await getWalletBalance(character.id, accessToken);
        setWallet(balance);
      } catch (err) {
        console.warn('Failed to fetch wallet:', err);
      }

      // Fetch skills and calculate taxes (authenticated)
      try {
        const skills = await getCharacterSkills(character.id, accessToken);
        const taxInfo = calculateTradingTaxes(skills);
        setTaxes(taxInfo);
      } catch (err) {
        console.warn('Failed to fetch skills:', err);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, character?.id]);

  // Load character data when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadCharacterData();
    }
  }, [isAuthenticated, character?.id, loadCharacterData]);

  // Not authenticated - show login button
  if (!isAuthenticated) {
    return (
      <GlassmorphicCard className="mb-8">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent-cyan/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-display text-xl text-text-primary mb-2">Connect Your EVE Account</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Login with EVE Online to automatically import your wallet transactions, market orders, and track your trading performance.
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm max-w-md mx-auto">
              {authError}
            </div>
          )}

          <button
            onClick={login}
            disabled={authLoading}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-space-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <img
              src="https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-small.png"
              alt="EVE SSO"
              className="h-6"
            />
            {authLoading ? 'Connecting...' : 'Login with EVE Online'}
          </button>

          <p className="mt-4 text-xs text-text-secondary/70">
            We only request read access to your wallet, orders, and assets.
            <br />
            Your credentials are never stored on our servers.
          </p>
        </div>
      </GlassmorphicCard>
    );
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <GlassmorphicCard className="mb-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="ml-3 text-text-secondary">Loading character data...</span>
        </div>
      </GlassmorphicCard>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassmorphicCard className="mb-8">
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={loadCharacterData}
            className="px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </GlassmorphicCard>
    );
  }

  // Authenticated - show profile
  return (
    <GlassmorphicCard className="mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Character Portrait & Info */}
        <div className="flex items-center gap-4">
          {profile?.portrait && (
            <img
              src={profile.portrait}
              alt={character.name}
              className="w-24 h-24 rounded-lg border-2 border-accent-cyan/30"
            />
          )}
          <div>
            <h3 className="font-display text-xl text-text-primary">{character.name}</h3>
            {profile?.corporation && (
              <p className="text-text-secondary">{profile.corporation.name}</p>
            )}
            {profile?.alliance && (
              <p className="text-accent-purple text-sm">{profile.alliance.name}</p>
            )}
            <button
              onClick={logout}
              className="mt-2 text-xs text-text-secondary hover:text-red-400 transition-colors"
            >
              Disconnect Account
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Wallet Balance */}
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-green-400">
              {wallet !== null ? formatISK(wallet, false) : '---'}
            </div>
            <div className="text-sm text-text-secondary">Wallet Balance</div>
          </div>

          {/* Sales Tax */}
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-cyan">
              {taxes ? formatPercent(taxes.salesTax, 2) : '---'}
            </div>
            <div className="text-sm text-text-secondary">
              Sales Tax
              {taxes && <span className="text-xs text-text-secondary/50 block">Accounting Lv{taxes.accountingLevel}</span>}
            </div>
          </div>

          {/* Broker Fee */}
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-purple">
              {taxes ? formatPercent(taxes.brokerFee, 2) : '---'}
            </div>
            <div className="text-sm text-text-secondary">
              Broker Fee
              {taxes && <span className="text-xs text-text-secondary/50 block">Broker Rel Lv{taxes.brokerRelationsLevel}</span>}
            </div>
          </div>

          {/* Total Fees */}
          <div className="text-center p-4 rounded-lg bg-space-dark/50">
            <div className="text-2xl font-bold text-accent-gold">
              {taxes ? formatPercent(taxes.totalFees, 2) : '---'}
            </div>
            <div className="text-sm text-text-secondary">Total Fees</div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={loadCharacterData}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </GlassmorphicCard>
  );
}

export default CharacterProfile;
