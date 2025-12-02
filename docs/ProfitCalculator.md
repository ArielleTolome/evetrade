# Comprehensive Profit Calculator

A complete profit calculation system for EVE Online trading that includes all taxes and fees.

## Components

### 1. ComprehensiveProfitCalculator

The main calculator component with full-featured inputs and outputs.

**Location:** `/src/components/trading/ComprehensiveProfitCalculator.jsx`

**Features:**
- Item name autocomplete
- Buy/sell price inputs
- Quantity input
- Tax and fee settings
  - Accounting skill level (0-5)
  - Broker Relations skill level (0-5)
  - Faction standing (-10 to +10)
  - Corporation standing (-10 to +10)
  - Station type (NPC vs Player Structure)
- Real-time calculations
- History of calculations
- Copy results as formatted text
- Save/load from history

**Usage:**
```jsx
import { ComprehensiveProfitCalculator } from '../components/trading/ComprehensiveProfitCalculator';

function MyPage() {
  return <ComprehensiveProfitCalculator />;
}
```

### 2. QuickProfitBadge

Inline profit badge for displaying net profit in table rows.

**Location:** `/src/components/trading/QuickProfitBadge.jsx`

**Features:**
- Compact display of net profit and ROI
- Color-coded (green for profit, red for loss)
- Tooltip with fee breakdown
- Click to open full calculator

**Usage:**
```jsx
import { QuickProfitBadge } from '../components/trading/QuickProfitBadge';

function TradingTable({ trades }) {
  return (
    <table>
      <tbody>
        {trades.map((trade) => (
          <tr key={trade.id}>
            <td>{trade.itemName}</td>
            <td>
              <QuickProfitBadge
                buyPrice={trade.buyPrice}
                sellPrice={trade.sellPrice}
                quantity={trade.quantity}
                accountingLevel={5}
                brokerRelationsLevel={5}
                onCalculatorOpen={() => handleOpenCalculator(trade)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 3. useProfit Hook

Custom hook for profit calculations and history management.

**Location:** `/src/hooks/useProfit.jsx`

**API:**
```javascript
const {
  calculate,        // Calculate profit with all fees
  getBreakEven,     // Calculate break-even price
  getROI,           // Calculate ROI percentage
  formatForCopy,    // Format calculation for clipboard
  history,          // Array of saved calculations
  saveToHistory,    // Save a calculation
  removeFromHistory,// Remove a calculation
  clearHistory,     // Clear all history
  getFromHistory,   // Get calculation by ID
} = useProfit();
```

**Example:**
```javascript
import { useProfit } from '../hooks/useProfit';

function MyComponent() {
  const { calculate, saveToHistory } = useProfit();

  const result = calculate({
    buyPrice: 1000000,
    sellPrice: 1200000,
    quantity: 100,
    accountingLevel: 5,
    brokerRelationsLevel: 5,
    isPlayerStructure: false,
  });

  console.log('Net Profit:', result.netProfit);
  console.log('ROI:', result.roi);

  // Save to history
  saveToHistory({
    itemName: 'PLEX',
    buyPrice: 1000000,
    sellPrice: 1200000,
    quantity: 100,
    results: result,
  });
}
```

## Utility Functions

### profitCalculations.js

Pure calculation functions used by the hook and components.

**Location:** `/src/utils/profitCalculations.js`

**Functions:**

#### calculateSalesTax
```javascript
calculateSalesTax(price, rate = 0.05, accountingLevel = 0)
```
Calculates sales tax based on Accounting skill level.

**Formula:** Base 5% tax, reduced by 10% per level of Accounting
- Level 0: 5.00%
- Level 1: 4.50%
- Level 2: 4.05%
- Level 3: 3.65%
- Level 4: 3.28%
- Level 5: 2.95%

#### calculateBrokerFee
```javascript
calculateBrokerFee(
  price,
  rate = 0.03,
  brokerRelationsLevel = 0,
  isPlayerStructure = false,
  factionStanding = 0,
  corporationStanding = 0
)
```
Calculates broker fee based on skills, standings, and station type.

**Formula:** Base 3% fee, reduced by:
- 0.3% per level of Broker Relations
- 0.3% per 1.0 faction standing
- 0.2% per 1.0 corporation standing
- Minimum 1.0% for NPC stations
- Player structures: 50% of calculated fee

#### calculateNetProfit
```javascript
calculateNetProfit({
  buyPrice,
  sellPrice,
  quantity,
  salesTaxRate,
  brokerFeeRate,
  accountingLevel,
  brokerRelationsLevel,
  isPlayerStructure,
  factionStanding,
  corporationStanding,
})
```
Calculates complete profit breakdown including all fees.

**Returns:**
```javascript
{
  grossProfit,           // Total sell - total buy
  buyBrokerFee,          // Broker fee on buy order
  sellBrokerFee,         // Broker fee on sell order
  salesTax,              // Sales tax on sell
  totalFees,             // Sum of all fees
  netProfit,             // Gross profit - total fees
  profitPerUnit,         // Net profit / quantity
  roi,                   // (Net profit / investment) * 100
  effectiveSalesTaxRate, // Actual sales tax rate after skills
  effectiveBrokerFeeRate,// Actual broker fee rate after skills/standings
}
```

#### calculateBreakEven
```javascript
calculateBreakEven({
  buyPrice,
  salesTaxRate,
  brokerFeeRate,
  accountingLevel,
  brokerRelationsLevel,
  isPlayerStructure,
  factionStanding,
  corporationStanding,
})
```
Calculates minimum sell price to break even.

**Formula:**
```
Break-Even = (Buy Price × (1 + Buy Broker Fee)) / (1 - Sell Broker Fee - Sales Tax)
```

#### formatProfitForCopy
```javascript
formatProfitForCopy(itemName, params, result)
```
Formats calculation as text for clipboard.

**Output Format:**
```
Item: [Name]
Buy: [X] ISK x [Qty]
Sell: [Y] ISK x [Qty]
Gross: [Z] ISK
Fees: [A] ISK (Buy Broker: [B], Sell Broker: [C], Tax: [D])
Net Profit: [E] ISK
ROI: [F]%
```

## EVE Online Tax and Fee Mechanics

### Sales Tax
- **Base Rate:** 5%
- **Skill:** Accounting (reduces by 10% per level)
- **When Applied:** Only on sell orders
- **Minimum:** 2.95% (Accounting V)

### Broker Fee
- **Base Rate:** 3%
- **Skills:** Broker Relations (reduces by 0.3% per level)
- **Standings:**
  - Faction standing: -0.3% per 1.0 standing
  - Corporation standing: -0.2% per 1.0 standing
- **When Applied:** Both buy and sell orders
- **Minimum (NPC):** 1.0% (perfect skills and standings)
- **Player Structures:** Often 0.5% - 1.5% (customizable by owner)

### Total Transaction Cost
For a complete buy + sell cycle:
```
Total Cost = Buy Broker Fee + Sell Broker Fee + Sales Tax
```

Example with perfect skills (Accounting V, Broker Relations V, 0 standings):
- Broker fee: 1.5% (3% - 1.5% from skill)
- Sales tax: 2.95%
- Total: 1.5% (buy) + 1.5% (sell) + 2.95% (tax) = **5.95%**

### Break-Even Margin
To break even, your sell price must cover:
1. Original buy price
2. Buy broker fee
3. Sell broker fee
4. Sales tax

With perfect skills, you need approximately **6.32%** margin to break even.

## Integration Examples

### Adding to Trading Table
```jsx
import { QuickProfitBadge } from '../components/trading/QuickProfitBadge';

// In your table component
<td>
  <QuickProfitBadge
    buyPrice={row.buyPrice}
    sellPrice={row.sellPrice}
    quantity={row.quantity}
    accountingLevel={userSkills.accounting}
    brokerRelationsLevel={userSkills.brokerRelations}
    onCalculatorOpen={() => openCalculator(row)}
  />
</td>
```

### Standalone Calculator Page
Already integrated in `/src/pages/ToolsPage.jsx` under "Trading Efficiency" tools.

### Custom Calculation
```javascript
import { calculateNetProfit } from '../utils/profitCalculations';

const result = calculateNetProfit({
  buyPrice: 1000000,
  sellPrice: 1100000,
  quantity: 50,
  accountingLevel: 5,
  brokerRelationsLevel: 5,
});

console.log(`Net profit: ${result.netProfit} ISK`);
console.log(`ROI: ${result.roi.toFixed(2)}%`);
```

## Settings Persistence

Both the calculator and the hook automatically save settings to localStorage:

- **Key:** `evetrade_profit_settings` - Tax/fee settings
- **Key:** `evetrade_profit_history` - Calculation history
- **Max History:** 50 items

Settings are automatically loaded on component mount.

## Styling

All components use the existing EVETrade design system:
- Dark theme with space aesthetics
- Glassmorphic cards
- Accent colors: cyan, gold, purple
- Responsive grid layouts
- Smooth transitions and hover effects

## Testing

To test the calculator:

1. Navigate to Tools page
2. Select "Trading Efficiency"
3. Click "Profit Calculator"
4. Enter trade details
5. Adjust skills and settings
6. View real-time results
7. Save to history
8. Copy formatted results

## Future Enhancements

Potential improvements:
- Integration with live market data
- Batch calculation for multiple items
- Profit tracking over time
- Tax optimization recommendations
- Market order simulation
- Citadel tax comparison tool
