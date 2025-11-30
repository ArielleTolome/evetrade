# EVETrade Modern

A modern web application for discovering profitable trades in EVE Online. Built with React, Vite, and Tailwind CSS.

## Features

- **Station Trading**: Find profitable buy/sell margins within a single station
- **Station Hauling**: Discover profitable trades between specific stations
- **Region Hauling**: Find the best trades across entire regions
- **Market Depth**: View buy/sell order books for specific items
- **Export Data**: Export results to CSV, Excel, PDF, or print

## Tech Stack

- **Frontend**: React 19, React Router 7
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Data Tables**: DataTables with export buttons
- **Caching**: Supabase (optional) + IndexedDB/localStorage
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/awhipp/evetrade-modern.git
cd evetrade-modern

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Supabase (optional - falls back to S3 if not set)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Google AdSense (optional)
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable UI components
│   ├── common/       # Basic components (buttons, cards)
│   ├── forms/        # Form inputs and controls
│   ├── layout/       # Layout components
│   └── tables/       # DataTables components
├── hooks/            # Custom React hooks
├── lib/              # Third-party integrations (Supabase)
├── pages/            # Page components
├── store/            # Context providers
├── test/             # Test setup and utilities
└── utils/            # Utility functions
```

## Deployment

### Vercel (Recommended)

The project is configured for Vercel deployment:

```bash
npm install -g vercel
vercel
```

### Manual Build

```bash
npm run build
# Deploy contents of dist/ folder
```

## API Integration

This frontend connects to the EVETrade API:
- Production: `/api/*` (proxied to AWS Lambda)
- Development: `/dev/*` (proxied to development Lambda)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Related Projects

- [evetrade_api](https://github.com/awhipp/evetrade_api) - API backend
- [evetrade-data-sync-service](https://github.com/awhipp/evetrade-data-sync-service) - Market data ingestion
- [evetrade_resources](https://github.com/awhipp/evetrade_resources) - Static data compilation
