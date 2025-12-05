import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useEveAuth } from '../../hooks/useEveAuth';
import { AccessibilitySettings } from './AccessibilitySettings';
import { useModal } from './Modal';

// Navigation structure with dropdown categories
const navigationCategories = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'trading',
    label: 'Trading',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    items: [
      { path: '/station-trading', label: 'Station Trading', description: 'Single station margin trading' },
      { path: '/station-hauling', label: 'Station Hauling', description: 'Station-to-station trades' },
      { path: '/region-hauling', label: 'Region Hauling', description: 'Region-to-region trades' },
      { path: '/arbitrage', label: 'Arbitrage', description: 'Multi-region arbitrage' },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    items: [
      { path: '/market-velocity', label: 'Market Velocity', description: 'Volume and turnover analysis' },
      { path: '/contracts', label: 'Contracts', description: 'Contract finder and analyzer' },
      { path: '/industry-profits', label: 'Industry', description: 'Manufacturing profitability' },
      { path: '/pi-optimizer', label: 'PI Optimizer', description: 'Planetary industry optimizer' },
      { path: '/overview', label: 'Overview', description: 'Market overview dashboard' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    items: [
      { path: '/lp-optimizer', label: 'LP Store', description: 'Loyalty point optimizer' },
      { path: '/smart-route', label: 'Smart Route', description: 'Intelligent route planning' },
      { path: '/route-optimization', label: 'Route Optimizer', description: 'Multi-stop optimization' },
      { path: '/calculator', label: 'Calculator', description: 'Trading calculator' },
      { path: '/price-compare', label: 'Price Compare', description: 'Compare prices across regions' },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    items: [
      { path: '/portfolio', label: 'Portfolio', description: 'Asset management' },
      { path: '/watchlist', label: 'Watchlist', description: 'Track items of interest' },
      { path: '/corp-orders', label: 'Corp Orders', description: 'Corporation market orders' },
      { path: '/saved-routes', label: 'Saved Routes', description: 'Your saved trade routes' },
      { path: '/market-orders', label: 'Market Orders', description: 'Active market orders' },
    ],
  },
];

/**
 * Dropdown Menu Component with keyboard navigation
 */
function DropdownMenu({ category, isOpen, onClose }) {
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Check if any item in this category is active
  const isActiveCategory = category.items?.some(item => location.pathname === item.path);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const items = category.items || [];

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Enter':
          e.preventDefault();
          setFocusedIndex(currentIndex => {
            if (currentIndex >= 0) {
              const link = dropdownRef.current?.querySelectorAll('a')[currentIndex];
              link?.click();
            }
            return currentIndex;
          });
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, category.items, onClose]);

  if (!isOpen || !category.items) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-72 bg-space-dark/95 backdrop-blur-xl border border-accent-cyan/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in-up"
      style={{
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="p-2 space-y-1">
        {category.items.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isFocused = focusedIndex === index;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                group block px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                  : isFocused
                    ? 'bg-accent-cyan/10 text-text-primary border border-accent-cyan/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 transition-colors ${isActive ? 'text-accent-cyan' : 'text-text-muted group-hover:text-accent-cyan'}`}>
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.description}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Desktop Navigation Item with Dropdown
 */
function NavItem({ category }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const itemRef = useRef(null);

  const isActive = category.path
    ? location.pathname === category.path
    : category.items?.some(item => location.pathname === item.path);

  const handleMouseEnter = () => {
    if (category.items) {
      const timeout = setTimeout(() => setIsOpen(true), 150);
      setHoverTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(false);
  };

  const handleClick = () => {
    if (category.items) {
      setIsOpen(!isOpen);
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (itemRef.current && !itemRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const content = (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {category.path ? (
        <Link
          to={category.path}
          className={`
            relative group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${isActive
              ? 'bg-accent-cyan/10 text-accent-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]'
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-cyan scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          {category.icon}
          <span>{category.label}</span>
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${isActive
              ? 'bg-accent-cyan/10 text-accent-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }
          `}
        >
          {category.icon}
          <span>{category.label}</span>
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      <DropdownMenu category={category} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );

  return content;
}

/**
 * Search Bar Component
 */
function SearchBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search through all navigation items
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const allItems = navigationCategories.flatMap(cat =>
      cat.items ? cat.items.map(item => ({ ...item, category: cat.label })) : []
    );

    const filtered = allItems.filter(item =>
      item.label.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery)
    );

    setResults(filtered.slice(0, 6));
  }, [query]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={searchRef}
      className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-space-dark/95 backdrop-blur-xl border border-accent-cyan/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-up"
    >
      <div className="p-3 border-b border-accent-cyan/10">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search navigation..."
            className="w-full pl-10 pr-4 py-2 bg-space-mid/50 border border-accent-cyan/20 rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/20"
          />
        </div>
      </div>

      {results.length > 0 && (
        <div className="p-2 max-h-96 overflow-y-auto">
          {results.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                onClose();
                setQuery('');
              }}
              className="block px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-accent-cyan/10 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{item.description}</div>
                </div>
                <div className="text-xs text-accent-cyan/60 shrink-0">{item.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <div className="p-8 text-center text-text-muted text-sm">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}

/**
 * Notification Bell Component
 */
function NotificationBell() {
  const [hasNotifications] = useState(true); // This would be connected to real data

  return (
    <button
      className="relative p-2 rounded-lg text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
      aria-label="Notifications"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {hasNotifications && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-pink rounded-full animate-pulse" />
      )}
    </button>
  );
}

/**
 * Theme Toggle Button
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

/**
 * User Menu Component - Login/Logout and Character Switcher
 */
function UserMenu({ onOpenAccessibility }) {
  const { isAuthenticated, character, login, logout, loading, error } = useEveAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate portrait URL from character ID
  const getPortraitUrl = (characterId, size = 64) => {
    return `https://images.evetech.net/characters/${characterId}/portrait?size=${size}`;
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-space-dark/50 animate-pulse" />
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-3 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan text-sm font-medium rounded-lg transition-colors border border-accent-cyan/30"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="hidden sm:inline">Login with EVE</span>
        <span className="sm:hidden">Login</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 bg-space-dark/50 hover:bg-space-dark/70 rounded-lg transition-colors border border-accent-cyan/20"
      >
        {character?.id ? (
          <img
            src={getPortraitUrl(character.id, 64)}
            alt={character.name}
            className="w-7 h-7 rounded-full border border-accent-cyan/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-accent-cyan/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <span className="text-sm text-text-primary max-w-[60px] sm:max-w-[100px] truncate">
          {character?.name || 'Character'}
        </span>
        <svg className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1rem)] bg-space-dark border border-accent-cyan/20 rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden">
          {/* Character Info */}
          <div className="p-4 border-b border-accent-cyan/10">
            <div className="flex items-center gap-3">
              {character?.id && (
                <img
                  src={getPortraitUrl(character.id, 128)}
                  alt={character.name}
                  className="w-12 h-12 rounded-full border-2 border-accent-cyan/30"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-text-primary font-medium truncate">{character?.name}</div>
                <div className="text-xs text-text-secondary">Logged in via EVE SSO</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                login();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-accent-cyan/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Another Character
            </button>

            <Link
              to="/portfolio"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-accent-cyan/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Portfolio & Wallet
            </Link>

            <button
              onClick={() => {
                onOpenAccessibility();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-accent-cyan/10 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12"></path><path d="M6 12h12"></path></svg>
              Accessibility
            </button>

            <div className="my-2 border-t border-accent-cyan/10" />

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border-t border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile Menu Accordion Category
 */
function MobileAccordion({ category, isOpen, onToggle, location, handleMenuClose }) {
  return (
    <div className="border border-accent-cyan/10 rounded-xl overflow-hidden">
      {category.path ? (
        <Link
          to={category.path}
          onClick={handleMenuClose}
          className={`
            flex items-center gap-3 px-4 py-4 text-base font-medium min-h-[52px]
            ${location.pathname === category.path
              ? 'bg-accent-cyan/10 text-accent-cyan'
              : 'text-text-secondary active:bg-white/10'
            }
          `}
        >
          <div className="w-5 flex items-center justify-center">
            {category.icon}
          </div>
          <span className="flex-1">{category.label}</span>
        </Link>
      ) : (
        <>
          <button
            onClick={onToggle}
            className={`
              w-full flex items-center gap-3 px-4 py-4 text-base font-medium min-h-[52px]
              transition-colors
              ${isOpen || category.items?.some(item => location.pathname === item.path)
                ? 'bg-accent-cyan/5 text-text-primary'
                : 'text-text-secondary'
              }
            `}
          >
            <div className="w-5 flex items-center justify-center">
              {category.icon}
            </div>
            <span className="flex-1 text-left">{category.label}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-2 py-2 space-y-1 bg-space-mid/30">
              {category.items?.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleMenuClose}
                  className={`
                    block px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                    ${location.pathname === item.path
                      ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Mobile Menu Component with Login and Accordion
 */
function MobileMenu({ menuRef, isMobileMenuOpen, location, handleMenuClose }) {
  const { isAuthenticated, character, login, logout } = useEveAuth();
  const [openAccordions, setOpenAccordions] = useState({});

  const getPortraitUrl = (characterId, size = 64) => {
    return `https://images.evetech.net/characters/${characterId}/portrait?size=${size}`;
  };

  const toggleAccordion = (categoryId) => {
    setOpenAccordions(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div
      id="mobile-menu"
      ref={menuRef}
      className={`
        md:hidden fixed inset-x-0 top-16 bottom-0 bg-space-dark/95 backdrop-blur-xl z-50
        overflow-y-auto overscroll-contain
        transition-all duration-300 ease-in-out origin-top
        ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}
      `}
      aria-hidden={!isMobileMenuOpen}
    >
      <div className="px-3 py-4 space-y-3 pb-safe">
        {/* User Section at Top */}
        <div className="mb-2 pb-4 border-b border-accent-cyan/10">
          {isAuthenticated ? (
            <div className="px-4 py-3 bg-space-dark/50 rounded-xl border border-accent-cyan/20">
              <div className="flex items-center gap-3">
                {character?.id ? (
                  <img
                    src={getPortraitUrl(character.id, 64)}
                    alt={character.name}
                    className="w-12 h-12 rounded-full border border-accent-cyan/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary font-medium truncate">{character?.name}</div>
                  <div className="text-xs text-text-secondary">Logged in</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    handleMenuClose();
                  }}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => {
                  login();
                  handleMenuClose();
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent-cyan/10 text-accent-cyan text-sm rounded-lg hover:bg-accent-cyan/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Another Character
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                login();
                handleMenuClose();
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-accent-cyan/20 text-accent-cyan text-base font-medium rounded-xl border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Login with EVE Online
            </button>
          )}
        </div>

        {/* Navigation Categories */}
        {navigationCategories.map((category) => (
          <MobileAccordion
            key={category.id}
            category={category}
            isOpen={openAccordions[category.id]}
            onToggle={() => toggleAccordion(category.id)}
            location={location}
            handleMenuClose={handleMenuClose}
          />
        ))}

        {/* Quick Links */}
        <div className="mt-4 pt-4 border-t border-accent-cyan/10">
          <Link
            to="/help"
            onClick={handleMenuClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Help & Documentation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile Menu Button
 */
function MobileMenuButton({ isOpen, onClick, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="md:hidden p-2 text-text-secondary hover:text-accent-cyan"
      aria-label="Toggle menu"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}

/**
 * Navigation Bar Component
 */
export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    isOpen: isAccessibilityOpen,
    open: openAccessibility,
    close: closeAccessibility
  } = useModal();
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on Escape key / Open with shortcut
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Accessibility Shortcut
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        openAccessibility();
      }

      if (event.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
        if (isAccessibilityOpen) {
          closeAccessibility();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isSearchOpen, isAccessibilityOpen, openAccessibility, closeAccessibility]);

  // Focus trap implementation for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll(
      'a[href], button, textarea, input, select'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    firstElement.focus();

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isMobileMenuOpen]);

  // Handle menu close and return focus
  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 0);
  };

  return (
    <nav className="sticky top-0 z-[100] bg-space-dark/80 dark:bg-space-dark/80 bg-white/80 backdrop-blur-xl border-b border-white/5 dark:border-white/5 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-lg flex items-center justify-center shadow-lg shadow-accent-cyan/20 group-hover:shadow-accent-cyan/40 transition-shadow">
              <span className="font-display font-bold text-space-black text-sm">ET</span>
            </div>
            <span className="font-display text-xl font-bold tracking-wide inline">
              <span className="text-accent-cyan group-hover:text-accent-cyan-dim transition-colors">EVE</span>
              <span className="text-text-primary dark:text-text-primary text-light-text">Trade</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navigationCategories.map((category) => (
              <NavItem key={category.id} category={category} />
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Button */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            </div>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            <UserMenu onOpenAccessibility={openAccessibility} />
            <ThemeToggle />
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              buttonRef={menuButtonRef}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        menuRef={menuRef}
        isMobileMenuOpen={isMobileMenuOpen}
        location={location}
        handleMenuClose={handleMenuClose}
      />

      <AccessibilitySettings isOpen={isAccessibilityOpen} onClose={closeAccessibility} />
    </nav>
  );
}

export default Navbar;
