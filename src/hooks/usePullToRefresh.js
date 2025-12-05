import { useState, useEffect, useCallback, useRef } from 'react';

const usePullToRefresh = ({ onRefresh, threshold = 60, resistance = 2.5 }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [state, setState] = useState('idle'); // idle, pulling, refreshing
  const startY = useRef(0);
  const isDragging = useRef(false);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (!isTouchDevice.current || window.scrollY !== 0) return;
    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    setState('pulling');
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isTouchDevice.current || !isDragging.current) return;

    const currentY = e.touches[0].clientY;
    let distance = currentY - startY.current;

    if (distance > 0) {
      // Prevent default browser pull-to-refresh
      e.preventDefault();

      // Apply resistance
      const resistedDistance = distance / resistance;
      setPullDistance(resistedDistance);

      if (resistedDistance >= threshold && state !== 'refreshing') {
        // Vibrate if threshold is met
        if (navigator.vibrate) {
          navigator.vibrate(5);
        }
      }
    }
  }, [resistance, threshold, state]);

  const handleTouchEnd = useCallback(async () => {
    if (!isTouchDevice.current || !isDragging.current) return;

    isDragging.current = false;

    if (pullDistance >= threshold) {
      setState('refreshing');
      if (onRefresh) {
        await onRefresh();
      }
      // Delay reset to allow animation to finish
      setTimeout(() => {
        setPullDistance(0);
        setState('idle');
      }, 500);
    } else {
      setPullDistance(0);
      setState('idle');
    }
  }, [pullDistance, threshold, onRefresh]);

  return { pullDistance, state, handleTouchStart, handleTouchMove, handleTouchEnd };
};

export default usePullToRefresh;
