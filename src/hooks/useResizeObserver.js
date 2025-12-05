import { useState, useEffect, useRef } from 'react';

export const useResizeObserver = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const resizeRef = useRef(null);

  useEffect(() => {
    const getObserver = () => {
      return new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      });
    };

    const observer = getObserver();
    const element = resizeRef.current;

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return { resizeRef, dimensions };
};
