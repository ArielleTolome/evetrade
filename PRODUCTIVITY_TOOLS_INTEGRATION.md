# Productivity Tools Integration Guide

This guide shows you how to integrate the new productivity tools into your existing EVETrade pages.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Station Trading Page](#station-trading-page)
3. [Trading Dashboard](#trading-dashboard)
4. [Header Integration](#header-integration)
5. [Table Integration](#table-integration)

---

## Quick Start

### Import the components you need:

```jsx
// Copy buttons for quick actions
import { QuickCopyButtons, QuickCopyButton } from './components/common/QuickCopyButtons';

// Session timer for tracking
import { TradeSessionTimer } from './components/common/TradeSessionTimer';

// Bulk calculator for planning
import { BulkOrderCalculator } from './components/trading/BulkOrderCalculator';

// Enhanced export for data
import { EnhancedExport } from './components/common/EnhancedExport';
```

---

## Station Trading Page

Add the session timer and enhanced export to your station trading page:

```jsx
// src/pages/StationTradingPage.jsx

import { useState } from 'react';
import { TradeSessionTimer } from '../components/common/TradeSessionTimer';
import { EnhancedExport } from '../components/common/EnhancedExport';
import { QuickCopyButtons } from '../components/common/QuickCopyButtons';

export function StationTradingPage() {
  const [tradingData, setTradingData] = useState([]);

  // Column definitions for export
  const exportColumns = [
    { key: 'Item', label: 'Item', export: true },
    { key: 'Buy Price', label: 'Buy Price', export: true, format: 'isk' },
    { key: 'Sell Price', label: 'Sell Price', export: true, format: 'isk' },
    { key: 'Volume', label: 'Volume', export: true, format: 'number' },
    { key: 'Net Profit', label: 'Net Profit', export: true, format: 'isk' },
    { key: 'Gross Margin', label: 'Margin', export: true, format: 'percent' },
    { key: 'ROI', label: 'ROI', export: true, format: 'percent' },
  ];

  return (
    <PageLayout>
      <div className="grid grid-cols-4 gap-6">
        {/* Main content - 3 columns */}
        <div className="col-span-3 space-y-6">
          {/* Search form */}
          <GlassmorphicCard>
            <h2>Find Station Trading Opportunities</h2>
            {/* Your existing form */}
          </GlassmorphicCard>

          {/* Results table */}
          {tradingData.length > 0 && (
            <GlassmorphicCard>
              <div className="flex items-center justify-between mb-4">
                <h3>Trading Opportunities</h3>
                <EnhancedExport
                  data={tradingData}
                  defaultColumns={exportColumns}
                  filename="station-trading"
                  showTemplates={true}
                />
              </div>

              <table className="w-full">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Buy</th>
                    <th>Sell</th>
                    <th>Profit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tradingData.map((row, i) => (
                    <tr key={i}>
                      <td>{row.Item}</td>
                      <td>{row['Buy Price']}</td>
                      <td>{row['Sell Price']}</td>
                      <td>{row['Net Profit']}</td>
                      <td>
                        <QuickCopyButtons
                          itemName={row.Item}
                          price={row['Sell Price']}
                          quantity={row.Volume}
                          compact={true}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassmorphicCard>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="col-span-1">
          <TradeSessionTimer
            onSessionEnd={(session) => {
              console.log('Session ended:', session);
              // Track analytics, save to database, etc.
            }}
            showHistory={true}
          />
        </div>
      </div>
    </PageLayout>
  );
}
```

---

## Trading Dashboard

Create a comprehensive trading dashboard with all tools:

```jsx
// src/pages/TradingDashboard.jsx

import { useState } from 'react';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { TradeSessionTimer } from '../components/common/TradeSessionTimer';
import { BulkOrderCalculator } from '../components/trading/BulkOrderCalculator';
import { QuickStats } from '../components/common/QuickStats';

export function TradingDashboard() {
  const [sessionStats, setSessionStats] = useState({
    totalProfit: 0,
    activeOrders: 0,
    completedTrades: 0,
  });

  const handleSessionEnd = (session) => {
    // Update stats when session ends
    setSessionStats(prev => ({
      ...prev,
      totalProfit: prev.totalProfit + session.iskEarned,
    }));
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="grid grid-cols-4 gap-4">
          <GlassmorphicCard padding="p-4">
            <div className="text-sm text-text-secondary">Total Profit Today</div>
            <div className="text-2xl font-bold text-green-400">
              {formatISK(sessionStats.totalProfit)}
            </div>
          </GlassmorphicCard>
          <GlassmorphicCard padding="p-4">
            <div className="text-sm text-text-secondary">Active Orders</div>
            <div className="text-2xl font-bold text-accent-cyan">
              {sessionStats.activeOrders}
            </div>
          </GlassmorphicCard>
          <GlassmorphicCard padding="p-4">
            <div className="text-sm text-text-secondary">Completed Trades</div>
            <div className="text-2xl font-bold text-accent-gold">
              {sessionStats.completedTrades}
            </div>
          </GlassmorphicCard>
          <GlassmorphicCard padding="p-4">
            {/* Compact timer in stats area */}
            <TradeSessionTimer compact={true} showHistory={false} />
          </GlassmorphicCard>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Calculator - 2 columns */}
          <div className="col-span-2">
            <BulkOrderCalculator
              onCalculate={(calculations) => {
                console.log('Calculations:', calculations);
              }}
            />
          </div>

          {/* Session timer - 1 column */}
          <div className="col-span-1">
            <TradeSessionTimer
              onSessionStart={() => console.log('Session started')}
              onSessionEnd={handleSessionEnd}
              showHistory={true}
            />
          </div>
        </div>

        {/* Additional dashboard sections */}
        <div className="grid grid-cols-2 gap-6">
          <GlassmorphicCard>
            <h3 className="text-lg font-display text-accent-cyan mb-4">
              Active Trades
            </h3>
            {/* Your active trades list */}
          </GlassmorphicCard>

          <GlassmorphicCard>
            <h3 className="text-lg font-display text-accent-cyan mb-4">
              Market Watchlist
            </h3>
            {/* Your watchlist */}
          </GlassmorphicCard>
        </div>
      </div>
    </PageLayout>
  );
}
```

---

## Header Integration

Add a compact timer to your app header:

```jsx
// src/components/common/Navbar.jsx

import { Link } from 'react-router-dom';
import { TradeSessionTimer } from './TradeSessionTimer';

export function Navbar() {
  return (
    <nav className="bg-space-dark border-b border-accent-cyan/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-display text-accent-cyan">
              EVETrade
            </Link>
          </div>

          {/* Session timer in header */}
          <div className="hidden md:block">
            <TradeSessionTimer compact={true} showHistory={false} />
          </div>

          {/* Navigation links */}
          <div className="flex items-center gap-4">
            <Link to="/station-trading" className="text-text-secondary hover:text-accent-cyan">
              Station Trading
            </Link>
            <Link to="/hauling" className="text-text-secondary hover:text-accent-cyan">
              Hauling
            </Link>
            <Link to="/dashboard" className="text-text-secondary hover:text-accent-cyan">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

---

## Table Integration

Enhance your existing trading tables with copy buttons and export:

```jsx
// src/components/tables/TradingTable.jsx

import { QuickCopyButtons } from '../common/QuickCopyButtons';
import { EnhancedExport } from '../common/EnhancedExport';

export function TradingTable({ data, columns }) {
  return (
    <div>
      {/* Table header with export */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display text-accent-cyan">
          Trading Opportunities ({data.length})
        </h3>
        <EnhancedExport
          data={data}
          defaultColumns={columns}
          filename="trading-opportunities"
          showTemplates={true}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-accent-cyan/20">
              {columns.map(col => (
                <th key={col.key} className="text-left p-3 text-text-secondary">
                  {col.label}
                </th>
              ))}
              <th className="text-center p-3 text-text-secondary">Quick Copy</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-accent-cyan/10 hover:bg-accent-cyan/5">
                {columns.map(col => (
                  <td key={col.key} className="p-3 text-text-primary">
                    {formatValue(row[col.key], col.format)}
                  </td>
                ))}
                <td className="p-3">
                  <div className="flex justify-center">
                    <QuickCopyButtons
                      itemName={row.Item}
                      price={row['Sell Price']}
                      quantity={row.Volume}
                      compact={true}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Tips for Integration

### 1. Data Structure

Ensure your data matches the expected format:

```javascript
// Example trading data structure
const tradingData = [
  {
    'Item': 'Tritanium',
    'Buy Price': 5.45,
    'Sell Price': 5.55,
    'Volume': 1000000,
    'Net Profit': 75000,
    'Gross Margin': 1.83,
    'ROI': 1.38,
  },
];
```

### 2. Callback Handlers

Use callbacks to integrate with your app state:

```javascript
const handleSessionEnd = (session) => {
  // Send to analytics
  analytics.track('trading_session_ended', session);

  // Save to database
  saveSession(session);

  // Update UI
  toast.success(`Session saved!`);
};
```

### 3. Responsive Design

Use responsive classes for mobile:

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="col-span-1 md:col-span-2">
    <BulkOrderCalculator />
  </div>
  <div className="col-span-1">
    <TradeSessionTimer />
  </div>
</div>
```

For more details, see [PRODUCTIVITY_TOOLS.md](./PRODUCTIVITY_TOOLS.md)
