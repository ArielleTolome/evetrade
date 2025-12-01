import { useState, useMemo } from 'react';

/**
 * Quick Filters Bar
 * One-click preset filters for station trading
 */
export function QuickFiltersBar({
  onFilterChange,
  activeFilters = [],
  data = [],
  className = '',
}) {
  const [expanded, setExpanded] = useState(false);

  // Pre-defined filter presets
  const filterPresets = useMemo(() => [
    {
      id: 'high-quality',
      label: 'High Quality',
      icon: '⭐',
      description: '>10% margin, >1M profit, >100 vol',
      filter: (item) => (
        (item['Gross Margin'] || 0) > 10 &&
        (item['Net Profit'] || 0) > 1000000 &&
        (item['Volume'] || 0) > 100
      ),
      color: 'accent-gold',
    },
    {
      id: 'quick-flip',
      label: 'Quick Flip',
      icon: '⚡',
      description: 'High volume, fast turnover',
      filter: (item) => (
        (item['Volume'] || 0) > 500 &&
        (item['Gross Margin'] || 0) > 3
      ),
      color: 'blue-400',
    },
    {
      id: 'big-margin',
      label: 'Big Margin',
      icon: '📈',
      description: '>20% profit margin',
      filter: (item) => (item['Gross Margin'] || 0) > 20,
      color: 'green-400',
    },
    {
      id: 'whale-trades',
      label: 'Whale Trades',
      icon: '🐋',
      description: '>10M potential profit',
      filter: (item) => (item['Net Profit'] || 0) > 10000000,
      color: 'purple-400',
    },
    {
      id: 'low-risk',
      label: 'Low Risk',
      icon: '🛡️',
      description: 'Stable items, >200 volume',
      filter: (item) => (
        (item['Volume'] || 0) > 200 &&
        (item['Gross Margin'] || 0) > 5 &&
        (item['Gross Margin'] || 0) < 25
      ),
      color: 'cyan-400',
    },
    {
      id: 'under-1m',
      label: 'Budget',
      icon: '💰',
      description: 'Buy price <1M ISK',
      filter: (item) => (item['Buy Price'] || 0) < 1000000,
      color: 'orange-400',
    },
    {
      id: 'mid-range',
      label: 'Mid Range',
      icon: '📊',
      description: '1M-50M buy price',
      filter: (item) => {
        const price = item['Buy Price'] || 0;
        return price >= 1000000 && price <= 50000000;
      },
      color: 'teal-400',
    },
    {
      id: 'expensive',
      label: 'Expensive',
      icon: '💎',
      description: '>50M buy price',
      filter: (item) => (item['Buy Price'] || 0) > 50000000,
      color: 'pink-400',
    },
  ], []);

  // Calculate how many items match each filter
  const filterCounts = useMemo(() => {
    if (!data || data.length === 0) return {};

    const counts = {};
    filterPresets.forEach(preset => {
      counts[preset.id] = data.filter(preset.filter).length;
    });
    return counts;
  }, [data, filterPresets]);

  const handleFilterToggle = (filterId) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];

    onFilterChange?.(newFilters);
  };

  const handleClearAll = () => {
    onFilterChange?.([]);
  };

  // Get active filter functions for external use
  const getActiveFilterFunctions = () => {
    return filterPresets
      .filter(p => activeFilters.includes(p.id))
      .map(p => p.filter);
  };

  // Visible presets (first 5 or all if expanded)
  const visiblePresets = expanded ? filterPresets : filterPresets.slice(0, 5);

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-medium text-text-secondary">Quick Filters</span>
        {activeFilters.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-400 hover:text-red-300 transition-colors ml-2"
          >
            Clear ({activeFilters.length})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visiblePresets.map((preset) => {
          const isActive = activeFilters.includes(preset.id);
          const count = filterCounts[preset.id] || 0;

          return (
            <button
              key={preset.id}
              onClick={() => handleFilterToggle(preset.id)}
              className={`
                group flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                border text-sm font-medium transition-all duration-200
                ${isActive
                  ? `bg-${preset.color}/20 border-${preset.color}/50 text-${preset.color}`
                  : 'bg-space-dark/50 border-accent-cyan/20 text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary'
                }
              `}
              title={preset.description}
              style={isActive ? {
                backgroundColor: `var(--${preset.color}, rgba(255,255,255,0.1))`,
                borderColor: `var(--${preset.color}, rgba(255,255,255,0.3))`,
              } : {}}
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
              <span className={`
                text-xs px-1.5 py-0.5 rounded
                ${isActive ? 'bg-white/20' : 'bg-white/10'}
              `}>
                {count}
              </span>
            </button>
          );
        })}

        {/* Show More/Less button */}
        {filterPresets.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 rounded-lg border border-accent-cyan/20 text-text-secondary text-sm hover:border-accent-cyan/40 hover:text-text-primary transition-colors"
          >
            {expanded ? 'Show Less' : `+${filterPresets.length - 5} More`}
          </button>
        )}
      </div>

      {/* Active filters summary */}
      {activeFilters.length > 0 && (
        <div className="mt-3 text-xs text-text-secondary">
          Showing items matching: {activeFilters.map(id => {
            const preset = filterPresets.find(p => p.id === id);
            return preset?.label;
          }).join(' OR ')}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to apply quick filters to data
 */
export function useQuickFilters(data, activeFilterIds) {
  const filterPresets = {
    'high-quality': (item) => (
      (item['Gross Margin'] || 0) > 10 &&
      (item['Net Profit'] || 0) > 1000000 &&
      (item['Volume'] || 0) > 100
    ),
    'quick-flip': (item) => (
      (item['Volume'] || 0) > 500 &&
      (item['Gross Margin'] || 0) > 3
    ),
    'big-margin': (item) => (item['Gross Margin'] || 0) > 20,
    'whale-trades': (item) => (item['Net Profit'] || 0) > 10000000,
    'low-risk': (item) => (
      (item['Volume'] || 0) > 200 &&
      (item['Gross Margin'] || 0) > 5 &&
      (item['Gross Margin'] || 0) < 25
    ),
    'under-1m': (item) => (item['Buy Price'] || 0) < 1000000,
    'mid-range': (item) => {
      const price = item['Buy Price'] || 0;
      return price >= 1000000 && price <= 50000000;
    },
    'expensive': (item) => (item['Buy Price'] || 0) > 50000000,
  };

  return useMemo(() => {
    if (!data || data.length === 0 || activeFilterIds.length === 0) {
      return data;
    }

    // Apply OR logic - item must match at least one active filter
    return data.filter(item =>
      activeFilterIds.some(filterId => {
        const filterFn = filterPresets[filterId];
        return filterFn ? filterFn(item) : true;
      })
    );
  }, [data, activeFilterIds]);
}

export default QuickFiltersBar;
