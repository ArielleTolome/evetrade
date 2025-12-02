import { useState, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { FormInput, FormSelect } from '../components/forms';
import { useEveAuth } from '../hooks/useEveAuth';
import { useIndustryProfits } from '../hooks/useIndustryProfits';
import { useResources } from '../hooks/useResources';
import { formatISK, formatNumber, formatPercent } from '../utils/formatters';

/**
 * Activity type options for industry
 */
const ACTIVITY_OPTIONS = [
  { value: 'all', label: 'All Activities' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'reactions', label: 'Reactions' },
  { value: 'invention', label: 'Invention' },
  { value: 'copying', label: 'Copying' },
  { value: 'research_material', label: 'Material Research' },
  { value: 'research_time', label: 'Time Research' },
];

/**
 * ME Level options (0-10)
 */
const ME_LEVEL_OPTIONS = [
  { value: 'all', label: 'All ME Levels' },
  ...Array.from({ length: 11 }, (_, i) => ({ value: i.toString(), label: `ME ${i}` })),
];

/**
 * Industry Profits Page Component
 * Displays profitable blueprints from character's assets
 */
export function IndustryProfitsPage() {
  const { isAuthenticated, character, getAccessToken, login } = useEveAuth();
  const { regionList, loading: resourcesLoading } = useResources();
  const {
    data,
    loading,
    error,
    lastUpdated,
    fetchIndustryProfits,
    filterBlueprints,
    clearCache
  } = useIndustryProfits();

  // Form state
  const [regionId, setRegionId] = useState('10000002'); // The Forge (Jita)
  const [meLevel, setMeLevel] = useState('all');
  const [activity, setActivity] = useState('all');
  const [minProfit, setMinProfit] = useState('1000000'); // 1M ISK default
  const [minROI, setMinROI] = useState('0');

  // Filtering state
  const [searchFilter, setSearchFilter] = useState('');
  const [runsFilter, setRunsFilter] = useState('all'); // all, original, copy
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(40);

  // Build region options from resources
  const regionOptions = useMemo(() => {
    if (!regionList) return [];

    return Object.entries(regionList)
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [regionList]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!character?.id) return;

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const params = {
        characterId: character.id,
        accessToken,
        regionId: parseInt(regionId),
        minProfit: parseFloat(minProfit) || 0,
        minROI: parseFloat(minROI) || 0,
        activity: activity !== 'all' ? activity : undefined,
        meLevel: meLevel !== 'all' ? parseInt(meLevel) : undefined,
      };

      await fetchIndustryProfits(params);
      setCurrentPage(1); // Reset to first page on new search
    } catch (err) {
      console.error('Failed to fetch industry profits:', err);
    }
  }, [character, getAccessToken, regionId, minProfit, minROI, activity, meLevel, fetchIndustryProfits]);

  // Filter blueprints based on local filters
  const filteredBlueprints = useMemo(() => {
    if (!data?.blueprints) return [];

    let filtered = filterBlueprints(data.blueprints, {
      search: searchFilter,
      runsType: runsFilter,
    });

    return filtered;
  }, [data, searchFilter, runsFilter, filterBlueprints]);

  // Pagination
  const totalPages = Math.ceil(filteredBlueprints.length / entriesPerPage);
  const paginatedBlueprints = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredBlueprints.slice(start, start + entriesPerPage);
  }, [filteredBlueprints, currentPage, entriesPerPage]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!filteredBlueprints.length) return null;

    const totalProfit = filteredBlueprints.reduce((sum, bp) => {
      const profit = (bp['Market Price'] || 0) - (bp['Material Cost'] || 0);
      return sum + profit;
    }, 0);

    const avgROI = filteredBlueprints.reduce((sum, bp) => {
      const roi = bp['ROI %'] || 0;
      return sum + roi;
    }, 0) / filteredBlueprints.length;

    const avgProfit = totalProfit / filteredBlueprints.length;

    return {
      count: filteredBlueprints.length,
      totalProfit,
      avgProfit,
      avgROI,
    };
  }, [filteredBlueprints]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (!filteredBlueprints.length) return;

    const headers = [
      'Blueprint Name',
      'ME Level',
      'Runs',
      'Market Price',
      'Material Cost',
      'Profit',
      'ROI %',
    ];

    const rows = filteredBlueprints.map(bp => [
      bp['Blueprint Name'] || '',
      bp['Material Efficiency'] || 0,
      bp['Runs'] || 'Original',
      bp['Market Price'] || 0,
      bp['Material Cost'] || 0,
      (bp['Market Price'] || 0) - (bp['Material Cost'] || 0),
      bp['ROI %'] || 0,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `industry-profits-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredBlueprints]);

  // Login required state
  if (!isAuthenticated) {
    return (
      <PageLayout
        title="Industry Profits"
        subtitle="Analyze blueprint profitability from your assets"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-text-primary mb-2">ESI Authentication Required</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              This feature requires access to your character's blueprints and assets.
              Connect your EVE Online account to analyze your industry opportunities.
            </p>
            <Button onClick={login} variant="primary" className="px-8 py-3">
              Login with EVE Online
            </Button>
          </GlassmorphicCard>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h3 className="text-sm font-medium text-accent-cyan mb-2">About Industry Profits</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>View all blueprints in your character's assets with their current market profitability</li>
              <li>Filter by Material Efficiency (ME) level, activity type, and profit thresholds</li>
              <li>Compare material costs against market prices to identify the best manufacturing opportunities</li>
              <li>Track ROI percentages to prioritize your most profitable blueprints</li>
              <li>Export results to CSV for further analysis in spreadsheets</li>
            </ul>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Industry Profits"
      subtitle={character ? `Analyzing blueprints for ${character.name}` : 'Blueprint profitability analysis'}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Form */}
        <GlassmorphicCard className="mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Region Select */}
              <FormSelect
                label="Market Region"
                value={regionId}
                onChange={setRegionId}
                options={regionOptions}
                disabled={loading || resourcesLoading}
                required
              />

              {/* ME Level Filter */}
              <FormSelect
                label="ME Level"
                value={meLevel}
                onChange={setMeLevel}
                options={ME_LEVEL_OPTIONS}
                disabled={loading}
                helper="Filter by material efficiency level"
              />

              {/* Activity Type */}
              <FormSelect
                label="Activity Type"
                value={activity}
                onChange={setActivity}
                options={ACTIVITY_OPTIONS}
                disabled={loading}
              />

              {/* Min Profit */}
              <FormInput
                label="Minimum Profit (ISK)"
                type="number"
                value={minProfit}
                onChange={setMinProfit}
                min="0"
                step="100000"
                disabled={loading}
                helper="Only show blueprints above this profit"
              />

              {/* Min ROI */}
              <FormInput
                label="Minimum ROI (%)"
                type="number"
                value={minROI}
                onChange={setMinROI}
                min="0"
                step="1"
                disabled={loading}
                helper="Return on investment percentage"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || resourcesLoading}
                loading={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Blueprints'}
              </Button>

              {data && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => clearCache()}
                    disabled={loading}
                  >
                    Clear Cache
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleExport}
                    disabled={!filteredBlueprints.length}
                  >
                    Export to CSV
                  </Button>
                </>
              )}

              {lastUpdated && (
                <span className="text-xs text-text-secondary self-center">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </form>
        </GlassmorphicCard>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <p className="font-medium">Error loading industry data</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <GlassmorphicCard padding="p-4">
              <div className="text-xs text-text-secondary mb-1">Blueprints Found</div>
              <div className="text-lg font-bold text-accent-cyan">
                {formatNumber(stats.count, 0)}
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-xs text-text-secondary mb-1">Total Potential Profit</div>
              <div className="text-lg font-bold text-green-400">
                {formatISK(stats.totalProfit, false)}
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-xs text-text-secondary mb-1">Average Profit</div>
              <div className="text-lg font-bold text-text-primary">
                {formatISK(stats.avgProfit, false)}
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard padding="p-4">
              <div className="text-xs text-text-secondary mb-1">Average ROI</div>
              <div className="text-lg font-bold text-accent-purple">
                {formatPercent(stats.avgROI / 100, 1)}
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {/* Filters and Controls */}
        {data && filteredBlueprints.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search blueprints..."
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm w-48 min-h-[44px]"
              />

              <select
                value={runsFilter}
                onChange={(e) => {
                  setRunsFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm min-h-[44px]"
              >
                <option value="all">All Types</option>
                <option value="original">Originals Only</option>
                <option value="copy">Copies Only</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Entries:</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary text-sm min-h-[44px]"
              >
                <option value="20">20</option>
                <option value="40">40</option>
                <option value="100">100</option>
              </select>

              <span className="text-sm text-text-secondary">
                Page: {currentPage} of {totalPages || 1}
              </span>
            </div>
          </div>
        )}

        {/* Blueprints Table */}
        <GlassmorphicCard>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            </div>
          ) : data && paginatedBlueprints.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedBlueprints.map((bp, idx) => {
                  const profit = (bp['Market Price'] || 0) - (bp['Material Cost'] || 0);
                  const roi = bp['ROI %'] || 0;

                  return (
                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-accent-cyan/10">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary font-medium truncate">
                            {bp['Blueprint Name']}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-secondary">
                              ME {bp['Material Efficiency'] || 0}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {bp['Runs'] === 'Original' ? 'Original' : `${bp['Runs']} runs`}
                            </span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          profit > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {profit > 0 ? '+' : ''}{formatISK(profit, false)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-text-secondary text-xs">Market Price</span>
                          <p className="font-mono text-text-primary">
                            {formatISK(bp['Market Price'] || 0, false)}
                          </p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">Material Cost</span>
                          <p className="font-mono text-text-primary">
                            {bp['Material Cost'] ? formatISK(bp['Material Cost'], false) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-text-secondary text-xs">ROI</span>
                          <p className="font-mono text-accent-purple">
                            {formatPercent(roi / 100, 1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-secondary border-b border-accent-cyan/20">
                      <th className="text-left py-3 px-3">Blueprint Name</th>
                      <th className="text-center py-3 px-3">ME Level</th>
                      <th className="text-right py-3 px-3">Runs</th>
                      <th className="text-right py-3 px-3">Market Price</th>
                      <th className="text-right py-3 px-3">Material Cost</th>
                      <th className="text-right py-3 px-3">Profit</th>
                      <th className="text-right py-3 px-3">ROI %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBlueprints.map((bp, idx) => {
                      const profit = (bp['Market Price'] || 0) - (bp['Material Cost'] || 0);
                      const roi = bp['ROI %'] || 0;

                      return (
                        <tr key={idx} className="border-b border-accent-cyan/10 hover:bg-white/5">
                          <td className="py-2 px-3 text-accent-cyan">
                            {bp['Blueprint Name']}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-text-primary">
                            {bp['Material Efficiency'] || 0}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-secondary">
                            {bp['Runs'] === 'Original' ? 'Original' : bp['Runs']}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-primary">
                            {formatISK(bp['Market Price'] || 0, false)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-text-primary">
                            {bp['Material Cost'] ? formatISK(bp['Material Cost'], false) : 'N/A'}
                          </td>
                          <td className={`py-2 px-3 text-right font-mono font-bold ${
                            profit > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {profit > 0 ? '+' : ''}{formatISK(profit, false)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-accent-purple">
                            {formatPercent(roi / 100, 1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {filteredBlueprints.length > entriesPerPage && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-accent-cyan/20">
                  <span className="text-sm text-text-secondary">
                    Showing {((currentPage - 1) * entriesPerPage) + 1} - {Math.min(currentPage * entriesPerPage, filteredBlueprints.length)} of {filteredBlueprints.length} blueprints
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage <= 1}
                      variant="ghost"
                      size="sm"
                    >
                      First
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      variant="ghost"
                      size="sm"
                    >
                      Prev
                    </Button>
                    <span className="px-3 py-1 text-sm text-text-primary">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      variant="ghost"
                      size="sm"
                    >
                      Next
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      variant="ghost"
                      size="sm"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : data ? (
            <div className="text-center py-12 text-text-secondary">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No blueprints found matching your filters.</p>
              <p className="text-xs mt-2">Try adjusting your search criteria or ME level filters.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              <svg className="w-16 h-16 mx-auto mb-4 text-accent-cyan/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p>Click "Analyze Blueprints" to view your industry opportunities.</p>
              <p className="text-xs mt-2">Make sure you have blueprints in your character's assets.</p>
            </div>
          )}
        </GlassmorphicCard>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
          <h3 className="text-sm font-medium text-accent-cyan mb-2">Understanding the Results</h3>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>Market Price - Current sell price for the manufactured item in the selected region</li>
            <li>Material Cost - Total cost of materials needed to manufacture one unit</li>
            <li>Profit - Market Price minus Material Cost (does not include manufacturing fees or taxes)</li>
            <li>ROI % - Return on Investment percentage (Profit / Material Cost × 100)</li>
            <li>ME Level - Material Efficiency reduces material waste in manufacturing</li>
            <li>Runs - Number of production runs available (Original blueprints have unlimited runs)</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}

export default IndustryProfitsPage;
