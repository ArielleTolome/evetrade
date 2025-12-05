import { useState, useRef, useEffect, useId } from 'react';
import { useResources } from '../../hooks/useResources';
import AutocompleteSkeleton from './AutocompleteSkeleton';

/**
 * Item Autocomplete Component
 * Search for items by name using invTypes data
 */
export function ItemAutocomplete({
  value,
  onChange,
  placeholder = 'Search items...',
  label,
  error,
  required = false,
  disabled = false,
  loading = false, // New prop for external loading state
  className = '',
  maxResults = 10,
}) {
  const { invTypes, loadInvTypes } = useResources();

  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [itemsList, setItemsList] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const typeAheadTimeoutRef = useRef(null);

  // Generate unique IDs for ARIA attributes
  const listboxId = useId();
  const getOptionId = (index) => `${listboxId}-option-${index}`;

  // Load invTypes on mount if not already loaded
  useEffect(() => {
    async function loadItems() {
      const processInvTypes = (data) => {
        if (!data) return [];

        const items = [];

        // Handle array format: [{typeID, typeName, ...}, ...]
        if (Array.isArray(data)) {
          for (const item of data) {
            const typeId = item.typeID || item.typeId || item.type_id;
            const name = item.typeName || item.name || item.type_name;
            if (typeId && name && name !== '#System') {
              items.push({ typeId: String(typeId), name });
            }
          }
        }
        // Handle object format: {typeId: {typeName, ...}, ...}
        else if (typeof data === 'object') {
          for (const [typeId, typeData] of Object.entries(data)) {
            const name = typeof typeData === 'object'
              ? (typeData.typeName || typeData.name)
              : typeData;
            if (name && name !== '#System') {
              items.push({ typeId, name });
            }
          }
        }

        return items;
      };

      if (invTypes && (Array.isArray(invTypes) ? invTypes.length > 0 : Object.keys(invTypes).length > 0)) {
        const items = processInvTypes(invTypes);
        setItemsList(items);
        return;
      }

      setIsDataLoading(true);
      try {
        const data = await loadInvTypes();
        if (data) {
          const items = processInvTypes(data);
          setItemsList(items);
        }
      } catch (err) {
        console.error('Failed to load invTypes:', err);
      } finally {
        setIsDataLoading(false);
      }
    }

    loadItems();
  }, [invTypes, loadInvTypes]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter items based on input
  useEffect(() => {
    if (inputValue && itemsList.length > 0) {
      const lowerQuery = inputValue.toLowerCase();
      const matches = itemsList
        .filter((item) => item.name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => {
          // Prioritize items that start with the query
          const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
          const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, maxResults);
      setFiltered(matches);
    } else {
      setFiltered([]);
    }
  }, [inputValue, itemsList, maxResults]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle selection
  const handleSelect = (item) => {
    setInputValue(item.name);
    onChange?.(item);
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
        (item, index) =>
          index > currentIndex && item.name.toLowerCase().startsWith(query)
      );

      if (nextIndex === -1) {
        nextIndex = filtered.findIndex((item) =>
          item.name.toLowerCase().startsWith(query)
        );
      }

      if (nextIndex !== -1) {
        setHighlightedIndex(nextIndex);
      }

      typeAheadTimeoutRef.current = setTimeout(() => {
        // No action needed, just a delay for next keystroke
      }, 500); // Reset after 500ms of inactivity
    }
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

  // Show skeleton when data is loading for the first time
  if (isDataLoading && itemsList.length === 0) {
    return <AutocompleteSkeleton label={label} />;
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
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isDataLoading ? 'Loading items...' : placeholder}
          disabled={isInputDisabled}
          required={required}
          title={inputValue}
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
          {filtered.map((item, index) => (
            <li
              key={item.typeId}
              id={getOptionId(index)}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(item)}
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
              <span className="truncate text-text-primary" title={item.name}>
                {item.name}
              </span>
              <span className="text-xs text-text-secondary ml-2">
                #{item.typeId}
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

export default ItemAutocomplete;
