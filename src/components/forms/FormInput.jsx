import { forwardRef } from 'react';

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
    ...props
  },
  ref
) {
  const inputId = id || name;

  const handleChange = (e) => {
    const newValue = type === 'number'
      ? (e.target.value === '' ? '' : Number(e.target.value))
      : e.target.value;
    onChange?.(newValue);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
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
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className={`
            w-full px-3 sm:px-4 py-3 rounded-lg
            bg-space-dark/50 dark:bg-space-dark/50 bg-white
            border ${error ? 'border-red-500' : 'border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300'}
            text-text-primary dark:text-text-primary text-light-text text-base sm:text-sm
            placeholder-text-secondary/50
            focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            min-h-[48px] sm:min-h-[44px]
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-12' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {helper && !error && (
        <p className="text-sm text-text-secondary/70">{helper}</p>
      )}
    </div>
  );
});

export default FormInput;
