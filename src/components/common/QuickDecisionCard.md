# QuickDecisionCard Component

A comprehensive trade decision card that provides instant GO/WAIT/AVOID recommendations for EVE Online trading opportunities.

## Features

- **Clear Decision Indicator**: Shows GO (green), WAIT (yellow), or AVOID (red) based on multiple trade factors
- **Detailed Breakdown**: Explains why a decision was made with specific factor evaluations
- **Key Metrics Display**: Shows margin, volume, and ROI at a glance
- **Action Buttons**: Quick access to open in EVE, copy details, and add to watchlist
- **Smart Scoring**: Evaluates 6 factors including margin, volume, competition, data age, affordability, and ROI

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `item` | `Object` | Yes | Item information `{ name: string, typeId: number }` |
| `profit` | `number` | Yes | Net profit amount in ISK |
| `margin` | `number` | Yes | Profit margin as percentage (e.g., 15.5 for 15.5%) |
| `volume` | `number` | Yes | Available volume/quantity of items |
| `roi` | `number` | Yes | Return on investment as percentage |
| `competition` | `number` | Yes | Number of competing sellers |
| `dataAge` | `number` | Yes | Minutes since data was last refreshed |
| `userCanAfford` | `boolean` | No | Whether user can afford this trade (default: true) |
| `fromLocation` | `string` | Yes | Source station/location name |
| `toLocation` | `string` | Yes | Destination station/location name |
| `className` | `string` | No | Additional CSS classes |

## Decision Logic

### GO (Green)
Trade will be marked as GO when:
- User can afford it
- Average factor score >= 70
- Less than 1 risky factor
- Generally good margin, volume, and fresh data

### WAIT (Yellow)
Trade will be marked as WAIT when:
- User can afford it
- Average factor score 40-70
- Has 1 risky factor
- Some concerns but might still be viable

### AVOID (Red)
Trade will be marked as AVOID when:
- User cannot afford it, OR
- Average factor score < 40, OR
- Has 2+ risky factors
- High risk of scam, stale data, or poor metrics

## Factor Scoring

### Margin
- **Good** (>10%): Excellent/Good margin
- **Okay** (5-10%): Moderate margin
- **Risky** (<5%): Thin/Very low margin

### Volume
- **Good** (>=50): Excellent/Good volume
- **Okay** (10-49): Moderate volume
- **Risky** (<10): Low volume, potential scam warning

### Competition
- **Good** (<5 sellers): Minimal/Low competition
- **Okay** (5-14 sellers): Moderate/High competition
- **Risky** (>=15 sellers): Crowded market

### Data Age
- **Good** (<5 min): Fresh data
- **Okay** (5-14 min): Recent/Aging data
- **Risky** (>=15 min): Stale data warning

### Affordability
- **Good**: User can afford
- **Risky**: Insufficient funds

### ROI
- **Good** (>15%): Excellent/Good ROI
- **Okay** (10-15%): Decent/Moderate ROI
- **Risky** (<10%): Low ROI

## Usage

### Basic Example

```jsx
import { QuickDecisionCard } from './components/common/QuickDecisionCard';

function TradePage() {
  return (
    <QuickDecisionCard
      item={{ name: 'PLEX', typeId: 44992 }}
      profit={125000000}
      margin={18.5}
      volume={150}
      roi={22.3}
      competition={3}
      dataAge={2.5}
      userCanAfford={true}
      fromLocation="Jita IV - Moon 4 - Caldari Navy Assembly Plant"
      toLocation="Amarr VIII (Oris) - Emperor Family Academy"
    />
  );
}
```

### Integration with Trading API

```jsx
import { QuickDecisionCard } from './components/common/QuickDecisionCard';

function TradeResults({ trades, userWallet }) {
  return (
    <div className="space-y-6">
      {trades.map((trade, index) => {
        const buyPrice = trade['Buy Price'] || 0;
        const sellPrice = trade['Sell Price'] || 0;
        const volume = trade['Volume'] || 0;
        const profit = trade['Net Profit'] || 0;
        const margin = trade['Gross Margin'] || 0;

        const roi = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;
        const canAfford = (buyPrice * Math.min(volume, 1)) <= userWallet;
        const dataAge = calculateDataAge(trade.lastUpdated);

        return (
          <QuickDecisionCard
            key={index}
            item={{
              name: trade['Item Name'],
              typeId: trade['Item ID']
            }}
            profit={profit}
            margin={margin}
            volume={volume}
            roi={roi}
            competition={trade.sellOrderCount || 5}
            dataAge={dataAge}
            userCanAfford={canAfford}
            fromLocation={trade['From Location']}
            toLocation={trade['To Location']}
          />
        );
      })}
    </div>
  );
}
```

### Responsive Layout

```jsx
// Single column on mobile, grid on desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <QuickDecisionCard {...trade1} />
  <QuickDecisionCard {...trade2} />
</div>
```

## Actions

### Open in EVE
Generates an `eve://showinfo:{typeId}` link to open the item in the EVE client.

### Copy Details
Copies a formatted summary of the trade to clipboard:
```
Trade Opportunity: PLEX
Decision: GO
Profit: 125.00M ISK
Margin: 18.5%
ROI: 22.3%
Volume: 150 units
Competition: 3 sellers
From: Jita IV - Moon 4 - Caldari Navy Assembly Plant
To: Amarr VIII (Oris) - Emperor Family Academy
Data Age: 3 minutes ago
```

### Add to Watchlist
Placeholder for watchlist integration (TODO: implement actual watchlist functionality).

## Styling

The component uses the EVETrade design system:
- **GlassmorphicCard**: For the card container
- **Button**: For action buttons
- **Color palette**: Matches the neon/glassmorphism theme
- **Responsive**: Works on mobile and desktop

## Example Scenarios

See `QuickDecisionCard.example.jsx` for comprehensive examples including:
1. GO - Excellent opportunity
2. WAIT - Moderate concerns
3. AVOID - Low volume scam risk
4. AVOID - Insufficient funds
5. WAIT - Stale data warning
6. AVOID - Obvious scam (high margin + low volume)

## Future Enhancements

- [ ] Integration with actual watchlist system
- [ ] Historical performance tracking per item
- [ ] Price trend indicators
- [ ] Market depth visualization
- [ ] Risk score trending over time
- [ ] Customizable factor weights
- [ ] User preference for risk tolerance
- [ ] Multiple character wallet tracking
