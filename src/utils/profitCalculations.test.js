/**
 * Tests for profit calculation utilities
 * Run with: npm test profitCalculations.test.js
 */

import {
  calculateSalesTax,
  calculateBrokerFee,
  calculateNetProfit,
  calculateBreakEven,
} from './profitCalculations';

describe('profitCalculations', () => {
  describe('calculateSalesTax', () => {
    test('calculates base sales tax correctly', () => {
      const result = calculateSalesTax(1000000, 0.05, 0);
      expect(result).toBe(50000); // 5% of 1M
    });

    test('applies Accounting skill reduction correctly', () => {
      const level0 = calculateSalesTax(1000000, 0.05, 0);
      const level1 = calculateSalesTax(1000000, 0.05, 1);
      const level5 = calculateSalesTax(1000000, 0.05, 5);

      expect(level0).toBe(50000); // 5.00%
      expect(level1).toBe(45000); // 4.50%
      expect(level5).toBeCloseTo(29524.5, 0); // 2.95%
    });

    test('handles edge cases', () => {
      expect(calculateSalesTax(0, 0.05, 5)).toBe(0);
      expect(calculateSalesTax(-100, 0.05, 5)).toBe(0);
      expect(calculateSalesTax(1000, -0.05, 5)).toBe(0);
    });
  });

  describe('calculateBrokerFee', () => {
    test('calculates base broker fee correctly', () => {
      const result = calculateBrokerFee(1000000, 0.03, 0, false, 0, 0);
      expect(result).toBe(30000); // 3% of 1M
    });

    test('applies Broker Relations skill reduction', () => {
      const level0 = calculateBrokerFee(1000000, 0.03, 0, false, 0, 0);
      const level5 = calculateBrokerFee(1000000, 0.03, 5, false, 0, 0);

      expect(level0).toBe(30000); // 3.00%
      expect(level5).toBe(15000); // 1.50%
    });

    test('respects minimum broker fee for NPC stations', () => {
      // Perfect skills + standings should still be 1.0% minimum
      const result = calculateBrokerFee(1000000, 0.03, 5, false, 10, 10);
      expect(result).toBe(10000); // 1.00% minimum
    });

    test('applies player structure discount', () => {
      const npc = calculateBrokerFee(1000000, 0.03, 5, false, 0, 0);
      const player = calculateBrokerFee(1000000, 0.03, 5, true, 0, 0);

      expect(player).toBeLessThan(npc);
      expect(player).toBeCloseTo(7500, 0); // ~0.75% (half of 1.5%)
    });

    test('applies faction and corp standings correctly', () => {
      const noStanding = calculateBrokerFee(1000000, 0.03, 0, false, 0, 0);
      const withStanding = calculateBrokerFee(1000000, 0.03, 0, false, 5, 5);

      expect(withStanding).toBeLessThan(noStanding);
      // 3% - (5 * 0.3%) - (5 * 0.2%) = 3% - 1.5% - 1% = 0.5% → 1.0% minimum
      expect(withStanding).toBe(10000); // 1.0% minimum
    });

    test('handles edge cases', () => {
      expect(calculateBrokerFee(0, 0.03, 5, false, 0, 0)).toBe(0);
      expect(calculateBrokerFee(-100, 0.03, 5, false, 0, 0)).toBe(0);
    });
  });

  describe('calculateNetProfit', () => {
    test('calculates simple profit correctly', () => {
      const result = calculateNetProfit({
        buyPrice: 1000,
        sellPrice: 1100,
        quantity: 100,
        accountingLevel: 0,
        brokerRelationsLevel: 0,
        isPlayerStructure: false,
      });

      expect(result.grossProfit).toBe(10000); // (1100 - 1000) * 100
      expect(result.buyBrokerFee).toBe(3000); // 3% of 100k
      expect(result.sellBrokerFee).toBe(3300); // 3% of 110k
      expect(result.salesTax).toBe(5500); // 5% of 110k
      expect(result.totalFees).toBe(11800);
      expect(result.netProfit).toBe(-1800); // Gross - fees (loss!)
    });

    test('calculates with perfect skills', () => {
      const result = calculateNetProfit({
        buyPrice: 1000,
        sellPrice: 1100,
        quantity: 100,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
        isPlayerStructure: false,
      });

      expect(result.grossProfit).toBe(10000);
      expect(result.buyBrokerFee).toBe(1500); // 1.5% of 100k
      expect(result.sellBrokerFee).toBe(1650); // 1.5% of 110k
      expect(result.salesTax).toBeCloseTo(3247.69, 0); // 2.95% of 110k
      expect(result.totalFees).toBeCloseTo(6397.69, 0);
      expect(result.netProfit).toBeCloseTo(3602.31, 0); // Profit!
    });

    test('calculates ROI correctly', () => {
      const result = calculateNetProfit({
        buyPrice: 1000000,
        sellPrice: 1100000,
        quantity: 1,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
      });

      const investment = 1000000 + result.buyBrokerFee;
      const expectedROI = (result.netProfit / investment) * 100;

      expect(result.roi).toBeCloseTo(expectedROI, 2);
    });

    test('calculates profit per unit correctly', () => {
      const result = calculateNetProfit({
        buyPrice: 1000,
        sellPrice: 1100,
        quantity: 100,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
      });

      expect(result.profitPerUnit).toBeCloseTo(result.netProfit / 100, 2);
    });

    test('handles player structures', () => {
      const npc = calculateNetProfit({
        buyPrice: 1000000,
        sellPrice: 1100000,
        quantity: 1,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
        isPlayerStructure: false,
      });

      const player = calculateNetProfit({
        buyPrice: 1000000,
        sellPrice: 1100000,
        quantity: 1,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
        isPlayerStructure: true,
      });

      expect(player.netProfit).toBeGreaterThan(npc.netProfit);
      expect(player.buyBrokerFee + player.sellBrokerFee).toBeLessThan(
        npc.buyBrokerFee + npc.sellBrokerFee
      );
    });

    test('returns correct structure', () => {
      const result = calculateNetProfit({
        buyPrice: 1000000,
        sellPrice: 1100000,
        quantity: 1,
      });

      expect(result).toHaveProperty('grossProfit');
      expect(result).toHaveProperty('buyBrokerFee');
      expect(result).toHaveProperty('sellBrokerFee');
      expect(result).toHaveProperty('salesTax');
      expect(result).toHaveProperty('totalFees');
      expect(result).toHaveProperty('netProfit');
      expect(result).toHaveProperty('profitPerUnit');
      expect(result).toHaveProperty('roi');
      expect(result).toHaveProperty('effectiveSalesTaxRate');
      expect(result).toHaveProperty('effectiveBrokerFeeRate');
    });
  });

  describe('calculateBreakEven', () => {
    test('calculates break-even price correctly', () => {
      const breakEven = calculateBreakEven({
        buyPrice: 1000000,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
        isPlayerStructure: false,
      });

      // Verify by checking if selling at break-even results in ~0 profit
      const verification = calculateNetProfit({
        buyPrice: 1000000,
        sellPrice: breakEven,
        quantity: 1,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
        isPlayerStructure: false,
      });

      expect(verification.netProfit).toBeCloseTo(0, 0);
    });

    test('break-even is higher with no skills', () => {
      const withSkills = calculateBreakEven({
        buyPrice: 1000000,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
      });

      const noSkills = calculateBreakEven({
        buyPrice: 1000000,
        accountingLevel: 0,
        brokerRelationsLevel: 0,
      });

      expect(noSkills).toBeGreaterThan(withSkills);
    });

    test('player structures have lower break-even', () => {
      const npc = calculateBreakEven({
        buyPrice: 1000000,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
        isPlayerStructure: false,
      });

      const player = calculateBreakEven({
        buyPrice: 1000000,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
        isPlayerStructure: true,
      });

      expect(player).toBeLessThan(npc);
    });

    test('handles edge cases', () => {
      expect(calculateBreakEven({ buyPrice: 0 })).toBe(0);
      expect(calculateBreakEven({ buyPrice: -100 })).toBe(0);
    });
  });

  describe('Real-world scenarios', () => {
    test('Station trading scenario - Tritanium', () => {
      // Buy at 5.50, sell at 6.00
      const result = calculateNetProfit({
        buyPrice: 5.50,
        sellPrice: 6.00,
        quantity: 100000,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
      });

      // Expected: small profit on tight margins
      expect(result.grossProfit).toBe(50000);
      expect(result.netProfit).toBeGreaterThan(0);
      expect(result.netProfit).toBeLessThan(result.grossProfit);
    });

    test('High-value item - PLEX', () => {
      const result = calculateNetProfit({
        buyPrice: 3500000,
        sellPrice: 3600000,
        quantity: 10,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
      });

      expect(result.grossProfit).toBe(1000000);
      expect(result.netProfit).toBeGreaterThan(0);
      expect(result.roi).toBeGreaterThan(0);
    });

    test('Perfect skills vs no skills comparison', () => {
      const perfectSkills = calculateNetProfit({
        buyPrice: 1000000,
        sellPrice: 1100000,
        quantity: 1,
        accountingLevel: 5,
        brokerRelationsLevel: 5,
      });

      const noSkills = calculateNetProfit({
        buyPrice: 1000000,
        sellPrice: 1100000,
        quantity: 1,
        accountingLevel: 0,
        brokerRelationsLevel: 0,
      });

      // Perfect skills should result in higher net profit
      expect(perfectSkills.netProfit).toBeGreaterThan(noSkills.netProfit);
      expect(perfectSkills.totalFees).toBeLessThan(noSkills.totalFees);

      // Skills save significant ISK on large trades
      const savings = noSkills.totalFees - perfectSkills.totalFees;
      expect(savings).toBeGreaterThan(0);
    });
  });
});
