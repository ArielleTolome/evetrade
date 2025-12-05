import React from 'react';
import Breadcrumb from './Breadcrumb';

const BreadcrumbExample = () => {
  const items = [
    { label: 'Station Trading', path: '/station-trading' },
    { label: 'Item Details', path: '/station-trading/item/123' },
    { label: 'Trade Analysis' },
  ];

  const longItems = [
    { label: 'Region', path: '/region' },
    { label: 'Constellation', path: '/constellation' },
    { label: 'System', path: '/system' },
    { label: 'Station', path: '/station' },
    { label: 'Item', path: '/item' },
    { label: 'Details' },
  ];

  return (
    <div className="p-4 space-y-4 bg-space-dark">
      <h2 className="text-white">Short Breadcrumb</h2>
      <Breadcrumb items={items} />
      <h2 className="text-white">Long Breadcrumb (for mobile truncation)</h2>
      <Breadcrumb items={longItems} />
      <h2 className="text-white">Single Item</h2>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <h2 className="text-white">Empty</h2>
      <Breadcrumb items={[]} />
    </div>
  );
};

export default BreadcrumbExample;
