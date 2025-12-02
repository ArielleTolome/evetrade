import { useState, useMemo } from 'react';

/**
 * MiniChart - Sparkline and bar chart component
 *
 * @param {array} data - Array of numbers or objects with {value, label}
 * @param {string} type - Chart type: 'line', 'area', 'bar'
 * @param {string} color - Color variant: 'cyan', 'gold', 'green', 'red', 'purple'
 * @param {string} height - Height class (e.g., 'h-16', 'h-24')
 * @param {boolean} showTooltip - Show value on hover
 * @param {function} formatValue - Custom value formatter
 * @param {string} className - Additional CSS classes
 */
export function MiniChart({
  data = [],
  type = 'line',
  color = 'cyan',
  height = 'h-16',
  showTooltip = true,
  formatValue = (v) => v.toLocaleString(),
  className = '',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const colorMap = {
    cyan: {
      stroke: '#00f0ff',
      fill: 'rgba(0, 240, 255, 0.2)',
      bar: 'bg-accent-cyan',
    },
    gold: {
      stroke: '#ffd700',
      fill: 'rgba(255, 215, 0, 0.2)',
      bar: 'bg-accent-gold',
    },
    green: {
      stroke: '#00ff9d',
      fill: 'rgba(0, 255, 157, 0.2)',
      bar: 'bg-accent-green',
    },
    red: {
      stroke: '#f87171',
      fill: 'rgba(248, 113, 113, 0.2)',
      bar: 'bg-red-400',
    },
    purple: {
      stroke: '#bc13fe',
      fill: 'rgba(188, 19, 254, 0.2)',
      bar: 'bg-accent-purple',
    },
  };

  const normalizedData = useMemo(() => {
    return data.map(d => (typeof d === 'number' ? { value: d, label: '' } : d));
  }, [data]);

  const { min, range } = useMemo(() => {
    const values = normalizedData.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return { min, range };
  }, [normalizedData]);

  const handleMouseMove = (e, index) => {
    if (!showTooltip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredIndex(index);
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  if (normalizedData.length === 0) {
    return (
      <div className={`${height} ${className} flex items-center justify-center bg-white/5 dark:bg-white/5 rounded-lg`}>
        <span className="text-xs text-text-muted">No data</span>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className={`${height} ${className} relative`}>
        <div className="h-full flex items-end justify-between gap-1">
          {normalizedData.map((d, i) => {
            const heightPercent = ((d.value - min) / range) * 100;
            return (
              <div
                key={i}
                className="flex-1 relative group cursor-pointer"
                onMouseEnter={(e) => handleMouseMove(e, i)}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={`${colorMap[color].bar} rounded-t-sm transition-all duration-300 group-hover:opacity-100 opacity-70`}
                  style={{ height: `${heightPercent}%`, minHeight: '2px' }}
                />
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {showTooltip && hoveredIndex !== null && (
          <div
            className="absolute z-50 px-2 py-1 bg-space-dark/95 backdrop-blur-sm border border-white/10 rounded text-xs text-white font-mono pointer-events-none whitespace-nowrap"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 30}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {formatValue(normalizedData[hoveredIndex].value)}
            {normalizedData[hoveredIndex].label && (
              <span className="text-text-muted ml-1">
                ({normalizedData[hoveredIndex].label})
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Line and Area charts (SVG)
  const points = normalizedData.map((d, i) => {
    const x = (i / (normalizedData.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 100;
    return { x, y, value: d.value, label: d.label };
  });

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const areaPoints = type === 'area'
    ? `0,100 ${linePoints} 100,100`
    : null;

  return (
    <div
      className={`${height} ${className} relative`}
      onMouseMove={(e) => {
        if (!showTooltip) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const closest = points.reduce((prev, curr, idx) => {
          return Math.abs(curr.x - x) < Math.abs(points[prev].x - x) ? idx : prev;
        }, 0);
        handleMouseMove(e, closest);
      }}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {type === 'area' && (
          <polygon
            points={areaPoints}
            fill={colorMap[color].fill}
          />
        )}
        <polyline
          points={linePoints}
          fill="none"
          stroke={colorMap[color].stroke}
          strokeWidth={type === 'area' ? '1.5' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hover point */}
        {showTooltip && hoveredIndex !== null && (
          <circle
            cx={points[hoveredIndex].x}
            cy={points[hoveredIndex].y}
            r="2"
            fill={colorMap[color].stroke}
            className="animate-pulse"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredIndex !== null && (
        <div
          className="absolute z-50 px-2 py-1 bg-space-dark/95 backdrop-blur-sm border border-white/10 rounded text-xs text-white font-mono pointer-events-none whitespace-nowrap"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 30}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {formatValue(normalizedData[hoveredIndex].value)}
          {normalizedData[hoveredIndex].label && (
            <span className="text-text-muted ml-1">
              ({normalizedData[hoveredIndex].label})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MiniChart;
