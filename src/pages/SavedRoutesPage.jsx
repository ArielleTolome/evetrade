import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { usePortfolio } from '../hooks/usePortfolio';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Route Card Component
 */
function RouteCard({ route, onDelete, onNavigate }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const getRouteTypeLabel = (type) => {
    switch (type) {
      case 'station-trading':
        return { label: 'Station Trading', color: 'text-accent-cyan', bg: 'bg-accent-cyan/20' };
      case 'station-hauling':
        return { label: 'Station Hauling', color: 'text-accent-purple', bg: 'bg-accent-purple/20' };
      case 'region-hauling':
        return { label: 'Region Hauling', color: 'text-accent-gold', bg: 'bg-accent-gold/20' };
      default:
        return { label: 'Trade Route', color: 'text-text-secondary', bg: 'bg-white/10' };
    }
  };

  const typeInfo = getRouteTypeLabel(route.type);

  return (
    <GlassmorphicCard className="relative group">
      {/* Route Type Badge */}
      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
        {typeInfo.label}
      </div>

      {/* Route Name */}
      <h3 className="font-display text-lg text-text-primary mb-2 pr-24">
        {route.name || 'Unnamed Route'}
      </h3>

      {/* Route Details */}
      <div className="space-y-2 text-sm text-text-secondary mb-4">
        {route.from && (
          <div className="flex items-center gap-2">
            <span className="text-accent-cyan">From:</span>
            <span className="text-text-primary truncate">{route.from}</span>
          </div>
        )}
        {route.to && (
          <div className="flex items-center gap-2">
            <span className="text-accent-gold">To:</span>
            <span className="text-text-primary truncate">{route.to}</span>
          </div>
        )}
        {route.station && (
          <div className="flex items-center gap-2">
            <span className="text-accent-cyan">Station:</span>
            <span className="text-text-primary truncate">{route.station}</span>
          </div>
        )}
      </div>

      {/* Parameters Summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        {route.minProfit && (
          <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
            Min: {formatISK(route.minProfit, false)}
          </span>
        )}
        {route.minROI && (
          <span className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400">
            ROI: {route.minROI}%+
          </span>
        )}
        {route.maxWeight && (
          <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
            {formatNumber(route.maxWeight, 0)} m³
          </span>
        )}
      </div>

      {/* Last Run Stats */}
      {route.lastRunAt && (
        <div className="text-xs text-text-secondary/70 mb-4">
          Last run: {new Date(route.lastRunAt).toLocaleDateString()}
          {route.lastRunProfit && (
            <span className="ml-2 text-green-400">
              ({formatISK(route.lastRunProfit, false)} profit)
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={() => onNavigate(route)}
          variant="primary"
          size="sm"
          className="flex-1 py-2"
        >
          Run Search
        </Button>
        {showConfirmDelete ? (
          <>
            <Button
              onClick={() => {
                onDelete(route.id);
                setShowConfirmDelete(false);
              }}
              variant="danger"
              size="sm"
              className="px-4 py-2"
            >
              Confirm
            </Button>
            <Button
              onClick={() => setShowConfirmDelete(false)}
              variant="ghost"
              size="sm"
              className="px-4 py-2 text-text-secondary hover:bg-white/20"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setShowConfirmDelete(true)}
            variant="ghost"
            size="sm"
            className="px-4 py-2 text-text-secondary hover:bg-red-500/20 hover:text-red-400"
          >
            Delete
          </Button>
        )}
      </div>

      {/* Created Date */}
      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-text-secondary/50">
        Created: {new Date(route.createdAt).toLocaleDateString()}
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  const navigate = useNavigate();

  return (
    <GlassmorphicCard className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>
      <h3 className="text-xl font-display text-text-primary mb-2">No Saved Routes</h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        Save your favorite trade routes to quickly access them later. Start by searching for trades and clicking "Save Route".
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => navigate('/station-trading')}
          variant="primary"
          className="px-6 py-2"
        >
          Station Trading
        </Button>
        <Button
          onClick={() => navigate('/station-hauling')}
          variant="secondary"
          className="px-6 py-2"
        >
          Station Hauling
        </Button>
        <Button
          onClick={() => navigate('/region-hauling')}
          variant="secondary"
          className="px-6 py-2"
        >
          Region Hauling
        </Button>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Saved Routes Page Component
 */
export function SavedRoutesPage() {
  const navigate = useNavigate();
  const { savedRoutes, deleteRoute, isLoaded, exportData, importData } = usePortfolio();
  const [filter, setFilter] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const [importValue, setImportValue] = useState('');

  // Filter routes
  const filteredRoutes = useMemo(() => {
    if (filter === 'all') return savedRoutes;
    return savedRoutes.filter((r) => r.type === filter);
  }, [savedRoutes, filter]);

  // Navigate to the appropriate page with route params
  const handleNavigate = useCallback((route) => {
    const params = new URLSearchParams();

    // Build query params based on route type
    Object.entries(route.params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const path = route.type === 'station-trading'
      ? '/station-trading'
      : route.type === 'station-hauling'
        ? '/station-hauling'
        : '/region-hauling';

    navigate(`${path}${queryString ? `?${queryString}` : ''}`);
  }, [navigate]);

  // Handle export
  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evetrade-portfolio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  // Handle import
  const handleImport = useCallback(() => {
    if (importData(importValue)) {
      setShowImport(false);
      setImportValue('');
    } else {
      alert('Invalid data format. Please paste valid JSON.');
    }
  }, [importData, importValue]);

  if (!isLoaded) {
    return (
      <PageLayout title="Saved Routes" subtitle="Loading...">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="animate-pulse h-64" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Saved Routes"
      subtitle="Your favorite trade routes for quick access"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Filters */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Routes' },
              { value: 'station-trading', label: 'Station Trading' },
              { value: 'station-hauling', label: 'Station Hauling' },
              { value: 'region-hauling', label: 'Region Hauling' },
            ].map((f) => (
              <Button
                key={f.value}
                onClick={() => setFilter(f.value)}
                variant={filter === f.value ? 'secondary' : 'ghost'}
                className={`px-4 py-2 text-sm font-medium ${filter === f.value
                  ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 border-transparent'
                  }`}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Import/Export */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowImport(!showImport)}
              variant="ghost"
              size="sm"
              className="px-4 py-2 bg-white/10 text-text-secondary hover:bg-white/20"
            >
              Import
            </Button>
            <Button
              onClick={handleExport}
              variant="ghost"
              size="sm"
              className="px-4 py-2 bg-white/10 text-text-secondary hover:bg-white/20"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Import Panel */}
        {showImport && (
          <GlassmorphicCard className="mb-8">
            <h3 className="font-display text-lg text-text-primary mb-4">Import Portfolio Data</h3>
            <textarea
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="Paste your exported JSON data here..."
              className="w-full h-32 px-4 py-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan resize-none font-mono text-sm"
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleImport}
                variant="primary"
                className="px-6 py-2"
              >
                Import Data
              </Button>
              <Button
                onClick={() => {
                  setShowImport(false);
                  setImportValue('');
                }}
                variant="secondary"
                className="px-6 py-2"
              >
                Cancel
              </Button>
            </div>
          </GlassmorphicCard>
        )}

        {/* Routes Grid or Empty State */}
        {filteredRoutes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <GlassmorphicCard padding="p-4">
                <div className="text-2xl font-bold text-accent-cyan">{savedRoutes.length}</div>
                <div className="text-sm text-text-secondary">Total Routes</div>
              </GlassmorphicCard>
              <GlassmorphicCard padding="p-4">
                <div className="text-2xl font-bold text-accent-purple">
                  {savedRoutes.filter((r) => r.type === 'station-trading').length}
                </div>
                <div className="text-sm text-text-secondary">Station Trading</div>
              </GlassmorphicCard>
              <GlassmorphicCard padding="p-4">
                <div className="text-2xl font-bold text-accent-gold">
                  {savedRoutes.filter((r) => r.type === 'station-hauling').length}
                </div>
                <div className="text-sm text-text-secondary">Station Hauling</div>
              </GlassmorphicCard>
              <GlassmorphicCard padding="p-4">
                <div className="text-2xl font-bold text-green-400">
                  {savedRoutes.filter((r) => r.type === 'region-hauling').length}
                </div>
                <div className="text-sm text-text-secondary">Region Hauling</div>
              </GlassmorphicCard>
            </div>

            {/* Routes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onDelete={deleteRoute}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default SavedRoutesPage;
