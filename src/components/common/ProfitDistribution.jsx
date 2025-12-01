import { useMemo } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * Calculate histogram buckets from profit data
 */
function calculateHistogram(data, profitKey = 'Net Profit', bucketCount = 10) {
  if (!data || data.length === 0) return [];

  const profits = data.map((item) => item[profitKey] || 0).filter((p) => !isNaN(p));
  if (profits.length === 0) return [];

  const minProfit = Math.min(...profits);
  const maxProfit = Math.max(...profits);

  // Handle case where all profits are the same
  if (minProfit === maxProfit) {
    return [{
      min: minProfit,
      max: maxProfit,
      count: profits.length,
      percentage: 100,
    }];
  }

  const range = maxProfit - minProfit;
  const bucketSize = range / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    min: minProfit + i * bucketSize,
    max: minProfit + (i + 1) * bucketSize,
    count: 0,
    percentage: 0,
  }));

  // Count items in each bucket
  profits.forEach((profit) => {
    const bucketIndex = Math.min(
      Math.floor((profit - minProfit) / bucketSize),
      bucketCount - 1
    );
    buckets[bucketIndex].count++;
  });

  // Calculate percentages
  const maxCount = Math.max(...buckets.map((b) => b.count));
  buckets.forEach((bucket) => {
    bucket.percentage = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
  });

  return buckets;
}

/**
 * Profit Distribution Histogram Component
 */
export function ProfitDistribution({ data, profitKey = 'Net Profit', className = '' }) {
  const histogram = useMemo(
    () => calculateHistogram(data, profitKey),
    [data, profitKey]
  );

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const profits = data.map((item) => item[profitKey] || 0).filter((p) => !isNaN(p));
    if (profits.length === 0) return null;

    const sorted = [...profits].sort((a, b) => a - b);
    const sum = profits.reduce((acc, p) => acc + p, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: sum / profits.length,
      median: sorted[Math.floor(sorted.length / 2)],
      total: sum,
      count: profits.length,
    };
  }, [data, profitKey]);

  if (!histogram || histogram.length === 0 || !stats) {
    return null;
  }

  return (
    <div className={`bg-space-dark/50 backdrop-blur-md border border-accent-cyan/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-text-primary">Profit Distribution</h3>
        <span className="text-sm text-text-secondary">{stats.count} trades</span>
      </div>

      {/* Histogram */}
      <div className="flex items-end gap-1 h-32 mb-4">
        {histogram.map((bucket, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-end group relative"
          >
            <div
              className="w-full bg-gradient-to-t from-accent-cyan to-accent-purple rounded-t transition-all hover:opacity-80"
              style={{ height: `${Math.max(bucket.percentage, 4)}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-space-dark border border-accent-cyan/20 rounded px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                <div className="text-text-primary font-medium mb-1">
                  {formatNumber(bucket.count, 0)} trade{bucket.count !== 1 ? 's' : ''}
                </div>
                <div className="text-text-secondary">
                  {formatISK(bucket.min, false)} - {formatISK(bucket.max, false)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-text-secondary/70 mb-6">
        <span>{formatISK(stats.min, false)}</span>
        <span>{formatISK(stats.max, false)}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">
            {formatISK(stats.total, false)}
          </div>
          <div className="text-xs text-text-secondary">Total Profit</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent-cyan">
            {formatISK(stats.average, false)}
          </div>
          <div className="text-xs text-text-secondary">Average</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent-purple">
            {formatISK(stats.median, false)}
          </div>
          <div className="text-xs text-text-secondary">Median</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent-gold">
            {formatISK(stats.max - stats.min, false)}
          </div>
          <div className="text-xs text-text-secondary">Range</div>
        </div>
      </div>
    </div>
  );
}

export default ProfitDistribution;
