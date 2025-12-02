# EVE Trade

The top-searched EVE Online trading tool that lets you discover profitable trades between stations and regions. Make ISK through station trading, inter-station hauling, or region-to-region trading.

[![EVETrade Discord Server](https://discordapp.com/api/guilds/999342296522821722/widget.png?style=banner2)](https://discord.gg/9xZh5qKCeR)

## Features

### Core Trading Tools
- **Station Trading** - Find profitable margin trades within a single station
- **Station Hauling** - Discover profitable trades between two stations
- **Region Hauling** - Find the best hauling routes between regions
- **Price Comparison** - Compare prices across regions

### Advanced Analysis
- **Market Velocity** - Track how quickly items sell
- **Arbitrage Scanner** - Detect cross-region arbitrage opportunities
- **Industry Profits** - Calculate manufacturing profitability
- **PI Optimizer** - Optimize planetary interaction setups
- **LP Optimizer** - Find the best loyalty point conversions
- **Contract Finder** - Search for profitable contracts

### Portfolio Management
- **Watchlist** - Track items you're interested in
- **Saved Routes** - Save and manage your trade routes
- **Trade Notes** - Add notes to your trades
- **Multi-Character Support** - Manage multiple EVE characters
- **Price Alerts** - Get notified when prices hit targets

### Productivity Features
- **Keyboard Shortcuts** - Navigate quickly with hotkeys
- **Bulk Copy** - Copy trade data for in-game use
- **Smart Filters** - Advanced filtering options
- **Route Optimization** - Plan optimal trade routes
- **Trading Dashboard** - Overview of your trading activity

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

The site deploys automatically to Vercel on commits to main.

## Tech Stack

- **React 19** with Vite for fast development
- **Tailwind CSS** for styling
- **React Router 7** for navigation
- **Axios** with retry logic for API calls
- **Supabase** for data persistence
- **Sentry** for error tracking
- **PWA Support** for offline capability

## Project Structure

```
evetrade/
├── src/
│   ├── api/              # API client layer
│   ├── components/       # React components
│   │   ├── analytics/    # Market analysis components
│   │   ├── common/       # Shared UI components
│   │   ├── dashboard/    # Dashboard widgets
│   │   ├── forms/        # Form inputs & autocomplete
│   │   ├── inventory/    # Inventory management
│   │   ├── layout/       # Page layouts
│   │   ├── routing/      # Route optimization
│   │   ├── tables/       # Data tables
│   │   └── trading/      # Trading-specific components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Third-party integrations
│   ├── pages/            # Page components
│   ├── store/            # Global state (Context)
│   └── utils/            # Utility functions
├── api/                  # Vercel serverless functions
└── public/               # Static assets
```

## System Status

| Service | Status |
|---------|--------|
| UI Deployment | [![Netlify Status](https://api.netlify.com/api/v1/badges/4daf6162-578e-4ff5-a99a-ab44e8cbdace/deploy-status)](https://app.netlify.com/sites/evetrade/deploys) |
| Static Data (daily) | [![Convert SDE to JSON](https://github.com/awhipp/evetrade_resources/actions/workflows/download.yml/badge.svg)](https://github.com/awhipp/evetrade_resources/actions/workflows/download.yml) |
| Volume Data (hourly) | [![Historical Volume Ingest](https://github.com/awhipp/evetrade_historical_volume/actions/workflows/historical-volume-ingest.yml/badge.svg)](https://github.com/awhipp/evetrade_historical_volume/actions/workflows/historical-volume-ingest.yml) |
| Market Data (5 min) | [![Check Data Sync](https://github.com/awhipp/evetrade-data-sync-service/actions/workflows/check.yml/badge.svg)](https://github.com/awhipp/evetrade-data-sync-service/actions/workflows/check.yml) |
| API - Dev | [![EVETrade API Deploy - Dev](https://github.com/awhipp/evetrade_api/actions/workflows/evetrade_deploy_dev.yml/badge.svg)](https://github.com/awhipp/evetrade_api/actions/workflows/evetrade_deploy_dev.yml) |
| API - Prod | [![EVETrade API Deploy - Prod](https://github.com/awhipp/evetrade_api/actions/workflows/evetrade_deploy_prod.yml/badge.svg)](https://github.com/awhipp/evetrade_api/actions/workflows/evetrade_deploy_prod.yml) |

## Architecture

Implements the [EVE ESI API](https://esi.evetech.net/ui/) via the [backend API](https://github.com/awhipp/evetrade_api) to analyze market data and find profitable trades.

![EVETrade Architecture Diagram](/documentation/evetrade_architecture.png?raw=true "EVETrade Architecture Diagram")

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Developer guide and architecture overview
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design documentation
- [API.md](./docs/API.md) - API endpoint documentation
- [COMPONENTS.md](./docs/COMPONENTS.md) - Component catalog
- [HOOKS.md](./docs/HOOKS.md) - Custom hooks reference

### Feature Documentation
- [ARBITRAGE_SCANNER.md](./ARBITRAGE_SCANNER.md) - Arbitrage detection
- [PI_OPTIMIZER.md](./PI_OPTIMIZER.md) - Planetary interaction optimization
- [INDUSTRY_FEATURE.md](./INDUSTRY_FEATURE.md) - Industry profits
- [ROUTE_OPTIMIZER.md](./ROUTE_OPTIMIZER.md) - Route optimization
- [SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md) - Alert system

## Related Repositories

| Repository | Description |
|------------|-------------|
| [evetrade_api](https://github.com/awhipp/evetrade_api) | Backend API service |
| [evetrade-data-sync-service](https://github.com/awhipp/evetrade-data-sync-service) | Market data ingestion |
| [evetrade_resources](https://github.com/awhipp/evetrade_resources) | Static data compilation |
| [evetrade_historical_volume](https://github.com/awhipp/evetrade_historical_volume) | Historical volume data |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
