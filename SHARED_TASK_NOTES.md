# EVETrade - Continuous Development Notes

## Latest Iteration: Trading Tools & Offline Support

### What Was Done This Iteration

10 features/fixes were implemented:

1. **QuickDecisionCard Watchlist Integration** - Fixed TODO in `src/components/common/QuickDecisionCard.jsx`. Now properly integrates with `useWatchlist` hook to add/remove items from watchlist.

2. **Numeric Precision Utilities** - Added `preciseRound`, `preciseSubtract`, `preciseMultiply` functions in `src/utils/profitCalculations.js` for safer financial calculations.

3. **ESI Market Analysis Bounds Checking** - Enhanced `analyzeMarketOrders` in `src/api/esi.js` to handle empty arrays and null inputs safely.

4. **Data Freshness Indicator Enhancements** - Added `StaleDataWarning` component and `useDataFreshness` hook in `src/components/common/DataFreshnessIndicator.jsx`.

5. **Margin Trading Simulator** - New component `src/components/trading/MarginTradingSimulator.jsx` that simulates margin trading execution over 7 days with competition modeling.

6. **Price Alert Discord Integration** - Enhanced `PriceAlertPanel.jsx` to show Discord webhook status when configured.

7. **Station Affinity Scoring** - New component `src/components/trading/StationAffinityScore.jsx` that evaluates stations based on liquidity, variety, spread, and competition.

8. **Market Manipulation Discord Alerts** - Enhanced `ManipulationDetector.jsx` to send Discord alerts when high-risk manipulation patterns are detected.

9. **Offline Mode** - New hook `src/hooks/useOfflineMode.js` and component `src/components/common/OfflineIndicator.jsx` for offline capability.

10. **Data Freshness Warnings** - Added stale data warning banner with automatic refresh prompts.

### New Files Created

- `src/components/trading/MarginTradingSimulator.jsx`
- `src/components/trading/StationAffinityScore.jsx`
- `src/hooks/useOfflineMode.js`
- `src/components/common/OfflineIndicator.jsx`

### Files Modified

- `src/components/common/QuickDecisionCard.jsx` - Watchlist integration
- `src/utils/profitCalculations.js` - Precision utilities
- `src/api/esi.js` - Array bounds checking
- `src/components/common/DataFreshnessIndicator.jsx` - Stale warning banner
- `src/components/common/PriceAlertPanel.jsx` - Discord status display
- `src/components/trading/ManipulationDetector.jsx` - Discord alerts

## Previous Iteration: ESI Endpoints & Dashboard

### Completed

1. **Fixed Critical Toast Bugs** - StationHaulingPage, RegionHaulingPage, ArbitragePage were rendering `<Toast>` component without importing it. Migrated to using `useToast()` hook properly.

2. **Added Form Input Validation** - Added `min`, `max`, and `step` constraints to numeric form fields (minProfit, maxWeight, minROI, maxBudget) in hauling and arbitrage pages.

3. **Added ESI API Endpoints** - New endpoints in `src/api/esi.js`:
   - `getCharacterLoyaltyPoints` - LP balance by NPC corp
   - `getCharacterIndustryJobs` - Manufacturing jobs
   - `getCharacterContracts` - Personal contracts
   - `getCharacterContractItems` - Contract item details
   - `getStructureMarketOrders` - Citadel market orders
   - `getCharacterBookmarks` - Bookmarks
   - `getCharacterBookmarkFolders` - Bookmark folders
   - `getCharacterBlueprints` - Blueprint library

4. **Created useCharacterLP Hook** - `src/hooks/useCharacterLP.js` for LP balance management

5. **Created RealTimeProfitDashboard** - `src/components/dashboard/RealTimeProfitDashboard.jsx` shows wallet, active orders, escrow, daily/weekly profit with sparklines

6. **Fixed Silent Asset Loading Failures** - Added `assetsError` state and toast notifications when asset loading fails

## Price Alert and Undercut Detection

### PriceAlertPanel Tests Added
- Created `src/components/common/PriceAlertPanel.test.jsx` with 33 tests covering:
  - Empty state and alert list rendering
  - Alert creation form validation
  - Settings panel (notifications, sound)
  - CRUD operations (create, delete, reset, clear all)
  - Alert type display formatting

### PriceAlertPanel Accessibility Fix
- Added `id` props to FormInput components in `PriceAlertPanel.jsx` for proper label/input association

### useUndercutDetection Hook Verified
- All 19 tests passing. Hook implements:
  - Undercut detection for sell orders
  - Outbid detection for buy orders
  - Recommended price calculation
  - Pricing strategies (aggressive, moderate, conservative)

## Next Iteration Tasks

### High Priority
- [ ] Integrate new components into actual pages (they're created but not wired up)
- [ ] Add aria-label accessibility attributes to icon buttons
- [ ] Integrate useUndercutDetection - Add undercut warnings to station trading page
- [ ] Integrate the new ESI endpoints into the UI:
  - LP balance display in LP Optimizer page
  - Industry jobs in Industry Profits page
  - Personal contracts in Contract Finder page
  - Structure market support in trading pages

### Medium Priority
- [ ] Add SSO scope request for new endpoints (`esi-characters.read_loyalty.v1`, `esi-industry.read_character_jobs.v1`, etc.)
- [ ] Add keyboard shortcuts for power users (quick navigation, actions)
- [ ] Implement real-time price updates using ESI websocket/polling
- [ ] Add order book visualization component
- [ ] Create trade journal/history export functionality
- [ ] Add missing useCallback dependencies in various components
- [ ] Order book depth visualization - `OrderBookDepth` component exists
- [ ] Margin compression alerts - `MarginErosionTracker` component exists

### Lower Priority
- [ ] Review and remove excessive console.log statements (284+ found in codebase)
- [ ] Add tests for new components
- [ ] Consider moving station.js pagination limit from 150 to handle larger regions better
- [ ] Standardize toast notification pattern across all pages
- [ ] Fix unused variable lint warnings
- [ ] Fix unused imports and hook dependencies

## Architecture Notes

- New ESI endpoints need SSO scopes added in `useEveAuth.jsx`
- RealTimeProfitDashboard can be added to Dashboard page or used standalone
- useCharacterLP hook follows same pattern as useLPOptimizer
- The new components follow existing patterns:
  - Use `GlassmorphicCard` for container styling
  - Use existing formatters from `src/utils/formatters.js`
  - Hooks use localStorage for persistence
  - Discord integration via `useDiscordWebhook` hook

## Known Issues
- Station API caps at 150 pages which may miss items in high-volume regions like The Forge
- Some console.logs should be converted to Sentry in production

## Key Files for Trading Features
- `src/components/common/PriceAlertPanel.jsx` - Price alert UI (33 tests)
- `src/components/common/PriceAlertPanel.test.jsx` - Test suite
- `src/hooks/useUndercutDetection.js` - Undercut detection (19 tests)
- `src/hooks/usePriceAlerts.js` - Price alert system with ESI integration
- `src/api/esi.js` - ESI API calls

## Files Changed
- `src/pages/StationHaulingPage.jsx`
- `src/pages/RegionHaulingPage.jsx`
- `src/pages/ArbitragePage.jsx`
- `src/api/esi.js`
- `src/hooks/useCharacterLP.js` (new)
- `src/components/dashboard/RealTimeProfitDashboard.jsx` (new)
- `src/components/dashboard/index.js`

## Testing Notes
- PriceAlertPanel: 33 tests passing
- useUndercutDetection: 19 tests passing

Build verified working with `npm run build`.
