import { useState, useRef, useId, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Loader2, Cube, Building, Globe, FileText, History } from 'lucide-react';
import { useResources } from '../../hooks/useResources';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const pageRoutes = [
    { name: "Station Trading", url: "/station-trading", description: "Find profitable trades within a station." },
    { name: "Hauling", url: "/region-hauling", description: "Calculate profits for hauling goods between regions." },
    { name: "Price Comparison", url: "/price-compare", description: "Compare item prices across different trade hubs." },
    { name: "My Orders", url: "/orders", description: "Manage your active market orders." },
    { name: "Portfolio", url: "/portfolio", description: "Track your assets and net worth." },
    { name: "Dashboard", url: "/dashboard", description: "Get an overview of your trading activity." },
];

const Highlight = ({ text, highlight }) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? <span key={i} className="bg-search-highlight text-search-text rounded-sm">{part}</span> : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

const GlobalSearch = ({
  placeholder = "Search items, stations, or features...",
  onSelect,
  className = '',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState({ items: [], stations: [], regions: [], pages: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();
  const getOptionId = (index) => `${listboxId}-option-${index}`;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  useEffect(() => {
    const storedSearches = localStorage.getItem('evetrade_recent_searches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  const debouncedSearchTerm = useDebounce(inputValue, 300);

  const { invTypes, stationList, regionList, loadInvTypes } = useResources();

  useEffect(() => {
    if (!invTypes) {
        loadInvTypes();
    } else {
        const processInvTypes = (data) => {
            if (!data) return [];
            const items = [];
            if (Array.isArray(data)) {
              for (const item of data) {
                if (item.typeID && item.typeName) items.push({ typeID: item.typeID, typeName: item.typeName });
              }
            } else if (typeof data === 'object') {
              for (const [typeId, typeData] of Object.entries(data)) {
                if (typeData.typeName) items.push({ typeID: typeId, typeName: typeData.typeName });
              }
            }
            return items;
          };
        setItemsList(processInvTypes(invTypes));
    }
  }, [invTypes, loadInvTypes]);


  useEffect(() => {
    const search = async () => {
      if (debouncedSearchTerm.length < 2) {
        setSearchResults({ items: [], stations: [], regions: [], pages: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const lowerCaseTerm = debouncedSearchTerm.toLowerCase();

      const filteredItems = (itemsList || [])
        .filter(item => item.typeName.toLowerCase().includes(lowerCaseTerm))
        .slice(0, 5)
        .map(item => ({ id: item.typeID, name: item.typeName, category: 'items', url: `/item-detail/${item.typeID}` }));

      const filteredStations = (stationList || [])
        .filter(station => station.toLowerCase().includes(lowerCaseTerm))
        .slice(0, 5)
        .map(station => ({ id: station, name: station, category: 'stations', url: `/station-trading?station=${encodeURIComponent(station)}` }));

      const filteredRegions = (regionList || [])
        .filter(region => region.toLowerCase().includes(lowerCaseTerm))
        .slice(0, 3)
        .map(region => ({ id: region, name: region, category: 'regions', url: `/region-hauling?region=${encodeURIComponent(region)}` }));

      const filteredPages = pageRoutes
        .filter(page => page.name.toLowerCase().includes(lowerCaseTerm) || page.description.toLowerCase().includes(lowerCaseTerm))
        .slice(0, 3)
        .map(page => ({ id: page.url, name: page.name, category: 'pages', url: page.url, metadata: { description: page.description } }));

      setSearchResults({
        items: filteredItems,
        stations: filteredStations,
        regions: filteredRegions,
        pages: filteredPages,
      });

      setIsLoading(false);
    };

    search();
  }, [debouncedSearchTerm, itemsList, stationList, regionList]);

    const addRecentSearch = (item) => {
        const newRecentSearches = [item, ...recentSearches.filter(s => s.id !== item.id)].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('evetrade_recent_searches', JSON.stringify(newRecentSearches));
    };

    const handleSelect = (item) => {
        addRecentSearch(item);
        onSelect(item);
        setIsOpen(false);
    };

    const handleClearRecent = (e, item) => {
        e.stopPropagation();
        const newRecentSearches = recentSearches.filter(s => s.id !== item.id);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('evetrade_recent_searches', JSON.stringify(newRecentSearches));
    };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setActiveIndex(-1);
    if (e.target.value) {
      setIsOpen(true);
    } else {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setIsOpen(true);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const allResults = Object.values(searchResults).flat();
    if (allResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % allResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + allResults.length) % allResults.length);
    } else if (e.key === 'Enter') {
      if (activeIndex !== -1) {
        handleSelect(allResults[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const dropdownRef = useRef(null);

  const categoryIcons = {
    items: <Cube size={16} />,
    stations: <Building size={16} />,
    regions: <Globe size={16} />,
    pages: <FileText size={16} />,
  }

  const renderResults = () => {
    if (isLoading) {
      return <div className="p-4 text-center text-search-category">Loading...</div>;
    }

    if (inputValue.length < 2 && recentSearches.length > 0) {
        return (
            <div className="p-2">
                <h3 className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-search-category">
                    <History size={16} />
                    Recent Searches
                </h3>
                <ul>
                    {recentSearches.map(item => (
                        <li
                            key={`${item.category}-${item.id}`}
                            className="flex justify-between items-center px-2 py-1.5 text-search-text hover:bg-search-highlight rounded-md cursor-pointer group"
                            onMouseDown={() => handleSelect(item)}
                        >
                            <span>{item.name}</span>
                            <button
                                onClick={(e) => handleClearRecent(e, item)}
                                className="opacity-0 group-hover:opacity-100 text-search-category hover:text-search-text"
                            >
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    const allResults = Object.values(searchResults).flat();

    if (debouncedSearchTerm.length > 1 && allResults.length === 0 && !isLoading) {
      return (
        <div className="p-4 text-center text-search-category">
            <p className="font-semibold text-search-text">No results found for "{debouncedSearchTerm}"</p>
            <p className="text-sm mt-2">Try searching for "Tritanium" or "Jita".</p>
        </div>
      );
    }

    let currentIndex = -1;
    return (
      <div className="p-2">
        {Object.keys(searchResults).map(category => {
          if (searchResults[category].length > 0) {
            return (
              <div key={category}>
                <h3 className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-search-category capitalize">
                  {categoryIcons[category]}
                  {category}
                </h3>
                <ul role="listbox">
                  {searchResults[category].map(item => {
                    currentIndex++;
                    const itemIndex = currentIndex;
                    return (
                        <li
                            key={`${item.category}-${item.id}`}
                            id={getOptionId(itemIndex)}
                            role="option"
                            aria-selected={activeIndex === itemIndex}
                            className={`px-2 py-1.5 text-search-text rounded-md cursor-pointer ${activeIndex === itemIndex ? 'bg-search-highlight' : 'hover:bg-search-highlight'}`}
                            onMouseDown={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                        >
                            <Highlight text={item.name} highlight={debouncedSearchTerm} />
                        </li>
                    );
                  })}
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const allResults = Object.values(searchResults).flat();

  return (
    <div ref={containerRef} className={`relative w-full md:w-80 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-search-category">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && allResults.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? getOptionId(activeIndex) : undefined}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-12 py-2 bg-search-bg border border-search-border text-search-text rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-search-category text-xs space-x-1">
            <kbd className="h-5 w-5 flex items-center justify-center rounded bg-search-highlight/50">⌘</kbd>
            <kbd className="h-5 w-5 flex items-center justify-center rounded bg-search-highlight/50">K</kbd>
        </div>
        {isLoading ? (
            <div className="absolute inset-y-0 right-14 flex items-center">
                <Loader2 size={20} className="animate-spin text-search-category" />
            </div>
        ) : inputValue && (
            <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-12 flex items-center text-search-category hover:text-search-text"
                aria-label="Clear search"
            >
                <X size={20} />
            </button>
        )}
      </div>

      {isOpen && (
        <div id={listboxId} ref={dropdownRef} className="absolute z-50 mt-2 w-full bg-search-dropdown-bg border border-search-border rounded-lg shadow-lg max-h-[60vh] overflow-y-auto">
          {renderResults()}
        </div>
      )}
    </div>
  );
};

GlobalSearch.propTypes = {
  placeholder: PropTypes.string,
  onSelect: PropTypes.func,
  className: PropTypes.string,
  autoFocus: PropTypes.bool,
};

export default GlobalSearch;
