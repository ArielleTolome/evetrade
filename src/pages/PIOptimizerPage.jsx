import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { FormInput, FormSelect, RegionAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { ActionableError } from '../components/common/ActionableError';
import { useToast } from '../components/common/ToastProvider';
import { usePIOptimizer } from '../hooks/usePIOptimizer';
import { useEveAuth } from '../hooks/useEveAuth';
import { useResources } from '../hooks/useResources';
import { formatISK, formatNumber, formatPercent, formatCompact } from '../utils/formatters';
import { getCharacterPlanets } from '../api/esi';

/**
 * PI Tier Options for filtering
 */
const PI_TIER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'P0', label: 'P0 - Raw Materials' },
  { value: 'P1', label: 'P1 - Processed' },
  { value: 'P2', label: 'P2 - Refined' },
  { value: 'P3', label: 'P3 - Specialized' },
  { value: 'P4', label: 'P4 - Advanced' },
];

/**
 * Get tier color for badge display
 */
const getTierColor = (tier) => {
  const colors = {
    P0: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    P1: 'bg-green-500/20 text-green-400 border-green-500/30',
    P2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    P3: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    P4: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return colors[tier] || 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30';
};

/**
 * Get liquidity indicator color
 */
const getLiquidityColor = (liquidity) => {
  const colors = {
    High: 'text-green-400',
    Medium: 'text-yellow-400',
    Low: 'text-red-400',
  };
  return colors[liquidity] || 'text-text-secondary';
};

/**
 * PI Optimizer Page Component
 */
export function PIOptimizerPage() {
  const navigate = useNavigate();
  const { universeList, loading: resourcesLoading } = useResources();
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const {
    data,
    loading,
    error,
    lastUpdated,
    fetchPIOpportunities,
    getOpportunitiesByTier,
    calculateSummary,
  } = usePIOptimizer();

  // Form state
  const [form, setForm] = useState({
    region: 'The Forge',
    tier: 'all',
    minProfit: 0,
    minROI: 0,
    minVolume: 0,
  });

  // Character PI state
  const [planets, setPlanets] = useState([]);
  const [planetsLoading, setPlanetsLoading] = useState(false);

  // Active tier filter for tabs
  const [activeTier, setActiveTier] = useState('all');

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Form error state
  const [formError, setFormError] = useState(null);

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Get region ID from name
  const getRegionId = useCallback(
    (regionName) => {
      if (!universeList || !regionName) return null;

      const regionEntry = Object.values(universeList).find(
        (entry) => entry.regionName === regionName
      );
      return regionEntry?.region || null;
    },
    [universeList]
  );

  const loadCharacterPlanets = useCallback(async () => {
    const characterId = character?.id;
    if (!characterId) return;

    setPlanetsLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const planetsData = await getCharacterPlanets(characterId, accessToken);
      setPlanets(planetsData || []);
    } catch (err) {
      console.error('Failed to load planets:', err);
      setPlanets([]);
    } finally {
      setPlanetsLoading(false);
    }
  }, [character?.id, getAccessToken]);

  // Load character planets when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadCharacterPlanets();
    }
  }, [isAuthenticated, character?.id, loadCharacterPlanets]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);

      const regionId = getRegionId(form.region);
      if (!regionId) {
        setFormError('Please select a valid region');
        return;
      }

      try {
        const accessToken = isAuthenticated ? await getAccessToken() : null;
        await fetchPIOpportunities({
          regionId,
          tier: form.tier,
          minProfit: form.minProfit,
          minROI: form.minROI,
          minVolume: form.minVolume,
          characterId: character?.id,
          accessToken,
        });
      } catch (err) {
        console.error('PI optimizer request failed:', err);
      }
    },
    [form, getRegionId, fetchPIOpportunities, isAuthenticated, getAccessToken, character]
  );

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text, message = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      setToastMessage('Failed to copy');
    }
  }, []);

  // Copy item name
  const copyItemName = useCallback(
    (itemName) => {
      copyToClipboard(itemName, 'Item name copied!');
    },
    [copyToClipboard]
  );

  // Filter data by active tier
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (activeTier === 'all') return data;
    return data.filter((item) => item['Tier'] === activeTier);
  }, [data, activeTier]);

  // Get opportunities grouped by tier
  const tierGroups = useMemo(() => {
    if (!data) return null;
    return getOpportunitiesByTier(data);
  }, [data, getOpportunitiesByTier]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!data) return null;
    return calculateSummary(data);
  }, [data, calculateSummary]);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'Item',
        label: 'Material Name',
        className: 'font-medium min-w-[180px]',
        render: (data, row) => {
          const itemName = row.Item || row.name;
          return (
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  copyItemName(itemName);
                }}
                variant="ghost"
                size="sm"
                className="p-1 h-auto min-h-0"
                title="Copy item name"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
              <span className="truncate">{itemName}</span>
            </div>
          );
        },
      },
      {
        key: 'Tier',
        label: 'Tier',
        className: 'text-center',
        render: (tier) => (
          <span className={`px-2 py-1 text-xs rounded-full border ${getTierColor(tier)}`}>
            {tier}
          </span>
        ),
      },
      {
        key: 'Buy Price',
        label: 'Buy Price',
        type: 'num',
        className: 'text-right',
        render: (price) => (
          <span className="font-mono text-text-secondary">{formatCompact(price)}</span>
        ),
      },
      {
        key: 'Sell Price',
        label: 'Sell Price',
        type: 'num',
        className: 'text-right',
        render: (price) => (
          <span className="font-mono text-text-primary">{formatCompact(price)}</span>
        ),
      },
      {
        key: 'Spread',
        label: 'Spread %',
        type: 'num',
        className: 'text-right',
        render: (spread) => {
          const spreadPercent = spread || 0;
          return (
            <span
              className={`font-mono font-semibold ${
                spreadPercent > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {spreadPercent > 0 ? '+' : ''}
              {formatPercent(spreadPercent / 100, 1)}
            </span>
          );
        },
      },
      {
        key: 'Daily Sell Volume',
        label: 'Daily Volume',
        type: 'num',
        className: 'text-right',
        render: (volume) => (
          <span className="font-mono text-text-secondary">{formatNumber(volume, 0)}</span>
        ),
      },
      {
        key: 'Profit per Unit',
        label: 'Profit/m³',
        type: 'num',
        className: 'text-right',
        render: (profit) => (
          <span
            className={`font-mono font-semibold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {profit > 0 ? '+' : ''}
            {formatCompact(profit)}
          </span>
        ),
      },
      {
        key: 'ROI',
        label: 'ROI %',
        type: 'num',
        defaultSort: true,
        className: 'text-right',
        render: (roi) => (
          <span className={`font-mono font-semibold ${roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {roi > 0 ? '+' : ''}
            {formatPercent(roi / 100, 1)}
          </span>
        ),
      },
      {
        key: 'Liquidity',
        label: 'Liquidity',
        className: 'text-center',
        render: (liquidity) => (
          <span className={`font-medium ${getLiquidityColor(liquidity)}`}>{liquidity}</span>
        ),
      },
    ],
    [copyItemName]
  );

  // Handle row click - navigate to orders page
  const handleRowClick = useCallback(
    (item) => {
      const itemId = item['Item ID'] || item.itemId;
      const regionId = getRegionId(form.region);
      if (!itemId || !regionId) return;

      const fromLocation = `${regionId}:market`;
      navigate(`/orders?itemId=${itemId}&from=${fromLocation}&to=${fromLocation}`);
    },
    [form.region, getRegionId, navigate]
  );

  return (
    <PageLayout title="PI Optimizer" subtitle="Analyze Planetary Interaction opportunities">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toast for copy feedback */}
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} type="success" />}

        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Error Display */}
            {formError && (
              <div
                className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                role="alert"
              >
                {formError}
              </div>
            )}

            {/* Region and Tier Selection */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <RegionAutocomplete
                label="Market Region"
                value={form.region}
                onChange={(v) => updateForm('region', v)}
                placeholder="The Forge, Domain, Sinq Laison..."
                required
              />
              <FormSelect
                label="PI Tier Filter"
                value={form.tier}
                onChange={(v) => updateForm('tier', v)}
                options={PI_TIER_OPTIONS}
              />
            </div>

            {/* Filtering Parameters */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <FormInput
                label="Min Profit per Unit"
                type="number"
                value={form.minProfit}
                onChange={(v) => updateForm('minProfit', v)}
                suffix="ISK"
                min={0}
              />
              <FormInput
                label="Min ROI"
                type="number"
                value={form.minROI}
                onChange={(v) => updateForm('minROI', v)}
                suffix="%"
                min={0}
              />
              <FormInput
                label="Min Daily Volume"
                type="number"
                value={form.minVolume}
                onChange={(v) => updateForm('minVolume', v)}
                suffix="units"
                min={0}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || resourcesLoading}
              variant="primary"
              size="lg"
              className="w-full text-base md:text-lg min-h-[44px]"
              loading={loading}
            >
              {loading ? 'Analyzing PI Markets...' : 'Find PI Opportunities'}
            </Button>
          </form>
        </GlassmorphicCard>

        {/* Character PI Planets Panel */}
        {isAuthenticated && (
          <GlassmorphicCard className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-display text-text-primary">Your PI Colonies</h3>
                <p className="text-sm text-text-secondary">
                  Character: <span className="text-accent-cyan">{character?.name}</span>
                </p>
              </div>
              <Button
                onClick={loadCharacterPlanets}
                variant="secondary"
                size="sm"
                loading={planetsLoading}
              >
                Refresh Colonies
              </Button>
            </div>

            {planetsLoading ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
                <span>Loading your PI colonies...</span>
              </div>
            ) : planets.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {planets.map((planet, idx) => (
                  <div
                    key={planet.planet_id || idx}
                    className="p-4 rounded-lg bg-space-dark/50 border border-accent-cyan/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-primary font-medium">
                        {planet.planet_type || 'Unknown'}
                      </span>
                      <span className="text-xs text-text-secondary">
                        Level {planet.upgrade_level || 0}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {planet.num_pins || 0} pins installed
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">
                No PI colonies found. Start your PI empire by visiting a planet!
              </p>
            )}
          </GlassmorphicCard>
        )}

        {/* Error */}
        {error && (
          <ActionableError
            error={error}
            onRetry={() => handleSubmit({ preventDefault: () => {} })}
            className="mb-8"
          />
        )}

        {/* Loading */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={10} columns={9} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {/* Summary Statistics */}
            {summary && (
              <GlassmorphicCard className="mb-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Total Opportunities</div>
                    <div className="text-2xl font-display text-accent-cyan">
                      {formatNumber(summary.totalOpportunities, 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Avg ROI</div>
                    <div className="text-2xl font-display text-green-400">
                      {formatPercent(summary.avgROI / 100, 1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Avg Profit</div>
                    <div className="text-2xl font-display text-accent-gold">
                      {formatCompact(summary.avgProfit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Best ROI</div>
                    <div className="text-lg font-display text-text-primary">
                      {summary.highestROI?.Item || 'N/A'}
                    </div>
                    <div className="text-xs text-green-400">
                      {summary.highestROI
                        ? formatPercent(summary.highestROI.ROI / 100, 1)
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary mb-1">Best Profit</div>
                    <div className="text-lg font-display text-text-primary">
                      {summary.highestProfit?.Item || 'N/A'}
                    </div>
                    <div className="text-xs text-accent-gold">
                      {summary.highestProfit
                        ? formatCompact(summary.highestProfit['Profit per Unit'])
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
            )}

            {/* Tier Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTier('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTier === 'all'
                    ? 'bg-accent-cyan text-space-black'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10'
                }`}
              >
                All Tiers ({data.length})
              </button>
              {['P0', 'P1', 'P2', 'P3', 'P4'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTier === tier
                      ? `${getTierColor(tier).replace('/20', '/30').replace('border-', 'bg-')}`
                      : 'bg-white/5 text-text-secondary hover:bg-white/10'
                  }`}
                >
                  {tier} ({tierGroups?.[tier]?.length || 0})
                </button>
              ))}
            </div>

            {/* PI Tier Information */}
            <GlassmorphicCard className="mb-6">
              <h3 className="text-lg font-display text-text-primary mb-3">PI Tier Guide</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className={`px-2 py-1 rounded border text-xs ${getTierColor('P0')}`}>
                    P0
                  </span>
                  <p className="mt-2 text-text-secondary">Raw materials extracted from planets</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded border text-xs ${getTierColor('P1')}`}>
                    P1
                  </span>
                  <p className="mt-2 text-text-secondary">Processed materials refined from P0</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded border text-xs ${getTierColor('P2')}`}>
                    P2
                  </span>
                  <p className="mt-2 text-text-secondary">Refined products from combined P1</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded border text-xs ${getTierColor('P3')}`}>
                    P3
                  </span>
                  <p className="mt-2 text-text-secondary">Specialized components from P2</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded border text-xs ${getTierColor('P4')}`}>
                    P4
                  </span>
                  <p className="mt-2 text-text-secondary">Advanced products, most valuable</p>
                </div>
              </div>
            </GlassmorphicCard>

            {filteredData.length === 0 ? (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">No PI opportunities found.</p>
                <p className="text-text-secondary/70 mt-2">
                  Try adjusting your filters or selecting a different region.
                </p>
              </GlassmorphicCard>
            ) : (
              <>
                {/* Action Bar */}
                <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    <div className="text-text-secondary text-sm">
                      Showing{' '}
                      <span className="text-accent-cyan font-medium">{filteredData.length}</span> PI
                      opportunities
                    </div>
                    <DataFreshnessIndicator
                      lastUpdated={lastUpdated}
                      onRefresh={() => handleSubmit({ preventDefault: () => {} })}
                      isLoading={loading}
                      compact
                    />
                  </div>
                </div>

                {/* Full Results Table */}
                <TradingTable
                  tableId="pi-optimizer-table"
                  data={filteredData}
                  columns={tableColumns}
                  onRowClick={handleRowClick}
                  defaultSort={{ column: 'ROI', direction: 'desc' }}
                  emptyMessage="No PI opportunities found"
                />
              </>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default PIOptimizerPage;
