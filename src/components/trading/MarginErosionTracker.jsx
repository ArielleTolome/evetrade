import { useState, useMemo, useEffect, useCallback } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatISK, formatPercent, formatRelativeTime } from '../../utils/formatters';

/**
 * MarginErosionTracker Component
 * @description Tracks margin changes over time for watched items
 * Shows historical trends and alerts when margins drop below threshold
 *
 * @component
 * @example
 * <MarginErosionTracker />
 */
export function MarginErosionTracker() {
  const STORAGE_KEY = 'evetrade_margin_tracker';

  // Load watched items from localStorage
  const loadWatchedItems = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading watched items:', error);
    }
    return [];
  };

  const [watchedItems, setWatchedItems] = useState(loadWatchedItems);
  const [alertThreshold, setAlertThreshold] = useState(5); // 5% default
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    buyPrice: '',
    sellPrice: '',
  });

  // Save to localStorage whenever watchedItems changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedItems));
    } catch (error) {
      console.error('Error saving watched items:', error);
    }
  }, [watchedItems]);

  // Add new item to watch list
  const addItem = useCallback(() => {
    if (!newItem.name || !newItem.buyPrice || !newItem.sellPrice) {
      return;
    }

    const buyPrice = parseFloat(newItem.buyPrice);
    const sellPrice = parseFloat(newItem.sellPrice);

    if (buyPrice <= 0 || sellPrice <= 0) {
      return;
    }

    const margin = ((sellPrice - buyPrice) / buyPrice) * 100;
    const timestamp = new Date().toISOString();

    const item = {
      id: Date.now(),
      name: newItem.name,
      history: [
        {
          timestamp,
          buyPrice,
          sellPrice,
          margin,
        },
      ],
    };

    setWatchedItems(prev => [...prev, item]);
    setNewItem({ name: '', buyPrice: '', sellPrice: '' });
    setShowAddForm(false);
  }, [newItem]);

  // Update existing item with new prices
  const updateItem = useCallback((itemId, buyPrice, sellPrice) => {
    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);

    if (buy <= 0 || sell <= 0) {
      return;
    }

    const margin = ((sell - buy) / buy) * 100;
    const timestamp = new Date().toISOString();

    setWatchedItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            history: [
              ...item.history,
              {
                timestamp,
                buyPrice: buy,
                sellPrice: sell,
                margin,
              },
            ],
          };
        }
        return item;
      })
    );
  }, []);

  // Remove item from watch list
  const removeItem = useCallback((itemId) => {
    setWatchedItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Calculate item statistics
  const getItemStats = useCallback((item) => {
    if (!item.history || item.history.length === 0) {
      return null;
    }

    const history = item.history;
    const latest = history[history.length - 1];
    const oldest = history[0];

    const marginChange = latest.margin - oldest.margin;
    const marginChangePercent = oldest.margin !== 0 ? (marginChange / oldest.margin) * 100 : 0;

    // Calculate trend (linear regression slope)
    let trend = 'stable';
    if (history.length >= 3) {
      const recentMargins = history.slice(-5).map(h => h.margin);
      const avgRecent = recentMargins.reduce((a, b) => a + b, 0) / recentMargins.length;
      const avgOverall = history.map(h => h.margin).reduce((a, b) => a + b, 0) / history.length;

      if (avgRecent < avgOverall - 1) {
        trend = 'declining';
      } else if (avgRecent > avgOverall + 1) {
        trend = 'improving';
      }
    }

    // Time until unprofitable (simple linear extrapolation)
    let timeToUnprofitable = null;
    if (trend === 'declining' && history.length >= 2) {
      const timespan = (new Date(latest.timestamp) - new Date(oldest.timestamp)) / (1000 * 60 * 60); // hours
      const rateOfDecline = marginChange / timespan; // margin percent per hour

      if (rateOfDecline < 0 && latest.margin > 0) {
        timeToUnprofitable = latest.margin / Math.abs(rateOfDecline); // hours
      }
    }

    const isAlert = latest.margin < alertThreshold;

    return {
      latest,
      oldest,
      marginChange,
      marginChangePercent,
      trend,
      timeToUnprofitable,
      isAlert,
      dataPoints: history.length,
    };
  }, [alertThreshold]);

  // Generate mini sparkline path
  const generateSparkline = useCallback((history) => {
    if (!history || history.length < 2) {
      return '';
    }

    const margins = history.map(h => h.margin);
    const minMargin = Math.min(...margins);
    const maxMargin = Math.max(...margins);
    const range = maxMargin - minMargin || 1;

    const width = 100;
    const height = 30;
    const points = history.map((h, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((h.margin - minMargin) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, []);

  return (
    <GlassmorphicCard className="max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-accent-cyan/20">
          <div>
            <h2 className="text-2xl font-display font-bold text-text-primary flex items-center gap-3">
              <svg className="w-7 h-7 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Margin Erosion Tracker
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Monitor how profit margins change over time and get alerted to declining opportunities
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-lg bg-accent-cyan/20 border border-accent-cyan hover:bg-accent-cyan/30 text-accent-cyan transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {/* Alert Threshold Setting */}
        <div className="p-4 rounded-lg bg-accent-gold/10 border border-accent-gold/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <label className="text-sm font-medium text-text-primary">Alert Threshold</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(parseFloat(e.target.value))}
                className="w-32 h-2 bg-space-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-gold"
              />
              <div className="w-20 text-right">
                <span className="text-lg font-bold font-mono text-accent-gold">
                  {alertThreshold}%
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs text-text-secondary mt-2">
            Get alerted when margin drops below this threshold
          </div>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="p-4 rounded-lg bg-space-dark/30 border border-accent-cyan/30 animate-slide-up">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Add New Item to Watch</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan"
                  placeholder="e.g., PLEX"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Current Buy Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.buyPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, buyPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Current Sell Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.sellPrice}
                  onChange={(e) => setNewItem(prev => ({ ...prev, sellPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
                  placeholder="1100000"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={addItem}
                className="px-4 py-2 rounded-lg bg-accent-cyan hover:bg-accent-cyan/80 text-space-dark font-semibold transition-colors"
              >
                Add to Watchlist
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ name: '', buyPrice: '', sellPrice: '' });
                }}
                className="px-4 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Watched Items List */}
        {watchedItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-text-secondary">
              No items being tracked yet. Click "Add Item" to start monitoring margins.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {watchedItems.map(item => {
              const stats = getItemStats(item);
              if (!stats) return null;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    stats.isAlert
                      ? 'bg-red-400/10 border-red-400/50 animate-pulse-slow'
                      : 'bg-space-dark/30 border-accent-cyan/20 hover:border-accent-cyan/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">{item.name}</h3>
                        {stats.isAlert && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-red-400/20 text-red-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Low Margin Alert
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          stats.trend === 'declining' ? 'bg-red-400/20 text-red-400' :
                          stats.trend === 'improving' ? 'bg-green-400/20 text-green-400' :
                          'bg-accent-cyan/20 text-accent-cyan'
                        }`}>
                          {stats.trend === 'declining' ? '↓ Declining' :
                           stats.trend === 'improving' ? '↑ Improving' :
                           '→ Stable'}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Tracking for {formatRelativeTime(stats.oldest.timestamp)} • {stats.dataPoints} data points
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-text-secondary hover:text-red-400 transition-colors"
                      title="Remove from watchlist"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Current Margin */}
                    <div className="p-3 rounded-lg bg-space-dark/50">
                      <div className="text-xs text-text-secondary mb-1">Current Margin</div>
                      <div className={`text-xl font-bold font-mono ${
                        stats.latest.margin < alertThreshold ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {stats.latest.margin.toFixed(2)}%
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {formatISK(stats.latest.sellPrice - stats.latest.buyPrice)} profit
                      </div>
                    </div>

                    {/* Margin Change */}
                    <div className="p-3 rounded-lg bg-space-dark/50">
                      <div className="text-xs text-text-secondary mb-1">Margin Change</div>
                      <div className={`text-xl font-bold font-mono ${
                        stats.marginChange >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stats.marginChange >= 0 ? '+' : ''}{stats.marginChange.toFixed(2)}%
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {stats.marginChangePercent >= 0 ? '+' : ''}{stats.marginChangePercent.toFixed(1)}% overall
                      </div>
                    </div>

                    {/* Latest Prices */}
                    <div className="p-3 rounded-lg bg-space-dark/50">
                      <div className="text-xs text-text-secondary mb-1">Latest Prices</div>
                      <div className="text-sm font-mono text-text-primary">
                        <div>Buy: {formatISK(stats.latest.buyPrice)}</div>
                        <div>Sell: {formatISK(stats.latest.sellPrice)}</div>
                      </div>
                    </div>

                    {/* Time to Unprofitable */}
                    <div className="p-3 rounded-lg bg-space-dark/50">
                      <div className="text-xs text-text-secondary mb-1">Est. Time Left</div>
                      {stats.timeToUnprofitable ? (
                        <>
                          <div className="text-xl font-bold font-mono text-accent-gold">
                            {stats.timeToUnprofitable < 24
                              ? `${stats.timeToUnprofitable.toFixed(1)}h`
                              : `${(stats.timeToUnprofitable / 24).toFixed(1)}d`
                            }
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            Until unprofitable
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-text-secondary">
                          {stats.trend === 'improving' ? 'Improving' : 'Stable'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mini Chart */}
                  {item.history.length >= 2 && (
                    <div className="mb-4">
                      <div className="text-xs text-text-secondary mb-2">Margin History</div>
                      <svg viewBox="0 0 100 30" className="w-full h-12" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`gradient-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={stats.trend === 'declining' ? '#f87171' : '#4ade80'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={stats.trend === 'declining' ? '#f87171' : '#4ade80'} stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`${generateSparkline(item.history)} L 100,30 L 0,30 Z`}
                          fill={`url(#gradient-${item.id})`}
                        />
                        <path
                          d={generateSparkline(item.history)}
                          fill="none"
                          stroke={stats.trend === 'declining' ? '#f87171' : '#4ade80'}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Update Prices Form */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-2">
                      <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Update Prices
                    </summary>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">New Buy Price</label>
                        <input
                          type="number"
                          step="0.01"
                          id={`buy-${item.id}`}
                          className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
                          placeholder={stats.latest.buyPrice.toString()}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">New Sell Price</label>
                        <input
                          type="number"
                          step="0.01"
                          id={`sell-${item.id}`}
                          className="w-full px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary focus:outline-none focus:border-accent-cyan font-mono"
                          placeholder={stats.latest.sellPrice.toString()}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          onClick={() => {
                            const buyInput = document.getElementById(`buy-${item.id}`);
                            const sellInput = document.getElementById(`sell-${item.id}`);
                            if (buyInput && sellInput) {
                              updateItem(item.id, buyInput.value, sellInput.value);
                              buyInput.value = '';
                              sellInput.value = '';
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-accent-cyan hover:bg-accent-cyan/80 text-space-dark font-semibold transition-colors"
                        >
                          Add Data Point
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
          <svg className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-text-secondary">
            <p className="mb-2">
              <strong className="text-text-primary">How to use:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Add items you actively trade to track their margin changes over time</li>
              <li>Update prices regularly (daily or when you notice changes) for accurate trend analysis</li>
              <li>Set alert threshold to get warned when margins become too thin</li>
              <li>The "Time Left" estimate assumes linear decline - actual market behavior may vary</li>
              <li>Use this data to decide when to exit a trade or find new opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}

export default MarginErosionTracker;
