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
  {
    title: 'Cross-Region Arbitrage',
    description: 'Scan multiple regions simultaneously to find buy-low, sell-high opportunities with risk assessment.',
    path: '/arbitrage',
    icon: '💱',
    gradient: 'from-green-500 to-emerald-600',
    delay: '300ms',
  },
];

/**
 * Home Page Component
 */
export function HomePage() {
  const { loading, loadingProgress } = useResources();

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12 relative overflow-hidden">
        {/* Background Particles/Glow - Responsive sizes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[800px] h-[300px] sm:h-[500px] md:h-[800px] bg-accent-cyan/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-0 left-1/4 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-accent-purple/10 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[400px] md:w-[500px] h-[250px] sm:h-[400px] md:h-[500px] bg-accent-cyan/5 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16 md:mb-24 animate-fade-in-up relative z-10 max-w-4xl mx-auto">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm text-accent-cyan font-medium animate-fade-in">
            The Modern EVE Online Trading Tool
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-4 sm:mb-6 md:mb-8 px-2 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-purple animate-shimmer bg-[length:200%_100%]">EVE</span>
            <span className="text-text-primary">Trade</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed px-3 sm:px-4 mb-6 sm:mb-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl w-full relative z-10 px-3 sm:px-4">
          {tradingModes.map((mode, index) => (
            <Link
              key={mode.path}
              to={mode.path}
              style={{ animationDelay: mode.delay }}
              className="animate-fade-in-up block h-full transform transition-transform hover:-translate-y-2 active:scale-[0.98]"
            >
              <GlassmorphicCard hover className="h-full group flex flex-col border-white/5 bg-space-dark/40 p-4 sm:p-6">
                {/* Icon with gradient background */}
                <div className={`
                  w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-4 sm:mb-6
                  bg-gradient-to-br ${mode.gradient}
                  flex items-center justify-center text-2xl sm:text-3xl
                  group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                  shadow-lg shadow-black/20
                `}>
                  {mode.icon}
                </div>

                {/* Title */}
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-text-primary group-hover:text-accent-cyan transition-colors">
                  {mode.title}
                </h2>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed flex-grow text-sm sm:text-base">
                  {mode.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 sm:mt-8 flex items-center gap-2 text-accent-cyan font-medium opacity-70 group-hover:opacity-100 transition-all group-hover:gap-3">
                  <span className="text-sm sm:text-base">Get Started</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </GlassmorphicCard>
            </Link>
          ))}
        </div>

        {/* Quick Stats / Features */}
        <div className="mt-12 sm:mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-8 text-center animate-fade-in relative z-10 w-full max-w-6xl px-3 sm:px-4" style={{ animationDelay: '400ms' }}>
          <div className="group cursor-default p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-accent-cyan mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
            <div className="text-text-secondary text-xs sm:text-sm font-medium uppercase tracking-wider">Regions</div>
          </div>
          <div className="group cursor-default p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-accent-gold mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">5000+</div>
            <div className="text-text-secondary text-xs sm:text-sm font-medium uppercase tracking-wider">Stations</div>
          </div>
          <div className="group cursor-default p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-lg sm:text-2xl md:text-4xl font-display font-bold text-accent-purple mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">Real-time</div>
            <div className="text-text-secondary text-xs sm:text-sm font-medium uppercase tracking-wider">Market Data</div>
          </div>
          <div className="group cursor-default p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-colors">
            <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-accent-green mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">Free</div>
            <div className="text-text-secondary text-xs sm:text-sm font-medium uppercase tracking-wider">Forever</div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

export default HomePage;
