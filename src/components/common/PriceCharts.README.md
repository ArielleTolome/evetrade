# Price Chart Components

Two complementary components for visualizing price trends in the EVETrade application.

## Components

### PriceSparkline

A lightweight, inline sparkline chart for displaying price trends in tables and compact spaces.

**Features:**
- SVG-based rendering (no external dependencies)
- Mini size (default 80x24px) perfect for table cells
- Color-coded trends (green for up, red for down)
- Hover tooltips with current price and percentage change
- Simulated 7-day price history
- Customizable size and data points

**Usage:**
```jsx
import PriceSparkline from './components/common/PriceSparkline';

<PriceSparkline
  price={1234567}
  width={80}
  height={24}
  points={7}
  showTooltip={true}
/>
```

**Props:**
- `price` (number, required): Current price value
- `width` (number, default: 80): Width in pixels
- `height` (number, default: 24): Height in pixels
- `points` (number, default: 7): Number of data points to display
- `showTooltip` (boolean, default: true): Show tooltip on hover
- `className` (string): Additional CSS classes

### PriceHistoryChart

A detailed, interactive chart for comprehensive price history analysis.

**Features:**
- Full-featured price chart with hover interactions
- Y-axis labels and grid lines
- Area fill with gradient
- Hover state showing exact values and timestamps
- Statistical summary (high, low, average)
- Simulated 30-day price history with volume data
- Responsive design in GlassmorphicCard

**Usage:**
```jsx
import PriceHistoryChart from './components/common/PriceHistoryChart';

<PriceHistoryChart
  price={3250000}
  width={800}
  height={400}
  days={30}
  title="PLEX Price History"
/>
```

**Props:**
- `price` (number, required): Current price value
- `width` (number, default: 600): Chart width in pixels
- `height` (number, default: 300): Chart height in pixels
- `days` (number, default: 30): Number of days of history
- `title` (string, default: "Price History"): Chart title
- `className` (string): Additional CSS classes

## Implementation Notes

### Mock Data Generation

Both components currently use simulated price history data. In production, these should be connected to your historical price API:

```jsx
// Example API integration
const [priceHistory, setPriceHistory] = useState([]);

useEffect(() => {
  fetchPriceHistory(itemId, days)
    .then(data => setPriceHistory(data));
}, [itemId, days]);
```

### Color Scheme

Both components use the EVETrade color palette:
- **Green (#4ade80)**: Upward trend
- **Red (#f87171)**: Downward trend
- **Cyan accents**: Labels and borders
- **Space theme**: Dark backgrounds with glassmorphic effects

### Performance Considerations

- **PriceSparkline**: Memoized calculations prevent unnecessary re-renders
- **PriceHistoryChart**: SVG rendering is efficient for the data size
- Both components use `useMemo` to cache computed paths and statistics

### Accessibility

- SVG elements include semantic structure
- Hover states provide additional context
- Color is not the only indicator (arrows and percentages supplement)

## Integration Examples

### In Trading Tables

```jsx
// TradingTable.jsx
{
  data: 'sell_price',
  title: 'Price Trend',
  render: (data, type, row) => {
    return `<div id="sparkline-${row.type_id}"></div>`;
  },
  createdCell: (td, cellData, rowData) => {
    ReactDOM.createRoot(td.querySelector('div')).render(
      <PriceSparkline price={rowData.sell_price} />
    );
  }
}
```

### In Item Detail Pages

```jsx
// OrdersPage.jsx
function OrdersPage() {
  const { itemId } = useParams();

  return (
    <PageLayout>
      <PriceHistoryChart
        price={currentPrice}
        width={800}
        height={400}
        days={30}
        title={`${itemName} Price History`}
      />
    </PageLayout>
  );
}
```

### Side-by-Side Comparison

```jsx
<div className="grid grid-cols-2 gap-4">
  <PriceHistoryChart
    price={buyPrice}
    title="Buy Orders"
  />
  <PriceHistoryChart
    price={sellPrice}
    title="Sell Orders"
  />
</div>
```

## Future Enhancements

Potential improvements for production:

1. **Real API Integration**: Connect to actual historical price endpoints
2. **Time Period Selection**: Allow users to select 7d, 30d, 90d, 1y views
3. **Technical Indicators**: Add moving averages, RSI, MACD
4. **Volume Overlay**: Show trading volume as bars below price chart
5. **Export Functionality**: Allow users to download chart as PNG/SVG
6. **Comparison Mode**: Overlay multiple items for price comparison
7. **Real-time Updates**: WebSocket integration for live price updates
8. **Mobile Optimization**: Touch-friendly interactions and responsive sizing

## Testing

Example test file structure:

```jsx
// PriceSparkline.test.jsx
describe('PriceSparkline', () => {
  it('renders sparkline with correct trend', () => {
    render(<PriceSparkline price={1000} />);
    // Assert SVG elements exist
    // Check trend indicator color
  });

  it('shows tooltip on hover', () => {
    render(<PriceSparkline price={1000} showTooltip={true} />);
    // Simulate hover
    // Assert tooltip is visible
  });
});
```

## Related Files

- `/src/utils/formatters.js` - Price and number formatting utilities
- `/src/components/common/GlassmorphicCard.jsx` - Container component
- `/src/components/common/PriceSparkline.example.jsx` - Usage examples

## Contributing

When modifying these components:

1. Maintain consistent color scheme with EVETrade design system
2. Ensure accessibility (keyboard navigation, screen readers)
3. Test with various price ranges (small, medium, large ISK values)
4. Update this README with new features or breaking changes
5. Add unit tests for new functionality
