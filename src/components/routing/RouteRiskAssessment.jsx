import { useState, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { StationAutocomplete } from '../forms';
import { FormInput } from '../forms';
import { useResources } from '../../hooks/useResources';
import { getStationData } from '../../utils/stations';
import { SECURITY_COLORS } from '../../utils/constants';

/**
 * Known gank hotspots in EVE Online
 */
const GANK_HOTSPOTS = [
  { system: 'Uedama', region: 'The Forge', riskLevel: 'extreme', description: 'Major freighter gank location' },
  { system: 'Niarja', region: 'Domain', riskLevel: 'extreme', description: 'Amarr-Jita trade route chokepoint' },
  { system: 'Sivala', region: 'The Forge', riskLevel: 'high', description: 'Jita exit route' },
  { system: 'Madirmilire', region: 'The Forge', riskLevel: 'high', description: 'Common trade route' },
  { system: 'Audaerne', region: 'Sinq Laison', riskLevel: 'high', description: 'Dodixie route' },
  { system: 'Brapelille', region: 'Sinq Laison', riskLevel: 'high', description: 'Dodixie-Jita route' },
  { system: 'Amamake', region: 'Heimatar', riskLevel: 'extreme', description: 'Low-sec pirate hub' },
  { system: 'Rancer', region: 'Sinq Laison', riskLevel: 'extreme', description: 'Infamous low-sec camp' },
  { system: 'Tama', region: 'The Citadel', riskLevel: 'extreme', description: 'Black Rise low-sec gate camp' },
];

/**
 * Security status risk levels
 */
const SECURITY_RISK = {
  1.0: 'minimal',
  0.9: 'minimal',
  0.8: 'low',
  0.7: 'low',
  0.6: 'low',
  0.5: 'medium',
  0.4: 'high',
  0.3: 'high',
  0.2: 'very-high',
  0.1: 'very-high',
  0.0: 'extreme',
};

/**
 * Calculate gank probability based on security, cargo value, and hotspots
 */
function calculateGankProbability(security, cargoValue, isHotspot, hotspotRisk) {
  let baseRisk = 0;

  // Base risk from security status
  if (security >= 0.9) baseRisk = 0.1;
  else if (security >= 0.7) baseRisk = 0.5;
  else if (security >= 0.5) baseRisk = 2;
  else if (security >= 0.3) baseRisk = 15;
  else if (security >= 0.1) baseRisk = 35;
  else baseRisk = 75;

  // Cargo value multiplier
  const valueMultiplier = cargoValue > 10000000000 ? 3 : // 10B+
                          cargoValue > 5000000000 ? 2.5 : // 5B+
                          cargoValue > 2000000000 ? 2 : // 2B+
                          cargoValue > 1000000000 ? 1.5 : // 1B+
                          1;

  // Hotspot multiplier
  const hotspotMultiplier = isHotspot ?
    (hotspotRisk === 'extreme' ? 5 :
     hotspotRisk === 'high' ? 3 : 2) : 1;

  return Math.min(baseRisk * valueMultiplier * hotspotMultiplier, 99);
}

/**
 * Get security color for display
 */
function getSecurityColor(security) {
  const level = Math.floor(security * 10);
  return SECURITY_COLORS[level] || SECURITY_COLORS[0];
}

/**
 * Generate route systems (simplified - would use actual pathfinding)
 */
function generateRoute(fromData, toData, routeSafety) {
  if (!fromData || !toData) return [];

  // Simplified route generation
  const numSystems = Math.floor(Math.random() * 15) + 5;
  const route = [];

  for (let i = 0; i < numSystems; i++) {
    const progress = i / (numSystems - 1);
    let security;

    if (routeSafety === 'highsec') {
      security = 0.5 + Math.random() * 0.5;
    } else if (routeSafety === 'secure') {
      security = Math.random() > 0.8 ? 0.3 + Math.random() * 0.2 : 0.5 + Math.random() * 0.5;
    } else {
      security = Math.random();
    }

    const systemName = i === 0 ? fromData.system :
                       i === numSystems - 1 ? toData.system :
                       `System-${i}`;

    // Check if this is a known hotspot
    const hotspot = GANK_HOTSPOTS.find(h => h.system === systemName);

    route.push({
      id: i,
      name: systemName,
      security: parseFloat(security.toFixed(1)),
      region: i === 0 ? fromData.region : i === numSystems - 1 ? toData.region : 'Unknown',
      isHotspot: !!hotspot,
      hotspotInfo: hotspot,
    });
  }

  return route;
}

/**
 * Route Risk Assessment Component
 * Analyzes security and gank risk for trade routes
 */
export function RouteRiskAssessment({ className = '' }) {
  const { universeList } = useResources();

  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [cargoValue, setCargoValue] = useState(1000000000); // 1B default
  const [routeSafety, setRouteSafety] = useState('shortest');
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Generate route
  const route = useMemo(() => {
    if (!fromStation || !toStation) return [];

    const fromData = getStationData(fromStation, universeList);
    const toData = getStationData(toStation, universeList);

    return generateRoute(fromData, toData, routeSafety);
  }, [fromStation, toStation, routeSafety, universeList]);

  // Calculate route statistics
  const routeStats = useMemo(() => {
    if (route.length === 0) return null;

    const lowsecSystems = route.filter(s => s.security >= 0.1 && s.security < 0.5).length;
    const nullsecSystems = route.filter(s => s.security < 0.1).length;
    const highsecSystems = route.filter(s => s.security >= 0.5).length;
    const hotspots = route.filter(s => s.isHotspot).length;

    const systemRisks = route.map(system => {
      const gankProb = calculateGankProbability(
        system.security,
        cargoValue,
        system.isHotspot,
        system.hotspotInfo?.riskLevel
      );
      return { ...system, gankProbability: gankProb };
    });

    const maxRisk = Math.max(...systemRisks.map(s => s.gankProbability));
    const avgRisk = systemRisks.reduce((sum, s) => sum + s.gankProbability, 0) / systemRisks.length;

    let overallRisk = 'low';
    if (maxRisk > 50 || hotspots > 0) overallRisk = 'extreme';
    else if (maxRisk > 20 || nullsecSystems > 0) overallRisk = 'high';
    else if (maxRisk > 10 || lowsecSystems > 2) overallRisk = 'medium';

    return {
      jumps: route.length,
      lowsecSystems,
      nullsecSystems,
      highsecSystems,
      hotspots,
      systemRisks,
      maxRisk,
      avgRisk,
      overallRisk,
    };
  }, [route, cargoValue]);

  // Get alternative safer route (simplified)
  const safeAlternative = useMemo(() => {
    if (!fromStation || !toStation || routeSafety === 'highsec') return null;

    const fromData = getStationData(fromStation, universeList);
    const toData = getStationData(toStation, universeList);
    const altRoute = generateRoute(fromData, toData, 'highsec');

    if (altRoute.length === 0) return null;

    const systemRisks = altRoute.map(system => {
      const gankProb = calculateGankProbability(system.security, cargoValue, system.isHotspot, system.hotspotInfo?.riskLevel);
      return { ...system, gankProbability: gankProb };
    });

    const maxRisk = Math.max(...systemRisks.map(s => s.gankProbability));

    return {
      route: altRoute,
      jumps: altRoute.length,
      maxRisk,
      addedJumps: altRoute.length - route.length,
    };
  }, [fromStation, toStation, routeSafety, route.length, cargoValue, universeList]);

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-display text-text-primary">Route Risk Assessment</h2>
          <p className="text-sm text-text-secondary mt-1">
            Analyze security status and gank probability for your trade routes
          </p>
        </div>

        {/* Route Input */}
        <div className="grid md:grid-cols-2 gap-4">
          <StationAutocomplete
            label="From Station"
            value={fromStation}
            onChange={setFromStation}
            placeholder="Origin station..."
            showTradeHubs={true}
          />
          <StationAutocomplete
            label="To Station"
            value={toStation}
            onChange={setToStation}
            placeholder="Destination station..."
            showTradeHubs={true}
          />
        </div>

        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="Estimated Cargo Value"
            type="number"
            value={cargoValue}
            onChange={setCargoValue}
            suffix="ISK"
            helper="Higher values increase gank probability"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Route Preference</label>
            <div className="flex gap-2">
              {[
                { value: 'shortest', label: 'Shortest' },
                { value: 'secure', label: 'Prefer Secure' },
                { value: 'highsec', label: 'High-Sec Only' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setRouteSafety(option.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    routeSafety === option.value
                      ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                      : 'bg-space-dark/30 border-accent-cyan/10 text-text-secondary hover:border-accent-cyan/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Route Analysis */}
        {routeStats && (
          <>
            {/* Overall Risk Summary */}
            <div className={`p-4 rounded-lg border-2 ${
              routeStats.overallRisk === 'extreme' ? 'bg-red-500/10 border-red-500/50' :
              routeStats.overallRisk === 'high' ? 'bg-orange-500/10 border-orange-500/50' :
              routeStats.overallRisk === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
              'bg-green-500/10 border-green-500/50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-display text-text-primary">Overall Risk Assessment</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  routeStats.overallRisk === 'extreme' ? 'bg-red-500/30 text-red-300' :
                  routeStats.overallRisk === 'high' ? 'bg-orange-500/30 text-orange-300' :
                  routeStats.overallRisk === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-green-500/30 text-green-300'
                }`}>
                  {routeStats.overallRisk.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-cyan">{routeStats.jumps}</div>
                  <div className="text-xs text-text-secondary">Total Jumps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{routeStats.highsecSystems}</div>
                  <div className="text-xs text-text-secondary">High-Sec</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{routeStats.lowsecSystems}</div>
                  <div className="text-xs text-text-secondary">Low-Sec</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{routeStats.nullsecSystems}</div>
                  <div className="text-xs text-text-secondary">Null-Sec</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-text-secondary mb-1">Maximum Gank Probability</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-space-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          routeStats.maxRisk > 50 ? 'bg-red-500' :
                          routeStats.maxRisk > 20 ? 'bg-orange-500' :
                          routeStats.maxRisk > 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${routeStats.maxRisk}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-text-primary">{routeStats.maxRisk.toFixed(1)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Average Risk</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-space-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-cyan rounded-full"
                        style={{ width: `${routeStats.avgRisk}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-text-primary">{routeStats.avgRisk.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotspot Warning */}
            {routeStats.hotspots > 0 && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-300 mb-1">Known Gank Hotspot Detected!</h4>
                    <p className="text-sm text-red-200">
                      This route passes through {routeStats.hotspots} known gank {routeStats.hotspots === 1 ? 'hotspot' : 'hotspots'}.
                      Consider using an alternative route or taking extra precautions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* System-by-System Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-display text-text-primary">System-by-System Analysis</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {routeStats.systemRisks.map((system, index) => {
                  const secColor = getSecurityColor(system.security);
                  return (
                    <div
                      key={system.id}
                      className={`p-3 rounded-lg border ${
                        system.isHotspot ? 'bg-red-500/10 border-red-500/50' :
                        system.security < 0.5 ? 'bg-orange-500/5 border-orange-500/20' :
                        'bg-space-dark/30 border-accent-cyan/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-6 h-6 bg-accent-cyan/20 text-accent-cyan text-xs font-bold rounded-full">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-medium text-text-primary flex items-center gap-2">
                              {system.name}
                              {system.isHotspot && (
                                <span className="px-2 py-0.5 text-xs bg-red-500/30 text-red-300 rounded-full font-bold">
                                  HOTSPOT
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-text-secondary">{system.region}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${secColor.text}`}>
                            {system.security.toFixed(1)}
                          </div>
                          <div className="text-xs text-text-secondary">Security</div>
                        </div>
                      </div>
                      {system.isHotspot && (
                        <div className="mb-2 text-xs text-red-300">
                          ⚠ {system.hotspotInfo.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">Gank Risk:</span>
                        <div className="flex-1 h-1.5 bg-space-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              system.gankProbability > 50 ? 'bg-red-500' :
                              system.gankProbability > 20 ? 'bg-orange-500' :
                              system.gankProbability > 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${system.gankProbability}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-text-primary w-12 text-right">
                          {system.gankProbability.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Safer Alternative */}
            {safeAlternative && safeAlternative.maxRisk < routeStats.maxRisk && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-green-300 mb-1">Safer Alternative Available</h4>
                      <p className="text-sm text-green-200">
                        A safer high-sec route is available with {safeAlternative.jumps} jumps
                        ({safeAlternative.addedJumps > 0 ? `+${safeAlternative.addedJumps}` : safeAlternative.addedJumps} jumps)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    {showAlternatives ? 'Hide' : 'Show'} Details
                  </button>
                </div>
                {showAlternatives && (
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-300">{safeAlternative.jumps}</div>
                        <div className="text-xs text-text-secondary">Jumps</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-300">{safeAlternative.maxRisk.toFixed(1)}%</div>
                        <div className="text-xs text-text-secondary">Max Risk</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-accent-cyan">
                          {(routeStats.maxRisk - safeAlternative.maxRisk).toFixed(1)}%
                        </div>
                        <div className="text-xs text-text-secondary">Risk Reduction</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Safety Recommendations */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Safety Recommendations
              </h4>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• Use a scout alt in a fast ship to check ahead for gate camps</li>
                <li>• Fit tank and align time reduction modules on your hauler</li>
                <li>• Use an insta-dock bookmark at your destination</li>
                <li>• Consider webbing alt to align faster</li>
                {routeStats.maxRisk > 20 && (
                  <li className="text-orange-400">⚠ Consider using a blockade runner for high-value cargo</li>
                )}
                {routeStats.hotspots > 0 && (
                  <li className="text-red-400">⚠ Avoid known hotspots or use a jump freighter with cyno support</li>
                )}
                {cargoValue > 5000000000 && (
                  <li className="text-yellow-400">⚠ High cargo value - consider splitting into multiple trips</li>
                )}
              </ul>
            </div>
          </>
        )}

        {/* No Route Message */}
        {!routeStats && (
          <div className="text-center py-12 text-text-secondary">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-lg">Select origin and destination to assess route risk</p>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

export default RouteRiskAssessment;
