import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Keyboard shortcuts configuration
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
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target;
    const isInput = target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.isContentEditable;

    if (isInput) return;

    // Check for modifier key (Ctrl on Windows/Linux, Cmd on Mac)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? event.metaKey : event.ctrlKey;

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
  }, [navigate, location.pathname, showHelp]);

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
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
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
    { keys: ['?'], description: 'Toggle this help' },
    { keys: ['Esc'], description: 'Close modal/menu' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-space-dark border border-accent-cyan/20 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl text-text-primary">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-accent-cyan/10 last:border-0">
              <span className="text-text-secondary">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-mono bg-space-dark/80 border border-accent-cyan/30 rounded text-accent-cyan">
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-text-secondary/50">then</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-text-secondary/70 text-center">
          Press <kbd className="px-1 py-0.5 text-xs font-mono bg-space-dark/80 border border-accent-cyan/30 rounded">?</kbd> anywhere to toggle this help
        </p>
      </div>
    </div>
  );
}

export default useKeyboardShortcuts;
