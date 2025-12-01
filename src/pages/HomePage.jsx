import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { useResources } from '@hooks/useResources';

const tradingModes = [
  {
    title: 'Station Trading',
    description: 'Find profitable buy/sell margins within a single station. Perfect for traders who want to focus on market making.',
    path: '/station-trading',
    icon: '📊',
    gradient: 'from-accent-cyan to-blue-600',
  },
  {
    title: 'Station Hauling',
    description: 'Discover profitable trades between specific stations. Ideal for targeted routes with known infrastructure.',
    path: '/station-hauling',
    icon: '🚀',
    gradient: 'from-accent-gold to-orange-600',
  },
  {
    title: 'Region Hauling',
    description: 'Find the best trades across entire regions. Best for explorers seeking maximum profit opportunities.',
    path: '/region-hauling',
    icon: '🌌',
    gradient: 'from-accent-purple to-pink-600',
  },
];

/**
 * Home Page Component
 */
export function HomePage() {
  const { loading, loadingProgress } = useResources();

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">EVE</span>
            <span className="text-text-primary dark:text-text-primary text-light-text">Trade</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Maximize your ISK. Discover the most profitable trades across New Eden.
          </p>

          {/* Loading indicator */}
          {loading && (
            <div className="mt-8 flex items-center justify-center gap-3 text-text-secondary">
              <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
              <span>
                Loading resources ({loadingProgress.current}/{loadingProgress.total})...
              </span>
            </div>
          )}
        </div>

        {/* Trading Mode Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full animate-slide-up">
          {tradingModes.map((mode, index) => (
            <Link
              key={mode.path}
              to={mode.path}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-fade-in"
            >
              <GlassmorphicCard hover className="h-full group">
                {/* Icon with gradient background */}
                <div className={`
                  w-16 h-16 rounded-xl mb-6
                  bg-gradient-to-br ${mode.gradient}
                  flex items-center justify-center text-3xl
                  group-hover:scale-110 transition-transform duration-300
                  shadow-lg
                `}>
                  {mode.icon}
                </div>

                {/* Title */}
                <h2 className="font-display text-xl font-bold mb-3 text-text-primary dark:text-text-primary text-light-text group-hover:text-accent-cyan transition-colors">
                  {mode.title}
                </h2>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed">
                  {mode.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-6 flex items-center gap-2 text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Get Started</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </GlassmorphicCard>
            </Link>
          ))}
        </div>

        {/* Quick Stats / Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div>
            <div className="text-3xl font-display font-bold text-accent-cyan">100+</div>
            <div className="text-text-secondary text-sm mt-1">Regions</div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-accent-gold">5000+</div>
            <div className="text-text-secondary text-sm mt-1">Stations</div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-accent-purple">Real-time</div>
            <div className="text-text-secondary text-sm mt-1">Market Data</div>
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-green-400">Free</div>
            <div className="text-text-secondary text-sm mt-1">Forever</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;
