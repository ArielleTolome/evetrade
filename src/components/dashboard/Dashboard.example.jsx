/**
 * Dashboard Widgets Example
 * Demonstrates all dashboard components with various configurations
 */
import {
  StatCard,
  MiniChart,
  ProgressRing,
  DataCard,
  QuickActions,
  ActivityFeed,
  ProgressRingGroup,
  QuickActionsGroup,
  ActivityFeedCompact,
} from './index';

export function DashboardExample() {
  // Sample data
  const sparklineData = [120, 150, 140, 180, 170, 200, 190, 220];
  const chartData = [
    { value: 1200, label: 'Mon' },
    { value: 1900, label: 'Tue' },
    { value: 1500, label: 'Wed' },
    { value: 2200, label: 'Thu' },
    { value: 1800, label: 'Fri' },
    { value: 2500, label: 'Sat' },
    { value: 2100, label: 'Sun' },
  ];

  const activities = [
    {
      id: 1,
      type: 'profit',
      title: 'High profit trade executed',
      description: 'Tritanium sold for 15.2M ISK profit',
      timestamp: Date.now() - 5 * 60 * 1000,
      link: '#trade-1',
      metadata: { margin: '23%', volume: '150' },
    },
    {
      id: 2,
      type: 'alert',
      title: 'Price alert triggered',
      description: 'PLEX price dropped below threshold',
      timestamp: Date.now() - 15 * 60 * 1000,
    },
    {
      id: 3,
      type: 'trade',
      title: 'Station trading opportunity',
      description: '5 new trades found in Jita',
      timestamp: Date.now() - 45 * 60 * 1000,
    },
    {
      id: 4,
      type: 'warning',
      title: 'Low volume detected',
      description: 'Megacyte showing unusual low volume',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
    },
  ];

  const quickActions = [
    {
      id: 'station',
      label: 'Station Trading',
      icon: '🏪',
      onClick: () => console.log('Station trading'),
      shortcut: 'Alt+S',
      color: 'cyan',
    },
    {
      id: 'hauling',
      label: 'Region Hauling',
      icon: '🚀',
      onClick: () => console.log('Region hauling'),
      shortcut: 'Alt+H',
      color: 'gold',
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: '👁️',
      onClick: () => console.log('Watchlist'),
      shortcut: 'Alt+W',
      color: 'purple',
    },
    {
      id: 'alerts',
      label: 'Price Alerts',
      icon: '🔔',
      onClick: () => console.log('Alerts'),
      shortcut: 'Alt+A',
      color: 'green',
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: '📊',
      onClick: () => console.log('Export'),
      shortcut: 'Ctrl+E',
      color: 'default',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      onClick: () => console.log('Settings'),
      shortcut: 'Alt+,',
      color: 'default',
    },
  ];

  return (
    <div className="min-h-screen bg-space-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-cyan mb-2">
            Dashboard Widgets Example
          </h1>
          <p className="text-text-secondary">
            All dashboard components with various configurations
          </p>
        </div>

        {/* Stat Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Stat Cards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Profit"
              value={15234567}
              format="isk"
              icon="💰"
              variant="green"
              trend={{ direction: 'up', value: 12.5 }}
              description="Last 7 days"
            />
            <StatCard
              label="Active Trades"
              value={234}
              format="number"
              icon="📊"
              variant="cyan"
              sparklineData={sparklineData}
            />
            <StatCard
              label="Avg Margin"
              value={18.5}
              format="percent"
              icon="📈"
              variant="gold"
              trend={{ direction: 'down', value: 2.3 }}
            />
            <StatCard
              label="Success Rate"
              value={87}
              format="percent"
              icon="✅"
              variant="purple"
              onClick={() => console.log('Clicked')}
              description="Click for details"
            />
          </div>
        </section>

        {/* Mini Charts */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Mini Charts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DataCard title="Line Chart" variant="cyan">
              <MiniChart
                data={chartData}
                type="line"
                color="cyan"
                height="h-32"
                formatValue={(v) => `${v.toLocaleString()} ISK`}
              />
            </DataCard>
            <DataCard title="Area Chart" variant="green">
              <MiniChart
                data={chartData}
                type="area"
                color="green"
                height="h-32"
              />
            </DataCard>
            <DataCard title="Bar Chart" variant="purple">
              <MiniChart
                data={chartData}
                type="bar"
                color="purple"
                height="h-32"
              />
            </DataCard>
          </div>
        </section>

        {/* Progress Rings */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Progress Rings
          </h2>
          <DataCard>
            <ProgressRingGroup
              rings={[
                {
                  percentage: 75,
                  size: 'lg',
                  color: 'cyan',
                  label: 'Trades Completed',
                },
                {
                  percentage: 92,
                  size: 'lg',
                  color: 'green',
                  label: 'Profit Target',
                },
                {
                  percentage: 45,
                  size: 'lg',
                  color: 'gold',
                  label: 'Orders Filled',
                },
                {
                  percentage: 100,
                  size: 'lg',
                  color: 'purple',
                  label: 'System Health',
                  centerContent: '✓',
                },
              ]}
            />
          </DataCard>
        </section>

        {/* Data Cards */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Data Cards
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DataCard
              title="Collapsible Card"
              subtitle="Click the arrow to collapse"
              collapsible
              defaultCollapsed={false}
              variant="cyan"
            >
              <p className="text-text-secondary">
                This is a collapsible data card with full content that can be
                hidden or shown.
              </p>
            </DataCard>

            <DataCard
              title="Refreshable Card"
              subtitle="With refresh button"
              refreshable
              onRefresh={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                console.log('Refreshed!');
              }}
              variant="green"
              footer={
                <div className="text-xs text-text-muted">
                  Last updated: Just now
                </div>
              }
            >
              <p className="text-text-secondary">
                Click the refresh button in the header to reload data.
              </p>
            </DataCard>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Quick Actions
          </h2>
          <DataCard title="Action Panel" subtitle="Common trading operations">
            <QuickActions
              actions={quickActions}
              columns={3}
              size="md"
              showShortcuts={true}
            />
          </DataCard>
        </section>

        {/* Quick Actions Groups */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Action Groups
          </h2>
          <QuickActionsGroup
            groups={[
              {
                title: 'Trading',
                actions: quickActions.slice(0, 2),
                columns: 2,
              },
              {
                title: 'Management',
                actions: quickActions.slice(2),
                columns: 4,
                size: 'sm',
              },
            ]}
          />
        </section>

        {/* Activity Feed */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Activity Feed
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DataCard
                title="Recent Activity"
                subtitle="All trading activities"
                variant="cyan"
              >
                <ActivityFeed
                  activities={activities}
                  pageSize={3}
                  showLoadMore={true}
                  hasMore={true}
                  onLoadMore={() => console.log('Load more')}
                />
              </DataCard>
            </div>
            <DataCard title="Quick View" subtitle="Latest updates">
              <ActivityFeedCompact activities={activities} maxItems={5} />
            </DataCard>
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Loading & Error States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCard title="Loading State" loading={true}>
              This content is loading...
            </DataCard>
            <DataCard
              title="Error State"
              error={true}
              errorMessage="Failed to load trading data"
              onRetry={() => console.log('Retry')}
            >
              This content failed to load.
            </DataCard>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardExample;
