import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCopyToClipboard } from './useCopyToClipboard';

describe('useCopyToClipboard', () => {
  it('should return copy, copied, and error properties', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current).toHaveProperty('copy');
    expect(result.current).toHaveProperty('copied');
    expect(result.current).toHaveProperty('error');
  });

  it('should set copied to true after a successful copy', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      await result.current.copy('test');
    });
    expect(result.current.copied).toBe(true);
  });

  it('should reset copied to false after the success duration', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      await result.current.copy('test', 100);
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.copied).toBe(false);
    vi.useRealTimers();
  });
});
