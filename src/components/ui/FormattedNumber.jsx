import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatISK, formatNumber, formatPercent, formatCompact, isValidNumber } from '../../utils/numberFormat';

const POSITIVE_COLOR = '#00ff9d';
const NEGATIVE_COLOR = '#d73000';
const NEUTRAL_COLOR = '#E0E1DD';
const SUFFIX_COLOR = '#778DA9';

/**
 * A flexible component for displaying formatted numbers, percentages, and ISK values
 * with options for animation, colorization, and copy-to-clipboard functionality.
 */
const FormattedNumber = ({
  value,
  format = 'number',
  decimals = 2,
  colorize = false,
  showSign = false,
  compact = false,
  suffix: customSuffix,
  animate = false,
  copyable = false,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);
  const [isCopied, setIsCopied] = useState(false);
  const animationFrameId = useRef(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (animate && isValidNumber(value) && value !== prevValueRef.current) {
      let startTimestamp = null;
      const startValue = prevValueRef.current || 0;
      const duration = 1000; // 1 second animation

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = startValue + (value - startValue) * progress;
        setDisplayValue(currentValue);

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(step);
        } else {
          // Ensure the final value is exact
          setDisplayValue(value);
          prevValueRef.current = value;
        }
      };
      animationFrameId.current = requestAnimationFrame(step);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing display with non-animated value
      setDisplayValue(value);
      prevValueRef.current = value;
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [value, animate]);

  const handleCopy = () => {
    if (!copyable || !isValidNumber(value)) return;
    navigator.clipboard.writeText(value.toString()).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const getFormattedValue = () => {
    const numValue = animate ? displayValue : value;
    let formatted;
    let suffix = customSuffix;

    switch (format) {
      case 'isk':
        formatted = formatISK(numValue, compact, decimals);
        if (suffix === undefined) {
          suffix = compact ? ' ISK' : ' ISK';
        }
        break;
      case 'percent':
        return formatPercent(numValue, decimals, showSign);
      case 'compact':
        return formatCompact(numValue, decimals);
      case 'number':
      default:
        formatted = formatNumber(numValue, decimals);
        if (suffix === undefined) {
          suffix = '';
        }
        break;
    }
     // The format functions handle invalid numbers, but we might have a suffix to append.
    if (!isValidNumber(numValue)) {
        return formatted; // Returns 'N/A', 'Invalid', etc.
    }

    const parts = formatted.split(/([A-Z])/);
    const numberPart = parts[0];
    const compactSuffix = parts.length > 1 ? parts.slice(1).join('') : '';


    return (
      <>
        {numberPart}
        {(compactSuffix || suffix) && (
          <span style={{ color: SUFFIX_COLOR }} className="ml-1">
            {compactSuffix}{suffix}
          </span>
        )}
      </>
    );
  };

  const color = colorize
    ? value > 0 ? POSITIVE_COLOR : value < 0 ? NEGATIVE_COLOR : NEUTRAL_COLOR
    : 'inherit';

  const tooltipText = isCopied ? 'Copied!' : `Click to copy: ${value}`;
  const finalClassName = `
    font-mono
    ${className}
    ${copyable ? 'cursor-pointer' : ''}
  `;

  return (
    <span
      style={{ color }}
      className={finalClassName}
      title={copyable && isValidNumber(value) ? tooltipText : `Value: ${value}`}
      onClick={handleCopy}
      aria-live={animate ? 'polite' : 'off'}
      aria-atomic="true"
    >
      {getFormattedValue()}
    </span>
  );
};

FormattedNumber.propTypes = {
  /** The number to format */
  value: PropTypes.number,
  /** The format to apply */
  format: PropTypes.oneOf(['isk', 'number', 'percent', 'compact']),
  /** Number of decimal places to show */
  decimals: PropTypes.number,
  /** Whether to color the number based on its sign (positive/negative/zero) */
  colorize: PropTypes.bool,
  /** Whether to show a '+' for positive numbers (only for 'percent' format) */
  showSign: PropTypes.bool,
  /** Whether to use compact notation (K, M, B, T) for 'isk' format */
  compact: PropTypes.bool,
  /** A custom suffix to append to the formatted number */
  suffix: PropTypes.string,
  /** Whether to animate the number counting up on mount */
  animate: PropTypes.bool,
  /** Whether to allow copying the full unformatted value on click */
  copyable: PropTypes.bool,
  /** Additional CSS classes to apply to the component */
  className: PropTypes.string,
};

export { FormattedNumber };
export default FormattedNumber;
