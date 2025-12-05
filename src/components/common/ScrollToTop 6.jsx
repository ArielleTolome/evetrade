import React, { useState, useEffect } from 'react';
import { useScroll } from '../../hooks/useScroll';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop({
  threshold = 400,
  smooth = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollPosition } = useScroll();

  useEffect(() => {
    if (scrollPosition.y > threshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [scrollPosition, threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      scrollToTop();
    }
  };

  return (
    <button
      onClick={scrollToTop}
      onKeyPress={handleKeyPress}
      tabIndex={isVisible ? 0 : -1}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full
        bg-accent-cyan/20 backdrop-blur-lg
        border border-accent-cyan/30
        text-accent-cyan
        flex items-center justify-center
        shadow-lg shadow-accent-cyan/20
        transition-all duration-300
        hover:bg-accent-cyan/30 hover:shadow-accent-cyan/40 hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      <ArrowUp size={24} />
    </button>
  );
}

export default ScrollToTop;
