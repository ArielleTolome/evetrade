import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';

// Market Analysis Components
import { MarketSpreadAnalyzer } from '../components/trading/MarketSpreadAnalyzer';
import { PriceVolatilityIndex } from '../components/trading/PriceVolatilityIndex';
import { ManipulationDetector } from '../components/trading/ManipulationDetector';
import { RegionalPriceComparison } from '../components/trading/RegionalPriceComparison';

// Trading Efficiency Components
import { TaxCalculator } from '../components/trading/TaxCalculator';
import { BreakEvenCalculator } from '../components/trading/BreakEvenCalculator';
import { OptimalPricing } from '../components/trading/OptimalPricing';
import { MarginErosionTracker } from '../components/trading/MarginErosionTracker';
import { BulkOrderCalculator } from '../components/trading/BulkOrderCalculator';
import { ComprehensiveProfitCalculator } from '../components/trading/ComprehensiveProfitCalculator';

// Inventory Management Components
import { StockAlertPanel } from '../components/inventory/StockAlertPanel';
import { RestockSuggestions } from '../components/inventory/RestockSuggestions';
import { DeadStockIdentifier } from '../components/inventory/DeadStockIdentifier';
import { InventoryValuation } from '../components/inventory/InventoryValuation';

// Route Optimization Components
import { MultiStopPlanner } from '../components/routing/MultiStopPlanner';
import { CargoOptimizer } from '../components/routing/CargoOptimizer';
import { FuelCostCalculator } from '../components/routing/FuelCostCalculator';
import { RouteRiskAssessment } from '../components/routing/RouteRiskAssessment';

// Analytics Components
import { ProfitPerHourCalculator } from '../components/analytics/ProfitPerHourCalculator';
import { SeasonalTrends } from '../components/analytics/SeasonalTrends';
import { CompetitionTracker } from '../components/analytics/CompetitionTracker';
import { MarketShareEstimator } from '../components/analytics/MarketShareEstimator';

// Productivity Components
import { QuickCopyButtons } from '../components/common/QuickCopyButtons';
import { TradeSessionTimer } from '../components/common/TradeSessionTimer';
import { EnhancedExport } from '../components/common/EnhancedExport';

// New Advanced Features
import { DiscordWebhookPanel } from '../components/common/DiscordWebhookPanel';
import { RouteSafetyPanel } from '../components/common/RouteSafetyPanel';
import { CharacterSwitcher } from '../components/common/CharacterSwitcher';
import { ContractFinder } from '../components/trading/ContractFinder';
import { IndustryCalculator } from '../components/trading/IndustryCalculator';

const TOOL_CATEGORIES = [
  {
    id: 'market-analysis',
    name: 'Market Analysis',
    icon: '📊',
    description: 'Analyze market spreads, volatility, and detect manipulation',
    color: 'from-accent-cyan to-blue-600',
  },
  {
    id: 'trading-efficiency',
    name: 'Trading Efficiency',
    icon: '💰',
    description: 'Calculate taxes, break-even prices, and optimize margins',
    color: 'from-accent-gold to-orange-600',
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    icon: '📦',
    description: 'Track stock levels, identify dead stock, and manage restocking',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'routing',
    name: 'Route Optimization',
    icon: '🚀',
    description: 'Plan routes, optimize cargo, and assess risks',
    color: 'from-accent-purple to-pink-600',
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    icon: '📈',
    description: 'Track profits, analyze trends, and monitor competition',
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'productivity',
    name: 'Productivity Tools',
    icon: '⚡',
    description: 'Quick copy, session timers, and export utilities',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: '🔗',
    description: 'Discord webhooks, contracts, industry calculator, and more',
    color: 'from-teal-500 to-cyan-600',
  },
];

/**
 * Tools Page - Central hub for all trading tools
 */
export function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState('market-analysis');
  const [activeTool, setActiveTool] = useState(null);

  const renderToolContent = () => {
    switch (activeCategory) {
      case 'market-analysis':
        return <MarketAnalysisTools activeTool={activeTool} setActiveTool={setActiveTool} />;
      case 'trading-efficiency':
        return <TradingEfficiencyTools activeTool={activeTool} setActiveTool={setActiveTool} />;
      case 'inventory':
        return <InventoryTools activeTool={activeTool} setActiveTool={setActiveTool} />;
      case 'routing':
        return <RoutingTools activeTool={activeTool} setActiveTool={setActiveTool} />;
      case 'analytics':
        return <AnalyticsTools activeTool={activeTool} setActiveTool={setActiveTool} />;
      case 'productivity':
        return <ProductivityTools activeTool={activeTool} setActiveTool={setActiveTool} />;
      case 'integrations':
        return <IntegrationsTools activeTool={activeTool} setActiveTool={setActiveTool} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">Trading</span>{' '}
            <span className="text-text-primary">Tools</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Powerful tools to maximize your trading efficiency and profits in New Eden
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TOOL_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setActiveTool(null);
              }}
              variant={activeCategory === category.id ? 'primary' : 'secondary'}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm
                transition-all duration-200
                ${activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg border-transparent`
                  : 'bg-space-dark/50 text-text-secondary hover:bg-space-dark hover:text-text-primary border-transparent'
                }
              `}
            >
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Category Description */}
        <div className="text-center mb-6">
          <p className="text-text-secondary">
            {TOOL_CATEGORIES.find((c) => c.id === activeCategory)?.description}
          </p>
        </div>

        {/* Tool Content */}
        <div className="animate-fade-in">
          {renderToolContent()}
        </div>
      </div>
    </PageLayout>
  );
}

/**
 * Market Analysis Tools Section
 */
function MarketAnalysisTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'spread', name: 'Spread Analyzer', desc: 'Analyze bid/ask spreads' },
    { id: 'volatility', name: 'Volatility Index', desc: 'Price stability analysis' },
    { id: 'manipulation', name: 'Manipulation Detector', desc: 'Detect suspicious patterns' },
    { id: 'regional', name: 'Regional Comparison', desc: 'Compare prices across regions' },
  ];

  if (!activeTool) {
    return (
      <ToolGrid tools={tools} onSelect={setActiveTool} color="accent-cyan" />
    );
  }

  return (
    <div>
      <BackButton onClick={() => setActiveTool(null)} />
      <GlassmorphicCard className="p-6">
        {activeTool === 'spread' && (
          <MarketSpreadAnalyzer
            highestBuy={95000000}
            lowestSell={100000000}
            typeId={34}
            regionId={10000002}
          />
        )}
        {activeTool === 'volatility' && (
          <PriceVolatilityIndex typeId={34} regionId={10000002} />
        )}
        {activeTool === 'manipulation' && (
          <ManipulationDetector typeId={34} regionId={10000002} />
        )}
        {activeTool === 'regional' && (
          <RegionalPriceComparison typeId={34} />
        )}
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Trading Efficiency Tools Section
 */
function TradingEfficiencyTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'profit', name: 'Profit Calculator', desc: 'Comprehensive profit calculator with all fees' },
    { id: 'tax', name: 'Tax Calculator', desc: 'Calculate broker fees & taxes' },
    { id: 'breakeven', name: 'Break-Even Calculator', desc: 'Find minimum sell price' },
    { id: 'pricing', name: 'Optimal Pricing', desc: 'Get pricing suggestions' },
    { id: 'erosion', name: 'Margin Erosion Tracker', desc: 'Track margin changes' },
    { id: 'bulk', name: 'Bulk Order Calculator', desc: 'Calculate bulk profits' },
  ];

  if (!activeTool) {
    return (
      <ToolGrid tools={tools} onSelect={setActiveTool} color="accent-gold" />
    );
  }

  return (
    <div>
      <BackButton onClick={() => setActiveTool(null)} />
      {activeTool === 'profit' ? (
        <ComprehensiveProfitCalculator />
      ) : (
        <GlassmorphicCard className="p-6">
          {activeTool === 'tax' && <TaxCalculator />}
          {activeTool === 'breakeven' && <BreakEvenCalculator />}
          {activeTool === 'pricing' && <OptimalPricing />}
          {activeTool === 'erosion' && <MarginErosionTracker />}
          {activeTool === 'bulk' && <BulkOrderCalculator />}
        </GlassmorphicCard>
      )}
    </div>
  );
}

/**
 * Inventory Management Tools Section
 */
function InventoryTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'alerts', name: 'Stock Alerts', desc: 'Set low stock notifications' },
    { id: 'restock', name: 'Restock Suggestions', desc: 'What to buy next' },
    { id: 'deadstock', name: 'Dead Stock Finder', desc: 'Find stuck inventory' },
    { id: 'valuation', name: 'Inventory Valuation', desc: 'Total portfolio value' },
  ];

  // Sample inventory data for demos
  const sampleInventory = [
    { typeId: 34, typeName: 'Tritanium', quantity: 50000, buyPrice: 5.5, lastSaleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { typeId: 35, typeName: 'Pyerite', quantity: 25000, buyPrice: 8.2, lastSaleDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { typeId: 36, typeName: 'Mexallon', quantity: 10000, buyPrice: 45, lastSaleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ];

  if (!activeTool) {
    return (
      <ToolGrid tools={tools} onSelect={setActiveTool} color="green-500" />
    );
  }

  return (
    <div>
      <BackButton onClick={() => setActiveTool(null)} />
      <GlassmorphicCard className="p-6">
        {activeTool === 'alerts' && <StockAlertPanel inventory={sampleInventory} />}
        {activeTool === 'restock' && <RestockSuggestions inventory={sampleInventory} />}
        {activeTool === 'deadstock' && <DeadStockIdentifier inventory={sampleInventory} />}
        {activeTool === 'valuation' && <InventoryValuation inventory={sampleInventory} />}
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Route Optimization Tools Section
 */
function RoutingTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'multistop', name: 'Multi-Stop Planner', desc: 'Plan complex routes' },
    { id: 'cargo', name: 'Cargo Optimizer', desc: 'Maximize ISK per m³' },
    { id: 'fuel', name: 'Fuel Calculator', desc: 'Jump freighter fuel costs' },
    { id: 'risk', name: 'Route Risk Assessment', desc: 'Evaluate route safety' },
  ];

  if (!activeTool) {
    return (
      <ToolGrid tools={tools} onSelect={setActiveTool} color="accent-purple" />
    );
  }

  return (
    <div>
      <BackButton onClick={() => setActiveTool(null)} />
      <GlassmorphicCard className="p-6">
        {activeTool === 'multistop' && <MultiStopPlanner />}
        {activeTool === 'cargo' && <CargoOptimizer trades={[]} />}
        {activeTool === 'fuel' && <FuelCostCalculator />}
        {activeTool === 'risk' && <RouteRiskAssessment />}
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Analytics Tools Section
 */
function AnalyticsTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'profit', name: 'Profit Per Hour', desc: 'Track ISK/hour' },
    { id: 'seasonal', name: 'Seasonal Trends', desc: 'Find best trading times' },
    { id: 'competition', name: 'Competition Tracker', desc: 'Monitor competitors' },
    { id: 'marketshare', name: 'Market Share', desc: 'Your market dominance' },
  ];

  if (!activeTool) {
    return (
      <ToolGrid tools={tools} onSelect={setActiveTool} color="red-500" />
    );
  }

  return (
    <div>
      <BackButton onClick={() => setActiveTool(null)} />
      <GlassmorphicCard className="p-6">
        {activeTool === 'profit' && <ProfitPerHourCalculator />}
        {activeTool === 'seasonal' && <SeasonalTrends typeId={34} regionId={10000002} />}
        {activeTool === 'competition' && <CompetitionTracker />}
        {activeTool === 'marketshare' && <MarketShareEstimator />}
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Productivity Tools Section
 */
function ProductivityTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'copy', name: 'Quick Copy', desc: 'Copy data instantly' },
    { id: 'timer', name: 'Session Timer', desc: 'Track trading time' },
    { id: 'export', name: 'Enhanced Export', desc: 'Export your data' },
  ];

  // Sample data for demos
  const sampleItem = {
    name: 'Tritanium',
    price: 5.50,
    quantity: 10000,
  };

  const sampleExportData = [
    { name: 'Tritanium', buyPrice: 5.0, sellPrice: 5.5, profit: 5000, roi: 10 },
    { name: 'Pyerite', buyPrice: 7.5, sellPrice: 8.5, profit: 10000, roi: 13 },
  ];

  if (!activeTool) {
    return (
      <ToolGrid tools={tools} onSelect={setActiveTool} color="indigo-500" />
    );
  }

  return (
    <div>
      <BackButton onClick={() => setActiveTool(null)} />
      <GlassmorphicCard className="p-6">
        {activeTool === 'copy' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Quick Copy Demo</h3>
            <QuickCopyButtons item={sampleItem} />
          </div>
        )}
        {activeTool === 'timer' && <TradeSessionTimer />}
        {activeTool === 'export' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Export Data</h3>
            <EnhancedExport data={sampleExportData} filename="trading-data" />
          </div>
        )}
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Tool Grid Component
 */
function ToolGrid({ tools, onSelect, color }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          onClick={() => onSelect(tool.id)}
          variant="ghost"
          className="group text-left p-0 h-auto border-none hover:bg-transparent"
        >
          <GlassmorphicCard hover className="p-5 h-full w-full">
            <h3 className={`font-semibold text-text-primary group-hover:text-${color} transition-colors mb-2`}>
              {tool.name}
            </h3>
            <p className="text-sm text-text-secondary">{tool.desc}</p>
            <div className={`mt-4 flex items-center gap-2 text-${color} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <span className="text-sm">Open Tool</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </GlassmorphicCard>
        </Button>
      ))}
    </div>
  );
}

/**
 * Integrations Tools Section
 */
function IntegrationsTools({ activeTool, setActiveTool }) {
  const tools = [
    { id: 'discord', name: 'Discord Webhooks', desc: 'Send alerts to Discord channels' },
    { id: 'contracts', name: 'Contract Finder', desc: 'Find profitable courier & item contracts' },
    { id: 'industry', name: 'Industry Calculator', desc: 'Manufacturing & invention profits' },
    { id: 'routesafety', name: 'Route Safety', desc: 'Zkillboard route danger analysis' },
    { id: 'characters', name: 'Character Manager', desc: 'Multi-character support' },
  ];

  if (!activeTool) {
    return (
      <ToolGrid tools={tools} onSelect={setActiveTool} color="teal-500" />
    );
  }

  return (
    <div>
      <BackButton onClick={() => setActiveTool(null)} />
      <GlassmorphicCard className="p-6">
        {activeTool === 'discord' && <DiscordWebhookPanel />}
        {activeTool === 'contracts' && <ContractFinder />}
        {activeTool === 'industry' && <IndustryCalculator />}
        {activeTool === 'routesafety' && (
          <RouteSafetyPanel
            systemIds={[30000142, 30002187, 30002510]} // Jita, Amarr, Rens systems
            systemNames={{
              30000142: 'Jita',
              30002187: 'Amarr',
              30002510: 'Rens',
            }}
          />
        )}
        {activeTool === 'characters' && <CharacterSwitcher />}
      </GlassmorphicCard>
    </div>
  );
}

/**
 * Back Button Component
 */
function BackButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan mb-4 pl-0"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>Back to Tools</span>
    </Button>
  );
}

export default ToolsPage;
