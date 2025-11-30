/**
 * Roman numeral pattern for system name detection
 */
const ROMAN_NUMERAL_PATTERN = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;

/**
 * Check if a string is a Roman numeral
 * @param {string} str - String to check
 * @returns {boolean}
 */
export function isRomanNumeral(str) {
  if (!str) return false;
  return ROMAN_NUMERAL_PATTERN.test(str.trim());
}

/**
 * Extract system name from a station name
 * EVE station names typically follow format: "System Name - Station Type - Specific Name"
 * or "System Name Planet Moon - Station Type"
 * @param {string} stationName - Full station name
 * @returns {string} System name
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
 * @param {string} location - Location name (station or system)
 * @param {object} universeList - Universe data with region/station IDs
 * @returns {object|null} Object with regionId and stationId, or null if not found
 */
export function parseLocation(location, universeList) {
  if (!location || !universeList) return null;

  const data = universeList[location];
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
 * @param {number} regionId - Region ID
 * @param {number} stationId - Station ID
 * @param {string} preference - Trade preference ('buy' or 'sell')
 * @returns {string} Location string for API
 */
export function buildLocationString(regionId, stationId, preference = '') {
  const prefix = preference ? `${preference}-` : '';
  return `${prefix}${regionId}:${stationId}`;
}

/**
 * Parse location string from API format
 * @param {string} locationStr - Location string (e.g., "buy-10000002:60003760")
 * @returns {object} Parsed location with preference, regionId, stationId
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

  return {
    preference,
    regionId,
    stationId,
  };
}

/**
 * Get all stations in a system
 * @param {string} systemName - Name of the system
 * @param {object} universeList - Universe data
 * @param {array} stationList - List of all stations
 * @returns {array} Array of station names in the system
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
 * @param {array} selectedStations - Currently selected station names
 * @param {string} systemName - System name to check
 * @param {object} universeList - Universe data
 * @param {array} stationList - List of all stations
 * @returns {boolean}
 */
export function isEntireSystemSelected(selectedStations, systemName, universeList, stationList) {
  const systemStations = getStationsInSystem(systemName, universeList, stationList);
  if (systemStations.length === 0) return false;

  return systemStations.every((station) => selectedStations.includes(station));
}

/**
 * Collapse individual stations to system if all are selected
 * @param {array} locations - Array of selected locations
 * @param {object} universeList - Universe data
 * @param {array} stationList - List of all stations
 * @returns {array} Optimized array with systems replacing full station sets
 */
export function collapseToSystems(locations, universeList, stationList) {
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
      const data = universeList[stations[0]];
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
        const data = universeList[station];
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
