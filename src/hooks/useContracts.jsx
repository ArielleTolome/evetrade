import { useState, useCallback } from 'react';

const ESI_BASE_URL = 'https://esi.evetech.net/latest';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * EVE Online Contracts integration
 * Fetches and analyzes public contracts for profitable opportunities
 */
export function useContracts() {
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch public contracts for a region
   */
  const fetchRegionContracts = useCallback(async (regionId, page = 1) => {
    const cacheKey = `contracts_${regionId}_${page}`;
    const cached = cache[cacheKey];

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${ESI_BASE_URL}/contracts/public/${regionId}/?page=${page}`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`ESI Error: ${response.status}`);
      }

      const contracts = await response.json();
      const totalPages = parseInt(response.headers.get('x-pages') || '1');

      setCache(prev => ({
        ...prev,
        [cacheKey]: { data: { contracts, totalPages }, timestamp: Date.now() },
      }));

      return { contracts, totalPages };
    } catch (err) {
      console.warn(`Failed to fetch contracts for region ${regionId}:`, err);
      return { contracts: [], totalPages: 0 };
    }
  }, [cache]);

  /**
   * Fetch all contracts for a region (paginated)
   */
  const fetchAllRegionContracts = useCallback(async (regionId, maxPages = 5) => {
    setLoading(true);
    setError(null);

    try {
      const allContracts = [];
      let page = 1;
      let totalPages = 1;

      while (page <= Math.min(totalPages, maxPages)) {
        const result = await fetchRegionContracts(regionId, page);
        allContracts.push(...result.contracts);
        totalPages = result.totalPages;
        page++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return allContracts;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchRegionContracts]);

  /**
   * Fetch contract items (for item exchange contracts)
   */
  const fetchContractItems = useCallback(async (contractId, regionId) => {
    const cacheKey = `contract_items_${contractId}`;
    const cached = cache[cacheKey];

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${ESI_BASE_URL}/contracts/public/items/${contractId}/?region_id=${regionId}`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );

      if (!response.ok) {
        return [];
      }

      const items = await response.json();

      setCache(prev => ({
        ...prev,
        [cacheKey]: { data: items, timestamp: Date.now() },
      }));

      return items;
    } catch {
      return [];
    }
  }, [cache]);

  /**
   * Analyze courier contracts for profitability
   */
  const analyzeCourierContracts = useCallback((contracts, options = {}) => {
    const {
      minReward = 0,
      maxCollateral = Infinity,
      maxVolume = Infinity,
      minIskPerJump = 0,
      minIskPerM3 = 0,
    } = options;

    return contracts
      .filter(c => c.type === 'courier')
      .filter(c => c.reward >= minReward)
      .filter(c => c.collateral <= maxCollateral)
      .filter(c => c.volume <= maxVolume)
      .map(contract => {
        // Estimate jumps (would need route calculation for accuracy)
        const estimatedJumps = 10; // Placeholder

        const iskPerJump = contract.reward / estimatedJumps;
        const iskPerM3 = contract.volume > 0 ? contract.reward / contract.volume : 0;
        const collateralRatio = contract.collateral > 0
          ? (contract.reward / contract.collateral) * 100
          : 0;

        return {
          ...contract,
          iskPerJump,
          iskPerM3,
          collateralRatio,
          estimatedJumps,
          profitability: calculateCourierProfitability(contract),
        };
      })
      .filter(c => c.iskPerJump >= minIskPerJump)
      .filter(c => c.iskPerM3 >= minIskPerM3)
      .sort((a, b) => b.iskPerJump - a.iskPerJump);
  }, []);

  /**
   * Calculate courier contract profitability score
   */
  const calculateCourierProfitability = (contract) => {
    let score = 0;

    // High reward is good
    if (contract.reward >= 50000000) score += 30;
    else if (contract.reward >= 20000000) score += 20;
    else if (contract.reward >= 10000000) score += 10;

    // Low collateral is good
    if (contract.collateral <= 100000000) score += 20;
    else if (contract.collateral <= 500000000) score += 10;

    // Small volume is easier
    if (contract.volume <= 10000) score += 20;
    else if (contract.volume <= 50000) score += 10;

    // Long expiration is good
    const daysToExpire = contract.days_to_complete || 3;
    if (daysToExpire >= 7) score += 10;
    else if (daysToExpire >= 3) score += 5;

    return Math.min(score, 100);
  };

  /**
   * Analyze item exchange contracts for profit
   */
  const analyzeItemExchangeContracts = useCallback(async (contracts, regionId, marketPrices = {}) => {
    const itemExchanges = contracts.filter(c => c.type === 'item_exchange');
    const analyzed = [];

    for (const contract of itemExchanges.slice(0, 50)) { // Limit for performance
      try {
        const items = await fetchContractItems(contract.contract_id, regionId);

        if (items.length === 0) continue;

        // Calculate total market value of items
        let totalMarketValue = 0;
        const itemDetails = [];

        for (const item of items) {
          const price = marketPrices[item.type_id] || 0;
          const value = price * item.quantity;
          totalMarketValue += value;
          itemDetails.push({
            typeId: item.type_id,
            quantity: item.quantity,
            price,
            value,
          });
        }

        // Calculate profit
        const profit = totalMarketValue - contract.price;
        const profitPercent = contract.price > 0
          ? (profit / contract.price) * 100
          : 0;

        analyzed.push({
          ...contract,
          items: itemDetails,
          totalMarketValue,
          profit,
          profitPercent,
          itemCount: items.length,
        });
      } catch {
        // Skip contracts that fail to fetch
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return analyzed
      .filter(c => c.profit > 0)
      .sort((a, b) => b.profit - a.profit);
  }, [fetchContractItems]);

  /**
   * Find underpriced contracts
   */
  const findUnderpricedContracts = useCallback((analyzedContracts, options = {}) => {
    const {
      minProfitPercent = 10,
      minProfit = 1000000,
      maxPrice = Infinity,
    } = options;

    return analyzedContracts
      .filter(c => c.profitPercent >= minProfitPercent)
      .filter(c => c.profit >= minProfit)
      .filter(c => c.price <= maxPrice)
      .sort((a, b) => b.profitPercent - a.profitPercent);
  }, []);

  /**
   * Get contract type label
   */
  const getContractTypeLabel = (type) => {
    const labels = {
      item_exchange: 'Item Exchange',
      courier: 'Courier',
      auction: 'Auction',
      loan: 'Loan',
    };
    return labels[type] || type;
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

  /**
   * Format volume
   */
  const formatVolume = (volume) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M m³`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K m³`;
    return `${volume.toLocaleString()} m³`;
  };

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  return {
    // State
    loading,
    error,

    // Fetch methods
    fetchRegionContracts,
    fetchAllRegionContracts,
    fetchContractItems,

    // Analysis methods
    analyzeCourierContracts,
    analyzeItemExchangeContracts,
    findUnderpricedContracts,

    // Utilities
    getContractTypeLabel,
    formatISK,
    formatVolume,
    clearCache,
  };
}

export default useContracts;
