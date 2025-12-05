import { useState, useMemo, useCallback } from 'react';
import { Button } from '../common/Button';

/**
 * Get quality tier based on row data stats
 * Used to color-code rows based on trade quality
 */
function getRowQualityTier(row, stats) {
  if (!stats || !row) return null;

  const profit = row['Net Profit'] || 0;
  const volume = row['Volume'] || 0;
  const margin = (row['Gross Margin'] || 0) / 100;

  // Calculate a simple quality score
  const profitScore = stats.maxProfit > 0 ? profit / stats.maxProfit : 0;
  const volumeScore = stats.maxVolume > 0 ? Math.log10(volume + 1) / Math.log10(stats.maxVolume + 1) : 0;
  const marginScore = margin / 0.5; // Cap at 50% margin for scoring

  const score = (profitScore * 0.5) + (volumeScore * 0.3) + (Math.min(marginScore, 1) * 0.2);

  if (score >= 0.7) return 'excellent';
  if (score >= 0.4) return 'good';
  if (score >= 0.2) return 'fair';
  return null;
}

/**
 * Get margin trend indicator based on margin percentage
 * @param {number} marginPercent - Margin as percentage (e.g., 15 for 15%)
 * @returns {object} Trend info with arrow, color, and tooltip
 */
function getMarginTrend(marginPercent) {
  // Thresholds for margin quality
  const EXCELLENT_MARGIN = 15; // >15% = excellent
  const GOOD_MARGIN = 10;      // 10-15% = good
  const MODERATE_MARGIN = 5;   // 5-10% = moderate
  const THIN_MARGIN = 3;       // <3% = very thin

  if (marginPercent >= EXCELLENT_MARGIN) {
    return {
      arrow: '▲',
      color: 'text-accent-green',
      tooltip: `Excellent margin (${marginPercent.toFixed(1)}%)`,
      status: 'excellent',
    };
  } else if (marginPercent >= GOOD_MARGIN) {
    return {
      arrow: '▲',
      color: 'text-accent-cyan',
      tooltip: `Good margin (${marginPercent.toFixed(1)}%)`,
      status: 'good',
    };
  } else if (marginPercent >= MODERATE_MARGIN) {
    return {
      arrow: '—',
      color: 'text-accent-gold',
      tooltip: `Moderate margin (${marginPercent.toFixed(1)}%)`,
      status: 'moderate',
    };
  } else if (marginPercent >= THIN_MARGIN) {
    return {
      arrow: '▼',
      color: 'text-accent-pink',
      tooltip: `Thin margin (${marginPercent.toFixed(1)}%)`,
      status: 'thin',
    };
  } else {
    return {
      arrow: '▼',
      color: 'text-red-500',
      tooltip: `Very thin margin (${marginPercent.toFixed(1)}%) - High competition`,
      status: 'very-thin',
    };
  }
}

/**
 * Calculate trading badges (Hot, Competitive)
 * @param {object} row - Row data
 * @param {object} stats - Overall dataset stats
 * @returns {array} Array of badge objects
 */
function getTradingBadges(row, stats) {
  const badges = [];
  const margin = row['Gross Margin'] || 0; // Already in percentage
  const volume = row['Volume'] || 0;
  const profit = row['Net Profit'] || 0;

  // "Hot" badge - high volume AND good margin AND good profit
  const highVolume = stats.maxVolume > 0 && volume >= stats.maxVolume * 0.5;
  const goodMargin = margin >= 10;
  const goodProfit = stats.maxProfit > 0 && profit >= stats.maxProfit * 0.3;

  if (highVolume && goodMargin && goodProfit) {
    badges.push({
      label: 'Hot',
      color: 'bg-accent-pink/10 text-accent-pink border border-accent-pink/30 shadow-[0_0_10px_rgba(255,0,153,0.1)]',
      tooltip: 'High volume with excellent profit potential',
    });
  }

  // "Competitive" badge - very thin margins
  if (margin < 3) {
    badges.push({
      label: 'Competitive',
      color: 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30',
      tooltip: 'Very thin margins - market is highly competitive',
    });
  }

  return badges;
}

/**
 * Mobile Card View Component
 * Renders a card-based layout for mobile devices
 */
function MobileCardView({
  data,
  columns,
  onRowClick,
  qualityStats,
  showQualityIndicators,
  onAddToWatchlist,
  isItemWatched,
  onCreateAlert,
  expandableRowContent,
}) {
  const [expandedCard, setExpandedCard] = useState(null);

  // Get primary columns for card display (first 4-5 most important)
  const primaryColumns = columns.filter(c => c.visible !== false).slice(0, 5);
  const secondaryColumns = columns.filter(c => c.visible !== false).slice(5);

  return (
    <div className="space-y-3 p-3">
      {data.map((row, idx) => {
        const qualityTier = showQualityIndicators ? getRowQualityTier(row, qualityStats) : null;
        const rowId = row['Item ID'] || row.itemId || idx;
        const isExpanded = expandedCard === rowId;
        const badges = showQualityIndicators && qualityStats ? getTradingBadges(row, qualityStats) : [];

        const qualityBorderClasses = {
          excellent: 'border-l-4 border-l-green-500',
          good: 'border-l-4 border-l-accent-cyan',
          fair: 'border-l-4 border-l-yellow-500',
        };

        return (
          <div
            key={rowId}
            onClick={() => onRowClick?.(row, idx)}
            className={`
              bg-space-dark/60 rounded-xl border border-accent-cyan/10 overflow-hidden
              ${onRowClick ? 'cursor-pointer active:bg-white/5' : ''}
              ${qualityTier ? qualityBorderClasses[qualityTier] : ''}
            `}
          >
            {/* Card Header - Item Name + Actions */}
            <div className="flex items-start justify-between gap-2 p-3 pb-2 border-b border-accent-cyan/5">
              <div className="flex-1 min-w-0">
                <h3 className="text-text-primary font-medium text-sm truncate">
                  {row['Item'] || row.item || row.name || 'Unknown Item'}
                </h3>
                {badges.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {badges.map((badge, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 text-xs rounded ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {onAddToWatchlist && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWatchlist(row);
                    }}
                    disabled={isItemWatched && isItemWatched(row['Item ID'] || row.itemId)}
                    className={`p-2 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center focus:ring-2 focus:ring-accent-cyan focus:outline-none ${
                      isItemWatched && isItemWatched(row['Item ID'] || row.itemId)
                        ? 'bg-accent-purple/20 text-accent-purple/50'
                        : 'bg-accent-purple/10 text-accent-purple active:bg-accent-purple/30'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isItemWatched && isItemWatched(row['Item ID'] || row.itemId) ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                )}
                {onCreateAlert && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateAlert({
                        itemName: row['Item'] || row.item,
                        itemId: row['Item ID'] || row.itemId,
                        type: 'margin',
                        condition: 'above',
                        threshold: (row['Gross Margin'] || row.margin || 5),
                      });
                    }}
                    className="p-2 rounded-lg bg-accent-gold/10 text-accent-gold active:bg-accent-gold/30 min-w-[36px] min-h-[36px] flex items-center justify-center focus:ring-2 focus:ring-accent-cyan focus:outline-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Card Body - Key Stats Grid */}
            <div className="grid grid-cols-2 gap-2 p-3">
              {primaryColumns.filter(c => c.key !== 'Item' && c.key !== 'item' && c.key !== 'name').slice(0, 4).map(col => {
                const value = row[col.key];
                const displayValue = col.render ? col.render(value, row) : value ?? '-';

                // Special styling for certain columns
                let valueClass = 'text-text-primary';
                if (col.key === 'Net Profit' || col.key === 'profit') {
                  valueClass = Number(value) > 0 ? 'text-green-400' : 'text-red-400';
                } else if (col.key === 'Gross Margin' || col.key === 'margin') {
                  const marginPercent = Number(value) || 0;
                  const trend = getMarginTrend(marginPercent);
                  valueClass = trend.color;
                }

                return (
                  <div key={col.key} className="min-w-0">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wide block truncate">
                      {col.label}
                    </span>
                    <span className={`text-sm font-mono ${valueClass} truncate block`}>
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Expandable Section */}
            {secondaryColumns.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(isExpanded ? null : rowId);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-center gap-1 text-xs text-text-secondary border-t border-accent-cyan/5 active:bg-white/5 focus:ring-2 focus:ring-accent-cyan focus:outline-none"
                >
                  <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                  <svg
                    className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="grid grid-cols-2 gap-2 p-3 pt-0 border-t border-accent-cyan/5 bg-space-dark/30">
                    {secondaryColumns.map(col => {
                      const value = row[col.key];
                      const displayValue = col.render ? col.render(value, row) : value ?? '-';

                      return (
                        <div key={col.key} className="min-w-0">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wide block truncate">
                            {col.label}
                          </span>
                          <span className="text-sm font-mono text-text-primary truncate block">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}

                    {/* Expandable row content if provided */}
                    {expandableRowContent && (
                      <div className="col-span-2 mt-2 pt-2 border-t border-accent-cyan/5">
                        {expandableRowContent(row, idx)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Trading Table Component
 * Custom React table with sorting, pagination, and search
 * Includes automatic mobile card view for small screens
 */
export function TradingTable({
  data = [],
  columns = [],
  onRowClick,
  defaultSort = null,
  pageLength = 25,
  className = '',
  emptyMessage = 'No data available',
  showQualityIndicators = false,
  expandableRowContent = null,
  searchInputRef = null,
  onCreateAlert = null,
  onAddToWatchlist = null,
  isItemWatched = null,
  selectedRowIndex = -1,
  enableMobileCards = true, // New prop to enable/disable mobile card view
}) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(pageLength);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Sort state
  const [sortConfig, setSortConfig] = useState(() => {
    if (defaultSort) {
      return { key: defaultSort.column, direction: defaultSort.direction };
    }
    const defaultCol = columns.find(c => c.defaultSort);
    return defaultCol ? { key: defaultCol.key, direction: 'desc' } : null;
  });

  // Calculate stats for quality indicators
  const qualityStats = useMemo(() => {
    if (!showQualityIndicators || !data || data.length === 0) return null;

    return {
      maxProfit: Math.max(...data.map(t => t['Net Profit'] || 0)),
      maxVolume: Math.max(...data.map(t => t['Volume'] || 0)),
    };
  }, [data, showQualityIndicators]);

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const value = row[col.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Numeric comparison
      const col = columns.find(c => c.key === sortConfig.key);
      if (col?.type === 'num' || typeof aVal === 'number') {
        const diff = Number(aVal) - Number(bVal);
        return sortConfig.direction === 'asc' ? diff : -diff;
      }

      // String comparison
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Total pages
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle sort click
  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
    setCurrentPage(0);
  }, []);

  // Handle page change
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  }, [totalPages]);

  // Export to CSV
  const exportCSV = useCallback(() => {
    const headers = columns.map(c => c.label).join(',');
    const rows = sortedData.map(row =>
      columns.map(col => {
        const val = row[col.key];
        // Escape quotes and wrap in quotes if contains comma
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedData, columns]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    const headers = columns.map(c => c.label).join('\t');
    const rows = sortedData.map(row =>
      columns.map(col => String(row[col.key] ?? '')).join('\t')
    );
    const text = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(text);
  }, [sortedData, columns]);

  // Toggle row expansion
  const toggleRowExpansion = useCallback((rowId, event) => {
    event?.stopPropagation();
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  // Render cell value with special handling for margin trends and badges
  const renderCell = useCallback((row, col) => {
    const value = row[col.key];

    // Special handling for Margin column - add trend indicator
    if (col.key === 'Gross Margin') {
      const marginPercent = value || 0;
      const trend = getMarginTrend(marginPercent);
      const displayValue = col.render ? col.render(value, row) : value;

      return (
        <div className="flex items-center gap-2 group relative">
          <span>{displayValue}</span>
          <span className={`${trend.color} text-xs`} title={trend.tooltip}>
            {trend.arrow}
          </span>
          {/* Tooltip */}
          <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            {trend.tooltip}
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-space-black"></div>
          </div>
        </div>
      );
    }

    // Special handling for Item column - add badges
    if (col.key === 'Item' && qualityStats) {
      const badges = getTradingBadges(row, qualityStats);
      const displayValue = col.render ? col.render(value, row) : value;

      if (badges.length > 0) {
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span>{displayValue}</span>
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 text-xs rounded-full ${badge.color} font-medium`}
                title={badge.tooltip}
              >
                {badge.label}
              </span>
            ))}
          </div>
        );
      }
    }

    if (col.render) {
      return col.render(value, row);
    }
    return value ?? '';
  }, [qualityStats]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-space-dark/40 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden shadow-lg">
        <div className="text-center py-16 text-text-secondary">
          <div className="text-4xl mb-4 opacity-20">📊</div>
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-space-dark/40 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-xl ${className}`}>
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-3 sm:p-4 gap-3 sm:gap-4 bg-space-mid/40 border-b border-white/5">
        <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-1">
          <Button
            onClick={copyToClipboard}
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-none min-h-[44px] text-xs sm:text-sm"
          >
            <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            onClick={exportCSV}
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-none min-h-[44px] text-xs sm:text-sm"
          >
            <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
        <div className="w-full sm:w-auto sm:max-w-xs order-1 sm:order-2">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-space-black/50 border border-accent-cyan/20 text-text-primary text-sm focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan placeholder-text-secondary/50 min-h-[44px]"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      {enableMobileCards && (
        <div className="md:hidden">
          <MobileCardView
            data={paginatedData}
            columns={columns}
            onRowClick={onRowClick}
            qualityStats={qualityStats}
            showQualityIndicators={showQualityIndicators}
            onAddToWatchlist={onAddToWatchlist}
            isItemWatched={isItemWatched}
            onCreateAlert={onCreateAlert}
            expandableRowContent={expandableRowContent}
          />
        </div>
      )}

      {/* Desktop Table */}
      <div className={`relative overflow-x-auto md:scrollbar-thin md:scrollbar-thumb-accent-cyan/30 md:scrollbar-track-transparent ${enableMobileCards ? 'hidden md:block' : ''}`}>
        {/* Scroll hint for tablet-sized screens */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-space-dark/80 to-transparent pointer-events-none z-10 lg:hidden" aria-hidden="true" />
        <table className="w-full border-collapse text-sm text-left">
          <thead>
            <tr>
              {expandableRowContent && (
                <th className="bg-space-mid/80 px-4 py-3 border-b border-accent-cyan/20 w-10"></th>
              )}
              {onAddToWatchlist && (
                <th className="bg-space-mid/80 px-4 py-3 border-b border-accent-cyan/20 w-20 text-center">
                  <div className="flex items-center justify-center" title="Watchlist">
                    <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </th>
              )}
              {columns.filter(c => c.visible !== false).map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`
                    bg-space-mid/60 text-accent-cyan font-display font-semibold text-[10px] sm:text-xs uppercase tracking-wider
                    px-2 sm:px-4 py-3 sm:py-4 border-b border-white/5
                    whitespace-nowrap cursor-pointer select-none
                    hover:bg-white/5 transition-colors
                    ${sortConfig?.key === col.key ? 'text-accent-cyan' : 'text-text-secondary'}
                  `}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig?.key === col.key && (
                      <span className="text-accent-gold text-xs">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {onCreateAlert && (
                <th className="bg-space-mid/80 px-4 py-3 border-b border-accent-cyan/20 w-10 text-center">
                  <span className="text-accent-cyan font-display font-semibold text-xs">Alert</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-cyan/5">
            {paginatedData.map((row, idx) => {
              const qualityTier = showQualityIndicators ? getRowQualityTier(row, qualityStats) : null;
              const rowId = row['Item ID'] || idx;
              const isExpanded = expandedRows.has(rowId);

              // Tailwind classes for quality tiers
              const qualityClasses = {
                excellent: 'bg-accent-green/5 border-l-2 border-accent-green/60 hover:bg-accent-green/10',
                good: 'bg-accent-cyan/5 border-l-2 border-accent-cyan/50 hover:bg-accent-cyan/10',
                fair: 'bg-accent-gold/5 border-l-2 border-accent-gold/30 hover:bg-accent-gold/10',
              };

              // Check if this row is selected via keyboard navigation
              const isSelected = selectedRowIndex === idx;

              return (
                <>
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row, idx)}
                    className={`
                      transition-colors
                      ${isSelected ? 'bg-accent-cyan/10 ring-1 ring-accent-cyan/30' : ''}
                      ${!isSelected && qualityTier ? qualityClasses[qualityTier] : !isSelected ? 'hover:bg-white/5' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                  >
                    {expandableRowContent && (
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => toggleRowExpansion(rowId, e)}
                          className="text-accent-cyan hover:text-accent-cyan/80 transition-colors focus:ring-2 focus:ring-accent-cyan focus:outline-none rounded"
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    )}
                    {onAddToWatchlist && (
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToWatchlist(row);
                          }}
                          disabled={isItemWatched && isItemWatched(row['Item ID'] || row.itemId)}
                          className={`p-2 rounded-lg transition-all focus:ring-2 focus:ring-accent-cyan focus:outline-none ${isItemWatched && isItemWatched(row['Item ID'] || row.itemId)
                            ? 'bg-accent-purple/20 text-accent-purple/50 cursor-not-allowed'
                            : 'bg-accent-purple/10 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/20 hover:border-accent-purple/50'
                            }`}
                          title={
                            isItemWatched && isItemWatched(row['Item ID'] || row.itemId)
                              ? 'Already in watchlist'
                              : 'Add to watchlist'
                          }
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isItemWatched && isItemWatched(row['Item ID'] || row.itemId) ? (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </>
                            ) : (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </>
                            )}
                          </svg>
                        </button>
                      </td>
                    )}
                    {columns.filter(c => c.visible !== false).map(col => (
                      <td key={col.key} className={`px-2 sm:px-4 py-2.5 sm:py-3 text-text-primary text-xs sm:text-sm ${col.className || ''}`}>
                        {renderCell(row, col)}
                      </td>
                    ))}
                    {onCreateAlert && (
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateAlert({
                              itemName: row['Item'] || row.item,
                              itemId: row['Item ID'] || row.itemId,
                              type: 'margin',
                              condition: 'above',
                              threshold: (row['Gross Margin'] || row.margin || 5),
                            });
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 hover:border-accent-gold/50 transition-all focus:ring-2 focus:ring-accent-cyan focus:outline-none"
                          title="Set price alert"
                          aria-label="Set price alert"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                  {expandableRowContent && isExpanded && (
                    <tr key={`${rowId}-expanded`} className="bg-space-dark/20">
                      <td colSpan={columns.filter(c => c.visible !== false).length + (expandableRowContent ? 1 : 0) + (onAddToWatchlist ? 1 : 0) + (onCreateAlert ? 1 : 0)} className="px-4 py-3">
                        {expandableRowContent(row, idx)}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3 bg-space-mid/30 border-t border-accent-cyan/10 text-xs text-text-secondary">
        {/* Entry count - hidden on very small screens, abbreviated on mobile */}
        <div className="hidden xs:block text-center sm:text-left">
          <span className="hidden sm:inline">Showing </span>
          <span className="text-text-primary font-medium">{sortedData.length > 0 ? currentPage * itemsPerPage + 1 : 0}</span>
          <span className="hidden sm:inline"> to </span>
          <span className="sm:hidden">-</span>
          <span className="text-text-primary font-medium">{Math.min((currentPage + 1) * itemsPerPage, sortedData.length)}</span>
          <span className="hidden sm:inline"> of </span>
          <span className="sm:hidden">/</span>
          <span className="text-text-primary font-medium">{sortedData.length}</span>
          <span className="hidden sm:inline"> entries</span>
          {searchTerm && <span className="hidden md:inline"> (filtered from {data.length} total)</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center w-full sm:w-auto">
          <label className="hidden sm:flex items-center gap-2">
            Show
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
              className="px-2 py-1.5 rounded bg-space-black/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer min-h-[36px]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => goToPage(0)}
              disabled={currentPage === 0}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center active:bg-white/10 focus:ring-2 focus:ring-accent-cyan focus:outline-none"
              aria-label="First page"
            >
              «
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center active:bg-white/10 focus:ring-2 focus:ring-accent-cyan focus:outline-none"
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className="px-2 sm:px-3 text-text-primary whitespace-nowrap text-xs sm:text-sm">
              <span className="sm:hidden">{currentPage + 1}/{totalPages || 1}</span>
              <span className="hidden sm:inline">Page {currentPage + 1} of {totalPages || 1}</span>
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center active:bg-white/10 focus:ring-2 focus:ring-accent-cyan focus:outline-none"
              aria-label="Next page"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => goToPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center active:bg-white/10 focus:ring-2 focus:ring-accent-cyan focus:outline-none"
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradingTable;
