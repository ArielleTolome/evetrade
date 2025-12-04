import { useState, useCallback } from 'react';

const CACHE_KEY = 'savedSimulations';

export function useSavedSimulations() {
  const [savedSimulations, setSavedSimulations] = useState(() => {
    try {
      const item = window.localStorage.getItem(CACHE_KEY);
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error(error);
      return {};
    }
  });

  const saveSimulation = useCallback((name, simulation) => {
    const newSimulations = { ...savedSimulations, [name]: simulation };
    setSavedSimulations(newSimulations);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(newSimulations));
  }, [savedSimulations]);

  const deleteSimulation = useCallback((name) => {
    const newSimulations = { ...savedSimulations };
    delete newSimulations[name];
    setSavedSimulations(newSimulations);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(newSimulations));
  }, [savedSimulations]);

  return { savedSimulations, saveSimulation, deleteSimulation };
}
