import { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { createPortal } from 'react-dom';
import { useResources, useLocationLookup } from '../../hooks/useResources';

/**
 * Hook to detect if we're on a mobile device
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Popular regions for quick selection
const POPULAR_REGIONS = [
  { name: 'The Forge', description: 'Jita' },
  { name: 'Domain', description: 'Amarr' },
  { name: 'Sinq Laison', description: 'Dodixie' },
  { name: 'Heimatar', description: 'Rens' },
  { name: 'Metropolis', description: 'Hek' },
  { name: 'Lonetrek', description: 'Near Jita' },
];

/**
 * Mobile Full-Screen Search Modal for Regions
 * Provides a better search experience on mobile devices
 */
function MobileRegionSearchModal({
  isOpen,
  onClose,
  inputValue,
  onInputChange,
  filtered,
  onSelect,
  placeholder,
  excludeRegions = [],
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const availablePopularRegions = POPULAR_REGIONS.filter(
    (r) => !excludeRegions.includes(r.name)
  );

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
        {/* Popular Regions Quick Select */}
        {!inputValue && availablePopularRegions.length > 0 && (
          <div className="px-4 py-4 border-b border-accent-cyan/10">
            <div className="text-xs text-text-secondary mb-3 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Popular Regions
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availablePopularRegions.map((region) => (
                <button
                  key={region.name}
                  type="button"
                  onClick={() => {
                    onSelect(region.name);
                    onClose();
                  }}
                  className="px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-200 text-left bg-space-mid/30 border-accent-cyan/10 text-text-secondary active:bg-accent-cyan/10"
                >
                  <div className="flex items-center gap-2">
                    {region.name === 'The Forge' && (
                      <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" title="Highest Volume"></span>
                    )}
                    <span className="text-text-primary">{region.name}</span>
                  </div>
                  <div className="text-xs text-text-secondary/70 mt-0.5">{region.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {inputValue && (
          <div className="divide-y divide-accent-cyan/5">
            {filtered.length > 0 ? (
              filtered.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => {
                    onSelect(region);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 text-left active:bg-accent-cyan/10 transition-colors"
                >
                  <span className="text-text-primary font-medium text-base">{region}</span>
                  <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              ))
            ) : (
              <div className="px-4 py-12 text-text-secondary text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-medium">No regions found</p>
                <p className="text-sm mt-1 opacity-70">Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State - No search */}
        {!inputValue && availablePopularRegions.length === 0 && (
          <div className="px-4 py-12 text-text-secondary text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="font-medium">Search for a region</p>
            <p className="text-sm mt-1 opacity-70">Type to find regions across New Eden</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/**
 * Region Autocomplete Component
 */
export function RegionAutocomplete({
  value,
  onChange,
  placeholder = 'Search regions...',
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  maxResults = 10,
  excludeRegions = [],
}) {
  const { regionList, loading: resourcesLoading } = useResources();
  const { searchRegions } = useLocationLookup();
  const isMobile = useIsMobile();

  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // Generate unique IDs for ARIA attributes
  const listboxId = useId();
  const getOptionId = (index) => `${listboxId}-option-${index}`;

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Create a stable string representation of excludeRegions for dependency tracking
  const excludeRegionsKey = useMemo(() => excludeRegions.join(','), [excludeRegions]);

  // Memoize filtered regions to prevent unnecessary recalculations
  const filteredRegions = useMemo(() => {
    if (inputValue && regionList) {
      return searchRegions(inputValue, maxResults + excludeRegions.length)
        .filter((region) => !excludeRegions.includes(region))
        .slice(0, maxResults);
    }
    return [];
  }, [inputValue, regionList, searchRegions, maxResults, excludeRegionsKey, excludeRegions]);

  // Update filtered state when memoized value changes
  useEffect(() => {
    setFiltered(filteredRegions);
  }, [filteredRegions]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle selection
  const handleSelect = (region) => {
    setInputValue(region);
    onChange?.(region);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filtered.length === 0) return;

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

  // Handle mobile input value change (from modal)
  const handleMobileInputChange = useCallback((newValue) => {
    setInputValue(newValue);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Mobile: Tap to open full-screen search */}
      {isMobile ? (
        <>
          <button
            type="button"
            onClick={() => !disabled && !resourcesLoading && setIsMobileModalOpen(true)}
            disabled={disabled || resourcesLoading}
            className={`
              w-full px-4 py-3 rounded-lg text-left
              bg-space-dark/50 dark:bg-space-dark/50 bg-white
              border ${error ? 'border-red-500' : 'border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300'}
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 active:bg-accent-cyan/5
              flex items-center justify-between gap-2
            `}
          >
            <span className={inputValue ? 'text-text-primary truncate' : 'text-text-secondary/50'}>
              {inputValue || (resourcesLoading ? 'Loading regions...' : placeholder)}
            </span>
            <svg className="w-5 h-5 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Mobile Full-Screen Modal */}
          <MobileRegionSearchModal
            isOpen={isMobileModalOpen}
            onClose={() => setIsMobileModalOpen(false)}
            inputValue={inputValue}
            onInputChange={handleMobileInputChange}
            filtered={filtered}
            onSelect={handleSelect}
            placeholder={placeholder}
            excludeRegions={excludeRegions}
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
            placeholder={resourcesLoading ? 'Loading regions...' : placeholder}
            disabled={disabled || resourcesLoading}
            required={required}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-space-dark/50 dark:bg-space-dark/50 bg-white
              border ${error ? 'border-red-500' : 'border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300'}
              text-text-primary dark:text-text-primary text-light-text
              placeholder-text-secondary/50
              focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
            autoComplete="off"
          />

          {/* Search icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Desktop Dropdown */}
      {!isMobile && isOpen && filtered.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          ref={listRef}
          className="
            absolute z-50 w-full mt-1
            bg-space-dark dark:bg-space-dark bg-white
            border border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-200
            rounded-lg shadow-xl shadow-black/50
            max-h-60 overflow-auto
          "
        >
          {filtered.map((region, index) => (
            <li
              key={region}
              id={getOptionId(index)}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(region)}
              className={`
                flex items-center justify-between
                px-4 py-2.5 cursor-pointer
                transition-colors
                ${index === highlightedIndex
                  ? 'bg-accent-cyan/20'
                  : 'hover:bg-accent-cyan/10'
                }
              `}
            >
              <span className="text-text-primary">{region}</span>
              <span className="text-accent-cyan text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

export default RegionAutocomplete;
