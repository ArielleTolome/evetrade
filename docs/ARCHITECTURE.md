# Architecture Overview

This document describes the architecture of EVETrade Modern - a comprehensive EVE Online trading application built with React 19.

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Browser["User Browser"]
        subgraph React["React 19 Application"]
            Pages["Pages (32)"]
            Components["Components (197+)"]
            Hooks["Hooks (72+)"]
            Context["State/Context (5 providers)"]
        end
        Cache["Local Cache<br/>(IndexedDB / localStorage)"]
    end

    subgraph Vercel["Vercel Platform"]
        Static["Static Assets (CDN)"]
        Serverless["Serverless Functions (/api)"]
    end

    subgraph External["External Services"]
        ESI["EVE ESI API<br/>Character Data, Market Orders"]
        S3["S3 Resources<br/>Static Universe Data"]
        Supabase["Supabase<br/>User Persistence"]
        Sentry["Sentry<br/>Error Tracking"]
        Backend["EVETrade API<br/>Market Calculations"]
    end

    React --> Cache
    React --> Static
    React --> Serverless
    React --> S3
    React --> ESI
    React --> Supabase
    React --> Sentry
    Serverless --> Backend
    Serverless --> ESI
```

## Serverless API Endpoints

```mermaid
flowchart LR
    subgraph API["Vercel Serverless Functions"]
        station["/api/station<br/>Station Trading"]
        hauling["/api/hauling<br/>Hauling Routes"]
        arbitrage["/api/arbitrage<br/>Cross-Region Arbitrage"]
        orders["/api/orders<br/>Market Orders"]
        contracts["/api/contracts<br/>Contract Search"]
        industry["/api/industry<br/>Manufacturing"]
        pi["/api/pi-optimizer<br/>Planetary Interaction"]
        lp["/api/lp-optimizer<br/>LP Conversions"]
        route["/api/route-optimizer<br/>Route Planning"]
    end

    subgraph Backend["EVETrade API"]
        calc["Market Calculations"]
        data["Historical Data"]
    end

    station --> calc
    hauling --> calc
    arbitrage --> calc
    orders --> data
    industry --> calc
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

```mermaid
flowchart TB
    subgraph Providers["React Context Providers"]
        Sentry["Sentry.ErrorBoundary<br/>Error tracking"]
        Theme["ThemeProvider<br/>Dark/light theme"]
        Toast["ToastProvider<br/>Notifications"]
        Auth["EveAuthProvider<br/>EVE SSO"]
        Multi["MultiCharacterProvider<br/>Multi-character state"]
        Resource["ResourceProvider<br/>Universe data cache"]
        Router["RouterProvider<br/>React Router"]
    end

    Sentry --> Theme --> Toast --> Auth --> Multi --> Resource --> Router
```

## Data Flow

### Resource Loading

```mermaid
flowchart TB
    Mount["App Mount"] --> Provider["ResourceProvider"]
    Provider --> CheckCache{"Check Local Cache"}

    CheckCache -->|Hit| Return["Return cached data"]
    CheckCache -->|Miss| Supabase["Fetch from Supabase"]

    Supabase -->|Success| CacheReturn["Cache & Return"]
    Supabase -->|Failure| S3["Fallback to S3"]
    S3 --> CacheReturn
```

### Trading Query Flow

```mermaid
flowchart TB
    Submit["User Submits Form"] --> Validate{"Form Validation"}

    Validate -->|Invalid| Errors["Show errors"]
    Validate -->|Valid| Execute["useApiCall.execute()"]

    Execute --> Client["API Client<br/>(with retry logic)"]

    Client -->|429 Rate Limited| Retry["Retry with backoff"]
    Client -->|5xx Server Error| Retry
    Client -->|Success| Render["TradingTable renders results"]

    Retry --> Client
```

## Directory Structure

```
evetrade/
├── src/
│   ├── api/                    # API layer (14 files)
│   │   ├── client.js           # Axios client with retry logic
│   │   ├── esi.js              # EVE ESI API integration
│   │   ├── trading.js          # Trading API endpoints
│   │   └── ...
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
│   ├── lib/                    # Third-party integrations
│   ├── pages/                  # Page components (32 files)
│   ├── store/                  # Global state
│   └── utils/                  # Utility functions (12 files)
│
├── api/                        # Vercel serverless functions
│   ├── station.js
│   ├── hauling.js
│   ├── orders.js
│   ├── arbitrage.js
│   ├── contracts.js
│   ├── industry.js
│   ├── route-optimizer.js
│   ├── pi-optimizer.js
│   └── lp-optimizer.js
│
└── docs/                       # Documentation
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant EVE SSO
    participant ESI API

    User->>App: Click "Login with EVE"
    App->>EVE SSO: Redirect to OAuth2
    EVE SSO->>User: Login prompt
    User->>EVE SSO: Credentials
    EVE SSO->>App: Redirect with code
    App->>EVE SSO: Exchange code for tokens
    EVE SSO->>App: Access + Refresh tokens
    App->>ESI API: Fetch character data
    ESI API->>App: Character info
    App->>User: Authenticated session
```

## Route Configuration

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/` | HomePage | Landing with feature selection |
| `/station-trading` | StationTradingPage | Single station margin trading |
| `/station-hauling` | StationHaulingPage | Station-to-station hauling |
| `/region-hauling` | RegionHaulingPage | Region-to-region trading |
| `/arbitrage` | ArbitragePage | Cross-region arbitrage |
| `/market-velocity` | MarketVelocityPage | Market velocity analysis |
| `/pi-optimizer` | PIOptimizerPage | Planetary interaction |
| `/industry-profits` | IndustryProfitsPage | Manufacturing analysis |
| `/lp-optimizer` | LPOptimizerPage | LP conversion |
| `/contracts` | ContractFinderPage | Contract search |
| `/corp-orders` | CorpOrdersPage | Corporation orders |
| `/smart-route` | SmartRouteOptimizerPage | Route optimization |
| `/dashboard` | TradingDashboardPage | Trading dashboard |
| `/watchlist` | WatchlistPage | Watchlist management |
| `/portfolio` | PortfolioPage | Portfolio management |
| `/alerts` | AlertsPage | Alert management |

## External Services Integration

```mermaid
flowchart LR
    subgraph App["EVETrade App"]
        FE["Frontend"]
        API["Serverless API"]
    end

    subgraph EVE["EVE Online"]
        ESI["ESI API<br/>esi.evetech.net"]
        SSO["EVE SSO<br/>login.eveonline.com"]
    end

    subgraph AWS["AWS"]
        S3["S3 Bucket<br/>evetrade.s3.amazonaws.com"]
    end

    subgraph Services["Cloud Services"]
        Supa["Supabase<br/>Database"]
        Sent["Sentry<br/>Monitoring"]
        Backend["EVETrade API<br/>Backend calculations"]
    end

    FE --> ESI
    FE --> SSO
    FE --> S3
    FE --> Supa
    FE --> Sent
    API --> ESI
    API --> Backend
```

## Key Design Decisions

### 1. Hybrid Caching Strategy
Resources are cached locally using both IndexedDB (large objects) and localStorage (small objects):
- Fast subsequent loads
- Offline capability for cached data
- Automatic 1-hour cache expiration

### 2. Code Splitting
Large dependencies split into separate chunks:
- `vendor-react`: React, ReactDOM, React Router
- `vendor-ui`: HeadlessUI
- `vendor-markdown`: react-markdown, remark-gfm

### 3. Progressive Enhancement
The app works with:
- S3 only (default, no configuration needed)
- Supabase + S3 fallback (when configured)
- Local cache even when offline

### 4. Theme System
Uses CSS custom properties (via Tailwind) with a context provider:
- Dark theme (default): Space-themed with cyan accents
- Light theme: Clean white with dark text
- Theme preference persisted in localStorage

## Build & Deployment

```mermaid
flowchart LR
    Dev["Developer"] -->|git push| GitHub["GitHub main"]
    GitHub -->|webhook| Vercel["Vercel Build"]
    Vercel -->|deploy| CDN["Vercel CDN"]
    CDN -->|serve| Users["Users"]
```

### Commands

```bash
npm install      # Install dependencies
npm run dev      # Start Vite dev server with HMR
npm run build    # Build for production
npm run test     # Run Vitest tests
npm run lint     # Run ESLint
```

## Security Considerations

1. **No secrets in frontend** - All sensitive data handled by backend
2. **EVE SSO** - OAuth2 flow for authentication
3. **CORS** - Configured on backend services
4. **Input validation** - Client-side and server-side validation
5. **Error sanitization** - Sentry captures without PII
