import { useState } from 'react';
import { useMultiCharacter } from '../../hooks/useMultiCharacter';
import { useEveAuth } from '../../hooks/useEveAuth';

/**
 * Character Switcher Component
 * Allows users to switch between multiple EVE Online characters
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

  if (characters.length === 0) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Login with EVE
      </button>
    );
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          {activeCharacter?.portrait && (
            <img
              src={activeCharacter.portrait}
              alt={activeCharacter.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm text-white">{activeCharacter?.name || 'Select Character'}</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    switchCharacter(char.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors ${
                    char.id === activeCharacter?.id ? 'bg-slate-700/50' : ''
                  }`}
                >
                  {char.portrait && (
                    <img src={char.portrait} alt={char.name} className="w-8 h-8 rounded-full" />
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm text-white">{char.name}</div>
                  </div>
                  {char.id === activeCharacter?.id && (
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
              <div className="border-t border-slate-700">
                <button
                  onClick={() => {
                    login();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-indigo-400 hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Character
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Characters</h3>
        <span className="text-sm text-slate-400">{characters.length} character{characters.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Aggregated Stats */}
      {characters.length > 1 && (
        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
          <div className="text-xs text-slate-500 mb-2">Combined Totals</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-green-400">{formatISK(aggregated.totalWallet)}</div>
              <div className="text-xs text-slate-500">Total Wallet</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-400">{aggregated.totalOrders}</div>
              <div className="text-xs text-slate-500">Active Orders</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-400">{aggregated.totalAssets}</div>
              <div className="text-xs text-slate-500">Assets</div>
            </div>
          </div>
        </div>
      )}

      {/* Character List */}
      <div className="space-y-2">
        {characters.map((char) => {
          const isActive = char.id === activeCharacter?.id;
          const data = isActive ? activeCharacterData : null;

          return (
            <div
              key={char.id}
              className={`relative p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 border border-indigo-500/50'
                  : 'bg-slate-900/50 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {char.portrait ? (
                  <img
                    src={char.portrait}
                    alt={char.name}
                    className="w-12 h-12 rounded-full border-2 border-slate-600"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{char.name}</span>
                    {isActive && (
                      <span className="text-xs px-2 py-0.5 bg-green-600/20 text-green-400 rounded">Active</span>
                    )}
                  </div>
                  {data?.wallet !== undefined && (
                    <div className="text-sm text-green-400 mt-1">
                      {formatISK(data.wallet)}
                    </div>
                  )}
                  {data?.taxes && (
                    <div className="text-xs text-slate-500 mt-1">
                      Sales Tax: {(data.taxes.salesTax * 100).toFixed(2)}% | Broker: {(data.taxes.brokerFee * 100).toFixed(2)}%
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      onClick={() => switchCharacter(char.id)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors"
                    >
                      Switch
                    </button>
                  )}
                  <button
                    onClick={() => setShowConfirmRemove(char.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove character"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Remove confirmation */}
              {showConfirmRemove === char.id && (
                <div className="absolute inset-0 bg-slate-900/95 rounded-lg flex items-center justify-center p-4">
                  <div className="text-center">
                    <p className="text-sm text-white mb-3">Remove {char.name}?</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          removeCharacter(char.id);
                          setShowConfirmRemove(null);
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setShowConfirmRemove(null)}
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Character Button */}
      <button
        onClick={login}
        disabled={loading}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another Character
      </button>

      {loading && (
        <div className="mt-3 text-center text-sm text-slate-400">
          <span className="animate-pulse">Loading...</span>
        </div>
      )}
    </div>
  );
}

export default CharacterSwitcher;
