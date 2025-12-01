import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { useResources, useLocationLookup } from '../../hooks/useResources';
import { SecurityBadge } from '../common/SecurityBadge';
import { isCitadel } from '../../utils/security';

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
  className = '',
  maxResults = 10,
}) {
  const { stationList, universeList, loading: resourcesLoading } = useResources();
  const { searchStations } = useLocationLookup();

  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

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
          onFocus={() => inputValue && setIsOpen(true)}
          onBlur={() => {
            // Clear any existing timeout
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            // Set new timeout and store reference
            blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={resourcesLoading ? 'Loading stations...' : placeholder}
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

      {/* Dropdown */}
      {isOpen && filtered.length > 0 && (
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
                  px-4 py-2.5 cursor-pointer
                  transition-colors
                  ${index === highlightedIndex
                    ? 'bg-accent-cyan/20'
                    : 'hover:bg-accent-cyan/10'
                  }
                `}
              >
                <span className={`truncate mr-2 ${citadel ? 'text-accent-gold' : 'text-text-primary'}`}>
                  {station}
                </span>
                <SecurityBadge
                  security={security}
                  isCitadel={citadel}
                  size="xs"
                />
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

export default StationAutocomplete;
