# Architecture Overview

This document describes the architecture of EVETrade Modern.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    React Application                     ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   ││
│  │  │   Pages   │  │Components │  │   State/Context   │   ││
│  │  └───────────┘  └───────────┘  └───────────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Local Cache (IndexedDB/localStorage)        ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────┬──────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  EVETrade API   │  │    Supabase     │  │   S3 Resources  │
│ (AWS Lambda)    │  │   (Optional)    │  │   (Fallback)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Directory Structure

```
src/
├── api/                    # API layer
│   ├── client.js          # Axios client with retry logic
│   └── trading.js         # Trading API endpoints
│
├── components/             # React components
│   ├── common/            # Shared UI components
│   │   ├── GlassmorphicCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── SecurityBadge.jsx
│   │   └── SkeletonLoader.jsx
│   │
│   ├── forms/             # Form components
│   │   ├── FormInput.jsx
│   │   ├── FormSelect.jsx
│   │   ├── StationAutocomplete.jsx
│   │   └── RegionAutocomplete.jsx
│   │
│   ├── layout/            # Layout components
│   │   ├── PageLayout.jsx
│   │   └── AnimatedBackground.jsx
│   │
│   └── tables/            # Data display
│       └── TradingTable.jsx
│
├── hooks/                  # Custom React hooks
│   ├── useCache.js        # Local caching utilities
│   ├── useResources.jsx   # Resource loading context
│   └── useApiCall.js      # API call wrapper
│
├── lib/                    # Third-party integrations
│   └── supabase.js        # Supabase client
│
├── pages/                  # Page components
│   ├── HomePage.jsx
│   ├── StationTradingPage.jsx
│   ├── StationHaulingPage.jsx
│   ├── RegionHaulingPage.jsx
│   ├── OrdersPage.jsx
│   └── HelpPage.jsx
│
├── store/                  # Global state
│   └── ThemeContext.jsx   # Dark/light theme
│
├── test/                   # Test utilities
│   └── setup.js           # Test configuration
│
└── utils/                  # Utility functions
    ├── constants.js       # App constants
    ├── formatters.js      # Number/ISK formatting
    ├── security.js        # Security status utilities
    └── stations.js        # Station name utilities
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
