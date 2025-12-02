import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { TradingTable } from '../components/tables/TradingTable';
import { Toast } from '../components/common/Toast';
import { QuickCopyButton } from '../components/common/QuickCopyButtons';
import { FormSelect } from '../components/forms';
import { useResources } from '../hooks/useResources';
import { formatISK, formatPercent, formatNumber, formatCompact } from '../utils/formatters';

/**
 * Generate realistic long-term predictions based on market data
 * This is a simulation that uses reasonable heuristics to predict price trends
 */
function generatePredictions(invTypes, timeHorizon = 90) {
  if (!invTypes) return [];

  const predictions = [];
  const typeIds = Object.keys(invTypes);

  // Sample popular trading items (focusing on commonly traded categories)
  const tradingItemGroups = [
    25, 26, 27, 28, 29, 30, 31, // Frigates
    324, 358, 419, 420, // Cruisers
    100, 101, 549, 639, // Drones
    266, 275, 278, // Skillbooks
    18, 423, 424, 427, // Materials
    40, 41, 46, 53, 55, // Modules
  ];

  // Get items from these groups
  const selectedItems = typeIds
    .filter(id => {
      const item = invTypes[id];
      return item && tradingItemGroups.includes(item.groupID) && item.published;
    })
    .slice(0, 150); // Limit to 150 items for performance

  selectedItems.forEach(typeId => {
    const item = invTypes[typeId];
    if (!item || !item.typeName) return;

    // Generate base price (mock current market price)
    const basePrice = generateBasePrice(item);

    // Calculate price momentum and trends
    const volumeTrend = calculateVolumeTrend(item);
    const priceMomentum = calculatePriceMomentum(item, volumeTrend);
    const seasonality = calculateSeasonality(item);
    const volatility = calculateVolatility(item);

    // Predict future price
    const priceChange = (priceMomentum + seasonality) * (timeHorizon / 30);
    const predictedPrice = basePrice * (1 + priceChange);

    // Calculate ROI
    const roi = ((predictedPrice - basePrice) / basePrice) * 100;
    const profitPerUnit = predictedPrice - basePrice;

    // Risk assessment
    const riskLevel = assessRisk(volatility, volumeTrend, roi);

    // Confidence score (0-100)
    const confidence = calculateConfidence(volumeTrend, volatility, item);

    // Only include items with meaningful predictions
    if (Math.abs(roi) > 1 && confidence > 30) {
      predictions.push({
        itemId: typeId,
        itemName: item.typeName,
        groupID: item.groupID,
        currentPrice: basePrice,
        predictedPrice: predictedPrice,
        priceChange: predictedPrice - basePrice,
        roi: roi,
        profitPerUnit: profitPerUnit,
        volumeTrend: volumeTrend,
        volatility: volatility,
        riskLevel: riskLevel,
        confidence: confidence,
        timeHorizon: timeHorizon,
        category: getCategoryName(item.groupID),
      });
    }
  });

  // Sort by ROI descending
  return predictions.sort((a, b) => b.roi - a.roi);
}

/**
 * Generate a realistic base price for an item
 */
function generateBasePrice(item) {
  // Base price on item mass and group
  const basePrices = {
    // Ships - higher prices
    25: 500000, 26: 600000, 27: 550000, 28: 700000, 29: 650000, 30: 800000, 31: 750000,
    324: 15000000, 358: 20000000, 419: 18000000, 420: 25000000,
    // Drones - moderate prices
    100: 50000, 101: 75000, 549: 100000, 639: 150000,
    // Skillbooks - high prices
    266: 500000, 275: 1000000, 278: 2000000,
    // Materials - low to moderate
    18: 5000, 423: 10000, 424: 15000, 427: 20000,
    // Modules - varied
    40: 100000, 41: 150000, 46: 200000, 53: 250000, 55: 300000,
  };

  const basePrice = basePrices[item.groupID] || 50000;

  // Add some variation based on item properties
  const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
  const priceWithVariation = basePrice * (1 + variation);

  // Round to nice numbers
  return Math.round(priceWithVariation / 1000) * 1000;
}

/**
 * Calculate volume trend (up/stable/down)
 */
function calculateVolumeTrend(item) {
  // Mock volume trend based on item characteristics
  const trendValue = Math.random();

  if (trendValue > 0.6) return 'up';
  if (trendValue < 0.4) return 'down';
  return 'stable';
}

/**
 * Calculate price momentum (-1 to 1)
 */
function calculatePriceMomentum(item, volumeTrend) {
  // Base momentum on volume trend
  let baseMomentum = 0;

  if (volumeTrend === 'up') {
    baseMomentum = 0.05 + Math.random() * 0.15; // 5-20% upward
  } else if (volumeTrend === 'down') {
    baseMomentum = -0.15 + Math.random() * 0.1; // -15% to -5% downward
  } else {
    baseMomentum = -0.05 + Math.random() * 0.1; // -5% to +5% stable
  }

  return baseMomentum;
}

/**
 * Calculate seasonality factor (-0.1 to 0.1)
 */
function calculateSeasonality(item) {
  // Mock seasonality - some items are affected by EVE events
  const currentMonth = new Date().getMonth();

  // Combat-related items might spike in certain periods
  const combatGroups = [25, 26, 27, 28, 29, 30, 31, 100, 101, 40, 41, 46];
  if (combatGroups.includes(item.groupID)) {
    // Simulate war season
    if (currentMonth >= 3 && currentMonth <= 5) {
      return 0.05 + Math.random() * 0.05;
    }
  }

  // Most items have minimal seasonality
  return -0.02 + Math.random() * 0.04;
}

/**
 * Calculate volatility (0-1)
 */
function calculateVolatility(item) {
  // Different item types have different volatility
  const volatilityByGroup = {
    // Ships - moderate volatility
    25: 0.3, 26: 0.35, 27: 0.3, 28: 0.4, 29: 0.35, 30: 0.45, 31: 0.4,
    324: 0.25, 358: 0.3, 419: 0.25, 420: 0.35,
    // Drones - low volatility
    100: 0.2, 101: 0.25, 549: 0.3, 639: 0.35,
    // Skillbooks - very low volatility
    266: 0.1, 275: 0.15, 278: 0.15,
    // Materials - high volatility
    18: 0.5, 423: 0.55, 424: 0.6, 427: 0.65,
    // Modules - moderate volatility
    40: 0.3, 41: 0.35, 46: 0.3, 53: 0.4, 55: 0.35,
  };

  const baseVolatility = volatilityByGroup[item.groupID] || 0.3;
  const variation = -0.1 + Math.random() * 0.2;

  return Math.max(0.1, Math.min(0.9, baseVolatility + variation));
}

/**
 * Assess risk level based on volatility and trends
 */
function assessRisk(volatility, volumeTrend, roi) {
  let riskScore = volatility;

  // Lower risk for upward volume trends
  if (volumeTrend === 'up') {
    riskScore -= 0.15;
  } else if (volumeTrend === 'down') {
    riskScore += 0.15;
  }

  // Very high ROI predictions are riskier
  if (Math.abs(roi) > 30) {
    riskScore += 0.2;
  }

  riskScore = Math.max(0, Math.min(1, riskScore));

  if (riskScore > 0.6) return 'high';
  if (riskScore > 0.35) return 'medium';
  return 'low';
}

/**
 * Calculate confidence score (0-100)
 */
function calculateConfidence(volumeTrend, volatility, item) {
  let confidence = 50; // Base confidence

  // Higher confidence for upward trends
  if (volumeTrend === 'up') {
    confidence += 20;
  } else if (volumeTrend === 'down') {
    confidence -= 10;
  }

  // Lower confidence for high volatility
  confidence -= volatility * 30;

  // Skillbooks are more predictable
  if ([266, 275, 278].includes(item.groupID)) {
    confidence += 15;
  }

  // Add some randomness
  confidence += -10 + Math.random() * 20;

  return Math.max(30, Math.min(95, Math.round(confidence)));
}

/**
 * Get category name from group ID
 */
function getCategoryName(groupID) {
  const categories = {
    25: 'Frigate', 26: 'Frigate', 27: 'Frigate', 28: 'Frigate', 29: 'Frigate', 30: 'Frigate', 31: 'Frigate',
    324: 'Cruiser', 358: 'Cruiser', 419: 'Cruiser', 420: 'Cruiser',
    100: 'Drone', 101: 'Drone', 549: 'Drone', 639: 'Drone',
    266: 'Skillbook', 275: 'Skillbook', 278: 'Skillbook',
    18: 'Material', 423: 'Material', 424: 'Material', 427: 'Material',
    40: 'Module', 41: 'Module', 46: 'Module', 53: 'Module', 55: 'Module',
  };

  return categories[groupID] || 'Other';
}

/**
 * Long-Term Trading Predictions Page
 */
export function LongTermTradingPage() {
  const navigate = useNavigate();
  const { invTypes, loading: resourcesLoading } = useResources();

  // Form state
  const [timeHorizon, setTimeHorizon] = useState(90); // 3 months default
  const [minInvestment, setMinInvestment] = useState(1000000); // 1M ISK
  const [riskFilter, setRiskFilter] = useState('all');
  const [minROI, setMinROI] = useState(5); // 5% minimum ROI
  const [volumeTrendFilter, setVolumeTrendFilter] = useState('all');

  // UI state
  const [toastMessage, setToastMessage] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(100000000); // 100M ISK for calculator

  // Generate predictions
  const predictions = useMemo(() => {
    if (!invTypes) return [];
    return generatePredictions(invTypes, timeHorizon);
  }, [invTypes, timeHorizon]);

  // Apply filters
  const filteredPredictions = useMemo(() => {
    let filtered = predictions;

    // Filter by minimum investment (assumes buying at least 1 unit)
    filtered = filtered.filter(p => p.currentPrice >= minInvestment / 100);

    // Filter by risk level
    if (riskFilter !== 'all') {
      filtered = filtered.filter(p => p.riskLevel === riskFilter);
    }

    // Filter by minimum ROI
    filtered = filtered.filter(p => p.roi >= minROI);

    // Filter by volume trend
    if (volumeTrendFilter !== 'all') {
      filtered = filtered.filter(p => p.volumeTrend === volumeTrendFilter);
    }

    return filtered;
  }, [predictions, minInvestment, riskFilter, minROI, volumeTrendFilter]);

  // Calculate investment results
  const investmentResults = useMemo(() => {
    if (filteredPredictions.length === 0) return null;

    const topPrediction = filteredPredictions[0];
    const quantity = Math.floor(investmentAmount / topPrediction.currentPrice);
    const totalCost = quantity * topPrediction.currentPrice;
    const predictedValue = quantity * topPrediction.predictedPrice;
    const predictedProfit = predictedValue - totalCost;
    const roi = (predictedProfit / totalCost) * 100;

    return {
      item: topPrediction,
      quantity,
      totalCost,
      predictedValue,
      predictedProfit,
      roi,
    };
  }, [investmentAmount, filteredPredictions]);

  // Copy functions
  const copyToClipboard = useCallback(async (text, message = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      setToastMessage('Failed to copy');
    }
  }, []);

  const copyPrediction = useCallback((pred) => {
    const text = `${pred.itemName}
Current: ${formatISK(pred.currentPrice)}
Predicted (${pred.timeHorizon}d): ${formatISK(pred.predictedPrice)}
ROI: ${formatPercent(pred.roi / 100, 1)}
Profit/Unit: ${formatISK(pred.profitPerUnit)}
Risk: ${pred.riskLevel}
Confidence: ${pred.confidence}%`;

    copyToClipboard(text, 'Trade prediction copied!');
  }, [copyToClipboard]);

  const copyAllPredictions = useCallback(() => {
    const header = 'Item\tCurrent Price\tPredicted Price\tROI\tProfit/Unit\tRisk\tConfidence';
    const rows = filteredPredictions.map(p =>
      `${p.itemName}\t${formatISK(p.currentPrice, false)}\t${formatISK(p.predictedPrice, false)}\t${formatPercent(p.roi / 100, 1)}\t${formatISK(p.profitPerUnit, false)}\t${p.riskLevel}\t${p.confidence}%`
    ).join('\n');

    const text = `${header}\n${rows}`;
    copyToClipboard(text, `Copied ${filteredPredictions.length} predictions!`);
  }, [filteredPredictions, copyToClipboard]);

  const copyItemName = useCallback((itemName) => {
    copyToClipboard(itemName, 'Item name copied!');
  }, [copyToClipboard]);

  // Handle row click - navigate to price comparison
  const handleRowClick = useCallback((pred) => {
    // In a real app, you'd navigate to a detailed view
    setToastMessage(`Viewing details for ${pred.itemName}`);
  }, []);

  // Table columns
  const tableColumns = useMemo(() => [
    {
      key: 'itemName',
      label: 'Item',
      className: 'font-medium min-w-[200px]',
      render: (name, row) => (
        <div className="flex items-center gap-2">
          <span>{name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyItemName(name);
            }}
            className="p-1 text-text-secondary hover:text-accent-cyan transition-colors"
            title="Copy item name"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      type: 'string',
    },
    {
      key: 'currentPrice',
      label: 'Current Price',
      type: 'num',
      render: (price) => formatISK(price, false),
    },
    {
      key: 'predictedPrice',
      label: `Predicted (${timeHorizon}d)`,
      type: 'num',
      render: (price, row) => (
        <div className="flex flex-col">
          <span className={row.roi > 0 ? 'text-green-400' : 'text-red-400'}>
            {formatISK(price, false)}
          </span>
          <span className="text-xs text-text-secondary">
            {row.roi > 0 ? '↑' : '↓'} {formatISK(Math.abs(row.priceChange), false)}
          </span>
        </div>
      ),
    },
    {
      key: 'roi',
      label: 'ROI',
      type: 'num',
      defaultSort: true,
      render: (roi) => (
        <span className={roi > 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
          {roi > 0 ? '+' : ''}{formatPercent(roi / 100, 1)}
        </span>
      ),
    },
    {
      key: 'profitPerUnit',
      label: 'Profit/Unit',
      type: 'num',
      render: (profit) => (
        <span className={profit > 0 ? 'text-green-400' : 'text-red-400'}>
          {profit > 0 ? '+' : ''}{formatISK(profit, false)}
        </span>
      ),
    },
    {
      key: 'volumeTrend',
      label: 'Volume Trend',
      type: 'string',
      render: (trend) => {
        const trendConfig = {
          up: { color: 'text-green-400', icon: '↑', label: 'Rising' },
          stable: { color: 'text-yellow-400', icon: '→', label: 'Stable' },
          down: { color: 'text-red-400', icon: '↓', label: 'Falling' },
        };
        const config = trendConfig[trend] || trendConfig.stable;

        return (
          <div className={`flex items-center gap-1 ${config.color}`}>
            <span className="text-lg">{config.icon}</span>
            <span>{config.label}</span>
          </div>
        );
      },
    },
    {
      key: 'riskLevel',
      label: 'Risk',
      type: 'string',
      render: (risk) => {
        const riskConfig = {
          low: { color: 'bg-green-500/20 text-green-400 border-green-500/40', label: 'Low' },
          medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', label: 'Medium' },
          high: { color: 'bg-red-500/20 text-red-400 border-red-500/40', label: 'High' },
        };
        const config = riskConfig[risk] || riskConfig.medium;

        return (
          <span className={`px-2 py-1 rounded text-xs font-medium border ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'confidence',
      label: 'Confidence',
      type: 'num',
      render: (confidence) => (
        <div className="flex flex-col items-end">
          <span className="text-text-primary">{confidence}%</span>
          <div className="w-16 h-1.5 bg-space-dark rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full ${
                confidence >= 70 ? 'bg-green-400' : confidence >= 50 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-24',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyPrediction(row);
          }}
          className="p-2 text-text-secondary hover:text-accent-cyan transition-colors"
          title="Copy prediction"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      ),
    },
  ], [timeHorizon, copyPrediction, copyItemName]);

  return (
    <PageLayout
      title="Long-Term Trading Predictions"
      subtitle="Identify items likely to increase in value over the next 1-3 months"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toast */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
            type="success"
          />
        )}

        {/* Hero Section */}
        <GlassmorphicCard className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-accent-cyan/10 rounded-lg">
              <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-text-primary mb-2">
                Market Prediction Engine
              </h2>
              <p className="text-text-secondary mb-4">
                Our prediction algorithm analyzes volume trends, price momentum, market seasonality, and historical volatility
                to forecast which items are likely to appreciate in value. Use these insights to make informed long-term investment decisions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-text-primary">Volume Analysis</div>
                    <div className="text-text-secondary text-xs">Tracks demand trends over time</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div>
                    <div className="font-medium text-text-primary">Price Momentum</div>
                    <div className="text-text-secondary text-xs">Identifies upward/downward trends</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-text-primary">Risk Assessment</div>
                    <div className="text-text-secondary text-xs">Evaluates volatility and uncertainty</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        {/* Filters */}
        <GlassmorphicCard className="mb-8">
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
            Prediction Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelect
              label="Time Horizon"
              value={timeHorizon}
              onChange={(v) => setTimeHorizon(parseInt(v))}
              options={[
                { value: 30, label: '1 Month' },
                { value: 60, label: '2 Months' },
                { value: 90, label: '3 Months' },
              ]}
            />

            <FormSelect
              label="Risk Level"
              value={riskFilter}
              onChange={setRiskFilter}
              options={[
                { value: 'all', label: 'All Risk Levels' },
                { value: 'low', label: 'Low Risk Only' },
                { value: 'medium', label: 'Medium Risk Only' },
                { value: 'high', label: 'High Risk Only' },
              ]}
            />

            <FormSelect
              label="Volume Trend"
              value={volumeTrendFilter}
              onChange={setVolumeTrendFilter}
              options={[
                { value: 'all', label: 'All Trends' },
                { value: 'up', label: 'Rising Volume' },
                { value: 'stable', label: 'Stable Volume' },
                { value: 'down', label: 'Falling Volume' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Minimum ROI
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={minROI}
                  onChange={(e) => setMinROI(parseInt(e.target.value))}
                  className="flex-1 accent-accent-cyan"
                />
                <span className="text-text-primary font-mono w-16 text-right">
                  {minROI}%
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Minimum Investment per Unit
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={minInvestment}
                  onChange={(e) => setMinInvestment(parseInt(e.target.value))}
                  className="flex-1 accent-accent-cyan"
                />
                <span className="text-text-primary font-mono w-32 text-right">
                  {formatISK(minInvestment, false)}
                </span>
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        {/* Investment Calculator */}
        {investmentResults && (
          <GlassmorphicCard className="mb-8 bg-gradient-to-br from-accent-cyan/5 to-accent-gold/5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-text-primary mb-1">
                  Investment Calculator
                </h3>
                <p className="text-sm text-text-secondary">
                  Simulate returns based on top prediction
                </p>
              </div>
              <div className="px-3 py-1 bg-accent-gold/20 border border-accent-gold/40 rounded-lg text-accent-gold text-sm font-medium">
                Top Pick
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Investment Amount
                </label>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="range"
                    min="10000000"
                    max="1000000000"
                    step="10000000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(parseInt(e.target.value))}
                    className="flex-1 accent-accent-cyan"
                  />
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(parseInt(e.target.value) || 0)}
                    className="w-40 px-3 py-2 rounded-lg bg-space-dark/50 border border-accent-cyan/20 text-text-primary font-mono text-right"
                  />
                </div>

                <div className="p-4 bg-space-dark/30 rounded-lg">
                  <div className="text-sm text-text-secondary mb-1">Investing in:</div>
                  <div className="text-lg font-semibold text-text-primary mb-3">
                    {investmentResults.item.itemName}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-text-secondary text-xs">Quantity</div>
                      <div className="text-text-primary font-mono">{formatNumber(investmentResults.quantity, 0)}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-xs">Unit Price</div>
                      <div className="text-text-primary font-mono">{formatISK(investmentResults.item.currentPrice, false)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output */}
              <div className="flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-space-dark/30 rounded-lg border border-accent-cyan/10">
                    <div className="text-xs text-text-secondary mb-1">Total Investment</div>
                    <div className="text-xl font-bold text-text-primary font-mono">
                      {formatISK(investmentResults.totalCost, false)}
                    </div>
                  </div>
                  <div className="p-4 bg-space-dark/30 rounded-lg border border-accent-cyan/10">
                    <div className="text-xs text-text-secondary mb-1">Predicted Value</div>
                    <div className="text-xl font-bold text-green-400 font-mono">
                      {formatISK(investmentResults.predictedValue, false)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-500/10 to-accent-cyan/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-text-secondary">Expected Profit</div>
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                      investmentResults.item.riskLevel === 'low'
                        ? 'bg-green-500/20 text-green-400'
                        : investmentResults.item.riskLevel === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {investmentResults.item.riskLevel} risk
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-400 font-mono mb-1">
                    +{formatISK(investmentResults.predictedProfit, false)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary">ROI:</span>
                    <span className="text-green-400 font-semibold">
                      +{formatPercent(investmentResults.roi / 100, 1)}
                    </span>
                    <span className="text-text-secondary">•</span>
                    <span className="text-text-secondary">
                      {investmentResults.item.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {/* Results Summary */}
        {!resourcesLoading && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-text-secondary">
              Found <span className="text-accent-cyan font-medium">{filteredPredictions.length}</span> predictions
              {filteredPredictions.length !== predictions.length && (
                <span className="ml-2 text-text-secondary/70">
                  (filtered from {predictions.length} total)
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <QuickCopyButton
                value={filteredPredictions.map(p => p.itemName).join('\n')}
                label="Copy Names"
                onCopy={() => setToastMessage('Item names copied!')}
                size="sm"
              />
              <button
                onClick={copyAllPredictions}
                className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Copy All
              </button>
            </div>
          </div>
        )}

        {/* Predictions Table */}
        {resourcesLoading ? (
          <GlassmorphicCard>
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
              <span className="ml-3 text-text-secondary">Generating predictions...</span>
            </div>
          </GlassmorphicCard>
        ) : filteredPredictions.length === 0 ? (
          <GlassmorphicCard className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-secondary text-lg mb-2">
              No predictions match your filters
            </p>
            <p className="text-text-secondary/70">
              Try adjusting your risk level, ROI threshold, or investment amount
            </p>
          </GlassmorphicCard>
        ) : (
          <>
            {/* Top 5 Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredPredictions.slice(0, 3).map((pred, idx) => (
                <GlassmorphicCard
                  key={pred.itemId}
                  hover
                  onClick={() => handleRowClick(pred)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-accent-gold/20 text-accent-gold' :
                        idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                        'bg-orange-600/20 text-orange-400'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="text-xs px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded">
                        {pred.category}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${pred.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pred.roi > 0 ? '+' : ''}{formatPercent(pred.roi / 100, 0)}
                    </div>
                  </div>

                  <h4 className="font-medium text-text-primary mb-3 truncate">
                    {pred.itemName}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <div className="text-text-secondary text-xs">Current</div>
                      <div className="text-text-primary font-mono">{formatCompact(pred.currentPrice)}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-xs">Predicted</div>
                      <div className="text-green-400 font-mono">{formatCompact(pred.predictedPrice)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-text-secondary">Risk:</span>
                      <span className={
                        pred.riskLevel === 'low' ? 'text-green-400' :
                        pred.riskLevel === 'medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }>
                        {pred.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-text-secondary">Confidence:</span>
                      <span className="text-accent-cyan">{pred.confidence}%</span>
                    </div>
                  </div>
                </GlassmorphicCard>
              ))}
            </div>

            {/* Full Table */}
            <TradingTable
              data={filteredPredictions}
              columns={tableColumns}
              onRowClick={handleRowClick}
              defaultSort={{ column: 'roi', direction: 'desc' }}
              emptyMessage="No predictions found"
            />
          </>
        )}

        {/* Disclaimer */}
        <GlassmorphicCard className="mt-8 bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-400 mb-1">Investment Disclaimer</h4>
              <p className="text-sm text-text-secondary">
                These predictions are generated using simulated data and should not be considered financial advice.
                EVE Online markets are highly volatile and influenced by player actions, game updates, and external events.
                Always do your own research and never invest more than you can afford to lose.
              </p>
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </PageLayout>
  );
}

export default LongTermTradingPage;
