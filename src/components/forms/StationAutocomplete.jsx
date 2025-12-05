import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { useResources, useLocationLookup } from '../../hooks/useResources';
import { SecurityBadge } from '../common/SecurityBadge';
import { isCitadel } from '../../utils/security';
import { TRADE_HUBS } from '../../utils/constants';
import AutocompleteSkeleton from './AutocompleteSkeleton';

/**
 * Hook to detect if we're on a mobile device
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Mobile Full-Screen Search Modal
 * Provides a better search experience on mobile devices
 */
function MobileSearchModal({
  isOpen,
  onClose,
  inputValue,
  onInputChange,
  filtered,
  onSelect,
  getSecurityLevel,
  placeholder,
  showTradeHubs,
  value,
  onTradeHubSelect,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the modal is rendered
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-space-dark flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-accent-cyan/20 bg-space-dark/95 backdrop-blur-xl safe-area-inset-top">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-2 rounded-xl text-text-secondary hover:text-accent-cyan active:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close search"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-10 rounded-xl bg-space-mid/50 border border-accent-cyan/20 text-text-primary text-base placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => onInputChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-secondary hover:text-text-primary active:bg-white/10"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Trade Hub Quick Select */}
        {showTradeHubs && !inputValue && (
          <div className="px-4 py-4 border-b border-accent-cyan/10">
            <div className="text-xs text-text-secondary mb-3 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Select Trade Hub
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TRADE_HUBS.map((hub) => (
                <button
                  key={hub.stationId}
                  type="button"
                  onClick={() => {
                    onTradeHubSelect(hub);
                    onClose();
                  }}
                  className={`
                    px-4 py-3 text-sm font-medium rounded-xl
                    border transition-all duration-200 text-left
                    ${value === hub.name
                      ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                      : 'bg-space-mid/30 border-accent-cyan/10 text-text-secondary active:bg-accent-cyan/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {hub.shortName === 'Jita' && (
                      <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" title="Highest Volume"></span>
                    )}
                    <span>{hub.shortName}</span>
                  </div>
                  <div className="text-xs text-text-secondary/70 mt-0.5">{hub.regionName}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {inputValue && (
          <div className="divide-y divide-accent-cyan/5">
            {filtered.length > 0 ? (
              filtered.map((station) => {
                const security = getSecurityLevel(station);
                const citadel = isCitadel(station);

                return (
                  <button
                    key={station}
                    type="button"
                    onClick={() => {
                      onSelect(station);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-accent-cyan/10 transition-colors"
                  >
                    <div className="flex flex-col overflow-hidden mr-3 flex-1 min-w-0">
                      <span
                        className={`truncate font-medium text-base ${citadel ? 'text-accent-gold' : 'text-text-primary'}`}
                      >
                        {station}
                      </span>
                      {citadel && (
                        <span className="text-xs text-accent-gold/80 uppercase tracking-wider mt-0.5">
                          Player Structure
                        </span>
                      )}
                    </div>
                    <SecurityBadge
                      security={security}
                      isCitadel={citadel}
                      size="sm"
                    />
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-12 text-text-secondary text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-medium">No stations found</p>
                <p className="text-sm mt-1 opacity-70">Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State - No search */}
        {!inputValue && !showTradeHubs && (
          <div className="px-4 py-12 text-text-secondary text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="font-medium">Search for a station</p>
            <p className="text-sm mt-1 opacity-70">Type to find stations across New Eden</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/**
 * Station Autocomplete Component
 */
export function StationAutocomplete({
  value,
  onChange,
  placeholder = 'Search stations...',
  label,
  error,
  required = false,
  disabled = false,
  loading = false,
  className = '',
  maxResults = 10,
  showTradeHubs = true,
}) {
  const { stationList, universeList, loading: isDataLoading } = useResources();
  const { searchStations } = useLocationLookup();
  const isMobile = useIsMobile();

  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const typeAheadTimeoutRef = useRef(null);

  // Generate unique IDs for ARIA attributes
  const listboxId = useId();
  const getOptionId = (index) => `${listboxId}-option-${index}`;

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter stations based on input
  useEffect(() => {
    if (inputValue && stationList) {
      setFiltered(searchStations(inputValue, maxResults));
    } else {
      setFiltered([]);
    }
  }, [inputValue, stationList, searchStations, maxResults]);

  // Get security level for a station with comprehensive error handling
  const getSecurityLevel = useCallback(
    (stationName) => {
      try {
        // Handle invalid inputs
        if (!stationName || typeof stationName !== 'string') {
          if (import.meta.env.DEV) {
            console.warn('[StationAutocomplete] Invalid station name provided:', stationName);
          }
          return 0;
        }

        // Handle missing or malformed universeList
        if (!universeList || typeof universeList !== 'object') {
          if (import.meta.env.DEV) {
            console.warn('[StationAutocomplete] universeList is not available or malformed');
          }
          return 0;
        }

        // Try exact match first
        let data = universeList[stationName];

        // If not found, try lowercase with spaces (keys are lowercase)
        if (!data) {
          const normalizedKey = stationName.toLowerCase().replace(/\*/g, '');
          data = universeList[normalizedKey];
        }

        // Handle missing data for station
        if (!data) {
          if (import.meta.env.DEV) {
            console.warn('[StationAutocomplete] No data found for station:', stationName);
          }
          return 0;
        }

        // Validate security value
        const security = data.security;
        if (security === null || security === undefined || typeof security !== 'number' || isNaN(security)) {
          if (import.meta.env.DEV) {
            console.warn('[StationAutocomplete] Invalid security value for station:', stationName, security);
          }
          return 0;
        }

        return security;
      } catch (error) {
        // Catch any unexpected errors
        if (import.meta.env.DEV) {
          console.error('[StationAutocomplete] Error getting security level:', error, { stationName });
        }
        return 0;
      }
    },
    [universeList]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle selection
  const handleSelect = (station) => {
    setInputValue(station);
    onChange?.(station);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }

      const query = e.key.toLowerCase();
      const currentIndex = highlightedIndex >= 0 ? highlightedIndex : -1;
      let nextIndex = filtered.findIndex(
        (station, index) =>
          index > currentIndex && station.toLowerCase().startsWith(query)
      );

      if (nextIndex === -1) {
        nextIndex = filtered.findIndex((station) =>
          station.toLowerCase().startsWith(query)
        );
      }

      if (nextIndex !== -1) {
        setHighlightedIndex(nextIndex);
      }

      typeAheadTimeoutRef.current = setTimeout(() => {
        // No action needed, just a delay for next keystroke
      }, 500); // Reset after 500ms of inactivity
    }
    if (!isOpen) return;

    if (filtered.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);


  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Handle trade hub selection
  const handleTradeHubSelect = (hub) => {
    setInputValue(hub.name);
    onChange?.(hub.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle mobile input value change (from modal)
  const handleMobileInputChange = useCallback((newValue) => {
    setInputValue(newValue);
  }, []);

  // Show skeleton while loading data
  if (isDataLoading && !stationList) {
    return <AutocompleteSkeleton label={label} showTradeHubs={showTradeHubs} />;
  }

  const isInputDisabled = disabled || loading || isDataLoading;
  const showSpinner = loading || isDataLoading;

  const getLoadingText = () => {
    if (loading) return 'Submitting...';
    if (isDataLoading) return 'Loading data...';
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Trade Hub Quick Select - Hidden on mobile (shown in modal instead) */}
      {showTradeHubs && !isInputDisabled && (
        <div className="mb-3 hidden md:block animate-fade-in-up">
          <div className="text-xs text-text-secondary mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Select Trade Hub
          </div>
          <div className="flex flex-wrap gap-2">
            {TRADE_HUBS.map((hub) => (
              <button
                key={hub.stationId}
                type="button"
                onClick={() => handleTradeHubSelect(hub)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg
                  border transition-all duration-200
                  ${value === hub.name
                    ? 'bg-accent-cyan/30 border-accent-cyan text-accent-cyan'
                    : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/50 hover:text-text-primary hover:bg-accent-cyan/10'
                  }
                `}
                title={`${hub.name} - ${hub.regionName}`}
              >
                <span className="flex items-center gap-1.5">
                  {hub.shortName === 'Jita' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" title="Highest Volume"></span>
                  )}
                  {hub.shortName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile: Tap to open full-screen search */}
      {isMobile ? (
        <>
          <button
            type="button"
            onClick={() => !isInputDisabled && setIsMobileModalOpen(true)}
            disabled={isInputDisabled}
            className={`
              w-full px-4 py-3 rounded-lg text-left
              bg-space-dark/50 backdrop-blur-sm
              border ${error ? 'border-red-500' : 'border-white/10'}
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200 active:bg-accent-cyan/5
              flex items-center justify-between gap-2
            `}
          >
            <span className={inputValue ? 'text-text-primary truncate' : 'text-text-secondary/50'}>
              {inputValue || (showSpinner ? getLoadingText() : placeholder)}
            </span>
            {showSpinner ? (
              <svg className="w-5 h-5 animate-spin text-accent-cyan flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>

          {/* Mobile Full-Screen Modal */}
          <MobileSearchModal
            isOpen={isMobileModalOpen}
            onClose={() => setIsMobileModalOpen(false)}
            inputValue={inputValue}
            onInputChange={handleMobileInputChange}
            filtered={filtered}
            onSelect={handleSelect}
            getSecurityLevel={getSecurityLevel}
            placeholder={placeholder}
            showTradeHubs={showTradeHubs}
            value={value}
            onTradeHubSelect={handleTradeHubSelect}
          />
        </>
      ) : (
        /* Desktop: Standard autocomplete dropdown */
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen && filtered.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined}
            aria-busy={showSpinner}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              // Clear any pending blur timeout to prevent race conditions
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
              if (inputValue) setIsOpen(true);
            }}
            onBlur={() => {
              // Clear any existing timeout
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
              }
              // Set new timeout and store reference
              blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isDataLoading ? 'Loading stations...' : placeholder}
            disabled={isInputDisabled}
            required={required}
            title={inputValue || undefined}
            className={`
              w-full pl-4 pr-10 py-3 rounded-lg
              bg-space-dark/50 backdrop-blur-sm
              border ${error ? 'border-red-500' : 'border-white/10'}
              text-text-primary
              placeholder-text-secondary/50
              focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
              disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200
              ${showSpinner ? 'pl-10' : ''}
            `}
            autoComplete="off"
          />

          {/* Loading/Search Icon */}
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary transition-all duration-200 ${showSpinner ? 'opacity-100' : 'opacity-0'}`}>
            <svg className="w-5 h-5 animate-spin text-accent-cyan" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
            {getLoadingText() ? (
              <span className="text-xs italic text-accent-cyan/80 animate-fade-in-up">{getLoadingText()}</span>
            ) : (
              !showSpinner && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )
            )}
          </div>
        </div>
      )}

      {/* Desktop Dropdown */}
      {!isMobile && isOpen && (
        <div
           className="
            absolute z-50 w-full mt-1
            bg-space-dark
            border border-accent-cyan/20
            rounded-lg shadow-xl shadow-black/50
            max-h-60 overflow-hidden flex flex-col
          "
        >
          {filtered.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              ref={listRef}
              className="overflow-auto max-h-60"
            >
              {filtered.map((station, index) => {
                const security = getSecurityLevel(station);
                const citadel = isCitadel(station);

                return (
                  <li
                    key={station}
                    id={getOptionId(index)}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    onClick={() => handleSelect(station)}
                    className={`
                      flex items-center justify-between
                      px-4 py-3 cursor-pointer border-b border-white/5 last:border-0
                      transition-colors
                      ${index === highlightedIndex
                        ? 'bg-accent-cyan/20'
                        : 'hover:bg-accent-cyan/10'
                      }
                    `}
                  >
                    <div className="flex flex-col overflow-hidden mr-2">
                       <span
                        className={`truncate font-medium ${citadel ? 'text-accent-gold' : 'text-text-primary'}`}
                        title={station}
                      >
                        {station}
                      </span>
                      {citadel && (
                        <span className="text-[10px] text-accent-gold/80 uppercase tracking-wider">
                          Player Structure
                        </span>
                      )}
                    </div>

                    <SecurityBadge
                      security={security}
                      isCitadel={citadel}
                      size="xs"
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-3 text-text-secondary text-sm text-center italic">
              No stations found
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

export default StationAutocomplete;
