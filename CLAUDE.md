# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EVETrade is a modern React application for EVE Online trading. It helps players discover profitable trades between stations and regions, supporting station trading (margin trading) and inter-station/region hauling.

## Development

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

## Architecture

### Tech Stack
- **React 19** with Vite for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **DataTables** for data display with export capabilities
- **Axios** with retry logic for API calls

### Directory Structure
```
src/
├── api/           # API layer (client.js, trading.js)
├── components/    # React components
│   ├── common/    # Navbar, Footer, LoadingSpinner, etc.
│   ├── forms/     # FormInput, FormSelect, autocomplete components
│   ├── layout/    # PageLayout, AnimatedBackground
│   └── tables/    # TradingTable
├── hooks/         # Custom hooks (useCache, useResources, useApiCall)
├── lib/           # Third-party integrations (supabase.js)
├── pages/         # Page components
├── store/         # Global state (ThemeContext)
└── utils/         # Utilities (formatters, security, constants)
```

### Pages
- `HomePage.jsx` - Landing page with trading mode selection
- `StationTradingPage.jsx` - Single station margin trading
- `StationHaulingPage.jsx` - Station-to-station hauling
- `RegionHaulingPage.jsx` - Region-to-region hauling
- `OrdersPage.jsx` - Market depth view for specific items
- `HelpPage.jsx` - Documentation

### API Endpoints
- Vercel serverless functions in `/api/` directory
- Static resources: `https://evetrade.s3.amazonaws.com/resources/`

### Data Flow
1. App mounts, ResourceProvider loads universe data from cache or S3
2. User navigates to trading page
3. Form submission triggers API call via useApiCall hook
4. Results displayed in TradingTable with export options

## Related Repositories

This is the frontend only. Backend services:
- [evetrade_api](https://github.com/awhipp/evetrade_api) - API backend
- [evetrade-data-sync-service](https://github.com/awhipp/evetrade-data-sync-service) - Market data ingestion
- [evetrade_resources](https://github.com/awhipp/evetrade_resources) - Static data compilation
- [evetrade_historical_volume](https://github.com/awhipp/evetrade_historical_volume) - Historical volume data
