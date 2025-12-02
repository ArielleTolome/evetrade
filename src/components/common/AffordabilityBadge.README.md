# AffordabilityBadge Component

Visual component that shows whether a user can afford a trade based on their wallet balance.

## Features

- **Visual Indicators**: Color-coded badges showing affordability status
- **Authentication Aware**: Different states for logged-in vs logged-out users
- **Compact Mode**: Two variants for different layout needs
- **Automatic Shortfall Calculation**: Shows exactly how much ISK is needed
- **Loading States**: Handles wallet data loading gracefully

## Components

### AffordabilityBadge

Full badge with icon and text message.

```jsx
import { AffordabilityBadge } from '../components/common/AffordabilityBadge';

<AffordabilityBadge
  cost={1500000}
  walletBalance={walletBalance}
  compact={true}
/>
```

**Props:**
- `cost` (number, required): ISK amount required for the trade
- `walletBalance` (number|null, required): Current wallet balance
- `compact` (boolean, optional): Use compact styling (default: false)
- `className` (string, optional): Additional CSS classes

### AffordabilityIndicator

Minimal colored dot indicator for very compact layouts.

```jsx
import { AffordabilityIndicator } from '../components/common/AffordabilityBadge';

<AffordabilityIndicator
  cost={1500000}
  walletBalance={walletBalance}
/>
```

**Props:**
- `cost` (number, required): ISK amount required for the trade
- `walletBalance` (number|null, required): Current wallet balance
- `className` (string, optional): Additional CSS classes

## Badge States

### 1. Can Afford (Green)
- **When**: `walletBalance >= cost`
- **Color**: Green (`bg-green-500/20`, `text-green-400`)
- **Icon**: Checkmark
- **Message**: "Can afford"

### 2. Cannot Afford (Red)
- **When**: `walletBalance < cost`
- **Color**: Red (`bg-red-500/20`, `text-red-400`)
- **Icon**: Alert circle
- **Message**: "Need X ISK" (shows formatted shortfall)

### 3. Not Authenticated (Gray)
- **When**: User is not logged in
- **Color**: Gray (`bg-gray-500/20`, `text-gray-400`)
- **Icon**: User icon
- **Message**: "Login to check"

### 4. Loading (Gray, Animated)
- **When**: `walletBalance === null` (but authenticated)
- **Color**: Gray (`bg-gray-500/20`, `text-gray-400`)
- **Icon**: Spinning loader
- **Message**: "Loading..."

## Hook: useWalletValidator

The underlying hook that powers the badge. Can be used independently.

```jsx
import { useWalletValidator } from '../../hooks/useWalletValidator';

const { canAfford, formatShortfall, getAffordabilityStatus } = useWalletValidator();

// Check if user can afford
if (canAfford(1000000, walletBalance)) {
  console.log('User can afford this trade');
}

// Get shortfall message
const message = formatShortfall(1000000, walletBalance);
// "Need 500K ISK"

// Get detailed status
const status = getAffordabilityStatus(1000000, walletBalance);
// {
//   canAfford: false,
//   status: 'insufficient',
//   message: 'Need 500K ISK',
//   shortfall: 500000
// }
```

**Methods:**
- `canAfford(amount, walletBalance)`: Returns boolean
- `formatShortfall(amount, walletBalance)`: Returns formatted string
- `getAffordabilityStatus(amount, walletBalance)`: Returns status object

## Integration Examples

### Example 1: Add to Buy Price Column

```jsx
const tableColumns = useMemo(
  () => [
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
  ],
  [walletBalance]
);
```

### Example 2: Add as Indicator in Item Column

```jsx
const tableColumns = useMemo(
  () => [
    {
      key: 'Item',
      label: 'Item',
      render: (itemName, row) => (
        <div className="flex items-center gap-2">
          <AffordabilityIndicator
            cost={row['Buy Price']}
            walletBalance={walletBalance}
          />
          <span>{itemName}</span>
        </div>
      ),
    },
  ],
  [walletBalance]
);
```

### Example 3: Filter for Affordable Trades Only

```jsx
const [showOnlyAffordable, setShowOnlyAffordable] = useState(false);

const filteredData = useMemo(() => {
  let filtered = data;

  if (showOnlyAffordable && walletBalance !== null) {
    filtered = filtered.filter((item) => {
      const buyPrice = item['Buy Price'] || 0;
      return walletBalance >= buyPrice;
    });
  }

  return filtered;
}, [data, showOnlyAffordable, walletBalance]);

// Filter toggle button
<button
  onClick={() => setShowOnlyAffordable(!showOnlyAffordable)}
  disabled={!walletBalance}
>
  {showOnlyAffordable ? 'All Trades' : 'Affordable Only'}
</button>
```

### Example 4: Dim Unaffordable Rows

```jsx
const { getAffordabilityStatus } = useWalletValidator();

const getRowClassName = (row) => {
  if (!walletBalance) return '';

  const status = getAffordabilityStatus(row['Buy Price'], walletBalance);
  if (status.status === 'insufficient') {
    return 'opacity-50 hover:opacity-75 transition-opacity';
  }
  return '';
};

<TradingTable
  data={trades}
  columns={tableColumns}
  rowClassName={getRowClassName}
/>
```

## Integration Checklist

When integrating into a trading page:

- [ ] Import `AffordabilityBadge` or `AffordabilityIndicator`
- [ ] Ensure `walletBalance` is available (already loaded in StationTradingPage)
- [ ] Add badge to table column(s)
- [ ] Add `walletBalance` to dependency arrays
- [ ] (Optional) Add "Affordable Only" filter toggle
- [ ] (Optional) Add keyboard shortcut for filter
- [ ] (Optional) Dim unaffordable rows

## Files

- **Hook**: `/src/hooks/useWalletValidator.jsx`
- **Component**: `/src/components/common/AffordabilityBadge.jsx`
- **Integration Guide**: `/src/components/common/AffordabilityBadge.integration.jsx`
- **This README**: `/src/components/common/AffordabilityBadge.README.md`

## Design Decisions

### Why Pass walletBalance as Prop?

Instead of fetching wallet balance inside the hook, we pass it as a prop because:

1. **Separation of Concerns**: Data fetching is already handled in the page component
2. **Performance**: Avoids duplicate ESI API calls
3. **Flexibility**: Component can work with any balance source
4. **Testability**: Easier to test with mock data

### Why Two Components?

- **AffordabilityBadge**: Full featured, good for columns with space
- **AffordabilityIndicator**: Minimal footprint, good for inline with item names

Choose based on available space and desired information density.

### Compact Mode

The `compact` prop reduces padding and font size for tighter layouts. Use in:
- Dense tables with many columns
- Inline with other badges
- Mobile-optimized views

## Testing

```jsx
// Test authenticated, can afford
<AffordabilityBadge cost={1000000} walletBalance={5000000} />
// Shows green "Can afford"

// Test authenticated, cannot afford
<AffordabilityBadge cost={5000000} walletBalance={1000000} />
// Shows red "Need 4.00M ISK"

// Test not authenticated
<AffordabilityBadge cost={1000000} walletBalance={null} />
// Shows gray "Login to check"

// Test compact mode
<AffordabilityBadge cost={1000000} walletBalance={5000000} compact={true} />
// Shows smaller green badge with icon only (no text in compact mode)
```

## Browser Compatibility

Works in all modern browsers. Uses:
- Flexbox (widely supported)
- SVG icons (widely supported)
- CSS animations (widely supported)

## Performance Notes

- Components are lightweight and memoized
- No network requests (uses existing wallet data)
- Hook calculations are O(1) complexity
- SVG icons are inline (no image requests)

## Accessibility

- Color is not the only indicator (icons + text)
- Tooltips provide additional context
- Works with screen readers (semantic HTML)
- Keyboard navigation supported

## Future Enhancements

Potential additions (not implemented):

1. **Multiple Quantities**: Show affordability for buying X units
2. **Collateral Calculation**: For hauling trades, include collateral
3. **Budget Recommendations**: Suggest how many units user can afford
4. **Warning Threshold**: Yellow warning when close to wallet limit
5. **Transaction Fees**: Factor in broker fees and sales tax

## Support

For questions or issues, see:
- Integration guide: `AffordabilityBadge.integration.jsx`
- Main project docs: `CLAUDE.md`
- Component examples in file
