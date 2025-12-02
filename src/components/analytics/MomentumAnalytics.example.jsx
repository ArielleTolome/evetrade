import { useState, useEffect } from 'react';
import { MarketMomentum, MomentumIndicatorInline, MomentumBadge } from './MarketMomentum';
import { TrendAnalysis, TrendIndicatorCompact } from './TrendAnalysis';
import { PriceProjection } from './PriceProjection';
import { MarketHealth, HealthBadge, HealthMeter } from './MarketHealth';
import { useMomentum, usePriceChange } from '../../hooks/useMomentum';

/**
 * MomentumAnalyticsExample - Demonstration of all momentum and trend components
 *
 * This example shows how to integrate the analytics components with real market data.
 * It demonstrates both full and compact display modes for use in different contexts.
 */
export function MomentumAnalyticsExample() {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching market data
  useEffect(() => {
    // In a real application, you would fetch this from your API
    const simulatedData = {
      currentPrice: 1250000,
      buyPrice: 1245000,
      sellPrice: 1255000,
      volume: 150,
      buyVolume: 5000000,
      sellVolume: 4500000,
      priceHistory: generateMockPriceHistory(30),
      volumeHistory: generateMockVolumeHistory(30),
    };

    setTimeout(() => {
      setMarketData(simulatedData);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate momentum using the hook
  const momentum = useMomentum(
    marketData?.priceHistory || [],
    marketData?.volumeHistory || [],
    {
      buy_volume: marketData?.buyVolume || 0,
      sell_volume: marketData?.sellVolume || 0
    }
  );

  // Calculate price change
  const priceChange7d = usePriceChange(
    marketData?.currentPrice || 0,
    marketData?.priceHistory || [],
    7
  );

  const priceChange30d = usePriceChange(
    marketData?.currentPrice || 0,
    marketData?.priceHistory || [],
    30
  );

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-40 bg-gray-700 rounded mb-4"></div>
          <div className="h-40 bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  const spread = marketData.sellPrice - marketData.buyPrice;
  const midPrice = (marketData.buyPrice + marketData.sellPrice) / 2;
  const marginPercent = marketData.buyPrice > 0
    ? ((marketData.sellPrice - marketData.buyPrice) / marketData.buyPrice) * 100
    : 0;

  // Calculate volatility from price history
  const prices = marketData.priceHistory.map(h => h.average);
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
  const volatility = avgPrice > 0 ? (Math.sqrt(variance) / avgPrice) * 100 : 0;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Market Momentum & Trend Analytics</h1>
        <p className="text-gray-400">Comprehensive market analysis components for EVETrade</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Momentum Card */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2">Market Momentum</h3>
          <MomentumBadge trend={momentum.trend} />
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {momentum.momentum.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Confidence: {momentum.confidence}%
          </div>
        </div>

        {/* Price Change Card */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2">7-Day Change</h3>
          <TrendIndicatorCompact
            trend={priceChange7d.direction}
            changePercent={priceChange7d.changePercent}
          />
          <div className="mt-2 text-2xl font-mono font-bold text-white">
            {priceChange7d.changePercent.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            From {(priceChange7d.oldPrice / 1000000).toFixed(2)}M ISK
          </div>
        </div>

        {/* Health Card */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2">Market Health</h3>
          <div className="flex items-center justify-between">
            <HealthMeter
              score={Math.round(
                (75 + Math.min(25, marketData.volume / 4)) *
                (1 - Math.min(0.3, volatility / 100))
              )}
              size={60}
            />
            <div className="text-right">
              <div className="text-xs text-gray-500">Signals</div>
              <div className="text-lg font-bold text-accent-cyan">
                {momentum.signals.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Momentum Component */}
        <MarketMomentum
          trend={momentum.trend}
          momentum={momentum.momentum}
          volumeMomentum={momentum.indicators.volumeMomentum}
          spread={spread}
          midPrice={midPrice}
        />

        {/* Market Health Component */}
        <MarketHealth
          volume={marketData.volume}
          orderDepth={marketData.buyVolume + marketData.sellVolume}
          volatility={volatility}
          spread={spread}
          midPrice={midPrice}
          marginPercent={marginPercent}
          trend={momentum.momentum}
        />
      </div>

      {/* Trend Analysis Component */}
      <TrendAnalysis
        priceHistory={marketData.priceHistory}
        volumeData={{
          recentAvg: marketData.volumeHistory.slice(-7).reduce((sum, v) => sum + v.volume, 0) / 7,
          historicalAvg: marketData.volumeHistory.reduce((sum, v) => sum + v.volume, 0) / marketData.volumeHistory.length
        }}
        currentPrice={marketData.currentPrice}
        buyVolume={marketData.buyVolume}
        sellVolume={marketData.sellVolume}
        predictedDirection={momentum.trend}
        confidence={momentum.confidence}
      />

      {/* Price Projection Component */}
      <PriceProjection
        currentPrice={marketData.currentPrice}
        priceHistory={marketData.priceHistory}
      />

      {/* Trading Signals */}
      {momentum.signals.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Trading Signals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {momentum.signals.map((signal, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border ${
                  signal.type === 'buy' ? 'bg-green-500/10 border-green-500/30' :
                  signal.type === 'sell' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold uppercase ${
                    signal.type === 'buy' ? 'text-green-400' :
                    signal.type === 'sell' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {signal.type}
                  </span>
                  <span className="text-xs text-gray-400">{signal.strength}</span>
                </div>
                <div className="text-sm text-white">{signal.reason}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {signal.indicator}: {signal.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Table Example */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Compact Mode (for Tables)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-left text-gray-400">
                <th className="pb-2">Item</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Momentum</th>
                <th className="pb-2">7d Change</th>
                <th className="pb-2">Health</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700">
                <td className="py-3">Tritanium</td>
                <td className="py-3 font-mono">{(marketData.currentPrice / 1000000).toFixed(2)}M</td>
                <td className="py-3">
                  <MomentumIndicatorInline trend={momentum.trend} momentum={momentum.momentum} />
                </td>
                <td className="py-3">
                  <TrendIndicatorCompact
                    trend={priceChange7d.direction}
                    changePercent={priceChange7d.changePercent}
                  />
                </td>
                <td className="py-3">
                  <HealthBadge
                    score={Math.round(
                      (75 + Math.min(25, marketData.volume / 4)) *
                      (1 - Math.min(0.3, volatility / 100))
                    )}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicator Details */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Technical Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400 text-xs mb-1">RSI (14)</div>
            <div className="font-mono text-white">{momentum.indicators.rsi?.toFixed(2) || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">7-Day MA</div>
            <div className="font-mono text-white">
              {momentum.indicators.shortMA ? (momentum.indicators.shortMA / 1000000).toFixed(2) + 'M' : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">30-Day MA</div>
            <div className="font-mono text-white">
              {momentum.indicators.longMA ? (momentum.indicators.longMA / 1000000).toFixed(2) + 'M' : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Volatility</div>
            <div className="font-mono text-white">{volatility.toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">VWAP</div>
            <div className="font-mono text-white">
              {momentum.indicators.vwap ? (momentum.indicators.vwap / 1000000).toFixed(2) + 'M' : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">MACD</div>
            <div className="font-mono text-white">
              {momentum.indicators.macd ? momentum.indicators.macd.toFixed(0) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Volume Momentum</div>
            <div className="font-mono text-white">
              {momentum.indicators.volumeMomentum?.toFixed(1) || 'N/A'}%
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Pressure</div>
            <div className="font-mono text-white">
              {momentum.indicators.pressure?.toFixed(1) || 'N/A'}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate mock price history for demonstration
 */
function generateMockPriceHistory(days) {
  const history = [];
  let price = 1200000;
  const trend = Math.random() > 0.5 ? 1 : -1;

  for (let i = days; i > 0; i--) {
    const volatility = (Math.random() - 0.5) * 50000;
    const trendEffect = trend * (days - i) * 500;
    price = Math.max(1000000, price + volatility + trendEffect);

    const date = new Date();
    date.setDate(date.getDate() - i);

    history.push({
      date: date.toISOString(),
      average: price,
      high: price * 1.02,
      low: price * 0.98,
      volume: Math.floor(100 + Math.random() * 100),
      order_count: Math.floor(50 + Math.random() * 50)
    });
  }

  return history;
}

/**
 * Generate mock volume history for demonstration
 */
function generateMockVolumeHistory(days) {
  const history = [];
  let baseVolume = 150;

  for (let i = days; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    history.push({
      date: date.toISOString(),
      volume: Math.floor(baseVolume + (Math.random() - 0.5) * 50)
    });
  }

  return history;
}

export default MomentumAnalyticsExample;
