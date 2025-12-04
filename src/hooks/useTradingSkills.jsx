import { useState, useCallback, useMemo } from 'react';
import { getCharacterSkills, getCharacterStandings } from '../api/esi';
import { useEveAuth } from './useEveAuth';

/**
 * Trading skill IDs and their effects
 * EVE Online skill IDs from ESI
 */
const TRADING_SKILLS = {
  // Core trading skills
  TRADE: {
    id: 3443,
    name: 'Trade',
    effect: 'Increases active order limit by 4 per level',
    perLevel: (level) => ({ maxOrders: level * 4 }),
  },
  RETAIL: {
    id: 3444,
    name: 'Retail',
    effect: 'Increases active order limit by 8 per level',
    perLevel: (level) => ({ maxOrders: level * 8 }),
  },
  WHOLESALE: {
    id: 16596,
    name: 'Wholesale',
    effect: 'Increases active order limit by 16 per level',
    perLevel: (level) => ({ maxOrders: level * 16 }),
  },
  TYCOON: {
    id: 18580,
    name: 'Tycoon',
    effect: 'Increases active order limit by 32 per level',
    perLevel: (level) => ({ maxOrders: level * 32 }),
  },

  // Fee reduction skills
  ACCOUNTING: {
    id: 16622,
    name: 'Accounting',
    effect: 'Reduces sales tax by 11% per level',
    perLevel: (level) => ({ salesTaxReduction: 0.11 * level }),
  },
  BROKER_RELATIONS: {
    id: 3446,
    name: 'Broker Relations',
    effect: 'Reduces broker fee by 0.3% per level',
    perLevel: (level) => ({ brokerFeeReduction: 0.003 * level }),
  },
  ADVANCED_BROKER_RELATIONS: {
    id: 47868,
    name: 'Advanced Broker Relations',
    effect: 'Reduces relist/modify fee by 5% per level',
    perLevel: (level) => ({ relistFeeReduction: 0.05 * level }),
  },

  // Range skills
  DAYTRADING: {
    id: 16595,
    name: 'Daytrading',
    effect: 'Allows remote order modification from further away',
    perLevel: (level) => ({ modifyRange: level * 5 }), // jumps
  },
  MARKETING: {
    id: 16594,
    name: 'Marketing',
    effect: 'Allows placing sell orders further from your location',
    perLevel: (level) => ({ sellOrderRange: level * 5 }), // jumps
  },
  PROCUREMENT: {
    id: 16597,
    name: 'Procurement',
    effect: 'Allows placing buy orders further from your location',
    perLevel: (level) => ({ buyOrderRange: level * 5 }), // jumps
  },
  VISIBILITY: {
    id: 3447,
    name: 'Visibility',
    effect: 'Increases range of remote buy orders',
    perLevel: (level) => ({ buyOrderVisibility: level * 5 }), // jumps
  },

  // Margin trading (removed from game but kept for reference)
  // MARGIN_TRADING: {
  //   id: 16597, // Now Procurement
  //   name: 'Margin Trading',
  //   effect: 'Reduces escrow requirement for buy orders',
  // },

  // Contract skills
  CONTRACTING: {
    id: 25235,
    name: 'Contracting',
    effect: 'Increases maximum outstanding contracts',
    perLevel: (level) => ({ maxContracts: 5 + level * 4 }),
  },
  CORPORATION_CONTRACTING: {
    id: 25233,
    name: 'Corporation Contracting',
    effect: 'Increases maximum outstanding corporation contracts',
    perLevel: (level) => ({ maxCorpContracts: level * 10 }),
  },
};

/**
 * Base rates before skills
 */
const BASE_RATES = {
  salesTax: 0.08, // 8%
  brokerFee: 0.03, // 3%
  relistFee: 0.01, // 1% base relist fee
  maxOrders: 5, // Base order slots
  maxContracts: 1, // Base contract slots
};

/**
 * Hook for managing trading skills and calculating their impact on margins
 */
export function useTradingSkills() {
  const { character, accessToken } = useEveAuth();
  const [skills, setSkills] = useState(null);
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load character skills and standings
   */
  const loadSkillData = useCallback(async () => {
    if (!character?.characterId || !accessToken) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [skillsData, standingsData] = await Promise.all([
        getCharacterSkills(character.characterId, accessToken),
        getCharacterStandings(character.characterId, accessToken),
      ]);

      setSkills(skillsData);
      setStandings(standingsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [character?.characterId, accessToken]);

  /**
   * Parse character skills into trading-specific skills
   */
  const tradingSkills = useMemo(() => {
    if (!skills?.skills) return {};

    const result = {};
    const skillsArray = skills.skills;

    Object.entries(TRADING_SKILLS).forEach(([key, skillInfo]) => {
      const characterSkill = skillsArray.find(s => s.skill_id === skillInfo.id);
      result[key] = {
        ...skillInfo,
        trainedLevel: characterSkill?.active_skill_level ?? 0,
        trainingLevel: characterSkill?.trained_skill_level ?? 0,
        skillpoints: characterSkill?.skillpoints_in_skill ?? 0,
      };
    });

    return result;
  }, [skills]);

  /**
   * Calculate current effective rates based on skills
   */
  const currentRates = useMemo(() => {
    const accountingLevel = tradingSkills.ACCOUNTING?.trainedLevel ?? 0;
    const brokerLevel = tradingSkills.BROKER_RELATIONS?.trainedLevel ?? 0;
    const advBrokerLevel = tradingSkills.ADVANCED_BROKER_RELATIONS?.trainedLevel ?? 0;

    // Calculate sales tax
    const salesTax = BASE_RATES.salesTax * (1 - 0.11 * accountingLevel);

    // Calculate broker fee
    let brokerFee = BASE_RATES.brokerFee - (0.003 * brokerLevel);

    // Apply standings bonus if available
    if (standings?.length > 0) {
      // Find NPC corporation standings (for the trading station's corporation)
      // This is simplified - in reality it depends on which station you're at
      const bestCorpStanding = Math.max(
        0,
        ...standings
          .filter(s => s.from_type === 'npc_corp')
          .map(s => s.standing)
      );
      const bestFactionStanding = Math.max(
        0,
        ...standings
          .filter(s => s.from_type === 'faction')
          .map(s => s.standing)
      );

      const standingBonus = 0.0003 * bestCorpStanding + 0.0002 * bestFactionStanding;
      brokerFee = Math.max(0.01, brokerFee - standingBonus);
    }

    // Calculate relist fee
    const relistFee = BASE_RATES.relistFee * (1 - 0.05 * advBrokerLevel);

    // Calculate max orders
    const tradeOrders = (tradingSkills.TRADE?.trainedLevel ?? 0) * 4;
    const retailOrders = (tradingSkills.RETAIL?.trainedLevel ?? 0) * 8;
    const wholesaleOrders = (tradingSkills.WHOLESALE?.trainedLevel ?? 0) * 16;
    const tycoonOrders = (tradingSkills.TYCOON?.trainedLevel ?? 0) * 32;
    const maxOrders = BASE_RATES.maxOrders + tradeOrders + retailOrders + wholesaleOrders + tycoonOrders;

    // Calculate total fees for a round trip (buy + sell)
    const totalFees = salesTax + brokerFee * 2;

    return {
      salesTax,
      brokerFee,
      relistFee,
      totalFees,
      maxOrders,
      salesTaxPercent: (salesTax * 100).toFixed(2),
      brokerFeePercent: (brokerFee * 100).toFixed(2),
      relistFeePercent: (relistFee * 100).toFixed(2),
      totalFeesPercent: (totalFees * 100).toFixed(2),
    };
  }, [tradingSkills, standings]);

  /**
   * Calculate the impact of training a skill to the next level
   */
  const calculateSkillImpact = useCallback((skillKey, targetLevel = null) => {
    const skill = tradingSkills[skillKey];
    if (!skill) return null;

    const currentLevel = skill.trainedLevel;
    const nextLevel = targetLevel ?? Math.min(currentLevel + 1, 5);

    if (nextLevel <= currentLevel) {
      return { noImprovement: true };
    }

    // Calculate current and projected values
    const result = {
      skillName: skill.name,
      currentLevel,
      targetLevel: nextLevel,
      improvements: [],
    };

    // Calculate specific improvements based on skill type
    switch (skillKey) {
      case 'ACCOUNTING': {
        const currentReduction = 0.11 * currentLevel;
        const newReduction = 0.11 * nextLevel;
        const currentTax = BASE_RATES.salesTax * (1 - currentReduction);
        const newTax = BASE_RATES.salesTax * (1 - newReduction);
        const savingsPercent = ((currentTax - newTax) * 100).toFixed(3);
        result.improvements.push({
          metric: 'Sales Tax',
          current: `${(currentTax * 100).toFixed(2)}%`,
          projected: `${(newTax * 100).toFixed(2)}%`,
          savings: `${savingsPercent}%`,
        });
        break;
      }
      case 'BROKER_RELATIONS': {
        const currentReduction = 0.003 * currentLevel;
        const newReduction = 0.003 * nextLevel;
        const currentFee = BASE_RATES.brokerFee - currentReduction;
        const newFee = BASE_RATES.brokerFee - newReduction;
        const savingsPercent = ((currentFee - newFee) * 100).toFixed(3);
        result.improvements.push({
          metric: 'Broker Fee',
          current: `${(currentFee * 100).toFixed(2)}%`,
          projected: `${(newFee * 100).toFixed(2)}%`,
          savings: `${savingsPercent}% (x2 for round trip)`,
        });
        break;
      }
      case 'ADVANCED_BROKER_RELATIONS': {
        const currentReduction = 0.05 * currentLevel;
        const newReduction = 0.05 * nextLevel;
        const currentFee = BASE_RATES.relistFee * (1 - currentReduction);
        const newFee = BASE_RATES.relistFee * (1 - newReduction);
        const savingsPercent = ((currentFee - newFee) * 100).toFixed(3);
        result.improvements.push({
          metric: 'Relist/Modify Fee',
          current: `${(currentFee * 100).toFixed(2)}%`,
          projected: `${(newFee * 100).toFixed(2)}%`,
          savings: `${savingsPercent}%`,
        });
        break;
      }
      case 'TRADE':
      case 'RETAIL':
      case 'WHOLESALE':
      case 'TYCOON': {
        const orderSlots = skill.perLevel(nextLevel).maxOrders;
        const currentSlots = skill.perLevel(currentLevel).maxOrders;
        result.improvements.push({
          metric: 'Order Slots',
          current: currentSlots.toString(),
          projected: `+${orderSlots - currentSlots}`,
          savings: `${orderSlots - currentSlots} additional orders`,
        });
        break;
      }
      default:
        break;
    }

    return result;
  }, [tradingSkills]);

  /**
   * Calculate profitability impact on a trade based on skills
   * @param {number} buyPrice - The buy price
   * @param {number} sellPrice - The sell price
   * @param {number} quantity - Trade quantity
   * @returns {Object} Profitability analysis
   */
  const calculateProfitImpact = useCallback((buyPrice, sellPrice, quantity = 1) => {
    const { salesTax, brokerFee, totalFees } = currentRates;

    // Current profit calculation
    const buyFee = buyPrice * brokerFee;
    const sellFee = sellPrice * brokerFee;
    const tax = sellPrice * salesTax;
    const totalCosts = buyFee + sellFee + tax;
    const profitPerUnit = sellPrice - buyPrice - totalCosts;
    const netProfit = profitPerUnit * quantity;
    const margin = (profitPerUnit / buyPrice) * 100;

    // Perfect skills calculation (Accounting V, Broker Relations V)
    const perfectSalesTax = BASE_RATES.salesTax * (1 - 0.11 * 5);
    const perfectBrokerFee = Math.max(0.01, BASE_RATES.brokerFee - 0.003 * 5);
    const perfectBuyFee = buyPrice * perfectBrokerFee;
    const perfectSellFee = sellPrice * perfectBrokerFee;
    const perfectTax = sellPrice * perfectSalesTax;
    const perfectTotalCosts = perfectBuyFee + perfectSellFee + perfectTax;
    const perfectProfitPerUnit = sellPrice - buyPrice - perfectTotalCosts;
    const perfectNetProfit = perfectProfitPerUnit * quantity;
    const perfectMargin = (perfectProfitPerUnit / buyPrice) * 100;

    return {
      current: {
        salesTax: tax,
        buyBrokerFee: buyFee,
        sellBrokerFee: sellFee,
        totalFees: totalCosts,
        profitPerUnit,
        netProfit,
        margin: margin.toFixed(2),
      },
      withPerfectSkills: {
        salesTax: perfectTax,
        buyBrokerFee: perfectBuyFee,
        sellBrokerFee: perfectSellFee,
        totalFees: perfectTotalCosts,
        profitPerUnit: perfectProfitPerUnit,
        netProfit: perfectNetProfit,
        margin: perfectMargin.toFixed(2),
      },
      improvement: {
        additionalProfitPerUnit: perfectProfitPerUnit - profitPerUnit,
        additionalNetProfit: perfectNetProfit - netProfit,
        marginImprovement: (perfectMargin - margin).toFixed(2),
        percentageImprovement: (((perfectNetProfit - netProfit) / netProfit) * 100).toFixed(1),
      },
    };
  }, [currentRates]);

  /**
   * Get skill training recommendations for trading
   */
  const getSkillRecommendations = useCallback(() => {
    const recommendations = [];

    // Prioritize fee reduction skills
    if ((tradingSkills.ACCOUNTING?.trainedLevel ?? 0) < 5) {
      recommendations.push({
        priority: 1,
        skill: 'Accounting',
        currentLevel: tradingSkills.ACCOUNTING?.trainedLevel ?? 0,
        reason: 'Reduces sales tax - high impact on all trades',
        category: 'Fee Reduction',
      });
    }

    if ((tradingSkills.BROKER_RELATIONS?.trainedLevel ?? 0) < 5) {
      recommendations.push({
        priority: 2,
        skill: 'Broker Relations',
        currentLevel: tradingSkills.BROKER_RELATIONS?.trainedLevel ?? 0,
        reason: 'Reduces broker fee - paid twice per trade cycle',
        category: 'Fee Reduction',
      });
    }

    // Order capacity skills
    const currentMaxOrders = currentRates.maxOrders;
    if (currentMaxOrders < 305) {
      const orderSkills = ['TRADE', 'RETAIL', 'WHOLESALE', 'TYCOON'];
      for (const skillKey of orderSkills) {
        const skill = tradingSkills[skillKey];
        if (skill && skill.trainedLevel < 5) {
          recommendations.push({
            priority: 3,
            skill: skill.name,
            currentLevel: skill.trainedLevel,
            reason: `Increases order slots - currently ${currentMaxOrders}`,
            category: 'Order Capacity',
          });
          break; // Only recommend one at a time in order
        }
      }
    }

    // Advanced broker for active traders
    if ((tradingSkills.ADVANCED_BROKER_RELATIONS?.trainedLevel ?? 0) < 5) {
      recommendations.push({
        priority: 4,
        skill: 'Advanced Broker Relations',
        currentLevel: tradingSkills.ADVANCED_BROKER_RELATIONS?.trainedLevel ?? 0,
        reason: 'Reduces relist/modify fees - useful for active traders',
        category: 'Fee Reduction',
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }, [tradingSkills, currentRates.maxOrders]);

  return {
    // Data
    skills,
    standings,
    tradingSkills,
    currentRates,

    // Loading state
    loading,
    error,

    // Actions
    loadSkillData,

    // Calculations
    calculateSkillImpact,
    calculateProfitImpact,
    getSkillRecommendations,

    // Constants
    BASE_RATES,
    TRADING_SKILLS,
  };
}

export default useTradingSkills;
