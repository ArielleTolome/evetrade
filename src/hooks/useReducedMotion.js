import { useState, useEffect, useCallback } from 'react';

const MOTION_PREFERENCE_KEY = 'motion-preference';

/**
 * @typedef {'system' | 'reduce' | 'allow'} MotionPreference
 */

/**
 * A hook to detect user preference for reduced motion.
 *
 * This hook checks for the user's system preference via `prefers-reduced-motion` media query.
 * It also allows for a manual override via localStorage with the key "motion-preference".
 * The possible values for the override are 'system', 'reduce', or 'allow'.
 *
 * Affected animations include:
 * - AnimatedBackground: Star animations are disabled.
 * - LoadingSpinner: Rotational animation is replaced with a simple pulse.
 * - Modal: Slide/scale animations are replaced with a simple fade.
 * - Button hover effects: Scale/transform animations are disabled.
 * - Card hover lift effects: TranslateY/scale transforms are disabled.
 * - Toast notifications: Slide animations are replaced with a simple fade.
 *
 * @returns {{prefersReducedMotion: boolean, motionPreference: MotionPreference, setMotionPreference: (preference: MotionPreference) => void}}
 * An object containing:
 * - `prefersReducedMotion`: A boolean indicating whether motion should be reduced.
 * - `motionPreference`: The current motion preference setting ('system', 'reduce', or 'allow').
 * - `setMotionPreference`: A function to manually override the motion preference.
 */
export function useReducedMotion() {
  const [motionPreference, setStoredMotionPreference] = useState(
    () => (localStorage.getItem(MOTION_PREFERENCE_KEY) || 'system')
  );

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const systemPrefersReducedMotion = mediaQuery.matches;

    if (motionPreference === 'system') {
      setPrefersReducedMotion(systemPrefersReducedMotion);
    } else {
      setPrefersReducedMotion(motionPreference === 'reduce');
    }

    const handleChange = () => {
      if (motionPreference === 'system') {
        setPrefersReducedMotion(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [motionPreference]);

  const setMotionPreference = useCallback((preference) => {
    localStorage.setItem(MOTION_PREFERENCE_KEY, preference);
    setStoredMotionPreference(preference);
  }, []);

  return { prefersReducedMotion, motionPreference, setMotionPreference };
}
