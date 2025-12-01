import { describe, it, expect } from 'vitest';
import {
  formatISK,
  formatNumber,
  formatPercent,
  formatVolume,
  formatCompact,
  capitalize,
  formatDuration,
} from './formatters';

describe('formatISK', () => {
  it('formats small numbers with ISK suffix', () => {
    expect(formatISK(500)).toBe('500.00 ISK');
    expect(formatISK(999)).toBe('999.00 ISK');
  });

  it('formats thousands with K suffix', () => {
    expect(formatISK(1000)).toBe('1.00K ISK');
    expect(formatISK(10000)).toBe('10.00K ISK');
    expect(formatISK(123456)).toBe('123.46K ISK');
  });

  it('formats millions with M suffix', () => {
    expect(formatISK(1000000)).toBe('1.00M ISK');
    expect(formatISK(1234567)).toBe('1.23M ISK');
  });

  it('formats billions with B suffix', () => {
    expect(formatISK(1000000000)).toBe('1.00B ISK');
    expect(formatISK(12345678901)).toBe('12.35B ISK');
  });

  it('formats trillions with T suffix', () => {
    expect(formatISK(1000000000000)).toBe('1.00T ISK');
  });

  it('omits ISK suffix when showSuffix is false', () => {
    expect(formatISK(500, false)).toBe('500.00');
    expect(formatISK(1000000, false)).toBe('1.00M');
  });

  it('handles zero', () => {
    expect(formatISK(0)).toBe('0.00 ISK');
  });

  it('handles negative numbers', () => {
    expect(formatISK(-1000)).toBe('-1.00K ISK');
    expect(formatISK(-1000000)).toBe('-1.00M ISK');
  });

  it('handles null/undefined', () => {
    expect(formatISK(null)).toBe('0 ISK');
    expect(formatISK(undefined)).toBe('0 ISK');
  });
});

describe('formatNumber', () => {
  it('formats numbers with specified decimals', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
    expect(formatNumber(1234.567, 0)).toBe('1,235');
  });

  it('adds thousand separators', () => {
    expect(formatNumber(1000000, 0)).toBe('1,000,000');
  });

  it('handles zero', () => {
    expect(formatNumber(0, 2)).toBe('0.00');
  });

  it('handles null/undefined', () => {
    expect(formatNumber(null, 0)).toBe('0');
    expect(formatNumber(undefined, 0)).toBe('0');
  });
});

describe('formatPercent', () => {
  it('formats decimal as percentage', () => {
    expect(formatPercent(0.1234, 1)).toBe('12.3%');
    expect(formatPercent(0.1234, 2)).toBe('12.34%');
  });

  it('handles whole percentages', () => {
    expect(formatPercent(1, 0)).toBe('100%');
    expect(formatPercent(0.5, 0)).toBe('50%');
  });

  it('handles zero', () => {
    expect(formatPercent(0, 1)).toBe('0.0%');
  });

  it('handles null/undefined', () => {
    expect(formatPercent(null, 1)).toBe('0%');
    expect(formatPercent(undefined, 1)).toBe('0%');
  });
});

describe('formatVolume', () => {
  it('formats volumes with m³ suffix', () => {
    expect(formatVolume(500)).toBe('500.00 m³');
    expect(formatVolume(1000)).toBe('1,000.00 m³');
    expect(formatVolume(12345.67)).toBe('12,345.67 m³');
  });

  it('handles zero', () => {
    expect(formatVolume(0)).toBe('0.00 m³');
  });

  it('handles null/undefined', () => {
    expect(formatVolume(null)).toBe('0 m³');
  });
});

describe('formatCompact', () => {
  it('formats billions', () => {
    expect(formatCompact(1000000000)).toBe('1.0B');
    expect(formatCompact(2500000000)).toBe('2.5B');
  });

  it('formats millions', () => {
    expect(formatCompact(1000000)).toBe('1.0M');
    expect(formatCompact(5500000)).toBe('5.5M');
  });

  it('formats thousands', () => {
    expect(formatCompact(1000)).toBe('1.0K');
    expect(formatCompact(5500)).toBe('5.5K');
  });

  it('formats small numbers', () => {
    expect(formatCompact(500)).toBe('500');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('WORLD');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('handles null/undefined', () => {
    expect(capitalize(null)).toBe('');
    expect(capitalize(undefined)).toBe('');
  });
});

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('formats minutes', () => {
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(3599)).toBe('59m 59s');
  });

  it('formats hours', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(7200)).toBe('2h 0m');
    expect(formatDuration(5400)).toBe('1h 30m');
  });
});
