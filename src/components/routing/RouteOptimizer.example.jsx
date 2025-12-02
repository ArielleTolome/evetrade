import { useState } from 'react';
import { useRouteOptimizer } from '../../hooks/useRouteOptimizer';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { FormInput } from '../forms/FormInput';
import { FormSelect } from '../forms/FormSelect';
import { SecurityBadge } from '../common/SecurityBadge';

/**
 * Route Optimizer Example Component
 *
 * Demonstrates how to use the useRouteOptimizer hook
 * to calculate routes with risk analysis
 */
export function RouteOptimizerExample() {
  const [originId, setOriginId] = useState('30000142'); // Jita
  const [destinationId, setDestinationId] = useState('30002187'); // Amarr
  const [preference, setPreference] = useState('shortest');
  const [cargoValue, setCargoValue] = useState('5000000000'); // 5B ISK
  const [avoidSystems, setAvoidSystems] = useState('');

  const {
    route,
    loading,
    error,
    calculateRoute,
    compareRoutes,
    comparison,
    calculateIskPerJump,
    getSuggestedAlternatives,
  } = useRouteOptimizer();

  // Sample trade data for ISK/jump calculation
  const [tradeProfit] = useState(50000000); // 50M ISK profit

  const handleCalculate = async () => {
    const avoidSystemIds = avoidSystems
      ? avoidSystems.split(',').map(id => parseInt(id.trim(), 10)).filter(Boolean)
      : [];

    await calculateRoute({
      origin: parseInt(originId, 10),
      destination: parseInt(destinationId, 10),
      preference,
      cargoValue: cargoValue ? parseInt(cargoValue, 10) : null,
      avoidSystems: avoidSystemIds,
    });
  };

  const handleCompare = async () => {
    await compareRoutes(
      parseInt(originId, 10),
      parseInt(destinationId, 10),
      cargoValue ? parseInt(cargoValue, 10) : null
    );
  };

  const iskPerJump = route ? calculateIskPerJump(route, tradeProfit) : 0;
  const suggestions = route ? getSuggestedAlternatives(route) : [];

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <GlassmorphicCard title="Route Configuration">
        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="Origin System ID"
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            placeholder="e.g., 30000142 (Jita)"
          />

          <FormInput
            label="Destination System ID"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            placeholder="e.g., 30002187 (Amarr)"
          />

          <FormSelect
            label="Route Preference"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            options={[
              { value: 'shortest', label: 'Shortest (any sec)' },
              { value: 'secure', label: 'Secure (high-sec only)' },
              { value: 'insecure', label: 'Insecure (shortest, any risk)' },
            ]}
          />

          <FormInput
            label="Cargo Value (ISK)"
            value={cargoValue}
            onChange={(e) => setCargoValue(e.target.value)}
            placeholder="e.g., 5000000000"
            type="number"
          />

          <FormInput
            label="Avoid Systems (comma-separated IDs)"
            value={avoidSystems}
            onChange={(e) => setAvoidSystems(e.target.value)}
            placeholder="e.g., 30002659, 30002305"
            className="md:col-span-2"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="px-4 py-2 bg-accent-cyan/20 border border-accent-cyan hover:bg-accent-cyan/30 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Route'}
          </button>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500 hover:bg-blue-500/30 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Comparing...' : 'Compare All Routes'}
          </button>
        </div>

        {/* Sample System IDs */}
        <div className="mt-4 p-3 bg-space-dark/30 rounded-lg">
          <h4 className="text-sm font-medium text-text-primary mb-2">Sample System IDs:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div>Jita: 30000142</div>
            <div>Amarr: 30002187</div>
            <div>Dodixie: 30002659</div>
            <div>Rens: 30002510</div>
            <div>Hek: 30002053</div>
            <div>Perimeter: 30000144</div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      )}

      {/* Route Result */}
      {route && (
        <GlassmorphicCard title="Route Analysis">
          {/* Route Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-display text-text-primary">
                  {route.origin.name} → {route.destination.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  Preference: <span className="text-accent-cyan">{route.preference}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent-cyan">
                  {route.statistics.total_jumps} jumps
                </div>
                <div className="text-sm text-text-secondary">
                  {route.statistics.estimated_time}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-space-dark/30 rounded-lg">
              <div className="text-xs text-text-secondary mb-1">High-Sec</div>
              <div className="text-lg font-bold text-green-400">
                {route.statistics.high_sec_systems}
              </div>
            </div>

            <div className="p-4 bg-space-dark/30 rounded-lg">
              <div className="text-xs text-text-secondary mb-1">Low-Sec</div>
              <div className="text-lg font-bold text-yellow-400">
                {route.statistics.low_sec_systems}
              </div>
            </div>

            <div className="p-4 bg-space-dark/30 rounded-lg">
              <div className="text-xs text-text-secondary mb-1">Null-Sec</div>
              <div className="text-lg font-bold text-red-400">
                {route.statistics.null_sec_systems}
              </div>
            </div>

            <div className="p-4 bg-space-dark/30 rounded-lg">
              <div className="text-xs text-text-secondary mb-1">Risk Rating</div>
              <div className={`text-lg font-bold ${getRiskColor(route.statistics.risk_rating)}`}>
                {route.statistics.risk_rating}
              </div>
            </div>
          </div>

          {/* Trade Metrics (if applicable) */}
          {tradeProfit > 0 && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-green-400 mb-2">Trade Efficiency</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-text-secondary">ISK per Jump</div>
                  <div className="text-lg font-bold text-green-400">
                    {iskPerJump.toLocaleString()} ISK
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Total Profit</div>
                  <div className="text-lg font-bold text-green-400">
                    {tradeProfit.toLocaleString()} ISK
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary">Jump Fatigue</div>
                  <div className="text-lg font-bold text-text-primary">
                    {route.statistics.jump_fatigue_minutes} min
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {route.recommendations.length > 0 && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Safety Recommendations</h4>
              <ul className="space-y-1">
                {route.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Alternatives */}
          {suggestions.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">Suggested Alternatives</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {suggestion.preference}
                      </div>
                      <div className="text-xs text-text-secondary">{suggestion.reason}</div>
                    </div>
                    <button
                      onClick={() => {
                        setPreference(suggestion.preference);
                        handleCalculate();
                      }}
                      className="text-xs px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded"
                    >
                      Try This
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Route Systems (first 10) */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Route Systems (showing first 10 of {route.route.length})
            </h4>
            <div className="space-y-2">
              {route.route.slice(0, 10).map((system, index) => (
                <div
                  key={system.system_id}
                  className="flex items-center justify-between p-3 bg-space-dark/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono text-text-secondary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {system.name}
                      </div>
                      {system.is_hotspot && (
                        <div className="text-xs text-red-400">
                          ⚠️ Gank Hotspot: {system.hotspot_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SecurityBadge security={system.security_status} />
                    <div className="text-right">
                      <div className="text-xs text-text-secondary">Risk</div>
                      <div className={`text-sm font-bold ${getRiskColor(getRiskLevel(system.risk_score))}`}>
                        {system.risk_score.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {route.route.length > 10 && (
              <div className="mt-2 text-xs text-text-secondary text-center">
                ... and {route.route.length - 10} more systems
              </div>
            )}
          </div>
        </GlassmorphicCard>
      )}

      {/* Route Comparison */}
      {comparison && (
        <GlassmorphicCard title="Route Comparison">
          <div className="mb-4">
            <h3 className="text-lg font-display text-text-primary mb-2">
              Recommended: {comparison.recommendation.preference}
            </h3>
            <p className="text-sm text-text-secondary">
              {comparison.recommendation.reason}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(comparison.routes).map(([pref, routeData]) => (
              <div
                key={pref}
                className={`p-4 border rounded-lg ${
                  pref === comparison.recommendation.preference
                    ? 'bg-accent-cyan/10 border-accent-cyan'
                    : 'bg-space-dark/30 border-accent-cyan/20'
                }`}
              >
                <h4 className="text-sm font-medium text-text-primary mb-3 capitalize">
                  {pref}
                  {pref === comparison.recommendation.preference && (
                    <span className="ml-2 text-xs text-accent-cyan">✓ Recommended</span>
                  )}
                </h4>

                {routeData.error ? (
                  <p className="text-sm text-red-400">{routeData.error}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Jumps</span>
                      <span className="text-text-primary font-medium">
                        {routeData.statistics.total_jumps}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Time</span>
                      <span className="text-text-primary font-medium">
                        {routeData.statistics.estimated_time}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Risk</span>
                      <span className={`font-medium ${getRiskColor(routeData.statistics.risk_rating)}`}>
                        {routeData.statistics.risk_rating}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Avg Risk</span>
                      <span className="text-text-primary font-medium">
                        {routeData.statistics.average_risk.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
}

// Helper functions
function getRiskColor(rating) {
  const colors = {
    minimal: 'text-green-400',
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    extreme: 'text-red-400',
  };
  return colors[rating] || 'text-text-secondary';
}

function getRiskLevel(riskScore) {
  if (riskScore < 1) return 'minimal';
  if (riskScore < 5) return 'low';
  if (riskScore < 15) return 'medium';
  if (riskScore < 40) return 'high';
  return 'extreme';
}

export default RouteOptimizerExample;
