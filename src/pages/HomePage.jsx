import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { useResources } from '../hooks/useResources';

const tradingModes = [
  {
    title: 'Station Trading',
    description: 'Find profitable buy/sell margins within a single station. Perfect for traders who want to focus on market making.',
    path: '/station-trading',
    icon: '📊',
    gradient: 'from-accent-cyan to-blue-600',
    delay: '0ms',
  },
  {
    title: 'Station Hauling',
    description: 'Discover profitable trades between specific stations. Ideal for targeted routes with known infrastructure.',
    path: '/station-hauling',
    icon: '🚀',
    gradient: 'from-accent-gold to-orange-600',
    delay: '100ms',
  },
  {
    title: 'Region Hauling',
    description: 'Find the best trades across entire regions. Best for explorers seeking maximum profit opportunities.',
    path: '/region-hauling',
    icon: '🌌',
    gradient: 'from-accent-purple to-pink-600',
    delay: '200ms',
  },
];

/**
 * Home Page Component
 */
export function HomePage() {
  const { loading, loadingProgress } = useResources();

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background Particles/Glow - Enhanced */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up relative z-10 max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm text-accent-cyan font-medium animate-fade-in">
            ✨ The Modern EVE Online Trading Tool
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-black mb-6 md:mb-8 px-2 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-purple animate-shimmer bg-[length:200%_100%]">EVE</span>
            <span className="text-text-primary">Trade</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed px-4 mb-8">
            Maximize your ISK with real-time market analysis. Discover the most profitable trades across New Eden.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button to="/station-trading" variant="primary" size="lg" className="shadow-lg shadow-accent-cyan/20">
              Start Trading
            </Button>
            <Button to="/help" variant="secondary" size="lg">
              Learn More
            </Button>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="mt-8 flex items-center justify-center gap-3 text-text-secondary bg-space-dark/50 px-4 py-2 rounded-full inline-flex backdrop-blur-sm border border-white/5">
              <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
              <span className="text-sm">
                Loading resources ({loadingProgress.current}/{loadingProgress.total})...
              </span>
            </div>
          )}
        </div>

        {/* Trading Mode Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full relative z-10 px-4">
          {tradingModes.map((mode, index) => (
            <Link
              key={mode.path}
              to={mode.path}
              style={{ animationDelay: mode.delay }}
              className="animate-fade-in-up block h-full transform transition-transform hover:-translate-y-2"
            >
              <GlassmorphicCard hover className="h-full group flex flex-col border-white/5 bg-space-dark/40">
                {/* Icon with gradient background */}
                <div className={`
                  w-16 h-16 rounded-2xl mb-6
                  bg-gradient-to-br ${mode.gradient}
                  flex items-center justify-center text-3xl
                  group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                  shadow-lg shadow-black/20
                `}>
                  {mode.icon}
                </div>

                {/* Title */}
                <h2 className="font-display text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-cyan transition-colors">
                  {mode.title}
                </h2>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed flex-grow text-base">
                  {mode.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-8 flex items-center gap-2 text-accent-cyan font-medium opacity-70 group-hover:opacity-100 transition-all group-hover:gap-3">
                  <span>Get Started</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </GlassmorphicCard>
            </Link>
          ))}
        </div>

        {/* Quick Stats / Features */}
        <div className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 text-center animate-fade-in relative z-10 w-full max-w-6xl px-4" style={{ animationDelay: '400ms' }}>
          <div className="group cursor-default p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-3xl sm:text-4xl font-display font-bold text-accent-cyan mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
            <div className="text-text-secondary text-sm font-medium uppercase tracking-wider">Regions</div>
          </div>
          <div className="group cursor-default p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-3xl sm:text-4xl font-display font-bold text-accent-gold mb-2 group-hover:scale-110 transition-transform duration-300">5000+</div>
            <div className="text-text-secondary text-sm font-medium uppercase tracking-wider">Stations</div>
          </div>
          <div className="group cursor-default p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-2xl sm:text-4xl font-display font-bold text-accent-purple mb-2 group-hover:scale-110 transition-transform duration-300">Real-time</div>
            <div className="text-text-secondary text-sm font-medium uppercase tracking-wider">Market Data</div>
          </div>
          <div className="group cursor-default p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-3xl sm:text-4xl font-display font-bold text-accent-green mb-2 group-hover:scale-110 transition-transform duration-300">Free</div>
            <div className="text-text-secondary text-sm font-medium uppercase tracking-wider">Forever</div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

export default HomePage;
