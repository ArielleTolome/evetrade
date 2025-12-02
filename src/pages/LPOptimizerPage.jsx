import { useState, useCallback, useMemo, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { FormInput, FormSelect } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { ActionableError } from '../components/common/ActionableError';
import { useToast } from '../components/common/ToastProvider';
import { useLPOptimizer } from '../hooks/useLPOptimizer';
import { useEveAuth } from '../hooks/useEveAuth';
import { formatISK, formatNumber, formatPercent, formatCompact } from '../utils/formatters';

/**
 * Common EVE Online NPC Corporations for LP Store
 */
const COMMON_CORPORATIONS = [
  { value: 1000035, label: 'Caldari Navy' },
  { value: 1000125, label: 'Federation Navy' },
  { value: 1000080, label: 'Imperial Navy' },
  { value: 1000051, label: 'Republic Fleet' },
  { value: 1000109, label: 'Sisters of EVE' },
  { value: 1000127, label: 'Guristas' },
  { value: 1000129, label: "Serpentis" },
  { value: 1000162, label: "Blood Raiders" },
  { value: 1000164, label: "Angel Cartel" },
  { value: 1000132, label: "Sansha's Nation" },
  { value: 1000084, label: 'Ducia Foundry' },
  { value: 1000091, label: 'Expert Distribution' },
  { value: 1000049, label: 'Thukker Mix' },
  { value: 1000166, label: 'Mordu\'s Legion' },
  { value: 1000169, label: 'Concord' },
];

/**
 * Common item category filters
 */
const ITEM_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'ship', label: 'Ships' },
  { value: 'module', label: 'Modules' },
  { value: 'ammo', label: 'Ammo & Charges' },
  { value: 'blueprint', label: 'Blueprints' },
  { value: 'implant', label: 'Implants' },
  { value: 'drone', label: 'Drones' },
  { value: 'material', label: 'Materials' },
];

/**
 * Common regions for pricing
 */
const PRICE_REGIONS = [
  { value: 10000002, label: 'The Forge (Jita)' },
  { value: 10000043, label: 'Domain (Amarr)' },
  { value: 10000032, label: 'Sinq Laison (Dodixie)' },
  { value: 10000042, label: 'Metropolis (Rens/Hek)' },
  { value: 10000030, label: 'Heimatar' },
];

/**
 * LP Optimizer Page Component
 */
export function LPOptimizerPage() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [accessToken, setAccessToken] = useState(null);

  // Initialize hook with access token
  const {
    data,
    loading,
    error,
    lastUpdated,
    fetchConversions,
    calculateProfitPotential,
  } = useLPOptimizer({ accessToken });

  // Form state
  const [form, setForm] = useState({
    corporationId: 1000035, // Caldari Navy default
    characterId: null,
    regionId: 10000002, // Jita default
    minIskPerLp: 1000,
    category: '',
  });

  // UI state
  const [toastMessage, setToastMessage] = useState(null);
  const [formError, setFormError] = useState(null);

  // Load access token when authenticated
  useEffect(() => {
    const loadToken = async () => {
      if (isAuthenticated && character?.id) {
        const token = await getAccessToken();
        setAccessToken(token);
        setForm((prev) => ({ ...prev, characterId: character.id }));
      }
    };
    loadToken();
  }, [isAuthenticated, character, getAccessToken]);

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);

      if (!form.corporationId) {
        setFormError('Please select a corporation');
        return;
      }

      try {
        await fetchConversions({
          corporationId: form.corporationId,
          characterId: form.characterId,
          regionId: form.regionId,
          minIskPerLp: form.minIskPerLp,
          category: form.category || undefined,
        });
      } catch (err) {
        console.error('LP conversion request failed:', err);
      }
    },
    [form, fetchConversions]
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

  // Copy conversion details
  const copyConversionDetails = useCallback(
    (conversion) => {
      const text = `${conversion.item_name}
LP Cost: ${formatNumber(conversion.lp_cost, 0)} LP
ISK Cost: ${formatISK(conversion.isk_cost, false)}
${conversion.required_items.length > 0 ? `Required Items: ${conversion.required_items.length}` : 'No required items'}
Sell Price: ${formatISK(conversion.analysis.sell_price, false)}
Net Profit: ${formatISK(conversion.analysis.net_profit, false)}
ISK per LP: ${formatNumber(conversion.analysis.isk_per_lp, 0)}
ROI: ${formatPercent(conversion.analysis.roi / 100, 1)}`;

      copyToClipboard(text, 'Conversion details copied!');
    },
    [copyToClipboard]
  );

  // Calculate profit statistics
  const profitStats = useMemo(() => {
    if (!data) return null;
    return calculateProfitPotential();
  }, [data, calculateProfitPotential]);

  // Check if user can afford conversion
  const canAfford = useCallback(
    (conversion) => {
      if (!data?.lp_balance) return true; // If no balance data, show all
      return conversion.lp_cost <= data.lp_balance;
    },
    [data]
  );

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'item_name',
        label: 'Item',
        className: 'font-medium min-w-[200px]',
        render: (itemName, row) => {
          const affordable = canAfford(row);
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
              <span className="truncate">{itemName}</span>
              {isAuthenticated && affordable && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex-shrink-0">
                  Affordable
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'lp_cost',
        label: 'LP Cost',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-accent-purple">{formatNumber(data, 0)} LP</span>
        ),
      },
      {
        key: 'isk_cost',
        label: 'ISK Cost',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-red-400">{formatCompact(data)}</span>
        ),
      },
      {
        key: 'required_items',
        label: 'Materials',
        className: 'text-center',
        render: (items) => {
          if (!items || items.length === 0) {
            return <span className="text-text-secondary/50">None</span>;
          }
          return (
            <span className="text-text-secondary" title={items.map(i => `${i.name} x${i.quantity}`).join(', ')}>
              {items.length} items
            </span>
          );
        },
      },
      {
        key: 'analysis.sell_price',
        label: 'Sell Price',
        type: 'num',
        className: 'text-right',
        render: (_, row) => (
          <span className="font-mono text-green-400">{formatCompact(row.analysis.sell_price)}</span>
        ),
      },
      {
        key: 'analysis.net_profit',
        label: 'Net Profit',
        type: 'num',
        defaultSort: true,
        className: 'text-right',
        render: (_, row) => {
          const profit = row.analysis.net_profit;
          return (
            <span className={`font-mono font-semibold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {profit > 0 ? '+' : ''}{formatCompact(profit)}
            </span>
          );
        },
      },
      {
        key: 'analysis.isk_per_lp',
        label: 'ISK/LP',
        type: 'num',
        className: 'text-right',
        render: (_, row) => (
          <span className="font-mono text-accent-cyan font-semibold">{formatNumber(row.analysis.isk_per_lp, 0)}</span>
        ),
      },
      {
        key: 'analysis.roi',
        label: 'ROI',
        type: 'num',
        className: 'text-right',
        render: (_, row) => {
          const roi = row.analysis.roi;
          return (
            <span className={`font-mono font-semibold ${roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {roi > 0 ? '+' : ''}{formatPercent(roi / 100, 1)}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: '',
        className: 'w-10',
        render: (_, row) => (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              copyConversionDetails(row);
            }}
            variant="ghost"
            size="sm"
            className="p-2 h-auto min-h-0"
            title="Copy conversion details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </Button>
        ),
      },
    ],
    [isAuthenticated, canAfford, copyItemName, copyConversionDetails]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (conversion) => {
      copyConversionDetails(conversion);
    },
    [copyConversionDetails]
  );

  return (
    <PageLayout
      title="LP Store Optimizer"
      subtitle="Find the most profitable loyalty point conversions"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toast for copy feedback */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
            type="success"
          />
        )}

        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Error Display */}
            {formError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm" role="alert">
                {formError}
              </div>
            )}

            {/* Corporation and Region Selection */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <FormSelect
                label="Corporation"
                value={form.corporationId}
                onChange={(v) => updateForm('corporationId', parseInt(v))}
                options={COMMON_CORPORATIONS}
                required
              />
              <FormSelect
                label="Market Region"
                value={form.regionId}
                onChange={(v) => updateForm('regionId', parseInt(v))}
                options={PRICE_REGIONS}
                helper="Region used for market price calculations"
              />
            </div>

            {/* Filters */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <FormInput
                label="Minimum ISK/LP"
                type="number"
                value={form.minIskPerLp}
                onChange={(v) => updateForm('minIskPerLp', v)}
                suffix="ISK/LP"
                helper="Filter out conversions with low ISK per LP ratio"
              />
              <FormSelect
                label="Item Category"
                value={form.category}
                onChange={(v) => updateForm('category', v)}
                options={ITEM_CATEGORIES}
                helper="Filter by item type (optional)"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              className="w-full text-base md:text-lg min-h-[44px]"
              loading={loading}
            >
              {loading ? 'Analyzing...' : 'Find Best Conversions'}
            </Button>
          </form>
        </GlassmorphicCard>

        {/* Character LP Info Panel */}
        {isAuthenticated && data?.lp_balance !== undefined && (
          <GlassmorphicCard className="mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-6 text-sm">
                <div>
                  <div className="text-sm text-text-secondary mb-1">Character</div>
                  <div className="text-text-primary font-medium">{character?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-text-secondary mb-1">LP Balance</div>
                  <div className="text-accent-purple font-medium font-mono">
                    {formatNumber(data.lp_balance, 0)} LP
                  </div>
                </div>
                {profitStats && (
                  <>
                    <div>
                      <div className="text-sm text-text-secondary mb-1">Affordable Items</div>
                      <div className="text-accent-cyan font-medium">
                        {profitStats.affordableItems} / {profitStats.totalItems}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-text-secondary mb-1">Total Profit Potential</div>
                      <div className="text-green-400 font-medium">
                        {formatISK(profitStats.totalProfit)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {/* Statistics Panel */}
        {profitStats && data && !loading && (
          <GlassmorphicCard className="mb-8">
            <h3 className="font-display text-lg text-text-primary mb-4">Conversion Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-space-dark/50">
                <div className="text-2xl font-bold text-accent-cyan">
                  {formatNumber(profitStats.averageIskPerLp, 0)}
                </div>
                <div className="text-sm text-text-secondary">Avg ISK/LP</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-space-dark/50">
                <div className="text-2xl font-bold text-green-400">
                  {formatCompact(profitStats.totalProfit)}
                </div>
                <div className="text-sm text-text-secondary">Total Profit</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-space-dark/50">
                <div className="text-2xl font-bold text-accent-purple">
                  {profitStats.totalItems}
                </div>
                <div className="text-sm text-text-secondary">Total Items</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-space-dark/50">
                <div className="text-2xl font-bold text-accent-gold">
                  {profitStats.bestConversion ? formatNumber(profitStats.bestConversion.analysis.isk_per_lp, 0) : 'N/A'}
                </div>
                <div className="text-sm text-text-secondary">Best ISK/LP</div>
              </div>
            </div>
            {profitStats.bestConversion && (
              <div className="mt-4 p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
                <div className="text-sm text-text-secondary mb-1">Top Conversion:</div>
                <div className="text-text-primary font-medium">
                  {profitStats.bestConversion.item_name} - {formatNumber(profitStats.bestConversion.analysis.isk_per_lp, 0)} ISK/LP
                </div>
              </div>
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
            <SkeletonTable rows={10} columns={8} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {data?.conversions && !loading && (
          <>
            {data.conversions.length === 0 ? (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  No conversions found matching your criteria.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try adjusting your filters or selecting a different corporation.
                </p>
              </GlassmorphicCard>
            ) : (
              <>
                {/* Action Bar */}
                <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    <div className="text-text-secondary text-sm">
                      Found <span className="text-accent-cyan font-medium">{data.conversions.length}</span> profitable conversions
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
                  data={data.conversions}
                  columns={tableColumns}
                  onRowClick={handleRowClick}
                  defaultSort={{ column: 'analysis.isk_per_lp', direction: 'desc' }}
                  emptyMessage="No conversions found matching your criteria"
                />
              </>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default LPOptimizerPage;
