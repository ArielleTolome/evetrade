import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { AnimatedBackground } from './AnimatedBackground';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts.jsx';

/**
 * Page Layout Component
 * Wraps pages with common layout elements
 */
export function PageLayout({ children, title, subtitle }) {
  const { showHelp, setShowHelp } = useKeyboardShortcuts();

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1">
        {(title || subtitle) && (
          <div className="max-w-7xl mx-auto px-4 pt-8">
            {title && (
              <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary dark:text-text-primary text-light-text mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-text-secondary text-lg">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </main>

      <Footer />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default PageLayout;
