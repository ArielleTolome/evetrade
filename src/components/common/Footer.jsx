import { Link } from 'react-router-dom';

/**
 * Footer Component
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-space-dark/30 backdrop-blur-sm mt-auto pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2 text-text-secondary text-sm">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg">
                <span className="text-accent-cyan">EVE</span>Trade
              </span>
              <span className="opacity-30">|</span>
              <span className="text-xs opacity-70">&copy; 2016-{currentYear}</span>
            </div>
            <div className="text-xs opacity-50 flex flex-col md:flex-row gap-1 md:gap-2 items-center md:items-start">
              <span>
                Remixed by{' '}
                <a
                  href="https://github.com/ArielleTolome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-cyan hover:text-accent-cyan-dim transition-colors"
                >
                  Ariel Tolome
                </a>
              </span>
              <span className="hidden md:inline">&bull;</span>
              <span>
                Original by{' '}
                <a
                  href="https://github.com/awhipp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-purple hover:text-accent-pink transition-colors"
                >
                  awhipp
                </a>
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 sm:gap-8 text-sm font-medium">
            <Link
              to="/help"
              className="text-text-secondary hover:text-accent-cyan transition-colors relative group"
            >
              Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-cyan transition-all group-hover:w-full opacity-50"></span>
            </Link>
            <a
              href="https://github.com/awhipp/evetrade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-white transition-colors flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>

          {/* EVE Disclaimer */}
          <div className="text-[10px] text-text-muted text-center md:text-right max-w-xs leading-relaxed opacity-60">
            EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
