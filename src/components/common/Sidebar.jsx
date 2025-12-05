import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useEveAuth } from '../../hooks/useEveAuth';
import { CharacterSwitcher } from './CharacterSwitcher';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * Navigation items organized by category
 */
const navSections = [
  {
    id: 'trading',
    label: 'Trading',
    items: [
      { id: 'station-trading', path: '/station-trading', label: 'Station Trading', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { id: 'hauling', path: '/hauling', label: 'Hauling', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
      { id: 'arbitrage', path: '/arbitrage', label: 'Arbitrage', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { id: 'market-velocity', path: '/market-velocity', label: 'Market Velocity', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { id: 'industry', path: '/industry', label: 'Industry', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    items: [
      { id: 'watchlist', path: '/watchlist', label: 'Watchlist', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
      { id: 'alerts', path: '/alerts', label: 'Alerts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'portfolio', path: '/portfolio', label: 'Portfolio', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'pi', path: '/pi', label: 'PI', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
      { id: 'lp', path: '/lp', label: 'LP', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
      { id: 'contracts', path: '/contracts', label: 'Contracts', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ],
  },
];

/**
 * SVG Icon Component
 */
function NavIcon({ path, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  );
}

function NotificationBadge({ count }) {
  if (!count) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="px-2 py-0.5 bg-accent-red text-white text-xs font-bold rounded-full"
    >
      {count}
    </motion.div>
  );
}

// UserProfile component replaced with CharacterSwitcher

function Highlight({ text, highlight }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-accent-yellow/30 text-white">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

/**
 * Sidebar Navigation Component
 */
export function Sidebar({ isCollapsed, onToggle, notifications = {} }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('evetrade_sidebar_favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const stored = localStorage.getItem('evetrade_sidebar_expanded');
    return stored ? JSON.parse(stored) : ['trading', 'analytics'];
  });

  // Persist expanded groups
  useEffect(() => {
    localStorage.setItem('evetrade_sidebar_expanded', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  useEffect(() => {
    localStorage.setItem('evetrade_sidebar_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId) => {
    setFavorites(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(favorites);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFavorites(items);
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const allNavItems = navSections.flatMap(section => section.items);
  const favoriteItems = favorites.map(id => allNavItems.find(item => item.id === id)).filter(Boolean);

  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  return (
    <aside
      className={`
        hidden lg:flex flex-col
        fixed left-0 top-0 bottom-0 z-40
        bg-space-dark/95 backdrop-blur-xl
        border-r border-white/5
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-xl flex items-center justify-center shadow-lg shadow-accent-cyan/20">
            <span className="font-display font-bold text-space-black text-sm">ET</span>
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-xl font-bold tracking-wide"
            >
              <span className="text-accent-cyan">EVE</span>
              <span className="text-text-primary">Trade</span>
            </motion.span>
          )}
        </Link>
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className="p-2 rounded-lg text-text-secondary hover:text-accent-cyan hover:bg-white/5 transition-colors focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark focus:outline-none"
        >
          <svg className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Search Input */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 py-4 border-b border-white/5"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-space-dark/50 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan focus:outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Switcher */}
      <div className="px-3 py-4 border-b border-white/5">
        <CharacterSwitcher compact={isCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Favorites Section */}
        {!isCollapsed && favoriteItems.length > 0 && (
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-accent-cyan tracking-wider">FAVORITES</h3>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="favorites">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                    {favoriteItems.map((item, index) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="group"
                            >
                              <Link
                                to={item.path}
                                title={isCollapsed ? item.label : undefined}
                                aria-current={isActive ? "page" : undefined}
                                className={`
                                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                                  transition-all duration-200 w-full
                                  ${isActive
                                    ? 'bg-accent-cyan/15 text-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                  }
                                `}
                              >
                                <NavIcon path={item.icon} className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-cyan' : ''}`} />
                                <span className="text-sm font-medium flex-1">
                                  <Highlight text={item.label} highlight={searchQuery} />
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(item.id);
                                  }}
                                  className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Star className={`w-4 h-4 ${favorites.includes(item.id) ? 'text-accent-yellow fill-current' : 'text-text-secondary'}`} />
                                </button>
                              </Link>
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {filteredNavSections.map((section) => (
          <div key={section.id}>
            {!isCollapsed && !searchQuery && (
              <button
                onClick={() => toggleGroup(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-secondary tracking-wider rounded-lg hover:bg-white/5 transition-colors"
              >
                <span>{section.label}</span>
                <svg className={`w-4 h-4 transition-transform ${expandedGroups.includes(section.id) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <AnimatePresence>
              { (isCollapsed || expandedGroups.includes(section.id) || searchQuery) && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-1 overflow-hidden"
                >
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.id} className="group">
                        <Link
                          to={item.path}
                          title={isCollapsed ? item.label : undefined}
                          aria-current={isActive ? "page" : undefined}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-all duration-200
                            ${isCollapsed ? 'justify-center' : ''}
                            ${isActive
                              ? 'bg-accent-cyan/15 text-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                            }
                            focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark focus:outline-none
                          `}
                        >
                          <NavIcon path={item.icon} className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-cyan' : ''}`} />
                          {!isCollapsed && (
                            <>
                              <span className="text-sm font-medium flex-1">
                                <Highlight text={item.label} highlight={searchQuery} />
                              </span>
                              <NotificationBadge count={notifications[item.id]} />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                                className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Star className={`w-4 h-4 ${favorites.includes(item.id) ? 'text-accent-yellow fill-current' : 'text-text-secondary'}`} />
                              </button>
                            </>
                          )}
                          {isCollapsed && notifications[item.id] && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filteredNavSections.length === 0 && !isCollapsed && (
          <div className="text-center text-sm text-text-secondary py-4 px-3">
            No results for "{searchQuery}"
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        {!isCollapsed ? (
          <div className="text-xs text-text-secondary text-center">
            <p>EVETrade v2.0</p>
            <p className="mt-1 opacity-50">Market data updates every 5 min</p>
          </div>
        ) : (
          <div className="text-center text-xs text-text-secondary">v2</div>
        )}
      </div>
    </aside>
  );
}

/**
 * Mobile Bottom Navigation
 */
export function MobileNav() {
  const location = useLocation();
  const { isAuthenticated, login } = useEveAuth();

  const mobileNavItems = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/market-orders', label: 'Orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/station-trading', label: 'Trading', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { path: '/menu', label: 'More', icon: 'M4 6h16M4 12h16M4 18h16', isMenu: true },
  ];

  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-space-dark/98 backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-accent-cyan/10 bg-space-dark/50">
              <Link to="/" onClick={() => setShowMenu(false)} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-xl flex items-center justify-center shadow-lg shadow-accent-cyan/20">
                  <span className="font-display font-bold text-space-black text-sm">ET</span>
                </div>
                <span className="font-display text-xl font-bold">
                  <span className="text-accent-cyan">EVE</span>
                  <span className="text-text-primary">Trade</span>
                </span>
              </Link>
              <button
                onClick={() => setShowMenu(false)}
                aria-label="Close menu"
                className="p-3 rounded-xl text-text-secondary hover:text-accent-cyan active:bg-accent-cyan/10 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Character Switcher */}
            <div className="px-4 py-4 border-b border-accent-cyan/10">
              <CharacterSwitcher />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 pb-safe overscroll-contain">
              {navSections.map((section) => (
                <div key={section.id} className="mb-6">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-accent-cyan/70 tracking-wider uppercase">
                    {section.label}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <li key={item.id}>
                          <Link
                            to={item.path}
                            onClick={() => setShowMenu(false)}
                            aria-current={isActive ? "page" : undefined}
                            className={`
                              flex items-center gap-3 px-4 py-3.5 rounded-xl min-h-[52px]
                              transition-all duration-200 active:scale-[0.98]
                              ${isActive
                                ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20 shadow-lg shadow-accent-cyan/5'
                                : 'text-text-secondary active:bg-white/10'
                              }
                              focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark focus:outline-none
                            `}
                          >
                            <NavIcon path={item.icon} className={`w-5 h-5 ${isActive ? 'text-accent-cyan' : ''}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Version Footer */}
            <div className="px-4 py-3 border-t border-accent-cyan/10 bg-space-dark/50 pb-safe">
              <div className="text-center text-xs text-text-secondary">
                EVETrade v2.0 • Market data updates every 5 min
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-space-dark/98 backdrop-blur-xl border-t border-accent-cyan/10 pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isMenu) {
              return (
                <button
                  key={item.path}
                  onClick={() => setShowMenu(true)}
                  aria-label="Open menu"
                  className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] px-2 py-1.5 rounded-xl text-text-secondary active:bg-white/10 transition-colors focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark focus:outline-none"
                >
                  <NavIcon path={item.icon} className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] px-2 py-1.5 rounded-xl
                  transition-all duration-200 active:scale-95
                  ${isActive
                    ? 'text-accent-cyan bg-accent-cyan/10'
                    : 'text-text-secondary active:bg-white/10'
                  }
                  focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark focus:outline-none
                `}
              >
                <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
                  <NavIcon path={item.icon} className="w-6 h-6" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-cyan rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-accent-cyan' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
