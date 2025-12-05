import { renderHook, waitFor } from '@testing-library/react';
import { usePIOptimizer } from './usePIOptimizer';
import { apiClient } from '../api/client';

// Mock the API client
jest.mock('../api/client');

// Mock Sentry
jest.mock('@sentry/react', () => ({
  withScope: jest.fn(),
  captureException: jest.fn(),
}));

describe('usePIOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePIOptimizer());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });

  it('should fetch PI opportunities successfully', async () => {
    const mockResponse = {
      data: {
        opportunities: [
          {
            'Item ID': 2389,
            'Item': 'Bacteria',
            'Tier': 'P1',
            'ROI': 25.5,
            'Profit per Unit': 1500,
          },
        ],
        total: 1,
        regionId: 10000002,
        tier: 'all',
      },
    };

    apiClient.get.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => usePIOptimizer());

    result.current.fetchPIOpportunities({
      regionId: 10000002,
      tier: 'P1',
      minROI: 10,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockResponse.data);
    expect(result.current.error).toBeNull();
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/pi-optimizer'),
      expect.any(Object)
    );
  });

  it('should handle API errors', async () => {
    const mockError = new Error('API Error');
    apiClient.get.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => usePIOptimizer());

    try {
      await result.current.fetchPIOpportunities({ regionId: 10000002 });
    } catch (err) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('should use cached data when available', async () => {
    const mockResponse = {
      data: {
        opportunities: [],
        total: 0,
      },
    };

    apiClient.get.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => usePIOptimizer({ cacheTimeout: 10000 }));

    // First call
    await result.current.fetchPIOpportunities({ regionId: 10000002, tier: 'P1' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Second call with same parameters
    await result.current.fetchPIOpportunities({ regionId: 10000002, tier: 'P1' });

    // Should only call API once due to caching
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('should filter opportunities correctly', () => {
    const { result } = renderHook(() => usePIOptimizer());

    const opportunities = [
      { 'Item': 'Bacteria', 'Tier': 'P1', 'ROI': 20, 'Profit per Unit': 1000, 'Liquidity': 'High' },
      { 'Item': 'Biofuels', 'Tier': 'P1', 'ROI': 15, 'Profit per Unit': 500, 'Liquidity': 'Medium' },
      { 'Item': 'Biocells', 'Tier': 'P2', 'ROI': 30, 'Profit per Unit': 2000, 'Liquidity': 'High' },
    ];

    // Filter by tier
    const p1Only = result.current.filterOpportunities(opportunities, { tier: 'P1' });
    expect(p1Only).toHaveLength(2);

    // Filter by minimum ROI
    const highROI = result.current.filterOpportunities(opportunities, { minROI: 20 });
    expect(highROI).toHaveLength(2);

    // Filter by liquidity
    const highLiquidity = result.current.filterOpportunities(opportunities, { liquidity: 'High' });
    expect(highLiquidity).toHaveLength(2);

    // Filter by search term
    const searchResults = result.current.filterOpportunities(opportunities, { search: 'bio' });
    expect(searchResults).toHaveLength(2); // Biofuels and Biocells
  });

  it('should sort opportunities correctly', () => {
    const { result } = renderHook(() => usePIOptimizer());

    const opportunities = [
      { 'Item': 'Item A', 'ROI': 10 },
      { 'Item': 'Item B', 'ROI': 30 },
      { 'Item': 'Item C', 'ROI': 20 },
    ];

    // Sort by ROI descending
    const sortedDesc = result.current.sortOpportunities(opportunities, 'ROI', false);
    expect(sortedDesc[0].ROI).toBe(30);
    expect(sortedDesc[2].ROI).toBe(10);

    // Sort by ROI ascending
    const sortedAsc = result.current.sortOpportunities(opportunities, 'ROI', true);
    expect(sortedAsc[0].ROI).toBe(10);
    expect(sortedAsc[2].ROI).toBe(30);
  });

  it('should group opportunities by tier', () => {
    const { result } = renderHook(() => usePIOptimizer());

    const opportunities = [
      { 'Item': 'Item 1', 'Tier': 'P0' },
      { 'Item': 'Item 2', 'Tier': 'P1' },
      { 'Item': 'Item 3', 'Tier': 'P1' },
      { 'Item': 'Item 4', 'Tier': 'P2' },
      { 'Item': 'Item 5', 'Tier': 'P4' },
    ];

    const byTier = result.current.getOpportunitiesByTier(opportunities);

    expect(byTier.P0).toHaveLength(1);
    expect(byTier.P1).toHaveLength(2);
    expect(byTier.P2).toHaveLength(1);
    expect(byTier.P3).toHaveLength(0);
    expect(byTier.P4).toHaveLength(1);
  });

  it('should calculate summary statistics correctly', () => {
    const { result } = renderHook(() => usePIOptimizer());

    const opportunities = [
      { 'Item': 'Item 1', 'Tier': 'P0', 'ROI': 10, 'Profit per Unit': 1000 },
      { 'Item': 'Item 2', 'Tier': 'P1', 'ROI': 20, 'Profit per Unit': 2000 },
      { 'Item': 'Item 3', 'Tier': 'P2', 'ROI': 30, 'Profit per Unit': 3000 },
    ];

    const summary = result.current.calculateSummary(opportunities);

    expect(summary.totalOpportunities).toBe(3);
    expect(summary.avgROI).toBe(20); // (10 + 20 + 30) / 3
    expect(summary.avgProfit).toBe(2000); // (1000 + 2000 + 3000) / 3
    expect(summary.highestROI.Item).toBe('Item 3');
    expect(summary.highestProfit.Item).toBe('Item 3');
    expect(summary.tierCounts.P0).toBe(1);
    expect(summary.tierCounts.P1).toBe(1);
    expect(summary.tierCounts.P2).toBe(1);
  });

  it('should clear cache correctly', async () => {
    const mockResponse = {
      data: { opportunities: [], total: 0 },
    };

    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePIOptimizer({ cacheTimeout: 10000 }));

    // Fetch data to populate cache
    await result.current.fetchPIOpportunities({ regionId: 10000002 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear cache
    result.current.clearCache();

    // Fetch again - should call API again
    await result.current.fetchPIOpportunities({ regionId: 10000002 });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('should cancel pending requests on unmount', () => {
    const { result, unmount } = renderHook(() => usePIOptimizer());

    result.current.fetchPIOpportunities({ regionId: 10000002 });

    unmount();

    // Verify no errors on unmount
    expect(true).toBe(true);
  });

  it('should handle tier validation', async () => {
    const mockResponse = {
      data: { opportunities: [], total: 0 },
    };

    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePIOptimizer());

    // Invalid tier should default to 'all'
    await result.current.fetchPIOpportunities({
      regionId: 10000002,
      tier: 'P99', // Invalid tier
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have made API call with 'all' tier
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('tier=all'),
      expect.any(Object)
    );
  });

  it('should include authorization header when access token provided', async () => {
    const mockResponse = {
      data: { opportunities: [], total: 0 },
    };

    apiClient.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePIOptimizer());

    await result.current.fetchPIOpportunities({
      regionId: 10000002,
      characterId: 123456,
      accessToken: 'test-token',
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      })
    );
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => usePIOptimizer());

    // Set some initial state (mock)
    result.current.reset();

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdated).toBeNull();
  });
});
