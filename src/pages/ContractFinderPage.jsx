import { useState, useCallback, useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { FormInput, FormSelect, RegionAutocomplete } from '../components/forms';
import { TradingTable } from '../components/tables';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { ActionableError } from '../components/common/ActionableError';
import { useContractFinder } from '../hooks/useContractFinder';
import { useResources } from '../hooks/useResources';
import { formatISK, formatNumber, formatPercent, formatCompact } from '../utils/formatters';
import { getRegionData } from '../utils/stations';

/**
 * Contract type options for the filter dropdown
 */
const CONTRACT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Item Exchange', label: 'Item Exchange' },
  { value: 'Courier', label: 'Courier' },
  { value: 'Auction', label: 'Auction' },
];

/**
 * Contract Finder Page Component
 * Helps users find profitable contract opportunities
 */
export function ContractFinderPage() {
  const { universeList, loading: resourcesLoading } = useResources();
  const {
    contracts,
    loading,
    error,
    lastUpdated,
    search,
    reset,
    statistics,
    filterByType,
    sortByProfitability,
  } = useContractFinder();

  // Form state
  const [form, setForm] = useState({
    regionId: '',
    contractType: 'all',
    minProfit: 1000000,
    maxCollateral: 1000000000,
    maxVolume: 50000,
    minRewardPerJump: 0,
  });

  // View state
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('profit');

  // Update form field
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Get region ID from name
  const getRegionId = useCallback(
    (regionName) => {
      if (!universeList || !regionName) return null;
      const regionData = getRegionData(regionName, universeList);
      return regionData?.region || null;
    },
    [universeList]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const regionId = getRegionId(form.regionId);

      const params = {
        regionId: regionId || undefined,
        contractType: form.contractType !== 'all' ? form.contractType : undefined,
        minProfit: form.minProfit || undefined,
        maxCollateral: form.maxCollateral || undefined,
        maxVolume: form.maxVolume || undefined,
        minRewardPerJump: form.minRewardPerJump || undefined,
      };

      try {
        await search(params);
        setSelectedType(form.contractType);
      } catch (err) {
        console.error('Contract search failed:', err);
      }
    },
    [form, getRegionId, search]
  );

  // Filter and sort contracts based on selected type and sort option
  const displayedContracts = useMemo(() => {
    if (!contracts) return [];

    const filtered = filterByType(selectedType);
    return sortByProfitability(filtered, sortBy);
  }, [contracts, selectedType, sortBy, filterByType, sortByProfitability]);

  // Table columns for Item Exchange contracts
  const itemExchangeColumns = useMemo(
    () => [
      {
        key: 'Contract ID',
        label: 'Contract ID',
        className: 'font-mono text-sm',
        render: (data) => (
          <span className="text-accent-cyan">{data}</span>
        ),
      },
      {
        key: 'Location',
        label: 'Location',
        className: 'min-w-[180px]',
        render: (data) => (
          <span className="text-text-primary truncate" title={data}>{data}</span>
        ),
      },
      {
        key: 'Items Count',
        label: 'Items',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-text-secondary">{formatNumber(data || 0, 0)}</span>
        ),
      },
      {
        key: 'Contract Price',
        label: 'Contract Price',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-red-400">{formatCompact(data || 0)}</span>
        ),
      },
      {
        key: 'Market Value',
        label: 'Market Value',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-green-400">{formatCompact(data || 0)}</span>
        ),
      },
      {
        key: 'Profit',
        label: 'Profit',
        type: 'num',
        defaultSort: true,
        className: 'text-right',
        render: (data) => (
          <span className={`font-mono font-semibold ${data > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data > 0 ? '+' : ''}{formatCompact(data || 0)}
          </span>
        ),
      },
      {
        key: 'Profit %',
        label: 'Profit %',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className={`font-mono ${data > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data > 0 ? '+' : ''}{formatPercent((data || 0) / 100, 1)}
          </span>
        ),
      },
      {
        key: 'Expires',
        label: 'Expiration',
        className: 'text-center',
        render: (data) => {
          if (!data) return <span className="text-text-secondary">N/A</span>;
          const expiresDate = new Date(data);
          const now = new Date();
          const hoursLeft = Math.max(0, (expiresDate - now) / (1000 * 60 * 60));

          return (
            <span className={`text-sm ${hoursLeft < 24 ? 'text-red-400' : hoursLeft < 72 ? 'text-yellow-400' : 'text-text-secondary'}`}>
              {hoursLeft < 24
                ? `${Math.round(hoursLeft)}h`
                : `${Math.round(hoursLeft / 24)}d`}
            </span>
          );
        },
      },
    ],
    []
  );

  // Table columns for Courier contracts
  const courierColumns = useMemo(
    () => [
      {
        key: 'Contract ID',
        label: 'Contract ID',
        className: 'font-mono text-sm',
        render: (data) => (
          <span className="text-accent-cyan">{data}</span>
        ),
      },
      {
        key: 'Route',
        label: 'Route',
        className: 'min-w-[200px]',
        render: (_, row) => (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-primary truncate" title={row.From}>{row.From}</span>
            <svg className="w-4 h-4 text-accent-cyan flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-text-primary truncate" title={row.To}>{row.To}</span>
          </div>
        ),
      },
      {
        key: 'Reward',
        label: 'Reward',
        type: 'num',
        defaultSort: true,
        className: 'text-right',
        render: (data) => (
          <span className="font-mono font-semibold text-green-400">
            {formatCompact(data || 0)}
          </span>
        ),
      },
      {
        key: 'Collateral',
        label: 'Collateral',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-text-secondary">{formatCompact(data || 0)}</span>
        ),
      },
      {
        key: 'Volume',
        label: 'Volume',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-text-secondary">{formatNumber(data || 0, 0)} m³</span>
        ),
      },
      {
        key: 'Jumps',
        label: 'Jumps',
        type: 'num',
        className: 'text-center',
        render: (data) => (
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            data <= 5 ? 'bg-green-500/20 text-green-400' :
            data <= 15 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {data || 'N/A'}
          </span>
        ),
      },
      {
        key: 'ISK/Jump',
        label: 'ISK/Jump',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-accent-cyan">{formatCompact(data || 0)}</span>
        ),
      },
      {
        key: 'ISK/m³',
        label: 'ISK/m³',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-accent-purple">{formatNumber(data || 0, 0)}</span>
        ),
      },
    ],
    []
  );

  // Table columns for Auction contracts
  const auctionColumns = useMemo(
    () => [
      {
        key: 'Contract ID',
        label: 'Contract ID',
        className: 'font-mono text-sm',
        render: (data) => (
          <span className="text-accent-cyan">{data}</span>
        ),
      },
      {
        key: 'Item',
        label: 'Item',
        className: 'min-w-[180px]',
        render: (data) => (
          <span className="text-text-primary truncate" title={data}>{data}</span>
        ),
      },
      {
        key: 'Location',
        label: 'Location',
        className: 'min-w-[140px]',
        render: (data) => (
          <span className="text-text-secondary truncate" title={data}>{data}</span>
        ),
      },
      {
        key: 'Current Bid',
        label: 'Current Bid',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-yellow-400">{formatCompact(data || 0)}</span>
        ),
      },
      {
        key: 'Buyout',
        label: 'Buyout',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-red-400">{formatCompact(data || 0)}</span>
        ),
      },
      {
        key: 'Market Value',
        label: 'Market Value',
        type: 'num',
        className: 'text-right',
        render: (data) => (
          <span className="font-mono text-green-400">{formatCompact(data || 0)}</span>
        ),
      },
      {
        key: 'Profit (Current)',
        label: 'Potential Profit',
        type: 'num',
        defaultSort: true,
        className: 'text-right',
        render: (data) => (
          <span className={`font-mono font-semibold ${data > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data > 0 ? '+' : ''}{formatCompact(data || 0)}
          </span>
        ),
      },
      {
        key: 'Expires',
        label: 'Expiration',
        className: 'text-center',
        render: (data) => {
          if (!data) return <span className="text-text-secondary">N/A</span>;
          const expiresDate = new Date(data);
          const now = new Date();
          const hoursLeft = Math.max(0, (expiresDate - now) / (1000 * 60 * 60));

          return (
            <span className={`text-sm ${hoursLeft < 24 ? 'text-red-400' : hoursLeft < 72 ? 'text-yellow-400' : 'text-text-secondary'}`}>
              {hoursLeft < 24
                ? `${Math.round(hoursLeft)}h`
                : `${Math.round(hoursLeft / 24)}d`}
            </span>
          );
        },
      },
    ],
    []
  );

  // Select columns based on contract type
  const tableColumns = useMemo(() => {
    if (selectedType === 'Courier') return courierColumns;
    if (selectedType === 'Auction') return auctionColumns;
    return itemExchangeColumns;
  }, [selectedType, itemExchangeColumns, courierColumns, auctionColumns]);

  return (
    <PageLayout
      title="Contract Finder"
      subtitle="Discover profitable contract opportunities across New Eden"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Form */}
        <GlassmorphicCard className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <RegionAutocomplete
                label="Region (Optional)"
                value={form.regionId}
                onChange={(v) => updateForm('regionId', v)}
                placeholder="All Regions"
              />
              <FormSelect
                label="Contract Type"
                value={form.contractType}
                onChange={(v) => updateForm('contractType', v)}
                options={CONTRACT_TYPE_OPTIONS}
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <FormInput
                label="Minimum Profit"
                type="number"
                value={form.minProfit}
                onChange={(v) => updateForm('minProfit', v)}
                suffix="ISK"
                helper="Minimum expected profit"
              />
              <FormInput
                label="Max Collateral"
                type="number"
                value={form.maxCollateral}
                onChange={(v) => updateForm('maxCollateral', v)}
                suffix="ISK"
                helper="For courier contracts"
              />
              <FormInput
                label="Max Volume"
                type="number"
                value={form.maxVolume}
                onChange={(v) => updateForm('maxVolume', v)}
                suffix="m³"
                helper="Max cargo volume"
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
              {loading ? 'Searching...' : 'Find Contracts'}
            </Button>
          </form>
        </GlassmorphicCard>

        {/* Statistics Panel */}
        {contracts && !loading && (
          <GlassmorphicCard className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Total Contracts</div>
                <div className="text-2xl font-bold text-accent-cyan">
                  {formatNumber(statistics.totalContracts, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Item Exchange</div>
                <div className="text-2xl font-bold text-accent-purple">
                  {formatNumber(statistics.itemExchangeCount, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Courier</div>
                <div className="text-2xl font-bold text-accent-gold">
                  {formatNumber(statistics.courierCount, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Auction</div>
                <div className="text-2xl font-bold text-accent-pink">
                  {formatNumber(statistics.auctionCount, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Total Profit</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatISK(statistics.totalProfit, false)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Avg Profit</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatISK(statistics.avgProfit, false)}
                </div>
              </div>
            </div>
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
        {contracts && !loading && (
          <>
            {displayedContracts.length === 0 ? (
              <GlassmorphicCard className="text-center py-12">
                <p className="text-text-secondary text-lg">
                  No contracts found matching your criteria.
                </p>
                <p className="text-text-secondary/70 mt-2">
                  Try adjusting your filters or selecting a different region.
                </p>
              </GlassmorphicCard>
            ) : (
              <>
                {/* Filter and Sort Controls */}
                <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-text-secondary text-sm">
                      Showing <span className="text-accent-cyan font-medium">{displayedContracts.length}</span> contracts
                    </div>
                    {/* Type filter buttons */}
                    <div className="flex gap-2">
                      {CONTRACT_TYPE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedType(option.value)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            selectedType === option.value
                              ? 'bg-accent-cyan text-space-black'
                              : 'bg-space-dark/50 text-text-secondary hover:bg-space-dark'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
                    >
                      <option value="profit">Profit</option>
                      <option value="profitPercent">Profit %</option>
                      <option value="iskPerJump">ISK/Jump</option>
                      <option value="iskPerM3">ISK/m³</option>
                      <option value="volume">Volume</option>
                      <option value="jumps">Jumps</option>
                      <option value="expires">Expiring Soon</option>
                    </select>
                  </div>
                </div>

                {/* Contracts Table */}
                <TradingTable
                  tableId="contract-finder-table"
                  data={displayedContracts}
                  columns={tableColumns}
                  defaultSort={{ column: tableColumns.find(c => c.defaultSort)?.key || tableColumns[0].key, direction: 'desc' }}
                  emptyMessage="No contracts found"
                />
              </>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default ContractFinderPage;
