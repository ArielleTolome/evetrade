/**
 * AFFORDABILITY BADGE INTEGRATION GUIDE
 * ======================================
 *
 * This file demonstrates how to integrate the AffordabilityBadge component
 * into the trading pages (StationTradingPage, StationHaulingPage, RegionHaulingPage).
 *
 * The integration involves:
 * 1. Adding the badge to table rows
 * 2. Optional: Adding a filter toggle for "Show only affordable trades"
 * 3. Optional: Dimming rows the user can't afford
 */

// ============================================================================
// STEP 1: Import the component and hook
// ============================================================================

import { AffordabilityBadge, AffordabilityIndicator } from '../components/common/AffordabilityBadge';
import { useWalletValidator } from '../hooks/useWalletValidator';

// ============================================================================
// STEP 2: Add state for affordability filter (OPTIONAL)
// ============================================================================

// Add this to your page component state:
const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);

// ============================================================================
// STEP 3: Filter trades based on affordability (OPTIONAL)
// ============================================================================

// Add this to your filteredData useMemo hook:
const filteredData = useMemo(() => {
  let filtered = data;

  // ... existing filters ...

  // Apply affordability filter
  if (showOnlyAffordable && walletBalance !== null) {
    filtered = filtered.filter((item) => {
      const buyPrice = item['Buy Price'] || 0;
      return walletBalance >= buyPrice;
    });
  }

  return filtered;
}, [data, showOnlyAffordable, walletBalance, /* other deps */]);

// ============================================================================
// STEP 4: Add AffordabilityBadge to table columns
// ============================================================================

// Example 1: Add as a separate column
const tableColumns = useMemo(
  () => [
    // ... existing columns ...
    {
      key: 'Buy Price',
      label: 'Buy Price',
      type: 'num',
      render: (data, row) => (
        <div className="flex flex-col gap-1">
          <span>{formatISK(data, false)}</span>
          <AffordabilityBadge
            cost={data}
            walletBalance={walletBalance}
            compact={true}
          />
        </div>
      ),
    },
    // ... remaining columns ...
  ],
  [walletBalance, /* other deps */]
);

// Example 2: Add to the Item column for inline display
const tableColumns = useMemo(
  () => [
    {
      key: 'Item',
      label: 'Item',
      className: 'font-medium',
      render: (itemName, row) => (
        <div className="flex items-center gap-2">
          <TradeOpportunityBadge trade={row} />
          <ItemTierBadge itemName={itemName} compact={true} />
          <AffordabilityIndicator
            cost={row['Buy Price']}
            walletBalance={walletBalance}
          />
          <span>{itemName}</span>
        </div>
      ),
    },
    // ... other columns ...
  ],
  [walletBalance, /* other deps */]
);

// Example 3: Add to the Actions column
const tableColumns = useMemo(
  () => [
    // ... existing columns ...
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-32',
      render: (data, row) => (
        <div className="flex gap-1">
          <AffordabilityBadge
            cost={row['Buy Price']}
            walletBalance={walletBalance}
            compact={true}
          />
          {/* ... existing action buttons ... */}
        </div>
      ),
    },
  ],
  [walletBalance, /* other deps */]
);

// ============================================================================
// STEP 5: Add filter toggle button (OPTIONAL)
// ============================================================================

// Add this button to the action bar (around line 1407 in StationTradingPage):
<button
  onClick={() => setShowOnlyAffordable(!showOnlyAffordable)}
  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
    showOnlyAffordable
      ? 'bg-green-500/20 border-green-500/50 text-green-400'
      : 'bg-white/5 border-accent-cyan/20 text-text-secondary hover:bg-white/10'
  }`}
  title="Toggle affordable trades filter"
  disabled={!walletBalance}
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
  <span className="text-sm">
    {showOnlyAffordable ? 'All Trades' : 'Affordable Only'}
  </span>
</button>

// ============================================================================
// STEP 6: Dim unaffordable rows (OPTIONAL)
// ============================================================================

// Add this helper function:
const { getAffordabilityStatus } = useWalletValidator();

const getRowClassName = (row) => {
  if (!walletBalance) return '';

  const status = getAffordabilityStatus(row['Buy Price'], walletBalance);
  if (status.status === 'insufficient') {
    return 'opacity-50 hover:opacity-75 transition-opacity';
  }
  return '';
};

// Then pass it to TradingTable:
<TradingTable
  data={trades}
  columns={tableColumns}
  onRowClick={handleRowClick}
  rowClassName={getRowClassName}
  // ... other props ...
/>

// ============================================================================
// STEP 7: Add keyboard shortcut (OPTIONAL)
// ============================================================================

// Add to your keyboardHandlers object:
const keyboardHandlers = useMemo(() => ({
  // ... existing handlers ...

  // Toggle affordable trades filter ($ key)
  '$': () => {
    if (walletBalance !== null) {
      setShowOnlyAffordable(prev => !prev);
      setToastMessage(`Affordable filter ${!showOnlyAffordable ? 'enabled' : 'disabled'}`);
    }
  },
}), [walletBalance, showOnlyAffordable, setToastMessage]);

// And add to custom shortcuts:
const customShortcuts = useMemo(() => [
  {
    category: 'Station Trading - Filtering',
    items: [
      // ... existing shortcuts ...
      { keys: ['$'], description: 'Toggle affordable trades only' },
    ],
  },
], []);

// ============================================================================
// COMPLETE EXAMPLE: Integrating into StationTradingPage.jsx
// ============================================================================

/*
// 1. Add import at the top (around line 11):
import { AffordabilityBadge, AffordabilityIndicator } from '../components/common/AffordabilityBadge';

// 2. Add state for filter (around line 143):
const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);

// 3. Update filteredData useMemo (around line 440):
const filteredData = useMemo(() => {
  if (!data || !Array.isArray(data)) {
    return data;
  }

  let filtered = data;

  // ... existing filters ...

  // Apply affordability filter
  if (showOnlyAffordable && walletBalance !== null) {
    filtered = filtered.filter((item) => {
      const buyPrice = item['Buy Price'] || 0;
      return walletBalance >= buyPrice;
    });
  }

  return filtered;
}, [data, categoryFilter, invTypes, smartFilters, showFavoritesOnly, favorites, highQualityOnly, calculateScamRisk, isLikelyScam, showOnlyAffordable, walletBalance]);

// 4. Update table columns to include the badge (around line 813):
{
  key: 'Buy Price',
  label: 'Buy Price',
  type: 'num',
  render: (data, row) => (
    <div className="flex flex-col">
      <span>{formatISK(data, false)}</span>
      <div className="flex items-center gap-1 mt-1">
        <PriceSparkline price={data} width={60} height={16} />
        <AffordabilityBadge
          cost={data}
          walletBalance={walletBalance}
          compact={true}
        />
      </div>
    </div>
  ),
},

// 5. Add filter button (around line 1449, after High Quality button):
{walletBalance !== null && (
  <button
    onClick={() => setShowOnlyAffordable(!showOnlyAffordable)}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
      showOnlyAffordable
        ? 'bg-green-500/20 border-green-500/50 text-green-400'
        : 'bg-white/5 border-accent-cyan/20 text-text-secondary hover:bg-white/10'
    }`}
    title="Toggle affordable trades filter ($)"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <span className="text-sm">
      {showOnlyAffordable ? 'All Trades' : 'Affordable Only'}
    </span>
    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-mono bg-space-dark/80 border border-accent-cyan/30 rounded">$</kbd>
  </button>
)}

// 6. Add keyboard shortcut (around line 674):
'$': () => {
  if (walletBalance !== null) {
    setShowOnlyAffordable(prev => !prev);
    setToastMessage(`Affordable filter ${!showOnlyAffordable ? 'enabled' : 'disabled'}`);
  }
},

// 7. Add to custom shortcuts list (around line 697):
{
  category: 'Station Trading - Filtering',
  items: [
    { keys: ['f'], description: 'Toggle favorites filter' },
    { keys: ['w'], description: 'Toggle watchlist panel' },
    { keys: ['h'], description: 'Toggle high quality filter' },
    { keys: ['b'], description: 'Toggle dashboard view' },
    { keys: ['$'], description: 'Toggle affordable trades only' },
    { keys: ['1-5'], description: 'Apply quick filter preset' },
  ],
},
*/

// ============================================================================
// NOTES AND BEST PRACTICES
// ============================================================================

/**
 * 1. The AffordabilityBadge requires walletBalance to be passed as a prop.
 *    This is already loaded in StationTradingPage via getWalletBalance().
 *
 * 2. The badge automatically handles all states:
 *    - Not authenticated: Shows "Login to check"
 *    - Loading: Shows spinner
 *    - Can afford: Green badge
 *    - Cannot afford: Red badge with shortfall amount
 *
 * 3. Use AffordabilityBadge for visible labels, AffordabilityIndicator
 *    for just a colored dot (more compact).
 *
 * 4. The filter is OPTIONAL - the badge alone provides valuable information
 *    without filtering the results.
 *
 * 5. Remember to add walletBalance to dependency arrays of useMemo/useCallback.
 *
 * 6. For Station Hauling and Region Hauling pages, use the total cost
 *    (buy price + collateral) instead of just the buy price.
 */

export default null;
