import { forwardRef, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

// Helper functions
const valueToPercent = (value, min, max) => {
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
};

const percentToValue = (percent, min, max, step) => {
  const value = min + (percent / 100) * (max - min);
  const steppedValue = Math.round(value / step) * step;
  return Math.max(min, Math.min(max, steppedValue));
};

/**
 * A flexible and accessible range slider component for selecting a single value or a range of values.
 * It supports keyboard navigation, touch and mouse events, and optional histogram display.
 *
 * @param {object} props - The component props.
 * @param {number} props.min - The minimum value of the slider.
 * @param {number} props.max - The maximum value of the slider.
 * @param {number} [props.step=1] - The stepping interval.
 * @param {number | [number, number]} props.value - The current value or range.
 * @param {(value: number | [number, number]) => void} props.onChange - Callback function when the value changes.
 * @param {(value: number) => string} [props.formatValue] - Optional function to format the displayed value.
 * @param {string} [props.label] - The label for the form field.
 * @param {boolean} [props.showLabels=true] - Whether to show min/max labels at the ends of the slider.
 * @param {boolean} [props.disabled=false] - Whether the slider is disabled.
 * @param {string} [props.id] - The ID for the component, used for accessibility.
 * @param {string} [props.className] - Additional classes for the container.
 * @param {number[]} [props.histogram] - Array of numbers to display as a background histogram.
 * @param {string} [props.error] - An error message to display.
 * @param {string} [props.helper] - A helper text to display.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the container element.
 * @returns {JSX.Element}
 */
export const RangeSlider = forwardRef(function RangeSlider(
  {
    min,
    max,
    step = 1,
    value,
    onChange,
    formatValue = (v) => v.toString(),
    label,
    showLabels = true,
    disabled = false,
    id,
    className = '',
    histogram,
    error,
    helper,
    ...props
  },
  ref
) {
  const isRange = Array.isArray(value);
  const sliderRef = useRef(null);
  const minHandleRef = useRef(null);
  const maxHandleRef = useRef(null);
  const [activeHandle, setActiveHandle] = useState(null);

  const [minVal, maxVal] = useMemo(() => (isRange ? value : [min, value]), [isRange, value, min]);

  const minPercent = useMemo(() => valueToPercent(minVal, min, max), [minVal, min, max]);
  const maxPercent = useMemo(() => valueToPercent(maxVal, min, max), [maxVal, min, max]);

  const handleDrag = useCallback((event) => {
    if (!activeHandle || disabled) return;
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    let newValue = percentToValue(percent, min, max, step);
    if (isRange) {
      if (activeHandle === 'min') {
        newValue = Math.min(newValue, maxVal - step);
        onChange([newValue, maxVal]);
      } else {
        newValue = Math.max(newValue, minVal + step);
        onChange([minVal, newValue]);
      }
    } else {
      onChange(newValue);
    }
  }, [activeHandle, disabled, min, max, step, isRange, maxVal, minVal, onChange]);

  const handleDragEnd = useCallback(() => {
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (activeHandle) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('touchmove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [activeHandle, handleDrag, handleDragEnd]);

  const handleKeyDown = useCallback((event, handleType) => {
    if (disabled) return;
    const [currentMin, currentMax] = isRange ? value : [min, value];

    const updateValue = (val) => {
      if (isRange) {
        if (handleType === 'min') {
          const newMin = Math.max(min, Math.min(val, currentMax - step));
          onChange([newMin, currentMax]);
        } else {
          const newMax = Math.min(max, Math.max(val, currentMin + step));
          onChange([currentMin, newMax]);
        }
      } else {
        onChange(Math.max(min, Math.min(val, max)));
      }
    };

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        updateValue((handleType === 'min' ? currentMin : currentMax) - step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        updateValue((handleType === 'min' ? currentMin : currentMax) + step);
        break;
      case 'Home':
        updateValue(min);
        break;
      case 'End':
        updateValue(max);
        break;
      case 'Tab':
        if(isRange) {
            if(handleType === 'min' && maxHandleRef.current) {
                event.preventDefault();
                maxHandleRef.current.focus();
            } else if (handleType === 'max' && minHandleRef.current) {
                event.preventDefault();
                minHandleRef.current.focus();
            }
        }
        return;
      default:
        return;
    }
    event.preventDefault();
  }, [disabled, isRange, value, min, max, step, onChange]);

  const trackStyle = isRange
    ? { left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }
    : { left: `0%`, width: `${maxPercent}%` };

  const getHandle = (type) => {
    const val = type === 'min' ? minVal : maxVal;
    const percent = type === 'min' ? minPercent : maxPercent;

    return (
      <div
        ref={type === 'min' ? minHandleRef : maxHandleRef}
        onMouseDown={(e) => { e.preventDefault(); setActiveHandle(type); }}
        onTouchStart={(_e) => { setActiveHandle(type); }}
        onKeyDown={(e) => handleKeyDown(e, type)}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        aria-valuetext={formatValue(val)}
        aria-label={isRange ? `${type} handle` : 'handle'}
        aria-disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={id && (error || helper) ? `${id}-${error ? 'error' : 'helper'}` : undefined}
        tabIndex={disabled ? -1 : 0}
        className={twMerge(
          'absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full cursor-grab transition-colors group',
          'bg-[#E0E1DD] border-2 border-[#415A77]',
          error ? 'border-red-500' : 'border-[#415A77]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark',
          'hover:border-accent-cyan',
          disabled ? 'opacity-50 cursor-not-allowed' : (activeHandle === type ? 'cursor-grabbing' : 'active:cursor-grabbing'),
        )}
        style={{ left: `${percent}%`, transform: `translate(-${percent / 100 * 20}px, -50%)`, zIndex: activeHandle === type ? 20 : 10 }}
      >
        <div
          className={twMerge(
            "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded shadow-lg",
            "bg-[#415A77] text-white text-xs font-mono whitespace-nowrap",
            "opacity-0 group-hover:opacity-100 group-focus:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none",
            activeHandle === type && "opacity-100"
          )}
        >
          {formatValue(val)}
        </div>
      </div>
    );
  };

  const histogramBars = useMemo(() => {
    if (!histogram || histogram.length === 0) return null;
    const maxCount = Math.max(...histogram);
    return histogram.map((count, index) => (
      <div
        key={index}
        className="bg-[#415A77] bg-opacity-40 rounded-full"
        style={{
          position: 'absolute',
          left: `${(index / histogram.length) * 100}%`,
          width: `${100 / histogram.length}%`,
          height: `${(count / maxCount) * 100}%`,
          bottom: '0',
        }}
      />
    ));
  }, [histogram]);

  return (
    <div className={twMerge('relative w-full', className)} ref={ref} {...props}>
      <div className="flex justify-between items-center mb-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
      </div>

      <div ref={sliderRef} className="relative w-full h-12 flex items-center">
        {/* Track */}
        <div className={twMerge("relative w-full h-1.5 bg-[#1B263B] rounded-full overflow-hidden", error && 'bg-red-500/30')}>
          {/* Histogram */}
          {histogram && (
            <div className="absolute top-0 left-0 w-full h-full flex items-end">
              {histogramBars}
            </div>
          )}

          {/* Active Track */}
          <div
            className={twMerge("absolute h-full bg-[#415A77] rounded-full", error && 'bg-red-500')}
            style={trackStyle}
          />
        </div>

        {/* Handles */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-5">
            {isRange && getHandle('min')}
            {getHandle('max')}
        </div>
      </div>

      {showLabels && (
        <div className="flex justify-between text-xs text-[#778DA9] -mt-2">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}

      <div className="mt-1 h-4">
        {error && (
          <p id={id ? `${id}-error` : undefined} role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        {helper && !error && (
          <p id={id ? `${id}-helper` : undefined} className="text-sm text-text-secondary/70">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
});

export default RangeSlider;
