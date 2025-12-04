import { forwardRef } from 'react';

/**
 * Form Select Component
 */
export const FormSelect = forwardRef(function FormSelect(
  {
    label,
    id,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    error,
    helper,
    required = false,
    disabled = false,
    className = '',
    selectClassName = '',
    ...props
  },
  ref
) {
  const selectId = id || name;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-secondary"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          className={`
            w-full px-3 sm:px-4 py-3 rounded-lg appearance-none
            bg-space-dark/50 dark:bg-space-dark/50 bg-white
            border ${error ? 'border-red-500' : 'border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300'}
            text-text-primary dark:text-text-primary text-light-text text-sm
            focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            cursor-pointer
            min-h-[48px] sm:min-h-[44px]
            ${selectClassName}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-space-dark text-text-primary"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400">{error}</p>
      )}

      {helper && !error && (
        <p id={helperId} className="text-sm text-text-secondary/70">{helper}</p>
      )}
    </div>
  );
});

export default FormSelect;
