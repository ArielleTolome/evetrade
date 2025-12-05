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
    floatingLabel = false,
    ...props
  },
  ref
) {
  const inputId = id || name;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const hasValue = value !== '' && value !== undefined && value !== null;

  const handleChange = (e) => {
    let newValue = e.target.value;
    if (type === 'number') {
      if (newValue === '') {
        newValue = '';
      } else {
        const num = Number(newValue);
        newValue = isNaN(num) ? '' : num;
      }
    }
    onChange?.(newValue);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {!floatingLabel && label && (
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
          placeholder={floatingLabel ? ' ' : placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          className={`
            w-full px-4 py-3 rounded-lg
            text-text-primary dark:text-text-primary text-light-text text-sm
            placeholder-text-secondary/50
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            min-h-[44px]
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-12' : ''}
            ${
              floatingLabel
                ? `bg-deep-sea-bg border ${
                    error ? 'border-red-500' : 'border-deep-sea-border'
                  } focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan peer`
                : `bg-space-dark/50 dark:bg-space-dark/50 bg-white border ${
                    error
                      ? 'border-red-500'
                      : 'border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300'
                  } focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan`
            }
            ${inputClassName}
          `}
          {...props}
        />

        {floatingLabel && label && (
          <label
            htmlFor={inputId}
            className={`
              absolute ${
                prefix ? 'left-8' : 'left-4'
              } top-1/2 -translate-y-1/2
              text-sm
              transition-all duration-200 ease-in-out
              origin-top-left
              cursor-text
              peer-focus:scale-85 peer-focus:-translate-y-[120%]
              ${
                hasValue
                  ? 'scale-85 -translate-y-[120%]'
                  : 'scale-100 translate-y-[-50%]'
              }
              ${
                error
                  ? 'text-red-400'
                  : 'text-deep-sea-label-default peer-focus:text-deep-sea-label-focused'
              }
              ${hasValue ? 'text-deep-sea-label-focused' : ''}
            `}
          >
            {label}
            {required && <span className="ml-1">*</span>}
          </label>
        )}

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
            {suffix}
          </span>
        )}
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

export default FormInput;
