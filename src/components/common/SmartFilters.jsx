import { useState, useCallback, useMemo } from 'react';

/**
 * Preset filter configurations
 */
const PRESETS = {
  safe: {
    minVolume: 50,
    maxMargin: 30,
    minMargin: 10,
    hideScams: true,
    riskLevels: ['low', 'medium'],
  },
  highProfit: {
    minProfit: 10000000,
    riskLevels: ['low', 'medium', 'high', 'extreme'],
  },
  quickFlips: {
    minVolume: 100,
    minMargin: 5,
    maxMargin: 20,
    hideScams: true,
    riskLevels: ['low', 'medium'],
  },
  hiddenGems: {
    minMargin: 20,
    minVolume: 20,
    maxVolume: 200,
    riskLevels: ['low', 'medium', 'high'],
  },
};

/**
 * Risk level configuration
 */
const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-green-400', description: 'High volume, stable margins' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', description: 'Moderate volume and margins' },
  { value: 'high', label: 'High', color: 'text-orange-400', description: 'Lower volume or thin margins' },
  { value: 'extreme', label: 'Extreme', color: 'text-red-400', description: 'Very low volume or very thin margins' },
];

/**
 * SmartFilters Component
 * Provides advanced filtering options for trading data
 *
 * @param {Function} onChange - Callback when filters change
 * @param {Object} initialFilters - Initial filter state
 * @param {Array} data - Trading data for calculating max values
 */
export function SmartFilters({ onChange, initialFilters = {}, data = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    hideScams: false,
    hideLowVolume: false,
    highQualityOnly: false,
    verifiedOnly: false,
    minVolume: 0,
    maxVolume: null,
    minMargin: 0,
    maxMargin: 100,
    minProfit: 0,
    maxProfit: null,
    riskLevels: ['low', 'medium', 'high', 'extreme'],
    ...initialFilters,
  });

  // Calculate max values from data for slider limits
  const dataStats = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxVolume: 1000, maxProfit: 100000000 };
    }

    return {
      maxVolume: Math.max(...data.map(t => t['Volume'] || 0), 1000),
      maxProfit: Math.max(...data.map(t => t['Net Profit'] || 0), 100000000),
    };
  }, [data]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.hideScams) count++;
    if (filters.hideLowVolume) count++;
    if (filters.highQualityOnly) count++;
    if (filters.verifiedOnly) count++;
    if (filters.minVolume > 0) count++;
    if (filters.maxVolume !== null && filters.maxVolume < dataStats.maxVolume) count++;
    if (filters.minMargin > 0) count++;
    if (filters.maxMargin < 100) count++;
    if (filters.minProfit > 0) count++;
    if (filters.maxProfit !== null && filters.maxProfit < dataStats.maxProfit) count++;
    if (filters.riskLevels.length < 4) count++;
    return count;
  }, [filters, dataStats]);

  /**
   * Update a single filter value
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      onChange?.(newFilters);
      return newFilters;
    });
  }, [onChange]);

  /**
   * Toggle a boolean filter
   */
  const toggleFilter = useCallback((key) => {
    updateFilter(key, !filters[key]);
  }, [filters, updateFilter]);

  /**
   * Toggle a risk level
   */
  const toggleRiskLevel = useCallback((level) => {
    setFilters(prev => {
      const currentLevels = prev.riskLevels;
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter(l => l !== level)
        : [...currentLevels, level];

      const newFilters = { ...prev, riskLevels: newLevels };
      onChange?.(newFilters);
      return newFilters;
    });
  }, [onChange]);

  /**
   * Apply a preset filter configuration
   */
  const applyPreset = useCallback((presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setFilters(prev => {
        const newFilters = { ...prev, ...preset };
        onChange?.(newFilters);
        return newFilters;
      });
    }
  }, [onChange]);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      hideScams: false,
      hideLowVolume: false,
      highQualityOnly: false,
      verifiedOnly: false,
      minVolume: 0,
      maxVolume: null,
      minMargin: 0,
      maxMargin: 100,
      minProfit: 0,
      maxProfit: null,
      riskLevels: ['low', 'medium', 'high', 'extreme'],
    };
    setFilters(defaultFilters);
    onChange?.(defaultFilters);
  }, [onChange]);

  /**
   * Format ISK values for display
   */
  const formatISK = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="bg-space-dark/40 backdrop-blur-sm border border-accent-cyan/20 rounded-xl overflow-hidden mb-6">
      {/* Header with expand toggle */}
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-space-dark/60 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 text-accent-cyan transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="text-lg font-display font-semibold text-accent-cyan">Smart Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetFilters();
          }}
          className="px-3 py-1.5 text-sm rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 hover:border-accent-cyan/50 transition-all focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan/50"
        >
          Reset All
        </button>
      </div>

      {/* Quick toggles - always visible */}
      <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => toggleFilter('hideScams')}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan/50 ${
            filters.hideScams
              ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan'
              : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:bg-space-dark/70 hover:border-accent-cyan/30'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{filters.hideScams ? '✓' : ''}</span>
            <span>Hide Scams</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter('hideLowVolume')}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan/50 ${
            filters.hideLowVolume
              ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan'
              : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:bg-space-dark/70 hover:border-accent-cyan/30'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{filters.hideLowVolume ? '✓' : ''}</span>
            <span>Hide Low Volume</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter('highQualityOnly')}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan/50 ${
            filters.highQualityOnly
              ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan'
              : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:bg-space-dark/70 hover:border-accent-cyan/30'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{filters.highQualityOnly ? '✓' : ''}</span>
            <span>High Quality</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => toggleFilter('verifiedOnly')}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all focus:outline-none focus-visible:ring-2 focus:ring-accent-cyan/50 ${
            filters.verifiedOnly
              ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan'
              : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:bg-space-dark/70 hover:border-accent-cyan/30'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{filters.verifiedOnly ? '✓' : ''}</span>
            <span>Verified Only</span>
          </div>
        </button>
      </div>

      {/* Expanded section with sliders and presets */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-accent-cyan/10 pt-4 animate-fade-in">
          {/* Preset Filters */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-3">Preset Filters</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('safe')}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all focus:outline-none focus-visible:ring-2 focus:ring-green-500/50"
              >
                Safe Trades
              </button>
              <button
                type="button"
                onClick={() => applyPreset('highProfit')}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 hover:border-accent-gold/50 transition-all focus:outline-none focus-visible:ring-2 focus:ring-accent-gold/50"
              >
                High Profit
              </button>
              <button
                type="button"
                onClick={() => applyPreset('quickFlips')}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all focus:outline-none focus-visible:ring-2 focus:ring-blue-500/50"
              >
                Quick Flips
              </button>
              <button
                type="button"
                onClick={() => applyPreset('hiddenGems')}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all focus:outline-none focus-visible:ring-2 focus:ring-purple-500/50"
              >
                Hidden Gems
              </button>
            </div>
          </div>

          {/* Volume Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">Volume Range</label>
              <span className="text-xs text-text-primary">
                {filters.minVolume} - {filters.maxVolume !== null ? filters.maxVolume : formatISK(dataStats.maxVolume)}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-text-secondary/70 mb-1 block">Min Volume</label>
                <input
                  type="range"
                  min="0"
                  max={dataStats.maxVolume}
                  step="1"
                  value={filters.minVolume}
                  onChange={(e) => updateFilter('minVolume', Number(e.target.value))}
                  className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary/70 mb-1 block">Max Volume</label>
                <input
                  type="range"
                  min="0"
                  max={dataStats.maxVolume}
                  step="1"
                  value={filters.maxVolume !== null ? filters.maxVolume : dataStats.maxVolume}
                  onChange={(e) => updateFilter('maxVolume', Number(e.target.value))}
                  className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
            </div>
          </div>

          {/* Margin Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">Margin Range</label>
              <span className="text-xs text-text-primary">
                {filters.minMargin}% - {filters.maxMargin}%
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-text-secondary/70 mb-1 block">Min Margin</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={filters.minMargin}
                  onChange={(e) => updateFilter('minMargin', Number(e.target.value))}
                  className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary/70 mb-1 block">Max Margin</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={filters.maxMargin}
                  onChange={(e) => updateFilter('maxMargin', Number(e.target.value))}
                  className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
            </div>
          </div>

          {/* Profit Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">Profit Range (ISK)</label>
              <span className="text-xs text-text-primary">
                {formatISK(filters.minProfit)} - {filters.maxProfit !== null ? formatISK(filters.maxProfit) : formatISK(dataStats.maxProfit)}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-text-secondary/70 mb-1 block">Min Profit</label>
                <input
                  type="range"
                  min="0"
                  max={dataStats.maxProfit}
                  step={Math.max(1000000, Math.floor(dataStats.maxProfit / 100))}
                  value={filters.minProfit}
                  onChange={(e) => updateFilter('minProfit', Number(e.target.value))}
                  className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary/70 mb-1 block">Max Profit</label>
                <input
                  type="range"
                  min="0"
                  max={dataStats.maxProfit}
                  step={Math.max(1000000, Math.floor(dataStats.maxProfit / 100))}
                  value={filters.maxProfit !== null ? filters.maxProfit : dataStats.maxProfit}
                  onChange={(e) => updateFilter('maxProfit', Number(e.target.value))}
                  className="w-full h-2 bg-space-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>
            </div>
          </div>

          {/* Risk Level Filters */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-3">Risk Levels</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {RISK_LEVELS.map(level => (
                <label
                  key={level.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    filters.riskLevels.includes(level.value)
                      ? 'bg-space-dark/70 border-accent-cyan/40'
                      : 'bg-space-dark/50 border-accent-cyan/20 opacity-60 hover:opacity-80'
                  }`}
                  title={level.description}
                >
                  <input
                    type="checkbox"
                    checked={filters.riskLevels.includes(level.value)}
                    onChange={() => toggleRiskLevel(level.value)}
                    className="w-4 h-4 rounded border-accent-cyan/30 bg-space-dark text-accent-cyan focus:ring-accent-cyan cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${level.color}`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-accent-cyan">Active Filters Summary</span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.hideScams && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    No Scams
                  </span>
                )}
                {filters.hideLowVolume && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    No Low Volume
                  </span>
                )}
                {filters.highQualityOnly && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    High Quality
                  </span>
                )}
                {filters.verifiedOnly && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    Verified
                  </span>
                )}
                {filters.minVolume > 0 && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    Vol &gt; {filters.minVolume}
                  </span>
                )}
                {filters.maxVolume !== null && filters.maxVolume < dataStats.maxVolume && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    Vol &lt; {filters.maxVolume}
                  </span>
                )}
                {filters.minMargin > 0 && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    Margin &gt; {filters.minMargin}%
                  </span>
                )}
                {filters.maxMargin < 100 && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    Margin &lt; {filters.maxMargin}%
                  </span>
                )}
                {filters.minProfit > 0 && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    Profit &gt; {formatISK(filters.minProfit)}
                  </span>
                )}
                {filters.maxProfit !== null && filters.maxProfit < dataStats.maxProfit && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    Profit &lt; {formatISK(filters.maxProfit)}
                  </span>
                )}
                {filters.riskLevels.length < 4 && (
                  <span className="px-2 py-1 text-xs rounded bg-space-dark/50 border border-accent-cyan/30 text-text-primary">
                    {RISK_LEVELS.filter(l => filters.riskLevels.includes(l.value)).map(l => l.label).join(', ')} Risk
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartFilters;
