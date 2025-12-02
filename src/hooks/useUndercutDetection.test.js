import { renderHook, act } from '@testing-library/react';
import { useUndercutDetection } from './useUndercutDetection';

describe('useUndercutDetection', () => {
  const mockCharacterOrder = {
    order_id: 12345,
    type_id: 34,
    location_id: 60003760,
    price: 100.00,
    volume_remain: 1000,
    is_buy_order: false,
  };

  const mockMarketOrders = [
    {
      order_id: 11111,
      type_id: 34,
      location_id: 60003760,
      price: 99.00,
      volume_remain: 500,
      is_buy_order: false,
    },
    {
      order_id: 22222,
      type_id: 34,
      location_id: 60003760,
      price: 98.50,
      volume_remain: 300,
      is_buy_order: false,
    },
    {
      order_id: 33333,
      type_id: 34,
      location_id: 60003760,
      price: 101.00,
      volume_remain: 200,
      is_buy_order: false,
    },
  ];

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useUndercutDetection());

    expect(result.current.undercutOrders).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should detect undercut sell orders', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      const undercuts = await result.current.checkOrders(
        [mockCharacterOrder],
        mockMarketOrders
      );

      expect(undercuts).toHaveLength(1);
      expect(undercuts[0].isUndercut).toBe(true);
      expect(undercuts[0].bestCompetitorPrice).toBe(98.50);
      expect(undercuts[0].undercutBy).toBe(1.50);
      expect(undercuts[0].competitorCount).toBe(2);
    });
  });

  it('should detect outbid buy orders', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    const buyOrder = {
      order_id: 12345,
      type_id: 34,
      location_id: 60003760,
      price: 50.00,
      volume_remain: 1000,
      is_buy_order: true,
    };

    const competingBuyOrders = [
      {
        order_id: 11111,
        type_id: 34,
        location_id: 60003760,
        price: 51.00,
        volume_remain: 500,
        is_buy_order: true,
      },
      {
        order_id: 22222,
        type_id: 34,
        location_id: 60003760,
        price: 52.00,
        volume_remain: 300,
        is_buy_order: true,
      },
    ];

    await act(async () => {
      const undercuts = await result.current.checkOrders(
        [buyOrder],
        competingBuyOrders
      );

      expect(undercuts).toHaveLength(1);
      expect(undercuts[0].isUndercut).toBe(true);
      expect(undercuts[0].bestCompetitorPrice).toBe(52.00);
      expect(undercuts[0].undercutBy).toBe(2.00);
      expect(undercuts[0].competitorCount).toBe(2);
    });
  });

  it('should not detect undercut when order is competitive', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    const competitiveOrder = {
      order_id: 12345,
      type_id: 34,
      location_id: 60003760,
      price: 98.00,
      volume_remain: 1000,
      is_buy_order: false,
    };

    await act(async () => {
      const undercuts = await result.current.checkOrders(
        [competitiveOrder],
        mockMarketOrders
      );

      expect(undercuts).toHaveLength(0);
    });
  });

  it('should calculate recommended price correctly for sell orders', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      await result.current.checkOrders([mockCharacterOrder], mockMarketOrders);
    });

    const undercutOrder = result.current.undercutOrders[0];
    expect(undercutOrder.recommendedPrice).toBe(98.49); // 98.50 - 0.01
  });

  it('should calculate recommended price correctly for buy orders', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    const buyOrder = {
      order_id: 12345,
      type_id: 34,
      location_id: 60003760,
      price: 50.00,
      volume_remain: 1000,
      is_buy_order: true,
    };

    const competingBuyOrders = [
      {
        order_id: 11111,
        type_id: 34,
        location_id: 60003760,
        price: 52.00,
        volume_remain: 500,
        is_buy_order: true,
      },
    ];

    await act(async () => {
      await result.current.checkOrders([buyOrder], competingBuyOrders);
    });

    const undercutOrder = result.current.undercutOrders[0];
    expect(undercutOrder.recommendedPrice).toBe(52.01); // 52.00 + 0.01
  });

  it('should calculate optimal price with aggressive strategy', () => {
    const { result } = renderHook(() => useUndercutDetection());

    const recommendation = result.current.calculateOptimalPrice(
      mockCharacterOrder,
      mockMarketOrders,
      'aggressive'
    );

    expect(recommendation.price).toBe(98.49); // 98.50 - 0.01
    expect(recommendation.strategy).toBe('aggressive');
    expect(recommendation.isImprovement).toBe(true);
  });

  it('should calculate optimal price with moderate strategy', () => {
    const { result } = renderHook(() => useUndercutDetection());

    const recommendation = result.current.calculateOptimalPrice(
      mockCharacterOrder,
      mockMarketOrders,
      'moderate'
    );

    expect(recommendation.price).toBe(98.50);
    expect(recommendation.strategy).toBe('moderate');
  });

  it('should calculate optimal price with conservative strategy', () => {
    const { result } = renderHook(() => useUndercutDetection());

    const recommendation = result.current.calculateOptimalPrice(
      mockCharacterOrder,
      mockMarketOrders,
      'conservative'
    );

    expect(recommendation.strategy).toBe('conservative');
    expect(recommendation.price).toBeLessThanOrEqual(mockCharacterOrder.price);
  });

  it('should handle multiple orders from different items', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    const multipleOrders = [
      {
        order_id: 1,
        type_id: 34,
        location_id: 60003760,
        price: 100.00,
        volume_remain: 1000,
        is_buy_order: false,
      },
      {
        order_id: 2,
        type_id: 35,
        location_id: 60003760,
        price: 200.00,
        volume_remain: 500,
        is_buy_order: false,
      },
    ];

    const multipleMarketOrders = [
      ...mockMarketOrders,
      {
        order_id: 44444,
        type_id: 35,
        location_id: 60003760,
        price: 195.00,
        volume_remain: 300,
        is_buy_order: false,
      },
    ];

    await act(async () => {
      const undercuts = await result.current.checkOrders(
        multipleOrders,
        multipleMarketOrders
      );

      expect(undercuts).toHaveLength(2);
      expect(undercuts[0].type_id).toBe(34);
      expect(undercuts[1].type_id).toBe(35);
    });
  });

  it('should calculate undercut stats correctly', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      await result.current.checkOrders([mockCharacterOrder], mockMarketOrders);
    });

    const stats = result.current.undercutStats;
    expect(stats.total).toBe(1);
    expect(stats.sellOrders).toBe(1);
    expect(stats.buyOrders).toBe(0);
    expect(stats.totalPotentialLoss).toBeGreaterThan(0);
    expect(stats.averageUndercutPercent).toBeCloseTo(1.5, 1);
  });

  it('should get undercut amount for an order', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      await result.current.checkOrders([mockCharacterOrder], mockMarketOrders);
    });

    const undercutOrder = result.current.undercutOrders[0];
    const amount = result.current.getUndercutAmount(undercutOrder);

    expect(amount).toBe(1.50);
  });

  it('should handle empty character orders', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      const undercuts = await result.current.checkOrders([], mockMarketOrders);
      expect(undercuts).toEqual([]);
    });
  });

  it('should handle missing market orders', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      const undercuts = await result.current.checkOrders([mockCharacterOrder], []);
      expect(undercuts).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should clear undercut orders', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      await result.current.checkOrders([mockCharacterOrder], mockMarketOrders);
    });

    expect(result.current.undercutOrders.length).toBeGreaterThan(0);

    act(() => {
      result.current.clearUndercutOrders();
    });

    expect(result.current.undercutOrders).toEqual([]);
  });

  it('should reset all state', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      await result.current.checkOrders([mockCharacterOrder], mockMarketOrders);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.undercutOrders).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should exclude character own order from competition', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    const ordersIncludingSelf = [
      ...mockMarketOrders,
      mockCharacterOrder, // Character's own order in market data
    ];

    await act(async () => {
      const undercuts = await result.current.checkOrders(
        [mockCharacterOrder],
        ordersIncludingSelf
      );

      // Should still detect undercut from other orders, not from self
      expect(undercuts).toHaveLength(1);
      expect(undercuts[0].competitorCount).toBe(2); // Not counting self
    });
  });

  it('should handle orders at different locations separately', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    const orderAtDifferentStation = {
      ...mockCharacterOrder,
      location_id: 60003761,
    };

    await act(async () => {
      const undercuts = await result.current.checkOrders(
        [orderAtDifferentStation],
        mockMarketOrders // All at location_id 60003760
      );

      // Should not detect undercut because location is different
      expect(undercuts).toEqual([]);
    });
  });

  it('should calculate profit loss correctly', async () => {
    const { result } = renderHook(() => useUndercutDetection());

    await act(async () => {
      await result.current.checkOrders([mockCharacterOrder], mockMarketOrders);
    });

    const undercutOrder = result.current.undercutOrders[0];
    const expectedLoss = 1.50 * 1000; // undercutBy * volume_remain

    expect(undercutOrder.profitLoss).toBe(expectedLoss);
  });
});
