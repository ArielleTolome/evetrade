# Feature Documentation Index

This document provides an index of all feature documentation in EVETrade.

## Core Trading Features

### Station Trading
Find profitable margin trades within a single station.

- **Page**: `/station-trading`
- **Component**: `StationTradingPage.jsx`
- **API**: `/api/station`

### Station Hauling
Discover profitable trades between two stations.

- **Page**: `/station-hauling`
- **Component**: `StationHaulingPage.jsx`
- **API**: `/api/hauling`

### Region Hauling
Find the best hauling routes between regions.

- **Page**: `/region-hauling`
- **Component**: `RegionHaulingPage.jsx`
- **API**: `/api/hauling`

## Advanced Analysis Features

### Arbitrage Scanner
Detect cross-region arbitrage opportunities.

- **Page**: `/arbitrage`
- **Documentation**: [ARBITRAGE_SCANNER.md](../ARBITRAGE_SCANNER.md)
- **Hook**: `useArbitrageScanner`
- **API**: `/api/arbitrage`

### Market Velocity
Track how quickly items sell in different markets.

- **Page**: `/market-velocity`
- **Hook**: `useMarketVelocity`
- **Related Docs**:
  - [useMarketVelocity.QUICKSTART.md](../src/hooks/useMarketVelocity.QUICKSTART.md)
  - [useMarketVelocity.SUMMARY.md](../src/hooks/useMarketVelocity.SUMMARY.md)

### Industry Profits
Calculate manufacturing profitability.

- **Page**: `/industry-profits`
- **Documentation**: [INDUSTRY_FEATURE.md](../INDUSTRY_FEATURE.md)
- **Hook**: `useIndustryProfits`
- **API**: `/api/industry`

### PI Optimizer
Optimize planetary interaction setups.

- **Page**: `/pi-optimizer`
- **Documentation**:
  - [PI_OPTIMIZER.md](../PI_OPTIMIZER.md)
  - [PI_OPTIMIZER_SUMMARY.md](../PI_OPTIMIZER_SUMMARY.md)
- **Hook**: `usePIOptimizer`
- **API**: `/api/pi-optimizer`

### LP Optimizer
Find the best loyalty point conversions.

- **Page**: `/lp-optimizer`
- **Hook**: `useLPOptimizer`
- **API**: `/api/lp-optimizer`

### Contract Finder
Search for profitable contracts.

- **Page**: `/contracts`
- **Documentation**: [CONTRACT_FINDER.md](../CONTRACT_FINDER.md)
- **Hook**: `useContractFinder`
- **API**: `/api/contracts`

### Corporation Orders
Manage corporation market orders.

- **Page**: `/corp-orders`
- **Documentation**:
  - [CORP_ORDERS_README.md](../CORP_ORDERS_README.md)
  - [CORP_ORDERS_ARCHITECTURE.md](../CORP_ORDERS_ARCHITECTURE.md)
  - [CORP_ORDERS_INTEGRATION.md](../CORP_ORDERS_INTEGRATION.md)
- **Hook**: `useCorpOrders`
- **API**: `/api/corp-orders`

### Route Optimizer
Plan optimal trade routes.

- **Page**: `/smart-route`
- **Documentation**:
  - [ROUTE_OPTIMIZER.md](../ROUTE_OPTIMIZER.md)
  - [ROUTE_OPTIMIZER.SUMMARY.md](../ROUTE_OPTIMIZER.SUMMARY.md)
  - [ROUTE_OPTIMIZATION_FEATURES.md](../ROUTE_OPTIMIZATION_FEATURES.md)
- **Hook**: `useRouteOptimizer`
- **API**: `/api/route-optimizer`

## Portfolio Management Features

### Watchlist
Track items you're interested in.

- **Page**: `/watchlist`
- **Documentation**: [WATCHLIST_INTEGRATION_EXAMPLE.md](../WATCHLIST_INTEGRATION_EXAMPLE.md)
- **Hook**: `useWatchlist`

### Portfolio
Manage your trading portfolio.

- **Page**: `/portfolio`
- **Hook**: `usePortfolio`

### Trade Notes
Add notes to your trades.

- **Page**: `/notes`
- **Documentation**: [TRADE_NOTES_FEATURE.md](../TRADE_NOTES_FEATURE.md)
- **Hook**: `useTradeNotes`

### Saved Routes
Save and manage your trade routes.

- **Page**: `/saved-routes`
- **Component**: `SavedRoutesPage.jsx`

## Alert & Notification Features

### Smart Alerts
Comprehensive alert management.

- **Page**: `/alerts`
- **Documentation**:
  - [SMART_ALERTS_GUIDE.md](../SMART_ALERTS_GUIDE.md)
  - [SMART_ALERTS_IMPLEMENTATION.md](../SMART_ALERTS_IMPLEMENTATION.md)
  - [SMART_ALERTS_QUICKREF.md](../SMART_ALERTS_QUICKREF.md)
- **Hook**: `useSmartAlerts`
- **Component**: `SmartAlerts.jsx`

### Price Alerts
Get notified when prices hit targets.

- **Hook**: `usePriceAlerts`
- **Component**: `PriceAlertPanel.jsx`

### Stock Alerts
Low stock level alerts.

- **Hook**: `useStockAlerts`
- **Component**: `StockAlertPanel.jsx`

## Analysis & Dashboard Features

### Trading Dashboard
Overview of your trading activity.

- **Page**: `/dashboard`
- **Documentation**:
  - [DASHBOARD_QUICK_START.md](../DASHBOARD_QUICK_START.md)
  - [DASHBOARD_LAYOUT.md](../DASHBOARD_LAYOUT.md)
  - [DASHBOARD_USE_CASES.md](../DASHBOARD_USE_CASES.md)
- **Component**: `TradingDashboardPage.jsx`

### Analytics
Trading analytics and metrics.

- **Page**: `/analytics`
- **Documentation**: [ANALYTICS_FEATURES.md](../ANALYTICS_FEATURES.md)
- **Components**: `components/analytics/`

### Long-Term Predictions
Long-term trading strategies.

- **Page**: `/predictions`
- **Documentation**: [LONG_TERM_PREDICTIONS_SUMMARY.md](../LONG_TERM_PREDICTIONS_SUMMARY.md)
- **Component**: `LongTermTradingPage.jsx`

### Momentum Analysis
Market momentum indicators.

- **Documentation**:
  - [MOMENTUM_FEATURES.md](../MOMENTUM_FEATURES.md)
  - [MOMENTUM_QUICKSTART.md](../MOMENTUM_QUICKSTART.md)
  - [MOMENTUM_ANALYTICS_SUMMARY.md](../MOMENTUM_ANALYTICS_SUMMARY.md)
- **Hook**: `useMomentum`
- **Component**: `MarketMomentum.jsx`

## Productivity Features

### Smart Filters
Advanced filtering options.

- **Documentation**: [SMARTFILTERS_SUMMARY.md](../SMARTFILTERS_SUMMARY.md)
- **Component**: `SmartFilters.jsx`

### Keyboard Shortcuts
Navigate quickly with hotkeys.

- **Documentation**: [KEYBOARD_SHORTCUTS.md](../KEYBOARD_SHORTCUTS.md)
- **Hook**: `useKeyboardShortcuts`

### Bulk Copy
Copy trade data for in-game use.

- **Documentation**:
  - [COPY_PASTE_COMPONENTS.md](../COPY_PASTE_COMPONENTS.md)
  - [COPY_COMPONENTS_SUMMARY.md](../COPY_COMPONENTS_SUMMARY.md)
  - [COPY_COMPONENTS_INTEGRATION_GUIDE.md](../COPY_COMPONENTS_INTEGRATION_GUIDE.md)
- **Components**: `BulkCopyPanel.jsx`, `OneClickCopy.jsx`
- **Hook**: `useClipboard`

### Productivity Tools
General productivity enhancements.

- **Page**: `/tools`
- **Documentation**:
  - [PRODUCTIVITY_TOOLS.md](../PRODUCTIVITY_TOOLS.md)
  - [PRODUCTIVITY_TOOLS_SUMMARY.md](../PRODUCTIVITY_TOOLS_SUMMARY.md)
  - [QUICK_START_PRODUCTIVITY.md](../QUICK_START_PRODUCTIVITY.md)

## Inventory Management Features

### Inventory Valuation
Track and value your inventory.

- **Documentation**: [INVENTORY_FEATURES.md](../INVENTORY_FEATURES.md)
- **Components**: `components/inventory/`

### Dead Stock Detection
Identify slow-moving inventory.

- **Component**: `DeadStockIdentifier.jsx`

### Restock Suggestions
Get restock recommendations.

- **Component**: `RestockSuggestions.jsx`

## Utility Features

### Trade Risk Score
Assess trade risk levels.

- **Documentation**: [TRADE_RISK_SCORE_USAGE.md](../TRADE_RISK_SCORE_USAGE.md)
- **Component**: `TradeRiskScore.jsx`

### Profit Calculator
Comprehensive profit calculations.

- **Documentation**:
  - [PROFIT_CALCULATOR.md](../PROFIT_CALCULATOR.md)
  - [PROFIT_CALCULATOR_GUIDE.md](../PROFIT_CALCULATOR_GUIDE.md)
  - [PROFIT_PER_HOUR_USAGE.md](../PROFIT_PER_HOUR_USAGE.md)
- **Components**: `ComprehensiveProfitCalculator.jsx`, `ProfitPerHourCalculator.jsx`

### Scam Detection
Detect potential contract scams.

- **Documentation**: [SCAM_DETECTION_SUMMARY.md](../SCAM_DETECTION_SUMMARY.md)
- **Hook**: `useScamDetection`
- **Component**: `ManipulationDetector.jsx`

### Undercut Detection
Monitor for order undercuts.

- **Hook**: `useUndercutDetection`
- **Documentation**:
  - [useUndercutDetection.README.md](../src/hooks/useUndercutDetection.README.md)
  - [useUndercutDetection.QUICKSTART.md](../src/hooks/useUndercutDetection.QUICKSTART.md)

### Toast Notifications
Toast notification system.

- **Documentation**: [TOAST_SYSTEM_IMPLEMENTATION.md](../TOAST_SYSTEM_IMPLEMENTATION.md)
- **Components**: `Toast.jsx`, `ToastProvider.jsx`

## Multi-Character Support

### Multi-Character Management
Manage multiple EVE characters.

- **Page**: `/characters`
- **Hook**: `useMultiCharacter`
- **Component**: `MultiCharacterPage.jsx`

## Integration Guides

- [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) - General integration guide
- [PRODUCTIVITY_TOOLS_INTEGRATION.md](../PRODUCTIVITY_TOOLS_INTEGRATION.md) - Productivity tools integration
- [COPY_COMPONENTS_INTEGRATION_GUIDE.md](../COPY_COMPONENTS_INTEGRATION_GUIDE.md) - Copy components integration

## Component Documentation

Additional component-level documentation can be found alongside component files:

- `ComponentName.md` - Main documentation
- `ComponentName.QUICKSTART.md` - Quick start guide
- `ComponentName.example.jsx` - Usage examples
- `ComponentName.test.jsx` - Test files
