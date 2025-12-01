import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiCall } from './useApiCall';

describe('useApiCall', () => {
  let mockApiFunction;

  beforeEach(() => {
    mockApiFunction = vi.fn();
  });

  describe('Initial State', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useApiCall(mockApiFunction));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('Successful API Calls', () => {
    it('handles successful API call with data', async () => {
      const mockData = { id: 1, name: 'Test Item' };
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      // Execute the API call
      let returnedData;
      await act(async () => {
        returnedData = await result.current.execute({ test: 'param' });
      });

      // Verify the API function was called with correct params
      expect(mockApiFunction).toHaveBeenCalledWith({ test: 'param' });
      expect(mockApiFunction).toHaveBeenCalledTimes(1);

      // Verify state after successful call
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(returnedData).toEqual(mockData);
    });

    it('handles successful API call with empty response', async () => {
      mockApiFunction.mockResolvedValue(null);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles successful API call with array data', async () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ];
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.data).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('handles successful API call with complex nested data', async () => {
      const mockData = {
        trades: [
          { item: 'Tritanium', profit: 1000000 },
          { item: 'Pyerite', profit: 500000 },
        ],
        metadata: {
          timestamp: '2025-11-30',
          region: 'The Forge',
        },
      };
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.data.trades).toHaveLength(2);
      expect(result.current.data.metadata.region).toBe('The Forge');
    });
  });

  describe('Loading State', () => {
    it('sets loading to true during API call', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiFunction.mockReturnValue(promise);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      // Start the API call
      act(() => {
        result.current.execute();
      });

      // Loading should be true while the call is in progress
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Resolve the promise
      await act(async () => {
        resolvePromise({ success: true });
        await promise;
      });

      // Loading should be false after completion
      expect(result.current.loading).toBe(false);
    });

    it('sets loading to false after successful completion', async () => {
      mockApiFunction.mockResolvedValue({ data: 'test' });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.loading).toBe(false);
    });

    it('sets loading to false after error', async () => {
      mockApiFunction.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('handles API error with message', async () => {
      const errorMessage = 'Failed to fetch data';
      mockApiFunction.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch (err) {
          expect(err.message).toBe(errorMessage);
        }
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual({
        message: errorMessage,
        original: expect.any(Error),
      });
      expect(result.current.error.original.message).toBe(errorMessage);
    });

    it('handles API error without message', async () => {
      const error = { status: 500 };
      mockApiFunction.mockRejectedValue(error);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toEqual({
        message: 'An error occurred',
        original: error,
      });
    });

    it('handles network error', async () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';
      mockApiFunction.mockRejectedValue(networkError);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error.message).toBe('Network request failed');
      expect(result.current.error.original.name).toBe('NetworkError');
    });

    it('handles timeout error', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ECONNABORTED';
      mockApiFunction.mockRejectedValue(timeoutError);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error.message).toBe('Request timeout');
      expect(result.current.error.original.code).toBe('ECONNABORTED');
    });

    it('clears previous error on new successful call', async () => {
      // First call fails
      mockApiFunction.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();

      // Second call succeeds
      mockApiFunction.mockResolvedValueOnce({ success: true });

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual({ success: true });
    });

    it('rethrows error for caller to handle', async () => {
      const error = new Error('API Error');
      mockApiFunction.mockRejectedValue(error);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await expect(
        act(async () => {
          await result.current.execute();
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('Multiple Sequential Calls', () => {
    it('handles multiple sequential calls correctly', async () => {
      const { result } = renderHook(() => useApiCall(mockApiFunction));

      // First call
      mockApiFunction.mockResolvedValueOnce({ id: 1 });
      await act(async () => {
        await result.current.execute({ param: 'first' });
      });

      expect(result.current.data).toEqual({ id: 1 });
      expect(mockApiFunction).toHaveBeenCalledWith({ param: 'first' });

      // Second call
      mockApiFunction.mockResolvedValueOnce({ id: 2 });
      await act(async () => {
        await result.current.execute({ param: 'second' });
      });

      expect(result.current.data).toEqual({ id: 2 });
      expect(mockApiFunction).toHaveBeenCalledWith({ param: 'second' });
      expect(mockApiFunction).toHaveBeenCalledTimes(2);
    });

    it('updates data correctly on each call', async () => {
      mockApiFunction
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 2 })
        .mockResolvedValueOnce({ count: 3 });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data.count).toBe(1);

      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data.count).toBe(2);

      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data.count).toBe(3);
    });
  });

  describe('Reset Functionality', () => {
    it('resets data and error to null', async () => {
      mockApiFunction.mockResolvedValue({ data: 'test' });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual({ data: 'test' });

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('resets error state', async () => {
      mockApiFunction.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
    });

    it('can execute new call after reset', async () => {
      mockApiFunction.mockResolvedValue({ data: 'first' });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      act(() => {
        result.current.reset();
      });

      mockApiFunction.mockResolvedValue({ data: 'second' });

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual({ data: 'second' });
      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles execute without parameters', async () => {
      mockApiFunction.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(mockApiFunction).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual({ success: true });
    });

    it('handles execute with null parameters', async () => {
      mockApiFunction.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute(null);
      });

      expect(mockApiFunction).toHaveBeenCalledWith(null);
      expect(result.current.data).toEqual({ success: true });
    });

    it('handles execute with empty object parameters', async () => {
      mockApiFunction.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute({});
      });

      expect(mockApiFunction).toHaveBeenCalledWith({});
      expect(result.current.data).toEqual({ success: true });
    });

    it('handles API returning undefined', async () => {
      mockApiFunction.mockResolvedValue(undefined);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it('handles API returning empty string', async () => {
      mockApiFunction.mockResolvedValue('');

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('');
      expect(result.current.error).toBeNull();
    });

    it('handles API returning zero', async () => {
      mockApiFunction.mockResolvedValue(0);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it('handles API returning false', async () => {
      mockApiFunction.mockResolvedValue(false);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Function Stability', () => {
    it('execute function reference remains stable', () => {
      const { result, rerender } = renderHook(() =>
        useApiCall(mockApiFunction)
      );

      const firstExecute = result.current.execute;

      rerender();

      const secondExecute = result.current.execute;

      expect(firstExecute).toBe(secondExecute);
    });

    it('reset function reference remains stable', () => {
      const { result, rerender } = renderHook(() =>
        useApiCall(mockApiFunction)
      );

      const firstReset = result.current.reset;

      rerender();

      const secondReset = result.current.reset;

      expect(firstReset).toBe(secondReset);
    });

    it('creates new execute when apiFunction changes', () => {
      const mockApiFunction2 = vi.fn();
      let currentApiFunction = mockApiFunction;

      const { result, rerender } = renderHook(() =>
        useApiCall(currentApiFunction)
      );

      const firstExecute = result.current.execute;

      currentApiFunction = mockApiFunction2;
      rerender();

      const secondExecute = result.current.execute;

      expect(firstExecute).not.toBe(secondExecute);
    });
  });

  describe('Concurrent Calls', () => {
    it('handles rapid successive calls correctly', async () => {
      let callCount = 0;
      mockApiFunction.mockImplementation(() => {
        callCount++;
        return Promise.resolve({ count: callCount });
      });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        // Fire multiple calls rapidly
        const promise1 = result.current.execute();
        const promise2 = result.current.execute();
        const promise3 = result.current.execute();

        await Promise.all([promise1, promise2, promise3]);
      });

      // All three should have been called
      expect(mockApiFunction).toHaveBeenCalledTimes(3);
      // Final state should reflect the last completed call
      expect(result.current.data).toBeDefined();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Real-world Scenarios', () => {
    it('simulates successful trading data fetch', async () => {
      const tradingData = {
        trades: [
          {
            item_name: 'Tritanium',
            buy_price: 5.5,
            sell_price: 6.0,
            profit: 0.5,
            volume: 1000000,
          },
        ],
        total_profit: 500000,
      };
      mockApiFunction.mockResolvedValue(tradingData);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        await result.current.execute({ region: 'The Forge' });
      });

      expect(result.current.data.trades).toHaveLength(1);
      expect(result.current.data.total_profit).toBe(500000);
      expect(result.current.error).toBeNull();
    });

    it('simulates API rate limit error', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.status = 429;
      mockApiFunction.mockRejectedValue(rateLimitError);

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error.message).toBe('Rate limit exceeded');
      expect(result.current.error.original.status).toBe(429);
    });

    it('simulates server error followed by retry success', async () => {
      mockApiFunction
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useApiCall(mockApiFunction));

      // First call fails
      await act(async () => {
        try {
          await result.current.execute();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();

      // Retry succeeds
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual({ success: true });
    });
  });
});
