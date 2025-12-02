# Architecture Overview

This document describes the architecture of EVETrade Modern - a comprehensive EVE Online trading application built with React 19.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User Browser                                │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      React 19 Application                        ││
│  │                                                                   ││
│  │  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌───────────────┐  ││
│  │  │  Pages   │  │ Components │  │  Hooks   │  │ State/Context │  ││
│  │  │  (32)    │  │   (197+)   │  │  (72+)   │  │  (5 providers)│  ││
│  │  └──────────┘  └────────────┘  └──────────┘  └───────────────┘  ││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │           Local Cache (IndexedDB / localStorage)                 ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│  Vercel API     │    │ S3 Resources    │    │ EVE ESI API         │
│  (Serverless)   │    │ (Static Data)   │    │ (Character Data)    │
└─────────────────┘    └─────────────────┘    └─────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│  EVETrade API   │    │    Supabase     │
│  (Backend)      │    │  (Persistence)  │
└─────────────────┘    └─────────────────┘
```

## Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework with concurrent features |
| Vite | 7.2.4 | Build tool & dev server with HMR |
| React Router | 7.9.6 | Client-side routing with lazy loading |
| Tailwind CSS | 4.1.17 | Utility-first styling |
| Axios | 1.13.2 | HTTP client with retry logic |
| Supabase | 2.86.0 | Data persistence & auth fallback |
| Sentry | 10.27.0 | Error tracking & monitoring |
| HeadlessUI | 2.2.9 | Accessible UI components |

## Provider Hierarchy

The application uses React Context for global state. Providers are nested in this order:

```jsx
<Sentry.ErrorBoundary>           // Error tracking
  <ThemeProvider>                // Dark/light theme
    <ToastProvider>              // Toast notifications
      <EveAuthProvider>          // EVE SSO authentication
        <MultiCharacterProvider> // Multi-character state
          <ResourceProvider>     // Universe data cache
            <RouterProvider />   // React Router
          </ResourceProvider>
        </MultiCharacterProvider>
      </EveAuthProvider>
    </ToastProvider>
  </ThemeProvider>
</Sentry.ErrorBoundary>
```

## Directory Structure

```
evetrade/
├── src/
│   ├── api/                    # API layer (14 files)
│   │   ├── client.js           # Axios client with retry logic
│   │   ├── esi.js              # EVE ESI API integration
│   │   ├── trading.js          # Trading API endpoints
│   │   ├── arbitrage.js        # Arbitrage detection
│   │   ├── contracts.js        # Contract data
│   │   ├── corp-orders.js      # Corporation orders
│   │   ├── industry.js         # Industry calculations
│   │   ├── lp-optimizer.js     # LP optimization
│   │   ├── pi-optimizer.js     # PI calculations
│   │   └── route-optimizer.js  # Route optimization
│   │
│   ├── components/             # React components (197+ files)
│   │   ├── analytics/          # Market analysis (8 components)
│   │   ├── common/             # Shared UI (165+ components)
│   │   ├── dashboard/          # Dashboard widgets (8 components)
│   │   ├── forms/              # Form components (7 components)
│   │   ├── inventory/          # Inventory management (8 components)
│   │   ├── layout/             # Page layouts (3 components)
│   │   ├── routing/            # Route optimization (7 components)
│   │   ├── tables/             # Data tables (2 components)
│   │   └── trading/            # Trading features (25+ components)
│   │
│   ├── hooks/                  # Custom React hooks (72+ files)
│   │   ├── useApiCall.js       # Generic API wrapper
│   │   ├── useCache.js         # Caching utilities
│   │   ├── useResources.jsx    # Universe data context
│   │   ├── useEveAuth.jsx      # EVE SSO authentication
│   │   ├── useArbitrageScanner.js
│   │   ├── useMarketVelocity.js
│   │   ├── useRouteOptimizer.js
│   │   └── ... (65+ more)
│   │
│   ├── lib/                    # Third-party integrations
│   │   └── supabase.js         # Supabase client
│   │
│   ├── pages/                  # Page components (32 files)
│   │   ├── HomePage.jsx
│   │   ├── StationTradingPage.jsx
│   │   ├── StationHaulingPage.jsx
│   │   ├── RegionHaulingPage.jsx
│   │   ├── ArbitragePage.jsx
│   │   ├── MarketVelocityPage.jsx
│   │   ├── PIOptimizerPage.jsx
│   │   └── ... (25+ more)
│   │
│   ├── store/                  # Global state
│   │   └── ThemeContext.jsx    # Dark/light theme
│   │
│   └── utils/                  # Utility functions (12 files)
│       ├── constants.js        # API endpoints, colors, options
│       ├── formatters.js       # Number/ISK formatting
│       ├── profitCalculations.js
│       ├── eveLinks.js         # EVE resource links
│       ├── security.js         # Security status utilities
│       └── stations.js         # Station data utilities
│
├── api/                        # Vercel serverless functions
│   ├── station.js              # Station trading
│   ├── hauling.js              # Hauling calculations
│   ├── orders.js               # Market orders
│   ├── arbitrage.js            # Arbitrage detection
│   ├── contracts.js            # Contract search
│   ├── industry.js             # Industry calculations
│   ├── route-optimizer.js      # Route optimization
│   ├── pi-optimizer.js         # PI optimization
│   └── lp-optimizer.js         # LP conversion
│
└── docs/                       # Documentation
    ├── ARCHITECTURE.md         # This file
    ├── COMPONENTS.md           # Component catalog
    └── ... (feature docs)
```

## Data Flow

### 1. Resource Loading

```
App Mount
    │
    ▼
ResourceProvider
    │
    ├── Check Local Cache (IndexedDB/localStorage)
    │       │
    │       ├── Cache Hit → Return cached data
    │       │
    │       └── Cache Miss
    │               │
    │               ▼
    │       Fetch from Supabase (if configured)
    │               │
    │               ├── Success → Cache & Return
    │               │
    │               └── Failure → Fallback to S3
    │                       │
    │                       ▼
    │               Fetch from S3
    │                       │
    │                       └── Cache & Return
    │
    └── Resources available in context
```

### 2. Trading Query Flow

```
User Submits Form
    │
    ▼
Form Validation
    │
    ├── Invalid → Show errors
    │
    └── Valid
        │
        ▼
useApiCall.execute()
    │
    ▼
API Client (with retry logic)
    │
    ├── Rate Limited (429) → Retry with backoff
    │
    ├── Server Error (5xx) → Retry
    │
    └── Success → Return data
        │
        ▼
TradingTable renders results
```

## Key Design Decisions

### 1. Hybrid Caching Strategy

Resources are cached locally using both IndexedDB (for large objects) and localStorage (for small objects). This provides:
- Fast subsequent loads
- Offline capability for cached data
- Automatic 1-hour cache expiration

### 2. Code Splitting

Large dependencies are split into separate chunks:
- `vendor-react`: React, ReactDOM, React Router
- `vendor-datatables`: DataTables core
- `vendor-export`: JSZip, pdfMake (PDF/Excel export)
- `vendor-markdown`: react-markdown, remark-gfm

This allows users to cache common dependencies separately from application code.

### 3. Progressive Enhancement

The app works with:
- S3 only (default, no configuration needed)
- Supabase + S3 fallback (when configured)
- Local cache even when offline (for previously loaded resources)

### 4. Theme System

Uses CSS custom properties (via Tailwind) with a context provider:
- Dark theme (default): Space-themed with cyan accents
- Light theme: Clean white with dark text
- Theme preference persisted in localStorage

## Component Patterns

### Form Components

All form components follow a consistent pattern:
- Controlled inputs via `value` and `onChange` props
- Error display via `error` prop
- Consistent styling with `FormInput`, `FormSelect` base
- Autocomplete variants for stations/regions

### Page Components

Pages follow a standard structure:
1. Load resources via `useResources()`
2. Define form state with `useState()`
3. Handle submission with `useApiCall()`
4. Render form + results in `PageLayout`

### Table Component

`TradingTable` wraps DataTables with:
- Column configuration via props
- Export buttons (Copy, CSV, Excel, PDF, Print)
- Column visibility toggle
- Custom theme styling
- Row click handlers

## Performance Considerations

1. **Lazy Loading**: All pages are lazy-loaded via React.lazy()
2. **Memoization**: Heavy computations use useMemo/useCallback
3. **Virtual Scrolling**: DataTables handles large datasets efficiently
4. **Font Preloading**: Critical fonts preloaded in HTML
5. **Image Optimization**: No heavy images, using CSS for effects

## Route Configuration

All 32 pages are defined in `src/router.jsx` with lazy loading:

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/` | HomePage | Landing with feature selection |
| `/station-trading` | StationTradingPage | Single station margin trading |
| `/station-hauling` | StationHaulingPage | Station-to-station hauling |
| `/region-hauling` | RegionHaulingPage | Region-to-region trading |
| `/price-compare` | PriceComparisonPage | Regional price comparison |
| `/orders` | OrdersPage | Market order depth |
| `/arbitrage` | ArbitragePage | Cross-region arbitrage |
| `/market-velocity` | MarketVelocityPage | Market velocity analysis |
| `/pi-optimizer` | PIOptimizerPage | Planetary interaction |
| `/industry-profits` | IndustryProfitsPage | Manufacturing analysis |
| `/lp-optimizer` | LPOptimizerPage | LP conversion |
| `/contracts` | ContractFinderPage | Contract search |
| `/corp-orders` | CorpOrdersPage | Corporation orders |
| `/smart-route` | SmartRouteOptimizerPage | Route optimization |
| `/dashboard` | TradingDashboardPage | Trading dashboard |
| `/predictions` | LongTermTradingPage | Long-term predictions |
| `/analytics` | AnalyticsPage | Trading analytics |
| `/smart-trading` | SmartTradingPage | AI-assisted trading |
| `/watchlist` | WatchlistPage | Watchlist management |
| `/saved-routes` | SavedRoutesPage | Saved routes |
| `/portfolio` | PortfolioPage | Portfolio management |
| `/calculator` | CalculatorPage | Trading calculators |
| `/alerts` | AlertsPage | Alert management |
| `/characters` | MultiCharacterPage | Multi-character |
| `/tools` | ToolsPage | Utility tools |
| `/notes` | NotesPage | Trade notes |
| `/help` | HelpPage | Documentation |
| `/auth/callback` | AuthCallbackPage | SSO callback |

## External Services Integration

| Service | Purpose | Documentation |
|---------|---------|---------------|
| EVE ESI API | Character data, wallet, assets | [ESI Docs](https://esi.evetech.net/ui/) |
| EVETrade API | Market analysis, calculations | [evetrade_api](https://github.com/awhipp/evetrade_api) |
| S3 Resources | Static universe data | `evetrade.s3.amazonaws.com/resources/` |
| Supabase | User data persistence | Optional configuration |
| Sentry | Error tracking | Automatic error capture |

## Build & Deployment

### Development

```bash
npm install      # Install dependencies
npm run dev      # Start Vite dev server with HMR
npm run test     # Run Vitest tests
npm run lint     # Run ESLint
```

### Production Build

```bash
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
```

### Deployment Pipeline

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Serverless functions deployed with static assets
4. CDN caching enabled for static resources

## Security Considerations

1. **No secrets in frontend** - All sensitive data handled by backend
2. **EVE SSO** - OAuth2 flow for authentication
3. **CORS** - Configured on backend services
4. **Input validation** - Client-side and server-side validation
5. **Error sanitization** - Sentry captures without PII
