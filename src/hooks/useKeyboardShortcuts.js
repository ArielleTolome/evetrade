import { useEffect, useRef, useCallback } from 'react';
import { router } from '../router';

const navigateSafely = (path) => {
  if (!path) return;

  if (router && typeof router.navigate === 'function') {
    router.navigate(path);
    return;
  }

  if (typeof window !== 'undefined' && window.history && window.history.pushState) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
};

export const useKeyboardShortcuts = (toggleShortcutsModal, toggleSearchModal) => {
  const keySequence = useRef('');
  const sequenceTimeout = useRef(null);
  const navigate = useCallback((path) => {
    navigateSafely(path);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            toggleSearchModal();
            break;
          case '/':
            event.preventDefault();
            toggleShortcutsModal();
            break;
        }
      } else {
        clearTimeout(sequenceTimeout.current);

        switch (event.key) {
          case '?':
            toggleShortcutsModal();
            break;
          case 'g':
            keySequence.current = 'g';
            sequenceTimeout.current = setTimeout(() => {
              keySequence.current = '';
            }, 1000); // Reset after 1 second
            break;
          case 'h':
            if (keySequence.current === 'g') {
              navigate('/');
            }
            keySequence.current = '';
            break;
          case 's':
            if (keySequence.current === 'g') {
              navigate('/station-trading');
            }
            keySequence.current = '';
            break;
          default:
            keySequence.current = '';
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimeout.current);
    };
  }, [navigate, toggleShortcutsModal, toggleSearchModal]);
};
