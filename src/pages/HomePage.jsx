import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';
import { Button } from '../components/common/Button';
import { useResources } from '../hooks/useResources';
import { useState, useEffect } from 'react';

const tradingModes = [
  {
    title: 'Station Trading',
    description: 'Find profitable buy/sell margins within a single station. Perfect for traders who want to focus on market making.',
    path: '/station-trading',
    icon: '📊',
    gradient: 'from-accent-cyan to-blue-600',
    delay: '0ms',
    badge: 'Popular',
    badgeColor: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40',
    profitHint: 'Up to 20% margin',
  },
  {
    title: 'Station Hauling',
    description: 'Discover profitable trades between specific stations. Ideal for targeted routes with known infrastructure.',
    path: '/station-hauling',
    icon: '🚀',
    gradient: 'from-accent-gold to-orange-600',
    delay: '100ms',
    profitHint: '5-15% per jump',
  },
  {
    title: 'Region Hauling',
    description: 'Find the best trades across entire regions. Best for explorers seeking maximum profit opportunities.',
    path: '/region-hauling',
    icon: '🌌',
    gradient: 'from-accent-purple to-pink-600',
    delay: '200ms',
    profitHint: '10-30% returns',
  },
  {
    title: 'Cross-Region Arbitrage',
    description: 'Scan multiple regions simultaneously to find buy-low, sell-high opportunities with risk assessment.',
    path: '/arbitrage',
    icon: '💱',
    gradient: 'from-green-500 to-emerald-600',
    delay: '300ms',
    badge: 'Advanced',
    badgeColor: 'bg-accent-purple/20 text-accent-purple border-accent-purple/40',
    profitHint: '15-50% potential',
  },
];

const features = [
  {
    icon: '⚡',
    title: 'Real-Time Data',
    description: 'Live market data directly from ESI API',
    gradient: 'from-accent-cyan to-blue-500',
  },
  {
    icon: '📈',
    title: 'Smart Analysis',
    description: 'Advanced algorithms to find profitable opportunities',
    gradient: 'from-accent-gold to-yellow-500',
  },
  {
    icon: '🎯',
    title: 'Risk Assessment',
    description: 'Volume and competition metrics included',
    gradient: 'from-accent-purple to-pink-500',
  },
  {
    icon: '💾',
    title: 'Export Tools',
    description: 'Export to CSV, Excel, or clipboard instantly',
    gradient: 'from-accent-green to-emerald-500',
  },
  {
    icon: '🌐',
    title: 'Multi-Region',
    description: 'Search across all of New Eden simultaneously',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🔒',
    title: 'No Login Required',
    description: 'Start trading analysis immediately',
    gradient: 'from-green-500 to-teal-500',
  },
];

const steps = [
  {
    number: '01',
    title: 'Choose Your Strategy',
    description: 'Select from station trading, hauling, or arbitrage based on your playstyle',
    icon: '🎯',
  },
  {
    number: '02',
    title: 'Set Your Parameters',
    description: 'Configure regions, stations, investment amount, and profit thresholds',
    icon: '⚙️',
  },
  {
    number: '03',
    title: 'Analyze Results',
    description: 'Review profitable opportunities sorted by ROI and volume',
    icon: '📊',
  },
  {
    number: '04',
    title: 'Execute & Profit',
    description: 'Export your trades and start making ISK in New Eden',
    icon: '💰',
  },
];

/**
 * Animated ISK Counter Component
 */
function AnimatedISKCounter() {
  const [isk, setIsk] = useState(1000000000);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsk(prev => prev + Math.floor(Math.random() * 10000000));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatISK = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
  };

  return (
    <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-accent-gold/10 to-accent-green/10 border border-accent-gold/30 backdrop-blur-md">
      <span className="text-lg sm:text-2xl">💰</span>
      <div className="flex flex-col">
        <span className="text-xs text-text-muted uppercase tracking-wider">ISK Tracked Today</span>
        <span className="text-xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-green">
          {formatISK(isk)} ISK
        </span>
      </div>
    </div>
  );
}

/**
 * Home Page Component
 */
export function HomePage() {
  const { loading, loadingProgress } = useResources();

  return (
    <PageLayout>
      {/* Hero Section - Above the Fold */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-3 sm:px-4 py-12 sm:py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[1000px] h-[400px] sm:h-[600px] md:h-[1000px] bg-accent-cyan/5 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-[250px] sm:w-[350px] md:w-[500px] h-[250px] sm:h-[350px] md:h-[500px] bg-accent-purple/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-accent-gold/5 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Hero Content */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up relative z-10 max-w-5xl mx-auto">
          <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm text-accent-cyan font-medium animate-fade-in shadow-lg shadow-accent-cyan/5">
            ✨ The Modern EVE Online Trading Tool
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 sm:mb-8 px-2 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white to-accent-purple animate-shimmer bg-[length:200%_100%]">
              EVE
            </span>
            <span className="text-text-primary">Trade</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-text-secondary max-w-3xl mx-auto leading-relaxed px-4 mb-8 sm:mb-12 font-light">
            Maximize your ISK with <span className="text-accent-cyan font-semibold">real-time market analysis</span>.
            Discover the most profitable trades across New Eden.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 sm:mb-12">
            <Button
              to="/station-trading"
              variant="primary"
              size="lg"
              className="shadow-2xl shadow-accent-cyan/30 hover:shadow-accent-cyan/50"
              icon="🚀"
            >
              Start Trading Now
            </Button>
            <Button
              to="/help"
              variant="secondary"
              size="lg"
              icon="📚"
            >
              Learn How It Works
            </Button>
          </div>

          {/* Animated ISK Counter */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <AnimatedISKCounter />
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="mt-8 flex items-center justify-center gap-3 text-text-secondary bg-space-dark/50 px-5 py-3 rounded-full inline-flex backdrop-blur-sm border border-white/5">
              <div className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
              <span className="text-sm font-medium">
                Loading resources ({loadingProgress.current}/{loadingProgress.total})...
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Trading Mode Cards - Quick Start */}
      <section className="relative px-3 sm:px-4 py-16 sm:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">Trading Strategy</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
            Select the trading mode that matches your playstyle and start finding profitable opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {tradingModes.map((mode, index) => (
            <Link
              key={mode.path}
              to={mode.path}
              style={{ animationDelay: mode.delay }}
              className="animate-fade-in-up block h-full transform transition-all duration-300 hover:-translate-y-3 active:scale-[0.98]"
            >
              <GlassmorphicCard hover className="h-full group flex flex-col border-white/5 bg-space-dark/40 p-5 sm:p-7 relative overflow-visible">
                {/* Badge */}
                {mode.badge && (
                  <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${mode.badgeColor} shadow-lg`}>
                    {mode.badge}
                  </div>
                )}

                {/* Icon with gradient background */}
                <div className={`
                  w-14 h-14 sm:w-20 sm:h-20 rounded-2xl mb-5 sm:mb-7
                  bg-gradient-to-br ${mode.gradient}
                  flex items-center justify-center text-3xl sm:text-4xl
                  group-hover:scale-110 group-hover:rotate-6 transition-all duration-500
                  shadow-2xl shadow-black/30
                  relative
                `}>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur group-hover:blur-md transition-all"></div>
                  <span className="relative z-10">{mode.icon}</span>
                </div>

                {/* Title */}
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-cyan transition-colors">
                  {mode.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed flex-grow text-sm sm:text-base mb-4">
                  {mode.description}
                </p>

                {/* Profit Hint */}
                {mode.profitHint && (
                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-green/10 border border-accent-green/20">
                    <span className="text-accent-green text-xs sm:text-sm font-semibold">💹 {mode.profitHint}</span>
                  </div>
                )}

                {/* Arrow indicator */}
                <div className="mt-auto flex items-center gap-2 text-accent-cyan font-semibold opacity-70 group-hover:opacity-100 transition-all group-hover:gap-4">
                  <span className="text-sm sm:text-base">Get Started</span>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </GlassmorphicCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-3 sm:px-4 py-16 sm:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-green">Trading Features</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
            Everything you need to dominate the markets of New Eden
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-up group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <GlassmorphicCard className="h-full p-6 sm:p-8 border-white/5 bg-space-dark/30 hover:bg-space-dark/50 transition-all duration-300">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl sm:text-4xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2 text-text-primary group-hover:text-accent-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </GlassmorphicCard>
            </div>
          ))}
        </div>
      </section>

      {/* Getting Started Guide */}
      <section className="relative px-3 sm:px-4 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Start Trading in <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-pink">Four Simple Steps</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
            From zero to profitable trades in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent"></div>

          {steps.map((step, index) => (
            <div
              key={step.number}
              className="animate-fade-in-up relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                {/* Step number badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center font-display font-bold text-white shadow-lg shadow-accent-cyan/30 z-10">
                  {index + 1}
                </div>

                <GlassmorphicCard className="h-full p-6 sm:p-8 pt-8 border-white/5 bg-space-dark/40 hover:bg-space-dark/60 transition-all duration-300 group hover:border-accent-cyan/30">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold mb-3 text-text-primary group-hover:text-accent-cyan transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </GlassmorphicCard>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative px-3 sm:px-4 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 animate-fade-in">
          <div className="group cursor-default p-5 sm:p-6 rounded-2xl bg-space-dark/40 border border-white/5 hover:bg-space-dark/60 hover:border-accent-cyan/30 transition-all duration-300 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-accent-cyan mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
            <div className="text-text-secondary text-xs sm:text-sm font-semibold uppercase tracking-wider">Regions</div>
          </div>
          <div className="group cursor-default p-5 sm:p-6 rounded-2xl bg-space-dark/40 border border-white/5 hover:bg-space-dark/60 hover:border-accent-gold/30 transition-all duration-300 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-accent-gold mb-2 group-hover:scale-110 transition-transform duration-300">5000+</div>
            <div className="text-text-secondary text-xs sm:text-sm font-semibold uppercase tracking-wider">Stations</div>
          </div>
          <div className="group cursor-default p-5 sm:p-6 rounded-2xl bg-space-dark/40 border border-white/5 hover:bg-space-dark/60 hover:border-accent-purple/30 transition-all duration-300 backdrop-blur-sm">
            <div className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-accent-purple mb-2 group-hover:scale-110 transition-transform duration-300">Real-time</div>
            <div className="text-text-secondary text-xs sm:text-sm font-semibold uppercase tracking-wider">Market Data</div>
          </div>
          <div className="group cursor-default p-5 sm:p-6 rounded-2xl bg-space-dark/40 border border-white/5 hover:bg-space-dark/60 hover:border-accent-green/30 transition-all duration-300 backdrop-blur-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-accent-green mb-2 group-hover:scale-110 transition-transform duration-300">Free</div>
            <div className="text-text-secondary text-xs sm:text-sm font-semibold uppercase tracking-wider">Forever</div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative px-3 sm:px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <GlassmorphicCard className="p-8 sm:p-12 md:p-16 bg-gradient-to-br from-space-dark/80 to-space-mid/80 border-accent-cyan/20">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-text-primary">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">Dominate the Markets</span>?
            </h2>
            <p className="text-text-secondary text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of traders maximizing their ISK across New Eden. No registration required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                to="/station-trading"
                variant="primary"
                size="lg"
                className="shadow-2xl shadow-accent-cyan/40"
                icon="🚀"
              >
                Start Trading Now
              </Button>
              <Button
                to="/help"
                variant="secondary"
                size="lg"
              >
                View Documentation
              </Button>
            </div>
          </GlassmorphicCard>

          {/* EVE Online Disclaimer */}
          <p className="text-text-muted text-xs sm:text-sm mt-8 px-4">
            EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide.
            All other trademarks are the property of their respective owners. EVE Online, the EVE logo, EVE and all
            associated logos and designs are the intellectual property of CCP hf. This website is not affiliated with
            or endorsed by CCP hf.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}

export default HomePage;
