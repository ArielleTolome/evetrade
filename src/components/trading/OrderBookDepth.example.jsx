import { OrderBookDepth } from './OrderBookDepth';

/**
 * Example usage of the OrderBookDepth component
 * Demonstrates both full and compact modes with sample data
 */

// Sample buy orders - sorted by price descending (best buy at top)
const sampleBuyOrders = [
  { price: 999500, volume: 15000 },
  { price: 999000, volume: 8500 },
  { price: 998500, volume: 12000 },
  { price: 998000, volume: 45000 }, // Price wall
  { price: 997500, volume: 6200 },
  { price: 997000, volume: 9800 },
  { price: 996500, volume: 7500 },
  { price: 996000, volume: 11200 },
  { price: 995500, volume: 5900 },
  { price: 995000, volume: 35000 }, // Price wall
  { price: 994500, volume: 4800 },
  { price: 994000, volume: 6700 },
];

// Sample sell orders - sorted by price ascending (best sell at top)
const sampleSellOrders = [
  { price: 1001000, volume: 12500 },
  { price: 1001500, volume: 9200 },
  { price: 1002000, volume: 42000 }, // Price wall
  { price: 1002500, volume: 7800 },
  { price: 1003000, volume: 10500 },
  { price: 1003500, volume: 6400 },
  { price: 1004000, volume: 8900 },
  { price: 1004500, volume: 11800 },
  { price: 1005000, volume: 38000 }, // Price wall
  { price: 1005500, volume: 5600 },
  { price: 1006000, volume: 7200 },
  { price: 1006500, volume: 9500 },
];

// Thin market example (low liquidity)
const thinBuyOrders = [
  { price: 50000, volume: 100 },
  { price: 49000, volume: 250 },
  { price: 48000, volume: 150 },
];

const thinSellOrders = [
  { price: 55000, volume: 200 },
  { price: 56000, volume: 180 },
  { price: 57000, volume: 120 },
];

// Deep market example (high liquidity)
const deepBuyOrders = Array.from({ length: 20 }, (_, i) => ({
  price: 1000000 - (i * 500),
  volume: 5000 + Math.random() * 10000,
}));

const deepSellOrders = Array.from({ length: 20 }, (_, i) => ({
  price: 1001000 + (i * 500),
  volume: 5000 + Math.random() * 10000,
}));

export function OrderBookDepthExamples() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-accent-cyan mb-2">
          Order Book Depth Component
        </h1>
        <p className="text-text-secondary">
          Visualizes market depth with buy/sell orders, spread analysis, and liquidity metrics
        </p>
      </div>

      {/* Full Size - Normal Market */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Full Size - Normal Market Liquidity
        </h2>
        <OrderBookDepth
          buyOrders={sampleBuyOrders}
          sellOrders={sampleSellOrders}
          itemName="Tritanium"
        />
      </div>

      {/* Compact Mode */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Compact Mode - For Tables & Inline Display
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OrderBookDepth
            buyOrders={sampleBuyOrders}
            sellOrders={sampleSellOrders}
            itemName="Tritanium"
            compact
          />
          <OrderBookDepth
            buyOrders={deepBuyOrders}
            sellOrders={deepSellOrders}
            itemName="Isogen"
            compact
          />
        </div>
      </div>

      {/* Thin Market */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Thin Market (Low Liquidity)
        </h2>
        <OrderBookDepth
          buyOrders={thinBuyOrders}
          sellOrders={thinSellOrders}
          itemName="Rare Module"
        />
      </div>

      {/* Deep Market */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Deep Market (High Liquidity)
        </h2>
        <OrderBookDepth
          buyOrders={deepBuyOrders}
          sellOrders={deepSellOrders}
          itemName="PLEX"
        />
      </div>

      {/* Empty State */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Empty State - No Orders
        </h2>
        <OrderBookDepth
          buyOrders={[]}
          sellOrders={[]}
          itemName="No Market Data"
        />
      </div>

      {/* Integration Example */}
      <div className="bg-space-dark/50 border border-accent-cyan/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Integration Example
        </h2>
        <pre className="text-sm text-text-secondary overflow-x-auto">
{`import { OrderBookDepth } from './components/trading/OrderBookDepth';

// From ESI API or your backend
const buyOrders = [
  { price: 999500, volume: 15000 },
  { price: 999000, volume_remain: 8500 }, // Also supports volume_remain
  // ... more orders
];

const sellOrders = [
  { price: 1001000, volume: 12500 },
  { price: 1001500, volume: 9200 },
  // ... more orders
];

// Full size
<OrderBookDepth
  buyOrders={buyOrders}
  sellOrders={sellOrders}
  itemName="Tritanium"
/>

// Compact mode for tables
<OrderBookDepth
  buyOrders={buyOrders}
  sellOrders={sellOrders}
  itemName="Tritanium"
  compact
/>

// Features:
// - Automatic spread calculation (absolute & percentage)
// - Liquidity scoring (Thin/Normal/Deep)
// - Price wall detection (large orders acting as support/resistance)
// - Cumulative volume visualization
// - Hover interactions showing cumulative depth
// - Color-coded buy (green) vs sell (red) orders
// - Responsive design with compact mode for embedding`}
        </pre>
      </div>

      {/* Key Features */}
      <div className="bg-space-dark/50 border border-accent-cyan/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary">
          <div>
            <h3 className="text-accent-cyan font-semibold mb-2">Visual Features</h3>
            <ul className="space-y-1 text-sm">
              <li>• Horizontal bar chart showing cumulative depth</li>
              <li>• Green bars for buy orders (grow right)</li>
              <li>• Red bars for sell orders (grow left)</li>
              <li>• Darker/thicker borders for large orders (walls)</li>
              <li>• Hover to see cumulative volume</li>
              <li>• Price walls marked with shield emoji 🛡️</li>
            </ul>
          </div>
          <div>
            <h3 className="text-accent-cyan font-semibold mb-2">Metrics Displayed</h3>
            <ul className="space-y-1 text-sm">
              <li>• Spread (absolute ISK & percentage)</li>
              <li>• Best buy & sell prices</li>
              <li>• Total buy & sell volume</li>
              <li>• Liquidity score (Thin/Normal/Deep)</li>
              <li>• Price wall detection and count</li>
              <li>• Support/resistance levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderBookDepthExamples;
