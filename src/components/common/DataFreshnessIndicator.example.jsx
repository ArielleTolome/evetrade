import { useState } from 'react';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';

const fiveMinutes = 1000 * 60 * 5;

const scenarios = [
  { title: 'Fresh (Just Now)', lastUpdated: new Date() },
  { title: 'Recent (10 mins ago)', lastUpdated: new Date(Date.now() - 10 * 60 * 1000) },
  { title: 'Stale (20 mins ago)', lastUpdated: new Date(Date.now() - 20 * 60 * 1000) },
  { title: 'Old (45 mins ago)', lastUpdated: new Date(Date.now() - 45 * 60 * 1000) },
  { title: 'Refreshing', lastUpdated: new Date(), isRefreshing: true },
  { title: 'Compact', lastUpdated: new Date(), compact: true },
  { title: 'Auto-Refresh (15s)', lastUpdated: new Date(), autoRefresh: true, refreshInterval: 15000 },
];

const Example = () => {
  const [refreshingScenario, setRefreshingScenario] = useState(null);

  const handleRefresh = (title) => {
    setRefreshingScenario(title);
    setTimeout(() => setRefreshingScenario(null), 2000);
  };

  return (
    <div className="p-8 bg-space-dark text-white font-body">
      <h1 className="text-2xl font-display mb-6">DataFreshnessIndicator Examples</h1>
      <div className="space-y-6">
        {scenarios.map(({ title, ...props }) => (
          <div key={title} className="p-4 rounded-lg bg-space-mid border border-space-light">
            <h2 className="text-lg font-semibold mb-3 text-accent-cyan">{title}</h2>
            <DataFreshnessIndicator
              {...props}
              isRefreshing={props.isRefreshing || refreshingScenario === title}
              onRefresh={() => handleRefresh(title)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Example;