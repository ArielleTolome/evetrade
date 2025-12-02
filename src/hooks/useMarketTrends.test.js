import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMarketTrends } from './useMarketTrends';
import * as esiApi from '../api/esi';

// Mock the ESI API
vi.mock('../api/esi', () => ({
  getMarketHistory: vi.fn(),
}));

// Mock Sentry
vi.mock('@sentry/react', () => ({
  withScope: vi.fn((callback) => callback({ setTag: vi.fn(), setExtra: vi.fn() })),
  captureException: vi.fn(),
}));

describe('useMarketTrends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMarketHistory = [
    { date: '2025-11-01', average: 100, volume: 1000 },
    { date: '2025-11-02', average: 102, volume: 1100 },
    { date: '2025-11-03', average: 104, volume: 1050 },
    { date: '2025-11-04', average: 106, volume: 1200 },
    { date: '2025-11-05', average: 108, volume: 1150 },
    { date: '2025-11-06', average: 110, volume: 1300 },
    { date: '2025-11-07', average: 112, volume: 1250 },
    { date: '2025-11-08', average: 114, volume: 1400 },
  ];

  it('fetches and analyzes market history data', async () => {
    esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trend).toBe('bullish');
    expect(result.current.trendStrength).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('detects bullish trend correctly', async () => {
    const bullishData = [
      { date: '2025-11-01', average: 100, volume: 1000 },
      { date: '2025-11-02', average: 105, volume: 1000 },
      { date: '2025-11-03', average: 110, volume: 1000 },
      { date: '2025-11-04', average: 115, volume: 1000 },
      { date: '2025-11-05', average: 120, volume: 1000 },
    ];

    esiApi.getMarketHistory.mockResolvedValue(bullishData);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trend).toBe('bullish');
    expect(result.current.priceChange7d).toBeGreaterThan(0);
  });

  it('detects bearish trend correctly', async () => {
    const bearishData = [
      { date: '2025-11-01', average: 120, volume: 1000 },
      { date: '2025-11-02', average: 115, volume: 1000 },
      { date: '2025-11-03', average: 110, volume: 1000 },
      { date: '2025-11-04', average: 105, volume: 1000 },
      { date: '2025-11-05', average: 100, volume: 1000 },
    ];

    esiApi.getMarketHistory.mockResolvedValue(bearishData);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trend).toBe('bearish');
    expect(result.current.priceChange7d).toBeLessThan(0);
  });

  it('detects neutral trend for stable prices', async () => {
    const neutralData = [
      { date: '2025-11-01', average: 100, volume: 1000 },
      { date: '2025-11-02', average: 100.2, volume: 1000 },
      { date: '2025-11-03', average: 99.8, volume: 1000 },
      { date: '2025-11-04', average: 100.1, volume: 1000 },
      { date: '2025-11-05', average: 99.9, volume: 1000 },
    ];

    esiApi.getMarketHistory.mockResolvedValue(neutralData);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trend).toBe('neutral');
    expect(result.current.trendStrength).toBeLessThan(10);
  });

  it('calculates price changes correctly', async () => {
    esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Price went from 102 (index 1, which is 7 days ago from index 8) to 114 (current)
    // ((114 - 102) / 102) * 100 = 11.76%
    expect(result.current.priceChange7d).toBeCloseTo(11.76, 1);
  });

  it('detects increasing volume trend', async () => {
    const increasingVolumeData = Array.from({ length: 14 }, (_, i) => ({
      date: `2025-11-${String(i + 1).padStart(2, '0')}`,
      average: 100,
      volume: 1000 + i * 100, // Steadily increasing volume
    }));

    esiApi.getMarketHistory.mockResolvedValue(increasingVolumeData);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.volumeTrend).toBe('increasing');
  });

  it('detects decreasing volume trend', async () => {
    const decreasingVolumeData = Array.from({ length: 14 }, (_, i) => ({
      date: `2025-11-${String(i + 1).padStart(2, '0')}`,
      average: 100,
      volume: 2000 - i * 100, // Steadily decreasing volume
    }));

    esiApi.getMarketHistory.mockResolvedValue(decreasingVolumeData);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.volumeTrend).toBe('decreasing');
  });

  it('calculates support and resistance levels', async () => {
    const volatileData = [
      { date: '2025-11-01', average: 100, volume: 1000 },
      { date: '2025-11-02', average: 120, volume: 1000 },
      { date: '2025-11-03', average: 95, volume: 1000 },
      { date: '2025-11-04', average: 125, volume: 1000 },
      { date: '2025-11-05', average: 90, volume: 1000 },
      { date: '2025-11-06', average: 130, volume: 1000 },
      { date: '2025-11-07', average: 110, volume: 1000 },
    ];

    esiApi.getMarketHistory.mockResolvedValue(volatileData);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.supportLevel).toBeLessThan(100);
    expect(result.current.resistanceLevel).toBeGreaterThan(120);
  });

  it('predicts future price based on trend', async () => {
    esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.predictedPrice).toBeGreaterThan(114); // Current is 114, should predict higher
    expect(result.current.predictedPrice).toBeLessThan(228); // Should not exceed 200% change
  });

  it('calculates confidence level', async () => {
    esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.confidence).toBeGreaterThanOrEqual(0);
    expect(result.current.confidence).toBeLessThanOrEqual(100);
  });

  it('handles missing typeId or regionId', async () => {
    const { result } = renderHook(() => useMarketTrends(null, null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(esiApi.getMarketHistory).not.toHaveBeenCalled();
    expect(result.current.marketHistory).toEqual([]);
  });

  it('handles API errors gracefully', async () => {
    const error = new Error('API Error');
    esiApi.getMarketHistory.mockRejectedValue(error);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error.message).toBe('API Error');
  });

  it('handles insufficient data gracefully', async () => {
    esiApi.getMarketHistory.mockResolvedValue([
      { date: '2025-11-01', average: 100, volume: 1000 },
    ]);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trend).toBe('neutral');
    expect(result.current.trendStrength).toBe(0);
    expect(result.current.predictedPrice).toBeNull();
  });

  it('filters out invalid market history entries', async () => {
    const invalidData = [
      { date: '2025-11-01', average: 100, volume: 1000 },
      { date: '2025-11-02', average: null, volume: 1000 }, // Invalid - no average
      { date: null, average: 105, volume: 1000 }, // Invalid - no date
      { date: '2025-11-03', average: 110, volume: 1000 },
    ];

    esiApi.getMarketHistory.mockResolvedValue(invalidData);

    const { result } = renderHook(() => useMarketTrends(34, 10000002));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.marketHistory).toHaveLength(2);
  });

  describe('calculateMovingAverage', () => {
    it('calculates simple moving average correctly', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const prices = [100, 102, 104, 106, 108];
      const ma3 = result.current.calculateMovingAverage(prices, 3);

      expect(ma3).toHaveLength(3);
      expect(ma3[0]).toBeCloseTo(102, 1); // (100 + 102 + 104) / 3
      expect(ma3[1]).toBeCloseTo(104, 1); // (102 + 104 + 106) / 3
      expect(ma3[2]).toBeCloseTo(106, 1); // (104 + 106 + 108) / 3
    });

    it('returns empty array for insufficient data', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const prices = [100, 102];
      const ma5 = result.current.calculateMovingAverage(prices, 5);

      expect(ma5).toHaveLength(0);
    });
  });

  describe('calculateTrend', () => {
    it('calculates linear regression correctly', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const prices = [100, 102, 104, 106, 108];
      const trend = result.current.calculateTrend(prices);

      expect(trend.slope).toBeCloseTo(2, 1); // Perfect upward trend of +2 per period
      expect(trend.r2).toBeCloseTo(1, 1); // Perfect fit
    });

    it('handles insufficient data', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const trend = result.current.calculateTrend([100]);

      expect(trend.slope).toBe(0);
      expect(trend.intercept).toBe(0);
      expect(trend.r2).toBe(0);
    });
  });

  describe('calculateSupportResistance', () => {
    it('identifies support and resistance levels', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const prices = [100, 120, 95, 125, 90, 130, 110];
      const { supportLevel, resistanceLevel } = result.current.calculateSupportResistance(prices);

      expect(supportLevel).toBeLessThan(100);
      expect(resistanceLevel).toBeGreaterThan(120);
    });

    it('handles insufficient data', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const { supportLevel, resistanceLevel } = result.current.calculateSupportResistance([100, 110]);

      expect(supportLevel).toBeNull();
      expect(resistanceLevel).toBeNull();
    });
  });

  describe('predictPrice', () => {
    it('predicts price based on trend', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const history = [
        { average: 100 },
        { average: 102 },
        { average: 104 },
        { average: 106 },
        { average: 108 },
      ];

      const predicted = result.current.predictPrice(history, 1);

      expect(predicted).toBeGreaterThan(108); // Should predict higher based on upward trend
      expect(predicted).toBeLessThan(216); // Should not exceed 200% of current
    });

    it('handles insufficient data', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const predicted = result.current.predictPrice([{ average: 100 }], 1);

      expect(predicted).toBeNull();
    });

    it('constrains predicted price to reasonable bounds', async () => {
      esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);

      const { result } = renderHook(() => useMarketTrends(34, 10000002));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const extremeHistory = [
        { average: 100 },
        { average: 1000 },
        { average: 10000 },
      ];

      const predicted = result.current.predictPrice(extremeHistory, 1);

      // Should constrain to max 200% of current price
      expect(predicted).toBeLessThanOrEqual(20000);
      // Should be at least 1% of current price
      expect(predicted).toBeGreaterThanOrEqual(100);
    });
  });
});
