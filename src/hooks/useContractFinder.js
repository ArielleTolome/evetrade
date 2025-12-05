import { useCallback, useMemo } from 'react';
import { useApiCall } from './useApiCall';
import { apiClient } from '../api/client';

/**
 * Fetch contract opportunities from the API
 * @param {object} params - Query parameters
 * @param {AbortSignal} signal - Abort signal for cancellation
 * @returns {Promise<Array>} Contract opportunities
 */
async function fetchContracts(params, signal) {
  const queryParams = new URLSearchParams();

  if (params.regionId) queryParams.append('regionId', params.regionId);
  if (params.contractType) queryParams.append('contractType', params.contractType);
  if (params.minProfit) queryParams.append('minProfit', params.minProfit);
  if (params.maxCollateral) queryParams.append('maxCollateral', params.maxCollateral);
  if (params.maxVolume) queryParams.append('maxVolume', params.maxVolume);
  if (params.minRewardPerJump) queryParams.append('minRewardPerJump', params.minRewardPerJump);

  const response = await apiClient.get(`/contracts?${queryParams.toString()}`, {
    signal,
  });

  return response.data;
}

/**
 * Custom hook for finding profitable contract opportunities
 * @returns {object} Contract finder state and methods
 */
export function useContractFinder() {
  const { data, loading, error, lastUpdated, execute, reset, cancel } = useApiCall(fetchContracts);

  /**
   * Search for contract opportunities
   */
  const search = useCallback(
    async (params) => {
      try {
        return await execute(params);
      } catch (err) {
        console.error('Contract search failed:', err);
        throw err;
      }
    },
    [execute]
  );

  /**
   * Filter contracts by type
   */
  const filterByType = useCallback(
    (type) => {
      if (!data) return [];
      if (type === 'all') return data;
      return data.filter((contract) => contract.Type === type);
    },
    [data]
  );

  /**
   * Sort contracts by profitability metrics
   */
  const sortByProfitability = useCallback(
    (contracts, sortBy = 'profit') => {
      if (!contracts || contracts.length === 0) return [];

      const sorted = [...contracts];

      switch (sortBy) {
        case 'profit':
          // Sort by Profit, Profit (Current), or ISK/Jump
          sorted.sort((a, b) => {
            const profitA = a.Profit || a['Profit (Current)'] || a['ISK/Jump'] || 0;
            const profitB = b.Profit || b['Profit (Current)'] || b['ISK/Jump'] || 0;
            return profitB - profitA;
          });
          break;

        case 'profitPercent':
          // Sort by Profit %
          sorted.sort((a, b) => (b['Profit %'] || 0) - (a['Profit %'] || 0));
          break;

        case 'iskPerJump':
          // Sort by ISK/Jump (courier contracts)
          sorted.sort((a, b) => (b['ISK/Jump'] || 0) - (a['ISK/Jump'] || 0));
          break;

        case 'iskPerM3':
          // Sort by ISK/m³ (courier contracts)
          sorted.sort((a, b) => (b['ISK/m³'] || 0) - (a['ISK/m³'] || 0));
          break;

        case 'volume':
          // Sort by volume (ascending - smaller is better)
          sorted.sort((a, b) => (a.Volume || 0) - (b.Volume || 0));
          break;

        case 'jumps':
          // Sort by jumps (ascending - fewer is better)
          sorted.sort((a, b) => (a.Jumps || 0) - (b.Jumps || 0));
          break;

        case 'expires':
          // Sort by expiration date (ascending - expiring soon first)
          sorted.sort((a, b) => {
            const dateA = new Date(a.Expires || '9999-12-31');
            const dateB = new Date(b.Expires || '9999-12-31');
            return dateA - dateB;
          });
          break;

        default:
          // Default to profit
          sorted.sort((a, b) => {
            const profitA = a.Profit || a['Profit (Current)'] || a['ISK/Jump'] || 0;
            const profitB = b.Profit || b['Profit (Current)'] || b['ISK/Jump'] || 0;
            return profitB - profitA;
          });
      }

      return sorted;
    },
    []
  );

  /**
   * Get route information for courier contracts
   */
  const getCourierRoute = useCallback(
    (contractId) => {
      if (!data) return null;

      const contract = data.find((c) => c['Contract ID'] === contractId);
      if (!contract || contract.Type !== 'Courier') return null;

      return {
        from: contract.From,
        to: contract.To,
        jumps: contract.Jumps,
        reward: contract.Reward,
        collateral: contract.Collateral,
        volume: contract.Volume,
        iskPerJump: contract['ISK/Jump'],
        iskPerM3: contract['ISK/m³'],
      };
    },
    [data]
  );

  /**
   * Get contract statistics
   */
  const statistics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalContracts: 0,
        itemExchangeCount: 0,
        courierCount: 0,
        auctionCount: 0,
        totalProfit: 0,
        avgProfit: 0,
        avgVolume: 0,
      };
    }

    const itemExchangeCount = data.filter((c) => c.Type === 'Item Exchange').length;
    const courierCount = data.filter((c) => c.Type === 'Courier').length;
    const auctionCount = data.filter((c) => c.Type === 'Auction').length;

    const totalProfit = data.reduce((sum, c) => {
      return sum + (c.Profit || c['Profit (Current)'] || c.Reward || 0);
    }, 0);

    const avgProfit = totalProfit / data.length;

    const totalVolume = data.reduce((sum, c) => sum + (c.Volume || 0), 0);
    const avgVolume = totalVolume / data.length;

    return {
      totalContracts: data.length,
      itemExchangeCount,
      courierCount,
      auctionCount,
      totalProfit: Math.round(totalProfit),
      avgProfit: Math.round(avgProfit),
      avgVolume: Math.round(avgVolume * 10) / 10,
    };
  }, [data]);

  /**
   * Get top opportunities by type
   */
  const getTopOpportunities = useCallback(
    (type = 'all', limit = 10) => {
      const filtered = filterByType(type);
      const sorted = sortByProfitability(filtered, 'profit');
      return sorted.slice(0, limit);
    },
    [filterByType, sortByProfitability]
  );

  /**
   * Filter contracts by criteria
   */
  const filterContracts = useCallback(
    (criteria) => {
      if (!data) return [];

      let filtered = [...data];

      // Filter by contract type
      if (criteria.type && criteria.type !== 'all') {
        filtered = filtered.filter((c) => {
          if (criteria.type === 'item_exchange') return c.Type === 'Item Exchange';
          if (criteria.type === 'courier') return c.Type === 'Courier';
          if (criteria.type === 'auction') return c.Type === 'Auction';
          return true;
        });
      }

      // Filter by minimum profit
      if (criteria.minProfit) {
        filtered = filtered.filter((c) => {
          const profit = c.Profit || c['Profit (Current)'] || c.Reward || 0;
          return profit >= criteria.minProfit;
        });
      }

      // Filter by maximum volume
      if (criteria.maxVolume) {
        filtered = filtered.filter((c) => (c.Volume || 0) <= criteria.maxVolume);
      }

      // Filter by maximum jumps (courier)
      if (criteria.maxJumps) {
        filtered = filtered.filter((c) => !c.Jumps || c.Jumps <= criteria.maxJumps);
      }

      // Filter by minimum ISK/Jump (courier)
      if (criteria.minIskPerJump) {
        filtered = filtered.filter((c) => (c['ISK/Jump'] || 0) >= criteria.minIskPerJump);
      }

      // Filter by maximum collateral (courier)
      if (criteria.maxCollateral) {
        filtered = filtered.filter((c) => (c.Collateral || 0) <= criteria.maxCollateral);
      }

      // Filter by location (partial match)
      if (criteria.location) {
        const locationLower = criteria.location.toLowerCase();
        filtered = filtered.filter((c) => {
          const from = (c.From || c.Location || '').toLowerCase();
          const to = (c.To || '').toLowerCase();
          return from.includes(locationLower) || to.includes(locationLower);
        });
      }

      return filtered;
    },
    [data]
  );

  return {
    // Data
    contracts: data,
    loading,
    error,
    lastUpdated,
    statistics,

    // Methods
    search,
    reset,
    cancel,

    // Filtering and sorting
    filterByType,
    sortByProfitability,
    filterContracts,
    getTopOpportunities,

    // Courier-specific
    getCourierRoute,
  };
}

/**
 * Hook for fetching contract opportunities with auto-refresh
 * @param {object} params - Initial search parameters
 * @param {number} refreshInterval - Auto-refresh interval in ms (0 to disable)
 * @returns {object} Contract finder state and methods
 */
export function useContractFinderWithRefresh(params, refreshInterval = 0) {
  const contractFinder = useContractFinder();

  // Auto-refresh logic (if needed in the future)
  // This can be implemented using useEffect with setInterval

  return contractFinder;
}

export default useContractFinder;
