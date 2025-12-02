import { useState, useCallback, useMemo } from 'react';

const ESI_BASE_URL = 'https://esi.evetech.net/latest';

/**
 * Industry and Manufacturing calculator for EVETrade
 * Calculates manufacturing costs, profits, and efficiency
 */
export function useIndustry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blueprintCache, setBlueprintCache] = useState({});

  /**
   * Default industry index values by activity
   */
  const defaultSystemIndices = {
    manufacturing: 0.05,
    research_time: 0.03,
    research_material: 0.03,
    copying: 0.02,
    invention: 0.04,
    reaction: 0.04,
  };

  /**
   * Fetch industry indices for a solar system
   */
  const fetchSystemIndices = useCallback(async (systemId) => {
    try {
      const response = await fetch(`${ESI_BASE_URL}/industry/systems/`);
      if (!response.ok) throw new Error('Failed to fetch industry indices');

      const systems = await response.json();
      const system = systems.find(s => s.solar_system_id === parseInt(systemId));

      if (!system) return defaultSystemIndices;

      const indices = {};
      system.cost_indices.forEach(index => {
        indices[index.activity] = index.cost_index;
      });

      return indices;
    } catch (err) {
      console.warn('Failed to fetch system indices:', err);
      return defaultSystemIndices;
    }
  }, []);

  /**
   * Calculate manufacturing cost
   */
  const calculateManufacturingCost = useCallback((params) => {
    const {
      materials = [],
      marketPrices = {},
      runs = 1,
      materialEfficiency = 0,
      timeEfficiency = 0,
      systemIndex = 0.05,
      facilityTax = 0.1,
      facilityBonus = 0,
      rigBonus = 0,
      structureRoleBonus = 0,
    } = params;

    // Calculate material costs
    let totalMaterialCost = 0;
    const materialBreakdown = materials.map(mat => {
      const baseQuantity = mat.quantity * runs;

      // Apply ME bonus (reduces materials)
      const meReduction = 1 - (materialEfficiency / 100);

      // Apply facility and rig bonuses
      const facilityReduction = 1 - (facilityBonus / 100);
      const rigReduction = 1 - (rigBonus / 100);

      // Final quantity (minimum 1 per run for non-zero materials)
      let finalQuantity = Math.ceil(baseQuantity * meReduction * facilityReduction * rigReduction);
      if (mat.quantity > 0 && finalQuantity < runs) finalQuantity = runs;

      const price = marketPrices[mat.typeId] || mat.price || 0;
      const cost = finalQuantity * price;
      totalMaterialCost += cost;

      return {
        ...mat,
        baseQuantity,
        finalQuantity,
        price,
        cost,
        saved: baseQuantity - finalQuantity,
      };
    });

    // Calculate job cost (based on item value and system index)
    const estimatedItemValue = totalMaterialCost; // Simplified
    const jobCost = estimatedItemValue * systemIndex;

    // Apply facility tax
    const facilityFee = jobCost * facilityTax;

    // Total production cost
    const totalCost = totalMaterialCost + jobCost + facilityFee;
    const costPerUnit = totalCost / runs;

    // Calculate time (base time in seconds)
    const baseTime = params.baseTime || 3600; // Default 1 hour
    const teReduction = 1 - (timeEfficiency / 100);
    const timeBonus = 1 - (structureRoleBonus / 100);
    const productionTime = baseTime * runs * teReduction * timeBonus;

    return {
      materials: materialBreakdown,
      totalMaterialCost,
      jobCost,
      facilityFee,
      totalCost,
      costPerUnit,
      runs,
      productionTime,
      productionTimeFormatted: formatTime(productionTime),
    };
  }, []);

  /**
   * Calculate manufacturing profit
   */
  const calculateManufacturingProfit = useCallback((params) => {
    const {
      productTypeId,
      productQuantity = 1,
      sellPrice = 0,
      salesTax = 0.036,
      brokerFee = 0.03,
      ...costParams
    } = params;

    const costs = calculateManufacturingCost(costParams);

    const grossRevenue = sellPrice * productQuantity * costParams.runs;
    const salesTaxAmount = grossRevenue * salesTax;
    const brokerFeeAmount = grossRevenue * brokerFee;
    const netRevenue = grossRevenue - salesTaxAmount - brokerFeeAmount;

    const profit = netRevenue - costs.totalCost;
    const profitPerUnit = profit / (productQuantity * costParams.runs);
    const profitMargin = grossRevenue > 0 ? (profit / grossRevenue) * 100 : 0;
    const roi = costs.totalCost > 0 ? (profit / costs.totalCost) * 100 : 0;

    // ISK per hour calculation
    const hoursToMake = costs.productionTime / 3600;
    const iskPerHour = hoursToMake > 0 ? profit / hoursToMake : 0;

    return {
      ...costs,
      productTypeId,
      productQuantity: productQuantity * costParams.runs,
      sellPrice,
      grossRevenue,
      salesTaxAmount,
      brokerFeeAmount,
      netRevenue,
      profit,
      profitPerUnit,
      profitMargin,
      roi,
      iskPerHour,
      isProfitable: profit > 0,
    };
  }, [calculateManufacturingCost]);

  /**
   * Calculate invention costs and success rate
   */
  const calculateInvention = useCallback((params) => {
    const {
      baseChance = 0.3, // Base invention chance
      encryptionSkill = 4,
      datacore1Skill = 4,
      datacore2Skill = 4,
      decryptor = null,
      runs = 1,
      datacoreCosts = {},
    } = params;

    // Decryptor modifiers
    const decryptorModifiers = {
      none: { probabilityMod: 0, meMod: 0, teMod: 0, runsMod: 0 },
      accelerant: { probabilityMod: 0.2, meMod: 2, teMod: 10, runsMod: 1 },
      attainment: { probabilityMod: 0.8, meMod: -1, teMod: 4, runsMod: 4 },
      augmentation: { probabilityMod: -0.4, meMod: 9, teMod: 2, runsMod: -2 },
      optimized: { probabilityMod: 0, meMod: 2, teMod: 0, runsMod: 7 },
      parity: { probabilityMod: 0.5, meMod: 1, teMod: -2, runsMod: 3 },
      process: { probabilityMod: -0.1, meMod: 3, teMod: 6, runsMod: 0 },
      symmetry: { probabilityMod: 0, meMod: 1, teMod: 8, runsMod: 2 },
    };

    const mods = decryptorModifiers[decryptor || 'none'];

    // Calculate success chance
    const skillModifier = 1 + (
      (encryptionSkill / 40) +
      (datacore1Skill / 30) +
      (datacore2Skill / 30)
    );
    const successChance = Math.min(1, baseChance * skillModifier * (1 + mods.probabilityMod));

    // Expected results per attempt
    const baseRuns = 1;
    const expectedRuns = baseRuns + mods.runsMod;
    const resultME = 2 + mods.meMod;
    const resultTE = 4 + mods.teMod;

    // Cost per attempt
    const datacore1Cost = datacoreCosts.datacore1 || 100000;
    const datacore2Cost = datacoreCosts.datacore2 || 100000;
    const decryptorCost = datacoreCosts.decryptor || 0;
    const costPerAttempt = datacore1Cost + datacore2Cost + decryptorCost;

    // Expected cost per successful invention
    const expectedCostPerSuccess = successChance > 0 ? costPerAttempt / successChance : Infinity;

    return {
      successChance,
      successChancePercent: (successChance * 100).toFixed(1),
      expectedRuns,
      resultME,
      resultTE,
      costPerAttempt,
      expectedCostPerSuccess,
      attemptsNeeded: runs,
      totalCost: costPerAttempt * runs,
      expectedSuccesses: runs * successChance,
    };
  }, []);

  /**
   * Calculate reaction costs (for moon materials)
   */
  const calculateReaction = useCallback((params) => {
    const {
      inputs = [],
      outputs = [],
      marketPrices = {},
      runs = 1,
      systemIndex = 0.04,
      facilityTax = 0.1,
      cycleTime = 3600, // 1 hour default
    } = params;

    // Input costs
    let totalInputCost = 0;
    const inputBreakdown = inputs.map(input => {
      const quantity = input.quantity * runs;
      const price = marketPrices[input.typeId] || input.price || 0;
      const cost = quantity * price;
      totalInputCost += cost;

      return {
        ...input,
        quantity,
        price,
        cost,
      };
    });

    // Output values
    let totalOutputValue = 0;
    const outputBreakdown = outputs.map(output => {
      const quantity = output.quantity * runs;
      const price = marketPrices[output.typeId] || output.price || 0;
      const value = quantity * price;
      totalOutputValue += value;

      return {
        ...output,
        quantity,
        price,
        value,
      };
    });

    // Job cost
    const jobCost = totalInputCost * systemIndex;
    const facilityFee = jobCost * facilityTax;

    const totalCost = totalInputCost + jobCost + facilityFee;
    const profit = totalOutputValue - totalCost;
    const profitMargin = totalOutputValue > 0 ? (profit / totalOutputValue) * 100 : 0;

    const totalTime = cycleTime * runs;
    const iskPerHour = (totalTime / 3600) > 0 ? profit / (totalTime / 3600) : 0;

    return {
      inputs: inputBreakdown,
      outputs: outputBreakdown,
      totalInputCost,
      totalOutputValue,
      jobCost,
      facilityFee,
      totalCost,
      profit,
      profitMargin,
      totalTime,
      totalTimeFormatted: formatTime(totalTime),
      iskPerHour,
      isProfitable: profit > 0,
    };
  }, []);

  /**
   * Compare build vs buy
   */
  const compareBuildVsBuy = useCallback((params) => {
    const {
      buyPrice,
      quantity = 1,
      ...manufacturingParams
    } = params;

    const manufacturing = calculateManufacturingProfit({
      ...manufacturingParams,
      sellPrice: buyPrice, // Use buy price as reference
    });

    const buyCost = buyPrice * quantity;
    const buildCost = manufacturing.costPerUnit * quantity;

    const savings = buyCost - buildCost;
    const savingsPercent = buyCost > 0 ? (savings / buyCost) * 100 : 0;

    return {
      buyCost,
      buildCost,
      savings,
      savingsPercent,
      recommendation: savings > 0 ? 'build' : 'buy',
      manufacturing,
    };
  }, [calculateManufacturingProfit]);

  /**
   * Format time in seconds to human readable
   */
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
  };

  /**
   * Format ISK value
   */
  const formatISK = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toLocaleString();
  };

  return {
    // State
    loading,
    error,

    // Calculation methods
    calculateManufacturingCost,
    calculateManufacturingProfit,
    calculateInvention,
    calculateReaction,
    compareBuildVsBuy,

    // Data fetching
    fetchSystemIndices,

    // Utilities
    formatTime,
    formatISK,
    defaultSystemIndices,
  };
}

export default useIndustry;
