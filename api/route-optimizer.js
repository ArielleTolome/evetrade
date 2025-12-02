/**
 * Route Optimizer API Endpoint
 * Uses ESI's route planning API to calculate optimal routes between systems
 *
 * Query params:
 * - origin: Origin system ID (required)
 * - destination: Destination system ID (required)
 * - preference: Route preference (shortest, secure, insecure) - default: shortest
 * - avoidSystems: Comma-separated list of system IDs to avoid
 * - cargoValue: Cargo value in ISK for risk calculation (optional)
 * - calculateRisk: Whether to fetch kill data for risk scoring (default: true)
 */

const ESI_BASE = 'https://esi.evetech.net/latest';
const ESI_TIMEOUT_MS = 15000; // 15 second timeout for ESI requests

// Security status thresholds
const SECURITY_LEVELS = {
  HIGH_SEC: 0.5,
  LOW_SEC: 0.0,
};

// Known gank hotspots (system IDs)
const GANK_HOTSPOTS = {
  30000142: { name: 'Jita', multiplier: 1.5 },
  30002659: { name: 'Uedama', multiplier: 5.0 },
  30002305: { name: 'Niarja', multiplier: 3.0 },
  30000144: { name: 'Sivala', multiplier: 2.5 },
  30002544: { name: 'Amamake', multiplier: 4.0 },
  30002225: { name: 'Rancer', multiplier: 5.0 },
  30002726: { name: 'Tama', multiplier: 3.5 },
};

// Cache for system info (in-memory for serverless function lifecycle)
const systemInfoCache = new Map();
const systemKillsCache = { data: null, timestamp: 0 };

/**
 * Validate and parse an integer parameter
 */
function validateInt(value, paramName, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined || value === null || value === '') return null;
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

/**
 * Validate route preference
 */
function validatePreference(preference) {
  const validPreferences = ['shortest', 'secure', 'insecure'];
  if (!preference || !validPreferences.includes(preference.toLowerCase())) {
    return 'shortest';
  }
  return preference.toLowerCase();
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = ESI_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('ESI request timeout');
    }
    throw error;
  }
}

/**
 * Fetch route from ESI
 */
async function fetchRoute(origin, destination, preference, avoidSystems = []) {
  let url = `${ESI_BASE}/route/${origin}/${destination}/?datasource=tranquility`;

  // Add preference flag
  if (preference === 'secure') {
    url += '&flag=secure';
  } else if (preference === 'insecure') {
    url += '&flag=insecure';
  } else {
    url += '&flag=shortest';
  }

  // Add avoid systems
  if (avoidSystems.length > 0) {
    avoidSystems.forEach(systemId => {
      url += `&avoid=${systemId}`;
    });
  }

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No route found between these systems');
    }
    throw new Error(`ESI API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch system information from ESI
 */
async function getSystemInfo(systemId) {
  // Check cache first
  if (systemInfoCache.has(systemId)) {
    return systemInfoCache.get(systemId);
  }

  try {
    const response = await fetchWithTimeout(
      `${ESI_BASE}/universe/systems/${systemId}/?datasource=tranquility`
    );

    if (!response.ok) {
      return {
        system_id: systemId,
        name: `System ${systemId}`,
        security_status: 0.0,
      };
    }

    const data = await response.json();
    const info = {
      system_id: data.system_id,
      name: data.name,
      security_status: data.security_status || 0.0,
    };

    // Cache the result
    systemInfoCache.set(systemId, info);
    return info;
  } catch (error) {
    console.warn(`Failed to fetch system info for ${systemId}:`, error.message);
    return {
      system_id: systemId,
      name: `System ${systemId}`,
      security_status: 0.0,
    };
  }
}

/**
 * Fetch recent system kills from ESI
 */
async function getSystemKills() {
  // Check cache (valid for 1 hour)
  const now = Date.now();
  if (systemKillsCache.data && now - systemKillsCache.timestamp < 3600000) {
    return systemKillsCache.data;
  }

  try {
    const response = await fetchWithTimeout(
      `${ESI_BASE}/universe/system_kills/?datasource=tranquility`
    );

    if (!response.ok) {
      return {};
    }

    const data = await response.json();

    // Convert to map for easy lookup
    const killsMap = {};
    for (const item of data) {
      killsMap[item.system_id] = {
        ship_kills: item.ship_kills || 0,
        pod_kills: item.pod_kills || 0,
        npc_kills: item.npc_kills || 0,
      };
    }

    // Update cache
    systemKillsCache.data = killsMap;
    systemKillsCache.timestamp = now;

    return killsMap;
  } catch (error) {
    console.warn('Failed to fetch system kills:', error.message);
    return {};
  }
}

/**
 * Calculate security level category
 */
function getSecurityLevel(securityStatus) {
  if (securityStatus >= SECURITY_LEVELS.HIGH_SEC) {
    return 'high-sec';
  } else if (securityStatus > SECURITY_LEVELS.LOW_SEC) {
    return 'low-sec';
  } else {
    return 'null-sec';
  }
}

/**
 * Calculate base risk from security status
 */
function calculateBaseRisk(securityStatus) {
  if (securityStatus >= 0.9) return 0.001; // 0.1%
  if (securityStatus >= 0.7) return 0.005; // 0.5%
  if (securityStatus >= 0.5) return 0.02;  // 2%
  if (securityStatus >= 0.3) return 0.15;  // 15%
  if (securityStatus >= 0.1) return 0.35;  // 35%
  return 0.75; // 75% for null-sec
}

/**
 * Calculate risk score for a system
 */
function calculateSystemRisk(systemInfo, killData, cargoValue) {
  let risk = calculateBaseRisk(systemInfo.security_status);

  // Apply hotspot multiplier
  if (GANK_HOTSPOTS[systemInfo.system_id]) {
    risk *= GANK_HOTSPOTS[systemInfo.system_id].multiplier;
  }

  // Apply cargo value multiplier
  if (cargoValue) {
    const valueInBillions = cargoValue / 1_000_000_000;
    if (valueInBillions > 10) {
      risk *= 3.0;
    } else if (valueInBillions > 5) {
      risk *= 2.0;
    } else if (valueInBillions > 1) {
      risk *= 1.5;
    }
  }

  // Apply recent kill activity multiplier
  if (killData) {
    const totalPvpKills = (killData.ship_kills || 0) + (killData.pod_kills || 0);
    if (totalPvpKills > 100) {
      risk *= 2.0;
    } else if (totalPvpKills > 50) {
      risk *= 1.5;
    } else if (totalPvpKills > 20) {
      risk *= 1.2;
    }
  }

  // Cap at 100%
  return Math.min(risk, 1.0);
}

/**
 * Calculate overall risk rating
 */
function getRiskRating(averageRisk) {
  if (averageRisk < 0.01) return 'minimal';
  if (averageRisk < 0.05) return 'low';
  if (averageRisk < 0.15) return 'medium';
  if (averageRisk < 0.40) return 'high';
  return 'extreme';
}

/**
 * Calculate jump fatigue for capital ships
 */
function calculateJumpFatigue(jumps, jumpDistance = 5.0) {
  // Simplified jump fatigue calculation
  // Base formula: 1 + (LY jumped) minutes of fatigue
  // Each subsequent jump multiplies existing fatigue

  let totalFatigue = 0;
  let currentFatigue = 0;

  for (let i = 0; i < jumps; i++) {
    // Add base fatigue + distance
    const jumpFatigue = 1 + jumpDistance;

    // Multiply existing fatigue
    if (currentFatigue > 0) {
      currentFatigue = currentFatigue * (1 + jumpFatigue);
    } else {
      currentFatigue = jumpFatigue;
    }

    totalFatigue = currentFatigue;
  }

  return Math.round(totalFatigue);
}

/**
 * Estimate travel time based on jumps
 */
function estimateTravelTime(jumps) {
  // Assume ~30 seconds per jump for subcaps
  // Add 10 seconds for first and last system (undocking/docking)
  const baseTime = (jumps - 1) * 30 + 20;

  const minutes = Math.floor(baseTime / 60);
  const seconds = baseTime % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Generate request ID for debugging
  const requestId = req.headers['x-vercel-id'] || crypto.randomUUID?.() || Date.now().toString(36);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Request-ID', requestId);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      origin,
      destination,
      preference = 'shortest',
      avoidSystems = '',
      cargoValue,
      calculateRisk = 'true',
    } = req.query;

    // Validate required parameters
    const originId = validateInt(origin, 'origin', 30000000, 32000000);
    const destinationId = validateInt(destination, 'destination', 30000000, 32000000);

    if (!originId || !destinationId) {
      return res.status(400).json({
        error: 'Invalid system IDs. Origin and destination must be valid EVE Online system IDs.',
      });
    }

    if (originId === destinationId) {
      return res.status(400).json({
        error: 'Origin and destination cannot be the same system.',
      });
    }

    // Validate and parse optional parameters
    const routePreference = validatePreference(preference);
    const avoidSystemIds = avoidSystems
      ? avoidSystems.split(',').map(id => validateInt(id, 'avoidSystem', 30000000, 32000000)).filter(Boolean)
      : [];
    const cargoValueNum = validateInt(cargoValue, 'cargoValue', 0, 1e15);
    const shouldCalculateRisk = calculateRisk.toLowerCase() !== 'false';

    // Fetch route from ESI
    const route = await fetchRoute(originId, destinationId, routePreference, avoidSystemIds);

    if (!Array.isArray(route) || route.length === 0) {
      return res.status(404).json({
        error: 'No route found between these systems.',
      });
    }

    // Fetch system info for all systems in route
    const systemInfoPromises = route.map(systemId => getSystemInfo(systemId));
    const systemsInfo = await Promise.all(systemInfoPromises);

    // Fetch kill data if risk calculation is enabled
    let killsData = {};
    if (shouldCalculateRisk) {
      killsData = await getSystemKills();
    }

    // Calculate risk for each system
    const systemsWithRisk = systemsInfo.map(systemInfo => {
      const killData = killsData[systemInfo.system_id];
      const risk = shouldCalculateRisk
        ? calculateSystemRisk(systemInfo, killData, cargoValueNum)
        : 0;

      return {
        system_id: systemInfo.system_id,
        name: systemInfo.name,
        security_status: Math.round(systemInfo.security_status * 10) / 10,
        security_level: getSecurityLevel(systemInfo.security_status),
        risk_score: Math.round(risk * 1000) / 10, // Convert to percentage
        is_hotspot: !!GANK_HOTSPOTS[systemInfo.system_id],
        hotspot_name: GANK_HOTSPOTS[systemInfo.system_id]?.name,
        recent_kills: killData ? (killData.ship_kills + killData.pod_kills) : 0,
      };
    });

    // Calculate route statistics
    const totalJumps = route.length - 1; // Number of jumps is systems - 1
    const travelTime = estimateTravelTime(totalJumps);

    // Count security levels
    const securityCounts = {
      'high-sec': 0,
      'low-sec': 0,
      'null-sec': 0,
    };

    let totalRisk = 0;
    let highestRisk = 0;
    let mostDangerousSystem = null;

    systemsWithRisk.forEach(system => {
      securityCounts[system.security_level]++;
      totalRisk += system.risk_score;

      if (system.risk_score > highestRisk) {
        highestRisk = system.risk_score;
        mostDangerousSystem = system;
      }
    });

    const averageRisk = totalRisk / systemsWithRisk.length;
    const riskRating = getRiskRating(averageRisk / 100); // Convert back to decimal

    // Calculate jump fatigue for capital ships
    const jumpFatigue = calculateJumpFatigue(totalJumps);

    // Generate safety recommendations
    const recommendations = [];

    if (highestRisk > 50) {
      recommendations.push('Consider using a safer route preference');
    }

    if (securityCounts['low-sec'] > 0 || securityCounts['null-sec'] > 0) {
      recommendations.push('Route includes low-sec or null-sec systems');
      recommendations.push('Use a scout alt to check gates ahead');
    }

    if (mostDangerousSystem?.is_hotspot) {
      recommendations.push(`Avoid known hotspot: ${mostDangerousSystem.hotspot_name || mostDangerousSystem.name}`);
    }

    if (cargoValueNum && cargoValueNum > 1_000_000_000) {
      recommendations.push('Consider using a blockade runner for high-value cargo');
      recommendations.push('Split cargo into multiple trips if possible');
    }

    // Build response
    const response = {
      origin: systemsWithRisk[0],
      destination: systemsWithRisk[systemsWithRisk.length - 1],
      preference: routePreference,
      statistics: {
        total_jumps: totalJumps,
        estimated_time: travelTime,
        high_sec_systems: securityCounts['high-sec'],
        low_sec_systems: securityCounts['low-sec'],
        null_sec_systems: securityCounts['null-sec'],
        average_risk: Math.round(averageRisk * 10) / 10,
        risk_rating: riskRating,
        highest_risk: Math.round(highestRisk * 10) / 10,
        most_dangerous_system: mostDangerousSystem?.name,
        jump_fatigue_minutes: jumpFatigue,
      },
      route: systemsWithRisk,
      recommendations: recommendations.length > 0 ? recommendations : ['Route appears safe for travel'],
      metadata: {
        cargo_value: cargoValueNum || 0,
        avoided_systems: avoidSystemIds,
        risk_calculated: shouldCalculateRisk,
      },
    };

    // Set cache headers (routes don't change often, kills update hourly)
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600'); // 5-10 min cache

    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${requestId}] Route optimizer error:`, error);

    // Don't expose internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      error: 'Failed to calculate route',
      ...(isProduction ? {} : { message: error.message }),
      requestId,
    });
  }
}
