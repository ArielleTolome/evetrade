import React, { useEffect, useState, useRef } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const PageTransition = ({ children, type = 'fade', location }) => {
  // Initialize with media query value using lazy initializer (runs once on mount)
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const nodeRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const timeout = isReducedMotion ? 0 : 300;

  const getTransitionClassNames = (transitionType) => {
    switch (transitionType) {
      case 'slide-left':
        return {
          enter: 'animate-page-slide-in-left',
          exit: 'animate-page-slide-out-right',
        };
      case 'slide-right':
        return {
          enter: 'animate-page-slide-in-right',
          exit: 'animate-page-slide-out-left',
        };
      case 'scale':
        return {
          enter: 'animate-page-scale-in',
          exit: 'animate-page-scale-out',
        };
      case 'fade':
      default:
        return {
          enter: 'animate-page-fade-in',
          exit: 'animate-page-fade-out',
        };
    }
  };

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.key}
        nodeRef={nodeRef}
        timeout={timeout}
        classNames={getTransitionClassNames(type)}
      >
        <div ref={nodeRef} className="page-container">
          {children}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default PageTransition;
