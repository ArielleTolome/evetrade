import { useEffect, useState } from 'react';

/**
 * ProgressRing - Circular progress indicator
 *
 * @param {number} percentage - Progress percentage (0-100)
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {string} color - Color variant: 'cyan', 'gold', 'green', 'red', 'purple'
 * @param {number} strokeWidth - Width of the progress ring
 * @param {boolean} animate - Animate the fill on mount
 * @param {boolean} showPercentage - Show percentage text in center
 * @param {string|ReactNode} centerContent - Custom center content (overrides percentage)
 * @param {string} label - Label text below the ring
 * @param {string} className - Additional CSS classes
 */
export function ProgressRing({
  percentage = 0,
  size = 'md',
  color = 'cyan',
  strokeWidth = 8,
  animate = true,
  showPercentage = true,
  centerContent = null,
  label = null,
  className = '',
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState(animate ? 0 : percentage);

  const sizeMap = {
    sm: { dimension: 64, fontSize: 'text-sm' },
    md: { dimension: 96, fontSize: 'text-lg' },
    lg: { dimension: 128, fontSize: 'text-2xl' },
    xl: { dimension: 160, fontSize: 'text-3xl' },
  };

  const colorMap = {
    cyan: {
      stroke: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.3)',
      text: 'text-accent-cyan',
    },
    gold: {
      stroke: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.3)',
      text: 'text-accent-gold',
    },
    green: {
      stroke: '#00ff9d',
      glow: 'rgba(0, 255, 157, 0.3)',
      text: 'text-accent-green',
    },
    red: {
      stroke: '#f87171',
      glow: 'rgba(248, 113, 113, 0.3)',
      text: 'text-red-400',
    },
    purple: {
      stroke: '#bc13fe',
      glow: 'rgba(188, 19, 254, 0.3)',
      text: 'text-accent-purple',
    },
  };

  const { dimension, fontSize } = sizeMap[size];
  const { stroke, glow, text } = colorMap[color];

  const center = dimension / 2;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    if (!animate) return;

    const duration = 1000;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = percentage;

    const animateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setAnimatedPercentage(current);

      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };

    requestAnimationFrame(animateValue);
  }, [percentage, animate]);

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {centerContent ? (
            <div className={`${fontSize} font-bold ${text}`}>
              {centerContent}
            </div>
          ) : showPercentage ? (
            <span className={`${fontSize} font-bold font-mono ${text}`}>
              {Math.round(animatedPercentage)}%
            </span>
          ) : null}
        </div>
      </div>

      {/* Label */}
      {label && (
        <div className="mt-2 text-sm text-text-secondary text-center font-medium">
          {label}
        </div>
      )}
    </div>
  );
}

/**
 * Multiple progress rings in a group
 */
export function ProgressRingGroup({ rings = [], className = '' }) {
  return (
    <div className={`flex flex-wrap gap-6 justify-center ${className}`}>
      {rings.map((ring, index) => (
        <ProgressRing key={index} {...ring} />
      ))}
    </div>
  );
}

export default ProgressRing;
