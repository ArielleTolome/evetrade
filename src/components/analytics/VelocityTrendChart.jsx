import { useMemo, useState } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatNumber } from '../../utils/formatters';

/**
 * Velocity indicator arrow icon
 */
function TrendArrow({ trend, className = '' }) {
  const colors = {
    increasing: 'text-green-400',
    decreasing: 'text-red-400',
    stable: 'text-yellow-400',
  };

  const arrows = {
    increasing: '↗',
    decreasing: '↘',
    stable: '→',
  };

  return (
    <span className={`${colors[trend] || 'text-text-secondary'} ${className}`}>
      {arrows[trend] || '→'}
    </span>
  );
}

/**
 * Velocity score gauge
 */
function VelocityGauge({ score, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (score) => {
    if (score >= 70) return '#22c55e'; // green
    if (score >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const color = getColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

/**
 * Mini bar chart for volume history
 */
function VolumeBarChart({ data, width = 200, height = 60, className = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-xs text-text-secondary">No volume data</span>
      </div>
    );
  }

  const maxVolume = Math.max(...data.map(d => d.volume));
  const barWidth = Math.max(2, (width / data.length) - 1);

  return (
    <svg width={width} height={height} className={className}>
      {data.map((d, i) => {
        const barHeight = maxVolume > 0 ? (d.volume / maxVolume) * (height - 10) : 0;
        const x = i * (barWidth + 1);
        const y = height - barHeight - 5;

        // Color based on whether volume is above or below average
        const avg = data.reduce((sum, item) => sum + item.volume, 0) / data.length;
        const color = d.volume >= avg ? '#22c55e' : '#64748b';

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            rx={1}
            className="transition-all duration-200 hover:opacity-80"
          >
            <title>{`${d.date}: ${formatNumber(d.volume, 0)} units`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

/**
 * Velocity trend visualization component
 * Shows market velocity trends with visual indicators
 */
export function VelocityTrendChart({
  velocityData,
  historyData = [],
  itemName = 'Unknown Item',
  className = '',
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Process history data for visualization
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    // Take last 30 days
    return historyData.slice(-30).map(day => ({
      date: day.date,
      volume: day.volume || 0,
      average: day.average || 0,
      lowest: day.lowest || 0,
      highest: day.highest || 0,
    }));
  }, [historyData]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (!velocityData) return null;

    const {
      dailyVolume7d = 0,
      dailyVolume30d = 0,
      volumeTrend = 'stable',
      volumeTrendPercent = 0,
      velocityScore = 0,
      daysToSell = 999,
      currentSpread = 0,
      competitionLevel = 'unknown',
    } = velocityData;

    // Volume change comparison
    const volumeChange = dailyVolume30d > 0
      ? ((dailyVolume7d - dailyVolume30d) / dailyVolume30d * 100).toFixed(1)
      : 0;

    return {
      dailyVolume7d,
      dailyVolume30d,
      volumeTrend,
      volumeTrendPercent,
      velocityScore,
      daysToSell,
      currentSpread,
      competitionLevel,
      volumeChange,
    };
  }, [velocityData]);

  if (!velocityData) {
    return (
      <GlassmorphicCard className={className} padding="p-4">
        <div className="text-center text-text-secondary">
          Loading velocity data...
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className={className} padding="p-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-text-primary truncate">
            {itemName}
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
          >
            {showDetails ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-4">
        <div className="flex items-center gap-6">
          {/* Velocity Score Gauge */}
          <div className="flex flex-col items-center">
            <VelocityGauge score={trendStats?.velocityScore || 0} />
            <span className="text-xs text-text-secondary mt-1">Velocity</span>
          </div>

          {/* Key Metrics */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                7-Day Volume
              </div>
              <div className="text-lg font-mono text-text-primary flex items-center gap-2">
                {formatNumber(trendStats?.dailyVolume7d || 0, 0)}
                <TrendArrow trend={trendStats?.volumeTrend} className="text-sm" />
              </div>
              <div className="text-xs text-text-secondary">
                {trendStats?.volumeTrendPercent > 0 ? '+' : ''}{trendStats?.volumeTrendPercent}% vs last week
              </div>
            </div>

            <div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                Days to Sell
              </div>
              <div className={`text-lg font-mono ${
                trendStats?.daysToSell <= 3 ? 'text-green-400' :
                trendStats?.daysToSell <= 7 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {trendStats?.daysToSell >= 999 ? '999+' : trendStats?.daysToSell}
              </div>
              <div className="text-xs text-text-secondary">
                at current rate
              </div>
            </div>

            <div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                Spread
              </div>
              <div className={`text-lg font-mono ${
                trendStats?.currentSpread >= 10 ? 'text-green-400' :
                trendStats?.currentSpread >= 5 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {(trendStats?.currentSpread || 0).toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                Competition
              </div>
              <div className={`text-lg font-mono ${
                trendStats?.competitionLevel === 'low' ? 'text-green-400' :
                trendStats?.competitionLevel === 'medium' ? 'text-yellow-400' :
                trendStats?.competitionLevel === 'high' ? 'text-orange-400' : 'text-red-400'
              }`}>
                {(trendStats?.competitionLevel || 'unknown').charAt(0).toUpperCase() +
                 (trendStats?.competitionLevel || 'unknown').slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Volume History Chart */}
        {chartData.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-2">
              30-Day Volume History
            </div>
            <VolumeBarChart data={chartData} width={280} height={50} />
          </div>
        )}

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">30-Day Avg Volume: </span>
                <span className="text-text-primary font-mono">
                  {formatNumber(trendStats?.dailyVolume30d || 0, 0)}
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Volume Change: </span>
                <span className={`font-mono ${
                  parseFloat(trendStats?.volumeChange) > 0 ? 'text-green-400' :
                  parseFloat(trendStats?.volumeChange) < 0 ? 'text-red-400' : 'text-text-primary'
                }`}>
                  {trendStats?.volumeChange > 0 ? '+' : ''}{trendStats?.volumeChange}%
                </span>
              </div>
            </div>

            {/* Velocity interpretation */}
            <div className="p-3 bg-space-dark/50 rounded-lg">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Quick Assessment
              </div>
              <p className="text-sm text-text-primary">
                {trendStats?.velocityScore >= 70 ? (
                  'Excellent quick-flip opportunity. High turnover and good spread.'
                ) : trendStats?.velocityScore >= 40 ? (
                  'Moderate velocity. May require patience to sell.'
                ) : (
                  'Low velocity. Consider smaller positions or longer hold times.'
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Grid of velocity trend cards for multiple items
 */
export function VelocityTrendGrid({ velocities = [], historyMap = {}, className = '' }) {
  if (!velocities || velocities.length === 0) {
    return (
      <div className={`text-center text-text-secondary py-8 ${className}`}>
        No velocity data available. Select items to analyze.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {velocities.map((velocity) => (
        <VelocityTrendChart
          key={velocity.typeId}
          velocityData={velocity}
          historyData={historyMap[velocity.typeId] || []}
          itemName={velocity.itemName || `Item #${velocity.typeId}`}
        />
      ))}
    </div>
  );
}

export default VelocityTrendChart;
