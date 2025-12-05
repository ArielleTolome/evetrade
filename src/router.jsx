import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { LazyPage } from './components/common/LazyPage';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const StationTradingPage = lazy(() => import('./pages/StationTradingPage'));
const StationHaulingPage = lazy(() => import('./pages/StationHaulingPage'));
const RegionHaulingPage = lazy(() => import('./pages/RegionHaulingPage'));
const PriceComparisonPage = lazy(() => import('./pages/PriceComparisonPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const SavedRoutesPage = lazy(() => import('./pages/SavedRoutesPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const TradingDashboardPage = lazy(() => import('./pages/TradingDashboardPage'));
const LongTermTradingPage = lazy(() => import('./pages/LongTermTradingPage'));
const RouteOptimizationPage = lazy(() => import('./pages/RouteOptimizationPage'));
const MarketOrdersPage = lazy(() => import('./pages/MarketOrdersPage'));
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const TradeProfitsPage = lazy(() => import('./pages/TradeProfitsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const SmartTradingPage = lazy(() => import('./pages/SmartTradingPage'));
const MultiCharacterPage = lazy(() => import('./pages/MultiCharacterPage'));
const ArbitragePage = lazy(() => import('./pages/ArbitragePage'));
const MarketVelocityPage = lazy(() => import('./pages/MarketVelocityPage'));
const PIOptimizerPage = lazy(() => import('./pages/PIOptimizerPage'));
const IndustryProfitsPage = lazy(() => import('./pages/IndustryProfitsPage'));
const LPOptimizerPage = lazy(() => import('./pages/LPOptimizerPage'));
const ContractFinderPage = lazy(() => import('./pages/ContractFinderPage'));
const CorpOrdersPage = lazy(() => import('./pages/CorpOrdersPage'));
const SmartRouteOptimizerPage = lazy(() => import('./pages/SmartRouteOptimizerPage'));
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const PriceAlertPanelExample = lazy(() => import('./components/common/PriceAlertPanel.example'));

/**
 * Application Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <HomePage />
          </LazyPage>
        ),
      },
      {
        path: 'station-trading',
        element: (
          <LazyPage>
            <StationTradingPage />
          </LazyPage>
        ),
      },
      {
        path: 'station-hauling',
        element: (
          <LazyPage>
            <StationHaulingPage />
          </LazyPage>
        ),
      },
      {
        path: 'region-hauling',
        element: (
          <LazyPage>
            <RegionHaulingPage />
          </LazyPage>
        ),
      },
      {
        path: 'price-compare',
        element: (
          <LazyPage>
            <PriceComparisonPage />
          </LazyPage>
        ),
      },
      {
        path: 'orders',
        element: (
          <LazyPage>
            <OrdersPage />
          </LazyPage>
        ),
      },
      {
        path: 'help',
        element: (
          <LazyPage>
            <HelpPage />
          </LazyPage>
        ),
      },
      {
        path: 'saved-routes',
        element: (
          <LazyPage>
            <SavedRoutesPage />
          </LazyPage>
        ),
      },
      {
        path: 'portfolio',
        element: (
          <LazyPage>
            <PortfolioPage />
          </LazyPage>
        ),
      },
      {
        path: 'calculator',
        element: (
          <LazyPage>
            <CalculatorPage />
          </LazyPage>
        ),
      },
      {
        path: 'watchlist',
        element: (
          <LazyPage>
            <WatchlistPage />
          </LazyPage>
        ),
      },
      {
        path: 'auth/callback',
        element: (
          <LazyPage>
            <AuthCallbackPage />
          </LazyPage>
        ),
      },
      {
        path: 'notes',
        element: (
          <LazyPage>
            <NotesPage />
          </LazyPage>
        ),
      },
      {
        path: 'tools',
        element: (
          <LazyPage>
            <ToolsPage />
          </LazyPage>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <LazyPage>
            <TradingDashboardPage />
          </LazyPage>
        ),
      },
      {
        path: 'predictions',
        element: (
          <LazyPage>
            <LongTermTradingPage />
          </LazyPage>
        ),
      },
      {
        path: 'route-optimization',
        element: (
          <LazyPage>
            <RouteOptimizationPage />
          </LazyPage>
        ),
      },
      {
        path: 'market-orders',
        element: (
          <LazyPage>
            <MarketOrdersPage />
          </LazyPage>
        ),
      },
      {
        path: 'overview',
        element: (
          <LazyPage>
            <OverviewPage />
          </LazyPage>
        ),
      },
      {
        path: 'trade-profits',
        element: (
          <LazyPage>
            <TradeProfitsPage />
          </LazyPage>
        ),
      },
      {
        path: 'analytics',
        element: (
          <LazyPage>
            <AnalyticsPage />
          </LazyPage>
        ),
      },
      {
        path: 'alerts',
        element: (
          <LazyPage>
            <AlertsPage />
          </LazyPage>
        ),
      },
      {
        path: 'smart-trading',
        element: (
          <LazyPage>
            <SmartTradingPage />
          </LazyPage>
        ),
      },
      {
        path: 'characters',
        element: (
          <LazyPage>
            <MultiCharacterPage />
          </LazyPage>
        ),
      },
      {
        path: 'arbitrage',
        element: (
          <LazyPage>
            <ArbitragePage />
          </LazyPage>
        ),
      },
      {
        path: 'market-velocity',
        element: (
          <LazyPage>
            <MarketVelocityPage />
          </LazyPage>
        ),
      },
      {
        path: 'pi-optimizer',
        element: (
          <LazyPage>
            <PIOptimizerPage />
          </LazyPage>
        ),
      },
      {
        path: 'industry-profits',
        element: (
          <LazyPage>
            <IndustryProfitsPage />
          </LazyPage>
        ),
      },
      {
        path: 'lp-optimizer',
        element: (
          <LazyPage>
            <LPOptimizerPage />
          </LazyPage>
        ),
      },
      {
        path: 'contracts',
        element: (
          <LazyPage>
            <ContractFinderPage />
          </LazyPage>
        ),
      },
      {
        path: 'corp-orders',
        element: (
          <LazyPage>
            <CorpOrdersPage />
          </LazyPage>
        ),
      },
      {
        path: 'smart-route',
        element: (
          <LazyPage>
            <SmartRouteOptimizerPage />
          </LazyPage>
        ),
      },
      {
        path: 'item-detail',
        element: (
          <LazyPage>
            <ItemDetailPage />
          </LazyPage>
        ),
      },
      {
        path: 'price-alert-panel-example',
        element: (
          <LazyPage>
            <PriceAlertPanelExampleWrapper />
          </LazyPage>
        ),
      },
    ],
  },
]);

export default router;
