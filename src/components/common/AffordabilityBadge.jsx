import React from 'react';
import { useWalletValidator } from '../../hooks/useWalletValidator';

/**
 * AffordabilityBadge Component
 *
 * Displays a compact badge indicating whether the user can afford a trade.
 * Shows different states based on authentication and wallet balance.
 *
 * Badge States:
 * - Green "Can Afford": User has sufficient ISK
 * - Red "Need X ISK": User doesn't have enough ISK (shows shortfall)
 * - Gray "Login to check": User is not authenticated
 * - Gray "Loading...": Wallet data is loading
 *
 * @param {Object} props
 * @param {number} props.cost - ISK amount required for the trade
 * @param {number|null} props.walletBalance - Current wallet balance
 * @param {boolean} [props.compact=false] - Use compact styling
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * // In a trading table row
 * <AffordabilityBadge
 *   cost={row['Buy Price']}
 *   walletBalance={walletBalance}
 *   compact={true}
 * />
 */
export function AffordabilityBadge({
  cost,
  walletBalance,
  compact = false,
  className = '',
}) {
  const { getAffordabilityStatus } = useWalletValidator();
  const status = getAffordabilityStatus(cost, walletBalance);

  // Badge styling based on status
  const statusStyles = {
    affordable: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    insufficient: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    unauthenticated: {
      bg: 'bg-gray-500/20',
      border: 'border-gray-500/30',
      text: 'text-text-secondary',
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    loading: {
      bg: 'bg-gray-500/20',
      border: 'border-gray-500/30',
      text: 'text-text-secondary',
      icon: (
        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ),
    },
  };

  const style = statusStyles[status.status] || statusStyles.unauthenticated;

  // Compact vs full styling
  const sizeClasses = compact
    ? 'px-1.5 py-0.5 text-xs gap-1'
    : 'px-2.5 py-1 text-sm gap-1.5';

  return (
    <div
      className={`
        inline-flex items-center
        ${sizeClasses}
        ${style.bg} ${style.border} ${style.text}
        border rounded-md font-medium
        transition-colors
        ${className}
      `}
      title={status.status === 'insufficient' ? `Shortfall: ${status.shortfall}` : status.message}
    >
      {style.icon}
      {!compact && <span>{status.message}</span>}
    </div>
  );
}

/**
 * AffordabilityIndicator Component
 *
 * A simpler visual indicator (colored dot) that takes up less space.
 * Useful for very compact table layouts.
 *
 * @param {Object} props
 * @param {number} props.cost - ISK amount required for the trade
 * @param {number|null} props.walletBalance - Current wallet balance
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * <AffordabilityIndicator
 *   cost={row['Buy Price']}
 *   walletBalance={walletBalance}
 * />
 */
export function AffordabilityIndicator({
  cost,
  walletBalance,
  className = '',
}) {
  const { getAffordabilityStatus } = useWalletValidator();
  const status = getAffordabilityStatus(cost, walletBalance);

  const colorMap = {
    affordable: 'bg-green-400',
    insufficient: 'bg-red-400',
    unauthenticated: 'bg-gray-400',
    loading: 'bg-gray-400',
  };

  const color = colorMap[status.status] || colorMap.unauthenticated;

  return (
    <div
      className={`
        w-2 h-2 rounded-full
        ${color}
        ${status.status === 'loading' ? 'animate-pulse' : ''}
        ${className}
      `}
      title={status.message}
    />
  );
}

export default AffordabilityBadge;
