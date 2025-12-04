import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * A reusable button component for toggling between dark and light themes.
 */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-space-dark/50 hover:bg-space-light/50 border border-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-cyan"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-accent-gold animate-fade-in" />
      ) : (
        <Moon className="h-5 w-5 text-accent-purple animate-fade-in" />
      )}
    </button>
  );
}
