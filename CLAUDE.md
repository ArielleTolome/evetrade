# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EVETrade is a comprehensive React 19 application for EVE Online trading. It helps players discover profitable trades, analyze markets, and optimize their trading operations. Features include station trading, region hauling, arbitrage scanning, PI optimization, industry profits, and more.

## Quick Start

```bash
npm install     # Install dependencies
npm run dev     # Start development server (localhost:5173)
npm run build   # Build for production
npm test        # Run tests
npm run lint    # Run ESLint
```

The site deploys automatically to Vercel on commits to main.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| Vite | 7.2.4 | Build tool & HMR |
| React Router | 7.9.6 | Routing |
| Tailwind CSS | 4.1.17 | Styling |
| Axios | 1.13.2 | HTTP client |
| Supabase | 2.86.0 | Data persistence |
| Sentry | 10.27.0 | Error tracking |
| HeadlessUI | 2.2.9 | Accessible components |

## Directory Structure

```
evetrade/
├── src/
│   ├── api/              # API client layer (14 files)
│   │   ├── client.js     # Axios with retry logic
│   │   ├── esi.js        # EVE ESI API integration
│   │   └── trading.js    # Trading API endpoints
│   │
│   ├── components/       # React components (197+ files)
│   │   ├── analytics/    # Market analysis (8)
│   │   ├── common/       # Shared UI (165+)
│   │   ├── dashboard/    # Dashboard widgets (8)
│   │   ├── forms/        # Form inputs (7)
│   │   ├── inventory/    # Inventory management (8)
│   │   ├── layout/       # Page layouts (3)
│   │   ├── routing/      # Route optimization (7)
│   │   ├── tables/       # Data tables (2)
│   │   └── trading/      # Trading features (25+)
│   │
│   ├── hooks/            # Custom hooks (72+ files)
│   ├── lib/              # Third-party (supabase.js)
│   ├── pages/            # Page components (32 files)
│   ├── store/            # Global state (ThemeContext)
│   └── utils/            # Utilities (12 files)
│
├── api/                  # Vercel serverless functions
├── docs/                 # Documentation
└── public/               # Static assets
```

## Key Files

### Entry Points
- `src/main.jsx` - App entry, Sentry initialization
- `src/App.jsx` - Root component with provider hierarchy
- `src/router.jsx` - Route configuration (32 lazy-loaded pages)

### Core Hooks
- `src/hooks/useApiCall.js` - API call wrapper with loading/error state
- `src/hooks/useResources.jsx` - Universe data (regions, stations, items)
- `src/hooks/useEveAuth.jsx` - EVE SSO authentication
- `src/hooks/useCache.js` - Local caching utilities

### API Client
- `src/api/client.js` - Axios instance with retry logic, error handling
- `src/api/esi.js` - EVE ESI API integration
- `src/api/trading.js` - Trading endpoints (station, hauling, arbitrage)

## Pages (32 Routes)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | HomePage | Feature selection |
| `/station-trading` | StationTradingPage | Margin trading |
| `/station-hauling` | StationHaulingPage | Station-to-station |
| `/region-hauling` | RegionHaulingPage | Region-to-region |
| `/arbitrage` | ArbitragePage | Cross-region arbitrage |
| `/market-velocity` | MarketVelocityPage | Velocity analysis |
| `/pi-optimizer` | PIOptimizerPage | Planetary interaction |
| `/industry-profits` | IndustryProfitsPage | Manufacturing |
| `/lp-optimizer` | LPOptimizerPage | LP conversions |
| `/contracts` | ContractFinderPage | Contract search |
| `/corp-orders` | CorpOrdersPage | Corporation orders |
| `/smart-route` | SmartRouteOptimizerPage | Route planning |
| `/dashboard` | TradingDashboardPage | Overview |
| `/watchlist` | WatchlistPage | Item watchlist |
| `/portfolio` | PortfolioPage | Portfolio management |
| `/alerts` | AlertsPage | Alert management |

## Provider Hierarchy

```jsx
<Sentry.ErrorBoundary>
  <ThemeProvider>
    <ToastProvider>
      <EveAuthProvider>
        <MultiCharacterProvider>
          <ResourceProvider>
            <RouterProvider />
          </ResourceProvider>
        </MultiCharacterProvider>
      </EveAuthProvider>
    </ToastProvider>
  </ThemeProvider>
</Sentry.ErrorBoundary>
```

## Coding Patterns

### Creating a New Page

```jsx
// src/pages/MyFeaturePage.jsx
import { PageLayout } from '../components/layout/PageLayout';

export default function MyFeaturePage() {
  return (
    <PageLayout title="My Feature" description="Description">
      {/* Content */}
    </PageLayout>
  );
}

// Add to src/router.jsx
const MyFeaturePage = lazy(() => import('./pages/MyFeaturePage'));
// Add route in children array
```

### Using API Calls

```jsx
import { useApiCall } from '../hooks/useApiCall';
import { fetchStationTrading } from '../api/trading';

function MyComponent() {
  const { data, loading, error, execute } = useApiCall();

  const handleSubmit = async (params) => {
    await execute(() => fetchStationTrading(params));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  return <TradingTable data={data} />;
}
```

### Styling with Tailwind

```jsx
// Card with glassmorphism
<div className="bg-space-dark/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">

// Primary button
<button className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-space-black font-semibold rounded-lg">

// Input field
<input className="w-full px-4 py-2 bg-space-dark/50 border border-white/20 rounded-lg text-white focus:border-accent-cyan focus:outline-none" />
```

## Testing

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

Tests use Vitest and React Testing Library.

## API Endpoints (Serverless)

| Endpoint | Purpose |
|----------|---------|
| `/api/station` | Station trading |
| `/api/hauling` | Hauling routes |
| `/api/orders` | Market orders |
| `/api/arbitrage` | Arbitrage detection |
| `/api/contracts` | Contract search |
| `/api/industry` | Industry calculations |
| `/api/route-optimizer` | Route planning |
| `/api/pi-optimizer` | PI optimization |
| `/api/lp-optimizer` | LP conversions |

## External Services

| Service | Purpose |
|---------|---------|
| EVE ESI API | Character data, market data |
| S3 Resources | Static universe data |
| Supabase | User data persistence |
| Sentry | Error tracking |

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Development guide
- [docs/API.md](./docs/API.md) - API reference
- [docs/COMPONENTS.md](./docs/COMPONENTS.md) - Component catalog
- [docs/HOOKS.md](./docs/HOOKS.md) - Hooks reference

## Related Repositories

| Repository | Description |
|------------|-------------|
| [evetrade_api](https://github.com/awhipp/evetrade_api) | Backend API |
| [evetrade-data-sync-service](https://github.com/awhipp/evetrade-data-sync-service) | Market data sync |
| [evetrade_resources](https://github.com/awhipp/evetrade_resources) | Static data |
| [evetrade_historical_volume](https://github.com/awhipp/evetrade_historical_volume) | Volume history |
