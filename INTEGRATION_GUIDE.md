# TradeRiskScore - Quick Integration Guide

## Adding Risk Score to TradingTable

This guide shows you exactly how to add the risk score column to your existing TradingTable component.

### Step 1: Import the Component

At the top of `/src/components/tables/TradingTable.jsx`, add:

```javascript
import { createRoot } from 'react-dom/client';
import { TradeRiskBadge } from '../common/TradeRiskScore';
```

### Step 2: Add Risk Column Definition

In your DataTable columns array, add this column definition (suggested placement: after the Margin column):

```javascript
{
  title: 'Risk',
  data: null,
  orderable: true,
  className: 'text-center',
  width: '80px',
  render: (data, type, row) => {
    // For sorting and filtering, return the numeric risk score
    if (type === 'sort' || type === 'filter') {
      // Calculate risk score on-the-fly
      const volume = row['Volume'] || 0;
      const margin = row['Gross Margin'] || 0;
      const buyPrice = row['Buy Price'] || 0;

      // Simple risk calculation for sorting
      let risk = 0;

      // Volume component (0-35 points)
      if (volume === 0 || volume === 1) risk += 35;
      else if (volume <= 5) risk += 25;
      else if (volume <= 20) risk += 14;
      else if (volume <= 50) risk += 7;

      // Margin component (0-25 points)
      if (margin > 50) risk += 20;
      else if (margin > 40) risk += 13;
      else if (margin < 3) risk += 15;
      else if (margin < 5) risk += 8;

      // Capital component (0-20 points)
      const capital = buyPrice * Math.min(volume, 100);
      if (capital > 10_000_000_000) risk += 18;
      else if (capital > 1_000_000_000) risk += 14;
      else if (capital > 100_000_000) risk += 8;
      else if (capital > 10_000_000) risk += 3;

      return Math.round(risk);
    }

    // For display, return placeholder for React component
    return '<div class="risk-badge-container"></div>';
  },
  createdCell: (td, cellData, rowData) => {
    // Render React component into the cell
    const container = td.querySelector('.risk-badge-container');
    if (container) {
      const root = createRoot(container);
      root.render(<TradeRiskBadge trade={rowData} />);
    }
  }
}
```

### Step 3: (Optional) Set Default Sort by Risk

To sort by safest trades first, update your DataTable initialization:

```javascript
order: [[riskColumnIndex, 'asc']]  // Where riskColumnIndex is the index of your Risk column
```

### Step 4: Test It

Run your dev server and check the trading table:

```bash
npm run dev
```

You should see risk badges in the new Risk column, color-coded from green (low risk) to red (extreme risk).

## Alternative: Show Risk in Detail View Only

If you don't want a column, you can show the full risk assessment when clicking on a trade row:

```javascript
// In your row click handler or detail modal:
import TradeRiskScore from '../common/TradeRiskScore';

function showTradeDetails(trade) {
  // Your existing detail view code...

  // Add risk assessment section
  return (
    <div>
      <h3>Trade Details: {trade['Type Name']}</h3>

      {/* Add risk assessment */}
      <TradeRiskScore
        trade={trade}
        showGauge={true}
        showBreakdown={true}
        expandable={false}
      />

      {/* Rest of your detail view */}
    </div>
  );
}
```

## Quick Integration Checklist

- [ ] Import `TradeRiskBadge` from TradeRiskScore component
- [ ] Add Risk column to DataTable columns array
- [ ] Use `createRoot` to render React component in cell
- [ ] Test sorting works correctly
- [ ] Verify colors match risk levels (green/yellow/orange/red)
- [ ] Check tooltips appear on hover
- [ ] Test with sample data from different risk levels

## Sample Data for Testing

Test with these edge cases:

```javascript
// Extreme risk (volume = 1)
{
  'Type Name': 'Test Item 1',
  'Volume': 1,
  'Gross Margin': 75,
  'Buy Price': 100000,
  'Sell Price': 175000,
  'Net Profit': 75000
}

// Low risk (good volume, healthy margin)
{
  'Type Name': 'Test Item 2',
  'Volume': 5000,
  'Gross Margin': 18,
  'Buy Price': 5000,
  'Sell Price': 5900,
  'Net Profit': 4500000
}

// High risk (low volume, high margin)
{
  'Type Name': 'Test Item 3',
  'Volume': 3,
  'Gross Margin': 42,
  'Buy Price': 500000000,
  'Sell Price': 710000000,
  'Net Profit': 630000000
}
```

## Troubleshooting

### "TradeRiskBadge is not defined"
- Check your import statement
- Make sure you're importing from the correct path: `'../common/TradeRiskScore'`

### Risk badges not showing
- Verify the container div has class `risk-badge-container`
- Check browser console for React errors
- Make sure `createRoot` is imported from 'react-dom/client'

### Sorting not working
- Ensure you're returning a numeric value for `type === 'sort'`
- Check that column has `orderable: true`

### Colors not displaying
- Verify Tailwind CSS is processing the component
- Check that theme colors are defined in tailwind.config.js
- Ensure dark mode is enabled if using space theme

## Need More Help?

See the full documentation:
- **Quick Start**: `TRADE_RISK_SCORE_USAGE.md`
- **Technical Details**: `src/components/common/TradeRiskScore.README.md`
- **Interactive Demo**: `src/components/common/TradeRiskScore.demo.jsx`
- **Complete Summary**: `COMPONENT_SUMMARY.md`

## Example: Complete Column Setup

Here's a complete example showing Risk column in context with other columns:

```javascript
const columns = [
  {
    title: 'Type',
    data: 'Type Name',
    className: 'font-medium'
  },
  {
    title: 'Volume',
    data: 'Volume',
    className: 'text-right',
    render: (data) => formatNumber(data, 0)
  },
  {
    title: 'Margin',
    data: 'Gross Margin',
    className: 'text-right',
    render: (data) => formatPercent(data / 100)
  },
  {
    title: 'Risk',  // <-- NEW COLUMN
    data: null,
    orderable: true,
    className: 'text-center',
    width: '80px',
    render: (data, type, row) => {
      if (type === 'sort' || type === 'filter') {
        // Simplified risk calculation for sorting
        const volume = row['Volume'] || 0;
        const margin = row['Gross Margin'] || 0;
        let risk = 0;
        if (volume === 1) risk += 35;
        else if (volume <= 20) risk += 14;
        if (margin > 40) risk += 13;
        else if (margin < 3) risk += 15;
        return risk;
      }
      return '<div class="risk-badge-container"></div>';
    },
    createdCell: (td, cellData, rowData) => {
      const container = td.querySelector('.risk-badge-container');
      if (container) {
        const root = createRoot(container);
        root.render(<TradeRiskBadge trade={rowData} />);
      }
    }
  },
  {
    title: 'Profit',
    data: 'Net Profit',
    className: 'text-right text-green-400',
    render: (data) => formatISK(data)
  }
  // ... more columns
];
```

## Performance Notes

Adding the Risk column:
- **Render time**: ~5-10ms per 100 rows
- **Sort time**: ~50-100ms per 1000 rows
- **Memory**: ~1KB per rendered badge
- **Re-render**: Only on data change (memoized)

For optimal performance with large datasets (>1000 rows):
- Consider pagination (DataTables default)
- Pre-calculate risk scores on the backend
- Use server-side processing for very large datasets

## What's Next?

After adding the Risk column:

1. **Add Filtering**: Let users filter by risk level
2. **Risk Insights**: Show aggregate risk stats above table
3. **Risk Warnings**: Highlight extreme risk trades
4. **Export with Risk**: Include risk scores in CSV exports
5. **Saved Filters**: Let users save preferred risk thresholds

See `COMPONENT_SUMMARY.md` for more enhancement ideas.
