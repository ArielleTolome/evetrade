import { useState } from 'react';
import { useMultiCharacter } from '../../hooks/useMultiCharacter';
import { useEveAuth } from '../../hooks/useEveAuth';
import { GlassmorphicCard } from './GlassmorphicCard';

/**
 * Character Switcher Component
 * Mobile-first design with large tap targets and slide-out panel
 */
export function CharacterSwitcher({ compact = false }) {
  const {
    characters,
    activeCharacter,
    activeCharacterData,
    switchCharacter,
    removeCharacter,
    getAggregatedData,
    loading,
  } = useMultiCharacter();

  const { login } = useEveAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(null);

  const aggregated = getAggregatedData();

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

  if (characters.length === 0) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-3 bg-accent-cyan hover:bg-accent-cyan/90 text-space-black text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-cyan/30 min-h-[48px]"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        <span>Login with EVE</span>
      </button>
    );
  }

  // Compact mode - for navbar/sidebar
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-3 py-2 bg-space-dark/60 hover:bg-space-dark/80 rounded-xl transition-all duration-200 border border-white/10 hover:border-accent-cyan/30 min-h-[48px] w-full"
        >
          {activeCharacter?.id && (
            <img
              src={getPortraitUrl(activeCharacter.id, 64)}
              alt={activeCharacter.name}
              className="w-8 h-8 rounded-full border-2 border-accent-cyan/30"
            />
          )}
          <div className="flex-1 text-left min-w-0">
            <span className="text-sm text-text-primary font-medium truncate block">
              {activeCharacter?.name || 'Select Character'}
            </span>
            {characters.length > 1 && (
              <span className="text-xs text-text-secondary">
                {characters.length} characters
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Mobile: Full-screen overlay */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-space-black/95 backdrop-blur-xl lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex flex-col h-full safe-area-insets">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-text-primary">Characters</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Aggregated Stats */}
                {characters.length > 1 && (
                  <div className="px-4 py-4 border-b border-white/10">
                    <GlassmorphicCard padding="p-4">
                      <div className="text-xs text-text-secondary mb-3">Combined Totals</div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-lg font-semibold text-accent-green">{formatISK(aggregated.totalWallet)}</div>
                          <div className="text-xs text-text-secondary mt-1">Wallet</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-accent-cyan">{aggregated.totalOrders}</div>
                          <div className="text-xs text-text-secondary mt-1">Orders</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-accent-purple">{aggregated.totalAssets}</div>
                          <div className="text-xs text-text-secondary mt-1">Assets</div>
                        </div>
                      </div>
                    </GlassmorphicCard>
                  </div>
                )}

                {/* Character List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {characters.map((char) => {
                    const isActive = char.id === activeCharacter?.id;
                    const data = isActive ? activeCharacterData : null;

                    return (
                      <GlassmorphicCard
                        key={char.id}
                        padding="p-4"
                        className={`relative ${isActive ? 'border-accent-cyan/50 shadow-lg shadow-accent-cyan/10' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getPortraitUrl(char.id, 128)}
                            alt={char.name}
                            className={`w-16 h-16 rounded-full border-2 ${isActive ? 'border-accent-cyan' : 'border-white/20'}`}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-text-primary font-medium truncate">{char.name}</span>
                              {isActive && (
                                <span className="px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded-full flex-shrink-0">
                                  Active
                                </span>
                              )}
                            </div>
                            {data?.wallet !== undefined && (
                              <div className="text-sm text-accent-green mt-1">
                                {formatISK(data.wallet)}
                              </div>
                            )}
                            {data?.taxes && (
                              <div className="text-xs text-text-secondary mt-1">
                                Tax: {(data.taxes.salesTax * 100).toFixed(1)}% | Fee: {(data.taxes.brokerFee * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>

                          {!isActive && (
                            <button
                              onClick={() => {
                                switchCharacter(char.id);
                                setIsOpen(false);
                              }}
                              className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-space-black text-sm font-medium rounded-lg transition-colors min-h-[44px]"
                            >
                              Switch
                            </button>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => setShowConfirmRemove(char.id)}
                          className="absolute top-2 right-2 p-2 text-text-secondary hover:text-red-400 transition-colors"
                          title="Remove character"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Remove confirmation */}
                        {showConfirmRemove === char.id && (
                          <div className="absolute inset-0 bg-space-dark/95 backdrop-blur-sm rounded-xl flex items-center justify-center p-4">
                            <div className="text-center">
                              <p className="text-sm text-text-primary mb-4">Remove {char.name}?</p>
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    removeCharacter(char.id);
                                    setShowConfirmRemove(null);
                                  }}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
                                >
                                  Remove
                                </button>
                                <button
                                  onClick={() => setShowConfirmRemove(null)}
                                  className="px-4 py-2 bg-space-dark hover:bg-space-dark/80 text-text-primary text-sm font-medium rounded-lg transition-colors border border-white/10 min-h-[44px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </GlassmorphicCard>
                    );
                  })}
                </div>

                {/* Add Character Button */}
                <div className="px-4 py-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      login();
                      setIsOpen(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan hover:bg-accent-cyan/90 text-space-black font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another Character
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop: Dropdown */}
            <div className="hidden lg:block absolute right-0 mt-2 w-96 z-50">
              <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
              <GlassmorphicCard className="relative z-10">
                <div className="max-h-96 overflow-y-auto">
                  {characters.map((char) => {
                    const isActive = char.id === activeCharacter?.id;
                    const data = isActive ? activeCharacterData : null;

                    return (
                      <div
                        key={char.id}
                        className={`relative flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition-colors ${
                          char.id !== characters[characters.length - 1].id ? 'border-b border-white/5' : ''
                        } ${isActive ? 'bg-accent-cyan/10' : ''}`}
                      >
                        <img
                          src={getPortraitUrl(char.id, 64)}
                          alt={char.name}
                          className={`w-10 h-10 rounded-full border-2 ${isActive ? 'border-accent-cyan' : 'border-white/20'}`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text-primary font-medium truncate">{char.name}</span>
                            {isActive && (
                              <svg className="w-4 h-4 text-accent-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {data?.wallet !== undefined && (
                            <div className="text-xs text-accent-green">{formatISK(data.wallet)}</div>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!isActive && (
                            <button
                              onClick={() => {
                                switchCharacter(char.id);
                                setIsOpen(false);
                              }}
                              className="px-3 py-1.5 bg-accent-cyan hover:bg-accent-cyan/90 text-space-black text-xs font-medium rounded transition-colors"
                            >
                              Switch
                            </button>
                          )}
                          <button
                            onClick={() => setShowConfirmRemove(char.id)}
                            className="p-1.5 text-text-secondary hover:text-red-400 transition-colors"
                            title="Remove character"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Remove confirmation - desktop */}
                        {showConfirmRemove === char.id && (
                          <div className="absolute inset-0 bg-space-dark/95 backdrop-blur-sm rounded flex items-center justify-center">
                            <div className="text-center px-2">
                              <p className="text-xs text-text-primary mb-2">Remove?</p>
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => {
                                    removeCharacter(char.id);
                                    setShowConfirmRemove(null);
                                  }}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setShowConfirmRemove(null)}
                                  className="px-2 py-1 bg-space-dark hover:bg-space-dark/80 text-text-primary text-xs rounded transition-colors border border-white/10"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-2">
                  <button
                    onClick={() => {
                      login();
                      setIsOpen(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-accent-cyan hover:bg-white/5 transition-colors text-sm font-medium rounded disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Character
                  </button>
                </div>
              </GlassmorphicCard>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full mode - for dedicated character management page
  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-text-primary">Your Characters</h3>
        <span className="text-sm text-text-secondary">
          {characters.length} character{characters.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Aggregated Stats */}
      {characters.length > 1 && (
        <GlassmorphicCard className="mb-6" padding="p-4">
          <div className="text-xs text-text-secondary mb-3">Combined Totals</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent-green">{formatISK(aggregated.totalWallet)}</div>
              <div className="text-xs text-text-secondary mt-1">Total Wallet</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-cyan">{aggregated.totalOrders}</div>
              <div className="text-xs text-text-secondary mt-1">Active Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-purple">{aggregated.totalAssets}</div>
              <div className="text-xs text-text-secondary mt-1">Total Assets</div>
            </div>
          </div>
        </GlassmorphicCard>
      )}

      {/* Character Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {characters.map((char) => {
          const isActive = char.id === activeCharacter?.id;
          const data = isActive ? activeCharacterData : null;

          return (
            <GlassmorphicCard
              key={char.id}
              padding="p-4"
              className={`relative ${isActive ? 'border-accent-cyan/50 shadow-lg shadow-accent-cyan/10' : ''}`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={getPortraitUrl(char.id, 128)}
                  alt={char.name}
                  className={`w-20 h-20 rounded-full border-2 ${isActive ? 'border-accent-cyan' : 'border-white/20'}`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-text-primary truncate">{char.name}</h4>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded-full flex-shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  {data?.wallet !== undefined && (
                    <div className="text-xl font-bold text-accent-green mb-2">
                      {formatISK(data.wallet)}
                    </div>
                  )}

                  {data?.taxes && (
                    <div className="text-sm text-text-secondary space-y-1">
                      <div>Sales Tax: {(data.taxes.salesTax * 100).toFixed(2)}%</div>
                      <div>Broker Fee: {(data.taxes.brokerFee * 100).toFixed(2)}%</div>
                    </div>
                  )}

                  {data?.orders && (
                    <div className="mt-2 text-sm text-text-secondary">
                      {data.orders.length} active order{data.orders.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowConfirmRemove(char.id)}
                  className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                  title="Remove character"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!isActive && (
                <button
                  onClick={() => switchCharacter(char.id)}
                  className="w-full mt-4 px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-space-black font-medium rounded-lg transition-colors"
                >
                  Switch to this character
                </button>
              )}

              {/* Remove confirmation */}
              {showConfirmRemove === char.id && (
                <div className="absolute inset-0 bg-space-dark/95 backdrop-blur-sm rounded-xl flex items-center justify-center p-4">
                  <div className="text-center">
                    <p className="text-text-primary mb-4">Remove {char.name}?</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          removeCharacter(char.id);
                          setShowConfirmRemove(null);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setShowConfirmRemove(null)}
                        className="px-4 py-2 bg-space-dark hover:bg-space-dark/80 text-text-primary text-sm font-medium rounded-lg transition-colors border border-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GlassmorphicCard>
          );
        })}
      </div>

      {/* Add Character Button */}
      <button
        onClick={login}
        disabled={loading}
        className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan hover:bg-accent-cyan/90 text-space-black font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent-cyan/30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another Character
      </button>

      {loading && (
        <div className="mt-4 text-center text-sm text-text-secondary">
          <span className="animate-pulse">Loading...</span>
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default CharacterSwitcher;
