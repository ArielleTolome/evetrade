import React from 'react';
import HeatmapCell from './HeatmapCell';
import GlassmorphicCard from '../GlassmorphicCard';

/**
 * @typedef {object} HeatmapGridProps
 * @property {number[][]} data - Grid of values.
 * @property {string[]} rowLabels - Labels for each row.
 * @property {string[]} colLabels - Labels for each column.
 * @property {function(number, number, number): void} [onCellClick] - Handler for cell clicks.
 */

/**
 * A grid container for HeatmapCells.
 * @param {HeatmapGridProps} props
 */
const HeatmapGrid = ({ data, rowLabels, colLabels, onCellClick }) => {
  const min = Math.min(...data.flat());
  const max = Math.max(...data.flat());

  return (
    <GlassmorphicCard>
      <div className="p-4">
        <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${colLabels.length}, 1fr)` }}>
          {/* Top-left empty cell */}
          <div></div>
          {/* Column labels */}
          {colLabels.map((label, colIndex) => (
            <div key={colIndex} className="text-center text-white/70 text-sm font-semibold">
              {label}
            </div>
          ))}

          {/* Rows */}
          {rowLabels.map((rowLabel, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Row label */}
              <div className="flex items-center justify-end pr-2 text-right text-white/70 text-sm font-semibold">
                {rowLabel}
              </div>
              {/* Heatmap cells */}
              {data[rowIndex].map((value, colIndex) => (
                <HeatmapCell
                  key={colIndex}
                  value={value}
                  min={min}
                  max={max}
                  label={`${value.toLocaleString()}`}
                  onClick={() => onCellClick?.(rowIndex, colIndex, value)}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </GlassmorphicCard>
  );
};

export default HeatmapGrid;
