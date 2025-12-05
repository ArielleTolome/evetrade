import { useEffect, useRef } from 'react';

export const useKeyboardShortcuts = (toggleShortcutsModal, toggleSearchModal, navigateFn) => {
  const keySequence = useRef('');
  const sequenceTimeout = useRef(null);

  useEffect(() => {
    const navigate = (path) => {
      if (typeof navigateFn === 'function') {
        navigateFn(path);
        return;
      }

      if (typeof window !== 'undefined') {
        if (window.location.pathname !== path) {
          window.location.assign(path);
        }
      }
    };

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
  }, [navigateFn, toggleShortcutsModal, toggleSearchModal]);
};
