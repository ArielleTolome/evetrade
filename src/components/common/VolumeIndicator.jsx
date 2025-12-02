import { useMemo, useState, useEffect } from 'react';
import { formatNumber, formatCompact } from '../../utils/formatters';
import { getMarketHistory } from '../../api/esi';
import { getCached, setCached } from '../../hooks/useCache';

const VOLUME_TIERS = [
  { max: 5, label: 'Dead', color: 'text-red-500', bg: 'bg-red-500', bgLight: 'bg-red-500/20' },
  { max: 20, label: 'Slow', color: 'text-accent-gold', bg: 'bg-accent-gold', bgLight: 'bg-accent-gold/20' },
  { max: 100, label: 'Active', color: 'text-accent-gold', bg: 'bg-accent-gold', bgLight: 'bg-accent-gold/20' },
  { max: 500, label: 'Busy', color: 'text-accent-green', bg: 'bg-accent-green', bgLight: 'bg-accent-green/20' },
  { max: Infinity, label: 'Hot', color: 'text-accent-cyan', bg: 'bg-accent-cyan', bgLight: 'bg-accent-cyan/20' },
];

/**
 * VolumeIndicator - Displays visual volume analysis and market velocity
 *
 * @param {number} volume - The volume value to display
 * @param {number} maxVolume - Maximum volume for relative bar visualization (default: 1000)
 * @param {boolean} showLabel - Whether to show the tier label (default: true)
 * @param {boolean} showBar - Whether to show the progress bar (default: true)
 * @param {boolean} compact - Compact mode for table cells (default: false)
 */
export function VolumeIndicator({
  volume,
  maxVolume = 1000,
  showLabel = true,
  showBar = true,
  compact = false
}) {
  const tier = useMemo(() => {
    return VOLUME_TIERS.find(t => volume <= t.max) || VOLUME_TIERS[VOLUME_TIERS.length - 1];
  }, [volume]);

  const percentage = useMemo(() => {
    if (maxVolume <= 0) return 0;
    return Math.min((volume / maxVolume) * 100, 100);
  }, [volume, maxVolume]);

  if (compact) {
    return (
      <div className="flex items-center gap-2" title={`Volume: ${formatNumber(volume, 0)} - ${tier.label}`}>
        <span className={`text-xs font-medium ${tier.color}`}>{tier.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {showBar && (
        <div className={`w-20 h-2 rounded-full ${tier.bgLight} overflow-hidden`}>
          <div
            className={`h-full rounded-full ${tier.bg} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <span className={`font-mono text-sm ${tier.color}`}>
        {formatNumber(volume, 0)}
      </span>
      {showLabel && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${tier.bgLight} ${tier.color}`}>
          {tier.label}
        </span>
      )}
    </div>
  );
}

/**
 * VolumeStats - Displays aggregate volume statistics with histogram
 *
 * @param {Array} data - Array of objects containing volume data
 * @param {string} volumeKey - Key name for volume field in data objects (default: 'volume')
 */
export function VolumeStats({ data = [], volumeKey = 'volume' }) {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        distribution: VOLUME_TIERS.map(tier => ({ ...tier, count: 0, percentage: 0 }))
      };
    }

    const volumes = data.map(item => item[volumeKey] || 0);
    const total = volumes.reduce((sum, v) => sum + v, 0);
    const average = total / volumes.length;
    const max = Math.max(...volumes);

    // Calculate distribution across tiers
    const distribution = VOLUME_TIERS.map(tier => {
      const prevMax = VOLUME_TIERS[VOLUME_TIERS.indexOf(tier) - 1]?.max || 0;
      const count = volumes.filter(v => v > prevMax && v <= tier.max).length;
      const percentage = (count / volumes.length) * 100;
      return { ...tier, count, percentage };
    });

    return { total, average, max, distribution };
  }, [data, volumeKey]);

  const maxDistributionPercentage = useMemo(() => {
    return Math.max(...stats.distribution.map(d => d.percentage), 1);
  }, [stats.distribution]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Volume Statistics</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Total Volume</div>
          <div className="text-lg font-mono text-accent-cyan">{formatNumber(stats.total, 0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Avg Volume</div>
          <div className="text-lg font-mono text-accent-cyan">{formatNumber(stats.average, 0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Max Volume</div>
          <div className="text-lg font-mono text-accent-cyan">{formatNumber(stats.max, 0)}</div>
        </div>
      </div>

      {/* Volume Distribution Histogram */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-400 mb-2">Volume Distribution</div>
        {stats.distribution.map((tier, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 text-xs text-gray-400">{tier.label}</div>
            <div className="flex-1 h-6 bg-gray-700/50 rounded overflow-hidden">
              <div
                className={`h-full ${tier.bg} transition-all duration-300 flex items-center justify-end px-2`}
                style={{ width: `${(tier.percentage / maxDistributionPercentage) * 100}%` }}
              >
                {tier.count > 0 && (
                  <span className="text-xs font-medium text-white">
                    {tier.count}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 text-xs text-gray-400 text-right">
              {tier.percentage.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>

      {/* Items Count */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          Analyzing <span className="font-mono text-accent-cyan">{data.length}</span> items
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate volume trend from historical data
 * @param {Array} history - Market history data from ESI
 * @returns {object} Trend analysis with percentage change, direction, and recent data
 */
function calculateVolumeTrend(history) {
  if (!history || history.length < 2) {
    return {
      trend: 'stable',
      percentage: 0,
      recentVolumes: [],
      avgVolume: 0,
    };
  }

  // Sort by date (newest first)
  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get last 7 days of volume data
  const recentVolumes = sorted.slice(0, 7).map(d => d.volume);

  // Calculate average volume for last 3 days vs previous 4 days
  const recent3Days = recentVolumes.slice(0, 3);
  const previous4Days = recentVolumes.slice(3, 7);

  if (previous4Days.length === 0) {
    return {
      trend: 'stable',
      percentage: 0,
      recentVolumes: recentVolumes.reverse(), // Reverse to show oldest to newest
      avgVolume: recent3Days.reduce((sum, v) => sum + v, 0) / recent3Days.length,
    };
  }

  const recentAvg = recent3Days.reduce((sum, v) => sum + v, 0) / recent3Days.length;
  const previousAvg = previous4Days.reduce((sum, v) => sum + v, 0) / previous4Days.length;

  const percentageChange = previousAvg > 0
    ? ((recentAvg - previousAvg) / previousAvg) * 100
    : 0;

  let trend = 'stable';
  if (percentageChange > 10) {
    trend = 'up';
  } else if (percentageChange < -10) {
    trend = 'down';
  }

  return {
    trend,
    percentage: percentageChange,
    recentVolumes: recentVolumes.reverse(), // Reverse to show oldest to newest for sparkline
    avgVolume: recentAvg,
  };
}

/**
 * Simple sparkline component for volume trend visualization
 * @param {Array} data - Array of volume numbers
 * @param {string} color - Color class for the line
 */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) {
    return <div className="w-16 h-6 flex items-center justify-center text-xs text-gray-500">N/A</div>;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1; // Avoid division by zero

  // Normalize data to 0-100 range for rendering
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-16 h-6"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        points={points}
        className={color}
      />
    </svg>
  );
}

/**
 * VolumeTrendIndicator - Displays volume trend with historical data visualization
 *
 * @param {number} typeId - EVE Online type ID for the item
 * @param {number} regionId - EVE Online region ID
 * @param {number} currentVolume - Current volume to display
 * @param {boolean} compact - Compact mode for table cells (default: false)
 */
export function VolumeTrendIndicator({
  typeId,
  regionId,
  currentVolume,
  compact = false
}) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchHistory() {
      if (!typeId || !regionId) {
        setLoading(false);
        return;
      }

      try {
        const cacheKey = `volume_history_${regionId}_${typeId}`;

        // Try to get from cache first
        const cached = await getCached(cacheKey);
        if (cached && mounted) {
          setHistory(cached);
          setLoading(false);
          return;
        }

        // Fetch from ESI
        const data = await getMarketHistory(regionId, typeId);

        if (mounted) {
          setHistory(data);
          setLoading(false);

          // Cache the result for 1 hour
          await setCached(cacheKey, data);
        }
      } catch (err) {
        if (mounted) {
          console.warn(`Failed to fetch volume history for type ${typeId}:`, err);
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [typeId, regionId]);

  const trendData = useMemo(() => {
    return calculateVolumeTrend(history);
  }, [history]);

  const tier = useMemo(() => {
    return VOLUME_TIERS.find(t => currentVolume <= t.max) || VOLUME_TIERS[VOLUME_TIERS.length - 1];
  }, [currentVolume]);

  // Determine trend colors and icons
  const trendColor = useMemo(() => {
    if (trendData.trend === 'up') return 'text-accent-green';
    if (trendData.trend === 'down') return 'text-red-500';
    return 'text-accent-gold';
  }, [trendData.trend]);

  const trendArrow = useMemo(() => {
    if (trendData.trend === 'up') return '▲';
    if (trendData.trend === 'down') return '▼';
    return '—';
  }, [trendData.trend]);

  const trendLabel = useMemo(() => {
    if (trendData.trend === 'up') return 'Increasing';
    if (trendData.trend === 'down') return 'Decreasing';
    return 'Stable';
  }, [trendData.trend]);

  // Compact mode - just show trend arrow and percentage
  if (compact) {
    if (loading) {
      return (
        <div className="flex items-center gap-2" title="Loading volume trend...">
          <span className="text-xs text-gray-400">...</span>
        </div>
      );
    }

    if (error || !history) {
      return (
        <div className="flex items-center gap-2" title={`Volume: ${formatNumber(currentVolume, 0)}`}>
          <span className={`text-xs font-medium ${tier.color}`}>{formatCompact(currentVolume)}</span>
        </div>
      );
    }

    return (
      <div
        className="flex items-center gap-2 group relative"
        title={`${trendLabel} ${Math.abs(trendData.percentage).toFixed(1)}% (7-day trend)`}
      >
        <span className={`text-xs font-medium ${tier.color}`}>
          {formatCompact(currentVolume)}
        </span>
        <span className={`text-xs ${trendColor}`}>
          {trendArrow}
        </span>
        <span className={`text-xs ${trendColor}`}>
          {trendData.percentage > 0 ? '+' : ''}{trendData.percentage.toFixed(0)}%
        </span>

        {/* Tooltip with sparkline */}
        <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-space-black border border-accent-cyan/30 rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-accent-cyan">7-Day Volume Trend</div>
            <div className="flex items-center gap-2">
              <Sparkline data={trendData.recentVolumes} color={trendColor} />
              <span className={trendColor}>{trendLabel}</span>
            </div>
            <div className="text-gray-400">
              Avg: {formatCompact(trendData.avgVolume)} / day
            </div>
          </div>
          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-space-black"></div>
        </div>
      </div>
    );
  }

  // Full mode - show complete trend information
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-2 rounded-full bg-gray-700 animate-pulse" />
        <span className="font-mono text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error || !history) {
    // Fallback to basic VolumeIndicator if no history available
    return (
      <div className="flex items-center gap-3">
        <span className={`font-mono text-sm ${tier.color}`}>
          {formatNumber(currentVolume, 0)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${tier.bgLight} ${tier.color}`}>
          {tier.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Volume number and tier */}
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm ${tier.color}`}>
          {formatNumber(currentVolume, 0)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${tier.bgLight} ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      {/* Sparkline */}
      <Sparkline data={trendData.recentVolumes} color={trendColor} />

      {/* Trend indicator */}
      <div className="flex items-center gap-1">
        <span className={`text-sm ${trendColor}`} title={trendLabel}>
          {trendArrow}
        </span>
        <span className={`text-xs font-medium ${trendColor}`}>
          {trendData.percentage > 0 ? '+' : ''}{trendData.percentage.toFixed(1)}%
        </span>
      </div>

      {/* Detailed tooltip on hover */}
      <div className="group relative">
        <svg
          className="w-4 h-4 text-gray-400 hover:text-accent-cyan cursor-help transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Detailed tooltip */}
        <div className="absolute left-0 bottom-full mb-2 px-3 py-3 bg-space-black border border-accent-cyan/30 rounded-lg text-xs text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg min-w-[200px]">
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-accent-cyan border-b border-accent-cyan/20 pb-1">
              7-Day Volume Analysis
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="text-gray-400">Trend:</span>
              <span className={trendColor}>{trendLabel}</span>

              <span className="text-gray-400">Change:</span>
              <span className={trendColor}>
                {trendData.percentage > 0 ? '+' : ''}{trendData.percentage.toFixed(1)}%
              </span>

              <span className="text-gray-400">Avg/Day:</span>
              <span className="text-white">{formatCompact(trendData.avgVolume)}</span>

              <span className="text-gray-400">Current:</span>
              <span className="text-white">{formatCompact(currentVolume)}</span>
            </div>
            <div className="text-gray-500 text-[10px] border-t border-gray-700 pt-1 mt-1">
              Based on last 7 days of market data
            </div>
          </div>
          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-space-black"></div>
        </div>
      </div>
    </div>
  );
}

export default VolumeIndicator;
