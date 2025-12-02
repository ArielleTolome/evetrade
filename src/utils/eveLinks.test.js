import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  openMarketDetails,
  showItemInfo,
  setDestination,
  addWaypoint,
  openContract,
  copyToClipboardWithFeedback,
  isValidTypeId,
  isValidSolarSystemId,
  isValidContractId,
} from './eveLinks';

describe('eveLinks', () => {
  beforeEach(() => {
    // Reset window.location.href mock
    delete window.location;
    window.location = { href: '' };
  });

  describe('openMarketDetails', () => {
    it('should generate correct EVE market details URL', () => {
      const typeId = 34; // Tritanium
      const url = openMarketDetails(typeId);
      expect(url).toBe('eve://market/showMarketDetails/?typeid=34');
    });

    it('should throw error for invalid typeId', () => {
      expect(() => openMarketDetails(null)).toThrow('Invalid typeId');
      expect(() => openMarketDetails('invalid')).toThrow('Invalid typeId');
      expect(() => openMarketDetails()).toThrow('Invalid typeId');
    });

    it('should set window.location.href', () => {
      openMarketDetails(34);
      expect(window.location.href).toBe('eve://market/showMarketDetails/?typeid=34');
    });
  });

  describe('showItemInfo', () => {
    it('should generate correct EVE item info URL', () => {
      const typeId = 34; // Tritanium
      const url = showItemInfo(typeId);
      expect(url).toBe('eve://showinfo/34');
    });

    it('should throw error for invalid typeId', () => {
      expect(() => showItemInfo(null)).toThrow('Invalid typeId');
      expect(() => showItemInfo('invalid')).toThrow('Invalid typeId');
      expect(() => showItemInfo()).toThrow('Invalid typeId');
    });

    it('should set window.location.href', () => {
      showItemInfo(34);
      expect(window.location.href).toBe('eve://showinfo/34');
    });
  });

  describe('setDestination', () => {
    it('should generate correct EVE destination URL', () => {
      const systemId = 30000142; // Jita
      const url = setDestination(systemId);
      expect(url).toBe('eve://client/setDestination?target=30000142');
    });

    it('should throw error for invalid solarSystemId', () => {
      expect(() => setDestination(null)).toThrow('Invalid solarSystemId');
      expect(() => setDestination('invalid')).toThrow('Invalid solarSystemId');
      expect(() => setDestination()).toThrow('Invalid solarSystemId');
    });

    it('should set window.location.href', () => {
      setDestination(30000142);
      expect(window.location.href).toBe('eve://client/setDestination?target=30000142');
    });
  });

  describe('addWaypoint', () => {
    it('should generate correct EVE waypoint URL', () => {
      const systemId = 30000142; // Jita
      const url = addWaypoint(systemId);
      expect(url).toBe('eve://client/addWaypoint?target=30000142');
    });

    it('should throw error for invalid solarSystemId', () => {
      expect(() => addWaypoint(null)).toThrow('Invalid solarSystemId');
      expect(() => addWaypoint('invalid')).toThrow('Invalid solarSystemId');
      expect(() => addWaypoint()).toThrow('Invalid solarSystemId');
    });

    it('should set window.location.href', () => {
      addWaypoint(30000142);
      expect(window.location.href).toBe('eve://client/addWaypoint?target=30000142');
    });
  });

  describe('openContract', () => {
    it('should generate correct EVE contract URL', () => {
      const contractId = 123456789;
      const url = openContract(contractId);
      expect(url).toBe('eve://contract/123456789');
    });

    it('should throw error for invalid contractId', () => {
      expect(() => openContract(null)).toThrow('Invalid contractId');
      expect(() => openContract('invalid')).toThrow('Invalid contractId');
      expect(() => openContract()).toThrow('Invalid contractId');
    });

    it('should set window.location.href', () => {
      openContract(123456789);
      expect(window.location.href).toBe('eve://contract/123456789');
    });
  });

  describe('copyToClipboardWithFeedback', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      });
    });

    it('should copy text to clipboard successfully', async () => {
      const onSuccess = vi.fn();
      const result = await copyToClipboardWithFeedback('Tritanium', onSuccess);

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Tritanium');
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onError for invalid text', async () => {
      const onError = vi.fn();
      const result = await copyToClipboardWithFeedback('', undefined, onError);

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('should handle clipboard API errors', async () => {
      navigator.clipboard.writeText = vi.fn(() => Promise.reject(new Error('Permission denied')));
      const onError = vi.fn();
      const result = await copyToClipboardWithFeedback('Tritanium', undefined, onError);

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('should throw error for null text', async () => {
      const onError = vi.fn();
      const result = await copyToClipboardWithFeedback(null, undefined, onError);

      expect(result).toBe(false);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('validation functions', () => {
    describe('isValidTypeId', () => {
      it('should return true for valid type IDs', () => {
        expect(isValidTypeId(34)).toBe(true);
        expect(isValidTypeId(1)).toBe(true);
        expect(isValidTypeId(99999)).toBe(true);
      });

      it('should return false for invalid type IDs', () => {
        expect(isValidTypeId(0)).toBe(false);
        expect(isValidTypeId(-1)).toBe(false);
        expect(isValidTypeId(null)).toBe(false);
        expect(isValidTypeId(undefined)).toBe(false);
        expect(isValidTypeId('34')).toBe(false);
        expect(isValidTypeId(34.5)).toBe(false);
      });
    });

    describe('isValidSolarSystemId', () => {
      it('should return true for valid solar system IDs', () => {
        expect(isValidSolarSystemId(30000142)).toBe(true);
        expect(isValidSolarSystemId(1)).toBe(true);
      });

      it('should return false for invalid solar system IDs', () => {
        expect(isValidSolarSystemId(0)).toBe(false);
        expect(isValidSolarSystemId(-1)).toBe(false);
        expect(isValidSolarSystemId(null)).toBe(false);
        expect(isValidSolarSystemId(undefined)).toBe(false);
        expect(isValidSolarSystemId('30000142')).toBe(false);
        expect(isValidSolarSystemId(30000142.5)).toBe(false);
      });
    });

    describe('isValidContractId', () => {
      it('should return true for valid contract IDs', () => {
        expect(isValidContractId(123456789)).toBe(true);
        expect(isValidContractId(1)).toBe(true);
      });

      it('should return false for invalid contract IDs', () => {
        expect(isValidContractId(0)).toBe(false);
        expect(isValidContractId(-1)).toBe(false);
        expect(isValidContractId(null)).toBe(false);
        expect(isValidContractId(undefined)).toBe(false);
        expect(isValidContractId('123456789')).toBe(false);
        expect(isValidContractId(123456789.5)).toBe(false);
      });
    });
  });
});
