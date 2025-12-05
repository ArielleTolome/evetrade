import { useState, useMemo } from 'react';
import { getMarketHistory } from '../../api/esi';
import { formatISK, formatCompact } from '../../utils/formatters';

/**
 * SeasonalTrends Component
 *
 * Analyze price patterns by day of week, time of day, and monthly patterns.
 * Shows best times to buy/sell with visual heatmap of price patterns.
 */
export function SeasonalTrends() {
  const [regionId, setRegionId] = useState('10000002'); // Jita
  const [typeId, setTypeId] = useState('');
  const [itemName, setItemName] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'month', 'time'

  const fetchHistory = async () => {
    if (!typeId || !regionId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getMarketHistory(regionId, typeId);
      setHistoryData(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch market history');
    } finally {
      setLoading(false);
    }
  };

  // Analyze patterns by day of week
  const dayOfWeekAnalysis = useMemo(() => {
    if (historyData.length === 0) return null;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = days.map((name, idx) => ({
      day: name,
      dayIndex: idx,
      prices: [],
      volumes: [],
    }));

    historyData.forEach((entry) => {
      const date = new Date(entry.date);
      const dayIndex = date.getDay();
      dayStats[dayIndex].prices.push(entry.average);
      dayStats[dayIndex].volumes.push(entry.volume);
    });

    const analyzed = dayStats.map((stat) => {
      if (stat.prices.length === 0) {
        return { ...stat, avgPrice: 0, avgVolume: 0, count: 0 };
      }

      const avgPrice = stat.prices.reduce((a, b) => a + b, 0) / stat.prices.length;
      const avgVolume = stat.volumes.reduce((a, b) => a + b, 0) / stat.volumes.length;

      return {
        ...stat,
        avgPrice,
        avgVolume,
        count: stat.prices.length,
      };
    });

    const allPrices = analyzed.filter((d) => d.avgPrice > 0).map((d) => d.avgPrice);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

    return {
      data: analyzed,
      minPrice,
      maxPrice,
      bestBuyDay: analyzed.reduce((min, d) => (d.avgPrice > 0 && d.avgPrice < min.avgPrice ? d : min)),
      bestSellDay: analyzed.reduce((max, d) => (d.avgPrice > max.avgPrice ? d : max)),
    };
  }, [historyData]);

  // Analyze patterns by month
  const monthlyAnalysis = useMemo(() => {
    if (historyData.length === 0) return null;

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthStats = months.map((name, idx) => ({
      month: name,
      monthIndex: idx,
      prices: [],
      volumes: [],
    }));

    historyData.forEach((entry) => {
      const date = new Date(entry.date);
      const monthIndex = date.getMonth();
      monthStats[monthIndex].prices.push(entry.average);
      monthStats[monthIndex].volumes.push(entry.volume);
    });

    const analyzed = monthStats.map((stat) => {
      if (stat.prices.length === 0) {
        return { ...stat, avgPrice: 0, avgVolume: 0, count: 0 };
      }

      const avgPrice = stat.prices.reduce((a, b) => a + b, 0) / stat.prices.length;
      const avgVolume = stat.volumes.reduce((a, b) => a + b, 0) / stat.volumes.length;

      return {
        ...stat,
        avgPrice,
        avgVolume,
        count: stat.prices.length,
      };
    });

    const allPrices = analyzed.filter((d) => d.avgPrice > 0).map((d) => d.avgPrice);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

    return {
      data: analyzed,
      minPrice,
      maxPrice,
      bestBuyMonth: analyzed.reduce((min, d) => (d.avgPrice > 0 && d.avgPrice < min.avgPrice ? d : min)),
      bestSellMonth: analyzed.reduce((max, d) => (d.avgPrice > max.avgPrice ? d : max)),
    };
  }, [historyData]);

  // Analyze weekday vs weekend patterns
  const weekdayWeekendAnalysis = useMemo(() => {
    if (historyData.length === 0) return null;

    const weekdayData = [];
    const weekendData = [];

    historyData.forEach((entry) => {
      const date = new Date(entry.date);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendData.push(entry);
      } else {
        weekdayData.push(entry);
      }
    });

    const weekdayAvg = weekdayData.length > 0
      ? weekdayData.reduce((sum, e) => sum + e.average, 0) / weekdayData.length
      : 0;

    const weekendAvg = weekendData.length > 0
      ? weekendData.reduce((sum, e) => sum + e.average, 0) / weekendData.length
      : 0;

    const weekdayVolume = weekdayData.length > 0
      ? weekdayData.reduce((sum, e) => sum + e.volume, 0) / weekdayData.length
      : 0;

    const weekendVolume = weekendData.length > 0
      ? weekendData.reduce((sum, e) => sum + e.volume, 0) / weekendData.length
      : 0;

    return {
      weekday: {
        avgPrice: weekdayAvg,
        avgVolume: weekdayVolume,
        count: weekdayData.length,
      },
      weekend: {
        avgPrice: weekendAvg,
        avgVolume: weekendVolume,
        count: weekendData.length,
      },
      priceDiff: weekendAvg - weekdayAvg,
      volumeDiff: weekendVolume - weekdayVolume,
    };
  }, [historyData]);

  // Price trend (30-day vs 90-day)
  const trendAnalysis = useMemo(() => {
    if (historyData.length === 0) return null;

    const sortedData = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));

    const last30Days = sortedData.slice(0, 30);
    const last90Days = sortedData.slice(0, 90);

    const avg30 = last30Days.length > 0
      ? last30Days.reduce((sum, e) => sum + e.average, 0) / last30Days.length
      : 0;

    const avg90 = last90Days.length > 0
      ? last90Days.reduce((sum, e) => sum + e.average, 0) / last90Days.length
      : 0;

    return {
      avg30Days: avg30,
      avg90Days: avg90,
      trend: avg30 > avg90 ? 'up' : avg30 < avg90 ? 'down' : 'stable',
      change: avg90 > 0 ? ((avg30 - avg90) / avg90) * 100 : 0,
    };
  }, [historyData]);

  const getHeatmapColor = (value, min, max) => {
    if (value === 0 || min === max) return 'bg-gray-700';

    const normalized = (value - min) / (max - min);

    if (normalized < 0.2) return 'bg-green-600';
    if (normalized < 0.4) return 'bg-green-500';
    if (normalized < 0.6) return 'bg-yellow-500';
    if (normalized < 0.8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Seasonal Trend Analysis
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Analyze price patterns and identify best times to buy and sell
        </p>
      </div>

      {/* Search Form */}
      <div className="glass p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Type ID
            </label>
            <input
              type="text"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              placeholder="34"
              className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary focus:border-accent-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Item Name (Optional)
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Tritanium"
              className="w-full px-4 py-2 bg-space-dark border border-accent-cyan/30 rounded text-text-primary focus:border-accent-cyan focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading || !typeId}
          className="w-full btn-primary mt-4"
        >
          {loading ? 'Loading...' : 'Analyze Trends'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {historyData.length > 0 && (
        <>
          {/* View Mode Selector */}
          <div className="glass p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'day'
                    ? 'bg-accent-cyan text-space-black'
                    : 'bg-space-dark text-text-secondary hover:text-text-primary'
                }`}
              >
                Day of Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'month'
                    ? 'bg-accent-cyan text-space-black'
                    : 'bg-space-dark text-text-secondary hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('weekend')}
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'weekend'
                    ? 'bg-accent-cyan text-space-black'
                    : 'bg-space-dark text-text-secondary hover:text-text-primary'
                }`}
              >
                Weekday vs Weekend
              </button>
            </div>
          </div>

          {/* Trend Overview */}
          {trendAnalysis && (
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Price Trend Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-space-dark/50 rounded p-4">
                  <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                    30-Day Average
                  </div>
                  <div className="text-xl font-mono font-bold text-cyan-400">
                    {formatISK(trendAnalysis.avg30Days)}
                  </div>
                </div>

                <div className="bg-space-dark/50 rounded p-4">
                  <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                    90-Day Average
                  </div>
                  <div className="text-xl font-mono font-bold text-purple-400">
                    {formatISK(trendAnalysis.avg90Days)}
                  </div>
                </div>

                <div className="bg-space-dark/50 rounded p-4">
                  <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                    Trend
                  </div>
                  <div className="flex items-center gap-2">
                    {trendAnalysis.trend === 'up' && (
                      <>
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xl font-bold text-green-400">
                          +{trendAnalysis.change.toFixed(1)}%
                        </span>
                      </>
                    )}
                    {trendAnalysis.trend === 'down' && (
                      <>
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                        <span className="text-xl font-bold text-red-400">
                          {trendAnalysis.change.toFixed(1)}%
                        </span>
                      </>
                    )}
                    {trendAnalysis.trend === 'stable' && (
                      <span className="text-xl font-bold text-yellow-400">Stable</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Day of Week Analysis */}
          {viewMode === 'day' && dayOfWeekAnalysis && (
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Day of Week Analysis
              </h3>

              {/* Best Buy/Sell Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-500/20 border border-green-500/30 rounded p-4">
                  <div className="text-sm text-green-400 font-semibold mb-2">
                    Best Day to Buy
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {dayOfWeekAnalysis.bestBuyDay.day}
                  </div>
                  <div className="text-sm font-mono text-green-400 mt-1">
                    Avg: {formatISK(dayOfWeekAnalysis.bestBuyDay.avgPrice)}
                  </div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/30 rounded p-4">
                  <div className="text-sm text-purple-400 font-semibold mb-2">
                    Best Day to Sell
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {dayOfWeekAnalysis.bestSellDay.day}
                  </div>
                  <div className="text-sm font-mono text-purple-400 mt-1">
                    Avg: {formatISK(dayOfWeekAnalysis.bestSellDay.avgPrice)}
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="space-y-2">
                {dayOfWeekAnalysis.data.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-text-secondary">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`h-8 rounded flex items-center justify-between px-4 ${getHeatmapColor(
                          day.avgPrice,
                          dayOfWeekAnalysis.minPrice,
                          dayOfWeekAnalysis.maxPrice
                        )}`}
                      >
                        <span className="text-sm font-semibold text-white">
                          {formatISK(day.avgPrice)}
                        </span>
                        <span className="text-xs text-white/80">
                          Vol: {formatCompact(day.avgVolume)}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-xs text-text-secondary text-right">
                      {day.count} days
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Lowest</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Average</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Highest</span>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Analysis */}
          {viewMode === 'month' && monthlyAnalysis && (
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Monthly Analysis
              </h3>

              {/* Best Buy/Sell Months */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-500/20 border border-green-500/30 rounded p-4">
                  <div className="text-sm text-green-400 font-semibold mb-2">
                    Best Month to Buy
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {monthlyAnalysis.bestBuyMonth.month}
                  </div>
                  <div className="text-sm font-mono text-green-400 mt-1">
                    Avg: {formatISK(monthlyAnalysis.bestBuyMonth.avgPrice)}
                  </div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/30 rounded p-4">
                  <div className="text-sm text-purple-400 font-semibold mb-2">
                    Best Month to Sell
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {monthlyAnalysis.bestSellMonth.month}
                  </div>
                  <div className="text-sm font-mono text-purple-400 mt-1">
                    Avg: {formatISK(monthlyAnalysis.bestSellMonth.avgPrice)}
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {monthlyAnalysis.data.map((month) => (
                  <div
                    key={month.month}
                    className={`p-4 rounded ${getHeatmapColor(
                      month.avgPrice,
                      monthlyAnalysis.minPrice,
                      monthlyAnalysis.maxPrice
                    )}`}
                  >
                    <div className="text-sm font-semibold text-white mb-1">
                      {month.month.substring(0, 3)}
                    </div>
                    <div className="text-xs font-mono text-white">
                      {formatISK(month.avgPrice, false)}
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      {month.count} days
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekday vs Weekend Analysis */}
          {viewMode === 'weekend' && weekdayWeekendAnalysis && (
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Weekday vs Weekend Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekday */}
                <div className="bg-space-dark/50 rounded p-6">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4">
                    Weekdays
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Average Price
                      </div>
                      <div className="text-xl font-mono font-bold text-text-primary">
                        {formatISK(weekdayWeekendAnalysis.weekday.avgPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Average Volume
                      </div>
                      <div className="text-xl font-mono font-bold text-text-primary">
                        {formatCompact(weekdayWeekendAnalysis.weekday.avgVolume)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Data Points
                      </div>
                      <div className="text-xl font-mono font-bold text-text-primary">
                        {weekdayWeekendAnalysis.weekday.count}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekend */}
                <div className="bg-space-dark/50 rounded p-6">
                  <h4 className="text-lg font-semibold text-purple-400 mb-4">
                    Weekends
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Average Price
                      </div>
                      <div className="text-xl font-mono font-bold text-text-primary">
                        {formatISK(weekdayWeekendAnalysis.weekend.avgPrice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Average Volume
                      </div>
                      <div className="text-xl font-mono font-bold text-text-primary">
                        {formatCompact(weekdayWeekendAnalysis.weekend.avgVolume)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary mb-1">
                        Data Points
                      </div>
                      <div className="text-xl font-mono font-bold text-text-primary">
                        {weekdayWeekendAnalysis.weekend.count}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="mt-6 bg-space-dark/30 rounded p-4">
                <h5 className="text-sm font-semibold text-text-primary mb-3">
                  Comparison
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-text-secondary mb-1">
                      Price Difference
                    </div>
                    <div className={`text-lg font-mono font-bold ${
                      weekdayWeekendAnalysis.priceDiff > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {weekdayWeekendAnalysis.priceDiff > 0 ? '+' : ''}
                      {formatISK(weekdayWeekendAnalysis.priceDiff)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Weekend vs Weekday
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary mb-1">
                      Volume Difference
                    </div>
                    <div className={`text-lg font-mono font-bold ${
                      weekdayWeekendAnalysis.volumeDiff > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {weekdayWeekendAnalysis.volumeDiff > 0 ? '+' : ''}
                      {formatCompact(weekdayWeekendAnalysis.volumeDiff)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Weekend vs Weekday
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-accent-cyan/10 border border-accent-cyan/20 rounded">
                  <div className="text-sm text-accent-cyan">
                    <strong>Trading Tip:</strong>{' '}
                    {weekdayWeekendAnalysis.priceDiff < 0
                      ? 'Weekdays show lower prices on average - consider buying during the week.'
                      : 'Weekends show lower prices on average - consider buying on weekends.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {historyData.length === 0 && !loading && (
        <div className="glass p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Data Yet
          </h3>
          <p className="text-text-secondary">
            Enter a region and type ID to analyze seasonal price trends
          </p>
        </div>
      )}
    </div>
  );
}

export default SeasonalTrends;
