import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { vi } from 'vitest';

describe('useKeyboardShortcuts', () => {
  let toggleShortcutsModal;
  let toggleSearchModal;
  let navigate;

  beforeEach(() => {
    toggleShortcutsModal = vi.fn();
    toggleSearchModal = vi.fn();
    navigate = vi.fn();
  });

  it('should call toggleSearchModal on Cmd/Ctrl + K', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal, navigate));
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    window.dispatchEvent(event);
    expect(toggleSearchModal).toHaveBeenCalledTimes(1);
  });

  it('should call toggleShortcutsModal on Cmd/Ctrl + /', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal, navigate));
    const event = new KeyboardEvent('keydown', { key: '/', ctrlKey: true });
    window.dispatchEvent(event);
    expect(toggleShortcutsModal).toHaveBeenCalledTimes(1);
  });

  it('should call toggleShortcutsModal on ?', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal, navigate));
    const event = new KeyboardEvent('keydown', { key: '?' });
    window.dispatchEvent(event);
    expect(toggleShortcutsModal).toHaveBeenCalledTimes(1);
  });

  it('should navigate to home on "g h" sequence', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal, navigate));
    const eventG = new KeyboardEvent('keydown', { key: 'g' });
    window.dispatchEvent(eventG);
    const eventH = new KeyboardEvent('keydown', { key: 'h' });
    window.dispatchEvent(eventH);
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to station trading on "g s" sequence', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal, navigate));
    const eventG = new KeyboardEvent('keydown', { key: 'g' });
    window.dispatchEvent(eventG);
    const eventS = new KeyboardEvent('keydown', { key: 's' });
    window.dispatchEvent(eventS);
    expect(navigate).toHaveBeenCalledWith('/station-trading');
  });

  it('should not navigate on incomplete sequence', () => {
    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal, navigate));
    const eventG = new KeyboardEvent('keydown', { key: 'g' });
    window.dispatchEvent(eventG);
    const eventX = new KeyboardEvent('keydown', { key: 'x' });
    window.dispatchEvent(eventX);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('falls back to window.location.assign when no navigateFn provided', () => {
    const assignSpy = vi.fn();
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      assign: assignSpy,
      pathname: '/station-trading',
    });

    renderHook(() => useKeyboardShortcuts(toggleShortcutsModal, toggleSearchModal));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));

    expect(assignSpy).toHaveBeenCalledWith('/');
    locationSpy.mockRestore();
  });
});
