# Shared Task Notes - EVE Trade Features

## Current State
Price Alert and Undercut Detection systems are tested and working. PriceAlertPanel has 33 passing tests.

## Latest Changes (This Iteration)

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

## Suggested Next Steps (Trading Features)

### High Priority
1. **Integrate useUndercutDetection** - Add undercut warnings to station trading page
2. **Integrate ESI endpoints into UI**:
   - LP balance display in LP Optimizer page
   - Industry jobs in Industry Profits page
   - Personal contracts in Contract Finder page

### Medium Priority
3. **Add SSO scopes** for new ESI endpoints (`esi-characters.read_loyalty.v1`, etc.)
4. **Order book depth visualization** - `OrderBookDepth` component exists
5. **Margin compression alerts** - `MarginErosionTracker` component exists

### Lower Priority (Bugfixes)
6. Remove unused console.log statements (320+ found)
7. Standardize toast notification pattern across pages
8. Add aria-label accessibility to icon buttons
9. Fix unused imports and hook dependencies

## Key Files for Trading Features
- `src/components/common/PriceAlertPanel.jsx` - Price alert UI (33 tests)
- `src/components/common/PriceAlertPanel.test.jsx` - Test suite
- `src/hooks/useUndercutDetection.js` - Undercut detection (19 tests)
- `src/hooks/usePriceAlerts.js` - Price alert system with ESI integration
- `src/api/esi.js` - ESI API calls

## Testing Notes
- PriceAlertPanel: 33 tests passing
- useUndercutDetection: 19 tests passing
