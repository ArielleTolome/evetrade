import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useClipboard } from './useClipboard';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('useClipboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockClipboard.writeText.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current.history).toEqual([]);
    expect(result.current.copied).toBe(false);
  });

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      const response = await result.current.copy('Test text');
      expect(response.success).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text');
    });

    expect(result.current.copied).toBe(true);
  });

  it('should add copied item to history', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text', 'text', { label: 'Test Label' });
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].text).toBe('Test text');
    expect(result.current.history[0].format).toBe('text');
    expect(result.current.history[0].label).toBe('Test Label');
  });

  it('should reset copied state after timeout', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text');
    });

    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should format JSON data', async () => {
    const { result } = renderHook(() => useClipboard());
    const data = { item: 'Tritanium', price: 5.50 };

    await act(async () => {
      await result.current.copy(data, 'json');
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(data, null, 2)
    );
  });

  it('should format CSV data from array of objects', async () => {
    const { result } = renderHook(() => useClipboard());
    const data = [
      { item: 'Tritanium', price: 5.50 },
      { item: 'Pyerite', price: 12.00 },
    ];

    await act(async () => {
      await result.current.copy(data, 'csv');
    });

    const expectedCsv = 'item,price\nTritanium,5.5\nPyerite,12';
    expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedCsv);
  });

  it('should format in-game data', async () => {
    const { result } = renderHook(() => useClipboard());
    const data = [
      { name: 'Tritanium' },
      { name: 'Pyerite' },
    ];

    await act(async () => {
      await result.current.copy(data, 'ingame');
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('Tritanium\nPyerite');
  });

  it('should not add to history when skipHistory is true', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text', 'text', { skipHistory: true });
    });

    expect(result.current.history).toHaveLength(0);
  });

  it('should limit history to max items', async () => {
    const { result } = renderHook(() => useClipboard());

    // Add 15 items
    for (let i = 0; i < 15; i++) {
      await act(async () => {
        await result.current.copy(`Item ${i}`, 'text', { label: `Item ${i}` });
      });
    }

    // Should only keep 10 items
    expect(result.current.history.length).toBeLessThanOrEqual(10);
  });

  it('should pin and unpin items', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text');
    });

    const itemId = result.current.history[0].id;

    await act(async () => {
      result.current.pinItem(itemId);
    });

    expect(result.current.history[0].pinned).toBe(true);

    await act(async () => {
      result.current.pinItem(itemId);
    });

    expect(result.current.history[0].pinned).toBe(false);
  });

  it('should preserve pinned items when clearing history', async () => {
    const { result } = renderHook(() => useClipboard());

    // Add items and pin one
    await act(async () => {
      await result.current.copy('Pinned item');
      await result.current.copy('Regular item 1');
      await result.current.copy('Regular item 2');
    });

    const pinnedId = result.current.history[2].id; // First added item

    await act(async () => {
      result.current.pinItem(pinnedId);
    });

    await act(async () => {
      result.current.clearHistory();
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].pinned).toBe(true);
  });

  it('should remove item from history', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text 1');
      await result.current.copy('Test text 2');
    });

    const itemId = result.current.history[0].id;

    await act(async () => {
      result.current.removeFromHistory(itemId);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].text).toBe('Test text 1');
  });

  it('should recopy item from history', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text');
    });

    const itemId = result.current.history[0].id;
    mockClipboard.writeText.mockClear();

    await act(async () => {
      await result.current.recopy(itemId);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text');
  });

  it('should remove duplicates from history', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text');
      await result.current.copy('Other text');
      await result.current.copy('Test text'); // Duplicate
    });

    // Should only have 2 items (duplicate removed)
    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].text).toBe('Test text'); // Most recent
    expect(result.current.history[1].text).toBe('Other text');
  });

  it('should handle clipboard API errors', async () => {
    const { result } = renderHook(() => useClipboard());
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

    await act(async () => {
      const response = await result.current.copy('Test text');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Clipboard error');
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should persist history to localStorage', async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('Test text');
    });

    const stored = localStorageMock.getItem('evetrade-clipboard-history');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].text).toBe('Test text');
  });

  it('should load history from localStorage on mount', () => {
    const historyData = [
      {
        id: Date.now(),
        text: 'Stored text',
        format: 'text',
        label: 'Stored',
        timestamp: new Date().toISOString(),
        pinned: false,
      }
    ];

    localStorageMock.setItem('evetrade-clipboard-history', JSON.stringify(historyData));

    const { result } = renderHook(() => useClipboard());

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].text).toBe('Stored text');
  });

  it('should handle CSV with commas in values', async () => {
    const { result } = renderHook(() => useClipboard());
    const data = [
      { item: 'Tritanium, Grade A', price: 5.50 },
    ];

    await act(async () => {
      await result.current.copy(data, 'csv');
    });

    const expectedCsv = 'item,price\n"Tritanium, Grade A",5.5';
    expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedCsv);
  });

  it('should handle CSV with quotes in values', async () => {
    const { result } = renderHook(() => useClipboard());
    const data = [
      { item: 'Tritanium "Premium"', price: 5.50 },
    ];

    await act(async () => {
      await result.current.copy(data, 'csv');
    });

    const expectedCsv = 'item,price\n"Tritanium ""Premium""",5.5';
    expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedCsv);
  });
});
