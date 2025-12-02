import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useCorpOrders } from './useCorpOrders';
import { useEveAuth } from './useEveAuth';

// Mock the useEveAuth hook
jest.mock('./useEveAuth');

// Mock fetch
global.fetch = jest.fn();

describe('useCorpOrders', () => {
  const mockCorporationId = 123456789;
  const mockAccessToken = 'mock-access-token';

  const mockApiResponse = {
    summary: {
      totalOrders: 10,
      totalBuyOrders: 4,
      totalSellOrders: 6,
      totalExposure: 1000000000,
      ordersNeedingAttention: 2,
      uniqueItems: 5,
      uniqueLocations: 2,
    },
    orders: [
      {
        'Type ID': 34,
        'Item': 'Tritanium',
        'Location ID': 60003760,
        'Location': 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
        'Buy Orders': 2,
        'Sell Orders': 1,
        'Buy Volume': 1000000,
        'Sell Volume': 500000,
        'Buy Value (ISK)': 50000000,
        'Sell Value (ISK)': 60000000,
        'Total Exposure (ISK)': 110000000,
        'Avg Buy Price': 50,
        'Avg Sell Price': 120,
        'Potential Profit': 35000000,
        'Orders Needing Attention': 1,
        'Order Details': [
          {
            orderId: 1001,
            isBuyOrder: true,
            price: 50,
            volumeRemain: 500000,
            volumeTotal: 1000000,
            volumeFilled: 500000,
            fillRate: 50,
            issued: '2024-01-01T00:00:00Z',
            duration: 30,
            escrow: 0,
            range: 'region',
            undercutStatus: {
              isUndercut: false,
              competitorPrice: 49,
              priceDifference: 1,
              rank: 1,
              totalCompetitors: 5,
            },
            health: 80,
          },
          {
            orderId: 1002,
            isBuyOrder: false,
            price: 120,
            volumeRemain: 500000,
            volumeTotal: 500000,
            volumeFilled: 0,
            fillRate: 0,
            issued: '2024-01-15T00:00:00Z',
            duration: 90,
            escrow: 0,
            range: 'station',
            undercutStatus: {
              isUndercut: true,
              competitorPrice: 115,
              priceDifference: 5,
              rank: 2,
              totalCompetitors: 3,
            },
            health: 30,
          },
        ],
        'Attention Details': [
          {
            orderId: 1002,
            reason: 'undercut',
            health: 30,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock for useEveAuth
    useEveAuth.mockReturnValue({
      getAccessToken: jest.fn().mockResolvedValue(mockAccessToken),
      isAuthenticated: true,
    });

    // Setup default mock for fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockApiResponse),
    });
  });

  describe('Basic functionality', () => {
    test('should initialize with default state', () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeNull();
      expect(result.current.summary).toBeNull();
      expect(result.current.orders).toEqual([]);
    });

    test('should fetch orders successfully', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockApiResponse);
      expect(result.current.summary).toEqual(mockApiResponse.summary);
      expect(result.current.orders).toEqual(mockApiResponse.orders);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
    });

    test('should handle missing corporation ID', async () => {
      const { result } = renderHook(() => useCorpOrders(null));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.error).toEqual({
        message: 'Corporation ID is required',
      });
    });

    test('should handle unauthenticated user', async () => {
      useEveAuth.mockReturnValue({
        getAccessToken: jest.fn(),
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.error).toEqual({
        message: 'Authentication required. Please log in with EVE SSO.',
      });
    });
  });

  describe('Error handling', () => {
    test('should handle 403 Forbidden error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: jest.fn().mockResolvedValue({
          message: 'Missing scope',
        }),
      });

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.error.message).toContain('Missing required scope');
    });

    test('should handle 404 Not Found error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({
          message: 'Corporation not found',
        }),
      });

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.error.message).toContain('Corporation not found');
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.error.message).toContain('Network error');
    });
  });

  describe('Analysis methods', () => {
    test('getOrdersNeedingAttention should return orders with issues', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const needingAttention = result.current.getOrdersNeedingAttention();

      expect(needingAttention).toHaveLength(1);
      expect(needingAttention[0].itemName).toBe('Tritanium');
      expect(needingAttention[0].count).toBe(1);
    });

    test('getUndercutOrders should return only undercut orders', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const undercutOrders = result.current.getUndercutOrders();

      expect(undercutOrders).toHaveLength(1);
      expect(undercutOrders[0].itemName).toBe('Tritanium');
      expect(undercutOrders[0].count).toBe(1);
      expect(undercutOrders[0].orders[0].undercutStatus.isUndercut).toBe(true);
    });

    test('getExpiringOrders should return orders expiring within 7 days', async () => {
      // Create a date 85 days ago (will expire in 5 days with 90 day duration)
      const fiveDaysToExpire = new Date();
      fiveDaysToExpire.setDate(fiveDaysToExpire.getDate() - 85);

      const mockResponseWithExpiring = {
        ...mockApiResponse,
        orders: [
          {
            ...mockApiResponse.orders[0],
            'Order Details': [
              {
                ...mockApiResponse.orders[0]['Order Details'][0],
                issued: fiveDaysToExpire.toISOString(),
                duration: 90,
              },
            ],
          },
        ],
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponseWithExpiring),
      });

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const expiringOrders = result.current.getExpiringOrders();

      expect(expiringOrders.length).toBeGreaterThan(0);
      expect(expiringOrders[0].daysRemaining).toBeLessThanOrEqual(7);
    });

    test('getTotalExposure should return correct total', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const exposure = result.current.getTotalExposure();

      expect(exposure).toBe(1000000000);
    });

    test('getOrderTypeBreakdown should return correct percentages', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const breakdown = result.current.getOrderTypeBreakdown();

      expect(breakdown.total).toBe(10);
      expect(breakdown.buy).toBe(4);
      expect(breakdown.sell).toBe(6);
      expect(breakdown.buyPercentage).toBe(40);
      expect(breakdown.sellPercentage).toBe(60);
    });

    test('getHealthStats should calculate health statistics', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const healthStats = result.current.getHealthStats();

      expect(healthStats.total).toBe(2);
      expect(healthStats.healthy).toBe(1); // health >= 70
      expect(healthStats.critical).toBe(1); // health < 40
      expect(healthStats.warning).toBe(0); // health 40-69
    });

    test('filterByHealth should filter orders correctly', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const criticalOrders = result.current.filterByHealth(0, 39);
      const healthyOrders = result.current.filterByHealth(70, 100);

      expect(criticalOrders).toHaveLength(1);
      expect(healthyOrders).toHaveLength(1);
    });

    test('getTopItemsByExposure should return items sorted by exposure', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      const topItems = result.current.getTopItemsByExposure(5);

      expect(topItems).toHaveLength(1);
      expect(topItems[0].itemName).toBe('Tritanium');
      expect(topItems[0].exposure).toBe(110000000);
    });
  });

  describe('Options', () => {
    test('should use custom groupBy option', async () => {
      const { result } = renderHook(() =>
        useCorpOrders(mockCorporationId, { groupBy: 'location' })
      );

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('groupBy=location'),
        expect.any(Object)
      );
    });

    test('should include history when requested', async () => {
      const { result } = renderHook(() =>
        useCorpOrders(mockCorporationId, { includeHistory: true })
      );

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('includeHistory=true'),
        expect.any(Object)
      );
    });
  });

  describe('Utility methods', () => {
    test('reset should clear all state', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.data).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeNull();
    });

    test('clearError should clear error state', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
      });

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    test('refresh should be an alias for fetchOrders', async () => {
      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.data).toEqual(mockApiResponse);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty orders response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          summary: {
            totalOrders: 0,
            totalBuyOrders: 0,
            totalSellOrders: 0,
            totalExposure: 0,
            ordersNeedingAttention: 0,
            uniqueItems: 0,
            uniqueLocations: 0,
          },
          orders: [],
        }),
      });

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.orders).toEqual([]);
      expect(result.current.getOrdersNeedingAttention()).toEqual([]);
      expect(result.current.getTotalExposure()).toBe(0);
    });

    test('should handle missing access token', async () => {
      useEveAuth.mockReturnValue({
        getAccessToken: jest.fn().mockResolvedValue(null),
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useCorpOrders(mockCorporationId));

      await act(async () => {
        await result.current.fetchOrders();
      });

      expect(result.current.error.message).toContain('Failed to get access token');
    });
  });
});
