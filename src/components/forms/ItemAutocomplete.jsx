import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { useResources } from '../../hooks/useResources';

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
  className = '',
  maxResults = 10,
}) {
  const { invTypes, loadInvTypes } = useResources();

  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsList, setItemsList] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // Generate unique IDs for ARIA attributes
  const listboxId = useId();
  const getOptionId = (index) => `${listboxId}-option-${index}`;

  // Load invTypes on mount if not already loaded
  useEffect(() => {
    async function loadItems() {
      if (invTypes) {
        // Build searchable list from invTypes
        const items = [];
        for (const [typeId, typeData] of Object.entries(invTypes)) {
          const name = typeof typeData === 'object' ? typeData.typeName : typeData;
          if (name) {
            items.push({ typeId, name });
          }
        }
        setItemsList(items);
        return;
      }

      setIsLoading(true);
      try {
        const data = await loadInvTypes();
        if (data) {
          const items = [];
          for (const [typeId, typeData] of Object.entries(data)) {
            const name = typeof typeData === 'object' ? typeData.typeName : typeData;
            if (name) {
              items.push({ typeId, name });
            }
          }
          setItemsList(items);
        }
      } catch (err) {
        console.error('Failed to load invTypes:', err);
      } finally {
        setIsLoading(false);
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

  const getPlaceholder = () => {
    if (isLoading) return 'Loading items...';
    if (itemsList.length === 0) return 'Loading items...';
    return placeholder;
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
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue && setIsOpen(true)}
          onBlur={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={disabled || isLoading || itemsList.length === 0}
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
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
              <span className="truncate text-text-primary">
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
