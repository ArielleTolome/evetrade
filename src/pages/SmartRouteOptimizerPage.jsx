import { useState, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { FormInput, FormSelect, SystemAutocomplete } from '../components/forms';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { ActionableError } from '../components/common/ActionableError';
import { useRouteOptimizer } from '../hooks/useRouteOptimizer';
import { useResources } from '../hooks/useResources';
// import { formatISK, formatCompact } from '../utils/formatters'; // Unused
import { getSecurityColors, formatSecurityStatus } from '../utils/security';

/**
 * Route preference options
 */
const ROUTE_PREFERENCES = [
  { value: 'shortest', label: 'Shortest' },
  { value: 'secure', label: 'Secure (High-sec only)' },
  { value: 'insecure', label: 'Insecure (Fastest, any security)' },
];

/**
 * Risk rating colors and labels
 */
const RISK_RATINGS = {
  minimal: { label: 'Minimal', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  low: { label: 'Low', color: 'text-green-300', bg: 'bg-green-500/15', border: 'border-green-500/20' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  extreme: { label: 'Extreme', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

/**
 * Known dangerous systems
 */
const KNOWN_DANGERS = {
  'Uedama': 'High-sec gank hotspot',
  'Niarja': 'High-sec gank hotspot',
  'Sivala': 'High-sec gank hotspot',
  'Madirmilire': 'High-sec gank hotspot',
  'Hatakani': 'Low-sec chokepoint',
  'Rancer': 'Low-sec gank hotspot',
  'Amamake': 'Low-sec gank hotspot',
  'Tama': 'Low-sec gank hotspot',
};

/**
 * Smart Route Optimizer Page Component
 */
export function SmartRouteOptimizerPage() {
  const { universeList, loading: resourcesLoading } = useResources();
  const {
    route,
    loading,
    error,
    calculateRoute,
    compareRoutes,
    comparison,
    clearCache,
  } = useRouteOptimizer();

  // Form state
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    preference: 'shortest',
    cargoValue: '',
    avoidSystems: [],
  });

  // UI state
  const [showComparison, setShowComparison] = useState(false);
  const [formError, setFormError] = useState(null);

  // Get system ID from system name
  const getSystemId = useCallback(
    (systemName) => {
      if (!universeList || !systemName) return null;

      // Find any station in this system to get the system ID
      const stationData = Object.values(universeList).find(
        (data) => data.system === systemName
      );

      return stationData?.systemId || null;
    },
    [universeList]
  );

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle single route calculation
  const handleCalculateRoute = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);
      setShowComparison(false);

      const originId = getSystemId(form.origin);
      const destinationId = getSystemId(form.destination);

      if (!originId) {
        setFormError('Please select a valid origin system');
        return;
      }

      if (!destinationId) {
        setFormError('Please select a valid destination system');
        return;
      }

      if (originId === destinationId) {
        setFormError('Origin and destination must be different systems');
        return;
      }

      try {
        await calculateRoute({
          origin: originId,
          destination: destinationId,
          preference: form.preference,
          cargoValue: form.cargoValue ? parseFloat(form.cargoValue) : null,
          avoidSystems: form.avoidSystems,
        });
      } catch (err) {
        console.error('Route calculation failed:', err);
      }
    },
    [form, getSystemId, calculateRoute]
  );

  // Handle route comparison
  const handleCompareRoutes = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);

      const originId = getSystemId(form.origin);
      const destinationId = getSystemId(form.destination);

      if (!originId) {
        setFormError('Please select a valid origin system');
        return;
      }

      if (!destinationId) {
        setFormError('Please select a valid destination system');
        return;
      }

      if (originId === destinationId) {
        setFormError('Origin and destination must be different systems');
        return;
      }

      try {
        await compareRoutes(
          originId,
          destinationId,
          form.cargoValue ? parseFloat(form.cargoValue) : null,
          form.avoidSystems
        );
        setShowComparison(true);
      } catch (err) {
        console.error('Route comparison failed:', err);
      }
    },
    [form, getSystemId, compareRoutes]
  );

  // Render risk rating badge
  const renderRiskBadge = (rating) => {
    const riskInfo = RISK_RATINGS[rating] || RISK_RATINGS.medium;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${riskInfo.bg} ${riskInfo.color} border ${riskInfo.border}`}
      >
        {riskInfo.label}
      </span>
    );
  };

  // Render system row in route breakdown
  const renderSystemRow = (system, index) => {
    const security = system.security ?? 0;
    const colors = getSecurityColors(security);
    const danger = KNOWN_DANGERS[system.name];

    return (
      <div
        key={`${system.system_id}-${index}`}
        className={`flex items-center justify-between p-3 rounded-lg border ${danger ? 'bg-red-500/5 border-red-500/30' : 'bg-white/5 border-white/10'
          }`}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-text-secondary text-sm font-mono w-8">{index + 1}</span>
          <div className="flex-1">
            <div className="font-medium text-text-primary">{system.name}</div>
            {danger && (
              <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {danger}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`px-2 py-1 rounded text-xs font-mono font-semibold ${colors.bg} text-space-black`}
          >
            {formatSecurityStatus(security)}
          </span>
          {system.risk_score !== undefined && (
            <span className="text-text-secondary text-sm">
              Risk: <span className="font-medium text-text-primary">{system.risk_score}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  // Render single route details
  const renderRouteDetails = (routeData) => {
    if (!routeData || routeData.error) {
      return (
        <div className="text-center py-8 text-text-secondary">
          {routeData?.error || 'No route data available'}
        </div>
      );
    }

    const stats = routeData.statistics || {};

    return (
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
            <div className="text-text-secondary text-sm mb-1">Total Jumps</div>
            <div className="text-2xl font-bold text-accent-cyan">{stats.total_jumps || 0}</div>
          </div>
          <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
            <div className="text-text-secondary text-sm mb-1">Travel Time</div>
            <div className="text-2xl font-bold text-accent-purple">{stats.estimated_time || 'N/A'}</div>
          </div>
          <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
            <div className="text-text-secondary text-sm mb-1">Risk Rating</div>
            <div className="mt-2">{renderRiskBadge(stats.risk_rating || 'medium')}</div>
          </div>
          <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
            <div className="text-text-secondary text-sm mb-1">Jump Fatigue</div>
            <div className="text-2xl font-bold text-accent-gold">{stats.jump_fatigue || 'N/A'}</div>
          </div>
        </div>

        {/* Security Breakdown */}
        <div className="bg-space-dark/30 rounded-lg p-4 border border-white/10">
          <h3 className="text-text-primary font-semibold mb-3">Security Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-text-secondary text-sm">High-Sec</div>
              <div className="text-lg font-bold text-green-400">{stats.high_sec_systems || 0} systems</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Low-Sec</div>
              <div className="text-lg font-bold text-yellow-400">{stats.low_sec_systems || 0} systems</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Null-Sec</div>
              <div className="text-lg font-bold text-red-400">{stats.null_sec_systems || 0} systems</div>
            </div>
          </div>
        </div>

        {/* System-by-System Breakdown */}
        {routeData.route && routeData.route.length > 0 && (
          <div>
            <h3 className="text-text-primary font-semibold mb-3">Route Details ({routeData.route.length} systems)</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {routeData.route.map((system, index) => renderSystemRow(system, index))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render comparison view
  const renderComparison = () => {
    if (!comparison) return null;

    const routes = comparison.routes || {};
    // const validRoutes = routes.filter(route => route && route.jumps > 0);

    return (
      <div className="space-y-6">
        {/* Recommendation */}
        {comparison.recommendation && (
          <GlassmorphicCard className="bg-accent-cyan/10 border-accent-cyan/30">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-accent-cyan" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <div className="text-text-primary font-semibold">Recommended: {ROUTE_PREFERENCES.find(p => p.value === comparison.recommendation.preference)?.label}</div>
                <div className="text-text-secondary text-sm mt-1">{comparison.recommendation.reason}</div>
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {ROUTE_PREFERENCES.map(({ value, label }) => {
            const routeData = routes[value];
            const isRecommended = comparison.recommendation?.preference === value;

            return (
              <GlassmorphicCard
                key={value}
                className={`${isRecommended ? 'ring-2 ring-accent-cyan' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">{label}</h3>
                  {isRecommended && (
                    <span className="text-xs px-2 py-1 rounded-full bg-accent-cyan text-space-black font-medium">
                      Recommended
                    </span>
                  )}
                </div>

                {routeData?.error ? (
                  <div className="text-red-400 text-sm">{routeData.error}</div>
                ) : routeData ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-text-secondary text-xs">Jumps</div>
                      <div className="text-xl font-bold text-accent-cyan">{routeData.statistics?.total_jumps || 0}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-xs">Time</div>
                      <div className="text-sm font-medium text-text-primary">{routeData.statistics?.estimated_time || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-xs">Risk</div>
                      <div className="mt-1">{renderRiskBadge(routeData.statistics?.risk_rating || 'medium')}</div>
                    </div>
                    <div className="pt-3 border-t border-white/10 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">High-Sec:</span>
                        <span className="text-green-400 font-medium">{routeData.statistics?.high_sec_systems || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Low-Sec:</span>
                        <span className="text-yellow-400 font-medium">{routeData.statistics?.low_sec_systems || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Null-Sec:</span>
                        <span className="text-red-400 font-medium">{routeData.statistics?.null_sec_systems || 0}</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        setShowComparison(false);
                        updateForm('preference', value);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-text-secondary text-sm">Loading...</div>
                )}
              </GlassmorphicCard>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <PageLayout
      title="Smart Route Optimizer"
      subtitle="Find the safest and most efficient routes through New Eden"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleCalculateRoute} className="space-y-6">
            {/* Form Error Display */}
            {formError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm" role="alert">
                {formError}
              </div>
            )}

            {/* Origin and Destination */}
            <div className="grid md:grid-cols-2 gap-6">
              <SystemAutocomplete
                label="Origin System"
                value={form.origin}
                onChange={(v) => updateForm('origin', v)}
                placeholder="Jita, Amarr, Dodixie..."
                required
                excludeSystems={form.destination ? [form.destination] : []}
              />
              <SystemAutocomplete
                label="Destination System"
                value={form.destination}
                onChange={(v) => updateForm('destination', v)}
                placeholder="Select destination..."
                required
                excludeSystems={form.origin ? [form.origin] : []}
              />
            </div>

            {/* Route Preferences */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormSelect
                label="Route Preference"
                value={form.preference}
                onChange={(v) => updateForm('preference', v)}
                options={ROUTE_PREFERENCES}
              />
              <FormInput
                label="Cargo Value (optional)"
                type="number"
                value={form.cargoValue}
                onChange={(v) => updateForm('cargoValue', v)}
                placeholder="0"
                suffix="ISK"
                helper="Used for risk calculation"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading || resourcesLoading}
                variant="primary"
                size="lg"
                className="flex-1 text-base"
                loading={loading}
              >
                {loading ? 'Calculating...' : 'Calculate Route'}
              </Button>
              <Button
                type="button"
                onClick={handleCompareRoutes}
                disabled={loading || resourcesLoading}
                variant="secondary"
                size="lg"
                className="flex-1 text-base"
              >
                Compare Routes
              </Button>
            </div>
          </form>
        </GlassmorphicCard>

        {/* Error */}
        {error && (
          <ActionableError
            error={error}
            onRetry={() => handleCalculateRoute({ preventDefault: () => { } })}
            className="mb-8"
          />
        )}

        {/* Loading */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={10} columns={4} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {!loading && (showComparison ? comparison : route) && (
          <GlassmorphicCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-text-primary">
                {showComparison ? 'Route Comparison' : 'Route Details'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCache();
                  setShowComparison(false);
                }}
              >
                Clear
              </Button>
            </div>
            {showComparison ? renderComparison() : renderRouteDetails(route)}
          </GlassmorphicCard>
        )}
      </div>
    </PageLayout>
  );
}

export default SmartRouteOptimizerPage;
