import { useState, useEffect, useMemo } from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';
import { getCharacterOrders, getMarketHistory } from '../../api/esi';
import { formatISK, formatPercent, formatCompact } from '../../utils/formatters';

const STORAGE_KEY = 'eve_market_share';

/**
 * MarketShareEstimator Component
 *
 * Calculate market share as percentage of total market volume,
 * track changes over time, compare across items, and show rankings.
 */
export function MarketShareEstimator() {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [marketShareData, setMarketShareData] = useState({});
  const [, setActiveOrders] = useState([]);
  const [regionId, setRegionId] = useState('10000002'); // Jita
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [timeframe, setTimeframe] = useState('30'); // days

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setMarketShareData(data.marketShareData || {});
      }
    } catch (error) {
      console.error('Failed to load market share data:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      const data = {
        marketShareData,
        lastUpdate: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save market share data:', error);
    }
  }, [marketShareData]);

  // Fetch orders and calculate market share
  const fetchMarketShare = async () => {
    if (!isAuthenticated || !character?.id) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      // Get character's orders
      const orders = await getCharacterOrders(character.id, token);
      setActiveOrders(orders || []);

      // Group orders by type
      const ordersByType = (orders || []).reduce((acc, order) => {
        if (!acc[order.type_id]) {
          acc[order.type_id] = [];
        }
        acc[order.type_id].push(order);
        return acc;
      }, {});

      // Calculate market share for each type
      const shareData = {};
      for (const [typeId, typeOrders] of Object.entries(ordersByType)) {
        try {
          // Get market history for volume data
          const history = await getMarketHistory(regionId, typeId);

          if (history && history.length > 0) {
            // Calculate average daily volume from recent history
            const days = parseInt(timeframe);
            const recentHistory = history.slice(-days);
            const avgDailyVolume =
              recentHistory.reduce((sum, day) => sum + day.volume, 0) /
              recentHistory.length;

            // Calculate user's volume (sell orders only)
            const userSellVolume = typeOrders
              .filter((o) => !o.is_buy_order)
              .reduce((sum, o) => sum + o.volume_remain, 0);

            const userBuyVolume = typeOrders
              .filter((o) => o.is_buy_order)
              .reduce((sum, o) => sum + o.volume_remain, 0);

            // Calculate market share
            const sellShare =
              avgDailyVolume > 0 ? (userSellVolume / avgDailyVolume) * 100 : 0;
            const buyShare =
              avgDailyVolume > 0 ? (userBuyVolume / avgDailyVolume) * 100 : 0;

            // Calculate average prices
            const avgSellPrice =
              typeOrders.filter((o) => !o.is_buy_order).length > 0
                ? typeOrders
                    .filter((o) => !o.is_buy_order)
                    .reduce((sum, o) => sum + o.price, 0) /
                  typeOrders.filter((o) => !o.is_buy_order).length
                : 0;

            const avgBuyPrice =
              typeOrders.filter((o) => o.is_buy_order).length > 0
                ? typeOrders
                    .filter((o) => o.is_buy_order)
                    .reduce((sum, o) => sum + o.price, 0) /
                  typeOrders.filter((o) => o.is_buy_order).length
                : 0;

            // Get historical share data
            const previousData = marketShareData[typeId] || { history: [] };

            shareData[typeId] = {
              typeId: parseInt(typeId),
              avgDailyVolume,
              userSellVolume,
              userBuyVolume,
              sellShare,
              buyShare,
              totalShare: sellShare + buyShare,
              avgSellPrice,
              avgBuyPrice,
              sellOrderCount: typeOrders.filter((o) => !o.is_buy_order).length,
              buyOrderCount: typeOrders.filter((o) => o.is_buy_order).length,
              lastUpdated: Date.now(),
              history: [
                ...previousData.history,
                {
                  timestamp: Date.now(),
                  sellShare,
                  buyShare,
                  totalShare: sellShare + buyShare,
                },
              ].slice(-30), // Keep last 30 data points
            };
          }
        } catch (error) {
          console.error(`Failed to fetch history for type ${typeId}:`, error);
        }
      }

      setMarketShareData(shareData);
    } catch (error) {
      console.error('Failed to fetch market share data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate rankings
  const rankings = useMemo(() => {
    const items = Object.values(marketShareData).map((item) => ({
      ...item,
      dominanceScore: item.totalShare * Math.log10(item.avgDailyVolume + 1),
    }));

    return items.sort((a, b) => b.dominanceScore - a.dominanceScore);
  }, [marketShareData]);

  // Get share category
  const getShareCategory = (share) => {
    if (share >= 50) return { label: 'Dominant', color: 'text-purple-400' };
    if (share >= 25) return { label: 'Major Player', color: 'text-cyan-400' };
    if (share >= 10) return { label: 'Significant', color: 'text-green-400' };
    if (share >= 5) return { label: 'Moderate', color: 'text-yellow-400' };
    if (share >= 1) return { label: 'Minor', color: 'text-orange-400' };
    return { label: 'Negligible', color: 'text-text-secondary' };
  };

  // Calculate trend from history
  const calculateTrend = (history) => {
    if (!history || history.length < 2) return 'stable';

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg =
      recent.reduce((sum, h) => sum + h.totalShare, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, h) => sum + h.totalShare, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return 'up';
    if (change < -10) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Market Share Estimator
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Track your market share and dominance across different items
        </p>
      </div>

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <div className="glass p-6 border-l-4 border-yellow-500">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-1">
                Authentication Required
              </h3>
              <p className="text-text-secondary text-sm">
                Please log in with your EVE Online account to calculate your market share.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="glass p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Calculate Market Share
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Region ID
            </label>
            <input
              type="text"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              placeholder="10000002"
              className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary focus:border-accent-cyan focus:outline-none"
            />
            <div className="text-xs text-text-secondary/70 mt-1">
              Jita: 10000002, Amarr: 10000043
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Timeframe (Days)
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary focus:border-accent-cyan focus:outline-none"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchMarketShare}
          disabled={loading || !isAuthenticated}
          className="w-full btn-primary mt-4 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Market Share'}
        </button>
      </div>

      {/* Summary Stats */}
      {rankings.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Total Items
              </div>
              <div className="text-2xl font-mono font-bold text-text-primary">
                {rankings.length}
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Dominant Markets
              </div>
              <div className="text-2xl font-mono font-bold text-purple-400">
                {rankings.filter((r) => r.totalShare >= 50).length}
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Major Player
              </div>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {rankings.filter((r) => r.totalShare >= 25 && r.totalShare < 50).length}
              </div>
            </div>

            <div className="bg-space-dark/50 rounded p-4">
              <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Avg Market Share
              </div>
              <div className="text-2xl font-mono font-bold text-green-400">
                {rankings.length > 0
                  ? formatPercent(
                      rankings.reduce((sum, r) => sum + r.totalShare, 0) /
                        rankings.length /
                        100,
                      1
                    )
                  : '0%'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rankings */}
      {rankings.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Market Share Rankings
          </h3>

          <div className="space-y-2">
            {rankings.map((item, index) => {
              const category = getShareCategory(item.totalShare);
              const trend = calculateTrend(item.history);

              return (
                <div
                  key={item.typeId}
                  className={`p-4 bg-space-dark/30 rounded border cursor-pointer transition-all ${
                    selectedItemId === item.typeId
                      ? 'border-accent-cyan'
                      : 'border-accent-cyan/10 hover:border-accent-cyan/30'
                  }`}
                  onClick={() =>
                    setSelectedItemId(
                      selectedItemId === item.typeId ? null : item.typeId
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-accent-cyan/20 rounded-full text-accent-cyan font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">
                          Type ID: {item.typeId}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {item.sellOrderCount} sell, {item.buyOrderCount} buy orders
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-text-secondary">Market Share</div>
                        <div className={`text-lg font-mono font-bold ${category.color}`}>
                          {formatPercent(item.totalShare / 100, 1)}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {category.label}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-text-secondary">Daily Volume</div>
                        <div className="text-lg font-mono font-bold text-text-primary">
                          {formatCompact(item.avgDailyVolume)}
                        </div>
                      </div>

                      <div>{getTrendIcon(trend)}</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedItemId === item.typeId && (
                    <div className="mt-4 pt-4 border-t border-accent-cyan/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sell Side */}
                        <div className="bg-space-dark/50 rounded p-4">
                          <h4 className="text-sm font-semibold text-purple-400 mb-3">
                            Sell Side
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Market Share:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {formatPercent(item.sellShare / 100, 2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Your Volume:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {formatCompact(item.userSellVolume)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Avg Price:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {formatISK(item.avgSellPrice)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Orders:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {item.sellOrderCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Buy Side */}
                        <div className="bg-space-dark/50 rounded p-4">
                          <h4 className="text-sm font-semibold text-green-400 mb-3">
                            Buy Side
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Market Share:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {formatPercent(item.buyShare / 100, 2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Your Volume:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {formatCompact(item.userBuyVolume)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Avg Price:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {formatISK(item.avgBuyPrice)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-text-secondary">
                                Orders:
                              </span>
                              <span className="text-sm font-mono text-text-primary">
                                {item.buyOrderCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Historical Chart */}
                      {item.history && item.history.length > 1 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-text-primary mb-3">
                            Share History
                          </h4>
                          <div className="bg-space-dark/30 rounded p-4">
                            <div className="flex items-end gap-1 h-24">
                              {item.history.slice(-15).map((point, idx) => {
                                const maxShare = Math.max(
                                  ...item.history.map((h) => h.totalShare)
                                );
                                const height = maxShare > 0
                                  ? (point.totalShare / maxShare) * 100
                                  : 0;

                                return (
                                  <div
                                    key={idx}
                                    className="flex-1 bg-accent-cyan/30 rounded-t hover:bg-accent-cyan/50 transition-colors relative group"
                                    style={{ height: `${height}%` }}
                                  >
                                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-space-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      {formatPercent(point.totalShare / 100, 1)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-xs text-text-secondary text-center mt-2">
                              Last {Math.min(item.history.length, 15)} data points
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rankings.length === 0 && !loading && (
        <div className="glass p-12 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Market Share Data
          </h3>
          <p className="text-text-secondary">
            {isAuthenticated
              ? 'Click "Calculate Market Share" to analyze your market presence'
              : 'Log in to track your market share across different items'}
          </p>
        </div>
      )}
    </div>
  );
}

export default MarketShareEstimator;
