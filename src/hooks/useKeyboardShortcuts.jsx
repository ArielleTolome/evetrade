import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Keyboard shortcuts configuration for navigation
 */
const SHORTCUTS = {
  // Navigation shortcuts (Ctrl/Cmd + number)
  'h': { path: '/', label: 'Home' },
  's': { path: '/station-trading', label: 'Station Trading' },
  'd': { path: '/station-hauling', label: 'Station Hauling' },
  'r': { path: '/region-hauling', label: 'Region Hauling' },
  'p': { path: '/price-compare', label: 'Price Compare' },
  'w': { path: '/watchlist', label: 'Watchlist' },
  'f': { path: '/saved-routes', label: 'Saved Routes' },
  'o': { path: '/portfolio', label: 'Portfolio' },
  'c': { path: '/calculator', label: 'Calculator' },
  '?': { path: '/help', label: 'Help' },
};

/**
 * Hook for managing keyboard shortcuts
 * @param {object} customHandlers - Object mapping shortcut keys to handler functions
 * @param {object} options - Configuration options
 */
export function useKeyboardShortcuts(customHandlers = {}, options = {}) {
  const {
    enabled = true,
    preventDefault = true,
    ignoreInputs = true,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const handlersRef = useRef(customHandlers);
  handlersRef.current = customHandlers;

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs (unless it's Escape or custom handler allows)
    const target = event.target;
    const isInput = target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable;

    // Check for modifier key (Ctrl on Windows/Linux, Cmd on Mac)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? event.metaKey : event.ctrlKey;

    // Build shortcut string
    const key = event.key.toLowerCase();
    let shortcut = '';
    if (modKey) shortcut += 'ctrl+';
    if (event.shiftKey) shortcut += 'shift+';
    shortcut += key;

    // Check for custom handler first
    const customHandler = handlersRef.current[shortcut] || handlersRef.current[key];
    if (customHandler) {
      // Allow Escape and focus shortcuts (/, ctrl+k) to work in inputs
      const allowInInput = key === 'escape' || key === '/' || shortcut === 'ctrl+k';
      if (ignoreInputs && isInput && !allowInInput) {
        return;
      }
      if (preventDefault) event.preventDefault();
      customHandler(event);
      return;
    }

    // For remaining shortcuts, ignore if typing in inputs
    if (ignoreInputs && isInput) return;

    // Toggle help modal with '?'
    if (event.key === '?' && !modKey) {
      event.preventDefault();
      setShowHelp((prev) => !prev);
      return;
    }

    // Close help modal with Escape
    if (event.key === 'Escape') {
      if (showHelp) {
        setShowHelp(false);
        return;
      }
    }

    // Navigation shortcuts (g + key for "go to")
    if (event.key === 'g') {
      // Set up listener for next key
      const handleNextKey = (e) => {
        const shortcut = SHORTCUTS[e.key.toLowerCase()];
        if (shortcut && shortcut.path !== location.pathname) {
          e.preventDefault();
          navigate(shortcut.path);
        }
        document.removeEventListener('keydown', handleNextKey);
      };
      document.addEventListener('keydown', handleNextKey, { once: true });
      // Auto-remove after 1 second if no key pressed
      setTimeout(() => {
        document.removeEventListener('keydown', handleNextKey);
      }, 1000);
      return;
    }

    // Quick navigation with number keys (1-9)
    if (!modKey && event.key >= '1' && event.key <= '9') {
      const pages = [
        '/station-trading',
        '/station-hauling',
        '/region-hauling',
        '/price-compare',
        '/watchlist',
        '/saved-routes',
        '/portfolio',
        '/calculator',
        '/help',
      ];
      const index = parseInt(event.key) - 1;
      if (pages[index] && pages[index] !== location.pathname) {
        event.preventDefault();
        navigate(pages[index]);
      }
      return;
    }
  }, [navigate, location.pathname, showHelp, enabled, preventDefault, ignoreInputs]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    showHelp,
    setShowHelp,
    shortcuts: SHORTCUTS,
  };
}

/**
 * Keyboard Shortcuts Help Modal Component
 */
export function KeyboardShortcutsHelp({ isOpen, onClose, customShortcuts = [] }) {
  if (!isOpen) return null;

  // Build shortcuts grouped by category
  const shortcutGroups = [
    {
      category: 'Navigation',
      items: [
        { keys: ['1-9'], description: 'Navigate to page (1=Station Trading, 2=Station Hauling, etc.)' },
        { keys: ['g', 'h'], description: 'Go to Home' },
        { keys: ['g', 's'], description: 'Go to Station Trading' },
        { keys: ['g', 'd'], description: 'Go to Station Hauling (Delivery)' },
        { keys: ['g', 'r'], description: 'Go to Region Hauling' },
        { keys: ['g', 'p'], description: 'Go to Price Compare' },
        { keys: ['g', 'w'], description: 'Go to Watchlist' },
        { keys: ['g', 'f'], description: 'Go to Saved Routes (Favorites)' },
        { keys: ['g', 'o'], description: 'Go to Portfolio' },
        { keys: ['g', 'c'], description: 'Go to Calculator' },
      ],
    },
    ...customShortcuts,
    {
      category: 'General',
      items: [
        { keys: ['?'], description: 'Toggle this help' },
        { keys: ['Esc'], description: 'Close modal/menu' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-space-dark/95 backdrop-blur-md border border-accent-cyan/20 rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto shadow-2xl shadow-accent-cyan/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-2xl text-text-primary mb-1">Keyboard Shortcuts</h3>
            <p className="text-sm text-text-secondary">Power user navigation and actions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h4 className="text-sm font-display font-semibold text-accent-cyan uppercase tracking-wide mb-3">
                {group.category}
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {group.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-space-dark/50 border border-accent-cyan/10 hover:border-accent-cyan/20 transition-colors"
                  >
                    <span className="text-text-secondary text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 min-w-[28px] text-center text-xs font-mono bg-space-dark border border-accent-cyan/30 rounded shadow-sm text-accent-cyan">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-text-secondary/50 text-xs mx-0.5">then</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-accent-cyan/10">
          <p className="text-xs text-text-secondary/70 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-space-dark border border-accent-cyan/30 rounded">?</kbd> anywhere to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}

export default useKeyboardShortcuts;
