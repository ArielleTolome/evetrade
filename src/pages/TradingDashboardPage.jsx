import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import PullToRefresh from '../components/common/PullToRefresh';
import { Button } from '../components/common/Button';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { useToast } from '../components/common/ToastProvider';
import { formatISK, formatPercent, formatRelativeTime } from '../utils/formatters';

/**
 * Trading Dashboard Page
 * A comprehensive command center for EVE Online traders
 * Features quick-action panels for opportunities, alerts, watchlists, and statistics
 */
export function TradingDashboardPage() {
  const { currentList, removeFromWatchlist, addToWatchlist } = useWatchlist();
  const { triggeredAlerts, dismissTriggered, settings, updateSettings } = usePriceAlerts();
  const toast = useToast();
  const { stats } = useTradeHistory();

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
    salesTax: 2.5,
  });

  const [copiedItem, setCopiedItem] = useState(null);
  const [minProfit, setMinProfit] = useState('1000000');
  const [maxInvestment, setMaxInvestment] = useState('100000000');

  // Mock top opportunities data (in production, this would come from API)
  const mockStationTrades = useMemo(() => [
    { item: 'PLEX', itemId: 44992, buyPrice: 3450000, sellPrice: 3500000, profit: 50000, margin: 1.45, volume: 15000 },
    { item: 'Skill Injector', itemId: 40520, buyPrice: 825000000, sellPrice: 850000000, profit: 25000000, margin: 3.03, volume: 2500 },
    { item: 'Skill Extractor', itemId: 40519, buyPrice: 310000000, sellPrice: 320000000, profit: 10000000, margin: 3.23, volume: 1800 },
    { item: 'Expanded Cargohold II', itemId: 1317, buyPrice: 45000000, sellPrice: 48000000, profit: 3000000, margin: 6.67, volume: 850 },
    { item: 'Large Shield Extender II', itemId: 3841, buyPrice: 3200000, sellPrice: 3400000, profit: 200000, margin: 6.25, volume: 5200 },
  ], []);

  const mockHaulingRoutes = useMemo(() => [
    { item: 'Tritanium', from: 'Jita', to: 'Amarr', iskPerJump: 125000, profit: 2500000, jumps: 20, volume: 45000 },
    { item: 'Pyerite', from: 'Jita', to: 'Dodixie', iskPerJump: 98000, profit: 1470000, jumps: 15, volume: 38000 },
    { item: 'Mexallon', from: 'Amarr', to: 'Rens', iskPerJump: 85000, profit: 1785000, jumps: 21, volume: 29000 },
    { item: 'Isogen', from: 'Dodixie', to: 'Jita', iskPerJump: 72000, profit: 1080000, jumps: 15, volume: 32000 },
    { item: 'Nocxium', from: 'Hek', to: 'Jita', iskPerJump: 65000, profit: 1170000, jumps: 18, volume: 18500 },
  ], []);

  // Mock market pulse data
  const marketPulse = useMemo(() => ({
    totalVolume: 1245000000000,
    volumeChange: 5.2,
    activeItems: 8547,
    topMovers: [
      { item: 'PLEX', change: 12.5, direction: 'up' },
      { item: 'Skill Injector', change: -3.2, direction: 'down' },
      { item: 'Tritanium', change: 8.7, direction: 'up' },
      { item: 'Compressed Ore', change: -5.1, direction: 'down' },
    ],
    mostActive: [
      { item: 'PLEX', volume: 145000 },
      { item: 'Tritanium', volume: 98000000 },
      { item: 'Skill Injector', volume: 8500 },
    ],
  }), []);

  // Filter opportunities based on user criteria
  const filteredStationTrades = useMemo(() => {
    const minProfitValue = parseFloat(minProfit) || 0;
    const maxInvestValue = parseFloat(maxInvestment) || Infinity;
    return mockStationTrades.filter(
      trade => trade.profit >= minProfitValue && trade.buyPrice <= maxInvestValue
    );
  }, [mockStationTrades, minProfit, maxInvestment]);

  const filteredHaulingRoutes = useMemo(() => {
    const minProfitValue = parseFloat(minProfit) || 0;
    return mockHaulingRoutes.filter(route => route.profit >= minProfitValue);
  }, [mockHaulingRoutes, minProfit]);

  // Calculate quick trade results
  const calcResults = useMemo(() => {
    const buy = parseFloat(quickCalc.buyPrice) || 0;
    const sell = parseFloat(quickCalc.sellPrice) || 0;
    const qty = parseFloat(quickCalc.quantity) || 1;
    const broker = parseFloat(quickCalc.brokerFee) / 100 || 0;
    const tax = parseFloat(quickCalc.salesTax) / 100 || 0;

    const buyTotal = buy * qty;
    const sellTotal = sell * qty;
    const brokerFees = buyTotal * broker + sellTotal * broker;
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

  // Session duration with live updates - use state with interval instead of useMemo
  // to avoid Date.now() during render (React 19 purity rules)
  const [sessionDuration, setSessionDuration] = useState(() =>
    Math.floor((Date.now() - sessionStats.startTime) / 1000)
  );

  // Update session duration every second for live timer
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

  // Save session to localStorage
  useEffect(() => {
    localStorage.setItem('evetrade_current_session', JSON.stringify(sessionStats));
  }, [sessionStats]);

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Copy trade details formatted
  const copyTradeDetails = useCallback((trade) => {
    const text = `${trade.item}
Buy: ${formatISK(trade.buyPrice)}
Sell: ${formatISK(trade.sellPrice)}
Profit: ${formatISK(trade.profit)}
Margin: ${trade.margin.toFixed(2)}%
Volume: ${trade.volume.toLocaleString()}`;
    copyToClipboard(text, trade.item);
  }, [copyToClipboard]);

  // Copy calculator result
  const copyCalcResult = useCallback(() => {
    const text = `Item: ${quickCalc.itemName || 'N/A'}
Quantity: ${quickCalc.quantity || 1}
Buy Price: ${formatISK(calcResults.buyTotal)}
Sell Price: ${formatISK(calcResults.sellTotal)}
Gross Profit: ${formatISK(calcResults.grossProfit)}
Fees & Taxes: ${formatISK(calcResults.brokerFees + calcResults.salesTaxes)}
Net Profit: ${formatISK(calcResults.netProfit)}
ROI: ${calcResults.roi.toFixed(2)}%`;
    copyToClipboard(text, 'Calculator Result');
  }, [quickCalc, calcResults, copyToClipboard]);

  // Reset session
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
    // In a real app, you'd re-fetch data here.
    // For this mock-data page, we'll just show a toast.
    toast.info('Dashboard data refreshed!');
  }, [toast]);

  // Add ISK to session
  const addSessionISK = useCallback((amount) => {
    setSessionStats(prev => ({
      ...prev,
      iskEarned: prev.iskEarned + amount,
      tradesCompleted: prev.tradesCompleted + 1,
    }));
  }, []);

  return (
    <PageLayout
      title="Trading Dashboard"
      subtitle="Your command center for EVE Online trading"
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Top Opportunities Panel */}
            <GlassmorphicCard className="md:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display text-accent-cyan">Top Opportunities</h2>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min Profit"
                    value={minProfit}
                    onChange={(e) => setMinProfit(e.target.value)}
                    className="w-32 px-3 py-1 text-sm bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Investment"
                    value={maxInvestment}
                    onChange={(e) => setMaxInvestment(e.target.value)}
                    className="w-36 px-3 py-1 text-sm bg-space-black/50 border border-accent-cyan/30 rounded-lg text-text-primary focus:border-accent-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Station Trading */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Station Trades (Margin Trading)</h3>
                  <div className="space-y-2">
                    {filteredStationTrades.slice(0, 5).map((trade, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-space-black/30 border border-accent-cyan/10 rounded-lg hover:border-accent-cyan/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-text-primary">{trade.item}</div>
                            <div className="text-xs text-text-secondary mt-1">
                              Buy: {formatISK(trade.buyPrice)} | Sell: {formatISK(trade.sellPrice)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-accent-gold">{formatISK(trade.profit)}</div>
                            <div className="text-xs text-green-400">{trade.margin.toFixed(2)}% margin</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => copyToClipboard(trade.item, trade.item)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
                          >
                            {copiedItem === trade.item ? 'Copied!' : 'Copy Name'}
                          </Button>
                          <Button
                            onClick={() => copyTradeDetails(trade)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
                          >
                            Copy Details
                          </Button>
                          <Button
                            onClick={() => addToWatchlist({
                              'Item ID': trade.itemId,
                              'Item': trade.item,
                              'Buy Price': trade.buyPrice,
                              'Sell Price': trade.sellPrice
                            })}
                            variant="secondary"
                            size="sm"
                            className="px-2 py-1 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 border-transparent"
                            title="Add to watchlist"
                          >
                            Watch
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hauling Routes */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Hauling Routes (ISK/Jump)</h3>
                  <div className="space-y-2">
                    {filteredHaulingRoutes.slice(0, 5).map((route, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-space-black/30 border border-accent-cyan/10 rounded-lg hover:border-accent-cyan/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-text-primary">{route.item}</div>
                            <div className="text-xs text-text-secondary mt-1">
                              {route.from} → {route.to} ({route.jumps} jumps)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-accent-gold">{formatISK(route.iskPerJump)}/jump</div>
                            <div className="text-xs text-green-400">{formatISK(route.profit)} total</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => copyToClipboard(route.item, route.item)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
                          >
                            {copiedItem === route.item ? 'Copied!' : 'Copy Name'}
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(`${route.item}\n${route.from} → ${route.to}\n${route.jumps} jumps\n${formatISK(route.profit)} profit`, route.item + '_details')}
                            variant="secondary"
                            size="sm"
                            className="flex-1 px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
                          >
                            Copy Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.soundEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                    />
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
                    <div
                      key={alert.id}
                      className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                    >
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
                  <p className="text-xs mt-1">Add items from opportunities above</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {currentList.items.map((item) => {
                    const initialSell = item.initialPrice?.sell;
                    const currentSell = item.currentPrice?.sell;
                    const priceChange =
                      typeof currentSell === 'number' &&
                      typeof initialSell === 'number' &&
                      initialSell !== 0
                        ? ((currentSell - initialSell) / initialSell) * 100
                        : null;

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-space-black/30 border border-accent-cyan/10 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-text-primary">{item.name}</div>
                            <div className="text-xs text-text-secondary mt-1">
                              Buy: {formatISK(item.currentPrice?.buy || item.initialPrice.buy)}
                            </div>
                            <div className="text-xs text-text-secondary">
                              Sell: {formatISK(item.currentPrice?.sell || item.initialPrice.sell)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-bold ${priceChange === null
                                ? 'text-text-secondary'
                                : priceChange >= 0
                                  ? 'text-green-400'
                                  : 'text-red-400'
                                }`}
                            >
                              {priceChange === null
                                ? '—'
                                : `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`}
                            </div>
                            {priceChange !== null && priceChange !== 0 && (
                              <div className="text-xs text-text-secondary">
                                {priceChange >= 0 ? '↑' : '↓'} from initial
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => copyToClipboard(item.name, item.name)}
                            variant="secondary"
                            size="sm"
                            className="flex-1 px-2 py-1 text-xs bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border-transparent"
                          >
                            {copiedItem === item.name ? 'Copied!' : 'Copy'}
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

            {/* Market Pulse */}
            <GlassmorphicCard>
              <h2 className="text-xl font-display text-accent-cyan mb-4">Market Pulse</h2>

              <div className="space-y-4">
                {/* Overall Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-space-black/30 rounded-lg">
                    <div className="text-xs text-text-secondary">Total Volume</div>
                    <div className="text-lg font-bold text-text-primary">{formatISK(marketPulse.totalVolume, false)}</div>
                    <div className={`text-xs ${marketPulse.volumeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketPulse.volumeChange >= 0 ? '↑' : '↓'} {Math.abs(marketPulse.volumeChange)}%
                    </div>
                  </div>
                  <div className="p-3 bg-space-black/30 rounded-lg">
                    <div className="text-xs text-text-secondary">Active Items</div>
                    <div className="text-lg font-bold text-text-primary">{marketPulse.activeItems.toLocaleString()}</div>
                    <div className="text-xs text-text-secondary">Being traded</div>
                  </div>
                </div>

                {/* Top Movers */}
                <div>
                  <h3 className="text-xs font-medium text-text-secondary mb-2">Price Movers (24h)</h3>
                  <div className="space-y-1">
                    {marketPulse.topMovers.map((mover, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-space-black/20 rounded">
                        <span className="text-sm text-text-primary">{mover.item}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${mover.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {mover.direction === 'up' ? '+' : ''}{mover.change.toFixed(1)}%
                          </span>
                          <span className={`text-xs ${mover.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {mover.direction === 'up' ? '↑' : '↓'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Active */}
                <div>
                  <h3 className="text-xs font-medium text-text-secondary mb-2">Most Active</h3>
                  <div className="space-y-1">
                    {marketPulse.mostActive.map((active, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-space-black/20 rounded">
                        <span className="text-sm text-text-primary">{active.item}</span>
                        <span className="text-sm text-accent-cyan">{active.volume.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

                {/* Results */}
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

                <Button
                  onClick={copyCalcResult}
                  variant="secondary"
                  className="w-full py-2 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 font-medium border-transparent"
                >
                  {copiedItem === 'Calculator Result' ? 'Copied!' : 'Copy Result'}
                </Button>
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
                {/* Main Stats Grid */}
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

                {/* Quick Add Buttons */}
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

                {/* Historical Stats (if available) */}
                {stats && (
                  <div className="border-t border-accent-cyan/20 pt-3">
                    <div className="text-xs text-text-secondary mb-2">All-Time Stats:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Total Profit:</span>
                        <span className="text-text-primary font-bold">{formatISK(stats.totalProfit || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Win Rate:</span>
                        <span className="text-text-primary">{formatPercent(stats.winRate || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Total Trades:</span>
                        <span className="text-text-primary">{stats.completedTrades || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </GlassmorphicCard>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
            <h3 className="text-sm font-medium text-accent-cyan mb-2">Dashboard Quick Tips</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Use filters to find opportunities matching your ISK budget and profit goals</li>
              <li>• Click "Watch" to add items to your watchlist for price tracking</li>
              <li>• Active alerts will appear when your price conditions are met</li>
              <li>• Use the Quick Calculator to evaluate trades before executing them</li>
              <li>• Session stats track your performance in real-time - reset when starting a new session</li>
            </ul>
          </div>
        </div>
      </PullToRefresh>
    </PageLayout>
  );
}

export default TradingDashboardPage;
