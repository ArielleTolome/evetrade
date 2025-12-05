import { forwardRef, useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

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
    useNative = false,
    ...props
  },
  ref
) {
  const selectId = id || name;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  useOnClickOutside(wrapperRef, () => setIsOpen(false));

  const hasValue = value !== '' && value !== null && value !== undefined;
  const isLabelFloating = isOpen || hasValue;

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleCustomChange = (newValue) => {
    onChange?.(newValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (useNative) {
    return (
      <div className={`relative ${className}`} style={{ minHeight: '56px' }}>
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
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-space-dark text-text-primary">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-text-secondary" />
          </div>
        </div>
        {error && <p id={errorId} role="alert" className="text-sm text-red-400">{error}</p>}
        {helper && !error && <p id={helperId} className="text-sm text-text-secondary/70">{helper}</p>}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: '56px' }} ref={wrapperRef}>
      <div className="relative">
        <button
          type="button"
          ref={ref}
          id={selectId}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          className={`
            w-full px-3 sm:px-4 py-3 rounded-lg text-left
            bg-space-dark/50 dark:bg-space-dark/50 bg-white
            border ${error ? 'border-red-500' : 'border-accent-cyan/20 dark:border-accent-cyan/20 border-gray-300'}
            text-text-primary dark:text-text-primary text-light-text text-sm
            focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            cursor-pointer
            min-h-[48px] sm:min-h-[44px]
            flex items-center justify-between
            ${selectClassName}
          `}
          {...props}
        >
          {selectedOption ? (
            <span className="text-text-primary">{selectedOption.label}</span>
          ) : (
            <span className="text-text-secondary/50">{isLabelFloating ? placeholder : ''}</span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </button>

        <label
          htmlFor={selectId}
          className={`
            absolute left-3 transition-all duration-200 ease-in-out
            text-text-secondary
            ${isLabelFloating
              ? 'top-1 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm'
            }
            pointer-events-none
          `}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-space-dark border border-accent-cyan/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 rounded-md bg-space-dark/50 border border-accent-cyan/20 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ul role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleCustomChange(option.value)}
                    role="option"
                    aria-selected={value === option.value}
                    className="px-3 sm:px-4 py-3 text-sm text-text-primary hover:bg-accent-cyan/10 cursor-pointer flex items-center justify-between"
                  >
                    {option.label}
                    {value === option.value && <Check className="w-4 h-4 text-accent-cyan" />}
                  </li>
                ))
              ) : (
                <li className="px-3 sm:px-4 py-3 text-sm text-text-secondary text-center">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p id={errorId} role="alert" className="text-sm text-red-400 mt-1">{error}</p>}
      {helper && !error && <p id={helperId} className="text-sm text-text-secondary/70 mt-1">{helper}</p>}
    </div>
  );
});

export default FormSelect;
