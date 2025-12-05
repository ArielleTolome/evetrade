import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEveAuth } from './useEveAuth';
import { getWalletTransactions, getTypeNames } from '../api/esi';

const STORAGE_KEY = 'evetrade_trade_history_stats';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Trade History Hook
 * Fetches and analyzes wallet transactions from ESI
 * Calculates profit/loss, win rate, and tracks trading performance
 */
export function useTradeHistory() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [transactions, setTransactions] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Load cached stats from localStorage
  const [cachedStats, setCachedStats] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Load transactions when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      // Only fetch if we don't have recent data
      if (!lastFetch || Date.now() - lastFetch > CACHE_DURATION) {
        loadTransactions();
      }
    }
  }, [isAuthenticated, character?.id]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError('Not authenticated');
        return;
      }

      const txns = await getWalletTransactions(character.id, accessToken);
      setTransactions(txns || []);
      setLastFetch(Date.now());

      // Get unique type IDs and fetch names
      const typeIds = [...new Set(txns.map((t) => t.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach((n) => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh
  const refresh = useCallback(() => {
    loadTransactions();
  }, [character?.id]);

  // Group transactions by item to calculate profit/loss
  const tradeAnalysis = useMemo(() => {
    if (transactions.length === 0) return [];

    // Group by type_id
    const itemGroups = {};

    transactions.forEach((txn) => {
      const typeId = txn.type_id;
      if (!itemGroups[typeId]) {
        itemGroups[typeId] = {
          typeId,
          typeName: typeNames[typeId] || `Type ${typeId}`,
          buys: [],
          sells: [],
        };
      }

      if (txn.is_buy) {
        itemGroups[typeId].buys.push(txn);
      } else {
        itemGroups[typeId].sells.push(txn);
      }
    });

    // Calculate profit/loss for each item using FIFO
    const analysis = [];

    Object.values(itemGroups).forEach((group) => {
      const { typeId, typeName, buys, sells } = group;

      // Sort by date
      const sortedBuys = [...buys].sort((a, b) => new Date(a.date) - new Date(b.date));
      const sortedSells = [...sells].sort((a, b) => new Date(a.date) - new Date(b.date));

      let buyQueue = [...sortedBuys];
      let totalProfit = 0;
      let totalBought = 0;
      let totalSold = 0;
      let completedTrades = 0;

      sortedSells.forEach((sell) => {
        let remainingSellQty = sell.quantity;
        const sellPrice = sell.unit_price;

        while (remainingSellQty > 0 && buyQueue.length > 0) {
          const buy = buyQueue[0];
          const buyPrice = buy.unit_price;
          const qtyToMatch = Math.min(remainingSellQty, buy.quantity);

          // Calculate profit for this matched quantity
          const profit = (sellPrice - buyPrice) * qtyToMatch;
          totalProfit += profit;
          totalSold += qtyToMatch;
          completedTrades++;

          // Update quantities
          remainingSellQty -= qtyToMatch;
          buy.quantity -= qtyToMatch;

          if (buy.quantity === 0) {
            buyQueue.shift();
          }
        }
      });

      totalBought = sortedBuys.reduce((sum, b) => sum + b.quantity, 0);

      const avgBuyPrice = sortedBuys.length > 0
        ? sortedBuys.reduce((sum, b) => sum + b.unit_price * b.quantity, 0) / totalBought
        : 0;

      const avgSellPrice = sortedSells.length > 0
        ? sortedSells.reduce((sum, s) => sum + s.unit_price * s.quantity, 0) /
          sortedSells.reduce((sum, s) => sum + s.quantity, 0)
        : 0;

      if (totalProfit !== 0 || (sortedBuys.length > 0 && sortedSells.length > 0)) {
        analysis.push({
          typeId,
          typeName,
          totalProfit,
          totalBought,
          totalSold,
          remainingQty: totalBought - totalSold,
          completedTrades,
          avgBuyPrice,
          avgSellPrice,
          profitMargin: avgBuyPrice > 0 ? ((avgSellPrice - avgBuyPrice) / avgBuyPrice) : 0,
          lastTradeDate: sortedSells.length > 0
            ? sortedSells[sortedSells.length - 1].date
            : sortedBuys[sortedBuys.length - 1].date,
        });
      }
    });

    return analysis.sort((a, b) => b.totalProfit - a.totalProfit);
  }, [transactions, typeNames]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    const totalProfit = tradeAnalysis.reduce((sum, t) => sum + t.totalProfit, 0);
    const completedTrades = tradeAnalysis.reduce((sum, t) => sum + t.completedTrades, 0);
    const profitableTrades = tradeAnalysis.filter((t) => t.totalProfit > 0).length;
    const losingTrades = tradeAnalysis.filter((t) => t.totalProfit < 0).length;
    const winRate = profitableTrades + losingTrades > 0
      ? profitableTrades / (profitableTrades + losingTrades)
      : 0;

    const buys = transactions.filter((t) => t.is_buy);
    const sells = transactions.filter((t) => !t.is_buy);
    const totalInvested = buys.reduce((sum, t) => sum + t.quantity * t.unit_price, 0);
    const totalRevenue = sells.reduce((sum, t) => sum + t.quantity * t.unit_price, 0);

    const avgProfit = tradeAnalysis.length > 0 ? totalProfit / tradeAnalysis.length : 0;
    const roi = totalInvested > 0 ? (totalProfit / totalInvested) : 0;

    const bestTrade = tradeAnalysis.length > 0
      ? tradeAnalysis.reduce((best, t) => t.totalProfit > best.totalProfit ? t : best, tradeAnalysis[0])
      : null;

    const worstTrade = tradeAnalysis.length > 0
      ? tradeAnalysis.reduce((worst, t) => t.totalProfit < worst.totalProfit ? t : worst, tradeAnalysis[0])
      : null;

    const stats = {
      totalProfit,
      completedTrades,
      profitableTrades,
      losingTrades,
      winRate,
      totalInvested,
      totalRevenue,
      avgProfit,
      roi,
      bestTrade,
      worstTrade,
      uniqueItems: tradeAnalysis.length,
      totalTransactions: transactions.length,
    };

    // Persist stats to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    setCachedStats(stats);

    return stats;
  }, [tradeAnalysis, transactions]);

  // Group transactions by time period
  const groupByPeriod = useCallback((period = 'day') => {
    const grouped = {};

    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      let key;

      if (period === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'week') {
        const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
        key = `Week ${week}`;
      } else if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = date.toISOString();
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          buys: [],
          sells: [],
          totalBought: 0,
          totalSold: 0,
        };
      }

      if (txn.is_buy) {
        grouped[key].buys.push(txn);
        grouped[key].totalBought += txn.quantity * txn.unit_price;
      } else {
        grouped[key].sells.push(txn);
        grouped[key].totalSold += txn.quantity * txn.unit_price;
      }
    });

    // Calculate profit for each period
    return Object.values(grouped).map((group) => ({
      ...group,
      profit: group.totalSold - group.totalBought,
      transactions: group.buys.length + group.sells.length,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  return {
    transactions,
    typeNames,
    tradeAnalysis,
    stats: stats || cachedStats,
    loading,
    error,
    refresh,
    groupByPeriod,
    isAuthenticated,
  };
}

export default useTradeHistory;
