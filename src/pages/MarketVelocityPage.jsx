import { useState, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { FormInput, FormSelect, RegionAutocomplete, ItemAutocomplete } from '../components/forms';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useResources } from '../hooks/useResources';
import { useMarketVelocity } from '../hooks/useMarketVelocity';
import { formatNumber, formatPercent, formatCompact } from '../utils/formatters';

/**
 * Competition level filter options
 */
const COMPETITION_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'low', label: 'Low Competition' },
  { value: 'medium', label: 'Medium Competition' },
  { value: 'high', label: 'High Competition' },
  { value: 'extreme', label: 'Extreme Competition' },
];

/**
 * Get color class for velocity score
 * @param {number} score - Velocity score (0-100)
 * @returns {string} Tailwind color class
 */
function getVelocityColorClass(score) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-yellow-400';
  if (score >= 20) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get color class for competition level
 * @param {string} level - Competition level
 * @returns {string} Tailwind color class
 */
function getCompetitionColorClass(level) {
  switch (level) {
    case 'low':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-orange-400';
    case 'extreme':
      return 'text-red-400';
    default:
      return 'text-text-secondary';
  }
}

/**
 * Velocity Score Visual Indicator Component
 */
function VelocityScoreIndicator({ score }) {
  const colorClass = getVelocityColorClass(score);
  const percentage = Math.min(score, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-space-dark/30 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass.replace('text-', 'bg-')} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-lg font-bold ${colorClass} min-w-[3rem] text-right`}>
        {score}
      </span>
    </div>
  );
}

/**
 * Volume Trend Indicator Component
 */
function VolumeTrendBadge({ trend, changePercent }) {
  const isIncreasing = trend === 'increasing';
  const isDecreasing = trend === 'decreasing';
  const isStable = trend === 'stable';

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
        ${isIncreasing ? 'bg-green-500/10 text-green-400' : ''}
        ${isDecreasing ? 'bg-red-500/10 text-red-400' : ''}
        ${isStable ? 'bg-gray-500/10 text-gray-400' : ''}
      `}
    >
      {isIncreasing && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )}
      {isDecreasing && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )}
      {isStable && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      )}
      {Math.abs(changePercent) > 0 ? `${changePercent > 0 ? '+' : ''}${changePercent}%` : 'Stable'}
    </span>
  );
}

/**
 * Competition Level Badge Component
 */
function CompetitionBadge({ level }) {
  const colorClass = getCompetitionColorClass(level);
  const label = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <span className={`text-sm font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

/**
 * Market Velocity Analysis Page
 */
export function MarketVelocityPage() {
  const { regionList, invTypes, loadInvTypes } = useResources();

  // Form state
  const [region, setRegion] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [minVolume, setMinVolume] = useState(1000);
  const [minVelocityScore, setMinVelocityScore] = useState(0);
  const [competitionFilter, setCompetitionFilter] = useState('all');

  // Get region ID from region name
  const regionId = useMemo(() => {
    if (!region || !regionList) return null;
    // This is a simplified lookup - you may need to adjust based on your data structure
    const regionData = regionList.find((r) => r === region);
    // For now, we'll use a placeholder - adjust based on your actual data structure
    return regionData ? 10000002 : null; // Default to The Forge
  }, [region, regionList]);

  // Extract type IDs from selected items
  const typeIds = useMemo(() => {
    return selectedItems.map((item) => Number(item.typeId)).filter(Boolean);
  }, [selectedItems]);

  // Use the market velocity hook
  const {
    velocities,
    loading,
    error,
    lastUpdated,
    refresh,
    statistics,
    topOpportunities,
  } = useMarketVelocity(regionId, {
    typeIds,
    minVolume,
    minVelocityScore,
    competitionFilter,
  });

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!regionId || typeIds.length === 0) {
        return;
      }
      refresh();
    },
    [regionId, typeIds, refresh]
  );

  // Handle item selection
  const handleItemSelect = useCallback((item) => {
    setSelectedItems((prev) => {
      // Check if item already exists
      const exists = prev.some((i) => i.typeId === item.typeId);
      if (exists) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  // Handle item removal
  const handleRemoveItem = useCallback((typeId) => {
    setSelectedItems((prev) => prev.filter((item) => item.typeId !== typeId));
  }, []);

  // Get item name by type ID
  const getItemName = useCallback(
    (typeId) => {
      if (!invTypes) return `Item #${typeId}`;

      // Handle array format
      if (Array.isArray(invTypes)) {
        const item = invTypes.find(
          (i) => String(i.typeID || i.typeId || i.type_id) === String(typeId)
        );
        return item ? item.typeName || item.name || item.type_name || `Item #${typeId}` : `Item #${typeId}`;
      }

      // Handle object format
      if (typeof invTypes === 'object') {
        const typeData = invTypes[typeId];
        if (typeData) {
          return typeof typeData === 'object'
            ? typeData.typeName || typeData.name || `Item #${typeId}`
            : typeData;
        }
      }

      return `Item #${typeId}`;
    },
    [invTypes]
  );

  return (
    <PageLayout
      title="Market Velocity Analysis"
      subtitle="Identify high-turnover trading opportunities with velocity scoring"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        {/* Search Form */}
        <GlassmorphicCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region Selection */}
              <RegionAutocomplete
                label="Region"
                value={region}
                onChange={setRegion}
                placeholder="Select a region..."
                required
              />

              {/* Item Search */}
              <ItemAutocomplete
                label="Add Items"
                placeholder="Search and add items..."
                onChange={handleItemSelect}
              />
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Selected Items ({selectedItems.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <span
                      key={item.typeId}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg text-sm text-text-primary"
                    >
                      {item.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.typeId)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="Min Daily Volume"
                type="number"
                value={minVolume}
                onChange={setMinVolume}
                min={0}
                placeholder="1000"
              />

              <FormInput
                label="Min Velocity Score"
                type="number"
                value={minVelocityScore}
                onChange={setMinVelocityScore}
                min={0}
                max={100}
                placeholder="0"
              />

              <FormSelect
                label="Competition Level"
                value={competitionFilter}
                onChange={setCompetitionFilter}
                options={COMPETITION_LEVELS}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!regionId || typeIds.length === 0 || loading}
                loading={loading}
              >
                Analyze Market Velocity
              </Button>
            </div>
          </form>
        </GlassmorphicCard>

        {/* Error State */}
        {error && (
          <GlassmorphicCard className="border-red-500/30">
            <div className="flex items-center gap-3 text-red-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium">Error Loading Data</p>
                <p className="text-sm text-text-secondary">{error.message}</p>
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {/* Loading State */}
        {loading && (
          <GlassmorphicCard>
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-text-secondary">Analyzing market velocity...</p>
            </div>
          </GlassmorphicCard>
        )}

        {/* Statistics Summary */}
        {!loading && velocities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <GlassmorphicCard padding="p-4">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-1">Total Items</p>
                <p className="text-2xl font-bold text-accent-cyan">{statistics.totalItems}</p>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-1">Avg Velocity</p>
                <p className={`text-2xl font-bold ${getVelocityColorClass(statistics.averageVelocityScore)}`}>
                  {statistics.averageVelocityScore}
                </p>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-1">High Velocity</p>
                <p className="text-2xl font-bold text-green-400">{statistics.highVelocityCount}</p>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-1">Avg Daily Vol</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCompact(statistics.averageDailyVolume)}
                </p>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-1">Avg Days to Sell</p>
                <p className="text-2xl font-bold text-text-primary">
                  {statistics.averageDaysToSell}
                </p>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-1">Avg Spread</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatPercent(statistics.averageSpread / 100, 1)}
                </p>
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {/* Top Opportunities */}
        {!loading && topOpportunities.length > 0 && (
          <GlassmorphicCard>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Top Opportunities
            </h2>

            <div className="space-y-3">
              {topOpportunities.map((item) => (
                <div
                  key={item.typeId}
                  className="p-4 bg-space-dark/30 border border-accent-cyan/10 rounded-lg hover:border-accent-cyan/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-text-primary">{getItemName(item.typeId)}</h3>
                      <p className="text-xs text-text-secondary">Type ID: {item.typeId}</p>
                    </div>
                    <CompetitionBadge level={item.competitionLevel} />
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-text-secondary mb-1">Velocity Score</p>
                    <VelocityScoreIndicator score={item.velocityScore} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Daily Vol (7d)</p>
                      <p className="text-text-primary font-medium">{formatCompact(item.dailyVolume7d)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Daily Vol (30d)</p>
                      <p className="text-text-primary font-medium">{formatCompact(item.dailyVolume30d)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Days to Sell</p>
                      <p className="text-text-primary font-medium">
                        {item.daysToSell < 999 ? item.daysToSell : '999+'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs mb-1">Spread</p>
                      <p className="text-text-primary font-medium">{formatPercent(item.currentSpread / 100, 1)}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-accent-cyan/10 flex items-center justify-between">
                    <VolumeTrendBadge trend={item.volumeTrend} changePercent={item.volumeTrendPercent} />
                    <div className="text-xs text-text-secondary">
                      {item.sellOrders} sell orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>
        )}

        {/* All Results Table */}
        {!loading && velocities.length > 0 && (
          <GlassmorphicCard>
            <h2 className="text-xl font-bold text-text-primary mb-4">All Results</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent-cyan/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Item</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Velocity</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">7d Vol</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">30d Vol</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">Trend</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Days to Sell</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Spread</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">Competition</th>
                  </tr>
                </thead>
                <tbody>
                  {velocities.map((item) => (
                    <tr
                      key={item.typeId}
                      className="border-b border-accent-cyan/5 hover:bg-accent-cyan/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{getItemName(item.typeId)}</p>
                          <p className="text-xs text-text-secondary">#{item.typeId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-32">
                          <VelocityScoreIndicator score={item.velocityScore} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-text-primary">
                        {formatCompact(item.dailyVolume7d)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-text-primary">
                        {formatCompact(item.dailyVolume30d)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <VolumeTrendBadge trend={item.volumeTrend} changePercent={item.volumeTrendPercent} />
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-text-primary">
                        {item.daysToSell < 999 ? item.daysToSell : '999+'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-text-primary">
                        {formatPercent(item.currentSpread / 100, 1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <CompetitionBadge level={item.competitionLevel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassmorphicCard>
        )}

        {/* Empty State */}
        {!loading && !error && velocities.length === 0 && typeIds.length > 0 && (
          <GlassmorphicCard>
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-text-secondary mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-text-secondary text-lg mb-2">No results match your filters</p>
              <p className="text-text-secondary text-sm">
                Try adjusting your minimum volume or velocity score thresholds
              </p>
            </div>
          </GlassmorphicCard>
        )}

        {/* Instructions */}
        {!loading && typeIds.length === 0 && (
          <GlassmorphicCard className="border-accent-cyan/30">
            <div className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-accent-cyan flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">How to Use Market Velocity Analysis</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">1.</span>
                    <span>Select a region to analyze market activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">2.</span>
                    <span>Add items you want to analyze (search by name or type ID)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">3.</span>
                    <span>Set minimum thresholds for volume and velocity score</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">4.</span>
                    <span>Filter by competition level to find your ideal opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-cyan mt-1">5.</span>
                    <span>
                      Higher velocity scores indicate faster turnover and better quick-flip opportunities
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-center text-sm text-text-secondary">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default MarketVelocityPage;
