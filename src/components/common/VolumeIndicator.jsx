import { useMemo } from 'react';
import { formatNumber } from '../../utils/formatters';

const VOLUME_TIERS = [
  { max: 5, label: 'Dead', color: 'text-red-500', bg: 'bg-red-500', bgLight: 'bg-red-500/20' },
  { max: 20, label: 'Slow', color: 'text-orange-400', bg: 'bg-orange-400', bgLight: 'bg-orange-400/20' },
  { max: 100, label: 'Active', color: 'text-yellow-400', bg: 'bg-yellow-400', bgLight: 'bg-yellow-400/20' },
  { max: 500, label: 'Busy', color: 'text-green-400', bg: 'bg-green-400', bgLight: 'bg-green-400/20' },
  { max: Infinity, label: 'Hot', color: 'text-cyan-400', bg: 'bg-cyan-400', bgLight: 'bg-cyan-400/20' },
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
          <div className="text-lg font-mono text-cyan-400">{formatNumber(stats.total, 0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Avg Volume</div>
          <div className="text-lg font-mono text-cyan-400">{formatNumber(stats.average, 0)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Max Volume</div>
          <div className="text-lg font-mono text-cyan-400">{formatNumber(stats.max, 0)}</div>
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
          Analyzing <span className="font-mono text-cyan-400">{data.length}</span> items
        </div>
      </div>
    </div>
  );
}

export default VolumeIndicator;
