import { useState, useEffect, useCallback, useMemo } from 'react';
import { StatCard } from './StatCard';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { Button } from '../common/Button';
import { useEveAuth } from '../../hooks/useEveAuth';
import {
  getWalletBalance,
  getCharacterOrders,
  getWalletTransactions,
} from '../../api/esi';
import { formatISK, formatNumber, formatPercent } from '../../utils/formatters';

/**
 * Real-Time Profit Dashboard Component
 * Displays live trading metrics including wallet, active orders, and profit tracking
 */
export function RealTimeProfitDashboard() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();

  // State
  const [walletBalance, setWalletBalance] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Auto-refresh interval (5 minutes)
  const REFRESH_INTERVAL = 5 * 60 * 1000;

  /**
   * Fetch all trading data
   */
  const fetchTradingData = useCallback(async () => {
    if (!isAuthenticated || !character?.id) return;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('No access token');

      // Fetch all data in parallel
      const [wallet, orders, txns] = await Promise.all([
        getWalletBalance(character.id, accessToken),
        getCharacterOrders(character.id, accessToken),
        getWalletTransactions(character.id, accessToken),
      ]);

      setWalletBalance(wallet);
      setActiveOrders(orders || []);
      setTransactions(txns || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch trading data:', err);
      setError(err.message || 'Failed to fetch trading data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, character?.id, getAccessToken]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      fetchTradingData();

      const interval = setInterval(fetchTradingData, REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, character?.id, fetchTradingData]);

  /**
   * Calculate trading metrics
   */
  const metrics = useMemo(() => {
    // Active orders breakdown
    const buyOrders = activeOrders.filter((o) => o.is_buy_order);
    const sellOrders = activeOrders.filter((o) => !o.is_buy_order);

    // Escrow (locked in buy orders)
    const totalEscrow = buyOrders.reduce((sum, o) => sum + (o.escrow || 0), 0);

    // Sell order value
    const sellOrderValue = sellOrders.reduce(
      (sum, o) => sum + o.price * o.volume_remain,
      0
    );

    // Today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= today;
    });

    // Calculate today's profit (sales minus purchases)
    const todayProfit = todayTransactions.reduce((sum, t) => {
      const amount = t.unit_price * t.quantity;
      return t.is_buy ? sum - amount : sum + amount;
    }, 0);

    // This week's transactions
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= weekAgo;
    });

    const weekProfit = weekTransactions.reduce((sum, t) => {
      const amount = t.unit_price * t.quantity;
      return t.is_buy ? sum - amount : sum + amount;
    }, 0);

    // Total liquid (wallet + escrow + sell orders)
    const totalAssets = (walletBalance || 0) + totalEscrow + sellOrderValue;

    // Recent activity for sparkline
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayProfit = transactions
        .filter((t) => {
          const txDate = new Date(t.date);
          return txDate >= date && txDate < nextDate;
        })
        .reduce((sum, t) => {
          const amount = t.unit_price * t.quantity;
          return t.is_buy ? sum - amount : sum + amount;
        }, 0);

      last7Days.push(dayProfit);
    }

    return {
      walletBalance: walletBalance || 0,
      totalEscrow,
      sellOrderValue,
      totalAssets,
      buyOrderCount: buyOrders.length,
      sellOrderCount: sellOrders.length,
      totalOrderCount: activeOrders.length,
      todayProfit,
      weekProfit,
      todayTransactionCount: todayTransactions.length,
      weekTransactionCount: weekTransactions.length,
      profitSparkline: last7Days,
    };
  }, [walletBalance, activeOrders, transactions]);

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <GlassmorphicCard className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">{'📊'}</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Real-Time Profit Dashboard
          </h3>
          <p className="text-text-secondary mb-4">
            Log in with EVE Online to view your trading metrics
          </p>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Trading Dashboard
          </h2>
          {lastRefresh && (
            <p className="text-sm text-text-secondary">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          onClick={fetchTradingData}
          disabled={loading}
          variant="secondary"
          size="sm"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wallet Balance"
          value={metrics.walletBalance}
          format="isk"
          icon={'💰'}
          variant="gold"
          loading={loading}
          description="Available liquid ISK"
        />

        <StatCard
          label="Total Assets"
          value={metrics.totalAssets}
          format="isk"
          icon={'📈'}
          variant="cyan"
          loading={loading}
          description="Wallet + Escrow + Sell Orders"
        />

        <StatCard
          label="Today's Profit"
          value={metrics.todayProfit}
          format="isk"
          icon={'💹'}
          variant={metrics.todayProfit >= 0 ? 'green' : 'red'}
          trend={
            metrics.todayProfit !== 0
              ? {
                  direction: metrics.todayProfit >= 0 ? 'up' : 'down',
                  value: Math.abs(metrics.todayProfit / 1000000).toFixed(1) + 'M',
                }
              : null
          }
          loading={loading}
          description={`${metrics.todayTransactionCount} transactions`}
        />

        <StatCard
          label="Week's Profit"
          value={metrics.weekProfit}
          format="isk"
          icon={'📅'}
          variant={metrics.weekProfit >= 0 ? 'green' : 'red'}
          sparklineData={metrics.profitSparkline}
          loading={loading}
          description={`${metrics.weekTransactionCount} transactions`}
        />
      </div>

      {/* Orders Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Active Buy Orders"
          value={metrics.buyOrderCount}
          format="number"
          icon={'🛒'}
          variant="cyan"
          loading={loading}
          description={`${formatISK(metrics.totalEscrow, false)} in escrow`}
        />

        <StatCard
          label="Active Sell Orders"
          value={metrics.sellOrderCount}
          format="number"
          icon={'🏷️'}
          variant="gold"
          loading={loading}
          description={`${formatISK(metrics.sellOrderValue, false)} total value`}
        />

        <StatCard
          label="Total Active Orders"
          value={metrics.totalOrderCount}
          format="number"
          icon={'📋'}
          variant="purple"
          loading={loading}
          description="Across all markets"
        />
      </div>

      {/* Quick Stats */}
      <GlassmorphicCard className="p-4">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Escrow Locked:</span>
            <span className="ml-2 text-accent-cyan font-mono">
              {formatISK(metrics.totalEscrow, false)}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Sell Order Value:</span>
            <span className="ml-2 text-accent-gold font-mono">
              {formatISK(metrics.sellOrderValue, false)}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Daily Transactions:</span>
            <span className="ml-2 text-text-primary font-mono">
              {formatNumber(metrics.todayTransactionCount, 0)}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Weekly Transactions:</span>
            <span className="ml-2 text-text-primary font-mono">
              {formatNumber(metrics.weekTransactionCount, 0)}
            </span>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
}

export default RealTimeProfitDashboard;
