import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = (toggleShortcutsModal, toggleSearchModal) => {
  const keySequence = useRef('');
  const navigate = useNavigate();
  const sequenceTimeout = useRef(null);

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
