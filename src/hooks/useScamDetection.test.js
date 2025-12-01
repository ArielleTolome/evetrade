/**
 * Test Suite for useScamDetection Hook
 *
 * This file contains test cases demonstrating the hook's functionality.
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScamDetection } from './useScamDetection';

describe('useScamDetection', () => {
  describe('calculateScamRisk', () => {
    it('should detect single volume scam trades', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 1,
        'Gross Margin': 30,
        'Buy Price': 1000000,
        'Sell Price': 1300000,
        'Net Profit': 300000,
      };

      const risk = result.current.calculateScamRisk(trade);

      expect(risk.score).toBeGreaterThanOrEqual(60);
      expect(risk.level).toBe('high');
      expect(risk.reasons).toContain('Single item volume - classic scam indicator');
    });

    it('should detect very low volume trades', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 3,
        'Gross Margin': 25,
        'Buy Price': 500000,
        'Sell Price': 625000,
      };

      const risk = result.current.calculateScamRisk(trade);

      expect(risk.score).toBeGreaterThan(0);
      expect(risk.reasons.some(r => r.includes('Very low volume'))).toBe(true);
    });

    it('should detect suspiciously high margins', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 100,
        'Gross Margin': 60,
        'Buy Price': 1000000,
        'Sell Price': 1600000,
      };

      const risk = result.current.calculateScamRisk(trade);

      expect(risk.reasons.some(r => r.includes('too good to be true'))).toBe(true);
    });

    it('should detect extreme price spreads', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 50,
        'Gross Margin': 80,
        'Buy Price': 1000000,
        'Sell Price': 15000000, // 15x spread
      };

      const risk = result.current.calculateScamRisk(trade);

      expect(risk.reasons.some(r => r.includes('Extreme price spread'))).toBe(true);
    });

    it('should detect combination of high profit and low volume', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 2,
        'Gross Margin': 50,
        'Net Profit': 20000000,
        'Buy Price': 10000000,
        'Sell Price': 15000000,
      };

      const risk = result.current.calculateScamRisk(trade);

      expect(risk.score).toBeGreaterThan(50);
    });

    it('should handle safe trades correctly', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 500,
        'Gross Margin': 15,
        'Buy Price': 1000000,
        'Sell Price': 1150000,
        'Net Profit': 75000000,
      };

      const risk = result.current.calculateScamRisk(trade);

      expect(risk.level).toBe('low');
      expect(risk.score).toBeLessThan(30);
    });

    it('should compare with market averages', () => {
      const { result } = renderHook(() => useScamDetection());

      const marketTrades = [
        { 'Volume': 500, 'Gross Margin': 15, 'Buy Price': 1000000, 'Sell Price': 1150000 },
        { 'Volume': 600, 'Gross Margin': 12, 'Buy Price': 1000000, 'Sell Price': 1120000 },
        { 'Volume': 450, 'Gross Margin': 18, 'Buy Price': 1000000, 'Sell Price': 1180000 },
      ];

      const suspiciousTrade = {
        'Volume': 1,
        'Gross Margin': 50,
        'Buy Price': 1000000,
        'Sell Price': 1500000,
      };

      const risk = result.current.calculateScamRisk(suspiciousTrade, marketTrades);

      expect(risk.reasons.some(r => r.includes('market average'))).toBe(true);
    });

    it('should handle missing data gracefully', () => {
      const { result } = renderHook(() => useScamDetection());
      const incompleteTrade = {
        'Volume': 100,
      };

      const risk = result.current.calculateScamRisk(incompleteTrade);

      expect(risk).toBeDefined();
      expect(risk.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle null/undefined trades', () => {
      const { result } = renderHook(() => useScamDetection());

      const risk1 = result.current.calculateScamRisk(null);
      const risk2 = result.current.calculateScamRisk(undefined);

      expect(risk1.score).toBe(0);
      expect(risk2.score).toBe(0);
    });

    it('should work with camelCase property names', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        volume: 1,
        margin: 60,
        buyPrice: 1000000,
        sellPrice: 1600000,
      };

      const risk = result.current.calculateScamRisk(trade);

      expect(risk.score).toBeGreaterThan(50);
    });
  });

  describe('isLikelyScam', () => {
    it('should return true for obvious scam trades', () => {
      const { result } = renderHook(() => useScamDetection());
      const scamTrade = {
        'Volume': 1,
        'Gross Margin': 70,
        'Buy Price': 1000000,
        'Sell Price': 1700000,
      };

      expect(result.current.isLikelyScam(scamTrade)).toBe(true);
    });

    it('should return false for safe trades', () => {
      const { result } = renderHook(() => useScamDetection());
      const safeTrade = {
        'Volume': 500,
        'Gross Margin': 15,
        'Buy Price': 1000000,
        'Sell Price': 1150000,
      };

      expect(result.current.isLikelyScam(safeTrade)).toBe(false);
    });
  });

  describe('getScamWarnings', () => {
    it('should return array of warnings', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 1,
        'Gross Margin': 60,
        'Buy Price': 1000000,
        'Sell Price': 1600000,
      };

      const warnings = result.current.getScamWarnings(trade);

      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should return empty array for safe trades', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 500,
        'Gross Margin': 15,
        'Buy Price': 1000000,
        'Sell Price': 1150000,
      };

      const warnings = result.current.getScamWarnings(trade);

      expect(warnings.length).toBe(0);
    });
  });

  describe('getDetailedAssessment', () => {
    it('should provide recommendations for high-risk trades', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 1,
        'Gross Margin': 70,
        'Buy Price': 1000000,
        'Sell Price': 1700000,
      };

      const assessment = result.current.getDetailedAssessment(trade);

      expect(assessment.recommendations).toBeDefined();
      expect(assessment.recommendations.length).toBeGreaterThan(0);
      expect(assessment.summary).toContain('RISK');
    });

    it('should include extreme warnings for extreme risk', () => {
      const { result } = renderHook(() => useScamDetection());
      const trade = {
        'Volume': 1,
        'Gross Margin': 80,
        'Buy Price': 1000000,
        'Sell Price': 20000000,
      };

      const assessment = result.current.getDetailedAssessment(trade);

      expect(assessment.level).toBe('extreme');
      expect(assessment.recommendations.some(r => r.includes('DO NOT TRADE'))).toBe(true);
    });
  });

  describe('analyzeAll', () => {
    it('should analyze and sort trades by risk', () => {
      const { result } = renderHook(() => useScamDetection());
      const trades = [
        { 'Volume': 500, 'Gross Margin': 15, 'Item': 'Safe Trade' },
        { 'Volume': 1, 'Gross Margin': 70, 'Item': 'Scam Trade' },
        { 'Volume': 50, 'Gross Margin': 35, 'Item': 'Medium Risk' },
      ];

      const analyzed = result.current.analyzeAll(trades);

      expect(analyzed.length).toBe(3);
      expect(analyzed[0].scamRisk).toBeDefined();
      // Should be sorted by risk (highest first)
      expect(analyzed[0].scamRisk.score).toBeGreaterThanOrEqual(analyzed[1].scamRisk.score);
      expect(analyzed[1].scamRisk.score).toBeGreaterThanOrEqual(analyzed[2].scamRisk.score);
    });

    it('should handle empty arrays', () => {
      const { result } = renderHook(() => useScamDetection());
      const analyzed = result.current.analyzeAll([]);

      expect(analyzed).toEqual([]);
    });
  });

  describe('getScamStatistics', () => {
    it('should calculate statistics for a trade set', () => {
      const { result } = renderHook(() => useScamDetection());
      const trades = [
        { 'Volume': 500, 'Gross Margin': 15 },
        { 'Volume': 1, 'Gross Margin': 70 },
        { 'Volume': 50, 'Gross Margin': 35 },
        { 'Volume': 2, 'Gross Margin': 60 },
      ];

      const stats = result.current.getScamStatistics(trades);

      expect(stats.total).toBe(4);
      expect(stats.extremeRisk + stats.highRisk + stats.mediumRisk + stats.lowRisk).toBe(4);
      expect(stats.averageScore).toBeGreaterThan(0);
    });

    it('should handle empty trade sets', () => {
      const { result } = renderHook(() => useScamDetection());
      const stats = result.current.getScamStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.averageScore).toBe(0);
    });
  });

  describe('custom configuration', () => {
    it('should respect custom thresholds', () => {
      const { result } = renderHook(() =>
        useScamDetection({
          singleVolumePoints: 80,
          scamThreshold: 40,
        })
      );

      const trade = {
        'Volume': 1,
        'Gross Margin': 20,
        'Buy Price': 1000000,
        'Sell Price': 1200000,
      };

      const risk = result.current.calculateScamRisk(trade);

      // Should be more strict with custom config
      expect(risk.score).toBeGreaterThanOrEqual(80);
      expect(result.current.isLikelyScam(trade)).toBe(true);
    });

    it('should expose config for transparency', () => {
      const customConfig = {
        singleVolumePoints: 75,
        scamThreshold: 45,
      };

      const { result } = renderHook(() => useScamDetection(customConfig));

      expect(result.current.config.singleVolumePoints).toBe(75);
      expect(result.current.config.scamThreshold).toBe(45);
    });
  });

  describe('real-world scenarios', () => {
    it('should detect Jita scam pattern (single PLEX at inflated price)', () => {
      const { result } = renderHook(() => useScamDetection());
      const plexScam = {
        'Item': 'PLEX',
        'Volume': 1,
        'Gross Margin': 80,
        'Buy Price': 3500000,
        'Sell Price': 6300000,
        'Net Profit': 2800000,
      };

      const risk = result.current.calculateScamRisk(plexScam);

      expect(risk.level).toMatch(/high|extreme/);
      expect(risk.score).toBeGreaterThan(70);
    });

    it('should allow legitimate high-margin trades with good volume', () => {
      const { result } = renderHook(() => useScamDetection());
      const legitimateTrade = {
        'Item': 'Compressed Ore',
        'Volume': 1000,
        'Gross Margin': 45,
        'Buy Price': 100000,
        'Sell Price': 145000,
        'Net Profit': 45000000,
      };

      const risk = result.current.calculateScamRisk(legitimateTrade);

      // Should be medium or low despite high margin due to good volume
      expect(risk.level).toMatch(/low|medium/);
    });

    it('should flag margin trading scam (extreme spread, low volume)', () => {
      const { result } = renderHook(() => useScamDetection());
      const marginScam = {
        'Volume': 2,
        'Gross Margin': 95,
        'Buy Price': 500000,
        'Sell Price': 9750000,
        'Net Profit': 9250000,
      };

      const risk = result.current.calculateScamRisk(marginScam);

      expect(risk.level).toBe('extreme');
      expect(risk.reasons.length).toBeGreaterThan(2);
    });
  });
});
