import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { useResizeObserver } from '../../hooks/useResizeObserver';

const deepSeaPalette = ['#415A77', '#778DA9', '#E0E1DD', '#0D1B2A'];

const DonutChart = ({
  data,
  thickness = 40,
  showLabels = false,
  showLegend = true,
  centerContent,
  legendPosition = 'bottom',
  onSegmentClick,
  className = '',
  progressTotal = null,
}) => {
  const { resizeRef, dimensions } = useResizeObserver();
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  const size = Math.min(dimensions.width, dimensions.height);

  const totalValue = useMemo(() => {
    if (progressTotal !== null && data.length === 1) {
      return progressTotal;
    }
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data, progressTotal]);

  const segments = useMemo(() => {
    let cumulativePercent = 0;
    return data.map(segment => {
      const percent = totalValue > 0 ? segment.value / totalValue : 0;
      const startAngle = cumulativePercent;
      cumulativePercent += percent;
      const endAngle = cumulativePercent;
      return { ...segment, percent, startAngle, endAngle };
    });
  }, [data, totalValue]);

  if (!data || data.length === 0 || totalValue === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        ref={resizeRef}
      >
        <p className="text-sm text-center text-text-secondary">No data to display</p>
      </div>
    );
  }

  const radius = size / 2;
  const innerRadius = radius - thickness;

  const getCoordinatesForPercent = (percent, r = radius) => {
    const x = Math.cos(2 * Math.PI * percent) * r;
    const y = Math.sin(2 * Math.PI * percent) * r;
    return [x, y];
  };

  const handleMouseMove = (event) => {
    setTooltip(prev => ({ ...prev, x: event.clientX + 10, y: event.clientY + 10 }));
  };

  const handleSegmentMouseEnter = (segment) => {
    setTooltip({
      visible: true,
      content: `${segment.label}: ${segment.value} (${(segment.percent * 100).toFixed(1)}%)`,
      x: 0,
      y: 0
    });
  };

  const handleSegmentMouseLeave = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

  const handleKeyDown = (event, segment) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onSegmentClick && onSegmentClick(segment);
    }
  };

  return (
    <div
        className={`relative flex ${legendPosition === 'right' ? 'flex-row' : 'flex-col'} items-center w-full h-full ${className}`}
        onMouseMove={handleMouseMove}
        ref={resizeRef}
    >
      <svg width={size} height={size} viewBox={`-${size / 2} -${size / 2} ${size} ${size}`} className="transform -rotate-90" role="img" aria-label="Donut chart">
        <g>
            {segments.map((segment, index) => {
                const { percent, startAngle, endAngle } = segment;
                const [startX, startY] = getCoordinatesForPercent(startAngle);
                const [endX, endY] = getCoordinatesForPercent(endAngle);

                const largeArcFlag = percent > 0.5 ? 1 : 0;

                const pathData = [
                    `M ${startX} ${startY}`, // Move
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
                    `L ${endX * (innerRadius / radius)} ${endY * (innerRadius / radius)}`, // Line to inner radius
                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX * (innerRadius / radius)} ${startY * (innerRadius / radius)}`, // Arc back
                    'Z', // Close
                ].join(' ');

                const color = segment.color || deepSeaPalette[index % deepSeaPalette.length];

                const midAngle = startAngle + (percent / 2);
                const [labelX, labelY] = getCoordinatesForPercent(midAngle, radius - thickness / 2);

                const ariaLabel = `${segment.label}: ${segment.value} (${(percent * 100).toFixed(1)}%)`;

                return (
                    <motion.g
                        key={segment.label}
                        tabIndex="0"
                        onKeyDown={(e) => handleKeyDown(e, segment)}
                        className="outline-none focus:ring-2 focus:ring-accent-cyan rounded-full"
                        role="button"
                        aria-label={ariaLabel}
                    >
                        <motion.path
                            d={pathData}
                            fill={color}
                            className="cursor-pointer"
                            onMouseEnter={() => handleSegmentMouseEnter(segment)}
                            onMouseLeave={handleSegmentMouseLeave}
                            onClick={() => onSegmentClick && onSegmentClick(segment)}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.7, ease: 'easeInOut' }}
                            style={{ transformOrigin: 'center center' }}
                        />
                        {showLabels && totalValue > 0 && (
                            <motion.text
                                x={labelX}
                                y={labelY}
                                dy="0.35em"
                                textAnchor="middle"
                                className="text-xs font-bold fill-current text-text-primary pointer-events-none"
                                transform={`rotate(90 ${labelX} ${labelY})`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                {`${(percent * 100).toFixed(0)}%`}
                            </motion.text>
                        )}
                    </motion.g>
                );
            })}
        </g>
        {centerContent && (
          <foreignObject x={-innerRadius} y={-innerRadius} width={innerRadius * 2} height={innerRadius * 2}>
            <div className="flex items-center justify-center w-full h-full text-text-primary transform rotate-90">
              <div className="text-center">{centerContent}</div>
            </div>
          </foreignObject>
        )}
      </svg>

      <AnimatePresence>
        {tooltip.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute p-2 text-sm rounded-md shadow-lg bg-space-dark text-text-primary border border-space-light pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            {tooltip.content}
          </motion.div>
        )}
      </AnimatePresence>

      {showLegend && (
        <div className={`mt-4 ${legendPosition === 'right' ? 'ml-6' : ''}`}>
          <ul>
            {segments.map((segment, index) => (
              <li key={segment.label} className="flex items-center mb-2 text-sm">
                <span
                  className="w-3 h-3 mr-2 rounded-full"
                  style={{ backgroundColor: segment.color || deepSeaPalette[index % deepSeaPalette.length] }}
                ></span>
                <span className="text-text-secondary">{segment.label}:</span>
                <span className="ml-1 font-semibold text-text-primary">{segment.value} ({(segment.percent * 100).toFixed(1)}%)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ).isRequired,
  thickness: PropTypes.number,
  showLabels: PropTypes.bool,
  showLegend: PropTypes.bool,
  centerContent: PropTypes.node,
  legendPosition: PropTypes.oneOf(['bottom', 'right']),
  onSegmentClick: PropTypes.func,
  className: PropTypes.string,
  progressTotal: PropTypes.number,
};

export default DonutChart;
