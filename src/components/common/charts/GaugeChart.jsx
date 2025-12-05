import React, { useState, useEffect } from 'react';

/**
 * @typedef {object} GaugeChartProps
 * @property {number} value - The percentage value to display (0-100).
 * @property {string} label - Text label shown below the value.
 * @property {'sm' | 'md' | 'lg'} size - Controls gauge dimensions.
 * @property {string} [color] - Override color, or auto-color based on value.
 */

/**
 * A circular gauge component for displaying percentages.
 * @param {GaugeChartProps} props
 */
const GaugeChart = ({ value, label, size = 'md', color }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setAnimatedValue(value));
    return () => cancelAnimationFrame(animation);
  }, [value]);

  const sizeConfig = {
    sm: {
      width: 100,
      strokeWidth: 8,
      textSize: 'text-xl',
    },
    md: {
      width: 150,
      strokeWidth: 12,
      textSize: 'text-3xl',
    },
    lg: {
      width: 200,
      strokeWidth: 16,
      textSize: 'text-4xl',
    },
  };

  const { width, strokeWidth, textSize } = sizeConfig[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (value < 25) return 'text-red-500';
    if (value < 50) return 'text-yellow-500';
    if (value < 75) return 'text-green-500';
    return 'text-accent-cyan';
  };

  const strokeColorClass = getColor();

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center bg-space-dark/50 backdrop-blur-sm border border-white/10 rounded-full"
        style={{ width: `${width}px`, height: `${width}px` }}
      >
        <svg width={width} height={width} className="transform -rotate-90">
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-current text-white/10"
            fill="transparent"
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={`stroke-current ${strokeColorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`font-bold ${textSize} ${strokeColorClass}`}>
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <span className="text-white/70 text-sm">{label}</span>
    </div>
  );
};

export default GaugeChart;
