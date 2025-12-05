import React, { useRef, useEffect } from 'react';
import usePullToRefresh from '../../hooks/usePullToRefresh';
import { Loader2 } from 'lucide-react';

const PullToRefresh = ({ children, onRefresh, resistance = 2.5, threshold = 60 }) => {
  const containerRef = useRef(null);
  const {
    pullDistance,
    state,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = usePullToRefresh({ onRefresh, resistance, threshold });

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.addEventListener('touchmove', handleTouchMove, { passive: false });
      el.addEventListener('touchend', handleTouchEnd, { passive: false });

      return () => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const rotation = Math.min(pullDistance / threshold * 360, 360);
  const opacity = Math.min(pullDistance / threshold, 1);
  const showSpinner = state === 'refreshing';

  return (
    <div
      ref={containerRef}
      style={{
        touchAction: 'pan-y',
        transform: `translateY(${state === 'refreshing' ? threshold : pullDistance}px)`,
        transition: state === 'idle' ? 'transform 0.3s' : 'none',
        backgroundColor: '#0D1B2A'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50px',
        }}
      >
        {showSpinner ? (
          <Loader2
            className="animate-spin"
            style={{ color: '#415A77' }}
            size={32}
          />
        ) : (
          <div style={{
            opacity: opacity,
            transform: `rotate(${rotation}deg)`,
            color: '#778DA9'
          }}>
            ↓
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;
