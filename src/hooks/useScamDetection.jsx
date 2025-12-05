import { useMemo, useCallback } from 'react';

/**
 * Scam Detection Hook for EVE Online Market Trades
 *
 * This hook detects potential market manipulation and scam trades based on:
 * - Volume patterns (single unit trades, abnormally low volumes)
 * - Margin anomalies (margins that are too good to be true)
 * - Price spreads (extreme differences between buy and sell)
 * - Market depth comparisons
 *
 * @example
 * ```jsx
 * const { calculateScamRisk, isLikelyScam, getScamWarnings } = useScamDetection();
 * const risk = calculateScamRisk(trade, allTrades);
 * // risk = { score: 65, reasons: [...], level: 'high' }
 * ```
 */
export function useScamDetection(options = {}) {
  // Configurable thresholds with sensible defaults
  const config = useMemo(() => ({
    // Volume thresholds
    singleVolumePoints: options.singleVolumePoints ?? 60,
    veryLowVolumePoints: options.veryLowVolumePoints ?? 30,
    lowVolumePoints: options.lowVolumePoints ?? 10,
    veryLowVolumeThreshold: options.veryLowVolumeThreshold ?? 5,
    lowVolumeThreshold: options.lowVolumeThreshold ?? 20,

    // Margin thresholds
    extremeMarginPoints: options.extremeMarginPoints ?? 25,
    veryHighMarginPoints: options.veryHighMarginPoints ?? 15,
    extremeMarginThreshold: options.extremeMarginThreshold ?? 50,
    veryHighMarginThreshold: options.veryHighMarginThreshold ?? 40,

    // Price spread thresholds
    extremeSpreadPoints: options.extremeSpreadPoints ?? 20,
    extremeSpreadMultiplier: options.extremeSpreadMultiplier ?? 10,

    // Market comparison thresholds
    volumeDeviationPoints: options.volumeDeviationPoints ?? 15,
    volumeDeviationRatio: options.volumeDeviationRatio ?? 0.1,
    minMarketSampleSize: options.minMarketSampleSize ?? 100,

    // Risk level thresholds
    extremeRiskThreshold: options.extremeRiskThreshold ?? 70,
    highRiskThreshold: options.highRiskThreshold ?? 50,
    mediumRiskThreshold: options.mediumRiskThreshold ?? 30,

    // Scam determination threshold
    scamThreshold: options.scamThreshold ?? 50,
  }), [options]);

  /**
   * Safely extract numeric value from trade data
   * Handles both object notation ('Buy Price') and camelCase (buyPrice)
   * @private
   */
  const extractValue = useCallback((trade, key, alternatives = [], defaultValue = 0) => {
    if (!trade) return defaultValue;

    // Try primary key
    if (trade[key] !== undefined && trade[key] !== null) {
      const value = parseFloat(trade[key]);
      return isNaN(value) ? defaultValue : value;
    }

    // Try alternative keys
    for (const alt of alternatives) {
      if (trade[alt] !== undefined && trade[alt] !== null) {
        const value = parseFloat(trade[alt]);
        return isNaN(value) ? defaultValue : value;
      }
    }

    return defaultValue;
  }, []);

  /**
   * Calculate scam risk score for a trade
   *
   * @param {Object} trade - The trade object to analyze
   * @param {Array} [allTrades=[]] - All trades in the market for comparison
   * @returns {Object} Risk assessment with score (0-100), reasons array, and level
   *
   * @example
   * ```jsx
   * const risk = calculateScamRisk(trade, allTrades);
   * // Returns: {
   * //   score: 65,
   * //   reasons: ['Single item volume - classic scam indicator', ...],
   * //   level: 'high'
   * // }
   * ```
   */
  const calculateScamRisk = useCallback((trade, allTrades = []) => {
    if (!trade) {
      return { score: 0, reasons: ['Invalid trade data'], level: 'low' };
    }

    let score = 0;
    const reasons = [];

    // Extract trade data with fallbacks
    const volume = extractValue(trade, 'Volume', ['volume', 'Vol']);
    const margin = extractValue(trade, 'Gross Margin', ['margin', 'grossMargin']);
    const buyPrice = extractValue(trade, 'Buy Price', ['buyPrice', 'buy']);
    const _sellPrice = extractValue(trade, 'Sell Price', ['sellPrice', 'sell']);
    const netProfit = extractValue(trade, 'Net Profit', ['netProfit', 'profit']);

    // Validate extracted data
    if (volume === 0 && margin === 0 && buyPrice === 0 && sellPrice === 0) {
      return { score: 0, reasons: ['Insufficient data for analysis'], level: 'low' };
    }

    // === VOLUME ANALYSIS ===
    // Single volume trades are the most common scam pattern in EVE
    if (volume === 1) {
      score += config.singleVolumePoints;
      reasons.push('Single item volume - classic scam indicator');
    } else if (volume > 1 && volume <= config.veryLowVolumeThreshold) {
      score += config.veryLowVolumePoints;
      reasons.push(`Very low volume (${volume} units) - limited market activity`);
    } else if (volume > config.veryLowVolumeThreshold && volume <= config.lowVolumeThreshold) {
      score += config.lowVolumePoints;
      reasons.push(`Low volume trade (${volume} units)`);
    }

    // === MARGIN ANALYSIS ===
    // Suspiciously high margins often indicate manipulation
    if (margin > config.extremeMarginThreshold) {
      score += config.extremeMarginPoints;
      reasons.push(`Margin over ${config.extremeMarginThreshold}% - too good to be true`);
    } else if (margin > config.veryHighMarginThreshold) {
      score += config.veryHighMarginPoints;
      reasons.push(`Very high margin (${margin.toFixed(1)}%) - verify carefully`);
    }

    // === PRICE SPREAD ANALYSIS ===
    // Extreme price differences can indicate fake arbitrage opportunities
    if (buyPrice > 0 && sellPrice > buyPrice * config.extremeSpreadMultiplier) {
      score += config.extremeSpreadPoints;
      reasons.push('Extreme price spread - possible manipulation');
    }

    // === PROFIT QUALITY ANALYSIS ===
    // High profit with low volume is a red flag
    if (netProfit > 10000000 && volume <= 5) {
      score += 10;
      reasons.push('High profit on very low volume - suspicious combination');
    }

    // === MARKET COMPARISON ANALYSIS ===
    // Compare with market averages if sufficient data is available
    if (allTrades && Array.isArray(allTrades) && allTrades.length > 0) {
      // Calculate average volume across all trades
      const validTrades = allTrades.filter(t => {
        const v = extractValue(t, 'Volume', ['volume', 'Vol']);
        return v > 0 && !isNaN(v);
      });

      if (validTrades.length > 0) {
        const totalVolume = validTrades.reduce((sum, t) => {
          return sum + extractValue(t, 'Volume', ['volume', 'Vol']);
        }, 0);
        const avgVolume = totalVolume / validTrades.length;

        // Flag if volume is far below average and market has high liquidity
        if (avgVolume > config.minMarketSampleSize &&
            volume < avgVolume * config.volumeDeviationRatio) {
          score += config.volumeDeviationPoints;
          reasons.push(`Volume far below market average (${Math.round(avgVolume)} avg)`);
        }
      }

      // Check for outlier margins
      const validMargins = allTrades
        .map(t => extractValue(t, 'Gross Margin', ['margin', 'grossMargin']))
        .filter(m => m > 0 && !isNaN(m));

      if (validMargins.length > 10) {
        const avgMargin = validMargins.reduce((a, b) => a + b, 0) / validMargins.length;
        const stdDev = Math.sqrt(
          validMargins.reduce((sum, m) => sum + Math.pow(m - avgMargin, 2), 0) / validMargins.length
        );

        // Flag if margin is more than 2 standard deviations above average
        if (margin > avgMargin + (2 * stdDev) && stdDev > 0) {
          score += 10;
          reasons.push(`Margin significantly above market average (${avgMargin.toFixed(1)}% avg)`);
        }
      }
    }

    // === DETERMINE RISK LEVEL ===
    let level = 'low';
    if (score >= config.extremeRiskThreshold) {
      level = 'extreme';
    } else if (score >= config.highRiskThreshold) {
      level = 'high';
    } else if (score >= config.mediumRiskThreshold) {
      level = 'medium';
    }

    // Cap score at 100
    const finalScore = Math.min(score, 100);

    return {
      score: finalScore,
      reasons,
      level,
      metadata: {
        volume,
        margin,
        buyPrice,
        sellPrice,
        netProfit,
      }
    };
  }, [config, extractValue]);

  /**
   * Determine if a trade is likely a scam
   *
   * @param {Object} trade - The trade object to analyze
   * @param {Array} [allTrades=[]] - All trades in the market for comparison
   * @returns {boolean} True if the trade is likely a scam
   *
   * @example
   * ```jsx
   * if (isLikelyScam(trade, allTrades)) {
   *   console.warn('This trade appears to be a scam!');
   * }
   * ```
   */
  const isLikelyScam = useCallback((trade, allTrades = []) => {
    const { score } = calculateScamRisk(trade, allTrades);
    return score >= config.scamThreshold;
  }, [calculateScamRisk, config.scamThreshold]);

  /**
   * Get array of warning messages for a trade
   *
   * @param {Object} trade - The trade object to analyze
   * @param {Array} [allTrades=[]] - All trades in the market for comparison
   * @returns {Array<string>} Array of warning messages
   *
   * @example
   * ```jsx
   * const warnings = getScamWarnings(trade, allTrades);
   * warnings.forEach(warning => console.warn(warning));
   * ```
   */
  const getScamWarnings = useCallback((trade, allTrades = []) => {
    const { reasons } = calculateScamRisk(trade, allTrades);
    return reasons;
  }, [calculateScamRisk]);

  /**
   * Get detailed risk assessment with recommendations
   *
   * @param {Object} trade - The trade object to analyze
   * @param {Array} [allTrades=[]] - All trades in the market for comparison
   * @returns {Object} Detailed risk assessment with recommendations
   */
  const getDetailedAssessment = useCallback((trade, allTrades = []) => {
    const risk = calculateScamRisk(trade, allTrades);

    const recommendations = [];

    if (risk.level === 'extreme') {
      recommendations.push('DO NOT TRADE - Extremely high scam probability');
      recommendations.push('This trade shows multiple red flags');
      recommendations.push('Report to alliance/coalition if suspicious');
    } else if (risk.level === 'high') {
      recommendations.push('CAUTION - High scam risk detected');
      recommendations.push('Verify item authenticity in-game before trading');
      recommendations.push('Check market history and price trends');
    } else if (risk.level === 'medium') {
      recommendations.push('Proceed with caution');
      recommendations.push('Double-check item details and market depth');
      recommendations.push('Consider waiting for better opportunities');
    } else {
      recommendations.push('Trade appears relatively safe');
      recommendations.push('Always verify before large transactions');
    }

    return {
      ...risk,
      recommendations,
      summary: `${risk.level.toUpperCase()} RISK (${risk.score}/100)`,
    };
  }, [calculateScamRisk]);

  /**
   * Detect advanced scam patterns beyond simple volume=1
   * These patterns are based on common EVE Online market manipulation tactics
   *
   * @param {Object} trade - The trade object to analyze
   * @param {Array} [allTrades=[]] - All trades for context
   * @returns {Object} Advanced pattern detection results
   */
  const detectAdvancedPatterns = useCallback((trade, allTrades = []) => {
    const patterns = [];
    let additionalScore = 0;

    const volume = extractValue(trade, 'Volume', ['volume', 'Vol']);
    const margin = extractValue(trade, 'Gross Margin', ['margin', 'grossMargin']);
    const buyPrice = extractValue(trade, 'Buy Price', ['buyPrice', 'buy']);
    const _sellPrice = extractValue(trade, 'Sell Price', ['sellPrice', 'sell']);
    const netProfit = extractValue(trade, 'Net Profit', ['netProfit', 'profit']);
    const itemName = trade['Item'] || trade.item || trade.name || '';

    // === PATTERN 1: Round number manipulation ===
    // Scammers often use very round prices
    if (buyPrice > 0 && buyPrice === Math.round(buyPrice / 1000000) * 1000000) {
      if (buyPrice >= 100000000) { // 100M+ ISK items
        patterns.push({
          type: 'round_price',
          severity: 'medium',
          message: 'Suspiciously round buy price (possible price manipulation)',
        });
        additionalScore += 5;
      }
    }

    // === PATTERN 2: BPC vs BPO confusion ===
    // Common scam where Blueprint Copy is sold at BPO prices
    if (itemName.toLowerCase().includes('blueprint')) {
      patterns.push({
        type: 'blueprint_warning',
        severity: 'high',
        message: 'Blueprint detected - verify BPO vs BPC in-game before buying',
      });
      additionalScore += 15;

      // Extra warning if margin is high
      if (margin > 30) {
        patterns.push({
          type: 'blueprint_high_margin',
          severity: 'extreme',
          message: 'High margin blueprint - very likely BPC sold as BPO scam',
        });
        additionalScore += 25;
      }
    }

    // === PATTERN 3: Faction item confusion ===
    // Common scam where cheaper variants are sold at faction prices
    const factionPatterns = [
      { pattern: /federation navy/i, faction: 'Federation Navy' },
      { pattern: /republic fleet/i, faction: 'Republic Fleet' },
      { pattern: /imperial navy/i, faction: 'Imperial Navy' },
      { pattern: /caldari navy/i, faction: 'Caldari Navy' },
      { pattern: /true sansha/i, faction: 'True Sansha' },
      { pattern: /dark blood/i, faction: 'Dark Blood' },
      { pattern: /shadow serpentis/i, faction: 'Shadow Serpentis' },
      { pattern: /dread guristas/i, faction: 'Dread Guristas' },
      { pattern: /domination/i, faction: 'Domination' },
      { pattern: /officer/i, faction: 'Officer' },
    ];

    for (const { pattern, faction } of factionPatterns) {
      if (pattern.test(itemName)) {
        patterns.push({
          type: 'faction_item',
          severity: 'medium',
          message: `${faction} item - verify exact variant matches expected type`,
        });
        additionalScore += 8;
        break;
      }
    }

    // === PATTERN 4: SKIN manipulation ===
    // SKINs often have confusing names and volatile prices
    if (/skin|nanocoating/i.test(itemName)) {
      patterns.push({
        type: 'skin_warning',
        severity: 'medium',
        message: 'SKIN item - prices can be highly volatile and manipulated',
      });
      additionalScore += 8;

      if (margin > 40) {
        patterns.push({
          type: 'skin_high_margin',
          severity: 'high',
          message: 'High margin SKIN - likely overpriced or manipulated market',
        });
        additionalScore += 15;
      }
    }

    // === PATTERN 5: Implant set confusion ===
    // High-grade vs Mid-grade implant sets
    if (/implant|omega|alpha|beta|gamma|delta|epsilon/i.test(itemName)) {
      if (/high-grade|mid-grade|low-grade/i.test(itemName)) {
        patterns.push({
          type: 'implant_set',
          severity: 'medium',
          message: 'Implant set item - verify grade (High/Mid/Low) matches expected',
        });
        additionalScore += 10;
      }
    }

    // === PATTERN 6: Suspicious profit-to-volume ratio ===
    // Very high profit on low volume is classic manipulation
    const profitPerUnit = volume > 0 ? netProfit / volume : 0;
    if (profitPerUnit > 50000000 && volume <= 3) { // >50M ISK profit per unit on <=3 units
      patterns.push({
        type: 'profit_volume_mismatch',
        severity: 'high',
        message: `Extreme profit per unit (${Math.round(profitPerUnit / 1000000)}M ISK) on very low volume`,
      });
      additionalScore += 20;
    }

    // === PATTERN 7: Price volatility detection ===
    // If we have historical context, check for recent price spikes
    if (allTrades.length >= 10) {
      const pricesInMarket = allTrades
        .map(t => extractValue(t, 'Buy Price', ['buyPrice', 'buy']))
        .filter(p => p > 0);

      if (pricesInMarket.length > 0) {
        const avgPrice = pricesInMarket.reduce((a, b) => a + b, 0) / pricesInMarket.length;
        const priceDeviation = Math.abs(buyPrice - avgPrice) / avgPrice;

        if (priceDeviation > 0.5) { // 50%+ deviation from average
          patterns.push({
            type: 'price_anomaly',
            severity: 'high',
            message: `Price deviates ${Math.round(priceDeviation * 100)}% from market average`,
          });
          additionalScore += 15;
        }
      }
    }

    // === PATTERN 8: Station trading margin spike ===
    // Normal station trading margins are 5-15%, anything over 30% is suspicious
    if (margin > 30 && margin < 50) {
      patterns.push({
        type: 'margin_spike',
        severity: 'medium',
        message: 'Margin significantly above normal trading range (5-15%)',
      });
      additionalScore += 8;
    }

    // === PATTERN 9: Very old order detection hint ===
    // Orders that have been sitting for a long time at extreme prices
    if (volume === 1 && margin > 40) {
      patterns.push({
        type: 'stale_order',
        severity: 'high',
        message: 'Single unit at high margin - likely a stale manipulation order',
      });
      additionalScore += 20;
    }

    // === PATTERN 10: Combined risk factors ===
    // Multiple minor issues compound into major concern
    const minorPatterns = patterns.filter(p => p.severity === 'medium').length;
    if (minorPatterns >= 3) {
      patterns.push({
        type: 'compound_risk',
        severity: 'high',
        message: 'Multiple risk factors detected - proceed with extreme caution',
      });
      additionalScore += 15;
    }

    return {
      patterns,
      additionalScore: Math.min(additionalScore, 40), // Cap at 40 to prevent over-scoring
      hasAdvancedWarnings: patterns.length > 0,
      hasCriticalWarnings: patterns.some(p => p.severity === 'extreme'),
    };
  }, [extractValue]);

  /**
   * Enhanced scam risk calculation including advanced patterns
   *
   * @param {Object} trade - The trade object to analyze
   * @param {Array} [allTrades=[]] - All trades for context
   * @returns {Object} Complete risk assessment
   */
  const calculateEnhancedScamRisk = useCallback((trade, allTrades = []) => {
    // Get base risk assessment
    const baseRisk = calculateScamRisk(trade, allTrades);

    // Get advanced pattern detection
    const advancedPatterns = detectAdvancedPatterns(trade, allTrades);

    // Combine scores
    const totalScore = Math.min(baseRisk.score + advancedPatterns.additionalScore, 100);

    // Recalculate level based on combined score
    let level = 'low';
    if (totalScore >= config.extremeRiskThreshold) {
      level = 'extreme';
    } else if (totalScore >= config.highRiskThreshold) {
      level = 'high';
    } else if (totalScore >= config.mediumRiskThreshold) {
      level = 'medium';
    }

    // Combine all warnings
    const allReasons = [
      ...baseRisk.reasons,
      ...advancedPatterns.patterns.map(p => p.message),
    ];

    return {
      score: totalScore,
      reasons: allReasons,
      level,
      metadata: baseRisk.metadata,
      advancedPatterns: advancedPatterns.patterns,
      hasAdvancedWarnings: advancedPatterns.hasAdvancedWarnings,
      hasCriticalWarnings: advancedPatterns.hasCriticalWarnings,
    };
  }, [calculateScamRisk, detectAdvancedPatterns, config]);

  /**
   * Batch analyze multiple trades and return sorted by risk
   *
   * @param {Array} trades - Array of trade objects to analyze
   * @returns {Array} Trades sorted by risk score (highest first) with risk data attached
   */
  const analyzeAll = useCallback((trades) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return [];
    }

    return trades
      .map(trade => ({
        ...trade,
        scamRisk: calculateEnhancedScamRisk(trade, trades),
      }))
      .sort((a, b) => b.scamRisk.score - a.scamRisk.score);
  }, [calculateEnhancedScamRisk]);

  /**
   * Get statistics about scam prevalence in a trade set
   *
   * @param {Array} trades - Array of trade objects
   * @returns {Object} Statistics about scam risk in the dataset
   */
  const getScamStatistics = useCallback((trades) => {
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      return {
        total: 0,
        extremeRisk: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        averageScore: 0,
      };
    }

    const risks = trades.map(t => calculateScamRisk(t, trades));

    return {
      total: trades.length,
      extremeRisk: risks.filter(r => r.level === 'extreme').length,
      highRisk: risks.filter(r => r.level === 'high').length,
      mediumRisk: risks.filter(r => r.level === 'medium').length,
      lowRisk: risks.filter(r => r.level === 'low').length,
      averageScore: risks.reduce((sum, r) => sum + r.score, 0) / risks.length,
    };
  }, [calculateScamRisk]);

  return {
    calculateScamRisk,
    calculateEnhancedScamRisk, // New: includes advanced pattern detection
    detectAdvancedPatterns, // New: standalone advanced pattern detection
    isLikelyScam,
    getScamWarnings,
    getDetailedAssessment,
    analyzeAll,
    getScamStatistics,
    config, // Expose config for transparency
  };
}

export default useScamDetection;
