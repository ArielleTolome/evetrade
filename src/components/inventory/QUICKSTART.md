# Quick Start Guide - Inventory Management

Get the inventory management features up and running in 5 minutes.

## 1. See it in Action (2 minutes)

The fastest way to see all features is to run the demo:

### Step 1: Add the Route

Open your router file (usually `src/App.jsx` or similar) and add:

```jsx
import { InventoryManagementDemo } from './components/inventory/InventoryManagementDemo';

// In your routes:
<Route path="/inventory-demo" element={<InventoryManagementDemo />} />
```

### Step 2: Add to Navigation

Open `src/components/common/Navbar.jsx` and add a link:

```jsx
<Link to="/inventory-demo" className="text-text-secondary hover:text-accent-cyan">
  Inventory Demo
</Link>
```

### Step 3: Visit the Demo

Start your dev server and navigate to `/inventory-demo`

```bash
npm run dev
# Then visit http://localhost:5173/inventory-demo
```

You'll see:
- ✅ Inventory Valuation with pie chart
- ✅ Stock Alerts panel
- ✅ Restock Suggestions
- ✅ Dead Stock Identifier

All with sample data - click around and explore!

---

## 2. Use in Your App (3 minutes)

Once you've seen the demo, integrate into your real pages:

### Simple Integration (Copy-Paste Ready)

Create `src/pages/InventoryPage.jsx`:

```jsx
import { PageLayout } from '../components/layout/PageLayout';
import { InventoryValuation, StockAlertPanel } from '../components/inventory';

export function InventoryPage() {
  // TODO: Replace with real data
  const inventory = [
    { itemId: 34, itemName: 'Tritanium', quantity: 15000, price: 5.5 },
    { itemId: 35, itemName: 'Pyerite', quantity: 8000, price: 12.0 },
  ];

  const currentPrices = { 34: 5.5, 35: 12.0 };
  const itemCategories = { 34: 'Minerals', 35: 'Minerals' };

  return (
    <PageLayout>
      <h1 className="text-4xl font-display font-bold text-text-primary mb-6">
        Inventory Management
      </h1>

      <div className="space-y-6">
        <InventoryValuation
          inventory={inventory}
          currentPrices={currentPrices}
          itemCategories={itemCategories}
        />

        <StockAlertPanel inventory={inventory} />
      </div>
    </PageLayout>
  );
}
```

Add route:

```jsx
import { InventoryPage } from './pages/InventoryPage';

<Route path="/inventory" element={<InventoryPage />} />
```

Done! You now have a working inventory page.

---

## 3. Add Real Data (Progressive Enhancement)

### Option A: LocalStorage (Easiest)

```jsx
import { useState, useEffect } from 'react';

export function InventoryPage() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('evetrade_inventory');
    if (saved) {
      setInventory(JSON.parse(saved));
    }
  }, []);

  // Save when inventory changes
  const updateInventory = (newInventory) => {
    setInventory(newInventory);
    localStorage.setItem('evetrade_inventory', JSON.stringify(newInventory));
  };

  return (
    <InventoryValuation inventory={inventory} {...otherProps} />
  );
}
```

### Option B: API Integration

```jsx
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await apiClient.get('/user/inventory');
      setInventory(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <InventoryValuation inventory={inventory} {...otherProps} />
  );
}
```

### Option C: Hardcoded Test Data

```jsx
// For development/testing
const TEST_INVENTORY = [
  {
    itemId: 34,
    itemName: 'Tritanium',
    quantity: 15000,
    price: 5.5,
    buyPrice: 5.2,
    profitPerUnit: 0.3,
    category: 'Minerals',
  },
  // ... more items
];

export function InventoryPage() {
  return (
    <InventoryValuation
      inventory={TEST_INVENTORY}
      currentPrices={{ 34: 5.5 }}
      itemCategories={{ 34: 'Minerals' }}
    />
  );
}
```

---

## 4. Component Cheat Sheet

### Stock Alert Panel
```jsx
<StockAlertPanel
  inventory={[
    { itemId: 34, itemName: 'Tritanium', quantity: 15000 }
  ]}
/>
```

**Features:** Set thresholds, get notifications, visual warnings

---

### Restock Suggestions
```jsx
<RestockSuggestions
  inventory={inventory}
  salesHistory={[
    { itemId: 34, quantity: 5000, date: new Date() }
  ]}
/>
```

**Features:** Sales velocity, days remaining, recommended quantities, ISK needed

---

### Dead Stock Identifier
```jsx
<DeadStockIdentifier
  inventory={inventory}
  salesHistory={salesHistory}
  currentPrices={{ 34: 5.5, 35: 12.0 }}
/>
```

**Features:** Finds unsold items, calculates opportunity cost, suggests actions

---

### Inventory Valuation
```jsx
<InventoryValuation
  inventory={inventory}
  currentPrices={currentPrices}
  itemCategories={{ 34: 'Minerals', 35: 'Minerals' }}
/>
```

**Features:** Total value, pie chart, category breakdown, historical tracking

---

## 5. Common Patterns

### All Four Components Together

```jsx
<div className="space-y-6">
  <InventoryValuation {...props} />

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <StockAlertPanel {...props} />
    <RestockSuggestions {...props} />
  </div>

  <DeadStockIdentifier {...props} />
</div>
```

### As Dashboard Widgets

```jsx
<div className="grid grid-cols-3 gap-4">
  <InventoryValuation {...props} />
  <StockAlertPanel {...props} />
  <RestockSuggestions {...props} />
</div>
```

### In a Modal

```jsx
const [showInventory, setShowInventory] = useState(false);

<button onClick={() => setShowInventory(true)}>View Inventory</button>

{showInventory && (
  <div className="fixed inset-0 bg-black/50 p-8">
    <div className="max-w-4xl mx-auto">
      <InventoryValuation {...props} />
    </div>
  </div>
)}
```

---

## 6. Troubleshooting

### Components not showing up?

Check imports:
```jsx
import { InventoryValuation } from './components/inventory';
// or
import { InventoryValuation } from './components/inventory/InventoryValuation';
```

### Empty state showing?

Make sure you're passing data:
```jsx
// ❌ Wrong
<InventoryValuation />

// ✅ Correct
<InventoryValuation
  inventory={myInventory}
  currentPrices={prices}
  itemCategories={categories}
/>
```

### Notifications not working?

Request permission:
```jsx
import { useStockAlerts } from './hooks/useStockAlerts';

const { requestNotificationPermission } = useStockAlerts();

// Call this on user action
<button onClick={requestNotificationPermission}>
  Enable Notifications
</button>
```

### Styles look wrong?

Ensure Tailwind is configured:
```js
// tailwind.config.js should include:
content: ["./src/**/*.{js,jsx}"]
```

---

## 7. Next Steps

Now that you have the basics:

1. **Explore the Demo** - `/inventory-demo` to see all features
2. **Read the Docs** - `README.md` for full API reference
3. **Check Integration Guide** - `INTEGRATION.md` for advanced patterns
4. **View Component Map** - `COMPONENT_MAP.md` for architecture
5. **Customize** - Adjust styling, add features, integrate with your data

---

## Need Help?

1. **Demo not working?** - Check console for errors
2. **Data format issues?** - See README.md for required formats
3. **Styling problems?** - Ensure Tailwind config is correct
4. **Integration questions?** - Read INTEGRATION.md
5. **Still stuck?** - Open an issue on GitHub

---

## Quick Win Ideas

### 5-Minute Wins
- ✅ Add demo page to navigation
- ✅ Try each component with sample data
- ✅ Customize colors/styling

### 15-Minute Wins
- ✅ Create real inventory page
- ✅ Load data from localStorage
- ✅ Set up stock alerts

### 1-Hour Wins
- ✅ Integrate with trading results
- ✅ Add API data loading
- ✅ Implement sales tracking
- ✅ Add to dashboard

### Weekend Project
- ✅ Full ESI API integration
- ✅ Multi-character support
- ✅ Advanced analytics
- ✅ Email/webhook notifications

---

## Remember

- Start with the **demo page** to understand features
- Use **sample data** initially
- Add **real data** progressively
- **Customize** to match your needs
- Check **documentation** for details

Happy trading! o7
