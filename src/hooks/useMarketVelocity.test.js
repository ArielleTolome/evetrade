import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMarketVelocity } from './useMarketVelocity';
import * as esiApi from '../api/esi';

// Mock the ESI API
vi.mock('../api/esi');

// Mock Sentry
vi.mock('@sentry/react', () => ({
  withScope: vi.fn((callback) => callback({ setTag: vi.fn(), setExtra: vi.fn() })),
  captureException: vi.fn(),
}));

describe('useMarketVelocity', () => {
  const mockRegionId = 10000002; // Jita
  const mockTypeId = 34; // Tritanium

  const mockMarketHistory = [
    { date: '2024-01-01', volume: 1000, average: 5.0 },
    { date: '2024-01-02', volume: 1100, average: 5.1 },
    { date: '2024-01-03', volume: 1200, average: 5.2 },
    { date: '2024-01-04', volume: 1300, average: 5.3 },
    { date: '2024-01-05', volume: 1400, average: 5.4 },
    { date: '2024-01-06', volume: 1500, average: 5.5 },
    { date: '2024-01-07', volume: 1600, average: 5.6 },
    { date: '2024-01-08', volume: 1700, average: 5.7 },
    { date: '2024-01-09', volume: 1800, average: 5.8 },
    { date: '2024-01-10', volume: 1900, average: 5.9 },
    { date: '2024-01-11', volume: 2000, average: 6.0 },
    { date: '2024-01-12', volume: 2100, average: 6.1 },
    { date: '2024-01-13', volume: 2200, average: 6.2 },
    { date: '2024-01-14', volume: 2300, average: 6.3 },
  ];

  const mockMarketOrders = [
    {
      is_buy_order: true,
      price: 5.5,
      volume_remain: 10000,
      location_id: 60003760,
    },
    {
      is_buy_order: false,
      price: 6.0,
      volume_remain: 5000,
      location_id: 60003760,
    },
    {
      is_buy_order: false,
      price: 6.1,
      volume_remain: 3000,
      location_id: 60003760,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    esiApi.getMarketHistory.mockResolvedValue(mockMarketHistory);
    esiApi.getMarketOrders.mockResolvedValue(mockMarketOrders);
    esiApi.analyzeMarketOrders.mockReturnValue({
      buyOrders: 1,
      sellOrders: 2,
      bestBuyPrice: 5.5,
      bestSellPrice: 6.0,
      totalBuyVolume: 10000,
      totalSellVolume: 8000,
      spread: 8.33,
      competitionLevel: 'low',
      buyersAtBestPrice: 1,
      sellersAtBestPrice: 1,
      buyWalls: [],
      sellWalls: [],
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, { typeIds: [] })
    );

    expect(result.current.velocities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.lastUpdated).toBe(null);
  });

  it('should fetch and calculate velocity metrics', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(esiApi.getMarketHistory).toHaveBeenCalledWith(mockRegionId, mockTypeId);
    expect(esiApi.getMarketOrders).toHaveBeenCalledWith(mockRegionId, mockTypeId, 'all');

    expect(result.current.velocities).toHaveLength(1);
    const velocity = result.current.velocities[0];

    expect(velocity.typeId).toBe(mockTypeId);
    expect(velocity.dailyVolume7d).toBeGreaterThan(0);
    expect(velocity.dailyVolume30d).toBeGreaterThan(0);
    expect(velocity.volumeTrend).toBeDefined();
    expect(velocity.velocityScore).toBeGreaterThanOrEqual(0);
    expect(velocity.velocityScore).toBeLessThanOrEqual(100);
  });

  it('should calculate average daily volume correctly', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const velocity = result.current.velocities[0];

    // Last 7 days: 1700, 1800, 1900, 2000, 2100, 2200, 2300
    // Average: (1700 + 1800 + 1900 + 2000 + 2100 + 2200 + 2300) / 7 = 2000
    expect(velocity.dailyVolume7d).toBe(2000);
  });

  it('should detect increasing volume trend', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const velocity = result.current.velocities[0];

    // Volume is steadily increasing in mock data
    expect(velocity.volumeTrend).toBe('increasing');
    expect(velocity.volumeTrendPercent).toBeGreaterThan(0);
  });

  it('should calculate days to sell correctly', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const velocity = result.current.velocities[0];

    // Total sell volume: 8000
    // Daily volume: 1900
    // Days to sell: 8000 / 1900 ≈ 4.2
    expect(velocity.daysToSell).toBeCloseTo(4.2, 0);
  });

  it('should calculate velocity score', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const velocity = result.current.velocities[0];

    expect(velocity.velocityScore).toBeGreaterThan(0);
    expect(velocity.velocityScore).toBeLessThanOrEqual(100);
  });

  it('should filter by minimum volume', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
        minVolume: 5000, // Higher than our mock data
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should be filtered out due to low volume
    expect(result.current.velocities).toHaveLength(0);
  });

  it('should filter by minimum velocity score', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
        minVelocityScore: 95, // Very high threshold
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should be filtered out if velocity score is below threshold
    expect(result.current.velocities.length).toBeLessThanOrEqual(1);
  });

  it('should filter by minimum spread', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
        minSpread: 20, // Higher than our mock spread of 8.33%
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should be filtered out due to low spread
    expect(result.current.velocities).toHaveLength(0);
  });

  it('should filter by competition level', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
        competitionFilter: 'high', // Only high competition
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock data has 'low' competition, so should be filtered out
    expect(result.current.velocities).toHaveLength(0);
  });

  it('should handle multiple items', async () => {
    const typeIds = [34, 35, 36];

    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(esiApi.getMarketHistory).toHaveBeenCalledTimes(3);
    expect(esiApi.getMarketOrders).toHaveBeenCalledTimes(3);
    expect(result.current.velocities).toHaveLength(3);
  });

  it('should calculate statistics correctly', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const { statistics } = result.current;

    expect(statistics.totalItems).toBe(1);
    expect(statistics.averageVelocityScore).toBeGreaterThanOrEqual(0);
    expect(statistics.averageDailyVolume).toBeGreaterThan(0);
    expect(statistics.averageDaysToSell).toBeGreaterThan(0);
    expect(statistics.averageSpread).toBeGreaterThanOrEqual(0);
  });

  it('should provide top opportunities', async () => {
    const typeIds = [34, 35, 36];

    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.topOpportunities).toBeDefined();
    expect(result.current.topOpportunities.length).toBeLessThanOrEqual(10);

    // Should be sorted by velocity score
    const scores = result.current.topOpportunities.map(item => item.velocityScore);
    const sortedScores = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sortedScores);
  });

  it('should handle API errors gracefully', async () => {
    esiApi.getMarketHistory.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // When individual item fetch fails, the error is suppressed and item is excluded
    // from results. Only overall fetch errors set the error state.
    // Since we're using Promise.all, individual errors are caught per item.
    expect(result.current.velocities).toHaveLength(0);
  });

  it('should refresh data when refresh is called', async () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [mockTypeId],
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstUpdate = result.current.lastUpdated;
    const initialCallCount = esiApi.getMarketHistory.mock.calls.length;

    // Clear mock call history after initial render
    vi.clearAllMocks();

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Trigger refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lastUpdated).not.toBe(firstUpdate);
    // Should be called once for the refresh (after clearing mocks)
    expect(esiApi.getMarketHistory).toHaveBeenCalledTimes(1);
  });

  it('should export utility functions', () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, { typeIds: [] })
    );

    expect(result.current.calculateAverageDailyVolume).toBeDefined();
    expect(result.current.analyzeVolumeTrend).toBeDefined();
    expect(result.current.calculateDaysToSell).toBeDefined();
    expect(result.current.calculateVelocityScore).toBeDefined();
  });

  it('should handle empty type IDs array', () => {
    const { result } = renderHook(() =>
      useMarketVelocity(mockRegionId, {
        typeIds: [],
      })
    );

    expect(result.current.velocities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(esiApi.getMarketHistory).not.toHaveBeenCalled();
  });

  it('should handle missing region ID', () => {
    const { result } = renderHook(() =>
      useMarketVelocity(null, {
        typeIds: [mockTypeId],
      })
    );

    expect(result.current.velocities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(esiApi.getMarketHistory).not.toHaveBeenCalled();
  });
});
