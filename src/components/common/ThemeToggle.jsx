import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Contrast } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { isDark, toggleTheme, highContrast, toggleHighContrast } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-space-dark/50 hover:bg-space-light/50 border border-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-cyan"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-accent-gold" />
        ) : (
          <Moon className="h-5 w-5 text-accent-purple" />
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-space-mid border border-white/10 rounded-lg shadow-lg z-50">
          <button
            onClick={toggleTheme}
            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-space-light flex items-center"
          >
            {isDark ? (
              <Sun className="h-5 w-5 mr-2 text-accent-gold" />
            ) : (
              <Moon className="h-5 w-5 mr-2 text-accent-purple" />
            )}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="border-t border-white/10"></div>
          <label
            htmlFor="high-contrast-toggle"
            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-space-light flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <Contrast className="h-5 w-5 mr-2 text-text-secondary" />
              <span>High Contrast</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                id="high-contrast-toggle"
                checked={highContrast}
                onChange={toggleHighContrast}
                className="sr-only"
              />
              <div className="w-10 h-4 bg-space-dark rounded-full shadow-inner"></div>
              <div className={`absolute w-6 h-6 rounded-full shadow -left-1 -top-1 transition-transform ${highContrast ? 'transform translate-x-full bg-accent-cyan' : 'bg-gray-400'}`}></div>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
