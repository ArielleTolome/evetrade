import { useState } from 'react';
import { Button } from './Button';
import { Toast } from './Toast';
import {
  openMarketDetails,
  showItemInfo,
  setDestination,
  copyToClipboardWithFeedback,
} from '../../utils/eveLinks';

/**
 * EveActionButtons Component
 * Provides quick action buttons for EVE Online integration
 * - Open market details in EVE client
 * - Show item info in EVE client
 * - Set autopilot destination
 * - Copy item name to clipboard
 *
 * @param {object} props
 * @param {number} props.typeId - Item type ID (required for market/info actions)
 * @param {string} props.typeName - Item name for copy action
 * @param {number} [props.solarSystemId] - Solar system ID for destination actions
 * @param {number} [props.stationId] - Station ID (currently unused but reserved for future features)
 * @param {function} [props.onCopy] - Callback when copy succeeds
 * @param {boolean} [props.compact=false] - Use smaller button variant
 * @param {string} [props.className] - Additional CSS classes
 */
export function EveActionButtons({
  typeId,
  typeName,
  solarSystemId,
  stationId,
  onCopy,
  compact = false,
  className = '',
}) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const handleOpenMarket = () => {
    try {
      openMarketDetails(typeId);
      showToast('Opening market details in EVE...', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to open EVE client', 'error');
    }
  };

  const handleShowInfo = () => {
    try {
      showItemInfo(typeId);
      showToast('Opening item info in EVE...', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to open EVE client', 'error');
    }
  };

  const handleSetDestination = () => {
    if (!solarSystemId) {
      showToast('No destination available for this item', 'warning');
      return;
    }

    try {
      setDestination(solarSystemId);
      showToast('Destination set in EVE...', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to set destination', 'error');
    }
  };

  const handleCopyName = () => {
    if (!typeName) {
      showToast('No item name to copy', 'warning');
      return;
    }

    copyToClipboardWithFeedback(
      typeName,
      () => {
        showToast(`Copied "${typeName}" to clipboard`, 'success');
        if (onCopy) onCopy(typeName);
      },
      (error) => {
        showToast('Failed to copy to clipboard', 'error');
        console.error('Copy error:', error);
      }
    );
  };

  const buttonSize = compact ? 'sm' : 'md';
  const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {/* Open in EVE (Market) */}
        {typeId && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={handleOpenMarket}
            className="group relative"
            title="Open market details in EVE Online"
            aria-label="Open market details in EVE Online"
          >
            <svg
              className={`${iconSize} text-text-secondary group-hover:text-accent-cyan transition-colors`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-space-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Market Details
            </span>
          </Button>
        )}

        {/* Show Item Info */}
        {typeId && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={handleShowInfo}
            className="group relative"
            title="Show item information in EVE Online"
            aria-label="Show item information in EVE Online"
          >
            <svg
              className={`${iconSize} text-text-secondary group-hover:text-accent-purple transition-colors`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-space-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Item Info
            </span>
          </Button>
        )}

        {/* Set Destination */}
        {solarSystemId && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={handleSetDestination}
            className="group relative"
            title="Set autopilot destination in EVE Online"
            aria-label="Set autopilot destination in EVE Online"
          >
            <svg
              className={`${iconSize} text-text-secondary group-hover:text-accent-gold transition-colors`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-space-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Set Destination
            </span>
          </Button>
        )}

        {/* Copy Item Name */}
        {typeName && (
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={handleCopyName}
            className="group relative"
            title="Copy item name to clipboard"
            aria-label="Copy item name to clipboard"
          >
            <svg
              className={`${iconSize} text-text-secondary group-hover:text-accent-green transition-colors`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-space-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Copy Name
            </span>
          </Button>
        )}
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </>
  );
}

/**
 * Compact variant of EveActionButtons
 * Convenience wrapper for compact={true}
 */
export function EveActionButtonsCompact(props) {
  return <EveActionButtons {...props} compact={true} />;
}

export default EveActionButtons;
