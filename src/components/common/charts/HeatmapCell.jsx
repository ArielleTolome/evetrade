import React from 'react';
import Tooltip from '../Tooltip';

/**
 * @typedef {object} HeatmapCellProps
 * @property {number} value - The cell value.
 * @property {number} min - Minimum value for color scaling.
 * @property {number} max - Maximum value for color scaling.
 * @property {string} label - Cell label text.
 * @property {function} [onClick] - Click handler.
 */

/**
 * An individual cell component for heatmap displays.
 * @param {HeatmapCellProps} props
 */
const HeatmapCell = ({ value, min, max, label, onClick }) => {
  const getColor = () => {
    if (max === min) return 'bg-gray-500'; // Avoid division by zero
    const percentage = (value - min) / (max - min);
    const red = 255 * (1 - percentage);
    const green = 255 * percentage;
    return `rgb(${red.toFixed(0)}, ${green.toFixed(0)}, 0)`;
  };

  const cellStyle = {
    backgroundColor: getColor(),
  };

  const content = (
    <div
      className="w-full h-full flex items-center justify-center p-2 text-white font-semibold cursor-pointer transition-transform duration-200 hover:scale-105"
      style={cellStyle}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <span className="truncate">{label}</span>
    </div>
  );

  return (
    <Tooltip content={`Value: ${value.toLocaleString()}`}>
      {content}
    </Tooltip>
  );
};

export default HeatmapCell;
