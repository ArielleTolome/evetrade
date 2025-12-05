import { describe, it, expect } from 'vitest';
import {
  formatISK,
  formatNumber,
  formatPercent,
  formatCompact,
  isValidNumber,
} from './numberFormat';

describe('isValidNumber', () => {
  it('should return true for valid numbers', () => {
    expect(isValidNumber(123)).toBe(true);
    expect(isValidNumber(0)).toBe(true);
    expect(isValidNumber(-123.45)).toBe(true);
  });

  it('should return false for invalid or non-finite numbers', () => {
    expect(isValidNumber(null)).toBe(false);
    expect(isValidNumber(undefined)).toBe(false);
    expect(isValidNumber(NaN)).toBe(false);
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber(-Infinity)).toBe(false);
  });
});

describe('formatNumber', () => {
  it('should format numbers with default decimals', () => {
    expect(formatNumber(1234.567)).toBe('1,234.57');
  });
  it('should handle custom decimal places', () => {
    expect(formatNumber(1234, 0)).toBe('1,234');
    expect(formatNumber(1234.5678, 4)).toBe('1,234.5678');
  });
  it('should handle edge cases', () => {
    expect(formatNumber(null)).toBe('N/A');
    expect(formatNumber(NaN)).toBe('Invalid');
    expect(formatNumber(Infinity)).toBe('∞');
  });
});

describe('formatISK', () => {
  it('should format as a standard number by default', () => {
    expect(formatISK(1234567.89)).toBe('1,234,567.89');
  });
  it('should format compactly when specified', () => {
    expect(formatISK(1234567, true, 2)).toBe('1.23M');
  });
  it('should handle different compact scales', () => {
    expect(formatISK(500000, true, 0)).toBe('500K');
    expect(formatISK(1500000000, true, 1)).toBe('1.5B');
    expect(formatISK(2300000000000, true, 1)).toBe('2.3T');
  });
  it('should handle edge cases', () => {
    expect(formatISK(null)).toBe('N/A');
  });
});

describe('formatPercent', () => {
  it('should format a decimal as a percentage', () => {
    expect(formatPercent(0.1234)).toBe('12.34%');
  });
  it('should handle the showSign option', () => {
    expect(formatPercent(0.1234, 2, true)).toBe('+12.34%');
    expect(formatPercent(-0.1234, 2, true)).toBe('-12.34%');
    expect(formatPercent(0, 2, true)).toBe('0.00%');
  });
  it('should handle edge cases', () => {
    expect(formatPercent(NaN)).toBe('Invalid');
  });
});

describe('formatCompact', () => {
  it('should format large numbers compactly', () => {
    expect(formatCompact(1500000, 1)).toBe('1.5M');
    expect(formatCompact(500000, 0)).toBe('500K');
    expect(formatCompact(1500000000, 1)).toBe('1.5B');
    expect(formatCompact(2300000000000, 1)).toBe('2.3T');
  });
  it('should handle numbers less than 1000', () => {
    expect(formatCompact(999, 2)).toBe('999');
    expect(formatCompact(999.123, 2)).toBe('999.12');
  });
  it('should handle edge cases', () => {
    expect(formatCompact(null)).toBe('N/A');
  });
});
