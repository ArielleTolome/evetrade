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
 *
 * STEP 1: Import the component and hook
 * --------------------------------------
 * import { AffordabilityBadge, AffordabilityIndicator } from '../components/common/AffordabilityBadge';
 * import { useWalletValidator } from '../hooks/useWalletValidator';
 *
 * STEP 2: Add state for affordability filter (OPTIONAL)
 * -----------------------------------------------------
 * const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);
 *
 * STEP 3: Filter trades based on affordability (OPTIONAL)
 * -------------------------------------------------------
 * Add this to your filteredData useMemo hook:
 *
 * const filteredData = useMemo(() => {
 *   let filtered = data;
 *   // ... existing filters ...
 *   if (showOnlyAffordable && walletBalance !== null) {
 *     filtered = filtered.filter((item) => {
 *       const buyPrice = item['Buy Price'] || 0;
 *       return walletBalance >= buyPrice;
 *     });
 *   }
 *   return filtered;
 * }, [data, showOnlyAffordable, walletBalance]);
 *
 * STEP 4: Add AffordabilityBadge to table columns
 * -----------------------------------------------
 * Example: Add to the Buy Price column
 *
 * {
 *   key: 'Buy Price',
 *   label: 'Buy Price',
 *   type: 'num',
 *   render: (data, row) => (
 *     <div className="flex flex-col gap-1">
 *       <span>{formatISK(data, false)}</span>
 *       <AffordabilityBadge
 *         cost={data}
 *         walletBalance={walletBalance}
 *         compact={true}
 *       />
 *     </div>
 *   ),
 * }
 *
 * STEP 5: Dim unaffordable rows (OPTIONAL)
 * ----------------------------------------
 * const { getAffordabilityStatus } = useWalletValidator();
 *
 * const getRowClassName = (row) => {
 *   if (!walletBalance) return '';
 *   const status = getAffordabilityStatus(row['Buy Price'], walletBalance);
 *   if (status.status === 'insufficient') {
 *     return 'opacity-50 hover:opacity-75 transition-opacity';
 *   }
 *   return '';
 * };
 *
 * NOTES
 * -----
 * 1. The AffordabilityBadge requires walletBalance to be passed as a prop.
 * 2. The badge automatically handles all states:
 *    - Not authenticated: Shows "Login to check"
 *    - Loading: Shows spinner
 *    - Can afford: Green badge
 *    - Cannot afford: Red badge with shortfall amount
 * 3. Use AffordabilityBadge for visible labels, AffordabilityIndicator
 *    for just a colored dot (more compact).
 * 4. Remember to add walletBalance to dependency arrays of useMemo/useCallback.
 */

// This file is documentation only - no exports
export default null;
