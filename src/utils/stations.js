/**
 * Roman numeral pattern for system name detection
 * @description Regular expression that matches valid Roman numerals from I to MMMCMXCIX (1-3999)
 * Used to identify planet/moon designations in EVE Online station names
 * @type {RegExp}
 * @private
 */
const ROMAN_NUMERAL_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;

/**
 * Normalize a station name to match universeList keys
 * @description Converts station names to lowercase and removes citadel markers (*)
 * to ensure consistent lookups in the universeList object. The universeList uses
 * lowercase station names as keys.
 * @param {string} stationName - Station name to normalize (may include citadel marker)
 * @returns {string} Normalized key for universeList lookup (lowercase, no asterisk)
 * @example
 * normalizeStationKey('Jita IV - Moon 4 - Caldari Navy Assembly Plant')
 * // returns 'jita iv - moon 4 - caldari navy assembly plant'
 * @example
 * normalizeStationKey('My Citadel*')
 * // returns 'my citadel'
 */
export function normalizeStationKey(stationName) {
  if (!stationName) return '';
  // Remove citadel marker and convert to lowercase
  return stationName.toLowerCase().replace(/\*$/, '');
}

/**
 * Look up station data from universeList with normalized key
 * @description Attempts to find station data using exact match first, then falls back
 * to normalized (lowercase) key lookup. Returns station metadata including region,
 * station, and system IDs.
 * @param {string} stationName - Station name to look up
 * @param {Object.<string, {region: number, station: number, system: number, security: number}>} universeList - Universe data mapping station names to IDs
 * @returns {{region: number, station: number, system: number, security: number}|null} Station data object or null if not found
 * @example
 * getStationData('Jita IV - Moon 4 - Caldari Navy Assembly Plant', universeList)
 * // returns { region: 10000002, station: 60003760, system: 30000142, security: 0.95 }
 */
export function getStationData(stationName, universeList) {
  if (!stationName || !universeList) return null;

  // Try exact match first
  let data = universeList[stationName];

  // If not found, try normalized key (lowercase)
  if (!data) {
    const normalizedKey = normalizeStationKey(stationName);
    data = universeList[normalizedKey];
  }

  return data || null;
}

/**
 * Get region data from universeList by region name
 * @description Performs multiple lookup strategies to find region data:
 * 1. Exact match on region name
 * 2. Lowercase normalized match
 * 3. Searches all entries for matching regionName property
 * 4. Searches for key matching region name (case-insensitive)
 * @param {string} regionName - Region name to look up (e.g., 'The Forge', 'Metropolis')
 * @param {Object.<string, {region?: number, regionName?: string}>} universeList - Universe data
 * @returns {{region: number, regionName: string}|null} Region data with region ID, or null if not found
 * @example
 * getRegionData('The Forge', universeList)
 * // returns { region: 10000002, regionName: 'The Forge' }
 */
export function getRegionData(regionName, universeList) {
  if (!regionName || !universeList) return null;

  // Normalize the region name to lowercase for lookup
  const normalizedKey = regionName.toLowerCase();

  // Try exact match first
  let data = universeList[regionName];

  // Try lowercase match
  if (!data) {
    data = universeList[normalizedKey];
  }

  // If still not found, search all entries for matching regionName
  if (!data) {
    for (const [key, value] of Object.entries(universeList)) {
      if (value.regionName && value.regionName.toLowerCase() === normalizedKey) {
        return value;
      }
      // Also check if the key matches the region name (case-insensitive)
      if (key.toLowerCase() === normalizedKey && value.region) {
        return value;
      }
    }
  }

  return data || null;
}

/**
 * Check if a string is a Roman numeral
 * @description Tests whether a string represents a valid Roman numeral (I-MMMCMXCIX).
 * Used to identify planet/moon designations in EVE Online station names.
 * @param {string} str - String to check
 * @returns {boolean} True if the string is a valid Roman numeral, false otherwise
 * @example
 * isRomanNumeral('IV')  // returns true
 * isRomanNumeral('42')  // returns false
 * isRomanNumeral('XL')  // returns true
 */
export function isRomanNumeral(str) {
  if (!str) return false;
  return ROMAN_NUMERAL_PATTERN.test(str.trim());
}

/**
 * Extract system name from a station name
 * @description Parses EVE Online station names to extract the solar system name.
 * Station names typically follow these formats:
 * - "System Name - Station Type - Specific Name"
 * - "System Name Planet Moon - Station Type"
 * The function removes planet/moon designations (Roman numerals and numbers) to isolate
 * the system name.
 * @param {string} stationName - Full station name to parse
 * @returns {string} Extracted system name without planet/moon designations
 * @example
 * getSystemFromStation('Jita IV - Moon 4 - Caldari Navy Assembly Plant')
 * // returns 'Jita'
 * @example
 * getSystemFromStation('Amarr VIII (Oris) - Emperor Family Academy')
 * // returns 'Amarr'
 * @example
 * getSystemFromStation('Perimeter - IChooseYou Market and Industry')
 * // returns 'Perimeter'
 */
export function getSystemFromStation(stationName) {
  if (!stationName) return '';

  // Remove citadel marker if present
  const cleanName = stationName.replace(/\*$/, '');

  // Split by " - " delimiter
  const parts = cleanName.split(' - ');
  if (parts.length < 2) return cleanName;

  // First part usually contains system name
  const firstPart = parts[0].trim();
  const words = firstPart.split(' ');

  // Find where the system name ends (before planet/moon numbers)
  let systemWords = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Roman numerals indicate planet/moon
    if (isRomanNumeral(word)) {
      break;
    }

    // Pure numbers with optional suffixes indicate moon/planet
    if (/^\d+$/.test(word)) {
      break;
    }

    systemWords.push(word);
  }

  return systemWords.join(' ') || firstPart;
}

/**
 * Parse station/system selection into API format
 * @description Converts a location name (station or system) into structured data
 * required for API calls. Looks up the location in the universe data and returns
 * region, station, system IDs, and security status.
 * @param {string} location - Location name (station or system)
 * @param {Object.<string, {region: number, station: number, system: number, security: number}>} universeList - Universe data with region/station IDs
 * @returns {{regionId: number, stationId: number, systemId: number, security: number}|null} Parsed location data or null if not found
 * @example
 * parseLocation('Jita IV - Moon 4 - Caldari Navy Assembly Plant', universeList)
 * // returns { regionId: 10000002, stationId: 60003760, systemId: 30000142, security: 0.95 }
 */
export function parseLocation(location, universeList) {
  if (!location || !universeList) return null;

  const data = getStationData(location, universeList);
  if (!data) return null;

  return {
    regionId: data.region,
    stationId: data.station,
    systemId: data.system,
    security: data.security,
  };
}

/**
 * Build location string for API query
 * @description Constructs a location string in the format used by the EVETrade API.
 * Format: "[preference-]regionId:stationId"
 * The preference prefix ('buy' or 'sell') is optional.
 * @param {number} regionId - Region ID from EVE Online universe data
 * @param {number} stationId - Station ID from EVE Online universe data
 * @param {string} [preference=''] - Trade preference ('buy' or 'sell'), optional
 * @returns {string} Formatted location string for API query
 * @example
 * buildLocationString(10000002, 60003760, 'buy')
 * // returns 'buy-10000002:60003760'
 * @example
 * buildLocationString(10000002, 60003760)
 * // returns '10000002:60003760'
 */
export function buildLocationString(regionId, stationId, preference = '') {
  const prefix = preference ? `${preference}-` : '';
  return `${prefix}${regionId}:${stationId}`;
}

/**
 * Parse location string from API format
 * @description Deconstructs a location string from the API format back into its components.
 * Handles strings with or without preference prefix.
 * @param {string} locationStr - Location string in format "[preference-]regionId:stationId"
 * @returns {{preference: string, regionId: number, stationId: number}|null} Parsed components or null if invalid
 * @example
 * parseLocationString('buy-10000002:60003760')
 * // returns { preference: 'buy', regionId: 10000002, stationId: 60003760 }
 * @example
 * parseLocationString('10000002:60003760')
 * // returns { preference: '', regionId: 10000002, stationId: 60003760 }
 */
export function parseLocationString(locationStr) {
  if (!locationStr) return null;

  let preference = '';
  let rest = locationStr;

  // Check for preference prefix
  if (locationStr.startsWith('buy-')) {
    preference = 'buy';
    rest = locationStr.slice(4);
  } else if (locationStr.startsWith('sell-')) {
    preference = 'sell';
    rest = locationStr.slice(5);
  }

  const [regionId, stationId] = rest.split(':').map(Number);

  if (isNaN(regionId) || isNaN(stationId)) {
    return null;
  }

  return {
    preference,
    regionId,
    stationId,
  };
}

/**
 * Get all stations in a system
 * @description Filters the complete station list to return only stations located in
 * the specified solar system.
 * @param {string} systemName - Name of the solar system
 * @param {Object.<string, {region: number, station: number, system: number}>} universeList - Universe data
 * @param {string[]} stationList - Complete list of all station names
 * @returns {string[]} Array of station names in the specified system
 * @example
 * getStationsInSystem('Jita', universeList, stationList)
 * // returns ['Jita IV - Moon 4 - Caldari Navy Assembly Plant', 'Jita IV - Moon 5 - ...', ...]
 */
export function getStationsInSystem(systemName, universeList, stationList) {
  if (!systemName || !universeList || !stationList) return [];

  return stationList.filter((station) => {
    const stationSystem = getSystemFromStation(station);
    return stationSystem === systemName;
  });
}

/**
 * Check if all stations in a system are selected
 * @description Determines whether every station in a given system is present in the
 * selected stations array. Useful for UI optimization where entire systems can be
 * represented as a single entity.
 * @param {string[]} selectedStations - Currently selected station names
 * @param {string} systemName - System name to check
 * @param {Object.<string, {region: number, station: number, system: number}>} universeList - Universe data
 * @param {string[]} stationList - Complete list of all station names
 * @returns {boolean} True if all stations in the system are selected, false otherwise
 * @example
 * isEntireSystemSelected(['Jita IV - Moon 4 - ...', 'Jita IV - Moon 5 - ...'], 'Jita', universeList, stationList)
 * // returns true if these are all stations in Jita, false otherwise
 */
export function isEntireSystemSelected(selectedStations, systemName, universeList, stationList) {
  const systemStations = getStationsInSystem(systemName, universeList, stationList);
  if (systemStations.length === 0) return false;

  return systemStations.every((station) => selectedStations.includes(station));
}

/**
 * Collapse individual stations to system if all are selected
 * @description Optimizes a list of selected locations by replacing complete sets of
 * stations with their parent system. This reduces API query complexity and improves
 * performance when users select all stations in a system.
 *
 * The function:
 * 1. Groups stations by their parent system
 * 2. Checks if all stations in each system are selected
 * 3. Replaces complete station sets with a single system entry
 * 4. Preserves individual stations for incomplete selections
 * @param {string[]} locations - Array of selected location names (stations)
 * @param {Object.<string, {region: number, station: number, system: number}>} universeList - Universe data
 * @param {string[]} stationList - Complete list of all station names
 * @returns {Array<{type: 'system'|'station', name: string, regionId: number, systemId?: number, stationId?: number}>} Optimized array with systems replacing complete station sets
 * @example
 * collapseToSystems(
 *   ['Jita IV - Moon 4 - ...', 'Jita IV - Moon 5 - ...', 'Amarr VIII - ...'],
 *   universeList,
 *   stationList
 * )
 * // returns [
 * //   { type: 'system', name: 'Jita', regionId: 10000002, systemId: 30000142 },
 * //   { type: 'station', name: 'Amarr VIII - ...', regionId: 10000043, stationId: 60008494 }
 * // ]
 */
export function collapseToSystems(locations, universeList, stationList) {
  if (!locations || !Array.isArray(locations)) {
    return [];
  }

  // Group by system
  const systemGroups = {};

  locations.forEach((loc) => {
    const system = getSystemFromStation(loc);
    if (!systemGroups[system]) {
      systemGroups[system] = [];
    }
    systemGroups[system].push(loc);
  });

  const result = [];

  Object.entries(systemGroups).forEach(([system, stations]) => {
    const allSystemStations = getStationsInSystem(system, universeList, stationList);

    // If all stations in system are selected, use system instead
    if (allSystemStations.length === stations.length &&
        allSystemStations.every((s) => stations.includes(s))) {
      // Use first station's region and system ID
      const data = getStationData(stations[0], universeList);
      if (data) {
        result.push({
          type: 'system',
          name: system,
          regionId: data.region,
          systemId: data.system,
        });
      }
    } else {
      // Keep individual stations
      stations.forEach((station) => {
        const data = getStationData(station, universeList);
        if (data) {
          result.push({
            type: 'station',
            name: station,
            regionId: data.region,
            stationId: data.station,
          });
        }
      });
    }
  });

  return result;
}
