import { useState, useCallback, useMemo } from 'react';

/**
 * Undercut Detection Hook
 * Monitors character orders and detects when they've been undercut by competitors
 *
 * @returns {Object} Hook state and functions
 */
export function useUndercutDetection() {
  const [undercutOrders, setUndercutOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check if character orders have been undercut
   * @param {Array} characterOrders - Array of character's active orders from ESI
   * @param {Array} marketOrders - Array of all market orders for the same items/regions
   * @returns {Array} Array of undercut orders with details
   */
  const checkOrders = useCallback(async (characterOrders, marketOrders) => {
    if (!characterOrders || !Array.isArray(characterOrders) || characterOrders.length === 0) {
      setUndercutOrders([]);
      return [];
    }

    if (!marketOrders || !Array.isArray(marketOrders) || marketOrders.length === 0) {
      setError({ message: 'No market orders provided for comparison' });
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const undercuts = [];

      // Process each character order
      for (const order of characterOrders) {
        // Filter market orders for the same item and location
        const relevantMarketOrders = marketOrders.filter(
          mo => mo.type_id === order.type_id &&
                mo.location_id === order.location_id &&
                mo.order_id !== order.order_id // Exclude the character's own order
        );

        if (relevantMarketOrders.length === 0) {
          continue; // No competition for this order
        }

        const isBuyOrder = order.is_buy_order;
        let isUndercut = false;
        let betterOrders = [];
        let bestCompetitorPrice = null;

        if (isBuyOrder) {
          // For buy orders: Check if there are higher buy orders (you've been outbid)
          const competitorBuyOrders = relevantMarketOrders
            .filter(mo => mo.is_buy_order)
            .sort((a, b) => b.price - a.price); // Sort by price descending

          // Find orders with better prices than ours
          betterOrders = competitorBuyOrders.filter(mo => mo.price > order.price);

          if (betterOrders.length > 0) {
            isUndercut = true;
            bestCompetitorPrice = betterOrders[0].price;
          }
        } else {
          // For sell orders: Check if there are lower sell orders (you've been undercut)
          const competitorSellOrders = relevantMarketOrders
            .filter(mo => !mo.is_buy_order)
            .sort((a, b) => a.price - b.price); // Sort by price ascending

          // Find orders with better prices than ours
          betterOrders = competitorSellOrders.filter(mo => mo.price < order.price);

          if (betterOrders.length > 0) {
            isUndercut = true;
            bestCompetitorPrice = betterOrders[0].price;
          }
        }

        if (isUndercut) {
          // Calculate undercut details
          const undercutBy = Math.abs(order.price - bestCompetitorPrice);
          const undercutPercent = (undercutBy / order.price) * 100;
          const competitorCount = betterOrders.length;

          // Calculate recommended price (0.01 ISK better than best competitor)
          const recommendedPrice = isBuyOrder
            ? bestCompetitorPrice + 0.01
            : bestCompetitorPrice - 0.01;

          // Calculate potential profit impact
          const volumeRemaining = order.volume_remain;
          const profitLoss = undercutBy * volumeRemaining;

          const undercutOrder = {
            ...order,
            isUndercut: true,
            isBuyOrder,
            undercutBy,
            undercutPercent,
            competitorCount,
            bestCompetitorPrice,
            recommendedPrice,
            volumeRemaining,
            profitLoss,
            detectedAt: new Date().toISOString(),
          };

          undercuts.push(undercutOrder);
        }
      }

      setUndercutOrders(undercuts);
      setLoading(false);
      return undercuts;
    } catch (err) {
      const errorMessage = err.message || 'Failed to check for undercuts';
      setError({ message: errorMessage, original: err });
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Get the amount by which an order was undercut
   * @param {Object} order - Order object with undercut data
   * @returns {number} Amount undercut by in ISK
   */
  const getUndercutAmount = useCallback((order) => {
    if (!order || !order.isUndercut) {
      return 0;
    }
    return order.undercutBy || 0;
  }, []);

  /**
   * Get recommended price to become competitive again
   * @param {Object} order - Order object with undercut data
   * @param {Array} marketOrders - Current market orders (optional, for recalculation)
   * @returns {number} Recommended price in ISK
   */
  const getRecommendedPrice = useCallback((order, marketOrders = null) => {
    if (!order) {
      return 0;
    }

    // If we have cached recommendation, return it
    if (order.recommendedPrice && !marketOrders) {
      return order.recommendedPrice;
    }

    // Recalculate if market orders are provided
    if (marketOrders && Array.isArray(marketOrders)) {
      const relevantOrders = marketOrders.filter(
        mo => mo.type_id === order.type_id &&
              mo.location_id === order.location_id &&
              mo.order_id !== order.order_id
      );

      if (order.is_buy_order || order.isBuyOrder) {
        const competitorBuyOrders = relevantOrders
          .filter(mo => mo.is_buy_order)
          .sort((a, b) => b.price - a.price);

        if (competitorBuyOrders.length > 0) {
          return competitorBuyOrders[0].price + 0.01;
        }
      } else {
        const competitorSellOrders = relevantOrders
          .filter(mo => !mo.is_buy_order)
          .sort((a, b) => a.price - b.price);

        if (competitorSellOrders.length > 0) {
          return competitorSellOrders[0].price - 0.01;
        }
      }
    }

    // Default to current price if no better calculation is possible
    return order.price || 0;
  }, []);

  /**
   * Calculate optimal price based on strategy
   * @param {Object} order - Character's order
   * @param {Array} marketOrders - All market orders for the item
   * @param {string} strategy - Pricing strategy: 'aggressive', 'moderate', 'conservative'
   * @returns {Object} Pricing recommendation with details
   */
  const calculateOptimalPrice = useCallback((order, marketOrders, strategy = 'aggressive') => {
    if (!order || !marketOrders || !Array.isArray(marketOrders)) {
      return {
        price: order?.price || 0,
        strategy: 'none',
        reason: 'Insufficient data',
      };
    }

    const isBuyOrder = order.is_buy_order || order.isBuyOrder;

    // Filter relevant market orders
    const relevantOrders = marketOrders.filter(
      mo => mo.type_id === order.type_id &&
            mo.location_id === order.location_id &&
            mo.order_id !== order.order_id
    );

    if (relevantOrders.length === 0) {
      return {
        price: order.price,
        strategy: 'maintain',
        reason: 'No competition - maintain current price',
      };
    }

    // Separate and sort orders
    let competitorOrders;
    if (isBuyOrder) {
      competitorOrders = relevantOrders
        .filter(mo => mo.is_buy_order)
        .sort((a, b) => b.price - a.price);
    } else {
      competitorOrders = relevantOrders
        .filter(mo => !mo.is_buy_order)
        .sort((a, b) => a.price - b.price);
    }

    if (competitorOrders.length === 0) {
      return {
        price: order.price,
        strategy: 'maintain',
        reason: 'No competition in order type - maintain current price',
      };
    }

    const bestPrice = competitorOrders[0].price;
    let recommendedPrice;
    let reason;

    switch (strategy) {
      case 'aggressive':
        // Beat best price by 0.01 ISK
        if (isBuyOrder) {
          recommendedPrice = bestPrice + 0.01;
          reason = 'Aggressive: Outbid best buy order by 0.01 ISK';
        } else {
          recommendedPrice = Math.max(0.01, bestPrice - 0.01);
          reason = 'Aggressive: Undercut best sell order by 0.01 ISK';
        }
        break;

      case 'moderate':
        // Match best price
        recommendedPrice = bestPrice;
        reason = 'Moderate: Match best price (timestamp priority)';
        break;

      case 'conservative':
        // Stay within top 5 orders
        const top5Index = Math.min(4, competitorOrders.length - 1);
        const top5Price = competitorOrders[top5Index].price;

        if (isBuyOrder) {
          // For buy orders, be at least as good as 5th best
          recommendedPrice = Math.max(top5Price, order.price);
          reason = 'Conservative: Match top 5 buy orders';
        } else {
          // For sell orders, be at least as good as 5th best
          recommendedPrice = Math.min(top5Price, order.price);
          reason = 'Conservative: Match top 5 sell orders';
        }
        break;

      default:
        recommendedPrice = order.price;
        reason = 'Unknown strategy - maintaining current price';
    }

    // Calculate price change
    const priceChange = recommendedPrice - order.price;
    const priceChangePercent = (priceChange / order.price) * 100;

    // Calculate potential impact
    const volumeImpact = order.volume_remain * Math.abs(priceChange);

    return {
      price: recommendedPrice,
      strategy,
      reason,
      currentPrice: order.price,
      priceChange,
      priceChangePercent,
      volumeImpact,
      competitorCount: competitorOrders.length,
      bestCompetitorPrice: bestPrice,
      isImprovement: isBuyOrder ? priceChange > 0 : priceChange < 0,
    };
  }, []);

  /**
   * Get summary statistics of undercut orders
   */
  const undercutStats = useMemo(() => {
    if (!undercutOrders || undercutOrders.length === 0) {
      return {
        total: 0,
        buyOrders: 0,
        sellOrders: 0,
        totalPotentialLoss: 0,
        averageUndercutPercent: 0,
        mostUndercutOrder: null,
      };
    }

    const buyOrders = undercutOrders.filter(o => o.isBuyOrder).length;
    const sellOrders = undercutOrders.filter(o => !o.isBuyOrder).length;
    const totalPotentialLoss = undercutOrders.reduce((sum, o) => sum + (o.profitLoss || 0), 0);
    const averageUndercutPercent = undercutOrders.reduce((sum, o) => sum + (o.undercutPercent || 0), 0) / undercutOrders.length;

    // Find most undercut order (by percentage)
    const mostUndercutOrder = undercutOrders.reduce((worst, current) => {
      if (!worst || (current.undercutPercent || 0) > (worst.undercutPercent || 0)) {
        return current;
      }
      return worst;
    }, null);

    return {
      total: undercutOrders.length,
      buyOrders,
      sellOrders,
      totalPotentialLoss,
      averageUndercutPercent,
      mostUndercutOrder,
    };
  }, [undercutOrders]);

  /**
   * Clear undercut orders
   */
  const clearUndercutOrders = useCallback(() => {
    setUndercutOrders([]);
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setUndercutOrders([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    undercutOrders,
    undercutStats,
    loading,
    error,
    checkOrders,
    getUndercutAmount,
    getRecommendedPrice,
    calculateOptimalPrice,
    clearUndercutOrders,
    reset,
  };
}

export default useUndercutDetection;
