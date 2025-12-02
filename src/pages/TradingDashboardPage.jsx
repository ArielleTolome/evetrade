import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { formatISK } from '../utils/formatters';

// Sub-components
import { OpportunitiesPanel } from '../components/trading/OpportunitiesPanel';
import { ActiveAlertsPanel } from '../components/trading/ActiveAlertsPanel';
import { WatchlistQuickView } from '../components/trading/WatchlistQuickView';
import { MarketPulsePanel } from '../components/trading/MarketPulsePanel';
import { QuickTradeCalculator } from '../components/trading/QuickTradeCalculator';
import { SessionStatsPanel } from '../components/trading/SessionStatsPanel';
import { DashboardHeader } from '../components/trading/DashboardHeader';

/**
 * Trading Dashboard Page
 * A comprehensive command center for EVE Online traders
 * Features quick-action panels for opportunities, alerts, watchlists, and statistics
 */
export function TradingDashboardPage() {
  const { currentList, removeFromWatchlist, addToWatchlist } = useWatchlist();
  const { triggeredAlerts, dismissTriggered, settings, updateSettings } = usePriceAlerts();
  const { stats, tradeAnalysis } = useTradeHistory();

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

  // Session calculations
  const sessionDuration = useMemo(() => {
    const now = Date.now();
    return Math.floor((now - sessionStats.startTime) / 1000);
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
      // Re-calculate locally just for the copy string - ideally passed from child but this is cleaner than lifting state too much
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

    const text = `Item: ${quickCalc.itemName || 'N/A'}
Quantity: ${quickCalc.quantity || 1}
Buy Price: ${formatISK(buyTotal)}
Sell Price: ${formatISK(sellTotal)}
Gross Profit: ${formatISK(grossProfit)}
Fees & Taxes: ${formatISK(brokerFees + salesTaxes)}
Net Profit: ${formatISK(netProfit)}
ROI: ${roi.toFixed(2)}%`;
    copyToClipboard(text, 'Calculator Result');
  }, [quickCalc, copyToClipboard]);

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

  // Add ISK to session
  const addSessionISK = useCallback((amount) => {
    setSessionStats(prev => ({
      ...prev,
      iskEarned: prev.iskEarned + amount,
      tradesCompleted: prev.tradesCompleted + 1,
    }));
  }, []);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[100px] pointer-events-none animate-float"></div>

        <DashboardHeader />

        {/* Main Grid Layout - Masonry-like structure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">

          {/* Left Column (Main Content) */}
          <div className="md:col-span-8 space-y-6">
            <OpportunitiesPanel
              minProfit={minProfit}
              setMinProfit={setMinProfit}
              maxInvestment={maxInvestment}
              setMaxInvestment={setMaxInvestment}
              filteredStationTrades={filteredStationTrades}
              filteredHaulingRoutes={filteredHaulingRoutes}
              copyToClipboard={copyToClipboard}
              copiedItem={copiedItem}
              addToWatchlist={addToWatchlist}
              copyTradeDetails={copyTradeDetails}
              delay="100ms"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ActiveAlertsPanel
                triggeredAlerts={triggeredAlerts}
                dismissTriggered={dismissTriggered}
                settings={settings}
                updateSettings={updateSettings}
                delay="200ms"
              />
              <WatchlistQuickView
                currentList={currentList}
                removeFromWatchlist={removeFromWatchlist}
                copyToClipboard={copyToClipboard}
                copiedItem={copiedItem}
                delay="300ms"
              />
            </div>
          </div>

          {/* Right Column (Tools & Stats) */}
          <div className="md:col-span-4 space-y-6">
            <SessionStatsPanel
              sessionStats={sessionStats}
              sessionDuration={sessionDuration}
              iskPerHour={iskPerHour}
              resetSession={resetSession}
              addSessionISK={addSessionISK}
              stats={stats}
              delay="400ms"
            />

            <MarketPulsePanel
              marketPulse={marketPulse}
              delay="500ms"
            />

            <QuickTradeCalculator
              quickCalc={quickCalc}
              setQuickCalc={setQuickCalc}
              copyCalcResult={copyCalcResult}
              copiedItem={copiedItem}
              delay="600ms"
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
          <p className="text-xs text-text-secondary opacity-50 hover:opacity-100 transition-opacity cursor-default">
            Pro Tip: Customize your layout and alerts in Settings. Data updates every 5 minutes.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

export default TradingDashboardPage;
