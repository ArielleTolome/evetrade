import { forwardRef, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Form Input Component
 */
export const FormInput = forwardRef(function FormInput(
  {
    label,
    id,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    helper,
    required = false,
    disabled = false,
    className = '',
    inputClassName = '',
    min,
    max,
    step,
    prefix,
    suffix,
    inputMode,
    ...props
  },
  ref
) {
  const inputId = id || name;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value !== '' && value !== null && value !== undefined;

  const handleChange = (e) => {
    const newValue = type === 'number'
      ? (e.target.value === '' ? '' : Number(e.target.value))
      : e.target.value;
    onChange?.(newValue);
  };

  const handleClear = () => {
    onChange?.('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const isLabelFloating = isFocused || hasValue;

  return (
    <div className={`relative ${className}`} style={{ minHeight: '56px' }}>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm z-10">
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isLabelFloating ? placeholder : ''}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          className={`
            w-full px-3 sm:px-4 py-3 rounded-lg
            bg-space-dark/50 dark:bg-space-dark/50 bg-white
            border ${error ? 'border-red-500' : 'border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300'}
            text-text-primary dark:text-text-primary text-light-text text-sm
            placeholder-text-secondary/50
            focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            min-h-[48px] sm:min-h-[44px]
            ${prefix ? 'pl-8' : ''}
            ${suffix || (hasValue && !disabled) ? 'pr-12' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        <label
          htmlFor={inputId}
          className={`
            absolute left-3 transition-all duration-200 ease-in-out
            text-text-secondary
            ${isLabelFloating
              ? 'top-1 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm'
            }
            ${prefix && isLabelFloating ? 'pl-5' : ''}
            ${prefix && !isLabelFloating ? 'pl-5' : ''}
            pointer-events-none
          `}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            aria-label="Clear input"
          >
            <X size={18} />
          </button>
        )}

        {suffix && !hasValue && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400 mt-1">{error}</p>
      )}

      {helper && !error && (
        <p id={helperId} className="text-sm text-text-secondary/70 mt-1">{helper}</p>
      )}
    </div>
  );
});

export default FormInput;
