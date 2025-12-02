# Route Optimization Components

A comprehensive suite of route planning and optimization tools for EVE Online trading.

## Components

### 1. MultiStopPlanner

**File:** `MultiStopPlanner.jsx`

**Purpose:** Plan and optimize trading routes with multiple pickup and delivery points.

**Features:**
- Add unlimited pickup, delivery, and waypoint stops
- Drag-and-drop reordering of stops
- Automatic route optimization using nearest-neighbor algorithm
- Save and load favorite routes (localStorage)
- Display total jumps and estimated travel time
- Security status badges for each stop
- Notes field for each stop

**Usage:**
```jsx
import { MultiStopPlanner } from './components/routing';

<MultiStopPlanner className="mb-8" />
```

**User Actions:**
- Click "Add Pickup" or "Add Delivery" to add stops
- Drag stops to manually reorder
- Click "Optimize Route" to automatically find shortest path
- Fill in station names using autocomplete
- Add notes for each stop (e.g., "Pick up 100x Tritanium")
- Save routes for later use
- Load previously saved routes

---

### 2. CargoOptimizer

**File:** `CargoOptimizer.jsx`

**Purpose:** Optimize trade selection based on ship cargo capacity to maximize ISK per m³.

**Features:**
- 20+ ship presets with accurate cargo capacities
- Greedy knapsack optimization algorithm
- Real-time efficiency calculations (ISK/m³)
- Shows items to haul vs. items to leave behind
- Ship comparison mode (compare up to 3 capacities)
- Capacity utilization visualization
- Copy optimized item list to clipboard

**Ship Categories:**
- Industrial Haulers (Tayra, Badger, Mammoth, etc.)
- Specialized Haulers (Epithal, Miasmos, Kryos)
- Deep Space Transports (Impel, Occator)
- Blockade Runners (Bustard, Prorator)
- Freighters (Providence, Charon, Obelisk, Fenrir)
- Jump Freighters (Ark, Rhea, Nomad, Anshar)

**Usage:**
```jsx
import { CargoOptimizer } from './components/routing';

// Pass in trade data from API
<CargoOptimizer
  trades={tradeData}
  className="mb-8"
/>
```

**Algorithm:**
The component uses a greedy approximation of the knapsack problem:
1. Calculate profit/volume ratio for each item
2. Sort items by efficiency (highest first)
3. Select items in order until cargo is full
4. Display excluded items separately

---

### 3. FuelCostCalculator

**File:** `FuelCostCalculator.jsx`

**Purpose:** Calculate isotope fuel costs for jump freighter routes and determine net profitability.

**Features:**
- All 4 jump freighters (Ark, Rhea, Nomad, Anshar)
- Jump Drive Calibration skill support (I-V)
- Jump Drive Conservation skill support (I-V, up to 25% fuel reduction)
- Isotope price configuration (market or custom)
- Multi-jump route planning with waypoints
- Detailed fuel cost per jump
- Net profit calculation after fuel costs
- Profit margin visualization
- Copy jump plan to clipboard

**Isotope Types:**
- Helium Isotopes (Ark)
- Nitrogen Isotopes (Rhea)
- Oxygen Isotopes (Nomad)
- Hydrogen Isotopes (Anshar)

**Usage:**
```jsx
import { FuelCostCalculator } from './components/routing';

<FuelCostCalculator className="mb-8" />
```

**Calculations:**
- Base fuel: 8,100 isotopes per light-year (all JFs)
- Jump range: 5.0 LY base + 0.5 LY per JDC level
- Fuel reduction: 5% per level of Jump Drive Conservation
- Total cost: fuel × isotope price × number of jumps

**Tips Provided:**
- Skill training recommendations
- Profitability warnings (low margin, negative profit)
- Alternative route suggestions

---

### 4. RouteRiskAssessment

**File:** `RouteRiskAssessment.jsx`

**Purpose:** Analyze security status and gank probability for trade routes.

**Features:**
- System-by-system security analysis
- Known gank hotspot detection (Uedama, Niarja, etc.)
- Gank probability calculation based on:
  - System security status
  - Cargo value
  - Known hotspot locations
- Overall risk rating (minimal/low/medium/high/extreme)
- High-sec/low-sec/null-sec system counts
- Safer alternative route suggestions
- Color-coded risk visualization
- Safety recommendations

**Known Hotspots:**
- **Uedama** (The Forge) - Major freighter gank location
- **Niarja** (Domain) - Amarr-Jita chokepoint
- **Sivala** (The Forge) - Jita exit route
- **Amamake** (Heimatar) - Low-sec pirate hub
- **Rancer** (Sinq Laison) - Infamous low-sec camp
- **Tama** (The Citadel) - Black Rise gate camp

**Usage:**
```jsx
import { RouteRiskAssessment } from './components/routing';

<RouteRiskAssessment className="mb-8" />
```

**Risk Calculation:**
Base risk from security:
- 1.0-0.9: 0.1% base risk
- 0.9-0.7: 0.5% base risk
- 0.7-0.5: 2% base risk
- 0.5-0.3: 15% base risk
- 0.3-0.1: 35% base risk
- <0.1: 75% base risk

Multipliers:
- Cargo value (1x to 3x based on billions)
- Hotspot presence (2x to 5x)

**Safety Recommendations:**
- Scout alt usage
- Tank and align time optimization
- Insta-dock bookmarks
- Webbing alt for faster align
- Blockade runner for high-value cargo
- Split valuable cargo into multiple trips

---

## Integration

All components are exported from the index file:

```jsx
import {
  MultiStopPlanner,
  CargoOptimizer,
  FuelCostCalculator,
  RouteRiskAssessment
} from './components/routing';
```

## Data Requirements

### Required from useResources:
- `universeList` - Station/system data with security status
- `stationList` - List of all stations
- `regionList` - List of all regions

### Optional Trade Data:
CargoOptimizer expects trade data with these fields:
- `Item` or `item` - Item name
- `Volume` or `volume` - Item volume in m³
- `Net Profit` or `netProfit` - Profit per unit

## localStorage Usage

### MultiStopPlanner
- Key: `evetrade_saved_routes`
- Data: Array of saved route objects
- Structure:
```js
{
  id: timestamp,
  name: "Route Name",
  stops: [{ id, station, type, notes }],
  created: ISO date string
}
```

## Future Enhancements

### Planned Features:
1. **Real pathfinding** - Use actual EVE solar system graph for accurate jump counts
2. **Market data integration** - Fetch live isotope prices from API
3. **Killboard integration** - Show recent kills in systems along route
4. **Jump bridge support** - Factor in alliance jump bridges
5. **Bookmark export** - Generate EVE Online bookmark format
6. **Route sharing** - Share routes with corp/alliance members
7. **Wormhole support** - Account for wormhole shortcuts
8. **Multiple cargo runs** - Optimize across multiple trips

### API Integration Points:
- `/api/pathfinding` - Real EVE Online pathfinding
- `/api/isotopes` - Current isotope market prices
- `/api/killboard` - Recent system kills (zKillboard)
- `/api/jumps` - Jump frequency statistics

## Technical Details

### Dependencies:
- React hooks (useState, useMemo, useCallback, useEffect)
- EVETrade custom hooks (useResources)
- EVETrade utilities (formatters, getStationData)
- EVETrade components (GlassmorphicCard, StationAutocomplete, FormInput, FormSelect, SecurityBadge)

### Performance:
- Route optimization: O(n²) nearest-neighbor
- Cargo optimization: O(n log n) greedy sort
- Risk calculation: O(n) linear scan
- All components use React.memo for optimization

### Browser Compatibility:
- Modern browsers with ES6+ support
- localStorage API required
- Clipboard API for copy features
- CSS Grid and Flexbox for layout

## Contributing

When adding new features:
1. Follow existing component patterns
2. Use TypeScript-style JSDoc comments
3. Add proper error handling
4. Include user-facing helper text
5. Maintain accessibility (ARIA labels, keyboard navigation)
6. Test with various data sizes
7. Update this README

## License

Part of the EVETrade project. See main project LICENSE file.
