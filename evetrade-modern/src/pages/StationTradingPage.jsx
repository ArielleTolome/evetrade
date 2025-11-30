import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { FormInput, FormSelect, StationAutocomplete } from '../components/forms';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { useResources } from '../hooks/useResources';
import { useApiCall } from '../hooks/useApiCall';
import { fetchStationTrading } from '../api/trading';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';
import { TAX_OPTIONS } from '../utils/constants';

/**
 * Station Trading Page Component
 */
export function StationTradingPage() {
  const navigate = useNavigate();
  const { universeList, loading: resourcesLoading } = useResources();
  const { data, loading, error, execute, reset } = useApiCall(fetchStationTrading);

  // Form state
  const [form, setForm] = useState({
    station: '',
    profit: 1000000,
    tax: 0.0375,
    minVolume: 100,
    brokerFee: 3,
    marginAbove: 10,
    marginBelow: 50,
  });

  // Form validation
  const [errors, setErrors] = useState({});

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when field is updated
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!form.station) {
      newErrors.station = 'Please select a station';
    } else if (!universeList?.[form.station]) {
      newErrors.station = 'Invalid station selected';
    }

    if (form.profit < 0) {
      newErrors.profit = 'Minimum profit must be positive';
    }

    if (form.minVolume < 0) {
      newErrors.minVolume = 'Minimum volume must be positive';
    }

    if (form.brokerFee < 0 || form.brokerFee > 100) {
      newErrors.brokerFee = 'Broker fee must be between 0 and 100';
    }

    if (form.marginAbove < 0 || form.marginAbove > 100) {
      newErrors.marginAbove = 'Margin must be between 0 and 100';
    }

    if (form.marginBelow < 0 || form.marginBelow > 100) {
      newErrors.marginBelow = 'Margin must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, universeList]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const stationData = universeList[form.station];
      if (!stationData) return;

      try {
        await execute({
          stationId: stationData.station,
          minProfit: form.profit,
          tax: form.tax,
          minVolume: form.minVolume,
          brokerFee: form.brokerFee / 100,
          marginAbove: form.marginAbove / 100,
          marginBelow: form.marginBelow / 100,
        });
      } catch (err) {
        console.error('Trading request failed:', err);
      }
    },
    [form, universeList, validateForm, execute]
  );

  // Handle row click to view orders
  const handleViewOrders = useCallback(
    (item) => {
      const stationData = universeList[form.station];
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
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <GlassmorphicCard>
            <SkeletonTable rows={10} columns={7} />
          </GlassmorphicCard>
        )}

        {/* Results */}
        {data && !loading && (
          <GlassmorphicCard padding="p-0">
            {data.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-text-secondary text-lg">
                  No trades found matching your criteria.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try lowering your minimum profit or adjusting margin ranges.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-space-mid text-accent-cyan font-display">
                      <th className="px-4 py-3 text-left">Item</th>
                      <th className="px-4 py-3 text-right">Buy Price</th>
                      <th className="px-4 py-3 text-right">Sell Price</th>
                      <th className="px-4 py-3 text-right">Volume</th>
                      <th className="px-4 py-3 text-right">Profit/Unit</th>
                      <th className="px-4 py-3 text-right">Net Profit</th>
                      <th className="px-4 py-3 text-right">Margin</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={item['Item ID'] || index}
                        className="border-t border-accent-cyan/10 hover:bg-accent-cyan/5 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {item.Item || item.name}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary font-mono">
                          {formatISK(item['Buy Price'] || item.buyPrice, false)}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary font-mono">
                          {formatISK(item['Sell Price'] || item.sellPrice, false)}
                        </td>
                        <td className="px-4 py-3 text-right text-text-secondary font-mono">
                          {formatNumber(item.Volume || item.volume, 0)}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-cyan font-mono">
                          {formatISK(item['Profit per Unit'] || item.profitPerUnit, false)}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-gold font-mono font-bold">
                          {formatISK(item['Net Profit'] || item.netProfit, false)}
                        </td>
                        <td className="px-4 py-3 text-right text-accent-purple font-mono">
                          {formatPercent((item['Gross Margin'] || item.margin) / 100, 1)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleViewOrders(item)}
                            className="px-3 py-1 text-xs font-medium text-accent-cyan border border-accent-cyan/30 rounded hover:bg-accent-cyan/10 transition-colors"
                          >
                            View Orders
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassmorphicCard>
        )}
      </div>
    </PageLayout>
  );
}

export default StationTradingPage;
