import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'evetrade-theme';

/**
 * Theme Provider Component
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;

    // Default to system
    return 'system';
  });

  const applyTheme = useCallback((themeToApply) => {
    const root = document.documentElement;
    let effectiveTheme = themeToApply;

    if (themeToApply === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);


  // Apply theme to document
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, newTheme);
    setTheme(newTheme);
  }, [theme]);

  const setDarkTheme = useCallback(() => {
    localStorage.setItem(THEME_KEY, 'dark');
    setTheme('dark');
  }, []);

  const setLightTheme = useCallback(() => {
    localStorage.setItem(THEME_KEY, 'light');
    setTheme('light');
  }, []);

  const setSystemTheme = useCallback(() => {
    localStorage.removeItem(THEME_KEY);
    setTheme('system');
  }, []);

  const value = {
    theme,
    isDark: theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isLight: theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches),
    isSystemTheme: theme === 'system',
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    setSystemTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
