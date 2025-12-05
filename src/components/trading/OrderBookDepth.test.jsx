import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderBookDepth } from './OrderBookDepth';

describe('OrderBookDepth', () => {
  const mockBuyOrders = [
    { price: 999000, volume: 15000 },
    { price: 998500, volume: 8500 },
    { price: 998000, volume: 12000 },
  ];

  const mockSellOrders = [
    { price: 1001000, volume: 12500 },
    { price: 1001500, volume: 9200 },
    { price: 1002000, volume: 7800 },
  ];

  it('renders without crashing', () => {
    render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('displays empty state when no orders provided', () => {
    render(
      <OrderBookDepth
        buyOrders={[]}
        sellOrders={[]}
        itemName="Test Item"
      />
    );

    expect(screen.getByText(/No order book data available/i)).toBeInTheDocument();
  });

  it('calculates spread correctly', () => {
    render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    // Best buy: 999000, Best sell: 1001000, Spread: 2000
    expect(screen.getByText(/2.00K ISK/i)).toBeInTheDocument();
  });

  it('displays liquidity score', () => {
    render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    // Should show one of: Thin, Normal, or Deep
    const liquidityLabels = ['Thin', 'Normal', 'Deep'];
    const hasLiquidityLabel = liquidityLabels.some(label =>
      screen.queryByText(label)
    );

    expect(hasLiquidityLabel).toBeTruthy();
  });

  it('shows buy and sell order sections', () => {
    render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    expect(screen.getByText(/BUY ORDERS/i)).toBeInTheDocument();
    expect(screen.getByText(/SELL ORDERS/i)).toBeInTheDocument();
  });

  it('displays total volumes', () => {
    render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    // Total buy: 35500, Total sell: 29500
    expect(screen.getByText(/35,500/)).toBeInTheDocument();
    expect(screen.getByText(/29,500/)).toBeInTheDocument();
  });

  it('renders compact mode correctly', () => {
    const { container } = render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
        compact
      />
    );

    // Compact mode should have smaller elements
    expect(container.querySelector('.h-4')).toBeInTheDocument();
  });

  it('detects price walls', () => {
    const ordersWithWall = [
      { price: 999000, volume: 5000 },
      { price: 998500, volume: 50000 }, // Large order (wall)
      { price: 998000, volume: 6000 },
    ];

    render(
      <OrderBookDepth
        buyOrders={ordersWithWall}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    // Should display price wall count
    expect(screen.getByText(/Price Walls/i)).toBeInTheDocument();
  });

  it('handles hover interactions', () => {
    render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    // Find a buy order row and hover over it
    const orderRows = screen.getAllByText(/999,000/i);
    const firstRow = orderRows[0].closest('div');

    fireEvent.mouseEnter(firstRow);
    // After hover, cumulative volume should be displayed

    fireEvent.mouseLeave(firstRow);
    // After leave, hover state should be removed
  });

  it('supports volume_remain property', () => {
    const ordersWithVolumeRemain = [
      { price: 999000, volume_remain: 15000 },
      { price: 998500, volume_remain: 8500 },
    ];

    render(
      <OrderBookDepth
        buyOrders={ordersWithVolumeRemain}
        sellOrders={mockSellOrders}
        itemName="Test Item"
      />
    );

    // Should display total volume correctly
    expect(screen.getByText(/23,500/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <OrderBookDepth
        buyOrders={mockBuyOrders}
        sellOrders={mockSellOrders}
        itemName="Test Item"
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  describe('Liquidity Score Calculation', () => {
    it('classifies as deep market with high volume and tight spread', () => {
      const highVolumeBuys = Array.from({ length: 20 }, (_, i) => ({
        price: 1000000 - (i * 100),
        volume: 50000,
      }));

      const highVolumeSells = Array.from({ length: 20 }, (_, i) => ({
        price: 1000100 + (i * 100),
        volume: 50000,
      }));

      render(
        <OrderBookDepth
          buyOrders={highVolumeBuys}
          sellOrders={highVolumeSells}
          itemName="Test Item"
        />
      );

      expect(screen.getByText('Deep')).toBeInTheDocument();
    });

    it('classifies as thin market with low volume and wide spread', () => {
      const lowVolumeBuys = [
        { price: 900000, volume: 100 },
      ];

      const lowVolumeSells = [
        { price: 1100000, volume: 100 },
      ];

      render(
        <OrderBookDepth
          buyOrders={lowVolumeBuys}
          sellOrders={lowVolumeSells}
          itemName="Test Item"
        />
      );

      expect(screen.getByText('Thin')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined orders gracefully', () => {
      render(
        <OrderBookDepth
          buyOrders={undefined}
          sellOrders={undefined}
          itemName="Test Item"
        />
      );

      expect(screen.getByText(/No order book data available/i)).toBeInTheDocument();
    });

    it('handles single order', () => {
      render(
        <OrderBookDepth
          buyOrders={[{ price: 999000, volume: 1000 }]}
          sellOrders={[{ price: 1001000, volume: 1000 }]}
          itemName="Test Item"
        />
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('handles orders with zero volume', () => {
      const zeroVolumeOrders = [
        { price: 999000, volume: 0 },
        { price: 998500, volume: 1000 },
      ];

      render(
        <OrderBookDepth
          buyOrders={zeroVolumeOrders}
          sellOrders={mockSellOrders}
          itemName="Test Item"
        />
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      const largeOrders = [
        { price: 9999999999, volume: 999999999 },
      ];

      render(
        <OrderBookDepth
          buyOrders={largeOrders}
          sellOrders={mockSellOrders}
          itemName="Test Item"
        />
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('formats ISK prices correctly', () => {
      render(
        <OrderBookDepth
          buyOrders={mockBuyOrders}
          sellOrders={mockSellOrders}
          itemName="Test Item"
        />
      );

      // Should format 999000 as "999.00K"
      expect(screen.getByText(/999.00K/i)).toBeInTheDocument();
    });

    it('formats volumes with commas', () => {
      render(
        <OrderBookDepth
          buyOrders={mockBuyOrders}
          sellOrders={mockSellOrders}
          itemName="Test Item"
        />
      );

      // Should format 15000 as "15,000"
      expect(screen.getByText(/15,000/)).toBeInTheDocument();
    });

    it('formats spread percentage', () => {
      render(
        <OrderBookDepth
          buyOrders={mockBuyOrders}
          sellOrders={mockSellOrders}
          itemName="Test Item"
        />
      );

      // Spread percentage should be displayed
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });
  });
});
