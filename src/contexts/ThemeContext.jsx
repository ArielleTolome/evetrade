import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'evetrade-theme';
const HIGH_CONTRAST_KEY = 'evetrade-high-contrast';

/**
 * Theme Provider Component
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme) return storedTheme;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  const [highContrast, setHighContrast] = useState(() => {
    const storedContrast = localStorage.getItem(HIGH_CONTRAST_KEY);
    return storedContrast === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem(HIGH_CONTRAST_KEY, highContrast);
  }, [highContrast]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'h') {
        toggleHighContrast();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleHighContrast]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  const setDarkTheme = useCallback(() => setTheme('dark'), []);
  const setLightTheme = useCallback(() => setTheme('light'), []);

  const value = {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    highContrast,
    toggleTheme,
    toggleHighContrast,
    setDarkTheme,
    setLightTheme,
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
