import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEveAuth } from '../../hooks/useEveAuth';
import { CharacterSwitcher } from './CharacterSwitcher';

/**
 * Navigation items organized by category
 */
const navSections = [
  {
    id: 'analysis',
    label: 'ANALYSIS',
    items: [
      { path: '/overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { path: '/market-orders', label: 'Market Orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
      { path: '/trade-profits', label: 'Trade Profits', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    id: 'trading',
    label: 'TRADING',
    items: [
      { path: '/station-trading', label: 'Station Trading', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { path: '/station-hauling', label: 'Station Hauling', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
      { path: '/region-hauling', label: 'Region Hauling', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { path: '/price-compare', label: 'Price Compare', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
      { path: '/predictions', label: 'Predictions', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
      { path: '/route-optimization', label: 'Route Optimizer', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
      { path: '/calculator', label: 'Calculator', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ],
  },
  {
    id: 'personal',
    label: 'PERSONAL',
    items: [
      { path: '/characters', label: 'Characters', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { path: '/portfolio', label: 'Portfolio', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { path: '/watchlist', label: 'Watchlist', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
      { path: '/saved-routes', label: 'Saved Routes', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
      { path: '/notes', label: 'Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    ],
  },
  {
    id: 'support',
    label: 'SUPPORT',
    items: [
      { path: '/help', label: 'Help', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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

// UserProfile component replaced with CharacterSwitcher

/**
 * Sidebar Navigation Component
 */
export function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();

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
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-xl flex items-center justify-center shadow-lg shadow-accent-cyan/20">
            <span className="font-display font-bold text-space-black text-sm">ET</span>
          </div>
          {!isCollapsed && (
            <span className="font-display text-xl font-bold tracking-wide">
              <span className="text-accent-cyan">EVE</span>
              <span className="text-text-primary">Trade</span>
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-text-secondary hover:text-accent-cyan hover:bg-white/5 transition-colors"
        >
          <svg className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Character Switcher */}
      <div className="px-3 py-4 border-b border-white/5">
        <CharacterSwitcher compact />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.id}>
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-text-secondary tracking-wider">
                {section.label}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-200
                        ${isCollapsed ? 'justify-center' : ''}
                        ${isActive
                          ? 'bg-accent-cyan/15 text-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }
                      `}
                    >
                      <NavIcon path={item.icon} className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-cyan' : ''}`} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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
        <div className="lg:hidden fixed inset-0 z-50 bg-space-dark/95 backdrop-blur-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
              <Link to="/" onClick={() => setShowMenu(false)} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-xl flex items-center justify-center">
                  <span className="font-display font-bold text-space-black text-sm">ET</span>
                </div>
                <span className="font-display text-xl font-bold">
                  <span className="text-accent-cyan">EVE</span>
                  <span className="text-text-primary">Trade</span>
                </span>
              </Link>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Character Switcher */}
            <div className="px-4 py-4 border-b border-white/5">
              <CharacterSwitcher compact />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              {navSections.map((section) => (
                <div key={section.id} className="mb-6">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-text-secondary tracking-wider">
                    {section.label}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            onClick={() => setShowMenu(false)}
                            className={`
                              flex items-center gap-3 px-3 py-3 rounded-xl
                              transition-all duration-200
                              ${isActive
                                ? 'bg-accent-cyan/15 text-accent-cyan'
                                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                              }
                            `}
                          >
                            <NavIcon path={item.icon} className="w-5 h-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-space-dark/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isMenu) {
              return (
                <button
                  key={item.path}
                  onClick={() => setShowMenu(true)}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-text-secondary"
                >
                  <NavIcon path={item.icon} className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2
                  transition-colors
                  ${isActive ? 'text-accent-cyan' : 'text-text-secondary'}
                `}
              >
                <NavIcon path={item.icon} className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
