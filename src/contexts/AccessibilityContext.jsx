import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext(null);

const ACCESSIBILITY_KEY = 'evetrade-accessibility';

const defaults = {
  fontSize: 1,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  reducedMotion: false,
};

function getInitialState() {
  try {
    const stored = localStorage.getItem(ACCESSIBILITY_KEY);
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { ...defaults, reducedMotion: prefersReducedMotion };
  } catch (error) {
    console.error('Failed to read accessibility settings from localStorage', error);
    return defaults;
  }
}

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(getInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save accessibility settings to localStorage', error);
    }

    // Apply settings to the document root
    document.documentElement.style.setProperty('--font-size-multiplier', settings.fontSize);

    const lineHeightValues = { normal: 1.5, relaxed: 1.75, loose: 2.0 };
    document.documentElement.style.setProperty('--line-height-multiplier', lineHeightValues[settings.lineHeight]);

    const letterSpacingValues = { normal: 'normal', wide: '0.05em', wider: '0.1em' };
    document.documentElement.style.setProperty('--letter-spacing', letterSpacingValues[settings.letterSpacing]);

    if (settings.reducedMotion) {
      document.documentElement.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
    }

  }, [settings]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSettings({ ...defaults, reducedMotion: prefersReducedMotion });
  }, []);

  const value = {
    settings,
    updateSetting,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
