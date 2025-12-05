import { useState, useCallback, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { FormInput, FormSelect, RegionAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { DataFreshnessIndicator } from '../components/common/DataFreshnessIndicator';
import { RegionPresets, POPULAR_REGIONS } from '../components/common/TradeHubPresets';
import { ActionableError } from '../components/common/ActionableError';
import { useToast } from '../components/common/ToastProvider';
import { useArbitrageScanner } from '../hooks/useArbitrageScanner';
import { useResources } from '../hooks/useResources';
import { formatISK, formatNumber, formatPercent, formatCompact } from '../utils/formatters';
import { TAX_OPTIONS, TRADE_HUBS } from '../utils/constants';
import { getRegionData } from '../utils/stations';

/**
 * Cross-Region Arbitrage Page Component
 * Scans multiple regions for arbitrage opportunities
 */
export function ArbitragePage() {
  const { universeList, loading: resourcesLoading } = useResources();
  const toast = useToast();
  const {
    data,
    loading,
    error,
    lastUpdated,
    scan,
    getStats,
  } = useArbitrageScanner();

  // Form state
  const [form, setForm] = useState({
    regions: ['The Forge', 'Domain', 'Sinq Laison', 'Heimatar'], // Default: Jita, Amarr, Dodixie, Rens
    minProfit: 1000000,
    minROI: 10,
    maxVolume: 60000,
    tax: 0.08,
  });

  // UI state
  const [formError, setFormError] = useState(null);
  const [selectedRegions, setSelectedRegions] = useState(form.regions);

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Get region ID from name
  const getRegionId = useCallback(
    (regionName) => {
      if (!universeList) return null;
      const regionData = getRegionData(regionName, universeList);
      return regionData?.region || null;
    },
    [universeList]
  );

  // Handle adding a region
  const handleAddRegion = useCallback((regionName) => {
    if (!regionName || selectedRegions.includes(regionName)) return;
    const newRegions = [...selectedRegions, regionName];
    setSelectedRegions(newRegions);
    updateForm('regions', newRegions);
  }, [selectedRegions, updateForm]);

  // Handle removing a region
  const handleRemoveRegion = useCallback((regionName) => {
    const newRegions = selectedRegions.filter(r => r !== regionName);
    setSelectedRegions(newRegions);
    updateForm('regions', newRegions);
  }, [selectedRegions, updateForm]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError(null);

      if (selectedRegions.length < 2) {
        setFormError('Please select at least 2 regions to scan for arbitrage opportunities');
        return;
      }

      // Convert region names to IDs
      const regionIds = selectedRegions
        .map(getRegionId)
        .filter(id => id !== null);

      if (regionIds.length < 2) {
        setFormError('Invalid regions selected');
        return;
      }

      try {
        await scan({
          regions: regionIds,
          minProfit: form.minProfit,
          minROI: form.minROI,
          maxVolume: form.maxVolume,
          tax: form.tax,
        });
      } catch (err) {
        console.error('Arbitrage scan failed:', err);
      }
    },
    [selectedRegions, form, getRegionId, scan]
  );

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text, message = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  }, [toast]);

  // Copy item name
  const copyItemName = useCallback((itemName) => {
    copyToClipboard(itemName, 'Item name copied!');
  }, [copyToClipboard]);

  // Copy arbitrage details
  const copyArbitrageDetails = useCallback((item) => {
    const text = `${item.Item}
Buy from: ${item['Buy Region']}
Buy Price: ${formatISK(item['Buy Price'], false)}
Sell to: ${item['Sell Region']}
Sell Price: ${formatISK(item['Sell Price'], false)}
Profit per Unit: ${formatISK(item['Profit per Unit'], false)}
Total Profit: ${formatISK(item['Total Profit'], false)}
ROI: ${formatPercent(item.ROI / 100, 1)}
Quantity: ${formatNumber(item['Quantity Available'], 0)}
Risk Score: ${item['Risk Score']}/10`;

    copyToClipboard(text, 'Arbitrage details copied!');
  }, [copyToClipboard]);

  // Tax options
  const taxOptions = useMemo(() => TAX_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);

  // Get risk color based on score
  const getRiskColor = useCallback((score) => {
    if (score >= 8) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 6) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (score >= 4) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  }, []);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'Item',
        label: 'Item',
        className: 'font-medium min-w-[180px]',
        render: (data, _row) => (
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                copyItemName(data);
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
            <span className="truncate">{data}</span>
          </div>
        ),
      },
      {
        key: 'Buy Region',
        label: 'Buy From',
        className: 'min-w-[120px]',
        render: (data, row) => (
          <div className="flex flex-col">
            <span className="text-text-primary">{data}</span>
            <span className="text-xs text-red-400 font-mono">
              {formatCompact(row['Buy Price'])}
            </span>
          </div>
        ),
      },
      {
        key: 'Sell Region',
        label: 'Sell To',
        className: 'min-w-[120px]',
        render: (data, row) => (
          <div className="flex flex-col">
            <span className="text-text-primary">{data}</span>
            <span className="text-xs text-green-400 font-mono">
              {formatCompact(row['Sell Price'])}
            </span>
          </div>
        ),
      },
      {
        key: 'Profit per Unit',
        label: 'Unit Profit',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-accent-cyan">{formatCompact(data)}</span>
        ),
      },
      {
        key: 'Total Profit',
        label: 'Total Profit',
        type: 'num',
        defaultSort: true,
        className: 'text-right',
        render: (data) => (
          <span className="font-mono font-semibold text-green-400">
            +{formatCompact(data)}
          </span>
        ),
      },
      {
        key: 'ROI',
        label: 'ROI',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono font-semibold text-green-400">
            +{formatPercent(data / 100, 1)}
          </span>
        ),
      },
      {
        key: 'Quantity Available',
        label: 'Qty',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-text-secondary">{formatNumber(data, 0)}</span>
        ),
      },
      {
        key: 'Volume',
        label: 'Volume',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-text-secondary">{formatCompact(data)} m³</span>
        ),
      },
      {
        key: 'Risk Score',
        label: 'Risk',
        type: 'num',
        className: 'text-center',
        render: (data) => (
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(data)}`}>
            {data}/10
          </span>
        ),
      },
      {
        key: 'actions',
        label: '',
        className: 'w-10',
        render: (_, row) => (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              copyArbitrageDetails(row);
            }}
            variant="ghost"
            size="sm"
            className="p-2 h-auto min-h-0"
            title="Copy arbitrage details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </Button>
        ),
      },
    ],
    [copyItemName, copyArbitrageDetails, getRiskColor]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (item) => {
      copyArbitrageDetails(item);
    },
    [copyArbitrageDetails]
  );

  // Calculate summary statistics
  const stats = useMemo(() => getStats(), [getStats]);

  return (
    <PageLayout
      title="Cross-Region Arbitrage"
      subtitle="Discover profitable buy-low, sell-high opportunities across multiple regions"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Error Display */}
            {formError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm" role="alert">
                {formError}
              </div>
            )}

            {/* Region Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Regions to Scan
                  <span className="text-red-400 ml-1">*</span>
                  <span className="text-text-secondary/70 font-normal ml-2">
                    (Select at least 2 regions)
                  </span>
                </label>

                {/* Selected Regions */}
                {selectedRegions.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedRegions.map((region) => (
                      <span
                        key={region}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm border border-accent-cyan/30"
                      >
                        {region}
                        <button
                          type="button"
                          onClick={() => handleRemoveRegion(region)}
                          className="hover:text-red-400 transition-colors"
                          title={`Remove ${region}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Region */}
                <RegionAutocomplete
                  value=""
                  onChange={handleAddRegion}
                  placeholder="Add a region to scan..."
                  excludeRegions={selectedRegions}
                />
              </div>

              {/* Popular Regions Presets */}
              <RegionPresets
                selectedRegion={null}
                onRegionSelect={handleAddRegion}
                compact
              />
            </div>

            {/* Parameters */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <FormInput
                label="Minimum Profit"
                type="number"
                value={form.minProfit}
                onChange={(v) => updateForm('minProfit', v)}
                suffix="ISK"
                min={0}
                step={100000}
                helper="Per trade total profit"
              />
              <FormInput
                label="Minimum ROI"
                type="number"
                value={form.minROI}
                onChange={(v) => updateForm('minROI', v)}
                suffix="%"
                min={0}
                max={1000}
                step={1}
                helper="Return on investment"
              />
              <FormInput
                label="Max Volume"
                type="number"
                value={form.maxVolume}
                onChange={(v) => updateForm('maxVolume', v)}
                suffix="m³"
                min={0}
                step={1000}
                helper="Cargo space constraint"
              />
              <FormSelect
                label="Sales Tax"
                value={form.tax}
                onChange={(v) => updateForm('tax', parseFloat(v))}
                options={taxOptions}
                helper="Your tax rate"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || resourcesLoading || selectedRegions.length < 2}
              variant="primary"
              size="lg"
              className="w-full text-base md:text-lg min-h-[44px]"
              loading={loading}
            >
              {loading ? 'Scanning...' : 'Scan for Arbitrage Opportunities'}
            </Button>
          </form>
        </GlassmorphicCard>

        {/* Error */}
        {error && (
          <ActionableError
            error={error}
            onRetry={() => handleSubmit({ preventDefault: () => { } })}
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
            {data.length === 0 ? (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  No arbitrage opportunities found matching your criteria.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try adjusting your parameters or selecting different regions.
                </p>
              </GlassmorphicCard>
            ) : (
              <>
                {/* Summary Statistics */}
                <GlassmorphicCard className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">Summary Statistics</h3>
                    <DataFreshnessIndicator
                      lastUpdated={lastUpdated}
                      onRefresh={() => handleSubmit({ preventDefault: () => { } })}
                      isLoading={loading}
                      compact
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
                      <div className="text-sm text-text-secondary mb-1">Opportunities</div>
                      <div className="text-2xl font-bold text-accent-cyan">
                        {formatNumber(stats.totalOpportunities, 0)}
                      </div>
                    </div>

                    <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
                      <div className="text-sm text-text-secondary mb-1">Total Profit</div>
                      <div className="text-2xl font-bold text-green-400">
                        {formatCompact(stats.totalProfit)}
                      </div>
                    </div>

                    <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
                      <div className="text-sm text-text-secondary mb-1">Average ROI</div>
                      <div className="text-2xl font-bold text-accent-gold">
                        {formatPercent(stats.averageROI / 100, 1)}
                      </div>
                    </div>

                    <div className="bg-space-dark/50 rounded-lg p-4 border border-accent-cyan/20">
                      <div className="text-sm text-text-secondary mb-1">Avg Risk Score</div>
                      <div className={`text-2xl font-bold ${stats.averageRiskScore >= 6 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {stats.averageRiskScore.toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>

                {/* Results Table */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-text-secondary text-sm">
                    Found <span className="text-accent-cyan font-medium">{data.length}</span> arbitrage opportunities
                  </div>
                </div>

                <TradingTable
                  tableId="arbitrage-table"
                  data={data}
                  columns={tableColumns}
                  onRowClick={handleRowClick}
                  defaultSort={{ column: 'Total Profit', direction: 'desc' }}
                  emptyMessage="No arbitrage opportunities found"
                />
              </>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default ArbitragePage;
