/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  production: '/api',
  development: '/api',
  local: '/api',
};

export const RESOURCE_ENDPOINT = 'https://evetrade.s3.amazonaws.com/resources/';

/**
 * Determine API endpoint based on hostname
 * Now using Vercel serverless functions for all environments
 */
export function getApiEndpoint() {
  return API_ENDPOINTS.production;
}

/**
 * Security Status Colors (EVE Online accurate)
 */
export const SECURITY_COLORS = {
  10: { bg: 'bg-sec-10', text: 'text-sec-10', hex: '#2fefef' },
  9: { bg: 'bg-sec-09', text: 'text-sec-09', hex: '#48f048' },
  8: { bg: 'bg-sec-08', text: 'text-sec-08', hex: '#00ef47' },
  7: { bg: 'bg-sec-07', text: 'text-sec-07', hex: '#00ef00' },
  6: { bg: 'bg-sec-06', text: 'text-sec-06', hex: '#8fef2f' },
  5: { bg: 'bg-sec-05', text: 'text-sec-05', hex: '#efef00' },
  4: { bg: 'bg-sec-04', text: 'text-sec-04', hex: '#d77700' },
  3: { bg: 'bg-sec-03', text: 'text-sec-03', hex: '#f06000' },
  2: { bg: 'bg-sec-02', text: 'text-sec-02', hex: '#f04800' },
  1: { bg: 'bg-sec-01', text: 'text-sec-01', hex: '#d73000' },
  0: { bg: 'bg-sec-00', text: 'text-sec-00', hex: '#f00000' },
};

/**
 * Tax/Accounting Level Options
 */
export const TAX_OPTIONS = [
  { value: 0.0750, label: 'Accounting 0 (7.50%)', level: 0 },
  { value: 0.0675, label: 'Accounting 1 (6.75%)', level: 1 },
  { value: 0.0600, label: 'Accounting 2 (6.00%)', level: 2 },
  { value: 0.0525, label: 'Accounting 3 (5.25%)', level: 3 },
  { value: 0.0450, label: 'Accounting 4 (4.50%)', level: 4 },
  { value: 0.0375, label: 'Accounting 5 (3.75%)', level: 5 },
];

/**
 * Route Safety Options
 */
export const ROUTE_SAFETY_OPTIONS = [
  { value: 'shortest', label: 'Shortest (Any Security)' },
  { value: 'secure', label: 'Prefer Secure (0.5+)' },
  { value: 'highsec', label: 'High-Sec Only (0.5+)' },
];

/**
 * System Security Options
 */
export const SYSTEM_SECURITY_OPTIONS = [
  { value: 'all', label: 'All Systems' },
  { value: 'highsec', label: 'High-Sec Only (0.5+)' },
  { value: 'lowsec', label: 'Low-Sec Only (0.1-0.4)' },
  { value: 'nullsec', label: 'Null-Sec Only (0.0 and below)' },
];

/**
 * Structure Type Options
 */
export const STRUCTURE_TYPE_OPTIONS = [
  { value: 'both', label: 'NPC & Player Structures' },
  { value: 'npc', label: 'NPC Stations Only' },
  { value: 'citadel', label: 'Player Structures Only' },
];

/**
 * Trade Preference Options
 */
export const TRADE_PREFERENCE_OPTIONS = [
  { value: 'none', label: 'No Preference' },
  { value: 'buy', label: 'Buy Orders (You sell to them)' },
  { value: 'sell', label: 'Sell Orders (You buy from them)' },
];

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  duration: 60 * 60 * 1000, // 1 hour in milliseconds
  dbName: 'evetrade-cache',
  storeName: 'resources',
};

/**
 * Resource file names to load
 */
export const RESOURCE_FILES = [
  'universeList',
  'regionList',
  'stationList',
  'structureList',
  'structureInfo',
  'functionDurations',
];

/**
 * Major EVE Online Trade Hubs
 * Used for price comparison across hubs
 */
export const TRADE_HUBS = [
  {
    name: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
    shortName: 'Jita',
    stationId: 60003760,
    regionId: 10000002,
    regionName: 'The Forge',
  },
  {
    name: 'Amarr VIII (Oris) - Emperor Family Academy',
    shortName: 'Amarr',
    stationId: 60008494,
    regionId: 10000043,
    regionName: 'Domain',
  },
  {
    name: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
    shortName: 'Dodixie',
    stationId: 60011866,
    regionId: 10000032,
    regionName: 'Sinq Laison',
  },
  {
    name: 'Rens VI - Moon 8 - Brutor Tribe Treasury',
    shortName: 'Rens',
    stationId: 60004588,
    regionId: 10000030,
    regionName: 'Heimatar',
  },
  {
    name: 'Hek VIII - Moon 12 - Boundless Creation Factory',
    shortName: 'Hek',
    stationId: 60005686,
    regionId: 10000042,
    regionName: 'Metropolis',
  },
];
