import { describe, it, expect } from 'vitest';
import {
  getSecurityLevel,
  formatSecurityStatus,
  isHighSec,
  isLowSec,
  isNullSec,
  getSecurityClassification,
  isCitadel,
  cleanStationName,
} from './security';

describe('getSecurityLevel', () => {
  it('returns correct level for high-sec systems', () => {
    expect(getSecurityLevel(1.0)).toBe(10);
    expect(getSecurityLevel(0.9)).toBe(9);
    expect(getSecurityLevel(0.5)).toBe(5);
  });

  it('returns correct level for low-sec systems', () => {
    expect(getSecurityLevel(0.4)).toBe(4);
    expect(getSecurityLevel(0.1)).toBe(1);
  });

  it('returns correct level for null-sec systems', () => {
    expect(getSecurityLevel(0.0)).toBe(0);
    expect(getSecurityLevel(-0.5)).toBe(0);
    expect(getSecurityLevel(-1.0)).toBe(0);
  });

  it('clamps values to valid range', () => {
    expect(getSecurityLevel(1.5)).toBe(10);
    expect(getSecurityLevel(-2.0)).toBe(0);
  });

  it('handles null/undefined', () => {
    expect(getSecurityLevel(null)).toBe(0);
    expect(getSecurityLevel(undefined)).toBe(0);
  });
});

describe('formatSecurityStatus', () => {
  it('formats security with one decimal', () => {
    expect(formatSecurityStatus(1.0)).toBe('1.0');
    expect(formatSecurityStatus(0.5)).toBe('0.5');
    expect(formatSecurityStatus(0.45)).toBe('0.5');
  });

  it('handles negative values', () => {
    expect(formatSecurityStatus(-0.1)).toBe('-0.1');
    expect(formatSecurityStatus(-1.0)).toBe('-1.0');
  });

  it('handles null/undefined', () => {
    expect(formatSecurityStatus(null)).toBe('0.0');
    expect(formatSecurityStatus(undefined)).toBe('0.0');
  });
});

describe('isHighSec', () => {
  it('returns true for security >= 0.5', () => {
    expect(isHighSec(1.0)).toBe(true);
    expect(isHighSec(0.5)).toBe(true);
    expect(isHighSec(0.7)).toBe(true);
  });

  it('returns false for security < 0.5', () => {
    expect(isHighSec(0.4)).toBe(false);
    expect(isHighSec(0.0)).toBe(false);
    expect(isHighSec(-0.5)).toBe(false);
  });
});

describe('isLowSec', () => {
  it('returns true for security 0.1-0.4', () => {
    expect(isLowSec(0.4)).toBe(true);
    expect(isLowSec(0.3)).toBe(true);
    expect(isLowSec(0.1)).toBe(true);
  });

  it('returns false for high-sec and null-sec', () => {
    expect(isLowSec(0.5)).toBe(false);
    expect(isLowSec(0.0)).toBe(false);
    expect(isLowSec(-0.5)).toBe(false);
  });
});

describe('isNullSec', () => {
  it('returns true for security < 0.1', () => {
    expect(isNullSec(0.0)).toBe(true);
    expect(isNullSec(-0.5)).toBe(true);
    expect(isNullSec(-1.0)).toBe(true);
  });

  it('returns false for low-sec and high-sec', () => {
    expect(isNullSec(0.1)).toBe(false);
    expect(isNullSec(0.5)).toBe(false);
    expect(isNullSec(1.0)).toBe(false);
  });
});

describe('getSecurityClassification', () => {
  it('returns correct classification', () => {
    expect(getSecurityClassification(1.0)).toBe('High-Sec');
    expect(getSecurityClassification(0.5)).toBe('High-Sec');
    expect(getSecurityClassification(0.4)).toBe('Low-Sec');
    expect(getSecurityClassification(0.1)).toBe('Low-Sec');
    expect(getSecurityClassification(0.0)).toBe('Null-Sec');
    expect(getSecurityClassification(-0.5)).toBe('Null-Sec');
  });
});

describe('isCitadel', () => {
  it('returns true for station names ending with *', () => {
    expect(isCitadel('Some Player Station*')).toBe(true);
    expect(isCitadel('Fortizar*')).toBe(true);
  });

  it('returns false for NPC stations', () => {
    expect(isCitadel('Jita IV - Moon 4 - Caldari Navy Assembly Plant')).toBe(false);
    expect(isCitadel('Amarr VIII (Oris) - Emperor Family Academy')).toBe(false);
  });

  it('handles empty/null values', () => {
    expect(isCitadel('')).toBe(false);
    expect(isCitadel(null)).toBe(false);
    expect(isCitadel(undefined)).toBe(false);
  });
});

describe('cleanStationName', () => {
  it('removes trailing asterisk', () => {
    expect(cleanStationName('Some Station*')).toBe('Some Station');
    expect(cleanStationName('Fortizar*')).toBe('Fortizar');
  });

  it('preserves NPC station names', () => {
    expect(cleanStationName('Jita IV - Moon 4')).toBe('Jita IV - Moon 4');
  });

  it('handles empty/null values', () => {
    expect(cleanStationName('')).toBe('');
    expect(cleanStationName(null)).toBe('');
    expect(cleanStationName(undefined)).toBe('');
  });
});
