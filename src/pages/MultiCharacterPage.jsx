import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMultiCharacter } from '../hooks/useMultiCharacter';
import { CharacterSwitcher } from '../components/common/CharacterSwitcher';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { PageLayout } from '../components/layout/PageLayout';

/**
 * Multi-Character Management Page
 * Provides aggregate view across all characters
 */
export function MultiCharacterPage() {
  const {
    characters,
    activeCharacter,
    characterData,
    getAggregatedData,
    fetchCharacterData,
    refreshAllCharacters,
    loading,
  } = useMultiCharacter();

  const aggregated = getAggregatedData();

  // Fetch data for active character on mount
  useEffect(() => {
    if (activeCharacter?.id && !characterData[activeCharacter.id]) {
      fetchCharacterData(activeCharacter.id);
    }
  }, [activeCharacter, characterData, fetchCharacterData]);

  const formatISK = (value) => {
    if (!value) return '0 ISK';
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B ISK`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M ISK`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K ISK`;
    return `${value.toLocaleString()} ISK`;
  };

  const getPortraitUrl = (characterId, size = 128) => {
    return `https://images.evetech.net/characters/${characterId}/portrait?size=${size}`;
  };

  return (
    <PageLayout
      title="Character Management"
      description="Manage multiple EVE Online characters and view aggregate data"
    >
      <div className="space-y-6">
        {/* Aggregate Overview */}
        {characters.length > 1 && (
          <GlassmorphicCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Portfolio Overview</h2>
              <button
                onClick={refreshAllCharacters}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-space-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-accent-green/10 to-transparent rounded-xl border border-accent-green/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-green/20 rounded-lg">
                    <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-text-secondary">Total Wallet</div>
                </div>
                <div className="text-3xl font-bold text-accent-green">{formatISK(aggregated.totalWallet)}</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-accent-cyan/10 to-transparent rounded-xl border border-accent-cyan/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-cyan/20 rounded-lg">
                    <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-text-secondary">Active Orders</div>
                </div>
                <div className="text-3xl font-bold text-accent-cyan">{aggregated.totalOrders}</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-accent-purple/10 to-transparent rounded-xl border border-accent-purple/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-purple/20 rounded-lg">
                    <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-text-secondary">Total Assets</div>
                </div>
                <div className="text-3xl font-bold text-accent-purple">{aggregated.totalAssets}</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-accent-orange/10 to-transparent rounded-xl border border-accent-orange/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-orange/20 rounded-lg">
                    <svg className="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-text-secondary">Characters</div>
                </div>
                <div className="text-3xl font-bold text-accent-orange">{aggregated.characterCount}</div>
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {/* Character Switcher */}
        <CharacterSwitcher />

        {/* Per-Character Breakdown */}
        {characters.length > 0 && (
          <GlassmorphicCard>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Character Breakdown</h2>
            <div className="space-y-4">
              {characters.map((char) => {
                const data = characterData[char.id];
                const isActive = char.id === activeCharacter?.id;

                return (
                  <div
                    key={char.id}
                    className={`p-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                        : 'bg-space-dark/30 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={getPortraitUrl(char.id, 128)}
                        alt={char.name}
                        className={`w-16 h-16 rounded-full border-2 ${
                          isActive ? 'border-accent-cyan' : 'border-white/20'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-text-primary">{char.name}</h3>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        {data?.wallet !== undefined ? (
                          <div className="text-sm text-accent-green font-medium">{formatISK(data.wallet)}</div>
                        ) : (
                          <button
                            onClick={() => fetchCharacterData(char.id)}
                            disabled={loading}
                            className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors disabled:opacity-50"
                          >
                            Load character data
                          </button>
                        )}
                      </div>
                    </div>

                    {data && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                          <div className="text-xs text-text-secondary mb-1">Orders</div>
                          <div className="text-lg font-semibold text-text-primary">
                            {data.orders?.length || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-secondary mb-1">Assets</div>
                          <div className="text-lg font-semibold text-text-primary">
                            {data.assets?.length || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-secondary mb-1">Sales Tax</div>
                          <div className="text-lg font-semibold text-text-primary">
                            {data.taxes ? `${(data.taxes.salesTax * 100).toFixed(2)}%` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-secondary mb-1">Broker Fee</div>
                          <div className="text-lg font-semibold text-text-primary">
                            {data.taxes ? `${(data.taxes.brokerFee * 100).toFixed(2)}%` : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-text-secondary mb-1">Last Updated</div>
                          <div className="text-sm text-text-primary">
                            {data.fetchedAt ? new Date(data.fetchedAt).toLocaleTimeString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassmorphicCard>
        )}

        {/* Quick Actions */}
        {characters.length > 0 && (
          <GlassmorphicCard>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/market-orders"
                className="p-4 bg-gradient-to-br from-accent-cyan/10 to-transparent rounded-xl border border-accent-cyan/20 hover:border-accent-cyan/40 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-cyan/20 rounded-lg group-hover:bg-accent-cyan/30 transition-colors">
                    <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">View Market Orders</h3>
                </div>
                <p className="text-sm text-text-secondary">Check all active market orders across characters</p>
              </Link>

              <Link
                to="/overview"
                className="p-4 bg-gradient-to-br from-accent-purple/10 to-transparent rounded-xl border border-accent-purple/20 hover:border-accent-purple/40 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-purple/20 rounded-lg group-hover:bg-accent-purple/30 transition-colors">
                    <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">Trading Overview</h3>
                </div>
                <p className="text-sm text-text-secondary">Comprehensive trading analytics dashboard</p>
              </Link>

              <Link
                to="/trade-profits"
                className="p-4 bg-gradient-to-br from-accent-green/10 to-transparent rounded-xl border border-accent-green/20 hover:border-accent-green/40 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-green/20 rounded-lg group-hover:bg-accent-green/30 transition-colors">
                    <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">Trade Profits</h3>
                </div>
                <p className="text-sm text-text-secondary">Track profits and trading performance</p>
              </Link>
            </div>
          </GlassmorphicCard>
        )}

        {/* No Characters Message */}
        {characters.length === 0 && (
          <GlassmorphicCard className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-accent-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">No Characters Yet</h3>
              <p className="text-text-secondary mb-6">
                Add your first EVE Online character to start tracking your trading activities
              </p>
              <CharacterSwitcher compact />
            </div>
          </GlassmorphicCard>
        )}
      </div>
    </PageLayout>
  );
}

export default MultiCharacterPage;
