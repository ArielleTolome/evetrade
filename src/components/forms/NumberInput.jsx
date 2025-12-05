import { forwardRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FormInput } from './FormInput';

/**
 * Number Input Component
 */
export const NumberInput = forwardRef(function NumberInput(
  {
    value,
    onChange,
    min,
    max,
    step = 1,
    ...props
  },
  ref
) {
  const handleIncrement = () => {
    const numericValue = value === '' ? 0 : Number(String(value).replace(/,/g, ''));
    const newValue = Math.min(numericValue + step, max === undefined ? Infinity : max);
    onChange?.(String(newValue));
  };

  const handleDecrement = () => {
    const numericValue = value === '' ? 0 : Number(String(value).replace(/,/g, ''));
    const newValue = Math.max(numericValue - step, min === undefined ? -Infinity : min);
    onChange?.(String(newValue));
  };

  const formatNumber = (num) => {
    if (num === '' || num === null || num === undefined) return '';
    // Remove existing commas before formatting
    const cleanedNum = String(num).replace(/,/g, '');
    // Format the number with commas
    return new Intl.NumberFormat().format(Number(cleanedNum));
  };

  const handleChange = (val) => {
    const parsedValue = val.replace(/,/g, '');
    if (!isNaN(parsedValue)) {
      onChange?.(parsedValue);
    }
  };


  const suffix = (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={handleDecrement}
        className="p-1 rounded-full bg-space-dark/50 hover:bg-accent-cyan/20"
        aria-label="Decrement"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        onClick={handleIncrement}
        className="p-1 rounded-full bg-space-dark/50 hover:bg-accent-cyan/20"
        aria-label="Increment"
      >
        <Plus size={16} />
      </button>
    </div>
  );

  return (
    <FormInput
      ref={ref}
      value={formatNumber(value)}
      onChange={handleChange}
      inputMode="decimal"
      type="text"
      min={min}
      max={max}
      step={step}
      suffix={suffix}
      {...props}
    />
  );
});

export default NumberInput;
