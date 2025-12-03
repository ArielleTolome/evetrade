# Shared Task Notes - EVE Trade Features

## Current State
Price History Chart feature integrated into ItemDetailPage using ESI market history data.

## Latest Changes (This Iteration)

### Price History Chart on ItemDetailPage
- `src/pages/ItemDetailPage.jsx` - Added visual price history chart:
  - Uses existing `PriceHistoryChart` component from `src/components/common/PriceHistoryChart.jsx`
  - Displays last 30 days of ESI market history data
  - Shows trend direction, high/low/average prices
  - Interactive hover shows price and volume at each data point
  - Chart appears above the trading signal panel

## Previous Mobile Work (Still Valid)
- StationAutocomplete mobile modal pattern
- MobileNav, MobileCardView, MobileQuickActions components
- PWA with safe area handling

## Suggested Next Steps (Trading Features)

### High Priority
1. **Add time range selector to chart** - 7d/30d/90d toggle like `PriceHistoryCard`
2. **Volume chart overlay** - Show volume bars alongside price
3. **Price alert from chart** - Button to create alert at current price level
4. **Multi-region chart comparison** - Compare same item across regions

### Medium Priority
5. **Order book depth visualization** - `OrderBookDepth` component exists, add to ItemDetailPage
6. **Margin compression alerts** - `MarginErosionTracker` component exists
7. **Scam detection enhancements** - `useScamDetection` hook exists but partial

### Feature Opportunities
- Portfolio performance analytics
- Advanced order automation
- Supply chain analysis for industry
- Multi-account optimization

## Key Files for Trading Features
- `src/pages/ItemDetailPage.jsx` - Item analysis page (chart added here)
- `src/components/common/PriceHistoryChart.jsx` - SVG chart component
- `src/components/common/PriceCharts.jsx` - Alternative chart components
- `src/api/esi.js` - ESI API calls including `getMarketHistory()`
- `src/hooks/usePriceAlerts.js` - Price alert system

## Testing Notes
- Build succeeds
- Pre-existing test failures unrelated to chart work
