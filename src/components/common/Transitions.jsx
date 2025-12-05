import { useState, useEffect, useRef } from 'react';

/**
 * FadeIn - Fade animation with optional direction
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.direction - Direction: 'up', 'down', 'left', 'right', or null for pure fade
 * @param {number} props.duration - Animation duration in ms (default: 600)
 * @param {number} props.delay - Animation delay in ms (default: 0)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.show - Control visibility (default: true)
 */
export function FadeIn({
  children,
  direction = null,
  duration = 600,
  delay = 0,
  className = '',
  show = true
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing visibility with show prop
      setIsVisible(false);
    }
  }, [show, delay]);

  const getAnimationClass = () => {
    if (!direction) return 'animate-fade-in';
    switch (direction) {
      case 'up': return 'animate-fade-in-up';
      case 'down': return 'animate-fade-in-down';
      case 'left': return 'animate-slide-in-left';
      case 'right': return 'animate-slide-in-right';
      default: return 'animate-fade-in';
    }
  };

  const style = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  };

  if (!show) return null;

  return (
    <div
      className={`${isVisible ? getAnimationClass() : 'opacity-0'} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * SlideIn - Slide animation from any direction
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.direction - Direction: 'up', 'down', 'left', 'right'
 * @param {number} props.duration - Animation duration in ms (default: 400)
 * @param {number} props.delay - Animation delay in ms (default: 0)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.show - Control visibility (default: true)
 */
export function SlideIn({
  children,
  direction = 'up',
  duration = 400,
  delay = 0,
  className = '',
  show = true
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing visibility with show prop
      setIsVisible(false);
    }
  }, [show, delay]);

  const getAnimationClass = () => {
    switch (direction) {
      case 'up': return 'animate-slide-in-up';
      case 'down': return 'animate-fade-in-down';
      case 'left': return 'animate-slide-in-left';
      case 'right': return 'animate-slide-in-right';
      default: return 'animate-slide-in-up';
    }
  };

  const style = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  };

  if (!show) return null;

  return (
    <div
      className={`${isVisible ? getAnimationClass() : 'opacity-0'} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * ScaleIn - Scale up from center
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} props.duration - Animation duration in ms (default: 300)
 * @param {number} props.delay - Animation delay in ms (default: 0)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.show - Control visibility (default: true)
 */
export function ScaleIn({
  children,
  duration = 300,
  delay = 0,
  className = '',
  show = true
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing visibility with show prop
      setIsVisible(false);
    }
  }, [show, delay]);

  const style = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  };

  if (!show) return null;

  return (
    <div
      className={`${isVisible ? 'animate-scale-in' : 'opacity-0'} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * BounceIn - Bounce in animation
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {number} props.duration - Animation duration in ms (default: 500)
 * @param {number} props.delay - Animation delay in ms (default: 0)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.show - Control visibility (default: true)
 */
export function BounceIn({
  children,
  duration = 500,
  delay = 0,
  className = '',
  show = true
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing visibility with show prop
      setIsVisible(false);
    }
  }, [show, delay]);

  const style = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
  };

  if (!show) return null;

  return (
    <div
      className={`${isVisible ? 'animate-bounce-in' : 'opacity-0'} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * StaggeredList - Children animate in sequence
 * @param {Object} props
 * @param {React.ReactNode} props.children - List items to animate
 * @param {number} props.staggerDelay - Delay between each item in ms (default: 50)
 * @param {number} props.initialDelay - Initial delay before first item in ms (default: 0)
 * @param {string} props.animation - Animation type: 'fade-up', 'slide-up', 'scale', 'bounce' (default: 'fade-up')
 * @param {string} props.className - Additional CSS classes for container
 * @param {string} props.itemClassName - Additional CSS classes for each item
 * @param {boolean} props.show - Control visibility (default: true)
 */
export function StaggeredList({
  children,
  staggerDelay = 50,
  initialDelay = 0,
  animation = 'fade-up',
  className = '',
  itemClassName = '',
  show = true
}) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const childArray = Array.isArray(children) ? children : [children];

  useEffect(() => {
    if (!show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing visibility with show prop
      setVisibleItems(new Set());
      return;
    }

    const timers = [];
    childArray.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(prev => new Set(prev).add(index));
      }, initialDelay + (index * staggerDelay));
      timers.push(timer);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [show, childArray.length, staggerDelay, initialDelay]);

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-up': return 'animate-fade-in-up';
      case 'slide-up': return 'animate-slide-in-up';
      case 'scale': return 'animate-scale-in';
      case 'bounce': return 'animate-bounce-in';
      default: return 'animate-fade-in-up';
    }
  };

  if (!show) return null;

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className={`${visibleItems.has(index) ? getAnimationClass() : 'opacity-0'} ${itemClassName}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * Collapse - Height animation for accordions
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to collapse/expand
 * @param {boolean} props.isOpen - Whether the content is expanded
 * @param {number} props.duration - Animation duration in ms (default: 300)
 * @param {string} props.className - Additional CSS classes
 */
export function Collapse({
  children,
  isOpen,
  duration = 300,
  className = ''
}) {
  const [height, setHeight] = useState(isOpen ? 'auto' : 0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      // Set to auto after animation completes to allow dynamic content
      const timer = setTimeout(() => {
        if (isOpen) setHeight('auto');
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Force reflow to ensure animation plays
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [isOpen, duration]);

  const style = {
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: height === 'auto' ? 'visible' : 'hidden',
    transition: `height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return (
    <div style={style} className={className}>
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

/**
 * Shake - Shake animation for errors/attention
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to shake
 * @param {boolean} props.trigger - Trigger the shake animation
 * @param {number} props.duration - Animation duration in ms (default: 400)
 * @param {string} props.className - Additional CSS classes
 */
export function Shake({
  children,
  trigger,
  duration = 400,
  className = ''
}) {
  const [isShaking, setIsShaking] = useState(false);
  const prevTriggerRef = useRef(trigger);

  useEffect(() => {
    // Only shake when trigger changes from false to true
    if (trigger && !prevTriggerRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- animation state
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), duration);
      return () => clearTimeout(timer);
    }
    prevTriggerRef.current = trigger;
  }, [trigger, duration]);

  const style = {
    animationDuration: `${duration}ms`,
  };

  return (
    <div
      className={`${isShaking ? 'animate-shake' : ''} ${className}`}
      style={isShaking ? style : undefined}
    >
      {children}
    </div>
  );
}

/**
 * CountUp - Number count-up animation
 * @param {Object} props
 * @param {number} props.value - Target value to count to
 * @param {number} props.duration - Animation duration in ms (default: 1000)
 * @param {number} props.decimals - Number of decimal places (default: 0)
 * @param {string} props.prefix - Prefix string (e.g., '$')
 * @param {string} props.suffix - Suffix string (e.g., ' ISK')
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.formatter - Custom formatter function
 */
export function CountUp({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatter = null
}) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- animation state
    setIsAnimating(true);
    startTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTimeRef.current) / duration, 1);

      // Ease out quad
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = easeOut * value;

      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = formatter
    ? formatter(count)
    : count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span className={`${isAnimating ? 'animate-count-up' : ''} ${className}`}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

/**
 * PresenceTransition - Animate mount/unmount
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {boolean} props.show - Whether to show the content
 * @param {string} props.enter - Enter animation class (default: 'animate-fade-in-up')
 * @param {string} props.exit - Exit animation class (default: 'animate-fade-out')
 * @param {number} props.duration - Animation duration in ms (default: 300)
 * @param {string} props.className - Additional CSS classes
 */
export function PresenceTransition({
  children,
  show,
  enter = 'animate-fade-in-up',
  exit = 'animate-fade-out',
  duration = 300,
  className = ''
}) {
  const [shouldRender, setShouldRender] = useState(show);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- animation state
      setShouldRender(true);
      setAnimationClass(enter);
    } else {
      setAnimationClass(exit);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, enter, exit, duration]);

  if (!shouldRender) return null;

  const style = {
    animationDuration: `${duration}ms`,
  };

  return (
    <div className={`${animationClass} ${className}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Pulsate - Continuous pulsating animation
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to pulsate
 * @param {boolean} props.active - Whether pulsation is active (default: true)
 * @param {string} props.type - Type of pulse: 'scale', 'glow', 'opacity' (default: 'glow')
 * @param {string} props.className - Additional CSS classes
 */
export function Pulsate({
  children,
  active = true,
  type = 'glow',
  className = ''
}) {
  const getAnimationClass = () => {
    if (!active) return '';
    switch (type) {
      case 'scale': return 'animate-pulse-slow';
      case 'glow': return 'animate-glow-pulse';
      case 'opacity': return 'animate-pulse';
      default: return 'animate-glow-pulse';
    }
  };

  return (
    <div className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Lift - Lift effect on hover
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to lift
 * @param {string} props.className - Additional CSS classes
 */
export function Lift({ children, className = '' }) {
  return (
    <div className={`card-lift ${className}`}>
      {children}
    </div>
  );
}

/**
 * Press - Button press effect
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content with press effect
 * @param {string} props.className - Additional CSS classes
 */
export function Press({ children, className = '' }) {
  return (
    <div className={`btn-press ${className}`}>
      {children}
    </div>
  );
}

export default {
  FadeIn,
  SlideIn,
  ScaleIn,
  BounceIn,
  StaggeredList,
  Collapse,
  Shake,
  CountUp,
  PresenceTransition,
  Pulsate,
  Lift,
  Press,
};
