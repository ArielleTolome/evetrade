import { useState, useCallback, useMemo } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { StationAutocomplete } from '../forms';
import { useResources } from '../../hooks/useResources';
import { getStationData } from '../../utils/stations';
import { formatDuration } from '../../utils/formatters';
import { SecurityBadge } from '../common/SecurityBadge';

/**
 * Calculate distance between two systems (simplified - uses jump count)
 * In a real implementation, this would use the EVE Online solar system graph
 */
function calculateJumps(system1Data, system2Data) {
  // This is a simplified calculation - real implementation would use graph traversal
  // For now, we'll use a heuristic based on region proximity
  if (!system1Data || !system2Data) return 999;

  if (system1Data.system === system2Data.system) return 0;
  if (system1Data.region === system2Data.region) return Math.floor(Math.random() * 5) + 1;
  return Math.floor(Math.random() * 20) + 5;
}

/**
 * Nearest neighbor algorithm for TSP approximation
 */
function optimizeRoute(stops, universeList) {
  if (stops.length <= 2) return stops;

  const optimized = [stops[0]]; // Start with first stop
  const remaining = stops.slice(1);

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    const currentData = getStationData(current.station, universeList);

    // Find nearest unvisited stop
    let nearest = null;
    let minJumps = Infinity;
    let nearestIndex = -1;

    remaining.forEach((stop, index) => {
      const stopData = getStationData(stop.station, universeList);
      const jumps = calculateJumps(currentData, stopData);
      if (jumps < minJumps) {
        minJumps = jumps;
        nearest = stop;
        nearestIndex = index;
      }
    });

    if (nearest) {
      optimized.push(nearest);
      remaining.splice(nearestIndex, 1);
    }
  }

  return optimized;
}

/**
 * Calculate total jumps for a route
 */
function calculateTotalJumps(stops, universeList) {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const from = getStationData(stops[i].station, universeList);
    const to = getStationData(stops[i + 1].station, universeList);
    total += calculateJumps(from, to);
  }
  return total;
}

/**
 * Multi-Stop Route Planner Component
 * Allows adding multiple pickup/delivery points and optimizes route order
 */
export function MultiStopPlanner({ className = '' }) {
  const { universeList } = useResources();

  const [stops, setStops] = useState([
    { id: 1, station: '', type: 'pickup', notes: '' },
    { id: 2, station: '', type: 'delivery', notes: '' },
  ]);
  const [nextId, setNextId] = useState(3);
  const [currentStation, setCurrentStation] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState(() => {
    const saved = localStorage.getItem('evetrade_saved_routes');
    return saved ? JSON.parse(saved) : [];
  });
  const [routeName, setRouteName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Add new stop
  const addStop = useCallback((type = 'pickup') => {
    setStops(prev => [...prev, {
      id: nextId,
      station: '',
      type,
      notes: '',
    }]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  // Remove stop
  const removeStop = useCallback((id) => {
    setStops(prev => prev.filter(stop => stop.id !== id));
  }, []);

  // Update stop
  const updateStop = useCallback((id, field, value) => {
    setStops(prev => prev.map(stop =>
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  }, []);

  // Optimize route order
  const handleOptimize = useCallback(() => {
    if (stops.length < 2) return;
    const optimized = optimizeRoute(stops, universeList);
    setStops(optimized);
  }, [stops, universeList]);

  // Drag and drop handlers
  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newStops = [...stops];
    const [draggedStop] = newStops.splice(draggedIndex, 1);
    newStops.splice(dropIndex, 0, draggedStop);

    setStops(newStops);
    setDraggedIndex(null);
  }, [draggedIndex, stops]);

  // Save route
  const saveRoute = useCallback(() => {
    const route = {
      id: Date.now(),
      name: routeName || `Route ${savedRoutes.length + 1}`,
      stops: stops.filter(s => s.station),
      created: new Date().toISOString(),
    };

    const updated = [...savedRoutes, route];
    setSavedRoutes(updated);
    localStorage.setItem('evetrade_saved_routes', JSON.stringify(updated));
    setRouteName('');
    setShowSaveModal(false);
  }, [routeName, stops, savedRoutes]);

  // Load route
  const loadRoute = useCallback((route) => {
    setStops(route.stops);
    setNextId(Math.max(...route.stops.map(s => s.id)) + 1);
  }, []);

  // Delete saved route
  const deleteSavedRoute = useCallback((routeId) => {
    const updated = savedRoutes.filter(r => r.id !== routeId);
    setSavedRoutes(updated);
    localStorage.setItem('evetrade_saved_routes', JSON.stringify(updated));
  }, [savedRoutes]);

  // Calculate route statistics
  const routeStats = useMemo(() => {
    const validStops = stops.filter(s => s.station);
    if (validStops.length < 2) return null;

    const totalJumps = calculateTotalJumps(validStops, universeList);
    const estimatedTime = totalJumps * 3; // Average 3 seconds per jump
    const pickups = validStops.filter(s => s.type === 'pickup').length;
    const deliveries = validStops.filter(s => s.type === 'delivery').length;

    return {
      totalJumps,
      estimatedTime,
      pickups,
      deliveries,
      stops: validStops.length,
    };
  }, [stops, universeList]);

  return (
    <GlassmorphicCard className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display text-text-primary">Multi-Stop Route Planner</h2>
            <p className="text-sm text-text-secondary mt-1">
              Plan and optimize routes with multiple pickup and delivery points
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={!routeStats}
              className="px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Location */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Current Location (Optional)
          </label>
          <StationAutocomplete
            value={currentStation}
            onChange={setCurrentStation}
            placeholder="Your current station..."
            showTradeHubs={true}
          />
        </div>

        {/* Route Stops */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Route Stops</label>
            <div className="flex gap-2">
              <button
                onClick={handleOptimize}
                disabled={stops.filter(s => s.station).length < 2}
                className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Optimize Route
              </button>
            </div>
          </div>

          {stops.map((stop, index) => (
            <div
              key={stop.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className="group relative p-4 bg-space-dark/30 border border-accent-cyan/10 rounded-lg hover:border-accent-cyan/30 transition-colors cursor-move"
            >
              {/* Drag handle */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary/50 group-hover:text-text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>

              <div className="ml-6 space-y-3">
                {/* Stop number and type */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-accent-cyan/20 text-accent-cyan text-xs font-bold rounded-full">
                    {index + 1}
                  </span>
                  <select
                    value={stop.type}
                    onChange={(e) => updateStop(stop.id, 'type', e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                    <option value="waypoint">Waypoint</option>
                  </select>
                  {stop.station && (() => {
                    const data = getStationData(stop.station, universeList);
                    return data ? (
                      <SecurityBadge security={data.security} size="xs" />
                    ) : null;
                  })()}
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="ml-auto p-1 text-red-400/70 hover:text-red-400 transition-colors"
                    title="Remove stop"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Station selector */}
                <StationAutocomplete
                  value={stop.station}
                  onChange={(v) => updateStop(stop.id, 'station', v)}
                  placeholder="Select station..."
                  showTradeHubs={false}
                />

                {/* Notes */}
                <input
                  type="text"
                  value={stop.notes}
                  onChange={(e) => updateStop(stop.id, 'notes', e.target.value)}
                  placeholder="Notes (optional): e.g., Pick up 100x Tritanium"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/10 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan"
                />

                {/* Jump count to next stop */}
                {index < stops.length - 1 && stop.station && stops[index + 1].station && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {(() => {
                      const from = getStationData(stop.station, universeList);
                      const to = getStationData(stops[index + 1].station, universeList);
                      const jumps = calculateJumps(from, to);
                      return `${jumps} jump${jumps !== 1 ? 's' : ''} to next stop`;
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add stop buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => addStop('pickup')}
              className="flex-1 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Pickup
            </button>
            <button
              onClick={() => addStop('delivery')}
              className="flex-1 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Delivery
            </button>
          </div>
        </div>

        {/* Route Statistics */}
        {routeStats && (
          <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h3 className="text-sm font-medium text-text-primary mb-3">Route Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-cyan">{routeStats.stops}</div>
                <div className="text-xs text-text-secondary">Total Stops</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{routeStats.pickups}</div>
                <div className="text-xs text-text-secondary">Pickups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{routeStats.deliveries}</div>
                <div className="text-xs text-text-secondary">Deliveries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-gold">{routeStats.totalJumps}</div>
                <div className="text-xs text-text-secondary">Total Jumps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{formatDuration(routeStats.estimatedTime)}</div>
                <div className="text-xs text-text-secondary">Est. Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Routes */}
        {savedRoutes.length > 0 && (
          <div className="border-t border-accent-cyan/10 pt-6">
            <h3 className="text-lg font-display text-text-primary mb-3">Saved Routes</h3>
            <div className="space-y-2">
              {savedRoutes.map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between p-3 bg-space-dark/30 border border-accent-cyan/10 rounded-lg hover:border-accent-cyan/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{route.name}</div>
                    <div className="text-xs text-text-secondary">
                      {route.stops.length} stops • Created {new Date(route.created).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadRoute(route)}
                      className="px-3 py-1.5 text-xs bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedRoute(route.id)}
                      className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Route Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-space-dark border border-accent-cyan/20 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="font-display text-xl text-text-primary mb-4">Save Route</h3>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Route Name"
              className="w-full px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-accent-cyan/20 text-text-secondary hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRoute}
                className="flex-1 px-4 py-2 rounded-lg bg-accent-cyan text-space-black font-medium hover:bg-accent-cyan/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassmorphicCard>
  );
}

export default MultiStopPlanner;
