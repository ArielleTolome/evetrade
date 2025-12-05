import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { useEveAuth } from '../hooks/useEveAuth';
import {
  getWalletBalance,
  getWalletTransactions,
  getWalletJournal,
  getTypeNames
} from '../api/esi';
import { formatISK, formatNumber, formatPercent, formatRelativeTime } from '../utils/formatters';

/**
 * Analytics Page
 * Comprehensive trading insights with profit trends, top performers, trading hours heatmap, and more
 */
export function AnalyticsPage() {
  const { isAuthenticated, character, getAccessToken, login } = useEveAuth();
  const [_walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [typeNames, setTypeNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profitPeriod, setProfitPeriod] = useState('30d'); // 7d, 30d, 90d
  const [sortBy, setSortBy] = useState('profit'); // profit or roi
  const [lastRefresh, setLastRefresh] = useState(null);

  // Load all data when authenticated
  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadAllData();
    }
  }, [isAuthenticated, character?.id]);

  const loadAllData = useCallback(async () => {
    if (!isAuthenticated || !character?.id) return;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Load wallet balance
      const balance = await getWalletBalance(character.id, accessToken);
      setWalletBalance(balance);

      // Load transactions
      const txns = await getWalletTransactions(character.id, accessToken);
      setTransactions(txns || []);

      // Load journal entries
      const journal = await getWalletJournal(character.id, accessToken, 1);
      setJournalEntries(journal || []);

      // Get type names for transactions
      const typeIds = [...new Set((txns || []).map(t => t.type_id))];
      if (typeIds.length > 0) {
        const names = await getTypeNames(typeIds);
        const nameMap = {};
        names.forEach(n => {
          nameMap[n.id] = n.name;
        });
        setTypeNames(nameMap);
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, character?.id, getAccessToken]);

  // Calculate date range based on period
  const getDateRange = (period) => {
    const cutoff = new Date();
    switch (period) {
      case '7d':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(cutoff.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(cutoff.getDate() - 90);
        break;
      default:
        cutoff.setDate(cutoff.getDate() - 30);
    }
    return cutoff;
  };

  // Calculate profit over time for line chart
  const profitTrends = useMemo(() => {
    const cutoff = getDateRange(profitPeriod);
    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoff);
    const filteredJournal = journalEntries.filter(j => new Date(j.date) >= cutoff);

    // Group by day
    const profitByDay = {};

    // Initialize all days in range
    const days = profitPeriod === '7d' ? 7 : profitPeriod === '30d' ? 30 : 90;
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const key = date.toISOString().split('T')[0];
      profitByDay[key] = { income: 0, cost: 0, fees: 0 };
    }

    // Aggregate transactions
    filteredTxns.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split('T')[0];
      if (profitByDay[dateKey]) {
        const amount = t.quantity * t.unit_price;
        if (t.is_buy) {
          profitByDay[dateKey].cost += amount;
        } else {
          profitByDay[dateKey].income += amount;
        }
      }
    });

    // Aggregate fees
    filteredJournal.forEach(j => {
      if (j.ref_type === 'brokers_fee' || j.ref_type === 'transaction_tax') {
        const dateKey = new Date(j.date).toISOString().split('T')[0];
        if (profitByDay[dateKey]) {
          profitByDay[dateKey].fees += Math.abs(j.amount);
        }
      }
    });

    // Convert to array with cumulative profit
    let cumulative = 0;
    const trend = Object.entries(profitByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        const dailyProfit = data.income - data.cost - data.fees;
        cumulative += dailyProfit;
        return {
          date,
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dailyProfit,
          cumulative,
        };
      });

    const totalProfit = cumulative;
    return { trend, totalProfit };
  }, [transactions, journalEntries, profitPeriod]);

  // Calculate top performing items
  const topPerformers = useMemo(() => {
    const cutoff = getDateRange(profitPeriod);
    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoff);

    // Group by type
    const itemStats = {};

    filteredTxns.forEach(t => {
      if (!itemStats[t.type_id]) {
        itemStats[t.type_id] = {
          typeId: t.type_id,
          name: typeNames[t.type_id] || `Type ${t.type_id}`,
          buyTotal: 0,
          buyQuantity: 0,
          sellTotal: 0,
          sellQuantity: 0,
        };
      }

      const stats = itemStats[t.type_id];
      const amount = t.quantity * t.unit_price;

      if (t.is_buy) {
        stats.buyTotal += amount;
        stats.buyQuantity += t.quantity;
      } else {
        stats.sellTotal += amount;
        stats.sellQuantity += t.quantity;
      }
    });

    // Calculate profit and ROI
    const performers = Object.values(itemStats)
      .filter(item => item.sellQuantity > 0)
      .map(item => {
        const profit = item.sellTotal - item.buyTotal;
        const roi = item.buyTotal > 0 ? (profit / item.buyTotal) * 100 : 0;
        const volume = item.sellQuantity;

        return {
          ...item,
          profit,
          roi,
          volume,
        };
      });

    // Sort by selected metric
    if (sortBy === 'roi') {
      performers.sort((a, b) => b.roi - a.roi);
    } else {
      performers.sort((a, b) => b.profit - a.profit);
    }

    return performers.slice(0, 10);
  }, [transactions, typeNames, profitPeriod, sortBy]);

  // Calculate trading hours heatmap data
  const tradingHeatmap = useMemo(() => {
    const cutoff = getDateRange(profitPeriod);
    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoff);

    // Initialize 7x24 grid (day of week x hour)
    const heatmap = {};
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap[`${day}-${hour}`] = { count: 0, profit: 0 };
      }
    }

    // Group transactions by day/hour
    const profitByTxn = {};
    filteredTxns.forEach(t => {
      if (!profitByTxn[t.transaction_id]) {
        profitByTxn[t.transaction_id] = { buy: null, sell: null };
      }
      if (t.is_buy) {
        profitByTxn[t.transaction_id].buy = t;
      } else {
        profitByTxn[t.transaction_id].sell = t;
      }
    });

    // Calculate profit and aggregate
    filteredTxns.forEach(t => {
      const date = new Date(t.date);
      const day = date.getUTCDay();
      const hour = date.getUTCHours();
      const key = `${day}-${hour}`;

      if (heatmap[key]) {
        heatmap[key].count += 1;
        const amount = t.quantity * t.unit_price;
        heatmap[key].profit += t.is_buy ? -amount : amount;
      }
    });

    // Find max for normalization
    const maxCount = Math.max(...Object.values(heatmap).map(h => h.count), 1);
    const maxProfit = Math.max(...Object.values(heatmap).map(h => Math.abs(h.profit)), 1);

    return { heatmap, maxCount, maxProfit };
  }, [transactions, profitPeriod]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const cutoff = getDateRange(profitPeriod);
    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoff);

    // For now, we'll create pseudo-categories based on item names
    // In a real implementation, you'd use the ESI type categories
    const categories = {};

    filteredTxns.forEach(t => {
      const itemName = typeNames[t.type_id] || '';
      let category = 'Other';

      // Simple categorization based on common patterns
      if (itemName.includes('PLEX') || itemName.includes('Extractor')) category = 'PLEX & Services';
      else if (itemName.includes('Ore') || itemName.includes('Mineral')) category = 'Resources';
      else if (itemName.includes('Module') || itemName.includes('Turret')) category = 'Modules';
      else if (itemName.includes('Ship') || itemName.includes('Frigate') || itemName.includes('Cruiser')) category = 'Ships';
      else if (itemName.includes('Blueprint')) category = 'Blueprints';
      else if (itemName.includes('Ammo') || itemName.includes('Charge')) category = 'Ammunition';

      if (!categories[category]) {
        categories[category] = { income: 0, cost: 0 };
      }

      const amount = t.quantity * t.unit_price;
      if (t.is_buy) {
        categories[category].cost += amount;
      } else {
        categories[category].income += amount;
      }
    });

    // Calculate profit per category
    const breakdown = Object.entries(categories).map(([name, data]) => ({
      name,
      profit: data.income - data.cost,
      percentage: 0, // Will calculate after sorting
    }));

    const totalProfit = breakdown.reduce((sum, c) => sum + Math.abs(c.profit), 0);
    breakdown.forEach(c => {
      c.percentage = totalProfit > 0 ? (Math.abs(c.profit) / totalProfit) * 100 : 0;
    });

    return breakdown.sort((a, b) => b.profit - a.profit);
  }, [transactions, typeNames, profitPeriod]);

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const cutoff = getDateRange(profitPeriod);
    const filteredTxns = transactions.filter(t => new Date(t.date) >= cutoff);

    if (filteredTxns.length === 0) {
      return {
        avgTradeSize: 0,
        winRate: 0,
        avgHoldTime: 0,
        bestTrade: null,
      };
    }

    // Group by item for matched trades
    const itemTrades = {};
    filteredTxns.forEach(t => {
      if (!itemTrades[t.type_id]) {
        itemTrades[t.type_id] = { buys: [], sells: [] };
      }
      if (t.is_buy) {
        itemTrades[t.type_id].buys.push(t);
      } else {
        itemTrades[t.type_id].sells.push(t);
      }
    });

    // Calculate metrics from matched trades
    let totalTradeValue = 0;
    let tradeCount = 0;
    let profitableTrades = 0;
    let holdTimes = [];
    let bestTradeProfit = 0;
    let bestTrade = null;

    Object.values(itemTrades).forEach(({ buys, sells }) => {
      sells.forEach(sell => {
        const sellValue = sell.quantity * sell.unit_price;
        tradeCount += 1;
        totalTradeValue += sellValue;

        // Try to match with a buy
        if (buys.length > 0) {
          const avgBuyPrice = buys.reduce((sum, b) => sum + b.unit_price, 0) / buys.length;
          const profit = (sell.unit_price - avgBuyPrice) * sell.quantity;

          if (profit > 0) profitableTrades += 1;

          if (profit > bestTradeProfit) {
            bestTradeProfit = profit;
            bestTrade = {
              item: typeNames[sell.type_id] || `Type ${sell.type_id}`,
              profit,
              quantity: sell.quantity,
            };
          }

          // Calculate hold time (from first buy to this sell)
          if (buys[0]) {
            const holdMs = new Date(sell.date) - new Date(buys[0].date);
            holdTimes.push(holdMs);
          }
        }
      });
    });

    const avgTradeSize = tradeCount > 0 ? totalTradeValue / tradeCount : 0;
    const winRate = tradeCount > 0 ? (profitableTrades / tradeCount) * 100 : 0;
    const avgHoldTime = holdTimes.length > 0
      ? holdTimes.reduce((sum, t) => sum + t, 0) / holdTimes.length
      : 0;

    return {
      avgTradeSize,
      winRate,
      avgHoldTime: avgHoldTime / (1000 * 60 * 60), // Convert to hours
      bestTrade,
    };
  }, [transactions, typeNames, profitPeriod]);

  if (!isAuthenticated) {
    return (
      <PageLayout
        title="Analytics"
        subtitle="Advanced trading insights and performance metrics"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-text-primary mb-2">Login Required</h3>
            <p className="text-text-secondary mb-6">
              Connect your EVE Online account to view your trading analytics.
            </p>
            <Button onClick={login} variant="primary" className="px-8 py-3">
              Login with EVE Online
            </Button>
          </GlassmorphicCard>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Analytics"
      subtitle="Advanced trading insights and performance metrics"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-text-secondary">Period</span>
            {['7d', '30d', '90d'].map((period) => (
              <Button
                key={period}
                onClick={() => setProfitPeriod(period)}
                variant={profitPeriod === period ? 'primary' : 'ghost'}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1"
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>

          <Button
            onClick={loadAllData}
            disabled={loading}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 self-end sm:self-auto"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="Average Trade Size"
            value={formatISK(keyMetrics.avgTradeSize, true)}
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            color="text-accent-cyan"
          />
          <MetricCard
            label="Win Rate"
            value={formatPercent(keyMetrics.winRate / 100, 1)}
            icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            color="text-green-400"
          />
          <MetricCard
            label="Avg Hold Time"
            value={keyMetrics.avgHoldTime > 0 ? `${formatNumber(keyMetrics.avgHoldTime, 1)}h` : 'N/A'}
            icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            color="text-accent-purple"
          />
          <MetricCard
            label="Best Single Trade"
            value={keyMetrics.bestTrade ? formatISK(keyMetrics.bestTrade.profit, true) : 'N/A'}
            icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            color="text-accent-gold"
            subtext={keyMetrics.bestTrade?.item}
          />
        </div>

        {/* Profit Trends Section */}
        <GlassmorphicCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-display text-text-primary">Profit Trends</h3>
            <div className="text-right">
              <div className="text-xs text-text-secondary">Total Profit</div>
              <div className={`text-base sm:text-lg font-bold ${profitTrends.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatISK(profitTrends.totalProfit, true)}
              </div>
            </div>
          </div>
          <ProfitLineChart data={profitTrends.trend} />
        </GlassmorphicCard>

        {/* Top Performers Section */}
        <GlassmorphicCard>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h3 className="text-lg sm:text-xl font-display text-text-primary">Top Performers</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Sort by:</span>
              <Button
                onClick={() => setSortBy('profit')}
                variant={sortBy === 'profit' ? 'primary' : 'ghost'}
                size="sm"
                className="text-xs px-2 sm:px-3"
              >
                Profit
              </Button>
              <Button
                onClick={() => setSortBy('roi')}
                variant={sortBy === 'roi' ? 'primary' : 'ghost'}
                size="sm"
                className="text-xs px-2 sm:px-3"
              >
                ROI %
              </Button>
            </div>
          </div>
          <TopPerformersTable performers={topPerformers} />
        </GlassmorphicCard>

        {/* Trading Hours Heatmap */}
        <GlassmorphicCard>
          <h3 className="text-lg sm:text-xl font-display text-text-primary mb-4">Trading Hours Activity</h3>
          <p className="text-xs sm:text-sm text-text-secondary mb-4">
            Heatmap showing when your trades occur (UTC time)
          </p>
          <TradingHeatmap heatmapData={tradingHeatmap} />
        </GlassmorphicCard>

        {/* Category Breakdown */}
        <GlassmorphicCard>
          <h3 className="text-lg sm:text-xl font-display text-text-primary mb-4">Category Breakdown</h3>
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <CategoryPieChart categories={categoryBreakdown} />
            <CategoryList categories={categoryBreakdown} />
          </div>
        </GlassmorphicCard>

        {lastRefresh && (
          <div className="text-xs sm:text-sm text-text-secondary text-center">
            Last updated: {formatRelativeTime(lastRefresh)}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ label, value, icon, color, subtext }) {
  return (
    <GlassmorphicCard padding="p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-${color.split('-')[1]}/10`}>
          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-secondary mb-1">{label}</div>
          <div className={`text-lg sm:text-xl font-bold ${color}`}>{value}</div>
          {subtext && (
            <div className="text-xs text-text-secondary truncate mt-1">{subtext}</div>
          )}
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * Profit Line Chart Component
 */
function ProfitLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center text-text-secondary text-sm">
        No profit data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(Math.abs(d.cumulative), Math.abs(d.dailyProfit))), 1);
  const minValue = Math.min(...data.map(d => Math.min(d.cumulative, d.dailyProfit)), 0);
  const range = maxValue - minValue;

  // Calculate SVG path for line
  const width = 100;
  const height = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.cumulative - minValue) / range) * height;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;

  // Calculate area path
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="relative h-48 sm:h-64">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 flex flex-col justify-between text-xs text-text-secondary pr-2">
        <span>{formatISK(maxValue, true)}</span>
        <span>0</span>
        {minValue < 0 && <span>{formatISK(minValue, true)}</span>}
      </div>

      {/* Chart */}
      <div className="ml-16 sm:ml-20 h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="0" x2={width} y2="0" stroke="currentColor" strokeWidth="0.1" className="text-white/10" />
          <line x1="0" y1="50" x2={width} y2="50" stroke="currentColor" strokeWidth="0.1" className="text-white/10" />
          <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" strokeWidth="0.1" className="text-white/10" />

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#profitGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-accent-cyan"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((d.cumulative - minValue) / range) * height;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="0.8"
                  fill="currentColor"
                  className="text-accent-cyan hover:text-accent-gold transition-colors cursor-pointer"
                >
                  <title>{`${d.label}: ${formatISK(d.cumulative, false)}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-text-secondary px-1">
          <span>{data[0]?.label}</span>
          {data.length > 2 && <span className="hidden sm:inline">{data[Math.floor(data.length / 2)]?.label}</span>}
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Top Performers Table Component
 */
function TopPerformersTable({ performers }) {
  if (!performers || performers.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        No trading data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-text-secondary border-b border-accent-cyan/20">
              <th className="text-left py-2 px-2 sm:px-3">Item</th>
              <th className="text-right py-2 px-2 sm:px-3 hidden sm:table-cell">Volume</th>
              <th className="text-right py-2 px-2 sm:px-3">Profit</th>
              <th className="text-right py-2 px-2 sm:px-3">ROI</th>
            </tr>
          </thead>
          <tbody>
            {performers.map((item, idx) => (
              <tr key={idx} className="border-b border-accent-cyan/10 hover:bg-white/5">
                <td className="py-2 px-2 sm:px-3">
                  <div className="text-accent-cyan truncate max-w-[150px] sm:max-w-none">{item.name}</div>
                </td>
                <td className="py-2 px-2 sm:px-3 text-right font-mono text-text-primary hidden sm:table-cell">
                  {formatNumber(item.volume, 0)}
                </td>
                <td className={`py-2 px-2 sm:px-3 text-right font-mono ${item.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatISK(item.profit, true)}
                </td>
                <td className={`py-2 px-2 sm:px-3 text-right font-mono ${item.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(item.roi / 100, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Trading Heatmap Component
 */
function TradingHeatmap({ heatmapData }) {
  const { heatmap, maxCount } = heatmapData;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full sm:min-w-0">
        <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-[2px] min-w-[600px] sm:min-w-0">
          {/* Header - Hours */}
          <div className="text-xs text-text-secondary"></div>
          {hours.map(hour => (
            <div key={hour} className="text-[8px] sm:text-xs text-text-secondary text-center">
              {hour % 6 === 0 ? hour : ''}
            </div>
          ))}

          {/* Rows - Days */}
          {days.map((day, dayIdx) => (
            <>
              <div key={`label-${dayIdx}`} className="text-xs text-text-secondary pr-2 flex items-center">
                {day}
              </div>
              {hours.map(hour => {
                const key = `${dayIdx}-${hour}`;
                const cell = heatmap[key];
                const intensity = cell.count > 0 ? (cell.count / maxCount) : 0;
                const color = intensity > 0
                  ? `rgba(0, 212, 255, ${Math.max(0.15, intensity)})`
                  : 'rgba(255, 255, 255, 0.05)';

                return (
                  <div
                    key={key}
                    className="aspect-square rounded-sm hover:ring-1 hover:ring-accent-cyan transition-all cursor-pointer group relative"
                    style={{ backgroundColor: color }}
                    title={`${day} ${hour}:00 - ${cell.count} trades, ${formatISK(cell.profit, false)} profit`}
                  >
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 whitespace-nowrap">
                      <div className="bg-space-dark border border-accent-cyan/30 rounded px-2 py-1 text-xs">
                        <div>{day} {hour}:00</div>
                        <div className="text-text-secondary">{cell.count} trades</div>
                        <div className={cell.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {formatISK(cell.profit, true)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-text-secondary">
          <span>Less</span>
          {[0.2, 0.4, 0.6, 0.8, 1.0].map(intensity => (
            <div
              key={intensity}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: `rgba(0, 212, 255, ${intensity * 0.8 + 0.2})` }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Category Pie Chart Component
 */
function CategoryPieChart({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center text-text-secondary text-sm">
        No category data available
      </div>
    );
  }

  const colors = [
    '#00d4ff', // cyan
    '#a855f7', // purple
    '#eab308', // gold
    '#22c55e', // green
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
  ];

  // Calculate pie slices
  const slices = categories.reduce((acc, cat, idx) => {
    const prevAngle = idx === 0 ? -90 : acc[idx - 1].endAngle;
    const angle = (cat.percentage / 100) * 360;
    const startAngle = prevAngle;
    const endAngle = prevAngle + angle;

    // Calculate path for pie slice
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 45 * Math.cos(startRad);
    const y1 = 50 + 45 * Math.sin(startRad);
    const x2 = 50 + 45 * Math.cos(endRad);
    const y2 = 50 + 45 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const path = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`;

    acc.push({
      ...cat,
      path,
      endAngle,
      color: colors[idx % colors.length],
    });
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-48 h-48 sm:w-64 sm:h-64">
        {slices.map((slice, idx) => (
          <g key={idx}>
            <path
              d={slice.path}
              fill={slice.color}
              opacity="0.7"
              className="hover:opacity-100 transition-opacity cursor-pointer"
            >
              <title>{`${slice.name}: ${formatPercent(slice.percentage / 100, 1)}`}</title>
            </path>
          </g>
        ))}
        {/* Center circle */}
        <circle cx="50" cy="50" r="20" fill="currentColor" className="text-space-dark" />
      </svg>
    </div>
  );
}

/**
 * Category List Component
 */
function CategoryList({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        No category data available
      </div>
    );
  }

  const colors = [
    'text-accent-cyan',
    'text-accent-purple',
    'text-accent-gold',
    'text-green-400',
    'text-orange-400',
    'text-pink-400',
    'text-indigo-400',
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      {categories.map((cat, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length].replace('text-', 'bg-')}`} />
            <span className="text-xs sm:text-sm text-text-primary truncate">{cat.name}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`text-xs sm:text-sm font-mono ${cat.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatISK(cat.profit, true)}
            </span>
            <span className="text-xs text-text-secondary w-10 sm:w-12 text-right">
              {formatPercent(cat.percentage / 100, 0)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AnalyticsPage;
