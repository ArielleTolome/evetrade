import { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from './ThemeContextObject';

const THEME_KEY = 'evetrade-theme';

/**
 * Theme Provider Component
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    // Default to dark (space theme)
    return 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setDarkTheme = useCallback(() => setTheme('dark'), []);
  const setLightTheme = useCallback(() => setTheme('light'), []);

  const value = {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setDarkTheme,
    setLightTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

