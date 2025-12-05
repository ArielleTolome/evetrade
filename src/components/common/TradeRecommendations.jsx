import { useState, useEffect } from 'react';
import { GlassmorphicCard } from './GlassmorphicCard';
import { formatISK, formatPercent, formatCompact } from '../../utils/formatters';
import { getWalletTransactions } from '../../api/esi';
import { useEveAuth } from '../../hooks/useEveAuth';

/**
 * RecommendationCard Component
 * Displays a single trade recommendation
 */
function RecommendationCard({ item, onClick }) {
  const getVelocityColor = (velocity) => {
    if (velocity === 'fast') return 'text-green-400';
    if (velocity === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getVelocityLabel = (velocity) => {
    if (velocity === 'fast') return 'Fast Moving';
    if (velocity === 'medium') return 'Moderate';
    return 'Slow Moving';
  };

  return (
    <GlassmorphicCard
      hover
      onClick={onClick}
      className="cursor-pointer"
      padding="p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-text-primary font-semibold mb-1 truncate">{item.name}</h4>
          <p className="text-xs text-text-secondary">{item.category}</p>
        </div>
        {item.badge && (
          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${item.badge.color}`}>
            {item.badge.text}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-text-secondary mb-0.5">Margin</p>
          <p className={`text-lg font-mono ${item.margin > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPercent(item.margin)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-0.5">Est. Profit</p>
          <p className="text-lg font-mono text-accent-cyan">
            {formatISK(item.estimatedProfit, false)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getVelocityColor(item.velocity)}`} />
          <span className={`text-xs ${getVelocityColor(item.velocity)}`}>
            {getVelocityLabel(item.velocity)}
          </span>
        </div>
        <div className="text-xs text-text-secondary">
          Vol: {formatCompact(item.dailyVolume)}
        </div>
      </div>
    </GlassmorphicCard>
  );
}

/**
 * TradeRecommendations Component
 * Shows personalized trade recommendations based on history and market trends
 */
export function TradeRecommendations({ onSelectItem }) {
  const { isAuthenticated, character, getAccessToken } = useEveAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('profitable'); // 'profitable', 'highMargin', 'trending'
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && character?.id) {
      loadRecommendations();
    }
  }, [isAuthenticated, character?.id, activeTab]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      if (activeTab === 'profitable') {
        await loadProfitableItems(accessToken);
      } else if (activeTab === 'highMargin') {
        await loadHighMarginItems(accessToken);
      } else if (activeTab === 'trending') {
        await loadTrendingItems(accessToken);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfitableItems = async (accessToken) => {
    // Load recent transactions
    const transactions = await getWalletTransactions(character.id, accessToken);

    // Analyze profitable trades from history
    const itemProfits = {};

    transactions.forEach(tx => {
      if (!itemProfits[tx.type_id]) {
        itemProfits[tx.type_id] = {
          typeId: tx.type_id,
          name: tx.type_id, // Will be replaced with actual name
          buys: [],
          sells: [],
        };
      }

      if (tx.is_buy) {
        itemProfits[tx.type_id].buys.push(tx);
      } else {
        itemProfits[tx.type_id].sells.push(tx);
      }
    });

    // Calculate profitability
    const profitable = [];
    Object.values(itemProfits).forEach(item => {
      if (item.buys.length > 0 && item.sells.length > 0) {
        const avgBuy = item.buys.reduce((sum, t) => sum + t.unit_price, 0) / item.buys.length;
        const avgSell = item.sells.reduce((sum, t) => sum + t.unit_price, 0) / item.sells.length;
        const profit = avgSell - avgBuy;
        const margin = profit / avgBuy;

        if (margin > 0.05) { // At least 5% margin
          profitable.push({
            typeId: item.typeId,
            name: `Item ${item.typeId}`, // Would fetch real names
            category: 'Historical',
            margin,
            estimatedProfit: profit * 100, // Assuming 100 units
            dailyVolume: item.sells.length * 50,
            velocity: item.sells.length > 5 ? 'fast' : 'medium',
            badge: {
              text: 'Proven',
              color: 'bg-green-500/20 text-green-400',
            },
          });
        }
      }
    });

    // Sort by margin
    profitable.sort((a, b) => b.margin - a.margin);
    setRecommendations(profitable.slice(0, 12));
  };

  const loadHighMarginItems = async () => {
    // Mock high margin items (in production, fetch from backend or ESI)
    const highMarginItems = [
      {
        typeId: 11399,
        name: 'Plex',
        category: 'Special Commodities',
        margin: 0.08,
        estimatedProfit: 50000000,
        dailyVolume: 15000,
        velocity: 'fast',
        badge: { text: 'High Value', color: 'bg-accent-purple/20 text-accent-purple' },
      },
      {
        typeId: 44992,
        name: 'Large Skill Injector',
        category: 'Special Commodities',
        margin: 0.06,
        estimatedProfit: 30000000,
        dailyVolume: 8000,
        velocity: 'fast',
        badge: { text: 'Popular', color: 'bg-accent-cyan/20 text-accent-cyan' },
      },
      {
        typeId: 29668,
        name: 'Guardian',
        category: 'Ships',
        margin: 0.12,
        estimatedProfit: 40000000,
        dailyVolume: 500,
        velocity: 'medium',
        badge: { text: 'Logistics', color: 'bg-blue-500/20 text-blue-400' },
      },
      {
        typeId: 17738,
        name: 'Ishtar',
        category: 'Ships',
        margin: 0.10,
        estimatedProfit: 35000000,
        dailyVolume: 1200,
        velocity: 'fast',
        badge: { text: 'PvE Meta', color: 'bg-green-500/20 text-green-400' },
      },
      {
        typeId: 19720,
        name: 'Federation Navy Stasis Webifier',
        category: 'Modules',
        margin: 0.15,
        estimatedProfit: 15000000,
        dailyVolume: 300,
        velocity: 'medium',
        badge: { text: 'High Margin', color: 'bg-yellow-500/20 text-yellow-400' },
      },
      {
        typeId: 2048,
        name: 'Republic Fleet Gyrostabilizer',
        category: 'Modules',
        margin: 0.14,
        estimatedProfit: 12000000,
        dailyVolume: 450,
        velocity: 'medium',
        badge: { text: 'Faction', color: 'bg-purple-500/20 text-purple-400' },
      },
    ];

    setRecommendations(highMarginItems);
  };

  const loadTrendingItems = async () => {
    // Mock trending items based on volume changes
    const trendingItems = [
      {
        typeId: 34562,
        name: 'Gila',
        category: 'Ships',
        margin: 0.09,
        estimatedProfit: 45000000,
        dailyVolume: 2500,
        velocity: 'fast',
        badge: { text: '+35% Vol', color: 'bg-green-500/20 text-green-400' },
      },
      {
        typeId: 11178,
        name: 'Raven Navy Issue',
        category: 'Ships',
        margin: 0.07,
        estimatedProfit: 55000000,
        dailyVolume: 800,
        velocity: 'medium',
        badge: { text: '+28% Vol', color: 'bg-green-500/20 text-green-400' },
      },
      {
        typeId: 2488,
        name: 'Caldari Navy Light Missile Launcher',
        category: 'Modules',
        margin: 0.11,
        estimatedProfit: 8000000,
        dailyVolume: 600,
        velocity: 'medium',
        badge: { text: '+22% Vol', color: 'bg-green-500/20 text-green-400' },
      },
      {
        typeId: 31366,
        name: 'Small Ancillary Current Router I',
        category: 'Modules',
        margin: 0.20,
        estimatedProfit: 2000000,
        dailyVolume: 15000,
        velocity: 'fast',
        badge: { text: '+45% Vol', color: 'bg-green-500/20 text-green-400' },
      },
    ];

    setRecommendations(trendingItems);
  };

  const tabs = [
    { id: 'profitable', label: 'Your Winners', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'highMargin', label: 'High Margin', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { id: 'trending', label: 'Trending', icon: 'M trending7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
  ];

  if (!isAuthenticated) {
    return (
      <GlassmorphicCard className="text-center py-8">
        <svg className="w-12 h-12 mx-auto mb-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-text-secondary">Login to see personalized recommendations</p>
      </GlassmorphicCard>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display text-text-primary">Trade Recommendations</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap min-h-[48px] ${
              activeTab === tab.id
                ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
                : 'bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            <p className="text-text-secondary">Loading recommendations...</p>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((item) => (
            <RecommendationCard
              key={item.typeId}
              item={item}
              onClick={() => onSelectItem && onSelectItem(item)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <GlassmorphicCard className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-text-secondary">No recommendations available yet</p>
          <p className="text-text-secondary text-sm mt-2">Start trading to see personalized suggestions</p>
        </GlassmorphicCard>
      )}
    </div>
  );
}

export default TradeRecommendations;
