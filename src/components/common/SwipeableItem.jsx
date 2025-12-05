import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const ACTION_WIDTH = 80;

const Action = ({ action, onClick }) => (
    <button
      onClick={onClick}
      style={{
        backgroundColor: action.color,
        color: '#E0E1DD',
        border: 'none',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        width: `${ACTION_WIDTH}px`,
        height: '100%',
      }}
      aria-label={action.label}
    >
      <action.icon className="h-6 w-6" />
    </button>
);

const SwipeableItem = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeLeft,
  onSwipeRight,
  threshold = 0.4,
}) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [actionsVisible, setActionsVisible] = useState(false);

  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const lastXRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const thresholdCrossedRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const handleSwipeStart = useCallback((e) => {
    startXRef.current = getClientX(e);
    currentXRef.current = startXRef.current;
    lastXRef.current = startXRef.current;
    lastTimeRef.current = performance.now();
    setIsSwiping(true);
    setIsScrolling(false);
    thresholdCrossedRef.current = false;
    if (containerRef.current) {
        containerRef.current.style.transition = 'none';
    }
  }, []);

  const handleSwipeMove = useCallback((e) => {
    if (!isSwiping || !containerRef.current) return;

    const clientX = getClientX(e);

    if (isScrolling) return;

    // Check for vertical scroll
    if (Math.abs(clientX - startXRef.current) < 10 && e.touches) {
        const startY = e.touches[0].clientY;
        const clientY = e.touches[0].clientY;
        if (Math.abs(clientY - startY) > 10) {
            setIsScrolling(true);
            return;
        }
    }


    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    if (deltaTime > 0) {
      setVelocity((clientX - lastXRef.current) / deltaTime);
    }
    lastTimeRef.current = now;
    lastXRef.current = clientX;

    const deltaX = clientX - startXRef.current;
    currentXRef.current = deltaX;
    setPosition(deltaX);

    const containerWidth = containerRef.current.offsetWidth;
    const triggerDistance = containerWidth * threshold;

    if (Math.abs(deltaX) > triggerDistance) {
        if (!thresholdCrossedRef.current) {
            if (navigator.vibrate) navigator.vibrate(50);
            thresholdCrossedRef.current = true;
        }
        setActiveAction(deltaX > 0 ? 'right' : 'left');
    } else {
        thresholdCrossedRef.current = false;
        setActiveAction(null);
    }


    // Prevent vertical scrolling
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isSwiping, threshold, isScrolling]);


  const springAnimation = useCallback((targetPosition) => {
    if (prefersReducedMotion) {
        setPosition(targetPosition);
        currentXRef.current = targetPosition;
        return;
    }

    cancelAnimationFrame(animationFrameRef.current);

    let currentPosition = currentXRef.current;
    let currentVelocity = velocity;

    const spring = {
      stiffness: 0.1,
      damping: 0.8,
    };

    const animate = () => {
      const distance = targetPosition - currentPosition;
      const acceleration = distance * spring.stiffness;
      currentVelocity += acceleration;
      currentVelocity *= spring.damping;
      currentPosition += currentVelocity;

      setPosition(currentPosition);
      currentXRef.current = currentPosition;

      if (Math.abs(currentPosition - targetPosition) > 0.1 || Math.abs(currentVelocity) > 0.1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setPosition(targetPosition);
        currentXRef.current = targetPosition;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [velocity, prefersReducedMotion]);


  const handleSwipeEnd = useCallback(() => {
    setIsSwiping(false);

    const containerWidth = containerRef.current.offsetWidth;
    const triggerDistance = containerWidth * threshold;

    let targetPosition = 0;

    if (currentXRef.current > triggerDistance && rightActions.length > 0) {
        if (onSwipeRight && (currentXRef.current > containerWidth * 0.6 || velocity > 1)) {
            onSwipeRight();
        } else {
            targetPosition = rightActions.length * ACTION_WIDTH; // Snap to show actions
        }
    } else if (currentXRef.current < -triggerDistance && leftActions.length > 0) {
        if (onSwipeLeft && (currentXRef.current < -containerWidth * 0.6 || velocity < -1)) {
            onSwipeLeft();
        } else {
            targetPosition = -leftActions.length * ACTION_WIDTH; // Snap to show actions
        }
    }

    springAnimation(targetPosition);
  }, [leftActions, rightActions, threshold, onSwipeLeft, onSwipeRight, velocity, springAnimation]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleMouseDown = (e) => {
      handleSwipeStart(e);
      window.addEventListener('mousemove', handleSwipeMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
      handleSwipeEnd();
      window.removeEventListener('mousemove', handleSwipeMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    node.addEventListener('mousedown', handleMouseDown);
    node.addEventListener('touchstart', handleSwipeStart, { passive: true });
    node.addEventListener('touchmove', handleSwipeMove, { passive: false });
    node.addEventListener('touchend', handleSwipeEnd);
    node.addEventListener('touchcancel', handleSwipeEnd);

    return () => {
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('touchstart', handleSwipeStart);
      node.removeEventListener('touchmove', handleSwipeMove);
      node.removeEventListener('touchend', handleSwipeEnd);
      node.removeEventListener('touchcancel', handleSwipeEnd);
      window.removeEventListener('mousemove', handleSwipeMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [handleSwipeStart, handleSwipeMove, handleSwipeEnd]);

  const getActionBackgroundColor = () => {
    if (activeAction === 'left') return '#d73000';
    if (activeAction === 'right') return '#00ff9d';
    return '#1B263B';
  };

  const handleFocus = () => {
    setActionsVisible(true);
    if (rightActions.length > 0) {
        setPosition(rightActions.length * ACTION_WIDTH);
    } else if (leftActions.length > 0) {
        setPosition(-leftActions.length * ACTION_WIDTH);
    }
  };

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
        setActionsVisible(false);
        setPosition(0);
    }
  };

  return (
    <div
        style={{ position: 'relative', overflow: isSwiping ? 'hidden' : 'visible' }}
        onFocus={handleFocus}
        onBlur={handleBlur}
    >
        <div
            className="swipeable-actions"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: getActionBackgroundColor(),
                opacity: actionsVisible || isSwiping ? 1 : 0,
                transition: 'opacity 0.2s',
            }}
        >
            <div style={{ display: 'flex' }}>
                {rightActions.map((action, index) => (
                    <Action key={index} action={action} onClick={action.onAction} />
                ))}
            </div>
            <div style={{ display: 'flex' }}>
                {leftActions.map((action, index) => (
                    <Action key={index} action={action} onClick={action.onAction} />
                ))}
            </div>
        </div>
        <div
            ref={containerRef}
            style={{ position: 'relative' }}
        >
            <div
                className="swipeable-item-content"
                style={{
                    transform: `translateX(${position}px)`,
                    willChange: 'transform',
                    touchAction: 'pan-y',
                    backgroundColor: '#1B263B',
                    position: 'relative',
                    zIndex: 1,
                    transition: prefersReducedMotion ? 'transform 0.2s' : 'none',
                }}
                tabIndex="0"
            >
                {children}
            </div>
        </div>
    </div>
  );
};

SwipeableItem.propTypes = {
    children: PropTypes.node.isRequired,
    leftActions: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.elementType.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        onAction: PropTypes.func.isRequired,
    })),
    rightActions: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.elementType.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        onAction: PropTypes.func.isRequired,
    })),
    onSwipeLeft: PropTypes.func,
    onSwipeRight: PropTypes.func,
    threshold: PropTypes.number,
};

export default SwipeableItem;
