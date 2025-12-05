import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { vi } from 'vitest';

vi.mock('../router', () => ({
  router: {
    navigate: vi.fn(),
  },
}));
import { router } from '../router';
const mockNavigate = router.navigate;

describe('useKeyboardShortcuts', () => {
  let toggleShortcutsModal;
  let toggleSearchModal;

  beforeEach(() => {
    toggleShortcutsModal = vi.fn();
    toggleSearchModal = vi.fn();
    mockNavigate.mockClear();
  });

  it('should call toggleSearchModal on Cmd/Ctrl + K', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal));
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    window.dispatchEvent(event);
    expect(toggleSearchModal).toHaveBeenCalledTimes(1);
  });

  it('should call toggleShortcutsModal on Cmd/Ctrl + /', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal));
    const event = new KeyboardEvent('keydown', { key: '/', ctrlKey: true });
    window.dispatchEvent(event);
    expect(toggleShortcutsModal).toHaveBeenCalledTimes(1);
  });

  it('should call toggleShortcutsModal on ?', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal));
    const event = new KeyboardEvent('keydown', { key: '?' });
    window.dispatchEvent(event);
    expect(toggleShortcutsModal).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home on "g h" sequence', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal));
    const eventG = new KeyboardEvent('keydown', { key: 'g' });
    window.dispatchEvent(eventG);
    const eventH = new KeyboardEvent('keydown', { key: 'h' });
    window.dispatchEvent(eventH);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to station trading on "g s" sequence', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal));
    const eventG = new KeyboardEvent('keydown', { key: 'g' });
    window.dispatchEvent(eventG);
    const eventS = new KeyboardEvent('keydown', { key: 's' });
    window.dispatchEvent(eventS);
    expect(mockNavigate).toHaveBeenCalledWith('/station-trading');
  });

  it('should not navigate on incomplete sequence', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal));
    const eventG = new KeyboardEvent('keydown', { key: 'g' });
    window.dispatchEvent(eventG);
    const eventX = new KeyboardEvent('keydown', { key: 'x' });
    window.dispatchEvent(eventX);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
