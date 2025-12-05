import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIndustryProfits } from './useIndustryProfits';
import { apiClient } from '../api/client';

// Mock the API client
vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Mock Sentry
vi.mock('@sentry/react', () => ({
  withScope: vi.fn((callback) => callback({ setTag: vi.fn(), setExtra: vi.fn() })),
  captureException: vi.fn(),
}));

describe('useIndustryProfits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockBlueprints = [
    {
      'Blueprint ID': 1001,
      'Blueprint Type ID': 689,
      'Blueprint Name': 'Rifter Blueprint',
      'Material Efficiency': 10,
      'Time Efficiency': 20,
      'Runs': -1,
      'Market Price': 5000000,
      'Location ID': 60003760,
      'Location Flag': 'Hangar',
      'Quantity': 1,
    },
    {
      'Blueprint ID': 1002,
      'Blueprint Type ID': 690,
      'Blueprint Name': 'Merlin Blueprint',
      'Material Efficiency': 8,
      'Time Efficiency': 16,
      'Runs': 100,
      'Market Price': 3000000,
      'Location ID': 60003760,
      'Location Flag': 'Hangar',
      'Quantity': 1,
    },
    {
      'Blueprint ID': 1003,
      'Blueprint Type ID': 691,
      'Blueprint Name': 'Incursus Blueprint',
      'Material Efficiency': 10,
      'Time Efficiency': 20,
      'Runs': -1,
      'Market Price': 4500000,
      'Location ID': 60003760,
      'Location Flag': 'Hangar',
      'Quantity': 1,
    },
  ];

  const mockResponse = {
    data: {
      blueprints: mockBlueprints,
      total: 3,
      totalOwned: 10,
      activeJobs: 2,
      requestId: 'test-123',
    },
  };

  it('initializes with default state', () => {
    const { result } = renderHook(() => useIndustryProfits());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('fetches industry profits successfully', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits());

    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
        regionId: 10000002,
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockResponse.data);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/industry?'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      })
    );
  });

  it('throws error when characterId is missing', async () => {
    const { result } = renderHook(() => useIndustryProfits());

    await expect(
      result.current.fetchIndustryProfits({
        accessToken: 'test-token',
      })
    ).rejects.toThrow('characterId is required');
  });

  it('throws error when accessToken is missing', async () => {
    const { result } = renderHook(() => useIndustryProfits());

    await expect(
      result.current.fetchIndustryProfits({
        characterId: 123456,
      })
    ).rejects.toThrow('accessToken is required');
  });

  it('handles API errors gracefully', async () => {
    const error = new Error('API Error');
    apiClient.get.mockRejectedValue(error);

    const { result } = renderHook(() => useIndustryProfits());

    await act(async () => {
      await expect(
        result.current.fetchIndustryProfits({
          characterId: 123456,
          accessToken: 'test-token',
        })
      ).rejects.toThrow('API Error');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error.message).toBe('API Error');
  });

  it('handles authentication errors', async () => {
    const authError = {
      response: {
        data: {
          message: 'Authentication failed',
        },
      },
    };
    apiClient.get.mockRejectedValue(authError);

    const { result } = renderHook(() => useIndustryProfits());

    await act(async () => {
      await expect(
        result.current.fetchIndustryProfits({
          characterId: 123456,
          accessToken: 'invalid-token',
        })
      ).rejects.toThrow('Authentication failed');
    });
  });

  it('includes query parameters in API request', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits());

    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
        regionId: 10000043,
        minProfit: 1000000,
        minROI: 10,
        meLevel: 10,
        activity: 'manufacturing',
      });
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('character_id=123456'),
      expect.any(Object)
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('region_id=10000043'),
      expect.any(Object)
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('min_profit=1000000'),
      expect.any(Object)
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('min_roi=10'),
      expect.any(Object)
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('me_level=10'),
      expect.any(Object)
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('activity=manufacturing'),
      expect.any(Object)
    );
  });

  it('uses cache when available', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits({ cacheTimeout: 10000 }));

    // First call
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    // Second call with same params - should use cache
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1); // Still only 1 call
  });

  it('bypasses cache when forceRefresh is true', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits({ cacheTimeout: 10000 }));

    // First call
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    // Second call with forceRefresh
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
        forceRefresh: true,
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('clears cache correctly', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits({ cacheTimeout: 10000 }));

    // First call
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    // Clear cache
    act(() => {
      result.current.clearCache();
    });

    // Second call - cache cleared, should make new request
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('resets state correctly', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits());

    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.lastUpdated).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  describe('filterBlueprints', () => {
    const { result } = renderHook(() => useIndustryProfits());

    it('filters by ME level', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, { meLevel: 10 });

      expect(filtered).toHaveLength(2);
      expect(filtered.every(bp => bp['Material Efficiency'] === 10)).toBe(true);
    });

    it('filters by minimum price', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, { minPrice: 4000000 });

      expect(filtered).toHaveLength(2);
      expect(filtered.every(bp => bp['Market Price'] >= 4000000)).toBe(true);
    });

    it('filters by search term', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, { search: 'rifter' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]['Blueprint Name']).toBe('Rifter Blueprint');
    });

    it('filters by runs type - originals only', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, { runsType: 'original' });

      expect(filtered).toHaveLength(2);
      expect(filtered.every(bp => bp['Runs'] === -1)).toBe(true);
    });

    it('filters by runs type - copies only', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, { runsType: 'copy' });

      expect(filtered).toHaveLength(1);
      expect(filtered[0]['Runs']).toBe(100);
    });

    it('applies multiple filters', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, {
        meLevel: 10,
        minPrice: 4600000,
        runsType: 'original',
      });

      expect(filtered).toHaveLength(1);
      expect(
        filtered.every(
          bp =>
            bp['Material Efficiency'] === 10 &&
            bp['Market Price'] >= 4600000 &&
            bp['Runs'] === -1
        )
      ).toBe(true);
    });

    it('returns empty array when no blueprints match', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, { search: 'nonexistent' });

      expect(filtered).toHaveLength(0);
    });

    it('returns all blueprints when no filters applied', () => {
      const filtered = result.current.filterBlueprints(mockBlueprints, {});

      expect(filtered).toHaveLength(3);
    });

    it('handles null or undefined blueprints', () => {
      expect(result.current.filterBlueprints(null, {})).toEqual([]);
      expect(result.current.filterBlueprints(undefined, {})).toEqual([]);
      expect(result.current.filterBlueprints([], {})).toEqual([]);
    });
  });

  it('cancels pending requests on unmount', () => {
    const abortSpy = vi.fn();
    const originalAbortController = global.AbortController;
    global.AbortController = class MockAbortController {
      constructor() {
        this.signal = { aborted: false };
      }
      abort = abortSpy;
    };

    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result, unmount } = renderHook(() => useIndustryProfits());

    act(() => {
      result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    unmount();

    expect(abortSpy).toHaveBeenCalled();

    global.AbortController = originalAbortController;
  });

  it('handles cancel method', async () => {
    apiClient.get.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 1000);
        })
    );

    const { result } = renderHook(() => useIndustryProfits());

    act(() => {
      result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.cancel();
    });

    expect(result.current.loading).toBe(false);
  });

  it('handles different cache timeouts', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits({ cacheTimeout: 100 }));

    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    // Wait for cache to expire
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should make new request after cache expires
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('handles empty blueprint response', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        blueprints: [],
        total: 0,
        totalOwned: 0,
        activeJobs: 0,
        requestId: 'test-123',
      },
    });

    const { result } = renderHook(() => useIndustryProfits());

    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    expect(result.current.data.blueprints).toHaveLength(0);
    expect(result.current.data.total).toBe(0);
  });

  it('generates correct cache keys for different parameters', async () => {
    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useIndustryProfits({ cacheTimeout: 10000 }));

    // Different character IDs should create different cache entries
    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 123456,
        accessToken: 'test-token',
      });
    });

    await act(async () => {
      await result.current.fetchIndustryProfits({
        characterId: 789012,
        accessToken: 'test-token',
      });
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });
});
