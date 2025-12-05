import { forwardRef, useState, useRef, useEffect } from 'react';
import {
  format, addMonths, subMonths, getYear, getMonth, startOfMonth,
  endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  isToday, isSameDay, addDays, isWithinInterval, subDays, startOfToday, setYear, setMonth
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const DatePicker = forwardRef(function DatePicker(
  {
    value,
    onChange,
    mode = 'single',
    minDate,
    maxDate,
    placeholder = 'Select a date',
    label,
    error,
    disabled = false,
    className = '',
    id,
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = ref;
  const inputId = id || label;
  const [currentDate, setCurrentDate] = useState(value instanceof Date ? value : (value?.start || new Date()));
  const [focusedDate, setFocusedDate] = useState(value instanceof Date ? value : (value?.start || new Date()));

  const setPresetRange = (preset) => {
    const today = startOfToday();
    let start, end = today;

    switch (preset) {
      case 'today':
        start = today;
        break;
      case 'last7':
        start = subDays(today, 6);
        break;
      case 'last30':
        start = subDays(today, 29);
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        break;
      default:
        break;
    }
    onChange({ start, end });
    setIsOpen(false);
  };

  const handleDateClick = (day) => {
    if (mode === 'single') {
      onChange(day);
      setIsOpen(false);
    } else {
      const { start, end } = value || {};
      if (!start || end) {
        onChange({ start: day, end: null });
      } else if (day < start) {
        onChange({ start: day, end: null });
      } else {
        onChange({ start, end: day });
        setIsOpen(false);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleYearChange = (year) => {
    setCurrentDate(setYear(currentDate, year));
  };

  const handleMonthChange = (month) => {
    setCurrentDate(setMonth(currentDate, month));
  };

  useEffect(() => {
    function handleInteraction(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef?.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [containerRef, triggerRef]);

  useEffect(() => {
    if (isOpen) {
      setFocusedDate(value instanceof Date ? value : (value?.start || new Date()));
    }
  }, [isOpen, value]);

  const handleKeyDown = (e) => {
    e.preventDefault();
    switch (e.key) {
      case 'ArrowRight':
        setFocusedDate(addDays(focusedDate, 1));
        break;
      case 'ArrowLeft':
        setFocusedDate(addDays(focusedDate, -1));
        break;
      case 'ArrowUp':
        setFocusedDate(addDays(focusedDate, -7));
        break;
      case 'ArrowDown':
        setFocusedDate(addDays(focusedDate, 7));
        break;
      case 'Enter':
      case ' ':
        handleDateClick(focusedDate);
        break;
      default:
        break;
    }
  };

  const displayValue = () => {
    if (!value) return '';
    if (mode === 'single' && value instanceof Date) {
      return format(value, 'MMM d, yyyy');
    }
    if (mode === 'range' && value.start && value.end) {
      return `${format(value.start, 'MMM d, yyyy')} - ${format(value.end, 'MMM d, yyyy')}`;
    }
    if (mode === 'range' && value.start) {
      return `${format(value.start, 'MMM d, yyyy')} - ...`;
    }
    return '';
  };

  return (
    <div ref={containerRef} className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={inputId}
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="w-full px-4 py-3 rounded-lg bg-space-dark/50 backdrop-blur-sm border border-white/10 text-left text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px]"
        >
          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          {displayValue() || <span className="text-text-secondary/50">{placeholder}</span>}
        </button>
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="date-picker-label"
            className={`absolute z-10 top-full mt-2 w-full rounded-lg bg-[#0D1B2A] border border-[#415A77] shadow-lg p-4 text-[#E0E1DD] transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
            onKeyDown={handleKeyDown}
          >
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[#1B263B]" aria-label="Previous month">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div id="date-picker-label" className="flex space-x-2">
                <select
                  value={getMonth(currentDate)}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  className="bg-transparent font-semibold border-none focus:ring-0"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i} className="bg-[#0D1B2A]">{format(new Date(0, i), 'MMMM')}</option>
                  ))}
                </select>
                <select
                  value={getYear(currentDate)}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="bg-transparent font-semibold border-none focus:ring-0"
                >
                  {Array.from({ length: 200 }, (_, i) => getYear(new Date()) - 100 + i).map(year => (
                    <option key={year} value={year} className="bg-[#0D1B2A]">{year}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[#1B263B]" aria-label="Next month">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div role="grid" className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} role="columnheader" className="text-center text-xs text-[#778DA9] font-medium">
                  {day}
                </div>
              ))}
              {renderDays()}
            </div>
            {mode === 'range' && (
              <div className="mt-4 pt-4 border-t border-[#415A77] flex justify-around">
                <button onClick={() => setPresetRange('today')} className="text-sm hover:text-white">Today</button>
                <button onClick={() => setPresetRange('last7')} className="text-sm hover:text-white">Last 7 Days</button>
                <button onClick={() => setPresetRange('last30')} className="text-sm hover:text-white">Last 30 Days</button>
                <button onClick={() => setPresetRange('thisMonth')} className="text-sm hover:text-white">This Month</button>
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );

  function renderDays() {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);
      const isSelected = mode === 'single' ? isSameDay(day, value) : (value?.start && isSameDay(day, value.start)) || (value?.end && isSameDay(day, value.end));
      const inRange = mode === 'range' && value?.start && value?.end && isWithinInterval(day, { start: value.start, end: value.end });
      const isFocused = isSameDay(day, focusedDate);

      return (
        <button
          key={day.toString()}
          type="button"
          role="gridcell"
          aria-selected={isSelected}
          aria-label={format(day, 'MMMM d, yyyy')}
          onClick={() => !isDisabled && handleDateClick(day)}
          disabled={isDisabled}
          className={`
            w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors duration-200
            ${!isSameMonth(day, monthStart) ? 'text-[#778DA9]/50' : 'text-[#E0E1DD]'}
            ${isToday(day) && !isSelected ? 'ring-1 ring-[#415A77]' : ''}
            ${isFocused ? 'ring-2 ring-accent-cyan' : ''}
            ${isSelected ? 'bg-[#415A77] text-white' : ''}
            ${inRange ? 'bg-[#415A77]/50' : ''}
            ${isDisabled ? 'text-[#778DA9]/50 cursor-not-allowed' : 'hover:bg-[#1B263B]'}
          `}
        >
          {format(day, 'd')}
        </button>
      );
    });
  }
});

export default DatePicker;
