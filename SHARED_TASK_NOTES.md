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

## Next Iteration Tasks

### High Priority
- [ ] Add aria-label accessibility attributes to icon buttons (identified in initial analysis)
- [ ] Integrate the new ESI endpoints into the UI:
  - LP balance display in LP Optimizer page
  - Industry jobs in Industry Profits page
  - Personal contracts in Contract Finder page
  - Structure market support in trading pages

### Medium Priority
- [ ] Add SSO scope request for new endpoints (`esi-characters.read_loyalty.v1`, `esi-industry.read_character_jobs.v1`, etc.)
- [ ] Add missing useCallback dependencies in various components
- [ ] Remove unused console.log statements (320+ found in codebase)

### Lower Priority
- [ ] Standardize toast notification pattern across all pages (some use hook, some use state)
- [ ] Add pagination UI warning when results are truncated
- [ ] Fix unused variable lint warnings

## Architecture Notes

- New ESI endpoints need SSO scopes added in `useEveAuth.jsx`
- RealTimeProfitDashboard can be added to Dashboard page or used standalone
- useCharacterLP hook follows same pattern as useLPOptimizer

## Files Changed
- `src/pages/StationHaulingPage.jsx`
- `src/pages/RegionHaulingPage.jsx`
- `src/pages/ArbitragePage.jsx`
- `src/api/esi.js`
- `src/hooks/useCharacterLP.js` (new)
- `src/components/dashboard/RealTimeProfitDashboard.jsx` (new)
- `src/components/dashboard/index.js`
