import React, { useState } from 'react';
import { Badge, StatusBadge, BadgeGroup } from './Badge';

/**
 * Badge Integration Examples
 * Real-world usage examples showing how to integrate badges into EVETrade components
 */

/**
 * Example 1: Trading Table with Status and Category Badges
 */
export function TradingTableExample() {
  const tradeData = [
    {
      id: 1,
      item: 'Tritanium',
      profit: 125000,
      volume: 15000,
      margin: 8.5,
      status: 'active',
      tags: ['High Volume', 'Minerals'],
      isHotDeal: true,
    },
    {
      id: 2,
      item: 'PLEX',
      profit: 2500000,
      volume: 50,
      margin: 3.2,
      status: 'pending',
      tags: ['Premium', 'Trending'],
      isHotDeal: false,
    },
    {
      id: 3,
      item: 'Antimatter Charge L',
      profit: 45000,
      volume: 5000,
      margin: 12.1,
      status: 'completed',
      tags: ['Ammunition'],
      isHotDeal: false,
    },
    {
      id: 4,
      item: 'Exotic Dancers, Male',
      profit: 1200,
      volume: 200,
      margin: 15.6,
      status: 'expired',
      tags: ['Commodities'],
      isHotDeal: false,
    },
  ];

  return (
    <div className="bg-space-dark p-6 rounded-lg">
      <h2 className="text-2xl font-display text-white mb-4">Active Trades</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-accent-cyan/20">
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Item</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Status</th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium">Profit</th>
              <th className="text-right py-3 px-4 text-text-secondary font-medium">Margin</th>
              <th className="text-left py-3 px-4 text-text-secondary font-medium">Tags</th>
            </tr>
          </thead>
          <tbody>
            {tradeData.map((trade) => (
              <tr key={trade.id} className="border-b border-space-light hover:bg-space-light/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary">{trade.item}</span>
                    {trade.isHotDeal && (
                      <Badge size="xs" color="gold" pill>
                        Hot
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={trade.status} size="xs" />
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-green-400 font-mono">
                    {trade.profit.toLocaleString()} ISK
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge
                    size="xs"
                    color={trade.margin > 10 ? 'green' : trade.margin > 5 ? 'gold' : 'gray'}
                    variant="subtle"
                  >
                    {trade.margin.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <BadgeGroup>
                    {trade.tags.map((tag, idx) => (
                      <Badge key={idx} size="xs" color="purple" variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </BadgeGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Example 2: Market Order Card with Live Status
 */
export function MarketOrderCard({ order }) {
  const getVolumeColor = (percentFilled) => {
    if (percentFilled >= 80) return 'green';
    if (percentFilled >= 50) return 'cyan';
    if (percentFilled >= 20) return 'gold';
    return 'red';
  };

  const percentFilled = (order.volumeFilled / order.volumeTotal) * 100;

  return (
    <div className="bg-space-mid border border-accent-cyan/30 rounded-lg p-4 hover:border-accent-cyan/60 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-display text-lg">{order.itemName}</h3>
          <p className="text-text-secondary text-sm">{order.location}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-text-secondary text-xs mb-1">Price</p>
          <p className="text-white font-mono">{order.price.toLocaleString()} ISK</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs mb-1">Volume</p>
          <p className="text-white">
            {order.volumeFilled.toLocaleString()} / {order.volumeTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Badges */}
      <BadgeGroup>
        <Badge size="xs" color={order.orderType === 'buy' ? 'green' : 'red'} variant="outline">
          {order.orderType.toUpperCase()}
        </Badge>
        <Badge size="xs" color={getVolumeColor(percentFilled)} variant="subtle" dot>
          {percentFilled.toFixed(0)}% Filled
        </Badge>
        {order.isCompetitive && (
          <Badge size="xs" color="gold" dot pulse>
            Competitive
          </Badge>
        )}
      </BadgeGroup>
    </div>
  );
}

/**
 * Example 3: Filter Bar with Removable Tags
 */
export function FilterBar() {
  const [activeFilters, setActiveFilters] = useState([
    { id: 1, label: 'High Profit', color: 'green' },
    { id: 2, label: 'Low Risk', color: 'cyan' },
    { id: 3, label: 'Ships', color: 'purple' },
  ]);

  const removeFilter = (id) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setActiveFilters([]);
  };

  return (
    <div className="bg-space-mid border border-accent-cyan/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-display">Active Filters</h3>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="text-text-secondary hover:text-white text-sm transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {activeFilters.length > 0 ? (
        <BadgeGroup>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              color={filter.color}
              variant="solid"
              size="sm"
              onRemove={() => removeFilter(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </BadgeGroup>
      ) : (
        <p className="text-text-secondary text-sm">No active filters</p>
      )}
    </div>
  );
}

/**
 * Example 4: Trade Route Preview with Multi-Status
 */
export function TradeRoutePreview({ route }) {
  const getSecurityBadge = (security) => {
    if (security >= 0.5) return { color: 'green', label: 'High Sec' };
    if (security > 0.0) return { color: 'gold', label: 'Low Sec' };
    return { color: 'red', label: 'Null Sec' };
  };

  const fromSec = getSecurityBadge(route.fromSecurity);
  const toSec = getSecurityBadge(route.toSecurity);

  return (
    <div className="bg-space-mid border border-accent-cyan/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-display">
          {route.fromStation} → {route.toStation}
        </h3>
        {route.isActive && (
          <Badge dot pulse color="green" size="sm">
            Live
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-text-secondary text-xs mb-2">From</p>
          <BadgeGroup>
            <Badge size="xs" color={fromSec.color} variant="solid">
              {fromSec.label}
            </Badge>
            <Badge size="xs" color="cyan" variant="outline">
              {route.fromRegion}
            </Badge>
          </BadgeGroup>
        </div>
        <div>
          <p className="text-text-secondary text-xs mb-2">To</p>
          <BadgeGroup>
            <Badge size="xs" color={toSec.color} variant="solid">
              {toSec.label}
            </Badge>
            <Badge size="xs" color="cyan" variant="outline">
              {route.toRegion}
            </Badge>
          </BadgeGroup>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">Jumps:</span>
          <Badge size="xs" color="gray" variant="subtle">
            {route.jumps}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">Profit:</span>
          <Badge size="xs" color="green" variant="solid">
            {route.profit.toLocaleString()} ISK
          </Badge>
        </div>
      </div>
    </div>
  );
}

/**
 * Combined Demo
 */
export default function BadgeIntegrationDemo() {
  const sampleOrder = {
    itemName: 'Tritanium',
    location: 'Jita IV - Moon 4',
    price: 5.67,
    volumeFilled: 750000,
    volumeTotal: 1000000,
    status: 'active',
    orderType: 'buy',
    isCompetitive: true,
  };

  const sampleRoute = {
    fromStation: 'Jita IV - Moon 4',
    toStation: 'Amarr VIII (Oris)',
    fromSecurity: 1.0,
    toSecurity: 1.0,
    fromRegion: 'The Forge',
    toRegion: 'Domain',
    jumps: 12,
    profit: 2500000,
    isActive: true,
  };

  return (
    <div className="min-h-screen bg-space-black p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-display text-white mb-2">Badge Integration Examples</h1>
          <p className="text-text-secondary">
            Real-world examples of Badge components in EVETrade UI
          </p>
        </div>

        {/* Trading Table */}
        <TradingTableExample />

        {/* Order Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-display text-white mb-4">Market Order Card</h2>
            <MarketOrderCard order={sampleOrder} />
          </div>

          <div>
            <h2 className="text-xl font-display text-white mb-4">Trade Route Preview</h2>
            <TradeRoutePreview route={sampleRoute} />
          </div>
        </div>

        {/* Filter Bar */}
        <div>
          <h2 className="text-xl font-display text-white mb-4">Filter Management</h2>
          <FilterBar />
        </div>
      </div>
    </div>
  );
}
