import { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/utils';

/**
 * Generate random star positions
 */
function generateStars(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));
}

/**
 * Animated Space Background Component
 */
export function AnimatedBackground() {
  const { isDark } = useTheme();
  const { prefersReducedMotion } = useReducedMotion();

  // Generate stars only once
  const stars = useMemo(() => generateStars(100), []);

  // Only show space background in dark mode
  if (!isDark) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-black via-space-dark to-space-mid" />

      {/* Animated stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className={cn(
              'absolute rounded-full bg-white',
              !prefersReducedMotion && 'animate-twinkle'
            )}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: prefersReducedMotion ? '0s' : `${star.delay}s`,
              animationDuration: prefersReducedMotion ? '0s' : `${star.duration}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div
        className={cn(
          "absolute w-[300px] h-[300px] rounded-full blur-[50px] opacity-20 sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] sm:blur-[80px] md:blur-[100px]",
          !prefersReducedMotion && "animate-float"
        )}
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
          top: '10%',
          right: '-10%',
        }}
      />
      <div
        className={cn(
          "absolute w-[250px] h-[250px] rounded-full blur-[40px] opacity-15 sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] sm:blur-[60px] md:blur-[80px]",
          !prefersReducedMotion && "animate-float"
        )}
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)',
          bottom: '-5%',
          left: '-5%',
          animationDelay: '-3s',
        }}
      />
      <div
        className="absolute w-[200px] h-[200px] rounded-full blur-[30px] opacity-10 sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] sm:blur-[50px] md:blur-[60px]"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
          top: '50%',
          left: '30%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

export default AnimatedBackground;
