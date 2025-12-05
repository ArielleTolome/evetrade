import { useState, useEffect, useCallback } from 'react';

const
  MEDIA_QUERY = '(max-width: 1024px)',
  STORAGE_KEY = 'evetrade_sidebar_collapsed';

/**
 * Custom hook to manage sidebar state
 */
export default function useSidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue) : false;
    } catch (_error) {
      return false;
    }
  });
  const [isHovering, setIsHovering] = useState(false);

  // Effect for handling mobile breakpoint
  useEffect(() => {
    const mediaQueryList = window.matchMedia(MEDIA_QUERY);
    const listener = () => setIsMobile(mediaQueryList.matches);
    listener();
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, []);

  // Toggle function
  const onToggle = useCallback(() => {
    if (!isMobile) {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (_error) {
        console.error("Failed to save sidebar state to localStorage:", error);
      }
    }
  }, [isCollapsed, isMobile]);

  // Effect for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const shouldBeCollapsed = isMobile ? false : isCollapsed;

  return {
    isMobile,
    isCollapsed: shouldBeCollapsed,
    isHovering,
    setIsHovering,
    onToggle,
  };
}
