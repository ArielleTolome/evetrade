import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { EmptyState } from '../components/common/EmptyState';
import { FormInput, FormSelect, StationAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '@hooks/useResources';
import { useApiCall } from '@hooks/useApiCall';
import { fetchStationHauling } from '@api/trading';
import { formatISK, formatNumber, formatPercent } from '@utils/formatters';
import { isCitadel } from '@utils/security';
import {
  TAX_OPTIONS,
  ROUTE_SAFETY_OPTIONS,
  SYSTEM_SECURITY_OPTIONS,
  TRADE_PREFERENCE_OPTIONS,
} from '@utils/constants';
import { getStationData } from '@utils/stations';

/**
 * Station Hauling Page Component
 */
export function StationHaulingPage() {
  const navigate = useNavigate();
  const { universeList, loading: resourcesLoading } = useResources();
  const { data, loading, error, execute } = useApiCall(fetchStationHauling);

  // Form state
  const [form, setForm] = useState({
    fromStations: [],
    toStations: [],
    fromPreference: 'sell',
    toPreference: 'buy',
    minProfit: 1000000,
    maxWeight: 30000,
    minROI: 5,
    maxBudget: 1000000000,
    tax: 0.0375,
    systemSecurity: 'all',
    routeSafety: 'shortest',
  });

  // Temporary input values
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');

  // Add station to list
  const addStation = useCallback((type, station) => {
    if (!station) return;
    setForm((prev) => ({
      ...prev,
      [`${type}Stations`]: [...prev[`${type}Stations`], station],
    }));
    if (type === 'from') setFromInput('');
    else setToInput('');
  }, []);

  // Remove station from list
  const removeStation = useCallback((type, station) => {
    setForm((prev) => ({
      ...prev,
      [`${type}Stations`]: prev[`${type}Stations`].filter((s) => s !== station),
    }));
  }, []);

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Build location string for API
  const buildLocationString = useCallback(
    (stations, preference) => {
      if (stations.length === 0) return '';

      const locations = stations.map((station) => {
        const data = getStationData(station, universeList);
        if (!data) return null;
        return `${data.region}:${data.station}`;
      }).filter(Boolean);

      if (locations.length === 0) return '';

      const prefix = preference !== 'none' ? `${preference}-` : '';
      return `${prefix}${locations.join(',')}`;
    },
    [universeList]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const fromLocation = buildLocationString(form.fromStations, form.fromPreference);
      const toLocation = buildLocationString(form.toStations, form.toPreference);

      if (!fromLocation || !toLocation) {
        alert('Please select at least one station for both origin and destination');
        return;
      }

      try {
        await execute({
          from: fromLocation,
          to: toLocation,
          minProfit: form.minProfit,
          maxWeight: form.maxWeight,
          minROI: form.minROI,
          maxBudget: form.maxBudget,
          tax: form.tax,
          systemSecurity: form.systemSecurity,
          routeSafety: form.routeSafety,
        });
      } catch (err) {
        console.error('Hauling request failed:', err);
      }
    },
    [form, buildLocationString, execute]
  );

  // Option arrays for dropdowns
  const taxOptions = useMemo(() => TAX_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const routeOptions = useMemo(() => ROUTE_SAFETY_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
  const securityOptions = useMemo(() => SYSTEM_SECURITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })), []);
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
      title="Station Hauling"
      subtitle="Find profitable trades between specific stations"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Station Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* From Stations */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Origin Stations
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <StationAutocomplete
                      value={fromInput}
                      onChange={setFromInput}
                      placeholder="Add origin station..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addStation('from', fromInput)}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {form.fromStations.map((station) => (
                    <span
                      key={station}
                      className={`
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                        ${isCitadel(station) ? 'bg-accent-gold/20 text-accent-gold' : 'bg-accent-cyan/20 text-accent-cyan'}
                      `}
                    >
                      {station}
                      <button
                        type="button"
                        onClick={() => removeStation('from', station)}
                        className="hover:text-red-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <FormSelect
                  label="Trade Preference"
                  value={form.fromPreference}
                  onChange={(v) => updateForm('fromPreference', v)}
                  options={prefOptions}
                />
              </div>

              {/* To Stations */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Destination Stations
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <StationAutocomplete
                      value={toInput}
                      onChange={setToInput}
                      placeholder="Add destination station..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addStation('to', toInput)}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {form.toStations.map((station) => (
                    <span
                      key={station}
                      className={`
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                        ${isCitadel(station) ? 'bg-accent-gold/20 text-accent-gold' : 'bg-accent-purple/20 text-accent-purple'}
                      `}
                    >
                      {station}
                      <button
                        type="button"
                        onClick={() => removeStation('to', station)}
                        className="hover:text-red-400"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
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

            <div className="grid md:grid-cols-3 gap-6">
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
              <GlassmorphicCard>
                <EmptyState
                  mode="station-hauling"
                  suggestions={[
                    'Add more origin or destination stations to expand your trading options',
                    'Lower the minimum profit or ROI thresholds',
                    'Increase your cargo capacity limit to include bulkier items',
                    'Increase your budget limit to see higher-value opportunities',
                    'Try different stations with higher market activity',
                    'Adjust route safety or system security settings to include more paths',
                  ]}
                />
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

export default StationHaulingPage;
