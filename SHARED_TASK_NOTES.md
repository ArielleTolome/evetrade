# EVETrade - Continuous Development Notes

## Completed This Iteration

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
- [ ] Add aria-label accessibility attributes to icon buttons (identified in initial analysis)
- [ ] Integrate useUndercutDetection - Add undercut warnings to station trading page
- [ ] Integrate the new ESI endpoints into the UI:
  - LP balance display in LP Optimizer page
  - Industry jobs in Industry Profits page
  - Personal contracts in Contract Finder page
  - Structure market support in trading pages

### Medium Priority
- [ ] Add SSO scope request for new endpoints (`esi-characters.read_loyalty.v1`, `esi-industry.read_character_jobs.v1`, etc.)
- [ ] Add missing useCallback dependencies in various components
- [ ] Remove unused console.log statements (320+ found in codebase)
- [ ] Order book depth visualization - `OrderBookDepth` component exists
- [ ] Margin compression alerts - `MarginErosionTracker` component exists

### Lower Priority
- [ ] Standardize toast notification pattern across all pages (some use hook, some use state)
- [ ] Add pagination UI warning when results are truncated
- [ ] Fix unused variable lint warnings
- [ ] Add aria-label accessibility to icon buttons
- [ ] Fix unused imports and hook dependencies

## Architecture Notes

- New ESI endpoints need SSO scopes added in `useEveAuth.jsx`
- RealTimeProfitDashboard can be added to Dashboard page or used standalone
- useCharacterLP hook follows same pattern as useLPOptimizer

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
