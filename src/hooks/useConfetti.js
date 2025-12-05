import { useState, useCallback } from 'react';

/**
 * Custom hook to manage and trigger a confetti celebration.
 *
 * @returns {{
 *   isActive: boolean,
 *   triggerConfetti: (config?: object) => void,
 *   confettiConfig: object
 * }} An object containing the active state of the confetti, a function to trigger it,
 *    and the configuration for the Confetti component.
 */
export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({});

  const triggerConfetti = useCallback((config = {}) => {
    const { duration = 3000, ...restConfig } = config;
    setConfettiConfig(restConfig);
    setIsActive(true);

    setTimeout(() => {
      setIsActive(false);
    }, duration);
  }, []);

  return { isActive, triggerConfetti, confettiConfig };
};
