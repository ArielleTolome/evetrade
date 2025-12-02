import { useState, useCallback, useEffect } from 'react';
import {
  calculateNetProfit,
  calculateBreakEven,
  calculateROI,
  formatProfitForCopy,
} from '../utils/profitCalculations';

const STORAGE_KEY = 'evetrade_profit_history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Hook for managing profit calculations and history
 * @returns {Object} Profit calculation utilities
 */
export function useProfit() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading profit history:', error);
      return [];
    }
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving profit history:', error);
    }
  }, [history]);

  /**
   * Calculate profit with all fees and taxes
   * @param {Object} params - Calculation parameters
   * @returns {Object} Complete profit breakdown
   */
  const calculate = useCallback((params) => {
    return calculateNetProfit(params);
  }, []);

  /**
   * Calculate break-even price
   * @param {Object} params - Calculation parameters
   * @returns {number} Minimum sell price
   */
  const getBreakEven = useCallback((params) => {
    return calculateBreakEven(params);
  }, []);

  /**
   * Calculate ROI percentage
   * @param {Object} params - Calculation parameters
   * @returns {number} ROI percentage
   */
  const getROI = useCallback((params) => {
    return calculateROI(params);
  }, []);

  /**
   * Format calculation for copying
   * @param {string} itemName - Item name
   * @param {Object} params - Calculation parameters
   * @param {Object} result - Calculation result
   * @returns {string} Formatted text
   */
  const formatForCopy = useCallback((itemName, params, result) => {
    return formatProfitForCopy(itemName, params, result);
  }, []);

  /**
   * Save a calculation to history
   * @param {Object} calculation - Calculation to save
   */
  const saveToHistory = useCallback((calculation) => {
    setHistory((prev) => {
      const newHistory = [
        {
          ...calculation,
          timestamp: Date.now(),
          id: Date.now() + Math.random(), // Unique ID
        },
        ...prev,
      ].slice(0, MAX_HISTORY_ITEMS); // Keep only the most recent items

      return newHistory;
    });
  }, []);

  /**
   * Remove a calculation from history
   * @param {string|number} id - Calculation ID to remove
   */
  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  /**
   * Get a calculation from history by ID
   * @param {string|number} id - Calculation ID
   * @returns {Object|null} Calculation or null if not found
   */
  const getFromHistory = useCallback((id) => {
    return history.find((item) => item.id === id) || null;
  }, [history]);

  return {
    calculate,
    getBreakEven,
    getROI,
    formatForCopy,
    history,
    saveToHistory,
    removeFromHistory,
    clearHistory,
    getFromHistory,
  };
}

export default useProfit;
