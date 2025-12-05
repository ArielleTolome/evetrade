import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { useResources } from '../../hooks/useResources';
import { SecurityBadge } from '../common/SecurityBadge';

/**
 * System Autocomplete Component
 * Autocomplete for EVE Online solar systems
 */
export function SystemAutocomplete({
  value,
  onChange,
  placeholder = 'Search systems...',
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  maxResults = 10,
  excludeSystems = [],
}) {
  const { universeList, loading: resourcesLoading } = useResources();

  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
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

  // Extract unique systems from universeList
  const systemsList = useCallback(() => {
    if (!universeList) return [];

    const systems = new Set();
    Object.values(universeList).forEach((data) => {
      if (data.system) {
        systems.add(data.system);
      }
    });

    return Array.from(systems).sort();
  }, [universeList]);

  // Filter systems based on input
  useEffect(() => {
    if (inputValue && universeList) {
      const systems = systemsList();
      const lowerQuery = inputValue.toLowerCase();
      const results = systems
        .filter((system) => {
          const matchesQuery = system.toLowerCase().includes(lowerQuery);
          const notExcluded = !excludeSystems.includes(system);
          return matchesQuery && notExcluded;
        })
        .slice(0, maxResults);

      setFiltered(results);
    } else {
      setFiltered([]);
    }
  }, [inputValue, universeList, systemsList, maxResults, excludeSystems]);

  // Get security level for a system
  const getSystemSecurity = useCallback(
    (systemName) => {
      if (!universeList || !systemName) return 0;

      // Find any station in this system to get security
      const stationData = Object.values(universeList).find(
        (data) => data.system === systemName
      );

      return stationData?.security ?? 0;
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
  const handleSelect = (system) => {
    setInputValue(system);
    onChange?.(system);
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
        (system, index) =>
          index > currentIndex && system.toLowerCase().startsWith(query)
      );

      if (nextIndex === -1) {
        nextIndex = filtered.findIndex((system) =>
          system.toLowerCase().startsWith(query)
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
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = null;
            }
            if (inputValue) setIsOpen(true);
          }}
          onBlur={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={resourcesLoading ? 'Loading systems...' : placeholder}
          disabled={disabled || resourcesLoading}
          required={required}
          title={inputValue || undefined}
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
      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-1
            bg-space-dark dark:bg-space-dark bg-white
            border border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-200
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
              {filtered.map((system, index) => {
                const security = getSystemSecurity(system);

                return (
                  <li
                    key={system}
                    id={getOptionId(index)}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    onClick={() => handleSelect(system)}
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
                    <span
                      className="truncate font-medium text-text-primary"
                      title={system}
                    >
                      {system}
                    </span>

                    <SecurityBadge
                      security={security}
                      size="xs"
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-3 text-text-secondary text-sm text-center italic">
              No systems found
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

export default SystemAutocomplete;
