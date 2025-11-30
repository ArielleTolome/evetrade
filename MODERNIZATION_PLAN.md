# EVETrade Modernization Plan

## Executive Summary

Transform EVETrade from a jQuery/Bootstrap 3 static site into a modern **Vite + React + Tailwind CSS** application with a sleek space-themed UI, deployed on Vercel.

**Key Decisions:**
- Framework: Vite + React + Tailwind CSS
- URL Compatibility: Fresh start (no backwards compatibility)
- Priority: UI-first approach
- Tables: Keep DataTables (upgrade to latest)

---

## Phase 1: Project Foundation (Days 1-2)

### 1.1 Initialize Vite + React Project

```bash
# Create new Vite React project in a new directory
npm create vite@latest evetrade-modern -- --template react
cd evetrade-modern
npm install

# Install core dependencies
npm install tailwindcss postcss autoprefixer @headlessui/react
npm install react-router-dom axios
npm install datatables.net datatables.net-react datatables.net-buttons
npm install datatables.net-buttons-dt jszip pdfmake

# Dev dependencies
npm install -D eslint prettier @types/datatables.net
npx tailwindcss init -p
```

### 1.2 New File Structure

```
evetrade-modern/
├── public/
│   ├── img/
│   │   ├── eve-logo.png
│   │   └── icons/
│   ├── fonts/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance with retry logic
│   │   ├── resources.js       # S3 resource fetching
│   │   ├── trading.js         # Trading API calls
│   │   ├── hauling.js         # Hauling API calls
│   │   └── orders.js          # Orders API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── GlassmorphicCard.jsx
│   │   │   └── SecurityBadge.jsx
│   │   ├── forms/
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormSelect.jsx
│   │   │   ├── StationAutocomplete.jsx
│   │   │   ├── RegionAutocomplete.jsx
│   │   │   └── TaxSelector.jsx
│   │   ├── tables/
│   │   │   ├── TradingTable.jsx
│   │   │   ├── HaulingTable.jsx
│   │   │   └── OrdersTable.jsx
│   │   └── layout/
│   │       ├── PageLayout.jsx
│   │       └── AnimatedBackground.jsx
│   ├── hooks/
│   │   ├── useCache.js        # IndexedDB + localStorage caching
│   │   ├── useResources.js    # Universe/region/station data
│   │   ├── useFormPersist.js  # Persist form values
│   │   └── useApiCall.js      # Generic API hook with loading/error states
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── StationTradingPage.jsx
│   │   ├── StationHaulingPage.jsx
│   │   ├── RegionHaulingPage.jsx
│   │   ├── OrdersPage.jsx
│   │   └── HelpPage.jsx
│   ├── store/
│   │   ├── ResourceContext.jsx  # Global resource data context
│   │   └── ThemeContext.jsx     # Theme preferences
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   ├── utils/
│   │   ├── formatters.js      # Number/currency formatting
│   │   ├── security.js        # Security status colors/helpers
│   │   ├── stations.js        # Station name parsing
│   │   └── constants.js       # API endpoints, colors, etc.
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
├── vercel.json
├── .eslintrc.cjs
└── package.json
```

### 1.3 Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Space theme colors
        'space-black': '#0a0a0f',
        'space-dark': '#1a1a2e',
        'space-mid': '#16213e',
        'accent-cyan': '#00d4ff',
        'accent-gold': '#ffd700',
        'accent-purple': '#8b5cf6',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',

        // Security status colors (EVE accurate)
        'sec-10': '#2fefef',   // 1.0
        'sec-09': '#48f048',   // 0.9
        'sec-08': '#00ef47',   // 0.8
        'sec-07': '#00ef00',   // 0.7
        'sec-06': '#8fef2f',   // 0.6
        'sec-05': '#efef00',   // 0.5
        'sec-04': '#d77700',   // 0.4
        'sec-03': '#f06000',   // 0.3
        'sec-02': '#f04800',   // 0.2
        'sec-01': '#d73000',   // 0.1
        'sec-00': '#f00000',   // 0.0 and below
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## Phase 2: Core Infrastructure (Days 3-5)

### 2.1 API Layer Design

```javascript
// src/api/client.js
import axios from 'axios';

const ENDPOINTS = {
  production: '/api',
  development: '/dev',
  local: 'https://ykojlvmo2vgjde53lye6nyst5y0irbdx.lambda-url.us-east-1.on.aws',
};

const RESOURCE_ENDPOINT = 'https://evetrade.s3.amazonaws.com/resources/';

// Determine API endpoint based on hostname
function getApiEndpoint() {
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return ENDPOINTS.local;
  }
  if (hostname.includes('dev') || hostname.includes('preview')) {
    return ENDPOINTS.development;
  }
  return ENDPOINTS.production;
}

// Create axios instance with retry logic
const apiClient = axios.create({
  baseURL: getApiEndpoint(),
  timeout: 30000,
});

// Retry interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config._retryCount) config._retryCount = 0;

    if (config._retryCount < 3 && error.response?.status === 429) {
      config._retryCount++;
      const delay = Math.pow(2, config._retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

export { apiClient, RESOURCE_ENDPOINT };
```

### 2.2 Cache Layer with IndexedDB Fallback

```javascript
// src/hooks/useCache.js
const DB_NAME = 'evetrade-cache';
const STORE_NAME = 'resources';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };
  });
}

export async function getCached(key) {
  try {
    // Try localStorage first (for smaller items)
    const localData = localStorage.getItem(key);
    const localTimestamp = localStorage.getItem(`${key}_timestamp`);

    if (localData && localTimestamp) {
      if (Date.now() - parseInt(localTimestamp) < CACHE_DURATION) {
        return JSON.parse(localData);
      }
    }

    // Fall back to IndexedDB (for larger items)
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < CACHE_DURATION) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

export async function setCached(key, data) {
  const timestamp = Date.now();

  try {
    // Try localStorage first
    const serialized = JSON.stringify(data);
    if (serialized.length < 2 * 1024 * 1024) { // < 2MB
      localStorage.setItem(key, serialized);
      localStorage.setItem(`${key}_timestamp`, timestamp.toString());
      return;
    }
  } catch (e) {
    // localStorage full, use IndexedDB
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, data, timestamp });
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}
```

### 2.3 Resource Loading Hook

```javascript
// src/hooks/useResources.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getCached, setCached } from './useCache';
import { RESOURCE_ENDPOINT } from '../api/client';

const ResourceContext = createContext(null);

export function ResourceProvider({ children }) {
  const [resources, setResources] = useState({
    universeList: null,
    regionList: null,
    stationList: null,
    structureInfo: null,
    nearbyRegions: null,
    functionDurations: null,
    invTypes: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    try {
      const resourceNames = [
        'universeList',
        'regionList',
        'stationList',
        'structureList',
        'structureInfo',
        'functionDurations',
      ];

      const loaded = {};

      for (const name of resourceNames) {
        let data = await getCached(name);

        if (!data) {
          const response = await fetch(`${RESOURCE_ENDPOINT}${name}.json`);
          data = await response.json();
          await setCached(name, data);
        }

        loaded[name] = data;
      }

      // Merge structures into stationList
      if (loaded.structureList) {
        loaded.stationList = [
          ...loaded.stationList,
          ...loaded.structureList.map(s => `${s}*`),
        ];
      }

      // Build nearby regions map
      loaded.nearbyRegions = buildNearbyRegions(loaded.universeList);

      setResources(loaded);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }

  return (
    <ResourceContext.Provider value={{ ...resources, loading, error }}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  return useContext(ResourceContext);
}

function buildNearbyRegions(universeList) {
  const nearby = {};
  for (const [name, data] of Object.entries(universeList)) {
    if (data.around) {
      nearby[name] = data.around;
    }
  }
  return nearby;
}
```

---

## Phase 3: UI Component Library (Days 6-10)

### 3.1 Design System Components

#### Glassmorphic Card Component
```jsx
// src/components/common/GlassmorphicCard.jsx
export function GlassmorphicCard({ children, className = '' }) {
  return (
    <div className={`
      bg-space-dark/50
      backdrop-blur-md
      border border-accent-cyan/20
      rounded-xl
      shadow-lg
      shadow-accent-cyan/5
      ${className}
    `}>
      {children}
    </div>
  );
}
```

#### Security Badge Component
```jsx
// src/components/common/SecurityBadge.jsx
const SEC_COLORS = {
  10: 'bg-sec-10',
  9: 'bg-sec-09',
  8: 'bg-sec-08',
  7: 'bg-sec-07',
  6: 'bg-sec-06',
  5: 'bg-sec-05',
  4: 'bg-sec-04',
  3: 'bg-sec-03',
  2: 'bg-sec-02',
  1: 'bg-sec-01',
  0: 'bg-sec-00',
};

export function SecurityBadge({ level, isCitadel = false }) {
  const secLevel = Math.max(0, Math.min(10, Math.round(level * 10)));

  return (
    <span className={`
      inline-flex items-center gap-1
      px-2 py-0.5 rounded-full text-xs font-mono
      ${SEC_COLORS[secLevel]} text-space-black
      ${isCitadel ? 'ring-2 ring-accent-gold ring-offset-1 ring-offset-space-dark' : ''}
    `}>
      {level.toFixed(1)}
      {isCitadel && <span className="text-[10px]">★</span>}
    </span>
  );
}
```

#### Animated Background
```jsx
// src/components/layout/AnimatedBackground.jsx
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-black via-space-dark to-space-mid" />

      {/* Animated stars */}
      <div className="absolute inset-0 opacity-50">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Nebula effect */}
      <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-accent-purple/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-accent-cyan/10 rounded-full blur-3xl" />
    </div>
  );
}
```

#### Navigation Bar
```jsx
// src/components/common/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/station-trading', label: 'Station Trading' },
  { path: '/station-hauling', label: 'Station Hauling' },
  { path: '/region-hauling', label: 'Region Hauling' },
  { path: '/help', label: 'Help' },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="
      sticky top-0 z-50
      bg-space-dark/70 backdrop-blur-lg
      border-b border-accent-cyan/20
    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/img/eve-logo.png" alt="EVE" className="h-8" />
            <span className="font-display text-xl font-bold text-accent-cyan">
              EVETrade
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${location.pathname === path
                    ? 'bg-accent-cyan/20 text-accent-cyan'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
```

### 3.2 Form Components

#### Station Autocomplete
```jsx
// src/components/forms/StationAutocomplete.jsx
import { useState, useRef, useEffect } from 'react';
import { useResources } from '../../hooks/useResources';

export function StationAutocomplete({
  value,
  onChange,
  placeholder = 'Search stations...',
  label,
  error,
}) {
  const { stationList, universeList } = useResources();
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && stationList) {
      const search = value.toLowerCase();
      setFiltered(
        stationList
          .filter(s => s.toLowerCase().includes(search))
          .slice(0, 10)
      );
    } else {
      setFiltered([]);
    }
  }, [value, stationList]);

  const getSecurityLevel = (stationName) => {
    const data = universeList?.[stationName];
    return data?.security ?? 0;
  };

  const isCitadel = (stationName) => stationName.endsWith('*');

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-lg
          bg-space-dark/50 border
          ${error ? 'border-red-500' : 'border-accent-cyan/20'}
          text-text-primary placeholder-text-secondary/50
          focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan
          transition-all duration-200
        `}
      />

      {isOpen && filtered.length > 0 && (
        <ul className="
          absolute z-50 w-full mt-1
          bg-space-dark border border-accent-cyan/20 rounded-lg
          shadow-xl shadow-black/50
          max-h-60 overflow-auto
        ">
          {filtered.map((station) => (
            <li
              key={station}
              onClick={() => {
                onChange(station);
                setIsOpen(false);
              }}
              className="
                flex items-center justify-between
                px-4 py-2 cursor-pointer
                hover:bg-accent-cyan/10
                transition-colors
              "
            >
              <span className={isCitadel(station) ? 'text-accent-gold' : 'text-text-primary'}>
                {station}
              </span>
              <SecurityBadge
                level={getSecurityLevel(station)}
                isCitadel={isCitadel(station)}
              />
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
```

### 3.3 DataTables Integration

```jsx
// src/components/tables/TradingTable.jsx
import { useEffect, useRef } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';

DataTable.use(DT);

export function TradingTable({ data, columns, onRowClick }) {
  const tableRef = useRef(null);

  const tableColumns = columns.map(col => ({
    data: col.key,
    title: col.label,
    render: col.render || ((data) => data),
    className: col.className || '',
  }));

  return (
    <div className="
      bg-space-dark/30 rounded-xl border border-accent-cyan/10
      overflow-hidden
    ">
      <DataTable
        ref={tableRef}
        data={data}
        columns={tableColumns}
        options={{
          dom: 'Bfrtip',
          buttons: ['copy', 'csv', 'excel', 'pdf'],
          order: [[columns.findIndex(c => c.defaultSort), 'desc']],
          pageLength: 25,
          scrollX: true,
          responsive: true,
          language: {
            search: '',
            searchPlaceholder: 'Search results...',
            emptyTable: 'No trades found matching your criteria',
          },
        }}
        className="
          w-full text-sm
          [&_th]:bg-space-mid [&_th]:text-accent-cyan [&_th]:font-display
          [&_td]:bg-transparent [&_td]:text-text-primary
          [&_tr:hover_td]:bg-accent-cyan/5
        "
      />
    </div>
  );
}
```

---

## Phase 4: Page Implementation (Days 11-18)

### 4.1 Home Page

```jsx
// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';

const tradingModes = [
  {
    title: 'Station Trading',
    description: 'Find profitable buy/sell margins within a single station',
    path: '/station-trading',
    icon: '📊',
    color: 'accent-cyan',
  },
  {
    title: 'Station Hauling',
    description: 'Discover profitable trades between specific stations',
    path: '/station-hauling',
    icon: '🚀',
    color: 'accent-gold',
  },
  {
    title: 'Region Hauling',
    description: 'Find the best trades across entire regions',
    path: '/region-hauling',
    icon: '🌌',
    color: 'accent-purple',
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
          <span className="text-accent-cyan">EVE</span>
          <span className="text-text-primary">Trade</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-xl mx-auto">
          Maximize your ISK. Find profitable trades across New Eden.
        </p>
      </div>

      {/* Trading Mode Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        {tradingModes.map((mode) => (
          <Link key={mode.path} to={mode.path}>
            <GlassmorphicCard className="
              p-8 h-full
              hover:border-accent-cyan/40
              hover:shadow-lg hover:shadow-accent-cyan/10
              transition-all duration-300
              group
            ">
              <div className="text-4xl mb-4">{mode.icon}</div>
              <h2 className={`
                font-display text-xl font-bold mb-2
                text-${mode.color} group-hover:text-accent-cyan
                transition-colors
              `}>
                {mode.title}
              </h2>
              <p className="text-text-secondary">
                {mode.description}
              </p>
            </GlassmorphicCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 4.2 Station Trading Page

```jsx
// src/pages/StationTradingPage.jsx
import { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { StationAutocomplete } from '../components/forms/StationAutocomplete';
import { FormInput, FormSelect } from '../components/forms';
import { TradingTable } from '../components/tables/TradingTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { useStationTrading } from '../hooks/useStationTrading';

const TAX_OPTIONS = [
  { value: '0.0445', label: 'Accounting 0' },
  { value: '0.0401', label: 'Accounting 1' },
  { value: '0.0356', label: 'Accounting 2' },
  { value: '0.0312', label: 'Accounting 3' },
  { value: '0.0267', label: 'Accounting 4' },
  { value: '0.0225', label: 'Accounting 5' },
];

export function StationTradingPage() {
  const [form, setForm] = useState({
    station: '',
    profit: 1000000,
    tax: '0.0225',
    minVolume: 100,
    brokerFee: 0.03,
    marginAbove: 0.1,
    marginBelow: 0.5,
  });

  const { data, loading, error, execute } = useStationTrading();

  const handleSubmit = (e) => {
    e.preventDefault();
    execute(form);
  };

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <PageLayout title="Station Trading">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        <GlassmorphicCard className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StationAutocomplete
                label="Station"
                value={form.station}
                onChange={(v) => updateForm('station', v)}
                placeholder="Jita IV - Moon 4..."
              />

              <FormInput
                label="Minimum Profit (ISK)"
                type="number"
                value={form.profit}
                onChange={(v) => updateForm('profit', v)}
              />

              <FormSelect
                label="Sales Tax Level"
                value={form.tax}
                onChange={(v) => updateForm('tax', v)}
                options={TAX_OPTIONS}
              />

              <FormInput
                label="Minimum Volume"
                type="number"
                value={form.minVolume}
                onChange={(v) => updateForm('minVolume', v)}
              />

              <FormInput
                label="Broker Fee %"
                type="number"
                step="0.01"
                value={form.brokerFee * 100}
                onChange={(v) => updateForm('brokerFee', v / 100)}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Margin Above"
                  type="number"
                  step="0.01"
                  value={form.marginAbove * 100}
                  onChange={(v) => updateForm('marginAbove', v / 100)}
                />
                <FormInput
                  label="Margin Below"
                  type="number"
                  step="0.01"
                  value={form.marginBelow * 100}
                  onChange={(v) => updateForm('marginBelow', v / 100)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-4 rounded-lg
                bg-gradient-to-r from-accent-cyan to-accent-purple
                text-space-black font-display font-bold text-lg
                hover:shadow-lg hover:shadow-accent-cyan/25
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {loading ? 'Searching...' : 'Find Trades'}
            </button>
          </form>
        </GlassmorphicCard>

        {/* Results */}
        {loading && <SkeletonLoader rows={10} />}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error.message}
          </div>
        )}

        {data && data.length > 0 && (
          <TradingTable
            data={data}
            columns={tradingColumns}
            onRowClick={(row) => {
              // Navigate to orders page
            }}
          />
        )}

        {data && data.length === 0 && (
          <GlassmorphicCard className="p-8 text-center">
            <p className="text-text-secondary">
              No trades found matching your criteria. Try adjusting your filters.
            </p>
          </GlassmorphicCard>
        )}
      </div>
    </PageLayout>
  );
}
```

### 4.3 Station Hauling & Region Hauling

Similar patterns to Station Trading, with additional components for:
- Multi-station selection with add/remove functionality
- Trade preference toggles (buy vs sell)
- System expansion button
- Nearby regions checkbox and display

### 4.4 Orders Page (Market Depth)

```jsx
// src/pages/OrdersPage.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { OrdersTable } from '../components/tables/OrdersTable';

export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const { data, loading, error, execute } = useOrders();

  useEffect(() => {
    const itemId = searchParams.get('itemId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (itemId && from && to) {
      execute({ itemId, from, to });
    }
  }, [searchParams]);

  return (
    <PageLayout title="Market Depth">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <GlassmorphicCard className="p-6">
            <h2 className="font-display text-xl text-accent-cyan mb-4">
              Buy Orders
            </h2>
            {loading ? (
              <SkeletonLoader rows={5} />
            ) : (
              <OrdersTable data={data?.buyOrders} type="buy" />
            )}
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <h2 className="font-display text-xl text-accent-gold mb-4">
              Sell Orders
            </h2>
            {loading ? (
              <SkeletonLoader rows={5} />
            ) : (
              <OrdersTable data={data?.sellOrders} type="sell" />
            )}
          </GlassmorphicCard>
        </div>
      </div>
    </PageLayout>
  );
}
```

---

## Phase 5: Router & App Setup (Days 11-12)

```jsx
// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { StationTradingPage } from './pages/StationTradingPage';
import { StationHaulingPage } from './pages/StationHaulingPage';
import { RegionHaulingPage } from './pages/RegionHaulingPage';
import { OrdersPage } from './pages/OrdersPage';
import { HelpPage } from './pages/HelpPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/station-trading', element: <StationTradingPage /> },
  { path: '/station-hauling', element: <StationHaulingPage /> },
  { path: '/region-hauling', element: <RegionHaulingPage /> },
  { path: '/orders', element: <OrdersPage /> },
  { path: '/help', element: <HelpPage /> },
]);
```

```jsx
// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { ResourceProvider } from './hooks/useResources';
import { AnimatedBackground } from './components/layout/AnimatedBackground';
import { router } from './router';

export default function App() {
  return (
    <ResourceProvider>
      <AnimatedBackground />
      <RouterProvider router={router} />
    </ResourceProvider>
  );
}
```

---

## Phase 6: Vercel Deployment (Days 19-20)

### 6.1 Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://remy65obllca7kdbhp56q74l7m0ultyy.lambda-url.us-east-1.on.aws/:path*" },
    { "source": "/dev/:path*", "destination": "https://ykojlvmo2vgjde53lye6nyst5y0irbdx.lambda-url.us-east-1.on.aws/:path*" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 6.2 Environment Variables

```bash
# .env.production
VITE_API_ENDPOINT=/api
VITE_RESOURCE_ENDPOINT=https://evetrade.s3.amazonaws.com/resources/

# .env.development
VITE_API_ENDPOINT=/dev
VITE_RESOURCE_ENDPOINT=https://evetrade.s3.amazonaws.com/resources/
```

### 6.3 Remove Legacy Files

Delete these files after migration:
- `netlify.toml`
- All files in root directory (move to src/)
- Old `js/` directory
- Old `css/` directory

---

## Phase 7: Testing & Quality (Days 21-23)

### 7.1 Unit Testing Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```javascript
// vite.config.js
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

### 7.2 Test Files to Create

- `src/hooks/__tests__/useCache.test.js`
- `src/hooks/__tests__/useResources.test.js`
- `src/components/forms/__tests__/StationAutocomplete.test.jsx`
- `src/pages/__tests__/StationTradingPage.test.jsx`

### 7.3 ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
```

---

## Phase 8: Performance Optimization (Day 24)

### 8.1 Code Splitting

```jsx
// src/router.jsx - with lazy loading
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SkeletonLoader } from './components/common/SkeletonLoader';

const HomePage = lazy(() => import('./pages/HomePage'));
const StationTradingPage = lazy(() => import('./pages/StationTradingPage'));
const StationHaulingPage = lazy(() => import('./pages/StationHaulingPage'));
const RegionHaulingPage = lazy(() => import('./pages/RegionHaulingPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));

const LazyPage = ({ Component }) => (
  <Suspense fallback={<SkeletonLoader fullPage />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <LazyPage Component={HomePage} /> },
  // ... etc
]);
```

### 8.2 Bundle Analysis

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
  ],
});
```

---

## Migration Strategy

### Step 1: Parallel Development
1. Create new `evetrade-modern/` directory alongside existing code
2. Build new React app while old site remains live
3. Test thoroughly in Vercel preview deployments

### Step 2: Feature Parity Checklist
Before going live, verify:
- [ ] Station Trading - all form fields work
- [ ] Station Hauling - multi-station selection works
- [ ] Region Hauling - nearby regions feature works
- [ ] Orders - market depth displays correctly
- [ ] DataTables exports (CSV, Excel, PDF)
- [ ] Mobile responsiveness
- [ ] Error handling and loading states
- [ ] Cache functionality (hourly refresh)

### Step 3: Cutover
1. Deploy to Vercel
2. Update DNS to point to Vercel
3. Keep Netlify live briefly as backup
4. Monitor for issues
5. Decommission Netlify

---

## Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Foundation | Days 1-2 | Vite project, file structure, Tailwind config |
| 2. Infrastructure | Days 3-5 | API layer, caching, resource hooks |
| 3. UI Components | Days 6-10 | Design system, forms, tables, layout |
| 4. Pages | Days 11-18 | All 5 trading pages migrated |
| 5. Router | Days 11-12 | React Router setup, App wrapper |
| 6. Deployment | Days 19-20 | Vercel config, env vars, cleanup |
| 7. Testing | Days 21-23 | Unit tests, ESLint, QA |
| 8. Performance | Day 24 | Code splitting, optimization |

**Total Estimated Effort: 24 working days**

---

## Additional Requirements (Confirmed)

### Google Analytics & AdSense
- **Keep both integrations**
- Install `@analytics/google-analytics` for React
- Add AdSense script to `index.html`
- Create `AdBanner` component for placement

### Theme System (Dark + Light Toggle)
- Implement with React Context + Tailwind's `dark:` classes
- Store preference in localStorage
- Add theme toggle button in Navbar
- Light theme colors:
  - Background: `#f8fafc` (slate-50)
  - Secondary: `#e2e8f0` (slate-200)
  - Text: `#1e293b` (slate-800)
  - Accents remain similar for brand consistency

```jsx
// src/store/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Help Pages (Markdown Renderer)
- Install `react-markdown` and `remark-gfm`
- Create `MarkdownPage` component
- Keep help content as `.md` files in `src/content/`

```jsx
// src/components/common/MarkdownPage.jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownPage({ content }) {
  return (
    <article className="prose prose-invert dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
```

---

## Updated Dependencies

```bash
# Additional packages needed
npm install react-markdown remark-gfm
npm install @headlessui/react  # For theme toggle switch
```

---

## Final Summary

This modernization will transform EVETrade into a modern, maintainable React application with:

- **Modern Stack**: Vite + React 18 + Tailwind CSS
- **Space Theme**: Dark/light modes with sci-fi aesthetics
- **Better UX**: Glassmorphic cards, smooth animations, skeleton loaders
- **Better DX**: ESLint, component architecture, proper state management
- **Performance**: Code splitting, lazy loading, IndexedDB caching
- **Deployment**: Vercel with proper headers and routing
- **Analytics**: Google Analytics + AdSense preserved
- **Documentation**: Markdown-based help pages
