import { useState, useMemo, useEffect } from 'react';
import { GlassmorphicCard } from '../common/GlassmorphicCard';
import { formatNumber, formatISK, formatPercent } from '../../utils/formatters';

/**
 * Inventory Valuation Component
 * Calculates total inventory value and tracks changes over time
 */
export function InventoryValuation({
  inventory = [],
  currentPrices = {},
  itemCategories = {},
  className = '',
}) {
  const [showChart, setShowChart] = useState(true);
  const [valuationHistory, setValuationHistory] = useState(() => {
    const saved = localStorage.getItem('evetrade_valuation_history');
    return saved ? JSON.parse(saved) : [];
  });

  /**
   * Calculate current inventory value
   */
  const currentValuation = useMemo(() => {
    if (!inventory.length) return { total: 0, items: 0, byCategory: {} };

    let total = 0;
    const byCategory = {};

    inventory.forEach(item => {
      const price = currentPrices[item.itemId] || item.price || item.buyPrice || 0;
      const value = (item.quantity || 0) * price;
      total += value;

      // Categorize by item category
      const category = itemCategories[item.itemId] || item.category || 'Uncategorized';
      if (!byCategory[category]) {
        byCategory[category] = {
          value: 0,
          items: 0,
          itemsList: [],
        };
      }

      byCategory[category].value += value;
      byCategory[category].items += 1;
      byCategory[category].itemsList.push({
        itemId: item.itemId,
        itemName: item.itemName,
        value,
        quantity: item.quantity,
        price,
      });
    });

    return {
      total,
      items: inventory.length,
      byCategory,
    };
  }, [inventory, currentPrices, itemCategories]);

  /**
   * Save valuation snapshot to history
   */
  useEffect(() => {
    if (currentValuation.total > 0) {
      const now = new Date().toISOString();

      // Only save if value has changed or it's been more than 1 hour
      const lastSnapshot = valuationHistory[valuationHistory.length - 1];
      const oneHour = 60 * 60 * 1000;

      const shouldSave =
        !lastSnapshot ||
        Math.abs(lastSnapshot.total - currentValuation.total) > currentValuation.total * 0.01 || // 1% change
        new Date() - new Date(lastSnapshot.timestamp) > oneHour;

      if (shouldSave) {
        const newHistory = [
          ...valuationHistory.slice(-99), // Keep last 100 snapshots
          {
            timestamp: now,
            total: currentValuation.total,
            items: currentValuation.items,
          },
        ];

        setValuationHistory(newHistory);
        localStorage.setItem('evetrade_valuation_history', JSON.stringify(newHistory));
      }
    }
  }, [currentValuation]);

  /**
   * Calculate value change over time
   */
  const valueChange = useMemo(() => {
    if (valuationHistory.length < 2) return null;

    const current = currentValuation.total;
    const previous = valuationHistory[valuationHistory.length - 2].total;
    const change = current - previous;
    const percentChange = previous > 0 ? change / previous : 0;

    return {
      change,
      percentChange,
      isPositive: change >= 0,
    };
  }, [currentValuation, valuationHistory]);

  /**
   * Prepare category data for chart
   */
  const categoryData = useMemo(() => {
    const categories = Object.entries(currentValuation.byCategory)
      .map(([name, data]) => ({
        name,
        value: data.value,
        percentage: (data.value / currentValuation.total) * 100,
        items: data.items,
        itemsList: data.itemsList,
      }))
      .sort((a, b) => b.value - a.value);

    return categories;
  }, [currentValuation]);

  /**
   * Generate chart colors
   */
  const chartColors = [
    '#00d4ff', // accent-cyan
    '#ffd700', // accent-gold
    '#8b5cf6', // accent-purple
    '#2fefef', // sec-10
    '#48f048', // sec-09
    '#00ef47', // sec-08
    '#f06000', // sec-03
    '#d77700', // sec-04
  ];

  /**
   * Simple pie chart component
   */
  const PieChart = ({ data, size = 300 }) => {
    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;
    const chartRadius = radius * 0.8;

    let currentAngle = -90; // Start at top

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform rotate-0">
          {data.map((category, index) => {
            const percentage = category.percentage;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            // Calculate arc path
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + chartRadius * Math.cos(startRad);
            const y1 = centerY + chartRadius * Math.sin(startRad);
            const x2 = centerX + chartRadius * Math.cos(endRad);
            const y2 = centerY + chartRadius * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${chartRadius} ${chartRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
              'Z',
            ].join(' ');

            currentAngle = endAngle;

            return (
              <path
                key={category.name}
                d={pathData}
                fill={chartColors[index % chartColors.length]}
                opacity="0.8"
                stroke="#0a0a0f"
                strokeWidth="2"
                className="transition-opacity hover:opacity-100 cursor-pointer"
                title={`${category.name}: ${formatPercent(category.percentage / 100)}`}
              />
            );
          })}

          {/* Center circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r={chartRadius * 0.5}
            fill="#0a0a0f"
            stroke="#00d4ff"
            strokeWidth="2"
          />

          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="14"
            fontWeight="bold"
          >
            Total Value
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            fill="#00d4ff"
            fontSize="12"
          >
            {formatISK(currentValuation.total)}
          </text>
        </svg>
      </div>
    );
  };

  /**
   * Export valuation report
   */
  const exportReport = () => {
    const now = new Date().toISOString().split('T')[0];

    const categoryReport = categoryData.map(cat => [
      cat.name,
      cat.items,
      cat.value.toFixed(2),
      cat.percentage.toFixed(2) + '%',
    ]);

    const itemReport = inventory.map(item => {
      const price = currentPrices[item.itemId] || item.price || item.buyPrice || 0;
      const value = (item.quantity || 0) * price;
      const category = itemCategories[item.itemId] || item.category || 'Uncategorized';

      return [
        item.itemName,
        category,
        item.quantity,
        price.toFixed(2),
        value.toFixed(2),
      ];
    });

    const csv = [
      ['Inventory Valuation Report - ' + now],
      [],
      ['Summary'],
      ['Total Value', currentValuation.total.toFixed(2)],
      ['Total Items', currentValuation.items],
      ['Categories', Object.keys(currentValuation.byCategory).length],
      [],
      ['By Category'],
      ['Category', 'Items', 'Total Value', 'Percentage'],
      ...categoryReport,
      [],
      ['Detailed Items'],
      ['Item Name', 'Category', 'Quantity', 'Price', 'Total Value'],
      ...itemReport,
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-valuation-${now}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Empty state
  if (inventory.length === 0) {
    return (
      <GlassmorphicCard className={className}>
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-text-secondary">No inventory data available</p>
        </div>
      </GlassmorphicCard>
    );
  }

  return (
    <GlassmorphicCard className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Inventory Valuation
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Current portfolio value and breakdown
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Total Value</div>
          <div className="text-2xl font-bold text-accent-cyan">
            {formatISK(currentValuation.total)}
          </div>
          {valueChange && (
            <div className={`text-sm mt-1 ${valueChange.isPositive ? 'text-accent-purple' : 'text-accent-gold'}`}>
              {valueChange.isPositive ? '+' : ''}{formatISK(valueChange.change)}
              ({valueChange.isPositive ? '+' : ''}{formatPercent(valueChange.percentChange)})
            </div>
          )}
        </div>

        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Total Items</div>
          <div className="text-2xl font-bold text-text-primary">
            {formatNumber(currentValuation.items, 0)}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            in {Object.keys(currentValuation.byCategory).length} categories
          </div>
        </div>

        <div className="p-4 bg-space-mid/30 rounded-lg border border-accent-cyan/10">
          <div className="text-sm text-text-secondary mb-1">Avg Value per Item</div>
          <div className="text-2xl font-bold text-accent-gold">
            {formatISK(currentValuation.total / currentValuation.items)}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            {valuationHistory.length} snapshots saved
          </div>
        </div>
      </div>

      {/* Chart Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Portfolio Allocation
        </h3>
        <button
          onClick={() => setShowChart(!showChart)}
          className="text-sm text-accent-cyan hover:text-accent-cyan/80"
        >
          {showChart ? 'Hide Chart' : 'Show Chart'}
        </button>
      </div>

      {/* Pie Chart */}
      {showChart && categoryData.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-6 p-6 bg-space-mid/20 rounded-lg">
          <PieChart data={categoryData} size={280} />

          {/* Legend */}
          <div className="flex-1 space-y-2 max-w-md">
            {categoryData.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-2 rounded hover:bg-space-mid/30 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <div
                    className="w-4 h-4 rounded mr-3 flex-shrink-0"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">
                      {category.name}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {category.items} items
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-semibold text-text-primary">
                    {formatPercent(category.percentage / 100)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {formatISK(category.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Category Breakdown
        </h3>

        <div className="space-y-2">
          {categoryData.map((category, index) => (
            <details key={category.name} className="group">
              <summary className="cursor-pointer p-3 bg-space-mid/30 rounded-lg border border-accent-cyan/10 hover:border-accent-cyan/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded mr-3"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="font-semibold text-text-primary">
                      {category.name}
                    </span>
                    <span className="ml-3 text-sm text-text-secondary">
                      ({category.items} items)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-accent-cyan font-semibold mr-3">
                      {formatISK(category.value)}
                    </span>
                    <span className="text-text-secondary text-sm">
                      {formatPercent(category.percentage / 100)}
                    </span>
                  </div>
                </div>
              </summary>

              <div className="mt-2 ml-6 space-y-1">
                {category.itemsList
                  .sort((a, b) => b.value - a.value)
                  .map(item => (
                    <div
                      key={item.itemId}
                      className="p-2 text-sm bg-space-dark/30 rounded border border-accent-cyan/5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary">{item.itemName}</span>
                        <span className="text-accent-cyan">
                          {formatISK(item.value)}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {formatNumber(item.quantity, 0)} units @ {formatISK(item.price)}/unit
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Valuation History */}
      {valuationHistory.length > 1 && (
        <div className="mb-6 p-4 bg-space-mid/20 rounded-lg border border-accent-cyan/10">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Value History
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {valuationHistory.slice(-4).reverse().map((snapshot, _index) => (
              <div key={snapshot.timestamp}>
                <div className="text-text-secondary text-xs">
                  {new Date(snapshot.timestamp).toLocaleDateString()}
                </div>
                <div className="text-text-primary font-semibold">
                  {formatISK(snapshot.total)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="pt-4 border-t border-accent-cyan/10">
        <button
          onClick={exportReport}
          className="w-full px-4 py-2 bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 rounded-lg hover:bg-accent-cyan/30 transition-colors"
        >
          Export Valuation Report
        </button>
      </div>
    </GlassmorphicCard>
  );
}

export default InventoryValuation;
