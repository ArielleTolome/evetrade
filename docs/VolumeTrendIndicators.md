# Volume Trend Indicators

## Overview

The Volume Trend Indicators feature provides traders with visual insights into market volume trends over time. This helps identify growing or declining markets, making it easier to spot profitable opportunities and avoid dying markets.

## Components

### VolumeTrendIndicator

A React component that displays volume with historical trend analysis.

**Features:**
- **7-day volume trend** - Compares recent 3-day average vs previous 4-day average
- **Visual sparkline** - Mini chart showing volume over the last 7 days
- **Color-coded arrows** - Green (increasing), Yellow (stable), Red (decreasing)
- **Detailed tooltips** - Hover for comprehensive volume statistics
- **Smart caching** - API responses cached for 1 hour to minimize ESI calls
- **Graceful degradation** - Falls back to basic volume display on errors

**Usage:**

```jsx
import { VolumeTrendIndicator } from '../components/common/VolumeIndicator';

<VolumeTrendIndicator
  typeId={34}           // EVE Online type ID (item ID)
  regionId={10000002}   // EVE Online region ID
  currentVolume={1000}  // Current volume value
  compact={true}        // Use compact mode for tables
/>
```

**Props:**
- `typeId` (number, required) - EVE Online type ID for the item
- `regionId` (number, required) - EVE Online region ID where trades occur
- `currentVolume` (number, required) - The current volume value to display
- `compact` (boolean, optional) - Use compact mode for table cells (default: false)

**Modes:**

**Compact Mode** (for table cells):
- Shows volume with tier indicator (e.g., "1.0K")
- Displays trend arrow (▲/▼/—)
- Shows percentage change
- Tooltip with sparkline on hover

**Full Mode** (for detailed views):
- Complete volume display with tier label
- Full-size sparkline visualization
- Trend arrow and percentage
- Info icon with detailed tooltip

### VolumeIndicator (Original)

The original component for basic volume display, still available for use.

**Usage:**

```jsx
import { VolumeIndicator } from '../components/common/VolumeIndicator';

<VolumeIndicator
  volume={1000}
  maxVolume={5000}
  showLabel={true}
  showBar={true}
  compact={false}
/>
```

### VolumeStats

Displays aggregate volume statistics for a dataset.

**Usage:**

```jsx
import { VolumeStats } from '../components/common/VolumeIndicator';

<VolumeStats
  data={trades}
  volumeKey="volume"
/>
```

## Trend Calculation

The trend is calculated by comparing two time periods:
1. **Recent Period**: Last 3 days average volume
2. **Previous Period**: Days 4-7 average volume

**Trend Categories:**
- **Increasing (▲)**: Change > +10% (green)
- **Stable (—)**: Change between -10% and +10% (yellow)
- **Decreasing (▼)**: Change < -10% (red)

## Caching Strategy

Volume history data is cached using the application's standard caching mechanism:

- **Cache Key Format**: `volume_history_{regionId}_{typeId}`
- **Cache Duration**: 1 hour (follows CACHE_CONFIG from constants)
- **Storage**: Uses localStorage for small datasets, IndexedDB for larger ones
- **Fallback**: Gracefully handles cache failures

## Integration

The VolumeTrendIndicator is integrated into the Station Trading page:

**File**: `src/pages/StationTradingPage.jsx`

```jsx
{
  key: 'Volume',
  label: 'Volume',
  type: 'num',
  render: (data, row) => {
    const typeId = row['Item ID'] || row.itemId;
    const stationData = getStationData(form.station, universeList);
    const regionId = stationData?.region;

    if (typeId && regionId) {
      return (
        <VolumeTrendIndicator
          typeId={typeId}
          regionId={regionId}
          currentVolume={data}
          compact={true}
        />
      );
    }

    // Fallback to basic indicator
    return <VolumeIndicator volume={data} compact={true} />;
  },
}
```

## ESI API Integration

The component uses the EVE Swagger Interface (ESI) to fetch market history:

**Endpoint**: `/markets/{region_id}/history/?type_id={type_id}`

**File**: `src/api/esi.js`

```javascript
export async function getMarketHistory(regionId, typeId) {
  return esiRequest(`/markets/${regionId}/history/?type_id=${typeId}`);
}
```

## Error Handling

The component includes comprehensive error handling:

1. **API Errors**: Logs warning, displays fallback basic volume indicator
2. **Missing Data**: Shows loading state, then falls back gracefully
3. **Cache Failures**: Continues with API fetch
4. **Invalid Props**: Returns early without attempting fetch

## Performance Considerations

- **Lazy Loading**: Data fetched only when component mounts
- **Caching**: Reduces ESI API calls significantly
- **Cleanup**: Proper React cleanup to prevent memory leaks
- **Memoization**: useMemo for expensive calculations
- **Compact Tooltips**: Only detailed data shown on hover

## Testing

Unit tests are available in `src/components/common/VolumeIndicator.test.jsx`

**Test Coverage:**
- Basic VolumeIndicator rendering
- VolumeTrendIndicator data loading
- Cache integration
- API error handling
- Trend calculations
- VolumeStats aggregations

**Run Tests:**
```bash
npm test VolumeIndicator
```

## Future Enhancements

Potential improvements for future versions:

1. **Configurable Time Periods**: Allow users to select 7, 14, or 30-day trends
2. **Price Correlation**: Show volume trend alongside price trends
3. **Market Depth**: Integrate with order depth data
4. **Alerts**: Notify users when volume trends change significantly
5. **Comparative Analysis**: Compare volume across multiple regions
6. **Export Data**: Allow exporting volume history to CSV

## Troubleshooting

**Volume not loading:**
- Check browser console for ESI API errors
- Verify typeId and regionId are valid
- Check network tab for failed requests
- Clear cache and try again

**Trend shows as stable when it shouldn't:**
- Verify there's at least 7 days of history data
- Check if volume is actually changing
- Review threshold settings (currently ±10%)

**Performance issues:**
- Check if cache is working properly
- Monitor number of API calls
- Consider reducing number of items displayed simultaneously

## Related Files

- `/src/components/common/VolumeIndicator.jsx` - Main component file
- `/src/components/common/VolumeIndicator.test.jsx` - Unit tests
- `/src/api/esi.js` - ESI API integration
- `/src/hooks/useCache.js` - Caching utilities
- `/src/utils/formatters.js` - Number formatting utilities
- `/src/pages/StationTradingPage.jsx` - Integration example
