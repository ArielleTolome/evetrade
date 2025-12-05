import React from 'react';
import Button from './Button'; // Assuming Button component is in the same folder

const illustrations = {
  'no-results': ({ colors }) => (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Background Shapes */}
      <circle cx="40" cy="50" r="25" fill={colors.background} className="animate-pulse-slow opacity-30" />
      <rect x="150" y="80" width="40" height="40" rx="8" fill={colors.background} className="animate-pulse-slow opacity-30 delay-500" />

      {/* Magnifying Glass */}
      <g className="animate-float">
        <circle cx="90" cy="70" r="35" stroke={colors.primary} strokeWidth="5" fill="none" />
        <line x1="118" y1="98" x2="140" y2="120" stroke={colors.primary} strokeWidth="5" strokeLinecap="round" />
        {/* Glass Reflection */}
        <path d="M70 50 A 30 30 0 0 1 100 50" stroke={colors.accent} strokeWidth="3" fill="none" opacity="0.5" />
      </g>

      {/* Empty result lines */}
      <line x1="75" y1="65" x2="105" y2="65" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" className="opacity-60" />
      <line x1="75" y1="75" x2="95" y2="75" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" className="opacity-60" />
    </svg>
  ),
  'no-trades': ({ colors }) => (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background Shapes */}
      <rect x="20" y="30" width="50" height="50" rx="10" fill={colors.background} className="animate-pulse-slow opacity-30" />
      <circle cx="160" cy="100" r="20" fill={colors.background} className="animate-pulse-slow opacity-30 delay-500" />

      {/* Terminal */}
      <g className="animate-float">
        <rect x="40" y="40" width="120" height="80" rx="8" stroke={colors.primary} strokeWidth="2" fill={colors.background} />
        <line x1="40" y1="55" x2="160" y2="55" stroke={colors.primary} strokeWidth="1" opacity="0.5" />

        {/* Placeholder lines */}
        <line x1="55" y1="70" x2="100" y2="70" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="80" x2="145" y2="80" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="55" y1="90" x2="80" y2="90" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />

        {/* Blinking cursor */}
        <rect x="55" y="100" width="3" height="10" fill={colors.accent} className="animate-pulse" />
      </g>
    </svg>
  ),
  'no-favorites': ({ colors }) => (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background Shapes */}
      <circle cx="170" cy="40" r="20" fill={colors.background} className="animate-pulse-slow opacity-30" />
      <rect x="10" y="90" width="30" height="30" rx="6" fill={colors.background} className="animate-pulse-slow opacity-30 delay-500" />

      {/* Main Star */}
      <g className="animate-float" style={{ transformOrigin: 'center' }}>
        <path d="M100 20 L120.5 65.5 L170 70 L132.5 102 L143 150 L100 126 L57 150 L67.5 102 L30 70 L79.5 65.5 Z"
              stroke={colors.primary} strokeWidth="3" fill="none" strokeLinejoin="round" />
      </g>

      {/* Small accent stars */}
      <path d="M40 50 L45 60 L55 62 L48 68 L50 78 L45 73 L40 78 L42 68 L35 62 L45 60 Z" fill={colors.accent} opacity="0.5" className="animate-twinkle" />
      <path d="M150 100 L155 110 L165 112 L158 118 L160 128 L155 123 L150 128 L152 118 L145 112 L155 110 Z" fill={colors.accent} opacity="0.7" className="animate-twinkle delay-1000" />
    </svg>
  ),
  'error': ({ colors }) => (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Background Shapes */}
        <rect x="15" y="45" width="40" height="40" rx="8" fill={colors.background} className="animate-pulse-slow opacity-30 transform -rotate-12" />
        <circle cx="165" cy="95" r="25" fill={colors.background} className="animate-pulse-slow opacity-30 delay-500" />

        {/* Broken link */}
        <g className="animate-shake">
          <path d="M60 80 C 70 60, 90 60, 100 80" stroke={colors.primary} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 80 C 110 100, 130 100, 140 80" stroke={colors.primary} strokeWidth="4" fill="none" strokeLinecap="round" />
          <line x1="95" y1="79" x2="105" y2="81" stroke={colors.accent} strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* Warning Triangle */}
        <g transform="translate(85, 55) scale(0.6)">
           <path d="M50 10 L95 85 H5 Z" stroke={colors.warning} strokeWidth="6" fill={colors.warning} fillOpacity="0.1" strokeLinejoin="round" />
           <line x1="50" y1="40" x2="50" y2="60" stroke={colors.warning} strokeWidth="6" strokeLinecap="round" />
           <circle cx="50" cy="75" r="3" fill={colors.warning} />
        </g>
    </svg>
  ),
  'first-time': ({ colors }) => (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background Shapes */}
      <circle cx="30" cy="110" r="20" fill={colors.background} className="animate-pulse-slow opacity-30" />
      <rect x="150" y="20" width="30" height="30" rx="6" fill={colors.background} className="animate-pulse-slow opacity-30 delay-500" />

      {/* Rocket */}
      <g className="animate-float" transform="translate(0, -10)">
        <path d="M100 20 C 90 40, 90 60, 100 80 L110 120 L90 120 L100 80" fill={colors.primary} />
        <path d="M100 20 C 110 40, 110 60, 100 80 L90 120 L110 120 L100 80" fill={colors.secondary} />
        <path d="M100 120 L120 140 H80 Z" fill={colors.primary} />
        <circle cx="100" cy="70" r="10" fill={colors.background} stroke={colors.accent} strokeWidth="2" />
      </g>

      {/* Stars */}
      <circle cx="60" cy="40" r="3" fill={colors.accent} className="animate-twinkle" />
      <circle cx="140" cy="90" r="2" fill={colors.accent} className="animate-twinkle delay-500" />
      <circle cx="80" cy="130" r="2" fill={colors.accent} className="animate-twinkle delay-1000" />
    </svg>
  ),
  'offline': ({ colors }) => (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Background Shapes */}
      <rect x="160" y="50" width="25" height="25" rx="6" fill={colors.background} className="animate-pulse-slow opacity-30" />
      <circle cx="30" cy="90" r="15" fill={colors.background} className="animate-pulse-slow opacity-30 delay-500" />

      {/* Cloud */}
      <g className="animate-float">
        <path d="M70 100 C 50 100, 50 70, 80 70 C 90 50, 130 50, 140 70 C 170 70, 170 100, 150 100 Z"
              fill={colors.primary} />
      </g>

      {/* Disconnected Plug */}
      <g transform="translate(0, 5)">
        <line x1="90" y1="110" x2="70" y2="130" stroke={colors.secondary} strokeWidth="3" />
        <line x1="110" y1="110" x2="130" y2="130" stroke={colors.secondary} strokeWidth="3" />
        <rect x="65" y="128" width="10" height="5" fill={colors.secondary} />
        <rect x="125" y="128" width="10" height="5" fill={colors.secondary} />
      </g>
    </svg>
  ),
};

const EmptyStateIllustration = ({
  type,
  title,
  description,
  action,
  actionLabel,
}) => {
  const Illustration = illustrations[type];

  const colors = {
    primary: '#415A77',
    secondary: '#778DA9',
    accent: '#E0E1DD',
    background: '#1B263B',
    warning: '#FBBF24',
  };

  if (!Illustration) {
    console.warn(`[EmptyStateIllustration] Unknown type: ${type}`);
    return null;
  }

  return (
    <div className="text-center flex flex-col items-center justify-center p-8 max-w-sm mx-auto">
      <div className="w-48 h-40 mb-6">
        <Illustration colors={colors} />
      </div>

      {title && (
        <h2 className="text-xl font-display font-bold text-text-primary mb-2">
          {title}
        </h2>
      )}

      {description && (
        <p className="text-text-secondary mb-6 max-w-xs">
          {description}
        </p>
      )}

      {action && actionLabel && (
        <Button onClick={action} variant="secondary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyStateIllustration;
