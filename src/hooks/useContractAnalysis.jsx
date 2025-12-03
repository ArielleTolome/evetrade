import { useState, useCallback, useMemo } from 'react';
import { useApiCall } from './useApiCall';

/**
 * Known scam patterns for contract analysis
 */
const SCAM_INDICATORS = {
  // Item name patterns that suggest scams
  BLUEPRINT_COPY_PATTERN: /\b(BPC|Blueprint Copy)\b/i,
  SKIN_PATTERN: /\b(SKIN|Nanocoating)\b/i,
  FACTION_PATTERN: /\b(Federation Navy|Republic Fleet|Imperial Navy|Caldari Navy|True Sansha|Dark Blood|Shadow Serpentis|Dread Guristas|Domination|Blood Raider)\b/i,

  // Price patterns
  UNUSUALLY_HIGH_PROFIT: 0.80, // 80%+ profit is suspicious
  TOO_GOOD_TO_BE_TRUE: 0.95, // 95%+ profit is almost certainly a scam

  // Volume patterns
  VERY_LOW_MARKET_VOLUME: 5, // Items with < 5 daily volume

  // Time patterns
  EXPIRING_SOON_HOURS: 24, // Contracts expiring in < 24 hours might be rushed scams
};

/**
 * Contract risk levels
 */
const RISK_LEVELS = {
  LOW: { level: 'low', color: 'green', label: 'Low Risk' },
  MEDIUM: { level: 'medium', color: 'yellow', label: 'Medium Risk' },
  HIGH: { level: 'high', color: 'orange', label: 'High Risk' },
  EXTREME: { level: 'extreme', color: 'red', label: 'Likely Scam' },
};

/**
 * Analyze a single contract for scam indicators
 * @param {Object} contract - Contract data from the API
 * @returns {Object} Risk assessment
 */
function analyzeContractRisk(contract) {
  const warnings = [];
  let riskScore = 0;

  // Check profit margin (higher profit = higher risk)
  const profitPercent = contract['Profit %'] || 0;
  if (profitPercent > SCAM_INDICATORS.TOO_GOOD_TO_BE_TRUE * 100) {
    warnings.push({
      severity: 'extreme',
      message: `Profit of ${profitPercent.toFixed(1)}% is too good to be true`,
      detail: 'Contracts with extremely high profits are almost always scams',
    });
    riskScore += 50;
  } else if (profitPercent > SCAM_INDICATORS.UNUSUALLY_HIGH_PROFIT * 100) {
    warnings.push({
      severity: 'high',
      message: `Unusually high profit margin (${profitPercent.toFixed(1)}%)`,
      detail: 'Verify item values carefully before purchasing',
    });
    riskScore += 30;
  }

  // Check for blueprint copies (common scam)
  if (contract.itemDetails) {
    const hasBPC = contract.itemDetails.some(item =>
      SCAM_INDICATORS.BLUEPRINT_COPY_PATTERN.test(item.name)
    );
    if (hasBPC) {
      warnings.push({
        severity: 'high',
        message: 'Contains Blueprint Copies (BPCs)',
        detail: 'BPCs can be difficult to value accurately. Verify runs and research levels.',
      });
      riskScore += 25;
    }

    // Check for SKINs (often overpriced in contracts)
    const hasSkins = contract.itemDetails.some(item =>
      SCAM_INDICATORS.SKIN_PATTERN.test(item.name)
    );
    if (hasSkins) {
      warnings.push({
        severity: 'medium',
        message: 'Contains SKINs',
        detail: 'SKIN prices can be volatile. Check current market prices.',
      });
      riskScore += 10;
    }

    // Check for faction items (common for name manipulation scams)
    const hasFaction = contract.itemDetails.some(item =>
      SCAM_INDICATORS.FACTION_PATTERN.test(item.name)
    );
    if (hasFaction && profitPercent > 30) {
      warnings.push({
        severity: 'medium',
        message: 'Contains faction items at high profit',
        detail: 'Verify these are the correct faction variants, not cheaper alternatives.',
      });
      riskScore += 15;
    }

    // Check if multiple items with similar names (name confusion scam)
    const itemNames = contract.itemDetails.map(item => item.name.toLowerCase().trim());
    const uniqueNames = new Set(itemNames);
    if (itemNames.length > uniqueNames.size) {
      warnings.push({
        severity: 'medium',
        message: 'Duplicate item names detected',
        detail: 'This could indicate a stacking scam. Verify quantities carefully.',
      });
      riskScore += 15;
    }
  }

  // Check contract expiration (rushed contracts might be scams)
  if (contract['Expires']) {
    const expiresDate = new Date(contract['Expires']);
    const hoursUntilExpiry = (expiresDate - new Date()) / (1000 * 60 * 60);
    if (hoursUntilExpiry < SCAM_INDICATORS.EXPIRING_SOON_HOURS && hoursUntilExpiry > 0) {
      warnings.push({
        severity: 'low',
        message: `Expiring soon (${Math.round(hoursUntilExpiry)} hours)`,
        detail: 'Short expiry times may pressure you into hasty decisions.',
      });
      riskScore += 5;
    }
  }

  // Check collateral ratio for courier contracts
  if (contract['Type'] === 'Courier' && contract['Collateral Ratio']) {
    const collateralRatio = contract['Collateral Ratio'];
    if (collateralRatio > 10) {
      warnings.push({
        severity: 'high',
        message: `Very high collateral ratio (${collateralRatio.toFixed(1)}x reward)`,
        detail: 'If you fail, you lose far more than you would earn. Verify route safety.',
      });
      riskScore += 20;
    } else if (collateralRatio > 5) {
      warnings.push({
        severity: 'medium',
        message: `High collateral ratio (${collateralRatio.toFixed(1)}x reward)`,
        detail: 'Consider the risk carefully.',
      });
      riskScore += 10;
    }
  }

  // Determine overall risk level
  let riskLevel;
  if (riskScore >= 50) {
    riskLevel = RISK_LEVELS.EXTREME;
  } else if (riskScore >= 30) {
    riskLevel = RISK_LEVELS.HIGH;
  } else if (riskScore >= 15) {
    riskLevel = RISK_LEVELS.MEDIUM;
  } else {
    riskLevel = RISK_LEVELS.LOW;
  }

  return {
    ...riskLevel,
    score: riskScore,
    warnings,
    isScamLikely: riskScore >= 50,
    requiresVerification: riskScore >= 30,
  };
}

/**
 * Calculate true market value with verification suggestions
 * @param {Object} contract - Contract with item details
 * @returns {Object} Value verification data
 */
function getValueVerification(contract) {
  if (!contract.itemDetails) {
    return {
      verified: false,
      message: 'No item details available',
      suggestions: ['Click on the contract in-game to view items'],
    };
  }

  const suggestions = [];
  const concerns = [];

  // Check for items without market prices
  const itemsWithNoPrice = contract.itemDetails.filter(item =>
    !item.marketPrice || item.marketPrice === 0
  );
  if (itemsWithNoPrice.length > 0) {
    concerns.push(`${itemsWithNoPrice.length} item(s) have no market price`);
    suggestions.push('Manually verify prices for items showing 0 ISK value');
  }

  // Check for low-volume items
  const lowVolumeWarning = contract.itemDetails.some(item =>
    item.name && (
      item.name.includes('Blueprint') ||
      item.name.includes('SKIN') ||
      item.name.includes('Implant')
    )
  );
  if (lowVolumeWarning) {
    suggestions.push('Check market history - these items may be rarely traded');
  }

  // Calculate value confidence
  const totalValue = contract['Market Value'] || 0;
  const contractPrice = contract['Contract Price'] || contract['Current Bid'] || 0;
  const valueRatio = contractPrice > 0 ? totalValue / contractPrice : 0;

  let confidence = 'high';
  if (itemsWithNoPrice.length > 0 || lowVolumeWarning) {
    confidence = 'low';
  } else if (valueRatio > 2) {
    confidence = 'medium';
  }

  return {
    verified: concerns.length === 0,
    confidence,
    concerns,
    suggestions: suggestions.length > 0 ? suggestions : ['Value appears accurate based on current market data'],
    itemsAnalyzed: contract.itemDetails.length,
    itemsWithPrices: contract.itemDetails.length - itemsWithNoPrice.length,
  };
}

/**
 * Hook for contract analysis with scam detection
 */
export function useContractAnalysis() {
  const { data: contracts, loading, error, execute } = useApiCall();
  const [analysisCache, setAnalysisCache] = useState({});

  /**
   * Fetch and analyze contracts
   */
  const fetchContracts = useCallback(async (params = {}) => {
    const {
      regionId = 10000002,
      contractType = 'all',
      minProfit = 1000000,
      maxCollateral = 1000000000,
      maxVolume = 30000,
      minRewardPerJump = 1000000,
    } = params;

    const queryParams = new URLSearchParams({
      regionId: regionId.toString(),
      contractType,
      minProfit: minProfit.toString(),
      maxCollateral: maxCollateral.toString(),
      maxVolume: maxVolume.toString(),
      minRewardPerJump: minRewardPerJump.toString(),
    });

    return execute(() =>
      fetch(`/api/contracts?${queryParams}`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch contracts');
        return res.json();
      })
    );
  }, [execute]);

  /**
   * Get risk analysis for a contract
   */
  const getContractRisk = useCallback((contract) => {
    const contractId = contract['Contract ID'];

    // Check cache
    if (analysisCache[contractId]) {
      return analysisCache[contractId];
    }

    // Perform analysis
    const risk = analyzeContractRisk(contract);
    const valueVerification = getValueVerification(contract);

    const analysis = {
      ...risk,
      valueVerification,
    };

    // Cache result
    setAnalysisCache(prev => ({
      ...prev,
      [contractId]: analysis,
    }));

    return analysis;
  }, [analysisCache]);

  /**
   * Analyze all loaded contracts
   */
  const analyzedContracts = useMemo(() => {
    if (!contracts || !Array.isArray(contracts)) return [];

    return contracts.map(contract => ({
      ...contract,
      riskAnalysis: getContractRisk(contract),
    }));
  }, [contracts, getContractRisk]);

  /**
   * Get contracts filtered by risk level
   */
  const getContractsByRisk = useCallback((maxRiskLevel = 'high') => {
    const riskOrder = ['low', 'medium', 'high', 'extreme'];
    const maxIndex = riskOrder.indexOf(maxRiskLevel);

    return analyzedContracts.filter(contract =>
      riskOrder.indexOf(contract.riskAnalysis.level) <= maxIndex
    );
  }, [analyzedContracts]);

  /**
   * Get safe contracts only (low to medium risk)
   */
  const safeContracts = useMemo(() =>
    getContractsByRisk('medium'),
  [getContractsByRisk]);

  /**
   * Get summary statistics
   */
  const statistics = useMemo(() => {
    if (!analyzedContracts.length) {
      return {
        total: 0,
        byRiskLevel: { low: 0, medium: 0, high: 0, extreme: 0 },
        totalValue: 0,
        avgProfit: 0,
        scamLikelyCount: 0,
      };
    }

    const byRiskLevel = { low: 0, medium: 0, high: 0, extreme: 0 };
    let totalProfit = 0;
    let scamLikelyCount = 0;

    analyzedContracts.forEach(contract => {
      byRiskLevel[contract.riskAnalysis.level]++;
      totalProfit += contract['Profit'] || contract['Profit (Current)'] || 0;
      if (contract.riskAnalysis.isScamLikely) scamLikelyCount++;
    });

    return {
      total: analyzedContracts.length,
      byRiskLevel,
      totalValue: totalProfit,
      avgProfit: totalProfit / analyzedContracts.length,
      scamLikelyCount,
      scamPercentage: (scamLikelyCount / analyzedContracts.length * 100).toFixed(1),
    };
  }, [analyzedContracts]);

  return {
    // Data
    contracts: analyzedContracts,
    safeContracts,
    statistics,

    // State
    loading,
    error,

    // Actions
    fetchContracts,
    getContractRisk,
    getContractsByRisk,

    // Constants
    RISK_LEVELS,
    SCAM_INDICATORS,
  };
}

export default useContractAnalysis;
