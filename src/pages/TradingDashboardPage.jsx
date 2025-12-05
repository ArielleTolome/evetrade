// HMR Force Update 2
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import PullToRefresh from '../components/common/PullToRefresh';
import { Button } from '../components/common/Button';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
// import { useTradeHistory } from '../hooks/useTradeHistory';
import { useToast } from '../components/common/ToastProvider';
import { formatISK, formatPercent, formatRelativeTime } from '../utils/formatters';
import { getMarketOrders, getMarketHistory } from '../api/esi';

// Key market indices to track (Type IDs)
const MARKET_INDICES = [
  { id: 44992, name: 'PLEX' },
  { id: 40520, name: 'Skill Injector' },
  { id: 29668, name: 'Multi-Pilot Training' },
  { id: 40519, name: 'Skill Extractor' },
];

const REGION_THE_FORGE = 10000002;

/**
 * Trading Dashboard Page
 * A comprehensive command center for EVE Online traders
 * Features real-time market indices, alerts, watchlists, and statistics
 */
export function TradingDashboardPage() {
  const { currentList, removeFromWatchlist, addToWatchlist } = useWatchlist();
  const { triggeredAlerts, dismissTriggered, settings, updateSettings } = usePriceAlerts();
  const toast = useToast();
  // const { stats } = useTradeHistory();
  const mounted = useRef(true);

  // Market Data State
  const [indicesData, setIndicesData] = useState([]);
  const [isLoadingIndices, setIsLoadingIndices] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [sessionStats, setSessionStats] = useState(() => {
    const stored = localStorage.getItem('evetrade_current_session');
    return stored ? JSON.parse(stored) : {
      startTime: Date.now(),
      iskEarned: 0,
      tradesCompleted: 0,
    };
  });

  const [quickCalc, setQuickCalc] = useState({
    itemName: '',
    buyPrice: '',
    sellPrice: '',
    quantity: '',
    brokerFee: 3.0,
    salesTax: 8.0,
  });

  // const [copiedItem, setCopiedItem] = useState(null);

  // Fetch Market Indices Data
  const fetchMarketData = useCallback(async () => {
    if (!mounted.current) return;
    setIsLoadingIndices(true);

    try {
      const promises = MARKET_INDICES.map(async (item) => {
        try {
          // Fetch orders to get current best prices
          const orders = await getMarketOrders(REGION_THE_FORGE, item.id);
          const sellOrders = orders.filter(o => !o.is_buy_order).sort((a, b) => a.price - b.price);
          const buyOrders = orders.filter(o => o.is_buy_order).sort((a, b) => b.price - a.price);

          const bestSell = sellOrders[0]?.price || 0;
          const bestBuy = buyOrders[0]?.price || 0;
          const sellVolume = sellOrders.reduce((acc, o) => acc + o.volume_remain, 0);

          // Fetch history for 24h change (simplified: compare to yesterday's average)
          const history = await getMarketHistory(REGION_THE_FORGE, item.id);
          const yesterday = history[history.length - 1];
          const averagePrice = yesterday ? yesterday.average : bestSell;

          const change = bestSell > 0 && averagePrice > 0
            ? ((bestSell - averagePrice) / averagePrice) * 100
            : 0;

          return {
            ...item,
            buyPrice: bestBuy,
            sellPrice: bestSell,
            volume: sellVolume,
            change: change,
            trend: change >= 0 ? 'up' : 'down'
          };
        } catch (err) {
          console.error(`Failed to fetch data for ${item.name}`, err);
          return { ...item, error: true };
        }
      });

      const results = await Promise.all(promises);
      if (mounted.current) {
        setIndicesData(results);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching market indices:", error);
      if (mounted.current) toast.error("Failed to load market data");
    } finally {
      if (mounted.current) setIsLoadingIndices(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    mounted.current = true;
    fetchMarketData();
    return () => { mounted.current = false; };
  }, [fetchMarketData]);

  // Calculate quick trade results
  const calcResults = useMemo(() => {
    const buy = parseFloat(quickCalc.buyPrice) || 0;
    const sell = parseFloat(quickCalc.sellPrice) || 0;
    const qty = parseFloat(quickCalc.quantity) || 1;
    const broker = parseFloat(quickCalc.brokerFee) / 100 || 0;
    const tax = parseFloat(quickCalc.salesTax) / 100 || 0;

    const buyTotal = buy * qty;
    const sellTotal = sell * qty;
    const brokerFees = (buyTotal * broker) + (sellTotal * broker);
    const salesTaxes = sellTotal * tax;
    const grossProfit = sellTotal - buyTotal;
    const netProfit = grossProfit - brokerFees - salesTaxes;
    const roi = buyTotal > 0 ? (netProfit / buyTotal) * 100 : 0;

    return {
      buyTotal,
      sellTotal,
      brokerFees,
      salesTaxes,
      grossProfit,
      netProfit,
      roi,
    };
  }, [quickCalc]);

  // Session duration timer
  const [sessionDuration, setSessionDuration] = useState(() =>
    Math.floor((Date.now() - sessionStats.startTime) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStats.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStats.startTime]);

  const iskPerHour = useMemo(() => {
    const hours = sessionDuration / 3600;
    return hours > 0 ? sessionStats.iskEarned / hours : 0;
  }, [sessionStats.iskEarned, sessionDuration]);

  // Save session
  useEffect(() => {
    localStorage.setItem('evetrade_current_session', JSON.stringify(sessionStats));
  }, [sessionStats]);

  // const copyToClipboard = useCallback(async (text, label) => {
  //   try {
  //     await navigator.clipboard.writeText(text);
  //     setCopiedItem(label);
  //     setTimeout(() => setCopiedItem(null), 2000);
  //   } catch (err) {
  //     console.error('Failed to copy:', err);
  //   }
  // }, []);

  const resetSession = useCallback(() => {
    if (window.confirm('Reset current session? This will clear all session stats.')) {
      setSessionStats({
        startTime: Date.now(),
        iskEarned: 0,
        tradesCompleted: 0,
      });
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchMarketData();
    toast.info('Market data refreshed');
  }, [fetchMarketData, toast]);

  const addSessionISK = useCallback((amount) => {
    setSessionStats(prev => ({
      ...prev,
      iskEarned: prev.iskEarned + amount,
      tradesCompleted: prev.tradesCompleted + 1,
    }));
  }, []);

  // Quick action helper to populate calculator
  const populateCalculator = (item) => {
    setQuickCalc(prev => ({
      ...prev,
      itemName: item.name,
      buyPrice: item.buyPrice,
      sellPrice: item.sellPrice
    }));
  };

  return (
    <PageLayout
      title="Trading Dashboard"
      subtitle="Jita 4-4 Market Overview"
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Market Indicators Panel (Replaces Mock Opportunities) */}
            <GlassmorphicCard className="md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-display text-accent-cyan">Market Indicators</h2>
                  <p className="text-xs text-text-secondary">
                    Key Indices • The Forge (Jita) • {lastUpdated ? formatRelativeTime(lastUpdated.toISOString()) : 'Updating...'}
                  </p>
                </div>
                <Button
                  onClick={fetchMarketData}
                  variant="ghost"
                  size="sm"
                  disabled={isLoadingIndices}
                  className="text-accent-cyan hover:bg-accent-cyan/10"
                >
                  <svg className={`w-4 h-4 ${isLoadingIndices ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Button>
              </div>

              {isLoadingIndices && indicesData.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {indicesData.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-space-black/30 border border-accent-cyan/10 rounded-lg hover:border-accent-cyan/30 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
                          {item.name}
                        </div>
                        <div className={`text-xs px-1.5 py-0.5 rounded ${item.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {typeof item.change === 'number' ? (
                            <>
                              {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                            </>
                          ) : (
                            <span className="text-gray-400 text-[10px]">N/A</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Sell:</span>
                          <span className="text-text-primary font-mono">
                            {item.sellPrice ? formatISK(item.sellPrice) : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Buy:</span>
                          <span className="text-text-primary font-mono">
                            {item.buyPrice ? formatISK(item.buyPrice) : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Spread:</span>
                          <span className="text-accent-gold/80">
                            {item.sellPrice && item.buyPrice
                              ? formatPercent(((item.sellPrice - item.buyPrice) / item.sellPrice) * 100)
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => populateCalculator(item)}
                          variant="secondary"
                          size="sm"
                          className="flex-1 py-1 text-xs bg-accent-cyan/5 hover:bg-accent-cyan/10 border-accent-cyan/20"
                        >
                          Calc
                        </Button>
                        <Button
                          onClick={() => addToWatchlist({
                            'Item ID': item.id,
                            'Item': item.name,
                            'Buy Price': item.buyPrice,
                            'Sell Price': item.sellPrice
                          })}
                          variant="secondary"
                          size="sm"
                          className="px-2 py-1 text-xs bg-green-500/5 text-green-400 hover:bg-green-500/10 border-green-500/20"
                          title="Add to watchlist"
                        >
                          Watch
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>

            {/* Active Alerts Panel */}
            <GlassmorphicCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display text-accent-cyan">Active Alerts</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Sound</span>
                  <Button
                    onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                    variant="ghost"
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors p-0 border-none ${settings.soundEnabled ? 'bg-accent-cyan' : 'bg-gray-600'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </Button>
                </div>
              </div>

              {triggeredAlerts.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm">No active alerts</p>
                  <p className="text-xs mt-1">Price alerts will appear here when triggered</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {triggeredAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-yellow-400">{alert.itemName}</div>
                          <div className="text-xs text-text-secondary mt-1">
                            {alert.type} is {alert.condition} {alert.threshold}
                          </div>
                          <div className="text-xs text-text-secondary">
                            Current: {alert.currentValue}
                          </div>
                        </div>
                        <Button
                          onClick={() => dismissTriggered(alert.id)}
                          variant="ghost"
                          size="sm"
                          className="text-text-secondary hover:text-red-400 p-1 h-auto min-h-0"
                          title="Dismiss"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Triggered: {formatRelativeTime(alert.triggeredAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>

            {/* Watchlist Quick View */}
            <GlassmorphicCard>
              <h2 className="text-xl font-display text-accent-cyan mb-4">Watchlist Quick View</h2>
              {currentList.items.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <p className="text-sm">Watchlist is empty</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {currentList.items.map((item) => {
                    const priceChange = item.currentPrice?.sell
                      ? ((item.currentPrice.sell - item.initialPrice.sell) / item.initialPrice.sell) * 100
                      : 0;

                    return (
                      <div key={item.id} className="p-3 bg-space-black/30 border border-accent-cyan/10 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-text-primary">{item.name}</div>
                            <div className="text-xs text-text-secondary mt-1">
                              Sell: {formatISK(item.currentPrice?.sell || item.initialPrice.sell)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => populateCalculator({
                              name: item.name,
                              buyPrice: item.currentPrice?.buy,
                              sellPrice: item.currentPrice?.sell
                            })}
                            variant="secondary"
                            size="sm"
                            className="flex-1 px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
                          >
                            Calc
                          </Button>
                          <Button
                            onClick={() => removeFromWatchlist(item.id)}
                            variant="secondary"
                            size="sm"
                            className="px-2 py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border-transparent"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassmorphicCard>

            {/* Quick Trade Calculator */}
            <GlassmorphicCard>
              <h2 className="text-xl font-display text-accent-cyan mb-4">Quick Trade Calculator</h2>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={quickCalc.itemName}
                  onChange={(e) => setQuickCalc({ ...quickCalc, itemName: e.target.value })}
                  className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Buy Price"
                    value={quickCalc.buyPrice}
                    onChange={(e) => setQuickCalc({ ...quickCalc, buyPrice: e.target.value })}
                    className="px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Sell Price"
                    value={quickCalc.sellPrice}
                    onChange={(e) => setQuickCalc({ ...quickCalc, sellPrice: e.target.value })}
                    className="px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                  />
                </div>

                <input
                  type="number"
                  placeholder="Quantity"
                  value={quickCalc.quantity}
                  onChange={(e) => setQuickCalc({ ...quickCalc, quantity: e.target.value })}
                  className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Broker Fee %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={quickCalc.brokerFee}
                      onChange={(e) => setQuickCalc({ ...quickCalc, brokerFee: e.target.value })}
                      className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Sales Tax %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={quickCalc.salesTax}
                      onChange={(e) => setQuickCalc({ ...quickCalc, salesTax: e.target.value })}
                      className="w-full px-3 py-2 bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-accent-cyan/20 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Gross Profit:</span>
                    <span className={`font-bold ${calcResults.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatISK(calcResults.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Fees & Taxes:</span>
                    <span className="text-text-primary">{formatISK(calcResults.brokerFees + calcResults.salesTaxes)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Net Profit:</span>
                    <span className={`font-bold text-lg ${calcResults.netProfit >= 0 ? 'text-accent-gold' : 'text-red-400'}`}>
                      {formatISK(calcResults.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">ROI:</span>
                    <span className={`font-bold ${calcResults.roi >= 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
                      {calcResults.roi.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Session Stats */}
            <GlassmorphicCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display text-accent-cyan">Session Stats</h2>
                <Button
                  onClick={resetSession}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-text-secondary hover:text-red-400 p-1 h-auto min-h-0"
                  title="Reset session"
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-space-black/30 rounded-lg">
                    <div className="text-xs text-text-secondary mb-1">ISK Earned</div>
                    <div className="text-xl font-bold text-accent-gold">{formatISK(sessionStats.iskEarned)}</div>
                  </div>
                  <div className="p-4 bg-space-black/30 rounded-lg">
                    <div className="text-xs text-text-secondary mb-1">Trades</div>
                    <div className="text-xl font-bold text-text-primary">{sessionStats.tradesCompleted}</div>
                  </div>
                  <div className="p-4 bg-space-black/30 rounded-lg">
                    <div className="text-xs text-text-secondary mb-1">Time Trading</div>
                    <div className="text-xl font-bold text-text-primary">
                      {Math.floor(sessionDuration / 3600)}h {Math.floor((sessionDuration % 3600) / 60)}m
                    </div>
                  </div>
                  <div className="p-4 bg-space-black/30 rounded-lg">
                    <div className="text-xs text-text-secondary mb-1">ISK/Hour</div>
                    <div className="text-xl font-bold text-accent-cyan">{formatISK(iskPerHour, false)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-text-secondary mb-2">Quick Add ISK:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => addSessionISK(1000000)}
                      variant="secondary"
                      size="sm"
                      className="py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-medium border-transparent"
                    >
                      +1M
                    </Button>
                    <Button
                      onClick={() => addSessionISK(10000000)}
                      variant="secondary"
                      size="sm"
                      className="py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-medium border-transparent"
                    >
                      +10M
                    </Button>
                    <Button
                      onClick={() => addSessionISK(100000000)}
                      variant="secondary"
                      size="sm"
                      className="py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-medium border-transparent"
                    >
                      +100M
                    </Button>
                  </div>
                </div>
              </div>
            </GlassmorphicCard>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h3 className="text-sm font-medium text-accent-cyan mb-2">Dashboard Quick Tips</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Market Indicators show live prices from The Forge (Jita)</li>
              <li>• Use the Quick Trade Calculator to profit check before buying</li>
              <li>• Watchlist allows you to track specific items across sessions</li>
              <li>• Set up Price Alerts to be notified of market movements</li>
            </ul>
          </div>
        </div>
      </PullToRefresh>
    </PageLayout>
  );
}

export default TradingDashboardPage;
