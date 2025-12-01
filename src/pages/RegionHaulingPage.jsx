import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { FormInput, FormSelect, RegionAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '../hooks/useResources';
import { useApiCall } from '../hooks/useApiCall';
import { fetchRegionHauling } from '../api/trading';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';
import {
  TAX_OPTIONS,
  ROUTE_SAFETY_OPTIONS,
  SYSTEM_SECURITY_OPTIONS,
  STRUCTURE_TYPE_OPTIONS,
  TRADE_PREFERENCE_OPTIONS,
} from '../utils/constants';
import { getRegionData } from '../utils/stations';

/**
 * Region Hauling Page Component
 */
export function RegionHaulingPage() {
  const navigate = useNavigate();
  const { universeList, nearbyRegions, loading: resourcesLoading } = useResources();
  const { data, loading, error, execute } = useApiCall(fetchRegionHauling);

  // Form state
  const [form, setForm] = useState({
    fromRegion: '',
    toRegion: '',
    useNearby: false,
    fromPreference: 'sell',
    toPreference: 'buy',
    minProfit: 1000000,
    maxWeight: 30000,
    minROI: 5,
    maxBudget: 1000000000,
    tax: 0.0375,
    systemSecurity: 'all',
    structureType: 'both',
    routeSafety: 'shortest',
  });

  // Get nearby regions for selected origin
  const nearbyRegionsList = useMemo(() => {
    if (!form.fromRegion || !nearbyRegions) return [];
    return nearbyRegions[form.fromRegion] || [];
  }, [form.fromRegion, nearbyRegions]);

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // Reset toRegion when switching to nearby
    if (key === 'useNearby' && value) {
      setForm((prev) => ({ ...prev, toRegion: 'Nearby Regions' }));
    }
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

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const fromId = getRegionId(form.fromRegion);
      if (!fromId) {
        alert('Please select a valid origin region');
        return;
      }

      let toParam;
      if (form.useNearby) {
        // Use nearby regions
        toParam = `${form.toPreference}-nearby`;
      } else {
        const toId = getRegionId(form.toRegion);
        if (!toId) {
          alert('Please select a valid destination region');
          return;
        }
        toParam = `${form.toPreference}-${toId}`;
      }

      const fromParam = `${form.fromPreference}-${fromId}`;

      try {
        await execute({
          from: fromParam,
          to: toParam,
          minProfit: form.minProfit,
          maxWeight: form.maxWeight,
          minROI: form.minROI,
          maxBudget: form.maxBudget,
          tax: form.tax,
          systemSecurity: form.systemSecurity,
          structureType: form.structureType,
          routeSafety: form.routeSafety,
        });
      } catch (err) {
        console.error('Hauling request failed:', err);
      }
    },
    [form, getRegionId, execute]
  );

  // Option arrays for dropdowns
  const taxOptions = useMemo(() => TAX_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const routeOptions = useMemo(() => ROUTE_SAFETY_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const securityOptions = useMemo(() => SYSTEM_SECURITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const structureOptions = useMemo(() => STRUCTURE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const prefOptions = useMemo(() => TRADE_PREFERENCE_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'Item',
        label: 'Item',
        className: 'font-medium',
        render: (data, row) => row.Item || row.name,
      },
      {
        key: 'From',
        label: 'From',
        render: (data) => (typeof data === 'object' ? data.name : data),
      },
      {
        key: 'Take To',
        label: 'To',
        render: (data) => (typeof data === 'object' ? data.name : data),
      },
      {
        key: 'Quantity',
        label: 'Quantity',
        type: 'num',
        render: (data, row) => formatNumber(data || row.quantity, 0),
      },
      {
        key: 'Profit',
        label: 'Profit',
        type: 'num',
        defaultSort: true,
        render: (data, row) => formatISK(data || row.profit, false),
      },
      {
        key: 'Profit per Jump',
        label: 'Profit/Jump',
        type: 'num',
        render: (data, row) => formatISK(data || row.profitPerJump, false),
      },
      {
        key: 'ROI',
        label: 'ROI',
        type: 'num',
        render: (data, row) => formatPercent((data || row.roi) / 100, 1),
      },
      {
        key: 'Jumps',
        label: 'Jumps',
        type: 'num',
        render: (data, row) => data || row.jumps || 'N/A',
      },
    ],
    []
  );

  // Handle row click
  const handleRowClick = useCallback(
    (item) => {
      const itemId = item['Item ID'] || item.itemId;
      const fromLocation = item.fromLocation || '';
      const toLocation = item.toLocation || '';

      if (itemId && fromLocation && toLocation) {
        navigate(`/orders?itemId=${itemId}&from=${fromLocation}&to=${toLocation}`);
      }
    },
    [navigate]
  );

  return (
    <PageLayout
      title="Region Hauling"
      subtitle="Find the best trades across entire regions"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Region Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <RegionAutocomplete
                  label="Origin Region"
                  value={form.fromRegion}
                  onChange={(v) => updateForm('fromRegion', v)}
                  placeholder="The Forge, Domain, Sinq Laison..."
                  required
                />
                <FormSelect
                  label="Trade Preference"
                  value={form.fromPreference}
                  onChange={(v) => updateForm('fromPreference', v)}
                  options={prefOptions}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.useNearby}
                      onChange={(e) => updateForm('useNearby', e.target.checked)}
                      className="w-4 h-4 rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan"
                    />
                    <span className="text-sm text-text-secondary">Use nearby regions</span>
                  </label>
                </div>

                {form.useNearby ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">
                      Nearby Regions
                    </label>
                    <div className="p-3 rounded-lg bg-space-dark/50 border border-accent-cyan/20">
                      {nearbyRegionsList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {nearbyRegionsList.map((region) => (
                            <span
                              key={region}
                              className="px-2 py-1 text-xs rounded-full bg-accent-purple/20 text-accent-purple"
                            >
                              {region}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-secondary/50 text-sm">
                          Select an origin region to see nearby regions
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <RegionAutocomplete
                    label="Destination Region"
                    value={form.toRegion}
                    onChange={(v) => updateForm('toRegion', v)}
                    placeholder="Select destination region..."
                    excludeRegions={[form.fromRegion]}
                    required
                  />
                )}

                <FormSelect
                  label="Trade Preference"
                  value={form.toPreference}
                  onChange={(v) => updateForm('toPreference', v)}
                  options={prefOptions}
                />
              </div>
            </div>

            {/* Other Parameters */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormInput
                label="Minimum Profit"
                type="number"
                value={form.minProfit}
                onChange={(v) => updateForm('minProfit', v)}
                suffix="ISK"
              />
              <FormInput
                label="Max Cargo Weight"
                type="number"
                value={form.maxWeight}
                onChange={(v) => updateForm('maxWeight', v)}
                suffix="m³"
              />
              <FormInput
                label="Minimum ROI"
                type="number"
                value={form.minROI}
                onChange={(v) => updateForm('minROI', v)}
                suffix="%"
              />
              <FormInput
                label="Max Budget"
                type="number"
                value={form.maxBudget}
                onChange={(v) => updateForm('maxBudget', v)}
                suffix="ISK"
              />
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <FormSelect
                label="Sales Tax Level"
                value={form.tax}
                onChange={(v) => updateForm('tax', parseFloat(v))}
                options={taxOptions}
              />
              <FormSelect
                label="System Security"
                value={form.systemSecurity}
                onChange={(v) => updateForm('systemSecurity', v)}
                options={securityOptions}
              />
              <FormSelect
                label="Structure Type"
                value={form.structureType}
                onChange={(v) => updateForm('structureType', v)}
                options={structureOptions}
              />
              <FormSelect
                label="Route Safety"
                value={form.routeSafety}
                onChange={(v) => updateForm('routeSafety', v)}
                options={routeOptions}
              />
            </div>

            <button
              type="submit"
              disabled={loading || resourcesLoading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? 'Searching...' : 'Find Trades'}
            </button>
          </form>
        </GlassmorphicCard>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <strong>Error:</strong> {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={10} columns={8} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {data.length === 0 ? (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  No trades found matching your criteria.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try adjusting your parameters or selecting different regions.
                </p>
              </GlassmorphicCard>
            ) : (
              <TradingTable
                data={data}
                columns={tableColumns}
                onRowClick={handleRowClick}
                defaultSort={{ column: 'Profit', direction: 'desc' }}
                emptyMessage="No trades found matching your criteria"
              />
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default RegionHaulingPage;
