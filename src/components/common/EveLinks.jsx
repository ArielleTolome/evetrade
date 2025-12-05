import { useState, useRef, useEffect } from 'react';

/**
 * EVE Online Protocol Link Components
 * These links use the eve:// protocol to open in-game windows directly
 *
 * Supported protocols:
 * - eve://market/{regionId}/{typeId} - Opens market window for item
 * - eve://showinfo/{typeId} - Shows item information
 * - eve://showinfo/{typeId}/{itemId} - Shows specific item/character info
 * - eve://client/setDestination?destination_id={locationId} - Sets autopilot destination
 */

/**
 * Opens the in-game market window for a specific item
 */
export function EveMarketLink({ typeId, regionId = 10000002, children, className = '' }) {
  // Default region is The Forge (Jita's region)
  const href = `eve://market/${regionId}/${typeId}`;

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 text-accent-cyan hover:text-accent-cyan/80 transition-colors ${className}`}
      title="Open in EVE Market"
    >
      {children || (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs">Market</span>
        </>
      )}
    </a>
  );
}

/**
 * Opens the in-game item info window
 */
export function EveShowInfoLink({ typeId, children, className = '' }) {
  const href = `eve://showinfo/${typeId}`;

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 text-accent-cyan hover:text-accent-cyan/80 transition-colors ${className}`}
      title="Show Item Info in EVE"
    >
      {children || (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">Info</span>
        </>
      )}
    </a>
  );
}

/**
 * Sets the autopilot destination to a specific location
 */
export function EveSetDestinationLink({ locationId, children, className = '' }) {
  const href = `eve://client/setDestination?destination_id=${locationId}`;

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 text-green-400 hover:text-green-400/80 transition-colors ${className}`}
      title="Set Destination in EVE"
    >
      {children || (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs">Set Dest</span>
        </>
      )}
    </a>
  );
}

/**
 * Adds a waypoint to the autopilot route
 */
export function EveAddWaypointLink({ locationId, children, className = '' }) {
  const href = `eve://client/addWaypoint?destination_id=${locationId}`;

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-400/80 transition-colors ${className}`}
      title="Add Waypoint in EVE"
    >
      {children || (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs">Waypoint</span>
        </>
      )}
    </a>
  );
}

/**
 * Dropdown menu with all EVE link options for a trade item
 */
export function EveLinksDropdown({
  typeId,
  regionId = 10000002,
  stationId = null,
  fromStationId = null,
  toStationId = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 px-2 py-1.5 bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 rounded-lg transition-colors text-xs font-medium"
        title="Open in EVE Online"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span>EVE</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-space-dark border border-accent-cyan/20 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            {/* Market Link */}
            <a
              href={`eve://market/${regionId}/${typeId}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-accent-cyan/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>View in Market</span>
            </a>

            {/* Show Info Link */}
            <a
              href={`eve://showinfo/${typeId}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-accent-cyan/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Show Item Info</span>
            </a>

            {/* Divider if station links available */}
            {(stationId || fromStationId || toStationId) && (
              <div className="border-t border-accent-cyan/10 my-1" />
            )}

            {/* Single station destination */}
            {stationId && (
              <a
                href={`eve://client/setDestination?destination_id=${stationId}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-green-500/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Set Destination</span>
              </a>
            )}

            {/* Hauling route - From station */}
            {fromStationId && (
              <a
                href={`eve://client/setDestination?destination_id=${fromStationId}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-green-500/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Go to Buy Station</span>
              </a>
            )}

            {/* Hauling route - To station as waypoint */}
            {toStationId && fromStationId && (
              <a
                href={`eve://client/addWaypoint?destination_id=${toStationId}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-yellow-500/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Sell Station</span>
              </a>
            )}

            {/* Direct to destination (sell station only) */}
            {toStationId && !fromStationId && (
              <a
                href={`eve://client/setDestination?destination_id=${toStationId}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-green-500/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Go to Sell Station</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline EVE links for tight spaces
 */
export function EveLinksInline({ typeId, regionId = 10000002, stationId = null }) {
  return (
    <div className="flex items-center gap-1">
      <a
        href={`eve://market/${regionId}/${typeId}`}
        className="p-1 text-accent-cyan hover:text-accent-cyan/80 hover:bg-accent-cyan/10 rounded transition-colors"
        title="View in Market"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </a>
      <a
        href={`eve://showinfo/${typeId}`}
        className="p-1 text-accent-cyan hover:text-accent-cyan/80 hover:bg-accent-cyan/10 rounded transition-colors"
        title="Show Info"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </a>
      {stationId && (
        <a
          href={`eve://client/setDestination?destination_id=${stationId}`}
          className="p-1 text-green-400 hover:text-green-400/80 hover:bg-green-400/10 rounded transition-colors"
          title="Set Destination"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default EveLinksDropdown;
