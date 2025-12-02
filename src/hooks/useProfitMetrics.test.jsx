import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfitMetrics } from './useProfitMetrics';

describe('useProfitMetrics', () => {
  it('calculates profit per hour correctly', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      Volume: 100,
      'Profit per Unit': 10000,
      'Buy Price': 100000,
    };

    const metrics = result.current.calculateMetrics(trade);

    // Expected: (100 / 24) * 0.5 * 10000 = 20,833.33 ISK/hour
    expect(metrics.profitPerHour).toBeCloseTo(20833.33, 2);
  });

  it('calculates ROI correctly', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      'Profit per Unit': 10000,
      'Buy Price': 100000,
    };

    const metrics = result.current.calculateMetrics(trade);

    // Expected: (10000 / 100000) * 100 = 10%
    expect(metrics.roi).toBe(10);
  });

  it('calculates capital efficiency', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      Volume: 100,
      'Profit per Unit': 10000,
      'Buy Price': 100000,
    };

    const metrics = result.current.calculateMetrics(trade);

    // Capital required: 100000 * 100 = 10,000,000
    expect(metrics.capitalRequired).toBe(10000000);

    // Capital efficiency: (profitPerHour / capitalRequired) * 1,000,000
    const expectedEfficiency = (metrics.profitPerHour / 10000000) * 1000000;
    expect(metrics.capitalEfficiency).toBeCloseTo(expectedEfficiency, 2);
  });

  it('calculates time to recover investment', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      Volume: 100,
      'Profit per Unit': 10000,
      'Buy Price': 100000,
    };

    const metrics = result.current.calculateMetrics(trade);

    // Time to recover: capitalRequired / profitPerHour
    const expectedTime = metrics.capitalRequired / metrics.profitPerHour;
    expect(metrics.timeToRecover).toBeCloseTo(expectedTime, 2);
  });

  it('returns Infinity for time to recover when profit is zero', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      Volume: 0,
      'Profit per Unit': 0,
      'Buy Price': 100000,
    };

    const metrics = result.current.calculateMetrics(trade);
    expect(metrics.timeToRecover).toBe(Infinity);
  });

  it('calculates rating correctly', () => {
    const { result } = renderHook(() => useProfitMetrics());

    // High profit, high ROI, high volume = 5 stars
    const excellentTrade = {
      Volume: 200,
      'Profit per Unit': 10000,
      'Buy Price': 50000,
    };

    const metrics = result.current.calculateMetrics(excellentTrade);
    expect(metrics.rating).toBeGreaterThanOrEqual(3);
    expect(metrics.rating).toBeLessThanOrEqual(5);
  });

  it('handles custom options', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      Volume: 100,
      'Profit per Unit': 10000,
      'Buy Price': 100000,
    };

    const options = {
      hoursPerDay: 24,
      assumedTurnover: 0.3, // 30% capture rate
    };

    const metrics = result.current.calculateMetrics(trade, options);

    // Expected: (100 / 24) * 0.3 * 10000 = 12,500 ISK/hour
    expect(metrics.profitPerHour).toBeCloseTo(12500, 2);
  });

  it('handles alternative property names', () => {
    const { result } = renderHook(() => useProfitMetrics());

    // Using lowercase property names
    const trade = {
      volume: 100,
      profitPerUnit: 10000,
      buyPrice: 100000,
    };

    const metrics = result.current.calculateMetrics(trade);
    expect(metrics.profitPerHour).toBeCloseTo(20833.33, 2);
  });

  it('handles zero buy price gracefully', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      Volume: 100,
      'Profit per Unit': 10000,
      'Buy Price': 0,
    };

    const metrics = result.current.calculateMetrics(trade);
    expect(metrics.roi).toBe(0);
    expect(metrics.capitalRequired).toBe(0);
  });

  it('caps capital required at 100 units', () => {
    const { result } = renderHook(() => useProfitMetrics());
    const trade = {
      Volume: 1000, // High volume
      'Profit per Unit': 10000,
      'Buy Price': 100000,
    };

    const metrics = result.current.calculateMetrics(trade);
    // Should cap at 100 units: 100000 * 100 = 10,000,000
    expect(metrics.capitalRequired).toBe(10000000);
  });
});
