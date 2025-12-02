/**
 * Skeleton Components - Usage Examples
 * Comprehensive examples of all skeleton loading components
 */

import {
  Skeleton,
  SkeletonText,
  SkeletonParagraph,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonStat,
  SkeletonList,
  SkeletonForm,
  SkeletonDashboard,
  SkeletonPage,
  SkeletonTradingPage,
  SkeletonGrid,
  SkeletonTabs,
  SkeletonHeader,
  SkeletonModal,
} from './Skeleton';

export function SkeletonExamples() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <h1 className="text-3xl font-display font-bold">Skeleton Loading Components</h1>

      {/* Base Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Base Skeleton</h2>
        <div className="glass p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Default rectangle with shimmer</p>
            <Skeleton width={200} height={20} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Circle with pulse animation</p>
            <Skeleton circle size={40} animation="pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Custom width and height</p>
            <Skeleton width="75%" height={60} rounded="xl" />
          </div>
        </div>
      </section>

      {/* Text Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Text Components</h2>
        <div className="glass p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Single line text</p>
            <SkeletonText width="60%" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Paragraph (3 lines)</p>
            <SkeletonParagraph lines={3} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Paragraph (5 lines)</p>
            <SkeletonParagraph lines={5} />
          </div>
        </div>
      </section>

      {/* Avatar Sizes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Avatar Sizes</h2>
        <div className="glass p-6">
          <div className="flex items-center gap-6">
            <div className="text-center space-y-2">
              <SkeletonAvatar size="xs" />
              <p className="text-xs text-text-secondary">XS</p>
            </div>
            <div className="text-center space-y-2">
              <SkeletonAvatar size="sm" />
              <p className="text-xs text-text-secondary">SM</p>
            </div>
            <div className="text-center space-y-2">
              <SkeletonAvatar size="md" />
              <p className="text-xs text-text-secondary">MD</p>
            </div>
            <div className="text-center space-y-2">
              <SkeletonAvatar size="lg" />
              <p className="text-xs text-text-secondary">LG</p>
            </div>
            <div className="text-center space-y-2">
              <SkeletonAvatar size="xl" />
              <p className="text-xs text-text-secondary">XL</p>
            </div>
            <div className="text-center space-y-2">
              <SkeletonAvatar size="2xl" />
              <p className="text-xs text-text-secondary">2XL</p>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Buttons</h2>
        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <SkeletonButton size="sm" />
            <SkeletonButton size="md" />
            <SkeletonButton size="lg" />
            <SkeletonButton size="md" fullWidth className="max-w-xs" />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Cards</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Default card</p>
            <SkeletonCard />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Custom card content</p>
            <SkeletonCard>
              <div className="flex items-center gap-4">
                <SkeletonAvatar size="lg" />
                <div className="flex-1 space-y-2">
                  <SkeletonText width="70%" />
                  <SkeletonText width="50%" />
                </div>
              </div>
            </SkeletonCard>
          </div>
        </div>
      </section>

      {/* Tables */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Tables</h2>
        <div className="glass p-6">
          <SkeletonTable rows={5} columns={6} />
        </div>
      </section>

      {/* Charts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Charts</h2>
        <div className="glass p-6">
          <SkeletonChart height={300} showLegend={true} />
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Stat Cards</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
      </section>

      {/* Lists */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Lists</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Simple list</p>
            <SkeletonList items={3} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">List with avatars</p>
            <SkeletonList items={3} withAvatar={true} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">List with actions</p>
            <SkeletonList items={3} withActions={true} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Full featured list</p>
            <SkeletonList items={3} withAvatar={true} withActions={true} />
          </div>
        </div>
      </section>

      {/* Forms */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Forms</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Single column form</p>
            <SkeletonForm fields={4} columns={1} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Two column form</p>
            <SkeletonForm fields={6} columns={2} />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Grid Layouts</h2>
        <SkeletonGrid items={6} columns={3} />
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Tabs</h2>
        <div className="glass p-6">
          <SkeletonTabs tabs={3} />
        </div>
      </section>

      {/* Header */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Page Headers</h2>
        <div className="glass p-6 space-y-8">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">With breadcrumbs</p>
            <SkeletonHeader showBreadcrumbs={true} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Without breadcrumbs</p>
            <SkeletonHeader showBreadcrumbs={false} />
          </div>
        </div>
      </section>

      {/* Modal */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Modal Dialog</h2>
        <SkeletonModal />
      </section>

      {/* Page Patterns */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Full Page Patterns</h2>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            These are comprehensive page-level skeleton loaders. View them individually:
          </p>
          <div className="flex gap-4">
            <button className="btn-primary">View SkeletonDashboard</button>
            <button className="btn-primary">View SkeletonPage</button>
            <button className="btn-primary">View SkeletonTradingPage</button>
          </div>
        </div>
      </section>

      {/* Animation Comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Animation Types</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6 space-y-4">
            <p className="text-sm text-text-secondary font-semibold">Shimmer (default)</p>
            <SkeletonCard animation="shimmer" />
          </div>
          <div className="glass p-6 space-y-4">
            <p className="text-sm text-text-secondary font-semibold">Pulse</p>
            <SkeletonCard animation="pulse" />
          </div>
        </div>
      </section>

      {/* Usage in Real Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Usage in Components</h2>
        <div className="glass p-6 space-y-4">
          <p className="text-sm text-text-secondary">
            Example of how to use skeletons in your components:
          </p>
          <pre className="bg-space-dark p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-accent-cyan">{`import { SkeletonCard, SkeletonTable } from '@/components/common';

function MyComponent() {
  const { data, loading } = useApiCall();

  if (loading) {
    return <SkeletonCard />;
  }

  return <DataDisplay data={data} />;
}

// Or for tables:
function TradingResults() {
  const { data, loading } = useTradingData();

  if (loading) {
    return (
      <div className="glass p-6">
        <SkeletonTable rows={10} columns={8} />
      </div>
    );
  }

  return <TradingTable data={data} />;
}

// Full page pattern:
function StationTradingPage() {
  const { loading } = usePageData();

  if (loading) {
    return <SkeletonTradingPage />;
  }

  return <TradingPageContent />;
}`}</code>
          </pre>
        </div>
      </section>

      {/* API Reference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">API Reference</h2>
        <div className="glass p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-accent-cyan">Base Skeleton Props</h3>
            <pre className="bg-space-dark p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{`{
  width?: number | string,      // Width in px or CSS value
  height?: number | string,      // Height in px or CSS value
  circle?: boolean,              // Render as circle
  size?: number | string,        // Size for circle variant
  animation?: 'shimmer' | 'pulse', // Animation type (default: 'shimmer')
  variant?: 'default' | 'text' | 'title' | 'subtitle' | 'button' | 'input' | 'card' | 'avatar',
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full',
  className?: string             // Additional CSS classes
}`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-accent-cyan">Component-Specific Props</h3>
            <pre className="bg-space-dark p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{`// SkeletonText
{ width?: string, animation?: string, className?: string }

// SkeletonParagraph
{ lines?: number, animation?: string, className?: string }

// SkeletonAvatar
{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', animation?: string, className?: string }

// SkeletonButton
{ size?: 'sm' | 'md' | 'lg', fullWidth?: boolean, animation?: string, className?: string }

// SkeletonTable
{ rows?: number, columns?: number, showHeader?: boolean, animation?: string, className?: string }

// SkeletonChart
{ height?: number, showLegend?: boolean, animation?: string, className?: string }

// SkeletonList
{ items?: number, withAvatar?: boolean, withActions?: boolean, animation?: string, className?: string }

// SkeletonForm
{ fields?: number, columns?: 1 | 2 | 3, showSubmit?: boolean, animation?: string, className?: string }

// SkeletonGrid
{ items?: number, columns?: 1 | 2 | 3 | 4, animation?: string, className?: string }

// SkeletonTabs
{ tabs?: number, animation?: string, className?: string }

// SkeletonHeader
{ showBreadcrumbs?: boolean, animation?: string, className?: string }`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

// Individual page pattern examples for demonstration
export function SkeletonDashboardExample() {
  return <SkeletonDashboard />;
}

export function SkeletonPageExample() {
  return <SkeletonPage />;
}

export function SkeletonTradingPageExample() {
  return <SkeletonTradingPage />;
}

export default SkeletonExamples;
