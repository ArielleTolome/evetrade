import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { AnimatedBackground } from './AnimatedBackground';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '../../hooks/useKeyboardShortcuts.jsx';

/**
 * Root Layout Component
 * Wraps the entire application with common layout elements
 * This ensures Navbar and Footer are not re-mounted on page changes
 */
export function RootLayout() {
    const { showHelp, setShowHelp } = useKeyboardShortcuts();

    return (
        <div className="min-h-screen flex flex-col">
            <AnimatedBackground />
            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />

            {/* Keyboard Shortcuts Help Modal */}
            <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}
