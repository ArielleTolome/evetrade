import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const AutoBreadcrumb = () => {
  const breadcrumbs = useBreadcrumbs();
  return <Breadcrumb items={breadcrumbs} />;
};

const BreadcrumbExample = () => {
  const manualItems = [
    { label: 'Home', href: '/' },
    { label: 'Trading', href: '/trading' },
    { label: 'Station Trading', href: '/trading/station' },
    { label: 'Item Analysis', href: '/trading/station/item' },
    { label: 'Historical Data' },
  ];

  return (
    <div className="p-4 space-y-8 bg-space-dark">
      <div>
        <h2 className="text-white text-lg mb-2">Manual Breadcrumb (Collapsed)</h2>
        <Breadcrumb items={manualItems} maxItems={4} separator="chevron" />
      </div>
      <div>
        <h2 className="text-white text-lg mb-2">Auto-Generated Breadcrumb</h2>
        <MemoryRouter initialEntries={['/station-trading/item-detail/12345']}>
          <Routes>
            <Route path="*" element={<AutoBreadcrumb />} />
          </Routes>
        </MemoryRouter>
      </div>
      <div>
        <h2 className="text-white text-lg mb-2">Custom Separator</h2>
        <Breadcrumb items={manualItems.slice(0, 3)} separator=">" />
      </div>
      <div>
        <h2 className="text-white text-lg mb-2">Short Breadcrumb</h2>
        <Breadcrumb items={manualItems.slice(0, 2)} />
      </div>
    </div>
  );
};

export default BreadcrumbExample;
