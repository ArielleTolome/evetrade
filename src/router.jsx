import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LazyPage } from './components/common/LazyPage';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const StationTradingPage = lazy(() => import('./pages/StationTradingPage'));
const StationHaulingPage = lazy(() => import('./pages/StationHaulingPage'));
const RegionHaulingPage = lazy(() => import('./pages/RegionHaulingPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));

/**
 * Application Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LazyPage>
        <HomePage />
      </LazyPage>
    ),
  },
  {
    path: '/station-trading',
    element: (
      <LazyPage>
        <StationTradingPage />
      </LazyPage>
    ),
  },
  {
    path: '/station-hauling',
    element: (
      <LazyPage>
        <StationHaulingPage />
      </LazyPage>
    ),
  },
  {
    path: '/region-hauling',
    element: (
      <LazyPage>
        <RegionHaulingPage />
      </LazyPage>
    ),
  },
  {
    path: '/orders',
    element: (
      <LazyPage>
        <OrdersPage />
      </LazyPage>
    ),
  },
  {
    path: '/help',
    element: (
      <LazyPage>
        <HelpPage />
      </LazyPage>
    ),
  },
]);

export default router;
