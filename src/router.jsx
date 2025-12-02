import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SkeletonPage } from './components/common/SkeletonLoader';
import { RootLayout } from './components/layout/RootLayout';

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

/**
 * Lazy page wrapper with loading fallback
 */
function LazyPage({ children }) {
  return (
    <Suspense fallback={<SkeletonPage />}>
      {children}
    </Suspense>
  );
}

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
    ],
  },
]);

export default router;
