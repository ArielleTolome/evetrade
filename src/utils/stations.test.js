import { describe, it, expect } from 'vitest';
import {
  normalizeStationKey,
  getStationData,
  getRegionData,
  isRomanNumeral,
  getSystemFromStation,
  parseLocation,
  buildLocationString,
  parseLocationString,
  getStationsInSystem,
  isEntireSystemSelected,
  collapseToSystems,
} from './stations';

describe('normalizeStationKey', () => {
  it('converts station name to lowercase', () => {
    expect(normalizeStationKey('Jita IV - Moon 4')).toBe('jita iv - moon 4');
    expect(normalizeStationKey('AMARR VIII')).toBe('amarr viii');
  });

  it('removes trailing asterisk from citadel names', () => {
    expect(normalizeStationKey('Player Citadel*')).toBe('player citadel');
    expect(normalizeStationKey('Some Fortizar*')).toBe('some fortizar');
  });

  it('handles both lowercase conversion and asterisk removal', () => {
    expect(normalizeStationKey('PLAYER STATION*')).toBe('player station');
  });

  it('handles empty string', () => {
    expect(normalizeStationKey('')).toBe('');
  });

  it('handles null/undefined', () => {
    expect(normalizeStationKey(null)).toBe('');
    expect(normalizeStationKey(undefined)).toBe('');
  });
});

describe('getStationData', () => {
  const mockUniverseList = {
    'jita iv - moon 4 - caldari navy assembly plant': {
      station: 60003760,
      system: 30000142,
      region: 10000002,
      security: 0.946,
    },
    'amarr viii (oris) - emperor family academy': {
      station: 60008494,
      system: 30002187,
      region: 10000043,
      security: 1.0,
    },
    'player citadel': {
      station: 1234567890,
      system: 30000001,
      region: 10000001,
      security: 0.5,
    },
  };

  it('finds station by exact match', () => {
    const result = getStationData('jita iv - moon 4 - caldari navy assembly plant', mockUniverseList);
    expect(result).toEqual({
      station: 60003760,
      system: 30000142,
      region: 10000002,
      security: 0.946,
    });
  });

  it('finds station by normalized key (case-insensitive)', () => {
    const result = getStationData('Jita IV - Moon 4 - Caldari Navy Assembly Plant', mockUniverseList);
    expect(result).toEqual({
      station: 60003760,
      system: 30000142,
      region: 10000002,
      security: 0.946,
    });
  });

  it('finds station after removing citadel marker', () => {
    const result = getStationData('Player Citadel*', mockUniverseList);
    expect(result).toEqual({
      station: 1234567890,
      system: 30000001,
      region: 10000001,
      security: 0.5,
    });
  });

  it('returns null for non-existent station', () => {
    expect(getStationData('Nonexistent Station', mockUniverseList)).toBeNull();
  });

  it('returns null for empty station name', () => {
    expect(getStationData('', mockUniverseList)).toBeNull();
  });

  it('returns null for null/undefined station name', () => {
    expect(getStationData(null, mockUniverseList)).toBeNull();
    expect(getStationData(undefined, mockUniverseList)).toBeNull();
  });

  it('returns null for null/undefined universeList', () => {
    expect(getStationData('Some Station', null)).toBeNull();
    expect(getStationData('Some Station', undefined)).toBeNull();
  });
});

describe('getRegionData', () => {
  const mockUniverseList = {
    'the forge': {
      region: 10000002,
      regionName: 'The Forge',
    },
    'domain': {
      region: 10000043,
      regionName: 'Domain',
    },
    'jita iv - moon 4 - caldari navy assembly plant': {
      station: 60003760,
      system: 30000142,
      region: 10000002,
      regionName: 'The Forge',
    },
  };

  it('finds region by exact match', () => {
    const result = getRegionData('the forge', mockUniverseList);
    expect(result).toEqual({
      region: 10000002,
      regionName: 'The Forge',
    });
  });

  it('finds region by normalized key (case-insensitive)', () => {
    const result = getRegionData('The Forge', mockUniverseList);
    expect(result).toEqual({
      region: 10000002,
      regionName: 'The Forge',
    });
  });

  it('finds region by regionName property', () => {
    const result = getRegionData('Domain', mockUniverseList);
    expect(result).toEqual({
      region: 10000043,
      regionName: 'Domain',
    });
  });

  it('returns station data if region matches station entry', () => {
    const result = getRegionData('The Forge', mockUniverseList);
    expect(result).toBeDefined();
    expect(result.region).toBe(10000002);
  });

  it('returns null for non-existent region', () => {
    expect(getRegionData('Nonexistent Region', mockUniverseList)).toBeNull();
  });

  it('returns null for empty region name', () => {
    expect(getRegionData('', mockUniverseList)).toBeNull();
  });

  it('returns null for null/undefined region name', () => {
    expect(getRegionData(null, mockUniverseList)).toBeNull();
    expect(getRegionData(undefined, mockUniverseList)).toBeNull();
  });

  it('returns null for null/undefined universeList', () => {
    expect(getRegionData('Some Region', null)).toBeNull();
    expect(getRegionData('Some Region', undefined)).toBeNull();
  });
});

describe('isRomanNumeral', () => {
  it('recognizes valid Roman numerals', () => {
    expect(isRomanNumeral('I')).toBe(true);
    expect(isRomanNumeral('V')).toBe(true);
    expect(isRomanNumeral('X')).toBe(true);
    expect(isRomanNumeral('IV')).toBe(true);
    expect(isRomanNumeral('IX')).toBe(true);
    expect(isRomanNumeral('VIII')).toBe(true);
    expect(isRomanNumeral('XII')).toBe(true);
    expect(isRomanNumeral('XX')).toBe(true);
  });

  it('recognizes Roman numerals case-insensitively', () => {
    expect(isRomanNumeral('iv')).toBe(true);
    expect(isRomanNumeral('viii')).toBe(true);
    expect(isRomanNumeral('xii')).toBe(true);
  });

  it('handles whitespace', () => {
    expect(isRomanNumeral(' IV ')).toBe(true);
    expect(isRomanNumeral('  VIII  ')).toBe(true);
  });

  it('rejects invalid Roman numerals', () => {
    expect(isRomanNumeral('IIII')).toBe(false);
    expect(isRomanNumeral('VV')).toBe(false);
    expect(isRomanNumeral('ABC')).toBe(false);
  });

  it('rejects non-Roman numeral strings', () => {
    expect(isRomanNumeral('123')).toBe(false);
    expect(isRomanNumeral('Planet')).toBe(false);
    expect(isRomanNumeral('Moon')).toBe(false);
  });

  it('handles empty string', () => {
    expect(isRomanNumeral('')).toBe(false);
  });

  it('handles null/undefined', () => {
    expect(isRomanNumeral(null)).toBe(false);
    expect(isRomanNumeral(undefined)).toBe(false);
  });
});

describe('getSystemFromStation', () => {
  it('extracts system from standard NPC station format', () => {
    expect(getSystemFromStation('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBe('Jita');
    expect(getSystemFromStation('Amarr VIII (Oris) - Emperor Family Academy')).toBe('Amarr');
  });

  it('stops at Roman numerals indicating planets', () => {
    expect(getSystemFromStation('Perimeter VII - Moon 1 - Station')).toBe('Perimeter');
    expect(getSystemFromStation('Dodixie IX - Moon 20 - Station')).toBe('Dodixie');
  });

  it('stops at numeric moon/planet designations', () => {
    expect(getSystemFromStation('System 1 - Station Type')).toBe('System');
    expect(getSystemFromStation('TestSystem 5 - Other')).toBe('TestSystem');
  });

  it('handles multi-word system names', () => {
    expect(getSystemFromStation('New Caldari IV - Station')).toBe('New Caldari');
    expect(getSystemFromStation('Old Man Star I - Station')).toBe('Old Man Star');
  });

  it('removes citadel marker before processing', () => {
    expect(getSystemFromStation('Jita IV - Player Citadel*')).toBe('Jita');
    expect(getSystemFromStation('Perimeter - Some Fortizar*')).toBe('Perimeter');
  });

  it('handles station names without delimiters', () => {
    expect(getSystemFromStation('SimpleStation')).toBe('SimpleStation');
    expect(getSystemFromStation('Single')).toBe('Single');
  });

  it('returns first part when no planet/moon indicators', () => {
    expect(getSystemFromStation('System Name - Station Name - Other Info')).toBe('System Name');
  });

  it('handles empty string', () => {
    expect(getSystemFromStation('')).toBe('');
  });

  it('handles null/undefined', () => {
    expect(getSystemFromStation(null)).toBe('');
    expect(getSystemFromStation(undefined)).toBe('');
  });
});

describe('parseLocation', () => {
  const mockUniverseList = {
    'jita iv - moon 4 - caldari navy assembly plant': {
      station: 60003760,
      system: 30000142,
      region: 10000002,
      security: 0.946,
    },
  };

  it('parses location and returns region/station/system data', () => {
    const result = parseLocation('Jita IV - Moon 4 - Caldari Navy Assembly Plant', mockUniverseList);
    expect(result).toEqual({
      regionId: 10000002,
      stationId: 60003760,
      systemId: 30000142,
      security: 0.946,
    });
  });

  it('returns null for non-existent location', () => {
    expect(parseLocation('Nonexistent Station', mockUniverseList)).toBeNull();
  });

  it('returns null for empty location', () => {
    expect(parseLocation('', mockUniverseList)).toBeNull();
  });

  it('returns null for null/undefined location', () => {
    expect(parseLocation(null, mockUniverseList)).toBeNull();
    expect(parseLocation(undefined, mockUniverseList)).toBeNull();
  });

  it('returns null for null/undefined universeList', () => {
    expect(parseLocation('Some Station', null)).toBeNull();
    expect(parseLocation('Some Station', undefined)).toBeNull();
  });
});

describe('buildLocationString', () => {
  it('builds location string with region and station', () => {
    expect(buildLocationString(10000002, 60003760)).toBe('10000002:60003760');
  });

  it('builds location string with buy preference', () => {
    expect(buildLocationString(10000002, 60003760, 'buy')).toBe('buy-10000002:60003760');
  });

  it('builds location string with sell preference', () => {
    expect(buildLocationString(10000002, 60003760, 'sell')).toBe('sell-10000002:60003760');
  });

  it('handles empty preference as no prefix', () => {
    expect(buildLocationString(10000002, 60003760, '')).toBe('10000002:60003760');
  });

  it('handles numeric zero values', () => {
    expect(buildLocationString(0, 0)).toBe('0:0');
  });
});

describe('parseLocationString', () => {
  it('parses location string without preference', () => {
    const result = parseLocationString('10000002:60003760');
    expect(result).toEqual({
      preference: '',
      regionId: 10000002,
      stationId: 60003760,
    });
  });

  it('parses location string with buy preference', () => {
    const result = parseLocationString('buy-10000002:60003760');
    expect(result).toEqual({
      preference: 'buy',
      regionId: 10000002,
      stationId: 60003760,
    });
  });

  it('parses location string with sell preference', () => {
    const result = parseLocationString('sell-10000002:60003760');
    expect(result).toEqual({
      preference: 'sell',
      regionId: 10000002,
      stationId: 60003760,
    });
  });

  it('handles numeric zero values', () => {
    const result = parseLocationString('0:0');
    expect(result).toEqual({
      preference: '',
      regionId: 0,
      stationId: 0,
    });
  });

  it('returns null for empty string', () => {
    expect(parseLocationString('')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(parseLocationString(null)).toBeNull();
    expect(parseLocationString(undefined)).toBeNull();
  });
});

describe('getStationsInSystem', () => {
  const mockUniverseList = {
    'jita iv - moon 4 - caldari navy assembly plant': {
      station: 60003760,
      system: 30000142,
      region: 10000002,
    },
    'jita iv - moon 5 - caldari business tribunal bureau offices': {
      station: 60003762,
      system: 30000142,
      region: 10000002,
    },
    'amarr viii (oris) - emperor family academy': {
      station: 60008494,
      system: 30002187,
      region: 10000043,
    },
  };

  const mockStationList = [
    'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    'Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices',
    'Amarr VIII (Oris) - Emperor Family Academy',
  ];

  it('returns all stations in a system', () => {
    const result = getStationsInSystem('Jita', mockUniverseList, mockStationList);
    expect(result).toHaveLength(2);
    expect(result).toContain('Jita IV - Moon 4 - Caldari Navy Assembly Plant');
    expect(result).toContain('Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices');
  });

  it('returns single station for system with one station', () => {
    const result = getStationsInSystem('Amarr', mockUniverseList, mockStationList);
    expect(result).toHaveLength(1);
    expect(result).toContain('Amarr VIII (Oris) - Emperor Family Academy');
  });

  it('returns empty array for system with no stations', () => {
    const result = getStationsInSystem('Nonexistent', mockUniverseList, mockStationList);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty system name', () => {
    expect(getStationsInSystem('', mockUniverseList, mockStationList)).toEqual([]);
  });

  it('returns empty array for null/undefined inputs', () => {
    expect(getStationsInSystem(null, mockUniverseList, mockStationList)).toEqual([]);
    expect(getStationsInSystem('Jita', null, mockStationList)).toEqual([]);
    expect(getStationsInSystem('Jita', mockUniverseList, null)).toEqual([]);
  });
});

describe('isEntireSystemSelected', () => {
  const mockUniverseList = {
    'jita iv - moon 4 - caldari navy assembly plant': {
      station: 60003760,
      system: 30000142,
      region: 10000002,
    },
    'jita iv - moon 5 - caldari business tribunal bureau offices': {
      station: 60003762,
      system: 30000142,
      region: 10000002,
    },
  };

  const mockStationList = [
    'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    'Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices',
  ];

  it('returns true when all stations in system are selected', () => {
    const selected = [
      'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      'Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices',
    ];
    expect(isEntireSystemSelected(selected, 'Jita', mockUniverseList, mockStationList)).toBe(true);
  });

  it('returns false when only some stations are selected', () => {
    const selected = ['Jita IV - Moon 4 - Caldari Navy Assembly Plant'];
    expect(isEntireSystemSelected(selected, 'Jita', mockUniverseList, mockStationList)).toBe(false);
  });

  it('returns false when no stations are selected', () => {
    const selected = [];
    expect(isEntireSystemSelected(selected, 'Jita', mockUniverseList, mockStationList)).toBe(false);
  });

  it('returns false for system with no stations', () => {
    const selected = ['Some Station'];
    expect(isEntireSystemSelected(selected, 'Nonexistent', mockUniverseList, mockStationList)).toBe(false);
  });

  it('returns false when selected contains extra stations', () => {
    const selected = [
      'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      'Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices',
      'Some Other Station',
    ];
    expect(isEntireSystemSelected(selected, 'Jita', mockUniverseList, mockStationList)).toBe(true);
  });
});

describe('collapseToSystems', () => {
  const mockUniverseList = {
    'jita iv - moon 4 - caldari navy assembly plant': {
      station: 60003760,
      system: 30000142,
      region: 10000002,
    },
    'jita iv - moon 5 - caldari business tribunal bureau offices': {
      station: 60003762,
      system: 30000142,
      region: 10000002,
    },
    'amarr viii (oris) - emperor family academy': {
      station: 60008494,
      system: 30002187,
      region: 10000043,
    },
    'amarr viii (oris) - ministry of war': {
      station: 60008495,
      system: 30002187,
      region: 10000043,
    },
    'perimeter ii - moon 1 - caldari navy assembly plant': {
      station: 60014437,
      system: 30000144,
      region: 10000002,
    },
  };

  const mockStationList = [
    'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    'Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices',
    'Amarr VIII (Oris) - Emperor Family Academy',
    'Amarr VIII (Oris) - Ministry of War',
    'Perimeter II - Moon 1 - Caldari Navy Assembly Plant',
  ];

  it('collapses all stations in a system to system entry', () => {
    const locations = [
      'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      'Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices',
    ];
    const result = collapseToSystems(locations, mockUniverseList, mockStationList);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'system',
      name: 'Jita',
      regionId: 10000002,
      systemId: 30000142,
    });
  });

  it('keeps individual stations when not all system stations are selected', () => {
    const locations = ['Jita IV - Moon 4 - Caldari Navy Assembly Plant'];
    const result = collapseToSystems(locations, mockUniverseList, mockStationList);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'station',
      name: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      regionId: 10000002,
      stationId: 60003760,
    });
  });

  it('handles mix of complete systems and individual stations', () => {
    const locations = [
      'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
      'Jita IV - Moon 5 - Caldari Business Tribunal Bureau Offices',
      'Amarr VIII (Oris) - Emperor Family Academy',
    ];
    const result = collapseToSystems(locations, mockUniverseList, mockStationList);

    expect(result).toHaveLength(2);

    // Should have Jita as a system
    const jitaEntry = result.find(r => r.name === 'Jita');
    expect(jitaEntry).toEqual({
      type: 'system',
      name: 'Jita',
      regionId: 10000002,
      systemId: 30000142,
    });

    // Should have Amarr as individual station
    const amarrEntry = result.find(r => r.name === 'Amarr VIII (Oris) - Emperor Family Academy');
    expect(amarrEntry).toEqual({
      type: 'station',
      name: 'Amarr VIII (Oris) - Emperor Family Academy',
      regionId: 10000043,
      stationId: 60008494,
    });
  });

  it('returns empty array for empty input', () => {
    const result = collapseToSystems([], mockUniverseList, mockStationList);
    expect(result).toEqual([]);
  });

  it('handles locations not found in universeList', () => {
    const locations = ['Nonexistent Station'];
    const result = collapseToSystems(locations, mockUniverseList, mockStationList);
    expect(result).toEqual([]);
  });
});
