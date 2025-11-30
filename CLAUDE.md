# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EVETrade is a static web application for EVE Online trading. It helps players discover profitable trades between stations and regions, supporting station trading (margin trading) and inter-station/region hauling.

## Development

This is a static HTML/CSS/JS site with no build process. To develop locally:

```bash
# Use any local server to avoid CORS issues:
npx serve .
# or
python -m http.server 8000
# or VS Code Live Server extension
```

The site deploys automatically to Netlify on commits to main.

## Architecture

### Page Structure
- `index.html` - Landing page with trading mode selection
- `station-trading.html` + `js/station-trading.js` - Single station margin trading
- `station-hauling.html` + `js/station-hauling.js` - Station-to-station hauling
- `region-hauling.html` + `js/region-hauling.js` - Region-to-region hauling
- `orders.html` + `js/orders.js` - Market depth view for specific items

### Core JavaScript (`js/main.js`)
- Global configuration and API endpoint management
- Resource data loading with localStorage caching (hourly expiry)
- Loads universe data: `universeList`, `regionList`, `stationList`, `structureList`, `structureInfo`
- `fetchWithRetry()` - API calls with retry logic and rate limit handling
- `loadComplete()` - Called when page resources are ready
- Each page defines `loadNext()` function called after core data loads

### API Endpoints
- Production: `/api/*` proxied via Netlify to AWS Lambda
- Development: `/dev/*` proxied to separate Lambda
- Local: Direct Lambda URL (defined in `main.js`)
- Static resources: `https://evetrade.s3.amazonaws.com/resources/`

### Data Flow
1. `main.js` loads on page, fetches `version.json`
2. Loads cached or fresh universe/region/station data
3. Calls page-specific `loadNext()` function
4. User submits form, request goes to API
5. Results displayed in DataTables

### External Dependencies
- jQuery 1.11.1
- Bootstrap (bundled)
- DataTables (for result tables with export buttons)
- Awesomplete (autocomplete for station/region inputs)
- SweetAlert (custom alerts)

## Related Repositories

This is the frontend only. Backend services:
- [evetrade_api](https://github.com/awhipp/evetrade_api) - API backend
- [evetrade-data-sync-service](https://github.com/awhipp/evetrade-data-sync-service) - Market data ingestion
- [evetrade_resources](https://github.com/awhipp/evetrade_resources) - Static data compilation
- [evetrade_historical_volume](https://github.com/awhipp/evetrade_historical_volume) - Historical volume data
