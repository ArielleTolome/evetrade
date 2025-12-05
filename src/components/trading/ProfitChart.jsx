import React, { useMemo } from 'react';
import { formatISK, formatNumber } from '../../utils/formatters';

/**
 * A simple SVG chart to visualize profit curves for trade scenarios.
 */
export function ProfitChart({ scenarios }) {
  const chartData = useMemo(() => {
    if (!scenarios || scenarios.length === 0) return null;

    const dataPoints = 20;
    const maxVolatility = Math.max(...scenarios.map(s => s.volatility)) || 10;

    const chartScenarios = scenarios.map(scenario => {
      const { buyPrice, quantity, salesTax, brokerFee, breakEven, sellPrice } = scenario;
      const points = [];
      const priceRange = sellPrice * (maxVolatility / 100) * 2;
      const priceStep = priceRange / dataPoints;
      const startPrice = sellPrice - priceRange / 2;

      for (let i = 0; i <= dataPoints; i++) {
        const currentSellPrice = startPrice + i * priceStep;
        const totalSellRevenue = currentSellPrice * quantity;
        const totalBuyCost = buyPrice * quantity;
        const brokerFeeCost = (totalBuyCost + totalSellRevenue) * (brokerFee / 100);
        const salesTaxCost = totalSellRevenue * (salesTax / 100);
        const profit = totalSellRevenue - totalBuyCost - (brokerFeeCost + salesTaxCost);
        points.push({ x: currentSellPrice, y: profit });
      }
      return { ...scenario, points };
    });

    const allProfits = chartScenarios.flatMap(s => s.points.map(p => p.y));
    const allPrices = chartScenarios.flatMap(s => s.points.map(p => p.x));

    const minY = Math.min(...allProfits);
    const maxY = Math.max(...allProfits);
    const minX = Math.min(...allPrices);
    const maxX = Math.max(...allPrices);

    return { scenarios: chartScenarios, minY, maxY, minX, maxX };
  }, [scenarios]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64 bg-space-dark/30 rounded-lg">
        <p className="text-text-secondary">Add a scenario to see profit analysis.</p>
      </div>
    );
  }

  const { scenarios: chartScenarios, minY, maxY, minX, maxX } = chartData;
  const width = 500;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  const xScale = (x) => padding.left + ((x - minX) / (maxX - minX)) * (width - padding.left - padding.right);
  const yScale = (y) => padding.top + ((maxY - y) / (maxY - minY)) * (height - padding.top - padding.bottom);

  const colors = ['#00FFFF', '#FFD700', '#FF69B4', '#00FF7F', '#FFA500'];

  return (
    <div className="p-4 bg-space-dark/30 rounded-lg border border-white/10">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-axis grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = minY + (i * (maxY - minY)) / 4;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={yScale(y)}
                x2={width - padding.right}
                y2={yScale(y)}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={yScale(y)}
                dy="0.32em"
                textAnchor="end"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="10"
              >
                {formatISK(y, false)}
              </text>
            </g>
          );
        })}

        {/* X-axis grid lines */}
        {[...Array(5)].map((_, i) => {
          const x = minX + (i * (maxX - minX)) / 4;
          return (
            <g key={i}>
              <line
                x1={xScale(x)}
                y1={padding.top}
                x2={xScale(x)}
                y2={height - padding.bottom}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
              <text
                x={xScale(x)}
                y={height - padding.bottom + 15}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="10"
              >
                {formatISK(x, false)}
              </text>
            </g>
          );
        })}

        {/* Break-even line */}
        <line
          x1={padding.left}
          y1={yScale(0)}
          x2={width - padding.right}
          y2={yScale(0)}
          strokeDasharray="4 2"
          stroke="rgba(255, 165, 0, 0.6)"
          strokeWidth="1.5"
        />
        <text
            x={padding.left + 5}
            y={yScale(0) - 5}
            fill="rgba(255, 165, 0, 0.8)"
            fontSize="10"
          >
            Break-even
          </text>

        {/* Profit curves */}
        {chartScenarios.map((scenario, index) => (
          <path
            key={scenario.id}
            d={`M${scenario.points.map(p => `${xScale(p.x)},${yScale(p.y)}`).join(' L')}`}
            fill="none"
            stroke={colors[index % colors.length]}
            strokeWidth="2"
          />
        ))}

        {/* Axis labels */}
        <text x={width/2} y={height - 5} textAnchor="middle" fill="#aaa" fontSize="12">Sell Price</text>
        <text transform={`translate(15, ${height/2}) rotate(-90)`} textAnchor="middle" fill="#aaa" fontSize="12">Profit</text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {chartScenarios.map((scenario, index) => (
          <div key={scenario.id} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="text-text-secondary">
              Scenario {index + 1} (BE: {formatISK(scenario.breakEven, false)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
