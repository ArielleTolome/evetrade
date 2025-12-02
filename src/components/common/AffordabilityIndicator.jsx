import { useMemo } from 'react';
import { formatISK } from '../../utils/formatters';

/**
 * Affordability Indicator Components
 * Shows whether a trade is affordable based on wallet balance
 */

/**
 * Calculate affordability status
 * @param {number} cost - Cost of the trade (buy price * quantity)
 * @param {number} walletBalance - Current wallet balance
 * @returns {Object} Affordability status
 */
export function calculateAffordability(cost, walletBalance) {
  if (walletBalance === null || walletBalance === undefined) {
    return { status: 'unknown', canAfford: null, shortfall: 0, percentage: 0 };
  }

  const canAfford = walletBalance >= cost;
  const shortfall = canAfford ? 0 : cost - walletBalance;
  const percentage = cost > 0 ? Math.min(100, (walletBalance / cost) * 100) : 100;

  let status;
  if (canAfford) {
    if (percentage > 200) {
      status = 'comfortable'; // Can afford 2x+
    } else if (percentage > 120) {
      status = 'affordable';  // Can afford with buffer
    } else {
      status = 'tight';       // Can barely afford
    }
  } else {
    if (percentage >= 75) {
      status = 'close';       // Almost there
    } else if (percentage >= 50) {
      status = 'partial';     // Have half
    } else {
      status = 'unaffordable'; // Far from affording
    }
  }

  return { status, canAfford, shortfall, percentage };
}

/**
 * Compact affordability badge for table rows
 */
export function AffordabilityBadge({ cost, walletBalance, className = '' }) {
  const { status, canAfford, shortfall, percentage } = useMemo(
    () => calculateAffordability(cost, walletBalance),
    [cost, walletBalance]
  );

  if (status === 'unknown') {
    return null;
  }

  const config = {
    comfortable: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      label: 'Affordable',
    },
    affordable: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      label: 'OK',
    },
    tight: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      label: 'Tight',
    },
    close: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      label: `Need ${formatISK(shortfall, false)}`,
    },
    partial: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      label: `Need ${formatISK(shortfall, false)}`,
    },
    unaffordable: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      label: `Need ${formatISK(shortfall, false)}`,
    },
  };

  const { icon, bg, text, label } = config[status];

  return (
    <div className={`group relative inline-flex ${className}`}>
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
        {icon}
        <span className="hidden sm:inline">{canAfford ? 'OK' : label}</span>
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        <div className="bg-space-dark border border-accent-cyan/20 rounded-lg p-2 shadow-xl min-w-40 text-center">
          <div className={`text-sm font-medium ${text}`}>
            {canAfford ? 'You can afford this' : 'Insufficient funds'}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {canAfford
              ? `${formatISK(walletBalance - cost, false)} remaining after`
              : `Need ${formatISK(shortfall, false)} more`
            }
          </div>
          <div className="mt-2 h-1.5 bg-space-dark rounded-full overflow-hidden">
            <div
              className={`h-full ${canAfford ? 'bg-green-400' : 'bg-red-400'}`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {percentage.toFixed(0)}% of cost
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline affordability text
 */
export function AffordabilityText({ cost, walletBalance, className = '' }) {
  const { status, canAfford, shortfall } = useMemo(
    () => calculateAffordability(cost, walletBalance),
    [cost, walletBalance]
  );

  if (status === 'unknown') {
    return <span className={`text-text-secondary ${className}`}>Login to check</span>;
  }

  if (canAfford) {
    return (
      <span className={`text-green-400 ${className}`}>
        Affordable
      </span>
    );
  }

  return (
    <span className={`text-red-400 ${className}`}>
      Need {formatISK(shortfall, false)}
    </span>
  );
}

/**
 * Full affordability card for detailed view
 */
export function AffordabilityCard({
  cost,
  walletBalance,
  itemName = 'this trade',
  quantity = 1,
  className = '',
}) {
  const { status, canAfford, shortfall, percentage } = useMemo(
    () => calculateAffordability(cost, walletBalance),
    [cost, walletBalance]
  );

  if (status === 'unknown') {
    return (
      <div className={`bg-space-dark/50 border border-accent-cyan/20 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-sm text-text-secondary">Login with EVE to check affordability</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${canAfford ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {canAfford ? (
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div>
          <div className={`text-lg font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
            {canAfford ? 'Affordable' : 'Insufficient Funds'}
          </div>
          <div className="text-xs text-text-secondary">
            {canAfford
              ? `You can buy ${itemName}`
              : `You need ${formatISK(shortfall, false)} more`
            }
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-space-dark rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${canAfford ? 'bg-green-400' : 'bg-red-400'}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-text-secondary">{percentage.toFixed(0)}% funded</span>
          <span className="text-text-secondary">{formatISK(cost, false)} needed</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Your Wallet:</span>
          <span className="text-accent-gold font-mono">{formatISK(walletBalance, false)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Trade Cost:</span>
          <span className="text-text-primary font-mono">{formatISK(cost, false)}</span>
        </div>
        {canAfford && (
          <div className="flex justify-between border-t border-white/10 pt-2">
            <span className="text-text-secondary">Remaining After:</span>
            <span className="text-green-400 font-mono">{formatISK(walletBalance - cost, false)}</span>
          </div>
        )}
        {!canAfford && (
          <div className="flex justify-between border-t border-white/10 pt-2">
            <span className="text-text-secondary">Shortfall:</span>
            <span className="text-red-400 font-mono">{formatISK(shortfall, false)}</span>
          </div>
        )}
      </div>

      {/* Max Affordable Quantity */}
      {quantity > 1 && !canAfford && (
        <div className="mt-3 p-2 bg-space-dark/50 rounded text-xs">
          <span className="text-text-secondary">You can afford up to </span>
          <span className="text-accent-cyan font-bold">
            {Math.floor(walletBalance / (cost / quantity))}
          </span>
          <span className="text-text-secondary"> units</span>
        </div>
      )}
    </div>
  );
}

/**
 * Row opacity wrapper - grays out unaffordable trades
 */
export function AffordableRow({ cost, walletBalance, children, className = '' }) {
  const { canAfford } = useMemo(
    () => calculateAffordability(cost, walletBalance),
    [cost, walletBalance]
  );

  // If wallet balance is unknown or trade is affordable, render normally
  if (walletBalance === null || walletBalance === undefined || canAfford) {
    return <div className={className}>{children}</div>;
  }

  // Gray out unaffordable trades
  return (
    <div className={`opacity-50 ${className}`}>
      {children}
    </div>
  );
}

export default AffordabilityBadge;
