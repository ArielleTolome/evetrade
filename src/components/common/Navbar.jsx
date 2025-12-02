import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../store/ThemeContext';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/dashboard', label: 'Dashboard', icon: '🎯' },
  { path: '/station-trading', label: 'Station Trading', icon: '📊' },
  { path: '/station-hauling', label: 'Station Hauling', icon: '🚀' },
  { path: '/region-hauling', label: 'Region Hauling', icon: '🌌' },
  { path: '/route-optimization', label: 'Route Opt', icon: '🛣️' },
  { path: '/predictions', label: 'Predictions', icon: '📈' },
  { path: '/tools', label: 'Tools', icon: '🛠️' },
  { path: '/price-compare', label: 'Price Compare', icon: '💹' },
  { path: '/watchlist', label: 'Watchlist', icon: '👁' },
  { path: '/saved-routes', label: 'Saved Routes', icon: '⭐' },
  { path: '/portfolio', label: 'Portfolio', icon: '💼' },
  { path: '/calculator', label: 'Calculator', icon: '🧮' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/help', label: 'Help', icon: '❓' },
];

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
  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        // Return focus to menu button
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Focus trap implementation
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
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element when menu opens
    firstElement.focus();

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isMobileMenuOpen]);

  // Handle menu close and return focus
  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
    // Return focus to menu button after state update
    setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 0);
  };

  return (
    <nav className="sticky top-0 z-[100] bg-space-dark/80 dark:bg-space-dark/80 bg-white/80 backdrop-blur-xl border-b border-white/5 dark:border-white/5 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-lg flex items-center justify-center shadow-lg shadow-accent-cyan/20 group-hover:shadow-accent-cyan/40 transition-shadow">
              <span className="font-display font-bold text-space-black text-sm">ET</span>
            </div>
            <span className="font-display text-xl font-bold tracking-wide">
              <span className="text-accent-cyan group-hover:text-accent-cyan-dim transition-colors">EVE</span>
              <span className="text-text-primary dark:text-text-primary text-light-text">Trade</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.slice(0, 7).map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${location.pathname === path
                    ? 'bg-accent-cyan/10 text-accent-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }
                `}
              >
                {label}
              </Link>
            ))}

            {/* More Menu (Dropdown could be implemented here, for now just showing key items) */}
            <div className="h-4 w-[1px] bg-white/10 mx-2"></div>

            <Link
              to="/tools"
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${location.pathname === '/tools' ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}
              `}
            >
              Tools
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
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
        <div className="px-3 py-4 space-y-1 pb-safe">
          {navItems.map(({ path, label, icon }, index) => (
            <Link
              key={path}
              to={path}
              onClick={handleMenuClose}
              style={{ animationDelay: `${index * 30}ms` }}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium
                transition-all duration-200 min-h-[48px]
                ${isMobileMenuOpen ? 'animate-fade-in-up' : ''}
                ${location.pathname === path
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent active:bg-white/10'
                }
              `}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
