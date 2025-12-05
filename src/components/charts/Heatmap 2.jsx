import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const DEEP_SEA_PALETTE = ['#0D1B2A', '#1B263B', '#415A77', '#778DA9', '#E0E1DD'];

/**
 * Normalizes a 2D array of data.
 * @param {Array<Array<number>>} data - The 2D array of data.
 * @returns {{normalizedData: Array<Array<number>>, min: number, max: number}}
 */
const normalizeData = (data) => {
  const flatData = data.flat().filter(val => val !== null && val !== undefined);
  if (flatData.length === 0) return { normalizedData: data, min: 0, max: 0 };

  const min = Math.min(...flatData);
  const max = Math.max(...flatData);

  if (min === max) {
    return {
      normalizedData: data.map(row => row.map(() => 0.5)),
      min,
      max,
    };
  }

  const normalizedData = data.map(row =>
    row.map(value =>
      value === null || value === undefined ? null : (value - min) / (max - min)
    )
  );

  return { normalizedData, min, max };
};

/**
 * Interpolates color based on a value and a color scale.
 * @param {number} value - The value to map to a color (0-1).
 * @param {Array<string>} colorScale - The array of colors for the gradient.
 * @returns {string} - The interpolated color.
 */
const getColor = (value, colorScale) => {
    if (value === null) return 'transparent';
    const scaledValue = value * (colorScale.length - 1);
    const colorIndex = Math.floor(scaledValue);
    const colorStops = scaledValue - colorIndex;

    if (colorStops === 0) {
        return colorScale[colorIndex];
    }

    const startColor = colorScale[colorIndex];
    const endColor = colorScale[colorIndex + 1];

    if (!startColor || !endColor) {
        return colorScale[colorScale.length - 1];
    }

    const r = Math.round(parseInt(startColor.slice(1, 3), 16) * (1 - colorStops) + parseInt(endColor.slice(1, 3), 16) * colorStops);
    const g = Math.round(parseInt(startColor.slice(3, 5), 16) * (1 - colorStops) + parseInt(endColor.slice(3, 5), 16) * colorStops);
    const b = Math.round(parseInt(startColor.slice(5, 7), 16) * (1 - colorStops) + parseInt(endColor.slice(5, 7), 16) * colorStops);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const Heatmap = ({
  data,
  xLabels = [],
  yLabels = [],
  colorScale = DEEP_SEA_PALETTE,
  cellSize = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12',
  showValues = false,
  onCellClick,
  className,
}) => {
  const [tooltip, setTooltip] = useState(null);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
      const grid = Array(yLabels.length).fill(null).map(() => Array(xLabels.length).fill(null));
      data.forEach(({ x, y, value }) => {
        const yIndex = yLabels.indexOf(y);
        const xIndex = xLabels.indexOf(x);
        if (yIndex !== -1 && xIndex !== -1) {
          grid[yIndex][xIndex] = value;
        }
      });
      return grid;
    }
    return data;
  }, [data, xLabels, yLabels]);

  const { normalizedData, min, max } = useMemo(() => normalizeData(processedData), [processedData]);

  const handleMouseMove = (e, x, y, value) => {
    if (value === null) {
        setTooltip(null);
        return;
    };
    const { clientX, clientY } = e;
    setTooltip({
      x,
      y,
      value,
      xPos: clientX,
      yPos: clientY,
      xLabel: xLabels[x],
      yLabel: yLabels[y],
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className={cn('flex flex-col items-center font-sans text-sm', className)}>
      {/* X-axis labels (top) */}
      <div className="flex ml-12" role="row">
        {xLabels.map((label, index) => (
          <div key={index} className={cn('flex items-center justify-center text-text-secondary', cellSize)} role="columnheader">
            {label}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Y-axis labels (left) */}
        <div className="flex flex-col mr-2">
          {yLabels.map((label, index) => (
            <div key={index} className={cn('flex items-center justify-end text-text-secondary', cellSize)} role="rowheader">
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
            <motion.div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${xLabels.length}, minmax(0, 1fr))` }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                role="grid"
                aria-label="Heatmap"
            >
                {normalizedData.map((row, y) =>
                    <div key={y} role="row">
                        {row.map((value, x) => (
                            <motion.div
                                key={`${y}-${x}`}
                                className={cn('relative border border-space-dark/50 transition-transform duration-200', cellSize, onCellClick ? 'cursor-pointer hover:scale-110' : '')}
                                style={{ backgroundColor: getColor(value, colorScale) }}
                                onMouseMove={(e) => handleMouseMove(e, x, y, processedData[y][x])}
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => onCellClick && onCellClick(xLabels[x], yLabels[y], processedData[y][x])}
                                variants={cellVariants}
                                role="gridcell"
                                aria-label={`Value for ${yLabels[y]}, ${xLabels[x]} is ${processedData[y][x]}`}
                            >
                                {showValues && processedData[y][x] !== null && (
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium pointer-events-none" style={{ color: value > 0.7 ? '#000' : '#fff' }}>
                                        {processedData[y][x]}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
          </motion.div>
        </div>
      </div>

       {/* Color Scale Legend */}
       <div className="flex items-center mt-4 text-text-secondary">
        <span aria-label={`Minimum value: ${min}`}>{min}</span>
        <div className="flex h-4 w-32 mx-2 rounded-md overflow-hidden" style={{ background: `linear-gradient(to right, ${colorScale.join(',')})` }} role="img" aria-label="Color scale gradient from minimum to maximum" />
        <span aria-label={`Maximum value: ${max}`}>{max}</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="fixed p-2 text-xs rounded-md shadow-lg pointer-events-none bg-space-light text-text-primary" role="tooltip">
          <div><strong>{tooltip.yLabel}, {tooltip.xLabel}</strong></div>
          <div>Value: {tooltip.value}</div>
        </div>
      )}
    </div>
  );
};

Heatmap.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.string.isRequired,
      y: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }))
  ]).isRequired,
  xLabels: PropTypes.arrayOf(PropTypes.string),
  yLabels: PropTypes.arrayOf(PropTypes.string),
  colorScale: PropTypes.arrayOf(PropTypes.string),
  cellSize: PropTypes.string,
  showValues: PropTypes.bool,
  onCellClick: PropTypes.func,
  className: PropTypes.string,
};

export default Heatmap;
