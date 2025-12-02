import { useMemo } from 'react';

/**
 * Calculate RSI-like indicator (Relative Strength Index)
 * @param {Array<number>} prices - Array of prices
 * @param {number} period - Period for calculation (default: 14)
 * @returns {number} RSI value (0-100)
 */
function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) {
    return 50; // Neutral if not enough data
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI using smoothed averages
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate Simple Moving Average
 * @param {Array<number>} data - Array of numbers
 * @param {number} period - Period for SMA
 * @returns {number} SMA value
 */
function calculateSMA(data, period) {
  if (!data || data.length < period) {
    return data && data.length > 0 ? data[data.length - 1] : 0;
  }

  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average
 * @param {Array<number>} data - Array of numbers
 * @param {number} period - Period for EMA
 * @returns {number} EMA value
 */
function calculateEMA(data, period) {
  if (!data || data.length === 0) return 0;
  if (data.length < period) return calculateSMA(data, data.length);

  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate Volume-Weighted Average Price
 * @param {Array<{price: number, volume: number}>} data - Price and volume data
 * @returns {number} VWAP value
 */
function calculateVWAP(data) {
  if (!data || data.length === 0) return 0;

  let totalVolume = 0;
  let totalPriceVolume = 0;

  data.forEach(item => {
    const price = item.price || item.average || 0;
    const volume = item.volume || 0;
    totalPriceVolume += price * volume;
    totalVolume += volume;
  });

  return totalVolume > 0 ? totalPriceVolume / totalVolume : 0;
}

/**
 * Calculate volatility (standard deviation)
 * @param {Array<number>} prices - Array of prices
 * @returns {number} Volatility percentage
 */
function calculateVolatility(prices) {
  if (!prices || prices.length < 2) return 0;

  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const squaredDiffs = prices.map(p => Math.pow(p - mean, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  return mean > 0 ? (stdDev / mean) * 100 : 0;
}

/**
 * Calculate buy/sell pressure from order book
 * @param {number} buyVolume - Total buy order volume
 * @param {number} sellVolume - Total sell order volume
 * @returns {number} Pressure ratio (-100 to 100)
 */
function calculatePressure(buyVolume, sellVolume) {
  const total = buyVolume + sellVolume;
  if (total === 0) return 0;

  // Normalize to -100 (all sell) to +100 (all buy)
  return ((buyVolume - sellVolume) / total) * 100;
}

/**
 * Generate trading signals based on indicators
 * @param {object} indicators - All calculated indicators
 * @returns {Array<object>} Array of trading signals
 */
function generateSignals(indicators) {
  const signals = [];

  // RSI signals
  if (indicators.rsi > 70) {
    signals.push({
      type: 'sell',
      strength: 'strong',
      reason: 'RSI Overbought',
      indicator: 'RSI',
      value: indicators.rsi
    });
  } else if (indicators.rsi > 60) {
    signals.push({
      type: 'sell',
      strength: 'weak',
      reason: 'RSI High',
      indicator: 'RSI',
      value: indicators.rsi
    });
  } else if (indicators.rsi < 30) {
    signals.push({
      type: 'buy',
      strength: 'strong',
      reason: 'RSI Oversold',
      indicator: 'RSI',
      value: indicators.rsi
    });
  } else if (indicators.rsi < 40) {
    signals.push({
      type: 'buy',
      strength: 'weak',
      reason: 'RSI Low',
      indicator: 'RSI',
      value: indicators.rsi
    });
  }

  // Moving average crossover signals
  if (indicators.shortMA && indicators.longMA) {
    if (indicators.shortMA > indicators.longMA * 1.02) {
      signals.push({
        type: 'buy',
        strength: 'moderate',
        reason: 'Golden Cross',
        indicator: 'MA',
        value: ((indicators.shortMA / indicators.longMA - 1) * 100).toFixed(2)
      });
    } else if (indicators.shortMA < indicators.longMA * 0.98) {
      signals.push({
        type: 'sell',
        strength: 'moderate',
        reason: 'Death Cross',
        indicator: 'MA',
        value: ((indicators.shortMA / indicators.longMA - 1) * 100).toFixed(2)
      });
    }
  }

  // Volume momentum signals
  if (indicators.volumeMomentum > 50) {
    signals.push({
      type: 'buy',
      strength: 'moderate',
      reason: 'Volume Surge',
      indicator: 'Volume',
      value: indicators.volumeMomentum.toFixed(1)
    });
  } else if (indicators.volumeMomentum < -50) {
    signals.push({
      type: 'neutral',
      strength: 'weak',
      reason: 'Volume Decline',
      indicator: 'Volume',
      value: indicators.volumeMomentum.toFixed(1)
    });
  }

  // Pressure signals
  if (indicators.pressure > 40) {
    signals.push({
      type: 'buy',
      strength: 'moderate',
      reason: 'Buy Pressure',
      indicator: 'Pressure',
      value: indicators.pressure.toFixed(1)
    });
  } else if (indicators.pressure < -40) {
    signals.push({
      type: 'sell',
      strength: 'moderate',
      reason: 'Sell Pressure',
      indicator: 'Pressure',
      value: indicators.pressure.toFixed(1)
    });
  }

  return signals;
}

/**
 * Calculate overall trend from multiple indicators
 * @param {object} indicators - All calculated indicators
 * @param {Array<object>} signals - Trading signals
 * @returns {object} Trend analysis
 */
function calculateTrend(indicators, signals) {
  let score = 0;
  let factors = 0;

  // RSI contribution
  if (indicators.rsi !== null) {
    if (indicators.rsi > 50) {
      score += (indicators.rsi - 50) / 50; // 0 to 1
    } else {
      score -= (50 - indicators.rsi) / 50; // 0 to -1
    }
    factors++;
  }

  // MA crossover contribution
  if (indicators.shortMA && indicators.longMA) {
    const maDiff = (indicators.shortMA / indicators.longMA - 1);
    score += Math.max(-1, Math.min(1, maDiff * 10)); // Limit to -1 to 1
    factors++;
  }

  // Volume momentum contribution
  if (indicators.volumeMomentum !== null) {
    score += Math.max(-1, Math.min(1, indicators.volumeMomentum / 100));
    factors++;
  }

  // Pressure contribution
  if (indicators.pressure !== null) {
    score += Math.max(-1, Math.min(1, indicators.pressure / 100));
    factors++;
  }

  // Normalize score
  const normalizedScore = factors > 0 ? score / factors : 0;

  // Determine trend
  let trend = 'neutral';
  if (normalizedScore > 0.3) {
    trend = 'bullish';
  } else if (normalizedScore < -0.3) {
    trend = 'bearish';
  }

  // Calculate confidence based on signal agreement
  const buySignals = signals.filter(s => s.type === 'buy').length;
  const sellSignals = signals.filter(s => s.type === 'sell').length;
  const totalSignals = buySignals + sellSignals;

  let confidence = 0;
  if (totalSignals > 0) {
    const agreement = Math.abs(buySignals - sellSignals) / totalSignals;
    confidence = Math.min(100, agreement * 100 * (1 + Math.abs(normalizedScore)));
  }

  return {
    trend,
    momentum: normalizedScore * 100, // -100 to 100
    confidence: Math.round(confidence),
    strength: Math.abs(normalizedScore) > 0.6 ? 'strong' :
              Math.abs(normalizedScore) > 0.3 ? 'moderate' : 'weak'
  };
}

/**
 * Custom hook for calculating market momentum and trend indicators
 *
 * @param {Array<object>} priceHistory - Historical price data with {date, average, high, low} structure
 * @param {Array<object>} volumeHistory - Historical volume data with {date, volume} structure
 * @param {object} orderBook - Current order book data with {buy_volume, sell_volume}
 * @returns {object} Momentum analysis with trend, indicators, and signals
 */
export function useMomentum(priceHistory = [], volumeHistory = [], orderBook = null) {
  return useMemo(() => {
    // Extract price arrays
    const prices = priceHistory.map(h => h.average || h.price || 0);
    const volumes = volumeHistory.map(h => h.volume || 0);

    // Calculate all indicators
    const rsi = calculateRSI(prices, 14);
    const shortMA = calculateSMA(prices, 7); // 7-day MA
    const longMA = calculateSMA(prices, 30); // 30-day MA
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);

    // Calculate volume-weighted metrics
    const vwap = calculateVWAP(priceHistory.map((h, i) => ({
      price: h.average || h.price || 0,
      volume: volumeHistory[i]?.volume || 0
    })));

    // Calculate volatility
    const volatility = calculateVolatility(prices.slice(-30)); // 30-day volatility

    // Calculate volume momentum (recent vs historical average)
    let volumeMomentum = 0;
    if (volumes.length > 7) {
      const recentVolume = calculateSMA(volumes.slice(-7), 7);
      const historicalVolume = calculateSMA(volumes, volumes.length);
      volumeMomentum = historicalVolume > 0
        ? ((recentVolume - historicalVolume) / historicalVolume) * 100
        : 0;
    }

    // Calculate buy/sell pressure
    let pressure = 0;
    if (orderBook && orderBook.buy_volume !== undefined && orderBook.sell_volume !== undefined) {
      pressure = calculatePressure(orderBook.buy_volume, orderBook.sell_volume);
    }

    // MACD
    const macd = ema12 - ema26;
    const macdSignal = calculateEMA(
      prices.map((_, i) => {
        const slice = prices.slice(0, i + 1);
        const e12 = calculateEMA(slice, 12);
        const e26 = calculateEMA(slice, 26);
        return e12 - e26;
      }).slice(-9),
      9
    );
    const macdHistogram = macd - macdSignal;

    // Compile all indicators
    const indicators = {
      rsi,
      shortMA,
      longMA,
      ema12,
      ema26,
      macd,
      macdSignal,
      macdHistogram,
      vwap,
      volatility,
      volumeMomentum,
      pressure,
    };

    // Generate trading signals
    const signals = generateSignals(indicators);

    // Calculate overall trend
    const trendAnalysis = calculateTrend(indicators, signals);

    return {
      ...trendAnalysis,
      indicators,
      signals,
      hasData: prices.length > 0,
      dataPoints: prices.length,
    };
  }, [priceHistory, volumeHistory, orderBook]);
}

/**
 * Hook for calculating simple price change
 * @param {number} currentPrice - Current price
 * @param {Array<object>} priceHistory - Historical price data
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {object} Price change analysis
 */
export function usePriceChange(currentPrice, priceHistory = [], days = 7) {
  return useMemo(() => {
    if (!currentPrice || !priceHistory || priceHistory.length === 0) {
      return {
        change: 0,
        changePercent: 0,
        direction: 'neutral',
        oldPrice: currentPrice
      };
    }

    // Get price from N days ago
    const targetIndex = Math.min(days, priceHistory.length - 1);
    const oldPrice = priceHistory[priceHistory.length - 1 - targetIndex]?.average || currentPrice;

    const change = currentPrice - oldPrice;
    const changePercent = oldPrice > 0 ? (change / oldPrice) * 100 : 0;

    let direction = 'neutral';
    if (changePercent > 1) {
      direction = 'up';
    } else if (changePercent < -1) {
      direction = 'down';
    }

    return {
      change,
      changePercent,
      direction,
      oldPrice
    };
  }, [currentPrice, priceHistory, days]);
}

export default useMomentum;
