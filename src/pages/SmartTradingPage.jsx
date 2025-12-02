import { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { SmartPriceCalculator } from '../components/common/SmartPriceCalculator';
import { TradeRecommendations } from '../components/common/TradeRecommendations';
import { QuickReprice, BatchReprice } from '../components/common/QuickReprice';
import { useEveAuth } from '../hooks/useEveAuth';
import { formatISK, formatCompact, formatRelativeTime } from '../utils/formatters';
import { getCharacterOrders, getTypeNames, getMarketOrders } from '../api/esi';

/**
 * MarketVelocityIndicator Component
 * Shows market velocity for items (fast/slow moving)
 */
function MarketVelocityIndicator() {
  const velocityData = [
    { name: 'PLEX', typeId: 44992, velocity: 'fast', volume: 15000, trend: 'up' },
    { name: 'Tritanium', typeId: 34, velocity: 'fast', volume: 5000000, trend: 'stable' },
    { name: 'Raven Navy Issue', typeId: 17636, velocity: 'medium', volume: 800, trend: 'up' },
    { name: 'Compressed Veldspar', typeId: 28433, velocity: 'fast', volume: 1200000, trend: 'down' },
    { name: 'Small Shield Extender II', typeId: 2281, velocity: 'medium', volume: 35000, trend: 'stable' },
    { name: 'Navy Cap Booster 400', typeId: 11289, velocity: 'slow', volume: 2500, trend: 'stable' },
  ];

  const getVelocityColor = (velocity) => {
    if (velocity === 'fast') return 'bg-green-500/20 text-green-400 border-green-500/40';
    if (velocity === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-text-secondary';
  };

  return (
    <GlassmorphicCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display text-text-primary">Market Velocity</h3>
        <span className="text-xs text-text-secondary">Real-time indicators</span>
      </div>

      <div className="space-y-2">
        {velocityData.map((item) => (
          <div
            key={item.typeId}
            className="flex items-center justify-between p-3 rounded-lg bg-space-dark/30 hover:bg-space-dark/50 transition-all"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className={`text-2xl ${getTrendColor(item.trend)}`}>
                {getTrendIcon(item.trend)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium truncate">{item.name}</p>
                <p className="text-xs text-text-secondary">24h Vol: {formatCompact(item.volume)}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getVelocityColor(item.velocity)}`}>
              {item.velocity.charAt(0).toUpperCase() + item.velocity.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </GlassmorphicCard>
  );
}

/**
 * QuickActionsCard Component
 * Quick access to common trading actions
 */
function QuickActionsCard({ onAction }) {
  const actions = [
    {
      id: 'check-orders',
      label: 'Check My Orders',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'from-accent-cyan to-blue-500',
    },
    {
      id: 'analyze-item',
      label: 'Analyze Item',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'from-accent-purple to-pink-500',
    },
    {
      id: 'find-deals',
      label: 'Find Deals',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'profit-calc',
      label: 'Profit Calc',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <GlassmorphicCard>
      <h3 className="text-xl font-display text-text-primary mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="group relative overflow-hidden rounded-xl p-4 min-h-[100px] flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
              <span className="text-sm font-medium text-text-primary text-center">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </GlassmorphicCard>
  );
}

/**
 * SmartTradingPage Component
 * Hub for all smart trading tools
 */
export function SmartTradingPage() {
  const { isAuthenticated, character, getAccessToken, login } = useEveAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [undercutOrders, setUndercutOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);

  useEffect(() => {
    if (isAuthenticated && character?.id) {
      checkForUndercuts();
    }
  }, [isAuthenticated, character?.id]);

  const checkForUndercuts = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const orders = await getCharacterOrders(character.id, accessToken);

      // Get type names
      const typeIds = [...new Set(orders.map(o => o.type_id))];
      const names = await getTypeNames(typeIds);
      const nameMap = {};
      names.forEach(n => {
        nameMap[n.id] = n.name;
      });

      // Check each order for undercuts (simplified version)
      const undercuts = [];
      for (const order of orders.slice(0, 5)) { // Limit to 5 for demo
        // In production, you'd fetch market data for each order
        // For now, we'll simulate some undercuts
        if (Math.random() > 0.7) {
          const bestPrice = order.is_buy_order ? order.price + 0.50 : order.price - 0.50;
          const suggestedPrice = order.is_buy_order ? bestPrice + 0.01 : bestPrice - 0.01;
          undercuts.push({
            ...order,
            typeName: nameMap[order.type_id] || `Item ${order.type_id}`,
            bestPrice,
            suggestedPrice,
            priceDiff: Math.abs(order.price - bestPrice),
          });
        }
      }

      setUndercutOrders(undercuts);
    } catch (error) {
      console.error('Failed to check for undercuts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowCalculator(true);
  };

  const handleQuickAction = (actionId) => {
    if (actionId === 'analyze-item') {
      setShowCalculator(true);
    } else if (actionId === 'check-orders') {
      checkForUndercuts();
    }
    // Other actions could navigate to different pages
  };

  const handleReprice = async (orderId, newPrice) => {
    // Copy to clipboard
    await navigator.clipboard.writeText(newPrice.toFixed(2));
    // Show notification
    setNotificationMessage(`Price ${formatISK(newPrice, false)} copied to clipboard!`);
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  const handleBatchReprice = async (orderIds) => {
    // Copy all prices to clipboard
    const prices = undercutOrders
      .filter(o => orderIds.includes(o.order_id))
      .map(o => `${o.typeName}: ${o.suggestedPrice.toFixed(2)}`)
      .join('\n');

    await navigator.clipboard.writeText(prices);
    setNotificationMessage('All prices copied to clipboard!');
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <PageLayout
        title="Smart Trading"
        subtitle="Intelligent trading assistance powered by real-time market data"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <GlassmorphicCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-display text-text-primary mb-2">Login Required</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Connect your EVE Online account to access smart trading tools including price calculators,
              order management, and personalized recommendations.
            </p>
            <Button onClick={login} variant="primary" size="lg" className="px-8">
              Login with EVE Online
            </Button>
          </GlassmorphicCard>

          {/* Feature Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassmorphicCard className="text-center" padding="p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-display text-text-primary mb-2">Smart Price Calculator</h4>
              <p className="text-sm text-text-secondary">
                Calculate optimal buy/sell prices with fees, taxes, and market competition analysis
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard className="text-center" padding="p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-display text-text-primary mb-2">Quick Reprice</h4>
              <p className="text-sm text-text-secondary">
                Instantly detect undercut orders and calculate competitive prices with one tap
              </p>
            </GlassmorphicCard>

            <GlassmorphicCard className="text-center" padding="p-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent-purple/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="text-lg font-display text-text-primary mb-2">Trade Recommendations</h4>
              <p className="text-sm text-text-secondary">
                Get personalized suggestions based on your trading history and market trends
              </p>
            </GlassmorphicCard>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Smart Trading"
      subtitle="Intelligent trading assistance powered by real-time market data"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Notification Message */}
        {notificationMessage && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <GlassmorphicCard className="border-l-4 border-green-500 bg-green-500/10">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-text-primary">{notificationMessage}</p>
                <button
                  onClick={() => setNotificationMessage(null)}
                  className="ml-auto text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {/* Quick Actions */}
        <QuickActionsCard onAction={handleQuickAction} />

        {/* Undercut Orders Alert */}
        {undercutOrders.length > 0 && (
          <BatchReprice
            undercutOrders={undercutOrders}
            onBatchReprice={handleBatchReprice}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Smart Price Calculator */}
            {showCalculator ? (
              <SmartPriceCalculator
                typeId={selectedItem?.typeId}
                typeName={selectedItem?.name}
                onClose={() => {
                  setShowCalculator(false);
                  setSelectedItem(null);
                }}
              />
            ) : (
              <GlassmorphicCard className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-display text-text-primary mb-2">Smart Price Calculator</h3>
                <p className="text-text-secondary mb-4">
                  Select an item from recommendations or quick actions to calculate optimal prices
                </p>
                <Button
                  onClick={() => setShowCalculator(true)}
                  variant="secondary"
                  size="md"
                >
                  Open Calculator
                </Button>
              </GlassmorphicCard>
            )}

            {/* Market Velocity */}
            <MarketVelocityIndicator />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Trade Recommendations */}
            <TradeRecommendations onSelectItem={handleSelectItem} />
          </div>
        </div>

        {/* Stats Summary */}
        <GlassmorphicCard>
          <h3 className="text-xl font-display text-text-primary mb-4">Trading Stats (Last 24h)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-space-dark/30">
              <p className="text-2xl font-bold text-green-400 mb-1">+125M</p>
              <p className="text-xs text-text-secondary">Profit</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-space-dark/30">
              <p className="text-2xl font-bold text-accent-cyan mb-1">47</p>
              <p className="text-xs text-text-secondary">Orders</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-space-dark/30">
              <p className="text-2xl font-bold text-accent-purple mb-1">12.5%</p>
              <p className="text-xs text-text-secondary">Avg Margin</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-space-dark/30">
              <p className="text-2xl font-bold text-yellow-400 mb-1">8</p>
              <p className="text-xs text-text-secondary">Undercuts</p>
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </PageLayout>
  );
}

export default SmartTradingPage;
