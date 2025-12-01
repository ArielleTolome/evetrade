import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@components/layout/PageLayout';
import { GlassmorphicCard } from '@components/common/GlassmorphicCard';
import { FormInput, FormSelect, StationAutocomplete } from '@components/forms';
import { TradingTable } from '@components/tables';
import { SkeletonTable } from '@components/common/SkeletonLoader';
import { useResources } from '@hooks/useResources';
import { useApiCall } from '@hooks/useApiCall';
import { useTradeForm } from '@hooks/useTradeForm';
import { fetchStationTrading } from '@api/trading';
import { formatISK, formatNumber, formatPercent } from '@utils/formatters';
import { TAX_OPTIONS } from '@utils/constants';
import { getStationData } from '@utils/stations';

/**
 * Station Trading Page Component
 * Refactored to use the useTradeForm hook for reduced duplication
 */
export function StationTradingPage() {
  const navigate = useNavigate();
  const { universeList, loading: resourcesLoading } = useResources();
  const { data, loading, error, execute } = useApiCall(fetchStationTrading);

  // Custom validation for station-specific fields
  const customValidation = useCallback((formData) => {
    const errors = {};

    if (!formData.station) {
      errors.station = 'Please select a station';
    } else if (!getStationData(formData.station, universeList)) {
      errors.station = 'Invalid station selected';
    }

    return errors;
  }, [universeList]);

  // Transform form data to API format
  const transformData = useCallback((formData) => {
    const stationData = getStationData(formData.station, universeList);
    if (!stationData) return null;

    return {
      stationId: stationData.station,
      minProfit: formData.profit,
      tax: formData.tax,
      minVolume: formData.minVolume,
      brokerFee: formData.brokerFee / 100,
      marginAbove: formData.marginAbove / 100,
      marginBelow: formData.marginBelow / 100,
    };
  }, [universeList]);

  // Handle form submission
  const onSubmit = useCallback(async (transformedData) => {
    if (!transformedData) return;
    await execute(transformedData);
  }, [execute]);

  // Use the reusable trade form hook
  const {
    form,
    errors,
    updateForm,
    handleSubmit,
  } = useTradeForm(
    {
      station: '',
      profit: 1000000,
      tax: 0.0375,
      minVolume: 100,
      brokerFee: 3,
      marginAbove: 10,
      marginBelow: 50,
    },
    {
      customValidation,
      transformData,
      onSubmit,
    }
  );

  // Handle row click to view orders
  const handleRowClick = useCallback(
    (item) => {
      const stationData = getStationData(form.station, universeList);
      if (!stationData) return;

      const itemId = item['Item ID'] || item.itemId;
      const fromLocation = `${stationData.region}:${stationData.station}`;

      navigate(`/orders?itemId=${itemId}&from=${fromLocation}&to=${fromLocation}`);
    },
    [form.station, universeList, navigate]
  );

  // Tax options for dropdown
  const taxOptions = useMemo(
    () =>
      TAX_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    []
  );

  // Table columns configuration
  const tableColumns = useMemo(
    () => [
      {
        key: 'Item',
        label: 'Item',
        className: 'font-medium',
      },
      {
        key: 'Buy Price',
        label: 'Buy Price',
        type: 'num',
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Sell Price',
        label: 'Sell Price',
        type: 'num',
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Volume',
        label: 'Volume',
        type: 'num',
        render: (data) => formatNumber(data, 0),
      },
      {
        key: 'Profit per Unit',
        label: 'Profit/Unit',
        type: 'num',
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Net Profit',
        label: 'Net Profit',
        type: 'num',
        defaultSort: true,
        render: (data) => formatISK(data, false),
      },
      {
        key: 'Gross Margin',
        label: 'Margin',
        type: 'num',
        render: (data) => formatPercent(data / 100, 1),
      },
    ],
    []
  );

  return (
    <PageLayout
      title="Station Trading"
      subtitle="Find profitable buy/sell margins within a single station"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StationAutocomplete
                label="Station"
                value={form.station}
                onChange={(v) => updateForm('station', v)}
                placeholder="Jita IV - Moon 4 - Caldari Navy Assembly Plant"
                error={errors.station}
                required
              />

              <FormInput
                label="Minimum Profit"
                type="number"
                value={form.profit}
                onChange={(v) => updateForm('profit', v)}
                suffix="ISK"
                error={errors.profit}
                min={0}
              />

              <FormSelect
                label="Sales Tax Level"
                value={form.tax}
                onChange={(v) => updateForm('tax', parseFloat(v))}
                options={taxOptions}
              />

              <FormInput
                label="Minimum Volume"
                type="number"
                value={form.minVolume}
                onChange={(v) => updateForm('minVolume', v)}
                suffix="units"
                error={errors.minVolume}
                min={0}
              />

              <FormInput
                label="Broker Fee"
                type="number"
                value={form.brokerFee}
                onChange={(v) => updateForm('brokerFee', v)}
                suffix="%"
                step={0.01}
                error={errors.brokerFee}
                min={0}
                max={100}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Margin Above"
                  type="number"
                  value={form.marginAbove}
                  onChange={(v) => updateForm('marginAbove', v)}
                  suffix="%"
                  error={errors.marginAbove}
                  min={0}
                  max={100}
                />
                <FormInput
                  label="Margin Below"
                  type="number"
                  value={form.marginBelow}
                  onChange={(v) => updateForm('marginBelow', v)}
                  suffix="%"
                  error={errors.marginBelow}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || resourcesLoading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-space-black/30 border-t-space-black rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                'Find Trades'
              )}
            </button>
          </form>
        </GlassmorphicCard>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <strong>Error:</strong> {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={10} columns={7} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {data !== null && !loading && (() => {
          // Normalize data to array
          const trades = Array.isArray(data) ? data : (data && typeof data === 'object' ? [data] : []);

          if (trades.length === 0) {
            return (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  No trades found matching your criteria.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try lowering your minimum profit or adjusting margin ranges.
                </p>
              </GlassmorphicCard>
            );
          }

          return (
            <TradingTable
              data={trades}
              columns={tableColumns}
              onRowClick={handleRowClick}
              defaultSort={{ column: 'Net Profit', direction: 'desc' }}
              emptyMessage="No trades found matching your criteria"
            />
          );
        })()}
      </div>
    </PageLayout>
  );
}

export default StationTradingPage;
