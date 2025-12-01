import { getSecurityLevel, formatSecurityStatus } from '@utils/security';
import { SECURITY_COLORS } from '@utils/constants';

/**
 * Security Badge Component
 * Displays security status with EVE-accurate coloring
 */
export function SecurityBadge({
  security,
  isCitadel = false,
  showLabel = true,
  size = 'sm',
}) {
  const level = getSecurityLevel(security);
  const colors = SECURITY_COLORS[level] || SECURITY_COLORS[0];

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        ${sizeClasses[size]}
        rounded-full font-mono font-medium
        ${colors.bg} text-space-black
        ${isCitadel ? 'ring-2 ring-accent-gold ring-offset-1 ring-offset-space-dark dark:ring-offset-space-dark ring-offset-white' : ''}
      `}
      title={`Security: ${formatSecurityStatus(security)}${isCitadel ? ' (Player Structure)' : ''}`}
    >
      {showLabel && formatSecurityStatus(security)}
      {isCitadel && <span className="text-[10px]">★</span>}
    </span>
  );
}

/**
 * Inline Security Text
 * For use in tables or inline content
 */
export function SecurityText({ security, className = '' }) {
  const level = getSecurityLevel(security);
  const colors = SECURITY_COLORS[level] || SECURITY_COLORS[0];

  return (
    <span className={`font-mono ${colors.text} ${className}`}>
      {formatSecurityStatus(security)}
    </span>
  );
}

export default SecurityBadge;
